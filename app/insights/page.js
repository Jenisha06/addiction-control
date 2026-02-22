"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase";
import {
  doc, getDoc, collection, query, orderBy, getDocs,
} from "firebase/firestore";
import {
  DollarSign, Zap, TrendingUp, Stethoscope,
  Smile, CheckCircle2, Circle, Calendar, Activity,
  Flame, Shield,
} from "lucide-react";
import {
  AreaChart, Area, CartesianGrid, Tooltip,
  ResponsiveContainer, XAxis, YAxis,
} from "recharts";
import BottomNav from "../components/BottomNav";

// ─── Health milestones (time in hours from sobriety start) ───────────────────
const MILESTONES = [
  { label: "20 minutes",  hours: 0.33,  impact: "Heart rate & blood pressure begin to drop."         },
  { label: "12 hours",    hours: 12,    impact: "Blood carbon monoxide drops to normal."              },
  { label: "48 hours",    hours: 48,    impact: "Taste and smell start improving."                    },
  { label: "72 hours",    hours: 72,    impact: "Breathing becomes easier, energy returns."           },
  { label: "1 week",      hours: 168,   impact: "Sleep quality improves, anxiety reducing."           },
  { label: "1 month",     hours: 720,   impact: "Liver begins repairing itself."                      },
  { label: "3 months",    hours: 2160,  impact: "Circulation improves, stamina increases."            },
  { label: "6 months",    hours: 4380,  impact: "Risk of mouth & throat cancer drops significantly."  },
  { label: "1 year",      hours: 8760,  impact: "Heart disease risk cuts in half."                    },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />;
}

function InsightsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-32 space-y-5">
      <Skeleton className="h-14 w-48" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}

// ─── Custom tooltip for chart ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === "mood" ? "Mood" : "Craving"}: {p.value}/5
        </p>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [userData, setUserData]   = useState(null);
  const [checkins, setCheckins]   = useState([]);
  const [loading,  setLoading]    = useState(true);

  // ── Load from Firestore ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { setLoading(false); return; }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setUserData(userSnap.data());

        const q = query(
          collection(db, "users", user.uid, "checkins"),
          orderBy("date", "asc")
        );
        const snap = await getDocs(q);
        setCheckins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Insights load error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ── Computed values ───────────────────────────────────────────────────────
  const hoursSober = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    return (Date.now() - new Date(userData.sobrietyDate).getTime()) / 3600000;
  }, [userData]);

  const daysSober = Math.floor(hoursSober / 24);

  const moneySaved = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    return daysSober * (userData?.drinkCostPerDay ?? 0);
  }, [userData, daysSober]);

  const calories = useMemo(() => daysSober * 150, [daysSober]);

  const healthScore = Math.min(99, 60 + daysSober);

  // Streak
  const streak = useMemo(() => {
    if (!checkins.length) return userData?.currentStreak ?? 0;
    const sorted = [...checkins].sort((a, b) => b.date.toDate() - a.date.toDate());
    let count = 0, cursor = new Date(); cursor.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = c.date.toDate(); d.setHours(0,0,0,0);
      const diff = Math.round((cursor - d) / 86400000);
      if (diff === 0 || diff === 1) { count++; cursor = d; } else break;
    }
    return count;
  }, [checkins, userData]);

  // Chart: last 14 checkins
  const chartData = useMemo(() =>
    checkins.slice(-14).map(c => ({
      name:     c.date?.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) ?? "",
      mood:     c.mood     ?? 0,
      cravings: c.cravings ?? 0,
    })),
  [checkins]);

  // Checkin performance: % of days since sobriety with a checkin
  const checkinRate = useMemo(() => {
    if (!daysSober || !checkins.length) return 0;
    return Math.min(100, Math.round((checkins.length / Math.max(daysSober, 1)) * 100));
  }, [checkins, daysSober]);

  // Sober days vs relapse days
  const soberDays  = useMemo(() => checkins.filter(c => !c.drank).length, [checkins]);
  const relapseDays = useMemo(() => checkins.filter(c =>  c.drank).length, [checkins]);

  // Average mood
  const avgMood = useMemo(() => {
    const moods = checkins.filter(c => c.mood).map(c => c.mood);
    if (!moods.length) return 0;
    return (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1);
  }, [checkins]);

  if (loading) return <InsightsSkeleton />;

  const milestonesDone = MILESTONES.filter(m => hoursSober >= m.hours).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-black text-slate-900">
            Your <span className="text-blue-600">Insights</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold">
            {daysSober} days tracked · {checkins.length} check-ins
          </p>
        </div>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto space-y-5">

        {/* ── Stat grid ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<DollarSign size={20} />}
            label="Money Saved"
            value={moneySaved > 0 ? `₹${moneySaved.toLocaleString("en-IN")}` : "₹0"}
            sub={`₹${userData?.drinkCostPerDay ?? 0}/day × ${daysSober}d`}
            color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100"
          />
          <StatCard
            icon={<Zap size={20} />}
            label="Calories Avoided"
            value={calories > 999 ? `${(calories/1000).toFixed(1)}k` : calories}
            sub="~150 cal/day"
            color="text-amber-600" bg="bg-amber-50" border="border-amber-100"
          />
          <StatCard
            icon={<Flame size={20} />}
            label="Current Streak"
            value={`${streak} day${streak !== 1 ? "s" : ""}`}
            sub={`Best: ${userData?.longestStreak ?? streak} days`}
            color="text-orange-600" bg="bg-orange-50" border="border-orange-100"
          />
          <StatCard
            icon={<Activity size={20} />}
            label="Health Score"
            value={`${healthScore}%`}
            sub="Grows with sobriety"
            color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
          />
        </div>

        {/* ── Sober vs relapse split ── */}
        {checkins.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-black text-slate-900 text-sm mb-4">Check-in Breakdown</h2>
            <div className="flex rounded-2xl overflow-hidden h-5 mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${checkins.length ? (soberDays / checkins.length) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-emerald-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${checkins.length ? (relapseDays / checkins.length) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="bg-rose-400"
              />
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-600">✅ {soberDays} sober days</span>
              <span className="text-rose-500">⚠️ {relapseDays} relapse days</span>
            </div>
            <div className="mt-3 flex gap-4">
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Avg Mood</p>
                <p className="font-black text-slate-800">{avgMood > 0 ? `${avgMood}/5` : "—"}</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Check-in Rate</p>
                <p className="font-black text-slate-800">{daysSober > 0 ? `${checkinRate}%` : "—"}</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Days</p>
                <p className="font-black text-slate-800">{daysSober}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Mood & cravings chart ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Smile size={16} className="text-blue-500" /> Mood & Cravings
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Mood</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Craving</span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="cravG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F87171" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F87171" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0" }} />
                  <Area type="monotone" dataKey="mood"     stroke="#3B82F6" strokeWidth={2} fill="url(#moodG)" dot={{ r: 3, fill: "#3B82F6" }} />
                  <Area type="monotone" dataKey="cravings" stroke="#F87171" strokeWidth={2} fill="url(#cravG)"  dot={{ r: 3, fill: "#F87171" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm font-bold text-slate-700">No data yet</p>
              <p className="text-xs text-slate-400 mt-1">Complete daily check-ins to see your trends.</p>
            </div>
          )}
        </div>

        {/* ── Health recovery timeline ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-500" /> Body Recovery
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {milestonesDone}/{MILESTONES.length} reached
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(milestonesDone / MILESTONES.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>

          <div className="space-y-4">
            {MILESTONES.map((m, i) => {
              const done = hoursSober >= m.hours;
              const next = !done && (i === 0 || hoursSober >= MILESTONES[i-1].hours);
              return (
                <div key={i} className={`flex gap-3 items-start transition-opacity ${!done && !next ? "opacity-40" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    done ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                    : next ? "bg-blue-100 ring-2 ring-blue-400 ring-offset-1"
                    : "bg-slate-100"
                  }`}>
                    {done
                      ? <CheckCircle2 size={14} className="text-white" />
                      : next
                        ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        : <Circle size={10} className="text-slate-300" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-xs ${done ? "text-emerald-700" : next ? "text-blue-700" : "text-slate-500"}`}>
                        {m.label}
                      </p>
                      {next && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Next</span>}
                      {done && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold uppercase">✓ Done</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{m.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Performance card ── */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#0891b2 100%)" }}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-300" fill="currentColor" />
              <h2 className="font-black text-white text-sm">Performance</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Check-in Rate", value: daysSober > 0 ? `${checkinRate}%` : "—", sub: "of days logged" },
                { label: "Sober Days",    value: soberDays,    sub: "out of " + checkins.length + " logged" },
                { label: "XP Earned",     value: (userData?.xp ?? 0).toLocaleString(), sub: `Level ${userData?.level ?? 1}` },
                { label: "Shields Left",  value: userData?.shieldCount ?? 0, sub: "relapse shields" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-3">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-white font-black text-lg leading-tight">{value}</p>
                  <p className="text-white/50 text-[10px]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── XP level progress ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-slate-900 text-sm">Level Progress</h2>
            <span className="text-xs font-bold text-blue-600">Level {userData?.level ?? 1}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((userData?.xp ?? 0) % 1000) / 10)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-semibold mt-1.5">
            <span>{(userData?.xp ?? 0) % 1000} XP</span>
            <span>1000 XP to Level {(userData?.level ?? 1) + 1}</span>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg, border }) {
  return (
    <div className={`${bg} border ${border} p-4 rounded-3xl space-y-2 shadow-sm`}>
      <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</p>
      </div>
    </div>
  );
}