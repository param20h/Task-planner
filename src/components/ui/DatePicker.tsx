"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Context for Composable State Sharing
// ─────────────────────────────────────────────────────────────────────────────

interface DatePickerContextType {
  value: Date | null;
  setValue: (date: Date | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const DatePickerContext = createContext<DatePickerContextType | null>(null);

function useDatePicker() {
  const context = useContext(DatePickerContext);
  if (!context) throw new Error("DatePicker compound components must be used inside <DatePicker>");
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DatePicker (Root Wrapper)
// ─────────────────────────────────────────────────────────────────────────────

interface DatePickerProps {
  children: React.ReactNode;
  className?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
}

function DatePickerBase({ children, className, value: controlledValue, onChange }: DatePickerProps) {
  const [localValue, setLocalValue] = useState<Date | null>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const triggerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : localValue;
  const setValue = (date: Date | null) => {
    if (controlledValue === undefined) {
      setLocalValue(date);
    }
    if (onChange) {
      onChange(date);
    }
  };

  useEffect(() => {
    if (value) {
      setDisplayDate(value);
    }
  }, [value]);

  return (
    <DatePickerContext.Provider value={{ value, setValue, isOpen, setIsOpen, displayDate, setDisplayDate, triggerRef }}>
      <div className={cn("relative flex flex-col gap-1.5 w-full", className)}>
        {children}
      </div>
    </DatePickerContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Label
// ─────────────────────────────────────────────────────────────────────────────

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider", className)}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DateField (Input & Composition Group)
// ─────────────────────────────────────────────────────────────────────────────

export function DateFieldGroup({ children, className, fullWidth }: { children: React.ReactNode; className?: string; fullWidth?: boolean }) {
  const { triggerRef, setIsOpen } = useDatePicker();

  // Close calendar popover on click outside
  return (
    <div
      ref={triggerRef}
      className={cn(
        "flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10",
        "bg-slate-100 dark:bg-black/60 px-4 py-2.5 text-sm text-slate-800 dark:text-white",
        "focus-within:border-[#6068F0]/50 transition-all duration-300",
        fullWidth ? "w-full" : "w-72",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DateFieldInput({ children }: { children: (segment: string) => React.ReactNode }) {
  const { value } = useDatePicker();
  
  // Format current value for segmented rendering
  const formattedMonth = value ? format(value, "MM") : "MM";
  const formattedDay = value ? format(value, "dd") : "DD";
  const formattedYear = value ? format(value, "yyyy") : "YYYY";

  return (
    <div className="flex items-center gap-1 select-none font-mono text-sm">
      {children(formattedMonth)}
      <span className="text-slate-400 dark:text-neutral-600">/</span>
      {children(formattedDay)}
      <span className="text-slate-400 dark:text-neutral-600">/</span>
      {children(formattedYear)}
    </div>
  );
}

export function DateFieldSegment({ segment }: { segment: string }) {
  return (
    <span className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors">
      {segment}
    </span>
  );
}

export function DateFieldSuffix({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center pl-2">{children}</div>;
}

// Attach subcomponents to DateField namespace
export const DateField = {
  Group: DateFieldGroup,
  Input: DateFieldInput,
  Segment: DateFieldSegment,
  Suffix: DateFieldSuffix,
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Trigger & TriggerIndicator
// ─────────────────────────────────────────────────────────────────────────────

export function DatePickerTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, setIsOpen } = useDatePicker();
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn("text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

export function DatePickerTriggerIndicator({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (children) return <>{children}</>;
  return <CalendarIcon className={cn("size-4 text-slate-500 dark:text-neutral-450", className)} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Popover (Calendar Container)
// ─────────────────────────────────────────────────────────────────────────────

export function DatePickerPopover({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, setIsOpen, triggerRef } = useDatePicker();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 4, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute top-full left-0 z-50 mt-1.5 p-4 rounded-2xl",
            "bg-white dark:bg-[#0d0d0e] border border-slate-200 dark:border-white/10",
            "shadow-2xl shadow-black/40 backdrop-blur-xl",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Calendar (Grid, Headers, Navigation)
// ─────────────────────────────────────────────────────────────────────────────

export function CalendarComponent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 w-64", className)}>
      {children}
    </div>
  );
}

export function CalendarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
      {children}
    </div>
  );
}

export function CalendarYearPickerTrigger() {
  const { displayDate } = useDatePicker();
  return (
    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest pl-1">
      {format(displayDate, "MMMM yyyy")}
    </span>
  );
}

export function CalendarNavButton({ slot }: { slot: "previous" | "next" }) {
  const { displayDate, setDisplayDate } = useDatePicker();

  const handleNav = () => {
    if (slot === "previous") {
      setDisplayDate(subMonths(displayDate, 1));
    } else {
      setDisplayDate(addMonths(displayDate, 1));
    }
  };

  return (
    <button
      type="button"
      onClick={handleNav}
      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-neutral-400 transition-colors"
    >
      {slot === "previous" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

export function CalendarGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
      {children}
    </div>
  );
}

export function CalendarGridHeader({ children }: { children: (day: string) => React.ReactNode }) {
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return (
    <>
      {weekDays.map((day) => children(day))}
    </>
  );
}

export function CalendarHeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-600 pb-1">
      {children}
    </span>
  );
}

export function CalendarGridBody({ children }: { children: (date: Date) => React.ReactNode }) {
  const { displayDate } = useDatePicker();

  const daysInMonth = getDaysInMonth(displayDate);
  const firstDayOfMonth = getDay(startOfMonth(displayDate));

  const totalGridSlots = Array.from({ length: firstDayOfMonth + daysInMonth });

  return (
    <>
      {totalGridSlots.map((_, index) => {
        if (index < firstDayOfMonth) {
          return <span key={`empty-${index}`} />;
        }
        const dayNumber = index - firstDayOfMonth + 1;
        const targetDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), dayNumber);
        return children(targetDate);
      })}
    </>
  );
}

export function CalendarCell({ date }: { date: Date }) {
  const { value, setValue, setIsOpen } = useDatePicker();
  const dayNumber = date.getDate();

  const isSelected = value ? isSameDay(date, value) : false;
  const isToday = isSameDay(date, new Date());

  return (
    <span
      onClick={() => {
        setValue(date);
        setIsOpen(false);
      }}
      className={cn(
        "w-7 h-7 flex items-center justify-center mx-auto rounded-full text-xs cursor-pointer transition-all duration-200 select-none",
        isSelected
          ? "bg-[#6068F0] text-white font-bold shadow-md shadow-[#6068F0]/15 scale-105"
          : isToday
            ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold"
            : "text-slate-500 dark:text-neutral-450 hover:bg-slate-100 dark:hover:bg-white/5"
      )}
    >
      {dayNumber}
    </span>
  );
}

// Assemble Calendar compound namespace
export const Calendar = Object.assign(CalendarComponent, {
  Header: CalendarHeader,
  YearPickerTrigger: CalendarYearPickerTrigger,
  YearPickerTriggerHeading: () => null,
  YearPickerTriggerIndicator: () => null,
  NavButton: CalendarNavButton,
  Grid: CalendarGrid,
  GridHeader: CalendarGridHeader,
  HeaderCell: CalendarHeaderCell,
  GridBody: CalendarGridBody,
  Cell: CalendarCell,
  YearPickerGrid: () => null,
  YearPickerGridBody: () => null,
  YearPickerCell: () => null,
});

// Attach subcomponents to main DatePicker namespace
export const DatePicker = Object.assign(DatePickerBase, {
  Root: DatePickerBase,
  Label,
  Trigger: DatePickerTrigger,
  TriggerIndicator: DatePickerTriggerIndicator,
  Popover: DatePickerPopover,
});
