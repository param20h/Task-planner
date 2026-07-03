import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET /dashboard — aggregated stats for today
router.get("/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)).toISOString();

    // a) Today's calories
    const { data: foodData, error: foodError } = await supabaseAdmin
      .from("food_logs")
      .select("calories")
      .eq("profile_id", req.user!.id)
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);

    if (foodError) {
      return res.status(500).json({ error: foodError.message });
    }

    const calories = (foodData || []).reduce((sum, row) => sum + (row.calories || 0), 0);

    // b) Today's water
    const { data: waterData, error: waterError } = await supabaseAdmin
      .from("water_logs")
      .select("amount_liters")
      .eq("profile_id", req.user!.id)
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);

    if (waterError) {
      return res.status(500).json({ error: waterError.message });
    }

    const water = (waterData || []).reduce((sum, row) => sum + (parseFloat(row.amount_liters) || 0), 0);

    // c) Total workout count
    const { data: workoutData, error: workoutError } = await supabaseAdmin
      .from("gym_workouts")
      .select("id")
      .eq("profile_id", req.user!.id);

    if (workoutError) {
      return res.status(500).json({ error: workoutError.message });
    }

    const workoutCount = (workoutData || []).length;

    // d) Task stats
    const { data: taskData, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("id, status")
      .eq("profile_id", req.user!.id);

    if (taskError) {
      return res.status(500).json({ error: taskError.message });
    }

    const tasksTotal = (taskData || []).length;
    const tasksCompleted = (taskData || []).filter((t) => t.status === "completed").length;

    return res.status(200).json({
      calories,
      water,
      workoutCount,
      tasksTotal,
      tasksCompleted,
    });
  } catch (err) {
    console.error("Get dashboard error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
