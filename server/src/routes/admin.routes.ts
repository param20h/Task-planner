import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { createClient } from "@supabase/supabase-js";
import { assignProApiKey, clearProApiKey, supabaseAdmin } from "../config/supabase";
import { sendProUpgradeEmail } from "../config/mail";

const router = Router();

// Helper to construct a Supabase client authenticated as the active requesting user
const getSupabaseUserClient = (req: AuthRequest) => {
  const authHeader = req.headers.authorization!;
  const token = authHeader.split(" ")[1];
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
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
};

// Middleware to restrict access only to the specified administrator email
const adminOnly = (req: AuthRequest, res: Response, next: any) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.email.toLowerCase() !== "parambrar862@gmail.com") {
    return res.status(403).json({ error: "Access Denied: Admin authorization required" });
  }

  next();
};

// GET /users — List all registered user profiles (using admin's RLS policy)
router.get("/users", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const userClient = getSupabaseUserClient(req);
    const { data, error } = await userClient
      .from("profiles")
      .select("id, name, email, plan, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin list users DB query failed:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Admin list users error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /change-plan — Upgrade or Downgrade a user's plan (using admin's RLS policy)
router.post("/change-plan", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId, plan } = req.body;

    if (!targetUserId || !plan || (plan !== "free" && plan !== "pro")) {
      return res.status(400).json({ error: "Invalid target user ID or plan type" });
    }

    const userClient = getSupabaseUserClient(req);
    
    // Fetch user profile details first to get the email and name
    const { data: profile } = await userClient
      .from("profiles")
      .select("email, name")
      .eq("id", targetUserId)
      .single();

    const planExpiresAt = plan === "pro" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    const { error } = await userClient
      .from("profiles")
      .update({ plan, plan_expires_at: planExpiresAt })
      .eq("id", targetUserId);

    if (error) {
      console.error("Admin update user plan DB query failed:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // Assign or clear API key based on the new plan
    if (plan === "pro") {
      await assignProApiKey(targetUserId);
    } else {
      await clearProApiKey(targetUserId);
    }

    // Send Pro upgrade welcome email to the user if plan is pro
    if (plan === "pro" && profile && profile.email) {
      sendProUpgradeEmail(profile.email, profile.name || "User").catch(err => {
        console.warn("Failed to send Pro upgrade email from admin route:", err);
      });
    }

    return res.status(200).json({ success: true, targetUserId, plan });
  } catch (err) {
    console.error("Admin change plan error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /payments — List all transaction logs with profile details (using admin's RLS policy)
router.get("/payments", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const userClient = getSupabaseUserClient(req);
    const { data, error } = await userClient
      .from("payments")
      .select(`
        id,
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        currency,
        status,
        created_at,
        profiles (
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin list payments DB query failed:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Admin list payments error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api-keys — List all API keys in the pool
router.get("/api-keys", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("pro_api_keys")
      .select("id, key_value, created_at")
      .order("id", { ascending: true });

    if (error) {
      console.error("Admin list API keys failed:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Admin list API keys error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api-keys — Add a new API key to the pool
router.post("/api-keys", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { key_value } = req.body;
    if (!key_value || typeof key_value !== "string" || !key_value.trim()) {
      return res.status(400).json({ error: "Invalid API key value" });
    }

    const { data, error } = await supabaseAdmin
      .from("pro_api_keys")
      .insert({ key_value: key_value.trim() })
      .select()
      .single();

    if (error) {
      console.error("Admin add API key failed:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Admin add API key error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api-keys/:id — Delete a key from the pool
router.delete("/api-keys/:id", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from("pro_api_keys")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Admin delete API key ${id} failed:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Admin delete API key error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
