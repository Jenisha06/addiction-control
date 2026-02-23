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

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  gold:       "#c8a060",
  goldLight:  "#f7e0bb",
  muted:      "#a07848",
  text:       "#3d2410",
  parchment:  "linear-gradient(180deg, #f5e8c8 0%, #ede0b4 100%)",
  cardBg:     "linear-gradient(135deg, rgba(90,52,24,0.72) 0%, rgba(58,32,16,0.82) 100%)",
  cardBorder: "rgba(200,160,74,0.28)",
  pageBg:     "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
  questBtn:   "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
  questShadow:"0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
  woodLight:  "linear-gradient(180deg, #d4b483 0%, #b8955c 50%, #a07840 100%)",
  btnBorder:  "#8a6030",
  btnShadow:  "0 3px 0 #6a4820, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,230,160,0.4)",
};

// ─── Health milestones ────────────────────────────────────────────────────────
const MILESTONES = [
  { label: "20 minutes", hours: 0.33,  impact: "Heart rate & blood pressure begin to drop."        },
  { label: "12 hours",   hours: 12,    impact: "Blood carbon monoxide drops to normal."             },
  { label: "48 hours",   hours: 48,    impact: "Taste and smell start improving."                   },
  { label: "72 hours",   hours: 72,    impact: "Breathing becomes easier, energy returns."          },
  { label: "1 week",     hours: 168,   impact: "Sleep quality improves, anxiety reducing."          },
  { label: "1 month",    hours: 720,   impact: "Liver begins repairing itself."                     },
  { label: "3 months",   hours: 2160,  impact: "Circulation improves, stamina increases."           },
  { label: "6 months",   hours: 4380,  impact: "Risk of mouth & throat cancer drops significantly." },
  { label: "1 year",     hours: 8760,  impact: "Heart disease risk cuts in half."                   },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function InsightsSkeleton() {
  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", padding: "32px 20px 120px", display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{`@keyframes shimmer{from{opacity:.4}to{opacity:.8}}`}</style>
      <div style={{ height: 52, borderRadius: 14, background: "rgba(200,160,74,0.1)", animation: "shimmer 1.6s ease-in-out infinite alternate" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 120, borderRadius: 18, background: "rgba(200,160,74,0.08)", animation: "shimmer 1.6s ease-in-out infinite alternate", animationDelay: `${i*0.15}s` }} />)}
      </div>
      {[240, 200, 260].map((h, i) => <div key={i} style={{ height: h, borderRadius: 18, background: "rgba(200,160,74,0.07)", animation: "shimmer 1.6s ease-in-out infinite alternate", animationDelay: `${i*0.2}s` }} />)}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 10, padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.72rem", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: p.color, fontSize: "0.72rem" }}>
          {p.dataKey === "mood" ? "Mood" : "Craving"}: {p.value}/5
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ glyph, label, value, sub, accentColor }) {
  return (
    <div style={{ background: T.cardBg, border: `1.5px solid ${accentColor}40`, borderRadius: 18, padding: "14px 14px", boxShadow: `0 0 16px ${accentColor}15, inset 0 1px 0 rgba(255,220,130,0.05)` }}>
      <div style={{ width: 40, height: 40, background: `${accentColor}20`, border: `1.5px solid ${accentColor}45`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: "1.2rem" }}>
        {glyph}
      </div>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</p>
      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.2rem", lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, marginTop: 3, fontStyle: "italic" }}>{sub}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [userData, setUserData] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { setLoading(false); return; }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setUserData(userSnap.data());
        const q = query(collection(db, "users", user.uid, "checkins"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        setCheckins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error("Insights load error:", err); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  const hoursSober = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    return (Date.now() - new Date(userData.sobrietyDate).getTime()) / 3600000;
  }, [userData]);

  const daysSober    = Math.floor(hoursSober / 24);
  const moneySaved   = useMemo(() => daysSober * (userData?.drinkCostPerDay ?? 0), [userData, daysSober]);
  const calories     = useMemo(() => daysSober * 150, [daysSober]);
  const healthScore  = Math.min(99, 60 + daysSober);

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

  const chartData = useMemo(() =>
    checkins.slice(-14).map(c => ({
      name:     c.date?.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) ?? "",
      mood:     c.mood     ?? 0,
      cravings: c.cravings ?? 0,
    })),
  [checkins]);

  const checkinRate  = useMemo(() => { if (!daysSober || !checkins.length) return 0; return Math.min(100, Math.round((checkins.length / Math.max(daysSober, 1)) * 100)); }, [checkins, daysSober]);
  const soberDays    = useMemo(() => checkins.filter(c => !c.drank).length, [checkins]);
  const relapseDays  = useMemo(() => checkins.filter(c =>  c.drank).length, [checkins]);
  const avgMood      = useMemo(() => { const m = checkins.filter(c => c.mood).map(c => c.mood); if (!m.length) return 0; return (m.reduce((a, b) => a + b, 0) / m.length).toFixed(1); }, [checkins]);

  if (loading) return <InsightsSkeleton />;

  const milestonesDone = MILESTONES.filter(m => hoursSober >= m.hours).length;

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", paddingBottom: 112 }}>
      <style>{`@keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}`}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-35">
        {[{l:"6%",t:"10%"},{l:"88%",t:"16%"},{l:"15%",t:"78%"},{l:"82%",t:"70%"},{l:"50%",t:"5%"}].map((p,i)=>(
          <div key={i} className="absolute rounded-full"
            style={{ left:p.l, top:p.t, width:5, height:5, background:i%2===0?"rgba(255,230,140,0.7)":"rgba(180,240,200,0.6)", animation:`pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${i*0.35}s` }} />
        ))}
      </div>

      {/* ── Sticky header ── */}
      <div className="relative z-20" style={{ position: "sticky", top: 0, background: "linear-gradient(180deg, rgba(45,26,12,0.97), rgba(45,26,12,0.93))", borderBottom: "1px solid rgba(200,160,74,0.18)", backdropFilter: "blur(12px)", padding: "22px 20px 14px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.3rem", lineHeight: 1.2 }}>
            Your <span style={{ color: "#6ab4d8" }}>Insights</span>
          </h1>
          <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.7rem", fontStyle: "italic", marginTop: 2 }}>
            {daysSober} days tracked · {checkins.length} vigils completed
          </p>
          <p style={{ color: "rgba(200,160,74,0.25)", fontSize: "0.62rem", letterSpacing: "0.2em", fontFamily: "serif", marginTop: 3 }}>ᚠ ᚢ ᚦ ᚨ ᚱ</p>
        </div>
      </div>

      <div className="relative z-10" style={{ padding: "16px 20px", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Stat grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard glyph="💰" label="Money Saved"      value={moneySaved > 0 ? `₹${moneySaved.toLocaleString("en-IN")}` : "₹0"} sub={`₹${userData?.drinkCostPerDay ?? 0}/day × ${daysSober}d`} accentColor="#7aab6a" />
          <StatCard glyph="⚡" label="Calories Avoided" value={calories > 999 ? `${(calories/1000).toFixed(1)}k` : calories}        sub="~150 cal/day"                                              accentColor="#c8a060" />
          <StatCard glyph="🔥" label="Current Streak"   value={`${streak} day${streak !== 1 ? "s" : ""}`}                           sub={`Best: ${userData?.longestStreak ?? streak} days`}         accentColor="#c08060" />
          <StatCard glyph="🛡️" label="Health Score"     value={`${healthScore}%`}                                                   sub="Grows with sobriety"                                      accentColor="#6ab4d8" />
        </div>

        {/* ── Sober vs relapse ── */}
        {checkins.length > 0 && (
          <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: "16px 16px", boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem", marginBottom: 14 }}>Vigil Breakdown</h2>

            {/* Split bar */}
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 14, marginBottom: 10, background: "rgba(200,160,74,0.1)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${checkins.length ? (soberDays / checkins.length) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ background: "#7aab6a" }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${checkins.length ? (relapseDays / checkins.length) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                style={{ background: "#c06060" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "#7aab6a", fontSize: "0.75rem" }}>✅ {soberDays} sober days</span>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "#c06060", fontSize: "0.75rem" }}>⚠️ {relapseDays} relapse days</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Avg Mood",      value: avgMood > 0 ? `${avgMood}/5` : "—" },
                { label: "Check-in Rate", value: daysSober > 0 ? `${checkinRate}%` : "—" },
                { label: "Total Days",    value: daysSober },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(200,160,74,0.08)", border: "1px solid rgba(200,160,74,0.18)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.95rem" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mood & cravings chart ── */}
        <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: "16px 16px", boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Smile size={15} style={{ color: "#6ab4d8" }} /> Mood & Cravings
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: "#6ab4d8", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6ab4d8", display: "inline-block" }} />Mood
              </span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: "#c06060", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c06060", display: "inline-block" }} />Craving
              </span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6ab4d8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6ab4d8" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="cravG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#c06060" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#c06060" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,160,74,0.12)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#a07848", fontFamily: "Georgia, serif" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 9, fill: "#a07848", fontFamily: "Georgia, serif" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(200,160,74,0.25)" }} />
                  <Area type="monotone" dataKey="mood"     stroke="#6ab4d8" strokeWidth={2} fill="url(#moodG)" dot={{ r: 3, fill: "#6ab4d8",  stroke: "#6ab4d8" }} />
                  <Area type="monotone" dataKey="cravings" stroke="#c06060" strokeWidth={2} fill="url(#cravG)"  dot={{ r: 3, fill: "#c06060",  stroke: "#c06060" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📜</div>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem" }}>The scroll is empty</p>
              <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.72rem", fontStyle: "italic", marginTop: 4 }}>Complete daily vigils to see your trends.</p>
            </div>
          )}
        </div>

        {/* ── Body Recovery timeline ── */}
        <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: "16px 16px", boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Stethoscope size={15} style={{ color: "#7aab6a" }} /> Body Recovery
            </h2>
            <div style={{ background: "rgba(122,171,106,0.18)", border: "1px solid rgba(122,171,106,0.35)", borderRadius: 99, padding: "3px 10px" }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#7aab6a", fontSize: "0.65rem" }}>
                {milestonesDone}/{MILESTONES.length} reached
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(200,160,74,0.15)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(200,160,74,0.2)", marginBottom: 16 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(milestonesDone / MILESTONES.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #7aab6a, #c8a060)", borderRadius: 99 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {MILESTONES.map((m, i) => {
              const done = hoursSober >= m.hours;
              const next = !done && (i === 0 || hoursSober >= MILESTONES[i-1].hours);
              return (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", opacity: !done && !next ? 0.38 : 1, transition: "opacity 0.2s" }}>
                  {/* Node */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#7aab6a" : next ? "rgba(106,180,216,0.18)" : "rgba(200,160,74,0.08)",
                    border: done ? "2px solid #7aab6a" : next ? "2px solid #6ab4d8" : "1.5px solid rgba(200,160,74,0.2)",
                    boxShadow: done ? "0 0 10px rgba(122,171,106,0.35)" : next ? "0 0 10px rgba(106,180,216,0.25)" : "none",
                  }}>
                    {done
                      ? <CheckCircle2 size={14} style={{ color: "#fff" }} />
                      : next
                        ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6ab4d8", animation: "pulse 2s ease-in-out infinite alternate" }} />
                        : <Circle size={10} style={{ color: "rgba(200,160,74,0.3)" }} />
                    }
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: done ? "#7aab6a" : next ? "#6ab4d8" : T.muted, fontSize: "0.8rem" }}>
                        {m.label}
                      </p>
                      {next && (
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", fontWeight: 900, color: "#6ab4d8", background: "rgba(106,180,216,0.15)", border: "1px solid rgba(106,180,216,0.3)", padding: "1px 6px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em" }}>Next</span>
                      )}
                      {done && (
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", fontWeight: 900, color: "#7aab6a", background: "rgba(122,171,106,0.15)", border: "1px solid rgba(122,171,106,0.3)", padding: "1px 6px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ Done</span>
                      )}
                    </div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{m.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Performance card — wooden arch ── */}
        <div style={{ background: "linear-gradient(135deg, rgba(90,52,24,0.9), rgba(40,22,10,0.95))", border: "2px solid rgba(200,160,74,0.4)", borderRadius: 20, padding: "18px 18px", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,220,130,0.1)" }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}>
            <Zap size={110} fill="currentColor" style={{ color: "#f0c840" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative", zIndex: 1 }}>
            <Zap size={15} style={{ color: "#f0c840" }} fill="#f0c840" />
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem" }}>Performance</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, position: "relative", zIndex: 1 }}>
            {[
              { label: "Check-in Rate", value: daysSober > 0 ? `${checkinRate}%` : "—", sub: "of days logged"              },
              { label: "Sober Days",    value: soberDays,                                sub: `out of ${checkins.length} logged` },
              { label: "XP Earned",     value: (userData?.xp ?? 0).toLocaleString(),     sub: `Level ${userData?.level ?? 1}` },
              { label: "Shields Left",  value: userData?.shieldCount ?? 0,               sub: "relapse shields"              },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: "rgba(200,160,74,0.12)", border: "1px solid rgba(200,160,74,0.22)", borderRadius: 14, padding: "10px 12px" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.15rem", lineHeight: 1.1 }}>{value}</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, fontStyle: "italic", marginTop: 2 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── XP level progress ── */}
        <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: "16px 16px", boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>Legend Progress</h2>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.72rem", background: "rgba(200,160,74,0.18)", border: "1px solid rgba(200,160,74,0.3)", borderRadius: 99, padding: "2px 10px" }}>
              Level {userData?.level ?? 1}
            </span>
          </div>
          <div style={{ height: 8, background: "rgba(200,160,74,0.15)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(200,160,74,0.2)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((userData?.xp ?? 0) % 1000) / 10)}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted }}>{(userData?.xp ?? 0) % 1000} XP</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted }}>1000 XP to Level {(userData?.level ?? 1) + 1}</span>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}