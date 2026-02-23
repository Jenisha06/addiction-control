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

// ─── Avatars & Outfits & Poses (UNCHANGED DATA) ───────────────────────────────
const AVATARS = [
  { id:"aurora",skin:"#F4C899",skinShade:"#E8A870",skinLight:"#FDE8CC",hair:"#1C1C2E",hairHigh:"#2d2d45",eye:"#5B8DD9",lip:"#E8698A",blush:"#F4A5B0",brow:"#1C1C2E",lash:"#0d0d1a",hairStyle:"long",     name:"Aurora",gradient:["#667eea","#a78bfa"],bg:"#EEF2FF" },
  { id:"nova",  skin:"#C8825A",skinShade:"#A0623E",skinLight:"#E0A07A",hair:"#0d0800",hairHigh:"#1a0f00",eye:"#8B6914",lip:"#B85C38",blush:"#C47B5A",brow:"#0d0800",lash:"#000000",hairStyle:"bun",      name:"Nova",  gradient:["#f093fb","#f5576c"],bg:"#FFF0F3" },
  { id:"sage",  skin:"#FCDCB2",skinShade:"#E8B880",skinLight:"#FFF0D8",hair:"#7B3010",hairHigh:"#A04020",eye:"#3A8C3A",lip:"#D4607A",blush:"#FFB3C1",brow:"#7B3010",lash:"#4a1a00",hairStyle:"wavy",     name:"Sage",  gradient:["#43e97b","#38f9d7"],bg:"#F0FFF4" },
  { id:"luna",  skin:"#E8C090",skinShade:"#CC9A68",skinLight:"#F8DEB8",hair:"#1a0800",hairHigh:"#2d1000",eye:"#8B4513",lip:"#C46B52",blush:"#DBA58E",brow:"#1a0800",lash:"#0d0400",hairStyle:"ponytail", name:"Luna",  gradient:["#fa709a","#fee140"],bg:"#FFFBEB" },
  { id:"zara",  skin:"#7B3E1E",skinShade:"#5A2A10",skinLight:"#A05828",hair:"#080808",hairHigh:"#181818",eye:"#8B5E3C",lip:"#7B2D1F",blush:"#8B5E4A",brow:"#080808",lash:"#000000",hairStyle:"afro",     name:"Zara",  gradient:["#4ecdc4","#45b7d1"],bg:"#F0FDFF" },
  { id:"rei",   skin:"#FFE4C4",skinShade:"#FFCA96",skinLight:"#FFF4E8",hair:"#0d0d0d",hairHigh:"#202020",eye:"#4B4B4B",lip:"#F48FB1",blush:"#FFCDD2",brow:"#1a1a1a",lash:"#0d0d0d",hairStyle:"straight", name:"Rei",   gradient:["#ff9a9e","#fecfef"],bg:"#FFF5F5" },
];
const OUTFITS = [
  { id:"casual", name:"Casual",  top:"#E8EAF6",topD:"#C5C8E8",bottom:"#1a3a6b",bottomD:"#0d2245",shoe:"#E0E0E0",shoeD:"#BDBDBD",lace:"#FFFFFF",accent:"#7986CB" },
  { id:"sporty", name:"Sporty",  top:"#D32F2F",topD:"#B71C1C",bottom:"#1A1A1A",bottomD:"#000000",shoe:"#FFFFFF", shoeD:"#E0E0E0",lace:"#D32F2F",accent:"#FF5252" },
  { id:"elegant",name:"Elegant", top:"#1A237E",topD:"#0D1457",bottom:"#1A237E",bottomD:"#0D1457",shoe:"#B8960C",shoeD:"#8B7000",lace:"#FFD700",accent:"#3949AB" },
  { id:"street", name:"Street",  top:"#1C1C1C",topD:"#0a0a0a",bottom:"#2E3A40",bottomD:"#1a2228",shoe:"#FF6F00",shoeD:"#E65100",lace:"#FFFFFF",accent:"#FF6F00" },
  { id:"summer", name:"Summer",  top:"#F48FB1",topD:"#E91E8C",bottom:"#F8BBD9",bottomD:"#F48FB1",shoe:"#FFFFFF", shoeD:"#F8BBD9",lace:"#F48FB1",accent:"#E91E8C" },
  { id:"cozy",   name:"Cozy",    top:"#6D4C41",topD:"#4E342E",bottom:"#3E2723",bottomD:"#1a0f0d",shoe:"#A1887F",shoeD:"#795548",lace:"#D7CCC8",accent:"#A1887F" },
];
const POSES = [
  { id:"stand",  name:"Stand",  emoji:"🧍",desc:"Default idle"  },
  { id:"walk",   name:"Walk",   emoji:"🚶",desc:"Walking loop"  },
  { id:"runway", name:"Runway", emoji:"💃",desc:"Catwalk strut" },
  { id:"pose",   name:"Pose",   emoji:"✨",desc:"Glam sparkle"  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id:"day1",    cat:"sobriety",name:"First Step",      desc:"Stay sober for 1 day",     icon:"🌱",xp:100, rarity:"common",   check:d=>d.daysSober>=1   },
  { id:"day7",    cat:"sobriety",name:"One Week Wonder", desc:"Stay sober for 7 days",     icon:"⭐",xp:300, rarity:"uncommon", check:d=>d.daysSober>=7   },
  { id:"day30",   cat:"sobriety",name:"Monthly Warrior", desc:"Stay sober for 30 days",    icon:"🔥",xp:800, rarity:"rare",     check:d=>d.daysSober>=30  },
  { id:"day90",   cat:"sobriety",name:"Iron Will",       desc:"Stay sober for 90 days",    icon:"⚔️",xp:2000,rarity:"epic",     check:d=>d.daysSober>=90  },
  { id:"day365",  cat:"sobriety",name:"Freedom",         desc:"365 days of sobriety",      icon:"👑",xp:5000,rarity:"legendary",check:d=>d.daysSober>=365 },
  { id:"streak3", cat:"streak",  name:"Hot Streak",      desc:"3-day check-in streak",     icon:"💫",xp:150, rarity:"common",   check:d=>(d.currentStreak||0)>=3  },
  { id:"streak7", cat:"streak",  name:"Unbreakable",     desc:"7-day check-in streak",     icon:"🏆",xp:500, rarity:"uncommon", check:d=>(d.currentStreak||0)>=7  },
  { id:"streak30",cat:"streak",  name:"Legendary Run",   desc:"30-day check-in streak",    icon:"🌟",xp:1500,rarity:"epic",     check:d=>(d.currentStreak||0)>=30 },
  { id:"xp500",   cat:"xp",      name:"Rising Star",     desc:"Earn 500 XP total",         icon:"✨",xp:200, rarity:"common",   check:d=>(d.xp||0)>=500  },
  { id:"xp2000",  cat:"xp",      name:"Power Player",    desc:"Earn 2,000 XP total",       icon:"⚡",xp:500, rarity:"uncommon", check:d=>(d.xp||0)>=2000 },
  { id:"xp5000",  cat:"xp",      name:"XP Legend",       desc:"Earn 5,000 XP total",       icon:"🎯",xp:1000,rarity:"rare",     check:d=>(d.xp||0)>=5000 },
  { id:"level3",  cat:"level",   name:"Level Up!",       desc:"Reach Level 3",             icon:"🎮",xp:300, rarity:"uncommon", check:d=>(d.level||1)>=3  },
  { id:"level5",  cat:"level",   name:"Elite",           desc:"Reach Level 5",             icon:"💎",xp:1000,rarity:"epic",     check:d=>(d.level||1)>=5  },
];

const RARITY_CFG = {
  common:    { color:"rgba(200,160,74,0.5)",  glow:"none",                                  label:"Common"   },
  uncommon:  { color:"rgba(106,180,216,0.6)", glow:"0 0 16px rgba(106,180,216,0.25)",       label:"Uncommon" },
  rare:      { color:"rgba(154,120,192,0.6)", glow:"0 0 16px rgba(154,120,192,0.3)",        label:"Rare"     },
  epic:      { color:"rgba(200,160,74,0.8)",  glow:"0 0 20px rgba(200,160,74,0.35)",        label:"Epic"     },
  legendary: { color:"rgba(220,100,80,0.8)",  glow:"0 0 24px rgba(220,100,80,0.4)",         label:"Legendary"},
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
      <svg viewBox="60 18 200 612" width={size*0.56} height={size} xmlns="http://www.w3.org/2000/svg" style={{ filter:"drop-shadow(0 20px 40px rgba(0,0,0,0.25)) drop-shadow(0 6px 12px rgba(0,0,0,0.15))", overflow:"visible" }}>
        <ellipse cx="160" cy="626" rx="75" ry="11" fill="rgba(0,0,0,0.18)"/>
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

  const av     = AVATARS[avatarIdx];
  const outfit = OUTFITS[outfitIdx];
  const walking = pose === "walk" || pose === "runway";

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
          setName(data.name ?? "Seeker");
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

  const earned = ACHIEVEMENTS.filter(a => userData && a.check(userData));
  const locked = ACHIEVEMENTS.filter(a => !userData || !a.check(userData));
  const pct    = Math.round((earned.length / ACHIEVEMENTS.length) * 100);
  const levelProg = Math.min(100, ((userData?.xp || 0) % 1000) / 10);

  if (loading) return (
    <div style={{ background: T.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #b8954a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      <style>{`
        @keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ background: T.pageBg, minHeight: "100vh", paddingBottom: 112, maxWidth: 480, margin: "0 auto" }}>

        {/* Atmospheric glow */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,180,60,0.13), transparent 65%)" }} />
        {/* Sparkles */}
        <div className="fixed inset-0 pointer-events-none opacity-40">
          {[{l:"6%",t:"10%"},{l:"88%",t:"16%"},{l:"15%",t:"78%"},{l:"82%",t:"70%"},{l:"50%",t:"5%"}].map((p,i)=>(
            <div key={i} className="absolute rounded-full"
              style={{ left:p.l, top:p.t, width:5, height:5, background:i%2===0?"rgba(255,230,140,0.7)":"rgba(180,240,200,0.6)",
                animation:`pulse ${2.2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${i*0.35}s` }} />
          ))}
        </div>

        {/* ── Customizer fullscreen ── */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              style={{
                position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column",
                background: "linear-gradient(180deg, #3d2210 0%, #2d1a0c 100%)",
                maxWidth: 480, left: "50%", transform: "translateX(-50%)", width: "100%",
              }}
            >
              {/* Customizer header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(200,160,74,0.18)", flexShrink: 0 }}>
                <button onClick={() => setShowCustomizer(false)}
                  style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.22)", cursor: "pointer", color: T.gold }}>
                  <ChevronLeft size={20} />
                </button>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.05rem" }}>Forge Your Avatar</span>
                <button onClick={() => { setShowCustomizer(false); toast.success("Avatar forged! ⚔️"); }}
                  className="transition-all active:scale-95"
                  style={{ background: T.woodLight, border: `2px solid ${T.btnBorder}`, borderRadius: 20, padding: "8px 18px", boxShadow: T.btnShadow, color: T.text, fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.82rem", cursor: "pointer" }}>
                  Save
                </button>
              </div>

              {/* Avatar preview */}
              <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", flexShrink: 0, overflow: "hidden", height: "38vh", minHeight: 220, maxHeight: 320, background: "linear-gradient(180deg, rgba(200,160,74,0.15), rgba(58,32,16,0.4))" }}>
                {/* Arch glow behind avatar */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 70% at 50% 80%, rgba(255,180,60,0.18), transparent 70%)" }} />
                <div style={{ position: "absolute", top: 10, right: 16, display: "flex", alignItems: "center", gap: 6, background: "rgba(200,160,74,0.15)", border: "1px solid rgba(200,160,74,0.28)", borderRadius: 99, padding: "4px 10px" }}>
                  <span>{POSES.find(p => p.id === pose)?.emoji}</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.gold }}>{POSES.find(p => p.id === pose)?.name}</span>
                </div>
                <div style={{ marginBottom: 8, position: "relative", zIndex: 1 }}>
                  <HumanAvatar av={av} outfit={outfit} pose={pose} walking={walking} size={260} />
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid rgba(200,160,74,0.15)", flexShrink: 0 }}>
                {["avatar","outfit","pose"].map(t => (
                  <button key={t} onClick={() => setCustTab(t)}
                    style={{
                      flex: 1, padding: "10px 4px", borderRadius: 14, cursor: "pointer",
                      fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase",
                      background: custTab === t ? "rgba(200,160,74,0.18)" : "rgba(200,160,74,0.06)",
                      border: `1.5px solid ${custTab === t ? "rgba(200,160,74,0.4)" : "rgba(200,160,74,0.14)"}`,
                      color: custTab === t ? T.gold : T.muted,
                      transition: "all 0.2s",
                    }}>
                    {t==="avatar"?"👤 Avatar":t==="outfit"?"👗 Outfit":"💃 Pose"}
                  </button>
                ))}
              </div>

              {/* Scrollable selector */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {custTab === "avatar" && (
                  <div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Choose your hero</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {AVATARS.map((a, i) => (
                        <motion.button key={a.id} whileTap={{ scale: 0.93 }} onClick={() => setAvatarIdx(i)}
                          style={{
                            borderRadius: 18, overflow: "hidden", background: "rgba(200,160,74,0.06)",
                            border: `2px solid ${avatarIdx === i ? "rgba(200,160,74,0.7)" : "rgba(200,160,74,0.18)"}`,
                            boxShadow: avatarIdx === i ? "0 0 16px rgba(200,160,74,0.25)" : "none",
                            cursor: "pointer", position: "relative",
                          }}>
                          <div style={{ paddingTop: 10, paddingBottom: 0, display: "flex", flexDirection: "column", alignItems: "center", background: `linear-gradient(160deg,${a.bg}80,rgba(58,32,16,0.3))` }}>
                            <MiniAvatarFace av={a} />
                            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: T.goldLight, fontSize: "0.72rem", marginTop: 4, marginBottom: 8 }}>{a.name}</span>
                          </div>
                          <div style={{ height: 4, background: `linear-gradient(to right,${a.gradient[0]},${a.gradient[1]})` }} />
                          {avatarIdx === i && (
                            <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, background: "#b8954a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <CheckCircle2 size={11} style={{ color: "#fff" }} />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {custTab === "outfit" && (
                  <div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Choose your armor</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {OUTFITS.map((of, i) => (
                        <motion.button key={of.id} whileTap={{ scale: 0.96 }} onClick={() => setOutfitIdx(i)}
                          style={{
                            padding: 14, borderRadius: 16, textAlign: "left", cursor: "pointer",
                            background: "rgba(200,160,74,0.06)",
                            border: `2px solid ${outfitIdx === i ? "rgba(200,160,74,0.65)" : "rgba(200,160,74,0.18)"}`,
                            boxShadow: outfitIdx === i ? "0 0 16px rgba(200,160,74,0.2)" : "none",
                          }}>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: of.top, border: "1px solid rgba(0,0,0,0.1)" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <div style={{ width: 36, height: 16, borderRadius: 8, background: of.bottom, border: "1px solid rgba(0,0,0,0.1)" }} />
                              <div style={{ width: 36, height: 12, borderRadius: 6, background: of.shoe, border: "1px solid rgba(0,0,0,0.1)" }} />
                            </div>
                          </div>
                          <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.82rem" }}>{of.name}</p>
                          {outfitIdx === i && <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.gold, marginTop: 3 }}>✓ Equipped</p>}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {custTab === "pose" && (
                  <div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Choose your stance</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {POSES.map(p => (
                        <motion.button key={p.id} whileTap={{ scale: 0.96 }} onClick={() => setPose(p.id)}
                          style={{
                            padding: 18, borderRadius: 16, textAlign: "left", cursor: "pointer",
                            background: pose === p.id ? "rgba(200,160,74,0.16)" : "rgba(200,160,74,0.05)",
                            border: `2px solid ${pose === p.id ? "rgba(200,160,74,0.6)" : "rgba(200,160,74,0.15)"}`,
                            boxShadow: pose === p.id ? "0 0 20px rgba(200,160,74,0.2)" : "none",
                          }}>
                          <div style={{ fontSize: "2rem", marginBottom: 8 }}>{p.emoji}</div>
                          <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.85rem" }}>{p.name}</p>
                          <p style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, marginTop: 2, fontStyle: "italic" }}>{p.desc}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div className="relative z-10" style={{ padding: "28px 20px 0" }}>

          {/* Name row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Avatar thumb — wooden frame */}
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowCustomizer(true)}
                style={{
                  position: "relative", width: 56, height: 56, borderRadius: 16, overflow: "hidden", flexShrink: 0,
                  background: `linear-gradient(160deg, ${av.bg}70, rgba(58,32,16,0.5))`,
                  border: "2px solid #b8954a",
                  boxShadow: T.btnShadow,
                  cursor: "pointer", display: "flex", alignItems: "flex-end", justifyContent: "center",
                }}>
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
                <div style={{ position: "absolute", bottom: 3, right: 3, width: 16, height: 16, background: "#b8954a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit3 size={8} style={{ color: T.text }} />
                </div>
              </motion.button>

              <div>
                <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.15rem", lineHeight: 1.2 }}>{name}</h1>
                <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.72rem", fontStyle: "italic" }}>Level {userData?.level ?? 1} · {av.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <span style={{ fontSize: "0.75rem" }}>🔥</span>
                  <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "#c08060", fontSize: "0.72rem" }}>{userData?.currentStreak ?? 0} day streak</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
              style={{ width: 38, height: 38, background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.22)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.muted }}>
              <LogOut size={15} />
            </button>
          </div>

          {/* XP bar — wooden track */}
          <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 14, boxShadow: "inset 0 1px 0 rgba(255,220,130,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: T.gold, display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={11} style={{ color: "#f0c840" }} fill="#f0c840" /> Level {userData?.level ?? 1}
              </span>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: "#6ab4d8", fontSize: "0.72rem" }}>{(userData?.xp || 0) % 1000} / 1000 XP</span>
            </div>
            <div style={{ height: 8, background: "rgba(200,160,74,0.15)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(200,160,74,0.2)" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${levelProg}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99 }} />
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, marginTop: 5, fontStyle: "italic" }}>
              {1000 - ((userData?.xp || 0) % 1000)} XP to Level {(userData?.level ?? 1) + 1}
            </p>
          </div>

          {/* Avatar preview card */}
          <motion.button whileTap={{ scale: 0.985 }} onClick={() => setShowCustomizer(true)}
            className="transition-all"
            style={{
              width: "100%", borderRadius: 20, border: "2px dashed rgba(200,160,74,0.3)", overflow: "hidden", textAlign: "left", cursor: "pointer",
              background: `linear-gradient(160deg, ${av.bg}20, rgba(90,52,24,0.5))`,
              marginBottom: 14,
            }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 0, paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 10 }}>
              <div style={{ flexShrink: 0, overflow: "hidden", height: 110, width: 88 }}>
                <HumanAvatar av={av} outfit={outfit} pose={pose} walking={walking} size={200} />
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>Your Avatar</p>
                <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.72rem", fontStyle: "italic" }}>{av.name} · {outfit.name}</p>
                <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.7rem", marginTop: 2 }}>
                  {POSES.find(p2 => p2.id === pose)?.emoji} {POSES.find(p2 => p2.id === pose)?.name}
                </p>
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {OUTFITS.map((of, i) => (
                    <div key={of.id} style={{ width: outfitIdx === i ? 14 : 10, height: outfitIdx === i ? 14 : 10, borderRadius: "50%", background: of.top, border: `2px solid ${outfitIdx === i ? "#b8954a" : "rgba(200,160,74,0.2)"}`, transition: "all 0.2s" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: T.muted, paddingBottom: 8, flexShrink: 0 }}>
                <Sparkles size={15} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", fontWeight: 700 }}>Edit</span>
              </div>
            </div>
          </motion.button>

          {/* Tabs */}
          <div style={{ display: "flex", background: "rgba(200,160,74,0.08)", border: "1.5px solid rgba(200,160,74,0.18)", borderRadius: 16, padding: 5, marginBottom: 16, gap: 6 }}>
            {["profile","achievements"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: "11px 8px", borderRadius: 12, cursor: "pointer",
                  fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "0.72rem",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  background: activeTab === tab ? "rgba(200,160,74,0.2)" : "transparent",
                  border: activeTab === tab ? "1.5px solid rgba(200,160,74,0.4)" : "1.5px solid transparent",
                  color: activeTab === tab ? T.gold : T.muted,
                  transition: "all 0.2s",
                }}>
                {tab === "profile" ? "📊 Profile" : "🏆 Feats"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab bodies ── */}
        <div className="relative z-10" style={{ padding: "0 20px" }}>
          <AnimatePresence mode="wait">

            {/* PROFILE */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Days Sober",   value: userData?.daysSober ?? 0,              glyph: "🧘" },
                    { label: "Total XP",     value: (userData?.xp ?? 0).toLocaleString(), glyph: "⭐" },
                    { label: "Best Streak",  value: `${userData?.longestStreak ?? 0}d`,    glyph: "🔥" },
                    { label: "Feats",        value: `${earned.length}/${ACHIEVEMENTS.length}`, glyph: "🏆" },
                  ].map(s => (
                    <div key={s.label} style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 16, padding: "14px 14px", boxShadow: "inset 0 1px 0 rgba(255,220,130,0.05)" }}>
                      <p style={{ fontSize: "1.4rem", marginBottom: 5 }}>{s.glyph}</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.15rem", lineHeight: 1.1 }}>{s.value}</p>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {userData?.riskLevel && (
                  <div style={{ background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: "rgba(106,180,216,0.15)", border: "1.5px solid rgba(106,180,216,0.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Shield size={18} style={{ color: "#6ab4d8" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Risk Profile</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>{userData.riskLevel}</p>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Goal</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>{userData?.goalType ?? "—"}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ACHIEVEMENTS */}
            {activeTab === "achievements" && (
              <motion.div key="achievements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Banner — wooden arch style */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(90,52,24,0.9), rgba(58,32,16,0.95))",
                  border: "2px solid rgba(200,160,74,0.4)",
                  borderRadius: 20, padding: "18px 18px", position: "relative", overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,220,130,0.1)",
                }}>
                  <div style={{ position: "absolute", top: -30, right: -30, opacity: 0.06 }}>
                    <Trophy size={110} style={{ color: "#f0c840" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, position: "relative", zIndex: 1 }}>
                    <div>
                      <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Feats Unlocked</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.8rem", lineHeight: 1.1 }}>
                        {earned.length}<span style={{ fontSize: "1rem", color: T.muted }}>/{ACHIEVEMENTS.length}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Completion</p>
                      <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.8rem", lineHeight: 1.1 }}>{pct}%</p>
                    </div>
                    <div style={{ width: 52, height: 52, background: "rgba(200,160,74,0.18)", border: "1.5px solid rgba(200,160,74,0.3)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trophy size={26} style={{ color: "#f0c840" }} />
                    </div>
                  </div>
                  <div style={{ height: 7, background: "rgba(200,160,74,0.15)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(200,160,74,0.2)", position: "relative", zIndex: 1 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                      style={{ height: "100%", background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99 }} />
                  </div>
                </div>

                {/* Earned feats */}
                {earned.length > 0 && (
                  <div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>✅ Unlocked ({earned.length})</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {earned.map((a, i) => {
                        const r = RARITY_CFG[a.rarity];
                        return (
                          <motion.div key={a.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            style={{
                              background: T.cardBg, border: `1.5px solid ${r.color}`,
                              borderRadius: 16, padding: "14px 14px",
                              boxShadow: r.glow,
                              display: "flex", alignItems: "center", gap: 12,
                            }}>
                            <div style={{ width: 48, height: 48, background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.22)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                              {a.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.88rem" }}>{a.name}</p>
                                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", fontWeight: 700, color: r.color, background: `${r.color}22`, border: `1px solid ${r.color}44`, padding: "1px 6px", borderRadius: 99 }}>{r.label}</span>
                              </div>
                              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: T.muted, marginTop: 2, fontStyle: "italic" }}>{a.desc}</p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                              <div style={{ width: 28, height: 28, background: "rgba(122,171,106,0.2)", border: "1.5px solid rgba(122,171,106,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle2 size={14} style={{ color: "#7aab6a" }} />
                              </div>
                              <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.65rem" }}>+{a.xp} XP</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Locked feats */}
                {locked.length > 0 && (
                  <div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🔒 Locked ({locked.length})</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {locked.map((a, i) => (
                        <motion.div key={a.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          style={{
                            background: "rgba(58,32,16,0.4)", border: "1.5px solid rgba(200,160,74,0.1)",
                            borderRadius: 16, padding: "14px 14px", opacity: 0.55,
                            display: "flex", alignItems: "center", gap: 12,
                          }}>
                          <div style={{ width: 48, height: 48, background: "rgba(200,160,74,0.05)", border: "1.5px solid rgba(200,160,74,0.1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, filter: "grayscale(1)" }}>
                            {a.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.muted, fontSize: "0.88rem" }}>{a.name}</p>
                              <span style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", fontWeight: 700, color: T.muted, background: "rgba(200,160,74,0.08)", border: "1px solid rgba(200,160,74,0.15)", padding: "1px 6px", borderRadius: 99 }}>{RARITY_CFG[a.rarity].label}</span>
                            </div>
                            <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "rgba(160,120,72,0.6)", marginTop: 2, fontStyle: "italic" }}>{a.desc}</p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                            <div style={{ width: 28, height: 28, background: "rgba(200,160,74,0.06)", border: "1.5px solid rgba(200,160,74,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Lock size={12} style={{ color: T.muted }} />
                            </div>
                            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "rgba(160,120,72,0.5)", fontSize: "0.65rem" }}>+{a.xp} XP</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </>
  );
}