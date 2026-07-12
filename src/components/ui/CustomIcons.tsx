"use client";

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Helper to pass general layout props
const baseSvgProps = (size: number = 18) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: size,
  height: size,
});

export const CustomDashboardIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6068F0" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="7" height="9" rx="1.5" fill="url(#dashGrad)" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" fill="url(#dashGrad)" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="6.5" cy="7.5" r="1" className="fill-[#A78BFA]" />
    <circle cx="17.5" cy="16.5" r="1" className="fill-[#6068F0]" />
  </svg>
);

export const CustomPlannerIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="planGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6068F0" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <rect x="3" y="4" width="18" height="18" rx="3" fill="url(#planGrad)" stroke="currentColor" strokeWidth="2" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2.2" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2.2" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 14h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2z" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const CustomFoodIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="foodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#047857" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <path
      d="M12 21a6 6 0 0 1-6-6c0-3.8 2.6-6 6-6s6 2.2 6 6a6 6 0 0 1-6 6z"
      fill="url(#foodGrad)"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M12 9c.5-1.5 1.5-3 3.5-3.5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6c-1.5-1.5-3.5-1.5-4 0 .5 2 2.5 2.5 4 0" fill="#10B981" fillOpacity="0.8" />
  </svg>
);

export const CustomStudyIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="studyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6068F0" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="url(#studyGrad)" stroke="currentColor" strokeWidth="2" />
    <path d="M6 12v5c0 2 2 3.5 6 3.5s6-1.5 6-3.5v-5" stroke="currentColor" strokeWidth="2" />
    <path d="M22 10v5.5a1.5 1.5 0 0 1-3 0V10" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

export const CustomWorkoutIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="gymGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="12" height="4" rx="1" fill="url(#gymGrad)" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="6" width="3" height="12" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <rect x="18" y="6" width="3" height="12" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2.5" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const CustomGoalsIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <radialGradient id="goalsRad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" fill="url(#goalsRad)" stroke="currentColor" strokeWidth="2" />
    <path d="m19 5-4.5 4.5M19 5l-4 1m4-1-1 4" stroke="#EC4899" strokeWidth="2" />
  </svg>
);

export const CustomAnalyticsIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="analGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" stroke="currentColor" strokeWidth="2" />
    <path d="m5 16 4-5 5 3 6-8" stroke="currentColor" strokeWidth="2" />
    <path d="m5 16 4-5 5 3 6-8v15H5z" fill="url(#analGrad)" opacity="0.5" />
    <circle cx="9" cy="11" r="1.5" fill="#3B82F6" stroke="currentColor" strokeWidth="1" />
    <circle cx="14" cy="14" r="1.5" fill="#3B82F6" stroke="currentColor" strokeWidth="1" />
    <circle cx="20" cy="6" r="1.5" fill="#3B82F6" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const CustomJournalIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="journGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" />
    <path d="M6 2v20h14V2H6z" fill="url(#journGrad)" stroke="currentColor" strokeWidth="2" />
    <path d="M9 6h6M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <path d="M17 2v5l-2-1.5L13 7V2h4z" fill="#6068F0" fillOpacity="0.75" />
  </svg>
);

export const CustomCoachIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <radialGradient id="coachRad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6068F0" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path
      d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z"
      stroke="currentColor"
      strokeWidth="2"
      fill="url(#coachRad)"
    />
    <path
      d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z"
      stroke="currentColor"
      strokeWidth="2"
      fill="url(#coachRad)"
    />
    <circle cx="12" cy="7" r="1" fill="#A78BFA" />
    <circle cx="12" cy="12" r="1.2" fill="#6068F0" />
    <circle cx="12" cy="17" r="1" fill="#A78BFA" />
  </svg>
);

export const CustomSettingsIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const CustomClockIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <radialGradient id="clockRad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#6068F0" stopOpacity="0.0" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#clockRad)" stroke="currentColor" strokeWidth="2" />
    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v2M12 20v2M20 12h2M2 12h2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

export const CustomFlameIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"
      fill="url(#flameGrad)"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const CustomDropletIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6068F0" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <path
      d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"
      fill="url(#dropGrad)"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M16 14a3 3 0 0 0-3-3" stroke="white" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

export const CustomSparklesIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" opacity="0.75" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" opacity="0.75" />
  </svg>
);

export const CustomCoffeeIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#D97706" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" fill="url(#coffeeGrad)" stroke="currentColor" strokeWidth="2" />
    <path d="M6 2v3M10 2v3M14 2v3" stroke="currentColor" strokeWidth="1.8" opacity="0.7" />
  </svg>
);

export const CustomUtensilsIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="utenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <path d="M4 3v7a6 6 0 0 0 4 5.65V21M17 3v18M20 3v4a3 3 0 0 1-6 0V3M8 3v4" stroke="currentColor" fill="url(#utenGrad)" strokeWidth="2" />
  </svg>
);

export const CustomSaladIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="saladGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <path d="M2 12a10 10 0 0 0 20 0H2z" fill="url(#saladGrad)" stroke="currentColor" strokeWidth="2" />
    <path d="M5 10c0-3 3-5 5-5s4 2 4 5M15 8c1-2 3-3 5-3" stroke="currentColor" strokeWidth="1.8" opacity="0.8" />
  </svg>
);

export const CustomCookieIcon = ({ size, className, ...props }: IconProps) => (
  <svg {...baseSvgProps(size)} className={className} {...props}>
    <defs>
      <linearGradient id="cookieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#cookieGrad)" stroke="currentColor" strokeWidth="2" />
    <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="13" cy="15" r="1" fill="currentColor" stroke="none" />
  </svg>
);
