"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../src/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Star, Mountain, Wind, Waves, Home, Trophy,
  CheckCircle2, ChevronRight, Zap, X, AlertTriangle,
  Flame, ArrowRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  gold:      "#c8a060",
  goldLight: "#f7e0bb",
  muted:     "#a07848",
  text:      "#3d2410",
  parchment: "linear-gradient(180deg, #f5e8c8 0%, #ede0b4 100%)",
  cardBg:    "linear-gradient(135deg, rgba(90,52,24,0.72) 0%, rgba(58,32,16,0.82) 100%)",
  cardBorder:"rgba(200,160,74,0.28)",
  pageBg:    "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
  questBtn:  "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
  questShadow:"0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
  woodLight: "linear-gradient(180deg, #d4b483 0%, #b8955c 50%, #a07840 100%)",
  btnBorder: "#8a6030",
  btnShadow: "0 3px 0 #6a4820, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,230,160,0.4)",
};

// ─── Level definitions ────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: 1, name: "Awareness Island", description: "Understand your starting point",
    emoji: "🌊", accentColor: "#6ab4d8", glowColor: "rgba(106,180,216,0.3)",
    icon: Waves,
    req: { days: 0, streak: 0, xp: 0 }, xpReward: 200, moduleId: "awareness-island",
    challenge: {
      type: "reflection", title: "Why Do You Want Recovery?",
      description: "Be honest with yourself. Write the real reason you're here — for yourself, not anyone else.",
      placeholder: "The real reason I want to stop drinking is...", minLength: 20,
      tip: "💡 Research shows that writing your 'why' increases recovery success by 40%.",
    },
  },
  {
    id: 2, name: "Detox Valley", description: "The first 7 days of strength",
    emoji: "🌿", accentColor: "#7aab6a", glowColor: "rgba(122,171,106,0.3)",
    icon: Wind,
    req: { days: 3, streak: 2, xp: 100 }, xpReward: 500, moduleId: "detox-valley",
    challenge: {
      type: "breathing", title: "4-7-8 Breathing Exercise",
      description: "This technique calms your nervous system and reduces cravings within minutes. Complete 3 full cycles.",
      tip: "💡 Used by Navy SEALs and therapists alike to reset the body under stress.",
    },
  },
  {
    id: 3, name: "Trigger Control", description: "Mastering your environment",
    emoji: "⛰️", accentColor: "#c8845a", glowColor: "rgba(200,132,90,0.3)",
    icon: Mountain,
    req: { days: 7, streak: 5, xp: 500 }, xpReward: 800, moduleId: "trigger-control",
    challenge: {
      type: "trigger-map", title: "Map Your Top 3 Triggers",
      description: "Identify what tempts you most. Awareness is the first step to control.",
      triggers: ["Stress at work","Social events","Loneliness","Arguments","Boredom","Celebrations","Old friends","Bars/restaurants"],
      tip: "💡 People who identify their triggers are 3x more likely to avoid relapse.",
    },
  },
  {
    id: 4, name: "Social Strength", description: "New boundaries, new connections",
    emoji: "🤝", accentColor: "#9a78c0", glowColor: "rgba(154,120,192,0.3)",
    icon: Home,
    req: { days: 21, streak: 7, xp: 2000 }, xpReward: 1200, moduleId: "social-strength",
    challenge: {
      type: "script", title: "Write Your 'No' Script",
      description: "Someone offers you a drink. What do you say? Write your confident, kind, and firm response.",
      placeholder: "When someone offers me a drink I'll say...", minLength: 15,
      tip: "💡 Rehearsing refusal scripts out-loud makes them 5x more effective in real situations.",
    },
  },
  {
    id: 5, name: "Freedom Peak", description: "Living a life uncontrolled",
    emoji: "🏆", accentColor: "#c8a060", glowColor: "rgba(200,160,96,0.4)",
    icon: Trophy,
    req: { days: 60, streak: 14, xp: 5000 }, xpReward: 2000, moduleId: "freedom-peak",
    challenge: {
      type: "commitment", title: "Letter to Your Future Self",
      description: "You've made it. Write to the you that's 1 year sober — what do you want them to know?",
      placeholder: "Dear future me, one year from now...", minLength: 30,
      tip: "💡 This exercise is used in CBT to reinforce long-term identity change.",
    },
  },
];

function checkUnlock(level, userData) {
  const daysSober = userData.daysSober || 0;
  const streak    = userData.currentStreak || 0;
  const xp        = userData.xp || 0;
  const days_pct   = level.req.days   === 0 ? 1 : Math.min(1, daysSober / level.req.days);
  const streak_pct = level.req.streak === 0 ? 1 : Math.min(1, streak    / level.req.streak);
  const xp_pct     = level.req.xp     === 0 ? 1 : Math.min(1, xp        / level.req.xp);
  return { unlocked: days_pct >= 1 && streak_pct >= 1 && xp_pct >= 1, progress: { days: days_pct, streak: streak_pct, xp: xp_pct } };
}

function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width, y: -20,
    r: Math.random() * 8 + 4,
    color: ["#c8a060","#f7e0bb","#7aab6a","#6ab4d8","#9a78c0","#c8845a"][Math.floor(Math.random() * 6)],
    vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2, alpha: 1,
  }));
  let frame;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.alpha -= 0.012;
      if (p.alpha > 0) { alive = true; ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.globalAlpha = 1;
    if (alive) frame = requestAnimationFrame(draw);
    else { cancelAnimationFrame(frame); canvas.remove(); }
  };
  draw();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MapSkeleton() {
  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", padding: "32px 20px 120px" }}>
      <style>{`@keyframes shimmer{from{opacity:.4}to{opacity:.8}}`}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {[72, 80, 90, 90, 90].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 16, background: "rgba(200,160,74,0.1)", animation: "shimmer 1.6s ease-in-out infinite alternate", animationDelay: `${i*0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Breathing component ──────────────────────────────────────────────────────
function BreathingExercise({ onComplete }) {
  const PHASES = [
    { label: "Inhale", duration: 4, color: "#6ab4d8" },
    { label: "Hold",   duration: 7, color: "#9a78c0" },
    { label: "Exhale", duration: 8, color: "#7aab6a" },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [cycles,   setCycles]   = useState(0);
  const [running,  setRunning]  = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhaseIdx(pi => {
            const next = (pi + 1) % PHASES.length;
            if (next === 0) {
              setCycles(c => {
                const done = c + 1;
                if (done >= 3) { clearInterval(timerRef.current); setRunning(false); onComplete(); }
                return done;
              });
            }
            return next;
          });
          return PHASES[(phaseIdx + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, phaseIdx]);

  const phase = PHASES[phaseIdx];
  const scale = running ? (phaseIdx === 0 ? 0.7 + (1 - timeLeft / phase.duration) * 0.3 : phaseIdx === 2 ? 1 - (1 - timeLeft / phase.duration) * 0.3 : 1) : 0.5;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < cycles ? "#b8954a" : "rgba(200,160,74,0.2)", border: "2px solid #b8954a", transition: "all 0.5s" }} />
        ))}
      </div>
      <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ scale }} transition={{ duration: 0.6 }}
          style={{ position: "absolute", inset: 0, borderRadius: "50%", background: running ? `radial-gradient(circle, ${phase.color}44, transparent)` : "rgba(200,160,74,0.1)", opacity: 0.8 }} />
        <motion.div animate={{ scale: scale * 0.7 }} transition={{ duration: 0.6 }}
          style={{ width: 90, height: 90, borderRadius: "50%", background: running ? `linear-gradient(135deg, ${phase.color}, ${phase.color}88)` : "rgba(200,160,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: running ? `0 0 28px ${phase.color}44` : "none", border: `2px solid ${running ? phase.color : "#b8954a"}44` }}>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.5rem", color: running ? "#fff" : T.gold }}>
            {running ? timeLeft : "·"}
          </span>
        </motion.div>
      </div>
      <div style={{ textAlign: "center" }}>
        {running
          ? <><p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.1rem" }}>{phase.label}</p>
               <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.75rem", fontStyle: "italic" }}>Cycle {cycles + 1} of 3</p></>
          : <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.75rem", fontStyle: "italic" }}>4s inhale · 7s hold · 8s exhale</p>
        }
      </div>
      {!running && cycles < 3 && (
        <button onClick={() => { setRunning(true); setPhaseIdx(0); setTimeLeft(PHASES[0].duration); }}
          className="transition-all active:scale-[0.97]"
          style={{ background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "11px 24px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.08em", cursor: "pointer" }}>
          {cycles === 0 ? "Begin Breathing" : "Continue"}
        </button>
      )}
    </div>
  );
}

// ─── Challenge Modal ──────────────────────────────────────────────────────────
function ChallengeModal({ level, userData, onClose, onComplete }) {
  const [text,       setText]       = useState("");
  const [triggers,   setTriggers]   = useState([]);
  const [breathDone, setBreathDone] = useState(false);
  const ch = level.challenge;

  const toggleTrigger = (v) =>
    setTriggers(p => p.includes(v) ? p.filter(x => x !== v) : p.length < 3 ? [...p, v] : p);

  const ready = () => {
    if (ch.type === "breathing")   return breathDone;
    if (ch.type === "trigger-map") return triggers.length === 3;
    return text.trim().length >= (ch.minLength || 10);
  };

  const submit = () => {
    if (!ready()) {
      if (ch.type === "trigger-map") toast.error("Select exactly 3 triggers.");
      else if (ch.type === "breathing") toast.error("Complete the breathing exercise first.");
      else toast.error(`Write at least ${ch.minLength} characters.`);
      return;
    }
    onComplete(level);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50, padding: "0" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%", maxWidth: 520, maxHeight: "92vh",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(180deg, #3d2210 0%, #2d1a0c 100%)",
          border: "2px solid rgba(200,160,74,0.35)",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,130,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(200,160,74,0.3)" }} />
        </div>

        {/* Header — parchment banner */}
        <div style={{
          background: "linear-gradient(180deg, rgba(200,160,74,0.2), rgba(200,160,74,0.08))",
          borderBottom: "1px solid rgba(200,160,74,0.2)",
          padding: "16px 20px", position: "relative", flexShrink: 0,
        }}>
          <button onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 10, background: "rgba(200,160,74,0.15)", border: "1px solid rgba(200,160,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.gold }}>
            <X size={15} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: "2.2rem" }}>{level.emoji}</div>
            <div>
              <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>{level.name}</p>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.05rem", lineHeight: 1.3 }}>{ch.title}</h2>
            </div>
          </div>
          {/* XP badge */}
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(200,160,74,0.18)", border: "1px solid rgba(200,160,74,0.3)", borderRadius: 99, padding: "4px 10px" }}>
            <Star size={11} style={{ color: "#f0c840" }} fill="#f0c840" />
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.72rem" }}>+{level.xpReward} XP on completion</span>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.84rem", lineHeight: 1.7, fontStyle: "italic" }}>{ch.description}</p>

          {ch.type === "breathing" && <BreathingExercise onComplete={() => setBreathDone(true)} />}

          {ch.type === "trigger-map" && (
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                Select 3 triggers ({triggers.length}/3)
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ch.triggers.map(tr => {
                  const active = triggers.includes(tr);
                  return (
                    <button key={tr} onClick={() => toggleTrigger(tr)}
                      className="transition-all active:scale-95"
                      style={{
                        padding: "7px 14px", borderRadius: 99, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                        background: active ? "linear-gradient(180deg, #d4b483, #a07840)" : "rgba(200,160,74,0.1)",
                        border: `2px solid ${active ? "#8a6030" : "rgba(200,160,74,0.25)"}`,
                        color: active ? T.text : T.gold,
                        boxShadow: active ? T.btnShadow : "none",
                      }}>
                      {active ? "✓ " : ""}{tr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {["reflection","script","commitment"].includes(ch.type) && (
            <div>
              <div style={{ marginBottom: 4 }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Your Response</p>
              </div>
              <textarea
                rows={4} placeholder={ch.placeholder} value={text}
                onChange={e => setText(e.target.value)}
                style={{
                  width: "100%", background: T.parchment,
                  border: `2px solid ${text.length >= (ch.minLength || 10) ? "#7aab6a" : "#b8954a"}`,
                  borderRadius: 10, padding: "12px 14px",
                  fontSize: "0.85rem", color: T.text, fontFamily: "Georgia, serif",
                  outline: "none", resize: "none", boxSizing: "border-box",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
                  transition: "border-color 0.2s",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.68rem", color: T.muted }}>{text.length} chars</span>
                {text.length >= (ch.minLength || 10) && (
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.68rem", color: "#7aab6a", display: "flex", alignItems: "center", gap: 3 }}>
                    <CheckCircle2 size={11} /> Ready
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tip parchment */}
          {ch.tip && (
            <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 12, padding: "12px 14px", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)" }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: T.text, lineHeight: 1.6 }}>{ch.tip}</p>
            </div>
          )}

          {ch.type === "breathing" && breathDone && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "rgba(122,171,106,0.2)", border: "1.5px solid rgba(122,171,106,0.4)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#7aab6a", fontSize: "0.95rem" }}>🎉 3 Cycles Complete!</p>
              <p style={{ fontFamily: "Georgia, serif", color: "#7aab6a", fontSize: "0.78rem", fontStyle: "italic", opacity: 0.8 }}>Your nervous system thanks you, Seeker.</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px 24px", display: "flex", gap: 10, borderTop: "1px solid rgba(200,160,74,0.15)", flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 20, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.85rem", background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.2)", color: T.muted, cursor: "pointer" }}>
            Cancel
          </button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={submit}
            style={{
              flex: 1, padding: "12px", borderRadius: 20, fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "0.85rem",
              letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: ready() ? "pointer" : "not-allowed",
              background: ready() ? T.questBtn : "rgba(200,160,74,0.1)",
              border: ready() ? "2px solid #1478b0" : "1.5px solid rgba(200,160,74,0.2)",
              color: ready() ? "#fff" : T.muted,
              boxShadow: ready() ? T.questShadow : "none",
              transition: "all 0.2s",
            }}>
            Complete {ready() && <ArrowRight size={14} />}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RecoveryMapPage() {
  const activeRef = useRef(null);
  const [userData,        setUserData]        = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [dailyInput,      setDailyInput]      = useState("");
  const [dailyDone,       setDailyDone]       = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const daysSober = data.sobrietyDate
            ? Math.floor((Date.now() - new Date(data.sobrietyDate).getTime()) / 86400000) : 0;
          setUserData({ ...data, daysSober });
          const today = new Date().toISOString().slice(0, 10);
          setDailyDone(data.dailyQuestDate === today);
        }
      } catch (err) { console.error("Map load error:", err); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (userData && activeRef.current) {
      setTimeout(() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
  }, [userData]);

  if (loading || !userData) return <MapSkeleton />;

  const unlockedCount = LEVELS.filter(l => checkUnlock(l, userData).unlocked).length;
  const progressPct   = ((unlockedCount - 1) / (LEVELS.length - 1)) * 100;
  const nextLocked    = LEVELS.find(l => !checkUnlock(l, userData).unlocked);
  const xpToNext      = nextLocked ? Math.max(0, nextLocked.req.xp - (userData.xp || 0)) : 0;

  const updateUser = async (fields) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), fields);
    setUserData(prev => ({ ...prev, ...fields }));
  };

  const handleChallengeComplete = async (level) => {
    const alreadyDone = (userData.completedModules || []).includes(level.moduleId);
    const newXP       = (userData.xp || 0) + level.xpReward;
    const newModules  = [...new Set([...(userData.completedModules || []), level.moduleId])];
    await updateUser({ xp: newXP, completedModules: newModules });
    if (!alreadyDone) { fireConfetti(); toast.success(`🏆 ${level.name} Conquered! +${level.xpReward} XP`, { duration: 3000 }); }
    else toast.success(`+${level.xpReward} XP added!`, { duration: 2000 });
    setActiveChallenge(null);
  };

  const submitDaily = async () => {
    if (!dailyInput.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    await updateUser({ xp: (userData.xp || 0) + 50, currentStreak: (userData.currentStreak || 0) + 1, dailyQuestDate: today, dailyGratitude: dailyInput });
    setDailyDone(true);
    toast.success("Daily quest complete! +50 XP ⚔️");
  };

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", paddingBottom: 112 }}>
      <Toaster position="top-center" richColors />
      <style>{`@keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}`}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-45">
        {[{l:"6%",t:"10%"},{l:"88%",t:"16%"},{l:"15%",t:"80%"},{l:"82%",t:"72%"},{l:"50%",t:"5%"}].map((p,i)=>(
          <div key={i} className="absolute rounded-full"
            style={{ left: p.l, top: p.t, width: 5, height: 5, background: i%2===0 ? "rgba(255,230,140,0.7)" : "rgba(180,240,200,0.6)",
              animation: `pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay: `${i*0.35}s` }} />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="relative z-20" style={{ padding: "28px 20px 16px", borderBottom: "1px solid rgba(200,160,74,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: 480, margin: "0 auto" }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.3rem", lineHeight: 1.2 }}>
              Recovery <span style={{ color: "#7aab6a" }}>Map</span>
            </h1>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.72rem", fontStyle: "italic", marginTop: 2 }}>Your adventure to freedom</p>
            {/* Rune accent */}
            <p style={{ color: "rgba(200,160,74,0.25)", fontSize: "0.62rem", letterSpacing: "0.2em", fontFamily: "serif", marginTop: 4 }}>ᚠ ᚢ ᚦ ᚨ ᚱ</p>
          </div>
          {/* XP plaque */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(200,160,74,0.14)", border: "1.5px solid rgba(200,160,74,0.3)", borderRadius: 14, padding: "6px 12px" }}>
              <Star size={12} style={{ color: "#f0c840" }} fill="#f0c840" />
              <motion.span key={userData.xp} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.85rem" }}>
                {(userData.xp || 0).toLocaleString()} XP
              </motion.span>
            </div>
            {nextLocked && xpToNext > 0 && (
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: "#6ab4d8", textAlign: "right" }}>
                {xpToNext.toLocaleString()} XP → {nextLocked.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="relative z-10" style={{ padding: "14px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Days Sober", value: userData.daysSober,                  glyph: "🧘" },
            { label: "Streak",     value: `${userData.currentStreak || 0}d`,   glyph: "🔥" },
            { label: "Levels",     value: `${unlockedCount}/${LEVELS.length}`, glyph: "⭐" },
          ].map(s => (
            <div key={s.label} style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 14, padding: "12px 8px", textAlign: "center", boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)" }}>
              <p style={{ fontSize: "1.2rem", marginBottom: 3 }}>{s.glyph}</p>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1rem" }}>{s.value}</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="relative z-10" style={{ maxWidth: 380, margin: "0 auto", padding: "16px 20px", position: "relative" }}>
        {/* Vertical path */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 6, transform: "translateX(-50%)", background: "rgba(200,160,74,0.12)", borderRadius: 99, overflow: "hidden", pointerEvents: "none" }}>
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${progressPct}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            style={{ width: "100%", background: "linear-gradient(180deg, #c8a060, #f0c840, #c8a060)", borderRadius: 99 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {LEVELS.map((level, idx) => {
            const { unlocked, progress } = checkUnlock(level, userData);
            const isCompleted = (userData.completedModules || []).includes(level.moduleId);
            const isActive    = unlocked && !isCompleted;
            const isLeft      = idx % 2 === 0;

            return (
              <motion.div
                key={level.id}
                ref={isActive ? activeRef : null}
                initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, flexDirection: isLeft ? "row" : "row-reverse" }}
              >
                {/* Node */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {/* Pulse ring */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2.2 }}
                      style={{ position: "absolute", inset: 0, width: 76, height: 76, borderRadius: 22, background: level.glowColor }}
                    />
                  )}
                  {/* Main button */}
                  <motion.button
                    whileHover={unlocked ? { scale: 1.05 } : {}}
                    whileTap={unlocked ? { scale: 0.93 } : {}}
                    onClick={() => unlocked && setActiveChallenge(level)}
                    style={{
                      width: 76, height: 76, borderRadius: 22, position: "relative", zIndex: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: unlocked ? "2rem" : "1.3rem",
                      background: unlocked
                        ? `linear-gradient(135deg, rgba(200,160,74,0.22), rgba(200,160,74,0.06))`
                        : "rgba(200,160,74,0.06)",
                      border: `2px solid ${unlocked ? level.accentColor + "55" : "rgba(200,160,74,0.14)"}`,
                      boxShadow: unlocked ? `0 0 20px ${level.glowColor}, inset 0 1px 0 rgba(255,220,130,0.1)` : "none",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                  >
                    {unlocked ? level.emoji : <Lock size={20} style={{ color: "rgba(200,160,74,0.3)" }} />}
                  </motion.button>

                  {/* Completed badge */}
                  {isCompleted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ position: "absolute", top: -8, right: -8, background: "#7aab6a", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.3)", zIndex: 2 }}>
                      <CheckCircle2 size={13} style={{ color: "#fff" }} />
                    </motion.div>
                  )}

                  {/* ACTIVE pill */}
                  {isActive && (
                    <div style={{ position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%)", background: "rgba(200,160,74,0.2)", border: "1px solid rgba(200,160,74,0.4)", borderRadius: 99, padding: "2px 8px", whiteSpace: "nowrap", zIndex: 2 }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: T.gold, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>ACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, textAlign: isLeft ? "left" : "right" }}>
                  <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: unlocked ? T.goldLight : "rgba(200,160,74,0.35)", fontSize: "0.95rem", lineHeight: 1.3, marginBottom: 3 }}>
                    {level.name}
                  </h3>

                  {unlocked ? (
                    <>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.muted, lineHeight: 1.5, fontStyle: "italic", marginBottom: 8 }}>{level.description}</p>
                      <button onClick={() => setActiveChallenge(level)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "Georgia, serif", fontSize: "0.75rem", fontWeight: 900, color: isCompleted ? "#7aab6a" : level.accentColor, background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {isCompleted ? "✓ Revisit" : "Begin Quest"} <ChevronRight size={11} />
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[{ label: "Days", pct: progress.days }, { label: "Streak", pct: progress.streak }, { label: "XP", pct: progress.xp }].map(({ label, pct }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: isLeft ? "row" : "row-reverse" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "rgba(200,160,74,0.4)", fontWeight: 700, width: 32, flexShrink: 0 }}>{label}</span>
                          <div style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(200,160,74,0.12)", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.min(pct * 100, 100)}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.7, delay: 0.2 }}
                              style={{ height: "100%", background: "rgba(200,160,74,0.45)", borderRadius: 99 }}
                            />
                          </div>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "rgba(200,160,74,0.4)", flexShrink: 0 }}>{Math.round(pct * 100)}%</span>
                        </div>
                      ))}
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "rgba(200,160,74,0.3)", marginTop: 2, fontStyle: "italic" }}>
                        {level.req.days}d · {level.req.streak} streak · {level.req.xp.toLocaleString()} XP
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Daily Quest ── */}
      <div className="relative z-10" style={{ padding: "8px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(90,52,24,0.85), rgba(58,32,16,0.9))",
          border: "2px solid rgba(200,160,74,0.35)",
          borderRadius: 22, padding: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,220,130,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Glow accent */}
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.08, pointerEvents: "none" }}>
            <Zap size={100} style={{ color: "#f0c840" }} fill="#f0c840" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: "1rem" }}>🔥</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1rem" }}>Daily Gratitude</h2>
            <div style={{ marginLeft: "auto", background: "rgba(200,160,74,0.18)", border: "1px solid rgba(200,160,74,0.3)", borderRadius: 99, padding: "3px 10px" }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.7rem" }}>+50 XP</span>
            </div>
          </div>

          {dailyDone ? (
            <div style={{ marginTop: 12, background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.2)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "1.8rem", marginBottom: 4 }}>🎉</p>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem" }}>Quest complete for today!</p>
              <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.75rem", fontStyle: "italic", marginTop: 3 }}>Return at dawn to continue your streak, Seeker.</p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.78rem", fontStyle: "italic", marginBottom: 12 }}>Write 3 things you're grateful for today.</p>
              <textarea
                rows={3} placeholder="I'm grateful for..." value={dailyInput}
                onChange={e => setDailyInput(e.target.value)}
                style={{
                  width: "100%", background: T.parchment,
                  border: "2px solid #b8954a", borderRadius: 10, padding: "10px 14px",
                  fontSize: "0.85rem", color: T.text, fontFamily: "Georgia, serif",
                  outline: "none", resize: "none", boxSizing: "border-box",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
                }}
                onFocus={e => (e.target.style.borderColor = "#e8a030")}
                onBlur={e => (e.target.style.borderColor = "#b8954a")}
              />
              <button onClick={submitDaily}
                className="transition-all active:scale-[0.97]"
                style={{
                  marginTop: 10, width: "100%",
                  background: T.questBtn, border: "2px solid #1478b0",
                  borderRadius: 24, padding: "12px 20px",
                  boxShadow: T.questShadow,
                  color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif",
                  fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: "pointer",
                }}>
                ✦ Submit Gratitude
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Crisis button ── */}
      <div className="relative z-10" style={{ padding: "12px 20px 8px", maxWidth: 480, margin: "0 auto" }}>
        <a href="tel:9152987821"
          className="transition-all active:scale-[0.97]"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "14px 20px",
            background: "rgba(180,60,60,0.15)",
            border: "2px solid rgba(180,60,60,0.3)",
            borderRadius: 18, textDecoration: "none",
            fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.82rem", color: "#e08080",
          }}>
          <AlertTriangle size={15} />
          Need help right now? iCall · 9152987821
        </a>
      </div>

      {/* ── Challenge Modal ── */}
      <AnimatePresence>
        {activeChallenge && (
          <ChallengeModal
            level={activeChallenge}
            userData={userData}
            onClose={() => setActiveChallenge(null)}
            onComplete={handleChallengeComplete}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}