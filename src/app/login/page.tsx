"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#09090B] min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-[#e3e1ec] antialiased">
      
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 z-0 bg-[#09090B] overflow-hidden pointer-events-none">
        {/* Soft floating colored mesh glow spheres */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.05)_50%,transparent_70%)] blur-[80px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.1)_0%,rgba(253,186,116,0.02)_60%,transparent_80%)] blur-[90px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.12)_0%,rgba(139,92,246,0.04)_50%,transparent_70%)] blur-[80px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[440px] transition-all duration-500">
        
        {/* Glass Card */}
        <div className="bg-[#12131C]/40 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          
          {/* Geometric Premium Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">Welcome to Momentum</h1>
            <p className="text-xs text-neutral-400 mt-1.5">Crush goals, log workouts, master your day</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl leading-relaxed">
                <span className="font-bold">Error: </span> {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4.5 w-4.5" />
                <input 
                  className="bg-black/35 border border-white/10 rounded-xl px-4 py-3.5 pl-11 w-full text-white text-xs focus:outline-none focus:border-[#a9abff] focus:ring-1 focus:ring-[#a9abff] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" 
                  id="email" 
                  type="email"
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest" htmlFor="password">Password</label>
                <a className="text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors" href="#">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-4.5 w-4.5" />
                <input 
                  className="bg-black/35 border border-white/10 rounded-xl px-4 py-3.5 pl-11 w-full text-white text-xs focus:outline-none focus:border-[#a9abff] focus:ring-1 focus:ring-[#a9abff] transition-all placeholder:text-neutral-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" 
                  id="password" 
                  type="password"
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Submit button with orange/purple glow gradient */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] hover:opacity-95 active:scale-[0.99] text-black font-semibold rounded-xl py-3.5 mt-8 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(154,156,254,0.3)] disabled:opacity-50"
            >
              {isLoading ? "Logging In..." : "Log In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-white/5 flex-1"></div>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Or continue with</span>
            <div className="h-px bg-white/5 flex-1"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] border border-white/[0.06] w-full rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-medium text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"></path>
              </svg>
              Google
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] border border-white/[0.06] w-full rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-medium text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
              </svg>
              GitHub
            </button>
          </div>

        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-white hover:underline transition-colors font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
