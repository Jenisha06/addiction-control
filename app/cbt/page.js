"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase";
import {
  doc, getDoc, updateDoc, setDoc,
  increment, serverTimestamp,
} from "firebase/firestore";
import {
  Zap, Brain, Wind, Target, ArrowRight, ChevronRight,
  Sparkles, Heart, MessageCircle, Loader2, X, Clock,
  CheckCircle2, Star,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

// ─── Exercise definitions ─────────────────────────────────────────────────────
const EXERCISES = [
  {
    id: "trigger",
    minLevel: 1,
    icon: Target,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
    title: "Smart Trigger Detective",
    subtitle: "AI-powered trigger analysis",
    xp: 150,
  },
  {
    id: "reframing",
    minLevel: 1,
    icon: Brain,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "AI Thought Transformer",
    subtitle: "Reframe negative thoughts with AI",
    xp: 200,
  },
  {
    id: "surfing",
    minLevel: 1,
    icon: Wind,
    iconColor: "text-purple-600",
    bg: "bg-purple-50",
    title: "Urge Surfing",
    subtitle: "Ride the wave without drowning",
    xp: 100,
  },
  {
    id: "delay",
    minLevel: 1,
    icon: Clock,
    iconColor: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Craving Delay Challenge",
    subtitle: "Wait it out — you're stronger than the urge",
    xp: 130,
  },
  {
    id: "mindfulness",
    minLevel: 1,
    icon: Heart,
    iconColor: "text-rose-600",
    bg: "bg-rose-50",
    title: "Mindful Breathing",
    subtitle: "Ground yourself in the present",
    xp: 120,
  },
];

// ─── Gemini API call ──────────────────────────────────────────────────────────
async function callGemini(prompt) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const raw = await res.text();
    let data = {};
    try { data = JSON.parse(raw); } catch { console.error("Non-JSON:", raw); }
    return data.text || "AI service unavailable. Please try again.";
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return "Unable to reach AI service. Check your connection.";
  }
}

// ─── Breathing timer component ────────────────────────────────────────────────
function BreathingTimer({ onComplete, accentColor = "rose" }) {
  const PHASES = [
    { label: "Inhale",  duration: 4, gradient: "from-sky-400 to-blue-500"   },
    { label: "Hold",    duration: 7, gradient: "from-violet-400 to-purple-500" },
    { label: "Exhale",  duration: 8, gradient: "from-emerald-400 to-teal-500" },
  ];
  const [phaseIdx, setPhaseIdx]   = useState(0);
  const [timeLeft, setTimeLeft]   = useState(PHASES[0].duration);
  const [cycles,   setCycles]     = useState(0);
  const [running,  setRunning]    = useState(false);
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
                if (done >= 3) {
                  clearInterval(timerRef.current);
                  setRunning(false);
                  setTimeout(onComplete, 600);
                }
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
  const scale = running
    ? phaseIdx === 0 ? 0.65 + (1 - timeLeft / phase.duration) * 0.35
    : phaseIdx === 2 ? 1 - (1 - timeLeft / phase.duration) * 0.35
    : 1
    : 0.55;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Cycle dots */}
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i < cycles ? "bg-emerald-500 scale-110" : "bg-slate-200"}`} />
        ))}
      </div>

      {/* Animated circle */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <motion.div animate={{ scale }} transition={{ duration: 0.7 }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${running ? phase.gradient : "from-slate-200 to-slate-300"} opacity-20`} />
        <motion.div animate={{ scale: scale * 0.72 }} transition={{ duration: 0.7 }}
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${running ? phase.gradient : "from-slate-200 to-slate-300"} flex items-center justify-center shadow-xl`}>
          <span className="text-white font-black text-2xl tabular-nums">{running ? timeLeft : "·"}</span>
        </motion.div>
      </div>

      <div className="text-center">
        {running
          ? <><p className="text-xl font-black text-slate-800">{phase.label}</p><p className="text-slate-400 text-sm">Cycle {cycles + 1} of 3</p></>
          : cycles >= 3
            ? <p className="text-emerald-600 font-black text-lg">🎉 All done!</p>
            : <p className="text-slate-400 text-sm">4s inhale · 7s hold · 8s exhale</p>
        }
      </div>

      {!running && cycles < 3 && (
        <button
          onClick={() => { setRunning(true); setPhaseIdx(0); setTimeLeft(PHASES[0].duration); }}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
        >
          {cycles === 0 ? "Begin Breathing" : "Continue"}
        </button>
      )}
    </div>
  );
}

// ─── Urge surfing exercise ────────────────────────────────────────────────────
function UrgeSurfing({ onComplete }) {
  const steps = [
    { title: "Notice the Urge",    body: "Instead of fighting it, simply observe. Where do you feel it in your body? Your chest? Stomach? Hands?", icon: "👁️" },
    { title: "Name It",            body: "Say to yourself: \"I notice I'm having an urge to drink.\" Naming it reduces its power over you.", icon: "🏷️" },
    { title: "Ride the Wave",      body: "Urges peak and fall like ocean waves. They never last more than 15–20 minutes. You just need to surf through it.", icon: "🌊" },
    { title: "Breathe & Observe",  body: "Take 3 deep breaths. Notice the urge slowly losing intensity. You're not suppressing — you're watching it fade.", icon: "🌬️" },
    { title: "You Surfed It! 🎉",  body: "The urge passed — because they always do. Every time you surf an urge, you weaken it. You just got stronger.", icon: "🏄" },
  ];
  const [idx, setIdx] = useState(0);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= idx ? "bg-purple-500" : "bg-slate-100"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[180px] flex flex-col justify-center"
        >
          <div className="text-4xl mb-4 text-center">{steps[idx].icon}</div>
          <h3 className="font-black text-slate-900 text-lg mb-2 text-center">{steps[idx].title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed text-center">{steps[idx].body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 active:scale-95 transition-transform text-sm">
            ← Back
          </button>
        )}
        {idx < steps.length - 1 ? (
          <button onClick={() => setIdx(i => i + 1)}
            className="flex-1 bg-purple-600 text-white py-3.5 rounded-2xl font-black active:scale-95 transition-transform text-sm flex items-center justify-center gap-1.5">
            Next <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={onComplete}
            className="flex-1 bg-purple-600 text-white py-3.5 rounded-2xl font-black active:scale-95 transition-transform text-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} /> Complete +100 XP
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Craving delay challenge ──────────────────────────────────────────────────
function CravingDelay({ onComplete }) {
  const DELAY = 15 * 60; // 15 minutes
  const [started,   setStarted]   = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(DELAY);
  const [done,      setDone]      = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, done]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct  = ((DELAY - timeLeft) / DELAY) * 100;

  const tips = [
    "Drink a glass of cold water 💧",
    "Go for a 5-minute walk 🚶",
    "Call or text a friend 📱",
    "Do 10 jumping jacks 🏃",
    "Write how you're feeling ✍️",
  ];

  if (!started) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl">⏰</div>
        <h3 className="text-xl font-black text-slate-900">The 15-Minute Challenge</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Research shows most cravings peak and fade within 15 minutes. 
          Start the timer and distract yourself — the urge will pass.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">While you wait, try:</p>
          {tips.map((t, i) => <p key={i} className="text-sm text-slate-600 font-medium">{t}</p>)}
        </div>
        <button onClick={() => setStarted(true)}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-indigo-200">
          Start the Timer
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
          className="text-7xl">🏆</motion.div>
        <h3 className="text-2xl font-black text-slate-900">You Did It!</h3>
        <p className="text-slate-500">15 minutes passed and you didn't give in. The craving has passed — you proved it always does.</p>
        <button onClick={onComplete}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
          <Star size={16} fill="white" /> Claim +130 XP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {/* Circular progress */}
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="68" fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle cx="80" cy="80" r="68" fill="none" stroke="#6366f1" strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 68}`}
            strokeDashoffset={`${2 * Math.PI * 68 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800 tabular-nums">
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </span>
          <span className="text-xs text-slate-400 font-semibold">remaining</span>
        </div>
      </div>

      <p className="text-slate-500 text-sm">Stay strong. The craving is peaking — it will drop soon.</p>

      <div className="bg-indigo-50 rounded-2xl p-4 text-sm font-medium text-indigo-700">
        💡 Try: {tips[Math.floor((DELAY - timeLeft) / (DELAY / tips.length)) % tips.length]}
      </div>
    </div>
  );
}

// ─── Exercise wrapper layout ──────────────────────────────────────────────────
function ExerciseLayout({ title, onClose, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col px-5 pt-8 pb-32 max-w-lg mx-auto">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <h1 className="text-lg font-black text-slate-900 leading-tight max-w-[240px]">{title}</h1>
        <button onClick={onClose}
          className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center active:scale-95 transition-all shrink-0">
          <X size={18} className="text-slate-600" />
        </button>
      </header>
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CBTPage() {
  const [userData,        setUserData]        = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [activeExercise,  setActiveExercise]  = useState(null);
  const [step,            setStep]            = useState(0);
  const [aiLoading,       setAiLoading]       = useState(false);
  const [aiResponse,      setAiResponse]      = useState("");
  const [userInput,       setUserInput]       = useState("");
  const [triggerQs,       setTriggerQs]       = useState([]);
  const [qIdx,            setQIdx]            = useState(0);
  const [answers,         setAnswers]         = useState([]);
  const [breathDone,      setBreathDone]      = useState(false);

  // ── Auth + load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  // ── Complete exercise → save XP to Firestore ──────────────────────────────
  const completeExercise = async (xp, exerciseId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const logRef = doc(db, "users", user.uid, "cbtLogs", `${exerciseId}-${today}`);
      const existing = await getDoc(logRef);

      if (existing.exists()) {
        toast.info("Already completed this exercise today! Come back tomorrow.", { duration: 3000 });
      } else {
        // Save completion log
        await setDoc(logRef, {
          exerciseId,
          xpEarned: xp,
          completedAt: serverTimestamp(),
        });
        // Increment XP in user doc
        await updateDoc(doc(db, "users", user.uid), {
          xp: increment(xp),
        });
        setUserData(prev => ({ ...prev, xp: (prev?.xp || 0) + xp }));
        toast.success(`Exercise complete! +${xp} XP 🎉`, { duration: 3000 });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Couldn't save progress. Try again.");
    }

    // Reset state
    setActiveExercise(null);
    setStep(0);
    setAiResponse("");
    setUserInput("");
    setTriggerQs([]);
    setQIdx(0);
    setAnswers([]);
    setBreathDone(false);
  };

  const closeExercise = () => {
    setActiveExercise(null);
    setStep(0);
    setAiResponse("");
    setUserInput("");
    setTriggerQs([]);
    setQIdx(0);
    setAnswers([]);
    setBreathDone(false);
  };

  // ── Trigger detective ─────────────────────────────────────────────────────
  const loadTriggerQuestions = async () => {
    setAiLoading(true);
    const prompt = `You are an addiction counselor AI. Generate 3 multiple choice questions to help identify alcohol addiction triggers. Return ONLY a JSON array with no extra text:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."]}]`;
    const raw = await callGemini(prompt);
    try {
      const qs = JSON.parse(raw);
      setTriggerQs(qs);
    } catch {
      setTriggerQs([
        { question: "What situation typically triggers your urges?", options: ["A) Social pressure", "B) Stress at work", "C) Being alone", "D) Seeing reminders"] },
        { question: "What time of day are cravings strongest?",      options: ["A) Morning", "B) Afternoon", "C) Evening", "D) Late night"] },
        { question: "Which emotion most often precedes an urge?",    options: ["A) Anxiety", "B) Boredom", "C) Sadness", "D) Anger"] },
      ]);
    }
    setAiLoading(false);
    setStep(1);
  };

  const handleAnswer = async (ans) => {
    setAiLoading(true);
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);

    if (qIdx < triggerQs.length - 1) {
      setQIdx(i => i + 1);
      setAiLoading(false);
    } else {
      const prompt = `As an addiction counselor, analyze these trigger responses and provide personalized insights in an encouraging tone (max 120 words). 
Answers: ${newAnswers.join(" | ")}
Provide: 1) Main trigger pattern 2) Personalized coping strategy 3) Encouraging message. Be warm and supportive.`;
      const analysis = await callGemini(prompt);
      setAiResponse(analysis);
      setStep(2);
      setAiLoading(false);
    }
  };

  // ── Reframing ─────────────────────────────────────────────────────────────
  const handleReframe = async () => {
    if (!userInput.trim()) return;
    setAiLoading(true);
    const prompt = `You are a compassionate therapist. Reframe this negative thought in a warm, realistic, encouraging way (max 80 words):
"${userInput}"
Speak directly to them using "you". Acknowledge their struggle, then offer hope and a healthier perspective.`;
    const res = await callGemini(prompt);
    setAiResponse(res);
    setAiLoading(false);
    setStep(1);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TRIGGER DETECTIVE
  if (activeExercise === "trigger") {
    return (
      <ExerciseLayout title="Smart Trigger Detective" onClose={closeExercise}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="start" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Target size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Let's find your triggers</h2>
              <p className="text-slate-500 text-sm">3 AI-generated questions to identify your patterns.</p>
              <button onClick={loadTriggerQuestions} disabled={aiLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {aiLoading ? <><Loader2 className="animate-spin" size={18} /> Generating...</> : <><span>Start Analysis</span><ArrowRight size={16} /></>}
              </button>
            </motion.div>
          )}

          {step === 1 && triggerQs.length > 0 && (
            <motion.div key={`q${qIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-5">
              <div className="flex gap-1.5">
                {triggerQs.map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= qIdx ? "bg-blue-600" : "bg-slate-100"}`} />)}
              </div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Question {qIdx + 1} of {triggerQs.length}</p>
              <h2 className="text-xl font-black text-slate-900 leading-snug">{triggerQs[qIdx]?.question}</h2>
              <div className="flex flex-col gap-2.5">
                {triggerQs[qIdx]?.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt)} disabled={aiLoading}
                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-medium text-slate-700 text-sm text-left active:scale-95 transition-all disabled:opacity-50 hover:border-blue-200">
                    {opt}
                  </button>
                ))}
              </div>
              {aiLoading && <div className="flex items-center justify-center gap-2 text-slate-400 text-sm"><Loader2 className="animate-spin" size={16} />Analysing...</div>}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="space-y-5">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto"><Brain size={30} className="text-blue-600" /></div>
              <h2 className="text-xl font-black text-slate-900 text-center">Your Trigger Analysis</h2>
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm min-h-[120px] flex items-center justify-center">
                {aiLoading
                  ? <Loader2 className="animate-spin text-blue-600" size={28} />
                  : <p className="text-slate-700 text-sm leading-relaxed">{aiResponse}</p>}
              </div>
              <button onClick={() => completeExercise(150, "trigger")}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                <Star size={16} fill="white" /> Complete +150 XP
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  // REFRAMING
  if (activeExercise === "reframing") {
    return (
      <ExerciseLayout title="AI Thought Transformer" onClose={closeExercise}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto"><MessageCircle size={38} className="text-emerald-600" /></div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">What's on your mind?</h2>
                <p className="text-slate-400 text-sm mt-1">Share a negative thought and I'll help you see it differently.</p>
              </div>
              <textarea
                value={userInput} onChange={e => setUserInput(e.target.value)}
                rows={4}
                placeholder="e.g. I'm worthless and will never overcome this..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all resize-none"
              />
              <button onClick={handleReframe} disabled={aiLoading || !userInput.trim()}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {aiLoading ? <><Loader2 className="animate-spin" size={18} />Transforming...</> : <><Sparkles size={16} />Transform Thought</>}
              </button>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto"><Sparkles size={38} className="text-emerald-600" /></div>
              <h2 className="text-xl font-black text-slate-900 text-center">New Perspective ✨</h2>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-100 p-5 min-h-[100px] flex items-center">
                {aiLoading
                  ? <Loader2 className="animate-spin text-emerald-600 mx-auto" size={28} />
                  : <p className="text-slate-700 text-sm leading-relaxed italic">"{aiResponse}"</p>}
              </div>
              <button onClick={() => { setStep(0); setUserInput(""); setAiResponse(""); }}
                className="w-full bg-white border-2 border-emerald-200 text-emerald-700 py-3.5 rounded-2xl font-bold active:scale-95 transition-transform text-sm">
                Transform Another Thought
              </button>
              <button onClick={() => completeExercise(200, "reframing")}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                <Star size={16} fill="white" /> Complete +200 XP
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  // URGE SURFING
  if (activeExercise === "surfing") {
    return (
      <ExerciseLayout title="Urge Surfing" onClose={closeExercise}>
        <UrgeSurfing onComplete={() => completeExercise(100, "surfing")} />
      </ExerciseLayout>
    );
  }

  // CRAVING DELAY
  if (activeExercise === "delay") {
    return (
      <ExerciseLayout title="Craving Delay Challenge" onClose={closeExercise}>
        <CravingDelay onComplete={() => completeExercise(130, "delay")} />
      </ExerciseLayout>
    );
  }

  // MINDFULNESS BREATHING
  if (activeExercise === "mindfulness") {
    return (
      <ExerciseLayout title="Mindful Breathing" onClose={closeExercise}>
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto"><Heart size={38} className="text-rose-500" /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Breathe & Reset</h2>
            <p className="text-slate-400 text-sm mt-1">Complete 3 full cycles of 4-7-8 breathing.</p>
          </div>
          <BreathingTimer onComplete={() => setBreathDone(true)} />
          {breathDone && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => completeExercise(120, "mindfulness")}
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
              <Star size={16} fill="white" /> Complete +120 XP
            </motion.button>
          )}
        </div>
      </ExerciseLayout>
    );
  }

  // ── HOME SCREEN ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const level = userData?.level ?? 1;
  const totalXP = userData?.xp ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 pb-28">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-black text-slate-900">AI Brain <span className="text-emerald-600">Gym</span></h1>
            <p className="text-slate-400 text-xs font-semibold">AI-powered recovery exercises</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
            <Brain size={14} className="text-emerald-600" />
            <span className="font-black text-emerald-800 text-xs">Level {level}</span>
            <span className="text-emerald-400 text-xs">·</span>
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            <span className="font-bold text-slate-700 text-xs">{totalXP.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto space-y-3">

        {/* Exercise list */}
        {EXERCISES.map(ex => {
          const locked = level < ex.minLevel;
          const Icon = ex.icon;

          return (
            <motion.button
              key={ex.id}
              whileTap={locked ? {} : { scale: 0.97 }}
              onClick={() => !locked && setActiveExercise(ex.id)}
              disabled={locked}
              className={`w-full ${ex.bg} p-5 rounded-3xl text-left border border-white/80 shadow-sm flex items-center gap-4 transition-all ${
                locked ? "opacity-50 cursor-not-allowed" : "active:scale-97"
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 relative">
                <Icon size={24} className={ex.iconColor} />
                {locked && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    L{ex.minLevel}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 text-sm leading-tight">{ex.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {locked ? `Unlock at Level ${ex.minLevel}` : ex.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="bg-white/80 px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-700">+{ex.xp} XP</span>
                {!locked && <ChevronRight size={14} className="text-slate-400" />}
              </div>
            </motion.button>
          );
        })}

        {/* AI tip card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mt-2">
          <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2 text-sm">
            <Zap size={16} className="text-yellow-500" fill="currentColor" />
            AI Pro Tip
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed italic">
            Each exercise is capped at once per day to build a real habit — not just XP farming. 
            Come back tomorrow to earn again!
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}