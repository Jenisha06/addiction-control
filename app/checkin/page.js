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
  Star, Heart, TrendingUp, AlertTriangle, Droplets,
} from "lucide-react";
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const EMOTIONS = [
  { icon: Smile, label: "Great",  value: 5, color: "#7aab6a", glyph: "🌿", accent: "rgba(122,171,106,0.2)",  border: "rgba(122,171,106,0.45)" },
  { icon: Meh,   label: "Okay",   value: 4, color: "#6ab4d8", glyph: "🌊", accent: "rgba(106,180,216,0.2)",  border: "rgba(106,180,216,0.45)" },
  { icon: Frown, label: "Low",    value: 3, color: "#c8a060", glyph: "🍂", accent: "rgba(200,160,96,0.2)",   border: "rgba(200,160,96,0.45)"  },
  { icon: Angry, label: "Tense",  value: 2, color: "#c08060", glyph: "⛰️", accent: "rgba(192,128,96,0.2)",   border: "rgba(192,128,96,0.45)"  },
  { icon: Skull, label: "Bad",    value: 1, color: "#c06060", glyph: "🌑", accent: "rgba(192,96,96,0.2)",    border: "rgba(192,96,96,0.45)"   },
];

const CRAVING_LABELS = ["", "Very Low", "Low", "Medium", "High", "Intense"];
const CRAVING_COLORS = ["", "#7aab6a", "#6ab4d8", "#c8a060", "#c08060", "#c06060"];
const TOTAL_STEPS = 3;

// ─── Tree stage helpers (mirrors profile page) ────────────────────────────────
const STAGE_THRESHOLDS = [0, 1, 3, 6, 10, 15, 21, 30];
const STAGE_NAMES = ["Seed","Sprout","Seedling","Sapling","Young Tree","Grove Tree","Fruiting Tree","Ancient Grove"];

function getPlantStage(plantDays) {
  if (plantDays === 0) return 0;
  if (plantDays <= 2)  return 1;
  if (plantDays <= 5)  return 2;
  if (plantDays <= 9)  return 3;
  if (plantDays <= 14) return 4;
  if (plantDays <= 20) return 5;
  if (plantDays <= 29) return 6;
  return 7;
}

// ─── Mini Tree SVG for checkin success screen ─────────────────────────────────
function MiniTreeSVG({ stage, watered }) {
  const wt = { duration: 3.5, repeat: Infinity, ease: "easeInOut" };
  const glowColor = watered ? "rgba(106,180,216,0.35)" : "rgba(122,171,106,0.2)";

  if (stage === 0) return (
    <g>
      <ellipse cx="100" cy="178" rx="72" ry="11" fill="#3d1e08" opacity="0.8"/>
      <motion.ellipse cx="100" cy="171" rx="11" ry="8" fill="#8B5E2A"
        animate={watered ? { scale: [1, 1.18, 1.08], fill: ["#8B5E2A","#6aab40","#8B5E2A"] } : { scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 171px" }}
      />
      <ellipse cx="98" cy="168" rx="5" ry="3" fill="#c8a060" opacity="0.45"/>
    </g>
  );

  if (stage === 1) return (
    <g>
      <ellipse cx="100" cy="178" rx="72" ry="11" fill="#3d1e08" opacity="0.8"/>
      <rect x="98" y="148" width="4" height="30" rx="2" fill="#5a8a30"/>
      <motion.ellipse cx="87" cy="153" rx="14" ry="8" fill="#6aab40" transform="rotate(-30,87,153)"
        animate={{ rotate: [-30,-25,-30] }} transition={wt} style={{ transformOrigin: "100px 157px" }}
      />
      <motion.ellipse cx="113" cy="153" rx="14" ry="8" fill="#7abc50" transform="rotate(30,113,153)"
        animate={{ rotate: [30,25,30] }} transition={{ ...wt, delay: 0.4 }} style={{ transformOrigin: "100px 157px" }}
      />
    </g>
  );

  if (stage === 2) return (
    <g>
      <ellipse cx="100" cy="178" rx="72" ry="11" fill="#3d1e08" opacity="0.8"/>
      <rect x="97" y="118" width="6" height="60" rx="3" fill="#4a7a28"/>
      <motion.ellipse cx="83" cy="158" rx="18" ry="9" fill="#5a9a30" transform="rotate(-25,83,158)"
        animate={{ rotate: [-25,-20,-25] }} transition={wt} style={{ transformOrigin: "100px 163px" }}
      />
      <motion.ellipse cx="117" cy="158" rx="18" ry="9" fill="#6aaa40" transform="rotate(25,117,158)"
        animate={{ rotate: [25,20,25] }} transition={{ ...wt, delay: 0.4 }} style={{ transformOrigin: "100px 163px" }}
      />
      <motion.ellipse cx="85" cy="128" rx="15" ry="8" fill="#7abb50" transform="rotate(-35,85,128)"
        animate={{ rotate: [-35,-29,-35] }} transition={{ ...wt, delay: 0.2 }} style={{ transformOrigin: "100px 133px" }}
      />
      <motion.ellipse cx="115" cy="128" rx="15" ry="8" fill="#6aab40" transform="rotate(35,115,128)"
        animate={{ rotate: [35,29,35] }} transition={{ ...wt, delay: 0.6 }} style={{ transformOrigin: "100px 133px" }}
      />
    </g>
  );

  if (stage === 3) return (
    <g>
      <ellipse cx="100" cy="180" rx="78" ry="12" fill="#3d1e08" opacity="0.8"/>
      <rect x="94" y="105" width="12" height="76" rx="5" fill="#6b3e1a"/>
      <path d="M100,142 Q74,126 58,115" stroke="#5a3010" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M100,142 Q126,126 142,115" stroke="#5a3010" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <motion.ellipse cx="100" cy="92" rx="40" ry="30" fill="#5a9a30"
        animate={{ scale: [1, 1.03, 1] }} transition={wt} style={{ transformOrigin: "100px 92px" }}
      />
      <motion.ellipse cx="60" cy="108" rx="28" ry="22" fill="#6aaa40"
        animate={{ scale: [1, 1.035, 1] }} transition={{ ...wt, delay: 0.35 }} style={{ transformOrigin: "60px 108px" }}
      />
      <motion.ellipse cx="140" cy="108" rx="28" ry="22" fill="#5a9a35"
        animate={{ scale: [1, 1.035, 1] }} transition={{ ...wt, delay: 0.7 }} style={{ transformOrigin: "140px 108px" }}
      />
    </g>
  );

  if (stage === 4) return (
    <g>
      <ellipse cx="100" cy="182" rx="82" ry="13" fill="#3d1e08" opacity="0.8"/>
      <rect x="90" y="98" width="20" height="84" rx="8" fill="#7a4a20"/>
      <path d="M100,132 Q66,114 48,103" stroke="#6a3a18" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M100,132 Q134,114 152,103" stroke="#6a3a18" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M100,116 Q83,100 74,87" stroke="#6a3a18" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M100,116 Q117,100 126,87" stroke="#6a3a18" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <motion.ellipse cx="100" cy="72" rx="52" ry="40" fill="#4a8a28"
        animate={{ scale: [1, 1.02, 1] }} transition={wt} style={{ transformOrigin: "100px 72px" }}
      />
      <motion.ellipse cx="54" cy="96" rx="36" ry="28" fill="#5a9a38"
        animate={{ scale: [1, 1.03, 1] }} transition={{ ...wt, delay: 0.45 }} style={{ transformOrigin: "54px 96px" }}
      />
      <motion.ellipse cx="146" cy="96" rx="36" ry="28" fill="#4a8a30"
        animate={{ scale: [1, 1.03, 1] }} transition={{ ...wt, delay: 0.8 }} style={{ transformOrigin: "146px 96px" }}
      />
      <motion.ellipse cx="100" cy="52" rx="38" ry="30" fill="#6aaa48"
        animate={{ scale: [1, 1.04, 1] }} transition={{ ...wt, delay: 0.2 }} style={{ transformOrigin: "100px 52px" }}
      />
    </g>
  );

  // Stage 5+: full lush tree
  return (
    <g>
      <ellipse cx="100" cy="184" rx="88" ry="14" fill="#3d1e08" opacity="0.8"/>
      <rect x="87" y="92" width="26" height="92" rx="10" fill="#7a4a20"/>
      <path d="M100,126 Q60,106 36,93" stroke="#6a3a18" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M100,126 Q140,106 164,93" stroke="#6a3a18" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <motion.ellipse cx="100" cy="64" rx="64" ry="50" fill="#3a7a20"
        animate={{ scale: [1, 1.015, 1] }} transition={wt} style={{ transformOrigin: "100px 64px" }}
      />
      <motion.ellipse cx="42" cy="86" rx="46" ry="36" fill="#4a8a30"
        animate={{ scale: [1, 1.022, 1] }} transition={{ ...wt, delay: 0.5 }} style={{ transformOrigin: "42px 86px" }}
      />
      <motion.ellipse cx="158" cy="86" rx="46" ry="36" fill="#408828"
        animate={{ scale: [1, 1.022, 1] }} transition={{ ...wt, delay: 0.9 }} style={{ transformOrigin: "158px 86px" }}
      />
      <motion.ellipse cx="100" cy="42" rx="48" ry="36" fill="#5a9a40"
        animate={{ scale: [1, 1.03, 1] }} transition={{ ...wt, delay: 0.3 }} style={{ transformOrigin: "100px 42px" }}
      />
      {/* Fruits for stage 6+ */}
      {stage >= 6 && [{cx:70,cy:46},{cx:92,cy:36},{cx:116,cy:42},{cx:54,cy:70},{cx:132,cy:66}].map((f,i) => (
        <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i*0.1, type:"spring" }}
          style={{ transformOrigin: `${f.cx}px ${f.cy}px` }}>
          <circle cx={f.cx} cy={f.cy} r="8" fill="#e83c3c"/>
          <circle cx={f.cx-2} cy={f.cy-2} r="3" fill="#ff7070" opacity="0.5"/>
          <path d={`M${f.cx},${f.cy-8} Q${f.cx-3},${f.cy-14} ${f.cx},${f.cy-16}`} stroke="#5a8a30" strokeWidth="2" fill="none"/>
        </motion.g>
      ))}
    </g>
  );
}

// ─── Water drop particles ─────────────────────────────────────────────────────
function WaterDrops({ active }) {
  const drops = [
    { x: 80,  delay: 0    },
    { x: 100, delay: 0.12 },
    { x: 120, delay: 0.06 },
    { x: 90,  delay: 0.18 },
    { x: 110, delay: 0.24 },
  ];
  if (!active) return null;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
      {drops.map((d, i) => (
        <motion.div key={i}
          initial={{ y: -20, x: d.x, opacity: 0, scale: 0.5 }}
          animate={{ y: 220, opacity: [0, 1, 1, 0], scale: [0.5, 1, 0.8, 0.3] }}
          transition={{ duration: 1.1, delay: d.delay, repeat: Infinity, repeatDelay: 0.4, ease: "easeIn" }}
          style={{
            position: "absolute", width: 8, height: 12,
            background: "linear-gradient(180deg, #5ecef5, #1a96d8)",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            boxShadow: "0 0 6px rgba(94,206,245,0.6)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 5, borderRadius: 99, overflow: "hidden", background: "rgba(200,160,74,0.14)", border: "1px solid rgba(200,160,74,0.18)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: i < step ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99 }}
          />
        </div>
      ))}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "0.8rem", color: T.muted, background: "none", border: "none", cursor: "pointer", marginBottom: 20 }}>
      <ArrowLeft size={15} /> Back
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CheckInPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [name,        setName]        = useState("Seeker");
  const [step,        setStep]        = useState(0);
  const [mood,        setMood]        = useState(null);
  const [craving,     setCraving]     = useState(3);
  const [saving,      setSaving]      = useState(false);

  // Tree state
  const [plantDays,   setPlantDays]   = useState(0);
  const [watered,     setWatered]     = useState(false);
  const [waterAnim,   setWaterAnim]   = useState(false);
  const [justLeveled, setJustLeveled] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.name) setName(data.name.split(" ")[0]);
          setPlantDays(data.plantDays ?? 0);
        }
        const today = new Date().toISOString().split("T")[0];
        const logSnap = await getDoc(doc(db, "users", user.uid, "checkins", today));
        if (logSnap.exists()) setAlreadyDone(true);
      } catch (err) { console.error("Check-in load error:", err); }
      finally { setLoadingUser(false); }
    });
    return () => unsub();
  }, [router]);

  const handleFinish = async (didDrink) => {
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await setDoc(doc(db, "users", user.uid, "checkins", today), {
        mood, cravings: craving, drank: didDrink,
        date: serverTimestamp(), createdAt: serverTimestamp(),
      });
      const xpEarned = didDrink ? 10 : 50;

      if (didDrink) {
        await updateDoc(doc(db, "users", user.uid), {
          xp:              increment(xpEarned),
          currentStreak:   0,
          lastCheckin:     serverTimestamp(),
          caloriesAvoided: increment(0),
          // plantDays NOT incremented — tree doesn't grow
        });
      } else {
        const oldStage = getPlantStage(plantDays);
        const newDays  = plantDays + 1;
        const newStage = getPlantStage(newDays);
        if (newStage > oldStage) setJustLeveled(true);

        await updateDoc(doc(db, "users", user.uid), {
          xp:              increment(xpEarned),
          currentStreak:   increment(1),
          lastCheckin:     serverTimestamp(),
          caloriesAvoided: increment(150),
          plantDays:       increment(1),  // 🌱 tree grows!
        });
        setPlantDays(newDays);
      }

      setStep(didDrink ? 4 : 3);
    } catch (err) { console.error("Check-in save error:", err); }
    finally { setSaving(false); }
  };

  const handleWater = () => {
    if (watered) return;
    setWatered(true);
    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), 2200);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, border: "3px solid #b8954a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", fontStyle: "italic" }}>Loading your quest...</p>
        </div>
      </div>
    );
  }

  // ── Already done ──────────────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <>
        <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 20px 120px" }}>
          <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
          <div style={{ width: "100%", maxWidth: 440, textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: 80, height: 80, background: "rgba(122,171,106,0.2)", border: "2px solid rgba(122,171,106,0.4)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle2 size={38} style={{ color: "#7aab6a" }} />
            </div>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.5rem", marginBottom: 10 }}>Quest Already Complete!</h2>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.85rem", fontStyle: "italic", lineHeight: 1.7, marginBottom: 28 }}>You've completed today's vigil. Return at dawn to keep your streak alive, Seeker. 🔥</p>
            <button onClick={() => router.push("/dashboard")}
              className="transition-all active:scale-[0.97]"
              style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              Back to the Keep
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        @keyframes growUp{from{transform:scaleY(0.85);opacity:0.7}to{transform:scaleY(1);opacity:1}}
        input[type=range]{-webkit-appearance:none;appearance:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#d4b483,#a07840);border:2px solid #8a6030;box-shadow:0 2px 6px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,230,160,0.4);cursor:pointer}
        input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#d4b483,#a07840);border:2px solid #8a6030;box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer}
      `}</style>

      <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "32px 20px 120px", maxWidth: 480, margin: "0 auto" }}>
        {/* Atmospheric glow */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
        {/* Sparkles */}
        <div className="fixed inset-0 pointer-events-none opacity-35">
          {[{l:"6%",t:"10%"},{l:"88%",t:"16%"},{l:"15%",t:"78%"},{l:"82%",t:"70%"}].map((p,i)=>(
            <div key={i} className="absolute rounded-full"
              style={{ left:p.l, top:p.t, width:5, height:5, background:i%2===0?"rgba(255,230,140,0.7)":"rgba(180,240,200,0.6)",
                animation:`pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${i*0.35}s` }} />
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
          <AnimatePresence mode="wait">

            {/* ── STEP 0: MOOD ── */}
            {step === 0 && (
              <motion.div key="mood"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <ProgressBar step={1} />
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Vigil · Step 1 of 3</p>
                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.4rem", lineHeight: 1.35 }}>
                    Hail, {name}! 👋<br />How fares your spirit?
                  </h2>
                  <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.78rem", fontStyle: "italic", marginTop: 5 }}>ᚠ ᚢ ᚦ — speak truthfully, Seeker</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {EMOTIONS.map(e => {
                    const Icon = e.icon;
                    const selected = mood === e.value;
                    return (
                      <motion.button key={e.value} whileTap={{ scale: 0.97 }}
                        onClick={() => { setMood(e.value); setStep(1); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16,
                          background: selected ? e.accent : T.cardBg,
                          border: `2px solid ${selected ? e.border : T.cardBorder}`,
                          boxShadow: selected ? `0 0 18px ${e.accent}` : "none",
                          cursor: "pointer", textAlign: "left", transition: "all 0.18s",
                        }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: e.accent, border: `1.5px solid ${e.border}`, flexShrink: 0 }}>
                          <span style={{ fontSize: "1.5rem" }}>{e.glyph}</span>
                        </div>
                        <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: selected ? e.color : T.goldLight, fontSize: "1rem" }}>{e.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: CRAVING ── */}
            {step === 1 && (
              <motion.div key="craving"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <ProgressBar step={2} />
                <BackButton onClick={() => setStep(0)} />

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Vigil · Step 2 of 3</p>
                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.35rem", lineHeight: 1.35 }}>How strong is the temptation calling to you?</h2>
                </div>

                <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 20, boxShadow: `0 0 28px ${CRAVING_COLORS[craving]}22`, transition: "box-shadow 0.3s" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "3.5rem", lineHeight: 1, color: CRAVING_COLORS[craving], marginBottom: 5, textShadow: `0 0 20px ${CRAVING_COLORS[craving]}44`, transition: "color 0.3s" }}>{craving}</div>
                  <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: CRAVING_COLORS[craving], fontSize: "0.9rem", letterSpacing: "0.08em", transition: "color 0.3s" }}>{CRAVING_LABELS[craving]}</div>
                </div>

                <div style={{ padding: "0 4px", marginBottom: 14 }}>
                  <input type="range" min="1" max="5" step="1" value={craving}
                    onChange={e => setCraving(Number(e.target.value))}
                    style={{ width: "100%", height: 6, borderRadius: 99, outline: "none", cursor: "pointer",
                      background: `linear-gradient(to right, ${CRAVING_COLORS[craving]} ${(craving - 1) * 25}%, rgba(200,160,74,0.18) ${(craving - 1) * 25}%)`,
                      transition: "background 0.3s", border: "none", appearance: "none",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    {CRAVING_LABELS.slice(1).map(l => (
                      <span key={l} style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, letterSpacing: "0.04em" }}>{l}</span>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(2)}
                  className="transition-all active:scale-[0.97]"
                  style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 24, padding: "14px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: "auto" }}>
                  Onward →
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: DID YOU DRINK ── */}
            {step === 2 && (
              <motion.div key="drink"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <ProgressBar step={3} />
                <BackButton onClick={() => setStep(1)} />

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Vigil · Step 3 of 3</p>
                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.35rem", lineHeight: 1.35 }}>Did you drink alcohol today?</h2>
                  <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.78rem", fontStyle: "italic", marginTop: 6, lineHeight: 1.6 }}>Speak truthfully — this helps you track your legend accurately.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleFinish(false)} disabled={saving}
                    style={{
                      width: "100%", background: "rgba(122,171,106,0.15)", border: "2px solid rgba(122,171,106,0.45)",
                      padding: "22px 16px", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      cursor: "pointer", boxShadow: "0 0 20px rgba(122,171,106,0.15)",
                      opacity: saving ? 0.6 : 1, transition: "all 0.18s",
                    }}>
                    <CheckCircle2 size={36} style={{ color: "#7aab6a" }} />
                    <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#7aab6a", fontSize: "1.05rem" }}>⚔️ Nay — I held the line!</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "#7aab6a", opacity: 0.8, fontStyle: "italic" }}>+50 XP · Streak continues · 🌱 Tree grows!</span>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleFinish(true)} disabled={saving}
                    style={{
                      width: "100%", background: "rgba(192,96,96,0.12)", border: "2px solid rgba(192,96,96,0.35)",
                      padding: "22px 16px", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      cursor: "pointer", opacity: saving ? 0.6 : 1, transition: "all 0.18s",
                    }}>
                    <XCircle size={36} style={{ color: "#c06060" }} />
                    <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#c06060", fontSize: "1.05rem" }}>Aye — I had a drink</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "#c06060", opacity: 0.8, fontStyle: "italic" }}>+10 XP · It's okay, keep going</span>
                  </motion.button>
                </div>

                {saving && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
                    <div style={{ width: 16, height: 16, border: "2px solid #b8954a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.8rem", fontStyle: "italic" }}>Inscribing your vigil...</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 3: SUCCESS + TREE WATERING ── */}
            {step === 3 && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}
              >
                {/* Victory header */}
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  style={{ width: 80, height: 80, background: "rgba(122,171,106,0.2)", border: "2px solid rgba(122,171,106,0.45)", borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 32px rgba(122,171,106,0.3)", marginTop: 8 }}>
                  <Flame size={42} style={{ color: "#7aab6a" }} />
                </motion.div>

                <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.6rem", marginBottom: 6, textAlign: "center" }}>Victory, Seeker! 🎉</h2>
                <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.8rem", fontStyle: "italic", lineHeight: 1.7, marginBottom: 18, maxWidth: 300, textAlign: "center" }}>
                  You held the line today. Every day sober is a rune carved into your legend.
                </p>

                {/* XP card */}
                <div style={{ width: "100%", background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 18, padding: "14px 18px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, background: "rgba(200,160,74,0.18)", border: "1.5px solid rgba(200,160,74,0.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Star size={19} style={{ color: "#f0c840" }} fill="#f0c840" />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>XP Earned</p>
                        <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.95rem" }}>+50 XP</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, background: "rgba(192,128,64,0.18)", border: "1.5px solid rgba(192,128,64,0.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Flame size={19} style={{ color: "#c08040" }} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Streak</p>
                        <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.95rem" }}>+1 Day 🔥</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── TREE WATERING CARD ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ width: "100%", background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 20, padding: "16px 16px 12px", marginBottom: 16, position: "relative", overflow: "hidden" }}
                >
                  {/* Level up banner */}
                  <AnimatePresence>
                    {justLeveled && (
                      <motion.div
                        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(90deg, #5a9a30, #8acc50)", padding: "6px 12px", textAlign: "center", zIndex: 10 }}
                      >
                        <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#fff", fontSize: "0.78rem" }}>
                          ✨ Your grove leveled up to {STAGE_NAMES[getPlantStage(plantDays)]}!
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, marginTop: justLeveled ? 28 : 0 }}>
                    <div>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Your Grove</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.9rem" }}>
                        {getPlantStage(plantDays) === 0 ? "🌰" : getPlantStage(plantDays) <= 2 ? "🌿" : getPlantStage(plantDays) <= 4 ? "🌳" : "🍎"} {STAGE_NAMES[getPlantStage(plantDays)]}
                      </p>
                    </div>
                    <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.82rem" }}>{plantDays}d sober</p>
                  </div>

                  {/* Tree + water drops */}
                  <div style={{ position: "relative", display: "flex", justifyContent: "center", height: 180, margin: "4px 0 8px" }}>
                    <WaterDrops active={waterAnim} />
                    <motion.div
                      animate={watered ? {
                        filter: ["brightness(1)", "brightness(1.3)", "saturate(1.5)", "brightness(1)"],
                      } : {}}
                      transition={{ duration: 1.2 }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={getPlantStage(plantDays)}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={watered ? {
                            opacity: 1, scale: [0.88, 1.08, 1],
                          } : { opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <svg viewBox="0 0 200 196" width="190" height="190" style={{ overflow: "visible" }}>
                            <MiniTreeSVG stage={getPlantStage(plantDays)} watered={watered} />
                            {/* Water ripple on ground when watering */}
                            {waterAnim && (
                              <motion.ellipse cx="100" cy="178" rx="30" ry="6" fill="none"
                                stroke="rgba(94,206,245,0.6)" strokeWidth="2"
                                animate={{ rx: [10, 60, 80], ry: [3, 10, 14], opacity: [0.8, 0.4, 0] }}
                                transition={{ duration: 1, repeat: 2 }}
                              />
                            )}
                          </svg>
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Water button */}
                  <motion.button
                    whileTap={!watered ? { scale: 0.94 } : {}}
                    onClick={handleWater}
                    disabled={watered}
                    style={{
                      width: "100%", borderRadius: 18, padding: "13px 16px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      cursor: watered ? "default" : "pointer",
                      background: watered
                        ? "rgba(122,171,106,0.15)"
                        : "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)",
                      border: watered ? "2px solid rgba(122,171,106,0.4)" : "2px solid #1478b0",
                      boxShadow: watered ? "none" : T.questShadow,
                      transition: "all 0.3s",
                    }}>
                    <Droplets size={18} style={{ color: watered ? "#7aab6a" : "#fff" }} />
                    <span style={{
                      fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "0.85rem",
                      color: watered ? "#7aab6a" : "#fff",
                      letterSpacing: "0.06em",
                    }}>
                      {watered ? "✓ Grove Watered Today!" : "💧 Water Your Grove"}
                    </span>
                  </motion.button>

                  {!watered && (
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>
                      Tap to give your tree its daily water
                    </p>
                  )}
                </motion.div>

                <button onClick={() => router.push("/dashboard")}
                  className="transition-all active:scale-[0.97]"
                  style={{ width: "100%", background: T.woodLight, border: `2px solid ${T.btnBorder}`, borderRadius: 24, padding: "14px 20px", boxShadow: T.btnShadow, color: T.text, fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                  Return to the Keep
                </button>
              </motion.div>
            )}

            {/* ── STEP 4: REFLECT (drank) ── */}
            {step === 4 && (
              <motion.div key="reflect"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  style={{ width: 90, height: 90, background: "rgba(200,160,74,0.2)", border: "2px solid rgba(200,160,74,0.4)", borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: "0 0 32px rgba(200,160,74,0.25)" }}>
                  <Heart size={46} style={{ color: "#c8a060" }} />
                </motion.div>

                <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.7rem", marginBottom: 10 }}>It's Okay, Seeker 💛</h2>
                <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.84rem", fontStyle: "italic", lineHeight: 1.75, marginBottom: 24, maxWidth: 300 }}>
                  Recovery is no straight road. The fact you checked in means you're still on the path — and that matters greatly.
                </p>

                {/* Tree frozen notice */}
                <div style={{ width: "100%", background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <svg viewBox="0 0 200 196" width="72" height="72" style={{ filter: "saturate(0.3) brightness(0.7)", overflow: "visible" }}>
                      <MiniTreeSVG stage={getPlantStage(plantDays)} watered={false} />
                    </svg>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.muted, fontSize: "0.82rem", marginBottom: 3 }}>⏸ Grove resting today</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, lineHeight: 1.5, fontStyle: "italic" }}>Stay sober tomorrow and your tree will grow again.</p>
                  </div>
                </div>

                <div style={{ width: "100%", background: T.parchment, border: "2px solid #b8954a", borderRadius: 16, padding: "14px 16px", marginBottom: 22, textAlign: "left", display: "flex", gap: 10, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)" }}>
                  <AlertTriangle size={18} style={{ color: "#b8954a", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.82rem", marginBottom: 4 }}>Sage's Counsel</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: T.text, lineHeight: 1.65 }}>
                      Try our CBT exercises or speak in the fellowship — you need not face this alone, Seeker.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  <button onClick={() => router.push("/cbt")}
                    className="transition-all active:scale-[0.97]"
                    style={{ width: "100%", background: T.woodLight, border: `2px solid ${T.btnBorder}`, borderRadius: 24, padding: "13px 20px", boxShadow: T.btnShadow, color: T.text, fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                    Try a CBT Exercise
                  </button>
                  <button onClick={() => router.push("/dashboard")}
                    style={{ width: "100%", background: "rgba(200,160,74,0.08)", border: "1.5px solid rgba(200,160,74,0.22)", borderRadius: 24, padding: "13px 20px", color: T.muted, fontWeight: 700, fontFamily: "Georgia, serif", fontSize: "0.82rem", cursor: "pointer" }}>
                    Return to the Keep
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </>
  );
}