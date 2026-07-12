"use client";

import React from "react";
import { cn } from "@/lib/utils";

type MuscleHeatmapProps = {
  muscleSets: Record<string, number>; // e.g. { "Chest": 5, "Biceps": 3, "Lats": 4 }
};

export function MuscleHeatmap({ muscleSets }: MuscleHeatmapProps) {
  // Highlight color helper based on set counts
  const getHighlightColor = (sets: number) => {
    if (!sets || sets === 0) return "rgba(113, 113, 122, 0.15)"; // Neutral gray/border
    if (sets < 3) return "rgba(167, 139, 250, 0.4)"; // Light purple
    if (sets < 6) return "rgba(96, 165, 250, 0.85)"; // Vibrant blue (matching image)
    return "rgba(59, 130, 246, 1)"; // Deep royal blue
  };

  const getStrokeColor = (sets: number) => {
    if (!sets || sets === 0) return "rgba(255, 255, 255, 0.08)";
    return "rgba(255, 255, 255, 0.4)";
  };

  const muscles = [
    { name: "Shoulders", sets: muscleSets["Shoulders"] || 0 },
    { name: "Biceps", sets: muscleSets["Biceps"] || 0 },
    { name: "Lats", sets: muscleSets["Lats"] || 0 },
    { name: "Forearms", sets: muscleSets["Forearms"] || 0 },
    { name: "Upper Back", sets: muscleSets["Upper Back"] || 0 },
    { name: "Chest", sets: muscleSets["Chest"] || 0 },
    { name: "Triceps", sets: muscleSets["Triceps"] || 0 },
    { name: "Quads", sets: muscleSets["Quads"] || 0 },
    { name: "Hamstrings", sets: muscleSets["Hamstrings"] || 0 },
    { name: "Calves", sets: muscleSets["Calves"] || 0 },
    { name: "Abs", sets: muscleSets["Abs"] || 0 }
  ];

  return (
    <div className="flex flex-col items-center w-full bg-slate-50/50 dark:bg-black/10 border border-slate-200/50 dark:border-white/5 rounded-[24px] p-6 text-slate-800 dark:text-neutral-300">
      
      <span className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Muscle Target Distribution</span>

      {/* Silhouettes Layout */}
      <div className="flex justify-center items-center gap-12 mb-8 flex-wrap">
        
        {/* FRONT VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-3">Front View</span>
          
          <svg className="w-36 h-72 drop-shadow-md" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* HEAD & NECK */}
            <path d="M44 26 C44 20, 56 20, 56 26 C56 29, 44 29, 44 26" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />
            <path d="M47 30 L47 36 L53 36 L53 30 Z" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />
            
            {/* CHEST */}
            <path 
              d="M34 40 L50 42 L66 40 L64 56 L50 60 L36 56 Z" 
              fill={getHighlightColor(muscleSets["Chest"] || 0)} 
              stroke={getStrokeColor(muscleSets["Chest"] || 0)} 
              strokeWidth="0.8"
            />
            
            {/* SHOULDERS (FRONT) */}
            <path 
              d="M26 38 C26 38, 33 36, 35 41 C33 46, 31 52, 28 54 C26 50, 25 44, 26 38" 
              fill={getHighlightColor(muscleSets["Shoulders"] || 0)} 
              stroke={getStrokeColor(muscleSets["Shoulders"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M74 38 C74 38, 67 36, 65 41 C67 46, 69 52, 72 54 C74 50, 75 44, 74 38" 
              fill={getHighlightColor(muscleSets["Shoulders"] || 0)} 
              stroke={getStrokeColor(muscleSets["Shoulders"] || 0)} 
              strokeWidth="0.8"
            />

            {/* BICEPS */}
            <path 
              d="M27 55 C29 60, 27 68, 24 70 C22 68, 23 60, 25 55 Z" 
              fill={getHighlightColor(muscleSets["Biceps"] || 0)} 
              stroke={getStrokeColor(muscleSets["Biceps"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M73 55 C71 60, 73 68, 76 70 C78 68, 77 60, 75 55 Z" 
              fill={getHighlightColor(muscleSets["Biceps"] || 0)} 
              stroke={getStrokeColor(muscleSets["Biceps"] || 0)} 
              strokeWidth="0.8"
            />

            {/* FOREARMS */}
            <path 
              d="M24 71 C26 77, 23 88, 21 94 L19 94 C19 88, 21 77, 24 71 Z" 
              fill={getHighlightColor(muscleSets["Forearms"] || 0)} 
              stroke={getStrokeColor(muscleSets["Forearms"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M76 71 C74 77, 77 88, 79 94 L81 94 C81 88, 79 77, 76 71 Z" 
              fill={getHighlightColor(muscleSets["Forearms"] || 0)} 
              stroke={getStrokeColor(muscleSets["Forearms"] || 0)} 
              strokeWidth="0.8"
            />

            {/* ABS (CORE) */}
            <path 
              d="M37 58 L63 58 L60 90 L40 90 Z" 
              fill={getHighlightColor(muscleSets["Abs"] || 0)} 
              stroke={getStrokeColor(muscleSets["Abs"] || 0)} 
              strokeWidth="0.8"
            />

            {/* QUADS (THIGHS FRONT) */}
            <path 
              d="M32 94 C32 94, 46 94, 47 102 C45 116, 42 135, 39 144 C34 135, 31 116, 32 94" 
              fill={getHighlightColor(muscleSets["Quads"] || 0)} 
              stroke={getStrokeColor(muscleSets["Quads"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M68 94 C68 94, 54 94, 53 102 C55 116, 58 135, 61 144 C66 135, 69 116, 68 94" 
              fill={getHighlightColor(muscleSets["Quads"] || 0)} 
              stroke={getStrokeColor(muscleSets["Quads"] || 0)} 
              strokeWidth="0.8"
            />

            {/* CALVES (FRONT) */}
            <path d="M36 150 L42 150 L39 184 L36 184 Z" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />
            <path d="M64 150 L58 150 L61 184 L64 184 Z" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />
          </svg>
        </div>

        {/* BACK VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-3">Back View</span>
          
          <svg className="w-36 h-72 drop-shadow-md" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* HEAD & NECK */}
            <path d="M44 26 C44 20, 56 20, 56 26 C56 29, 44 29, 44 26" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />
            <path d="M47 30 L47 36 L53 36 L53 30 Z" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />

            {/* UPPER BACK & TRAPS */}
            <path 
              d="M34 40 L50 34 L66 40 L60 56 L40 56 Z" 
              fill={getHighlightColor(muscleSets["Upper Back"] || 0)} 
              stroke={getStrokeColor(muscleSets["Upper Back"] || 0)} 
              strokeWidth="0.8"
            />

            {/* LATS */}
            <path 
              d="M36 57 L48 57 L48 85 L35 78 Z" 
              fill={getHighlightColor(muscleSets["Lats"] || 0)} 
              stroke={getStrokeColor(muscleSets["Lats"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M64 57 L52 57 L52 85 L65 78 Z" 
              fill={getHighlightColor(muscleSets["Lats"] || 0)} 
              stroke={getStrokeColor(muscleSets["Lats"] || 0)} 
              strokeWidth="0.8"
            />

            {/* SHOULDERS (BACK) */}
            <path 
              d="M26 38 C26 38, 33 36, 35 41 C33 46, 31 52, 28 54 C26 50, 25 44, 26 38" 
              fill={getHighlightColor(muscleSets["Shoulders"] || 0)} 
              stroke={getStrokeColor(muscleSets["Shoulders"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M74 38 C74 38, 67 36, 65 41 C67 46, 69 52, 72 54 C74 50, 75 44, 74 38" 
              fill={getHighlightColor(muscleSets["Shoulders"] || 0)} 
              stroke={getStrokeColor(muscleSets["Shoulders"] || 0)} 
              strokeWidth="0.8"
            />

            {/* TRICEPS */}
            <path 
              d="M25 54 C22 60, 23 68, 25 70 C27 68, 28 60, 26 54 Z" 
              fill={getHighlightColor(muscleSets["Triceps"] || 0)} 
              stroke={getStrokeColor(muscleSets["Triceps"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M75 54 C78 60, 77 68, 75 70 C73 68, 72 60, 74 54 Z" 
              fill={getHighlightColor(muscleSets["Triceps"] || 0)} 
              stroke={getStrokeColor(muscleSets["Triceps"] || 0)} 
              strokeWidth="0.8"
            />

            {/* FOREARMS (BACK) */}
            <path 
              d="M24 71 C26 77, 23 88, 21 94 L19 94 C19 88, 21 77, 24 71 Z" 
              fill={getHighlightColor(muscleSets["Forearms"] || 0)} 
              stroke={getStrokeColor(muscleSets["Forearms"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M76 71 C74 77, 77 88, 79 94 L81 94 C81 88, 79 77, 76 71 Z" 
              fill={getHighlightColor(muscleSets["Forearms"] || 0)} 
              stroke={getStrokeColor(muscleSets["Forearms"] || 0)} 
              strokeWidth="0.8"
            />

            {/* GLUTES (BUTT) */}
            <path d="M37 86 L63 86 L61 106 L39 106 Z" fill="rgba(113, 113, 122, 0.2)" stroke="rgba(255, 255, 255, 0.05)" />

            {/* HAMSTRINGS (THIGHS BACK) */}
            <path 
              d="M32 108 C32 108, 46 108, 47 116 C45 125, 43 138, 41 144 C36 138, 33 125, 32 108" 
              fill={getHighlightColor(muscleSets["Hamstrings"] || 0)} 
              stroke={getStrokeColor(muscleSets["Hamstrings"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M68 108 C68 108, 54 108, 53 116 C55 125, 57 138, 59 144 C64 138, 67 125, 68 108" 
              fill={getHighlightColor(muscleSets["Hamstrings"] || 0)} 
              stroke={getStrokeColor(muscleSets["Hamstrings"] || 0)} 
              strokeWidth="0.8"
            />

            {/* CALVES (BACK) */}
            <path 
              d="M36 150 C36 150, 42 150, 41 160 L39 184 L36 184 Z" 
              fill={getHighlightColor(muscleSets["Calves"] || 0)} 
              stroke={getStrokeColor(muscleSets["Calves"] || 0)} 
              strokeWidth="0.8"
            />
            <path 
              d="M64 150 C64 150, 58 150, 59 160 L61 184 L64 184 Z" 
              fill={getHighlightColor(muscleSets["Calves"] || 0)} 
              stroke={getStrokeColor(muscleSets["Calves"] || 0)} 
              strokeWidth="0.8"
            />
          </svg>
        </div>

      </div>

      {/* Heatmap Legend / Stats list */}
      <div className="w-full space-y-3.5 pt-4 border-t border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-neutral-500 uppercase tracking-widest">
          <span>Muscle Group</span>
          <span>Completed Sets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {muscles.map(({ name, sets }) => (
            <div key={name} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2.5 w-2.5 rounded-full border border-white/10" 
                  style={{ backgroundColor: getHighlightColor(sets) }}
                />
                <span className="font-extrabold text-slate-700 dark:text-neutral-300">{name}</span>
              </div>
              <span className="font-mono text-neutral-400 font-bold">{sets}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
