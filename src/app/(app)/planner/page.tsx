"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-[#0d0d0e]/60 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-white/15";
const glassIconWrapperClass = "p-2 bg-white/5 border border-white/10 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center";

const PROFILE_ID = "alex_chen";

export default function PlannerPage() {
  const [plannerTasks, setPlannerTasks] = useState<{ id: any; title: string; completed: boolean }[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<{ time: string; event: string; desc: string; duration: string }[]>([]);
  const [selectedDay, setSelectedDay] = useState(29); // Mon 28 to Sun 03
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("id, title, status")
          .eq("profile_id", PROFILE_ID);

        if (tasksData && !tasksError) {
          setPlannerTasks(tasksData.map(t => ({
            id: t.id,
            title: t.title,
            completed: t.status === "completed"
          })));
        }

        // Fetch planner events for selected day
        const { data: eventsData, error: eventsError } = await supabase
          .from("planner_events")
          .select("time_slot, event_title, description, duration")
          .eq("profile_id", PROFILE_ID)
          .eq("day_date", selectedDay);

        if (eventsData && !eventsError && eventsData.length > 0) {
          setScheduleSlots(eventsData.map(e => ({
            time: e.time_slot,
            event: e.event_title,
            desc: e.description || "",
            duration: e.duration || ""
          })));
        } else {
          setScheduleSlots([]);
        }
      } catch (err) {
        console.error("Failed to load planner data:", err);
      }
    }
    loadData();
  }, [selectedDay]);

  const toggleTask = async (id: any) => {
    const task = plannerTasks.find(t => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;

    setPlannerTasks(plannerTasks.map(t => t.id === id ? { ...t, completed: nextCompleted } : t));

    try {
      await supabase
        .from("tasks")
        .update({ status: nextCompleted ? "completed" : "pending" })
        .eq("id", id);
    } catch (err) {
      console.error("Failed to toggle task in Supabase:", err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          profile_id: PROFILE_ID,
          title: newTaskTitle,
          status: "pending"
        })
        .select()
        .single();

      if (data && !error) {
        setPlannerTasks([
          ...plannerTasks,
          { id: data.id, title: data.title, completed: false }
        ]);
      }
    } catch (err) {
      console.error("Failed to add task to Supabase:", err);
    }

    setNewTaskTitle("");
    setShowAddModal(false);
  };

  const days = [
    { name: "Mon", date: 28 },
    { name: "Tue", date: 29 },
    { name: "Wed", date: 30 },
    { name: "Thu", date: 31 },
    { name: "Fri", date: 1 },
    { name: "Sat", date: 2 },
    { name: "Sun", date: 3 }
  ];

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Main Planner Grid (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Header Card */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#0d0d0e]/80 to-transparent border border-white/10 rounded-xl">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Weekly Focus: Oct 28 - Nov 3, 2024
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Plan your sprint, align with tasks, track daily score.</p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center gap-2 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </Button>
          </div>

          {/* Schedule Board */}
          <div className="grid grid-cols-7 gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
            {days.map((day, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedDay(day.date)}
                className={cn(
                  "flex flex-col items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent",
                  selectedDay === day.date 
                    ? "bg-[#6068F0]/20 border-[#6068F0]/40 text-white shadow-lg shadow-[#6068F0]/5" 
                    : "hover:bg-white/5 text-neutral-400"
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">{day.name}</span>
                <span className="text-lg font-bold mt-2">{day.date}</span>
              </div>
            ))}

            {/* Timetable view representing dynamic days items */}
            <div className="col-span-7 mt-6 space-y-4">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 pb-1 border-b border-white/5">
                Active Timeline for Oct {selectedDay}
              </div>
              
              {scheduleSlots.length > 0 ? (
                scheduleSlots.map((slot, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-6 p-4 rounded-xl bg-[#0d0d0e]/60 border border-white/5 hover:border-[#6068F0]/30 hover:bg-[#111112]/80 transition-all duration-300 shadow-inner"
                  >
                    <span className="text-xs font-semibold text-[#6068F0] w-16">{slot.time}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{slot.event}</h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{slot.desc}</p>
                    </div>
                    <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-full border border-white/10 text-neutral-400">{slot.duration}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic py-6 text-center">No schedule events logged for this day.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area (3 cols) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Priority Checklist */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-white/10 mb-4">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Priority List</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              {plannerTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300"
                >
                  <div className={cn(
                    "h-4 w-4 rounded border border-white/30 flex items-center justify-center transition-all duration-300",
                    task.completed ? "bg-[#6068F0] border-[#6068F0]" : ""
                  )}>
                    {task.completed && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-all duration-300",
                    task.completed ? "line-through text-neutral-600" : "text-neutral-200"
                  )}>
                    {task.title}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mini Calendar Card */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-white/10 mb-4 flex flex-row items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">October 2024</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-neutral-400"><ChevronLeft className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-neutral-400"><ChevronRight className="h-3 w-3" /></Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-7 gap-y-2 text-center text-[10px]">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
                  <span key={i} className="text-neutral-600 font-semibold">{day}</span>
                ))}
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={i} />
                ))}
                {calendarDays.map((d) => (
                  <span 
                    key={d} 
                    className={cn(
                      "w-6 h-6 flex items-center justify-center mx-auto rounded-full cursor-pointer hover:bg-white/10 transition-all duration-300",
                      d === 29 ? "bg-[#6068F0] text-white font-bold" : "text-neutral-400"
                    )}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="bg-[#0d0d0e] border border-white/10 p-6 w-full max-w-md shadow-2xl rounded-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Add Weekly Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input 
                type="text" 
                placeholder="Task title..." 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#6068F0] hover:bg-[#4d55d0] text-white"
                >
                  Add Task
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
