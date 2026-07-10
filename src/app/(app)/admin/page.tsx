"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/lib/api";
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  ArrowLeft,
  Check,
  ChevronRight,
  Zap,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  plan: "free" | "pro";
  created_at: string;
}

interface PaymentRecord {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  profiles: {
    name: string | null;
    email: string | null;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "payments">("users");
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        const userEmail = session.user.email?.toLowerCase();
        if (userEmail === "parambrar862@gmail.com") {
          setIsAdmin(true);
          loadAdminData();
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  const loadAdminData = async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const [usersData, paymentsData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminPayments()
      ]);
      setUsers(usersData);
      setPayments(paymentsData);
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      setErrorMsg(err.message || "Failed to load dashboard data. Please make sure the backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTogglePlan = async (targetUserId: string, currentPlan: "free" | "pro") => {
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
    const nextPlan = currentPlan === "pro" ? "free" : "pro";
    try {
      const res = await api.changeUserPlan(targetUserId, nextPlan);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, plan: nextPlan } : u));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update user plan. Please verify server settings.");
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Calculations
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === "pro").length;
  const freeUsers = users.filter(u => u.plan === "free").length;
  
  // Dynamic Revenue Summing
  const grossEarnings = payments
    .filter(p => p.status === "captured")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const activeCurrencyCode = payments.length > 0 ? payments[0].currency : "USD";

  // Search filter
  const filteredUsers = users.filter(u => {
    const term = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  const getCurrencySymbol = (code: string) => {
    const syms: Record<string, string> = {
      INR: "₹", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", USD: "$"
    };
    return syms[code.toUpperCase()] || "$";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center transition-colors duration-500">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-[#6068F0] animate-spin" />
          <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase animate-pulse">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center p-6 text-slate-800 dark:text-neutral-200 transition-colors duration-500">
        <div className="max-w-[480px] w-full bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-[28px] p-8 md:p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold mb-3 tracking-tight">Access Denied</h2>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Your account does not have administrator privileges. This section is restricted to authorized personnel only.
          </p>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-slate-800 dark:text-neutral-100 p-4 md:p-8 transition-colors duration-500 antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              ZenithFlow Admin Control
              <Sparkles className="h-5 w-5 text-[#A78BFA] fill-[#A78BFA]/10 animate-pulse" />
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Logged in as <span className="font-semibold text-slate-600 dark:text-white">parambrar862@gmail.com</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadAdminData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] hover:border-[#6068F0]/30 hover:bg-[#6068F0]/5 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
            >
              <RefreshCw className={cn("h-4 w-4 text-neutral-400", refreshing && "animate-spin text-[#6068F0]")} />
              {refreshing ? "Reloading..." : "Refresh Status"}
            </button>
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6068F0] to-[#7c3aed] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-[#6068F0]/15">
                <ArrowLeft className="h-4 w-4" /> Client Portal
              </button>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-100/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl text-xs flex items-center gap-3">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Registers</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{totalUsers}</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Active profiles synced</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pro Accounts</span>
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#A78BFA]/10 text-violet-500 dark:text-[#A78BFA]">
                <Zap className="h-4.5 w-4.5 fill-violet-500/10" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-violet-500 dark:text-[#A78BFA]">{proUsers}</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">{((proUsers / (totalUsers || 1)) * 100).toFixed(0)}% Conversion Rate</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Free Users</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{freeUsers}</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">{freeUsers} standard accounts</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Test Gross Rev</span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-emerald-500 dark:text-emerald-400">
                {getCurrencySymbol(activeCurrencyCode)}{grossEarnings.toLocaleString()}
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Captured payments aggregate</p>
            </div>
          </div>
        </div>

        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] p-4 rounded-2xl shadow-sm">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("users")}
              className={cn(
                "flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300",
                activeTab === "users" 
                  ? "bg-white dark:bg-[#1C1C21] text-slate-800 dark:text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              User Registry
            </button>
            <button 
              onClick={() => setActiveTab("payments")}
              className={cn(
                "flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300",
                activeTab === "payments" 
                  ? "bg-white dark:bg-[#1C1C21] text-slate-800 dark:text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Transaction Logs
            </button>
          </div>

          {activeTab === "users" && (
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="text"
                placeholder="Search user email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6068F0] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Data Tables */}
        <div className="bg-white dark:bg-[#111114]/65 border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm">
          
          {activeTab === "users" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/2 text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Registered On</th>
                    <th className="py-4 px-6 text-center">Subscription Tier</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                        No registered users found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="py-4.5 px-6 font-bold">{u.name || "N/A"}</td>
                        <td className="py-4.5 px-6 font-medium text-neutral-500 dark:text-neutral-400">{u.email || "Not Synced"}</td>
                        <td className="py-4.5 px-6 text-neutral-400">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </td>
                        <td className="py-4.5 px-6 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                            u.plan === "pro" 
                              ? "bg-violet-500/10 border-violet-500/30 text-violet-500 dark:text-[#A78BFA]"
                              : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-neutral-400"
                          )}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <button
                            onClick={() => handleTogglePlan(u.id, u.plan)}
                            disabled={actionLoading[u.id]}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border shadow-sm",
                              u.plan === "pro"
                                ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                                : "bg-[#A78BFA] border-[#A78BFA] text-black hover:opacity-90"
                            )}
                          >
                            {actionLoading[u.id] ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : u.plan === "pro" ? (
                              "Revoke Pro"
                            ) : (
                              "Grant Pro"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/2 text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    <th className="py-4 px-6">Order Details</th>
                    <th className="py-4 px-6">Payment ID</th>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Paid On</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="py-4.5 px-6 font-mono font-bold text-neutral-400 select-all">{p.razorpay_order_id}</td>
                        <td className="py-4.5 px-6 font-mono text-neutral-500 select-all">{p.razorpay_payment_id || "—"}</td>
                        <td className="py-4.5 px-6 font-medium">
                          <div className="font-bold">{p.profiles?.name || "Anonymous"}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">{p.profiles?.email || "No email synchronized"}</div>
                        </td>
                        <td className="py-4.5 px-6 text-neutral-400">
                          {new Date(p.created_at).toLocaleDateString(undefined, {
                            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="py-4.5 px-6 font-black">
                          {getCurrencySymbol(p.currency)}{p.amount}
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                            p.status === "captured"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          )}>
                            {p.status === "captured" ? <CheckCircle className="h-3 w-3" /> : <RefreshCw className="h-3 w-3 animate-pulse" />}
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
