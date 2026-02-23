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

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { question: "How often do you drink alcohol?",           options: ["Never","Monthly or less","2–4 times a month","2–3 times a week","4+ times a week"] },
  { question: "Do you drink to cope with stress?",         options: ["Never","Rarely","Sometimes","Often","Always"] },
  { question: "Have you tried quitting before?",           options: ["Never","Once","A few times","Many times","Currently trying"] },
  { question: "How do you feel after drinking?",           options: ["Relaxed","Indifferent","Guilty","Anxious","Regretful"] },
  { question: "Do you experience blackouts?",              options: ["Never","Once in a while","Sometimes","Frequently","Regularly"] },
  { question: "Do you feel like you need to drink?",       options: ["Not at all","Occasionally","Daily","All the time"] },
  { question: "Has drinking affected your work or school?",options: ["Never","A little","Somewhat","Significantly"] },
  { question: "How supportive is your environment?",       options: ["Very supportive","Somewhat supportive","Neutral","Unsupportive","Toxic"] },
  { question: "What is your primary goal?",                options: ["Total Sobriety","Moderation","Just Exploring","Other"] },
  { question: "Are you ready to commit?",                  options: ["Fully ready","Mostly ready","Trying my best","Uncertain"] },
];

// ─── Risk scoring ─────────────────────────────────────────────────────────────
const HIGH = new Set(["4+ times a week","Always","Frequently","Regularly","Significantly","All the time","Toxic"]);
const MED  = new Set(["Often","Sometimes","Daily","Somewhat","Unsupportive","Somewhat supportive"]);
const LOW  = new Set(["Rarely","Once in a while","A little","Occasionally"]);

function calcRisk(answers) {
  let score = 0;
  Object.values(answers).forEach(a => {
    if (HIGH.has(a)) score += 3;
    else if (MED.has(a)) score += 2;
    else if (LOW.has(a)) score += 1;
  });
  if (score >= 15) return { label: "High Risk",     color: "#c06060", bg: "rgba(192,96,96,0.15)",  border: "rgba(192,96,96,0.4)"  };
  if (score >= 8)  return { label: "Moderate Risk", color: "#c8a060", bg: "rgba(200,160,74,0.15)", border: "rgba(200,160,74,0.4)" };
  return               { label: "Low Risk",         color: "#7aab6a", bg: "rgba(122,171,106,0.15)",border: "rgba(122,171,106,0.4)"};
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();

  const [step,          setStep]          = useState(0);
  const [currentQ,      setCurrentQ]      = useState(0);
  const [answers,       setAnswers]       = useState({});
  const [sobrietyDate,  setSobrietyDate]  = useState("");
  const [drinkCost,     setDrinkCost]     = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const risk = calcRisk(answers);

  const selectOption = (option) => {
    const updated = { ...answers, [currentQ]: option };
    setAnswers(updated);
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) setCurrentQ(q => q + 1);
      else setStep(2);
    }, 220);
  };

  const goBack = () => {
    if (currentQ > 0) setCurrentQ(q => q - 1);
    else setStep(0);
  };

  const handleFinish = async () => {
    setError("");
    if (!sobrietyDate) { setError("Please select your sobriety start date."); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) { router.push("/login"); return; }
      await setDoc(doc(db, "users", user.uid), {
        riskLevel:           risk.label,
        goalType:            answers[8] || "Moderation",
        assessmentAnswers:   answers,
        sobrietyDate,
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
      }, { merge: true });
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <style>{`
        @keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.6) sepia(1) saturate(2) hue-rotate(5deg)}
      `}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-35">
        {[{l:"6%",t:"10%"},{l:"88%",t:"16%"},{l:"15%",t:"78%"},{l:"82%",t:"70%"},{l:"48%",t:"5%"}].map((p,i)=>(
          <div key={i} className="absolute rounded-full"
            style={{ left:p.l, top:p.t, width:5, height:5, background:i%2===0?"rgba(255,230,140,0.7)":"rgba(180,240,200,0.6)", animation:`pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${i*0.35}s` }} />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Outer glow */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: "radial-gradient(circle at 50% 30%, rgba(255,214,140,0.22), transparent 60%)", filter: "blur(24px)", pointerEvents: "none" }} />

              <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,220,130,0.08)", position: "relative" }}>
                {/* Gold top bar */}
                <div style={{ height: 5, background: "linear-gradient(90deg, #c8a060, #f0c840, #c8a060)" }} />
                {/* Arch rune decoration */}
                <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(200,160,74,0.12)", fontSize: "0.65rem", letterSpacing: "0.3em", fontFamily: "serif", pointerEvents: "none", whiteSpace: "nowrap" }}>
                  ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚺ ᚾ ᛁ
                </div>

                <div style={{ padding: "32px 28px 36px" }}>
                  {/* Icon */}
                  <div style={{ width: 64, height: 64, background: "rgba(200,160,74,0.18)", border: "2px solid rgba(200,160,74,0.4)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "12px auto 20px", boxShadow: "0 0 24px rgba(200,160,74,0.2)" }}>
                    <Heart size={30} fill={T.gold} style={{ color: T.gold }} />
                  </div>

                  <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.5rem", textAlign: "center", marginBottom: 8 }}>Welcome, Seeker.</h1>
                  <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", textAlign: "center", lineHeight: 1.7, fontStyle: "italic", marginBottom: 24 }}>
                    Let us understand where you are so we can forge your personalized recovery path.
                  </p>

                  {/* Steps */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {[
                      "10 quick questions about your habits",
                      "A personalised risk assessment",
                      "Your recovery dashboard, ready to go",
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(200,160,74,0.2)", border: "1.5px solid rgba(200,160,74,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.7rem" }}>{i+1}</span>
                        </div>
                        <span style={{ fontFamily: "Georgia, serif", color: T.goldLight, fontSize: "0.82rem" }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Privacy note — parchment */}
                  <div style={{ background: T.parchment, border: "2px solid #b8954a", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
                    <Lock size={16} style={{ color: "#b8954a", flexShrink: 0 }} />
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.text, lineHeight: 1.55 }}>
                      Anonymous & Secure. Your data is private and never shared.
                    </p>
                  </div>

                  <button onClick={() => setStep(1)} className="transition-all active:scale-[0.97] group"
                    style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 20, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    Let the Quest Begin
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Quiz ── */}
          {step === 1 && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>

              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={goBack}
                    style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.78rem", color: T.muted, background: "none", border: "none", cursor: "pointer" }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {currentQ + 1} / {QUESTIONS.length}
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(200,160,74,0.15)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(200,160,74,0.2)" }}>
                  <motion.div
                    animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99 }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 24, padding: "22px 20px", boxShadow: "0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,220,130,0.06)" }}>
                {/* Gold top bar */}
                <div style={{ height: 4, background: "linear-gradient(90deg, #c8a060, #f0c840, #c8a060)", borderRadius: "99px 99px 0 0", margin: "-22px -20px 18px" }} />

                <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.1rem", lineHeight: 1.4, marginBottom: 16 }}>
                  {QUESTIONS[currentQ].question}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {QUESTIONS[currentQ].options.map((option, idx) => {
                    const selected = answers[currentQ] === option;
                    return (
                      <motion.button key={idx} whileTap={{ scale: 0.97 }} onClick={() => selectOption(option)}
                        style={{
                          width: "100%", padding: "12px 14px", borderRadius: 14, textAlign: "left",
                          fontFamily: "Georgia, serif", fontWeight: selected ? 700 : 500, fontSize: "0.88rem",
                          border: `2px solid ${selected ? "rgba(200,160,74,0.7)" : "rgba(200,160,74,0.18)"}`,
                          background: selected ? "rgba(200,160,74,0.18)" : "rgba(200,160,74,0.05)",
                          color: selected ? T.goldLight : T.muted,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: "pointer", transition: "all 0.15s",
                          boxShadow: selected ? "0 0 14px rgba(200,160,74,0.2)" : "none",
                        }}>
                        {option}
                        <ChevronRight size={15} style={{ color: selected ? T.gold : "rgba(200,160,74,0.3)", flexShrink: 0 }} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Personal Details ── */}
          {step === 2 && (
            <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Outer glow */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: "radial-gradient(circle at 50% 30%, rgba(255,214,140,0.18), transparent 60%)", filter: "blur(24px)", pointerEvents: "none" }} />

              <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,220,130,0.08)", position: "relative" }}>
                <div style={{ height: 5, background: "linear-gradient(90deg, #c8a060, #f0c840, #c8a060)" }} />
                <div style={{ padding: "28px 28px 32px" }}>

                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.35rem", marginBottom: 6 }}>Almost there, Seeker!</h2>
                  <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.78rem", fontStyle: "italic", lineHeight: 1.6, marginBottom: 22 }}>Two quick details to power your legend dashboard.</p>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(192,96,96,0.12)", border: "1.5px solid rgba(192,96,96,0.35)", borderRadius: 14, padding: "10px 14px", marginBottom: 18 }}>
                      <span>⚠️</span>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#c06060" }}>{error}</span>
                    </motion.div>
                  )}

                  {/* Sobriety date */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.muted, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>
                      When did you stop drinking? 🗓️
                    </label>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, fontStyle: "italic", marginBottom: 8 }}>This powers your sobriety timer on the dashboard.</p>
                    <input type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={sobrietyDate}
                      onChange={e => setSobrietyDate(e.target.value)}
                      style={{ width: "100%", background: T.parchment, border: "2px solid #b8954a", borderRadius: 14, padding: "12px 14px", fontFamily: "Georgia, serif", fontSize: "0.88rem", color: T.text, outline: "none", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)" }}
                      onFocus={e => (e.target.style.borderColor = T.gold)}
                      onBlur={e => (e.target.style.borderColor = "#b8954a")}
                    />
                    <button type="button" onClick={() => setSobrietyDate(new Date().toISOString().split("T")[0])}
                      style={{ marginTop: 6, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.72rem", color: "#6ab4d8", background: "none", border: "none", cursor: "pointer" }}>
                      Starting today
                    </button>
                  </div>

                  {/* Daily drink cost */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.muted, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>
                      Daily spend on drinks? 💰
                    </label>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, fontStyle: "italic", marginBottom: 8 }}>We'll show how much gold you're saving.</p>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "Georgia, serif", fontWeight: 900, color: T.muted, fontSize: "0.88rem" }}>₹</span>
                      <input type="number" min="0" placeholder="200"
                        value={drinkCost}
                        onChange={e => setDrinkCost(e.target.value)}
                        style={{ width: "100%", background: T.parchment, border: "2px solid #b8954a", borderRadius: 14, padding: "12px 14px 12px 28px", fontFamily: "Georgia, serif", fontSize: "0.88rem", color: T.text, outline: "none", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)" }}
                        onFocus={e => (e.target.style.borderColor = T.gold)}
                        onBlur={e => (e.target.style.borderColor = "#b8954a")}
                      />
                    </div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted, fontStyle: "italic", marginTop: 5 }}>Skip if you prefer — enter 0.</p>
                  </div>

                  {/* Risk preview */}
                  <div style={{ background: risk.bg, border: `2px solid ${risk.border}`, borderRadius: 14, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.1rem" }}>{risk.label === "High Risk" ? "⚠️" : risk.label === "Moderate Risk" ? "🌊" : "🌿"}</span>
                    <div>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Risk Assessment</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: risk.color, fontSize: "0.88rem" }}>{risk.label}</p>
                    </div>
                  </div>

                  <button onClick={handleFinish} disabled={loading} className="transition-all active:scale-[0.97] group"
                    style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 20, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.65 : 1 }}>
                    {loading ? (
                      <>
                        <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Forging your path...
                      </>
                    ) : (
                      <>
                        See My Results
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  <button onClick={() => setStep(1)}
                    style={{ width: "100%", textAlign: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.78rem", color: T.muted, background: "none", border: "none", cursor: "pointer", marginTop: 14, fontStyle: "italic" }}>
                    ← Back to questions
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}