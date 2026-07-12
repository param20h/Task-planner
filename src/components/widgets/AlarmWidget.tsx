"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Bell, BellOff, Plus, Trash2, X, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Alarm = {
  id: string;
  time: string; // "HH:MM"
  label: string;
  active: boolean;
};

export function AlarmWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [time, setTime] = useState("");
  
  // Add Alarm Form state
  const [inputTime, setInputTime] = useState("");
  const [inputLabel, setInputLabel] = useState("");
  
  // Triggered Alarm state
  const [triggeredAlarm, setTriggeredAlarm] = useState<Alarm | null>(null);
  
  // Audio state
  const [muted, setMuted] = useState(false);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync clock time
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hrs}:${mins}:${secs}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load alarms from localstorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem("zenithflow_alarms");
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (err) {
        console.error("Failed to parse saved alarms", err);
      }
    }
  }, []);

  // Save alarms to localstorage
  const saveAlarms = (newAlarms: Alarm[]) => {
    setAlarms(newAlarms);
    localStorage.setItem("zenithflow_alarms", JSON.stringify(newAlarms));
  };

  // Synthesize alarm sound using Web Audio API
  const playSynthesizerChime = () => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play C5-E5-G5 melody
      const now = ctx.currentTime;
      playTone(523.25, now, 0.4);      // C5
      playTone(659.25, now + 0.3, 0.4); // E5
      playTone(783.99, now + 0.6, 0.6); // G5
    } catch (err) {
      console.warn("Web Audio API not allowed or supported yet:", err);
    }
  };

  // Check alarm matches
  useEffect(() => {
    if (time === "") return;
    const currentHM = time.substring(0, 5); // "HH:MM"
    const currentSeconds = time.substring(6, 8); // "SS"

    // Only trigger exactly at the start of the minute (SS === "00")
    if (currentSeconds === "00") {
      const matchingAlarm = alarms.find(a => a.active && a.time === currentHM);
      if (matchingAlarm && !triggeredAlarm) {
        setTriggeredAlarm(matchingAlarm);
        setIsOpen(true); // Open the widget panel to show the triggered state
        
        // Play sound immediately and repeat every 2.5 seconds
        playSynthesizerChime();
        const audioInterval = setInterval(playSynthesizerChime, 2500);
        audioIntervalRef.current = audioInterval;
      }
    }
  }, [time, alarms, triggeredAlarm, muted]);

  // Clean up audio loop
  const stopAlarmSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopAlarmSound();
  }, []);

  // Add Alarm handler
  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTime) return;

    const newAlarm: Alarm = {
      id: Math.random().toString(36).substring(2, 9),
      time: inputTime,
      label: inputLabel.trim() || "Alarm",
      active: true
    };

    const updated = [...alarms, newAlarm].sort((a, b) => a.time.localeCompare(b.time));
    saveAlarms(updated);
    setInputTime("");
    setInputLabel("");
  };

  // Toggle Active handler
  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map(a => a.id === id ? { ...a, active: !a.active } : a);
    saveAlarms(updated);
  };

  // Delete Alarm handler
  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter(a => a.id !== id);
    saveAlarms(updated);
    if (triggeredAlarm?.id === id) {
      handleDismiss();
    }
  };

  // Dismiss Alarm
  const handleDismiss = () => {
    stopAlarmSound();
    // Turn off the active state for one-shot alarm
    if (triggeredAlarm) {
      const updated = alarms.map(a => a.id === triggeredAlarm.id ? { ...a, active: false } : a);
      saveAlarms(updated);
    }
    setTriggeredAlarm(null);
  };

  // Snooze Alarm for 5 minutes
  const handleSnooze = () => {
    stopAlarmSound();
    if (!triggeredAlarm) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hrs = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    
    const snoozedAlarm: Alarm = {
      id: `snooze_${Math.random().toString(36).substring(2, 7)}`,
      time: `${hrs}:${mins}`,
      label: `Snooze: ${triggeredAlarm.label}`,
      active: true
    };

    // Update original alarm to inactive and add the snoozed alarm
    const updated = alarms
      .map(a => a.id === triggeredAlarm.id ? { ...a, active: false } : a)
      .concat(snoozedAlarm)
      .sort((a, b) => a.time.localeCompare(b.time));

    saveAlarms(updated);
    setTriggeredAlarm(null);
  };

  return (
    <>
      {/* ── Alarm Sounding Full Screen Modal Overlay ── */}
      {triggeredAlarm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 animate-fade-in text-white">
          <div className="bg-[#111114] border border-[#A78BFA]/30 p-8 rounded-[28px] max-w-sm w-full text-center shadow-[0_0_50px_rgba(167,139,250,0.15)] flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#A78BFA]/20 rounded-full blur-xl animate-ping" />
              <div className="h-16 w-16 bg-[#A78BFA]/10 border border-[#A78BFA]/30 rounded-full flex items-center justify-center text-[#A78BFA] relative animate-bounce">
                <Bell className="h-8 w-8" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black tracking-tight mb-2">Alarm</h2>
            <p className="text-5xl font-black text-[#A78BFA] tracking-tighter mb-4">{triggeredAlarm.time}</p>
            <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-8">{triggeredAlarm.label}</p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleDismiss}
                className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black font-bold rounded-xl py-4 text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Dismiss
              </button>
              <button
                onClick={handleSnooze}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl py-3.5 text-xs uppercase tracking-widest transition-all"
              >
                Snooze (5 Mins)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Floating Toggle Button (Bottom Left on Mobile, Bottom Right on Desktop) ── */}
      <div className="fixed bottom-24 left-4 md:left-auto md:right-6 md:bottom-6 z-40 flex flex-col items-start md:items-end">
        
        {/* Main Alarm Widget Content Card */}
        {isOpen && (
          <div className="bg-[#111114]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 w-80 rounded-[24px] shadow-2xl p-5 mb-4 animate-slide-up text-slate-800 dark:text-neutral-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#A78BFA]" />
                <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white uppercase">Zenith Alarms</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-500 dark:text-neutral-400"
                  title={muted ? "Unmute Alarm" : "Mute Alarm"}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-500 dark:text-neutral-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Current Clock Time */}
            <div className="text-center py-2 mb-4 bg-black/20 dark:bg-black/35 rounded-xl border border-slate-200/50 dark:border-white/5">
              <span className="text-3xl font-black text-slate-800 dark:text-white font-mono tracking-wider">{time || "00:00:00"}</span>
            </div>

            {/* Add New Alarm Form */}
            <form onSubmit={handleAddAlarm} className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="time"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="col-span-1 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#A78BFA]"
                  required
                />
                <input
                  type="text"
                  placeholder="Label..."
                  value={inputLabel}
                  onChange={(e) => setInputLabel(e.target.value)}
                  className="col-span-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#A78BFA]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/20 font-bold rounded-lg py-1.5 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Alarm
              </button>
            </form>

            {/* Alarms List */}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {alarms.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500">No alarms set</div>
              ) : (
                alarms.map(alarm => (
                  <div
                    key={alarm.id}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                      alarm.active
                        ? "bg-[#A78BFA]/5 border-[#A78BFA]/15"
                        : "bg-slate-50 dark:bg-black/10 border-slate-200/50 dark:border-white/5 opacity-60"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-white">{alarm.time}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">{alarm.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAlarm(alarm.id)}
                        className={cn(
                          "w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center",
                          alarm.active ? "bg-[#A78BFA]" : "bg-slate-300 dark:bg-white/10"
                        )}
                      >
                        <div
                          className={cn(
                            "w-3.5 h-3.5 bg-white dark:bg-[#111114] rounded-full shadow-sm transition-transform",
                            alarm.active ? "translate-x-3.5" : "translate-x-0"
                          )}
                        />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        className="p-1 hover:bg-red-500/10 rounded text-slate-400 dark:text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border",
            isOpen 
              ? "bg-[#A78BFA] text-black border-[#A78BFA]/30 rotate-90"
              : "bg-white dark:bg-[#111114]/90 text-[#A78BFA] border-slate-200 dark:border-white/10 hover:scale-105"
          )}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
}
