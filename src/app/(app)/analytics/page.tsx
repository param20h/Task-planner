"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart2, Calendar, Target, Activity } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-white/70 dark:bg-[#0d0d0e]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

const PROFILE_ID = "alex_chen";

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("7D");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(4);
  const [focusHours, setFocusHours] = useState(12.2);

  const ranges = ["1D", "7D", "1M", "1Y", "All"];

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("gym_workouts")
          .select("id")
          .eq("profile_id", PROFILE_ID);

        if (workoutsData && !workoutsError) {
          setWeeklyWorkouts(workoutsData.length || 4);
        }

        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("id")
          .eq("profile_id", PROFILE_ID)
          .eq("status", "completed");

        if (tasksData && !tasksError) {
          setFocusHours(Number((tasksData.length * 1.5).toFixed(1)) || 12.2);
        }
      } catch (err) {
        console.error("Failed to load analytics aggregates:", err);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Header Panel */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gradient-to-r from-[#0d0d0e]/80 to-transparent border border-white/10 rounded-xl gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <LineChart className="h-7 w-7 text-[#6068F0]" />
            Performance Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Deep analysis of health, task completion, and habits consistency.</p>
        </div>

        {/* Range Selector Pill - exactly like the iOS segmented control reference */}
        <div className="flex items-center p-1 bg-[#1C1C1E] border border-white/5 rounded-full shadow-inner max-w-max self-start md:self-auto">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                selectedRange === range 
                  ? "bg-[#3A3A3C] text-white shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Weekly Progress Overviews */}
        <Card className={`${glassCardClass} p-6`}>
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-neutral-400" />
              Focus & Productivity index
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-56 flex items-end">
            {/* SVG line chart */}
            <div className="w-full h-[85%] relative">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6068F0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6068F0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 38 Q 20 20 40 30 T 70 12 T 100 4 L 100 40 L 0 40 Z" fill="url(#focusGrad)" />
                <path d="M 0 38 Q 20 20 40 30 T 70 12 T 100 4" fill="transparent" stroke="#6068F0" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Weekly calories comparison */}
        <Card className={`${glassCardClass} p-6`}>
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-neutral-400" />
              Daily Active Calorie Burn
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-56 flex items-end justify-around gap-2 mt-4">
            {[350, 480, 290, 520, 600, 400, 310].map((val, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <span className="text-[9px] text-[#6068F0] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-1">{val}</span>
                <div 
                  style={{ height: `${(val / 700) * 80}%` }} 
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-500",
                    i === 4 ? "bg-[#D946EF]" : "bg-[#6068F0]/40 group-hover:bg-[#6068F0]"
                  )}
                />
                <span className="text-[10px] text-neutral-600 font-semibold mt-2">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][i]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Total Score Radar metric equivalent representation */}
        <Card className={`${glassCardClass} p-6 md:col-span-2 flex flex-col md:flex-row items-center justify-around gap-6`}>
          <div className="space-y-4 max-w-sm">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-neutral-400" />
              Consistency Insights
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your focus and workout scores have remained highly synced this week. You scored an average of <span className="text-white font-bold">92%</span> in habit consistency, primarily driven by early morning hydration and solid training blocks.
            </p>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Average Sleep</span>
              <span className="text-2xl font-extrabold text-white">7.5 h</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Weekly Workouts</span>
              <span className="text-2xl font-extrabold text-white">{weeklyWorkouts} Sessions</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Deep Focus Total</span>
              <span className="text-2xl font-extrabold text-white">{focusHours} h</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
