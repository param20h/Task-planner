"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Send, User, Bot, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-slate-100/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";
const pageShellClass = "relative min-h-screen p-4 md:p-8 space-y-8 max-w-[1000px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300";
const outerPanelClass = "rounded-[32px]";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am Zenith AI, your personal coach. I can help you plan your workouts, balance your nutrition macros, design study sprints, or check on your goal timeline. What would you like to achieve today?" }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [profileId, setProfileId] = useState("alex_chen");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem("momentum_groq_key");
      if (storedKey) setGroqKey(storedKey);
      
      const savedPlan = localStorage.getItem("momentum_plan") as "free" | "pro";
      if (savedPlan) setPlan(savedPlan);
    }

    async function loadPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfileId(user.id);
          const { data, error } = await supabase
            .from("profiles")
            .select("plan, groq_api_key")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            if (data.plan) {
              setPlan(data.plan as "free" | "pro");
              localStorage.setItem("momentum_plan", data.plan);
            }
            if (data.groq_api_key) {
              setGroqKey(data.groq_api_key);
              localStorage.setItem("momentum_groq_key", data.groq_api_key);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user plan:", err);
      }
    }
    loadPlan();
  }, []);

  useEffect(() => {
    if (messages.length > 1 && chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input;
    setInput("");
    const updatedMessages = [...messages, { role: "user", content: userMessage } as Message];
    setMessages(updatedMessages);
    setIsSending(true);

    // Focus input immediately so they can type
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const effectiveKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || groqKey;
    if (!effectiveKey) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "I'm having trouble connecting to the Zenith AI engine right now. Please try again in a few moments or contact support if this continues." }
        ]);
        setIsSending(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }, 1000);
      return;
    }

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
              content: "You are Zenith AI, a warm, conversational, and highly personal human-like health, focus, and productivity companion. Write your replies exactly like a real person sending a message to a friend. Speak naturally, conversationally, and with empathy. Keep paragraphs brief and natural. Feel free to use Markdown bold (e.g. **Workout Routine**) and bullet points (e.g. - Squat: 3 sets of 10) to format lists, routines, and study blocks clearly and readably. If the user asks you to create, schedule, or log a workout, goal/objective, or study log: 1. Talk naturally about what you are creating. 2. Append a special, single-line action tag at the absolute end of your response in one of these formats: - For Workout: [ACTION:CREATE_WORKOUT:{\"name\":\"Workout Name\",\"exercises\":[{\"exercise_name\":\"Squat\",\"sets\":[{\"weight\":60,\"reps\":10}]}]}] - For Study Session: [ACTION:CREATE_STUDY_LOG:{\"subject\":\"Math\",\"duration\":45,\"notes\":\"Focus study sprint\"}] - For Goal/Objective: [ACTION:CREATE_GOAL:{\"title\":\"Learn Next.js\",\"category\":\"Skills\",\"progress\":10,\"value_label\":\"10% completed\",\"status\":\"In Progress\"}] Do not explain the action tag to the user; just output it at the very end of your response."
            },
            ...updatedMessages
          ]
        })
      });
      
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        let content = data.choices[0].message.content;

        const actionMatch = content.match(/\[ACTION:(CREATE_WORKOUT|CREATE_STUDY_LOG|CREATE_GOAL):([\s\S]+)\]\s*$/);
        if (actionMatch) {
          const actionType = actionMatch[1];
          const actionPayloadStr = actionMatch[2];
          content = content.replace(actionMatch[0], "").trim();

          try {
            const payload = JSON.parse(actionPayloadStr);
            if (actionType === "CREATE_WORKOUT") {
              const start = new Date();
              const end = new Date(start.getTime() + 60 * 60000);

              const { data: newW, error: wErr } = await supabase
                .from("gym_workouts")
                .insert({
                  profile_id: profileId,
                  name: payload.name || "AI Generated Workout",
                  start_time: start.toISOString(),
                  end_time: end.toISOString(),
                  notes: "Created dynamically by Zenith AI"
                })
                .select()
                .single();

              if (!wErr && newW) {
                if (Array.isArray(payload.exercises)) {
                  for (const ex of payload.exercises) {
                    await supabase
                      .from("gym_exercises")
                      .insert({
                        workout_id: newW.id,
                        exercise_name: ex.exercise_name,
                        sets: ex.sets || []
                      });
                  }
                }
                showToast("🎉 Workout plan integrated into your schedule!");
              }
            } else if (actionType === "CREATE_STUDY_LOG") {
              await supabase
                .from("study_logs")
                .insert({
                  profile_id: profileId,
                  subject: payload.subject || "Study",
                  duration_minutes: parseInt(payload.duration) || 30,
                  notes: payload.notes || "Logged dynamically by Zenith AI"
                });
              showToast("📚 Study session logged successfully!");
            } else if (actionType === "CREATE_GOAL") {
              const { data: newGoal } = await supabase
                .from("goals")
                .insert({
                  profile_id: profileId,
                  title: payload.title,
                  category: payload.category || "General",
                  progress: payload.progress || 0,
                  value_label: payload.value_label || "0% completed",
                  status: payload.status || "In Progress"
                })
                .select()
                .single();

              if (newGoal) {
                await supabase
                  .from("milestones")
                  .insert({
                    goal_id: newGoal.id,
                    description: `Focus milestones for "${newGoal.title}"`,
                    due_date: "In 30d"
                  });
              }
              showToast("🎯 OKR Goal integrated into your board!");
            }
          } catch (err) {
            console.error("Action parse failed:", err);
          }
        }

        setMessages(prev => [
          ...prev,
          { role: "assistant", content }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Failed to parse reply. Make sure your Groq API Key is active and correct." }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Connection timed out. Check your network or API status." }
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      
      const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ");
      if (isBullet) {
        trimmed = trimmed.replace(/^[-*•]\s+/, "");
      }
      
      const parts = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      
      while ((match = boldRegex.exec(trimmed)) !== null) {
        if (match.index > lastIdx) {
          parts.push(trimmed.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-[#6068F0] dark:text-[#A78BFA]">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      
      if (lastIdx < trimmed.length) {
        parts.push(trimmed.substring(lastIdx));
      }

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 pl-3 py-0.5 text-xs">
            <span className="text-[#6068F0] dark:text-[#A78BFA] font-black">•</span>
            <span className="flex-1">{parts.length > 0 ? parts : trimmed}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="min-h-[1em] text-xs">
          {parts.length > 0 ? parts : trimmed}
        </p>
      );
    });
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1000px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 p-6 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0d0d0e]/80 dark:to-transparent border border-slate-200 dark:border-white/10 rounded-xl"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Brain className="h-7 w-7 text-[#6068F0]" />
          Zenith AI Companion
        </h1>
        <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Converse with Zenith AI to dynamically schedule sessions, workouts, and OKRs.</p>
      </motion.div>

      {/* Main Chat Box or Paywall */}
      {plan === "pro" ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className={cn(glassCardClass, "flex flex-col h-[65vh] relative z-10 p-6")}
        >
          {/* Chat History */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "chat",
                  msg.role === "user" ? "chat-end" : "chat-start"
                )}
              >
                {/* Chat Avatar */}
                <div className="chat-image avatar">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border shadow-sm",
                    msg.role === "user" 
                      ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-300" 
                      : "bg-[#6068F0]/10 border-[#6068F0]/25 text-[#6068F0]"
                  )}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                </div>

                {/* Chat Header */}
                <div className="chat-header flex items-center gap-1.5 pb-0.5">
                  <span className="font-semibold text-slate-755 dark:text-neutral-200">
                    {msg.role === "user" ? "You" : "Zenith AI"}
                  </span>
                  <span className="text-[9px] opacity-40">just now</span>
                </div>

                {/* Chat Bubble */}
                <div className={cn(
                  "chat-bubble text-xs leading-relaxed shadow-sm px-4.5 py-3.5 border",
                  msg.role === "user" 
                    ? "rounded-[22px] rounded-tr-none bg-[#6068F0] text-white border-0" 
                    : "rounded-[22px] rounded-tl-none bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200"
                )}>
                  <div className="flex flex-col gap-1.5">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              </motion.div>
            ))}
            {isSending && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="chat chat-start"
              >
                <div className="chat-image avatar">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#6068F0]/25 bg-[#6068F0]/10 text-[#6068F0] animate-pulse">
                    <Brain className="h-4 w-4 text-[#6068F0]" />
                  </div>
                </div>
                <div className="chat-header flex items-center gap-1.5 pb-0.5">
                  <span className="font-semibold text-slate-755 dark:text-neutral-200">Zenith AI</span>
                  <span className="text-[9px] opacity-45">thinking</span>
                </div>
                <div className="chat-bubble text-xs leading-relaxed shadow-sm px-4.5 py-3.5 border rounded-[22px] rounded-tl-none bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200 opacity-70">
                  <span className="flex items-center gap-1 font-semibold">Zenith AI is thinking<span className="animate-bounce">.</span><span className="animate-bounce delay-150">.</span><span className="animate-bounce delay-300">.</span></span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="mt-6 flex gap-3 relative z-20 border-t border-slate-200 dark:border-white/10 pt-4">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-full px-6 py-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
            />
            <Button 
              type="submit" 
              disabled={isSending || !input.trim()}
              className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-full shadow-lg shadow-[#6068F0]/20 flex items-center gap-2 px-6 transition-all duration-300"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className={cn(glassCardClass, outerPanelClass, "flex flex-col items-center justify-center text-center p-8 md:p-12 py-14 md:py-16 relative z-10 space-y-6 min-h-[50vh]")}
        >
          {/* Glowing lock badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6068F0]/20 to-[#A78BFA]/20 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.15)] relative">
            <Lock className="h-7 w-7" />
            <Sparkles className="h-4.5 w-4.5 absolute -top-1 -right-1 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">Zenith AI is a Pro Feature</h2>
            <p className="text-xs text-slate-505 dark:text-neutral-400 leading-relaxed">
              Upgrade to the Pro Plan to unlock personalized health summaries, study sprints planners, and macro nutrition feedback.
            </p>
          </div>

          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-[#A78BFA] via-[#F9A8D4] to-[#FDBA74] text-black hover:opacity-95 font-bold px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_8px_25px_-5px_rgba(167,139,250,0.3)] h-auto">
              Upgrade to Pro Plan
            </Button>
          </Link>
        </motion.div>
      )}
      {/* Dynamic Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xl backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400"
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
