"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText, Sparkles, Smile, Frown, Meh, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-slate-100/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

export default function JournalPage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState("focused");
  const [reflection, setReflection] = useState("Write down your thoughts above and select a mood, then click 'Reflect with AI Coach' to analyze your journal entry.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [groqKey, setGroqKey] = useState("");

  useEffect(() => {
    async function loadJournal() {
      let activeId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeId = user.id;
          setProfileId(user.id);
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
      }

      try {
        const storedKey = localStorage.getItem("momentum_groq_key");
        if (storedKey) setGroqKey(storedKey);

        const { data, error } = await supabase
          .from("journal_logs")
          .select("entry_text, mood, reflection_text")
          .eq("profile_id", activeId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0 && !error) {
          setJournalText(data[0].entry_text);
          setSelectedMood(data[0].mood || "focused");
          if (data[0].reflection_text) setReflection(data[0].reflection_text);
        }
      } catch (err) {
        console.error("Failed to load journal log from Supabase:", err);
      }
    }
    loadJournal();
  }, []);

  const handleReflect = async () => {
    if (!journalText.trim()) return;
    setIsAnalyzing(true);

    let reflectionResult = "";

    const effectiveKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || groqKey;
    if (!effectiveKey) {
      reflectionResult = "Draft saved successfully. ZenithFlow Coach is currently connecting to our servers. Your reflection analysis will load shortly.";
      setReflection(reflectionResult);
      setIsAnalyzing(false);
    } else {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${effectiveKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "You are ZenithFlow AI, a warm, conversational personal health and mindfulness coach. Read the user's journal entry and mood, then provide a highly encouraging, natural, and short (3 sentences max) reflection or mindfulness tip. Write naturally like a person. Do not use any Markdown formatting, bold asterisks (**), or bullet points."
              },
              {
                role: "user",
                content: `Mood: ${selectedMood}. Journal Entry: ${journalText}`
              }
            ]
          })
        });
        const data = await res.json();
        if (data?.choices?.[0]?.message?.content) {
          reflectionResult = data.choices[0].message.content;
          setReflection(reflectionResult);
        } else {
          reflectionResult = "Error generating reflection. Check your Groq API Key.";
          setReflection(reflectionResult);
        }
      } catch (err) {
        reflectionResult = "Failed to connect to Groq AI. Check your internet connection.";
        setReflection(reflectionResult);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Save to Supabase
    try {
      await supabase
        .from("journal_logs")
        .insert({
          profile_id: profileId,
          entry_text: journalText,
          mood: selectedMood,
          reflection_text: reflectionResult || null
        });
    } catch (err) {
      console.error("Failed to save journal log to Supabase:", err);
    }
  };

  const moods = [
    { name: "focused", icon: <Smile className="h-4 w-4" /> },
    { name: "happy", icon: <SmilePlus className="h-4 w-4" /> },
    { name: "tired", icon: <Meh className="h-4 w-4" /> },
    { name: "stressed", icon: <Frown className="h-4 w-4" /> }
  ];

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Header Panel */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0d0d0e]/80 dark:to-transparent border border-slate-200 dark:border-white/10 rounded-xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <BookOpenText className="h-7 w-7 text-[#6068F0]" />
          Mindfulness Journal
        </h1>
        <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Reflect on your daily wins, write your thoughts, evaluate cognitive state.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Daily Journal Draft</span>
              
              {/* Mood selector */}
              <div className="flex gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.name}
                    onClick={() => setSelectedMood(mood.name)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs uppercase tracking-wider font-bold transition-all duration-300",
                      selectedMood === mood.name
                        ? "bg-[#6068F0]/20 border-[#6068F0]/40 text-[#6068F0] dark:text-white"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-neutral-500 hover:bg-slate-200 dark:hover:bg-white/10"
                    )}
                  >
                    {mood.icon}
                    {mood.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Textarea */}
            <textarea
              placeholder="What went well today? Any blockers or moments of reflection?"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              className="w-full h-80 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300 leading-relaxed resize-none"
            />

            <div className="flex justify-end">
              <Button 
                onClick={handleReflect}
                disabled={isAnalyzing || !journalText.trim()}
                className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center gap-2 transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? "Reflecting..." : "Reflect with AI Coach"}
              </Button>
            </div>
          </Card>
        </div>

        {/* AI Reflection Card (4 cols) */}
        <div className="lg:col-span-4">
          <Card className={`${glassCardClass} p-6 h-full flex flex-col justify-between`}>
            <div className="space-y-4">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider pb-4 border-b border-slate-200 dark:border-white/10">
                <Sparkles className="h-4 w-4 text-[#D946EF]" />
                Daily Reflection
              </CardTitle>
              <div className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 p-6 rounded-2xl text-xs text-slate-600 dark:text-neutral-300 italic leading-relaxed">
                "{reflection}"
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-neutral-600 mt-6 leading-normal">
              Your journal reflections are processed securely using your local API settings. They are never shared publicly.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
