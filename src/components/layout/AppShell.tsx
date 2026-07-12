"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun,
  Moon,
  LogOut,
  Shield
} from "lucide-react";
import {
  CustomDashboardIcon,
  CustomPlannerIcon,
  CustomFoodIcon,
  CustomStudyIcon,
  CustomWorkoutIcon,
  CustomGoalsIcon,
  CustomAnalyticsIcon,
  CustomJournalIcon,
  CustomCoachIcon,
  CustomSettingsIcon
} from "@/components/ui/CustomIcons";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { AlarmWidget } from "@/components/widgets/AlarmWidget";

const Logo = ({ open }: { open: boolean }) => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-2 px-1 font-normal overflow-hidden"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg shadow-sm border border-slate-200 dark:border-white/10">
        <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="28px" className="object-cover" />
      </div>
      <AnimatePresence mode="wait">
        {open && (
          <motion.span
            key="logotext"
            initial={{ opacity: 0, x: -8, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -6, width: 0 }}
            transition={{
              opacity: { duration: 0.15, ease: "easeOut" },
              x: { type: "spring", stiffness: 350, damping: 28 },
              width: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
            }}
            className="font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden"
          >
            <span className="text-[#09090B] dark:text-white">zenith</span>
            <span className="text-[#A78BFA]">flow</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("/AGENTS.png");
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

    // Sync appearance settings on load
    const savedAppearance = localStorage.getItem("momentum_appearance");
    if (savedAppearance) {
      const val = Number(savedAppearance);
      document.documentElement.style.setProperty('--glass-opacity', String((val / 100) * 0.4 + 0.1));
      document.documentElement.style.setProperty('--glass-blur', `${(val / 100) * 20 + 8}px`);
    } else {
      document.documentElement.style.setProperty('--glass-opacity', '0.42');
      document.documentElement.style.setProperty('--glass-blur', '20px');
    }

    // Load profile avatar from local storage
    const savedAvatar = localStorage.getItem("momentum_avatar");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }

    // Set up auth state listener to automatically synchronize session tokens for Express API calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem("momentum_token", session.access_token);
      } else {
        localStorage.removeItem("momentum_token");
      }
    });

    async function checkAuthAndSyncProfile() {
      try {
        // Use offline-friendly getSession to avoid remote network hangs
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        const user = session.user;
        setUserEmail(user.email || null);
        const nameVal = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

        // Mirror token immediately on first load
        if (session.access_token) {
          localStorage.setItem("momentum_token", session.access_token);
        }

        // Run profile upsert asynchronously in background so slows/offs don't block render
        supabase
          .from("profiles")
          .upsert({
            id: user.id,
            name: nameVal,
            email: user.email
          }, { onConflict: "id" })
          .then(({ error }) => {
            if (error) console.warn("Non-blocking profile sync error:", error);
          });

        setLoading(false);
      } catch (err) {
        console.error("Auth verification failed:", err);
        router.push("/login");
      }
    }
    checkAuthAndSyncProfile();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

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
      icon: <CustomDashboardIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Planner",
      title: "Planner",
      href: "/planner",
      icon: <CustomPlannerIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Food",
      title: "Food",
      href: "/food",
      icon: <CustomFoodIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Study",
      title: "Study",
      href: "/study",
      icon: <CustomStudyIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Workout",
      title: "Workout",
      href: "/workout",
      icon: <CustomWorkoutIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Goals",
      title: "Goals",
      href: "/goals",
      icon: <CustomGoalsIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Analytics",
      title: "Analytics",
      href: "/analytics",
      icon: <CustomAnalyticsIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Journal",
      title: "Journal",
      href: "/journal",
      icon: <CustomJournalIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "AI Coach",
      title: "AI Coach",
      href: "/ai-coach",
      icon: <CustomCoachIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
      badge: "PRO"
    },
  ];

  const visibleLinks = [...links];
  if (userEmail?.toLowerCase() === "parambrar862@gmail.com") {
    visibleLinks.push({
      label: "Admin",
      title: "Admin Control",
      href: "/admin",
      icon: <Shield className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.05)_0%,transparent_65%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] animate-pulse">
            <CustomCoachIcon className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-neutral-500 animate-pulse font-sans">
            Synchronizing Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto flex h-screen w-full flex-col overflow-hidden bg-slate-50 dark:bg-black text-slate-700 dark:text-neutral-300 relative md:flex-row transition-colors duration-500")}>
      
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
            "justify-between gap-10 bg-[#0D0D0E]/80 dark:bg-[#0D0D0E]/80 light:bg-white border-r border-slate-200 dark:border-white/5 shadow-2xl px-3"
          )}>
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <Logo open={open} />
              <div className="mt-8 flex flex-col gap-1.5">
                {visibleLinks.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    className={cn(
                      "transition-all duration-300 border border-transparent flex items-center group/sidebar",
                      open 
                        ? "px-3 py-2.5 rounded-xl gap-3 w-full justify-start text-xs uppercase tracking-wider font-bold" 
                        : "p-2 rounded-full justify-center w-9 h-9 mx-auto",
                      pathname === link.href ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20 dark:bg-white/10 dark:text-white dark:border-white/10" : "text-neutral-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-neutral-200"
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
                  open ? "px-3 py-2.5 rounded-xl justify-start hover:bg-slate-100 dark:hover:bg-white/5" : "p-2 rounded-full justify-center w-9 h-9 mx-auto hover:bg-white/5"
                )}
              >
                {theme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
                {open && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              </button>

               <SidebarLink
                link={{
                  label: "Settings",
                  href: "/profile",
                  icon: <CustomSettingsIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
                }}
                className={cn(
                  "transition-all duration-300 border border-transparent flex items-center group/sidebar",
                  open 
                    ? "px-3 py-2.5 rounded-xl gap-3 w-full justify-start text-xs uppercase tracking-wider font-bold" 
                    : "p-2 rounded-full justify-center w-9 h-9 mx-auto",
                  pathname === "/profile" ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20 dark:bg-white/10 dark:text-white dark:border-white/10" : "text-neutral-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-neutral-200"
                )}
              />

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full transition-all duration-300 border border-transparent flex items-center gap-3 text-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-400 dark:text-red-400/80 hover:bg-red-500/10",
                  open ? "px-3 py-2.5 rounded-xl justify-start" : "p-2 rounded-full justify-center w-9 h-9 mx-auto"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0 stroke-[1.8px]" />
                {open && <span>Sign Out</span>}
              </button>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Mobile Top Header with Brand and Profile Avatar */}
      <div className="md:hidden sticky top-0 w-full z-40 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative h-6 w-6 rounded-md overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
            <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="24px" className="object-cover" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-sans">zenithflow</span>
        </Link>
        
        <Link href="/profile" className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-white/10 flex items-center justify-center shadow-sm">
          <Image src={avatarUrl} alt="User Profile" fill className="object-cover" />
        </Link>
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 relative overflow-y-auto pb-28 md:pb-0 z-10">
        {children}
      </main>

      {/* Mobile iOS Liquid Glass Nav */}
      <div className="md:hidden fixed bottom-5 left-3 right-3 z-50 pointer-events-none flex justify-center">
        <div 
          className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-white/5 bg-white/75 dark:bg-[#0D0D0E]/80 backdrop-blur-xl max-w-full overflow-x-auto scrollbar-none scroll-smooth px-3"
        >
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative flex flex-col items-center justify-center w-11 h-11 rounded-2xl transition-all duration-350 ease-out shrink-0",
                  isActive 
                    ? "bg-[#A78BFA]/10 border border-[#A78BFA]/20 dark:bg-white/10 dark:border-white/10" 
                    : "border border-transparent text-neutral-400 hover:text-neutral-205"
                )}
              >
                <div className="shrink-0 flex items-center justify-center">
                  {React.cloneElement(link.icon as any, {
                    className: cn(
                      "h-4.5 w-4.5 transition-all duration-300",
                      isActive ? "text-[#A78BFA] dark:text-white scale-110 stroke-[2.2px]" : "text-slate-500 dark:text-neutral-400"
                    )
                  })}
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="activeDotMobile"
                    className="absolute bottom-1 h-1 w-1 rounded-full bg-[#A78BFA] dark:bg-white shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                  />
                )}
              </Link>
            );
          })}
          
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-11 h-11 rounded-2xl border border-transparent text-neutral-400 hover:text-neutral-200 transition-all duration-300 shrink-0"
          >
            {theme === "dark" 
              ? <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" /> 
              : <Moon className="h-4.5 w-4.5 text-indigo-400 fill-indigo-400/20" />
            }
          </button>
        </div>
      </div>
      
      {/* Global Alarm Widget */}
      <AlarmWidget />
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
