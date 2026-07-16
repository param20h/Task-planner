"use client";

import React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
  className?: string;
  buttonClassName?: string;
}

export function Select({ value, onChange, options, label, className, buttonClassName }: SelectProps) {
  return (
    <div className={cn("relative flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider pl-1">
          {label}
        </span>
      )}
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <>
            <ListboxButton
              className={cn(
                "relative flex items-center justify-between w-full rounded-xl border border-slate-200 dark:border-white/10",
                "bg-slate-100 dark:bg-black/60 px-4 py-2.5 text-xs text-left text-slate-800 dark:text-white",
                "focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300 select-none cursor-pointer",
                buttonClassName
              )}
            >
              <span>{value}</span>
              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
            </ListboxButton>

            <AnimatePresence>
              {open && (
                <ListboxOptions
                  static
                  anchor={{ to: "bottom start", gap: "4px" }}
                  className="z-50 focus:outline-none !overflow-visible"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      "w-[var(--button-width)] rounded-xl border border-slate-200 dark:border-white/10",
                      "bg-white dark:bg-[#0d0d0e] p-1.5 shadow-2xl backdrop-blur-xl focus:outline-none"
                    )}
                  >
                    {options.map((opt) => (
                      <ListboxOption
                        key={opt}
                        value={opt}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 text-xs select-none cursor-pointer",
                          "text-slate-700 dark:text-neutral-300",
                          "data-[focus]:bg-[#6068F0]/10 data-[focus]:text-[#6068F0] dark:data-[focus]:text-white",
                          "data-[selected]:bg-[#6068F0]/15 dark:data-[selected]:bg-white/10",
                          "transition-all duration-200"
                        )}
                      >
                        <Check className="h-3.5 w-3.5 invisible group-data-[selected]:visible text-[#6068F0] dark:text-white" />
                        <span>{opt}</span>
                      </ListboxOption>
                    ))}
                  </motion.div>
                </ListboxOptions>
              )}
            </AnimatePresence>
          </>
        )}
      </Listbox>
    </div>
  );
}
