"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flag, Calendar, Brain, Plus } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

// Styling constants
const glassCardClass = "bg-white/70 dark:bg-[#0d0d0e]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";
const glassIconWrapperClass = "p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center";

const PROFILE_ID = "alex_chen";

export default function GoalsPage() {
  const [objectives, setObjectives] = useState([
    { title: "Launch Product V2", percent: 85, days: "24d 12h 45m remaining", milestone: "Beta Testing - Due Oct 15" },
    { title: "Achieve 10k Active Users", percent: 62, days: "45d 08h 20m remaining", milestone: "Marketing Campaign - Due Nov 5" },
    { title: "Secure Series A Funding", percent: 30, days: "90d 16h 10m remaining", milestone: "Investor Pitch Deck - Due Dec 20" }
  ]);

  const [allGoals, setAllGoals] = useState<{ title: string; cat: string; progress: number; val: string; status: any }[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; desc: string }[]>([]);

  useEffect(() => {
    async function loadGoals() {
      try {
        const { data, error } = await supabase
          .from("goals")
          .select("id, title, category, progress, value_label, status")
          .eq("profile_id", PROFILE_ID);

        if (data && !error && data.length > 0) {
          setAllGoals(data.map(g => ({
            title: g.title,
            cat: g.category || "",
            progress: g.progress || 0,
            val: g.value_label || "",
            status: g.status
          })));
        } else {
          setAllGoals([]);
        }

        // Fetch milestone timeline
        setTimeline([
          { date: "Oct 15", desc: "Product Beta Testing" },
          { date: "Nov 5", desc: "Marketing Campaign Launch" },
          { date: "Dec 20", desc: "Investor Pitch Deck Final" }
        ]);

      } catch (err) {
        console.error("Failed to load goals:", err);
      }
    }
    loadGoals();
  }, []);

  const handleAddGoal = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          profile_id: PROFILE_ID,
          title: "Complete NextJS Course",
          category: "Skills",
          progress: 100,
          value_label: "12 / 12 Modules",
          status: "Completed"
        })
        .select()
        .single();

      if (data && !error) {
        setAllGoals(prev => [
          ...prev,
          {
            title: data.title,
            cat: data.category || "",
            progress: data.progress || 0,
            val: data.value_label || "",
            status: data.status
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to insert goal:", err);
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Header Panel */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-[#0d0d0e]/80 to-transparent border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Target className="h-7 w-7 text-[#6068F0]" />
            Objectives & Goals
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Set long term OKRs, track key indicators, view timeline milestones.</p>
        </div>
        <Button 
          onClick={handleAddGoal}
          className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center gap-2 px-5 py-2.5 transition-all duration-300 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Main OKR Board (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Top 3 Objectives Large Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {objectives.map((obj, i) => (
              <Card key={i} className={glassCardClass}>
                <CardContent className="p-6 space-y-6 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Key Objective {i + 1}</span>
                    <h4 className="text-sm font-bold text-white leading-snug">{obj.title}</h4>
                  </div>
                  
                  {/* Progress circular indicator */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" className="stroke-neutral-800" strokeWidth="4" fill="transparent" />
                        <circle 
                          cx="32" cy="32" r="26" 
                          className="stroke-[#6068F0]" 
                          strokeWidth="5" 
                          strokeDasharray={163.28}
                          strokeDashoffset={163.28 - (163.28 * obj.percent) / 100}
                          strokeLinecap="round"
                          fill="transparent" 
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-white">{obj.percent}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-medium block">{obj.days}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[9px] text-neutral-500 block">Next Milestone:</span>
                    <span className="text-[10px] font-semibold text-neutral-300 mt-0.5 block">{obj.milestone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Goals List Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider pl-1">All Goals</h3>
            
            {allGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allGoals.map((goal, idx) => (
                  <Card key={idx} className={glassCardClass}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-[#6068F0] uppercase tracking-wider">{goal.cat}</span>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full border",
                          goal.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          goal.status === "Behind" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                          "bg-[#6068F0]/10 border-[#6068F0]/20 text-[#6068F0]"
                        )}>{goal.status}</span>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-white">{goal.title}</h5>
                        <span className="text-[10px] text-neutral-500 mt-1 block">{goal.val}</span>
                      </div>

                      <div className="space-y-1 pt-2">
                        {/* Mini sparkline or progress bar */}
                        <div className="h-1.5 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              goal.status === "Completed" ? "bg-emerald-500" : "bg-[#6068F0]"
                            )} 
                            style={{ width: `${goal.progress}%` }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className={`${glassCardClass} p-8 text-center`}>
                <p className="text-xs text-neutral-500 italic">No goals tracked. Click Add Goal above to log your first target!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Timeline & Insights Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between h-full min-h-[calc(100vh-14rem)]">
          
          {/* Milestone Timeline */}
          <Card className={`${glassCardClass} p-6 flex-1`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-white/10 mb-4">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Milestone Timeline</span>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              {timeline.map((milestone, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Timeline vertical dot/line */}
                  <div className="flex flex-col items-center">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-[#6068F0] bg-black z-10" />
                    {i !== timeline.length - 1 && <div className="w-[1.5px] h-12 bg-white/10 mt-1" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">{milestone.date}</span>
                    <span className="text-xs font-semibold text-neutral-200 mt-1 block">{milestone.desc}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Goal AI Insights */}
          <Card className={`${glassCardClass} p-6 border-[#6068F0]/20 bg-gradient-to-b from-[#0d0d0e]/60 to-[#6068F0]/5`}>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-[#6068F0]" />
              Goal AI Insights
            </CardTitle>
            <p className="text-xs text-neutral-400 italic leading-relaxed">
              "Add your OKRs and habits goals above. Once you begin logging tasks, AI will evaluate cognitive performance, scheduling recommendations, and study-blocks advice."
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
