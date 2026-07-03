import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET /events — list planner events for a given day
router.get("/events", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { day } = req.query;

    let query = supabaseAdmin
      .from("planner_events")
      .select("id, time_slot, event_title, description, duration, day_date")
      .eq("profile_id", req.user!.id);

    if (day !== undefined) {
      query = query.eq("day_date", Number(day));
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get planner events error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /events — create a planner event
router.post("/events", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { time_slot, event_title, description, duration, day_date } = req.body;

    if (!event_title || !time_slot) {
      return res.status(400).json({ error: "event_title and time_slot are required" });
    }

    const { data, error } = await supabaseAdmin
      .from("planner_events")
      .insert({
        profile_id: req.user!.id,
        time_slot,
        event_title,
        description,
        duration,
        day_date,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Create planner event error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /events/:id — delete a planner event
router.delete("/events/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("planner_events")
      .delete()
      .eq("id", id)
      .eq("profile_id", req.user!.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete planner event error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
