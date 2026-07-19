"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  Plus, 
  Check, 
  Trash2, 
  Award, 
  Search, 
  ChevronDown, 
  Play, 
  Pause, 
  RefreshCw
} from "lucide-react";
import {
  CustomWorkoutIcon,
  CustomFlameIcon,
  CustomClockIcon,
  CustomSparklesIcon
} from "@/components/ui/CustomIcons";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/lib/api";
import { MuscleHeatmap } from "@/components/widgets/MuscleHeatmap";
import { EXERCISE_PRESETS, getMuscleForExercise } from "@/lib/exerciseData";

// Styling constants
const glassCardClass = "bg-slate-100/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

type SetItem = {
  weight: string;
  reps: string;
  completed: boolean;
  previous: string;
};

type WorkoutExercise = {
  id: string;
  name: string;
  category: string;
  sets: SetItem[];
};

// 7-day program template based on user request
const ROUTINES = [
  {
    name: "Monday – Chest + Triceps",
    exercises: [
      { name: "Barbell Bench Press", category: "Chest", setsCount: 4, repRange: "6–8" },
      { name: "Incline Dumbbell Press", category: "Chest", setsCount: 4, repRange: "8–10" },
      { name: "Incline Smith Machine Press", category: "Chest", setsCount: 3, repRange: "10–12" },
      { name: "Cable Fly (High → Low)", category: "Chest", setsCount: 3, repRange: "12–15" },
      { name: "Chest Dips", category: "Chest", setsCount: 3, repRange: "Failure" },
      { name: "Rope Pushdown", category: "Arms", setsCount: 3, repRange: "10–12" },
      { name: "Overhead Rope Extension", category: "Arms", setsCount: 3, repRange: "10–12" }
    ]
  },
  {
    name: "Tuesday – Back + Biceps",
    exercises: [
      { name: "Deadlift", category: "Back", setsCount: 4, repRange: "5" },
      { name: "Wide Grip Lat Pulldown", category: "Back", setsCount: 4, repRange: "8–10" },
      { name: "Chest Supported Row", category: "Back", setsCount: 3, repRange: "10" },
      { name: "Seated Cable Row", category: "Back", setsCount: 3, repRange: "10–12" },
      { name: "Straight Arm Pulldown", category: "Back", setsCount: 3, repRange: "12–15" },
      { name: "Face Pull", category: "Back", setsCount: 3, repRange: "15" },
      { name: "EZ Bar Curl", category: "Arms", setsCount: 3, repRange: "10" },
      { name: "Incline Dumbbell Curl", category: "Arms", setsCount: 3, repRange: "10–12" },
      { name: "Hammer Curl", category: "Arms", setsCount: 3, repRange: "12" }
    ]
  },
  {
    name: "Wednesday – Legs",
    exercises: [
      { name: "Back Squat", category: "Legs", setsCount: 4, repRange: "6–8" },
      { name: "Leg Press", category: "Legs", setsCount: 3, repRange: "10–12" },
      { name: "Walking Lunges", category: "Legs", setsCount: 3, repRange: "12 each leg" },
      { name: "Leg Extension", category: "Legs", setsCount: 3, repRange: "15" },
      { name: "Romanian Deadlift", category: "Legs", setsCount: 3, repRange: "8" },
      { name: "Lying Leg Curl", category: "Legs", setsCount: 3, repRange: "12" },
      { name: "Standing Calf Raise", category: "Legs", setsCount: 4, repRange: "15" },
      { name: "Seated Calf Raise", category: "Legs", setsCount: 3, repRange: "20" }
    ]
  },
  {
    name: "Thursday – Shoulders + Abs",
    exercises: [
      { name: "Dumbbell Shoulder Press", category: "Shoulders", setsCount: 4, repRange: "8" },
      { name: "Machine Shoulder Press", category: "Shoulders", setsCount: 3, repRange: "10" },
      { name: "Dumbbell Lateral Raise", category: "Shoulders", setsCount: 4, repRange: "15" },
      { name: "Cable Lateral Raise", category: "Shoulders", setsCount: 3, repRange: "15" },
      { name: "Rear Delt Fly", category: "Shoulders", setsCount: 4, repRange: "15" },
      { name: "Dumbbell Shrugs", category: "Shoulders", setsCount: 3, repRange: "12" },
      { name: "Hanging Leg Raise", category: "Abs", setsCount: 3, repRange: "15" },
      { name: "Cable Crunch", category: "Abs", setsCount: 3, repRange: "15" },
      { name: "Plank", category: "Abs", setsCount: 3, repRange: "60 sec" }
    ]
  },
  {
    name: "Friday – Upper Strength",
    exercises: [
      { name: "Bench Press", category: "Chest", setsCount: 5, repRange: "5" },
      { name: "Pull-Ups / Weighted Pull-Ups", category: "Back", setsCount: 4, repRange: "Failure" },
      { name: "Standing Barbell Overhead Press", category: "Shoulders", setsCount: 4, repRange: "6" },
      { name: "Barbell Row", category: "Back", setsCount: 4, repRange: "8" },
      { name: "Incline Dumbbell Press", category: "Chest", setsCount: 3, repRange: "8–10" },
      { name: "Lat Pulldown", category: "Back", setsCount: 3, repRange: "10" },
      { name: "Rope Pushdown", category: "Arms", setsCount: 3, repRange: "12" },
      { name: "Hammer Curl", category: "Arms", setsCount: 3, repRange: "12" }
    ]
  },
  {
    name: "Saturday – Arms + Weak Points",
    exercises: [
      { name: "Incline Dumbbell Curl", category: "Arms", setsCount: 3, repRange: "12" },
      { name: "Preacher Curl", category: "Arms", setsCount: 3, repRange: "12" },
      { name: "Cable Curl", category: "Arms", setsCount: 3, repRange: "15" },
      { name: "Skull Crushers", category: "Arms", setsCount: 3, repRange: "10" },
      { name: "Rope Pushdown", category: "Arms", setsCount: 3, repRange: "12" },
      { name: "Single Arm Cable Extension", category: "Arms", setsCount: 3, repRange: "12" },
      { name: "Lateral Raise", category: "Shoulders", setsCount: 4, repRange: "20" },
      { name: "Rear Delt Fly", category: "Shoulders", setsCount: 3, repRange: "20" },
      { name: "Wrist Curl", category: "Arms", setsCount: 3, repRange: "15" },
      { name: "Reverse Wrist Curl", category: "Arms", setsCount: 3, repRange: "15" }
    ]
  }
];

export default function WorkoutPage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [activeTab, setActiveTab] = useState<"overview" | "log" | "analytics" | "exercises">("overview");

  // Timer states - start paused at 0
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active workout states
  const [workoutName, setWorkoutName] = useState("Push Day");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Catalog exercises list
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("All");
  const [alertPr, setAlertPr] = useState<string | null>("New PR! Bench Press 100kg");

  const exerciseCatalog = EXERCISE_PRESETS.map(e => ({
    name: e.name,
    category: e.category,
    type: e.primaryMuscle
  }));

  // Overview aggregates
  const [weeklyDuration, setWeeklyDuration] = useState("4h 30m");
  const [caloriesBurned, setCaloriesBurned] = useState("2,160");
  const [recoveryScore, setRecoveryScore] = useState(88);
  const [trainingLoad, setTrainingLoad] = useState(72);
  const [pastWorkouts, setPastWorkouts] = useState<any[]>([]);
  const [muscleSets, setMuscleSets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeTab === "log" && timerRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTab, timerRunning]);

  const loadRoutine = (routineIdx: number) => {
    const routine = ROUTINES[routineIdx];
    setWorkoutName(routine.name);
    setExercises(
      routine.exercises.map(ex => ({
        id: String(Math.random()),
        name: ex.name,
        category: ex.category,
        sets: Array.from({ length: ex.setsCount }, (_, i) => ({
          previous: `${ex.repRange} reps target`,
          weight: "",
          reps: "",
          completed: false
        }))
      }))
    );
    setSeconds(0);
    setTimerRunning(false);
  };

  const loadWorkoutsFromDB = async (uid: string = profileId) => {
    try {
      const { data, error } = await supabase
        .from("gym_workouts")
        .select(`
          id,
          name,
          notes,
          start_time,
          end_time,
          gym_exercises (
            exercise_name,
            sets
          )
        `)
        .eq("profile_id", uid)
        .order("start_time", { ascending: false });

      if (data && !error && data.length > 0) {
        let totalDuration = 0;
        let totalCal = 0;
        
        const workoutsList = data.map(w => {
          const dateObj = new Date(w.start_time);
          
          // Calculate duration
          let durationMin = 45; // default 45 mins
          if (w.start_time && w.end_time) {
            const startMs = new Date(w.start_time).getTime();
            const endMs = new Date(w.end_time).getTime();
            if (endMs > startMs) {
              durationMin = Math.round((endMs - startMs) / 60000);
            }
          }
          totalDuration += durationMin;
          totalCal += durationMin * 8; // approx 8 kcal per min

          // Calculate volume
          let workoutVolume = 0;
          if (w.gym_exercises) {
            w.gym_exercises.forEach((ex: any) => {
              if (Array.isArray(ex.sets)) {
                ex.sets.forEach((set: any) => {
                  const wt = parseFloat(set.weight) || 0;
                  const rp = parseInt(set.reps) || 0;
                  workoutVolume += wt * rp;
                });
              }
            });
          }

          return {
            id: w.id,
            name: w.name || "Workout",
            date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            duration: `${durationMin} mins`,
            volume: workoutVolume,
            type: w.gym_exercises?.[0]?.exercise_name ? w.gym_exercises[0].exercise_name : "Strength Training"
          };
        });

        setPastWorkouts(workoutsList);
        
        // Calculate muscle sets over past 7 days
        const setsCount: Record<string, number> = {};
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        data.forEach(w => {
          const workoutDate = new Date(w.start_time);
          if (workoutDate >= sevenDaysAgo && w.gym_exercises) {
            w.gym_exercises.forEach((ex: any) => {
              const muscle = getMuscleForExercise(ex.exercise_name);
              const numSets = Array.isArray(ex.sets) ? ex.sets.length : 0;
              if (numSets > 0) {
                setsCount[muscle] = (setsCount[muscle] || 0) + numSets;
              }
            });
          }
        });
        setMuscleSets(setsCount);
        
        // Update aggregates
        const hrs = Math.floor(totalDuration / 60);
        const mins = totalDuration % 60;
        setWeeklyDuration(`${hrs}h ${mins}m`);
        setCaloriesBurned(totalCal.toLocaleString());
        setRecoveryScore(Math.min(100, 75 + workoutsList.length * 3));
        setTrainingLoad(Math.min(100, workoutsList.length * 15));
      } else {
        setPastWorkouts([]);
        setWeeklyDuration("0h");
        setCaloriesBurned("0");
        setRecoveryScore(100);
        setTrainingLoad(0);
      }
    } catch (err) {
      console.error("Failed to query workouts:", err);
    }
  };


  const parseCSVRow = (text: string): string[] => {
    const result = [];
    let curVal = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(curVal.trim().replace(/^["']|["']$/g, ""));
        curVal = "";
      } else {
        curVal += char;
      }
    }
    result.push(curVal.trim().replace(/^["']|["']$/g, ""));
    return result;
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      setIsSyncing(true);
      try {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          alert("Empty CSV file.");
          setIsSyncing(false);
          return;
        }

        const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim());
        const dateIdx = headers.indexOf("Date");
        const nameIdx = headers.indexOf("Workout Name");
        const exIdx = headers.indexOf("Exercise Name");
        const wtIdx = headers.indexOf("Weight");
        const repsIdx = headers.indexOf("Reps");
        const noteIdx = headers.indexOf("Workout Notes");
        const durIdx = headers.indexOf("Workout Duration");

        if (dateIdx === -1 || nameIdx === -1 || exIdx === -1) {
          alert("Invalid CSV format. Please export your history directly from the Hevy app.");
          setIsSyncing(false);
          return;
        }

        const workoutsMap: Record<string, {
          date: string;
          name: string;
          notes: string;
          durationMin: number;
          exercises: Record<string, {
            name: string;
            sets: { reps: number; weight: number; completed: boolean }[];
          }>;
        }> = {};

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVRow(lines[i]);
          if (row.length < headers.length) continue;

          const dateVal = row[dateIdx];
          const nameVal = row[nameIdx] || "Workout";
          const exName = row[exIdx];
          if (!dateVal || !exName) continue;

          const key = `${dateVal}_${nameVal}`;
          if (!workoutsMap[key]) {
            let durVal = row[durIdx] || "";
            let durMins = 45;
            if (durVal) {
              const cleaned = durVal.toLowerCase().replace(/[^0-9]/g, "");
              const parsedDur = parseInt(cleaned);
              if (!isNaN(parsedDur) && parsedDur > 0) durMins = parsedDur;
            }

            workoutsMap[key] = {
              date: dateVal,
              name: nameVal,
              notes: row[noteIdx] || "Imported from Hevy CSV",
              durationMin: durMins,
              exercises: {}
            };
          }

          const wObj = workoutsMap[key];
          if (!wObj.exercises[exName]) {
            wObj.exercises[exName] = {
              name: exName,
              sets: []
            };
          }

          const wt = parseFloat(row[wtIdx]) || 0;
          const reps = parseInt(row[repsIdx]) || 0;
          wObj.exercises[exName].sets.push({
            weight: wt,
            reps: reps,
            completed: true
          });
        }

        let importedCount = 0;
        for (const [_, w] of Object.entries(workoutsMap)) {
          const formattedDate = w.date.replace(" ", "T") + ".000Z";

          const { data: existing } = await supabase
            .from("gym_workouts")
            .select("id")
            .eq("profile_id", profileId)
            .eq("start_time", formattedDate)
            .maybeSingle();

          if (existing) continue;

          const start = new Date(formattedDate);
          const end = new Date(start.getTime() + w.durationMin * 60000);

          const { data: newW, error: wErr } = await supabase
            .from("gym_workouts")
            .insert({
              profile_id: profileId,
              name: w.name,
              start_time: start.toISOString(),
              end_time: end.toISOString(),
              notes: w.notes
            })
            .select()
            .single();

          if (wErr || !newW) {
            console.error("Failed to insert imported workout:", wErr);
            continue;
          }

          const exercisesList = Object.values(w.exercises);
          for (const ex of exercisesList) {
            await supabase
              .from("gym_exercises")
              .insert({
                workout_id: newW.id,
                exercise_name: ex.name,
                sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight }))
              });
          }
          importedCount++;
        }

        alert(`Successfully imported ${importedCount} workouts from your CSV!`);
        await loadWorkoutsFromDB();
      } catch (err) {
        console.error("CSV import error:", err);
        alert("Failed to parse CSV file. Please verify it is a valid Hevy CSV.");
      } finally {
        setIsSyncing(false);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    async function getSession() {
      let activeId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeId = user.id;
          setProfileId(user.id);
        }
      } catch (err) {
        console.error("Failed to load session user:", err);
      }
      await loadWorkoutsFromDB(activeId);
    }
    getSession();
    loadRoutine(0);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calculateTotalVolume = () => {
    let volume = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && set.weight && set.reps) {
          volume += parseFloat(set.weight) * parseInt(set.reps);
        }
      });
    });
    return volume;
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, field: "weight" | "reps", value: string) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx].completed = !updated[exIdx].sets[setIdx].completed;
    setExercises(updated);
  };

  const handleAddSet = (exIdx: number) => {
    const updated = [...exercises];
    const prevSets = updated[exIdx].sets;
    const lastSet = prevSets[prevSets.length - 1];
    updated[exIdx].sets.push({
      previous: lastSet ? `${lastSet.weight || "—"} kg x ${lastSet.reps || "—"} reps` : "Target reps",
      weight: lastSet ? lastSet.weight : "",
      reps: lastSet ? lastSet.reps : "",
      completed: false
    });
    setExercises(updated);
  };

  const handleAddExerciseToWorkout = (catalogName: string, category: string) => {
    setExercises(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: catalogName,
        category: category,
        sets: [
          { previous: "—", weight: "", reps: "", completed: false }
        ]
      }
    ]);
    setActiveTab("log");
  };

  const handleFinishWorkout = async () => {
    const totalVolume = calculateTotalVolume();
    const durationMins = Math.round(seconds / 60) || 1;
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - seconds * 1000);
    
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from("gym_workouts")
        .insert({
          profile_id: profileId,
          name: workoutName,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: `${durationMins} Mins - Volume: ${totalVolume}kg`
        })
        .select()
        .single();

      if (workoutData && !workoutError) {
        for (const ex of exercises) {
          const completedSets = ex.sets.filter(s => s.completed);
          if (completedSets.length > 0) {
            await supabase
              .from("gym_exercises")
              .insert({
                workout_id: workoutData.id,
                exercise_name: ex.name,
                sets: completedSets.map(s => ({ reps: parseInt(s.reps), weight: parseFloat(s.weight) }))
              });
          }
        }
      }
    } catch (err) {
      console.error("Failed to finish workout:", err);
    }

    setSeconds(0);
    setTimerRunning(false);
    await loadWorkoutsFromDB();
    setActiveTab("overview");
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("gym_workouts")
        .delete()
        .eq("id", id);
      if (!error) {
        await loadWorkoutsFromDB();
      } else {
        console.error("Failed to delete workout:", error.message);
      }
    } catch (err) {
      console.error("Failed to delete workout exception:", err);
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Tab Segment Controller */}
      <div className="relative z-10 flex items-center p-1 bg-slate-100 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/5 rounded-xl shadow-inner max-w-max gap-1 overflow-x-auto max-w-full scrollbar-none">
        {[
          { id: "overview", label: "Overview" },
          { id: "log", label: "Log Workout" },
          { id: "analytics", label: "Analytics" },
          { id: "exercises", label: "Exercises" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-3 py-2 md:px-5 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-300 uppercase tracking-wider whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-[#6068F0]/20 border-[#6068F0]/30 text-[#6068F0] dark:text-white shadow-lg shadow-[#6068F0]/5" 
                : "text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative z-10">

        {/* 1. OVERVIEW VIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Stats and Past Workouts list */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-6">
                  <Card className={`${glassCardClass} p-5 flex items-center justify-between`}>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">Weekly Time</span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">{weeklyDuration}</span>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                      <CustomClockIcon className="h-5 w-5 text-[#6068F0]" />
                    </div>
                  </Card>

                  <Card className={`${glassCardClass} p-5 flex items-center justify-between`}>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">Calorie Burn</span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">{caloriesBurned} kcal</span>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                      <CustomFlameIcon className="h-5 w-5 text-rose-500" />
                    </div>
                  </Card>
                </div>

                <Card className={`${glassCardClass} p-6`}>
                   <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <CustomClockIcon className="h-4.5 w-4.5 text-[#6068F0]" />
                      Workout History
                    </CardTitle>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="hevy-csv-input"
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="hidden"
                      />
                      <button
                        onClick={() => document.getElementById("hevy-csv-input")?.click()}
                        disabled={isSyncing}
                        className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
                        {isSyncing ? "Importing..." : "Import CSV"}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    {pastWorkouts.length > 0 ? (
                      pastWorkouts.map((w: any, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all duration-300 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#6068F0]/10 border border-[#6068F0]/20 rounded-xl">
                                <CustomWorkoutIcon className="h-4.5 w-4.5 text-[#6068F0]" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{w.name}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">{w.date}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteWorkout(w.id)}
                                className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg p-1.5 transition-all duration-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-6 text-[10px] text-slate-500 dark:text-neutral-400 font-semibold pl-1.5">
                            <span>Volume: <strong className="text-slate-900 dark:text-white">{w.volume.toLocaleString()} kg</strong></span>
                            <span>Time: <strong className="text-slate-900 dark:text-white">{w.duration}</strong></span>
                            <span>Type: <strong className="text-slate-900 dark:text-white">{w.type}</strong></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-neutral-500 italic py-6 text-center">
                        No completed workouts found. Load a template and finish logging your first session!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: Recovery stats & Today's Tips */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Recovery & Load dials */}
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* Recovery card */}
                  <Card className={`${glassCardClass} p-5 flex flex-col justify-between h-44`}>
                    <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block mb-4">Recovery Score</span>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{recoveryScore}%</span>
                      <div className="h-10 w-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${recoveryScore}%` }} />
                    </div>
                  </Card>

                  {/* Training load */}
                  <Card className={`${glassCardClass} p-5 flex flex-col justify-between h-44`}>
                    <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block mb-4">Training Load</span>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{trainingLoad}%</span>
                      <div className="h-10 w-10 rounded-full border-2 border-[#6068F0]/30 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-[#6068F0]" />
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-[#6068F0] rounded-full" style={{ width: `${trainingLoad}%` }} />
                    </div>
                  </Card>
                </div>

                {/* Workout tips */}
                <Card className={`${glassCardClass} p-6 border-[#6068F0]/20 bg-gradient-to-b from-slate-50 to-[#6068F0]/5 dark:from-[#0d0d0e]/60 dark:to-[#6068F0]/5`}>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <CustomSparklesIcon className="h-4.5 w-4.5 text-[#6068F0]" />
                    Coach Insights
                  </CardTitle>
                  <div className="space-y-3.5 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    <p>• <strong className="text-slate-900 dark:text-white">Upper Chest:</strong> Prioritize incline bench/dumbbells to balance chest composition.</p>
                    <p>• <strong className="text-slate-900 dark:text-white">Side & Rear Delts:</strong> Complete lateral raises and rear flyes on Saturdays to broaden shoulder frame.</p>
                    <p>• <strong className="text-slate-900 dark:text-white">Latency Width:</strong> Do Wide Grip Lat Pulldown or pull-ups to define V-taper.</p>
                    <p>• <strong className="text-slate-900 dark:text-white">Form Target:</strong> Aim for 1-2 Reps in Reserve (RIR) on compounds.</p>
                  </div>
                </Card>

                {/* Visual Body Muscle Heatmap */}
                <MuscleHeatmap muscleSets={muscleSets} />
              </div>
            </div>
          </div>
        )}

        {/* 2. LOG WORKOUT VIEW */}
        {activeTab === "log" && (
          <div className="space-y-8">
            
            {/* Header Control Panel */}
            <div className="flex flex-col md:flex-row gap-6 justify-between">
              
              {/* Logger header */}
              <Card className={`${glassCardClass} p-6 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <input 
                    type="text" 
                    value={workoutName} 
                    onChange={(e) => setWorkoutName(e.target.value)} 
                    className="w-full max-w-xs sm:max-w-md bg-transparent text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none border-b border-dashed border-slate-200 dark:border-white/20 focus:border-[#6068F0] pb-0.5 truncate" 
                  />
                  
                  {/* Manual start/stop controls */}
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full">
                    <Button 
                      onClick={() => setTimerRunning(!timerRunning)}
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white"
                    >
                      {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-slate-700 dark:fill-white text-slate-700 dark:text-white" />}
                    </Button>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-neutral-300">{formatTimer(seconds)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right sm:text-left">
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">Total Volume</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{calculateTotalVolume().toLocaleString()} kg</span>
                  </div>
                  <Button 
                    onClick={handleFinishWorkout}
                    className="bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] px-6 py-2.5 font-bold transition-all duration-300"
                  >
                    Finish
                  </Button>
                </div>
              </Card>

              {/* Loader routine selector panel */}
              <Card className={`${glassCardClass} p-4 flex flex-col justify-center min-w-[250px]`}>
                <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase font-bold tracking-wider mb-2">Load Routine Template</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {ROUTINES.map((routine, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadRoutine(idx)}
                      className="text-left text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all duration-300 flex items-center justify-between"
                    >
                      <span>{routine.name.split(" – ")[0]}</span>
                      <span className="text-[9px] text-[#6068F0] font-bold">{routine.exercises.length} Ex</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Exercises table */}
            <div className="space-y-6 max-w-4xl">
              {exercises.length > 0 ? (
                exercises.map((ex, exIdx) => (
                  <Card key={ex.id} className={glassCardClass}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{ex.name}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium">Category: {ex.category}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const updated = [...exercises];
                            updated.splice(exIdx, 1);
                            setExercises(updated);
                          }}
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Set rows */}
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-12 gap-3 text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest px-2">
                          <span className="col-span-2 text-center">Set</span>
                          <span className="col-span-3 text-center">Target / Prev</span>
                          <span className="col-span-3 text-center">Weight (kg)</span>
                          <span className="col-span-3 text-center">Reps</span>
                          <span className="col-span-1 text-center">✔</span>
                        </div>

                        {ex.sets.map((set, setIdx) => (
                          <div 
                            key={setIdx} 
                            className={cn(
                              "grid grid-cols-12 gap-3 items-center p-2 rounded-2xl border transition-all duration-350 ease-out",
                              set.completed 
                                ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.03)]" 
                                : "bg-slate-50 dark:bg-[#0c0d0f]/60 border-slate-200 dark:border-white/5 hover:border-[#6068F0]/30 hover:bg-slate-100 dark:hover:bg-[#111216]/85"
                            )}
                          >
                            {/* Set Number Circular Badge */}
                            <div className="col-span-2 flex justify-center">
                              <span className={cn(
                                "h-6 w-6 rounded-full border text-[10px] font-black flex items-center justify-center transition-all duration-300",
                                set.completed 
                                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-550 dark:text-emerald-400"
                                  : "bg-slate-200/50 dark:bg-white/5 border-slate-300/40 dark:border-white/10 text-slate-600 dark:text-neutral-400"
                              )}>
                                {setIdx + 1}
                              </span>
                            </div>

                            {/* Previous Perf / Target */}
                            <span className={cn(
                              "col-span-3 text-[10px] font-semibold tracking-tight truncate flex items-center justify-center gap-1",
                              set.completed ? "text-emerald-600/70 dark:text-emerald-400/60" : "text-slate-400 dark:text-neutral-500"
                            )}>
                              {set.previous || "6–8 reps"}
                            </span>
                            
                            {/* Weight input */}
                            <div className="col-span-3">
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={set.weight || ""} 
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, "weight", e.target.value)}
                                disabled={set.completed}
                                className={cn(
                                  "w-full text-center text-xs font-black rounded-xl py-1.5 px-2 transition-all duration-300 outline-none",
                                  set.completed
                                    ? "bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed"
                                    : "bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6068F0]/30 focus:border-[#6068F0]"
                                )}
                              />
                            </div>

                            {/* Reps input */}
                            <div className="col-span-3">
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={set.reps || ""} 
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, "reps", e.target.value)}
                                disabled={set.completed}
                                className={cn(
                                  "w-full text-center text-xs font-black rounded-xl py-1.5 px-2 transition-all duration-300 outline-none",
                                  set.completed
                                    ? "bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-not-allowed"
                                    : "bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6068F0]/30 focus:border-[#6068F0]"
                                )}
                              />
                            </div>

                            {/* Toggle completed button */}
                            <div className="col-span-1 flex justify-center">
                              <button 
                                onClick={() => handleToggleSet(exIdx, setIdx)}
                                className={cn(
                                  "h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95",
                                  set.completed 
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                                    : "border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-transparent hover:text-emerald-500"
                                )}
                              >
                                <Check className="h-3 w-3 font-extrabold" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Set Button */}
                      <button 
                        onClick={() => handleAddSet(exIdx)}
                        className="w-full border border-dashed border-[#6068F0]/25 hover:border-[#6068F0]/60 bg-[#6068F0]/5 hover:bg-[#6068F0]/10 text-[#6068F0] font-bold rounded-2xl py-3 text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(96,104,240,0.15)]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Set
                      </button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className={`${glassCardClass} p-8 text-center`}>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 italic">No exercises loaded. Select a template routine above or add from dictionary.</p>
                </Card>
              )}
            </div>

            <div className="flex justify-end max-w-4xl">
              <Button 
                onClick={() => setActiveTab("exercises")}
                className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl px-5 py-3 shadow-lg flex items-center gap-2 transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </Button>
            </div>
          </div>
        )}

        {/* 3. WORKOUT ANALYTICS VIEW */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <Card className={`${glassCardClass} p-6 flex flex-col md:flex-row items-center justify-between gap-6`}>
              <div className="flex gap-8 w-full md:w-auto justify-around">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">Duration</span>
                  <span className="text-2xl font-extrabold text-slate-950 dark:text-white">62m</span>
                </div>
                <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">Total Volume</span>
                  <span className="text-2xl font-extrabold text-[#6068F0]">5,200 kg</span>
                </div>
                <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">Sets</span>
                  <span className="text-2xl font-extrabold text-slate-950 dark:text-white">18</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex gap-6 items-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">PRs HIT:</span>
                <div className="flex gap-4">
                  {[
                    { label: "Squat", val: "140 kg" },
                    { label: "Deadlift", val: "180 kg" },
                    { label: "Bench Press", val: "110 kg" }
                  ].map((pr, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-white shadow-inner">
                      <Award className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/20" />
                      <span>{pr.label}: {pr.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Muscle heatmap outline */}
              <Card className={`${glassCardClass} lg:col-span-8 p-6 flex flex-col items-center justify-center`}>
                <CardTitle className="text-sm font-semibold text-slate-400 dark:text-neutral-500 tracking-wider uppercase mb-8">Muscle Heatmap</CardTitle>
                <div className="flex gap-16 relative py-4">
                  
                  {/* Front View */}
                  <div className="relative w-44 h-80 flex flex-col items-center justify-center">
                    <span className="absolute top-0 text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase">Front View</span>
                    <svg className="w-full h-[90%] opacity-80" viewBox="0 0 100 200">
                      <path d="M 50 10 Q 55 10 55 20 Q 55 25 50 30 Q 45 25 45 20 Q 45 10 50 10" fill="currentColor" className="text-slate-200 dark:text-neutral-800" />
                      <path d="M 40 30 L 60 30 L 75 40 L 70 80 L 65 80 L 60 40 L 40 40 L 35 80 L 30 80 L 25 40 Z" fill="currentColor" className="text-slate-200 dark:text-neutral-800" />
                      <path d="M 40 80 L 48 140 L 45 190 L 50 190 L 52 140 L 60 80 Z" fill="currentColor" className="text-slate-200 dark:text-neutral-800" />
                      
                      <ellipse cx="50" cy="50" rx="10" ry="7" fill="url(#blueGlow)" className="opacity-90" />
                      <ellipse cx="38" cy="45" rx="4" ry="4" fill="url(#blueGlow)" className="opacity-70" />
                      <ellipse cx="62" cy="45" rx="4" ry="4" fill="url(#blueGlow)" className="opacity-70" />
                      <ellipse cx="44" cy="110" rx="5" ry="12" fill="url(#blueGlow)" className="opacity-80" />
                      <ellipse cx="56" cy="110" rx="5" ry="12" fill="url(#blueGlow)" className="opacity-80" />

                      <defs>
                        <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#6068F0" stopOpacity="1" />
                          <stop offset="100%" stopColor="#6068F0" stopOpacity="0.1" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Back View */}
                  <div className="relative w-44 h-80 flex flex-col items-center justify-center">
                    <span className="absolute top-0 text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase">Back View</span>
                    <svg className="w-full h-[90%] opacity-80" viewBox="0 0 100 200">
                      <path d="M 50 10 Q 55 10 55 20 Q 55 25 50 30 Q 45 25 45 20 Q 45 10 50 10" fill="currentColor" className="text-slate-200 dark:text-neutral-800" />
                      <path d="M 40 30 L 60 30 L 75 40 L 70 80 L 65 80 L 60 40 L 40 40 L 35 80 L 30 80 L 25 40 Z" fill="currentColor" className="text-slate-200 dark:text-neutral-800" />
                      <path d="M 40 80 L 48 140 L 45 190 L 50 190 L 52 140 L 60 80 Z" fill="currentColor" className="text-slate-200 dark:text-neutral-800" />

                      <path d="M 42 42 L 58 42 L 55 65 L 45 65 Z" fill="url(#blueGlow)" className="opacity-80" />
                      <ellipse cx="44" cy="135" rx="4" ry="10" fill="url(#blueGlow)" className="opacity-70" />
                      <ellipse cx="56" cy="135" rx="4" ry="10" fill="url(#blueGlow)" className="opacity-70" />
                    </svg>
                  </div>
                </div>
              </Card>

              {/* Progress graphs */}
              <div className="lg:col-span-4 space-y-6">
                <Card className={`${glassCardClass} p-5 space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">Best Weight Progress</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">140 kg</span>
                    </div>
                  </div>
                  <div className="h-16 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6068F0" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6068F0" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 35 Q 25 30 50 20 T 100 5 L 100 40 L 0 40 Z" fill="url(#glowGrad)" />
                      <path d="M 0 35 Q 25 30 50 20 T 100 5" fill="transparent" stroke="#6068F0" strokeWidth="1.5" />
                    </svg>
                  </div>
                </Card>

                <Card className={`${glassCardClass} p-5 space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">Total Volume Trend</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">5,200 kg</span>
                    </div>
                  </div>
                  <div className="h-16 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M 0 38 Q 20 32 40 28 T 80 18 T 100 8 L 100 40 L 0 40 Z" fill="url(#glowGrad)" />
                      <path d="M 0 38 Q 20 32 40 28 T 80 18 T 100 8" fill="transparent" stroke="#6068F0" strokeWidth="1.5" />
                    </svg>
                  </div>
                </Card>

                <Card className={`${glassCardClass} p-5 space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">Total Reps Over Time</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">1,440 reps</span>
                    </div>
                  </div>
                  <div className="h-16 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M 0 30 Q 30 35 60 20 T 100 12 L 100 40 L 0 40 Z" fill="url(#glowGrad)" />
                      <path d="M 0 30 Q 30 35 60 20 T 100 12" fill="transparent" stroke="#6068F0" strokeWidth="1.5" />
                    </svg>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* 4. EXERCISES VIEW */}
        {activeTab === "exercises" && (
          <div className="space-y-6 max-w-4xl">
            {alertPr && (
              <div className="bg-[#6068F0]/10 border border-[#6068F0]/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#6068F0] shadow-md shadow-[#6068F0]/5">
                <span className="flex items-center gap-2 font-semibold">
                  <Award className="h-4 w-4" />
                  {alertPr}
                </span>
                <button onClick={() => setAlertPr(null)} className="text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white">✕</button>
              </div>
            )}

            <Card className={`${glassCardClass} p-5 flex flex-col md:flex-row gap-4 items-center justify-between`}>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Search Exercises..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-[#6068F0] transition-colors duration-300"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedMuscleFilter(filter)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                      selectedMuscleFilter === filter 
                        ? "bg-[#6068F0]/20 border-[#6068F0]/40 text-[#6068F0] dark:text-white shadow-lg" 
                        : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-neutral-300"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              {["Chest", "Back", "Legs", "Shoulders", "Arms", "Abs"].map((grp) => {
                const filteredList = exerciseCatalog.filter(e => {
                  const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchFilter = selectedMuscleFilter === "All" || e.category === selectedMuscleFilter;
                  return e.category === grp && matchSearch && matchFilter;
                });

                if (filteredList.length === 0) return null;

                return (
                  <div key={grp} className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest pl-1">{grp}</h4>
                    <div className="space-y-3">
                      {filteredList.map((item, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300 shadow-sm"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h5>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">{item.type}</span>
                          </div>
                          <Button 
                            onClick={() => handleAddExerciseToWorkout(item.name, item.category)}
                            className="bg-[#6068F0]/20 hover:bg-[#6068F0] border border-[#6068F0]/30 hover:border-transparent text-[#6068F0] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider px-4 transition-all duration-300"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
