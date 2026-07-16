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
          "flex items-end gap-3 rounded-3xl px-4 py-2",
          "bg-white/75 dark:bg-[#0D0D0E]/80 backdrop-blur-xl",
          "border border-slate-200/50 dark:border-white/5",
          "shadow-[0_16px_40px_rgba(0,0,0,0.4)]",
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
        "relative flex items-center justify-center rounded-2xl shrink-0 cursor-pointer",
        "transition-colors duration-200",
        isActive
          ? "bg-[#A78BFA]/10 border border-[#A78BFA]/25 dark:bg-white/10 dark:border-white/10"
          : "border border-transparent",
        className
      )}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="activeDockDot"
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#A78BFA] dark:bg-white shadow-[0_0_6px_rgba(167,139,250,0.9)]"
        />
      )}
    </motion.div>
  );
}
