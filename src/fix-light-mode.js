const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app', 'page.tsx'),
  path.join(__dirname, 'app', 'pricing', 'page.tsx'),
  path.join(__dirname, 'app', 'login', 'page.tsx'),
  path.join(__dirname, 'app', 'register', 'page.tsx'),
  path.join(__dirname, 'components', 'layout', 'AppShell.tsx')
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Let's replace the specific light: patterns with (light-class) dark:(dark-class)
  // For example: "bg-[#09090B] dark:bg-[#09090B] light:bg-[#FAFAFA]" -> "bg-[#FAFAFA] dark:bg-[#09090B]"
  
  const replacements = [
    // Backgrounds
    {
      from: /bg-\[#09090B\]\s+dark:bg-\[#09090B\]\s+light:bg-\[#FAFAFA\]/g,
      to: 'bg-[#FAFAFA] dark:bg-[#09090B]'
    },
    {
      from: /bg-\[#111114\]\/65\s+dark:bg-\[#111114\]\/65\s+light:bg-white\/70/g,
      to: 'bg-white/70 dark:bg-[#111114]/65'
    },
    {
      from: /bg-\[#111114\]\/65\s+dark:bg-\[#111114\]\/65\s+light:bg-white/g,
      to: 'bg-white dark:bg-[#111114]/65'
    },
    {
      from: /bg-\[#111114\]\/80\s+dark:bg-\[#111114\]\/80\s+light:bg-white/g,
      to: 'bg-white dark:bg-[#111114]/80'
    },
    {
      from: /bg-black\s+dark:bg-black\s+light:bg-slate-50/g,
      to: 'bg-slate-50 dark:bg-black'
    },
    {
      from: /bg-white\/5\s+dark:bg-white\/5\s+light:bg-slate-100/g,
      to: 'bg-slate-100 dark:bg-white/5'
    },
    {
      from: /bg-white\/10\s+dark:bg-white\/10\s+light:bg-slate-200/g,
      to: 'bg-slate-200 dark:bg-white/10'
    },
    {
      from: /bg-white\/5\s+dark:bg-white\/5\s+light:bg-slate-50/g,
      to: 'bg-slate-50 dark:bg-white/5'
    },
    {
      from: /bg-[#0D0D0E]\/80\s+dark:bg-\[#0D0D0E\]\/80\s+light:bg-white/g,
      to: 'bg-white dark:bg-[#0D0D0E]/80'
    },

    // Text colors
    {
      from: /text-\[#FAFAFA\]\s+dark:text-\[#FAFAFA\]\s+light:text-\[#09090B\]/g,
      to: 'text-[#09090B] dark:text-[#FAFAFA]'
    },
    {
      from: /text-white\s+dark:text-white\s+light:text-\[#09090B\]/g,
      to: 'text-[#09090B] dark:text-white'
    },
    {
      from: /text-white\s+dark:text-white\s+light:text-slate-800/g,
      to: 'text-slate-800 dark:text-white'
    },
    {
      from: /text-neutral-300\s+dark:text-neutral-300\s+light:text-slate-800/g,
      to: 'text-slate-800 dark:text-neutral-300'
    },
    {
      from: /text-[#A1A1AA]\s+dark:text-\[#A1A1AA\]\s+light:text-slate-500/g,
      to: 'text-slate-500 dark:text-[#A1A1AA]'
    },
    {
      from: /text-neutral-400\s+dark:text-neutral-400\s+light:text-slate-500/g,
      to: 'text-slate-500 dark:text-neutral-400'
    },
    {
      from: /text-neutral-400\s+dark:text-neutral-400\s+light:text-slate-600/g,
      to: 'text-slate-600 dark:text-neutral-400'
    },
    {
      from: /text-neutral-400\s+dark:text-neutral-400\s+light:text-slate-650/g,
      to: 'text-slate-650 dark:text-neutral-400'
    },
    {
      from: /text-neutral-300\s+dark:text-neutral-300\s+light:text-slate-700/g,
      to: 'text-slate-700 dark:text-neutral-300'
    },

    // Borders
    {
      from: /border-white\/\[0\.06\]\s+dark:border-white\/\[0\.06\]\s+light:border-slate-200\/50/g,
      to: 'border-slate-200/50 dark:border-white/[0.06]'
    },
    {
      from: /border-white\/\[0\.08\]\s+dark:border-white\/\[0\.08\]\s+light:border-slate-200\/60/g,
      to: 'border-slate-200/60 dark:border-white/[0.08]'
    },
    {
      from: /border-white\/\[0\.08\]\s+dark:border-white\/\[0\.08\]\s+light:border-slate-200/g,
      to: 'border-slate-200 dark:border-white/[0.08]'
    },
    {
      from: /border-white\/10\s+dark:border-white\/10\s+light:border-slate-200/g,
      to: 'border-slate-200 dark:border-white/10'
    },
    {
      from: /border-white\/10\s+dark:border-white\/10\s+light:border-slate-200\/60/g,
      to: 'border-slate-200/60 dark:border-white/10'
    },
    {
      from: /border-r\s+border-white\/5\s+dark:border-white\/5\s+light:border-slate-200/g,
      to: 'border-r border-slate-200 dark:border-white/5'
    },

    // Hover states
    {
      from: /hover:text-\[#FAFAFA\]\s+dark:hover:text-\[#FAFAFA\]\s+light:hover:text-\[#09090B\]/g,
      to: 'hover:text-[#09090B] dark:hover:text-[#FAFAFA]'
    },
    {
      from: /hover:text-white\s+dark:hover:text-white\s+light:hover:text-\[#09090B\]/g,
      to: 'hover:text-[#09090B] dark:hover:text-white'
    },
    {
      from: /hover:text-white\s+dark:hover:text-white\s+light:hover:text-black/g,
      to: 'hover:text-black dark:hover:text-white'
    },
    {
      from: /hover:bg-white\/10\s+dark:hover:bg-white\/10\s+light:hover:bg-slate-200/g,
      to: 'hover:bg-slate-200 dark:hover:bg-white/10'
    },
    {
      from: /hover:bg-white\/5\s+dark:hover:bg-white\/5\s+light:hover:bg-slate-100/g,
      to: 'hover:bg-slate-100 dark:hover:bg-white/5'
    },

    // Shadow states
    {
      from: /shadow-\[0_10px_35px_rgba\(0,0,0,0\.3\)\]\s+dark:shadow-\[0_10px_35px_rgba\(0,0,0,0\.3\)\]\s+light:shadow-\[0_10px_30px_rgba\(0,0,0,0\.05\)\]/g,
      to: 'shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)]'
    },
    {
      from: /shadow-\[0_25px_50px_-12px_rgba\(0,0,0,0\.5\)\]\s+dark:shadow-\[0_25px_50px_-12px_rgba\(0,0,0,0\.5\)\]\s+light:shadow-\[0_20px_40px_rgba\(0,0,0,0\.04\)\]/g,
      to: 'shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'
    },

    // Gradients
    {
      from: /from-white\s+via-white\s+dark:from-white\s+dark:via-white\s+light:from-\[#09090B\]\s+light:via-\[#09090B\]\s+light:to-slate-700/g,
      to: 'from-[#09090B] via-[#09090B] to-slate-700 dark:from-white dark:via-white dark:to-white'
    },

    // Radial gradients / background bubbles
    {
      from: /bg-\[radial-gradient\(ellipse,rgba\(196,181,253,0\.15\)_0%,rgba\(249,168,212,0\.05\)_50%,transparent_75%\)\]\s+dark:bg-\[radial-gradient\(ellipse,rgba\(196,181,253,0\.15\)_0%,rgba\(249,168,212,0\.05\)_50%,transparent_75%\)\]\s+light:bg-\[radial-gradient\(ellipse,rgba\(167,139,250,0\.06\)_0%,transparent_60%\)\]/g,
      to: 'bg-[radial-gradient(ellipse,rgba(167,139,250,0.06)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse,rgba(196,181,253,0.15)_0%,rgba(249,168,212,0.05)_50%,transparent_75%)]'
    },
    {
      from: /bg-\[radial-gradient\(circle,rgba\(253,186,116,0\.03\)_0%,transparent_65%\)\]\s+dark:bg-\[radial-gradient\(circle,rgba\(253,186,116,0\.02\)_0%,transparent_65%\)\]\s+light:hidden/g,
      to: 'light:hidden dark:bg-[radial-gradient(circle,rgba(253,186,116,0.02)_0%,transparent_65%)]'
    },
    {
      from: /bg-\[radial-gradient\(circle,rgba\(196,181,253,0\.12\)_0%,transparent_70%\)\]\s+dark:bg-\[radial-gradient\(circle,rgba\(196,181,253,0\.12\)_0%,transparent_70%\)\]\s+light:bg-\[radial-gradient\(circle,rgba\(167,139,250,0\.04\)_0%,transparent_70%\)\]/g,
      to: 'bg-[radial-gradient(circle,rgba(167,139,250,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(196,181,253,0.12)_0%,transparent_70%)]'
    },
    {
      from: /bg-\[radial-gradient\(circle,rgba\(249,168,212,0\.08\)_0%,transparent_70%\)\]\s+dark:bg-\[radial-gradient\(circle,rgba\(249,168,212,0\.08\)_0%,transparent_70%\)\]\s+light:hidden/g,
      to: 'light:hidden dark:bg-[radial-gradient(circle,rgba(249,168,212,0.08)_0%,transparent_70%)]'
    },

    // Grid persistent
    {
      from: /opacity-70\s+dark:opacity-70\s+light:opacity-50/g,
      to: 'opacity-50 dark:opacity-70'
    },
    {
      from: /opacity-\[0\.015\]\s+dark:opacity-\[0\.015\]\s+light:opacity-\[0\.005\]/g,
      to: 'opacity-[0.005] dark:opacity-[0.015]'
    },
    {
      from: /opacity-\[0\.02\]\s+dark:opacity-\[0\.02\]\s+light:opacity-\[0\.04\]/g,
      to: 'opacity-[0.04] dark:opacity-[0.02]'
    },
    {
      from: /bg-\[radial-gradient\(circle_at_center,rgba\(255,255,255,0\.01\)_1\.5px,transparent_1\.5px\)\]\s+dark:bg-\[radial-gradient\(circle_at_center,rgba\(255,255,255,0\.01\)_1\.5px,transparent_1\.5px\)\]\s+light:bg-\[radial-gradient\(circle_at_center,rgba\(0,0,0,0\.015\)_1\.5px,transparent_1\.5px\)\]/g,
      to: 'bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.015)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)]'
    },

    // Spotlights & details
    {
      from: /bg-white\/\[0\.03\]\s+dark:bg-white\/\[0\.03\]\s+light:bg-slate-100\s+hover:bg-white\/\[0\.06\]\s+dark:hover:bg-white\/\[0\.06\]\s+light:hover:bg-slate-200/g,
      to: 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
    },
    {
      from: /bg-white\/\[0\.03\]\s+dark:bg-white\/\[0\.03\]\s+light:bg-slate-100/g,
      to: 'bg-slate-100 dark:bg-white/[0.03]'
    },
    {
      from: /border-white\/\[0\.03\]\s+dark:border-white\/\[0\.03\]\s+light:border-slate-200\/50/g,
      to: 'border-slate-200/50 dark:border-white/[0.03]'
    },
    {
      from: /border-dashed\s+border-white\/\[0\.03\]\s+dark:border-white\/\[0\.03\]\s+light:border-slate-200\/40/g,
      to: 'border-dashed border-slate-200/40 dark:border-white/[0.03]'
    },
    {
      from: /bg-neutral-900\/60\s+dark:bg-neutral-900\/60\s+light:bg-slate-100/g,
      to: 'bg-slate-100 dark:bg-neutral-900/60'
    },
    {
      from: /bg-neutral-900\/65\s+dark:bg-neutral-900\/65\s+light:bg-white\/90/g,
      to: 'bg-white/90 dark:bg-neutral-900/65'
    },

    // Sidebar items
    {
      from: /pathname\s+===\s+link\.href\s*\?\s*"bg-white\/10\s+text-white\s+border-white\/10\s+dark:bg-white\/10\s+dark:text-white\s+dark:border-white\/10\s+light:bg-\[#A78BFA\]\/10\s+light:text-\[#A78BFA\]\s+light:border-\[#A78BFA\]\/20\s+shadow-\[inset_0_1px_1px_rgba\(255,255,255,0\.05\)\]"\s*:\s*"text-neutral-400\s+hover:bg-white\/5\s+hover:text-neutral-200\s+dark:hover:bg-white\/5\s+dark:hover:text-neutral-200\s+light:hover:bg-slate-100\s+light:hover:text-slate-800"/g,
      to: 'pathname === link.href ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20 dark:bg-white/10 dark:text-white dark:border-white/10" : "text-neutral-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-neutral-200"'
    },
    {
      from: /pathname\s+===\s+"\/profile"\s*\?\s*"bg-white\/10\s+text-white\s+border-white\/10\s+dark:bg-white\/10\s+dark:text-white\s+dark:border-white\/10\s+light:bg-\[#A78BFA\]\/10\s+light:text-\[#A78BFA\]\s+light:border-\[#A78BFA\]\/20"\s*:\s*"text-neutral-400\s+hover:bg-white\/5\s+hover:text-neutral-200\s+dark:hover:bg-white\/5\s+dark:hover:text-neutral-200\s+light:hover:bg-slate-100\s+light:hover:text-slate-800"/g,
      to: 'pathname === "/profile" ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20 dark:bg-white/10 dark:text-white dark:border-white/10" : "text-neutral-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-neutral-200"'
    },
    {
      from: /isActive\s*\?\s*"bg-white\/10\s+dark:bg-white\/10\s+light:bg-\[#A78BFA\]\/10\s+text-white\s+dark:text-white\s+light:text-\[#A78BFA\]\s+border\s+border-white\/10\s+dark:border-white\/10\s+light:border-\[#A78BFA\]\/20"\s*:\s*"text-neutral-500\s+hover:text-neutral-300"/g,
      to: 'isActive ? "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20 dark:bg-white/10 dark:text-white dark:border-white/10" : "text-neutral-500 hover:text-neutral-300"'
    }
  ];

  let original = content;
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  // Also catch generic light: prefixes remaining
  // e.g. "light:bg-slate-100" -> let's warn or replace if easy
  // Let's replace any single tokens of light:xxx
  // Since some might be missed, let's look at remaining occurrences
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned up light: variants in: ${filePath}`);
  }
});
