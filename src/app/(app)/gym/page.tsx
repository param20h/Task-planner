"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Plus, Play, Square, History, Sparkles } from "lucide-react";

type Set = { id: number; reps: string; weight: string; completed: boolean };
type Exercise = { id: number; name: string; sets: Set[] };

export default function GymPage() {
  const [isActive, setIsActive] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const startWorkout = () => setIsActive(true);
  const finishWorkout = () => {
    setIsActive(false);
    setExercises([]);
    // Here we'd save to DB
  };

  const addExercise = () => {
    const newEx: Exercise = {
      id: Date.now(),
      name: "New Exercise",
      sets: [{ id: Date.now(), reps: "", weight: "", completed: false }],
    };
    setExercises([...exercises, newEx]);
  };

  const addSet = (exId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return { ...ex, sets: [...ex.sets, { id: Date.now(), reps: "", weight: "", completed: false }] };
      }
      return ex;
    }));
  };

  const updateSet = (exId: number, setId: number, field: 'reps'|'weight', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const toggleSet = (exId: number, setId: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
        };
      }
      return ex;
    }));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gym Tracker</h1>
          <p className="text-zinc-400 mt-2">Log your workouts, Hevy style.</p>
        </div>
        {!isActive ? (
          <Button onClick={startWorkout} className="bg-neutral-800 hover:bg-neutral-700 text-white gap-2">
            <Play className="h-4 w-4" /> Start Workout
          </Button>
        ) : (
          <Button onClick={finishWorkout} variant="destructive" className="gap-2">
            <Square className="h-4 w-4" /> Finish
          </Button>
        )}
      </div>

      {!isActive ? (
        <Card className="bg-neutral-900/50 border-neutral-800 text-neutral-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <History className="h-12 w-12 mb-4 opacity-20" />
            <p>No active workout.</p>
            <p className="text-sm mb-6">Click "Start Workout" to begin logging manually.</p>
            <Button 
              variant="outline" 
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              onClick={() => {
                // Placeholder for AI Generation
                setExercises([
                  { id: Date.now(), name: "AI Recommended: Bench Press", sets: [{ id: Date.now(), reps: "10", weight: "60", completed: false }] }
                ]);
                setIsActive(true);
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Workout Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {exercises.map((ex, i) => (
            <Card key={ex.id} className="bg-zinc-900/50 border-zinc-800 text-zinc-50">
              <CardHeader className="pb-3">
                <CardTitle>
                  <Input 
                    value={ex.name} 
                    onChange={(e) => setExercises(exercises.map(e2 => e2.id === ex.id ? { ...e2, name: e.target.value } : e2))}
                    className="bg-transparent border-none text-xl font-bold px-0 focus-visible:ring-0 h-auto"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2">
                  <div className="text-center">Set</div>
                  <div className="text-center">kg</div>
                  <div className="text-center">Reps</div>
                  <div className="text-center">✓</div>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div key={set.id} className={`grid grid-cols-[30px_1fr_1fr_40px] gap-4 items-center px-2 py-1 rounded-md transition-colors ${set.completed ? 'bg-neutral-900/50' : ''}`}>
                    <div className="text-center text-sm font-medium text-zinc-400">{setIdx + 1}</div>
                    <Input 
                      value={set.weight}
                      onChange={(e) => updateSet(ex.id, set.id, 'weight', e.target.value)}
                      placeholder="-"
                      className="bg-zinc-950 border-zinc-800 text-center h-8"
                    />
                    <Input 
                      value={set.reps}
                      onChange={(e) => updateSet(ex.id, set.id, 'reps', e.target.value)}
                      placeholder="-"
                      className="bg-zinc-950 border-zinc-800 text-center h-8"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => toggleSet(ex.id, set.id)}
                      className={`h-8 w-8 rounded-md ${set.completed ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-200' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      ✓
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" onClick={() => addSet(ex.id)} className="w-full text-zinc-400 hover:text-zinc-300 mt-2 border border-dashed border-zinc-800">
                  + Add Set
                </Button>
              </CardContent>
            </Card>
          ))}
          
          <Button onClick={addExercise} className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 gap-2">
            <Plus className="h-4 w-4" /> Add Exercise
          </Button>
        </div>
      )}
    </div>
  );
}
