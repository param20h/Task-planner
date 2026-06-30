"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconLayoutDashboard,
  IconBarbell,
  IconBook,
  IconChecks,
  IconSparkles,
  IconUserCircle,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-3 py-1 font-normal"
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden">
        <Image src="/AGENTS.png" alt="Agents Logo" fill className="object-contain" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-2xl tracking-tight"
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
      className="relative z-20 flex items-center space-x-3 py-1 font-normal"
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden">
        <Image src="/AGENTS.png" alt="Agents Logo" fill className="object-contain" />
      </div>
    </Link>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      title: "Dashboard",
      href: "/dashboard",
      icon: <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-400" />,
    },
    {
      label: "Gym",
      title: "Gym",
      href: "/gym",
      icon: <IconBarbell className="h-5 w-5 shrink-0 text-neutral-400" />,
    },
    {
      label: "Study",
      title: "Study",
      href: "/study",
      icon: <IconBook className="h-5 w-5 shrink-0 text-neutral-400" />,
    },
    {
      label: "Tasks",
      title: "Tasks",
      href: "/tasks",
      icon: <IconChecks className="h-5 w-5 shrink-0 text-neutral-400" />,
    },
    {
      label: "Meditation",
      title: "Meditation",
      href: "/meditation",
      icon: <IconSparkles className="h-5 w-5 shrink-0 text-neutral-400" />,
    },
    {
      label: "Profile",
      title: "Profile",
      href: "/profile",
      icon: <IconUserCircle className="h-5 w-5 shrink-0 text-neutral-400" />,
    },
  ];

  return (
    <div className={cn("mx-auto flex h-screen w-full flex-col overflow-hidden bg-black text-neutral-300 relative md:flex-row")}>
      
      {/* Background Orbs to create depth for glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#6068F0]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#6068F0]/10 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar (Aceternity) */}
      <div className="hidden md:flex flex-none z-20">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 bg-[#0D0D0E]/80 backdrop-blur-3xl border-r border-white/5 shadow-2xl">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} className={pathname === link.href ? "bg-white/10 rounded-lg backdrop-blur-md border border-white/5" : ""} />
                ))}
              </div>
            </div>
            <div>
              <SidebarLink
                link={{
                  label: "Settings",
                  href: "/profile",
                  icon: <IconUserCircle className="h-5 w-5 shrink-0 text-neutral-400" />,
                }}
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
