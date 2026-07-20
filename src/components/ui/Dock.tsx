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
  iconSize: 38,
  iconMagnification: 44,
  iconDistance: 60,
});

export function Dock({
  children,
  className,
  iconSize = 38,
  iconMagnification = 44,
  iconDistance = 60,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  // Exact glassmorphic styling from your SwiftUI/CSS spec
  const dockStyle: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(102, 102, 102, 0.20) 0%, rgba(102, 102, 102, 0) 33%), linear-gradient(180deg, rgba(102, 102, 102, 0) 50%, rgba(102, 102, 102, 0.40) 100%), rgba(29, 29, 29, 0.20), #1D1D1D",
    boxShadow: "0px 0px 22px rgba(242, 242, 242, 0.50) inset, 2px 2px 1px -2px #B3B3B3 inset, -12px -12px 6px -14px #B3B3B3 inset, 16px 16px 9px -18px white inset",
    borderRadius: "48px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  return (
    <DockContext.Provider value={{ mouseX, iconSize, iconMagnification, iconDistance }}>
      <div
        style={dockStyle}
        className={cn(
          "flex items-center px-4 py-2 w-full select-none pointer-events-auto overflow-hidden",
          className
        )}
      >
        {/* Horizontally scrollable and draggable container for inner elements */}
        <div 
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="flex items-center gap-3.5 overflow-x-auto scrollbar-none w-full py-0.5 px-0.5"
        >
          {children}
        </div>
      </div>
    </DockContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dock Icon
// ─────────────────────────────────────────────────────────────────────────────

interface DockIconProps {
  children: React.ReactNode;
  className?: string;
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
