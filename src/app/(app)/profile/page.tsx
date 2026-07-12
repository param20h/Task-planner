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
  Sparkles,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// Styling constants using CSS variables for dynamic sliders
const glassCardClass = "bg-white/[var(--glass-opacity,0.7)] dark:bg-[#0d0d0e]/[var(--glass-opacity,0.6)] backdrop-blur-[var(--glass-blur,20px)] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-700 dark:text-neutral-300 relative overflow-hidden transition-all duration-500 ease-out hover:border-slate-300 dark:hover:border-white/15";

export default function ProfilePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/AGENTS.png");
  const [plan, setPlan] = useState<"free" | "pro">("free");

  // Delete Account Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return;
    setIsDeleting(true);
    try {
      // 1. Trigger deletion query on Express server
      await api.deleteAccount();
      
      // 2. Sign out of active Supabase session
      await supabase.auth.signOut();
      localStorage.clear();
      
      // 3. Force redirect to registration page
      window.location.href = "/register";
    } catch (err: any) {
      alert(err.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
      let activeId = "";
      let defaultName = "";
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeId = user.id;
          setProfileId(user.id);
          if (user.email) setEmail(user.email);
          if (user.phone) setPhone(user.phone);
          
          defaultName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
          setName(defaultName);
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

      if (!activeId) return;

      // First try loading from Supabase
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, groq_api_key, plan")
          .eq("id", activeId)
          .single();

        if (data && !error) {
          if (data.name) setName(data.name);
          else if (defaultName) setName(defaultName);
          
          if (data.groq_api_key) setGroqKey(data.groq_api_key);
          if (data.plan) setPlan(data.plan as "free" | "pro");
        } else {
          // Fallback if profiles row not fully propagated
          if (defaultName) setName(defaultName);
          
          // Fallback to local storage
          const savedKey = localStorage.getItem("momentum_groq_key");
          const savedName = localStorage.getItem("momentum_name");
          if (savedKey) setGroqKey(savedKey);
          if (savedName && !defaultName) setName(savedName);
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
              className="w-full border-slate-200 dark:border-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-center gap-2 py-3.5 font-bold transition-all duration-300 text-xs"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </Button>

            <Button 
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteModal(true);
              }} 
              variant="outline"
              className="w-full border-red-500/20 text-red-500 dark:text-red-400/80 hover:bg-red-500/10 rounded-xl flex items-center justify-center gap-2 py-3.5 font-bold transition-all duration-300 text-xs mt-2"
            >
              <Trash2 className="h-4.5 w-4.5" />
              Delete Account
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


          </Card>
        </div>
      </div>

      {/* Delete Account Double-Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-[480px] w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Delete Account permanently?</h3>
              <p className="text-xs text-slate-400 dark:text-neutral-500 leading-relaxed">
                This action is irreversible. All your biometrics, tasks, goals, workout routines, and subscription configurations will be permanently destroyed.
              </p>
            </div>

            <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 p-4 rounded-2xl text-[11px] text-red-600 dark:text-red-400 font-semibold leading-relaxed">
              ⚠️ Warning: If you proceed, you will be logged out instantly and all your data will be permanently wiped.
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 tracking-wider">
                Type <span className="font-extrabold text-red-500 select-all">DELETE</span> to confirm
              </label>
              <Input
                type="text"
                placeholder="Type DELETE..."
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-xs font-bold tracking-widest text-center focus:border-red-500 transition-colors uppercase py-5"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1 rounded-xl border-slate-200 dark:border-white/5 text-slate-600 dark:text-neutral-450 hover:bg-slate-50 dark:hover:bg-white/5 py-3 font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeleting}
                className="flex-1 bg-red-650 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/15 py-3 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Wiping Data..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
