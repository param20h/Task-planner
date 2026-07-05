"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { 
  User, 
  Settings, 
  Key, 
  Bell, 
  SunMoon, 
  Brain, 
  Database,
  Shield,
  CreditCard,
  LogOut,
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

// Styling constants
const glassCardClass = "bg-[#0d0d0e]/[var(--glass-opacity,0.42)] backdrop-blur-[var(--glass-blur,20px)] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-white/15";

const PROFILE_ID = "alex_chen";

export default function ProfilePage() {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alexchen@gmail.com");
  const [phone, setPhone] = useState("(317) 251-7990");
  const [groqKey, setGroqKey] = useState("");
  
  // States for toggles
  const [emailDigests, setEmailDigests] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);
  
  // Sliders
  const [appearance, setAppearance] = useState(80);
  const [aiDepth, setAiDepth] = useState(90);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      // Load appearance from local storage
      const savedAppearance = localStorage.getItem("momentum_appearance");
      if (savedAppearance) {
        const val = Number(savedAppearance);
        setAppearance(val);
        document.documentElement.style.setProperty('--glass-opacity', String((val / 100) * 0.4 + 0.1));
        document.documentElement.style.setProperty('--glass-blur', `${(val / 100) * 20 + 8}px`);
      } else {
        document.documentElement.style.setProperty('--glass-opacity', '0.42');
        document.documentElement.style.setProperty('--glass-blur', '20px');
      }

      // First try loading from Supabase
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, groq_api_key")
          .eq("id", PROFILE_ID)
          .single();

        if (data && !error) {
          if (data.name) setName(data.name);
          if (data.groq_api_key) setGroqKey(data.groq_api_key);
        } else {
          // Fallback to local storage
          const savedKey = localStorage.getItem("momentum_groq_key");
          const savedName = localStorage.getItem("momentum_name");
          if (savedKey) setGroqKey(savedKey);
          if (savedName) setName(savedName);
        }
      } catch (err) {
        console.error("Failed to load profile from Supabase", err);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    localStorage.setItem("momentum_groq_key", groqKey);
    localStorage.setItem("momentum_name", name);
    localStorage.setItem("momentum_appearance", String(appearance));

    // Save to Supabase profiles table
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: PROFILE_ID,
          name: name,
          groq_api_key: groqKey
        });

      if (error) {
        console.error("Supabase upsert error:", error.message);
      }
    } catch (err) {
      console.error("Failed to sync profile with Supabase:", err);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* 3-Column Profile Grid mimicking Screen 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Account Profile & Personal info (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Main profile avatar header */}
          <Card className={`${glassCardClass} p-8 flex flex-col items-center justify-center text-center`}>
            {/* Specular circle glass avatar */}
            <div className="relative w-32 h-32 rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center shadow-2xl mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-black/60 border border-white/5 shadow-inner">
                <Image src="/AGENTS.png" alt="Profile Logo" fill className="object-contain p-2" />
              </div>
              <div className="absolute bottom-1 right-1 bg-[#6068F0] border border-white/20 rounded-full p-1 shadow-lg">
                <Settings className="h-4 w-4 text-white animate-spin-slow" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-extrabold text-white">{name}</h2>
                <span className="text-[10px] font-bold bg-[#6068F0]/20 border border-[#6068F0]/30 text-[#6068F0] px-2 py-0.5 rounded-full uppercase">Pro</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">Productivity Enthusiast. Focused on deep work.</p>
            </div>
          </Card>

          {/* Forms & personal details */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <User className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Personal Info</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email</Label>
                <Input 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/60 border-white/10 text-white focus:border-[#6068F0]/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Full Name</Label>
                <Input 
                  id="fullname" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/60 border-white/10 text-white focus:border-[#6068F0]/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Phone</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/60 border-white/10 text-white focus:border-[#6068F0]/50 transition-all duration-300"
                />
              </div>
            </div>
          </Card>

          {/* Security & Subscription Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className={`${glassCardClass} p-5 flex flex-col justify-between space-y-4`}>
              <div className="border-b border-white/10 pb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-neutral-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Security</span>
              </div>
              <div className="space-y-2 text-xs">
                <button className="w-full text-left py-1 text-neutral-400 hover:text-white transition-colors duration-300">Password Reset →</button>
                <button className="w-full text-left py-1 text-neutral-400 hover:text-white transition-colors duration-300">Two-Factor Auth →</button>
              </div>
            </Card>

            <Card className={`${glassCardClass} p-5 flex flex-col justify-between space-y-4`}>
              <div className="border-b border-white/10 pb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-neutral-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Subscription</span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Pro Plan</h5>
                <p className="text-[9px] text-neutral-500 mt-0.5">Next Billing: Nov 1, 2023</p>
              </div>
              <Button size="sm" className="bg-[#6068F0] hover:bg-[#4d55d0] text-white w-full rounded-xl transition-all duration-300 shadow-md shadow-[#6068F0]/10">
                Manage
              </Button>
            </Card>
          </div>
        </div>

        {/* Middle Column: Preferences & AI Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Notification toggles */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <Bell className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
            </div>
            
            <div className="space-y-4 text-xs font-semibold text-neutral-300">
              <div className="flex items-center justify-between">
                <span>Email Digests</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailDigests} 
                    onChange={() => setEmailDigests(!emailDigests)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6068F0] peer-checked:border-[#6068F0]" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pushNotifications} 
                    onChange={() => setPushNotifications(!pushNotifications)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6068F0] peer-checked:border-[#6068F0]" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span>Daily Briefing</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dailyBriefing} 
                    onChange={() => setDailyBriefing(!dailyBriefing)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6068F0] peer-checked:border-[#6068F0]" />
                </label>
              </div>
            </div>
          </Card>

          {/* Appearance slider */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <SunMoon className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Appearance Sensitivity</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                <span>Transparency Sensitivity</span>
                <span className="text-[#6068F0] font-bold">
                  {appearance < 30 ? "Solid Panels" : appearance < 75 ? "Translucent Glass" : "Frosted / Specular"}
                </span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={appearance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAppearance(val);
                  document.documentElement.style.setProperty('--glass-opacity', String((val / 100) * 0.4 + 0.1));
                  document.documentElement.style.setProperty('--glass-blur', `${(val / 100) * 20 + 8}px`);
                }}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6068F0]" 
              />
            </div>
          </Card>

          {/* AI Coach Preference */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <Brain className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Coach Settings</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Depth Level</span>
                <span className="text-white font-bold">{aiDepth > 70 ? "Deep" : "Light"}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={aiDepth}
                onChange={(e) => setAiDepth(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6068F0]" 
              />
              <p className="text-[10px] text-neutral-500 leading-normal">AI provides in-depth cognitive analysis and personalized athletic strategies.</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Storage details & API Keys (3 cols) */}
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between min-h-[calc(100vh-14rem)]">
          
          {/* Storage usage layout */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <Database className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Storage Usage</span>
            </div>
            
            <div className="space-y-5">
              {/* Documents */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Documents (45%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6068F0] rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Media (30%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6068F0]/70 rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Projects (25%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D946EF]/80 rounded-full" style={{ width: "25%" }} />
                </div>
              </div>

              <div className="text-[10px] text-neutral-500 pt-2 border-t border-white/5 flex justify-between">
                <span>25GB of 100GB used</span>
              </div>
            </div>
          </Card>

          {/* Secure Groq Key Management */}
          <Card className={`${glassCardClass} p-6 space-y-4`}>
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <Key className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">API Keys</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groq_key" className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Groq API Key</Label>
              <Input 
                id="groq_key" 
                type="password"
                placeholder="gsk_..." 
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="bg-black/60 border-white/10 text-white font-mono text-xs focus:border-[#6068F0]/50 transition-all duration-300"
              />
            </div>
          </Card>

          {/* Actions panel */}
          <div className="space-y-4">
            <Button 
              onClick={handleSave}
              className="w-full bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center justify-center gap-2 py-3.5 transition-all duration-300"
            >
              <Save className="h-4 w-4" />
              {isSaved ? "Saved!" : "Save Settings"}
            </Button>

            <Button 
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 rounded-xl flex items-center justify-center gap-2 py-3.5 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
