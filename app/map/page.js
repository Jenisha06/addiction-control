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

// ─── Level definitions ────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: 1,
    name: "Awareness Island",
    description: "Understand your starting point",
    theme: { bg: "from-sky-400 to-blue-500", text: "text-sky-600", light: "bg-sky-50", border: "border-sky-200" },
    icon: Waves, emoji: "🌊",
    req: { days: 0, streak: 0, xp: 0 },
    xpReward: 200,
    moduleId: "awareness-island",
    challenge: {
      type: "reflection",
      title: "Why Do You Want Recovery?",
      description: "Be honest with yourself. Write the real reason you're here — for yourself, not anyone else.",
      placeholder: "The real reason I want to stop drinking is...",
      minLength: 20,
      tip: "💡 Research shows that writing your 'why' increases recovery success by 40%.",
    },
  },
  {
    id: 2,
    name: "Detox Valley",
    description: "The first 7 days of strength",
    theme: { bg: "from-emerald-400 to-green-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    icon: Wind, emoji: "🌿",
    req: { days: 3, streak: 2, xp: 100 },
    xpReward: 500,
    moduleId: "detox-valley",
    challenge: {
      type: "breathing",
      title: "4-7-8 Breathing Exercise",
      description: "This technique calms your nervous system and reduces cravings within minutes. Complete 3 full cycles.",
      tip: "💡 Used by Navy SEALs and therapists alike to reset the body under stress.",
    },
  },
  {
    id: 3,
    name: "Trigger Control",
    description: "Mastering your environment",
    theme: { bg: "from-orange-400 to-red-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-200" },
    icon: Mountain, emoji: "⛰️",
    req: { days: 7, streak: 5, xp: 500 },
    xpReward: 800,
    moduleId: "trigger-control",
    challenge: {
      type: "trigger-map",
      title: "Map Your Top 3 Triggers",
      description: "Identify what tempts you most. Awareness is the first step to control.",
      triggers: ["Stress at work", "Social events", "Loneliness", "Arguments", "Boredom", "Celebrations", "Old friends", "Bars/restaurants"],
      tip: "💡 People who identify their triggers are 3x more likely to avoid relapse.",
    },
  },
  {
    id: 4,
    name: "Social Strength",
    description: "New boundaries, new connections",
    theme: { bg: "from-purple-400 to-violet-500", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-200" },
    icon: Home, emoji: "🤝",
    req: { days: 21, streak: 7, xp: 2000 },
    xpReward: 1200,
    moduleId: "social-strength",
    challenge: {
      type: "script",
      title: "Write Your 'No' Script",
      description: "Someone offers you a drink. What do you say? Write your confident, kind, and firm response.",
      placeholder: "When someone offers me a drink I'll say...",
      minLength: 15,
      tip: "💡 Rehearsing refusal scripts out-loud makes them 5x more effective in real situations.",
    },
  },
  {
    id: 5,
    name: "Freedom Peak",
    description: "Living a life uncontrolled",
    theme: { bg: "from-yellow-400 to-amber-500", text: "text-yellow-600", light: "bg-yellow-50", border: "border-yellow-200" },
    icon: Trophy, emoji: "🏆",
    req: { days: 60, streak: 14, xp: 5000 },
    xpReward: 2000,
    moduleId: "freedom-peak",
    challenge: {
      type: "commitment",
      title: "Letter to Your Future Self",
      description: "You've made it. Write to the you that's 1 year sober — what do you want them to know?",
      placeholder: "Dear future me, one year from now...",
      minLength: 30,
      tip: "💡 This exercise is used in CBT to reinforce long-term identity change.",
    },
  },
];

// ─── Progression check (replaces missing utils file) ──────────────────────────
function checkUnlock(level, userData) {
  const daysSober = userData.daysSober || 0;
  const streak    = userData.currentStreak || 0;
  const xp        = userData.xp || 0;

  const days_pct   = level.req.days   === 0 ? 1 : Math.min(1, daysSober / level.req.days);
  const streak_pct = level.req.streak === 0 ? 1 : Math.min(1, streak    / level.req.streak);
  const xp_pct     = level.req.xp     === 0 ? 1 : Math.min(1, xp        / level.req.xp);

  return {
    unlocked: days_pct >= 1 && streak_pct >= 1 && xp_pct >= 1,
    progress: { days: days_pct, streak: streak_pct, xp: xp_pct },
  };
}

// ─── Confetti (no external lib needed) ───────────────────────────────────────
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 8 + 4,
    color: ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899"][Math.floor(Math.random() * 6)],
    vx: (Math.random() - 0.5) * 6,
    vy: Math.random() * 4 + 2,
    alpha: 1,
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-5 space-y-4">
        <div className="animate-pulse bg-slate-100 rounded-2xl h-16" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-20" />)}
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-24" />)}
      </div>
    </div>
  );
}

// ─── Breathing Component ──────────────────────────────────────────────────────
function BreathingExercise({ onComplete }) {
  const PHASES = [
    { label: "Inhale",  duration: 4, color: "from-sky-400 to-blue-500" },
    { label: "Hold",    duration: 7, color: "from-violet-400 to-purple-500" },
    { label: "Exhale",  duration: 8, color: "from-emerald-400 to-teal-500" },
  ];
  const [phaseIdx, setPhaseIdx]       = useState(0);
  const [timeLeft, setTimeLeft]       = useState(PHASES[0].duration);
  const [cycles, setCycles]           = useState(0);
  const [running, setRunning]         = useState(false);
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
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="flex gap-2">
        {[0,1,2].map(i => <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i < cycles ? "bg-emerald-500 scale-110" : "bg-slate-200"}`} />)}
      </div>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <motion.div animate={{ scale }} transition={{ duration: 0.6 }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${running ? phase.color : "from-slate-200 to-slate-300"} opacity-20`} />
        <motion.div animate={{ scale: scale * 0.7 }} transition={{ duration: 0.6 }}
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${running ? phase.color : "from-slate-200 to-slate-300"} flex items-center justify-center shadow-xl`}>
          <span className="text-white font-black text-2xl">{running ? timeLeft : "·"}</span>
        </motion.div>
      </div>
      <div className="text-center">
        {running
          ? <><p className="text-xl font-black text-slate-800">{phase.label}</p><p className="text-slate-400 text-sm">Cycle {cycles + 1} of 3</p></>
          : <p className="text-slate-500 text-sm">4s inhale · 7s hold · 8s exhale</p>}
      </div>
      {!running && cycles < 3 && (
        <button onClick={() => { setRunning(true); setPhaseIdx(0); setTimeLeft(PHASES[0].duration); }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-7 py-3 rounded-2xl font-black shadow-lg active:scale-95 transition-all">
          {cycles === 0 ? "Begin Breathing" : "Continue"}
        </button>
      )}
    </div>
  );
}

// ─── Challenge Modal ──────────────────────────────────────────────────────────
function ChallengeModal({ level, userData, onClose, onComplete }) {
  const [text, setText]                 = useState("");
  const [triggers, setTriggers]         = useState([]);
  const [breathDone, setBreathDone]     = useState(false);
  const ch = level.challenge;
  const t  = level.theme;

  const toggleTrigger = (v) =>
    setTriggers(p => p.includes(v) ? p.filter(x => x !== v) : p.length < 3 ? [...p, v] : p);

  const ready = () => {
    if (ch.type === "breathing")   return breathDone;
    if (ch.type === "trigger-map") return triggers.length === 3;
    return text.trim().length >= (ch.minLength || 10);
  };

  const submit = () => {
    if (!ready()) {
      if      (ch.type === "trigger-map") toast.error("Select exactly 3 triggers.");
      else if (ch.type === "breathing")   toast.error("Complete the breathing exercise first.");
      else toast.error(`Write at least ${ch.minLength} characters.`);
      return;
    }
    onComplete(level);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className={`bg-gradient-to-r ${t.bg} p-5 text-white relative shrink-0`}>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{level.emoji}</span>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{level.name}</p>
              <h2 className="text-lg font-black leading-tight">{ch.title}</h2>
            </div>
          </div>
          <div className="mt-3 bg-white/20 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
            <Star size={12} fill="white" />
            <span className="text-xs font-black">+{level.xpReward} XP on completion</span>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <p className="text-slate-600 text-sm font-medium leading-relaxed">{ch.description}</p>

          {ch.type === "breathing" && <BreathingExercise onComplete={() => setBreathDone(true)} />}

          {ch.type === "trigger-map" && (
            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Select 3 triggers ({triggers.length}/3)</p>
              <div className="flex flex-wrap gap-2">
                {ch.triggers.map(tr => {
                  const active = triggers.includes(tr);
                  return (
                    <button key={tr} onClick={() => toggleTrigger(tr)}
                      className={`px-3 py-1.5 rounded-full font-bold text-sm border-2 transition-all active:scale-95 ${
                        active ? "bg-orange-500 border-orange-500 text-white shadow-md" : "bg-white border-slate-200 text-slate-600"
                      }`}>
                      {active ? "✓ " : ""}{tr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {["reflection","script","commitment"].includes(ch.type) && (
            <div className="space-y-1.5">
              <textarea
                rows={4}
                placeholder={ch.placeholder}
                value={text}
                onChange={e => setText(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 text-sm font-medium text-slate-800 resize-none focus:outline-none transition-colors ${
                  text.length >= (ch.minLength || 10) ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-slate-50"
                }`}
              />
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{text.length} chars</span>
                {text.length >= (ch.minLength || 10) && <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={11} />Ready</span>}
              </div>
            </div>
          )}

          {ch.tip && <div className={`${t.light} ${t.border} border rounded-2xl p-3`}><p className={`text-xs font-medium ${t.text}`}>{ch.tip}</p></div>}

          {ch.type === "breathing" && breathDone && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-200">
              <p className="text-emerald-700 font-black">🎉 3 Cycles Complete!</p>
              <p className="text-emerald-600 text-sm">Your nervous system thanks you.</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 flex gap-3 shrink-0 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 active:scale-95 transition-transform">
            Cancel
          </button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={submit}
            className={`flex-1 py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all ${
              ready() ? `bg-gradient-to-r ${t.bg} shadow-lg` : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}>
            Complete {ready() && <ArrowRight size={15} />}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RecoveryMapPage() {
  const activeRef = useRef(null);
  const [userData,       setUserData]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [dailyInput,     setDailyInput]     = useState("");
  const [dailyDone,      setDailyDone]      = useState(false);

  // ── Auth + load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          // Calculate daysSober from sobrietyDate
          const daysSober = data.sobrietyDate
            ? Math.floor((Date.now() - new Date(data.sobrietyDate).getTime()) / 86400000)
            : 0;
          setUserData({ ...data, daysSober });
          const today = new Date().toISOString().slice(0, 10);
          setDailyDone(data.dailyQuestDate === today);
        }
      } catch (err) {
        console.error("Map load error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Scroll to first active level
  useEffect(() => {
    if (userData && activeRef.current) {
      setTimeout(() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
  }, [userData]);

  if (loading) return <MapSkeleton />;
  if (!userData) return <MapSkeleton />;

  // ── Progress ──────────────────────────────────────────────────────────────
  const unlockedCount = LEVELS.filter(l => checkUnlock(l, userData).unlocked).length;
  const progressPct   = ((unlockedCount - 1) / (LEVELS.length - 1)) * 100;
  const nextLocked    = LEVELS.find(l => !checkUnlock(l, userData).unlocked);
  const xpToNext      = nextLocked ? Math.max(0, nextLocked.req.xp - (userData.xp || 0)) : 0;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateUser = async (fields) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), fields);
    setUserData(prev => ({ ...prev, ...fields }));
  };

  const handleChallengeComplete = async (level) => {
    const alreadyDone = (userData.completedModules || []).includes(level.moduleId);
    const newXP = (userData.xp || 0) + level.xpReward;
    const newModules = [...new Set([...(userData.completedModules || []), level.moduleId])];

    await updateUser({ xp: newXP, completedModules: newModules });

    if (!alreadyDone) {
      fireConfetti();
      toast.success(`🏆 ${level.name} Conquered! +${level.xpReward} XP`, { duration: 3000 });
    } else {
      toast.success(`+${level.xpReward} XP added!`, { duration: 2000 });
    }
    setActiveChallenge(null);
  };

  const submitDaily = async () => {
    if (!dailyInput.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    await updateUser({
      xp: (userData.xp || 0) + 50,
      currentStreak: (userData.currentStreak || 0) + 1,
      dailyQuestDate: today,
      dailyGratitude: dailyInput,
    });
    setDailyDone(true);
    toast.success("Daily quest complete! +50 XP 🌟");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-none">
            Recovery <span className="text-blue-600">Map</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Your adventure to freedom</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Star size={13} className="text-yellow-500" fill="currentColor" />
            <motion.span key={userData.xp} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
              className="font-black text-slate-800 text-sm">
              {(userData.xp || 0).toLocaleString()} XP
            </motion.span>
          </div>
          {nextLocked && xpToNext > 0 && (
            <p className="text-[10px] text-blue-500 font-bold">{xpToNext.toLocaleString()} XP to {nextLocked.name}</p>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {[
          { label: "Days Sober", value: userData.daysSober,        icon: "🧘", color: "text-blue-600"   },
          { label: "Streak",     value: `${userData.currentStreak || 0}d`, icon: "🔥", color: "text-orange-500" },
          { label: "Levels",     value: `${unlockedCount}/${LEVELS.length}`, icon: "⭐", color: "text-yellow-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
            <p className="text-xl mb-0.5">{s.icon}</p>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Map ── */}
      <div className="relative max-w-sm mx-auto px-5 py-6 space-y-14">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-slate-200 -translate-x-1/2 rounded-full overflow-hidden pointer-events-none">
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${progressPct}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            className="w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"
          />
        </div>

        {LEVELS.map((level, idx) => {
          const { unlocked, progress } = checkUnlock(level, userData);
          const isCompleted = (userData.completedModules || []).includes(level.moduleId);
          const isActive    = unlocked && !isCompleted;
          const Icon        = level.icon;
          const isLeft      = idx % 2 === 0;

          return (
            <motion.div
              key={level.id}
              ref={isActive ? activeRef : null}
              initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className={`relative flex items-center gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
            >
              {/* Node */}
              <div className="relative shrink-0">
                {/* Pulse ring */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className={`absolute inset-0 w-20 h-20 rounded-[28px] bg-gradient-to-br ${level.theme.bg}`}
                  />
                )}
                <motion.button
                  whileHover={unlocked ? { scale: 1.05 } : {}}
                  whileTap={unlocked ? { scale: 0.93 } : {}}
                  onClick={() => unlocked && setActiveChallenge(level)}
                  className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg relative z-10 transition-all ${
                    unlocked ? `bg-gradient-to-br ${level.theme.bg} text-white` : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {unlocked ? <Icon size={28} strokeWidth={2} /> : <Lock size={22} />}
                </motion.button>

                {/* Completed badge */}
                {isCompleted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-emerald-500 p-1 rounded-full shadow-md z-20">
                    <CheckCircle2 size={13} className="text-white" />
                  </motion.div>
                )}

                {/* Active pill */}
                {isActive && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow z-20 whitespace-nowrap">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={`flex-1 min-w-0 ${isLeft ? "text-left" : "text-right"}`}>
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-lg">{level.emoji}</span>
                  <h3 className={`font-black text-base leading-tight ${unlocked ? "text-slate-900" : "text-slate-400"}`}>
                    {level.name}
                  </h3>
                </div>

                {unlocked ? (
                  <>
                    <p className="text-xs text-slate-500 font-medium mb-2 leading-snug">{level.description}</p>
                    <button
                      onClick={() => setActiveChallenge(level)}
                      className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider ${
                        isCompleted ? "text-emerald-600" : level.theme.text
                      }`}
                    >
                      {isCompleted ? "✓ Revisit" : "Start Challenge"} <ChevronRight size={11} />
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    {[
                      { label: "Days",   pct: progress.days   },
                      { label: "Streak", pct: progress.streak },
                      { label: "XP",     pct: progress.xp     },
                    ].map(({ label, pct }) => (
                      <div key={label} className={`flex items-center gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
                        <span className="text-[10px] text-slate-400 font-bold w-9 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(pct * 100, 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="h-full bg-slate-400 rounded-full"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {Math.round(pct * 100)}%
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {level.req.days}d sober · {level.req.streak} streak · {level.req.xp.toLocaleString()} XP needed
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Daily Quest ── */}
      <div className="px-5 mt-2">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-3xl text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none"><Zap size={90} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={17} className="text-yellow-300" />
              <h2 className="text-base font-black">Daily Gratitude</h2>
              <span className="ml-auto bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">+50 XP</span>
            </div>
            {dailyDone ? (
              <div className="mt-3 bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-black text-sm">Done for today!</p>
                <p className="text-white/70 text-xs">Come back tomorrow to keep your streak alive.</p>
              </div>
            ) : (
              <>
                <p className="text-white/80 text-xs font-medium mb-3">Write 3 things you're grateful for today.</p>
                <textarea
                  rows={3}
                  placeholder="I'm grateful for..."
                  value={dailyInput}
                  onChange={e => setDailyInput(e.target.value)}
                  className="w-full p-3 rounded-xl text-slate-800 font-medium text-sm resize-none focus:outline-none"
                />
                <button
                  onClick={submitDaily}
                  className="mt-3 w-full bg-white text-blue-600 py-3 rounded-xl font-black text-sm active:scale-95 transition-transform shadow-md"
                >
                  Submit Gratitude ✨
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Crisis Button ── */}
      <div className="px-5 mt-4 pb-4">
        <a href="tel:9152987821"
          className="w-full border-2 border-rose-200 bg-rose-50 text-rose-600 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <AlertTriangle size={16} />
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