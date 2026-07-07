"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Triangle, 
  ArrowRight, 
  MessageSquare, 
  Globe, 
  Camera, 
  Menu,
  Check,
  Bolt,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  
  // Theme state: defaults to dark (#09090B) as requested
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

  const glassCardClass = "bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-white/20 shadow-2xl relative overflow-hidden";

  // Perspective grid + light beams animation
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);

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

      const gridColor = theme === "dark" 
        ? "rgba(196,181,253,0.06)" 
        : "rgba(99,102,241,0.07)";
      
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.9;

      for (let r = 0; r <= rows; r++) {
        const p = ((r / rows) + offset) % 1;
        const y = vp.y + (H - vp.y) * p;
        const spread = p * W * 1.3;
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
        ctx.globalAlpha = 0.06;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    let reqId: number;
    const animate = (ts: number) => {
      drawGrid(ts);
      reqId = requestAnimationFrame(animate);
    };
    reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(reqId);
    };
  }, [theme]);

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
    <div className="relative min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-[#09090B] dark:text-[#FAFAFA] antialiased overflow-x-hidden transition-colors duration-500 font-sans">
      
      {/* ── Background Grid & volumetric light ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Faint blueprint grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Ambient top soft purple/pink glow */}
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.06)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse,rgba(196,181,253,0.15)_0%,rgba(249,168,212,0.05)_50%,transparent_75%)] blur-[80px]" />
        
        {/* Perspective grid lines canvas */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[220%] h-[75%] opacity-50 dark:opacity-70" style={{ perspective: "600px" }}>
          <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Film grain layer */}
        <div className="absolute -inset-1/2 w-[200%] h-[200%] opacity-[0.005] dark:opacity-[0.015] animate-[grain-anim_0.08s_steps(1)_infinite] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }} />
      </div>

      {/* ── Center Navigation Bar ── */}
      <header className="sticky top-0 w-full z-50 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-5">
          <nav className="flex justify-between items-center bg-white/70 dark:bg-[#111114]/65 backdrop-blur-2xl border border-slate-200/50 dark:border-white/[0.06] px-8 py-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] w-full">
            
            {/* Left Brand Logo */}
            <Link href="/" className="font-sans font-bold text-lg tracking-tighter flex items-center gap-2 group text-[#09090B] dark:text-white">
              <div className="relative h-5 w-5 rounded-md overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm group-hover:scale-105 transition-all duration-300">
                <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="20px" className="object-cover" />
              </div>
              <span className="font-extrabold text-base tracking-tight">ZenithFlow</span>
            </Link>

            {/* Mid Links */}
            <ul className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500">
              <li><Link href="/#features" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Pricing</Link></li>
              <li><Link href="/#coach" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">AI Coach</Link></li>
              <li><Link href="/#analytics" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Analytics</Link></li>
              <li><Link href="/#about" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">About</Link></li>
            </ul>

            {/* Actions & Theme Swapper */}
            <div className="flex items-center gap-4">
              
              {/* Light/Dark Toggle */}
              <button 
                onClick={toggleTheme} 
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <Link href="/login">
                <Button variant="ghost" className="text-xs uppercase tracking-widest font-bold text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 hover:text-[#09090B] dark:hover:text-white px-3 py-1">
                  Login
                </Button>
              </Link>
              
              <Link href="/register">
                <button className="relative bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(167,139,250,0.3)]">
                  Register
                </button>
              </Link>

              {/* Mobile hamburger menu */}
              <button className="lg:hidden text-slate-600 dark:text-neutral-400 ml-1" onClick={() => setMenuOpen(!menuOpen)}>
                <Menu className="h-5 w-5" />
              </button>
            </div>

          </nav>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#09090B]/95 backdrop-blur-2xl flex flex-col justify-center items-center gap-8 text-xl font-bold uppercase tracking-widest text-[#A1A1AA] border-b border-white/10">
          <button className="absolute top-8 right-8 text-white text-3xl" onClick={() => setMenuOpen(false)}>✕</button>
          <Link href="/#features" onClick={() => setMenuOpen(false)} className="hover:text-white">Features</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="hover:text-white">Pricing</Link>
          <Link href="/#coach" onClick={() => setMenuOpen(false)} className="hover:text-white">AI Coach</Link>
          <Link href="/#analytics" onClick={() => setMenuOpen(false)} className="hover:text-white">Analytics</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="hover:text-white">About</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white">Login</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}>
            <button className="bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-8 py-3 rounded-full text-sm font-extrabold tracking-widest">
              Register
            </button>
          </Link>
        </div>
      )}

      <main className="relative pt-12 z-10">
        
        {/* Pricing Grid Section */}
        <section className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h1 className="text-5xl md:text-6.5xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#09090B] via-[#09090B] to-slate-700 dark:from-white dark:via-white dark:to-white mb-6">Choose Your Velocity</h1>
            <p className="text-sm md:text-base text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
              Invest in your potential. Select the protocol that aligns with your performance goals.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center gap-4 bg-slate-100 dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 light:border-slate-200 px-3.5 py-1.5 rounded-full backdrop-blur-xl">
              <button 
                onClick={() => setIsYearly(false)}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300",
                  !isYearly ? "bg-white text-black shadow-md" : "text-neutral-500"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2",
                  isYearly ? "bg-white text-black shadow-md" : "text-neutral-500"
                )}
              >
                Yearly
                <span className="bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Base Tier */}
            <div className={cn(glassCardClass, "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out")}>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Starter</h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Core tracking for habits and simple workouts.</p>
                <span className="text-3xl font-black text-slate-800 dark:text-white">{basePrice}</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-neutral-300 dark:text-neutral-300 light:text-slate-600">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Basic workout logging</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> 7-day history</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Standard metrics</li>
              </ul>
              <Link href="/register">
                <button className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white dark:text-white light:text-slate-700 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300">
                  Start Free
                </button>
              </Link>
            </div>

            {/* Pro Tier (Highlighted + glowing purple ambient lighting) */}
            <div className={cn(
              "relative bg-white dark:bg-[#111114]/80 border border-[#A78BFA]/30 dark:border-[#A78BFA]/30 light:border-[#A78BFA]/50 rounded-[24px] p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] md:-translate-y-4 shadow-[0_20px_45px_-10px_rgba(167,139,250,0.25)] dark:shadow-[0_20px_45px_-10px_rgba(167,139,250,0.25)] light:shadow-[0_20px_40px_rgba(167,139,250,0.15)]",
              "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out"
            )}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#A78BFA] to-[#F9A8D4] text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20">
                Recommended
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  ZenithFlow Pro 
                  <Bolt className="h-5 w-5 text-[#A78BFA] fill-[#A78BFA]/20 animate-pulse" />
                </h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Advanced analytics and unlimited logging.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 dark:text-white transition-all duration-300">{proPrice}</span>
                  <span className="text-xs text-neutral-400">{proPeriod}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-neutral-300 dark:text-neutral-300 light:text-slate-600 font-medium">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Everything in Base</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Full AI Coach insights</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Unlimited history &amp; logging</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Advanced visual analytics</li>
              </ul>
              <Link href="/register">
                <button className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_5px_15px_rgba(167,139,250,0.3)]">
                  Upgrade to Pro
                </button>
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className={cn(glassCardClass, "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-300 ease-out")}>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Enterprise</h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Personalized protocols and 1-on-1 integrations.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 dark:text-white transition-all duration-300">{elitePrice}</span>
                  <span className="text-xs text-neutral-400">{elitePeriod}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-neutral-300 dark:text-neutral-300 light:text-slate-600">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Everything in Pro</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Custom training protocols</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Early access to AI models</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Priority human support</li>
              </ul>
              <Link href="/register">
                <button className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white dark:text-white light:text-slate-700 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300">
                  Get Enterprise
                </button>
              </Link>
            </div>

          </div>
        </section>

        {/* Feature Comparison Table Section */}
        <section className="w-full max-w-[1280px] mx-auto px-6 md:px-10 mb-24 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
          <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 shadow-2xl overflow-hidden">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8">Compare Features</h2>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/10 dark:border-b-white/10 light:border-b-slate-100 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="py-4 font-semibold">Feature</th>
                    <th className="py-4 font-semibold">Base</th>
                    <th className="py-4 font-semibold text-[#A78BFA]">Pro</th>
                    <th className="py-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 dark:divide-white/5 light:divide-slate-100 text-slate-700 dark:text-neutral-300">
                  <tr>
                    <td className="py-4 font-medium">Workout Logging</td>
                    <td className="py-4 text-neutral-400">Basic</td>
                    <td className="py-4 font-bold">Unlimited</td>
                    <td className="py-4 font-bold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">AI Insights</td>
                    <td className="py-4 text-neutral-400">—</td>
                    <td className="py-4"><Check className="h-4 w-4 text-[#A78BFA]" /></td>
                    <td className="py-4"><Check className="h-4 w-4 text-[#A78BFA]" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">1-on-1 Coaching</td>
                    <td className="py-4 text-neutral-400">—</td>
                    <td className="py-4 text-neutral-400">—</td>
                    <td className="py-4"><Check className="h-4 w-4 text-[#A78BFA]" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="w-full max-w-3xl mx-auto px-6 md:px-0 mb-24 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
              },
              {
                q: "Is there a contract?",
                a: "No contracts. ZenithFlow is billed month-to-month or annually. You can cancel your subscription at any time without penalty."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden cursor-pointer transition-colors duration-300 hover:border-white/20 shadow-xl"
                onClick={() => toggleFaq(idx)}
              >
                <div className="p-6 flex justify-between items-center select-none">
                  <h4 className="text-sm md:text-base font-bold text-white dark:text-white light:text-slate-850">{faq.q}</h4>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-neutral-400 transition-transform duration-300",
                    faqOpen[idx] ? "transform rotate-180 text-white dark:text-white light:text-black" : ""
                  )} />
                </div>
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-out px-6 text-xs md:text-sm text-[#c7c4d7]/70 dark:text-[#c7c4d7]/70 light:text-slate-500 leading-relaxed",
                  faqOpen[idx] ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
                )}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer (Same Layout as Home Page) */}
      <footer className="w-full relative z-10 bg-[#09090B] dark:bg-[#09090B] light:bg-slate-100 border-t border-white/5 dark:border-t-white/5 light:border-t-slate-200 transition-colors duration-500">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div>
            <div className="font-bold text-xl text-[#09090B] dark:text-white flex items-center gap-2">
              <div className="relative h-5 w-5 rounded-md overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10">
                <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="20px" className="object-cover" />
              </div>
              <span>ZenithFlow</span>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 mt-4 max-w-sm leading-relaxed">
              High-performance systems for individuals who refuse to stagnate.
            </p>
            <p className="text-xs text-[#A1A1AA]/50 mt-8">
              © 2026 ZenithFlow AI. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#09090B] dark:text-white uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-3 text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500">
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-black dark:hover:text-white transition-colors" href="#">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#09090B] dark:text-white uppercase tracking-widest mb-6">Connect</h4>
            <ul className="space-y-3 text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500">
              <li>
                <a className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2" href="#">
                  <MessageSquare className="h-4 w-4" /> Contact Support
                </a>
              </li>
              <li>
                <a className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2" href="#">
                  <Globe className="h-4 w-4" /> Twitter
                </a>
              </li>
              <li>
                <a className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2" href="#">
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
