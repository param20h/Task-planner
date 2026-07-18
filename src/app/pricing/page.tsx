"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  Moon,
  Calendar,
  Activity,
  Brain,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/lib/api";
import { AnimatedThemeToggler } from "@/components/ui/AnimatedThemeToggler";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const [enterpriseRequested, setEnterpriseRequested] = useState(false);
  const [enterpriseLoading, setEnterpriseLoading] = useState(false);

  const handleEnterpriseClick = async (e: React.MouseEvent) => {
    if (!userId) return; // Follow default Link route to /register
    e.preventDefault();
    setEnterpriseLoading(true);
    try {
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
  
  // Dynamic Currency Detection states
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Theme state: defaults to dark (#09090B) as requested
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const CURRENCIES: Record<string, { symbol: string; monthly: number; yearly: number; country: string }> = {
    USD: { symbol: "$",   monthly: 12,    yearly: 120,   country: "US" },
    INR: { symbol: "₹",   monthly: 249,   yearly: 2490,  country: "IN" },
    EUR: { symbol: "€",   monthly: 11,    yearly: 110,   country: "EU" },
    GBP: { symbol: "£",   monthly: 10,    yearly: 100,   country: "GB" },
    CAD: { symbol: "C$",  monthly: 16,    yearly: 160,   country: "CA" },
    AUD: { symbol: "A$",  monthly: 18,    yearly: 180,   country: "AU" },
    BRL: { symbol: "R$",  monthly: 59,    yearly: 590,   country: "BR" },
    JPY: { symbol: "¥",   monthly: 1800,  yearly: 18000, country: "JP" },
    SGD: { symbol: "S$",  monthly: 16,    yearly: 160,   country: "SG" },
    AED: { symbol: "د.إ", monthly: 44,    yearly: 440,   country: "AE" },
    MXN: { symbol: "MX$", monthly: 200,   yearly: 2000,  country: "MX" },
    CHF: { symbol: "Fr",  monthly: 11,    yearly: 110,   country: "CH" },
    SEK: { symbol: "kr",  monthly: 130,   yearly: 1300,  country: "SE" },
  };

  // Country → currency code lookup for geo API responses
  const COUNTRY_CURRENCY: Record<string, string> = {
    US: "USD", IN: "INR", GB: "GBP", AU: "AUD", CA: "CAD",
    BR: "BRL", JP: "JPY", SG: "SGD", AE: "AED", MX: "MXN",
    CH: "CHF", SE: "SEK", NO: "SEK", DK: "SEK",
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
    BE: "EUR", AT: "EUR", PT: "EUR", FI: "EUR", IE: "EUR",
    GR: "EUR", PL: "EUR", CZ: "EUR", SK: "EUR", SI: "EUR",
    LU: "EUR", LT: "EUR", LV: "EUR", EE: "EUR", MT: "EUR", CY: "EUR",
    HR: "EUR", RO: "EUR", BG: "EUR", HU: "EUR",
    NZ: "AUD",
  };

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

    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          if (session.access_token) {
            localStorage.setItem("momentum_token", session.access_token);
          }
          const savedPlan = localStorage.getItem("momentum_plan") || "free";
          setUserPlan(savedPlan);
        }
      } catch (err) {
        console.error("Failed to load session on pricing page:", err);
      }
    }

    async function detectCurrency() {
      // Helper to apply a resolved currency code
      const applyCurrency = (code: string) => {
        const entry = CURRENCIES[code];
        if (entry) {
          setCurrencyCode(code);
          setCurrencySymbol(entry.symbol);
          return true;
        }
        return false;
      };

      // ── Provider 1: ipapi.co ──────────────────────────────────────
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          // Try direct currency field first
          if (data.currency && applyCurrency(data.currency)) return;
          // Try mapping country_code → currency
          if (data.country_code && COUNTRY_CURRENCY[data.country_code]) {
            if (applyCurrency(COUNTRY_CURRENCY[data.country_code])) return;
          }
        }
      } catch { /* timeout or network error — try next provider */ }

      // ── Provider 2: ip-api.com (free, no key required) ────────────
      try {
        const res = await fetch("http://ip-api.com/json/?fields=countryCode,currency", { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data.currency && applyCurrency(data.currency)) return;
          if (data.countryCode && COUNTRY_CURRENCY[data.countryCode]) {
            if (applyCurrency(COUNTRY_CURRENCY[data.countryCode])) return;
          }
        }
      } catch { /* fallthrough to timezone */ }

      // ── Provider 3: Intl timezone heuristic (offline fallback) ────
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzMap: Record<string, string> = {
          "Asia/Kolkata":         "INR",
          "Asia/Calcutta":        "INR",
          "Asia/Tokyo":           "JPY",
          "Asia/Singapore":       "SGD",
          "Asia/Dubai":           "AED",
          "Asia/Riyadh":          "AED",
          "America/Sao_Paulo":    "BRL",
          "America/Mexico_City":  "MXN",
          "America/Toronto":      "CAD",
          "America/Vancouver":    "CAD",
          "America/Edmonton":     "CAD",
          "America/Winnipeg":     "CAD",
          "Australia/Sydney":     "AUD",
          "Australia/Melbourne":  "AUD",
          "Australia/Brisbane":   "AUD",
          "Australia/Perth":      "AUD",
          "Pacific/Auckland":     "AUD",
          "Europe/London":        "GBP",
          "Europe/Belfast":       "GBP",
          "Europe/Zurich":        "CHF",
          "Europe/Stockholm":     "SEK",
          "Europe/Oslo":          "SEK",
          "Europe/Copenhagen":    "SEK",
        };
        // Exact match
        if (tzMap[tz] && applyCurrency(tzMap[tz])) return;
        // Prefix match for Europe/ → EUR
        if (tz.startsWith("Europe/") && applyCurrency("EUR")) return;
      } catch { /* give up, keep USD default */ }
    }

    checkUser();
    detectCurrency();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        if (session.access_token) {
          localStorage.setItem("momentum_token", session.access_token);
        }
        const savedPlan = localStorage.getItem("momentum_plan") || "free";
        setUserPlan(savedPlan);
      } else {
        setUserId(null);
        setUserPlan("free");
        localStorage.removeItem("momentum_token");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpgrade = async (upgradeOpts?: { isTest1Rupee?: boolean }) => {
    if (!userId) return;
    const isTest1Rupee = upgradeOpts?.isTest1Rupee || false;
    try {
      const cycle = isYearly ? "yearly" : "monthly";

      // 1. Create order on backend Express API server
      const order = await api.createRazorpayOrder(isTest1Rupee ? "INR" : currencyCode, cycle, isTest1Rupee);

      // Ensure Razorpay SDK is loaded
      if (typeof (window as any).Razorpay === "undefined") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          console.warn("Razorpay SDK not loaded. Simulating checkout verification in development mode.");
          if (process.env.NODE_ENV === "development") {
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
              razorpay_order_id: order.id,
              razorpay_signature: "mock_signature_dev_override"
            });

            if (verifyRes.success) {
              localStorage.setItem("momentum_plan", "pro");
              setUserPlan("pro");
              setUpgradeSuccess(true);
              setTimeout(() => {
                setUpgradeSuccess(false);
                window.location.href = "/dashboard";
              }, 1500);
            }
          } else {
            alert("Payment gateway could not be loaded. Please check your internet connection.");
          }
          return;
        }
      }

      // 2. Configure and launch Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: isTest1Rupee ? "ZenithFlow Test (₹1)" : "ZenithFlow Pro",
        description: isTest1Rupee ? "Real Payment Gateway Test Charge" : `Subscription Upgrade (${cycle})`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Send payment tokens back to Express backend to verify signature
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              localStorage.setItem("momentum_plan", "pro");
              setUserPlan("pro");
              setUpgradeSuccess(true);
              setTimeout(() => {
                setUpgradeSuccess(false);
                window.location.href = "/dashboard";
              }, 1500);
            }
          } catch (err) {
            console.error("Signature verification failed:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: localStorage.getItem("momentum_email") || "",
          name: localStorage.getItem("momentum_name") || ""
        },
        theme: {
          color: "#6068F0"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Razorpay payment initiation failed:", err);
      alert("Failed to initiate checkout. Please try again.");
    }
  };

  const handleThemeChange = (nextTheme: "light" | "dark") => {
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

  const ELITE_CATALOG: Record<string, { monthly: number; yearly: number }> = {
    USD: { monthly: 29,    yearly: 290   },
    INR: { monthly: 2499,  yearly: 24999 },
    EUR: { monthly: 27,    yearly: 270   },
    GBP: { monthly: 24,    yearly: 240   },
    CAD: { monthly: 38,    yearly: 380   },
    AUD: { monthly: 42,    yearly: 420   },
    BRL: { monthly: 149,   yearly: 1490  },
    JPY: { monthly: 4500,  yearly: 45000 },
    SGD: { monthly: 40,    yearly: 400   },
    AED: { monthly: 109,   yearly: 1090  },
    MXN: { monthly: 499,   yearly: 4990  },
    CHF: { monthly: 26,    yearly: 260   },
    SEK: { monthly: 320,   yearly: 3200  },
  };

  const basePrice = "Free";
  
  const activePro = CURRENCIES[currencyCode] || CURRENCIES["USD"];
  const proPrice = isYearly ? `${currencySymbol}${activePro.yearly}` : `${currencySymbol}${activePro.monthly}`;
  const proPeriod = isYearly ? "/yr" : "/mo";
  
  const activeElite = ELITE_CATALOG[currencyCode] || ELITE_CATALOG["USD"];
  const elitePrice = isYearly ? `${currencySymbol}${activeElite.yearly}` : `${currencySymbol}${activeElite.monthly}`;
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
            <ul className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-[#A1A1AA]">
              <li 
                className="relative py-4 cursor-pointer"
                onMouseEnter={() => setFeaturesOpen(true)}
                onMouseLeave={() => setFeaturesOpen(false)}
              >
                <div className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors flex items-center gap-1">
                  Features
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", featuresOpen && "rotate-180")} />
                </div>
                
                <AnimatePresence>
                  {featuresOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[480px] bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-50 grid grid-cols-2 gap-2 cursor-default"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Top ambient line */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A78BFA]/50 to-transparent" />
                      
                      <Link href={userId ? "/dashboard" : "/register"} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                          <Calendar className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 dark:text-white mb-0.5 group-hover:text-[#A78BFA] transition-colors">Sprint Planner</div>
                          <p className="text-[10px] leading-relaxed text-slate-500 dark:text-neutral-400 font-normal normal-case tracking-normal">Manage tasks and track high-level OKR goals.</p>
                        </div>
                      </Link>

                      <Link href={userId ? "/dashboard" : "/register"} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                          <Dumbbell className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 dark:text-white mb-0.5 group-hover:text-[#A78BFA] transition-colors">Workout Logger</div>
                          <p className="text-[10px] leading-relaxed text-slate-500 dark:text-neutral-400 font-normal normal-case tracking-normal">Log splits, calculate volume, and view metrics.</p>
                        </div>
                      </Link>

                      <Link href={userId ? "/dashboard" : "/register"} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#C084FC] shrink-0">
                          <Brain className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 dark:text-white mb-0.5 group-hover:text-[#A78BFA] transition-colors">AI Coaching</div>
                          <p className="text-[10px] leading-relaxed text-slate-500 dark:text-neutral-400 font-normal normal-case tracking-normal">Get instant tailored insights and feedback.</p>
                        </div>
                      </Link>

                      <Link href={userId ? "/dashboard" : "/register"} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#34D399] shrink-0">
                          <Activity className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 dark:text-white mb-0.5 group-hover:text-[#A78BFA] transition-colors">Biometrics Logger</div>
                          <p className="text-[10px] leading-relaxed text-slate-500 dark:text-neutral-400 font-normal normal-case tracking-normal">Quick water & calorie tracking dashboard.</p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
              <li><Link href="/pricing" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Pricing</Link></li>
              <li><Link href="/#analytics" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">Analytics</Link></li>
              <li><Link href="/#about" className="hover:text-[#09090B] dark:hover:text-[#FAFAFA] transition-colors">About</Link></li>
            </ul>

            {/* Actions & Theme Swapper */}
            <div className="flex items-center gap-4">
              
              {/* Light/Dark Toggle */}
              <AnimatedThemeToggler theme={theme} onThemeChange={handleThemeChange} className="h-8 w-8 rounded-full" />

              {userId ? (
                <Link href="/dashboard" className="hidden sm:inline-flex">
                  <button className="relative bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(167,139,250,0.3)]">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-flex">
                    <Button variant="ghost" className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white px-3 py-1">
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

              {/* Mobile hamburger menu */}
              <button className="lg:hidden text-slate-600 dark:text-neutral-400 ml-2" onClick={() => setMenuOpen(!menuOpen)}>
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
          <Link href="/#analytics" onClick={() => setMenuOpen(false)} className="hover:text-white">Analytics</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="hover:text-white">About</Link>
          {userId ? (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
              <button className="bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-8 py-3 rounded-full text-sm font-extrabold tracking-widest">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                <button className="bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black px-8 py-3 rounded-full text-sm font-extrabold tracking-widest">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      )}

      <main className="relative pt-12 z-10">
        
        {/* Pricing Grid Section */}
        <section className="relative py-24 max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16 reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 ease-out">
            <h1 className="text-5xl md:text-6.5xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#09090B] via-[#09090B] to-slate-700 dark:from-white dark:via-white dark:to-white mb-6">Choose Your Velocity</h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-[#A1A1AA] max-w-xl mx-auto mb-10 leading-relaxed">
              Invest in your potential. Select the protocol that aligns with your performance goals.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center gap-4 bg-slate-100 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/5 px-3.5 py-1.5 rounded-full backdrop-blur-xl">
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

            {/* Currency detection badge */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.07] backdrop-blur-md">
                {/* Globe icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-[#A78BFA] shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" opacity="0.6" />
                  <path d="M12 2 Q7 12 12 22" opacity="0.6" />
                  <path d="M12 2 Q17 12 12 22" opacity="0.6" />
                </svg>
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">
                  Prices in
                </span>
                <span className="text-[10px] font-extrabold text-slate-800 dark:text-white uppercase tracking-widest">
                  {currencySymbol} {currencyCode}
                </span>
                {currencyCode !== "USD" && (
                  <span className="text-[9px] text-slate-400 dark:text-neutral-500 font-medium normal-case tracking-normal">
                    · auto-detected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Starter Tier */}
            <div className={cn(glassCardClass, "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-100 ease-out")}>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Starter</h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Core tracking for habits and simple workouts.</p>
                <span className="text-3xl font-black text-slate-800 dark:text-white">Free</span>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-slate-600 dark:text-neutral-300">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Basic Task Management</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Simple Gym Log History</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Manual Water Intake logging</li>
              </ul>
              <Link href={userId ? "/dashboard" : "/register"}>
                <button className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300">
                  {userId ? "Go to Dashboard" : "Get Started"}
                </button>
              </Link>
            </div>

            {/* Pro Tier (Highlighted + glowing purple ambient lighting) */}
            <div className={cn(
              "relative bg-white dark:bg-[#111114]/80 border border-[#A78BFA]/50 dark:border-[#A78BFA]/30 rounded-[24px] p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] md:-translate-y-4 shadow-[0_20px_40px_rgba(167,139,250,0.15)] dark:shadow-[0_20px_45px_-10px_rgba(167,139,250,0.25)]",
              "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-200 ease-out"
            )}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#A78BFA] to-[#F9A8D4] text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  Pro
                  <Bolt className="h-5 w-5 text-[#A78BFA] fill-[#A78BFA]/20 animate-pulse" />
                </h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Advanced analytics and unlimited logging.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white transition-all duration-300">{proPrice}</span>
                  {currencyCode === "INR" && (
                    <span className="text-sm line-through text-slate-400 dark:text-neutral-500 font-semibold">
                      {isYearly ? "₹4,990" : "₹499"}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">{proPeriod}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-slate-600 dark:text-neutral-300 font-medium">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Everything in Starter</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Full AI Coach Biometric Feedback</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Unlimited Workout Volume tracking</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#A78BFA]" /> Advanced Focus Analytics trend graphs</li>
              </ul>
              {userId ? (
                userPlan === "pro" ? (
                  <Link href="/dashboard" className="w-full">
                    <button className="w-full bg-gradient-to-r from-[#A78BFA] to-[#7c3aed] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_5px_15px_rgba(167,139,250,0.3)]">
                      Current Plan
                    </button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2.5 w-full">
                    <button
                      onClick={() => handleUpgrade()}
                      disabled={upgradeSuccess}
                      className="w-full bg-gradient-to-r from-[#A78BFA] to-[#7c3aed] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_5px_15px_rgba(167,139,250,0.3)] flex items-center justify-center gap-2"
                    >
                      {upgradeSuccess ? (
                        <>
                          <Check className="h-4 w-4 text-white animate-bounce" />
                          Success! Unlocking Pro...
                        </>
                      ) : (
                        "Upgrade to Pro"
                      )}
                    </button>
                    {(currencyCode === "INR" || process.env.NODE_ENV === "development") && (
                      <button
                        onClick={() => handleUpgrade({ isTest1Rupee: true })}
                        disabled={upgradeSuccess}
                        className="w-full bg-transparent hover:bg-slate-100/5 dark:hover:bg-white/[0.04] border border-[#A78BFA]/30 hover:border-[#A78BFA]/60 text-[#A78BFA] py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5"
                      >
                        Real API Test (₹1 Charge)
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-2.5 w-full">
                  <Link href="/register" className="w-full">
                    <button className="w-full bg-gradient-to-r from-[#A78BFA] to-[#7c3aed] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_5px_15px_rgba(167,139,250,0.3)]">
                      Get Started
                    </button>
                  </Link>
                  {(currencyCode === "INR" || process.env.NODE_ENV === "development") && (
                    <Link href="/register" className="w-full">
                      <button className="w-full bg-transparent hover:bg-slate-100/5 dark:hover:bg-white/[0.04] border border-[#A78BFA]/30 hover:border-[#A78BFA]/60 text-[#A78BFA] py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5">
                        Real API Test (₹1 Charge)
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Enterprise Tier */}
            <div className={cn(glassCardClass, "reveal-fade opacity-0 translate-y-[30px] transition-all duration-1000 delay-300 ease-out border-[#FDBA74]/20 dark:border-[#FDBA74]/15")}>
              {/* Subtle gold top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FDBA74]/40 to-transparent" />
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Enterprise</h3>
                <p className="text-xs text-neutral-400 mb-6 h-10">Custom workspace, SSO &amp; dedicated coaching.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800 dark:text-white transition-all duration-300">{elitePrice}</span>
                  <span className="text-xs text-neutral-400">{elitePeriod}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-10 flex-grow text-xs text-slate-600 dark:text-neutral-300">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#FDBA74]" /> Custom Workspace Teams Integration</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#FDBA74]" /> Dedicated Coach consult sessions</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#FDBA74]" /> Priority Server Speed response</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#FDBA74]" /> Single Sign-On (SSO) Support</li>
              </ul>
              {userId ? (
                <button
                  onClick={handleEnterpriseClick}
                  disabled={enterpriseRequested || enterpriseLoading}
                  className="w-full bg-gradient-to-r from-[#FDBA74]/20 to-[#F59E0B]/10 border border-[#FDBA74]/30 text-[#FDBA74] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:from-[#FDBA74]/30 disabled:opacity-50"
                >
                  {enterpriseLoading ? "Sending..." : enterpriseRequested ? "✓ Requested!" : "Contact Admin"}
                </button>
              ) : (
                <Link href="/register">
                  <button className="w-full bg-gradient-to-r from-[#FDBA74]/20 to-[#F59E0B]/10 border border-[#FDBA74]/30 text-[#FDBA74] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:from-[#FDBA74]/30">
                    Contact Admin
                  </button>
                </Link>
              )}
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
                  <tr className="border-b border-slate-200 dark:border-b-white/10 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="py-4 font-semibold">Feature</th>
                    <th className="py-4 font-semibold">Starter</th>
                    <th className="py-4 font-semibold text-[#A78BFA]">Pro</th>
                    <th className="py-4 font-semibold text-[#FDBA74]">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-neutral-300">
                  <tr>
                    <td className="py-4 font-medium">Workout &amp; Biomechanical Logging</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">Basic (7 days)</td>
                    <td className="py-4 font-bold text-[#A78BFA]">Unlimited</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">AI Focus Coach Cognitive Insights</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">Basic (1 evaluation/day)</td>
                    <td className="py-4 font-bold text-[#A78BFA]">Advanced</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Custom Model Access</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Calorie &amp; Macro Nutrition Tracker</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">Manual Logging</td>
                    <td className="py-4 font-bold text-[#A78BFA]">Automated AI Scanning</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Dedicated Nutritionist</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Sprint Task Planner &amp; OKR Goals</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">Standard (5 Active)</td>
                    <td className="py-4 font-bold text-[#A78BFA]">Unlimited Sprints</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Team Workspaces</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Historical Analytics &amp; Heatmaps</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">7 Days History</td>
                    <td className="py-4 font-bold text-[#A78BFA]">Full History Access</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Full History Access</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Multi-device Cloud Synchronization</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">—</td>
                    <td className="py-4"><Check className="h-4 w-4 text-[#A78BFA]" /></td>
                    <td className="py-4"><Check className="h-4 w-4 text-[#FDBA74]" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Custom Biomechanical Protocols</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">—</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">—</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Custom Program Draft</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">1-on-1 Personalized Coaching</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">—</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">—</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Live Weekly Sessions</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Priority Support Response</td>
                    <td className="py-4 text-slate-400 dark:text-neutral-500">Standard Email</td>
                    <td className="py-4 font-bold text-[#A78BFA]">Priority Email</td>
                    <td className="py-4 font-bold text-[#FDBA74]">Dedicated Slack Channel</td>
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
                  <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-white">{faq.q}</h4>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-slate-500 dark:text-neutral-400 transition-transform duration-300",
                    faqOpen[idx] ? "transform rotate-180 text-slate-800 dark:text-white" : ""
                  )} />
                </div>
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-out px-6 text-xs md:text-sm text-slate-500 dark:text-[#c7c4d7]/70 leading-relaxed",
                  faqOpen[idx] ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
                )}>
                  {faq.a}
                </div>
              </div>
            ))}
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
