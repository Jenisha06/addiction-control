"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase";
import {
  doc, getDoc, updateDoc, setDoc,
  increment, serverTimestamp,
} from "firebase/firestore";
import {
  Zap, Brain, Wind, Target, ArrowRight, ChevronRight,
  Sparkles, Heart,  Loader2, X, Clock,
  CheckCircle2, Star,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

const T = {
  parchment:   "linear-gradient(180deg, #f5e8c8 0%, #ede0b4 100%)",
  wood:        "linear-gradient(180deg, #5a3418 0%, #4a2a12 30%, #3d2210 100%)",
  woodLight:   "linear-gradient(180deg, #d4b483 0%, #b8955c 50%, #a07840 100%)",
  woodHover:   "linear-gradient(180deg, #ddc090 0%, #c4a060 50%, #b08848 100%)",
  btnBorder:   "#8a6030",
  btnShadow:   "0 3px 0 #6a4820, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,230,160,0.4)",
  questBtn:    "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
  questShadow: "0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
  text:        "#3d2410",
  gold:        "#c8a060",
  goldLight:   "#f7e0bb",
  muted:       "#a07848",
  link:        "#6ab4d8",
  cardBg:      "rgba(58,32,16,0.82)",
  ringColor:   "rgba(200,160,74,0.22)",
};

// ─── Shared styled components ─────────────────────────────────────────────────
const WoodBtn = ({ onClick, disabled, children, style = {}, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] active:translate-y-0.5 disabled:opacity-50 ${className}`}
    style={{
      background: T.woodLight,
      border: `2px solid ${T.btnBorder}`,
      borderRadius: 24,
      padding: "11px 20px",
      boxShadow: T.btnShadow,
      color: T.text,
      fontWeight: 700,
      fontSize: "0.85rem",
      fontFamily: "Georgia, serif",
      letterSpacing: "0.04em",
      cursor: disabled ? "default" : "pointer",
      ...style,
    }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.background = T.woodHover)}
    onMouseLeave={e => (e.currentTarget.style.background = T.woodLight)}
  >
    {children}
  </button>
);

const QuestBtn = ({ onClick, disabled, children, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] active:translate-y-0.5 disabled:opacity-60"
    style={{
      background: T.questBtn,
      border: "2px solid #1478b0",
      borderRadius: 24,
      padding: "13px 20px",
      boxShadow: T.questShadow,
      color: "#fff",
      fontWeight: 900,
      fontSize: "0.85rem",
      fontFamily: "Georgia, serif",
      letterSpacing: "0.13em",
      textTransform: "uppercase",
      textShadow: "0 1px 3px rgba(0,80,160,0.5)",
      cursor: disabled ? "default" : "pointer",
      ...style,
    }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.background = "linear-gradient(180deg, #72d8f8 0%, #4cc0f4 40%, #28a8e8 100%)")}
    onMouseLeave={e => (e.currentTarget.style.background = T.questBtn)}
  >
    {children}
  </button>
);

const ParchmentInput = ({ value, onChange, placeholder, rows, type = "text" }) => {
  const shared = {
    background: T.parchment,
    border: `2px solid #b8954a`,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: "0.85rem",
    color: T.text,
    fontFamily: "Georgia, serif",
    outline: "none",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.12), 0 1px 0 rgba(255,220,130,0.3)",
    width: "100%",
    boxSizing: "border-box",
    resize: "none",
    transition: "border-color 0.2s",
  };

  if (rows) {
    return (
      <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder}
        style={shared}
        onFocus={e => (e.target.style.borderColor = "#e8a030")}
        onBlur={e => (e.target.style.borderColor = "#b8954a")}
      />
    );
  }
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={shared}
      onFocus={e => (e.target.style.borderColor = "#e8a030")}
      onBlur={e => (e.target.style.borderColor = "#b8954a")}
    />
  );
};

// Parchment card
const ParchCard = ({ children, style = {} }) => (
  <div style={{
    background: T.parchment,
    border: "2px solid #b8954a",
    borderRadius: 14,
    padding: "16px",
    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1), 0 2px 0 rgba(255,220,130,0.2)",
    ...style,
  }}>
    {children}
  </div>
);

// Section label
const RuneLabel = ({ children }) => (
  <p style={{ color: T.gold, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.13em", fontFamily: "Georgia, serif", textTransform: "uppercase", marginBottom: 5 }}>
    {children}
  </p>
);

// ─── Exercise definitions ─────────────────────────────────────────────────────
const EXERCISES = [
  { id: "trigger",     minLevel: 1, icon: Target,         title: "Smart Trigger Detective",   subtitle: "AI-powered trigger analysis",           xp: 150, accent: "#b8954a" },
  { id: "reframing",   minLevel: 1, icon: Brain,          title: "AI Thought Transformer",     subtitle: "Reframe negative thoughts with AI",     xp: 200, accent: "#7aab6a" },
  { id: "surfing",     minLevel: 1, icon: Wind,           title: "Urge Surfing",               subtitle: "Ride the wave without drowning",         xp: 100, accent: "#9a78c0" },
  { id: "delay",       minLevel: 1, icon: Clock,          title: "Craving Delay Challenge",    subtitle: "Wait it out — you're stronger than the urge", xp: 130, accent: "#6a8bcc" },
  { id: "mindfulness", minLevel: 1, icon: Heart,          title: "Mindful Breathing",          subtitle: "Ground yourself in the present",         xp: 120, accent: "#c07878" },
];

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

// ─── Breathing timer ──────────────────────────────────────────────────────────
function BreathingTimer({ onComplete }) {
  const PHASES = [
    { label: "Inhale",  duration: 4, color: "#6ab4d8" },
    { label: "Hold",    duration: 7, color: "#9a78c0" },
    { label: "Exhale",  duration: 8, color: "#7aab6a" },
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
      if (prev > 1) return prev - 1;

      // move to next phase
      setPhaseIdx(curr => {
        const next = (curr + 1) % PHASES.length;

        // if we wrapped around, completed a cycle
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

      
      const nextIdx = (phaseIdx + 1) % PHASES.length;
      return PHASES[nextIdx].duration;
    });
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [running, onComplete]); 

  const phase = PHASES[phaseIdx];
  const scale = running
    ? phaseIdx === 0 ? 0.65 + (1 - timeLeft / phase.duration) * 0.35
    : phaseIdx === 2 ? 1 - (1 - timeLeft / phase.duration) * 0.35
    : 1
    : 0.55;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Cycle runes */}
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: "50%",
            background: i < cycles ? "#b8954a" : "rgba(200,160,74,0.2)",
            border: "2px solid #b8954a",
            transition: "all 0.5s",
          }} />
        ))}
      </div>

      <div className="relative w-40 h-40 flex items-center justify-center">
        <motion.div animate={{ scale }} transition={{ duration: 0.7 }}
          className="absolute inset-0 rounded-full opacity-20"
          style={{ background: running ? `radial-gradient(circle, ${phase.color}, transparent)` : "rgba(200,160,74,0.2)" }}
        />
        <motion.div animate={{ scale: scale * 0.72 }} transition={{ duration: 0.7 }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: running ? `linear-gradient(135deg, ${phase.color}, ${phase.color}99)` : "rgba(200,160,74,0.3)",
            boxShadow: running ? `0 0 30px ${phase.color}55` : "none",
            border: `2px solid ${running ? phase.color : "#b8954a"}55`,
          }}>
          <span style={{ color: running ? "#fff" : T.gold, fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 900 }}>
            {running ? timeLeft : "·"}
          </span>
        </motion.div>
      </div>

      <div className="text-center">
        {running
          ? <><p style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.1rem", color: T.goldLight }}>{phase.label}</p>
               <p style={{ color: T.muted, fontSize: "0.75rem", fontFamily: "Georgia, serif" }}>Cycle {cycles + 1} of 3</p></>
          : cycles >= 3
            ? <p style={{ color: "#7aab6a", fontFamily: "Georgia, serif", fontWeight: 900 }}>🎉 Quest Complete!</p>
            : <p style={{ color: T.muted, fontSize: "0.75rem", fontFamily: "Georgia, serif", fontStyle: "italic" }}>4s inhale · 7s hold · 8s exhale</p>
        }
      </div>

      {!running && cycles < 3 && (
        <QuestBtn onClick={() => { setRunning(true); setPhaseIdx(0); setTimeLeft(PHASES[0].duration); }}>
          {cycles === 0 ? "Begin Breathing" : "Continue"}
        </QuestBtn>
      )}
    </div>
  );
}

// ─── Urge surfing ─────────────────────────────────────────────────────────────
function UrgeSurfing({ onComplete }) {
  const steps = [
    { title: "Notice the Urge",   body: "Instead of fighting it, simply observe. Where do you feel it in your body? Your chest? Stomach? Hands?", icon: "👁️" },
    { title: "Name It",           body: "Say to yourself: \"I notice I'm having an urge to drink.\" Naming it reduces its power over you.",       icon: "🏷️" },
    { title: "Ride the Wave",     body: "Urges peak and fall like ocean waves. They never last more than 15–20 minutes. Surf through it.",          icon: "🌊" },
    { title: "Breathe & Observe", body: "Take 3 deep breaths. Notice the urge slowly losing intensity. You're watching it fade.",                   icon: "🌬️" },
    { title: "You Surfed It! 🎉", body: "The urge passed — because they always do. Every time you surf an urge, you weaken it. You just got stronger.", icon: "🏄" },
  ];
  const [idx, setIdx] = useState(0);

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 99,
            background: i <= idx ? "#b8954a" : "rgba(200,160,74,0.2)",
            transition: "background 0.4s",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        >
          <ParchCard style={{ minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{steps[idx].icon}</div>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "1.05rem", marginBottom: 8 }}>{steps[idx].title}</h3>
            <p style={{ color: "#6b4c2e", fontSize: "0.82rem", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{steps[idx].body}</p>
          </ParchCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2.5">
        {idx > 0 && (
          <WoodBtn onClick={() => setIdx(i => i - 1)} style={{ flex: 1, fontSize: "0.8rem" }}>← Back</WoodBtn>
        )}
        {idx < steps.length - 1 ? (
          <button onClick={() => setIdx(i => i + 1)}
            className="flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{ flex: 1, background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "11px 16px", color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", letterSpacing: "0.05em", boxShadow: T.questShadow, cursor: "pointer" }}>
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <QuestBtn onClick={onComplete} style={{ flex: 1 }}>
            <CheckCircle2 size={14} /> Complete +100 XP
          </QuestBtn>
        )}
      </div>
    </div>
  );
}

// ─── Craving delay ────────────────────────────────────────────────────────────
function CravingDelay({ onComplete }) {
  const DELAY = 15 * 60;
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DELAY);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, done]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct  = ((DELAY - timeLeft) / DELAY) * 100;
  const tips = ["Drink a glass of cold water 💧", "Go for a 5-minute walk 🚶", "Call or text a friend 📱", "Do 10 jumping jacks 🏃", "Write how you're feeling ✍️"];

  if (!started) return (
    <div className="space-y-5 text-center">
      <div style={{ fontSize: "3.5rem" }}>⏰</div>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.2rem" }}>The 15-Minute Challenge</h3>
      <p style={{ color: T.muted, fontSize: "0.82rem", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.6 }}>
        Research shows most cravings peak and fade within 15 minutes. Start the timer and distract yourself.
      </p>
      <ParchCard>
        <RuneLabel>While you wait, try:</RuneLabel>
        {tips.map((t, i) => <p key={i} style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem", color: T.text, marginBottom: 4 }}>{t}</p>)}
      </ParchCard>
      <QuestBtn onClick={() => setStarted(true)}>Begin the Challenge</QuestBtn>
    </div>
  );

  if (done) return (
    <div className="space-y-5 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} style={{ fontSize: "4rem" }}>🏆</motion.div>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.3rem" }}>Victory, Seeker!</h3>
      <p style={{ color: T.muted, fontSize: "0.82rem", fontFamily: "Georgia, serif", fontStyle: "italic" }}>15 minutes passed and you didn't give in. The craving has passed — you proved it always does.</p>
      <QuestBtn onClick={onComplete}><Star size={14} fill="white" /> Claim +130 XP</QuestBtn>
    </div>
  );

  return (
    <div className="space-y-5 text-center">
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(200,160,74,0.2)" strokeWidth="12" />
          <circle cx="80" cy="80" r="68" fill="none" stroke="#b8954a" strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 68}`}
            strokeDashoffset={`${2 * Math.PI * 68 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.5rem", color: T.goldLight }}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </span>
          <span style={{ color: T.muted, fontSize: "0.7rem", fontFamily: "Georgia, serif" }}>remaining</span>
        </div>
      </div>
      <p style={{ color: T.muted, fontSize: "0.82rem", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Stay strong. The craving is peaking — it will fade soon.</p>
      <ParchCard>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem", color: T.text }}>
          💡 {tips[Math.floor((DELAY - timeLeft) / (DELAY / tips.length)) % tips.length]}
        </p>
      </ParchCard>
    </div>
  );
}

// ─── Exercise wrapper ─────────────────────────────────────────────────────────
function ExerciseLayout({ title, onClose, children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
    }}>
      {/* Atmospheric overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(255,180,60,0.10), transparent 70%)",
      }} />
      {/* Floating sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        {[{l:"8%",t:"15%"},{l:"85%",t:"20%"},{l:"15%",t:"75%"},{l:"80%",t:"70%"}].map((p,i)=>(
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-amber-200"
            style={{ left: p.l, top: p.t, animation: `pulse ${2+i*0.5}s ease-in-out infinite alternate`, animationDelay: `${i*0.4}s` }} />
        ))}
      </div>
      <style>{`@keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}`}</style>

      {/* Header bar */}
      <div className="relative z-20 px-5 pt-8 pb-4 flex justify-between items-start" style={{
        borderBottom: "1px solid rgba(200,160,74,0.15)",
      }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.1rem", lineHeight: 1.3, maxWidth: 240 }}>{title}</h1>
          {/* Rune accent */}
          <p style={{ color: "rgba(200,160,74,0.35)", fontSize: "0.7rem", letterSpacing: "0.2em", fontFamily: "serif", marginTop: 2 }}>ᚠ ᚢ ᚦ ᚨ ᚱ</p>
        </div>
        <button onClick={onClose}
          className="flex items-center justify-center transition-all active:scale-95"
          style={{ width: 38, height: 38, background: "rgba(200,160,74,0.12)", border: "1px solid rgba(200,160,74,0.25)", borderRadius: 12, cursor: "pointer", color: T.gold }}>
          <X size={17} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-5 py-6 pb-32 max-w-lg mx-auto w-full">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CBTPage() {
  const [userData,       setUserData]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeExercise, setActiveExercise] = useState(null);
  const [step,           setStep]           = useState(0);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiResponse,     setAiResponse]     = useState("");
  const [userInput,      setUserInput]      = useState("");
  const [triggerQs,      setTriggerQs]      = useState([]);
  const [qIdx,           setQIdx]           = useState(0);
  const [answers,        setAnswers]        = useState([]);
  const [breathDone,     setBreathDone]     = useState(false);

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

  const completeExercise = async (xp, exerciseId) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const logRef = doc(db, "users", user.uid, "cbtLogs", `${exerciseId}-${today}`);
      const existing = await getDoc(logRef);
      if (existing.exists()) {
        toast.info("Already completed today! Return tomorrow, Seeker.", { duration: 3000 });
      } else {
        await setDoc(logRef, { exerciseId, xpEarned: xp, completedAt: serverTimestamp() });
        await updateDoc(doc(db, "users", user.uid), { xp: increment(xp) });
        setUserData(prev => ({ ...prev, xp: (prev?.xp || 0) + xp }));
        toast.success(`Quest complete! +${xp} XP ⚔️`, { duration: 3000 });
      }
    } catch (err) { console.error(err); toast.error("Couldn't save progress. Try again."); }
    setActiveExercise(null); setStep(0); setAiResponse(""); setUserInput("");
    setTriggerQs([]); setQIdx(0); setAnswers([]); setBreathDone(false);
  };

  const closeExercise = () => {
    setActiveExercise(null); setStep(0); setAiResponse(""); setUserInput("");
    setTriggerQs([]); setQIdx(0); setAnswers([]); setBreathDone(false);
  };

  const loadTriggerQuestions = async () => {
    setAiLoading(true);
    const prompt = `You are an addiction counselor AI. Generate 3 multiple choice questions to help identify alcohol addiction triggers. Return ONLY a JSON array with no extra text:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."]}]`;
    const raw = await callGemini(prompt);
    try { setTriggerQs(JSON.parse(raw)); }
    catch {
      setTriggerQs([
        { question: "What situation typically triggers your urges?", options: ["A) Social pressure","B) Stress at work","C) Being alone","D) Seeing reminders"] },
        { question: "What time of day are cravings strongest?",      options: ["A) Morning","B) Afternoon","C) Evening","D) Late night"] },
        { question: "Which emotion most often precedes an urge?",    options: ["A) Anxiety","B) Boredom","C) Sadness","D) Anger"] },
      ]);
    }
    setAiLoading(false); setStep(1);
  };

  const handleAnswer = async (ans) => {
    setAiLoading(true);
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    if (qIdx < triggerQs.length - 1) { setQIdx(i => i + 1); setAiLoading(false); }
    else {
      const prompt = `As an addiction counselor, analyze these trigger responses and provide personalized insights in an encouraging tone (max 120 words). Answers: ${newAnswers.join(" | ")}. Provide: 1) Main trigger pattern 2) Personalized coping strategy 3) Encouraging message. Be warm and supportive.`;
      const analysis = await callGemini(prompt);
      setAiResponse(analysis); setStep(2); setAiLoading(false);
    }
  };

  const handleReframe = async () => {
    if (!userInput.trim()) return;
    setAiLoading(true);
    const prompt = `You are a compassionate therapist. Reframe this negative thought in a warm, realistic, encouraging way (max 80 words): "${userInput}". Speak directly to them using "you". Acknowledge their struggle, then offer hope.`;
    const res = await callGemini(prompt);
    setAiResponse(res); setAiLoading(false); setStep(1);
  };

  // ── Exercise screens ──────────────────────────────────────────────────────
  if (activeExercise === "trigger") {
    return (
      <ExerciseLayout title="Smart Trigger Detective" onClose={closeExercise}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="start" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 text-center">
              <div style={{ display:"flex", justifyContent:"center" }}>
  <Target size={34} style={{ color: "#b8954a" }} />
</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.3rem" }}>Let's find your triggers</h2>
              <p style={{ color: T.muted, fontSize: "0.82rem", fontFamily: "Georgia, serif", fontStyle: "italic" }}>3 AI-generated questions to identify your patterns.</p>
              <QuestBtn onClick={loadTriggerQuestions} disabled={aiLoading}>
                {aiLoading ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <>Start Analysis <ArrowRight size={14} /></>}
              </QuestBtn>
            </motion.div>
          )}

          {step === 1 && triggerQs.length > 0 && (
            <motion.div key={`q${qIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex gap-1.5">
                {triggerQs.map((_, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: i <= qIdx ? "#b8954a" : "rgba(200,160,74,0.2)", transition: "background 0.4s" }} />)}
              </div>
              <RuneLabel>Question {qIdx + 1} of {triggerQs.length}</RuneLabel>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.05rem", lineHeight: 1.4 }}>{triggerQs[qIdx]?.question}</h2>
              <div className="flex flex-col gap-2.5">
                {triggerQs[qIdx]?.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt)} disabled={aiLoading}
                    className="transition-all active:scale-[0.98]"
                    style={{
                      width: "100%", padding: "12px 16px", textAlign: "left",
                      background: "rgba(200,160,74,0.08)", border: "1.5px solid rgba(200,160,74,0.25)",
                      borderRadius: 12, fontFamily: "Georgia, serif", fontSize: "0.84rem", color: T.goldLight,
                      cursor: aiLoading ? "default" : "pointer", opacity: aiLoading ? 0.5 : 1,
                    }}
                    onMouseEnter={e => !aiLoading && (e.currentTarget.style.background = "rgba(200,160,74,0.16)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(200,160,74,0.08)")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {aiLoading && <div className="flex items-center justify-center gap-2" style={{ color: T.muted, fontSize: "0.8rem", fontFamily: "Georgia, serif" }}><Loader2 className="animate-spin" size={14} />Reading the runes...</div>}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div style={{ display:"flex", justifyContent:"center" }}>
  <Sparkles size={30} style={{ color: "#b8954a" }} />
</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.15rem", textAlign: "center" }}>Your Trigger Analysis</h2>
              <ParchCard style={{ minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {aiLoading
                  ? <Loader2 className="animate-spin" size={26} style={{ color: "#b8954a" }} />
                  : <p style={{ fontFamily: "Georgia, serif", fontSize: "0.84rem", color: T.text, lineHeight: 1.7 }}>{aiResponse}</p>}
              </ParchCard>
              <QuestBtn onClick={() => completeExercise(150, "trigger")}><Star size={14} fill="white" /> Complete +150 XP</QuestBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  if (activeExercise === "reframing") {
    return (
      <ExerciseLayout title="AI Thought Transformer" onClose={closeExercise}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
             <div style={{ display:"flex", justifyContent:"center" }}>
  <Brain size={30} style={{ color: "#7aab6a" }} />
</div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.2rem" }}>What's on your mind?</h2>
                <p style={{ color: T.muted, fontSize: "0.8rem", fontFamily: "Georgia, serif", fontStyle: "italic", marginTop: 4 }}>Share a negative thought and I'll help you see it differently.</p>
              </div>
              <div>
                <RuneLabel>Your Thought</RuneLabel>
                <ParchmentInput value={userInput} onChange={e => setUserInput(e.target.value)} rows={4} placeholder="e.g. I'm worthless and will never overcome this..." />
              </div>
              <QuestBtn onClick={handleReframe} disabled={aiLoading || !userInput.trim()}>
                {aiLoading ? <><Loader2 className="animate-spin" size={16} />Transforming...</> : <><Sparkles size={14} />Transform Thought</>}
              </QuestBtn>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
           <div style={{ display:"flex", justifyContent:"center" }}>
  <Sparkles size={30} style={{ color: "#b8954a" }} />
</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.15rem", textAlign: "center" }}>New Perspective</h2>
              <ParchCard style={{ minHeight: 100, display: "flex", alignItems: "center" }}>
                {aiLoading
                  ? <div className="flex justify-center w-full"><Loader2 className="animate-spin" size={26} style={{ color: "#b8954a" }} /></div>
                  : <p style={{ fontFamily: "Georgia, serif", fontSize: "0.84rem", color: T.text, lineHeight: 1.7, fontStyle: "italic" }}>"{aiResponse}"</p>}
              </ParchCard>
              <WoodBtn onClick={() => { setStep(0); setUserInput(""); setAiResponse(""); }}>Transform Another Thought</WoodBtn>
              <QuestBtn onClick={() => completeExercise(200, "reframing")}><Star size={14} fill="white" /> Complete +200 XP</QuestBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  if (activeExercise === "surfing") return (
    <ExerciseLayout title="Urge Surfing" onClose={closeExercise}>
      <UrgeSurfing onComplete={() => completeExercise(100, "surfing")} />
    </ExerciseLayout>
  );

  if (activeExercise === "delay") return (
    <ExerciseLayout title="Craving Delay Challenge" onClose={closeExercise}>
      <CravingDelay onComplete={() => completeExercise(130, "delay")} />
    </ExerciseLayout>
  );

  if (activeExercise === "mindfulness") return (
    <ExerciseLayout title="Mindful Breathing" onClose={closeExercise}>
      <div className="space-y-5 text-center">
        <div style={{ fontSize: "2.5rem" }}>💫</div>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.2rem" }}>Breathe & Reset</h2>
          <p style={{ color: T.muted, fontSize: "0.8rem", fontFamily: "Georgia, serif", fontStyle: "italic", marginTop: 4 }}>Complete 3 full cycles of 4-7-8 breathing.</p>
        </div>
        <BreathingTimer onComplete={() => setBreathDone(true)} />
        {breathDone && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <QuestBtn onClick={() => completeExercise(120, "mindfulness")}><Star size={14} fill="white" /> Complete +120 XP</QuestBtn>
          </motion.div>
        )}
      </div>
    </ExerciseLayout>
  );

  // ── HOME SCREEN ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#2d1a0c" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #b8954a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const level  = userData?.level ?? 1;
  const totalXP = userData?.xp ?? 0;

  return (
    <div className="min-h-screen pb-28" style={{
      background: "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
    }}>
      <Toaster position="top-center" richColors />
      <style>{`@keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}`}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,180,60,0.12), transparent 65%)",
      }} />
      {/* Floating sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        {[{l:"7%",t:"12%"},{l:"88%",t:"18%"},{l:"18%",t:"80%"},{l:"82%",t:"72%"},{l:"50%",t:"5%"}].map((p,i)=>(
          <div key={i} className="absolute rounded-full"
            style={{ left: p.l, top: p.t, width: 5, height: 5, background: i%2===0 ? "rgba(255,230,140,0.7)" : "rgba(180,240,200,0.6)",
              animation: `pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay: `${i*0.35}s` }} />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 px-5 pt-8 pb-5" style={{ borderBottom: "1px solid rgba(200,160,74,0.15)" }}>
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.3rem" }}>
              AI Brain <span style={{ color: "#7aab6a" }}>Gym</span>
            </h1>
            <p style={{ color: T.muted, fontSize: "0.72rem", fontFamily: "Georgia, serif", fontStyle: "italic" }}>AI-powered recovery exercises</p>
          </div>
          {/* XP badge styled as a wooden plaque */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "linear-gradient(180deg, rgba(200,160,74,0.18), rgba(200,160,74,0.08))",
            border: "1.5px solid rgba(200,160,74,0.35)",
            borderRadius: 14, padding: "6px 12px",
          }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.75rem" }}>Lv {level}</span>
            <span style={{ color: "rgba(200,160,74,0.4)" }}>·</span>
            <Star size={11} className="text-yellow-400" fill="currentColor" />
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: T.gold, fontSize: "0.75rem" }}>{totalXP.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5 py-5 max-w-lg mx-auto space-y-3">

        {/* Exercise cards */}
        {EXERCISES.map(ex => {
          const locked = level < ex.minLevel;
          return (
            <motion.button key={ex.id}
              whileTap={locked ? {} : { scale: 0.97 }}
              onClick={() => !locked && setActiveExercise(ex.id)}
              disabled={locked}
              className="w-full text-left transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(90,52,24,0.7) 0%, rgba(58,32,16,0.8) 100%)",
                border: `1.5px solid rgba(200,160,74,${locked ? "0.1" : "0.28"})`,
                borderRadius: 18,
                padding: "16px",
                boxShadow: locked ? "none" : "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,220,130,0.06)",
                opacity: locked ? 0.45 : 1,
                cursor: locked ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 14,
              }}
              onMouseEnter={e => !locked && (e.currentTarget.style.background = "linear-gradient(135deg, rgba(110,64,28,0.8) 0%, rgba(72,40,20,0.85) 100%)")}
              onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(90,52,24,0.7) 0%, rgba(58,32,16,0.8) 100%)")}
            >
              {/* Icon plaque */}
              <div style={{
                width: 50, height: 50, flexShrink: 0, borderRadius: 13,
                background: "linear-gradient(180deg, rgba(200,160,74,0.18), rgba(200,160,74,0.06))",
                border: "1.5px solid rgba(200,160,74,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", position: "relative",
                boxShadow: "inset 0 1px 0 rgba(255,220,130,0.1)",
              }}>
                {(() => {
  const Icon = ex.icon;
  return <Icon size={22} style={{ color: ex.accent }} />;
})()}
                {locked && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    background: "#6a4820", border: "1px solid #b8954a",
                    color: T.gold, fontSize: "0.55rem", padding: "1px 5px",
                    borderRadius: 99, fontFamily: "Georgia, serif", fontWeight: 700,
                  }}>L{ex.minLevel}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem", lineHeight: 1.3 }}>{ex.title}</h3>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: T.muted, marginTop: 2, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {locked ? `Unlock at Level ${ex.minLevel}` : ex.subtitle}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{
                  background: "rgba(200,160,74,0.15)", border: "1px solid rgba(200,160,74,0.25)",
                  padding: "2px 8px", borderRadius: 8,
                  fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.7rem",
                }}>+{ex.xp} XP</span>
                {!locked && <ChevronRight size={13} style={{ color: T.muted }} />}
              </div>
            </motion.button>
          );
        })}

        {/* AI tip scroll */}
        <div style={{
          background: "linear-gradient(135deg, rgba(90,52,24,0.6), rgba(58,32,16,0.7))",
          border: "1.5px solid rgba(200,160,74,0.2)",
          borderRadius: 18, padding: "16px",
          boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)",
        }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.85rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={14} style={{ color: "#f0c040" }} fill="#f0c040" />
            Sage's Wisdom
          </h3>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            Each quest is capped at once per day to forge a true habit — not mere XP farming. Return at dawn to earn again, Seeker.
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}