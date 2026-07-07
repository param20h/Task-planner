"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, User, Mail, Lock, Sun, Moon, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (authError) throw authError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#09090B] dark:bg-[#09090B] light:bg-[#FAFAFA] min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-[#FAFAFA] dark:text-[#FAFAFA] light:text-[#09090B] antialiased transition-colors duration-500">
      
      {/* ── Background Mesh ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(196,181,253,0.12)_0%,transparent_70%)] light:bg-[radial-gradient(circle,rgba(167,139,250,0.04)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(249,168,212,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(249,168,212,0.08)_0%,transparent_70%)] light:hidden blur-[80px]" />
      </div>

      {/* Theme Switcher Toggle (Top Right) */}
      <div className="absolute top-8 right-8 z-20">
        <button 
          onClick={toggleTheme} 
          className="h-8 w-8 rounded-full border border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-100 flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 transition-colors text-neutral-400 dark:text-neutral-400 light:text-slate-600"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        
        {/* Glass Card */}
        <div className="bg-[#111114]/65 dark:bg-[#111114]/65 light:bg-white border border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 rounded-[28px] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] light:shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          
          {/* Logo Title block */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="font-sans font-bold text-xl tracking-tighter flex items-center gap-2 mb-4 text-white dark:text-white light:text-[#09090B]">
              <div className="relative h-5 w-5 bg-gradient-to-tr from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] rounded-md flex items-center justify-center p-0.5">
                <Triangle className="h-3.5 w-3.5 text-black fill-black rotate-180" />
              </div>
              <span className="font-extrabold text-base tracking-tight">Momentum</span>
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight mt-1 text-white dark:text-white light:text-slate-800">Create Account</h1>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-400 light:text-slate-500 mt-1">Build habits, track workouts, see progress</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl leading-relaxed">
                <span className="font-bold">Error: </span> {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-widest pl-1" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input 
                  className="bg-black/35 dark:bg-black/35 light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-200 rounded-xl px-4 py-3 pl-11 w-full text-white dark:text-white light:text-slate-800 text-xs focus:outline-none focus:border-[#A78BFA] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] light:shadow-none" 
                  id="name" 
                  type="text"
                  placeholder="Enter your name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-widest pl-1" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input 
                  className="bg-black/35 dark:bg-black/35 light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-200 rounded-xl px-4 py-3 pl-11 w-full text-white dark:text-white light:text-slate-800 text-xs focus:outline-none focus:border-[#A78BFA] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] light:shadow-none" 
                  id="email" 
                  type="email"
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-widest pl-1" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input 
                  className="bg-black/35 dark:bg-black/35 light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-200 rounded-xl px-4 py-3 pl-11 w-full text-white dark:text-white light:text-slate-800 text-xs focus:outline-none focus:border-[#A78BFA] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] light:shadow-none" 
                  id="password" 
                  type="password"
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1.5 text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-500 font-semibold select-none">
              <input 
                id="terms" 
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 dark:border-white/20 light:border-slate-300 bg-black dark:bg-black light:bg-slate-100 text-[#A78BFA] focus:ring-[#A78BFA] mt-0.5"
                required
              />
              <label htmlFor="terms">
                I agree to the{" "}
                <a href="#" className="text-white dark:text-white light:text-slate-800 underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-white dark:text-white light:text-slate-800 underline">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading || !agreeTerms}
              className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black font-bold rounded-xl py-3.5 mt-6 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-md shadow-[#A78BFA]/20 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Sign Up"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Bottom links */}
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-500 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#A78BFA] hover:underline font-bold">
              Sign In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
