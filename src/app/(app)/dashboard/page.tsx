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
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// Responsive Glassmorphism Styles
const glassCardClass = "bg-[#0d0d0e]/60 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-[#6068F0]/30 hover:bg-[#111112]/70 hover:shadow-[0_20px_50px_rgba(96,104,240,0.15)]";
const glassIconWrapperClass = "p-2 bg-white/5 border border-white/10 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center";

const PROFILE_ID = "alex_chen";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Alex");
  const [groqKey, setGroqKey] = useState("");
  const [aiMessage, setAiMessage] = useState("Based on your focus, try a 20-minute meditation session now to boost productivity.");
  const [userChatInput, setUserChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Dynamic aggregates
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [workoutMinutes, setWorkoutMinutes] = useState(0);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [todoList, setTodoList] = useState<{ title: string; time: string }[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [contributionMap, setContributionMap] = useState<Record<string, number>>({});
  const [weeklyScores, setWeeklyScores] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    async function loadDashboardData() {
      let activeProfileId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeProfileId = user.id;
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
        // Fetch food
        const { data: foodData, error: foodError } = await supabase
          .from("food_logs")
          .select("calories, created_at")
          .eq("profile_id", activeProfileId);

        let totalCal = 0;
        if (foodData && !foodError && foodData.length > 0) {
          totalCal = foodData.reduce((sum, item) => sum + item.calories, 0);
        }
        setCaloriesConsumed(totalCal);

        // Fetch water
        const { data: waterData, error: waterError } = await supabase
          .from("water_logs")
          .select("amount_liters, created_at")
          .eq("profile_id", activeProfileId);

        let totalWater = 0;
        if (waterData && !waterError && waterData.length > 0) {
          totalWater = waterData.reduce((sum, item) => sum + Number(item.amount_liters), 0);
        }
        setWaterConsumed(Number(totalWater.toFixed(2)));

        // Fetch workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("gym_workouts")
          .select("id, start_time")
          .eq("profile_id", activeProfileId);

        let totalWorkoutsTime = 0;
        if (workoutsData && !workoutsError && workoutsData.length > 0) {
          totalWorkoutsTime = workoutsData.length * 45;
        }
        setWorkoutMinutes(totalWorkoutsTime);

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("title, status, created_at")
          .eq("profile_id", activeProfileId);

        let completedTasks = 0;
        let totalTasksCount = 0;

        if (tasksData && !tasksError) {
          totalTasksCount = tasksData.length;
          completedTasks = tasksData.filter(t => t.status === "completed").length;
          
          const activeTasks = tasksData.filter(t => t.status !== "completed").slice(0, 3);
          setTodoList(activeTasks.map(t => ({
            title: t.title,
            time: "45m"
          })));
        } else {
          setTodoList([]);
        }

        // Build contribution heatmap map from actual DB timestamps
        const dateMap: Record<string, number> = {};
        const addDate = (dateStr: string) => {
          if (!dateStr) return;
          const dateOnly = dateStr.split("T")[0]; // YYYY-MM-DD
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
          const dateStr = d.toISOString().split("T")[0];
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
  }, []);

  const getPerformancePath = () => {
    const maxVal = Math.max(...weeklyScores, 1);
    const coords = weeklyScores.map((score, idx) => {
      const x = (idx / 6) * 100;
      const y = 38 - (score / maxVal) * 33;
      return { x, y };
    });

    const pathD = coords.reduce((acc, coord, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)} `;
    }, "");

    const areaD = pathD + ` L 100 40 L 0 40 Z`;
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
              content: "You are Momentum AI, a premium personal productivity and health coach. Provide extremely concise, encouraging, and smart advice based on user metrics: 1850kcal food, 45min workout, 2.5L water, and 92% today's score."
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
        
        let colorClass = "bg-white/5"; // 0 logs
        if (count === 1) colorClass = "bg-[#6068F0]/30";
        if (count === 2) colorClass = "bg-[#6068F0]/60";
        if (count >= 3) colorClass = "bg-[#6068F0]";

        // If the date is in the future, render it slightly faded/empty
        if (cellDate > today) {
          colorClass = "bg-white/5 opacity-20";
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
          <span className="text-[10px] text-neutral-600 w-3 text-center">{days[r]}</span>
          <div className="flex gap-1.5">{rowCells}</div>
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* 3-Column Premium Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left + Mid Area (Columns 1-9) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Header Card */}
          <Card className={`${glassCardClass} py-6 px-8 border-none bg-gradient-to-r from-[#0d0d0e]/80 to-transparent`}>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Good Evening, <span className="text-[#6068F0]">{userName}</span>
            </h1>
            <p className="text-neutral-500 mt-2 text-base">Let's finish the day strong. Here's your overview.</p>
          </Card>

          {/* Core Analytics Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Today's Score Circle Chart (4 cols) */}
            <Card className={`${glassCardClass} md:col-span-5 flex flex-col items-center justify-center p-6 text-center`}>
              <CardTitle className="text-sm font-semibold text-neutral-400 tracking-wider uppercase mb-6">Today's Score</CardTitle>
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="96" cy="96" r="80" 
                    className="stroke-neutral-800" 
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
                  <span className="text-4xl font-extrabold text-white tracking-tight">{todayScore}%</span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Consistency</span>
                </div>
              </div>
            </Card>

            {/* Quick Metrics Grid (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Calories card */}
              <Card className={glassCardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Calories</span>
                  <Apple className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xl font-bold text-white">{caloriesConsumed.toLocaleString()}</div>
                  <div className="text-[10px] text-neutral-500">/ 2,500 kcal</div>
                  {/* Micro Bar Chart */}
                  <div className="flex items-end gap-1.5 h-12 mt-4">
                    {[35, 55, 45, 65, 80, 50, 74].map((h, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${h}%` }} 
                        className={`w-full rounded-t-sm ${i === 6 ? "bg-[#6068F0]" : "bg-neutral-800"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Workout card */}
              <Card className={glassCardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Workout</span>
                  <Dumbbell className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent className="pt-2 flex flex-col justify-between h-[calc(100%-3rem)]">
                  <div>
                    <div className="text-xl font-bold text-white">{workoutMinutes} MIN</div>
                    <div className="text-[10px] text-neutral-500">Active time</div>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl mt-6">
                    <Dumbbell className="h-6 w-6 text-[#6068F0] animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              {/* Water card */}
              <Card className={glassCardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Water</span>
                  <Droplet className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent className="pt-2 flex flex-col justify-between h-[calc(100%-3rem)]">
                  <div>
                    <div className="text-xl font-bold text-white">{waterConsumed} L</div>
                    <div className="text-[10px] text-neutral-500">/ 3.0 L goal</div>
                  </div>
                  <div className="relative h-14 w-full bg-white/5 rounded-xl border border-white/10 mt-4 overflow-hidden flex items-end">
                    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-xs font-bold text-white/80 z-10">
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
              <CardTitle className="text-sm font-semibold text-neutral-400 tracking-wider uppercase mb-6 flex items-center justify-between">
                <span>Habit Consistency</span>
                <span className="text-[10px] text-neutral-600 font-normal">Last 6 Months</span>
              </CardTitle>
              <div className="flex flex-col gap-1.5 overflow-x-auto pb-2">
                {renderHabitGrid()}
              </div>
            </Card>

            {/* Performance Chart (5 cols) */}
            <Card className={`${glassCardClass} md:col-span-5 p-6 flex flex-col justify-between`}>
              <div>
                <CardTitle className="text-sm font-semibold text-neutral-400 tracking-wider uppercase flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-neutral-500" />
                  Weekly Performance
                </CardTitle>
                <p className="text-xs text-neutral-500">Average weekly workload index</p>
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
            <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between border-b border-white/10">
              <span className="text-sm font-bold text-white tracking-wide">Upcoming Tasks</span>
              <Link 
                href="/planner"
                className="h-7 w-7 rounded-full text-neutral-400 hover:text-white flex items-center justify-center hover:bg-white/5 transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="px-0 py-4 flex-1 space-y-4">
              {todoList.length > 0 ? (
                todoList.map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#6068F0]" />
                      <span className="text-xs font-medium text-neutral-200">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-semibold">{task.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic text-center py-6">All tasks completed!</p>
              )}
            </CardContent>
          </Card>

          {/* AI Coach interactive Chat Widget */}
          <Card className={`${glassCardClass} border-[#6068F0]/20 bg-gradient-to-b from-[#0d0d0e]/60 to-[#6068F0]/5 p-6 flex flex-col justify-between`}>
            <div>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-[#6068F0]" />
                AI Coach Insight
              </CardTitle>
              <div className="relative bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-neutral-300 italic leading-relaxed">
                "{aiMessage}"
              </div>
            </div>
            
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask your coach..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSending || !userChatInput.trim()}
                className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 transition-all duration-300"
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
