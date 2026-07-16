"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { DatePicker, Label, DateField, Calendar } from "@/components/ui/DatePicker";

// Styling constants
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

export default function PlannerPage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [plannerTasks, setPlannerTasks] = useState<{ id: any; title: string; completed: boolean }[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<{ time: string; event: string; desc: string; duration: string }[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate()); 
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Modal tabs & form state
  const [addMode, setAddMode] = useState<"task" | "event">("task");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [eventTimeSlot, setEventTimeSlot] = useState("09:00 AM");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDuration, setEventDuration] = useState("1h 00m");
  const [eventDay, setEventDay] = useState(new Date().getDate());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventDatePickerValue, setEventDatePickerValue] = useState<Date | null>(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    setEventDay(selectedDay);
    setEventDatePickerValue(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay));
  }, [selectedDay, currentDate]);

  // Load session user and load data
  useEffect(() => {
    async function loadSession() {
      let activeId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeId = user.id;
          setProfileId(user.id);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      }
      await loadPlannerData(activeId);
    }
    loadSession();
  }, [selectedDay]);

  const loadPlannerData = async (uid: string) => {
    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, status")
        .eq("profile_id", uid);

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
        .eq("profile_id", uid)
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
  };

  const toggleTask = async (id: any) => {
    const task = plannerTasks.find(t => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;

    setPlannerTasks(plannerTasks.map(t => t.id === id ? { ...t, completed: nextCompleted } : t));

    try {
      await supabase
        .from("tasks")
        .update({ 
          status: nextCompleted ? "completed" : "pending",
          completed_at: nextCompleted ? new Date().toISOString() : null
        })
        .eq("id", id);
    } catch (err) {
      console.error("Failed to toggle task in Supabase:", err);
    }
  };

  const deleteTask = async (id: any) => {
    setPlannerTasks(prev => prev.filter(t => t.id !== id));
    try {
      await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
    } catch (err) {
      console.error("Failed to delete task in Supabase:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (addMode === "task") {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            profile_id: profileId,
            title: newTaskTitle,
            status: "pending"
          })
          .select()
          .single();

        if (data && !error) {
          setPlannerTasks(prev => [
            ...prev,
            { id: data.id, title: data.title, completed: false }
          ]);
        }
      } catch (err) {
        console.error("Failed to add task to Supabase:", err);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from("planner_events")
          .insert({
            profile_id: profileId,
            time_slot: eventTimeSlot,
            event_title: newTaskTitle,
            description: eventDesc,
            duration: eventDuration,
            day_date: eventDay
          })
          .select()
          .single();

        if (data && !error) {
          if (eventDay === selectedDay) {
            setScheduleSlots(prev => [
              ...prev,
              {
                time: data.time_slot,
                event: data.event_title,
                desc: data.description || "",
                duration: data.duration || ""
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to schedule planner event:", err);
      }
    }

    setNewTaskTitle("");
    setEventDesc("");
    setShowAddModal(false);
  };

  // Generate responsive week day labels (matching static Oct 28 - Nov 3 format)
  const getWeekDays = () => {
    const daysList = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 6 = Sat
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((currentDay + 6) % 7)); // Force Mon start
    
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      daysList.push({
        name: dayNames[i],
        date: d.getDate()
      });
    }
    return daysList;
  };
  const days = getWeekDays();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Compute current week label dynamically
  const getWeeklyFocusLabel = () => {
    const today = new Date();
    const day = today.getDay();
    const mon = new Date(today);
    mon.setDate(today.getDate() - ((day + 6) % 7));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Weekly Focus: ${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
  };
  const weeklyFocusLabel = getWeeklyFocusLabel();
  const currentMonthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayDate = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Main Planner Grid (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Header Card */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0d0d0e]/80 dark:to-transparent border border-slate-200 dark:border-white/10 rounded-xl">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {weeklyFocusLabel}
              </h1>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Plan your sprint, align with tasks, track daily score.</p>
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
          <div className="grid grid-cols-7 gap-1.5 sm:gap-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-6 rounded-2xl backdrop-blur-xl">
            {days.map((day, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedDay(day.date)}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 px-1 sm:p-3 rounded-2xl cursor-pointer transition-all duration-300 border",
                  selectedDay === day.date 
                    ? "bg-[#6068F0]/15 border-[#6068F0]/35 text-[#6068F0] dark:text-white shadow-md shadow-[#6068F0]/5" 
                    : "bg-transparent border-transparent hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-neutral-450"
                )}
              >
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center w-full block">{day.name}</span>
                <span className="text-base sm:text-lg font-black mt-1.5 sm:mt-2 text-center w-full block">{day.date}</span>
              </div>
            ))}

            {/* Timetable view representing dynamic days items */}
            <div className="col-span-7 mt-6 space-y-4">
              <div className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 dark:border-white/5">
                Active Timeline — day {selectedDay}
              </div>
              
              {scheduleSlots.length > 0 ? (
                scheduleSlots.map((slot, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-6 p-4 rounded-xl bg-white dark:bg-[#0d0d0e]/60 border border-slate-200 dark:border-white/5 hover:border-[#6068F0]/30 hover:bg-slate-50 dark:hover:bg-[#111112]/80 transition-all duration-300 shadow-sm"
                  >
                    <span className="text-xs font-semibold text-[#6068F0] w-16">{slot.time}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{slot.event}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">{slot.desc}</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400">{slot.duration}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-neutral-500 italic py-6 text-center">No schedule events logged for this day. Click Quick Add to log one!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area (3 cols) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Priority Checklist */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Priority List</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              {plannerTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-4 w-4 rounded border border-slate-300 dark:border-white/30 flex items-center justify-center transition-all duration-300",
                      task.completed ? "bg-[#6068F0] border-[#6068F0]" : ""
                    )}>
                      {task.completed && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                    </div>
                    <span className={cn(
                      "text-xs font-medium transition-all duration-300",
                      task.completed ? "line-through text-slate-400 dark:text-neutral-600" : "text-slate-700 dark:text-neutral-200"
                    )}>
                      {task.title}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg p-1 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mini Calendar Card */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4 flex flex-row items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{currentMonthLabel}</span>
              <div className="flex gap-1">
                <Button onClick={handlePrevMonth} size="icon" variant="ghost" className="h-6 w-6 rounded-full text-slate-400 dark:text-neutral-400"><ChevronLeft className="h-3 w-3" /></Button>
                <Button onClick={handleNextMonth} size="icon" variant="ghost" className="h-6 w-6 rounded-full text-slate-400 dark:text-neutral-400"><ChevronRight className="h-3 w-3" /></Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-7 gap-y-2 text-center text-[10px]">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
                  <span key={i} className="text-slate-400 dark:text-neutral-600 font-semibold">{day}</span>
                ))}
                {Array.from({ length: calendarOffset }).map((_, i) => (
                  <span key={i} />
                ))}
                {calendarDays.map((d) => (
                  <span 
                    key={d} 
                    onClick={() => setSelectedDay(d)}
                    className={cn(
                      "w-6 h-6 flex items-center justify-center mx-auto rounded-full cursor-pointer transition-all duration-300",
                      d === selectedDay 
                        ? "bg-[#6068F0] text-white font-bold" 
                        : d === todayDate && isCurrentMonth
                          ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold" 
                          : "text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5"
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
          <Card className="bg-white dark:bg-[#0d0d0e] border border-slate-200 dark:border-white/10 p-6 w-full max-w-md shadow-2xl rounded-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Add Planner item</h3>
            
            {/* Modal tab selector */}
            <div className="flex bg-slate-100 dark:bg-black/60 p-1 rounded-xl mb-4 border border-slate-200 dark:border-white/5">
              <button 
                type="button"
                onClick={() => setAddMode("task")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-300",
                  addMode === "task" ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200"
                )}
              >
                📝 Task
              </button>
              <button 
                type="button"
                onClick={() => setAddMode("event")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-300",
                  addMode === "event" ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200"
                )}
              >
                ⏰ Timeline Event
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Title</label>
                <input 
                  type="text" 
                  placeholder={addMode === "task" ? "e.g. Wrap up marketing mockup" : "e.g. Synchronization Meeting"} 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                  required
                  autoFocus
                />
              </div>

              {addMode === "event" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Time Slot</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 09:00 AM" 
                        value={eventTimeSlot}
                        onChange={(e) => setEventTimeSlot(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Duration</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1h 30m" 
                        value={eventDuration}
                        onChange={(e) => setEventDuration(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      placeholder="e.g. Scope project details and targets" 
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <DatePicker 
                      value={eventDatePickerValue} 
                      onChange={(date) => {
                        if (date) {
                          setEventDatePickerValue(date);
                          setEventDay(date.getDate());
                        }
                      }}
                    >
                      <Label>Date / Day</Label>
                      <DateField.Group fullWidth>
                        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger>
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover className="w-68">
                        <Calendar aria-label="Event date">
                          <Calendar.Header>
                            <Calendar.YearPickerTrigger />
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                          </Calendar.Header>
                          <Calendar.Grid>
                            <Calendar.GridHeader>
                              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                          </Calendar.Grid>
                        </Calendar>
                      </DatePicker.Popover>
                    </DatePicker>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20"
                >
                  {addMode === "task" ? "Add Task" : "Schedule Event"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
