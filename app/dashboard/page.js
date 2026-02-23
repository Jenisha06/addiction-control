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

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  gold:      "#c8a060",
  goldLight: "#f7e0bb",
  muted:     "#a07848",
  text:      "#3d2410",
  link:      "#6ab4d8",
  parchment: "linear-gradient(180deg, #f5e8c8 0%, #ede0b4 100%)",
  cardBg:    "linear-gradient(135deg, rgba(90,52,24,0.72) 0%, rgba(58,32,16,0.82) 100%)",
  cardBorder:"rgba(200,160,74,0.28)",
  pageBg:    "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ style = {} }) {
  return (
    <div style={{
      background: "rgba(200,160,74,0.1)", borderRadius: 16,
      animation: "shimmer 1.6s ease-in-out infinite alternate",
      ...style,
    }} />
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", padding: "32px 20px 120px" }}>
      <style>{`@keyframes shimmer{from{opacity:.4}to{opacity:.9}}`}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton style={{ height: 72, width: "100%" }} />
        <Skeleton style={{ height: 180, width: "100%" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} style={{ height: 110 }} />)}
        </div>
        <Skeleton style={{ height: 200, width: "100%" }} />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DashboardCard({ title, icon, glyph, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left transition-all active:scale-[0.97]"
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(110,64,28,0.82) 0%, rgba(72,40,20,0.9) 100%)"
          : T.cardBg,
        border: `1.5px solid ${T.cardBorder}`,
        borderRadius: 18,
        padding: "18px 16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,220,130,0.06)",
        cursor: "pointer",
        transition: "background 0.2s",
      }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, marginBottom: 10,
        background: "rgba(200,160,74,0.14)",
        border: "1.5px solid rgba(200,160,74,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.3rem",
        boxShadow: "inset 0 1px 0 rgba(255,220,130,0.1)",
      }}>{glyph}</div>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>{title}</h3>
    </button>
  );
}

function StatMiniCard({ label, value, glyph, color }) {
  return (
    <div style={{
      background: T.cardBg, border: `1.5px solid ${T.cardBorder}`,
      borderRadius: 14, padding: "12px 8px", textAlign: "center",
      boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)",
    }}>
      <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{glyph}</div>
      <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem", lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function StatBubble({ glyph, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      background: "rgba(200,160,74,0.13)",
      border: "1.5px solid rgba(200,160,74,0.3)",
      borderRadius: 99, padding: "5px 12px",
      fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.78rem",
    }}>
      <span>{glyph}</span>
      <span>{value}</span>
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);
      if (!user) { router.push("/login"); return; }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists()) { router.push("/onboarding"); return; }
        setUserData(userSnap.data());
        const q = query(collection(db, "users", user.uid, "checkins"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        setCheckins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error("Dashboard load error:", err); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [router]);

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

  const levelProgress = useMemo(() => {
    const xp = userData?.xp ?? 0, level = userData?.level ?? 1;
    return Math.min(100, Math.max(0, ((xp - (level - 1) * 1000) / 1000) * 100));
  }, [userData]);

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

  const moneySaved = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    const days = Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000);
    return days * (userData?.drinkCostPerDay ?? 0);
  }, [userData]);

  const calories = useMemo(() => {
    if (!userData?.sobrietyDate) return 0;
    return Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000) * 150;
  }, [userData]);

  const chartData = useMemo(() =>
    checkins.slice(-7).map((c) => ({
      name:     c.date.toDate().toLocaleDateString("en-IN", { weekday: "short" }),
      mood:     c.mood     ?? 0,
      cravings: c.cravings ?? 0,
    })),
  [checkins]);

  if (!authReady || loading) return <DashboardSkeleton />;
  if (!userData) return null;

  const firstName   = (userData.name ?? "Seeker").split(" ")[0];
  const healthScore = Math.min(99, 60 + timeLeft.days);

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh" }}>
      {/* Global styles */}
      <style>{`
        @keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      `}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)",
      }} />

      {/* Floating sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        {[
          { l:"6%",  t:"10%", c:"rgba(255,230,140,0.8)" },
          { l:"88%", t:"16%", c:"rgba(180,240,200,0.7)" },
          { l:"14%", t:"78%", c:"rgba(255,230,140,0.6)" },
          { l:"83%", t:"70%", c:"rgba(180,240,200,0.7)" },
          { l:"50%", t:"4%",  c:"rgba(255,230,140,0.7)" },
          { l:"30%", t:"55%", c:"rgba(180,240,200,0.5)" },
        ].map((p, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ left: p.l, top: p.t, width: 5, height: 5, background: p.c,
              animation: `pulse ${2.2+i*0.4}s ease-in-out infinite alternate`,
              animationDelay: `${i*0.35}s` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-lg mx-auto px-5 pb-32 pt-8 space-y-4"
      >

        {/* ── HEADER ── */}
        <header className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Level badge — styled as a wooden shield */}
            <div className="relative shrink-0">
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "linear-gradient(135deg, #d4b483, #8a6030)",
                border: "2px solid #b8954a",
                boxShadow: "0 3px 0 #6a4820, 0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,230,160,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.3rem", color: T.text }}>
                  {userData.level ?? 1}
                </span>
              </div>
              {/* Trophy gem */}
              <div style={{
                position: "absolute", top: -6, right: -6,
                background: "linear-gradient(135deg, #ffd700, #c8a030)",
                borderRadius: "50%", width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                fontSize: "0.6rem",
              }}>🏆</div>
            </div>

            <div>
              <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.72rem", fontStyle: "italic" }}>{getGreeting()},</p>
              <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.05rem", lineHeight: 1.2 }}>
                {firstName} ⚔️
              </h1>
              {/* XP bar — styled as a wooden progress track */}
              <div style={{
                width: 140, height: 7, borderRadius: 99, overflow: "hidden", marginTop: 6,
                background: "rgba(200,160,74,0.18)",
                border: "1px solid rgba(200,160,74,0.25)",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #c8a060, #f0c840)" }}
                />
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, marginTop: 2 }}>
                {userData.xp ?? 0} / {(userData.level ?? 1) * 1000} XP
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <StatBubble glyph="🔥" value={`${streak}d`} />
            <StatBubble glyph="🛡️" value={userData.shieldCount ?? 0} />
          </div>
        </header>

        {/* ── SOBRIETY TIMER ── */}
        <section style={{
          borderRadius: 22, padding: "24px 20px", textAlign: "center", position: "relative", overflow: "hidden",
          background: "linear-gradient(160deg, #3d2210 0%, #5a3418 50%, #3d2210 100%)",
          border: "2px solid rgba(200,160,74,0.35)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,130,0.12)",
        }}>
          {/* Decorative arch ring */}
          <div className="absolute pointer-events-none" style={{
            top: -80, left: "50%", transform: "translateX(-50%)",
            width: 280, height: 280, borderRadius: "50%",
            border: "22px solid rgba(200,160,74,0.08)",
          }} />
          {/* Warm glow center */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(255,180,60,0.12), transparent 70%)",
          }} />

          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, position: "relative", zIndex: 1 }}>
            ⚔️ &nbsp;Alcohol Free For
          </p>

          {/* Rune accent */}
          <p style={{ color: "rgba(200,160,74,0.2)", fontSize: "0.65rem", letterSpacing: "0.3em", fontFamily: "serif", marginBottom: 12, position: "relative", zIndex: 1 }}>
            ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚺ
          </p>

          {/* Time blocks */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20, position: "relative", zIndex: 1 }}>
            {[
              { v: timeLeft.days,  l: "Days"  },
              { v: timeLeft.hours, l: "Hours" },
              { v: timeLeft.mins,  l: "Mins"  },
              { v: timeLeft.secs,  l: "Secs"  },
            ].map(({ v, l }) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  background: "linear-gradient(180deg, rgba(200,160,74,0.2), rgba(200,160,74,0.08))",
                  border: "1.5px solid rgba(200,160,74,0.3)",
                  borderRadius: 12, width: 58, height: 58,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2), 0 2px 0 rgba(200,160,74,0.15)",
                  marginBottom: 5,
                }}>
                  <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.5rem", color: T.goldLight, fontVariantNumeric: "tabular-nums" }}>
                    {String(v).padStart(2, "0")}
                  </span>
                </div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</span>
              </div>
            ))}
          </div>

          {!userData.sobrietyDate && (
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.muted, marginBottom: 12, fontStyle: "italic", position: "relative", zIndex: 1 }}>
              Set your sobriety date in Profile to begin your quest.
            </p>
          )}

          {/* Check-in button */}
          <button
            onClick={() => router.push("/checkin")}
            className="transition-all active:scale-[0.97] active:translate-y-0.5"
            style={{
              position: "relative", zIndex: 1,
              background: "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
              border: "2px solid #1478b0",
              borderRadius: 24, padding: "12px 28px",
              boxShadow: "0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
              color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif",
              fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase",
              textShadow: "0 1px 3px rgba(0,80,160,0.5)",
              display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
            }}
          >
            ✦ Daily Check-In
          </button>
        </section>

        {/* ── ACTION GRID ── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "Recovery Map",  glyph: "🗺️", path: "/map"       },
            { title: "CBT Exercises", glyph: "🧠", path: "/cbt"       },
            { title: "Community",     glyph: "🏰", path: "/community" },
            { title: "Craving Help",  glyph: "⚡", path: "/emergency" },
          ].map(({ title, glyph, path }) => (
            <DashboardCard key={path} title={title} glyph={glyph} onClick={() => router.push(path)} />
          ))}
        </section>

        {/* ── INSIGHTS ── */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1rem" }}>
              Your Insights
            </h2>
            <button onClick={() => router.push("/insights")}
              style={{ fontFamily: "Georgia, serif", color: T.link, fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Stat mini-cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <StatMiniCard label="Saved"    value={moneySaved > 0 ? `₹${moneySaved.toLocaleString("en-IN")}` : "₹0"} glyph="💰" />
            <StatMiniCard label="Calories" value={calories > 999 ? `${(calories / 1000).toFixed(1)}k` : String(calories)} glyph="⚡" />
            <StatMiniCard label="Health"   value={`${healthScore}%`} glyph="❤️" />
          </div>

          {/* Chart card — parchment style */}
          <div style={{
            background: T.parchment,
            border: "2px solid #b8954a",
            borderRadius: 18, padding: "18px",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1), 0 2px 0 rgba(255,220,130,0.2)",
          }}>
            {chartData.length > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Mood & Cravings
                  </p>
                  <div style={{ display: "flex", gap: 12, fontSize: "0.65rem", fontFamily: "Georgia, serif", color: "#6b4c2e" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8a6030", display: "inline-block" }} />Mood
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c07050", display: "inline-block" }} />Cravings
                    </span>
                  </div>
                </div>
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#8a6030" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#8a6030" stopOpacity={0}    />
                        </linearGradient>
                        <linearGradient id="cravGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#c07050" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#c07050" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,96,48,0.15)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#8a6030", fontFamily: "Georgia, serif" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1.5px solid #b8954a", background: "#f5e8c8", fontSize: 11, fontFamily: "Georgia, serif", color: T.text }}
                        cursor={{ stroke: "rgba(139,96,48,0.2)" }}
                      />
                      <Area type="monotone" dataKey="mood"     stroke="#8a6030" strokeWidth={2} fill="url(#moodGrad)" dot={{ r: 3, fill: "#8a6030" }} />
                      <Area type="monotone" dataKey="cravings" stroke="#c07050" strokeWidth={2} fill="url(#cravGrad)"  dot={{ r: 3, fill: "#c07050" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>📜</div>
                <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.9rem", marginBottom: 6 }}>The scroll is empty</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#6b4c2e", lineHeight: 1.6, marginBottom: 14, maxWidth: 200, fontStyle: "italic" }}>
                  Complete your first check-in to begin writing your legend.
                </p>
                <button onClick={() => router.push("/checkin")}
                  className="transition-all active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
                    border: "2px solid #1478b0", borderRadius: 24, padding: "10px 20px",
                    boxShadow: "0 3px 0 #0e5c8a, 0 6px 16px rgba(30,140,210,0.35)",
                    color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif",
                    fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: "pointer",
                  }}>
                  Begin Check-In
                </button>
              </div>
            )}
          </div>
        </section>

      </motion.div>

      <BottomNav />
    </div>
  );
}