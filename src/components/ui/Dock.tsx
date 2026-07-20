"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DockProps {
  children: React.ReactNode;
  className?: string;
}

export function Dock({ children, className }: DockProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1 rounded-[20px] px-3.5 py-1.5 w-full",
        "bg-white/30 dark:bg-black/35 backdrop-blur-2xl",
        "border border-white/20 dark:border-white/10",
        "shadow-[0_12px_32px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export function DockIcon({ children, className, isActive }: DockIconProps) {
  return (
    <div
      className={cn(
        "w-8.5 h-8.5 flex items-center justify-center rounded-xl shrink-0 cursor-pointer transition-all duration-300",
        isActive
          ? "bg-[#A78BFA]/20 border border-[#A78BFA]/30 dark:bg-white/15 dark:border-white/15 text-[#A78BFA] dark:text-white"
          : "border border-transparent hover:bg-slate-200/50 dark:hover:bg-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}
