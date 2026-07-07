"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type TestResult = {
  name: string;
  status: "idle" | "running" | "success" | "error";
  message: string;
  errorObj?: any;
};

export default function TestDbPage() {
  const [results, setResults] = useState<TestResult[]>([
    { name: "Verify Supabase Client Init", status: "idle", message: "Not run yet" },
    { name: "Upsert 'alex_chen' Profile", status: "idle", message: "Not run yet" },
    { name: "Insert Test Water Log", status: "idle", message: "Not run yet" },
    { name: "Insert Test Food Log", status: "idle", message: "Not run yet" },
    { name: "Insert Test Workout", status: "idle", message: "Not run yet" },
    { name: "Insert Test Task", status: "idle", message: "Not run yet" },
    { name: "Insert Test Goal", status: "idle", message: "Not run yet" },
  ]);

  const updateResult = (index: number, status: TestResult["status"], message: string, errorObj?: any) => {
    setResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, message, errorObj };
      return updated;
    });
  };

  const runTests = async () => {
    // Reset statuses
    setResults(prev => prev.map(r => ({ ...r, status: "idle", message: "Running..." })));

    let hasProfile = false;

    // Test 1: Verify URL and Anon key
    updateResult(0, "running", "Checking client values...");
    try {
      const url = supabase.storage.from("").getPublicUrl("").data.publicUrl;
      if (url) {
        updateResult(0, "success", `Supabase client initialized with endpoint.`);
      } else {
        updateResult(0, "error", "Failed to retrieve public storage endpoint.");
      }
    } catch (err: any) {
      updateResult(0, "error", `Initialization check failed: ${err.message}`, err);
      return;
    }

    // Test 2: Upsert profile
    updateResult(1, "running", "Attempting profiles upsert...");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: "alex_chen",
          name: "Alex Chen Test"
        }, { onConflict: "id" })
        .select();

      if (error) {
        updateResult(1, "error", `Upsert failed: ${error.message} (Code: ${error.code})`, error);
      } else {
        hasProfile = true;
        updateResult(1, "success", `Upserted profile successfully. Returned: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      updateResult(1, "error", `Upsert exception: ${err.message}`, err);
    }

    // Test 3: Insert Water Log
    updateResult(2, "running", "Inserting water log...");
    try {
      const { data, error } = await supabase
        .from("water_logs")
        .insert({
          profile_id: "alex_chen",
          amount_liters: 0.25
        })
        .select();

      if (error) {
        updateResult(2, "error", `Insert failed: ${error.message} (Code: ${error.code})`, error);
      } else {
        updateResult(2, "success", `Water log saved. ID: ${data?.[0]?.id || "unknown"}`);
      }
    } catch (err: any) {
      updateResult(2, "error", `Water log exception: ${err.message}`, err);
    }

    // Test 4: Insert Food Log
    updateResult(3, "running", "Inserting food log...");
    try {
      const { data, error } = await supabase
        .from("food_logs")
        .insert({
          profile_id: "alex_chen",
          meal_type: "breakfast",
          food_name: "Test Apple",
          calories: 95,
          protein: 0,
          carbs: 25,
          fats: 0
        })
        .select();

      if (error) {
        updateResult(3, "error", `Insert failed: ${error.message} (Code: ${error.code})`, error);
      } else {
        updateResult(3, "success", `Food log saved. ID: ${data?.[0]?.id || "unknown"}`);
      }
    } catch (err: any) {
      updateResult(3, "error", `Food log exception: ${err.message}`, err);
    }

    // Test 5: Insert Workout
    updateResult(4, "running", "Inserting workout...");
    try {
      const { data, error } = await supabase
        .from("gym_workouts")
        .insert({
          profile_id: "alex_chen",
          name: "Test Session",
          notes: "Database connectivity test"
        })
        .select();

      if (error) {
        updateResult(4, "error", `Insert failed: ${error.message} (Code: ${error.code})`, error);
      } else {
        updateResult(4, "success", `Workout saved. ID: ${data?.[0]?.id || "unknown"}`);
      }
    } catch (err: any) {
      updateResult(4, "error", `Workout exception: ${err.message}`, err);
    }

    // Test 6: Insert Task
    updateResult(5, "running", "Inserting task...");
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          profile_id: "alex_chen",
          title: "Test Dashboard Task",
          status: "pending"
        })
        .select();

      if (error) {
        updateResult(5, "error", `Insert failed: ${error.message} (Code: ${error.code})`, error);
      } else {
        updateResult(5, "success", `Task saved. ID: ${data?.[0]?.id || "unknown"}`);
      }
    } catch (err: any) {
      updateResult(5, "error", `Task exception: ${err.message}`, err);
    }

    // Test 7: Insert Goal
    updateResult(6, "running", "Inserting goal...");
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          profile_id: "alex_chen",
          title: "Test Goal Setting",
          category: "Health",
          progress: 50,
          value_label: "50% Complete",
          status: "In Progress"
        })
        .select();

      if (error) {
        updateResult(6, "error", `Insert failed: ${error.message} (Code: ${error.code})`, error);
      } else {
        updateResult(6, "success", `Goal saved. ID: ${data?.[0]?.id || "unknown"}`);
      }
    } catch (err: any) {
      updateResult(6, "error", `Goal exception: ${err.message}`, err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <Card className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Supabase Connectivity Diagnostics</CardTitle>
            <p className="text-xs text-slate-400 mt-1">Runs direct client-side requests to verify database constraints and policies.</p>
          </div>
          <Button onClick={runTests} className="bg-[#6068F0] hover:bg-[#4d55d0] text-white flex items-center gap-2">
            <Play className="h-4 w-4" />
            Run Diagnostics
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {results.map((r, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/50"
              >
                <div className="mt-0.5">
                  {r.status === "idle" && <div className="h-5 w-5 rounded-full border border-dashed border-slate-600" />}
                  {r.status === "running" && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
                  {r.status === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />}
                  {r.status === "error" && <AlertCircle className="h-5 w-5 text-rose-500 fill-rose-500/10" />}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{r.name}</h4>
                  <p className={cn(
                    "text-xs leading-relaxed",
                    r.status === "success" ? "text-emerald-400 font-semibold" : 
                    r.status === "error" ? "text-rose-400 font-semibold" : "text-slate-400"
                  )}>
                    {r.message}
                  </p>
                  {r.errorObj && (
                    <pre className="text-[10px] bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-rose-400 overflow-x-auto mt-2 max-w-full font-mono">
                      {JSON.stringify(r.errorObj, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
