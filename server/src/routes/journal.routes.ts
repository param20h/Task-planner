import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — list journal entries (latest 10)
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("journal_logs")
      .select("id, entry_text, mood, reflection_text, created_at")
      .eq("profile_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get journal logs error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create a journal entry
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entry_text, mood, reflection_text } = req.body;

    if (!entry_text) {
      return res.status(400).json({ error: "entry_text is required" });
    }

    const { data, error } = await supabaseAdmin
      .from("journal_logs")
      .insert({
        profile_id: req.user!.id,
        entry_text,
        mood,
        reflection_text,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Create journal log error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
