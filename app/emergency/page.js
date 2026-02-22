"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, increment, updateDoc } from "firebase/firestore";
import {
  Phone, Heart, Wind, Clock, Star, ChevronRight,
  ChevronLeft, Shield, Zap, Eye, Hand, Ear, Smile,
  AlertTriangle, CheckCircle2, X, ArrowRight, Flame,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

// ─── Helplines ────────────────────────────────────────────────────────────────
const HELPLINES = [
  { name: "iCall",            number: "9152987821", desc: "Mental health support",    color: "bg-blue-50   border-blue-200   text-blue-700"   },
  { name: "Vandrevala Fdn",   number: "18602662345", desc: "24/7 crisis helpline",    color: "bg-purple-50 border-purple-200 text-purple-700" },
  { name: "AASRA",            number: "9820466627",  desc: "Emotional support",        color: "bg-rose-50   border-rose-200   text-rose-700"   },
];

// ─── Grounding steps ──────────────────────────────────────────────────────────
const GROUND_STEPS = [
  { n: 5, sense: "SEE",   icon: Eye,    color: "from-sky-400 to-blue-500",       prompt: "Name 5 things you can see right now.",        hint: "Look slowly around the room — a colour, shape, object, shadow, texture." },
  { n: 4, sense: "TOUCH", icon: Hand,   color: "from-emerald-400 to-teal-500",   prompt: "Notice 4 things you can physically feel.",   hint: "Your feet on the floor, clothes on your skin, temperature of the air, the chair under you." },
  { n: 3, sense: "HEAR",  icon: Ear,    color: "from-violet-400 to-purple-500",  prompt: "Listen for 3 sounds around you.",             hint: "Traffic outside, your own breathing, a distant voice, a humming appliance." },
  { n: 2, sense: "SMELL", icon: Wind,   color: "from-orange-400 to-amber-500",   prompt: "Notice 2 things you can smell.",              hint: "The air, your clothes, coffee, soap — or just take 2 slow deep breaths." },
  { n: 1, sense: "TASTE", icon: Smile,  color: "from-rose-400 to-pink-500",      prompt: "Name 1 thing you can taste.",                 hint: "Drink some water, notice the taste of your mouth — bring yourself fully here." },
];

// ─── Breathing phases ─────────────────────────────────────────────────────────
const BREATH_PHASES = [
  { label: "Inhale",  duration: 4, grad: "from-sky-400 to-blue-500"      },
  { label: "Hold",    duration: 4, grad: "from-violet-400 to-purple-500" },
  { label: "Exhale",  duration: 4, grad: "from-emerald-400 to-teal-500"  },
];

// ─── Box breathing component ──────────────────────────────────────────────────
function BoxBreathing({ onDone }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BREATH_PHASES[0].duration);
  const [cycles,   setCycles]   = useState(0);
  const [running,  setRunning]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPhaseIdx(pi => {
            const next = (pi + 1) % BREATH_PHASES.length;
            if (next === 0) setCycles(c => { const d = c + 1; if (d >= 4) { clearInterval(ref.current); setRunning(false); setTimeout(onDone, 400); } return d; });
            return next;
          });
          return BREATH_PHASES[(phaseIdx + 1) % BREATH_PHASES.length].duration;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, phaseIdx]);

  const phase = BREATH_PHASES[phaseIdx];
  const scale = running
    ? phaseIdx === 0 ? 0.6 + (1 - timeLeft / phase.duration) * 0.4
    : phaseIdx === 2 ? 1   - (1 - timeLeft / phase.duration) * 0.4
    : 1 : 0.55;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Cycle dots */}
      <div className="flex gap-2">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i < cycles ? "bg-emerald-500" : "bg-slate-200"}`} />
        ))}
      </div>

      {/* Animated orb */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <motion.div animate={{ scale }} transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${running ? phase.grad : "from-slate-200 to-slate-300"} opacity-15`} />
        <motion.div animate={{ scale: scale * 0.68 }} transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`w-28 h-28 rounded-full bg-gradient-to-br ${running ? phase.grad : "from-slate-200 to-slate-300"} flex items-center justify-center shadow-2xl`}>
          <span className="text-white font-black text-3xl tabular-nums">{running ? timeLeft : "·"}</span>
        </motion.div>
        {/* Ring label */}
        {running && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-slate-100 px-3 py-1 rounded-full shadow text-xs font-black text-slate-700 whitespace-nowrap">
            {phase.label}
          </div>
        )}
      </div>

      {!running && cycles < 4 && (
        <button onClick={() => { setRunning(true); setPhaseIdx(0); setTimeLeft(BREATH_PHASES[0].duration); }}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">
          {cycles === 0 ? "Start Breathing" : "Continue"}
        </button>
      )}

      {!running && (
        <p className="text-xs text-slate-400 text-center">
          {cycles >= 4 ? "✅ All 4 cycles complete! Well done." : "4 sec inhale · 4 sec hold · 4 sec exhale · 4 cycles"}
        </p>
      )}
    </div>
  );
}

// ─── 5-4-3-2-1 Grounding ─────────────────────────────────────────────────────
function Grounding({ onDone }) {
  const [idx,    setIdx]    = useState(0);
  const [inputs, setInputs] = useState(Array(5).fill(""));

  const step  = GROUND_STEPS[idx];
  const Icon  = step.icon;
  const done  = idx >= GROUND_STEPS.length;

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 text-center">
        <div className="text-6xl">🌿</div>
        <h3 className="text-2xl font-black text-slate-900">You're grounded</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          You just brought yourself back to the present moment. The craving doesn't control you.
        </p>
        <button onClick={onDone}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
          <CheckCircle2 size={17} /> I Feel Calmer +50 XP
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Step progress */}
      <div className="flex gap-1.5">
        {GROUND_STEPS.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= idx ? "bg-emerald-500" : "bg-slate-100"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          className={`rounded-3xl bg-gradient-to-br ${step.color} p-6 text-white`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{step.sense}</p>
              <p className="font-black text-lg leading-tight">{step.n} things</p>
            </div>
          </div>
          <p className="font-semibold text-sm mb-1">{step.prompt}</p>
          <p className="text-white/70 text-xs leading-relaxed">{step.hint}</p>
        </motion.div>
      </AnimatePresence>

      {/* Input */}
      <textarea
        rows={2}
        placeholder={`Type what you ${step.sense.toLowerCase()}...`}
        value={inputs[idx]}
        onChange={e => setInputs(prev => { const n = [...prev]; n[idx] = e.target.value; return n; })}
        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-none transition"
      />

      <div className="flex gap-3">
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 active:scale-95 transition-transform text-sm flex items-center justify-center gap-1">
            <ChevronLeft size={15} /> Back
          </button>
        )}
        <button onClick={() => setIdx(i => i + 1)}
          className={`flex-1 py-3.5 rounded-2xl font-black text-white active:scale-95 transition-transform text-sm flex items-center justify-center gap-1 bg-gradient-to-r ${step.color} shadow-lg`}>
          {idx < GROUND_STEPS.length - 1 ? <><span>Next</span><ChevronRight size={15} /></> : <><CheckCircle2 size={15} /><span>Done</span></>}
        </button>
      </div>
    </div>
  );
}

// ─── Craving delay timer ──────────────────────────────────────────────────────
function DelayTimer({ onDone }) {
  const TOTAL = 15 * 60;
  const [started,  setStarted]  = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [done,     setDone]     = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!started || done) return;
    ref.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(ref.current); setDone(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [started, done]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct  = ((TOTAL - timeLeft) / TOTAL) * 100;
  const R = 70;
  const C = 2 * Math.PI * R;

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-5">
      <div className="text-7xl">🏆</div>
      <h3 className="text-2xl font-black text-slate-900">You crushed it!</h3>
      <p className="text-slate-400 text-sm">15 minutes just proved the craving was temporary. It always is.</p>
      <button onClick={onDone}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
        <Star size={16} fill="white" /> Claim Victory +80 XP
      </button>
    </motion.div>
  );

  if (!started) return (
    <div className="space-y-5 text-center">
      <div className="text-5xl">⏳</div>
      <h3 className="text-xl font-black text-slate-900">The 15-Minute Rule</h3>
      <p className="text-slate-500 text-sm leading-relaxed">
        Every craving peaks and fades within 15 minutes. Start the timer and distract yourself — it will pass.
      </p>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-left space-y-2">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">While you wait:</p>
        {["Drink a cold glass of water 💧","Walk to another room 🚶","Text a friend something funny 😄","Do 10 jumping jacks 🏃","Wash your face with cold water 🌊"].map((t,i) => (
          <p key={i} className="text-sm text-slate-600 font-medium">{t}</p>
        ))}
      </div>
      <button onClick={() => setStarted(true)}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform shadow-lg shadow-indigo-200">
        Start Timer
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={R} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle cx="80" cy="80" r={R} fill="none" stroke="#6366f1" strokeWidth="10"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800 tabular-nums">
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </span>
          <span className="text-xs text-slate-400 font-semibold">remaining</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm text-center">Hold on — the peak is almost over.</p>
      <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-sm font-medium text-indigo-700 text-center">
        💡 Try drinking cold water right now
      </div>
    </div>
  );
}

// ─── Tool definitions (rendered as cards on home) ─────────────────────────────
const TOOLS = [
  { id: "breathe",  label: "Box Breathing",       desc: "Reset in 4 minutes",        emoji: "🫁", grad: "from-blue-500 to-indigo-500",    bg: "bg-blue-50",   border: "border-blue-100"   },
  { id: "ground",   label: "5-4-3-2-1 Grounding", desc: "Come back to now",           emoji: "🌿", grad: "from-emerald-500 to-teal-500",   bg: "bg-emerald-50",border: "border-emerald-100"},
  { id: "delay",    label: "15-Min Timer",         desc: "Ride out the craving",       emoji: "⏱️", grad: "from-indigo-500 to-purple-500",  bg: "bg-indigo-50", border: "border-indigo-100" },
  { id: "helpline", label: "Call a Helpline",      desc: "You don't have to do alone", emoji: "📞", grad: "from-rose-500 to-pink-500",      bg: "bg-rose-50",   border: "border-rose-100"   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmergencyPage() {
  const [userData,   setUserData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [sosActive,  setSosActive]  = useState(false);

  // ── Load user ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  // ── Log craving event + award XP ────────────────────────────────────────
  const logAndAward = async (toolId, xp) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid, "cravingLogs", `${toolId}-${Date.now()}`),
        { tool: toolId, xpEarned: xp, timestamp: serverTimestamp() }
      );
      if (xp > 0) {
        await updateDoc(doc(db, "users", user.uid), { xp: increment(xp) });
        setUserData(prev => ({ ...prev, xp: (prev?.xp || 0) + xp }));
        toast.success(`Craving resisted! +${xp} XP 💪`, { duration: 3000 });
      }
    } catch (e) { console.error(e); }
  };

  const finishTool = (toolId, xp = 0) => {
    logAndAward(toolId, xp);
    setActiveTool(null);
  };

  // ── SOS ─────────────────────────────────────────────────────────────────
  const handleSOS = async () => {
    setSosActive(true);
    await logAndAward("sos", 0);
    setTimeout(() => setSosActive(false), 4000);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Active tool screens ──────────────────────────────────────────────────
  if (activeTool) {
    const tool = TOOLS.find(t => t.id === activeTool);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col px-5 pt-8 pb-32 max-w-lg mx-auto">
        <Toaster position="top-center" richColors />
        <header className="flex items-center justify-between mb-7 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Craving Help</p>
            <h1 className="text-lg font-black text-slate-900">{tool.label}</h1>
          </div>
          <button onClick={() => setActiveTool(null)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <X size={17} className="text-slate-600" />
          </button>
        </header>

        {activeTool === "breathe"  && <BoxBreathing onDone={() => { toast.success("Breathing complete! You're calmer now 🌊"); finishTool("breathe", 60); }} />}
        {activeTool === "ground"   && <Grounding    onDone={() => finishTool("ground",  50)} />}
        {activeTool === "delay"    && <DelayTimer    onDone={() => finishTool("delay",   80)} />}

        {activeTool === "helpline" && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-rose-700 text-sm font-medium">
                You don't have to face this alone. These counsellors are trained, anonymous, and here for you.
              </p>
            </div>
            {HELPLINES.map(h => (
              <a key={h.name} href={`tel:${h.number}`}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${h.color} active:scale-95 transition-transform`}>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">{h.name}</p>
                  <p className="text-xs opacity-70">{h.desc}</p>
                </div>
                <div>
                  <p className="font-black text-sm">{h.number}</p>
                  <p className="text-xs opacity-60 text-right">Tap to call</p>
                </div>
              </a>
            ))}
            <button onClick={() => finishTool("helpline", 30)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform mt-2 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> I Got Support +30 XP
            </button>
          </div>
        )}

        <BottomNav />
      </div>
    );
  }

  // ── Home screen ──────────────────────────────────────────────────────────
  const daysSober = userData?.sobrietyDate
    ? Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000)
    : 0;
  const name      = (userData?.name ?? "Friend").split(" ")[0];
  const whyReason = userData?.assessmentAnswers?.[8] || null; // primary goal from onboarding

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <Toaster position="top-center" richColors />

      {/* ── SOS overlay ── */}
      <AnimatePresence>
        {sosActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-600 flex flex-col items-center justify-center text-white text-center px-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}
              className="text-8xl mb-6">🛡️</motion.div>
            <h2 className="text-3xl font-black mb-3">You are safe.</h2>
            <p className="text-blue-200 text-lg font-medium mb-2">This feeling is temporary.</p>
            <p className="text-blue-300 text-sm">Take one slow breath. You've got this.</p>
            <motion.div
              initial={{ width: 0 }} animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1.5 bg-white/40"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="bg-gradient-to-b from-rose-500 to-rose-600 px-5 pt-12 pb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-rose-200" />
            <p className="text-rose-200 text-xs font-bold uppercase tracking-widest">Craving Help</p>
          </div>
          <h1 className="text-2xl font-black mb-1">Hey {name}, hold on. 💪</h1>
          <p className="text-rose-100 text-sm leading-relaxed">
            Cravings are temporary. Use one of these tools right now — every one you resist makes you stronger.
          </p>

          {/* Streak reminder */}
          {daysSober > 0 && (
            <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Flame size={20} className="text-yellow-300 shrink-0" />
              <p className="text-sm font-bold">
                {daysSober} day{daysSober !== 1 ? "s" : ""} sober — don't break that streak now.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto">

        {/* ── SOS Button ── */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSOS}
          className="w-full -mt-5 bg-white border-4 border-rose-500 text-rose-600 py-5 rounded-3xl font-black text-lg shadow-xl shadow-rose-100 flex items-center justify-center gap-3 mb-5"
        >
          <Shield size={24} fill="currentColor" className="text-rose-500" />
          SOS — I Need Help Right Now
        </motion.button>

        {/* ── "Why I'm doing this" reminder ── */}
        {whyReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <Star size={16} className="text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-0.5">Your goal</p>
              <p className="text-sm font-semibold text-amber-800">{whyReason}</p>
            </div>
          </div>
        )}

        {/* ── Tool cards ── */}
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Choose a tool</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {TOOLS.map(tool => (
            <motion.button
              key={tool.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTool(tool.id)}
              className={`${tool.bg} border-2 ${tool.border} rounded-3xl p-5 text-left flex flex-col gap-3 active:scale-95 transition-transform`}
            >
              <span className="text-3xl">{tool.emoji}</span>
              <div>
                <p className="font-black text-slate-900 text-sm leading-tight">{tool.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{tool.desc}</p>
              </div>
              <div className={`self-start text-xs font-black text-white bg-gradient-to-r ${tool.grad} px-2.5 py-1 rounded-full`}>
                Use now →
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Motivational quote ── */}
        <div
          className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0891b2 100%)" }}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Remember this</p>
            <p className="text-white font-semibold text-sm leading-relaxed italic">
              "You don't have to be perfect. You just have to keep going. Every craving you survive is a vote for the person you're becoming."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Heart size={14} className="text-rose-300" fill="currentColor" />
              <p className="text-blue-300 text-xs">From your recovery community</p>
            </div>
          </div>
        </div>

        {/* ── What happens in your brain ── */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-4">
          <p className="font-black text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Zap size={15} className="text-yellow-500" fill="currentColor" />
            What's happening in your brain
          </p>
          {[
            { step: "1", text: "The craving triggers your brain's reward circuit — it's not weakness, it's chemistry." },
            { step: "2", text: "Peak craving intensity lasts 5–20 minutes then drops — always." },
            { step: "3", text: "Each time you resist, your brain rewires. The next craving will be weaker." },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3 mb-2.5 last:mb-0">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">{step}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* ── Emergency helpline shortcut ── */}
        <a href="tel:9152987821"
          className="w-full flex items-center justify-center gap-2 border-2 border-rose-200 bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-transform mb-2">
          <Phone size={16} />
          Emergency: iCall · 9152987821
        </a>

      </div>

      <BottomNav />
    </div>
  );
}