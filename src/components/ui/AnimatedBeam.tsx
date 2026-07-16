"use client";

import React, { useEffect, useState, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
}

export const AnimatedBeam = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
}: AnimatedBeamProps) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Calculate coordinates and path dynamically
  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const svgWidth = containerRect.width;
      const svgHeight = containerRect.height;
      setSvgDimensions({ width: svgWidth, height: svgHeight });

      const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const controlX = startX + (endX - startX) / 2;
      const controlY = startY + (endY - startY) / 2 + curvature;

      const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
      setPathD(d);
    };

    updatePath();

    // Listen to resize and scroll
    window.addEventListener("resize", updatePath);
    window.addEventListener("scroll", updatePath);

    // Observe element positions changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => updatePath());
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updatePath);
      window.removeEventListener("scroll", updatePath);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  const beamGradientId = `beam-grad-${id}`;

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      className={cn(
        "pointer-events-none absolute left-0 top-0 size-full stroke-2",
        className
      )}
    >
      <path
        d={pathD}
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <motion.path
        d={pathD}
        stroke={`url(#${beamGradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ strokeDasharray: "12 12", strokeDashoffset: 0 }}
        animate={{
          strokeDashoffset: reverse ? [0, 48] : [0, -48],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay,
        }}
      />
      <defs>
        <linearGradient
          id={beamGradientId}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="30%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="70%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
