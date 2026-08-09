"use client";

import { useState, useEffect, useRef } from "react";
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
    <div className="relative w-14 h-20 sm:w-20 sm:h-30 md:w-24 md:h-36 bg-neutral-900 rounded-xl sm:rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-neutral-805 flex flex-col items-center justify-center overflow-hidden">
      {/* Top Half */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1b1b22] border-b border-black/40 flex items-end justify-center overflow-hidden">
        <span className="text-4xl sm:text-5xl md:text-6xl font-black text-[#A78BFA] leading-none translate-y-1/2 font-mono">
          {digit}
        </span>
      </div>
      {/* Bottom Half */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#121217] flex items-start justify-center overflow-hidden">
        <span className="text-4xl sm:text-5xl md:text-6xl font-black text-[#A78BFA] leading-none -translate-y-1/2 font-mono">
          {digit}
        </span>
      </div>
      {/* Center Divider Line */}
      <div className="absolute w-full h-[1.5px] bg-black/90 top-1/2 left-0 z-10 shadow-sm" />
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
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins default
  const [timerDuration, setTimerDuration] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"pomodoro" | "long" | "short" | "custom">("pomodoro");
  const [isFlipMode, setIsFlipMode] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false);
  const [secondsStudiedToday, setSecondsStudiedToday] = useState(0);

  // Load local state on boot (including persisted timer state & daily accumulated focus seconds)
  useEffect(() => {
    const storedDate = localStorage.getItem("zenith_study_date");
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (storedDate === todayStr) {
      const storedSecs = localStorage.getItem("zenith_study_secs");
      if (storedSecs) {
        setSecondsStudiedToday(parseInt(storedSecs));
      }
      const storedTimeLeft = localStorage.getItem("zenith_study_time_left");
      if (storedTimeLeft) {
        setTimeLeft(parseInt(storedTimeLeft));
      }
      const storedDuration = localStorage.getItem("zenith_study_duration");
      if (storedDuration) {
        setTimerDuration(parseInt(storedDuration));
      }
      const storedMode = localStorage.getItem("zenith_study_mode");
      if (storedMode) {
        setTimerMode(storedMode as any);
      }
    } else {
      localStorage.setItem("zenith_study_date", todayStr);
      localStorage.setItem("zenith_study_secs", "0");
      localStorage.removeItem("zenith_study_log_id");
      localStorage.removeItem("zenith_study_time_left");
      localStorage.removeItem("zenith_study_duration");
      localStorage.removeItem("zenith_study_mode");
    }
  }, []);

  const minutesStr = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secondsStr = String(timeLeft % 60).padStart(2, "0");
  
  // Pomodoro standard durations (secs)
  const pomodoroDuration = 1500;
  const shortBreakDuration = 300;
  const longBreakDuration = 900;
  const [customMinutes, setCustomMinutes] = useState("");
  
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

  // Timer tick effect
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          playTickSound();
          return prev - 1;
        });
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
  }, [isRunning, isTickMuted]);

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

  // Handle countdown complete
  const handleTimerComplete = () => {
    setIsRunning(false);
    playChimeSound();
    
    // Auto-save final accumulated minutes
    const minutes = Math.floor(secondsStudiedToday / 60);
    if (minutes > 0) {
      syncDailyStudyLog(minutes);
    }
    
    alert("🎉 Daily focus target reached! Great job today.");
  };

  const handleTimerModeChange = (mode: "pomodoro" | "long" | "short" | "custom", secs: number) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(secs);
    setTimerDuration(secs);
    
    // Persist target settings in localStorage
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem("zenith_study_date", todayStr);
    localStorage.setItem("zenith_study_time_left", String(secs));
    localStorage.setItem("zenith_study_duration", String(secs));
    localStorage.setItem("zenith_study_mode", mode);
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

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      handleTimerModeChange("custom", mins * 60);
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
              
              {/* Presets Row */}
              <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-black/35 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
                <button
                  onClick={() => handleTimerModeChange("pomodoro", 1500)}
                  className={cn("text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg transition-all", timerMode === "pomodoro" ? "bg-white dark:bg-white/5 text-slate-800 dark:text-white shadow" : "text-neutral-500")}
                >
                  Pomodoro (25m)
                </button>
                <button
                  onClick={() => handleTimerModeChange("long", 3000)}
                  className={cn("text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg transition-all", timerMode === "long" ? "bg-white dark:bg-white/5 text-slate-800 dark:text-white shadow" : "text-neutral-500")}
                >
                  Focus (50m)
                </button>
                <button
                  onClick={() => handleTimerModeChange("short", 300)}
                  className={cn("text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg transition-all", timerMode === "short" ? "bg-white dark:bg-white/5 text-slate-800 dark:text-white shadow" : "text-neutral-500")}
                >
                  Break (5m)
                </button>
              </div>

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
                    strokeDashoffset={603 - (603 * timeLeft) / timerDuration}
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
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-wider">{formatTime(timeLeft)}</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 dark:text-neutral-500 mt-1">Remaining</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={handleToggleTimer}
                  className="bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/20 px-8 py-4 rounded-xl flex items-center gap-2"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button
                  onClick={() => handleTimerModeChange(timerMode, timerDuration)}
                  variant="outline"
                  className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400 px-6 py-4 rounded-xl flex items-center gap-2 bg-transparent hover:bg-white/5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Custom Minutes Input */}
              <form onSubmit={handleCustomTimeSubmit} className="flex gap-2 items-center w-full max-w-xs justify-center pt-4 border-t border-slate-200 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Custom Mins:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-16 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#A78BFA]"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-[#A78BFA] text-black font-bold uppercase tracking-wider px-3 text-[9px] h-7 rounded-lg"
                >
                  Set
                </Button>
              </form>

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

      {/* ── Immersive Desk Focus Flip Mode ── */}
      {isFlipMode && (
        <div className="fixed inset-0 z-50 bg-[#07070a] text-white flex flex-col items-center justify-center p-4 transition-all duration-500 ease-out select-none">
          
          {/* Top Controls */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isRunning ? "bg-red-400" : "bg-yellow-400")}></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2", isRunning ? "bg-red-500" : "bg-yellow-500")}></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-slate-400 font-mono">
                {timerMode === "pomodoro" ? "Pomodoro Cycle" : timerMode === "long" ? "Extended Focus" : timerMode === "short" ? "Rest Cycle" : "Custom Block"}
              </span>
            </div>
            
            <button
              onClick={() => setIsFlipMode(false)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-neutral-400 hover:text-white"
              title="Close Desk Mode"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Portrait orientation warning (Mobile Only) */}
          <div className={cn(
            "flex flex-col items-center justify-center text-center p-6 transition-all duration-300",
            forceLandscape ? "hidden" : "landscape:hidden flex md:hidden"
          )}>
            <div className="animate-bounce mb-4 bg-[#A78BFA]/10 p-4 rounded-full border border-[#A78BFA]/20">
              <svg className="h-10 w-10 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Rotate Your Device</h3>
            <p className="text-xs text-neutral-400 max-w-xs mb-6 leading-relaxed">
              Place your phone horizontally on your desk to view the landscape flip clock timer.
            </p>
            <button
              onClick={() => setForceLandscape(true)}
              className="px-5 py-2.5 bg-[#A78BFA] text-black font-black uppercase tracking-wider text-[10px] rounded-xl shadow-lg transition-all active:scale-95"
            >
              Force Preview Mode
            </button>
          </div>

          {/* Active Flip Clock layout */}
          <div className={cn(
            "w-full flex-col items-center justify-center transition-all duration-500",
            forceLandscape ? "flex" : "portrait:hidden landscape:flex md:flex"
          )}>
            
            {/* Devices Frame Wrapper */}
            <div className="relative w-full max-w-3xl flex items-center justify-center px-4">
              
              {/* LAPTOP / TABLET FRAME (Visible on md screens and above) */}
              <div className="hidden md:block absolute -inset-6 bg-[#16161a] rounded-[2.5rem] border border-neutral-700/30 shadow-[0_30px_70px_rgba(0,0,0,0.8)] pointer-events-none">
                {/* Web camera dot */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0f0f12] rounded-full border border-neutral-800" />
              </div>
              
              {/* MOBILE HORIZONTAL FRAME (Visible only on mobile in landscape) */}
              <div className="block md:hidden absolute -inset-4 bg-[#111] rounded-[2rem] border border-neutral-800 shadow-[0_20px_40px_rgba(0,0,0,0.8)] pointer-events-none">
                {/* Speaker indicator */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#222] rounded-full" />
              </div>

              {/* Screen Content */}
              <div className="relative w-full aspect-[2/1] md:aspect-[2.2/1] bg-[#09090b] rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center p-6 border border-neutral-900 overflow-hidden shadow-inner">
                
                {/* Background glow effects */}
                <div className="absolute -top-1/2 -left-1/4 w-80 h-80 bg-[#A78BFA]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-1/2 -right-1/4 w-80 h-80 bg-[#F9A8D4]/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Flip Cards Grid */}
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6 scale-90 sm:scale-100 transition-all duration-300">
                  <FlipCard digit={minutesStr[0]} />
                  <FlipCard digit={minutesStr[1]} />
                  
                  {/* Glowing Colon */}
                  <div className="flex flex-col gap-3 px-2 sm:px-4">
                    <span className={cn("w-3 h-3 sm:w-4 sm:h-4 bg-[#A78BFA] rounded-full shadow-[0_0_15px_#A78BFA] transition-opacity duration-500", isRunning && "animate-pulse")} />
                    <span className={cn("w-3 h-3 sm:w-4 sm:h-4 bg-[#A78BFA] rounded-full shadow-[0_0_15px_#A78BFA] transition-opacity duration-500", isRunning && "animate-pulse")} />
                  </div>
                  
                  <FlipCard digit={secondsStr[0]} />
                  <FlipCard digit={secondsStr[1]} />
                </div>
                
                {/* Mini Status Indicator on Screen */}
                <div className="absolute bottom-4 text-[9px] uppercase tracking-widest font-extrabold text-neutral-600 font-mono">
                  {isRunning ? "Focus session in progress" : "Session paused"}
                </div>
              </div>
            </div>

            {/* Immersive Control Pad (Sits under the screens) */}
            <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-sm px-4">
              
              {/* Presets Selector in Desk Mode */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full justify-center">
                <button
                  onClick={() => handleTimerModeChange("pomodoro", 1500)}
                  className={cn("text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all", timerMode === "pomodoro" ? "bg-white/15 text-white shadow" : "text-neutral-400 hover:text-white")}
                >
                  25m
                </button>
                <button
                  onClick={() => handleTimerModeChange("long", 3000)}
                  className={cn("text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all", timerMode === "long" ? "bg-white/15 text-white shadow" : "text-neutral-400 hover:text-white")}
                >
                  50m
                </button>
                <button
                  onClick={() => handleTimerModeChange("custom", 3600)}
                  className={cn("text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all", timerMode === "custom" && timerDuration === 3600 ? "bg-white/15 text-white shadow" : "text-neutral-400 hover:text-white")}
                >
                  1h
                </button>
                <button
                  onClick={() => handleTimerModeChange("custom", 7200)}
                  className={cn("text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all", timerMode === "custom" && timerDuration === 7200 ? "bg-white/15 text-white shadow" : "text-neutral-400 hover:text-white")}
                >
                  2h
                </button>
                <button
                  onClick={() => handleTimerModeChange("custom", 14400)}
                  className={cn("text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all", timerMode === "custom" && timerDuration === 14400 ? "bg-white/15 text-white shadow" : "text-neutral-400 hover:text-white")}
                >
                  4h
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md w-full justify-center">
                <button
                  onClick={handleToggleTimer}
                  className="p-3 bg-[#A78BFA] text-black hover:bg-[#c084fc] rounded-xl transition-all shadow-md active:scale-95"
                  title={isRunning ? "Pause Session" : "Start Session"}
                >
                  {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={() => handleTimerModeChange(timerMode, timerDuration)}
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

          </div>
          
        </div>
      )}

    </div>
  );
}
