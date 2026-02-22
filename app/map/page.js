"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../src/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { checkLevelUnlock } from "../utils/progression";
import {
  Lock, Star, Mountain, Wind, Waves, Home, Trophy,
  CheckCircle2, ChevronRight, Zap, X, Heart, AlertTriangle,
  Users, Flame, Smile, ArrowRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import confetti from "canvas-confetti";

// ─── Level Definitions ──────────────────────────────────────────────────────

const levels = [
  {
    id: 1,
    name: "Awareness Island",
    description: "Understand your starting point",
    theme: { bg: "from-sky-400 to-blue-500", ring: "ring-sky-300", badge: "bg-sky-500", text: "text-sky-600", light: "bg-sky-50" },
    icon: Waves,
    emoji: "🌊",
    requirements: { minDaysSober: 0, minStreak: 0, minXP: 0, requiredModules: [] },
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
    theme: { bg: "from-emerald-400 to-green-500", ring: "ring-emerald-300", badge: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
    icon: Wind,
    emoji: "🌿",
    requirements: { minDaysSober: 3, minStreak: 2, minXP: 1000, requiredModules: ["intro-reflection"] },
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
    theme: { bg: "from-orange-400 to-red-500", ring: "ring-orange-300", badge: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
    icon: Mountain,
    emoji: "⛰️",
    requirements: { minDaysSober: 7, minStreak: 5, minXP: 2500, requiredModules: ["identify-triggers", "urge-surfing"] },
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
    theme: { bg: "from-purple-400 to-violet-500", ring: "ring-purple-300", badge: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
    icon: Home,
    emoji: "🤝",
    requirements: { minDaysSober: 21, minStreak: 7, minXP: 5000, requiredModules: ["boundary-script", "social-planning"] },
    xpReward: 1200,
    moduleId: "social-strength",
    challenge: {
      type: "script",
      title: "Write Your 'No' Script",
      description: "Someone offers you a drink. What do you say? Write your go-to response — confident, kind, and firm.",
      placeholder: "When someone offers me a drink I'll say...",
      minLength: 15,
      tip: "💡 Rehearsing refusal scripts out-loud makes them 5x more effective in real situations.",
    },
  },
  {
    id: 5,
    name: "Freedom Peak",
    description: "Living a life uncontrolled",
    theme: { bg: "from-yellow-400 to-amber-500", ring: "ring-yellow-300", badge: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-50" },
    icon: Trophy,
    emoji: "🏆",
    requirements: { minDaysSober: 60, minStreak: 14, minXP: 8000, requiredModules: [] },
    xpReward: 2000,
    moduleId: "freedom-peak",
    challenge: {
      type: "commitment",
      title: "Write a Letter to Your Future Self",
      description: "You've made it. Write to the you that's 1 year sober — what do you want them to know?",
      placeholder: "Dear future me, one year from now...",
      minLength: 30,
      tip: "💡 This exercise is used in Cognitive Behavioral Therapy to reinforce long-term identity change.",
    },
  },
];

// ─── Breathing Component ─────────────────────────────────────────────────────

function BreathingExercise({ onComplete }) {
  const phases = [
    { label: "Inhale", duration: 4, color: "from-sky-400 to-blue-500" },
    { label: "Hold", duration: 7, color: "from-violet-400 to-purple-500" },
    { label: "Exhale", duration: 8, color: "from-emerald-400 to-teal-500" },
  ];
  const [cycle, setCycle] = useState(0);      // 0,1,2 = phase; 3 = done cycle
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const start = () => { setRunning(true); setPhaseIndex(0); setTimeLeft(phases[0].duration); };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const nextPhase = (phaseIndex + 1) % phases.length;
          if (nextPhase === 0) {
            const done = completedCycles + 1;
            setCompletedCycles(done);
            if (done >= 3) { clearInterval(timerRef.current); setRunning(false); onComplete(); return 0; }
          }
          setPhaseIndex(nextPhase);
          return phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, phaseIndex, completedCycles]);

  const phase = phases[phaseIndex];
  const progress = running ? 1 - (timeLeft / phase.duration) : 0;
  const circleSize = running ? (phaseIndex === 0 ? 0.7 + progress * 0.3 : phaseIndex === 2 ? 1 - progress * 0.3 : 1) : 0.5;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < completedCycles ? "bg-emerald-500" : "bg-slate-200"}`} />
        ))}
      </div>

      <div className="relative w-40 h-40 flex items-center justify-center">
        <motion.div
          animate={{ scale: circleSize, opacity: running ? 1 : 0.4 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${running ? phase.color : "from-slate-200 to-slate-300"} opacity-20`}
        />
        <motion.div
          animate={{ scale: circleSize * 0.7 }}
          transition={{ duration: 0.5 }}
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${running ? phase.color : "from-slate-200 to-slate-300"} flex items-center justify-center shadow-lg`}
        >
          <span className="text-white font-black text-2xl">{running ? timeLeft : "?"}</span>
        </motion.div>
      </div>

      <div className="text-center">
        {running ? (
          <>
            <p className="text-2xl font-black text-slate-800">{phase.label}</p>
            <p className="text-slate-400 text-sm">Cycle {completedCycles + 1} of 3</p>
          </>
        ) : (
          <p className="text-slate-500 text-sm">4 sec inhale · 7 sec hold · 8 sec exhale</p>
        )}
      </div>

      {!running && completedCycles < 3 && (
        <button
          onClick={start}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          {completedCycles === 0 ? "Begin Breathing" : "Next Cycle"}
        </button>
      )}
    </div>
  );
}

// ─── Trigger Map Component ───────────────────────────────────────────────────

function TriggerMap({ triggers, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {triggers.map(t => {
        const active = selected.includes(t);
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 border-2 ${
              active
                ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"
                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
            }`}
          >
            {active ? "✓ " : ""}{t}
          </button>
        );
      })}
    </div>
  );
}

// ─── Challenge Modal ─────────────────────────────────────────────────────────

function ChallengeModal({ level, userData, onClose, onComplete }) {
  const [textInput, setTextInput] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [breathingDone, setBreathingDone] = useState(false);
  const alreadyCompleted = (userData?.completedModules || []).includes(level.moduleId);
  const ch = level.challenge;
  const theme = level.theme;

  const toggleTrigger = (t) => {
    setSelectedTriggers(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 3 ? [...prev, t] : prev
    );
  };

  const canComplete = () => {
    if (ch.type === "breathing") return breathingDone;
    if (ch.type === "trigger-map") return selectedTriggers.length === 3;
    if (ch.type === "reflection" || ch.type === "script" || ch.type === "commitment")
      return textInput.trim().length >= (ch.minLength || 10);
    return false;
  };

  const handleComplete = () => {
    if (!canComplete()) {
      if (ch.type === "trigger-map") toast.error("Select exactly 3 triggers.");
      else if (ch.type === "breathing") toast.error("Complete the breathing exercise first.");
      else toast.error(`Write at least ${ch.minLength} characters.`);
      return;
    }
    onComplete(level);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${theme.bg} p-6 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{level.emoji}</span>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{level.name}</p>
                <h2 className="text-xl font-black leading-tight">{ch.title}</h2>
              </div>
            </div>
            <div className="mt-3 bg-white/20 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
              <Star size={12} fill="white" />
              <span className="text-xs font-black">+{level.xpReward} XP on completion</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <p className="text-slate-600 font-medium leading-relaxed">{ch.description}</p>

            {/* Breathing */}
            {ch.type === "breathing" && (
              <BreathingExercise onComplete={() => setBreathingDone(true)} />
            )}

            {/* Trigger Map */}
            {ch.type === "trigger-map" && (
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Select exactly 3 triggers ({selectedTriggers.length}/3)
                </p>
                <TriggerMap triggers={ch.triggers} selected={selectedTriggers} onToggle={toggleTrigger} />
              </div>
            )}

            {/* Text Input */}
            {(ch.type === "reflection" || ch.type === "script" || ch.type === "commitment") && (
              <div className="space-y-2">
                <textarea
                  className={`w-full p-4 rounded-2xl border-2 font-medium text-slate-800 resize-none transition-colors focus:outline-none focus:border-blue-400 ${
                    textInput.length >= (ch.minLength || 10) ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-slate-50"
                  }`}
                  rows={4}
                  placeholder={ch.placeholder}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{textInput.length} characters</span>
                  {textInput.length >= (ch.minLength || 10) && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Ready
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tip */}
            {ch.tip && (
              <div className={`${theme.light} rounded-2xl p-3`}>
                <p className={`text-xs font-medium ${theme.text}`}>{ch.tip}</p>
              </div>
            )}

            {/* Breathing completed state */}
            {ch.type === "breathing" && breathingDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 rounded-2xl p-4 text-center"
              >
                <p className="text-emerald-700 font-black text-lg">🎉 3 Cycles Complete!</p>
                <p className="text-emerald-600 text-sm font-medium">Your nervous system thanks you.</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              disabled={!canComplete()}
              className={`flex-1 py-3 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                canComplete()
                  ? `bg-gradient-to-r ${theme.bg} shadow-lg hover:shadow-xl`
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {alreadyCompleted ? "Revisit ✓" : "Complete"}
              {canComplete() && <ArrowRight size={16} />}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RecoveryMapPage() {
  const activeRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [dailyInput, setDailyInput] = useState("");
  const [dailySubmitted, setDailySubmitted] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userData) return;
    const today = new Date().toISOString().slice(0, 10);
    setDailySubmitted(userData.dailyQuestDate === today);
  }, [userData]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [userData]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-slate-400 font-medium text-sm">Loading your map...</p>
        </div>
      </div>
    );
  }

  // ── Progress calculation ──
  const highestUnlockedIndex = (() => {
    let last = 0;
    levels.forEach((level, i) => {
      if (checkLevelUnlock(level, userData).unlocked) last = i;
    });
    return last;
  })();
  const progressPercentage = (highestUnlockedIndex / (levels.length - 1)) * 100;
  const nextLevel = levels[highestUnlockedIndex + 1];
  const xpToNext = nextLevel ? Math.max(0, nextLevel.requirements.minXP - (userData.xp || 0)) : 0;

  // ── Helpers ──
  const updateXP = async (amount) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { xp: (userData.xp || 0) + amount });
    setUserData(prev => ({ ...prev, xp: (prev.xp || 0) + amount }));
  };

  const completeModule = async (moduleId) => {
    const user = auth.currentUser;
    if (!user) return;
    const updated = [...new Set([...(userData.completedModules || []), moduleId])];
    await updateDoc(doc(db, "users", user.uid), { completedModules: updated });
    setUserData(prev => ({ ...prev, completedModules: updated }));
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleChallengeComplete = async (level) => {
    const alreadyDone = userData.completedModules?.includes(level.moduleId);
    if (!alreadyDone) {
      await completeModule(level.moduleId);
      triggerConfetti();
      toast.success(`🏆 ${level.name} Conquered! +${level.xpReward} XP`, { duration: 3000 });
    } else {
      toast.success(`✅ Challenge complete! +${level.xpReward} XP`, { duration: 2000 });
    }
    await updateXP(level.xpReward);
    setActiveChallenge(null);
  };

  const submitDailyQuest = async () => {
    if (!dailyInput.trim()) return;
    const user = auth.currentUser;
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const updates = {
      xp: (userData.xp || 0) + 50,
      completedModules: [...new Set([...(userData.completedModules || []), "daily-gratitude"])],
      currentStreak: userData.lastActive !== today ? (userData.currentStreak || 0) + 1 : userData.currentStreak,
      lastActive: today,
      dailyQuestDate: today,
      dailyGratitude: dailyInput,
    };
    await updateDoc(doc(db, "users", user.uid), updates);
    setUserData(prev => ({ ...prev, ...updates }));
    setDailySubmitted(true);
    toast.success("Daily quest submitted! +50 XP 🌟");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Toaster position="top-center" richColors />

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Recovery <span className="text-blue-600">Map</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Your adventure to freedom</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Star size={14} className="text-yellow-500" fill="currentColor" />
            <motion.span key={userData.xp} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-black text-slate-800 text-sm">
              {(userData.xp || 0).toLocaleString()} XP
            </motion.span>
          </div>
          {nextLevel && xpToNext > 0 && (
            <p className="text-[10px] text-blue-500 font-bold">{xpToNext.toLocaleString()} XP to {nextLevel.name}</p>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="px-6 py-4 grid grid-cols-3 gap-3">
        {[
          { label: "Days Sober", value: userData.daysSober || 0, icon: "🧘", color: "text-blue-600" },
          { label: "Streak", value: `${userData.currentStreak || 0}d`, icon: "🔥", color: "text-orange-600" },
          { label: "Levels", value: `${highestUnlockedIndex + 1}/${levels.length}`, icon: "⭐", color: "text-yellow-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
            <p className="text-xl mb-0.5">{stat.icon}</p>
            <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Map ── */}
      <div className="relative max-w-sm mx-auto px-6 py-8 space-y-16">
        {/* Vertical progress line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-slate-200 -translate-x-1/2 rounded-full overflow-hidden pointer-events-none">
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${progressPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"
          />
        </div>

        {levels.map((level, index) => {
          const { unlocked, progress } = checkLevelUnlock(level, userData);
          const isCompleted = userData.completedModules?.includes(level.moduleId);
          const isActive = unlocked && !isCompleted;
          const LevelIcon = level.icon;
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={level.id}
              ref={isActive ? activeRef : null}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`relative flex items-center gap-5 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
            >
              {/* ── Node ── */}
              <div className="relative flex-shrink-0">
                {/* Pulse ring for active level */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute inset-0 w-20 h-20 rounded-[28px] bg-gradient-to-br ${level.theme.bg}`}
                  />
                )}

                <motion.button
                  whileHover={unlocked ? { scale: 1.06 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => unlocked && setActiveChallenge(level)}
                  className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl relative z-10 transition-all duration-300 ${
                    unlocked
                      ? `bg-gradient-to-br ${level.theme.bg} text-white`
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {unlocked ? <LevelIcon size={28} strokeWidth={2} /> : <Lock size={24} />}
                </motion.button>

                {/* Completed badge */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md z-20"
                  >
                    <CheckCircle2 size={14} />
                  </motion.div>
                )}

                {/* Active badge */}
                {isActive && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow z-20 whitespace-nowrap">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* ── Info ── */}
              <div className={`flex-1 ${isLeft ? "text-left" : "text-right"}`}>
                <h3 className={`font-black text-lg leading-tight mb-0.5 ${unlocked ? "text-slate-900" : "text-slate-400"}`}>
                  {level.name}
                </h3>

                {unlocked ? (
                  <>
                    <p className="text-sm text-slate-500 font-medium mb-2">{level.description}</p>
                    <button
                      onClick={() => setActiveChallenge(level)}
                      className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
                        isCompleted ? "text-emerald-600" : level.theme.text
                      }`}
                    >
                      {isCompleted ? "✓ Revisit" : "Start Challenge"}
                      <ChevronRight size={12} />
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    {/* Progress bars for locked levels */}
                    {[
                      { label: "Days", pct: progress.days },
                      { label: "Streak", pct: progress.streak },
                      { label: "XP", pct: progress.xp },
                    ].map(({ label, pct }) => (
                      <div key={label} className={`flex items-center gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
                        <span className="text-[10px] text-slate-400 font-bold w-10">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(pct * 100, 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-slate-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Daily Quest ── */}
      <div className="px-6 mt-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-3xl text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-10">
            <Zap size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={18} className="text-yellow-300" />
              <h2 className="text-lg font-black">Daily Challenge</h2>
              <span className="ml-auto bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">+50 XP</span>
            </div>

            {dailySubmitted ? (
              <div className="mt-3 bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-black">Submitted today!</p>
                <p className="text-white/70 text-sm">Come back tomorrow for your next challenge.</p>
              </div>
            ) : (
              <>
                <p className="text-white/80 text-sm font-medium mb-4">
                  Write 3 things you're grateful for today to earn 50 XP.
                </p>
                <textarea
                  className="w-full p-3 rounded-xl text-slate-800 font-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
                  rows={3}
                  placeholder="I'm grateful for..."
                  value={dailyInput}
                  onChange={e => setDailyInput(e.target.value)}
                />
                <button
                  onClick={submitDailyQuest}
                  className="mt-3 w-full bg-white text-blue-600 py-3 rounded-xl font-black shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  Submit Gratitude
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Crisis Button ── */}
      <div className="px-6 mt-4">
        <button className="w-full border-2 border-red-200 bg-red-50 text-red-600 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <AlertTriangle size={16} />
          Need help right now? Call SAMHSA · 1-800-662-4357
        </button>
      </div>

      {/* ── Challenge Modal ── */}
      {activeChallenge && (
        <ChallengeModal
          level={activeChallenge}
          userData={userData}
          onClose={() => setActiveChallenge(null)}
          onComplete={handleChallengeComplete}
        />
      )}
    </div>
  );
}