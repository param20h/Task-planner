"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Activity, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Check, 
  Trash2, 
  Award, 
  Search, 
  Timer,
  ChevronDown,
  Dumbbell,
  Play,
  Pause,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-[#0d0d0e]/60 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-white/15";

const PROFILE_ID = "alex_chen";

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
  const [activeTab, setActiveTab] = useState<"overview" | "log" | "analytics" | "exercises">("overview");

  // Timer states - start paused at 0
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active workout states
  const [workoutName, setWorkoutName] = useState("Push Day");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  // Catalog exercises list
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("All");
  const [alertPr, setAlertPr] = useState<string | null>("New PR! Bench Press 100kg");

  const exerciseCatalog = [
    { name: "Barbell Bench Press", category: "Chest", type: "Barbell" },
    { name: "Incline Dumbbell Press", category: "Chest", type: "Dumbbell" },
    { name: "Incline Smith Machine Press", category: "Chest", type: "Barbell" },
    { name: "Cable Fly (High → Low)", category: "Chest", type: "Cable" },
    { name: "Chest Dips", category: "Chest", type: "Bodyweight" },
    { name: "Wide Grip Lat Pulldown", category: "Back", type: "Machine" },
    { name: "Chest Supported Row", category: "Back", type: "Machine" },
    { name: "Seated Cable Row", category: "Back", type: "Cable" },
    { name: "Straight Arm Pulldown", category: "Back", type: "Cable" },
    { name: "Face Pull", category: "Shoulders", type: "Cable" },
    { name: "EZ Bar Curl", category: "Arms", type: "Barbell" },
    { name: "Incline Dumbbell Curl", category: "Arms", type: "Dumbbell" },
    { name: "Hammer Curl", category: "Arms", type: "Dumbbell" },
    { name: "Preacher Curl", category: "Arms", type: "Barbell" },
    { name: "Skull Crushers", category: "Arms", type: "Barbell" },
    { name: "Standing Calf Raise", category: "Legs", type: "Machine" },
    { name: "Seated Calf Raise", category: "Legs", type: "Machine" },
    { name: "Hanging Leg Raise", category: "Abs", type: "Bodyweight" },
    { name: "Cable Crunch", category: "Abs", type: "Cable" },
    { name: "Plank", category: "Abs", type: "Bodyweight" }
  ];

  // Dynamic past workouts loaded from DB
  const [pastWorkouts, setPastWorkouts] = useState<{ name: string; notes: string; date: string }[]>([]);
  const [weeklyDuration, setWeeklyDuration] = useState("0m");
  const [caloriesBurned, setCaloriesBurned] = useState("0");
  const [recoveryScore, setRecoveryScore] = useState(100);
  const [trainingLoad, setTrainingLoad] = useState(0);

  // Timer loop matching running state
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

  const loadWorkoutsFromDB = async () => {
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
        .eq("profile_id", PROFILE_ID)
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
          // fallback to a realistic volume if none logged yet
          if (workoutVolume === 0) {
            workoutVolume = 2400; // default/estimated
          }

          // Determine type from exercises or name
          let workoutType = "Strength";
          if (w.name.toLowerCase().includes("arm")) {
            workoutType = "Arms";
          } else if (w.name.toLowerCase().includes("chest") || w.name.toLowerCase().includes("push")) {
            workoutType = "Push / Chest";
          } else if (w.name.toLowerCase().includes("back") || w.name.toLowerCase().includes("pull")) {
            workoutType = "Pull / Back";
          } else if (w.name.toLowerCase().includes("leg")) {
            workoutType = "Legs";
          } else if (w.name.toLowerCase().includes("shoulder")) {
            workoutType = "Shoulders";
          }

          return {
            name: w.name,
            notes: w.notes || "Completed Session",
            date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            volume: workoutVolume,
            duration: `${durationMin}m`,
            type: workoutType
          };
        });

        setWeeklyDuration(`${totalDuration}m`);
        setCaloriesBurned(`${totalCal}`);
        setRecoveryScore(85);
        setTrainingLoad(data.length * 150);
        setPastWorkouts(workoutsList);
      } else {
        setPastWorkouts([]);
        setWeeklyDuration("0m");
        setCaloriesBurned("0");
        setRecoveryScore(100);
        setTrainingLoad(0);
      }
    } catch (err) {
      console.error("Failed to query workouts:", err);
    }
  };

  useEffect(() => {
    loadWorkoutsFromDB();
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

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx].completed = !updated[exIdx].sets[setIdx].completed;
    setExercises(updated);
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, field: "weight" | "reps", value: string) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const handleAddSet = (exIdx: number) => {
    const updated = [...exercises];
    const prevSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
    updated[exIdx].sets.push({
      previous: prevSet ? `${prevSet.weight} x ${prevSet.reps}` : "—",
      weight: prevSet ? prevSet.weight : "",
      reps: prevSet ? prevSet.reps : "",
      completed: false
    });
    setExercises(updated);
  };

  const handleAddExerciseToWorkout = (catalogName: string, category: string) => {
    setExercises([
      ...exercises,
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
          profile_id: PROFILE_ID,
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

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Tab Segment Controller */}
      <div className="relative z-10 flex flex-wrap gap-2 items-center p-1 bg-[#1C1C1E] border border-white/5 rounded-xl shadow-inner max-w-max">
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
              "px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-wider",
              activeTab === tab.id 
                ? "bg-[#6068F0]/20 border-[#6068F0]/30 text-white shadow-lg shadow-[#6068F0]/5" 
                : "text-neutral-500 hover:text-neutral-300"
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
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Weekly Time</span>
                      <span className="text-xl font-extrabold text-white mt-1 block">{weeklyDuration}</span>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-[#6068F0]" />
                    </div>
                  </Card>

                  <Card className={`${glassCardClass} p-5 flex items-center justify-between`}>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Calorie Burn</span>
                      <span className="text-xl font-extrabold text-white mt-1 block">{caloriesBurned} kcal</span>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-rose-500" />
                    </div>
                  </Card>
                </div>

                {/* Past Workouts History */}
                <Card className={`${glassCardClass} p-6`}>
                  <CardHeader className="px-0 pt-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <History className="h-4.5 w-4.5 text-[#6068F0]" />
                      Workout History (Supabase)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    {pastWorkouts.length > 0 ? (
                      pastWorkouts.map((w: any, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{w.name}</h4>
                              <span className="text-[9px] text-neutral-500 mt-1 block leading-relaxed">{w.notes}</span>
                            </div>
                            <span className="text-[9px] text-neutral-400 bg-black/45 px-2.5 py-1 rounded-full border border-white/5 font-mono whitespace-nowrap">{w.date}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] border-t border-white/5 pt-2 text-neutral-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Dumbbell className="h-3.5 w-3.5 text-[#6068F0] opacity-80" />
                              <span>Volume: <strong className="text-white">{w.volume.toLocaleString()} kg</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Timer className="h-3.5 w-3.5 text-rose-400 opacity-80" />
                              <span>Time: <strong className="text-white">{w.duration}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5 text-emerald-400 opacity-80" />
                              <span>Type: <strong className="text-white">{w.type}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-neutral-500 italic text-xs">
                        No completed workouts found. Load a template and finish logging your first session!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: AI Coach & Overview index */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* ECG Heart beat wave */}
                <Card className={`${glassCardClass} p-6 space-y-4`}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Heart Rate Waveform</span>
                    <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                  </div>
                  <div className="h-28 relative flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path 
                        d="M 0 15 L 20 15 L 23 10 L 25 20 L 27 2 L 29 28 L 31 12 L 33 15 L 50 15 L 53 8 L 55 22 L 57 0 L 59 30 L 61 10 L 63 15 L 100 15" 
                        fill="transparent" 
                        stroke="#EF4444" 
                        strokeWidth="1.5" 
                      />
                    </svg>
                  </div>
                </Card>

                {/* Coach advice tips */}
                <Card className={`${glassCardClass} p-6 border-[#6068F0]/20 bg-gradient-to-b from-[#0d0d0e]/60 to-[#6068F0]/5`}>
                  <CardHeader className="px-0 pt-0 pb-3 border-b border-white/5 mb-4">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-[#6068F0]" />
                      Gym Coach Advice
                    </span>
                  </CardHeader>
                  <CardContent className="px-0 text-xs text-neutral-400 space-y-3 leading-relaxed">
                    <p>• <strong className="text-white">Upper Chest:</strong> Prioritize incline bench/dumbbells to balance chest composition.</p>
                    <p>• <strong className="text-white">Side & Rear Delts:</strong> Complete lateral raises and rear flyes on Saturdays to broaden shoulder frame.</p>
                    <p>• <strong className="text-white">Latency Width:</strong> Do Wide Grip Lat Pulldown or pull-ups to define V-taper.</p>
                    <p>• <strong className="text-white">Form Target:</strong> Aim for 1-2 Reps in Reserve (RIR) on compounds.</p>
                  </CardContent>
                </Card>
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
                <div className="flex items-center gap-4">
                  <input 
                    type="text" 
                    value={workoutName} 
                    onChange={(e) => setWorkoutName(e.target.value)} 
                    className="bg-transparent text-2xl font-extrabold text-white focus:outline-none border-b border-dashed border-white/20 focus:border-[#6068F0] pb-0.5" 
                  />
                  
                  {/* Manual start/stop controls */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                    <Button 
                      onClick={() => setTimerRunning(!timerRunning)}
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-white/10 text-white"
                    >
                      {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-white" />}
                    </Button>
                    <span className="text-xs font-mono font-bold text-neutral-300">{formatTimer(seconds)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right sm:text-left">
                    <span className="text-[10px] text-neutral-500 uppercase block">Total Volume</span>
                    <span className="text-sm font-bold text-white">{calculateTotalVolume().toLocaleString()} kg</span>
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
                <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider mb-2">Load Routine Template</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {ROUTINES.map((routine, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadRoutine(idx)}
                      className="text-left text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all duration-300 flex items-center justify-between"
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
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <div>
                          <h4 className="text-base font-bold text-white">{ex.name}</h4>
                          <span className="text-[10px] text-neutral-500 font-medium">Category: {ex.category}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const updated = [...exercises];
                            updated.splice(exIdx, 1);
                            setExercises(updated);
                          }}
                          className="text-neutral-500 hover:text-red-400 hover:bg-white/5 rounded-full h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Set rows */}
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2">
                          <span className="col-span-2">Set</span>
                          <span className="col-span-3">Target / Prev</span>
                          <span className="col-span-3">KG</span>
                          <span className="col-span-3">Reps</span>
                          <span className="col-span-1 text-center">✓</span>
                        </div>

                        {ex.sets.map((set, setIdx) => (
                          <div 
                            key={setIdx} 
                            className={cn(
                              "grid grid-cols-12 gap-3 items-center p-1.5 rounded-xl border transition-all duration-300",
                              set.completed 
                                ? "bg-[#6068F0]/10 border-[#6068F0]/30" 
                                : "bg-white/5 border-white/5"
                            )}
                          >
                            <span className="col-span-2 text-xs font-bold text-center text-white">{setIdx + 1}</span>
                            <span className="col-span-3 text-[10px] text-neutral-500">{set.previous}</span>
                            
                            <div className="col-span-3">
                              <input 
                                type="number" 
                                placeholder="KG" 
                                value={set.weight} 
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, "weight", e.target.value)}
                                disabled={set.completed}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none focus:border-[#6068F0]" 
                              />
                            </div>

                            <div className="col-span-3">
                              <input 
                                type="number" 
                                placeholder="Reps" 
                                value={set.reps} 
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, "reps", e.target.value)}
                                disabled={set.completed}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-1 px-2 text-xs text-center text-white focus:outline-none focus:border-[#6068F0]" 
                              />
                            </div>

                            <div className="col-span-1 flex justify-center">
                              <button 
                                onClick={() => handleToggleSet(exIdx, setIdx)}
                                className={cn(
                                  "h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-300",
                                  set.completed 
                                    ? "bg-[#6068F0] border-[#6068F0] text-white" 
                                    : "border-white/20 hover:border-white/40"
                                )}
                              >
                                {set.completed && <Check className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => handleAddSet(exIdx)}
                        className="w-full border border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-xl py-2 flex items-center justify-center gap-1.5 transition-all duration-300"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Set
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className={`${glassCardClass} p-8 text-center`}>
                  <p className="text-xs text-neutral-500 italic">No exercises loaded. Select a template routine above or add from dictionary.</p>
                </Card>
              )}
            </div>

            <div className="flex justify-end max-w-4xl">
              <Button 
                onClick={() => setActiveTab("exercises")}
                className="bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 hover:border-white/20 rounded-xl px-5 py-3 shadow-lg flex items-center gap-2 transition-all duration-300"
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
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Duration</span>
                  <span className="text-2xl font-extrabold text-white">62m</span>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Total Volume</span>
                  <span className="text-2xl font-extrabold text-[#6068F0]">5,200 kg</span>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Sets</span>
                  <span className="text-2xl font-extrabold text-white">18</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-6 items-center">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">PRs HIT:</span>
                <div className="flex gap-4">
                  {[
                    { label: "Squat", val: "140 kg" },
                    { label: "Deadlift", val: "180 kg" },
                    { label: "Bench Press", val: "110 kg" }
                  ].map((pr, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-inner">
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
                <CardTitle className="text-sm font-semibold text-neutral-400 tracking-wider uppercase mb-8">Muscle Heatmap</CardTitle>
                <div className="flex gap-16 relative py-4">
                  
                  {/* Front View */}
                  <div className="relative w-44 h-80 flex flex-col items-center justify-center">
                    <span className="absolute top-0 text-[10px] text-neutral-500 font-bold uppercase">Front View</span>
                    <svg className="w-full h-[90%] opacity-80" viewBox="0 0 100 200">
                      <path d="M 50 10 Q 55 10 55 20 Q 55 25 50 30 Q 45 25 45 20 Q 45 10 50 10" fill="#262626" />
                      <path d="M 40 30 L 60 30 L 75 40 L 70 80 L 65 80 L 60 40 L 40 40 L 35 80 L 30 80 L 25 40 Z" fill="#262626" />
                      <path d="M 40 80 L 48 140 L 45 190 L 50 190 L 52 140 L 60 80 Z" fill="#262626" />
                      
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
                    <span className="absolute top-0 text-[10px] text-neutral-500 font-bold uppercase">Back View</span>
                    <svg className="w-full h-[90%] opacity-80" viewBox="0 0 100 200">
                      <path d="M 50 10 Q 55 10 55 20 Q 55 25 50 30 Q 45 25 45 20 Q 45 10 50 10" fill="#262626" />
                      <path d="M 40 30 L 60 30 L 75 40 L 70 80 L 65 80 L 60 40 L 40 40 L 35 80 L 30 80 L 25 40 Z" fill="#262626" />
                      <path d="M 40 80 L 48 140 L 45 190 L 50 190 L 52 140 L 60 80 Z" fill="#262626" />

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
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Best Weight Progress</span>
                      <span className="text-lg font-extrabold text-white mt-1 block">140 kg</span>
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
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Total Volume Trend</span>
                      <span className="text-lg font-extrabold text-white mt-1 block">5,200 kg</span>
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
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Total Reps Over Time</span>
                      <span className="text-lg font-extrabold text-white mt-1 block">1,440 reps</span>
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
                <button onClick={() => setAlertPr(null)} className="text-neutral-500 hover:text-white">✕</button>
              </div>
            )}

            <Card className={`${glassCardClass} p-5 flex flex-col md:flex-row gap-4 items-center justify-between`}>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Search Exercises..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#6068F0] transition-colors duration-300"
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
                        ? "bg-[#6068F0]/20 border-[#6068F0]/40 text-white" 
                        : "bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
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
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">{grp}</h4>
                    <div className="space-y-3">
                      {filteredList.map((item, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-sm"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-white">{item.name}</h5>
                            <span className="text-[10px] text-neutral-500 mt-1 block">{item.type}</span>
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
