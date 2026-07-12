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

// POST /sync — sync workouts from Hevy API
router.post("/sync", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Fetch user's hevy_api_key from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("hevy_api_key")
      .eq("id", req.user!.id)
      .single();

    if (profileError || !profile?.hevy_api_key) {
      return res.status(400).json({ error: "Hevy API Key not configured. Please add it in your settings page." });
    }

    // 2. Fetch workouts from Hevy API
    const response = await fetch("https://api.hevyapp.com/v1/workouts?page=1&pageSize=10", {
      method: "GET",
      headers: {
        "api-key": profile.hevy_api_key,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hevy API error:", errText);
      return res.status(response.status).json({ error: `Hevy API Error: ${errText || "Invalid key or request"}` });
    }

    const result = (await response.json()) as any;
    const workouts = result.workouts || [];
    let syncedCount = 0;

    // 3. Import workouts
    for (const w of workouts) {
      // Avoid duplicate imports by checking start_time uniqueness
      const { data: existing } = await supabaseAdmin
        .from("gym_workouts")
        .select("id")
        .eq("profile_id", req.user!.id)
        .eq("start_time", w.start_time)
        .maybeSingle();

      if (existing) {
        continue; // Skip already synced workouts
      }

      // Insert workout
      const { data: newWorkout, error: insertError } = await supabaseAdmin
        .from("gym_workouts")
        .insert({
          profile_id: req.user!.id,
          name: w.title || "Hevy Workout",
          start_time: w.start_time,
          end_time: w.end_time || null,
          notes: w.description ? `Synced: ${w.description}` : "Synced from Hevy"
        })
        .select()
        .single();

      if (insertError || !newWorkout) {
        console.error("Error inserting synced workout:", insertError);
        continue;
      }

      // Insert exercises
      if (w.exercises && Array.isArray(w.exercises)) {
        const exerciseRows = w.exercises.map((ex: any) => {
          // Standardize exercise name
          const exName = ex.exercise_title || ex.title || ex.name || "Strength Training";
          
          // Map sets
          const setsMapped = (ex.sets || []).map((s: any) => ({
            reps: s.reps !== undefined ? parseInt(s.reps) : 0,
            weight: s.weight_kg !== undefined ? parseFloat(s.weight_kg) : (s.weight_lbs ? parseFloat(s.weight_lbs) * 0.453592 : 0),
            completed: true
          }));

          return {
            workout_id: newWorkout.id,
            exercise_name: exName,
            sets: setsMapped
          };
        });

        if (exerciseRows.length > 0) {
          const { error: exError } = await supabaseAdmin
            .from("gym_exercises")
            .insert(exerciseRows);

          if (exError) {
            console.error("Error inserting synced exercises:", exError);
          }
        }
      }

      syncedCount++;
    }

    return res.status(200).json({ success: true, synced_count: syncedCount });
  } catch (err) {
    console.error("Hevy sync failed:", err);
    return res.status(500).json({ error: "Internal server error during Hevy sync" });
  }
});

export default router;
