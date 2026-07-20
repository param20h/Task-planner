"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user has dismissed it before, don't show
    if (localStorage.getItem("pwa_prompt_dismissed") === "true") {
      return;
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install banner
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_prompt_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 md:top-auto md:bottom-6 left-4 right-4 md:left-6 md:right-auto z-[60] md:w-96 p-4 rounded-2xl bg-slate-100/95 dark:bg-[#111114]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-between gap-4 transition-all duration-500 hover:scale-[1.02] animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#6068F0]/10 flex items-center justify-center text-[#6068F0] shrink-0">
          <Download className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Install App</h4>
          <p className="text-[10px] text-slate-500 dark:text-neutral-400 leading-tight">
            Add to home screen for offline access.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={handleInstallClick}
          className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-lg text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5 h-auto"
        >
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
