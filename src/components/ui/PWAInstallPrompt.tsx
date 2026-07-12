"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-40 md:bottom-6 right-6 left-6 md:left-auto z-40 md:w-96 p-4 rounded-2xl bg-white/80 dark:bg-[#111114]/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-between gap-4 transition-all duration-500 hover:scale-[1.02]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#6068F0]/10 flex items-center justify-center text-[#6068F0]">
          <Download className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Download ZenithFlow App</h4>
          <p className="text-[10px] text-slate-500 dark:text-neutral-400 leading-normal">
            Install on your home screen for quick offline access.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleInstallClick}
          className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 h-auto"
        >
          Install
        </Button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
