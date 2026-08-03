"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Cpu, 
  Users, 
  Activity, 
  Database, 
  ArrowRight, 
  Sun, 
  Moon, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Lock,
  GitBranch,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MainAdminDashboardPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 1420,
    activeSessions: 89,
    apiResponseMs: 18,
    systemUptime: "99.98%",
    latestCommit: "e426f1b"
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("momentum_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("momentum_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const glassCardClass = "bg-[#111114]/65 dark:bg-[#111114]/65 light:bg-white border border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 rounded-[24px] p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 relative overflow-hidden";

  return (
    <div className="min-h-screen bg-[#09090B] dark:bg-[#09090B] light:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#FAFAFA] light:text-[#09090B] font-sans antialiased p-6 md:p-10 transition-colors duration-500">
      
      {/* ── Top Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/10 dark:border-white/10 light:border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-1">
            <ShieldCheck className="h-4 w-4" /> Root Admin Workspace
          </div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-white dark:text-white light:text-slate-900">
            System Administration &amp; Telemetry
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-600 mt-1">
            Central management hub for system health, user quotas, database state, and DevOps infrastructure.
          </p>
        </div>

        {/* Theme Switcher Toggle */}
        <button 
          onClick={toggleTheme} 
          className="h-9 w-9 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-100 flex items-center justify-center hover:bg-white/10 transition-colors text-neutral-400 dark:text-neutral-400 light:text-slate-600"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* ── Featured DevOps Dashboard Launch Card ── */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-[#18181C] via-[#111114] to-[#1F1829] dark:from-[#18181C] dark:via-[#111114] dark:to-[#1F1829] light:from-white light:via-slate-50 light:to-purple-50/40 border border-[#A78BFA]/30 dark:border-[#A78BFA]/30 light:border-[#A78BFA]/40 rounded-[28px] p-8 shadow-2xl relative overflow-hidden group hover:border-[#A78BFA]/60 transition-all duration-300">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient(circle,rgba(167,139,250,0.15)_0%,transparent_70%) pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
            
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" /> DevOps Hub
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> GitHub Actions Live Stream
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-white dark:text-white light:text-slate-900 mb-2">
                DevOps Pipeline &amp; System Telemetry Dashboard
              </h2>

              <p className="text-xs md:text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 leading-relaxed">
                Monitor real-time <code className="text-[#A78BFA] bg-black/20 dark:bg-black/20 light:bg-slate-200 px-1.5 py-0.5 rounded font-mono">git push</code> execution steps, streaming stdout/stderr GitHub Action logs, container build times, and Groq AI error auto-diagnosis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <Link href="/admin/devops" className="w-full sm:w-auto">
                <button className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:opacity-95 shadow-lg shadow-[#A78BFA]/20 group-hover:scale-[1.02]">
                  <span>Launch DevOps Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── Admin Overview System Metrics Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <div className={cn(glassCardClass)}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-slate-500">
              Total Platform Users
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 light:bg-purple-100 light:text-purple-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white dark:text-white light:text-slate-900">
            {systemMetrics.totalUsers.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 dark:text-emerald-400 light:text-emerald-600 mt-2 font-semibold flex items-center gap-1">
            ↑ +12% growth this month
          </p>
        </div>

        <div className={cn(glassCardClass)}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-slate-500">
              API Response Latency
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 light:bg-emerald-100 light:text-emerald-700">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white dark:text-white light:text-slate-900">
            {systemMetrics.apiResponseMs} ms
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-400 light:text-slate-500 mt-2">
            Optimal Express.js edge performance
          </p>
        </div>

        <div className={cn(glassCardClass)}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-slate-500">
              System Uptime
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 light:bg-blue-100 light:text-blue-700">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white dark:text-white light:text-slate-900">
            {systemMetrics.systemUptime}
          </div>
          <p className="text-[11px] text-emerald-400 dark:text-emerald-400 light:text-emerald-600 mt-2 font-semibold">
            🟢 All microservices online
          </p>
        </div>

        <div className={cn(glassCardClass)}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-slate-500">
              Database Cluster
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-700">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white dark:text-white light:text-slate-900">
            Supabase DB
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-400 light:text-slate-500 mt-2">
            Connected &amp; Synchronized
          </p>
        </div>

      </section>

    </div>
  );
}
