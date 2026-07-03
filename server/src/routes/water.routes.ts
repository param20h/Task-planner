import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — list water logs, optionally filtered by date
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    let query = supabaseAdmin
      .from("water_logs")
      .select("id, amount_liters, created_at")
      .eq("profile_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (date && typeof date === "string") {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte("created_at", startOfDay).lte("created_at", endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get water logs error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create a water log entry
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount_liters } = req.body;

    if (amount_liters === undefined || amount_liters === null) {
      return res.status(400).json({ error: "amount_liters is required" });
    }

    const { data, error } = await supabaseAdmin
      .from("water_logs")
      .insert({
        profile_id: req.user!.id,
        amount_liters,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Create water log error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id — delete a water log entry
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("water_logs")
      .delete()
      .eq("id", id)
      .eq("profile_id", req.user!.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete water log error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
