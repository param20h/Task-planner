"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutGrid,
  Calendar,
  Apple,
  Dumbbell,
  Target,
  LineChart,
  BookOpenText,
  Brain,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-3 py-2 px-1 font-normal"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden bg-gradient-to-tr from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] rounded-md flex items-center justify-center p-0.5 shadow-sm">
        <Triangle className="h-3.5 w-3.5 text-black fill-black rotate-180" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl tracking-tight"
      >
        <span className="text-white dark:text-white light:text-[#09090B]">momen</span>
        <span className="text-[#A78BFA]">tum</span>
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-3 py-2 px-1 font-normal"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden bg-gradient-to-tr from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] rounded-md flex items-center justify-center p-0.5 shadow-sm">
        <Triangle className="h-3.5 w-3.5 text-black fill-black rotate-180" />
      </div>
    </Link>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Sync theme on load
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

    async function ensureDefaultProfile() {
      try {
        await supabase
          .from("profiles")
          .upsert({
            id: "alex_chen",
            name: "Alex Chen"
          }, { onConflict: "id" });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const nameVal = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
          await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              name: nameVal
            }, { onConflict: "id" });
        }
      } catch (err) {
        console.error("Global profiles initialization failed:", err);
      }
    }
    ensureDefaultProfile();
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

  const links = [
    {
      label: "Dashboard",
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Planner",
      title: "Planner",
      href: "/planner",
      icon: <Calendar className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Food",
      title: "Food",
      href: "/food",
      icon: <Apple className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Workout",
      title: "Workout",
      href: "/workout",
      icon: <Dumbbell className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Goals",
      title: "Goals",
      href: "/goals",
      icon: <Target className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Analytics",
      title: "Analytics",
      href: "/analytics",
      icon: <LineChart className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Journal",
      title: "Journal",
      href: "/journal",
      icon: <BookOpenText className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "AI Coach",
      title: "AI Coach",
      href: "/ai-coach",
      icon: <Brain className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
  ];

  return (
    <div className={cn("mx-auto flex h-screen w-full flex-col overflow-hidden bg-black dark:bg-black light:bg-slate-50 text-neutral-300 dark:text-neutral-300 light:text-slate-800 relative md:flex-row transition-colors duration-500")}>
      
      {/* Background Orbs: Hidden or very low opacity in light mode to keep clean Prospector feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 dark:opacity-100 light:opacity-10">
        {/* Top Left Indigo Sphere */}
        <motion.div 
          animate={{ x: [0, 20, -10, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[5%] w-[150px] h-[150px] md:w-[320px] md:h-[320px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(96,104,240,0.4),_rgba(0,0,0,0.95))] shadow-[0_0_60px_rgba(96,104,240,0.2)]" 
        />
        {/* Bottom Right Fuchsia Sphere */}
        <motion.div 
          animate={{ x: [0, -30, 15, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] right-[5%] w-[180px] h-[180px] md:w-[400px] md:h-[400px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(217,70,239,0.3),_rgba(0,0,0,0.95))] shadow-[0_0_60px_rgba(217,70,239,0.15)]" 
        />
      </div>

      {/* Desktop Sidebar (Aceternity styling adapted for theme switching) */}
      <div className="hidden md:flex flex-none z-20">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className={cn(
            "justify-between gap-10 bg-[#0D0D0E]/80 dark:bg-[#0D0D0E]/80 light:bg-white border-r border-white/5 dark:border-white/5 light:border-slate-200 shadow-2xl transition-all duration-300",
            open ? "px-4" : "px-2"
          )}>
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-1.5">
                {links.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    className={cn(
                      "transition-all duration-300 border border-transparent flex items-center group/sidebar",
                      open 
                        ? "px-3 py-2.5 rounded-xl gap-3 w-full justify-start text-xs uppercase tracking-wider font-bold" 
                        : "p-2 rounded-full justify-center w-9 h-9 mx-auto",
                      pathname === link.href
                        ? "bg-white/10 text-white border-white/10 dark:bg-white/10 dark:text-white dark:border-white/10 light:bg-[#A78BFA]/10 light:text-[#A78BFA] light:border-[#A78BFA]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200 dark:hover:bg-white/5 dark:hover:text-neutral-200 light:hover:bg-slate-100 light:hover:text-slate-800"
                    )}
                  />
                ))}
              </div>
            </div>
            
            {/* Settings & Theme Toggle at bottom */}
            <div className="space-y-3 pt-3 border-t border-white/5 dark:border-t-white/5 light:border-t-slate-100">
              
              {/* Theme toggle switch in sidebar */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "w-full transition-all duration-300 border border-transparent flex items-center gap-3 text-xs uppercase tracking-wider font-bold text-neutral-400 hover:text-neutral-200",
                  open ? "px-3 py-2.5 rounded-xl justify-start hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100" : "p-2 rounded-full justify-center w-9 h-9 mx-auto hover:bg-white/5"
                )}
              >
                {theme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
                {open && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              </button>

              <SidebarLink
                link={{
                  label: "Settings",
                  href: "/profile",
                  icon: <Settings className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-400 light:text-slate-500 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
                }}
                className={cn(
                  "transition-all duration-300 border border-transparent flex items-center group/sidebar",
                  open 
                    ? "px-3 py-2.5 rounded-xl gap-3 w-full justify-start text-xs uppercase tracking-wider font-bold" 
                    : "p-2 rounded-full justify-center w-9 h-9 mx-auto",
                  pathname === "/profile"
                    ? "bg-white/10 text-white border-white/10 dark:bg-white/10 dark:text-white dark:border-white/10 light:bg-[#A78BFA]/10 light:text-[#A78BFA] light:border-[#A78BFA]/20"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200 dark:hover:bg-white/5 dark:hover:text-neutral-200 light:hover:bg-slate-100 light:hover:text-slate-800"
                )}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 relative overflow-y-auto pb-24 md:pb-0 z-10">
        {children}
      </main>

      {/* Mobile iOS Liquid Glass Nav */}
      <div className="md:hidden fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <div 
          className="pointer-events-auto flex items-center p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-900/65 dark:bg-neutral-900/65 light:bg-white/90 backdrop-blur-2xl"
        >
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-400 ease-out",
                  isActive 
                    ? "bg-white/10 dark:bg-white/10 light:bg-[#A78BFA]/10 text-white dark:text-white light:text-[#A78BFA] border border-white/10 dark:border-white/10 light:border-[#A78BFA]/20" 
                    : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <div className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.6px]">
                  {link.icon}
                </div>
              </Link>
            );
          })}
          
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-12 h-12 rounded-full text-neutral-500 hover:text-neutral-300 transition-all duration-400"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Minimal Triangle SVG icon placeholder to avoid broken dependencies
function Triangle({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  );
}
