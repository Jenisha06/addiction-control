"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  Zap,
  Brain,
  Wind,
  Clock,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

const exercises = [
  {
    id: "trigger",
    icon: <Target className="text-blue-600" size={32} />,
    title: "Identify Trigger",
    subtitle: "Where does the urge start?",
    xp: 150,
    color: "bg-blue-50",
  },
  {
    id: "reframing",
    icon: <Brain className="text-emerald-600" size={32} />,
    title: "Thought Reframing",
    subtitle: "New perspective, new brain",
    xp: 200,
    color: "bg-emerald-50",
  },
  {
    id: "surfing",
    icon: <Wind className="text-purple-600" size={32} />,
    title: "Urge Surfing",
    subtitle: "Ride the wave without drowning",
    xp: 100,
    color: "bg-purple-50",
  },
  {
    id: "delay",
    icon: <Clock className="text-rose-600" size={32} />,
    title: "5-Minute Delay",
    subtitle: "Just 300 more seconds",
    xp: 50,
    color: "bg-rose-50",
  },
];

export default function CBTPage() {
  const { addXP } = useApp();
  const [activeExercise, setActiveExercise] = useState(null);
  const [step, setStep] = useState(0);

  const completeExercise = (xp) => {
    addXP?.(xp);

    toast.success(`Exercise Complete! +${xp} XP`, {
      icon: <Sparkles className="text-yellow-500" />,
    });

    setActiveExercise(null);
    setStep(0);
  };

  /* ===========================
     TRIGGER EXERCISE
  =========================== */

  if (activeExercise === "trigger") {
    return (
      <ExerciseLayout
        title="Identify Trigger"
        onClose={() => {
          setActiveExercise(null);
          setStep(0);
        }}
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="q1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <h2 className="text-3xl font-black text-slate-800">
                What happened just before the urge?
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Stressful meeting",
                  "Bored at home",
                  "Social pressure",
                  "Loneliness",
                  "A specific smell",
                  "Seeing a drink",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setStep(1)}
                    className="p-5 bg-white border border-slate-200 rounded-3xl font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-slate-800">
                What thought came to mind?
              </h2>

              <textarea
                className="w-full h-40 bg-white border border-slate-200 rounded-[32px] p-6 text-lg font-medium focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="e.g. I deserve one after this day..."
              />

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-5 rounded-[32px] font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
              >
                Analyze Thought
                <ArrowRight />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="q3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10 text-center"
            >
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto">
                <Target size={48} />
              </div>

              <h2 className="text-3xl font-black text-slate-900">
                TRIGGER LOGGED
              </h2>

              <p className="text-slate-500 font-medium">
                Awareness is 50% of the battle.
              </p>

              <button
                onClick={() => completeExercise(150)}
                className="w-full bg-blue-600 text-white py-5 rounded-[32px] font-black text-lg shadow-xl shadow-blue-100"
              >
                Claim 150 XP
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  /* ===========================
     DEFAULT SCREEN
  =========================== */

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Brain <span className="text-emerald-600">Gym</span>
          </h1>
          <p className="text-slate-500">Strengthen your resilience</p>
        </div>

        <div className="bg-emerald-100 p-3 rounded-2xl flex items-center gap-2">
          <Brain className="text-emerald-600" size={20} />
          <span className="font-black text-emerald-800 text-xs uppercase">
            Level 3 Expert
          </span>
        </div>
      </header>

      <div className="grid gap-4">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveExercise(ex.id)}
            className={`${ex.color} p-6 rounded-[32px] text-left hover:scale-[1.02] active:scale-95 transition-all border border-white/50 flex items-center gap-6 shadow-sm`}
          >
            <div className="bg-white p-4 rounded-2xl">{ex.icon}</div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900">
                {ex.title}
              </h3>
              <p className="text-xs text-slate-500">
                {ex.subtitle}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="bg-white/80 px-2 py-1 rounded-lg text-[10px] font-black text-slate-700">
                +{ex.xp} XP
              </span>
              <ChevronRight className="text-slate-400" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="text-yellow-500" size={20} fill="currentColor" />
          Pro Tip
        </h3>
        <p className="text-slate-500 text-sm italic">
          If you delay an urge for 15 minutes, intensity drops dramatically.
        </p>
      </div>
    </div>
  );
}

/* ===========================
   LAYOUT COMPONENT
=========================== */

function ExerciseLayout({ title, children, onClose }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-lg mx-auto">
      <header className="py-8 flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>

        <button
          onClick={onClose}
          className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition-colors"
        >
          <XIcon />
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      className="text-slate-600"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
