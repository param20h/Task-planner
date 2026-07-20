import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// GET / — get current user's profile
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("name, groq_api_key, plan, plan_expires_at")
      .eq("id", req.user!.id)
      .single();

    if (error) {
      // Return empty object if profile not found
      return res.status(200).json({});
    }

    // Auto-expire Pro plan if current date is past plan_expires_at
    if (data && data.plan === "pro" && data.plan_expires_at) {
      const expiresAt = new Date(data.plan_expires_at);
      const now = new Date();
      if (expiresAt < now) {
        // Update database to revert user plan back to free
        await supabaseAdmin
          .from("profiles")
          .update({ plan: "free", plan_expires_at: null, groq_api_key: null })
          .eq("id", req.user!.id);
        
        data.plan = "free";
        data.plan_expires_at = null;
        console.log(`[Subscription Expiry] User ${req.user!.id} subscription expired and reverted to Free tier.`);
      }
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT / — update current user's profile
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, groq_api_key } = req.body;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: req.user!.id, name, groq_api_key },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE / — delete current user's account and all associated data via HTTPS RPC
router.delete("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization!;
    const token = authHeader.split(" ")[1];
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

    // Create an client authenticated as the requesting user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
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

    const userId = req.user!.id;
    console.log(`[Account Deletion] Triggering delete_my_account RPC for user ID: ${userId}`);

    // Call the security definer Postgres RPC function over standard HTTPS
    const { error } = await userClient.rpc("delete_my_account");

    if (error) {
      console.error("[Account Deletion Error] Database RPC execution failed:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[Account Deletion] User ${userId} successfully deleted.`);
    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (err: any) {
    console.error("[Account Deletion Error] Handler failed:", err);
    return res.status(500).json({ error: err.message || "Failed to delete account" });
  }
});

export default router;
