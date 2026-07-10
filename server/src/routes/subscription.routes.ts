import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";
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
    if (!keySecret) {
      return res.status(500).json({ error: "Billing gateway signature secret not configured" });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("Invalid Razorpay payment signature verification attempt");
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Signature verified! Upgrade user's plan to pro in Supabase profiles
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { 
          id: req.user!.id, 
          plan: "pro" 
        },
        { onConflict: "id" }
      );

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
