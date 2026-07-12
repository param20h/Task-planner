export type GymExercisePreset = {
  name: string;
  category: string; // Routine category, e.g. "Chest", "Back", "Legs"
  primaryMuscle: string; // Exact muscle group for heatmap
};

export const EXERCISE_PRESETS: GymExercisePreset[] = [
  // Chest
  { name: "Barbell Bench Press", category: "Chest", primaryMuscle: "Chest" },
  { name: "Incline Dumbbell Press", category: "Chest", primaryMuscle: "Chest" },
  { name: "Incline Smith Machine Press", category: "Chest", primaryMuscle: "Chest" },
  { name: "Cable Fly (High → Low)", category: "Chest", primaryMuscle: "Chest" },
  { name: "Chest Dips", category: "Chest", primaryMuscle: "Chest" },
  { name: "Push Up", category: "Chest", primaryMuscle: "Chest" },
  { name: "Dumbbell Pull-over", category: "Chest", primaryMuscle: "Chest" },
  { name: "Pec Dec Fly", category: "Chest", primaryMuscle: "Chest" },

  // Back / Lats / Upper Back
  { name: "Deadlift", category: "Back", primaryMuscle: "Upper Back" },
  { name: "Wide Grip Lat Pulldown", category: "Back", primaryMuscle: "Lats" },
  { name: "Chest Supported Row", category: "Back", primaryMuscle: "Upper Back" },
  { name: "Seated Cable Row", category: "Back", primaryMuscle: "Upper Back" },
  { name: "Straight Arm Pulldown", category: "Back", primaryMuscle: "Lats" },
  { name: "Face Pull", category: "Back", primaryMuscle: "Shoulders" },
  { name: "Bent Over Row (Dumbbell)", category: "Back", primaryMuscle: "Upper Back" },
  { name: "Pull-up", category: "Back", primaryMuscle: "Lats" },
  { name: "Chin-up", category: "Back", primaryMuscle: "Biceps" },
  { name: "Barbell Row", category: "Back", primaryMuscle: "Upper Back" },
  { name: "T-Bar Row", category: "Back", primaryMuscle: "Upper Back" },

  // Legs / Calves
  { name: "Back Squat", category: "Legs", primaryMuscle: "Quads" },
  { name: "Leg Press", category: "Legs", primaryMuscle: "Quads" },
  { name: "Walking Lunges", category: "Legs", primaryMuscle: "Quads" },
  { name: "Leg Extension", category: "Legs", primaryMuscle: "Quads" },
  { name: "Romanian Deadlift", category: "Legs", primaryMuscle: "Hamstrings" },
  { name: "Lying Leg Curl", category: "Legs", primaryMuscle: "Hamstrings" },
  { name: "Standing Calf Raise", category: "Legs", primaryMuscle: "Calves" },
  { name: "Seated Calf Raise", category: "Legs", primaryMuscle: "Calves" },
  { name: "Goblet Squat", category: "Legs", primaryMuscle: "Quads" },

  // Shoulders
  { name: "Dumbbell Shoulder Press", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Barbell Overhead Press", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Dumbbell Lateral Raise", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Cable Lateral Raise", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Rear Delt Fly", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Dumbbell Shrugs", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Upright Row (Dumbbell)", category: "Shoulders", primaryMuscle: "Shoulders" },
  { name: "Arnold Press", category: "Shoulders", primaryMuscle: "Shoulders" },

  // Arms - Biceps / Triceps / Forearms
  { name: "EZ Bar Curl", category: "Arms", primaryMuscle: "Biceps" },
  { name: "Incline Dumbbell Curl", category: "Arms", primaryMuscle: "Biceps" },
  { name: "Hammer Curl", category: "Arms", primaryMuscle: "Biceps" },
  { name: "Preacher Curl", category: "Arms", primaryMuscle: "Biceps" },
  { name: "Concentrated Curl", category: "Arms", primaryMuscle: "Biceps" },
  { name: "Rope Pushdown", category: "Arms", primaryMuscle: "Triceps" },
  { name: "Overhead Rope Extension", category: "Arms", primaryMuscle: "Triceps" },
  { name: "Skull Crushers", category: "Arms", primaryMuscle: "Triceps" },
  { name: "Close Grip Bench Press", category: "Arms", primaryMuscle: "Triceps" },
  { name: "Tricep Kickbacks", category: "Arms", primaryMuscle: "Triceps" },
  { name: "Wrist Curls", category: "Arms", primaryMuscle: "Forearms" },
  { name: "Reverse Curls", category: "Arms", primaryMuscle: "Forearms" },
  { name: "Farmers Walk", category: "Arms", primaryMuscle: "Forearms" },

  // Abs
  { name: "Hanging Leg Raise", category: "Abs", primaryMuscle: "Abs" },
  { name: "Cable Crunch", category: "Abs", primaryMuscle: "Abs" },
  { name: "Plank", category: "Abs", primaryMuscle: "Abs" },
  { name: "Ab Wheel Rollout", category: "Abs", primaryMuscle: "Abs" },
  { name: "Russian Twist", category: "Abs", primaryMuscle: "Abs" },

  // Cardio
  { name: "Treadmill", category: "Cardio", primaryMuscle: "Cardio" },
  { name: "Elliptical", category: "Cardio", primaryMuscle: "Cardio" },
  { name: "Stationary Bike", category: "Cardio", primaryMuscle: "Cardio" },
  { name: "Jump Rope", category: "Cardio", primaryMuscle: "Cardio" },
  { name: "Rowing Machine", category: "Cardio", primaryMuscle: "Cardio" }
];

export const getMuscleForExercise = (exerciseName: string): string => {
  const match = EXERCISE_PRESETS.find(
    e => e.name.toLowerCase() === exerciseName.trim().toLowerCase()
  );
  if (match) return match.primaryMuscle;
  
  // Basic heuristics for custom user exercises
  const lower = exerciseName.toLowerCase();
  if (lower.includes("bench") || lower.includes("fly") || lower.includes("chest") || lower.includes("pushup")) return "Chest";
  if (lower.includes("row") || lower.includes("deadlift") || lower.includes("back") || lower.includes("shrug")) return "Upper Back";
  if (lower.includes("lat") || lower.includes("pulldown") || lower.includes("pullup") || lower.includes("chinup")) return "Lats";
  if (lower.includes("squat") || lower.includes("press") || lower.includes("lunge") || lower.includes("extension")) return "Quads";
  if (lower.includes("leg curl") || lower.includes("romanian") || lower.includes("rdl")) return "Hamstrings";
  if (lower.includes("calf") || lower.includes("raise")) return "Calves";
  if (lower.includes("press") || lower.includes("lateral") || lower.includes("raise") || lower.includes("delt") || lower.includes("shrug")) return "Shoulders";
  if (lower.includes("curl") || lower.includes("bicep")) return "Biceps";
  if (lower.includes("pushdown") || lower.includes("tricep") || lower.includes("extension") || lower.includes("kickback") || lower.includes("dip")) return "Triceps";
  if (lower.includes("forearm") || lower.includes("wrist") || lower.includes("farmer")) return "Forearms";
  if (lower.includes("crunch") || lower.includes("raise") || lower.includes("plank") || lower.includes("twist") || lower.includes("abs") || lower.includes("situp")) return "Abs";
  if (lower.includes("run") || lower.includes("walk") || lower.includes("cardio") || lower.includes("bike") || lower.includes("treadmill") || lower.includes("rope")) return "Cardio";
  
  return "Chest"; // Default fallback
};
