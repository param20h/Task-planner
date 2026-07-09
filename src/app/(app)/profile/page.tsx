"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Save,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// Styling constants using CSS variables for dynamic sliders
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-700 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-slate-300 dark:hover:border-white/15";

export default function ProfilePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState("alex_chen");
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alexchen@gmail.com");
  const [phone, setPhone] = useState("(317) 251-7990");
  const [groqKey, setGroqKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/AGENTS.png");
  const [plan, setPlan] = useState<"free" | "pro">("free");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };
  
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

      // Load plan from local storage
      const savedPlan = localStorage.getItem("momentum_plan") as "free" | "pro";
      if (savedPlan) {
        setPlan(savedPlan);
      }

      // First try loading from Supabase
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, groq_api_key, plan")
          .eq("id", activeId)
          .single();

        if (data && !error) {
          if (data.name) setName(data.name);
          if (data.groq_api_key) setGroqKey(data.groq_api_key);
          if (data.plan) setPlan(data.plan as "free" | "pro");
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
    localStorage.setItem("momentum_plan", plan);

    // Save to Supabase profiles table
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: profileId,
          name: name,
          groq_api_key: groqKey,
          plan: plan
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
    <div className="relative min-h-screen p-6 md:p-10 space-y-8 max-w-[1300px] mx-auto overflow-hidden text-slate-700 dark:text-neutral-300">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(96,104,240,0.03)" />
      
      {/* Hidden file input for avatar */}
      <input 
        type="file" 
        id="avatar-file-input" 
        accept="image/*" 
        onChange={handleAvatarChange} 
        className="hidden" 
      />

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Profile Card & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main profile avatar header */}
          <Card className={`${glassCardClass} p-8 flex flex-col items-center justify-center text-center`}>
            {/* Specular circle glass avatar */}
            <div 
              onClick={handleAvatarClick}
              className="relative w-28 h-28 rounded-full border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-slate-100 dark:from-white/5 to-transparent flex items-center justify-center shadow-xl mb-6 cursor-pointer group"
            >
              <div className="relative w-22 h-22 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-inner">
                <Image src={avatarUrl} alt="Profile Logo" fill className="object-cover" />
              </div>
              <div className="absolute bottom-0.5 right-0.5 bg-[#6068F0] border border-white/20 rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300">
                <Settings className="h-3.5 w-3.5 text-white animate-spin-slow" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{name}</h2>
                {plan === "pro" && (
                  <span className="text-[9px] font-black bg-gradient-to-r from-[#A78BFA] to-[#F9A8D4] text-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Pro</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">Productivity Enthusiast. Focused on deep work.</p>
            </div>
          </Card>

          {/* Action buttons (Save & Sign Out) */}
          <Card className={`${glassCardClass} p-4 space-y-3`}>
            <Button 
              onClick={handleSave} 
              className="w-full bg-[#6068F0] hover:bg-[#4d55d0] text-white rounded-xl shadow-lg shadow-[#6068F0]/20 flex items-center justify-center gap-2 py-3.5 font-bold transition-all duration-300 text-xs"
            >
              <Save className="h-4.5 w-4.5" />
              {isSaved ? "Settings Saved!" : "Save Profile"}
            </Button>

            <Button 
              onClick={handleSignOut} 
              variant="outline"
              className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl flex items-center justify-center gap-2 py-3.5 font-bold transition-all duration-300 text-xs"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </Button>
          </Card>
        </div>

        {/* Right Column: settings fields & configurations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Combined Settings Panel */}
          <Card className={`${glassCardClass} p-6 md:p-8 space-y-8`}>
            
            {/* Account Settings Section */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center gap-2.5">
                <User className="h-4.5 w-4.5 text-[#6068F0]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Account Settings</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Full Name</Label>
                  <Input 
                    id="profile-name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:border-[#6068F0]/40 transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="profile-email" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Email Address</Label>
                  <Input 
                    id="profile-email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:border-[#6068F0]/40 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone" className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Contact Phone</Label>
                  <Input 
                    id="profile-phone"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:border-[#6068F0]/40 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Subscription Plan</Label>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 min-h-[38px]">
                    <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 capitalize flex items-center gap-1.5">
                      {plan === "pro" ? <Sparkles className="h-3.5 w-3.5 text-[#A78BFA] animate-pulse" /> : null}
                      {plan === "pro" ? "Pro Plan" : "Free Tier"}
                    </span>
                    <span className={cn(
                      "text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md border tracking-wider",
                      plan === "pro" 
                        ? "bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30" 
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-550 border-slate-200 dark:border-white/10"
                    )}>
                      {plan === "pro" ? "Active" : "Standard"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Preferences Section */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center gap-2.5">
                <SunMoon className="h-4.5 w-4.5 text-[#6068F0]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Preferences & Customization</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transparency slider */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
                    <span>Transparency Sensitivity</span>
                    <span className="text-[#6068F0] font-extrabold">{appearance < 30 ? "Glassy" : appearance > 80 ? "Solid Panels" : "Medium Blur"}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={appearance} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAppearance(val);
                      document.documentElement.style.setProperty('--glass-opacity', String((val / 100) * 0.4 + 0.1));
                      document.documentElement.style.setProperty('--glass-blur', `${(val / 100) * 20 + 8}px`);
                    }}
                    className="w-full accent-[#6068F0] cursor-pointer bg-slate-100 dark:bg-neutral-800 rounded-lg appearance-none h-1"
                  />
                </div>

                {/* AI Coach Depth slider */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
                    <span>AI Coach Depth</span>
                    <span className="text-[#6068F0] font-extrabold">{aiDepth < 40 ? "Casual Advice" : aiDepth > 85 ? "Deep Analytics" : "Balanced Sprint"}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={aiDepth} 
                    onChange={(e) => setAiDepth(Number(e.target.value))}
                    className="w-full accent-[#6068F0] cursor-pointer bg-slate-100 dark:bg-neutral-800 rounded-lg appearance-none h-1"
                  />
                </div>
              </div>
            </div>

            {/* Cloud & Data Synchronizer Section */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center gap-2.5">
                <Database className="h-4.5 w-4.5 text-[#6068F0]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cloud Synchronizer</span>
              </div>
              
              <div className="bg-slate-50 dark:bg-black/30 border border-slate-150 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">Supabase DB Sync</span>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-550 leading-relaxed">Workspace data is securely backed up and synced in real-time.</p>
                </div>
                <div className="w-full md:w-64 space-y-1.5 shrink-0">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                    <span>Storage limit</span>
                    <span className="text-[#6068F0] font-extrabold">12.5 KB / 10 MB</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#6068F0] to-[#A78BFA] rounded-full" style={{ width: "2%" }}></div>
                  </div>
                </div>
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}
