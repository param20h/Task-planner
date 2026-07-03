"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  Triangle, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  ArrowRight, 
  MessageSquare, 
  Globe, 
  Camera, 
  Menu,
  Check,
  Bolt,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const basePrice = "Free";
  const proPrice = isYearly ? "$120" : "$12";
  const proPeriod = isYearly ? "/yr" : "/mo";
  const elitePrice = isYearly ? "$290" : "$29";
  const elitePeriod = isYearly ? "/yr" : "/mo";

  const glassCardClass = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-white/20";

  // Perspective grid + light beams animation
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const beamsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function drawGrid(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const cols = 14, rows = 12;
      const vp = { x: W / 2, y: H * 0.12 };
      const speed = 0.0004;
      const offset = (t * speed) % (1 / rows);

      ctx.strokeStyle = "rgba(99,102,241,0.13)";
      ctx.lineWidth = 0.8;

      for (let r = 0; r <= rows; r++) {
        const p = ((r / rows) + offset) % 1;
        const y = vp.y + (H - vp.y) * p;
        const spread = p * W * 1.2;
        ctx.beginPath();
        ctx.moveTo(vp.x - spread / 2, y);
        ctx.lineTo(vp.x + spread / 2, y);
        ctx.globalAlpha = p * 0.9;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      for (let c = 0; c <= cols; c++) {
        const t2 = c / cols;
        const xBottom = W * t2;
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(xBottom, H);
        ctx.globalAlpha = 0.13;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Create light beams
    const beamsEl = beamsContainerRef.current;
    const beamEls: { el: HTMLDivElement; phase: number; speed: number }[] = [];
    const beamCount = 7;

    if (beamsEl) {
      for (let i = 0; i < beamCount; i++) {
        const b = document.createElement("div");
        const angle = (i - (beamCount - 1) / 2) * 18;
        const h = 40 + Math.random() * 40;
        b.style.cssText = `
          position:absolute;bottom:0;left:50%;width:2px;
          background:linear-gradient(to top,rgba(99,102,241,0.5),transparent);
          border-radius:2px;transform-origin:bottom center;
          will-change:opacity,transform;filter:blur(1px);
          height:${h}%;opacity:0;
          transform:translateX(-50%) rotate(${angle}deg);
        `;
        beamsEl.appendChild(b);
        beamEls.push({ el: b, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.4 });
      }
    }

    let reqId: number;
    const animate = (ts: number) => {
      drawGrid(ts);
      beamEls.forEach((b) => {
        const op = (Math.sin(ts * 0.001 * b.speed + b.phase) * 0.5 + 0.5) * 0.45;
        b.el.style.opacity = String(op);
      });
      reqId = requestAnimationFrame(animate);
    };
    reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(reqId);
      beamEls.forEach((b) => b.el.remove());
    };
  }, []);

  // Intersection Observer for scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-[30px]");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-fade").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#e3e1ec] antialiased overflow-x-hidden">
      
      {/* ── Animated Background ── */}
      <div className="fixed inset-0 z-0 bg-[#09090B] overflow-hidden pointer-events-none">
        {/* Ambient top glow */}
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.1)_0%,transparent_65%)] blur-[60px] animate-[ambient-drift_12s_ease-in-out_infinite_alternate]" />
        
        {/* Core glow */}
        <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.55)_0%,rgba(99,102,241,0.1)_45%,transparent_70%)] blur-[40px] animate-[core-pulse_4s_ease-in-out_infinite_alternate]" />

        {/* Expanding rings */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-[rgba(99,102,241,0.18)] animate-[ring-expand_6s_ease-out_infinite]" />
        <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-[rgba(99,102,241,0.18)] animate-[ring-expand_6s_ease-out_infinite_2s]" />
        <div className="absolute -bottom-[4%] left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full border border-[rgba(99,102,241,0.18)] animate-[ring-expand_6s_ease-out_infinite_4s]" />

        {/* Light beams container */}
        <div ref={beamsContainerRef} className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-full h-[80%]" />

        {/* Scan lines */}
        <div className="absolute left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.4)_30%,rgba(139,92,246,0.6)_50%,rgba(99,102,241,0.4)_70%,transparent_100%)] blur-[1px] animate-[scan_8s_linear_infinite]" />
        <div className="absolute left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.4)_30%,rgba(139,92,246,0.6)_50%,rgba(99,102,241,0.4)_70%,transparent_100%)] blur-[1px] animate-[scan_8s_linear_infinite_4s]" />

        {/* Perspective grid canvas */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[200%] h-[70%]" style={{ perspective: "600px" }}>
          <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Film grain */}
        <div className="absolute -inset-1/2 w-[200%] h-[200%] opacity-[0.028] animate-[grain-anim_0.08s_steps(1)_infinite] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }} />
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 w-full z-50 bg-[#09090B]/50 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-6 md:px-10 h-20">
          
          {/* Logo brand */}
          <Link href="/dashboard" className="font-bold text-2xl tracking-tighter text-white flex items-center gap-2">
            <Triangle className="h-6 w-6 text-[#c0c1ff] fill-[#c0c1ff]/20 rotate-180" />
            <span>Momentum</span>
          </Link>

          {/* Links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <li>
              <a href="#features" className="text-[#c7c4d7] hover:text-white transition-colors hover:bg-white/5 px-3.5 py-2 rounded-lg duration-300">
                Features
              </a>
            </li>
            <li>
              <Link href="/pricing" className="text-[#c7c4d7] hover:text-white transition-colors hover:bg-white/5 px-3.5 py-2 rounded-lg duration-300">
                Pricing
              </Link>
            </li>
            <li>
              <a href="#about" className="text-[#c7c4d7] hover:text-white transition-colors hover:bg-white/5 px-3.5 py-2 rounded-lg duration-300">
                About
              </a>
            </li>
          </ul>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#c7c4d7] hover:text-white uppercase tracking-widest text-[10px] font-bold">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <button className="relative overflow-hidden bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] hover:opacity-95 text-black px-6 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(154,156,254,0.3)]">
                Register
              </button>
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center pt-10 overflow-hidden">
          <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 text-center flex flex-col items-center">
            
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <span className="w-2 h-2 rounded-full bg-[#C98BFE] animate-pulse shadow-[0_0_8px_rgba(201,139,254,0.8)]"></span>
              <span className="text-[10px] font-bold tracking-widest text-[#c7c4d7] uppercase">v2.0 Beta Live</span>
            </div>

            {/* Main Header */}
            <h1 className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out font-black text-[48px] md:text-[84px] leading-tight md:leading-[90px] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E2E4FF] to-[#888A9F] mb-6 max-w-4xl mx-auto">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] filter drop-shadow-[0_0_30px_rgba(201,139,254,0.2)]">Momentum.</span>
            </h1>

            {/* Description */}
            <p className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out text-base md:text-xl text-[#c7c4d7]/70 max-w-2xl mx-auto mb-12">
              AI-driven productivity meets hyper-detailed fitness tracking in a singular, immersive digital cockpit. Form habits, crush goals, leave a legacy.
            </p>

            {/* Action buttons */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] hover:opacity-95 active:scale-[0.99] text-black px-8 py-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(154,156,254,0.3)] flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white/[0.03] hover:bg-white/[0.06] text-white px-8 py-4 rounded-xl text-xs font-semibold uppercase tracking-widest border border-white/10 transition-all duration-300 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  Sign In
                  </button>
              </Link>
            </div>
          </div>

          {/* Decorative design lines */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.02] -z-10"></div>
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/[0.02] -z-10"></div>
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Precision Engineering for the Mind & Body</h2>
            <p className="text-sm md:text-base text-[#c7c4d7]/70 max-w-xl mx-auto">
              Seamlessly integrate your physical output with your mental clarity using our proprietary glass-pane architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: AI Coach */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out bg-[#12131C]/35 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 flex flex-col h-full group hover:border-white/20 transition-all duration-500 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)]">
              {/* Top border highlight glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9A9CFE]/30 to-transparent"></div>
              
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 text-[#9A9CFE] group-hover:scale-105 transition-transform duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <Brain className="h-5 w-5" />
              </div>
              <div className="text-[10px] text-[#C98BFE] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C98BFE] rounded-full animate-ping"></span> AI Powered
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Performance Coach</h3>
              <p className="text-xs md:text-sm text-[#c7c4d7]/70 leading-relaxed">
                Context-aware intelligence analyzes your biometric data and schedule, delivering actionable insights and dynamically adjusting your protocols in real-time.
              </p>
              
              {/* Premium Waveform Graphic */}
              <div className="mt-8 h-20 border-t border-white/5 relative overflow-hidden flex items-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="w-1/6 bg-gradient-to-t from-[#9A9CFE]/10 to-[#9A9CFE]/40 h-[30%] rounded-t-lg transition-all duration-500 group-hover:h-[50%]"></div>
                <div className="w-1/6 bg-gradient-to-t from-[#C98BFE]/10 to-[#C98BFE]/50 h-[50%] rounded-t-lg transition-all duration-500 group-hover:h-[30%]"></div>
                <div className="w-1/6 bg-gradient-to-t from-[#FCA088]/10 to-[#FCA088]/60 h-[40%] rounded-t-lg transition-all duration-500 group-hover:h-[70%]"></div>
                <div className="w-1/6 bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] h-[80%] rounded-t-lg shadow-[0_0_15px_rgba(154,156,254,0.4)] transition-all duration-500 group-hover:h-[90%]"></div>
                <div className="w-1/6 bg-gradient-to-t from-[#C98BFE]/10 to-[#C98BFE]/50 h-[60%] rounded-t-lg transition-all duration-500 group-hover:h-[40%]"></div>
                <div className="w-1/6 bg-gradient-to-t from-[#9A9CFE]/10 to-[#9A9CFE]/30 h-[45%] rounded-t-lg transition-all duration-500 group-hover:h-[60%]"></div>
              </div>
            </div>

            {/* Feature 2: Workout Logging */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out bg-[#12131C]/35 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 flex flex-col h-full group hover:border-white/20 transition-all duration-500 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)]">
              {/* Top border highlight glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C98BFE]/30 to-transparent"></div>
              
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 text-[#C98BFE] group-hover:scale-105 transition-transform duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="text-[10px] text-[#FCA088] font-bold uppercase tracking-widest mb-2">Metrics Logging</div>
              <h3 className="text-xl font-bold text-white mb-4">Hyper-Detailed Logging</h3>
              <p className="text-xs md:text-sm text-[#c7c4d7]/70 leading-relaxed mb-6">
                High-precision mechanics for tracking sets, reps, targets, and active intervals. The interface stays completely out of your way until you need it.
              </p>
              
              {/* Table mock */}
              <div className="mt-auto bg-black/45 border border-white/10 rounded-xl p-4 text-[10px] text-[#a9abff] font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between mb-2"><span className="font-bold text-white uppercase">BENCH PRESS</span> <span className="text-white opacity-60">4 SETS</span></div>
                <div className="flex justify-between text-neutral-400"><span>100kg × 8</span> <span className="text-[#FCA088] font-semibold">@RPE8</span></div>
                <div className="flex justify-between text-neutral-400 mt-1.5"><span>105kg × 6</span> <span className="text-[#FCA088] font-semibold">@RPE8.5</span></div>
              </div>
            </div>

            {/* Feature 3: Journaling */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out bg-[#12131C]/35 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 flex flex-col h-full group hover:border-white/20 transition-all duration-500 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)]">
              {/* Top border highlight glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCA088]/30 to-transparent"></div>
              
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 text-[#FCA088] group-hover:scale-105 transition-transform duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-[10px] text-[#9A9CFE] font-bold uppercase tracking-widest mb-2">Editorial</div>
              <h3 className="text-xl font-bold text-white mb-4">Reflective Journaling</h3>
              <p className="text-xs md:text-sm text-[#c7c4d7]/70 leading-relaxed mt-auto relative z-10">
                An editorial-grade canvas designed for deep reflection. Disconnect from the metrics and synthesize your thoughts in an elegant, distraction-free environment.
              </p>
              
              {/* Ampersand design */}
              <div className="absolute -bottom-10 -right-6 font-serif text-[160px] leading-none text-white/[0.01] pointer-events-none group-hover:scale-110 group-hover:text-white/[0.02] transition-all duration-700">
                &amp;
              </div>
            </div>

          </div>
        </section>

        {/* Break Action Section */}
        <section className="py-24 border-y border-white/[0.05] bg-white/[0.01] backdrop-blur-md w-full relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-[#9A9CFE]/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="max-w-[1280px] mx-auto px-6 md:px-10 text-center relative z-10 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <div className="text-[10px] font-bold text-[#C98BFE] uppercase tracking-[0.2em] mb-4 pl-1">Ready to initialize?</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Stop tracking. Start engineering.</h2>
            <Link href="/register">
              <button className="bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] hover:opacity-95 active:scale-[0.99] text-black px-10 py-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(154,156,254,0.3)]">
                Create Account
              </button>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full relative z-10 bg-black/40 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2">
            <div className="font-bold text-xl text-white flex items-center gap-2">
              <Triangle className="h-5 w-5 text-[#c0c1ff] fill-[#c0c1ff]/20 rotate-180" />
              <span>Momentum</span>
            </div>
            <p className="text-xs md:text-sm text-[#c7c4d7] mt-4 max-w-sm leading-relaxed">
              High-performance systems for individuals who refuse to stagnate.
            </p>
            <p className="text-xs text-[#c7c4d7]/60 mt-8">
              © 2026 Momentum AI. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-3 text-xs">
              <li><a className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors" href="#">Terms of Service</a></li>
              <li><a className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors" href="#">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Connect</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors flex items-center gap-2" href="#">
                  <MessageSquare className="h-4 w-4" /> Contact Support
                </a>
              </li>
              <li>
                <a className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors flex items-center gap-2" href="#">
                  <Globe className="h-4 w-4" /> Twitter
                </a>
              </li>
              <li>
                <a className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors flex items-center gap-2" href="#">
                  <Camera className="h-4 w-4" /> Instagram
                </a>
              </li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
