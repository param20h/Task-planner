import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — get current user's profile
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("name, groq_api_key")
      .eq("id", req.user!.id)
      .single();

    if (error) {
      // Return empty object if profile not found
      return res.status(200).json({});
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

export default router;
