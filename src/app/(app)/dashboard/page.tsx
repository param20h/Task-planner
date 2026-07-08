"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckSquare, 
  Dumbbell, 
  Apple, 
  Droplet, 
  TrendingUp, 
  Brain,
  Send,
  Plus,
  Check,
  Flame,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// Responsive Glassmorphism Styles using CSS variables for live appearance adjustments
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";
const glassIconWrapperClass = "p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center";

export default function DashboardPage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [userName, setUserName] = useState("Alex");
  const [groqKey, setGroqKey] = useState("");
  const [aiMessage, setAiMessage] = useState("Based on your focus, try a 20-minute meditation session now to boost productivity.");
  const [userChatInput, setUserChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Quick Dashboard Todo states
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // Dynamic aggregates
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [workoutMinutes, setWorkoutMinutes] = useState(0);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [todoList, setTodoList] = useState<{ id: any; title: string; completed: boolean }[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [contributionMap, setContributionMap] = useState<Record<string, number>>({});
  const [weeklyScores, setWeeklyScores] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Refresh trigger to reload aggregates
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      let activeProfileId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeProfileId = user.id;
          setProfileId(user.id);
          const nameVal = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
          setUserName(nameVal);
        } else {
          // Fallback check from localStorage
          if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem("momentum_name");
            if (storedName) setUserName(storedName);
          }
        }
      } catch (err) {
        console.error("Auth status resolution failed:", err);
      }

      if (typeof window !== 'undefined') {
        const storedKey = localStorage.getItem("momentum_groq_key");
        if (storedKey) setGroqKey(storedKey);
      }

      try {
        // Fetch ALL food logs
        const { data: foodData, error: foodError } = await supabase
          .from("food_logs")
          .select("calories, created_at")
          .eq("profile_id", activeProfileId);

        // Fetch ALL water logs
        const { data: waterData, error: waterError } = await supabase
          .from("water_logs")
          .select("amount_liters, created_at")
          .eq("profile_id", activeProfileId);

        // Fetch ALL workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("gym_workouts")
          .select("id, start_time")
          .eq("profile_id", activeProfileId);

        // Fetch ALL tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("id, title, status, created_at")
          .eq("profile_id", activeProfileId);

        // Build today's local date range (midnight → midnight, local time)
        const nowLocal = new Date();
        const todayStartMs = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 0, 0, 0, 0).getTime();
        const todayEndMs   = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 23, 59, 59, 999).getTime();

        const isToday = (dateStr: string) => {
          if (!dateStr) return false;
          const time = new Date(dateStr).getTime();
          return time >= todayStartMs && time <= todayEndMs;
        };

        // Filter TODAY's metrics
        const todayFood = foodData?.filter(f => f.created_at && isToday(f.created_at)) || [];
        const todayWater = waterData?.filter(w => w.created_at && isToday(w.created_at)) || [];
        const todayWorkouts = workoutsData?.filter(w => w.start_time && isToday(w.start_time)) || [];
        const todayTasks = tasksData?.filter(t => t.created_at && isToday(t.created_at)) || [];

        // Sum up today's quantities
        let totalCal = 0;
        if (todayFood.length > 0) {
          totalCal = todayFood.reduce((sum, item) => sum + item.calories, 0);
        }
        setCaloriesConsumed(totalCal);

        let totalWater = 0;
        if (todayWater.length > 0) {
          totalWater = todayWater.reduce((sum, item) => sum + Number(item.amount_liters), 0);
        }
        setWaterConsumed(Number(totalWater.toFixed(2)));

        let totalWorkoutsTime = 0;
        if (todayWorkouts.length > 0) {
          totalWorkoutsTime = todayWorkouts.length * 45;
        }
        setWorkoutMinutes(totalWorkoutsTime);

        // Compute today's tasks score
        let completedTasks = 0;
        let totalTasksCount = 0;

        if (todayTasks.length > 0) {
          totalTasksCount = todayTasks.length;
          completedTasks = todayTasks.filter(t => t.status === "completed").length;
        }

        // Set the checklist with pending tasks from all time (so older tasks can be completed)
        if (tasksData && !tasksError) {
          const activeTasksAllTime = tasksData.filter(t => t.status !== "completed").slice(0, 3);
          setTodoList(activeTasksAllTime.map(t => ({
            id: t.id,
            title: t.title,
            completed: false
          })));
        } else {
          setTodoList([]);
        }

        // Build contribution heatmap map from actual DB timestamps (historical)
        const dateMap: Record<string, number> = {};
        const addDate = (dateStr: string) => {
          if (!dateStr) return;
          const d = new Date(dateStr);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateOnly = `${year}-${month}-${day}`;
          dateMap[dateOnly] = (dateMap[dateOnly] || 0) + 1;
        };

        foodData?.forEach(f => f.created_at && addDate(f.created_at));
        waterData?.forEach(w => w.created_at && addDate(w.created_at));
        workoutsData?.forEach(w => w.start_time && addDate(w.start_time));
        tasksData?.filter(t => t.status === "completed").forEach(t => t.created_at && addDate(t.created_at));
        setContributionMap(dateMap);

        // Compute weekly scores for Sunday to Saturday of current week
        const today = new Date();
        const scores = [0, 0, 0, 0, 0, 0, 0];
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          scores[i] = dateMap[dateStr] || 0;
        }
        setWeeklyScores(scores);

        // Compute Today's Score
        // Base score = (task completion % * 0.4) + (water ratio * 0.2) + (calories ratio * 0.2) + (workout duration ratio * 0.2)
        const taskRatio = totalTasksCount > 0 ? (completedTasks / totalTasksCount) : 0;
        const waterRatio = Math.min(1, totalWater / 3.0);
        const caloriesRatio = Math.min(1, totalCal / 2500);
        const workoutRatio = Math.min(1, totalWorkoutsTime / 120);

        const computedScore = Math.round((taskRatio * 40) + (waterRatio * 20) + (caloriesRatio * 20) + (workoutRatio * 20));
        setTodayScore(computedScore || 0);

      } catch (err) {
        console.error("Failed to load dashboard data from Supabase:", err);
      }
    }
    loadDashboardData();
  }, [refreshCounter]);

  const handleToggleTaskDashboard = async (id: any) => {
    // Optimistically update
    setTodoList(prev => prev.filter(t => t.id !== id));
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", id);

      if (!error) {
        setRefreshCounter(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleCreateTodoDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          profile_id: profileId,
          title: newTodoTitle,
          status: "pending"
        })
        .select()
        .single();

      if (data && !error) {
        setRefreshCounter(prev => prev + 1);
        setNewTodoTitle("");
        setShowAddTodo(false);
      }
    } catch (err) {
      console.error("Failed to add task from dashboard:", err);
    }
  };

  const getPerformancePath = () => {
    const maxVal = Math.max(...weeklyScores, 1);
    const coords = weeklyScores.map((score, idx) => {
      const x = (idx / 6) * 100;
      const y = 38 - (score / maxVal) * 33;
      return { x, y };
    });

    if (coords.length === 0) return { pathD: "", areaD: "" };

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      pathD += ` L ${coords[i].x} ${coords[i].y}`;
    }

    const areaD = `${pathD} L 100 40 L 0 40 Z`;
    return { pathD, areaD };
  };

  const { pathD, areaD } = getPerformancePath();

  // Simple chatbot with Groq AI
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userMsg = userChatInput;
    setUserChatInput("");
    setIsSending(true);

    if (!groqKey) {
      setTimeout(() => {
        setAiMessage(`I received: "${userMsg}". Set your Groq API Key in Profile to get smart AI Coaching!`);
        setIsSending(false);
      }, 1000);
      return;
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are ZenithFlow AI, a premium personal productivity and health coach. Provide extremely concise, encouraging, and smart advice based on user metrics: ${caloriesConsumed} kcal food, ${workoutMinutes} min workout, ${waterConsumed}L water, and ${todayScore}% today's score.`
            },
            {
              role: "user",
              content: userMsg
            }
          ]
        })
      });
      const data = await res.json();
      setAiMessage(data.choices[0]?.message?.content || "No advice received.");
    } catch (err) {
      setAiMessage("Failed to connect to Groq AI. Check your internet connection.");
    } finally {
      setIsSending(false);
    }
  };

  // Generate dynamic habit consistency data from Supabase contribution counts
  const renderHabitGrid = () => {
    const rows = 7;
    const cols = 26;
    const grid = [];
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Find current date
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Start date is Sunday of 25 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - currentDayOfWeek - 25 * 7);

    for (let r = 0; r < rows; r++) {
      const rowCells = [];
      for (let c = 0; c < cols; c++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (c * 7) + r);

        // Format date string as YYYY-MM-DD
        const year = cellDate.getFullYear();
        const month = String(cellDate.getMonth() + 1).padStart(2, '0');
        const day = String(cellDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const count = contributionMap[dateStr] || 0;
        
        let colorClass = "bg-slate-200 dark:bg-white/5"; // 0 logs
        if (count === 1) colorClass = "bg-[#6068F0]/30";
        if (count === 2) colorClass = "bg-[#6068F0]/60";
        if (count >= 3) colorClass = "bg-[#6068F0]";

        // If the date is in the future, render it slightly faded/empty
        if (cellDate > today) {
          colorClass = "bg-slate-100 dark:bg-white/5 opacity-20";
        }

        rowCells.push(
          <div 
            key={`${r}-${c}`} 
            title={`${dateStr}: ${count} activity logs`}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 hover:ring-1 hover:ring-white/50 cursor-pointer",
              colorClass
            )}
          />
        );
      }
      grid.push(
        <div key={r} className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 dark:text-neutral-600 w-3 text-center">{days[r]}</span>
          <div className="flex gap-1.5">{rowCells}</div>
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* 3-Column Premium Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left + Mid Area (Columns 1-9) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Header Card */}
          <Card className={`${glassCardClass} py-6 px-8 border-none bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0d0d0e]/80 dark:to-transparent`}>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Good Evening, <span className="text-[#6068F0]">{userName}</span>
            </h1>
            <p className="text-slate-500 dark:text-neutral-500 mt-2 text-base">Let's finish the day strong. Here's your overview.</p>
          </Card>

          {/* Core Analytics Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Today's Score Circle Chart (4 cols) */}
            <Card className={`${glassCardClass} md:col-span-5 flex flex-col items-center justify-center p-6 text-center`}>
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-neutral-400 tracking-wider uppercase mb-6">Today's Score</CardTitle>
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="96" cy="96" r="80" 
                    stroke="currentColor"
                    className="text-slate-200 dark:text-neutral-800" 
                    strokeWidth="10" 
                    fill="transparent"
                  />
                  <circle 
                    cx="96" cy="96" r="80" 
                    className="stroke-[#6068F0] transition-all duration-1000 ease-out" 
                    strokeWidth="12" 
                    strokeDasharray={502.4}
                    strokeDashoffset={502.4 - (502.4 * todayScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{todayScore}%</span>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider mt-1">Consistency</span>
                </div>
              </div>
            </Card>

            {/* Quick Metrics Grid (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Calories card */}
              <Card className={glassCardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Nutrition</span>
                  <Apple className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                </CardHeader>
                <CardContent className="pt-2 flex flex-col justify-between h-[calc(100%-3rem)]">
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{caloriesConsumed} kcal</div>
                    <div className="text-[10px] text-slate-400 dark:text-neutral-500">/ 2,500 goal</div>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl mt-6">
                    <Flame className="h-6 w-6 text-[#6068F0] animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              {/* Workout card */}
              <Card className={glassCardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Training</span>
                  <Dumbbell className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                </CardHeader>
                <CardContent className="pt-2 flex flex-col justify-between h-[calc(100%-3rem)]">
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{workoutMinutes} MIN</div>
                    <div className="text-[10px] text-slate-400 dark:text-neutral-500">Active time</div>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl mt-6">
                    <Dumbbell className="h-6 w-6 text-[#6068F0] animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              {/* Water card */}
              <Card className={glassCardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Water</span>
                  <Droplet className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                </CardHeader>
                <CardContent className="pt-2 flex flex-col justify-between h-[calc(100%-3rem)]">
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{waterConsumed} L</div>
                    <div className="text-[10px] text-slate-400 dark:text-neutral-500">/ 3.0 L goal</div>
                  </div>
                  <div className="relative h-14 w-full bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 mt-4 overflow-hidden flex items-end">
                    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white/80 z-10">
                      {Math.min(100, Math.round((waterConsumed / 3.0) * 100))}%
                    </div>
                    <div 
                      className="w-full bg-[#6068F0]/40 border-t border-[#6068F0]/60 animate-pulse" 
                      style={{ height: `${Math.min(100, Math.round((waterConsumed / 3.0) * 100))}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Habits & Weekly Performance grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Habit Heatmap (7 cols) */}
            <Card className={`${glassCardClass} md:col-span-7 p-6`}>
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-neutral-400 tracking-wider uppercase mb-6 flex items-center justify-between">
                <span>Habit Consistency</span>
                <span className="text-[10px] text-slate-400 dark:text-neutral-600 font-normal">Last 6 Months</span>
              </CardTitle>
              <div className="flex flex-col gap-1.5 overflow-x-auto pb-2">
                {renderHabitGrid()}
              </div>
            </Card>

            {/* Performance Chart (5 cols) */}
            <Card className={`${glassCardClass} md:col-span-5 p-6 flex flex-col justify-between`}>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-neutral-400 tracking-wider uppercase flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                  Weekly Performance
                </CardTitle>
                <p className="text-xs text-slate-400 dark:text-neutral-500">Average weekly workload index</p>
              </div>
              
              {/* Smooth Area Chart inside an SVG */}
              <div className="h-28 w-full mt-6 relative">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6068F0" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6068F0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Dynamic Area */}
                  <path 
                    d={areaD} 
                    fill="url(#chartGrad)" 
                    />
                  {/* Dynamic Stroke line */}
                  <path 
                    d={pathD} 
                    fill="transparent" 
                    stroke="#6068F0" 
                    strokeWidth="1.5" 
                  />
                </svg>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar Area (Columns 10-12) */}
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between h-full min-h-[calc(100vh-6rem)]">
          
          {/* Upcoming Tasks block */}
          <Card className={`${glassCardClass} p-6 flex-1 flex flex-col`}>
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between border-b border-slate-200 dark:border-white/10">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Upcoming Tasks</span>
              <button 
                onClick={() => setShowAddTodo(!showAddTodo)}
                className="h-7 w-7 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
              >
                {showAddTodo ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </CardHeader>
            <CardContent className="px-0 py-4 flex-1 space-y-4">
              {showAddTodo && (
                <form onSubmit={handleCreateTodoDashboard} className="flex gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-all">
                  <input 
                    type="text"
                    placeholder="Add task title..."
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs text-slate-800 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-neutral-500"
                    required
                    autoFocus
                  />
                  <Button type="submit" className="bg-[#6068F0] hover:bg-[#4d55d0] text-white text-[10px] px-3 py-1 h-auto rounded-lg">
                    Add
                  </Button>
                </form>
              )}

              {todoList.length > 0 ? (
                todoList.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => handleToggleTaskDashboard(task.id)}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-slate-300 dark:border-white/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#6068F0]">
                        <Check className="h-3 w-3 text-transparent group-hover:text-[#6068F0] transition-colors" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-neutral-200">{task.title}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold group-hover:hidden">Active</span>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setTodoList(prev => prev.filter(t => t.id !== task.id));
                          try {
                            await supabase.from("tasks").delete().eq("id", task.id);
                            setRefreshCounter(prev => prev + 1);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="hidden group-hover:flex h-5 w-5 text-slate-400 hover:text-red-500 rounded p-1 transition-all duration-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-neutral-500 italic text-center py-6">All tasks completed!</p>
              )}
            </CardContent>
          </Card>

          {/* AI Coach interactive Chat Widget */}
          <Card className={`${glassCardClass} border-[#6068F0]/20 bg-gradient-to-b from-slate-50 to-[#6068F0]/5 dark:from-[#0d0d0e]/60 dark:to-[#6068F0]/5 p-6 flex flex-col justify-between`}>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-[#6068F0]" />
                AI Coach Insight
              </CardTitle>
              <div className="relative bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-xl text-xs text-slate-600 dark:text-neutral-300 italic leading-relaxed">
                "{aiMessage}"
              </div>
            </div>
            
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask your coach..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSending || !userChatInput.trim()}
                className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 p-2 h-auto"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
