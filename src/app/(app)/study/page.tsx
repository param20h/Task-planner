"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RefreshCcw } from "lucide-react";

export default function StudyPage() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Study Focus</h1>
        <p className="text-zinc-400 mt-2">Pomodoro deep work sessions.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-50 w-full">
        <CardContent className="p-12 flex flex-col items-center justify-center space-y-8">
          <div className="text-7xl font-mono font-bold tracking-tighter text-neutral-300">
            {formatTime(seconds)}
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={toggleTimer} 
              size="lg"
              className={isActive ? "bg-neutral-700 hover:bg-neutral-600" : "bg-neutral-800 hover:bg-neutral-700"}
            >
              {isActive ? <Square className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetTimer} size="lg" variant="outline" className="border-zinc-700 text-zinc-300">
              <RefreshCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
