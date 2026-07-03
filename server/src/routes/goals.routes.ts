import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — list all goals with milestones
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: goals, error } = await supabaseAdmin
      .from("goals")
      .select("id, title, category, progress, value_label, status, created_at")
      .eq("profile_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Fetch milestones for each goal
    const goalsWithMilestones = await Promise.all(
      (goals || []).map(async (goal) => {
        const { data: milestones, error: msError } = await supabaseAdmin
          .from("milestones")
          .select("id, description, due_date, completed, created_at")
          .eq("goal_id", goal.id)
          .order("created_at", { ascending: true });

        if (msError) {
          console.error(`Error fetching milestones for goal ${goal.id}:`, msError);
          return { ...goal, milestones: [] };
        }

        return { ...goal, milestones: milestones || [] };
      })
    );

    return res.status(200).json(goalsWithMilestones);
  } catch (err) {
    console.error("Get goals error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create a goal
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, progress, value_label, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const { data, error } = await supabaseAdmin
      .from("goals")
      .insert({
        profile_id: req.user!.id,
        title,
        category,
        progress,
        value_label,
        status,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Create goal error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /:id — update a goal
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, progress, value_label, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from("goals")
      .update({ title, category, progress, value_label, status })
      .eq("id", id)
      .eq("profile_id", req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Update goal error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
