"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Activity,
  Timer,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Types for Mock Dashboard Preview
type DashboardTab = "ai" | "tasks" | "workout" | "metrics";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  
  // Theme state: defaults to dark (#09090B) as requested
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [enterpriseRequested, setEnterpriseRequested] = useState(false);
  const [enterpriseLoading, setEnterpriseLoading] = useState(false);

  const handleEnterpriseClick = async (e: React.MouseEvent) => {
    if (!isLoggedIn) return; // Follow default Link route to /register
    e.preventDefault();
    setEnterpriseLoading(true);
    try {
      const { api } = await import("@/lib/api");
      const res = await api.contactEnterprise();
      if (res.success) {
        setEnterpriseRequested(true);
      }
    } catch (err) {
      console.error("Enterprise request failed:", err);
      alert("Failed to send Enterprise request. Please try again.");
    } finally {
      setEnterpriseLoading(false);
    }
  };

  // Dashboard preview state
  const [activePreviewTab, setActivePreviewTab] = useState<DashboardTab>("ai");

  // Timer simulation state in preview
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 mins
  const [timerActive, setTimerActive] = useState(false);

  // Counter animation trigger
  const [countersActive, setCountersActive] = useState(false);

  // Scroll tracking for navbar shrink
  const [scrollY, setScrollY] = useState(0);

  // Mouse position for cursor glow spotlight effect
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled = scrollY > 80;

  useEffect(() => {
    // Check local storage or preference on mount
    const savedTheme = localStorage.getItem("momentum_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to dark mode
      document.documentElement.classList.add("dark");
      localStorage.setItem("momentum_theme", "dark");
    }
    setCountersActive(true);

    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Failed to fetch session on landing page:", err);
      }
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  // Timer formatter
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Focus Timer interval simulation
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 1500));
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const basePrice = "Free";
  const proPrice = isYearly ? "$120" : "$12";
  const proPeriod = isYearly ? "/yr" : "/mo";
  const elitePrice = isYearly ? "$290" : "$29";
  const elitePeriod = isYearly ? "/yr" : "/mo";

  // Canvas drawing ref
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

      // Color scheme adapts to theme
      const gridColor = theme === "dark" 
        ? "rgba(196,181,253,0.06)" // dark purple grid
        : "rgba(99,102,241,0.07)";  // light indigo grid
      
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

  // Intersection Observer for animations
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
      { threshold: 0.05 }
    );

    document.querySelectorAll(".reveal-fade").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-[#09090B] dark:text-[#FAFAFA] antialiased overflow-x-hidden transition-colors duration-500 font-sans">
      
      {/* ── Background Grid & volumetric light ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Mouse-following purple spotlight glow */}
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: theme === "dark"
              ? "radial-gradient(circle, rgba(167,139,250,0.12) 0%, rgba(196,181,253,0.05) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(167,139,250,0.10) 40%, transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Faint blueprint grid overlay */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.035] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Ambient top soft purple/pink glow - boosted for dark mode */}
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1400px] h-[700px] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.07)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse,rgba(196,181,253,0.22)_0%,rgba(249,168,212,0.08)_50%,transparent_75%)] blur-[80px]" />
        
        {/* Soft volumetric center light ray - brighter dark mode */}
        <div className="absolute top-[20%] left-1/3 w-[500px] h-[500px] rounded-full hidden dark:block dark:bg-[radial-gradient(circle,rgba(167,139,250,0.06)_0%,transparent_65%)] blur-[60px]" />

        {/* Perspective grid lines canvas */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[220%] h-[75%] opacity-50 dark:opacity-70" style={{ perspective: "600px" }}>
          <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Dynamic scan lines */}
        <div className="absolute left-0 right-0 h-[1.5px] bg-[linear-gradient(90deg,transparent_0%,rgba(167,139,250,0.15)_30%,rgba(249,168,212,0.25)_50%,rgba(167,139,250,0.15)_70%,transparent_100%)] dark:bg-[linear-gradient(90deg,transparent_0%,rgba(167,139,250,0.15)_30%,rgba(249,168,212,0.25)_50%,rgba(167,139,250,0.15)_70%,transparent_100%)] hidden dark:block blur-[1px] animate-[scan_10s_linear_infinite]" />

        {/* Film grain layer */}
        <div className="absolute -inset-1/2 w-[200%] h-[200%] opacity-[0.005] dark:opacity-[0.015] animate-[grain-anim_0.08s_steps(1)_infinite] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }} />
      </div>

      {/* ── Center Navigation Bar (Inspired by Arc/Apple) ── */}
      <header className="fixed top-0 w-full z-50 transition-all duration-500">
        <div className={cn(
          "max-w-[1280px] mx-auto px-6 md:px-10 transition-all duration-500",
          isScrolled ? "py-2" : "py-5"
        )}>
          <nav className={cn(
            "flex justify-between items-center backdrop-blur-2xl border border-slate-200/50 dark:border-white/[0.06] rounded-full w-full transition-all duration-500",
            isScrolled
              ? "bg-white/85 dark:bg-[#111114]/90 backdrop-blur-3xl px-6 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_35px_rgba(0,0,0,0.5)]"
              : "bg-white/70 dark:bg-[#111114]/65 px-8 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)]"
          )}>
            
            {/* Left Brand Logo */}
            <Link href="/" className="font-sans font-bold text-lg tracking-tighter flex items-center gap-2 group text-[#09090B] dark:text-white">
              <div className="relative h-5 w-5 rounded-md overflow-hidden flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-white/10">
                <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="20px" className="object-cover" />
              </div>
              <span className="font-extrabold text-base tracking-tight">ZenithFlow</span>
            </Link>

            {/* Mid Links */}
            <ul className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-[#A1A1AA]">
              <li><a href="#features" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Features</a></li>
              <li><Link href="/pricing" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Pricing</Link></li>
              <li><a href="#coach" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">AI Coach</a></li>
              <li><a href="#analytics" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Analytics</a></li>
              <li><a href="#about" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">About</a></li>
            </ul>

            {/* Actions & Theme Swapper */}
            <div className="flex items-center gap-4">
              
              {/* Light/Dark Toggle */}
              <button 
                onClick={toggleTheme} 
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-[#A1A1AA]"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {isLoggedIn ? (
                <Link href="/dashboard" className="hidden sm:inline-flex">
                  <button className="relative bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(167,139,250,0.3)]">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-flex">
                    <Button variant="ghost" className="text-xs uppercase tracking-widest font-bold text-slate-600 dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white px-3 py-1">
                      Login
                    </Button>
                  </Link>
                  
                  <Link href="/register" className="hidden sm:inline-flex">
                    <button className="relative bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(167,139,250,0.3)]">
                      Register
                    </button>
                  </Link>
                </>
              )}

              {/* Mobile hamburger — animated ☰ / ✕ toggle */}
              <button
                className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ml-1"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
              >
                <motion.div
                  animate={menuOpen ? { rotate: 90, opacity: 0.7 } : { rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              </button>
            </div>

          </nav>
        </div>
      </header>

      {/* Mobile Dropdown Navigation — slides down from navbar, no backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-nav-dropdown"
            initial={{ opacity: 0, y: -12, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -12, scaleY: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top center" }}
            className="fixed top-[64px] left-4 right-4 z-40 lg:hidden rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/95 dark:bg-[#0e0e10]/95 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            {/* Subtle top gradient line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/40 to-transparent" />

            <div className="p-4 space-y-1">
              {[
                { label: "Features",  href: "#features",   isLink: false },
                { label: "Pricing",   href: "/pricing",    isLink: true  },
                { label: "AI Coach",  href: "#coach",      isLink: false },
                { label: "Analytics", href: "#analytics",  isLink: false },
                { label: "About",     href: "#about",      isLink: false },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.045, duration: 0.2 }}
                >
                  {item.isLink ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#A78BFA] transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#A78BFA] transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  )}
                </motion.div>
              ))}

              {/* Divider */}
              <div className="my-2 border-t border-slate-100 dark:border-white/5" />

              {/* Auth buttons */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.2 }}
                className="flex flex-col gap-2 px-1 pt-1"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <button className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black py-3 rounded-xl text-sm font-extrabold tracking-widest transition-opacity hover:opacity-90">
                      Dashboard →
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      <button className="w-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-bold tracking-wider hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)}>
                      <button className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black py-3 rounded-xl text-sm font-extrabold tracking-widest transition-opacity hover:opacity-90">
                        Register
                      </button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <main className="relative z-10 pt-24">
        
        {/* 1. HERO SECTION */}
        <section className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center pt-8 md:pt-16 pb-20 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text Content (7 Columns) */}
            <div className="lg:col-span-6 space-y-8 text-left">
              
              {/* Beta Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] dark:shadow-[0_0_12px_rgba(167,139,250,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse shadow-[0_0_6px_rgba(167,139,250,0.8)]"></span>
                <span className="text-[10px] font-bold tracking-widest text-[#A1A1AA] dark:text-[#C4B5FD] text-slate-500 uppercase">Intelligent Workspace v2.0</span>
              </div>

              {/* Headings: Editorial Instrument Serif */}
              <h1 className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out font-serif font-bold text-[68px] md:text-[92px] leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#09090B] via-[#09090B] to-slate-700 dark:from-white dark:via-neutral-100 dark:to-neutral-300">
                Master Your <br />
                <span className="font-serif italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#FDBA74] pr-2 filter drop-shadow-[0_2px_20px_rgba(167,139,250,0.45)]">ZenithFlow.</span>
              </h1>

              {/* Sub-text Description */}
              <p className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out text-sm md:text-base text-slate-500 dark:text-neutral-300 text-slate-600 max-w-xl leading-relaxed">
                AI-powered productivity meets intelligent fitness tracking, habit building, deep analytics, and personal growth in one immersive digital workspace. 
              </p>

              {/* Two CTA Buttons */}
              <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out flex flex-row items-center gap-4 pt-2">
                <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                  <button className="relative bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-7 py-3.5 rounded-[18px] text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_25px_-5px_rgba(167,139,250,0.4)] hover:shadow-[0_8px_30px_rgba(167,139,250,0.6)] flex items-center justify-center gap-2 border border-white/20">
                    {isLoggedIn ? "Go to Dashboard" : "Start Building"}
                    <ArrowRight className="h-3.5 w-3.5 text-black" />
                  </button>
                </Link>
                <a href="#preview">
                  <button className="bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] text-slate-800 dark:text-white px-7 py-3.5 rounded-[18px] text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-white/10 transition-all duration-300 backdrop-blur-xl">
                    Watch Demo
                  </button>
                </a>
              </div>

            </div>

            {/* Right Hero Illustration: Floating Futuristic Dashboard Widgets (6 Columns) */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] lg:min-h-[500px]">
              
              {/* Soft decorative elements background */}
              <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-200/50 dark:border-white/[0.03] pointer-events-none -z-10 animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-slate-200/40 dark:border-white/[0.03] pointer-events-none -z-10" />

              {/* Glowing Purple light streaks */}
              <div className="absolute top-1/4 left-1/4 w-[160px] h-[160px] rounded-full bg-[#A78BFA]/10 blur-[40px] pointer-events-none animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-[160px] h-[160px] rounded-full bg-[#FDBA74]/5 blur-[40px] pointer-events-none animate-pulse" />

              {/* Blueprint mesh dots grid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.015)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] pointer-events-none -z-10" />

              {/* Futuristic Widget Group (Floating Mockup) */}
              <div className="w-full relative space-y-4 max-w-[480px]">

                {/* 1. AI Assistant Chat Box Widget */}
                <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 bg-white/80 dark:bg-[#111114]/65 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] p-4 rounded-2xl shadow-xl flex items-start gap-3 relative transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                    <Brain className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">ZenithFlow AI</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700 dark:text-neutral-300">
                      "Biometrics look optimal today. Recommended block: 90min Deep Work at 10:00 AM, followed by a volume Chest routine."
                    </p>
                  </div>
                  {/* Glowing connector lines indicator */}
                  <div className="absolute -bottom-8 left-10 w-0.5 h-8 bg-gradient-to-b from-[#A78BFA]/40 to-transparent pointer-events-none" />
                </div>

                {/* Second row widgets (Side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* 2. Habit Tracker Card */}
                  <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 delay-100 bg-white/80 dark:bg-[#111114]/65 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] p-4 rounded-2xl shadow-xl space-y-3 transform hover:-translate-y-1 transition-transform duration-300">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Habits</span>
                    <ul className="space-y-2 text-[10px] text-slate-700 dark:text-neutral-300 font-semibold">
                      <li className="flex items-center justify-between">
                        <span>🧘 Meditation</span>
                        <Check className="h-3 w-3 text-emerald-500" />
                      </li>
                      <li className="flex items-center justify-between">
                        <span>💧 3L Hydration</span>
                        <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-white/20 border-slate-300"></div>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>📚 Deep Read</span>
                        <Check className="h-3 w-3 text-emerald-500" />
                      </li>
                    </ul>
                  </div>

                  {/* 3. Focus Timer Widget */}
                  <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 delay-200 bg-white/80 dark:bg-[#111114]/65 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] p-4 rounded-2xl shadow-xl flex flex-col justify-between items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Focus Block</span>
                    <div className="font-mono text-xl font-extrabold text-[#FDBA74] my-2">25:00</div>
                    <div className="flex gap-2">
                      <div className="h-5 w-5 rounded-full bg-neutral-800 dark:bg-neutral-800 bg-slate-200 flex items-center justify-center">
                        <Play className="h-2.5 w-2.5 fill-white dark:fill-white fill-slate-800" />
                      </div>
                      <div className="h-5 w-5 rounded-full bg-neutral-800 dark:bg-neutral-800 bg-slate-200 flex items-center justify-center">
                        <RotateCcw className="h-2.5 w-2.5 text-neutral-400" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4. Workout Cardio / Progress Ring Widget */}
                <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 delay-300 bg-white/80 dark:bg-[#111114]/65 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] p-4 rounded-2xl shadow-xl flex justify-between items-center transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Dumbbell className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Push Day routine</h4>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mt-0.5">Vol: 4,800 kg logged</span>
                    </div>
                  </div>
                  
                  {/* Small progress ring indicator */}
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" fill="transparent" />
                      <circle cx="16" cy="16" r="12" stroke="#A78BFA" strokeWidth="2.5" fill="transparent" strokeDasharray="75" strokeDashoffset="25" />
                    </svg>
                    <span className="absolute text-[8px] font-bold font-mono">75%</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* 2. THE SAAS INTERACTIVE PREVIEW PANEL */}
        <section id="preview" className="relative py-20 max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-12 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#09090B] dark:text-white tracking-tight mb-4">Cockpit Walkthrough</h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-[#A1A1AA] max-w-xl mx-auto">
              Click the tabs below to dynamically view the different cockpits inside the ZenithFlow platform.
            </p>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 bg-white dark:bg-[#111114]/50 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-2xl relative">
            
            {/* Header controls matching Prospector mockup style */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center pb-6 border-b border-slate-100 dark:border-white/[0.08] gap-4 mb-6">
              
              {/* Fake browser control bar */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Traffic lights */}
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
                </div>
                {/* Back/Forward navigation */}
                <div className="hidden sm:flex gap-1 shrink-0 text-slate-400 dark:text-neutral-600">
                  <button disabled className="p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 opacity-50 cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
                  <button disabled className="p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 opacity-50 cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
                </div>
                {/* Modern address bar */}
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/5 px-2.5 sm:px-4 py-2 rounded-xl flex items-center justify-between gap-1.5 font-mono flex-1 max-w-md shadow-inner overflow-hidden min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <Lock className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="hidden sm:inline text-slate-400 dark:text-neutral-500">https://</span>
                    <span className="text-slate-800 dark:text-white font-semibold truncate">zenithflow.dev</span>
                    <span className="text-slate-300 dark:text-neutral-700">/</span>
                    <span className="text-[#A78BFA] font-bold shrink-0">{activePreviewTab}</span>
                  </div>
                  <RotateCcw className="h-3 w-3 text-slate-400 dark:text-neutral-500 cursor-pointer hover:text-[#A78BFA] transition-colors shrink-0" />
                </div>
              </div>

              {/* Tabs list (Tasks, Workouts, Nutrition, AI) */}
              <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-neutral-900/80 p-1 border border-slate-200/60 dark:border-white/5 rounded-xl shrink-0 relative">
                {([
                  {
                    id: "ai",
                    label: "AI Assistant",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.15" />
                        <circle cx="9" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
                        <circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
                      </svg>
                    ),
                  },
                  {
                    id: "tasks",
                    label: "Tasks",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                        <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12l2.5 2.5L16 9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    id: "workout",
                    label: "Gym",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                        <defs>
                          <linearGradient id="tabGymGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2.5" />
                        <rect x="2" y="10" width="4" height="4" rx="1" fill="url(#tabGymGrad)" stroke="currentColor" strokeWidth="1.8" />
                        <rect x="18" y="10" width="4" height="4" rx="1" fill="url(#tabGymGrad)" stroke="currentColor" strokeWidth="1.8" />
                        <line x1="4" y1="8" x2="4" y2="16" strokeWidth="2" />
                        <line x1="20" y1="8" x2="20" y2="16" strokeWidth="2" />
                      </svg>
                    ),
                  },
                  {
                    id: "metrics",
                    label: "Metrics",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                        <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.8" />
                        <polyline points="7,16 10,11 13,14 17,8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="17" cy="8" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    ),
                  },
                ] as { id: string; label: string; icon: React.ReactNode }[]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActivePreviewTab(t.id as DashboardTab)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 z-10",
                      activePreviewTab === t.id
                        ? "text-black dark:text-black font-extrabold"
                        : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                    )}
                  >
                    {activePreviewTab === t.id && (
                      <motion.div
                        layoutId="activePreviewTabPill"
                        className="absolute inset-0 bg-[#A78BFA] rounded-lg shadow-md -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {t.icon}
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Inner Dashboard View Renderer */}
            <div className="min-h-[350px] relative rounded-2xl bg-slate-50/50 dark:bg-neutral-950/65 border border-slate-200/50 dark:border-white/5 p-4 sm:p-6">
              
              {/* TAB 1: AI */}
              {activePreviewTab === "ai" && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-[#111114]/80 border border-slate-200/60 dark:border-white/[0.08] p-5 rounded-2xl flex gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Biometric Recovery Insights</h4>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-neutral-400">
                        "Your HRV (Heart Rate Variability) is up by 15% today, signaling excellent autonomic nervous system recovery. However, deep sleep was slightly abbreviated. I suggest focusing on hypertrophy rather than heavy power complexes. Perform bench sets at RPE 8."
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#111114]/80 border border-slate-200/60 dark:border-white/[0.08] p-5 rounded-2xl flex gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#FDBA74]/10 flex items-center justify-center text-[#FDBA74]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Productivity Block recommendations</h4>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-neutral-400">
                        "You typically experience peak focus between 09:30 AM and 11:30 AM. I have auto-scheduled a 90-minute deep work block and muted distractions to enable optimal cognitive performance."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TASKS */}
              {activePreviewTab === "tasks" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Task list matching Prospector mockup style */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Active Priorities</h4>
                    <div className="space-y-2">
                      {[
                        { title: "Refactor API server auth endpoints", status: "completed" },
                        { title: "Design light mode CSS system", status: "pending" },
                        { title: "Review marketing graphics deck", status: "pending" },
                      ].map((task, i) => (
                        <div key={i} className="flex justify-between items-center p-3.5 bg-white dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 border-slate-200/50 rounded-xl">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-neutral-300">{task.title}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                            task.status === "completed" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "bg-amber-500/10 text-amber-400"
                          )}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule block */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Today's Protocol</h4>
                    <div className="space-y-2">
                      {[
                        { time: "09:30 AM", act: "Deep Focus (Code Refactor)", duration: "90 min" },
                        { time: "12:00 PM", act: "Hypertrophy Push Workout", duration: "60 min" },
                        { time: "03:30 PM", act: "Synchronous Team Sync", duration: "30 min" },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3.5 bg-white dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 border-slate-200/50 rounded-xl">
                          <div>
                            <span className="text-[9px] font-mono text-[#A78BFA] block">{item.time}</span>
                            <span className="text-[11px] font-bold text-[#09090B] dark:text-white">{item.act}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold">{item.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: WORKOUT */}
              {activePreviewTab === "workout" && (
                <div className="space-y-6">
                  
                  {/* Routine Info header */}
                  <div className="flex justify-between items-center p-4 bg-white dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 border-slate-200/50 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-[#09090B] dark:text-white">Monday - Chest & Triceps</h4>
                      <span className="text-[9px] text-slate-400 dark:text-neutral-500 mt-1 block uppercase tracking-wider">Volume Target: 5,400 kg</span>
                    </div>
                    
                    {/* Live Timer Controls in Preview */}
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-neutral-950 px-4 py-1.5 rounded-full border border-white/5 dark:border-white/5 border-slate-200">
                      <button 
                        onClick={() => setTimerActive(!timerActive)}
                        className="h-4 w-4 bg-[#A78BFA] rounded-full flex items-center justify-center text-black"
                      >
                        {timerActive ? "||" : "▶"}
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300">{formatTimer(timerSeconds)}</span>
                    </div>
                  </div>

                  {/* Exercises Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: "Incline Dumbbell Press", sets: "4 Sets × 8-10 reps", last: "40kg × 8 reps" },
                      { name: "Flat Barbell Bench Press", sets: "3 Sets × 6-8 reps", last: "100kg × 7 reps" },
                    ].map((ex, i) => (
                      <div key={i} className="bg-white dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 border-slate-200/50 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-[#09090B] dark:text-white">{ex.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-neutral-500">{ex.sets}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-neutral-400 pt-1.5 border-t border-slate-100 dark:border-white/5 flex justify-between font-mono">
                          <span>Previous PR:</span>
                          <span className="text-slate-700 dark:text-neutral-300">{ex.last}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 4: METRICS */}
              {activePreviewTab === "metrics" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Daily Water Goal", val: "2.4 / 3.0 Liters", progress: "80%" },
                    { label: "Calorie Intake", val: "2,150 / 2,800 kcal", progress: "76%" },
                    { label: "Workout Volume", val: "4,800 kg completed", progress: "100%" },
                    { label: "Task Completion", val: "4 / 5 completed", progress: "80%" },
                  ].map((m, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 border-slate-200/50 p-4 rounded-xl space-y-3">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">{m.label}</span>
                      <span className="text-sm font-extrabold text-[#09090B] dark:text-white block">{m.val}</span>
                      
                      <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/5 dark:border-white/5 border-slate-200">
                          <div className="h-full bg-gradient-to-r from-[#A78BFA] to-[#F9A8D4]" style={{ width: m.progress }} />
                        </div>
                        <span className="text-[8px] text-slate-400 dark:text-neutral-500 font-mono flex justify-end">{m.progress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </section>

        {/* 3. THREE PREMIUM FEATURE CARDS */}
        <section id="features" className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#09090B] dark:text-white tracking-tight mb-4">Precision Engineering for the Mind & Body</h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-[#A1A1AA] max-w-xl mx-auto">
              Seamlessly integrate your physical habits and mental focus using our custom glassmorphism dashboard modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: AI Coach */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between group hover:border-[#A78BFA]/30 dark:hover:border-[#A78BFA]/30 hover:border-[#A78BFA]/50 transition-all duration-500 relative overflow-hidden shadow-2xl">
              {/* Highlight line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent"></div>
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-900 bg-slate-100 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 text-[#A78BFA]">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">AI Coach</h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-[#A1A1AA] leading-relaxed">
                  Personalized suggestions powered by intelligent reasoning. Syncs metrics dynamically.
                </p>
              </div>

              {/* Glowing decorative connection points */}
              <div className="mt-8 pt-4 border-t border-white/5 dark:border-t-white/5 border-t-slate-100 flex items-center justify-between text-[10px] text-neutral-500 font-semibold font-mono">
                <span>INTEL. SYSTEM</span>
                <span className="text-[#A78BFA]">01_REASONING</span>
              </div>
            </div>

            {/* Card 2: Smart Analytics */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between group hover:border-[#F9A8D4]/30 dark:hover:border-[#F9A8D4]/30 hover:border-[#F9A8D4]/50 transition-all duration-500 relative overflow-hidden shadow-2xl">
              {/* Highlight line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F9A8D4]/30 to-transparent"></div>
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-900 bg-slate-100 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 text-[#F9A8D4]">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Smart Analytics</h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-[#A1A1AA] leading-relaxed">
                  Visual insights into productivity, health, and focus. Maps sleep vectors and HRV trends.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 dark:border-t-white/5 border-t-slate-100 flex items-center justify-between text-[10px] text-neutral-500 font-semibold font-mono">
                <span>GRAPH VECTORS</span>
                <span className="text-[#F9A8D4]">02_BIOMETRICS</span>
              </div>
            </div>

            {/* Card 3: Habit Engine */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between group hover:border-[#FDBA74]/30 dark:hover:border-[#FDBA74]/30 hover:border-[#FDBA74]/50 transition-all duration-500 relative overflow-hidden shadow-2xl">
              {/* Highlight line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FDBA74]/30 to-transparent"></div>
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-900 bg-slate-100 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 text-[#FDBA74]">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Habit Engine</h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-[#A1A1AA] leading-relaxed">
                  Build consistent routines with adaptive AI reminders. Keeps you focused day-by-day.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 dark:border-t-white/5 border-t-slate-100 flex items-center justify-between text-[10px] text-neutral-500 font-semibold font-mono">
                <span>CORE SCHEDULER</span>
                <span className="text-[#FDBA74]">03_ROUTINES</span>
              </div>
            </div>

          </div>
        </section>

        {/* 4. METRICS / STATS SECTION */}
        <section className="relative py-20 border-y border-white/[0.05] dark:border-white/[0.05] border-slate-200 bg-[#111114]/30 dark:bg-[#111114]/30 bg-slate-100/50 backdrop-blur-md">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              
              <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 space-y-2">
                <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white block">98%</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-widest">Beta Goal Completion</span>
              </div>

              <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 delay-100 space-y-2">
                <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white block">250K+</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-widest">Launch Waitlist Signups</span>
              </div>

              <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 delay-200 space-y-2">
                <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white block">40M+</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-widest">Beta Tasks Completed</span>
              </div>

              <div className="reveal-fade opacity-0 translate-y-[20px] transition-all duration-1000 delay-300 space-y-2">
                <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white block">4.9★</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-widest">Private Beta Rating</span>
              </div>

            </div>
          </div>
        </section>

        {/* 5. TESTIMONIALS SECTION */}
        <section className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#09090B] dark:text-white tracking-tight mb-4">Early Adopter Acclaim</h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-[#A1A1AA] max-w-xl mx-auto">
              What our private beta users are saying about utilizing ZenithFlow ahead of the public launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The integration of deep work timers with biometrics is absolute genius. I've doubled my development velocity without burning out.",
                author: "Sarah Jenkins",
                role: "Lead Systems Architect, Vercel",
                rating: "⭐⭐⭐⭐⭐"
              },
              {
                quote: "Logging workouts has never felt this premium. The RPE charts combined with active target recommendations keep me incredibly honest.",
                author: "David Chen",
                role: "Product Designer, Linear",
                rating: "⭐⭐⭐⭐⭐"
              },
              {
                quote: "ZenithFlow is now my primary workspace. The AI advice is clean, logical, and structured without the useless fluff you get with standard bots.",
                author: "Elena Rostova",
                role: "Founder, Peak Cognitive",
                rating: "⭐⭐⭐⭐⭐"
              }
            ].map((t, idx) => (
              <div 
                key={idx} 
                className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-8 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-4">
                  <div className="text-xs">{t.rating}</div>
                  <p className="text-xs md:text-sm text-slate-700 dark:text-neutral-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-3 border-t border-white/5 dark:border-t-white/5 border-t-slate-100 pt-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-800 bg-slate-200 flex items-center justify-center font-bold text-xs text-[#A78BFA] font-mono">
                    {t.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{t.author}</h4>
                    <span className="text-[10px] text-neutral-500">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. PRICING SECTION */}
        <section id="pricing" className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#09090B] dark:text-white tracking-tight mb-4">Predictable Subscription Packages</h2>
            
            {/* Toggle yearly */}
            <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-neutral-900/60 border border-white/5 dark:border-white/5 border-slate-200 px-3.5 py-1.5 rounded-full mt-4">
              <button 
                onClick={() => setIsYearly(false)}
                className={cn("px-3.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all", !isYearly ? "bg-white text-black" : "text-neutral-500")}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={cn("px-3.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all", isYearly ? "bg-white text-black" : "text-neutral-500")}
              >
                Yearly (-20%)
              </button>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Starter Plan */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Starter</h3>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{basePrice}</span>
                
                <ul className="space-y-3.5 text-xs text-neutral-400 mt-8 font-medium">
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Basic Task Management</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Simple Gym Log History</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Manual Water Intake logging</li>
                </ul>
              </div>

              <Link href={isLoggedIn ? "/dashboard" : "/register"} className="mt-8">
                <button className="w-full bg-slate-100 dark:bg-white/5 text-white dark:text-white text-slate-700 py-3 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-colors border border-white/5 dark:border-white/5 border-slate-200">
                  {isLoggedIn ? "Go to Dashboard" : "Deploy Starter"}
                </button>
              </Link>
            </div>

            {/* Pro Plan (Highlighted + glowing purple ambient lighting) */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 bg-white dark:bg-[#111114]/80 border border-[#A78BFA]/30 dark:border-[#A78BFA]/30 border-[#A78BFA]/50 rounded-[24px] p-8 flex flex-col justify-between shadow-[0_20px_45px_-10px_rgba(167,139,250,0.25)] dark:shadow-[0_20px_45px_-10px_rgba(167,139,250,0.25)] shadow-[0_20px_40px_rgba(167,139,250,0.15)] relative">
              
              {/* Highlight Label Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#A78BFA] to-[#F9A8D4] text-black text-[9px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-white/20">
                Most Popular
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Pro</h3>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{proPrice} <span className="text-xs text-neutral-400 font-normal">{proPeriod}</span></span>
                
                <ul className="space-y-3.5 text-xs text-slate-700 dark:text-neutral-300 mt-8 font-medium">
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Everything in Starter</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Full AI Coach Biometric Feedback</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Unlimited Workout Volume tracking</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Advanced Focus Analytics trend graphs</li>
                </ul>
              </div>

              <Link href={isLoggedIn ? "/dashboard" : "/register"} className="mt-8">
                <button className="w-full bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-opacity shadow-md shadow-[#A78BFA]/20">
                  {isLoggedIn ? "Go to Dashboard" : "Upgrade to Pro"}
                </button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-8 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Enterprise</h3>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{elitePrice} <span className="text-xs text-neutral-400 font-normal">{elitePeriod}</span></span>
                
                <ul className="space-y-3.5 text-xs text-neutral-400 mt-8">
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Custom Workspace Teams Integration</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Dedicated Coach consult sessions</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Priority Server Speed response</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#A78BFA]" /> Single Sign-On (SSO) Support</li>
                </ul>
              </div>

              {isLoggedIn ? (
                <button 
                  onClick={handleEnterpriseClick}
                  disabled={enterpriseRequested || enterpriseLoading}
                  className="w-full bg-slate-100 dark:bg-white/5 text-white dark:text-white text-slate-700 py-3 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-colors border border-white/5 dark:border-white/5 border-slate-200 mt-8 disabled:opacity-50"
                >
                  {enterpriseLoading ? "Sending..." : enterpriseRequested ? "Requested!" : "Contact Admin"}
                </button>
              ) : (
                <Link href="/register" className="mt-8">
                  <button className="w-full bg-slate-100 dark:bg-white/5 text-white dark:text-white text-slate-700 py-3 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-colors border border-white/5 dark:border-white/5 border-slate-200">
                    Deploy Enterprise
                  </button>
                </Link>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full relative z-10 bg-transparent py-12 transition-all duration-500">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          
          {/* Inner card taking inspiration from Graphy footer style */}
          <div className="bg-white dark:bg-[#0d0d0e]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.06] rounded-[32px] p-8 md:p-16 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 transition-all duration-500">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column (Brand + Desc + Socials) */}
              <div className="lg:col-span-5 space-y-6">
                <Link href="/" className="font-sans font-bold text-xl text-[#09090B] dark:text-white flex items-center gap-2.5 group">
                  <div className="relative h-6 w-6 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="24px" className="object-cover" />
                  </div>
                  <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-white dark:to-neutral-300">
                    ZenithFlow
                  </span>
                </Link>
                <p className="text-xs md:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed max-w-sm">
                  ZenithFlow empowers individuals to synchronize biomechanical logging, nutrition tracking, and daily focus blocks — making performance easier to master, analyze, and sustain.
                </p>
                
                {/* Social Links (Clean outline SVG format as inspired by Graphy) */}
                <div className="flex items-center gap-5 pt-2 text-slate-400 dark:text-neutral-500">
                  <a href="#" aria-label="X (Twitter)" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Instagram" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
                    <svg className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
                    <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="#" aria-label="GitHub" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
                    <svg className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product Column */}
              <div className="lg:col-span-3 lg:col-start-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Product</h4>
                <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-neutral-400">
                  <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Features</a></li>
                  <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Pricing</Link></li>
                  <li><a href="#coach" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">AI Coach</a></li>
                  <li><a href="#analytics" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Analytics</a></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="lg:col-span-3 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Resources</h4>
                <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-neutral-400">
                  <li><a className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Documentation</a></li>
                  <li><a className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Tutorials</a></li>
                  <li><a className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Blog</a></li>
                  <li><a className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Support</a></li>
                </ul>
              </div>
            </div>

            {/* Divider line */}
            <div className="h-px bg-slate-200/60 dark:bg-white/5 w-full my-8 md:my-10" />

            {/* Bottom Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-neutral-500 font-medium">
              <span>© 2026 ZenithFlow. All rights reserved.</span>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</Link>
                <a className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Cookies Settings</a>
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
