"use client";

import React from "react";
import { cn } from "@/lib/utils";

type MuscleHeatmapProps = {
  muscleSets: Record<string, number>; // e.g. { "Chest": 5, "Biceps": 3, "Lats": 4 }
};

export function MuscleHeatmap({ muscleSets }: MuscleHeatmapProps) {
  // Highlight opacity based on sets completed
  const getGlowOpacity = (sets: number) => {
    if (!sets || sets === 0) return 0;
    return Math.min(0.9, 0.4 + sets * 0.1);
  };

  const getIntensityText = (sets: number) => {
    if (!sets || sets === 0) return "Inactive";
    if (sets < 3) return "Light Load";
    if (sets < 6) return "Optimal Load";
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
      <div className="flex justify-center items-center gap-12 mb-8 flex-wrap">
        
        {/* FRONT VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-4">Front View</span>
          
          <svg className="w-36 h-72" viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Blur filter to generate organic glow */}
              <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── BASE BODY SILHOUETTE (FRONT) ── */}
            <g opacity="0.95">
              {/* Head */}
              <ellipse cx="50" cy="24" rx="4.5" ry="6.5" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Neck */}
              <rect x="49" y="30.5" width="2" height="4.5" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Torso */}
              <path d="M 36 35 H 64 L 57 90 H 43 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Left Arm */}
              <path d="M 36 35 L 24 41 L 27 80 H 31 L 35 52 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Right Arm */}
              <path d="M 64 35 L 76 41 L 73 80 H 69 L 65 52 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Left Leg */}
              <path d="M 43 92 H 49.5 V 210 H 46.5 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Right Leg */}
              <path d="M 57 92 H 50.5 V 210 H 53.5 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
            </g>

            {/* ── GLOWING MUSCLE OVERLAYS (FRONT) ── */}
            {/* Shoulders */}
            <circle cx="28" cy="42" r="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />
            <circle cx="72" cy="42" r="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />

            {/* Chest */}
            <ellipse cx="50" cy="47" rx="7.5" ry="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Chest"] || 0)} />

            {/* Biceps */}
            <ellipse cx="28.5" cy="54" rx="2" ry="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Biceps"] || 0)} />
            <ellipse cx="71.5" cy="54" rx="2" ry="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Biceps"] || 0)} />

            {/* Forearms */}
            <ellipse cx="29" cy="68" rx="1.5" ry="3.5" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />
            <ellipse cx="71" cy="68" rx="1.5" ry="3.5" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />

            {/* Abs */}
            <ellipse cx="50" cy="64" rx="4.5" ry="8" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Abs"] || 0)} />

            {/* Quads */}
            <ellipse cx="44" cy="115" rx="3.5" ry="12" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Quads"] || 0)} />
            <ellipse cx="56" cy="115" rx="3.5" ry="12" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Quads"] || 0)} />
          </svg>
        </div>

        {/* BACK VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-4">Back View</span>
          
          <svg className="w-36 h-72" viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* ── BASE BODY SILHOUETTE (BACK) ── */}
            <g opacity="0.95">
              {/* Head */}
              <ellipse cx="50" cy="24" rx="4.5" ry="6.5" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Neck */}
              <rect x="49" y="30.5" width="2" height="4.5" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Torso */}
              <path d="M 36 35 H 64 L 57 90 H 43 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Left Arm */}
              <path d="M 36 35 L 24 41 L 27 80 H 31 L 35 52 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Right Arm */}
              <path d="M 64 35 L 76 41 L 73 80 H 69 L 65 52 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Left Leg */}
              <path d="M 43 92 H 49.5 V 210 H 46.5 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
              {/* Right Leg */}
              <path d="M 57 92 H 50.5 V 210 H 53.5 Z" fill="#1b1c1e" stroke="#2a2b2f" strokeWidth="0.5" />
            </g>

            {/* ── GLOWING MUSCLE OVERLAYS (BACK) ── */}
            {/* Shoulders */}
            <circle cx="28" cy="42" r="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />
            <circle cx="72" cy="42" r="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Shoulders"] || 0)} />

            {/* Upper Back */}
            <ellipse cx="50" cy="44" rx="7" ry="4" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Upper Back"] || 0)} />

            {/* Lats */}
            <ellipse cx="50" cy="58" rx="6" ry="9" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Lats"] || 0)} />

            {/* Triceps */}
            <ellipse cx="28.5" cy="54" rx="2" ry="4.5" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Triceps"] || 0)} />
            <ellipse cx="71.5" cy="54" rx="2" ry="4.5" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Triceps"] || 0)} />

            {/* Forearms */}
            <ellipse cx="29" cy="68" rx="1.5" ry="3.5" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />
            <ellipse cx="71" cy="68" rx="1.5" ry="3.5" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Forearms"] || 0)} />

            {/* Hamstrings */}
            <ellipse cx="44" cy="115" rx="3.5" ry="12" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Hamstrings"] || 0)} />
            <ellipse cx="56" cy="115" rx="3.5" ry="12" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Hamstrings"] || 0)} />

            {/* Calves */}
            <ellipse cx="43.5" cy="158" rx="2.5" ry="8" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Calves"] || 0)} />
            <ellipse cx="56.5" cy="158" rx="2.5" ry="8" fill="#3b82f6" filter="url(#soft-glow)" opacity={getGlowOpacity(muscleSets["Calves"] || 0)} />
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
