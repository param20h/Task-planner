"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-slate-800 dark:text-neutral-300 antialiased overflow-x-hidden transition-colors duration-500 font-sans p-6 md:p-16">
      
      {/* Background grids */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.05)_0%,transparent_60%)] blur-[80px]" />
      </div>

      <div className="max-w-[800px] mx-auto relative z-10 space-y-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
          <Link href="/" className="font-sans font-bold text-lg tracking-tighter flex items-center gap-2 group text-[#09090B] dark:text-white">
            <div className="relative h-5 w-5 rounded-md overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10">
              <Image src="/logo.jpg" alt="ZenithFlow Logo" fill sizes="20px" className="object-cover" />
            </div>
            <span className="font-extrabold text-base tracking-tight">ZenithFlow</span>
          </Link>

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#6068F0]/10 border border-[#6068F0]/20 flex items-center justify-center text-[#6068F0] mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">Privacy Policy</h1>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Last updated: July 8, 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">1. Information We Collect</h2>
              <p>
                ZenithFlow collects data to assist you in tracking your goals, workouts, nutrition calorie metrics, and focus schedules. This information includes your profile identifiers, health logs, task completions, and custom timeline parameters. All logs are securely persisted using encrypted databases.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">2. How We Use Information</h2>
              <p>
                We use the collected information strictly to populate your personal dashboard, deliver AI Coach cognitive focus evaluations, and analyze your performance consistency. We do not sell, rent, or share your personal database logs with third-party advertisers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">3. Data Security and Persistence</h2>
              <p>
                Your data is stored in isolated Supabase databases utilizing row-level security (RLS) policies. Only your authenticated user account has read and write access to your logs. API requests to Groq LLM endpoints do not persist your personal key parameters on our servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">4. Your Rights and Access</h2>
              <p>
                You retain complete ownership of your fitness logs, goal records, and checklist items. You can view, modify, or permanently delete individual workouts, tasks, and data entries directly from your dashboard and settings pages at any time.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-neutral-600 pt-8 border-t border-slate-200/50 dark:border-white/5">
          © 2026 ZenithFlow. All rights reserved.
        </div>
      </div>
    </div>
  );
}
