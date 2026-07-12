"use client";

import React from "react";
import { cn } from "@/lib/utils";

type MuscleHeatmapProps = {
  muscleSets: Record<string, number>; // e.g. { "Chest": 5, "Biceps": 3, "Lats": 4 }
};

export function MuscleHeatmap({ muscleSets }: MuscleHeatmapProps) {
  // Highlight opacity based on sets completed to simulate glowing intensity
  const getGlowOpacity = (sets: number) => {
    if (!sets || sets === 0) return 0;
    return Math.min(0.95, 0.35 + sets * 0.12);
  };

  const getIntensityText = (sets: number) => {
    if (!sets || sets === 0) return "Inactive";
    if (sets < 3) return "Light Load";
    if (sets < 6) return "Optimal";
    return "High Intensity";
  };

  const muscles = [
    { name: "Shoulders", sets: muscleSets["Shoulders"] || 0 },
    { name: "Chest", sets: muscleSets["Chest"] || 0 },
    { name: "Biceps", sets: muscleSets["Biceps"] || 0 },
    { name: "Triceps", sets: muscleSets["Triceps"] || 0 },
    { name: "Lats", sets: muscleSets["Lats"] || 0 },
    { name: "Upper Back", sets: muscleSets["Upper Back"] || 0 },
    { name: "Forearms", sets: muscleSets["Forearms"] || 0 },
    { name: "Abs", sets: muscleSets["Abs"] || 0 },
    { name: "Quads", sets: muscleSets["Quads"] || 0 },
    { name: "Hamstrings", sets: muscleSets["Hamstrings"] || 0 },
    { name: "Calves", sets: muscleSets["Calves"] || 0 }
  ];

  return (
    <div className="flex flex-col items-center w-full bg-black border border-neutral-900 rounded-[28px] p-6 text-white shadow-2xl">
      
      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-6">Muscle Heatmap</span>

      {/* Silhouettes Layout */}
      <div className="flex justify-center items-center gap-16 mb-8 flex-wrap">
        
        {/* FRONT VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-4">Front View</span>
          
          <svg className="w-36 h-72" viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Blur filter to generate organic glow */}
              <filter id="soft-glow-front" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── BASE BODY SILHOUETTE (FRONT) ── */}
            <g opacity="0.95">
              {/* Head */}
              <ellipse cx="50" cy="24" rx="4.5" ry="7" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Neck */}
              <rect x="49" y="31" width="2" height="5" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Torso */}
              <path d="M 37 36 H 63 V 86 H 37 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Pelvis/Hips */}
              <path d="M 43 86 H 57 V 98 H 43 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Left Arm */}
              <path d="M 37 36 L 20 42 L 23 90 H 28 L 31 52 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Right Arm */}
              <path d="M 63 36 L 80 42 L 77 90 H 72 L 69 52 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Left Leg */}
              <path d="M 43 98 H 49.5 V 215 H 46.5 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Right Leg */}
              <path d="M 57 98 H 50.5 V 215 H 53.5 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
            </g>

            {/* ── GLOWING MUSCLE OVERLAYS (FRONT) ── */}
            {/* Shoulders */}
            <circle cx="23" cy="44" r="5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />
            <circle cx="77" cy="44" r="5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />

            {/* Chest */}
            <ellipse cx="50" cy="48" rx="8" ry="5.5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Chest"] || 0)} />

            {/* Biceps */}
            <ellipse cx="23" cy="58" rx="2.5" ry="5.5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Biceps"] || 0)} />
            <ellipse cx="77" cy="58" rx="2.5" ry="5.5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Biceps"] || 0)} />

            {/* Forearms */}
            <ellipse cx="25.5" cy="76" rx="2" ry="5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />
            <ellipse cx="74.5" cy="76" rx="2" ry="5" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />

            {/* Abs */}
            <ellipse cx="50" cy="68" rx="5" ry="9" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Abs"] || 0)} />

            {/* Quads */}
            <ellipse cx="45" cy="128" rx="3.5" ry="14" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Quads"] || 0)} />
            <ellipse cx="55" cy="128" rx="3.5" ry="14" fill="#3b82f6" filter="url(#soft-glow-front)" opacity={getGlowOpacity(muscleSets["Quads"] || 0)} />
          </svg>
        </div>

        {/* BACK VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-4">Back View</span>
          
          <svg className="w-36 h-72" viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Blur filter to generate organic glow */}
              <filter id="soft-glow-back" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── BASE BODY SILHOUETTE (BACK) ── */}
            <g opacity="0.95">
              {/* Head */}
              <ellipse cx="50" cy="24" rx="4.5" ry="7" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Neck */}
              <rect x="49" y="31" width="2" height="5" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Torso */}
              <path d="M 37 36 H 63 V 86 H 37 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Pelvis/Hips */}
              <path d="M 43 86 H 57 V 98 H 43 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Left Arm */}
              <path d="M 37 36 L 20 42 L 23 90 H 28 L 31 52 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Right Arm */}
              <path d="M 63 36 L 80 42 L 77 90 H 72 L 69 52 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Left Leg */}
              <path d="M 43 98 H 49.5 V 215 H 46.5 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
              {/* Right Leg */}
              <path d="M 57 98 H 50.5 V 215 H 53.5 Z" fill="#1b1c1e" stroke="#2d2f34" strokeWidth="0.8" />
            </g>

            {/* ── GLOWING MUSCLE OVERLAYS (BACK) ── */}
            {/* Shoulders */}
            <circle cx="23" cy="44" r="5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />
            <circle cx="77" cy="44" r="5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />

            {/* Upper Back */}
            <ellipse cx="50" cy="48" rx="8" ry="4.5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Upper Back"] || 0)} />

            {/* Lats */}
            <ellipse cx="50" cy="68" rx="6" ry="10" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Lats"] || 0)} />

            {/* Triceps */}
            <ellipse cx="23" cy="58" rx="2.5" ry="5.5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Triceps"] || 0)} />
            <ellipse cx="77" cy="58" rx="2.5" ry="5.5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Triceps"] || 0)} />

            {/* Forearms */}
            <ellipse cx="25.5" cy="76" rx="2" ry="5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />
            <ellipse cx="74.5" cy="76" rx="2" ry="5" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />

            {/* Hamstrings */}
            <ellipse cx="45" cy="128" rx="3.5" ry="14" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Hamstrings"] || 0)} />
            <ellipse cx="55" cy="128" rx="3.5" ry="14" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Hamstrings"] || 0)} />

            {/* Calves */}
            <ellipse cx="45" cy="172" rx="3.2" ry="10" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Calves"] || 0)} />
            <ellipse cx="55" cy="172" rx="3.2" ry="10" fill="#3b82f6" filter="url(#soft-glow-back)" opacity={getGlowOpacity(muscleSets["Calves"] || 0)} />
          </svg>
        </div>

      </div>

      {/* Heatmap Legend / Stats list */}
      <div className="w-full space-y-3.5 pt-4 border-t border-neutral-900">
        <div className="flex justify-between items-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">
          <span>Muscle Group</span>
          <span>Status / Completed Sets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {muscles.map(({ name, sets }) => (
            <div key={name} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ 
                    backgroundColor: sets > 0 ? "#3b82f6" : "#27272a",
                    boxShadow: sets > 0 ? "0 0 8px #3b82f6" : "none"
                  }}
                />
                <span className="font-extrabold text-neutral-300">{name}</span>
              </div>
              <span className="font-mono text-neutral-400 font-bold flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans">({getIntensityText(sets)})</span>
                {sets}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
