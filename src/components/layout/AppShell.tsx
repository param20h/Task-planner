"use client";

import React, { useState } from "react";
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
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-3 py-2 px-1 font-normal"
    >
      <div className="relative h-7 w-7 shrink-0 overflow-hidden">
        <Image src="/AGENTS.png" alt="Agents Logo" fill className="object-contain" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl tracking-tight"
      >
        <span className="text-white">momen</span>
        <span className="text-[#6068F0]">tum</span>
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
      <div className="relative h-7 w-7 shrink-0 overflow-hidden">
        <Image src="/AGENTS.png" alt="Agents Logo" fill className="object-contain" />
      </div>
    </Link>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function ensureDefaultProfile() {
      try {
        // Ensure default test profile exists
        await supabase
          .from("profiles")
          .upsert({
            id: "alex_chen",
            name: "Alex Chen"
          }, { onConflict: "id" });

        // Ensure currently logged-in auth user's profile exists
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

  const links = [
    {
      label: "Dashboard",
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Planner",
      title: "Planner",
      href: "/planner",
      icon: <Calendar className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Food",
      title: "Food",
      href: "/food",
      icon: <Apple className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Workout",
      title: "Workout",
      href: "/workout",
      icon: <Dumbbell className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Goals",
      title: "Goals",
      href: "/goals",
      icon: <Target className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Analytics",
      title: "Analytics",
      href: "/analytics",
      icon: <LineChart className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "Journal",
      title: "Journal",
      href: "/journal",
      icon: <BookOpenText className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
    {
      label: "AI Coach",
      title: "AI Coach",
      href: "/ai-coach",
      icon: <Brain className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
    },
  ];

  return (
    <div className={cn("mx-auto flex h-screen w-full flex-col overflow-hidden bg-black text-neutral-300 relative md:flex-row")}>
      
      {/* Background Orbs simulating 3D spheres for black glassmorphism */}
      {/* Top Left Indigo Sphere */}
      <motion.div 
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[5%] left-[5%] w-[150px] h-[150px] md:w-[320px] md:h-[320px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(96,104,240,0.5),_rgba(0,0,0,0.95))] shadow-[0_0_60px_rgba(96,104,240,0.25)] pointer-events-none" 
      />
      {/* Bottom Right Fuchsia Sphere */}
      <motion.div 
        animate={{
          x: [0, -30, 15, 0],
          y: [0, 20, -20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[5%] right-[5%] w-[180px] h-[180px] md:w-[400px] md:h-[400px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(217,70,239,0.4),_rgba(0,0,0,0.95))] shadow-[0_0_60px_rgba(217,70,239,0.15)] pointer-events-none" 
      />
      {/* Top Right Cyan Sphere */}
      <motion.div 
        animate={{
          x: [0, 15, -20, 0],
          y: [0, 30, -15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[15%] right-[25%] w-[100px] h-[100px] md:w-[200px] md:h-[200px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(6,182,212,0.5),_rgba(0,0,0,0.95))] shadow-[0_0_40px_rgba(6,182,212,0.25)] pointer-events-none" 
      />
      {/* Desktop-only Violet Sphere sitting in the middle area */}
      <motion.div 
        animate={{
          x: [0, -20, 25, 0],
          y: [0, 15, -25, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="hidden md:block absolute top-[45%] left-[40%] w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(139,92,246,0.4),_rgba(0,0,0,0.95))] shadow-[0_0_50px_rgba(139,92,246,0.2)] pointer-events-none" 
      />

      {/* Desktop Sidebar (Aceternity) */}
      <div className="hidden md:flex flex-none z-20">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className={cn(
            "justify-between gap-10 bg-[#0D0D0E]/80 backdrop-blur-3xl border-r border-white/5 shadow-2xl transition-all duration-300",
            open ? "px-4" : "px-2"
          )}>
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    className={cn(
                      "transition-all duration-300 border border-transparent flex items-center group/sidebar",
                      open 
                        ? "px-3 py-2.5 rounded-xl gap-3 w-full justify-start" 
                        : "p-2 rounded-full justify-center w-9 h-9 mx-auto",
                      pathname === link.href
                        ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md"
                        : "hover:bg-white/5 hover:text-neutral-200"
                    )}
                  />
                ))}
              </div>
            </div>
            <div>
              <SidebarLink
                link={{
                  label: "Settings",
                  href: "/profile",
                  icon: <Settings className="h-5 w-5 shrink-0 text-neutral-400 stroke-[1.8px] transition-all duration-300 group-hover/sidebar:scale-110 group-hover/sidebar:text-white" />,
                }}
                className={cn(
                  "transition-all duration-300 border border-transparent flex items-center group/sidebar",
                  open 
                    ? "px-3 py-2.5 rounded-xl gap-3 w-full justify-start" 
                    : "p-2 rounded-full justify-center w-9 h-9 mx-auto",
                  pathname === "/profile"
                    ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md"
                    : "hover:bg-white/5 hover:text-neutral-200"
                )}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto pb-24 md:pb-0 z-10">
        {children}
      </main>

      {/* Mobile iOS Liquid Glass Nav */}
      <div className="md:hidden fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <div 
          className="pointer-events-auto flex items-center p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{
            backgroundColor: "rgba(28, 28, 30, 0.45)",
            backdropFilter: "blur(40px) saturate(150%)",
            WebkitBackdropFilter: "blur(40px) saturate(150%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-400 ease-out",
                  isActive ? "bg-white/15 text-white shadow-sm border border-white/10" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {/* Icon wrapper to ensure crisp, SF-Symbol-like sizing */}
                <div className="[&>svg]:w-6 [&>svg]:h-6 [&>svg]:stroke-[1.5px]">
                  {link.icon}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
