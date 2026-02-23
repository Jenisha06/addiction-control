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

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  gold:       "#c8a060",
  goldLight:  "#f7e0bb",
  muted:      "#a07848",
  text:       "#3d2410",
  parchment:  "linear-gradient(180deg, #f5e8c8 0%, #ede0b4 100%)",
  cardBg:     "linear-gradient(135deg, rgba(90,52,24,0.72) 0%, rgba(58,32,16,0.82) 100%)",
  cardBorder: "rgba(200,160,74,0.28)",
  pageBg:     "linear-gradient(160deg, #2d1a0c 0%, #3d2210 40%, #2a1808 100%)",
  questBtn:   "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
  questShadow:"0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
  woodLight:  "linear-gradient(180deg, #d4b483 0%, #b8955c 50%, #a07840 100%)",
  btnBorder:  "#8a6030",
  btnShadow:  "0 3px 0 #6a4820, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,230,160,0.4)",
};

// ─── Helplines ────────────────────────────────────────────────────────────────
const HELPLINES = [
  { name: "iCall",          number: "9152987821",  desc: "Mental health support", color: "#6ab4d8", bg: "rgba(106,180,216,0.15)", border: "rgba(106,180,216,0.4)" },
  { name: "Vandrevala Fdn", number: "18602662345", desc: "24/7 crisis helpline",  color: "#9a78c0", bg: "rgba(154,120,192,0.15)", border: "rgba(154,120,192,0.4)" },
  { name: "AASRA",          number: "9820466627",  desc: "Emotional support",      color: "#c06060", bg: "rgba(192,96,96,0.15)",  border: "rgba(192,96,96,0.4)"  },
];

// ─── Grounding steps ──────────────────────────────────────────────────────────
const GROUND_STEPS = [
  { n: 5, sense: "SEE",   icon: Eye,   color: "#6ab4d8", glyph: "👁️",  prompt: "Name 5 things you can see right now.",       hint: "Look slowly around the room — a colour, shape, object, shadow, texture." },
  { n: 4, sense: "TOUCH", icon: Hand,  color: "#7aab6a", glyph: "🤲",  prompt: "Notice 4 things you can physically feel.",  hint: "Your feet on the floor, clothes on your skin, temperature of the air, the chair under you." },
  { n: 3, sense: "HEAR",  icon: Ear,   color: "#9a78c0", glyph: "👂",  prompt: "Listen for 3 sounds around you.",            hint: "Traffic outside, your own breathing, a distant voice, a humming appliance." },
  { n: 2, sense: "SMELL", icon: Wind,  color: "#c8a060", glyph: "🌬️", prompt: "Notice 2 things you can smell.",             hint: "The air, your clothes, coffee, soap — or just take 2 slow deep breaths." },
  { n: 1, sense: "TASTE", icon: Smile, color: "#c08060", glyph: "👅",  prompt: "Name 1 thing you can taste.",                hint: "Drink some water, notice the taste of your mouth — bring yourself fully here." },
];

// ─── Breathing phases ─────────────────────────────────────────────────────────
const BREATH_PHASES = [
  { label: "Inhale",  duration: 4, color: "#6ab4d8" },
  { label: "Hold",    duration: 4, color: "#9a78c0" },
  { label: "Exhale",  duration: 4, color: "#7aab6a" },
];

// ─── Tools ────────────────────────────────────────────────────────────────────
const TOOLS = [
  { id: "breathe",  label: "Box Breathing",       desc: "Reset in 4 minutes",         emoji: "🫁", color: "#6ab4d8", border: "rgba(106,180,216,0.35)", bg: "rgba(106,180,216,0.12)" },
  { id: "ground",   label: "5-4-3-2-1 Grounding", desc: "Come back to now",            emoji: "🌿", color: "#7aab6a", border: "rgba(122,171,106,0.35)", bg: "rgba(122,171,106,0.12)" },
  { id: "delay",    label: "15-Min Timer",         desc: "Ride out the craving",        emoji: "⏱️", color: "#9a78c0", border: "rgba(154,120,192,0.35)", bg: "rgba(154,120,192,0.12)" },
  { id: "helpline", label: "Call a Helpline",      desc: "You don't have to face this alone", emoji: "📞", color: "#c06060", border: "rgba(192,96,96,0.35)", bg: "rgba(192,96,96,0.12)" },
];

// ─── Box Breathing ────────────────────────────────────────────────────────────
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* Cycle dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < cycles ? "#7aab6a" : "rgba(200,160,74,0.18)", border: "1.5px solid rgba(200,160,74,0.3)", transition: "all 0.5s" }} />
        ))}
      </div>

      {/* Orb */}
      <div style={{ position: "relative", width: 168, height: 168, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ scale }} transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, borderRadius: "50%", background: running ? `radial-gradient(circle, ${phase.color}40, transparent)` : "rgba(200,160,74,0.08)" }} />
        <motion.div animate={{ scale: scale * 0.68 }} transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ width: 100, height: 100, borderRadius: "50%", background: running ? `linear-gradient(135deg, ${phase.color}, ${phase.color}80)` : "rgba(200,160,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: running ? `0 0 32px ${phase.color}44` : "none", border: `2px solid ${running ? phase.color : "rgba(200,160,74,0.3)"}44` }}>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1.8rem", color: running ? "#fff" : T.gold }}>{running ? timeLeft : "·"}</span>
        </motion.div>
        {running && (
          <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: "rgba(200,160,74,0.15)", border: "1px solid rgba(200,160,74,0.3)", padding: "3px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.7rem", letterSpacing: "0.08em" }}>{phase.label}</span>
          </div>
        )}
      </div>

      {!running && cycles < 4 && (
        <button onClick={() => { setRunning(true); setPhaseIdx(0); setTimeLeft(BREATH_PHASES[0].duration); }}
          className="transition-all active:scale-[0.97]"
          style={{ background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "12px 28px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.08em", cursor: "pointer" }}>
          {cycles === 0 ? "Begin Breathing" : "Continue"}
        </button>
      )}

      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: T.muted, fontStyle: "italic", textAlign: "center" }}>
        {cycles >= 4 ? "✅ All 4 cycles complete! Well done, Seeker." : "4s inhale · 4s hold · 4s exhale · 4 cycles"}
      </p>
    </div>
  );
}

// ─── 5-4-3-2-1 Grounding ─────────────────────────────────────────────────────
function Grounding({ onDone }) {
  const [idx,    setIdx]    = useState(0);
  const [inputs, setInputs] = useState(Array(5).fill(""));
  const done = idx >= GROUND_STEPS.length;

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem" }}>🌿</div>
        <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.4rem" }}>You are grounded, Seeker</h3>
        <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", fontStyle: "italic", lineHeight: 1.7, maxWidth: 280 }}>
          You just brought yourself back to the present. The craving does not control you.
        </p>
        <button onClick={onDone}
          className="transition-all active:scale-[0.97]"
          style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <CheckCircle2 size={16} /> I Feel Calmer +50 XP
        </button>
      </motion.div>
    );
  }

  const step = GROUND_STEPS[idx];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Step progress */}
      <div style={{ display: "flex", gap: 6 }}>
        {GROUND_STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: i <= idx ? step.color : "rgba(200,160,74,0.14)", transition: "background 0.5s", border: "1px solid rgba(200,160,74,0.15)" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          style={{ borderRadius: 18, background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`, border: `2px solid ${step.color}50`, padding: "18px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, background: `${step.color}25`, border: `1.5px solid ${step.color}50`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              {step.glyph}
            </div>
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: step.color, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{step.sense}</p>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1rem" }}>{step.n} things</p>
            </div>
          </div>
          <p style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: T.goldLight, fontSize: "0.85rem", marginBottom: 5 }}>{step.prompt}</p>
          <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.75rem", lineHeight: 1.65, fontStyle: "italic" }}>{step.hint}</p>
        </motion.div>
      </AnimatePresence>

      <textarea rows={2}
        placeholder={`What you ${step.sense.toLowerCase()}...`}
        value={inputs[idx]}
        onChange={e => setInputs(prev => { const n = [...prev]; n[idx] = e.target.value; return n; })}
        style={{ width: "100%", background: T.parchment, border: `2px solid #b8954a`, borderRadius: 12, padding: "12px 14px", fontSize: "0.85rem", color: T.text, fontFamily: "Georgia, serif", outline: "none", resize: "none", boxSizing: "border-box", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)" }}
        onFocus={e => (e.target.style.borderColor = step.color)}
        onBlur={e => (e.target.style.borderColor = "#b8954a")}
      />

      <div style={{ display: "flex", gap: 10 }}>
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            style={{ flex: 1, padding: "12px", borderRadius: 20, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.8rem", background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.22)", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <ChevronLeft size={14} /> Back
          </button>
        )}
        <button onClick={() => setIdx(i => i + 1)}
          className="transition-all active:scale-[0.97]"
          style={{ flex: 1, padding: "12px", borderRadius: 20, fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "0.8rem", background: `linear-gradient(135deg, ${step.color}, ${step.color}80)`, border: `2px solid ${step.color}`, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: `0 3px 0 ${step.color}55` }}>
          {idx < GROUND_STEPS.length - 1 ? <><span>Next</span><ChevronRight size={14} /></> : <><CheckCircle2 size={14} /><span>Done</span></>}
        </button>
      </div>
    </div>
  );
}

// ─── Delay Timer ─────────────────────────────────────────────────────────────
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
  const R = 70, C = 2 * Math.PI * R;

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: "4rem" }}>🏆</div>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.5rem" }}>Victory, Seeker!</h3>
      <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", fontStyle: "italic", lineHeight: 1.7 }}>15 minutes proved the craving was temporary. It always is.</p>
      <button onClick={onDone}
        className="transition-all active:scale-[0.97]"
        style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Star size={15} fill="white" /> Claim Victory +80 XP
      </button>
    </motion.div>
  );

  if (!started) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "center" }}>
      <div style={{ fontSize: "3rem" }}>⏳</div>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.2rem" }}>The 15-Minute Rule</h3>
      <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", fontStyle: "italic", lineHeight: 1.7 }}>
        Every craving peaks and fades within 15 minutes. Start the timer and distract yourself — it will pass.
      </p>
      {/* Parchment tips */}
      <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 14, padding: "14px 16px", textAlign: "left", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)" }}>
        <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>While you wait:</p>
        {["Drink a cold glass of water 💧","Walk to another room 🚶","Text a friend something funny 😄","Do 10 jumping jacks 🏃","Wash your face with cold water 🌊"].map((tip, i) => (
          <p key={i} style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: T.text, marginBottom: 5, lineHeight: 1.5 }}>{tip}</p>
        ))}
      </div>
      <button onClick={() => setStarted(true)}
        className="transition-all active:scale-[0.97]"
        style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
        Start Timer
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      {/* Radial timer */}
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(200,160,74,0.15)" strokeWidth="8" />
          <circle cx="80" cy="80" r={R} fill="none" stroke="#c8a060" strokeWidth="8"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 6px rgba(200,160,74,0.4))" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.9rem", lineHeight: 1 }}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </span>
          <span style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.65rem", letterSpacing: "0.1em" }}>remaining</span>
        </div>
      </div>
      <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.8rem", fontStyle: "italic", textAlign: "center" }}>Hold on — the peak is almost over, Seeker.</p>
      <div style={{ width: "100%", background: T.parchment, border: "2px solid #b8954a", borderRadius: 12, padding: "10px 14px", textAlign: "center", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: T.text }}>💡 Try drinking cold water right now</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmergencyPage() {
  const [userData,   setUserData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [sosActive,  setSosActive]  = useState(false);

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

  const logAndAward = async (toolId, xp) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "cravingLogs", `${toolId}-${Date.now()}`),
        { tool: toolId, xpEarned: xp, timestamp: serverTimestamp() });
      if (xp > 0) {
        await updateDoc(doc(db, "users", user.uid), { xp: increment(xp) });
        setUserData(prev => ({ ...prev, xp: (prev?.xp || 0) + xp }));
        toast.success(`Craving resisted! +${xp} XP ⚔️`, { duration: 3000 });
      }
    } catch (e) { console.error(e); }
  };

  const finishTool = (toolId, xp = 0) => { logAndAward(toolId, xp); setActiveTool(null); };

  const handleSOS = async () => {
    setSosActive(true);
    await logAndAward("sos", 0);
    setTimeout(() => setSosActive(false), 4000);
  };

  if (loading) return (
    <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: "3px solid #b8954a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  // ── Active tool screen ────────────────────────────────────────────────────
  if (activeTool) {
    const tool = TOOLS.find(t => t.id === activeTool);
    return (
      <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "28px 20px 120px", maxWidth: 480, margin: "0 auto" }}>
        <Toaster position="top-center" richColors />
        <style>{`@keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}`}</style>

        {/* Atmospheric glow */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />

        {/* Header */}
        <div className="relative z-10" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>Craving Shield</p>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.1rem" }}>{tool.label}</h1>
          </div>
          <button onClick={() => setActiveTool(null)}
            style={{ width: 36, height: 36, background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.22)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.gold }}>
            <X size={16} />
          </button>
        </div>

        <div className="relative z-10" style={{ flex: 1 }}>
          {activeTool === "breathe"  && <BoxBreathing onDone={() => { toast.success("Breathing complete! Your spirit is calmer 🌊"); finishTool("breathe", 60); }} />}
          {activeTool === "ground"   && <Grounding    onDone={() => finishTool("ground", 50)} />}
          {activeTool === "delay"    && <DelayTimer    onDone={() => finishTool("delay",  80)} />}

          {activeTool === "helpline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Warning parchment */}
              <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
                <AlertTriangle size={16} style={{ color: "#b8954a", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: T.text, lineHeight: 1.65 }}>
                  You need not face this alone. These counsellors are trained, anonymous, and here for you.
                </p>
              </div>

              {HELPLINES.map(h => (
                <a key={h.name} href={`tel:${h.number}`}
                  className="transition-all active:scale-[0.97]"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, background: h.bg, border: `2px solid ${h.border}`, textDecoration: "none" }}>
                  <div style={{ width: 44, height: 44, background: "rgba(200,160,74,0.1)", border: `1.5px solid ${h.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone size={20} style={{ color: h.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem" }}>{h.name}</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, fontStyle: "italic" }}>{h.desc}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: h.color, fontSize: "0.82rem" }}>{h.number}</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted }}>Tap to call</p>
                  </div>
                </a>
              ))}

              <button onClick={() => finishTool("helpline", 30)}
                className="transition-all active:scale-[0.97]"
                style={{ width: "100%", background: T.woodLight, border: `2px solid ${T.btnBorder}`, borderRadius: 24, padding: "13px 20px", boxShadow: T.btnShadow, color: T.text, fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                <CheckCircle2 size={15} /> I Got Support +30 XP
              </button>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Home screen ───────────────────────────────────────────────────────────
  const daysSober = userData?.sobrietyDate
    ? Math.floor((Date.now() - new Date(userData.sobrietyDate).getTime()) / 86400000) : 0;
  const name      = (userData?.name ?? "Seeker").split(" ")[0];
  const whyReason = userData?.assessmentAnswers?.[8] || null;

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", paddingBottom: 112 }}>
      <Toaster position="top-center" richColors />
      <style>{`@keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}`}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,80,60,0.1), transparent 65%)" }} />
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        {[{l:"6%",t:"10%"},{l:"88%",t:"16%"},{l:"15%",t:"78%"},{l:"82%",t:"70%"}].map((p,i)=>(
          <div key={i} className="absolute rounded-full"
            style={{ left:p.l, top:p.t, width:5, height:5, background:"rgba(255,130,100,0.6)", animation:`pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${i*0.35}s` }} />
        ))}
      </div>

      {/* ── SOS overlay ── */}
      <AnimatePresence>
        {sosActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "linear-gradient(135deg, #2d1a0c, #1a0c04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: "0 40px" }}>
            {/* Arch glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,160,74,0.18), transparent 70%)" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}
              style={{ fontSize: "5rem", marginBottom: 24, position: "relative", zIndex: 1 }}>🛡️</motion.div>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "2rem", marginBottom: 12, position: "relative", zIndex: 1 }}>You are safe.</h2>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "1rem", fontStyle: "italic", marginBottom: 8, position: "relative", zIndex: 1 }}>This feeling is temporary.</p>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", position: "relative", zIndex: 1 }}>Take one slow breath. You've got this, Seeker.</p>
            <motion.div
              initial={{ width: 0 }} animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              style={{ position: "absolute", bottom: 0, left: 0, height: 4, background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: "0 0 0 0" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header banner ── */}
      <div style={{ background: "linear-gradient(180deg, rgba(120,30,20,0.9), rgba(80,20,10,0.85))", padding: "44px 20px 28px", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(200,80,60,0.25)" }}>
        <div style={{ position: "absolute", top: 0, right: 0, opacity: 0.06 }}>
          <Shield size={160} fill="currentColor" style={{ color: "#fff" }} />
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ color: "rgba(255,180,160,0.7)" }} />
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: "rgba(255,180,160,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>Craving Shield</p>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.4rem", marginBottom: 8 }}>Hold fast, {name}. 💪</h1>
          <p style={{ fontFamily: "Georgia, serif", color: "rgba(255,220,180,0.75)", fontSize: "0.82rem", lineHeight: 1.7, fontStyle: "italic" }}>
            Cravings are temporary. Use one of these tools right now — every one you resist makes your legend stronger.
          </p>

          {/* Streak reminder */}
          {daysSober > 0 && (
            <div style={{ marginTop: 14, background: "rgba(200,160,74,0.15)", border: "1.5px solid rgba(200,160,74,0.3)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <Flame size={18} style={{ color: "#f0c840", flexShrink: 0 }} />
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: T.goldLight, fontSize: "0.82rem" }}>
                {daysSober} day{daysSober !== 1 ? "s" : ""} sober — don't break that streak now.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>

        {/* ── SOS Button ── */}
        <motion.button whileTap={{ scale: 0.96 }} onClick={handleSOS}
          style={{ width: "100%", marginTop: -20, background: "linear-gradient(180deg, rgba(90,15,10,0.95), rgba(60,10,5,0.98))", border: "3px solid rgba(200,80,60,0.6)", borderRadius: 24, padding: "18px 20px", fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "0.08em", color: "#ffb0a0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14, cursor: "pointer", boxShadow: "0 4px 0 rgba(120,20,10,0.8), 0 8px 32px rgba(200,50,30,0.3), inset 0 1px 0 rgba(255,180,160,0.15)" }}>
          <Shield size={22} fill="#ffb0a0" style={{ color: "#ffb0a0" }} />
          SOS — I Need Help Right Now
        </motion.button>

        {/* ── Why reminder — parchment ── */}
        {whyReason && (
          <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 14, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
            <Star size={14} style={{ color: "#b8954a", flexShrink: 0, marginTop: 2 }} fill="#b8954a" />
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Your quest</p>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: T.text, fontSize: "0.82rem" }}>{whyReason}</p>
            </div>
          </div>
        )}

        {/* ── Tool grid ── */}
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Choose a shield</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {TOOLS.map(tool => (
            <motion.button key={tool.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTool(tool.id)}
              className="transition-all"
              style={{ background: tool.bg, border: `2px solid ${tool.border}`, borderRadius: 18, padding: "16px 14px", textAlign: "left", display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}>
              <span style={{ fontSize: "2rem" }}>{tool.emoji}</span>
              <div>
                <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem", lineHeight: 1.3 }}>{tool.label}</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.68rem", color: T.muted, marginTop: 3, fontStyle: "italic" }}>{tool.desc}</p>
              </div>
              <div style={{ alignSelf: "flex-start", background: `${tool.color}25`, border: `1.5px solid ${tool.border}`, borderRadius: 99, padding: "3px 10px" }}>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: tool.color, fontSize: "0.65rem", letterSpacing: "0.06em" }}>Use now →</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Motivational quote — wooden arch card ── */}
        <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 20, padding: "18px 18px", marginBottom: 12, position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,220,130,0.06)" }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}>
            <Heart size={90} fill="currentColor" style={{ color: "#f0c840" }} />
          </div>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>ᚠ Remember this</p>
          <p style={{ fontFamily: "Georgia, serif", color: T.goldLight, fontSize: "0.82rem", lineHeight: 1.75, fontStyle: "italic" }}>
            "You don't have to be perfect. You just have to keep going. Every craving you survive is a rune carved into your legend."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <Heart size={12} fill="#c06060" style={{ color: "#c06060" }} />
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted, fontStyle: "italic" }}>From your recovery fellowship</p>
          </div>
        </div>

        {/* ── Brain science — wooden card ── */}
        <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: "16px 16px", marginBottom: 12, boxShadow: "inset 0 1px 0 rgba(255,220,130,0.04)" }}>
          <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={14} style={{ color: "#f0c840" }} fill="#f0c840" /> What's happening in your mind
          </p>
          {[
            { n: "1", text: "The craving triggers your brain's reward circuit — it's not weakness, it's chemistry." },
            { n: "2", text: "Peak craving intensity lasts 5–20 minutes then drops — always." },
            { n: "3", text: "Each time you resist, your brain rewires. The next craving will be weaker." },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, background: "rgba(200,160,74,0.18)", border: "1.5px solid rgba(200,160,74,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.65rem" }}>{n}</span>
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.muted, lineHeight: 1.65, fontStyle: "italic" }}>{text}</p>
            </div>
          ))}
        </div>

        {/* ── Emergency helpline shortcut ── */}
        <a href="tel:9152987821"
          className="transition-all active:scale-[0.97]"
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(192,96,96,0.12)", border: "2px solid rgba(192,96,96,0.3)", borderRadius: 18, padding: "14px 20px", color: "#c06060", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", marginBottom: 8 }}>
          <Phone size={15} />
          Emergency: iCall · 9152987821
        </a>

      </div>

      <BottomNav />
    </div>
  );
}