"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Send, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

// Styling constants
const glassCardClass = "bg-white/70 dark:bg-[#0d0d0e]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-[#A78BFA]/30 dark:hover:border-white/15";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your Momentum AI Coach. I can help you plan your workouts, balance your nutrition macros, design study sprints, or check on your goal timeline. What would you like to achieve today?" }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem("momentum_groq_key");
      if (storedKey) setGroqKey(storedKey);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input;
    setInput("");
    const updatedMessages = [...messages, { role: "user", content: userMessage } as Message];
    setMessages(updatedMessages);
    setIsSending(true);

    if (!groqKey) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Please complete your profile by adding your Groq API Key! This will unlock full cognitive advice, meal planning, and detailed athletic calculations." }
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
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are Momentum AI, a premium personal health, focus, and productivity coach. Provide extremely structured, insightful, and actionable advice to the user. Use clear bullet points where helpful."
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
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1000px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Header */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-[#0d0d0e]/80 to-transparent border border-white/10 rounded-xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Brain className="h-7 w-7 text-[#6068F0]" />
          Full-Stack AI Coach
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Converse with Llama-3.3-70B model to dynamically schedule sessions, workouts, and OKRs.</p>
      </div>

      {/* Main Chat Box */}
      <Card className={cn(glassCardClass, "flex flex-col h-[65vh] relative z-10 p-6")}>
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex gap-4 max-w-[85%] items-start animate-fade-in",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "p-2 rounded-xl flex items-center justify-center shrink-0 border border-white/10",
                msg.role === "user" ? "bg-white/5" : "bg-[#6068F0]/10 border-[#6068F0]/20"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4 text-neutral-300" /> : <Bot className="h-4 w-4 text-[#6068F0]" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-xs leading-relaxed",
                msg.role === "user" 
                  ? "bg-white/5 border border-white/5 text-neutral-200" 
                  : "bg-black/40 border border-white/10 text-neutral-300"
              )}>
                {msg.content.split("\n").map((para, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-2" : ""}>{para}</p>
                ))}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-4 items-center text-xs text-neutral-500">
              <div className="p-2 rounded-xl bg-[#6068F0]/10 border border-[#6068F0]/20 animate-pulse">
                <Brain className="h-4 w-4 text-[#6068F0]" />
              </div>
              <span className="flex items-center gap-1">AI Coach is thinking<span className="animate-bounce">.</span><span className="animate-bounce delay-150">.</span><span className="animate-bounce delay-300">.</span></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="mt-6 flex gap-3 relative z-20 border-t border-white/10 pt-4">
          <input 
            type="text" 
            placeholder="Type your coaching question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#6068F0]/50 transition-all duration-300"
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
      </Card>
    </div>
  );
}
