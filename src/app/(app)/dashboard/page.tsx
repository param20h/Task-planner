"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Dumbbell, BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Friend");
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem("momentum_name");
      if (storedName) setUserName(storedName);
    }
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-2rem)] p-6 md:p-10 space-y-8 max-w-5xl mx-auto overflow-hidden bg-black text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(255,255,255,0.05)" />
      
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-100">
          Good Morning, <br/> {userName === "Friend" ? "New User" : userName}
        </h1>
        {userName === "Friend" && (
          <p className="text-sm mt-2 text-neutral-400">
            <Link href="/profile" className="underline underline-offset-4">Sign up / Complete Profile</Link>
          </p>
        )}
        <p className="text-neutral-500 mt-4 max-w-lg">Let's make today productive. Here's your overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-neutral-300 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">0</div>
            <p className="text-xs text-neutral-500 mt-1">Let's get started!</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-neutral-300 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gym Volume</CardTitle>
            <Dumbbell className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">0 kg</div>
            <p className="text-xs text-neutral-500 mt-1">No workouts logged yet</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-neutral-300 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <BookOpen className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">0h 0m</div>
            <p className="text-xs text-neutral-500 mt-1">No focus sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-neutral-300 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mindfulness</CardTitle>
            <Sparkles className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">0m</div>
            <p className="text-xs text-neutral-500 mt-1">Take a deep breath</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 relative z-10">
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-neutral-300 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-100">
              <TrendingUp className="h-5 w-5 text-neutral-500" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-500 italic">No schedule planned. Ask your AI coach to plan your day!</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-neutral-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-neutral-100">AI Coach Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-400">
              "You've hit your gym volume goals 3 days in a row, but your sleep might be lagging. Consider taking a rest day today or doing a light 15m meditation session."
            </p>
            <Button className="mt-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700" asChild>
              <Link href="/profile">Configure AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
