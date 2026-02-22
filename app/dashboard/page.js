"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap, Flame, Plus, Trophy, Shield, Activity,
  DollarSign, Map, Brain, MessageSquare, AlertCircle,
  ArrowUpRight, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis,
} from "recharts";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase";
import BottomNav from "../components/BottomNav";

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-5 max-w-lg mx-auto space-y-5 pt-8 pb-32">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-1.5 w-36 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}
      </div>
      <Skeleton className="h-52 w-full rounded-3xl" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const [userData,  setUserData]  = useState(null);
  const [checkins,  setCheckins]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  // ── Auth guard + Firestore load ───────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);
      if (!user) { router.push("/login"); return; }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists()) { router.push("/onboarding"); return; }
        setUserData(userSnap.data());

        const q = query(
          collection(db, "users", user.uid, "checkins"),
          orderBy("date", "asc")
        );
        const snap = await getDocs(q);
        setCheckins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // ── Sobriety timer — ticks every second ──────────────────────────────────
  useEffect(() => {
    if (!userData?.sobrietyDate) return;
    const tick = () => {
      const diff = Math.max(0, Date.now() - new Date(userData.sobrietyDate).getTime());
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        mins:  Math.floor((diff / 60000) % 60),
        secs:  Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [userData?.sobrietyDate]);

  // ── Computed values ───────────────────────────────────────────────────────
  const levelProgress = useMemo(() => {
    const xp = userData?.xp ?? 0, level = userData?.level ?? 1;
    return Math.min(100, Math.max(0, ((xp - (level - 1) * 1000) / 1000) * 100));
  }, [userData]);

  const streak = useMemo(() => {
    if (!checkins.length) return userData?.currentStreak ?? 0;
    const sorted = [...checkins].sort((a, b) => b.date.toDate() - a.date.toDate());
    let count = 0;
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = c.date.toDate(); d.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor - d) / 86400000);
      if (diff === 0 || diff === 1) { count++; cursor = d; } else break;
    }
    return count;
  }, [checkins, userData]);

  const moneySaved = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    const days = Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000);
    return days * (userData?.drinkCostPerDay ?? 0);
  }, [userData]);

  const calories = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    const days = Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000);
    return days * 150; // avg 150 cal/drink session
  }, [userData]);

  const chartData = useMemo(() =>
    checkins.slice(-7).map((c) => ({
      name:     c.date.toDate().toLocaleDateString("en-IN", { weekday: "short" }),
      mood:     c.mood     ?? 0,
      cravings: c.cravings ?? 0,
    })),
  [checkins]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!authReady || loading) return <DashboardSkeleton />;
  if (!userData) return null;

  const firstName = (userData.name ?? "Friend").split(" ")[0];
  const healthScore = Math.min(99, 60 + timeLeft.days);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-5 max-w-lg mx-auto space-y-5 pb-32 pt-6"
      >

        {/* ── HEADER ── */}
        <header className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <span className="text-xl font-black">{userData.level ?? 1}</span>
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm">
                <Trophy size={11} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">{getGreeting()},</p>
              <h1 className="font-black text-slate-800 text-base leading-tight">{firstName} 👋</h1>
              <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                {userData.xp ?? 0} / {(userData.level ?? 1) * 1000} XP
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <StatBubble icon={<Flame size={14} />}  value={`${streak}d`}           color="bg-orange-50 text-orange-500" />
            <StatBubble icon={<Shield size={14} />} value={userData.shieldCount ?? 0} color="bg-blue-50 text-blue-600" />
          </div>
        </header>

        {/* ── SOBRIETY TIMER ── */}
        <section
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#0891b2 100%)" }}
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5  rounded-full  translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <p className="text-[10px] uppercase text-blue-200 font-bold tracking-widest mb-4 relative z-10">
            🎯 Alcohol Free For
          </p>

          <div className="flex justify-center gap-5 mb-5 relative z-10">
            {[
              { v: timeLeft.days,  l: "Days"  },
              { v: timeLeft.hours, l: "Hours" },
              { v: timeLeft.mins,  l: "Mins"  },
              { v: timeLeft.secs,  l: "Secs"  },
            ].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center">
                <div className="text-3xl font-black text-white tabular-nums w-14 text-center">
                  {String(v).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-blue-200 uppercase font-bold tracking-wider">{l}</div>
              </div>
            ))}
          </div>

          {!userData.sobrietyDate && (
            <p className="text-xs text-blue-300 mb-4 relative z-10">
              Set your sobriety date in Profile to activate the timer.
            </p>
          )}

          <button
            onClick={() => router.push("/checkin")}
            className="relative z-10 bg-white text-blue-700 px-7 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Daily Check-In
          </button>
        </section>

        {/* ── ACTION GRID ── */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { title: "Recovery Map",  icon: <Map size={22} />,          path: "/map",       color: "text-blue-600   bg-blue-50"    },
            { title: "CBT Exercises", icon: <Brain size={22} />,         path: "/cbt",       color: "text-purple-600 bg-purple-50"  },
            { title: "Community",     icon: <MessageSquare size={22} />, path: "/community", color: "text-emerald-600 bg-emerald-50" },
            { title: "Craving Help",  icon: <AlertCircle size={22} />,   path: "/emergency", color: "text-rose-600   bg-rose-50"    },
          ].map(({ title, icon, path, color }) => (
            <DashboardCard key={path} title={title} icon={icon} color={color} onClick={() => router.push(path)} />
          ))}
        </section>

        {/* ── INSIGHTS ── */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-black text-slate-800">Your Insights</h2>
            <button
              onClick={() => router.push("/insights")}
              className="text-blue-600 text-xs font-bold flex items-center gap-0.5"
            >
              View All <ArrowUpRight size={13} />
            </button>
          </div>

          {/* Stat mini-cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatMiniCard
              label="Saved"
              value={moneySaved > 0 ? `₹${moneySaved.toLocaleString("en-IN")}` : "₹0"}
              icon={<DollarSign size={16} />}
              color="text-emerald-600"
            />
            <StatMiniCard
              label="Calories"
              value={calories > 999 ? `${(calories / 1000).toFixed(1)}k` : String(calories)}
              icon={<Zap size={16} />}
              color="text-amber-500"
            />
            <StatMiniCard
              label="Health"
              value={`${healthScore}%`}
              icon={<Activity size={16} />}
              color="text-blue-500"
            />
          </div>

          {/* Chart */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            {chartData.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mood & Cravings</p>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Mood
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Cravings
                    </span>
                  </div>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="cravGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#F87171" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#F87171" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        cursor={{ stroke: "#e2e8f0" }}
                      />
                      <Area type="monotone" dataKey="mood"     stroke="#3B82F6" strokeWidth={2} fill="url(#moodGrad)" dot={{ r: 3, fill: "#3B82F6" }} />
                      <Area type="monotone" dataKey="cravings" stroke="#F87171" strokeWidth={2} fill="url(#cravGrad)"  dot={{ r: 3, fill: "#F87171" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                  <TrendingUp size={22} className="text-blue-400" />
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">No data yet</p>
                <p className="text-xs text-slate-400 mb-4 max-w-[200px]">
                  Complete your first check-in to see your mood & craving trends here.
                </p>
                <button
                  onClick={() => router.push("/checkin")}
                  className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                >
                  Do Check-In Now
                </button>
              </div>
            )}
          </div>
        </section>

      </motion.div>

      <BottomNav />
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function DashboardCard({ title, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-3xl text-left border border-slate-100 shadow-sm active:scale-95 transition-transform"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="font-bold text-sm text-slate-800">{title}</h3>
    </button>
  );
}

function StatMiniCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className="font-black text-slate-800 text-sm leading-tight">{value}</div>
      <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function StatBubble({ icon, value, color }) {
  return (
    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-xs ${color}`}>
      {icon}
      <span>{value}</span>
    </div>
  );
}