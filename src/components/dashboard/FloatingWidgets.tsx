"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Minus, 
  Flame, 
  Droplet, 
  X,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const glassCardClass = "bg-white/80 dark:bg-[#111114]/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-5 space-y-4 text-slate-700 dark:text-neutral-300 relative overflow-hidden transition-all duration-300";

interface FloatingWidgetsProps {
  profileId: string;
  onRefresh?: () => void;
}

export function FloatingWidgets({ profileId, onRefresh }: FloatingWidgetsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Biometrics Quick State
  const [waterCount, setWaterCount] = useState(0.00);
  const [caloriesCount, setCaloriesCount] = useState(0);

  useEffect(() => {
    // Fetch today's cumulative water & calories count on load
    async function fetchBiometrics() {
      if (!profileId) return;
      const nowLocal = new Date();
      const todayStart = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 0, 0, 0, 0).toISOString();
      const todayEnd = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 23, 59, 59, 999).toISOString();

      try {
        const { data: waterData } = await supabase
          .from("water_logs")
          .select("amount_liters")
          .eq("profile_id", profileId)
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd);

        if (waterData) {
          const totalWater = waterData.reduce((sum, item) => sum + Number(item.amount_liters), 0);
          setWaterCount(totalWater);
        }

        const { data: foodData } = await supabase
          .from("food_logs")
          .select("calories")
          .eq("profile_id", profileId)
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd);

        if (foodData) {
          const totalCalories = foodData.reduce((sum, item) => sum + item.calories, 0);
          setCaloriesCount(totalCalories);
        }
      } catch (err) {
        console.error("Error loading widget metrics:", err);
      }
    }
    fetchBiometrics();
  }, [profileId]);

  // Log water
  const handleLogWater = async (amount: number) => {
    if (!profileId) return;

    if (amount > 0) {
      // Adding: Insert standard log
      setWaterCount(prev => prev + amount);
      try {
        const { error } = await supabase
          .from("water_logs")
          .insert({
            profile_id: profileId,
            amount_liters: amount
          });
        if (!error && onRefresh) onRefresh();
      } catch (err) {
        console.error("Failed to log water:", err);
      }
    } else {
      // Subtracting: Find the last water log of today and decrease/delete it
      const nowLocal = new Date();
      const todayStart = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 0, 0, 0, 0).toISOString();
      const todayEnd = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 23, 59, 59, 999).toISOString();

      try {
        const { data: lastLogs } = await supabase
          .from("water_logs")
          .select("id, amount_liters")
          .eq("profile_id", profileId)
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd)
          .order("created_at", { ascending: false })
          .limit(1);

        if (lastLogs && lastLogs.length > 0) {
          const lastLog = lastLogs[0];
          const currentAmount = Number(lastLog.amount_liters);
          const subtractAmt = Math.abs(amount);

          if (currentAmount <= subtractAmt) {
            // Delete log if it drops below 0
            await supabase.from("water_logs").delete().eq("id", lastLog.id);
            setWaterCount(prev => Math.max(0, prev - currentAmount));
          } else {
            // Decrement
            const newAmount = Number((currentAmount - subtractAmt).toFixed(2));
            await supabase.from("water_logs").update({ amount_liters: newAmount }).eq("id", lastLog.id);
            setWaterCount(prev => Math.max(0, prev - subtractAmt));
          }
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        console.error("Failed to subtract water:", err);
      }
    }
  };

  // Log calories
  const handleLogCalories = async (calories: number) => {
    if (!profileId) return;

    if (calories > 0) {
      // Adding: Insert standard food log
      setCaloriesCount(prev => prev + calories);
      try {
        const { error } = await supabase
          .from("food_logs")
          .insert({
            profile_id: profileId,
            meal_type: "snacks",
            food_name: "Quick Snack (Widget)",
            calories: calories
          });
        if (!error && onRefresh) onRefresh();
      } catch (err) {
        console.error("Failed to log calories:", err);
      }
    } else {
      // Subtracting: Find the last food log of today and decrease/delete it
      const nowLocal = new Date();
      const todayStart = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 0, 0, 0, 0).toISOString();
      const todayEnd = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 23, 59, 59, 999).toISOString();

      try {
        const { data: lastLogs } = await supabase
          .from("food_logs")
          .select("id, calories")
          .eq("profile_id", profileId)
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd)
          .order("created_at", { ascending: false })
          .limit(1);

        if (lastLogs && lastLogs.length > 0) {
          const lastLog = lastLogs[0];
          const currentCalories = lastLog.calories;
          const subtractKcal = Math.abs(calories);

          if (currentCalories <= subtractKcal) {
            // Delete log if it drops below 0
            await supabase.from("food_logs").delete().eq("id", lastLog.id);
            setCaloriesCount(prev => Math.max(0, prev - currentCalories));
          } else {
            // Decrement
            const newCalories = currentCalories - subtractKcal;
            await supabase.from("food_logs").update({ calories: newCalories }).eq("id", lastLog.id);
            setCaloriesCount(prev => Math.max(0, prev - subtractKcal));
          }
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        console.error("Failed to subtract calories:", err);
      }
    }
  };

  return (
    <>
      {/* Mobile Floating Toggle Pill */}
      <div className="fixed bottom-24 right-6 z-30 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6068F0] to-[#A78BFA] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 pointer-events-auto"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5 animate-pulse" />}
        </button>
      </div>

      {/* Widgets Container (Collapsible Slide-up on Mobile, Sidebar float on Desktop) */}
      <div className={`
        fixed z-20 transition-all duration-500 ease-out
        ${isOpen 
          ? "bottom-24 left-6 right-6 opacity-100 translate-y-0" 
          : "bottom-[-600px] left-6 right-6 opacity-0 translate-y-12 md:opacity-100 md:translate-y-0"
        }
        md:sticky md:top-24 md:bottom-auto md:left-auto md:right-auto md:w-80 md:block space-y-6 shrink-0 pointer-events-auto
      `}>

        {/* WIDGET: Biometrics Intake */}
        <div className={glassCardClass}>
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="h-3 w-3" /> Biometrics Intake
            </span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
              Today's sum
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Water Tracker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                  <Droplet className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{waterCount.toFixed(2)}L</span>
                  <p className="text-[9px] text-slate-400 dark:text-neutral-500">Water intake</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleLogWater(-0.25)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-white"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleLogWater(0.25)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[#6068F0] dark:text-[#A78BFA]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Calories Tracker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{caloriesCount} kcal</span>
                  <p className="text-[9px] text-slate-400 dark:text-neutral-500">Nutrition calories</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleLogCalories(-100)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-white"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleLogCalories(100)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[#6068F0] dark:text-[#A78BFA]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
