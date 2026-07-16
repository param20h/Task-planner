"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, User, Mail, Lock, Sun, Moon, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { AnimatedThemeToggler } from "@/components/ui/AnimatedThemeToggler";

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

  const handleThemeChange = (nextTheme: "light" | "dark") => {
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
      const redirectToUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectToUrl,
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

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#09090B] min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-[#09090B] dark:text-[#FAFAFA] antialiased transition-colors duration-500">
      
      {/* ── Background Mesh ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(196,181,253,0.12)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[55%] h-[55%] rounded-full light:hidden dark:bg-[radial-gradient(circle,rgba(249,168,212,0.08)_0%,transparent_70%)] blur-[80px]" />
      </div>

      {/* Theme Switcher Toggle (Top Right) */}
      <div className="absolute top-8 right-8 z-20">
        <AnimatedThemeToggler theme={theme} onThemeChange={handleThemeChange} className="h-8 w-8 rounded-full" />
      </div>

      {/* Back to Home (Top Left) */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-all duration-300 group"
        >
          <span className="h-7 w-7 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:border-[#A78BFA]/50 group-hover:bg-[#A78BFA]/10 transition-all duration-300">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        
        {/* Glass Card */}
        <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[28px] p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          
          {/* Logo Title block */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="font-sans font-bold text-xl tracking-tighter flex items-center gap-2 mb-4 text-[#09090B] dark:text-white">
              <div className="relative h-5 w-5 rounded-md overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10">
                <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="20px" className="object-cover" />
              </div>
              <span className="font-extrabold text-base tracking-tight">ZenithFlow</span>
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight mt-1 text-slate-800 dark:text-white">Create Account</h1>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">Build habits, track workouts, see progress</p>
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
              <label className="text-[9px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest pl-1" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input 
                  className="bg-black/35 dark:bg-black/35 light:bg-slate-50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 w-full text-slate-800 dark:text-white text-xs focus:outline-none focus:border-[#A78BFA] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] light:shadow-none" 
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
              <label className="text-[9px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest pl-1" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input 
                  className="bg-black/35 dark:bg-black/35 light:bg-slate-50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 w-full text-slate-800 dark:text-white text-xs focus:outline-none focus:border-[#A78BFA] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] light:shadow-none" 
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
              <label className="text-[9px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest pl-1" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input 
                  className="bg-black/35 dark:bg-black/35 light:bg-slate-50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-11 w-full text-slate-800 dark:text-white text-xs focus:outline-none focus:border-[#A78BFA] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] light:shadow-none" 
                  id="password" 
                  type="password"
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required 
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1.5 text-xs text-slate-500 dark:text-neutral-400 font-semibold select-none">
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
                <a href="#" className="text-slate-800 dark:text-white underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-slate-800 dark:text-white underline">Privacy Policy</a>.
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

          {/* Separator */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
            <span className="mx-4 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2.5 text-xs hover:bg-slate-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Bottom links */}
          <p className="text-center text-xs text-slate-500 dark:text-neutral-400 mt-8">
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
