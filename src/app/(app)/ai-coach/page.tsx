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
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your ZenithFlow AI Coach. I can help you plan your workouts, balance your nutrition macros, design study sprints, or check on your goal timeline. What would you like to achieve today?" }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
          const { data, error } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

          if (data && !error && data.plan) {
            setPlan(data.plan as "free" | "pro");
            localStorage.setItem("momentum_plan", data.plan);
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

    const effectiveKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || groqKey;
    if (!effectiveKey) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Please configure your NEXT_PUBLIC_GROQ_API_KEY environment variable in your .env.local file to unlock full cognitive advice, meal planning, and detailed athletic calculations!" }
        ]);
        setIsSending(false);
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
              content: "You are ZenithFlow AI, a warm, conversational, and highly personal human-like health, focus, and productivity coach. Write your replies exactly like a real person sending a message to a friend. Speak naturally, conversationally, and with empathy. Crucially: DO NOT use any Markdown formatting characters such as double asterisks (**) or bullet points (* or -) in your responses. Keep paragraphs brief and natural."
            },
            ...updatedMessages
          ]
        })
      });
      
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.choices[0].message.content }
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
    }
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
          Full-Stack AI Coach
        </h1>
        <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Converse with Llama-3.3-70B model to dynamically schedule sessions, workouts, and OKRs.</p>
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
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={cn(
                  "flex gap-4 max-w-[85%] items-start",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10",
                  msg.role === "user" ? "bg-slate-100 dark:bg-white/5" : "bg-[#6068F0]/10 border-[#6068F0]/20"
                )}>
                  {msg.role === "user" ? <User className="h-4 w-4 text-slate-500 dark:text-neutral-300" /> : <Bot className="h-4 w-4 text-[#6068F0]" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-xs leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-neutral-200" 
                    : "bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/10 text-slate-600 dark:text-neutral-300"
                )}>
                  {msg.content.split("\n").map((para, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""}>{para}</p>
                  ))}
                </div>
              </motion.div>
            ))}
            {isSending && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-center text-xs text-slate-400 dark:text-neutral-500"
              >
                <div className="p-2 rounded-xl bg-[#6068F0]/10 border border-[#6068F0]/20 animate-pulse">
                  <Brain className="h-4 w-4 text-[#6068F0]" />
                </div>
                <span className="flex items-center gap-1">AI Coach is thinking<span className="animate-bounce">.</span><span className="animate-bounce delay-150">.</span><span className="animate-bounce delay-300">.</span></span>
              </motion.div>
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="mt-6 flex gap-3 relative z-20 border-t border-slate-200 dark:border-white/10 pt-4">
            <input 
              type="text" 
              placeholder="Type your coaching question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
            />
            <Button 
              type="submit" 
              disabled={isSending || !input.trim()}
              className="bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center gap-2 px-5 transition-all duration-300"
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
          className={cn(glassCardClass, "flex flex-col items-center justify-center text-center p-12 py-16 relative z-10 space-y-6 min-h-[50vh]")}
        >
          {/* Glowing lock badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6068F0]/20 to-[#A78BFA]/20 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.15)] relative">
            <Lock className="h-7 w-7" />
            <Sparkles className="h-4.5 w-4.5 absolute -top-1 -right-1 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">AI Cognitive Coach is a Pro Feature</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
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
    </div>
  );
}
