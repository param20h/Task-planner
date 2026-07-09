import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — list all tasks
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("id, title, description, status, due_date, completed_at, created_at")
      .eq("profile_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get tasks error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create a task
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        profile_id: req.user!.id,
        title,
        description,
        due_date,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /:id — update a task
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status, description, due_date } = req.body;

    const updatePayload: any = { title, status, description, due_date };
    if (status === "completed") {
      updatePayload.completed_at = new Date().toISOString();
    } else if (status === "pending" || status === "in_progress") {
      updatePayload.completed_at = null;
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(updatePayload)
      .eq("id", id)
      .eq("profile_id", req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Update task error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id — delete a task
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("profile_id", req.user!.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete task error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
