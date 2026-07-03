import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// GET / — list all workouts for user
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("gym_workouts")
      .select("id, name, notes, start_time, end_time")
      .eq("profile_id", req.user!.id)
      .order("start_time", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get workouts error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id — single workout with exercises
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("gym_workouts")
      .select("id, name, notes, start_time, end_time")
      .eq("id", id)
      .eq("profile_id", req.user!.id)
      .single();

    if (workoutError) {
      return res.status(404).json({ error: "Workout not found" });
    }

    const { data: exercises, error: exercisesError } = await supabaseAdmin
      .from("gym_exercises")
      .select("id, exercise_name, sets")
      .eq("workout_id", id);

    if (exercisesError) {
      return res.status(500).json({ error: exercisesError.message });
    }

    return res.status(200).json({ ...workout, exercises: exercises || [] });
  } catch (err) {
    console.error("Get workout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create workout with exercises
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, notes, exercises } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    // Insert workout
    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("gym_workouts")
      .insert({
        profile_id: req.user!.id,
        name,
        notes,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (workoutError) {
      return res.status(500).json({ error: workoutError.message });
    }

    // Insert exercises if provided
    let insertedExercises: any[] = [];
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      const exerciseRows = exercises.map((ex: { exercise_name: string; sets: any }) => ({
        workout_id: workout.id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
      }));

      const { data: exData, error: exError } = await supabaseAdmin
        .from("gym_exercises")
        .insert(exerciseRows)
        .select();

      if (exError) {
        return res.status(500).json({ error: exError.message });
      }

      insertedExercises = exData || [];
    }

    return res.status(201).json({ ...workout, exercises: insertedExercises });
  } catch (err) {
    console.error("Create workout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /:id — update workout (end_time, notes)
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { end_time, notes } = req.body;

    const { data, error } = await supabaseAdmin
      .from("gym_workouts")
      .update({ end_time, notes })
      .eq("id", id)
      .eq("profile_id", req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Update workout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
