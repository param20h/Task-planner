import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — list all study logs for user
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("study_logs")
      .select("id, subject, duration_minutes, notes, created_at")
      .eq("profile_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get study logs error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create a study log entry
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, duration_minutes, notes } = req.body;

    if (!subject || !duration_minutes) {
      return res.status(400).json({ error: "subject and duration_minutes are required" });
    }

    const { data, error } = await supabaseAdmin
      .from("study_logs")
      .insert({
        profile_id: req.user!.id,
        subject,
        duration_minutes: parseInt(duration_minutes),
        notes,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Create study log error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id — delete a study log entry
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("study_logs")
      .delete()
      .eq("id", id)
      .eq("profile_id", req.user!.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: "Study log deleted" });
  } catch (err) {
    console.error("Delete study log error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
