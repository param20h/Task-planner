"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Brain, Plus, Trash2, X } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

// Styling constants
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

export default function GoalsPage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [objectives, setObjectives] = useState([
    { title: "Launch Product V2", percent: 85, days: "24d 12h remaining", milestone: "Beta Testing - Oct 15" },
    { title: "Achieve 10k Active Users", percent: 62, days: "45d 08h remaining", milestone: "Marketing Campaign - Nov 5" },
    { title: "Secure Series A Funding", percent: 30, days: "90d 16h remaining", milestone: "Investor Pitch Deck - Dec 20" }
  ]);

  const [allGoals, setAllGoals] = useState<{ id: string; title: string; cat: string; progress: number; val: string; status: string }[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; desc: string }[]>([]);

  // Add goal modal states
  const [showModal, setShowModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("Skills");
  const [goalValueLabel, setGoalValueLabel] = useState("");
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalStatus, setGoalStatus] = useState("In Progress");

  // Load user session and fetch goals
  useEffect(() => {
    async function loadGoalsData() {
      let activeId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeId = user.id;
          setProfileId(user.id);
        }
      } catch (err) {
        console.error("Failed to fetch auth user:", err);
      }

      await loadGoals(activeId);
    }
    loadGoalsData();
  }, []);

  const loadGoals = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("id, title, category, progress, value_label, status")
        .eq("profile_id", uid);

      if (data && !error) {
        setAllGoals(data.map(g => ({
          id: g.id,
          title: g.title,
          cat: g.category || "",
          progress: g.progress || 0,
          val: g.value_label || "",
          status: g.status || "In Progress"
        })));

        // Load dynamic milestones from database based on user's active goals
        const goalIds = data.map(g => g.id);
        if (goalIds.length > 0) {
          const { data: milestonesData, error: milestonesError } = await supabase
            .from("milestones")
            .select("description, due_date")
            .in("goal_id", goalIds)
            .order("created_at", { ascending: true });

          if (milestonesData && !milestonesError && milestonesData.length > 0) {
            setTimeline(milestonesData.map(m => ({
              date: m.due_date || "TBD",
              desc: m.description
            })));
          } else {
            setDefaultTimeline();
          }
        } else {
          setDefaultTimeline();
        }
      } else {
        setAllGoals([]);
        setDefaultTimeline();
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
      setDefaultTimeline();
    }
  };

  const setDefaultTimeline = () => {
    setTimeline([
      { date: "Oct 15", desc: "Product Beta Testing" },
      { date: "Nov 5", desc: "Marketing Campaign Launch" },
      { date: "Dec 20", desc: "Investor Pitch Deck Final" }
    ]);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          profile_id: profileId,
          title: goalTitle,
          category: goalCategory,
          progress: goalProgress,
          value_label: goalValueLabel || `${goalProgress}% completed`,
          status: goalStatus
        })
        .select()
        .single();

      if (data && !error) {
        setAllGoals(prev => [
          ...prev,
          {
            id: data.id,
            title: data.title,
            cat: data.category || "",
            progress: data.progress || 0,
            val: data.value_label || "",
            status: data.status || "In Progress"
          }
        ]);
        
        // Add a default milestone for the newly created goal
        await supabase
          .from("milestones")
          .insert({
            goal_id: data.id,
            description: `Complete focus targets for "${data.title}"`,
            due_date: "In 30d"
          });

        await loadGoals(profileId);
      }
    } catch (err) {
      console.error("Failed to insert goal:", err);
    }

    setGoalTitle("");
    setGoalValueLabel("");
    setGoalProgress(0);
    setGoalStatus("In Progress");
    setShowModal(false);
  };

  const handleUpdateProgress = async (id: string, progressVal: number) => {
    const statusVal = progressVal === 100 ? "Completed" : "In Progress";
    
    // Update local state
    setAllGoals(prev => prev.map(g => g.id === id ? { ...g, progress: progressVal, status: statusVal, val: `${progressVal}% completed` } : g));

    try {
      await supabase
        .from("goals")
        .update({
          progress: progressVal,
          status: statusVal,
          value_label: `${progressVal}% completed`
        })
        .eq("id", id);
    } catch (err) {
      console.error("Failed to update goal progress:", err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    // Update local state
    setAllGoals(prev => prev.filter(g => g.id !== id));

    try {
      await supabase
        .from("goals")
        .delete()
        .eq("id", id);
      
      await loadGoals(profileId);
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Header Panel */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0d0d0e]/80 dark:to-transparent border border-slate-200 dark:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Target className="h-7 w-7 text-[#6068F0]" />
            Objectives & Goals
          </h1>
          <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Set long term OKRs, track key indicators, view timeline milestones.</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
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
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">Key Objective {i + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{obj.title}</h4>
                  </div>
                  
                  {/* Progress circular indicator */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-200 dark:text-neutral-800" strokeWidth="4" fill="transparent" />
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
                      <span className="absolute text-xs font-bold text-slate-900 dark:text-white">{obj.percent}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium block">{obj.days}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[9px] text-slate-400 dark:text-neutral-500 block">Next Milestone:</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-neutral-300 mt-0.5 block">{obj.milestone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Goals List Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1">All Goals</h3>
            
            {allGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allGoals.map((goal, idx) => (
                  <Card key={goal.id} className={glassCardClass}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-[#6068F0] uppercase tracking-wider">{goal.cat}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded-full border",
                            goal.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            goal.status === "Behind" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                            "bg-[#6068F0]/10 border-[#6068F0]/20 text-[#6068F0]"
                          )}>{goal.status}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="h-6 w-6 text-slate-400 hover:text-red-400 rounded-full"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{goal.title}</h5>
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">{goal.val}</span>
                      </div>

                      {/* Interactive Progress Slider */}
                      <div className="space-y-2 pt-2">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              goal.status === "Completed" ? "bg-emerald-500" : "bg-[#6068F0]"
                            )} 
                            style={{ width: `${goal.progress}%` }} 
                          />
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                          className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#6068F0]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className={`${glassCardClass} p-8 text-center`}>
                <p className="text-xs text-slate-400 dark:text-neutral-500 italic">No goals tracked. Click Add Goal above to log your first target!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Timeline & Insights Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between h-full min-h-[calc(100vh-14rem)]">
          
          {/* Milestone Timeline */}
          <Card className={`${glassCardClass} p-6 flex-1`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Milestone Timeline</span>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              {timeline.map((milestone, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Timeline vertical dot/line */}
                  <div className="flex flex-col items-center">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-[#6068F0] bg-white dark:bg-black z-10" />
                    {i !== timeline.length - 1 && <div className="w-[1.5px] h-12 bg-slate-200 dark:bg-white/10 mt-1" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">{milestone.date}</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200 mt-1 block leading-snug">{milestone.desc}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Goal AI Insights */}
          <Card className={`${glassCardClass} p-6 border-[#6068F0]/20 bg-gradient-to-b from-slate-50 to-[#6068F0]/5 dark:from-[#0d0d0e]/60 dark:to-[#6068F0]/5`}>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-[#6068F0]" />
              Goal AI Insights
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-neutral-400 italic leading-relaxed">
              "Keep your goals updated in real time. Your progress rate dynamically shapes your AI Coach workspace suggestions and weekly performance reports."
            </p>
          </Card>
        </div>
      </div>

      {/* Create Goal Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="bg-white dark:bg-[#0d0d0e] border border-slate-200 dark:border-white/10 p-6 w-full max-w-md shadow-2xl rounded-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Create New Goal</h3>
            
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Goal Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Save $10k, Read 20 books" 
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Category</label>
                  <select 
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                  >
                    {["Career", "Health", "Personal", "Finance", "Skills", "Habits"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Value Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5 / 10 Completed" 
                    value={goalValueLabel}
                    onChange={(e) => setGoalValueLabel(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                  <span>Initial Progress</span>
                  <span className="text-[#6068F0]">{goalProgress}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#6068F0]"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  className="border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20"
                >
                  Save Goal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
