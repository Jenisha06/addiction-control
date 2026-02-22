"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Trophy, Award, Flame, Heart, LogOut,
  Edit3, Plus, CheckCircle2, Target, ArrowRight,
  Wind, Gamepad, Sparkles, ChevronLeft, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";


// ─── Avatars ──────────────────────────────────────────────────────────────────
const AVATARS = [
  {
    id: "aurora", name: "Aurora",
    skin: "#F4C899", skinShade: "#E8A870", skinLight: "#FDE8CC",
    hair: "#1C1C2E", hairHigh: "#2d2d45",
    eye: "#5B8DD9", lip: "#E8698A", blush: "#F4A5B0",
    brow: "#1C1C2E", lash: "#0d0d1a",
    hairStyle: "long",
    gradient: ["#667eea", "#a78bfa"],
    bg: "#EEF2FF",
  },
  {
    id: "nova", name: "Nova",
    skin: "#C8825A", skinShade: "#A0623E", skinLight: "#E0A07A",
    hair: "#0d0800", hairHigh: "#1a0f00",
    eye: "#8B6914", lip: "#B85C38", blush: "#C47B5A",
    brow: "#0d0800", lash: "#000000",
    hairStyle: "bun",
    gradient: ["#f093fb", "#f5576c"],
    bg: "#FFF0F3",
  },
  {
    id: "sage", name: "Sage",
    skin: "#FCDCB2", skinShade: "#E8B880", skinLight: "#FFF0D8",
    hair: "#7B3010", hairHigh: "#A04020",
    eye: "#3A8C3A", lip: "#D4607A", blush: "#FFB3C1",
    brow: "#7B3010", lash: "#4a1a00",
    hairStyle: "wavy",
    gradient: ["#43e97b", "#38f9d7"],
    bg: "#F0FFF4",
  },
  {
    id: "luna", name: "Luna",
    skin: "#E8C090", skinShade: "#CC9A68", skinLight: "#F8DEB8",
    hair: "#1a0800", hairHigh: "#2d1000",
    eye: "#8B4513", lip: "#C46B52", blush: "#DBA58E",
    brow: "#1a0800", lash: "#0d0400",
    hairStyle: "ponytail",
    gradient: ["#fa709a", "#fee140"],
    bg: "#FFFBEB",
  },
  {
    id: "zara", name: "Zara",
    skin: "#7B3E1E", skinShade: "#5A2A10", skinLight: "#A05828",
    hair: "#080808", hairHigh: "#181818",
    eye: "#8B5E3C", lip: "#7B2D1F", blush: "#8B5E4A",
    brow: "#080808", lash: "#000000",
    hairStyle: "afro",
    gradient: ["#4ecdc4", "#45b7d1"],
    bg: "#F0FDFF",
  },
  {
    id: "rei", name: "Rei",
    skin: "#FFE4C4", skinShade: "#FFCA96", skinLight: "#FFF4E8",
    hair: "#0d0d0d", hairHigh: "#202020",
    eye: "#4B4B4B", lip: "#F48FB1", blush: "#FFCDD2",
    brow: "#1a1a1a", lash: "#0d0d0d",
    hairStyle: "straight",
    gradient: ["#ff9a9e", "#fecfef"],
    bg: "#FFF5F5",
  },
];

// ─── Outfits ──────────────────────────────────────────────────────────────────
const OUTFITS = [
  { id: "casual",  name: "Casual",  top: "#E8EAF6", topD: "#C5C8E8", bottom: "#1a3a6b", bottomD: "#0d2245", shoe: "#E0E0E0", shoeD: "#BDBDBD", lace: "#FFFFFF", accent: "#7986CB" },
  { id: "sporty",  name: "Sporty",  top: "#D32F2F", topD: "#B71C1C", bottom: "#1A1A1A", bottomD: "#000000", shoe: "#FFFFFF",  shoeD: "#E0E0E0", lace: "#D32F2F", accent: "#FF5252" },
  { id: "elegant", name: "Elegant", top: "#1A237E", topD: "#0D1457", bottom: "#1A237E", bottomD: "#0D1457", shoe: "#B8960C", shoeD: "#8B7000", lace: "#FFD700", accent: "#3949AB" },
  { id: "street",  name: "Street",  top: "#1C1C1C", topD: "#0a0a0a", bottom: "#2E3A40", bottomD: "#1a2228", shoe: "#FF6F00", shoeD: "#E65100", lace: "#FFFFFF", accent: "#FF6F00" },
  { id: "summer",  name: "Summer",  top: "#F48FB1", topD: "#E91E8C", bottom: "#F8BBD9", bottomD: "#F48FB1", shoe: "#FFFFFF",  shoeD: "#F8BBD9", lace: "#F48FB1", accent: "#E91E8C" },
  { id: "cozy",    name: "Cozy",    top: "#6D4C41", topD: "#4E342E", bottom: "#3E2723", bottomD: "#1a0f0d", shoe: "#A1887F", shoeD: "#795548", lace: "#D7CCC8", accent: "#A1887F" },
];

// ─── Poses ────────────────────────────────────────────────────────────────────
const POSES = [
  { id: "stand",  name: "Stand",  emoji: "🧍", desc: "Default idle" },
  { id: "walk",   name: "Walk",   emoji: "🚶", desc: "Walking loop" },
  { id: "runway", name: "Runway", emoji: "💃", desc: "Catwalk strut" },
  { id: "pose",   name: "Pose",   emoji: "✨", desc: "Glam sparkle" },
];

// ─── Human-like Avatar SVG ────────────────────────────────────────────────────
function HumanAvatar({ av, outfit, pose, walking, size = 320 }) {
  const wt = { duration: 0.55, repeat: Infinity, ease: "easeInOut" };
  const runwayBodyAnim = pose === "runway"
    ? { x: [-55, 55, -55], transition: { duration: 2.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] } }
    : {};

  const Hair = () => {
    switch (av.hairStyle) {
      case "long":
        return <g>
          <ellipse cx="160" cy="88" rx="66" ry="72" fill={av.hair} />
          <rect x="94" y="110" width="28" height="190" rx="14" fill={av.hair} />
          <rect x="198" y="110" width="28" height="175" rx="14" fill={av.hair} />
          <ellipse cx="145" cy="72" rx="18" ry="10" fill={av.hairHigh} opacity="0.5" transform="rotate(-20,145,72)" />
        </g>;
      case "bun":
        return <g>
          <ellipse cx="160" cy="90" rx="64" ry="68" fill={av.hair} />
          <circle cx="160" cy="34" r="28" fill={av.hair} />
          <circle cx="160" cy="34" r="20" fill={av.hairHigh} opacity="0.3" />
          <ellipse cx="150" cy="28" rx="10" ry="7" fill={av.hairHigh} opacity="0.4" transform="rotate(-20,150,28)" />
        </g>;
      case "wavy":
        return <g>
          <ellipse cx="160" cy="88" rx="66" ry="70" fill={av.hair} />
          <path d="M94,118 Q80,160 94,195 Q82,225 96,255 Q86,280 100,300" stroke={av.hair} strokeWidth="26" fill="none" strokeLinecap="round" />
          <path d="M226,118 Q240,160 226,195 Q238,225 224,255 Q234,280 220,300" stroke={av.hair} strokeWidth="26" fill="none" strokeLinecap="round" />
          <ellipse cx="145" cy="70" rx="18" ry="10" fill={av.hairHigh} opacity="0.4" transform="rotate(-20,145,70)" />
        </g>;
      case "ponytail":
        return <g>
          <ellipse cx="160" cy="88" rx="64" ry="68" fill={av.hair} />
          <path d="M210,100 Q248,130 238,210 Q232,245 218,235 Q228,185 210,145 Q215,120 212,105Z" fill={av.hair} />
          <ellipse cx="145" cy="70" rx="18" ry="10" fill={av.hairHigh} opacity="0.4" transform="rotate(-20,145,70)" />
        </g>;
      case "afro":
        return <g>
          <circle cx="160" cy="82" r="78" fill={av.hair} />
          <circle cx="130" cy="55" r="22" fill={av.hairHigh} opacity="0.15" />
          <circle cx="185" cy="65" r="18" fill={av.hairHigh} opacity="0.15" />
          <circle cx="155" cy="35" r="20" fill={av.hairHigh} opacity="0.15" />
          <circle cx="200" cy="95" r="16" fill={av.hairHigh} opacity="0.12" />
          <circle cx="118" cy="95" r="18" fill={av.hairHigh} opacity="0.12" />
        </g>;
      default:
        return <g>
          <ellipse cx="160" cy="88" rx="64" ry="70" fill={av.hair} />
          <rect x="96" y="108" width="24" height="160" rx="12" fill={av.hair} />
          <rect x="200" y="108" width="24" height="150" rx="12" fill={av.hair} />
          <ellipse cx="148" cy="72" rx="16" ry="9" fill={av.hairHigh} opacity="0.4" transform="rotate(-15,148,72)" />
        </g>;
    }
  };

  return (
    <motion.div className="flex items-end justify-center" style={{ height: size + 20 }} animate={runwayBodyAnim}>
      <svg viewBox="60 18 200 612" width={size * 0.56} height={size} xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.18)) drop-shadow(0 6px 12px rgba(0,0,0,0.10))", overflow: "visible" }}>

        {/* Ground shadow */}
        <ellipse cx="160" cy="626" rx="75" ry="11" fill="rgba(0,0,0,0.13)" />

        {/* Hair back */}
        <Hair />

        {/* Neck */}
        <rect x="146" y="172" width="28" height="88" rx="12" fill={av.skin} />
        <rect x="146" y="172" width="10" height="88" rx="5" fill={av.skinShade} opacity="0.25" />

        {/* HEAD */}
        <ellipse cx="160" cy="118" rx="64" ry="70" fill={av.skin} />
        <ellipse cx="160" cy="82" rx="50" ry="28" fill={av.skinLight} opacity="0.6" />
        <ellipse cx="160" cy="168" rx="40" ry="20" fill={av.skinShade} opacity="0.22" />

        {/* Ears */}
        <ellipse cx="96" cy="122" rx="12" ry="16" fill={av.skin} />
        <ellipse cx="96" cy="122" rx="7" ry="10" fill={av.skinShade} opacity="0.32" />
        <ellipse cx="224" cy="122" rx="12" ry="16" fill={av.skin} />
        <ellipse cx="224" cy="122" rx="7" ry="10" fill={av.skinShade} opacity="0.32" />

        {/* Eyebrows */}
        <path d="M120,94 Q136,84 150,91" stroke={av.brow} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M170,91 Q184,84 200,94" stroke={av.brow} strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* Eye whites */}
        <ellipse cx="135" cy="112" rx="18" ry="16" fill="white" />
        <ellipse cx="185" cy="112" rx="18" ry="16" fill="white" />
        {/* Eyelid shadow */}
        <path d="M117,106 Q135,100 153,106" stroke={av.skinShade} strokeWidth="2" fill="none" opacity="0.35" />
        <path d="M167,106 Q185,100 203,106" stroke={av.skinShade} strokeWidth="2" fill="none" opacity="0.35" />
        {/* Iris */}
        <circle cx="135" cy="113" r="11" fill={av.eye} />
        <circle cx="185" cy="113" r="11" fill={av.eye} />
        {/* Pupil */}
        <circle cx="135" cy="113" r="6.5" fill="#080810" />
        <circle cx="185" cy="113" r="6.5" fill="#080810" />
        {/* Catchlights */}
        <circle cx="139" cy="109" r="3.5" fill="white" />
        <circle cx="189" cy="109" r="3.5" fill="white" />
        <circle cx="131" cy="116" r="1.5" fill="white" opacity="0.5" />
        <circle cx="181" cy="116" r="1.5" fill="white" opacity="0.5" />

        {/* Eyelashes top — left eye */}
        <path d="M117,106 Q120,98 125,102" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M124,102 Q126,94 131,100" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M130,100 Q133,93 137,99" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M137,99 Q141,93 145,100" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M145,100 Q149,95 152,103" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M152,103 Q154,97 153,106" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Eyelashes top — right eye */}
        <path d="M167,106 Q168,97 172,103" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M172,103 Q175,95 179,100" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M179,100 Q183,93 187,99" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M187,99 Q191,93 195,100" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M195,100 Q199,95 203,103" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M203,103 Q205,97 203,106" stroke={av.lash} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M152,130 Q160,148 168,130" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.45" />
        <ellipse cx="154" cy="148" rx="5.5" ry="4" fill={av.skinShade} opacity="0.25" />
        <ellipse cx="166" cy="148" rx="5.5" ry="4" fill={av.skinShade} opacity="0.25" />
        <ellipse cx="160" cy="150" rx="9" ry="4.5" fill={av.skinShade} opacity="0.13" />

        {/* Blush */}
        <ellipse cx="112" cy="138" rx="20" ry="12" fill={av.blush} opacity="0.42" />
        <ellipse cx="208" cy="138" rx="20" ry="12" fill={av.blush} opacity="0.42" />

        {/* Mouth */}
        {/* Upper lip */}
        <path d="M145,160 Q152,154 160,157 Q168,154 175,160 Q160,168 145,160Z" fill={av.lip} opacity="0.75" />
        {/* Lower lip */}
        <path d="M145,160 Q160,176 175,160 Q160,171 145,160Z" fill={av.lip} opacity="0.55" />
        {/* Lip line */}
        <path d="M145,160 Q152,154 160,157 Q168,154 175,160" stroke={av.lip} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
        {/* Lip highlight */}
        <ellipse cx="156" cy="166" rx="6" ry="3" fill="white" opacity="0.22" />
        {/* Dimples */}
        <circle cx="140" cy="162" r="2.5" fill={av.skinShade} opacity="0.28" />
        <circle cx="180" cy="162" r="2.5" fill={av.skinShade} opacity="0.28" />

        {/* HEADPHONES */}
        <path d="M96,118 Q96,50 160,50 Q224,50 224,118" stroke="#1a1a1a" strokeWidth="12" fill="none" strokeLinecap="round" />
        <rect x="80" y="106" width="26" height="42" rx="13" fill="#222" />
        <rect x="83" y="109" width="20" height="36" rx="10" fill="#333" />
        <ellipse cx="93" cy="127" rx="7" ry="10" fill="#1a1a1a" />
        <rect x="214" y="106" width="26" height="42" rx="13" fill="#222" />
        <rect x="217" y="109" width="20" height="36" rx="10" fill="#333" />
        <ellipse cx="227" cy="127" rx="7" ry="10" fill="#1a1a1a" />
        <path d="M112,54 Q160,44 208,54" stroke="#444" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* SHOULDERS */}
        <ellipse cx="97" cy="258" rx="22" ry="15" fill={outfit.top} />
        <ellipse cx="223" cy="258" rx="22" ry="15" fill={outfit.top} />

        {/* LEFT ARM */}
        <motion.g style={{ transformOrigin: "97px 258px" }}
          animate={walking ? { rotate: [0, -22, 0, 22, 0] } : pose === "pose" ? { rotate: -28 } : { rotate: 0 }}
          transition={wt}>
          {/* Sleeve */}
          <rect x="76" y="252" width="30" height="58" rx="15" fill={outfit.top} />
          <rect x="76" y="252" width="11" height="58" rx="5.5" fill={outfit.topD} opacity="0.3" />
          {/* Forearm */}
          <rect x="79" y="305" width="24" height="68" rx="12" fill={av.skin} />
          <rect x="79" y="305" width="9" height="68" rx="4.5" fill={av.skinShade} opacity="0.22" />
          {/* Hand */}
          <ellipse cx="91" cy="378" rx="15" ry="17" fill={av.skin} />
          <ellipse cx="91" cy="374" rx="9" ry="7" fill={av.skinLight} opacity="0.45" />
          <path d="M81,372 Q79,362 83,360" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.38" />
          <path d="M91,370 Q90,358 94,357" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.38" />
          <path d="M100,372 Q101,362 97,360" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.38" />
        </motion.g>

        {/* RIGHT ARM */}
        <motion.g style={{ transformOrigin: "223px 258px" }}
          animate={walking ? { rotate: [0, 22, 0, -22, 0] } : pose === "pose" ? { rotate: 28 } : { rotate: 0 }}
          transition={{ ...wt, delay: 0.28 }}>
          <rect x="214" y="252" width="30" height="58" rx="15" fill={outfit.top} />
          <rect x="225" y="252" width="11" height="58" rx="5.5" fill={outfit.topD} opacity="0.3" />
          <rect x="217" y="305" width="24" height="68" rx="12" fill={av.skin} />
          <rect x="228" y="305" width="9" height="68" rx="4.5" fill={av.skinShade} opacity="0.2" />
          <ellipse cx="229" cy="378" rx="15" ry="17" fill={av.skin} />
          <ellipse cx="229" cy="374" rx="9" ry="7" fill={av.skinLight} opacity="0.45" />
          <path d="M219,372 Q217,362 221,360" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.38" />
          <path d="M229,370 Q228,358 232,357" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.38" />
          <path d="M238,372 Q239,362 235,360" stroke={av.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.38" />
        </motion.g>

        {/* TORSO */}
        <path d="M108,255 Q100,265 98,290 L98,400 Q98,410 108,410 L212,410 Q222,410 222,400 L222,290 Q220,265 212,255Z" fill={outfit.top} />
        <path d="M108,255 Q103,268 100,285 L100,310 Q108,295 108,272Z" fill={outfit.topD} opacity="0.4" />
        <path d="M212,255 Q217,268 220,285 L220,310 Q212,295 212,272Z" fill={outfit.topD} opacity="0.4" />
        <path d="M140,255 Q160,274 180,255" stroke={outfit.topD} strokeWidth="3" fill="none" opacity="0.55" />
        <line x1="160" y1="265" x2="160" y2="408" stroke={outfit.topD} strokeWidth="1.5" opacity="0.25" />
        <path d="M98,375 Q160,390 222,375" stroke={outfit.topD} strokeWidth="2" fill="none" opacity="0.2" />

        {/* PANTS waistband */}
        <rect x="98" y="408" width="124" height="22" rx="6" fill={outfit.bottomD} />
        <rect x="152" y="412" width="16" height="14" rx="3" fill={outfit.accent} opacity="0.7" />

        {/* LEFT LEG */}
        <motion.g style={{ transformOrigin: "130px 430px" }}
          animate={walking ? { rotate: [0, 18, 0, -18, 0] } : { rotate: 0 }}
          transition={wt}>
          <path d="M98,430 L100,570 Q102,582 116,582 L150,582 Q162,582 162,570 L162,430Z" fill={outfit.bottom} />
          <path d="M100,432 L100,568 Q102,578 110,580 L100,584 Q96,574 96,562 L96,432Z" fill={outfit.bottomD} opacity="0.38" />
          <path d="M100,500 Q130,508 160,500" stroke={outfit.bottomD} strokeWidth="2.5" fill="none" opacity="0.32" />
          {/* Left shoe */}
          <ellipse cx="126" cy="596" rx="34" ry="14" fill={outfit.shoeD} />
          <path d="M92,582 Q92,600 126,600 Q158,600 158,588 L158,582 Q142,577 110,580Z" fill={outfit.shoe} />
          <path d="M92,594 Q92,600 126,602 Q158,600 158,594" stroke={outfit.shoeD} strokeWidth="3" fill="none" />
          <line x1="108" y1="586" x2="144" y2="586" stroke={outfit.lace} strokeWidth="2" opacity="0.75" />
          <line x1="110" y1="582" x2="110" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
          <line x1="120" y1="582" x2="120" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
          <line x1="130" y1="582" x2="130" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
          <line x1="140" y1="582" x2="140" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
        </motion.g>

        {/* RIGHT LEG */}
        <motion.g style={{ transformOrigin: "190px 430px" }}
          animate={walking ? { rotate: [0, -18, 0, 18, 0] } : { rotate: 0 }}
          transition={{ ...wt, delay: 0.28 }}>
          <path d="M162,430 L162,570 Q162,582 174,582 L206,582 Q220,582 220,570 L220,430Z" fill={outfit.bottom} />
          <path d="M220,432 L220,568 Q218,578 210,580 L220,584 Q224,574 224,562 L224,432Z" fill={outfit.bottomD} opacity="0.35" />
          <path d="M162,500 Q192,508 220,500" stroke={outfit.bottomD} strokeWidth="2.5" fill="none" opacity="0.32" />
          {/* Right shoe */}
          <ellipse cx="194" cy="596" rx="34" ry="14" fill={outfit.shoeD} />
          <path d="M162,582 Q162,600 194,600 Q228,600 228,588 L228,582 Q212,577 178,580Z" fill={outfit.shoe} />
          <path d="M162,594 Q162,600 194,602 Q228,600 228,594" stroke={outfit.shoeD} strokeWidth="3" fill="none" />
          <line x1="178" y1="586" x2="214" y2="586" stroke={outfit.lace} strokeWidth="2" opacity="0.75" />
          <line x1="180" y1="582" x2="180" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
          <line x1="190" y1="582" x2="190" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
          <line x1="200" y1="582" x2="200" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
          <line x1="210" y1="582" x2="210" y2="590" stroke={outfit.lace} strokeWidth="1.5" opacity="0.6" />
        </motion.g>

        {/* Sparkles for pose */}
        {pose === "pose" && (
          <>
            <motion.text x="232" y="160" fontSize="26" animate={{ opacity: [0, 1, 0], y: [0, -28, -55] }} transition={{ duration: 1.8, repeat: Infinity }}>✨</motion.text>
            <motion.text x="52" y="180" fontSize="20" animate={{ opacity: [0, 1, 0], y: [0, -24, -48] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}>⭐</motion.text>
            <motion.text x="238" y="265" fontSize="16" animate={{ opacity: [0, 1, 0], y: [0, -18, -36] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1.1 }}>💫</motion.text>
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ─── Mini face for avatar picker ──────────────────────────────────────────────
function MiniAvatarFace({ av }) {
  return (
    <svg viewBox="82 28 160 168" width="88" height="88">
      <ellipse cx="160" cy="88" rx="64" ry="68" fill={av.hair} />
      <ellipse cx="160" cy="118" rx="62" ry="68" fill={av.skin} />
      <ellipse cx="160" cy="82" rx="48" ry="26" fill={av.skinLight} opacity="0.55" />
      <path d="M122,96 Q136,86 150,93" stroke={av.brow} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M170,93 Q184,86 198,96" stroke={av.brow} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="136" cy="112" rx="17" ry="15" fill="white" />
      <ellipse cx="184" cy="112" rx="17" ry="15" fill="white" />
      <circle cx="136" cy="112" r="10" fill={av.eye} />
      <circle cx="184" cy="112" r="10" fill={av.eye} />
      <circle cx="136" cy="112" r="6" fill="#080810" />
      <circle cx="184" cy="112" r="6" fill="#080810" />
      <circle cx="140" cy="108" r="3.5" fill="white" />
      <circle cx="188" cy="108" r="3.5" fill="white" />
      <ellipse cx="112" cy="138" rx="19" ry="11" fill={av.blush} opacity="0.44" />
      <ellipse cx="208" cy="138" rx="19" ry="11" fill={av.blush} opacity="0.44" />
      <ellipse cx="154" cy="148" rx="5" ry="3.5" fill={av.skinShade} opacity="0.22" />
      <ellipse cx="166" cy="148" rx="5" ry="3.5" fill={av.skinShade} opacity="0.22" />
      <path d="M145,161 Q152,155 160,157 Q168,155 175,161" stroke={av.lip} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M145,161 Q160,175 175,161 Q160,172 145,161Z" fill={av.lip} opacity="0.6" />
      {/* Hair front */}
      <ellipse cx="160" cy="63" rx="64" ry="38" fill={av.hair} />
      <ellipse cx="160" cy="80" rx="56" ry="20" fill={av.skin} />
    </svg>
  );
}

// ─── Other data ───────────────────────────────────────────────────────────────
const habitOptions = [
  { id: "exercise",   icon: <Flame size={18} />,   label: "Exercise",   color: "text-rose-600 bg-rose-50" },
  { id: "meditation", icon: <Wind size={18} />,    label: "Meditation", color: "text-blue-600 bg-blue-50" },
  { id: "reading",    icon: <Target size={18} />,  label: "Reading",    color: "text-emerald-600 bg-emerald-50" },
  { id: "gaming",     icon: <Gamepad size={18} />, label: "Gaming",     color: "text-purple-600 bg-purple-50" },
];

const achievements = [
  { id: 1, name: "1 Day Strong",     icon: <Award className="text-blue-500" />,    completed: true,  date: "Feb 15, 2026" },
  { id: 2, name: "7 Days Clean",     icon: <Trophy className="text-emerald-500" />, completed: true,  date: "Feb 22, 2026" },
  { id: 3, name: "Trigger Master",   icon: <Target className="text-rose-500" />,   completed: false, description: "Log 5 triggers" },
  { id: 4, name: "Stress Survivor",  icon: <Shield className="text-purple-500" />, completed: false, description: "Complete 3 CBT sessions" },
  { id: 5, name: "Community Leader", icon: <Heart className="text-amber-500" />,   completed: false, description: "Help 3 people" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { userData } = useApp();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [outfitIdx, setOutfitIdx] = useState(0);
  const [pose, setPose] = useState("stand");
  const [custTab, setCustTab] = useState("avatar");

  const av = AVATARS[avatarIdx];
  const outfit = OUTFITS[outfitIdx];
  const walking = pose === "walk" || pose === "runway";
const [name, setName] = useState("Anonymous User");

useEffect(() => {
  const loadName = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().name) {
      setName(snap.data().name);
    }
  };

  loadName();
}, []);
  return (
    <div className="min-h-screen bg-slate-50 pb-32 max-w-lg mx-auto overflow-hidden">

      {/* ── AVATAR CUSTOMIZER FULLSCREEN ── */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-0 z-50 flex flex-col bg-white"
            style={{ maxWidth: 480, left: "50%", transform: "translateX(-50%)", right: "auto", width: "100%" }}
          >
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <button onClick={() => setShowCustomizer(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100">
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <span className="text-lg font-black text-slate-900 tracking-tight">Customize Avatar</span>
              <button
                onClick={() => { setShowCustomizer(false); toast.success("Avatar saved! 🎉"); }}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl shadow-lg">
                Save
              </button>
            </div>

            {/* ── Avatar preview — exactly 42% of screen height ── */}
            <div
              className="relative flex items-end justify-center shrink-0 overflow-hidden"
              style={{
                height: "42vh",
                minHeight: 240,
                maxHeight: 340,
                background: `linear-gradient(160deg, ${av.bg} 0%, #ffffff 100%)`,
              }}
            >
              {pose === "runway" && (
                <div className="absolute inset-x-0 bottom-0 h-14"
                  style={{ background: "linear-gradient(to top, rgba(180,180,180,0.3), transparent)" }} />
              )}
              <div className="absolute top-3 right-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1.5">
                <span>{POSES.find(p => p.id === pose)?.emoji}</span>
                <span>{POSES.find(p => p.id === pose)?.name}</span>
              </div>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 20%, ${av.gradient[0]}28, transparent 65%)` }} />

              <div className="mb-2">
                <HumanAvatar av={av} outfit={outfit} pose={pose} walking={walking} size={280} />
              </div>
            </div>

            {/* ── Sub-tabs ── */}
            <div className="flex gap-2 px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
              {["avatar", "outfit", "pose"].map(t => (
                <button key={t} onClick={() => setCustTab(t)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wide transition-all ${
                    custTab === t ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-500"
                  }`}>
                  {t === "avatar" ? "👤 Avatar" : t === "outfit" ? "👗 Outfit" : "💃 Pose"}
                </button>
              ))}
            </div>

            {/* ── Scrollable bottom panel ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50">
              <div className="px-4 py-5">

                {/* AVATAR tab */}
                {custTab === "avatar" && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose your avatar</p>
                    <div className="grid grid-cols-3 gap-3">
                      {AVATARS.map((a, i) => (
                        <motion.button key={a.id} whileTap={{ scale: 0.93 }}
                          onClick={() => setAvatarIdx(i)}
                          className={`relative rounded-3xl overflow-hidden border-2 transition-all bg-white ${
                            avatarIdx === i ? "border-slate-900 shadow-2xl" : "border-slate-100 shadow-sm"
                          }`}
                        >
                          <div
                            className="pt-3 pb-0 flex flex-col items-center"
                            style={{ background: `linear-gradient(160deg, ${a.bg}, #ffffff)` }}
                          >
                            <MiniAvatarFace av={a} />
                            <span className="text-xs font-black text-slate-700 mt-1 mb-2">{a.name}</span>
                          </div>
                          {/* Color bar */}
                          <div className="h-2" style={{ background: `linear-gradient(to right, ${a.gradient[0]}, ${a.gradient[1]})` }} />
                          {avatarIdx === i && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
                              <CheckCircle2 size={11} className="text-white" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OUTFIT tab */}
                {custTab === "outfit" && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose outfit</p>
                    <div className="grid grid-cols-2 gap-3">
                      {OUTFITS.map((of, i) => (
                        <motion.button key={of.id} whileTap={{ scale: 0.96 }}
                          onClick={() => setOutfitIdx(i)}
                          className={`p-4 rounded-3xl border-2 text-left transition-all bg-white ${
                            outfitIdx === i ? "border-slate-900 shadow-xl" : "border-slate-100 shadow-sm"
                          }`}>
                          <div className="flex items-end gap-2 mb-3">
                            <div className="w-10 h-10 rounded-2xl border border-slate-100 shadow-sm" style={{ background: of.top }} />
                            <div className="flex flex-col gap-1">
                              <div className="w-10 h-5 rounded-xl border border-slate-100 shadow-sm" style={{ background: of.bottom }} />
                              <div className="w-10 h-4 rounded-lg border border-slate-100 shadow-sm" style={{ background: of.shoe }} />
                            </div>
                          </div>
                          <p className="font-black text-sm text-slate-800">{of.name}</p>
                          {outfitIdx === i && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <CheckCircle2 size={13} className="text-slate-900" />
                              <span className="text-xs text-slate-500 font-semibold">Selected</span>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* POSE tab */}
                {custTab === "pose" && (
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose pose / animation</p>
                    <div className="grid grid-cols-2 gap-3">
                      {POSES.map(p => (
                        <motion.button key={p.id} whileTap={{ scale: 0.96 }}
                          onClick={() => setPose(p.id)}
                          className={`p-5 rounded-3xl border-2 text-left transition-all ${
                            pose === p.id ? "border-slate-900 bg-slate-900 shadow-2xl" : "border-slate-100 bg-white shadow-sm"
                          }`}>
                          <div className="text-4xl mb-2">{p.emoji}</div>
                          <p className={`font-black text-sm ${pose === p.id ? "text-white" : "text-slate-800"}`}>{p.name}</p>
                          <p className={`text-xs mt-0.5 ${pose === p.id ? "text-slate-300" : "text-slate-400"}`}>{p.desc}</p>
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

      {/* ── PROFILE PAGE CONTENT ── */}
      <div className="p-6 space-y-5">

        {/* Header */}
        <header className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowCustomizer(true)}
              className="relative w-20 h-20 rounded-[24px] overflow-hidden border-2 border-white shadow-xl flex items-end justify-center"
              style={{ background: `linear-gradient(160deg, ${av.bg}, #ffffff)` }}>
              <svg viewBox="80 28 160 175" width="72" height="72">
                <ellipse cx="160" cy="88" rx="64" ry="68" fill={av.hair} />
                <ellipse cx="160" cy="118" rx="62" ry="68" fill={av.skin} />
                <ellipse cx="160" cy="82" rx="48" ry="26" fill={av.skinLight} opacity="0.5" />
                <path d="M122,96 Q136,86 150,93" stroke={av.brow} strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M170,93 Q184,86 198,96" stroke={av.brow} strokeWidth="5" fill="none" strokeLinecap="round" />
                <ellipse cx="136" cy="112" rx="16" ry="14" fill="white" />
                <ellipse cx="184" cy="112" rx="16" ry="14" fill="white" />
                <circle cx="136" cy="112" r="10" fill={av.eye} />
                <circle cx="184" cy="112" r="10" fill={av.eye} />
                <circle cx="136" cy="112" r="6" fill="#080810" />
                <circle cx="184" cy="112" r="6" fill="#080810" />
                <circle cx="140" cy="108" r="3.5" fill="white" />
                <circle cx="188" cy="108" r="3.5" fill="white" />
                <ellipse cx="112" cy="138" rx="18" ry="10" fill={av.blush} opacity="0.44" />
                <ellipse cx="208" cy="138" rx="18" ry="10" fill={av.blush} opacity="0.44" />
                <path d="M145,161 Q152,155 160,157 Q168,155 175,161" stroke={av.lip} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M145,161 Q160,175 175,161 Q160,172 145,161Z" fill={av.lip} opacity="0.6" />
                <ellipse cx="160" cy="63" rx="64" ry="38" fill={av.hair} />
                <ellipse cx="160" cy="80" rx="56" ry="20" fill={av.skin} />
              </svg>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
                <Edit3 size={10} className="text-white" />
              </div>
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
  {name}
</h1>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Level {userData.level} · {av.name}</p>
            </div>
          </div>
          <Settings size={22} className="text-slate-400" />
        </header>

        {/* Avatar card */}
        <motion.button whileTap={{ scale: 0.985 }} onClick={() => setShowCustomizer(true)}
          className="w-full rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden text-left"
          style={{ background: `linear-gradient(160deg, ${av.bg}90, #ffffff)` }}>
          <div className="flex items-end gap-0 pl-2 pr-4 pt-2 pb-3">
            <div className="shrink-0 overflow-hidden" style={{ height: 120, width: 100 }}>
              <HumanAvatar av={av} outfit={outfit} pose={pose} walking={walking} size={215} />
            </div>
            <div className="flex-1 pb-1">
              <p className="font-black text-slate-900 text-base">Your Avatar</p>
              <p className="text-xs text-slate-500">{av.name} · {outfit.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{POSES.find(p2 => p2.id === pose)?.emoji} {POSES.find(p2 => p2.id === pose)?.name}</p>
              <div className="flex gap-1.5 mt-2.5">
                {OUTFITS.map((of, i) => (
                  <div key={of.id}
                    className={`rounded-full border-2 transition-all ${outfitIdx === i ? "border-slate-900" : "border-slate-200"}`}
                    style={{ background: of.top, width: outfitIdx === i ? 16 : 14, height: outfitIdx === i ? 16 : 14 }} />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400 pb-2 shrink-0">
              <Sparkles size={18} />
              <span className="text-xs font-bold">Edit</span>
            </div>
          </div>
        </motion.button>

        {/* Tabs */}
        <div className="flex bg-white p-1.5 rounded-3xl border">
          {["profile", "habits", "achievements"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase transition-all ${
                activeTab === tab ? "bg-slate-900 text-white" : "text-slate-400"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border">
                <h2 className="font-bold mb-4">Your Progress</h2>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(userData.xp % 1000) / 10}%` }}
                    className="h-full bg-blue-600" />
                </div>
                <p className="text-xs mt-2 text-slate-500">{userData.xp} XP</p>
              </div>
            </motion.div>
          )}
          {activeTab === "habits" && (
            <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {habitOptions.map(h => (
                <button key={h.id} onClick={() => toast.success("Habit updated!")}
                  className="w-full flex justify-between items-center p-5 bg-white rounded-2xl border">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.color}`}>{h.icon}</div>
                    <span>{h.label}</span>
                  </div>
                  <Plus size={16} />
                </button>
              ))}
            </motion.div>
          )}
          {activeTab === "achievements" && (
            <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {achievements.map(ach => (
                <div key={ach.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{ach.name}</h3>
                    <p className="text-xs text-slate-500">{ach.completed ? ach.date : ach.description}</p>
                  </div>
                  {ach.completed ? <CheckCircle2 className="text-blue-600" /> : <ArrowRight className="text-slate-300" />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button className="w-full text-rose-500 font-bold text-xs py-8">
          <LogOut size={18} className="inline mr-2" />Log Out
        </button>
      </div>
    </div>
  );
}