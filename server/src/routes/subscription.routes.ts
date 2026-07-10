import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const router = Router();

// Pricing catalog with local currency values (amount is in standard units, e.g. Rupees/Dollars/Euros)
const PRICE_CATALOG: Record<string, { monthly: number; yearly: number }> = {
  INR: { monthly: 999, yearly: 9999 },
  EUR: { monthly: 11, yearly: 110 },
  GBP: { monthly: 10, yearly: 100 },
  CAD: { monthly: 16, yearly: 160 },
  AUD: { monthly: 18, yearly: 180 },
  USD: { monthly: 12, yearly: 120 }
};

// POST /create-order — Initiate order with Razorpay
router.post("/create-order", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currency = "USD", billingCycle = "monthly" } = req.body;

    const normalizedCurrency = currency.toUpperCase();
    const prices = PRICE_CATALOG[normalizedCurrency] || PRICE_CATALOG["USD"];
    const baseAmount = billingCycle === "yearly" ? prices.yearly : prices.monthly;
    
    // Razorpay amount needs to be in smallest unit (cents/paise)
    const amountInSmallestUnit = Math.round(baseAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay API credentials not configured in server env");
      return res.status(500).json({ error: "Billing gateway not configured" });
    }

    // Call Razorpay API natively using node-fetch (native global fetch in Node 18+)
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        currency: normalizedCurrency,
        receipt: `receipt_order_${Date.now()}_${req.user!.id.slice(0, 8)}`,
        notes: {
          profile_id: req.user!.id,
          billing_cycle: billingCycle
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return res.status(502).json({ error: "Failed to create order on payment gateway" });
    }

    const orderData = (await razorpayResponse.json()) as any;

    // Log the created payment in the database using user's authenticated context
    try {
      const authHeaderUser = req.headers.authorization!;
      const tokenUser = authHeaderUser.split(" ")[1];
      const supabaseUserClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${tokenUser}` } }
      });

      await supabaseUserClient
        .from("payments")
        .insert({
          profile_id: req.user!.id,
          razorpay_order_id: orderData.id,
          amount: baseAmount,
          currency: normalizedCurrency,
          status: "created"
        });
    } catch (dbErr) {
      console.warn("Failed to log payment order creation in DB:", dbErr);
    }

    return res.status(200).json({
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency
    });

  } catch (err) {
    console.error("Razorpay order creation exception:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /verify-payment — Verify payment signature and upgrade to Pro plan
router.post("/verify-payment", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment details" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log("--- RAZORPAY VERIFICATION DEBUG ---");
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Order ID:", razorpay_order_id);
    console.log("Received Signature:", razorpay_signature);
    console.log("Secret Available:", !!keySecret, keySecret ? `(Length: ${keySecret.length})` : "");

    if (!keySecret) {
      return res.status(500).json({ error: "Billing gateway signature secret not configured" });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret.trim()) // trim to remove any accidental whitespace/newlines
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);
    console.log("Match:", generatedSignature === razorpay_signature);
    console.log("-----------------------------------");

    if (generatedSignature !== razorpay_signature) {
      console.warn("Invalid Razorpay payment signature verification attempt");
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Signature verified! Create a Supabase client authenticated as the user using their access token
    const authHeader = req.headers.authorization!;
    const token = authHeader.split(" ")[1];
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { error } = await supabaseUserClient
      .from("profiles")
      .upsert(
        { 
          id: req.user!.id, 
          plan: "pro" 
        },
        { onConflict: "id" }
      );

    // Update payment record status in database to captured
    if (!error) {
      try {
        await supabaseUserClient
          .from("payments")
          .update({
            status: "captured",
            razorpay_payment_id: razorpay_payment_id
          })
          .eq("razorpay_order_id", razorpay_order_id);
      } catch (payDbErr) {
        console.warn("Failed to update payment record status to captured:", payDbErr);
      }
    }

    if (error) {
      console.error("Failed to upgrade user plan in profiles table:", error.message);
      return res.status(500).json({ error: "Payment verified but database update failed" });
    }

    return res.status(200).json({ 
      success: true, 
      plan: "pro" 
    });

  } catch (err) {
    console.error("Razorpay payment verification exception:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
