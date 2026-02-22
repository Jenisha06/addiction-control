"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/lib/firebase";
import {
  doc, setDoc, getDoc, updateDoc,
  serverTimestamp, increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Smile, Meh, Frown, Angry, Skull,
  CheckCircle2, XCircle, Flame, ArrowLeft,
  Star, Heart, TrendingUp, AlertTriangle,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

// ─── Data ─────────────────────────────────────────────────────────────────────
const EMOTIONS = [
  { icon: Smile,  label: "Great",  value: 5, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  { icon: Meh,    label: "Okay",   value: 4, color: "text-blue-500",    bg: "bg-blue-50 border-blue-200"    },
  { icon: Frown,  label: "Low",    value: 3, color: "text-amber-500",   bg: "bg-amber-50 border-amber-200"  },
  { icon: Angry,  label: "Tense",  value: 2, color: "text-orange-500",  bg: "bg-orange-50 border-orange-200"},
  { icon: Skull,  label: "Bad",    value: 1, color: "text-rose-500",    bg: "bg-rose-50 border-rose-200"    },
];

const CRAVING_LABELS = ["", "Very Low", "Low", "Medium", "High", "Intense"];
const CRAVING_COLORS = ["", "text-emerald-600", "text-blue-500", "text-amber-500", "text-orange-500", "text-rose-600"];

const TOTAL_STEPS = 3; // mood → craving → drank

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: i < step ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      ))}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition text-sm font-semibold mb-6"
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CheckInPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [alreadyDone,  setAlreadyDone]  = useState(false);
  const [name,        setName]        = useState("Friend");
  const [step,        setStep]        = useState(0);   // 0=mood 1=craving 2=drank 3=success 4=reflect
  const [mood,        setMood]        = useState(null);
  const [craving,     setCraving]     = useState(3);
  const [saving,      setSaving]      = useState(false);

  // ── Auth + check if already done today ───────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }

      try {
        // Load name
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().name) {
          setName(userSnap.data().name.split(" ")[0]);
        }

        // Check if already checked in today
        const today = new Date().toISOString().split("T")[0];
        const logSnap = await getDoc(doc(db, "users", user.uid, "checkins", today));
        if (logSnap.exists()) setAlreadyDone(true);
      } catch (err) {
        console.error("Check-in load error:", err);
      } finally {
        setLoadingUser(false);
      }
    });
    return () => unsub();
  }, [router]);

  // ── Save check-in + update XP & streak ───────────────────────────────────
  const handleFinish = async (didDrink) => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Save to checkins (matches dashboard query)
      await setDoc(doc(db, "users", user.uid, "checkins", today), {
        mood,
        cravings: craving,   // field name matches dashboard chart
        drank: didDrink,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // 2. Update user stats
      const xpEarned = didDrink ? 10 : 50; // less XP if they drank
      await updateDoc(doc(db, "users", user.uid), {
        xp:            increment(xpEarned),
        currentStreak: didDrink ? 0 : increment(1),
        lastCheckin:   serverTimestamp(),
        // Update longest streak is handled server-side ideally,
        // but we do a best-effort client update:
        caloriesAvoided: didDrink ? increment(0) : increment(150),
      });

      setStep(didDrink ? 4 : 3);
    } catch (err) {
      console.error("Check-in save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Already checked in ────────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center justify-center px-5 pb-32">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Already checked in!</h2>
            <p className="text-slate-400 text-sm mb-8">You've completed today's check-in. Come back tomorrow to keep your streak alive! 🔥</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col px-5 pt-10 pb-32 max-w-lg mx-auto">
        <AnimatePresence mode="wait">

          {/* ── STEP 0: MOOD ── */}
          {step === 0 && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col flex-1"
            >
              <ProgressBar step={1} />

              <div className="mb-8">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Step 1 of 3</p>
                <h2 className="text-2xl font-black text-slate-900 leading-snug">
                  Hey {name}! 👋<br />How are you feeling?
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {EMOTIONS.map((e) => {
                  const Icon = e.icon;
                  return (
                    <motion.button
                      key={e.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setMood(e.value); setStep(1); }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all text-left ${
                        mood === e.value ? `${e.bg} border-current` : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${e.bg} shrink-0`}>
                        <Icon size={28} className={e.color} />
                      </div>
                      <span className="font-bold text-slate-800 text-base">{e.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: CRAVING ── */}
          {step === 1 && (
            <motion.div
              key="craving"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col flex-1"
            >
              <ProgressBar step={2} />
              <BackButton onClick={() => setStep(0)} />

              <div className="mb-8">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Step 2 of 3</p>
                <h2 className="text-2xl font-black text-slate-900">How strong is your craving right now?</h2>
              </div>

              {/* Craving display */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center mb-6 shadow-sm">
                <div className={`text-5xl font-black mb-1 ${CRAVING_COLORS[craving]}`}>{craving}</div>
                <div className={`text-sm font-bold ${CRAVING_COLORS[craving]}`}>{CRAVING_LABELS[craving]}</div>
              </div>

              {/* Slider */}
              <div className="px-2 mb-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={craving}
                  onChange={(e) => setCraving(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-600"
                  style={{ background: `linear-gradient(to right, #2563eb ${(craving - 1) * 25}%, #e2e8f0 ${(craving - 1) * 25}%)` }}
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-2 px-0.5">
                  {CRAVING_LABELS.slice(1).map((l) => <span key={l}>{l}</span>)}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-200 mt-auto"
              >
                Next →
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: DID YOU DRINK ── */}
          {step === 2 && (
            <motion.div
              key="drink"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col flex-1"
            >
              <ProgressBar step={3} />
              <BackButton onClick={() => setStep(1)} />

              <div className="mb-8">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Step 3 of 3</p>
                <h2 className="text-2xl font-black text-slate-900">Did you drink alcohol today?</h2>
                <p className="text-sm text-slate-400 mt-2">Be honest — this helps you track your journey accurately.</p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleFinish(false)}
                  disabled={saving}
                  className="w-full bg-emerald-50 border-2 border-emerald-200 py-6 rounded-3xl flex flex-col items-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
                >
                  <CheckCircle2 size={36} className="text-emerald-500" />
                  <span className="font-black text-emerald-700 text-lg">No, I stayed sober! 💪</span>
                  <span className="text-xs text-emerald-600 font-semibold">+50 XP · Streak continues</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleFinish(true)}
                  disabled={saving}
                  className="w-full bg-rose-50 border-2 border-rose-200 py-6 rounded-3xl flex flex-col items-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
                >
                  <XCircle size={36} className="text-rose-400" />
                  <span className="font-black text-rose-700 text-lg">Yes, I had a drink</span>
                  <span className="text-xs text-rose-500 font-semibold">+10 XP · It's okay, keep going</span>
                </motion.button>
              </div>

              {saving && (
                <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-sm font-semibold">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Saving your check-in...
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center flex-1 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6"
              >
                <Flame size={48} className="text-emerald-500" />
              </motion.div>

              <h2 className="text-3xl font-black text-slate-900 mb-2">Incredible! 🎉</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-xs">
                You stayed sober today. Every day counts — you're building something amazing.
              </p>

              {/* XP earned card */}
              <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star size={20} className="text-yellow-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 font-semibold uppercase">XP Earned</p>
                      <p className="font-black text-slate-900">+50 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Flame size={20} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Streak</p>
                      <p className="font-black text-slate-900">+1 Day 🔥</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-blue-200"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}

          {/* ── STEP 4: REFLECT (drank) ── */}
          {step === 4 && (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center flex-1 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mb-6"
              >
                <Heart size={48} className="text-amber-500" />
              </motion.div>

              <h2 className="text-3xl font-black text-slate-900 mb-2">It's okay 💛</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-xs">
                Recovery isn't a straight line. The fact that you checked in means you're still trying — and that matters.
              </p>

              {/* Tip card */}
              <div className="w-full bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6 text-left flex gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm mb-1">Quick tip</p>
                  <p className="text-xs text-amber-700">
                    Try our CBT exercises or reach out in the community — you don't have to face this alone.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => router.push("/cbt")}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform"
                >
                  Try a CBT Exercise
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-black active:scale-95 transition-transform"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <BottomNav />
    </>
  );
}