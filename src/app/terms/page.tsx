"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsPage() {
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

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-[#6068F0] dark:hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#6068F0]/10 border border-[#6068F0]/20 flex items-center justify-center text-[#6068F0] mb-2">
              <Scale className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">Terms of Service</h1>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Last updated: July 8, 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">1. Acceptance of Terms</h2>
              <p>
                By creating a ZenithFlow account and deploying the performance dashboard, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the application.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">2. User Accounts and Verification</h2>
              <p>
                You are responsible for safeguarding your credentials, Groq API key tokens, and access permissions. ZenithFlow is not liable for data loss or unauthorized database changes resulting from key exposure or insecure configuration settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">3. Fair Usage and Integrity</h2>
              <p>
                You agree to use our dynamic analytics calculators, planner schedule timeline grids, and AI Coaching insights for personal developmental purposes. Any attempts to overload, abuse, or bypass Supabase API limits or security policies are strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">4. Modifications and Interruption</h2>
              <p>
                We reserve the right to modify, update, or temporarily suspend portions of our performance modules, habits trackers, and dashboard synchronization mechanisms to apply migrations, maintain stability, or improve features.
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
