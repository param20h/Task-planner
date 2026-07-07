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

// Styling constants using CSS variables for dynamic sliders
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-700 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-slate-300 dark:hover:border-white/15";

export default function ProfilePage() {
  const [profileId, setProfileId] = useState("alex_chen");
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alexchen@gmail.com");
  const [phone, setPhone] = useState("(317) 251-7990");
  const [groqKey, setGroqKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/AGENTS.png");
  
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
      let activeId = "alex_chen";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeId = user.id;
          setProfileId(user.id);
          if (user.email) setEmail(user.email);
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
      }

      // Load appearance settings from local storage
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

      // Load avatar from local storage
      const savedAvatar = localStorage.getItem("momentum_avatar");
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }

      // First try loading from Supabase
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, groq_api_key")
          .eq("id", activeId)
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

  const handleAvatarClick = () => {
    document.getElementById("avatar-file-input")?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setAvatarUrl(base64Str);
        localStorage.setItem("momentum_avatar", base64Str);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    localStorage.setItem("momentum_groq_key", groqKey);
    localStorage.setItem("momentum_name", name);
    localStorage.setItem("momentum_appearance", String(appearance));

    // Save to Supabase profiles table
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: profileId,
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
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Hidden file input for avatar */}
      <input 
        type="file" 
        id="avatar-file-input" 
        accept="image/*" 
        onChange={handleAvatarChange} 
        className="hidden" 
      />

      {/* 3-Column Profile Grid mimicking Screen 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Account Profile & Personal info (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Main profile avatar header */}
          <Card className={`${glassCardClass} p-8 flex flex-col items-center justify-center text-center`}>
            {/* Specular circle glass avatar */}
            <div 
              onClick={handleAvatarClick}
              className="relative w-32 h-32 rounded-full border border-slate-200 dark:border-white/20 bg-gradient-to-br from-slate-100 dark:from-white/10 to-transparent flex items-center justify-center shadow-2xl mb-6 cursor-pointer group"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-inner">
                <Image src={avatarUrl} alt="Profile Logo" fill className="object-cover" />
              </div>
              <div className="absolute bottom-1 right-1 bg-[#6068F0] border border-white/20 rounded-full p-2 shadow-lg hover:scale-115 transition-all duration-300">
                <Settings className="h-4 w-4 text-white animate-spin-slow" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{name}</h2>
                <span className="text-[10px] font-bold bg-[#6068F0]/20 border border-[#6068F0]/30 text-[#6068F0] px-2 py-0.5 rounded-full uppercase">Pro</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">Productivity Enthusiast. Focused on deep work.</p>
            </div>
          </Card>

          {/* Forms & personal details */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2.5">
              <User className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Personal Info</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Name</Label>
                <Input 
                  id="profile-name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Email Address</Label>
                <Input 
                  id="profile-email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Contact Phone</Label>
                <Input 
                  id="profile-phone"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column: System Config & Sensitivities (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Settings panel details */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2.5">
              <SunMoon className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance Sensitivity</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                <span>Transparency Sensitivity</span>
                <span className="text-[#6068F0] font-bold">
                  {appearance < 30 ? "Solid Panels" : appearance < 75 ? "Translucent Glass" : "Frosted / Specular"}
                </span>
              </div>
              <input 
                type="range" min="5" max="100" value={appearance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAppearance(val);
                  document.documentElement.style.setProperty('--glass-opacity', String((val / 100) * 0.4 + 0.1));
                  document.documentElement.style.setProperty('--glass-blur', `${(val / 100) * 20 + 8}px`);
                }}
                className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6068F0]" 
              />
            </div>
          </Card>

          {/* AI Coach Preference */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2.5">
              <Brain className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Coach Settings</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-slate-500 dark:text-neutral-400">
                <span>Depth Level</span>
                <span className="text-slate-900 dark:text-white font-bold">{aiDepth > 70 ? "Deep" : "Light"}</span>
              </div>
              <input 
                type="range" min="0" max="100" value={aiDepth}
                onChange={(e) => setAiDepth(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6068F0]" 
              />
              <p className="text-[10px] text-slate-400 dark:text-neutral-500 leading-normal">AI provides in-depth cognitive analysis and personalized athletic strategies.</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Storage details & API Keys (3 cols) */}
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between min-h-[calc(100vh-14rem)]">
          
          {/* Storage usage layout */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2.5">
              <Database className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Storage Usage</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-slate-500 dark:text-neutral-400">
                <span>Supabase Sync</span>
                <span className="text-[#6068F0] font-bold">12.5 KB / 10 MB</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#6068F0] rounded-full" style={{ width: "2%" }}></div>
              </div>
            </div>
          </Card>

          {/* API Keys Configuration */}
          <Card className={`${glassCardClass} p-6 space-y-6`}>
            <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center gap-2.5">
              <Key className="h-4.5 w-4.5 text-[#6068F0]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">API Credentials</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="groq-key" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Groq API Key</Label>
                <Input 
                  id="groq-key"
                  type="password" 
                  placeholder="gsk_..." 
                  value={groqKey} 
                  onChange={(e) => setGroqKey(e.target.value)} 
                  className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white"
                />
              </div>
              <p className="text-[9px] text-slate-400 dark:text-neutral-500 leading-normal">
                Credentials are saved locally in your browser storage and synced securely.
              </p>
            </div>
          </Card>

          {/* Save Action block */}
          <Button 
            onClick={handleSave} 
            className="w-full bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center justify-center gap-2 py-3.5 font-bold transition-all duration-300"
          >
            <Save className="h-4.5 w-4.5" />
            {isSaved ? "Settings Saved!" : "Save Profile"}
          </Button>

        </div>
      </div>
    </div>
  );
}
