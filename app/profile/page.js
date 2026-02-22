"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Flame, LogOut, Edit3, CheckCircle2,
  Sparkles, ChevronLeft, Shield, Star, Lock,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import BottomNav from "../components/BottomNav";

// ─── Avatars (UNCHANGED) ──────────────────────────────────────────────────────
const AVATARS = [
  { id: "aurora", name: "Aurora", skin: "#F4C899", skinShade: "#E8A870", skinLight: "#FDE8CC", hair: "#1C1C2E", hairHigh: "#2d2d45", eye: "#5B8DD9", lip: "#E8698A", blush: "#F4A5B0", brow: "#1C1C2E", lash: "#0d0d1a", hairStyle: "long",     gradient: ["#667eea", "#a78bfa"], bg: "#EEF2FF" },
  { id: "nova",   name: "Nova",   skin: "#C8825A", skinShade: "#A0623E", skinLight: "#E0A07A", hair: "#0d0800", hairHigh: "#1a0f00", eye: "#8B6914", lip: "#B85C38", blush: "#C47B5A", brow: "#0d0800", lash: "#000000", hairStyle: "bun",      gradient: ["#f093fb", "#f5576c"], bg: "#FFF0F3" },
  { id: "sage",   name: "Sage",   skin: "#FCDCB2", skinShade: "#E8B880", skinLight: "#FFF0D8", hair: "#7B3010", hairHigh: "#A04020", eye: "#3A8C3A", lip: "#D4607A", blush: "#FFB3C1", brow: "#7B3010", lash: "#4a1a00", hairStyle: "wavy",     gradient: ["#43e97b", "#38f9d7"], bg: "#F0FFF4" },
  { id: "luna",   name: "Luna",   skin: "#E8C090", skinShade: "#CC9A68", skinLight: "#F8DEB8", hair: "#1a0800", hairHigh: "#2d1000", eye: "#8B4513", lip: "#C46B52", blush: "#DBA58E", brow: "#1a0800", lash: "#0d0400", hairStyle: "ponytail", gradient: ["#fa709a", "#fee140"], bg: "#FFFBEB" },
  { id: "zara",   name: "Zara",   skin: "#7B3E1E", skinShade: "#5A2A10", skinLight: "#A05828", hair: "#080808", hairHigh: "#181818", eye: "#8B5E3C", lip: "#7B2D1F", blush: "#8B5E4A", brow: "#080808", lash: "#000000", hairStyle: "afro",     gradient: ["#4ecdc4", "#45b7d1"], bg: "#F0FDFF" },
  { id: "rei",    name: "Rei",    skin: "#FFE4C4", skinShade: "#FFCA96", skinLight: "#FFF4E8", hair: "#0d0d0d", hairHigh: "#202020", eye: "#4B4B4B", lip: "#F48FB1", blush: "#FFCDD2", brow: "#1a1a1a", lash: "#0d0d0d", hairStyle: "straight", gradient: ["#ff9a9e", "#fecfef"], bg: "#FFF5F5" },
];

const OUTFITS = [
  { id: "casual",  name: "Casual",  top: "#E8EAF6", topD: "#C5C8E8", bottom: "#1a3a6b", bottomD: "#0d2245", shoe: "#E0E0E0", shoeD: "#BDBDBD", lace: "#FFFFFF", accent: "#7986CB" },
  { id: "sporty",  name: "Sporty",  top: "#D32F2F", topD: "#B71C1C", bottom: "#1A1A1A", bottomD: "#000000", shoe: "#FFFFFF",  shoeD: "#E0E0E0", lace: "#D32F2F", accent: "#FF5252" },
  { id: "elegant", name: "Elegant", top: "#1A237E", topD: "#0D1457", bottom: "#1A237E", bottomD: "#0D1457", shoe: "#B8960C", shoeD: "#8B7000", lace: "#FFD700", accent: "#3949AB" },
  { id: "street",  name: "Street",  top: "#1C1C1C", topD: "#0a0a0a", bottom: "#2E3A40", bottomD: "#1a2228", shoe: "#FF6F00", shoeD: "#E65100", lace: "#FFFFFF", accent: "#FF6F00" },
  { id: "summer",  name: "Summer",  top: "#F48FB1", topD: "#E91E8C", bottom: "#F8BBD9", bottomD: "#F48FB1", shoe: "#FFFFFF",  shoeD: "#F8BBD9", lace: "#F48FB1", accent: "#E91E8C" },
  { id: "cozy",    name: "Cozy",    top: "#6D4C41", topD: "#4E342E", bottom: "#3E2723", bottomD: "#1a0f0d", shoe: "#A1887F", shoeD: "#795548", lace: "#D7CCC8", accent: "#A1887F" },
];

const POSES = [
  { id: "stand",  name: "Stand",  emoji: "🧍", desc: "Default idle" },
  { id: "walk",   name: "Walk",   emoji: "🚶", desc: "Walking loop" },
  { id: "runway", name: "Runway", emoji: "💃", desc: "Catwalk strut" },
  { id: "pose",   name: "Pose",   emoji: "✨", desc: "Glam sparkle" },
];

// ─── Gamified achievements ────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: "day1",     cat: "sobriety", name: "First Step",        desc: "Stay sober for 1 day",       icon: "🌱", xp: 100,  rarity: "common",    check: d => d.daysSober >= 1    },
  { id: "day7",     cat: "sobriety", name: "One Week Wonder",   desc: "Stay sober for 7 days",      icon: "⭐", xp: 300,  rarity: "uncommon",  check: d => d.daysSober >= 7    },
  { id: "day30",    cat: "sobriety", name: "Monthly Warrior",   desc: "Stay sober for 30 days",     icon: "🔥", xp: 800,  rarity: "rare",      check: d => d.daysSober >= 30   },
  { id: "day90",    cat: "sobriety", name: "Iron Will",         desc: "Stay sober for 90 days",     icon: "⚔️", xp: 2000, rarity: "epic",      check: d => d.daysSober >= 90   },
  { id: "day365",   cat: "sobriety", name: "Freedom",           desc: "365 days of sobriety",       icon: "👑", xp: 5000, rarity: "legendary", check: d => d.daysSober >= 365  },
  { id: "streak3",  cat: "streak",   name: "Hot Streak",        desc: "3-day check-in streak",      icon: "💫", xp: 150,  rarity: "common",    check: d => (d.currentStreak||0) >= 3  },
  { id: "streak7",  cat: "streak",   name: "Unbreakable",       desc: "7-day check-in streak",      icon: "🏆", xp: 500,  rarity: "uncommon",  check: d => (d.currentStreak||0) >= 7  },
  { id: "streak30", cat: "streak",   name: "Legendary Run",     desc: "30-day check-in streak",     icon: "🌟", xp: 1500, rarity: "epic",      check: d => (d.currentStreak||0) >= 30 },
  { id: "xp500",    cat: "xp",       name: "Rising Star",       desc: "Earn 500 XP total",          icon: "✨", xp: 200,  rarity: "common",    check: d => (d.xp||0) >= 500   },
  { id: "xp2000",   cat: "xp",       name: "Power Player",      desc: "Earn 2,000 XP total",        icon: "⚡", xp: 500,  rarity: "uncommon",  check: d => (d.xp||0) >= 2000  },
  { id: "xp5000",   cat: "xp",       name: "XP Legend",         desc: "Earn 5,000 XP total",        icon: "🎯", xp: 1000, rarity: "rare",      check: d => (d.xp||0) >= 5000  },
  { id: "level3",   cat: "level",    name: "Level Up!",         desc: "Reach Level 3",              icon: "🎮", xp: 300,  rarity: "uncommon",  check: d => (d.level||1) >= 3   },
  { id: "level5",   cat: "level",    name: "Elite",             desc: "Reach Level 5",              icon: "💎", xp: 1000, rarity: "epic",      check: d => (d.level||1) >= 5   },
];

const RARITY = {
  common:    { badge: "bg-slate-100  text-slate-500",  ring: "ring-slate-100",   glow: "",                          label: "Common"    },
  uncommon:  { badge: "bg-blue-100   text-blue-600",   ring: "ring-blue-200",    glow: "shadow-blue-100   shadow-md", label: "Uncommon"  },
  rare:      { badge: "bg-purple-100 text-purple-600", ring: "ring-purple-200",  glow: "shadow-purple-100 shadow-md", label: "Rare"      },
  epic:      { badge: "bg-amber-100  text-amber-600",  ring: "ring-amber-300",   glow: "shadow-amber-100  shadow-lg", label: "Epic"      },
  legendary: { badge: "bg-rose-100   text-rose-600",   ring: "ring-rose-400",    glow: "shadow-rose-200   shadow-xl", label: "Legendary" },
};

// ─── Avatar SVG (UNCHANGED) ───────────────────────────────────────────────────
function HumanAvatar({ av, outfit, pose, walking, size = 320 }) {
  const wt = { duration: 0.55, repeat: Infinity, ease: "easeInOut" };
  const runwayAnim = pose === "runway" ? { x: [-55,55,-55], transition: { duration: 2.2, repeat: Infinity, ease: [0.42,0,0.58,1] } } : {};
  const Hair = () => {
    switch (av.hairStyle) {
      case "long":     return <g><ellipse cx="160" cy="88" rx="66" ry="72" fill={av.hair}/><rect x="94" y="110" width="28" height="190" rx="14" fill={av.hair}/><rect x="198" y="110" width="28" height="175" rx="14" fill={av.hair}/><ellipse cx="145" cy="72" rx="18" ry="10" fill={av.hairHigh} opacity="0.5" transform="rotate(-20,145,72)"/></g>;
      case "bun":      return <g><ellipse cx="160" cy="90" rx="64" ry="68" fill={av.hair}/><circle cx="160" cy="34" r="28" fill={av.hair}/><circle cx="160" cy="34" r="20" fill={av.hairHigh} opacity="0.3"/><ellipse cx="150" cy="28" rx="10" ry="7" fill={av.hairHigh} opacity="0.4" transform="rotate(-20,150,28)"/></g>;
      case "wavy":     return <g><ellipse cx="160" cy="88" rx="66" ry="70" fill={av.hair}/><path d="M94,118 Q80,160 94,195 Q82,225 96,255 Q86,280 100,300" stroke={av.hair} strokeWidth="26" fill="none" strokeLinecap="round"/><path d="M226,118 Q240,160 226,195 Q238,225 224,255 Q234,280 220,300" stroke={av.hair} strokeWidth="26" fill="none" strokeLinecap="round"/><ellipse cx="145" cy="70" rx="18" ry="10" fill={av.hairHigh} opacity="0.4" transform="rotate(-20,145,70)"/></g>;
      case "ponytail": return <g><ellipse cx="160" cy="88" rx="64" ry="68" fill={av.hair}/><path d="M210,100 Q248,130 238,210 Q232,245 218,235 Q228,185 210,145 Q215,120 212,105Z" fill={av.hair}/><ellipse cx="145" cy="70" rx="18" ry="10" fill={av.hairHigh} opacity="0.4" transform="rotate(-20,145,70)"/></g>;
      case "afro":     return <g><circle cx="160" cy="82" r="78" fill={av.hair}/><circle cx="130" cy="55" r="22" fill={av.hairHigh} opacity="0.15"/><circle cx="185" cy="65" r="18" fill={av.hairHigh} opacity="0.15"/><circle cx="155" cy="35" r="20" fill={av.hairHigh} opacity="0.15"/><circle cx="200" cy="95" r="16" fill={av.hairHigh} opacity="0.12"/><circle cx="118" cy="95" r="18" fill={av.hairHigh} opacity="0.12"/></g>;
      default:         return <g><ellipse cx="160" cy="88" rx="64" ry="70" fill={av.hair}/><rect x="96" y="108" width="24" height="160" rx="12" fill={av.hair}/><rect x="200" y="108" width="24" height="150" rx="12" fill={av.hair}/><ellipse cx="148" cy="72" rx="16" ry="9" fill={av.hairHigh} opacity="0.4" transform="rotate(-15,148,72)"/></g>;
    }
  };
  return (
    <motion.div className="flex items-end justify-center" style={{ height: size+20 }} animate={runwayAnim}>
      <svg viewBox="60 18 200 612" width={size*0.56} height={size} xmlns="http://www.w3.org/2000/svg" style={{ filter:"drop-shadow(0 20px 40px rgba(0,0,0,0.18)) drop-shadow(0 6px 12px rgba(0,0,0,0.10))", overflow:"visible" }}>
        <ellipse cx="160" cy="626" rx="75" ry="11" fill="rgba(0,0,0,0.13)"/>
        <Hair/>
        <rect x="146" y="172" width="28" height="88" rx="12" fill={av.skin}/><rect x="146" y="172" width="10" height="88" rx="5" fill={av.skinShade} opacity="0.25"/>
        <ellipse cx="160" cy="118" rx="64" ry="70" fill={av.skin}/><ellipse cx="160" cy="82" rx="50" ry="28" fill={av.skinLight} opacity="0.6"/><ellipse cx="160" cy="168" rx="40" ry="20" fill={av.skinShade} opacity="0.22"/>
        <ellipse cx="96" cy="122" rx="12" ry="16" fill={av.skin}/><ellipse cx="96" cy="122" rx="7" ry="10" fill={av.skinShade} opacity="0.32"/>
        <ellipse cx="224" cy="122" rx="12" ry="16" fill={av.skin}/><ellipse cx="224" cy="122" rx="7" ry="10" fill={av.skinShade} opacity="0.32"/>
        <path d="M120,94 Q136,84 150,91" stroke={av.brow} strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M170,91 Q184,84 200,94" stroke={av.brow} strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="135" cy="112" rx="18" ry="16" fill="white"/><ellipse cx="185" cy="112" rx="18" ry="16" fill="white"/>
        <circle cx="135" cy="113" r="11" fill={av.eye}/><circle cx="185" cy="113" r="11" fill={av.eye}/>
        <circle cx="135" cy="113" r="6.5" fill="#080810"/><circle cx="185" cy="113" r="6.5" fill="#080810"/>
        <circle cx="139" cy="109" r="3.5" fill="white"/><circle cx="189" cy="109" r="3.5" fill="white"/>
        <ellipse cx="112" cy="138" rx="20" ry="12" fill={av.blush} opacity="0.42"/><ellipse cx="208" cy="138" rx="20" ry="12" fill={av.blush} opacity="0.42"/>
        <path d="M145,160 Q152,154 160,157 Q168,154 175,160 Q160,168 145,160Z" fill={av.lip} opacity="0.75"/>
        <path d="M145,160 Q160,176 175,160 Q160,171 145,160Z" fill={av.lip} opacity="0.55"/>
        <path d="M145,160 Q152,154 160,157 Q168,154 175,160" stroke={av.lip} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9"/>
        <path d="M96,118 Q96,50 160,50 Q224,50 224,118" stroke="#1a1a1a" strokeWidth="12" fill="none" strokeLinecap="round"/>
        <rect x="80" y="106" width="26" height="42" rx="13" fill="#222"/><rect x="214" y="106" width="26" height="42" rx="13" fill="#222"/>
        <ellipse cx="97" cy="258" rx="22" ry="15" fill={outfit.top}/><ellipse cx="223" cy="258" rx="22" ry="15" fill={outfit.top}/>
        <motion.g style={{ transformOrigin:"97px 258px" }} animate={walking?{rotate:[0,-22,0,22,0]}:pose==="pose"?{rotate:-28}:{rotate:0}} transition={wt}>
          <rect x="76" y="252" width="30" height="58" rx="15" fill={outfit.top}/><rect x="79" y="305" width="24" height="68" rx="12" fill={av.skin}/><ellipse cx="91" cy="378" rx="15" ry="17" fill={av.skin}/>
        </motion.g>
        <motion.g style={{ transformOrigin:"223px 258px" }} animate={walking?{rotate:[0,22,0,-22,0]}:pose==="pose"?{rotate:28}:{rotate:0}} transition={{...wt,delay:0.28}}>
          <rect x="214" y="252" width="30" height="58" rx="15" fill={outfit.top}/><rect x="217" y="305" width="24" height="68" rx="12" fill={av.skin}/><ellipse cx="229" cy="378" rx="15" ry="17" fill={av.skin}/>
        </motion.g>
        <path d="M108,255 Q100,265 98,290 L98,400 Q98,410 108,410 L212,410 Q222,410 222,400 L222,290 Q220,265 212,255Z" fill={outfit.top}/>
        <rect x="98" y="408" width="124" height="22" rx="6" fill={outfit.bottomD}/>
        <motion.g style={{ transformOrigin:"130px 430px" }} animate={walking?{rotate:[0,18,0,-18,0]}:{rotate:0}} transition={wt}>
          <path d="M98,430 L100,570 Q102,582 116,582 L150,582 Q162,582 162,570 L162,430Z" fill={outfit.bottom}/>
          <path d="M92,582 Q92,600 126,600 Q158,600 158,588 L158,582 Q142,577 110,580Z" fill={outfit.shoe}/>
        </motion.g>
        <motion.g style={{ transformOrigin:"190px 430px" }} animate={walking?{rotate:[0,-18,0,18,0]}:{rotate:0}} transition={{...wt,delay:0.28}}>
          <path d="M162,430 L162,570 Q162,582 174,582 L206,582 Q220,582 220,570 L220,430Z" fill={outfit.bottom}/>
          <path d="M162,582 Q162,600 194,600 Q228,600 228,588 L228,582 Q212,577 178,580Z" fill={outfit.shoe}/>
        </motion.g>
        {pose==="pose"&&(<><motion.text x="232" y="160" fontSize="26" animate={{opacity:[0,1,0],y:[0,-28,-55]}} transition={{duration:1.8,repeat:Infinity}}>✨</motion.text><motion.text x="52" y="180" fontSize="20" animate={{opacity:[0,1,0],y:[0,-24,-48]}} transition={{duration:1.8,repeat:Infinity,delay:0.6}}>⭐</motion.text></>)}
      </svg>
    </motion.div>
  );
}

function MiniAvatarFace({ av }) {
  return (
    <svg viewBox="82 28 160 168" width="88" height="88">
      <ellipse cx="160" cy="88" rx="64" ry="68" fill={av.hair}/><ellipse cx="160" cy="118" rx="62" ry="68" fill={av.skin}/>
      <ellipse cx="160" cy="82" rx="48" ry="26" fill={av.skinLight} opacity="0.55"/>
      <path d="M122,96 Q136,86 150,93" stroke={av.brow} strokeWidth="4.5" fill="none" strokeLinecap="round"/><path d="M170,93 Q184,86 198,96" stroke={av.brow} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="136" cy="112" rx="17" ry="15" fill="white"/><ellipse cx="184" cy="112" rx="17" ry="15" fill="white"/>
      <circle cx="136" cy="112" r="10" fill={av.eye}/><circle cx="184" cy="112" r="10" fill={av.eye}/>
      <circle cx="136" cy="112" r="6" fill="#080810"/><circle cx="184" cy="112" r="6" fill="#080810"/>
      <circle cx="140" cy="108" r="3.5" fill="white"/><circle cx="188" cy="108" r="3.5" fill="white"/>
      <ellipse cx="112" cy="138" rx="19" ry="11" fill={av.blush} opacity="0.44"/><ellipse cx="208" cy="138" rx="19" ry="11" fill={av.blush} opacity="0.44"/>
      <path d="M145,161 Q152,155 160,157 Q168,155 175,161" stroke={av.lip} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M145,161 Q160,175 175,161 Q160,172 145,161Z" fill={av.lip} opacity="0.6"/>
      <ellipse cx="160" cy="63" rx="64" ry="38" fill={av.hair}/><ellipse cx="160" cy="80" rx="56" ry="20" fill={av.skin}/>
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [userData,  setUserData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [name,      setName]      = useState("...");
  const [activeTab, setActiveTab] = useState("profile");

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [outfitIdx, setOutfitIdx] = useState(0);
  const [pose,      setPose]      = useState("stand");
  const [custTab,   setCustTab]   = useState("avatar");

  const av      = AVATARS[avatarIdx];
  const outfit  = OUTFITS[outfitIdx];
  const walking = pose === "walk" || pose === "runway";

  // ── Load Firestore ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const daysSober = data.sobrietyDate
            ? Math.floor((Date.now() - new Date(data.sobrietyDate).getTime()) / 86400000) : 0;
          setUserData({ ...data, daysSober });
          setName(data.name ?? "Friend");
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  // ── Achievements ──────────────────────────────────────────────────────────
  const earned = ACHIEVEMENTS.filter(a => userData && a.check(userData));
  const locked = ACHIEVEMENTS.filter(a => !userData || !a.check(userData));
  const pct    = Math.round((earned.length / ACHIEVEMENTS.length) * 100);
  const levelProg = Math.min(100, ((userData?.xp || 0) % 1000) / 10);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-slate-50 pb-28 max-w-lg mx-auto">

        {/* ── Customizer fullscreen ── */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed inset-0 z-50 flex flex-col bg-white"
              style={{ maxWidth: 480, left: "50%", transform: "translateX(-50%)", width: "100%" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <button onClick={() => setShowCustomizer(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100">
                  <ChevronLeft size={20} className="text-slate-700" />
                </button>
                <span className="text-lg font-black text-slate-900">Customize Avatar</span>
                <button onClick={() => { setShowCustomizer(false); toast.success("Avatar saved! 🎉"); }}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl shadow-lg">Save</button>
              </div>
              <div className="relative flex items-end justify-center shrink-0 overflow-hidden"
                style={{ height: "42vh", minHeight: 240, maxHeight: 340, background: `linear-gradient(160deg, ${av.bg} 0%, #ffffff 100%)` }}>
                <div className="absolute top-3 right-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1.5">
                  <span>{POSES.find(p => p.id === pose)?.emoji}</span><span>{POSES.find(p => p.id === pose)?.name}</span>
                </div>
                <div className="mb-2"><HumanAvatar av={av} outfit={outfit} pose={pose} walking={walking} size={280} /></div>
              </div>
              <div className="flex gap-2 px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
                {["avatar","outfit","pose"].map(t => (
                  <button key={t} onClick={() => setCustTab(t)}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wide transition-all ${custTab===t?"bg-slate-900 text-white shadow-lg":"bg-slate-100 text-slate-500"}`}>
                    {t==="avatar"?"👤 Avatar":t==="outfit"?"👗 Outfit":"💃 Pose"}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50">
                <div className="px-4 py-5">
                  {custTab==="avatar" && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose your avatar</p>
                      <div className="grid grid-cols-3 gap-3">
                        {AVATARS.map((a,i) => (
                          <motion.button key={a.id} whileTap={{scale:0.93}} onClick={()=>setAvatarIdx(i)}
                            className={`relative rounded-3xl overflow-hidden border-2 transition-all bg-white ${avatarIdx===i?"border-slate-900 shadow-2xl":"border-slate-100 shadow-sm"}`}>
                            <div className="pt-3 pb-0 flex flex-col items-center" style={{background:`linear-gradient(160deg,${a.bg},#ffffff)`}}>
                              <MiniAvatarFace av={a}/><span className="text-xs font-black text-slate-700 mt-1 mb-2">{a.name}</span>
                            </div>
                            <div className="h-2" style={{background:`linear-gradient(to right,${a.gradient[0]},${a.gradient[1]})`}}/>
                            {avatarIdx===i&&<div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center shadow-md"><CheckCircle2 size={11} className="text-white"/></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {custTab==="outfit" && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose outfit</p>
                      <div className="grid grid-cols-2 gap-3">
                        {OUTFITS.map((of,i) => (
                          <motion.button key={of.id} whileTap={{scale:0.96}} onClick={()=>setOutfitIdx(i)}
                            className={`p-4 rounded-3xl border-2 text-left transition-all bg-white ${outfitIdx===i?"border-slate-900 shadow-xl":"border-slate-100 shadow-sm"}`}>
                            <div className="flex items-end gap-2 mb-3">
                              <div className="w-10 h-10 rounded-2xl border border-slate-100 shadow-sm" style={{background:of.top}}/>
                              <div className="flex flex-col gap-1"><div className="w-10 h-5 rounded-xl border border-slate-100 shadow-sm" style={{background:of.bottom}}/><div className="w-10 h-4 rounded-lg border border-slate-100 shadow-sm" style={{background:of.shoe}}/></div>
                            </div>
                            <p className="font-black text-sm text-slate-800">{of.name}</p>
                            {outfitIdx===i&&<div className="flex items-center gap-1 mt-1.5"><CheckCircle2 size={13} className="text-slate-900"/><span className="text-xs text-slate-500 font-semibold">Selected</span></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {custTab==="pose" && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose pose</p>
                      <div className="grid grid-cols-2 gap-3">
                        {POSES.map(p => (
                          <motion.button key={p.id} whileTap={{scale:0.96}} onClick={()=>setPose(p.id)}
                            className={`p-5 rounded-3xl border-2 text-left transition-all ${pose===p.id?"border-slate-900 bg-slate-900 shadow-2xl":"border-slate-100 bg-white shadow-sm"}`}>
                            <div className="text-4xl mb-2">{p.emoji}</div>
                            <p className={`font-black text-sm ${pose===p.id?"text-white":"text-slate-800"}`}>{p.name}</p>
                            <p className={`text-xs mt-0.5 ${pose===p.id?"text-slate-300":"text-slate-400"}`}>{p.desc}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div className="px-5 pt-8 space-y-4">
          {/* Name row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.button whileTap={{scale:0.92}} onClick={()=>setShowCustomizer(true)}
                className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl flex items-end justify-center shrink-0"
                style={{background:`linear-gradient(160deg,${av.bg},#ffffff)`}}>
                <svg viewBox="80 28 160 175" width="54" height="54">
                  <ellipse cx="160" cy="88" rx="64" ry="68" fill={av.hair}/><ellipse cx="160" cy="118" rx="62" ry="68" fill={av.skin}/>
                  <ellipse cx="160" cy="82" rx="48" ry="26" fill={av.skinLight} opacity="0.5"/>
                  <ellipse cx="136" cy="112" rx="16" ry="14" fill="white"/><ellipse cx="184" cy="112" rx="16" ry="14" fill="white"/>
                  <circle cx="136" cy="112" r="10" fill={av.eye}/><circle cx="184" cy="112" r="10" fill={av.eye}/>
                  <circle cx="136" cy="112" r="6" fill="#080810"/><circle cx="184" cy="112" r="6" fill="#080810"/>
                  <circle cx="140" cy="108" r="3.5" fill="white"/><circle cx="188" cy="108" r="3.5" fill="white"/>
                  <ellipse cx="112" cy="138" rx="18" ry="10" fill={av.blush} opacity="0.44"/><ellipse cx="208" cy="138" rx="18" ry="10" fill={av.blush} opacity="0.44"/>
                  <path d="M145,161 Q160,175 175,161 Q160,172 145,161Z" fill={av.lip} opacity="0.6"/>
                  <ellipse cx="160" cy="63" rx="64" ry="38" fill={av.hair}/><ellipse cx="160" cy="80" rx="56" ry="20" fill={av.skin}/>
                </svg>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                  <Edit3 size={8} className="text-white"/>
                </div>
              </motion.button>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-tight">{name}</h1>
                <p className="text-xs text-slate-400 font-semibold">Level {userData?.level??1} · {av.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame size={11} className="text-orange-500"/>
                  <span className="text-xs font-bold text-orange-500">{userData?.currentStreak??0} day streak</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
              <LogOut size={15} className="text-slate-500"/>
            </button>
          </div>

          {/* XP bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Star size={11} className="text-yellow-500" fill="currentColor"/>Level {userData?.level??1}
              </span>
              <span className="text-xs font-black text-blue-600">{(userData?.xp||0)%1000} / 1000 XP</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{width:0}} animate={{width:`${levelProg}%`}} transition={{duration:0.8,ease:"easeOut"}}
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"/>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">
              {1000-((userData?.xp||0)%1000)} XP to Level {(userData?.level??1)+1}
            </p>
          </div>

          {/* Avatar preview card */}
          <motion.button whileTap={{scale:0.985}} onClick={()=>setShowCustomizer(true)}
            className="w-full rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden text-left"
            style={{background:`linear-gradient(160deg,${av.bg}90,#ffffff)`}}>
            <div className="flex items-end gap-0 pl-2 pr-4 pt-2 pb-3">
              <div className="shrink-0 overflow-hidden" style={{height:110,width:90}}>
                <HumanAvatar av={av} outfit={outfit} pose={pose} walking={walking} size={200}/>
              </div>
              <div className="flex-1 pb-1">
                <p className="font-black text-slate-900 text-sm">Your Avatar</p>
                <p className="text-xs text-slate-500">{av.name} · {outfit.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{POSES.find(p2=>p2.id===pose)?.emoji} {POSES.find(p2=>p2.id===pose)?.name}</p>
                <div className="flex gap-1 mt-2">
                  {OUTFITS.map((of,i)=>(
                    <div key={of.id} className={`rounded-full border-2 transition-all ${outfitIdx===i?"border-slate-900":"border-slate-200"}`}
                      style={{background:of.top,width:outfitIdx===i?14:12,height:outfitIdx===i?14:12}}/>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400 pb-2 shrink-0">
                <Sparkles size={16}/><span className="text-xs font-bold">Edit</span>
              </div>
            </div>
          </motion.button>

          {/* Tabs */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {["profile","achievements"].map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab===tab?"bg-slate-900 text-white shadow":"text-slate-400"}`}>
                {tab==="profile"?"📊 Profile":"🏆 Achievements"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab bodies ── */}
        <div className="px-5 pt-4">
          <AnimatePresence mode="wait">

            {/* PROFILE */}
            {activeTab==="profile" && (
              <motion.div key="profile" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {label:"Days Sober",   value:userData?.daysSober??0,              icon:"🧘",color:"text-blue-600"   },
                    {label:"Total XP",     value:(userData?.xp??0).toLocaleString(),  icon:"⭐",color:"text-yellow-600" },
                    {label:"Best Streak",  value:`${userData?.longestStreak??0}d`,    icon:"🔥",color:"text-orange-500" },
                    {label:"Achievements", value:`${earned.length}/${ACHIEVEMENTS.length}`, icon:"🏆",color:"text-purple-600"},
                  ].map(s=>(
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                      <p className="text-xl mb-1">{s.icon}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{s.label}</p>
                    </div>
                  ))}
                </div>
                {userData?.riskLevel && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Shield size={18} className="text-blue-600"/>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Risk Profile</p>
                      <p className="font-black text-slate-800 text-sm">{userData.riskLevel}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Goal</p>
                      <p className="font-black text-slate-800 text-sm">{userData?.goalType??"—"}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ACHIEVEMENTS */}
            {activeTab==="achievements" && (
              <motion.div key="achievements" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">

                {/* Banner */}
                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{background:"linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#0891b2 100%)"}}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
                  <div className="relative z-10 flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide">Unlocked</p>
                      <p className="text-3xl font-black text-white leading-none">{earned.length}<span className="text-base text-white/50"> / {ACHIEVEMENTS.length}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide">Completion</p>
                      <p className="text-3xl font-black text-white leading-none">{pct}%</p>
                    </div>
                    <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                      <Trophy size={28} className="text-yellow-300"/>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1,ease:"easeOut"}}
                      className="h-full bg-white rounded-full"/>
                  </div>
                </div>

                {/* Earned */}
                {earned.length>0 && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">✅ Unlocked ({earned.length})</p>
                    <div className="space-y-2.5">
                      {earned.map((a,i)=>{
                        const r=RARITY[a.rarity];
                        return (
                          <motion.div key={a.id} initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                            className={`bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 ring-2 ${r.ring} ${r.glow}`}>
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
                              {a.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-black text-slate-900 text-sm">{a.name}</p>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${r.badge}`}>{r.label}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-emerald-600"/>
                              </div>
                              <span className="text-[10px] font-black text-yellow-600">+{a.xp} XP</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Locked */}
                {locked.length>0 && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">🔒 Locked ({locked.length})</p>
                    <div className="space-y-2.5">
                      {locked.map((a,i)=>{
                        const r=RARITY[a.rarity];
                        return (
                          <motion.div key={a.id} initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                            className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 opacity-55">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shrink-0 grayscale">
                              {a.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-black text-slate-500 text-sm">{a.name}</p>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${r.badge}`}>{r.label}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                                <Lock size={13} className="text-slate-400"/>
                              </div>
                              <span className="text-[10px] font-black text-slate-400">+{a.xp} XP</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav/>
    </>
  );
}