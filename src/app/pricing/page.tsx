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

export default function PricingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const glassCardClass = "bg-[#12131C]/35 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)] relative overflow-hidden";

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
              <Link href="/#features" className="text-[#c7c4d7] hover:text-white transition-colors hover:bg-white/5 px-3.5 py-2 rounded-lg duration-300">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-[#c0c1ff] hover:text-white transition-colors hover:bg-white/5 px-3.5 py-2 rounded-lg duration-300">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/#about" className="text-[#c7c4d7] hover:text-white transition-colors hover:bg-white/5 px-3.5 py-2 rounded-lg duration-300">
                About
              </Link>
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

      <main className="relative pt-12 z-10">
        
        {/* Pricing Grid Section */}
        <section className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E2E4FF] to-[#888A9F] mb-6">Choose Your Velocity</h1>
            <p className="text-sm md:text-base text-[#c7c4d7]/70 max-w-xl mx-auto mb-10 leading-relaxed">
              Invest in your potential. Select the protocol that aligns with your performance goals.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-full p-2 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <button 
                onClick={() => setIsYearly(false)}
                className={cn(
                  "text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300",
                  !isYearly ? "bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]" : "text-neutral-400 hover:text-white"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={cn(
                  "text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2",
                  isYearly ? "bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]" : "text-neutral-400 hover:text-white"
                )}
              >
                Yearly
                <span className="bg-[#C98BFE]/20 text-[#C98BFE] border border-[#C98BFE]/30 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Base Tier */}
            <div className={cn(glassCardClass, "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out")}>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Base</h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Core tracking for habits and simple workouts.</p>
                <span className="text-4xl font-extrabold text-white">{basePrice}</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-neutral-300">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> Basic workout logging</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> 7-day history</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> Standard metrics</li>
              </ul>
              <Link href="/register">
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300">
                  Start Free
                </button>
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className={cn(
              "relative bg-[#12131C]/50 backdrop-blur-2xl border border-[#C98BFE]/30 rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] md:-translate-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05),0_0_30px_rgba(201,139,254,0.15)] hover:border-[#C98BFE]/50",
              "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out"
            )}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9A9CFE] to-[#C98BFE] text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                Recommended
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Momentum Pro 
                  <Bolt className="h-5 w-5 text-[#C98BFE] fill-[#C98BFE]/20 animate-pulse" />
                </h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Advanced analytics and unlimited logging.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white transition-all duration-300">{proPrice}</span>
                  <span className="text-xs text-neutral-400">{proPeriod}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-neutral-300">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#C98BFE]" /> Everything in Base</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#C98BFE]" /> Full AI Coach insights</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#C98BFE]" /> Unlimited history &amp; logging</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#C98BFE]" /> Advanced visual analytics</li>
              </ul>
              <Link href="/register">
                <button className="w-full bg-gradient-to-r from-[#9A9CFE] via-[#C98BFE] to-[#FCA088] hover:opacity-95 text-black py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-[0_5px_15px_rgba(154,156,254,0.3)]">
                  Upgrade to Pro
                </button>
              </Link>
            </div>

            {/* Elite Tier */}
            <div className={cn(glassCardClass, "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-300 ease-out")}>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Momentum Elite</h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Personalized protocols and 1-on-1 integrations.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white transition-all duration-300">{elitePrice}</span>
                  <span className="text-xs text-neutral-400">{elitePeriod}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-neutral-300">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> Everything in Pro</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> Custom training protocols</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> Early access to AI models</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#c0c1ff]" /> Priority human support</li>
              </ul>
              <Link href="/register">
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300">
                  Get Elite
                </button>
              </Link>
            </div>

          </div>
        </section>

        {/* Feature Comparison Table Section */}
        <section className="w-full max-w-[1280px] mx-auto px-6 md:px-10 mb-24 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
          <div className="bg-[#12131C]/35 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)] overflow-hidden">
            <h2 className="text-xl font-extrabold text-white mb-8">Compare Features</h2>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="py-4 font-semibold">Feature</th>
                    <th className="py-4 font-semibold">Base</th>
                    <th className="py-4 font-semibold text-[#C98BFE]">Pro</th>
                    <th className="py-4 font-semibold">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-4 text-white font-medium">Workout Logging</td>
                    <td className="py-4 text-neutral-400">Basic</td>
                    <td className="py-4 text-white font-bold">Unlimited</td>
                    <td className="py-4 text-white font-bold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-white font-medium">AI Insights</td>
                    <td className="py-4 text-neutral-400">—</td>
                    <td className="py-4 text-white"><Check className="h-4 w-4 text-[#C98BFE]" /></td>
                    <td className="py-4 text-white"><Check className="h-4 w-4 text-[#C98BFE]" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 text-white font-medium">1-on-1 Coaching</td>
                    <td className="py-4 text-neutral-400">—</td>
                    <td className="py-4 text-neutral-400">—</td>
                    <td className="py-4 text-white"><Check className="h-4 w-4 text-[#C98BFE]" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="w-full max-w-3xl mx-auto px-6 md:px-0 mb-24 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
          <h2 className="text-2xl font-black text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
              },
              {
                q: "Is there a contract?",
                a: "No contracts. Momentum is billed month-to-month or annually. You can cancel your subscription at any time without penalty."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-[#12131C]/35 backdrop-blur-2xl border border-white/[0.08] rounded-xl overflow-hidden cursor-pointer transition-colors duration-300 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)]"
                onClick={() => toggleFaq(idx)}
              >
                <div className="p-6 flex justify-between items-center select-none">
                  <h4 className="text-sm md:text-base font-bold text-white">{faq.q}</h4>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-neutral-400 transition-transform duration-300",
                    faqOpen[idx] ? "transform rotate-180 text-white" : ""
                  )} />
                </div>
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-out px-6 text-xs md:text-sm text-[#c7c4d7]/70 leading-relaxed",
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
      <footer className="w-full relative z-10 bg-black/40 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2">
            <div className="font-bold text-xl text-white flex items-center gap-2">
              <Triangle className="h-5 w-5 text-[#C98BFE] fill-[#C98BFE]/20 rotate-180" />
              <span>Momentum</span>
            </div>
            <p className="text-xs md:text-sm text-[#c7c4d7]/70 mt-4 max-w-sm leading-relaxed">
              High-performance systems for individuals who refuse to stagnate.
            </p>
            <p className="text-xs text-[#c7c4d7]/50 mt-8">
              © 2026 Momentum AI. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-3 text-xs">
              <li><a className="text-[#c7c4d7]/70 hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-[#c7c4d7]/70 hover:text-white transition-colors" href="#">Terms of Service</a></li>
              <li><a className="text-[#c7c4d7]/70 hover:text-white transition-colors" href="#">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Connect</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a className="text-[#c7c4d7]/70 hover:text-white transition-colors flex items-center gap-2" href="#">
                  <MessageSquare className="h-4 w-4" /> Contact Support
                </a>
              </li>
              <li>
                <a className="text-[#c7c4d7]/70 hover:text-white transition-colors flex items-center gap-2" href="#">
                  <Globe className="h-4 w-4" /> Twitter
                </a>
              </li>
              <li>
                <a className="text-[#c7c4d7]/70 hover:text-white transition-colors flex items-center gap-2" href="#">
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
