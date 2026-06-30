"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = { id: number; title: string; completed: boolean };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), title: newTask, completed: false }, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-zinc-400 mt-2">Plan your day and get things done.</p>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <Input 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="bg-zinc-900/50 border-zinc-800 text-zinc-50 flex-1"
        />
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white px-8">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {tasks.map(task => (
          <Card 
            key={task.id} 
            className={cn(
              "bg-zinc-900/50 border-zinc-800 text-zinc-50 transition-all cursor-pointer hover:bg-zinc-800/50",
              task.completed && "opacity-60"
            )}
            onClick={() => toggleTask(task.id)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-neutral-300" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                task.completed && "line-through text-zinc-500"
              )}>
                {task.title}
              </span>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-zinc-500 py-8">All caught up! 🎉</p>
        )}
      </div>
    </div>
  );
}
