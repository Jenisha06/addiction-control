"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Heart, Lock,
  Activity, Sparkles, ChevronRight,
} from "lucide-react";

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    question: "How often do you drink alcohol?",
    options: ["Never", "Monthly or less", "2–4 times a month", "2–3 times a week", "4+ times a week"],
  },
  {
    question: "Do you drink to cope with stress?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    question: "Have you tried quitting before?",
    options: ["Never", "Once", "A few times", "Many times", "Currently trying"],
  },
  {
    question: "How do you feel after drinking?",
    options: ["Relaxed", "Indifferent", "Guilty", "Anxious", "Regretful"],
  },
  {
    question: "Do you experience blackouts?",
    options: ["Never", "Once in a while", "Sometimes", "Frequently", "Regularly"],
  },
  {
    question: "Do you feel like you need to drink?",
    options: ["Not at all", "Occasionally", "Daily", "All the time"],
  },
  {
    question: "Has drinking affected your work or school?",
    options: ["Never", "A little", "Somewhat", "Significantly"],
  },
  {
    question: "How supportive is your environment?",
    options: ["Very supportive", "Somewhat supportive", "Neutral", "Unsupportive", "Toxic"],
  },
  {
    question: "What is your primary goal?",
    options: ["Total Sobriety", "Moderation", "Just Exploring", "Other"],
  },
  {
    question: "Are you ready to commit?",
    options: ["Fully ready", "Mostly ready", "Trying my best", "Uncertain"],
  },
];

// ─── Risk scoring ─────────────────────────────────────────────────────────────
const HIGH  = new Set(["4+ times a week","Always","Frequently","Regularly","Significantly","All the time","Toxic"]);
const MED   = new Set(["Often","Sometimes","Daily","Somewhat","Unsupportive","Somewhat supportive"]);
const LOW   = new Set(["Rarely","Once in a while","A little","Occasionally"]);

function calcRisk(answers) {
  let score = 0;
  Object.values(answers).forEach((a) => {
    if (HIGH.has(a)) score += 3;
    else if (MED.has(a)) score += 2;
    else if (LOW.has(a)) score += 1;
  });
  if (score >= 15) return { label: "High Risk",     color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" };
  if (score >= 8)  return { label: "Moderate Risk",  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" };
  return              { label: "Low Risk",       color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`w-full max-w-md mx-auto bg-white rounded-[28px] shadow-xl border border-slate-100 overflow-hidden ${className}`}>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500" />
      <div className="px-7 py-8 sm:px-10 sm:py-10">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();

  // step: 0 = welcome, 1 = quiz, 2 = details, 3 = result
  const [step, setStep]                   = useState(0);
  const [currentQ, setCurrentQ]           = useState(0);
  const [answers, setAnswers]             = useState({});
  const [sobrietyDate, setSobrietyDate]   = useState("");
  const [drinkCost, setDrinkCost]         = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const progress = step === 1 ? ((currentQ) / QUESTIONS.length) * 100 : 0;
  const risk = calcRisk(answers);

  // ── Quiz navigation ──────────────────────────────────────────────────────
  const selectOption = (option) => {
    const updated = { ...answers, [currentQ]: option };
    setAnswers(updated);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1);
      } else {
        setStep(2); // go to details step
      }
    }, 220);
  };

  const goBack = () => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
    else setStep(0);
  };

  // ── Save to Firestore ────────────────────────────────────────────────────
  const handleFinish = async () => {
    setError("");
    if (!sobrietyDate) {
      setError("Please select your sobriety start date.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) { router.push("/login"); return; }

      const primaryGoal = answers[8] || "Moderation";

      await setDoc(
        doc(db, "users", user.uid),
        {
          riskLevel:           risk.label,
          goalType:            primaryGoal,
          assessmentAnswers:   answers,
          sobrietyDate:        sobrietyDate,
          drinkCostPerDay:     parseFloat(drinkCost) || 0,
          xp:                  0,
          coins:               0,
          currentStreak:       0,
          longestStreak:       0,
          level:               1,
          shieldCount:         3,
          caloriesAvoided:     0,
          onboardingCompleted: true,
          updatedAt:           serverTimestamp(),
        },
        { merge: true }   // ← keeps name, email, createdAt from signup
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center justify-center px-5 py-10">
      <AnimatePresence mode="wait">

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
            <Card>
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart size={32} fill="currentColor" />
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Welcome Home.</h1>
              <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
                Let's understand where you are so we can build your personalized recovery path.
              </p>

              {/* What to expect */}
              <div className="space-y-3 mb-8">
                {[
                  "10 quick questions about your habits",
                  "A personalised risk assessment",
                  "Your recovery dashboard, ready to go",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</div>
                    {item}
                  </div>
                ))}
              </div>

              {/* Privacy note */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                <Lock className="text-blue-500 shrink-0" size={18} />
                <p className="text-xs text-slate-500 font-medium">
                  Anonymous & Secure. Your data is private and never shared.
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
              >
                Let's Begin
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Card>
          </motion.div>
        )}

        {/* ── STEP 1: Quiz ── */}
        {step === 1 && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }} className="w-full max-w-md mx-auto">

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <button onClick={goBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition text-sm font-semibold">
                  <ArrowLeft size={16} /> Back
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600 rounded-full"
                  animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 leading-snug">
              {QUESTIONS[currentQ].question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {QUESTIONS[currentQ].options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectOption(option)}
                  className={`w-full p-4 rounded-2xl text-left font-semibold text-sm border-2 transition-all flex items-center justify-between group
                    ${answers[currentQ] === option
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50"
                    }`}
                >
                  {option}
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Personal Details ── */}
        {step === 2 && (
          <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
            <Card>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Almost there!</h2>
              <p className="text-sm text-slate-400 mb-8">Two quick details to power your dashboard.</p>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-2xl mb-6">
                  <span>⚠️</span><span>{error}</span>
                </motion.div>
              )}

              {/* Sobriety date */}
              <div className="mb-5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  When did you stop drinking? 🗓️
                </label>
                <p className="text-xs text-slate-400 mb-2">This powers your sobriety timer on the dashboard.</p>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-slate-700"
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setSobrietyDate(new Date().toISOString().split("T")[0])}
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                >
                  Starting today
                </button>
              </div>

              {/* Daily drink cost */}
              <div className="mb-8">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  How much did you spend on drinks per day? 💰
                </label>
                <p className="text-xs text-slate-400 mb-2">We'll show you how much money you're saving.</p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="200"
                    className="w-full pl-8 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition placeholder:text-slate-300"
                    value={drinkCost}
                    onChange={(e) => setDrinkCost(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Skip if you prefer not to share — enter 0.</p>
              </div>

              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Setting things up...
                  </>
                ) : (
                  <>
                    See My Results
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <button onClick={() => setStep(1)} className="w-full text-center text-sm text-slate-400 font-semibold mt-4 hover:text-slate-600 transition">
                ← Back to questions
              </button>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}