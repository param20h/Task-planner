"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar,
  Volume2,
  VolumeX,
  CheckCircle,
  FileText,
  X
} from "lucide-react";
import {
  CustomClockIcon,
  CustomStudyIcon
} from "@/components/ui/CustomIcons";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Select } from "@/components/ui/Select";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-slate-100/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";
const glassIconWrapperClass = "p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center";

type StudyLog = {
  id: string;
  subject: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
};

const FlipCard = ({ digit }: { digit: string }) => {
  return (
    <div className="relative w-11 h-16 xs:w-14 xs:h-20 sm:w-20 sm:h-30 md:w-24 md:h-36 bg-neutral-900 rounded-lg sm:rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-neutral-805 flex flex-col items-center justify-center overflow-hidden">
      {/* Top Half */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1b1b22] border-b border-black/40 flex items-end justify-center overflow-hidden">
        <span className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-[#A78BFA] leading-none translate-y-1/2 font-mono">
          {digit}
        </span>
      </div>
      {/* Bottom Half */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#121217] flex items-start justify-center overflow-hidden">
        <span className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-[#A78BFA] leading-none -translate-y-1/2 font-mono">
          {digit}
        </span>
      </div>
      {/* Center Divider Line */}
      <div className="absolute w-full h-[1px] sm:h-[1.5px] bg-black/90 top-1/2 left-0 z-10 shadow-sm" />
      {/* Shadow overlay for depth */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/5 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
};

export default function StudyPage() {
  const [profileId, setProfileId] = useState("");
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer states
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFlipMode, setIsFlipMode] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false);
  const [secondsStudiedToday, setSecondsStudiedToday] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load local state on boot (including persisted timer elapsed & daily accumulated focus seconds)
  useEffect(() => {
    const storedDate = localStorage.getItem("zenith_study_date");
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (storedDate === todayStr) {
      const storedSecs = localStorage.getItem("zenith_study_secs");
      if (storedSecs) {
        setSecondsStudiedToday(parseInt(storedSecs));
      }
      const storedElapsed = localStorage.getItem("zenith_study_elapsed");
      if (storedElapsed) {
        setSecondsElapsed(parseInt(storedElapsed));
      }
    } else {
      localStorage.setItem("zenith_study_date", todayStr);
      localStorage.setItem("zenith_study_secs", "0");
      localStorage.setItem("zenith_study_elapsed", "0");
      localStorage.removeItem("zenith_study_log_id");
    }
  }, []);

  const minutesStr = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
  const secondsStr = String(secondsElapsed % 60).padStart(2, "0");
  
  // Audio settings
  const [isTickMuted, setIsTickMuted] = useState(true);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  
  // Logger states
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");
  
  // Stats
  const [statsToday, setStatsToday] = useState(0);
  const [statsWeek, setStatsWeek] = useState(0);

  // References
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load session & study logs
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfileId(user.id);
          const studyLogs = await api.getStudyLogs();
          setLogs(studyLogs || []);
          calculateStats(studyLogs || []);
        }
      } catch (err) {
        console.error("Failed to load study logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const refreshLogs = async () => {
    try {
      const studyLogs = await api.getStudyLogs();
      setLogs(studyLogs || []);
      calculateStats(studyLogs || []);
    } catch (err) {
      console.error("Failed to refresh logs:", err);
    }
  };

  const calculateStats = (studyLogs: StudyLog[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    let minutesToday = 0;
    let minutesWeek = 0;

    studyLogs.forEach(log => {
      const logDate = new Date(log.created_at);
      if (logDate >= today) {
        minutesToday += log.duration_minutes;
      }
      if (logDate >= oneWeekAgo) {
        minutesWeek += log.duration_minutes;
      }
    });

    setStatsToday(minutesToday);
    setStatsWeek(minutesWeek);
  };

  // Metronome tick synthesizer
  const playTickSound = () => {
    if (isTickMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Audio context block bypass
    }
  };

  // Session complete chime synthesizer
  const playChimeSound = () => {
    if (isAlarmMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.3); // C5
      playTone(659.25, now + 0.2, 0.3); // E5
      playTone(783.99, now + 0.4, 0.5); // G5
    } catch (e) {
      console.warn("Audio Context not enabled:", e);
    }
  };

  // Timer tick effect with persistence & daily logging auto-sync (count-up session timer)
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        // Increment session elapsed seconds
        setSecondsElapsed(prev => {
          const nextElapsed = prev + 1;
          localStorage.setItem("zenith_study_elapsed", String(nextElapsed));
          return nextElapsed;
        });

        // Track and increment total accumulated focus seconds today
        setSecondsStudiedToday(secs => {
          const nextSecs = secs + 1;
          localStorage.setItem("zenith_study_secs", String(nextSecs));
          
          // Every 60 seconds (1 minute), auto-sync to Supabase daily log!
          if (nextSecs % 60 === 0) {
            const minutes = Math.floor(nextSecs / 60);
            syncDailyStudyLog(minutes);
          }
          
          return nextSecs;
        });

        playTickSound();
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, isTickMuted, profileId, subject]);

  const syncDailyStudyLog = async (minutes: number) => {
    if (!profileId) return;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const logId = localStorage.getItem("zenith_study_log_id");
    const activeSubject = subject.trim() || "Daily Focus";
    
    try {
      if (logId) {
        // Update existing daily log entry in Supabase
        await supabase
          .from("study_logs")
          .update({ 
            duration_minutes: minutes,
            notes: notes.trim() || "Consolidated daily focus log."
          })
          .eq("id", logId);
      } else {
        // Create new daily log entry for today
        const { data } = await supabase
          .from("study_logs")
          .insert({
            profile_id: profileId,
            subject: activeSubject,
            duration_minutes: minutes,
            notes: notes.trim() || "Consolidated daily focus log."
          })
          .select("id")
          .single();
          
        if (data?.id) {
          localStorage.setItem("zenith_study_log_id", data.id);
          localStorage.setItem("zenith_study_date", todayStr);
        }
      }
      refreshLogs();
    } catch (err) {
      console.error("Failed to auto-sync study log:", err);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    localStorage.setItem("zenith_study_elapsed", "0");
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      const minutes = Math.ceil(secondsStudiedToday / 60); // Save up to the current active minute when pausing
      if (minutes > 0) {
        syncDailyStudyLog(minutes);
      }
    } else {
      setIsRunning(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Create manual study log
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = subject.trim() || "Study";
    const duration = parseInt(manualMinutes);

    if (!finalSubject || isNaN(duration) || duration <= 0) return;

    try {
      await api.createStudyLog(finalSubject, duration, notes);
      setNotes("");
      setManualMinutes("");
      refreshLogs();
    } catch (err) {
      console.error("Manual study log error:", err);
      alert("Failed to save study log. Please try again.");
    }
  };

  // Delete study log
  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      await api.deleteStudyLog(id);
      refreshLogs();
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  // Calculate subject distribution dynamically from logged sessions
  const subjectTotals: Record<string, number> = {};

  logs.forEach(log => {
    const sub = log.subject?.trim() || "Other";
    subjectTotals[sub] = (subjectTotals[sub] || 0) + log.duration_minutes;
  });

  const activeSubjects = Object.entries(subjectTotals)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-slate-800 dark:text-neutral-300">
      
      {/* ── Header Spotlight Title ── */}
      <div className="relative">
        <Spotlight className="-top-40 left-10 text-[#A78BFA]" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <CustomStudyIcon className="h-8 w-8 text-[#A78BFA]" />
            Study Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider pl-1">
            Focus blocks, Pomodoro cycles, and structured learning metrics.
          </p>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className={glassCardClass}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className={glassIconWrapperClass}>
              <CustomClockIcon className="h-5 w-5 text-[#A78BFA]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Time Studied Today</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{statsToday} <span className="text-xs font-normal text-neutral-400">mins</span></h3>
            </div>
          </CardContent>
        </Card>
        <Card className={glassCardClass}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className={glassIconWrapperClass}>
              <Calendar className="h-5 w-5 text-[#F9A8D4]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Time Studied 7D</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{statsWeek} <span className="text-xs font-normal text-neutral-400">mins</span></h3>
            </div>
          </CardContent>
        </Card>
        <Card className={glassCardClass}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className={glassIconWrapperClass}>
              <CheckCircle className="h-5 w-5 text-[#FDBA74]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Logged Sessions</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{logs.length} <span className="text-xs font-normal text-neutral-400">entries</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Dashboard grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left pane: Pomodoro & Logging form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pomodoro Timer Widget */}
          <Card className={`${glassCardClass} p-6 flex flex-col items-center`}>
            <CardHeader className="w-full px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-6 flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CustomClockIcon className="h-4 w-4 text-[#A78BFA]" />
                Pomodoro Focus Timer
              </CardTitle>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsTickMuted(!isTickMuted)}
                  className={cn("p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5", !isTickMuted && "text-[#A78BFA] bg-[#A78BFA]/10")}
                  title={isTickMuted ? "Enable Metronome Sound" : "Mute Metronome"}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsFlipMode(true)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 transition-all flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider px-2.5"
                  title="Open Flip Screen Desk Timer"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A78BFA] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#A78BFA]"></span>
                  </span>
                  Desk Mode
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center w-full px-0">
              
              {/* Progress Circle & Timer Text */}
              <div className="relative h-56 w-56 flex items-center justify-center mb-8">
                {/* SVG Progress Circle Background */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle 
                    cx="112" 
                    cy="112" 
                    r="96" 
                    stroke="rgba(255,255,255,0.03)" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="112" 
                    cy="112" 
                    r="96" 
                    stroke="url(#purpleGradient)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={603}
                    strokeDashoffset={603 - (603 * (secondsElapsed % 3600)) / 3600}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#F9A8D4" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Timer text */}
                <div className="z-10 flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-wider">{formatTime(secondsElapsed)}</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 dark:text-neutral-500 mt-1">Elapsed</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 mb-2">
                <Button
                  onClick={handleToggleTimer}
                  className="bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/20 px-8 py-4 rounded-xl flex items-center gap-2"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button
                  onClick={handleResetTimer}
                  variant="outline"
                  className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400 px-6 py-4 rounded-xl flex items-center gap-2 bg-transparent hover:bg-white/5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Session Logger Form */}
          <Card className={`${glassCardClass} p-6 !overflow-visible`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#F9A8D4]" />
                Log Study Session
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider pl-1">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science, Mathematics"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider pl-1">Duration (Mins)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider pl-1">Topic / Notes</label>
                  <textarea
                    placeholder="What did you study during this block? (e.g. Double integration, async hooks)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black font-bold rounded-xl py-3.5 mt-2 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  Save Focus Log
                </button>
              </form>
            </CardContent>
          </Card>

        </div>

        {/* Right pane: Focus Analytics & Logs History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Learning Distribution */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#FDBA74]" />
                Subject Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2">
              {activeSubjects.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-500">No data logged yet</div>
              ) : (
                <div className="space-y-4">
                  {activeSubjects.map(([subName, mins]) => {
                    const percentage = Math.round((mins / statsWeek) * 100) || 0;
                    return (
                      <div key={subName} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-slate-700 dark:text-neutral-300">{subName}</span>
                          <span className="font-mono text-neutral-400 font-bold">{mins} mins ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-black/40 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                          <div 
                            className="bg-gradient-to-r from-[#A78BFA] to-[#FDBA74] h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past History Logs */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <CardTitle className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A78BFA]" />
                Session Logs History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2">
              {loading ? (
                <div className="text-center py-8 text-xs text-neutral-500 animate-pulse">Loading study data...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-500">No session logs found</div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                  {logs.map(log => {
                    const dateObj = new Date(log.created_at);
                    const formattedDate = dateObj.toLocaleDateString(undefined, { 
                      month: "short", 
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    
                    return (
                      <div 
                        key={log.id} 
                        className="bg-slate-50 dark:bg-black/25 border border-slate-200/50 dark:border-white/5 rounded-xl p-3.5 flex justify-between items-start gap-4 transition-all hover:bg-slate-100 dark:hover:bg-black/35"
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-800 dark:text-white">{log.subject}</span>
                            <span className="text-[10px] font-extrabold text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/15 px-2 py-0.5 rounded-full font-mono">{log.duration_minutes}m</span>
                          </div>
                          <span className="text-[9px] text-neutral-500 font-bold mt-1 uppercase tracking-wide">{formattedDate}</span>
                          {log.notes && (
                            <p className="text-[11px] text-neutral-450 dark:text-neutral-400 mt-2 italic break-words leading-relaxed border-l-2 border-slate-200 dark:border-white/10 pl-2">
                              {log.notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 hover:bg-red-500/10 rounded text-slate-400 dark:text-neutral-500 hover:text-red-400 shrink-0 self-center"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* ── Immersive Desk Focus Flip Mode (Body Portal) ── */}
      {isFlipMode && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#030303] text-white flex flex-col items-center justify-center p-4 select-none w-screen h-screen">
          
          {/* Close Button in Top Right */}
          <button
            onClick={() => setIsFlipMode(false)}
            className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-neutral-450 hover:text-white z-50 transition-all active:scale-95"
            title="Exit Focus Mode"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Active Flip Clock layout (Fully responsive on portrait/landscape) */}
          <div className="w-full flex flex-col items-center justify-center">
            
            {/* Screen Content - Pure Aesthetic Clock */}
            <div className="relative w-full max-w-3xl flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden">
              
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-[#A78BFA]/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

              {/* Flip Cards Grid */}
              <div className="flex items-center gap-2 sm:gap-6 scale-95 xs:scale-110 sm:scale-125 transition-all duration-300">
                <FlipCard digit={minutesStr[0]} />
                <FlipCard digit={minutesStr[1]} />
                
                {/* Glowing Colon */}
                <div className="flex flex-col gap-3 px-1 sm:px-4">
                  <span className={cn("w-2 h-2 sm:w-4 sm:h-4 bg-[#A78BFA] rounded-full shadow-[0_0_15px_#A78BFA] transition-opacity duration-500", isRunning && "animate-pulse")} />
                  <span className={cn("w-2 h-2 sm:w-4 sm:h-4 bg-[#A78BFA] rounded-full shadow-[0_0_15px_#A78BFA] transition-opacity duration-500", isRunning && "animate-pulse")} />
                </div>
                
                <FlipCard digit={secondsStr[0]} />
                <FlipCard digit={secondsStr[1]} />
              </div>
            </div>

            {/* Immersive Control Pad (Simple overlay) */}
            <div className="mt-12 flex items-center justify-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md max-w-xs w-full">
              <button
                onClick={handleToggleTimer}
                className="p-3 bg-[#A78BFA] text-black hover:bg-[#c084fc] rounded-xl transition-all shadow-md active:scale-95"
                title={isRunning ? "Pause Session" : "Start Session"}
              >
                {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <button
                onClick={handleResetTimer}
                className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-neutral-300 transition-all active:scale-95"
                title="Reset Focus Clock"
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsTickMuted(!isTickMuted)}
                className={cn(
                  "p-3 rounded-xl border transition-all active:scale-95",
                  !isTickMuted ? "bg-[#A78BFA]/25 border-[#A78BFA]/30 text-[#A78BFA]" : "bg-white/10 border-white/10 text-neutral-400"
                )}
                title={isTickMuted ? "Unmute Ticking" : "Mute Ticking"}
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>

          </div>
          
        </div>,
        document.body
      )}

    </div>
  );
}
