"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  Apple, 
  Flame, 
  Coffee, 
  Utensils, 
  Salad, 
  Cookie, 
  Droplet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";
const glassIconWrapperClass = "p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center";

export default function FoodPage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fats: 0 });
  const [waterIntake, setWaterIntake] = useState(0); // Liters
  
  // Custom Food Form states
  const [customName, setCustomName] = useState("");
  const [customMeal, setCustomMeal] = useState("Breakfast");
  const [customCal, setCustomCal] = useState("");
  const [customProt, setCustomProt] = useState("");
  const [customCarb, setCustomCarb] = useState("");
  const [customFat, setCustomFat] = useState("");

  // Dynamic week days generation
  const getWeekDays = () => {
    const daysList = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      daysList.push({
        name: d.toDateString() === today.toDateString() ? "TODAY" : dayNames[i],
        date: String(d.getDate()),
        fullDate: d
      });
    }
    return daysList;
  };

  const days = getWeekDays();
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  
  const [foodItems, setFoodItems] = useState<{ id: any; name: string; meal: string; calories: number; protein: number; carbs: number; fats: number }[]>([]);

  // Load user session
  useEffect(() => {
    async function getSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfileId(user.id);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      }
    }
    getSession();
  }, []);

  // Reload data whenever selected day or profileId updates
  useEffect(() => {
    async function loadNutrition() {
      const selectedDay = days[selectedDayIndex].fullDate;
      const startOfDay = new Date(selectedDay);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDay);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        // Fetch food logs for selected day
        const { data: foodData, error: foodError } = await supabase
          .from("food_logs")
          .select("id, food_name, meal_type, calories, protein, carbs, fats")
          .eq("profile_id", profileId)
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());

        if (foodData && !foodError && foodData.length > 0) {
          setFoodItems(foodData.map(f => ({
            id: f.id,
            name: f.food_name || "",
            meal: f.meal_type || "",
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fats: f.fats
          })));

          const totalCal = foodData.reduce((sum, item) => sum + item.calories, 0);
          const totalProt = foodData.reduce((sum, item) => sum + item.protein, 0);
          const totalCarbs = foodData.reduce((sum, item) => sum + item.carbs, 0);
          const totalFats = foodData.reduce((sum, item) => sum + item.fats, 0);

          setCaloriesConsumed(totalCal);
          setMacros({ protein: totalProt, carbs: totalCarbs, fats: totalFats });
        } else {
          setFoodItems([]);
          setCaloriesConsumed(0);
          setMacros({ protein: 0, carbs: 0, fats: 0 });
        }

        // Fetch water logs for selected day
        const { data: waterData, error: waterError } = await supabase
          .from("water_logs")
          .select("amount_liters")
          .eq("profile_id", profileId)
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());

        if (waterData && !waterError && waterData.length > 0) {
          const totalWater = waterData.reduce((sum, item) => sum + Number(item.amount_liters), 0);
          setWaterIntake(Number(totalWater.toFixed(2)));
        } else {
          setWaterIntake(0.0);
        }
      } catch (err) {
        console.error("Failed to load nutrition data from Supabase:", err);
      }
    }
    loadNutrition();
  }, [selectedDayIndex, profileId]);

  const handleAddWater = async () => {
    const increment = 0.25;
    const nextWater = Number((waterIntake + increment).toFixed(2));
    if (nextWater > 10.0) return;

    setWaterIntake(nextWater);

    const selectedDay = days[selectedDayIndex].fullDate;
    const logTime = new Date(selectedDay);
    if (selectedDay.toDateString() !== new Date().toDateString()) {
      logTime.setHours(12, 0, 0, 0);
    } else {
      logTime.setTime(new Date().getTime());
    }

    try {
      await supabase
        .from("water_logs")
        .insert({
          profile_id: profileId,
          amount_liters: increment,
          created_at: logTime.toISOString()
        });
    } catch (err) {
      console.error("Failed to insert water log in Supabase:", err);
    }
  };

  const handleAddFoodItem = async (meal: string, name: string, cal: number, prot: number, carb: number, fat: number) => {
    const selectedDay = days[selectedDayIndex].fullDate;
    const logTime = new Date(selectedDay);
    if (selectedDay.toDateString() !== new Date().toDateString()) {
      logTime.setHours(12, 0, 0, 0);
    } else {
      logTime.setTime(new Date().getTime());
    }

    try {
      const { data, error } = await supabase
        .from("food_logs")
        .insert({
          profile_id: profileId,
          meal_type: meal.toLowerCase(),
          food_name: name,
          calories: cal,
          protein: prot,
          carbs: carb,
          fats: fat,
          created_at: logTime.toISOString()
        })
        .select()
        .single();

      if (data && !error) {
        setFoodItems(prev => [...prev, {
          id: data.id,
          name: data.food_name || "",
          meal: data.meal_type || "",
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats
        }]);

        setCaloriesConsumed(prev => prev + cal);
        setMacros(prev => ({
          protein: prev.protein + prot,
          carbs: prev.carbs + carb,
          fats: prev.fats + fat
        }));
      }
    } catch (err) {
      console.error("Failed to add food to Supabase:", err);
    }
  };

  const handleLogCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const cal = parseInt(customCal) || 0;
    const prot = parseInt(customProt) || 0;
    const carb = parseInt(customCarb) || 0;
    const fat = parseInt(customFat) || 0;

    await handleAddFoodItem(customMeal, customName, cal, prot, carb, fat);

    setCustomName("");
    setCustomCal("");
    setCustomProt("");
    setCustomCarb("");
    setCustomFat("");
  };

  const handleDeleteFoodItem = async (id: any) => {
    const target = foodItems.find(f => f.id === id);
    if (!target) return;

    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", id);

      if (!error) {
        setFoodItems(prev => prev.filter(f => f.id !== id));
        setCaloriesConsumed(prev => Math.max(0, prev - target.calories));
        setMacros(prev => ({
          protein: Math.max(0, prev.protein - target.protein),
          carbs: Math.max(0, prev.carbs - target.carbs),
          fats: Math.max(0, prev.fats - target.fats)
        }));
      }
    } catch (err) {
      console.error("Failed to delete food from Supabase:", err);
    }
  };

  const mealCards = [
    { type: "Breakfast", icon: <Coffee className="h-5 w-5 text-amber-500" />, defaultName: "Oatmeal & Whey Protein", c: 450, p: 35, carb: 50, f: 8 },
    { type: "Lunch", icon: <Utensils className="h-5 w-5 text-emerald-500" />, defaultName: "Chicken Breast & White Rice", c: 600, p: 50, carb: 70, f: 10 },
    { type: "Dinner", icon: <Salad className="h-5 w-5 text-indigo-500" />, defaultName: "Salmon & Sweet Potato", c: 550, p: 40, carb: 45, f: 18 },
    { type: "Snacks", icon: <Cookie className="h-5 w-5 text-purple-500" />, defaultName: "Greek Yogurt & Berries", c: 250, p: 20, carb: 25, f: 3 }
  ];

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Day Scroller */}
      <div className="flex gap-4 overflow-x-auto pb-4 relative z-10">
        {days.map((day, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={cn(
              "flex flex-col items-center justify-center px-6 py-3 rounded-xl border cursor-pointer min-w-[100px] transition-all duration-300",
              selectedDayIndex === idx 
                ? "bg-[#6068F0]/20 border-[#6068F0]/40 text-[#6068F0] dark:text-white shadow-lg shadow-[#6068F0]/5" 
                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10"
            )}
          >
            <span className="text-[10px] font-bold tracking-wider uppercase">{day.name}</span>
            <span className="text-sm font-bold mt-1">{day.date}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left column - Macros dashboard */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className={`${glassCardClass} p-6`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">Calories Consumed</span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">{caloriesConsumed} / 2,500 kcal</span>
                </div>
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#6068F0]/30 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-[#6068F0]" />
                </div>
              </div>
              <div className="space-y-4">
                {/* Protein */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-neutral-400">Protein</span>
                    <span className="text-slate-900 dark:text-white font-bold">{macros.protein}g / 180g</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (macros.protein / 180) * 100)}%` }} />
                  </div>
                </div>
                {/* Carbs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-neutral-400">Carbohydrates</span>
                    <span className="text-slate-900 dark:text-white font-bold">{macros.carbs}g / 250g</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (macros.carbs / 250) * 100)}%` }} />
                  </div>
                </div>
                {/* Fats */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-neutral-400">Fats</span>
                    <span className="text-slate-900 dark:text-white font-bold">{macros.fats}g / 80g</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (macros.fats / 80) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Water Tracker */}
            <Card className={`${glassCardClass} p-6 flex flex-col justify-between`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest block">Water Intake</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{waterIntake} L</span>
                </div>
                <Button 
                  onClick={handleAddWater}
                  className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 p-2.5 h-auto"
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
              </div>

              {/* Water Cylinder Fluid Indicator */}
              <div className="relative w-full h-32 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden mt-6 shadow-inner">
                <div 
                  className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#6068F0] to-[#8088ff] transition-all duration-700 ease-out"
                  style={{ height: `${Math.min(100, (waterIntake / 3.0) * 100)}%` }}
                >
                  <div className="absolute top-1 left-0 w-full h-1 bg-white/20 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-neutral-400">
                  Target: 3.0 Liters
                </div>
              </div>
            </Card>
          </div>

          {/* Meals list */}
          <div className="space-y-6">
            {mealCards.map((meal) => {
              const currentMealItems = foodItems.filter(f => f.meal === meal.type.toLowerCase());
              return (
                <Card key={meal.type} className={glassCardClass}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={glassIconWrapperClass}>
                          {meal.icon}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{meal.type}</h3>
                      </div>
                      <Button 
                        onClick={() => handleAddFoodItem(meal.type, meal.defaultName, meal.c, meal.p, meal.carb, meal.f)}
                        className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Log Meal
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {currentMealItems.length > 0 ? (
                        currentMealItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-300">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">
                                P: {item.protein}g | C: {item.carbs}g | F: {item.fats}g
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{item.calories} kcal</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteFoodItem(item.id)}
                                className="h-8 w-8 text-slate-400 dark:text-neutral-500 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-neutral-500 italic py-2">No items logged yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right column - Quick suggestions list & Custom Food Form */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Suggestions Card */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Quick Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {[
                { title: "Boiled Eggs (x3)", cal: 210, p: 18, c: 1, f: 15 },
                { title: "Whey Protein Shake", cal: 140, p: 25, c: 3, f: 2 },
                { title: "Mixed Nuts (30g)", cal: 170, p: 6, c: 5, f: 16 },
                { title: "Banana (Medium)", cal: 105, p: 1, c: 27, f: 0 }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h5>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 block">
                      P: {item.p}g | C: {item.c}g | F: {item.f}g
                    </span>
                  </div>
                  <Button 
                    onClick={() => handleAddFoodItem("Snacks", item.title, item.cal, item.p, item.c, item.f)}
                    className="p-1.5 h-auto bg-[#6068F0]/20 hover:bg-[#6068F0] border border-[#6068F0]/30 hover:border-transparent text-[#6068F0] hover:text-white rounded-lg transition-all duration-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Log Custom Food Card */}
          <Card className={`${glassCardClass} p-6`}>
            <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-200 dark:border-white/10 mb-4 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Apple className="h-4 w-4 text-[#6068F0]" />
                Log Custom Food
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2">
              <form onSubmit={handleLogCustomFood} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Food Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Avocado Toast" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Meal Type</label>
                    <select 
                      value={customMeal}
                      onChange={(e) => setCustomMeal(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                    >
                      {["Breakfast", "Lunch", "Dinner", "Snacks"].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Calories (kcal)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 350" 
                      value={customCal}
                      onChange={(e) => setCustomCal(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Protein (g)</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={customProt}
                      onChange={(e) => setCustomProt(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Carbs (g)</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={customCarb}
                      onChange={(e) => setCustomCarb(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Fats (g)</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center justify-center gap-2 mt-4 text-xs py-2 h-auto"
                >
                  <Plus className="h-4 w-4" />
                  Log Custom Food
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
