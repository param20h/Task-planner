"use client";

import React from 'react';

interface ProductHuntBadgeProps {
  postId?: string;
  theme?: 'light' | 'dark' | 'neutral';
}

export default function ProductHuntBadge({ 
  postId = "797204", // Fallback ID, updates live with upvote counts once launch goes live
  theme = "dark" 
}: ProductHuntBadgeProps) {
  return (
    <div className="flex justify-start items-center pt-2">
      <a 
        href="https://www.producthunt.com/posts/zenithflow?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-zenithflow" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] rounded-[14px]"
      >
        <img 
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${postId}&theme=${theme}`} 
          alt="ZenithFlow - Unified workspace for tasks, gym volume logs & AI coaching | Product Hunt" 
          style={{ width: '250px', height: '54px' }} 
          width="250" 
          height="54" 
          className="rounded-[12px] border border-slate-200 dark:border-white/10"
        />
      </a>
    </div>
  );
}
