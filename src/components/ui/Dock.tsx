"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Dock Container
// ─────────────────────────────────────────────────────────────────────────────

interface DockProps {
  children: React.ReactNode;
  className?: string;
  /** Base icon size in px */
  iconSize?: number;
  /** Max magnified size in px */
  iconMagnification?: number;
  /** Distance in px at which magnification starts to kick in */
  iconDistance?: number;
}

const DockContext = React.createContext<{
  mouseX: MotionValue<number>;
  iconSize: number;
  iconMagnification: number;
  iconDistance: number;
}>({
  mouseX: null as unknown as MotionValue<number>,
  iconSize: 40,
  iconMagnification: 60,
  iconDistance: 120,
});

export function Dock({
  children,
  className,
  iconSize = 40,
  iconMagnification = 60,
  iconDistance = 120,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={{ mouseX, iconSize, iconMagnification, iconDistance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "flex items-center gap-2.5 rounded-full px-3.5 py-1.5",
          "bg-slate-100/60 dark:bg-black/40 backdrop-blur-2xl",
          "border border-slate-200/50 dark:border-white/10",
          "shadow-[0_12px_32px_rgba(0,0,0,0.3)]",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dock Icon
// ─────────────────────────────────────────────────────────────────────────────

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
  /** Pass isActive to show the purple active dot */
  isActive?: boolean;
}

export function DockIcon({ children, className, isActive }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX, iconSize, iconMagnification, iconDistance } =
    React.useContext(DockContext);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(
    distance,
    [-iconDistance, 0, iconDistance],
    [iconSize, iconMagnification, iconSize]
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={cn(
        "relative flex items-center justify-center rounded-full shrink-0 cursor-pointer",
        "transition-colors duration-200",
        isActive
          ? "bg-[#A78BFA]/20 border border-[#A78BFA]/30 dark:bg-white/15 dark:border-white/15"
          : "border border-transparent hover:bg-slate-200/50 dark:hover:bg-white/5",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
