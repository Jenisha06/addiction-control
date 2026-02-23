"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, HelpCircle,
  Zap, Star, Users, Trophy, Heart,
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

export default function LandingPage() {
  const router = useRouter();
  const handleStart   = () => router.push("/login");
  const scrollToHow   = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: T.pageBg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes pulse{from{opacity:.3;transform:scale(1)}to{opacity:1;transform:scale(1.4)}}
        @keyframes floatUp{from{opacity:0;transform:translateY(0)}to{opacity:0;transform:translateY(-120px)}}
        * { box-sizing: border-box; }
      `}</style>

      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,180,60,0.15), transparent 60%)" }} />

      {/* Sparkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        {[{l:"5%",d:0},{l:"20%",d:1.2},{l:"45%",d:0.6},{l:"70%",d:1.8},{l:"88%",d:0.3},{l:"60%",d:2.2},{l:"33%",d:1.5}].map((p,i)=>(
          <div key={i} style={{ position:"absolute", left:p.l, top:`${10+i*12}%`, width:4, height:4, borderRadius:"50%", background:i%2===0?"rgba(255,230,140,0.8)":"rgba(180,240,200,0.7)", animation:`pulse ${2+p.d}s ease-in-out infinite alternate`, animationDelay:`${p.d}s` }} />
        ))}
      </div>

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "linear-gradient(180deg, rgba(45,26,12,0.97), rgba(45,26,12,0.93))", borderBottom: "1px solid rgba(200,160,74,0.18)", backdropFilter: "blur(14px)", padding: "14px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "rgba(200,160,74,0.15)", border: "1.5px solid rgba(200,160,74,0.35)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(200,160,74,0.18)" }}>
              <Shield size={18} style={{ color: T.gold }} />
            </div>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.15rem", letterSpacing: "0.02em" }}>Control.</span>
          </div>
          <button onClick={handleStart} className="transition-all active:scale-[0.97]"
            style={{ background: "rgba(200,160,74,0.1)", border: "1.5px solid rgba(200,160,74,0.3)", borderRadius: 99, padding: "8px 18px", fontFamily: "Georgia, serif", fontWeight: 700, color: T.gold, fontSize: "0.8rem", cursor: "pointer" }}>
            Log In
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: "44px 20px 32px", maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(200,160,74,0.15)", border: "1.5px solid rgba(200,160,74,0.35)", borderRadius: 99, padding: "6px 14px", marginBottom: 20 }}>
          <Star size={11} style={{ color: T.gold }} fill={T.gold} />
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>#1 Recovery Companion</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "clamp(2rem, 8vw, 2.8rem)", lineHeight: 1.15, marginBottom: 14 }}>
          Take Back{" "}
          <span style={{ color: "#6ab4d8" }}>Control.</span>
          <br />
          One Day at a Time.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.95rem", lineHeight: 1.75, fontStyle: "italic", marginBottom: 24 }}>
          A gamified recovery journey for alcohol addiction. Transform your path to sobriety into an adventure of growth and self-discovery.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleStart} className="transition-all active:scale-[0.97] group"
            style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 20, padding: "15px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.95rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Begin My Quest
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={scrollToHow} className="transition-all active:scale-[0.97]"
            style={{ width: "100%", background: T.woodLight, border: `2px solid ${T.btnBorder}`, borderRadius: 20, padding: "13px 20px", boxShadow: T.btnShadow, color: T.text, fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.88rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            How It Works
          </button>
        </motion.div>

        {/* ── Hero visual card ── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
          style={{ marginTop: 32, position: "relative" }}>
          {/* Main card */}
          <div style={{ width: "100%", borderRadius: 24, overflow: "hidden", border: "2px solid rgba(200,160,74,0.35)", boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,220,130,0.08)", background: "linear-gradient(135deg, rgba(60,30,10,0.95) 0%, rgba(40,20,8,0.98) 100%)", minHeight: 200 }}>
            {/* Arch glow inside */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,160,74,0.14), transparent 65%)", pointerEvents: "none" }} />
            {/* Rune ring decoration */}
            <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", border: "20px solid rgba(200,160,74,0.08)", pointerEvents: "none" }} />

            <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, position: "relative", zIndex: 1 }}>
              {/* Stats row */}
              <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                {[
                  { num: "14",  label: "Days Clean", glyph: "✅" },
                  { num: "2.4k",label: "XP Earned",  glyph: "⚡" },
                  { num: "Lv 5",label: "Recovery",   glyph: "🏆" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <span>{s.glyph}</span><span>{s.label}</span>
                    </div>
                    <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.5rem" }}>{s.num}</div>
                  </div>
                ))}
              </div>

              {/* XP bar */}
              <div style={{ marginTop: 20, width: "100%", maxWidth: 260 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted }}>Level 5</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.62rem", color: T.muted }}>2,400 / 5,000 XP</span>
                </div>
                <div style={{ height: 8, background: "rgba(200,160,74,0.15)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(200,160,74,0.2)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: "48%" }} transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge left */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
            style={{ position: "absolute", bottom: -18, left: -8, background: T.parchment, border: "2px solid #b8954a", borderRadius: 16, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(122,171,106,0.2)", border: "1.5px solid rgba(122,171,106,0.4)", borderRadius: 10, padding: 6 }}>
              <CheckCircle2 size={16} style={{ color: "#7aab6a" }} />
            </div>
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Today's streak</p>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.82rem" }}>14 Days Clean 🔥</p>
            </div>
          </motion.div>

          {/* Floating badge right */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.85 }}
            style={{ position: "absolute", bottom: -18, right: -8, background: T.parchment, border: "2px solid #b8954a", borderRadius: 16, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(106,180,216,0.2)", border: "1.5px solid rgba(106,180,216,0.4)", borderRadius: 10, padding: 6 }}>
              <Trophy size={16} style={{ color: "#6ab4d8" }} />
            </div>
            <div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Achievement</p>
              <p style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.text, fontSize: "0.82rem" }}>2 Week Warrior</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "52px 20px 24px", maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { num: "10k+", label: "Recoveries", glyph: "❤️", accent: "#c06060" },
            { num: "94%",  label: "Success Rate", glyph: "⭐", accent: "#c8a060" },
            { num: "50k+", label: "Days Sober",   glyph: "🛡️", accent: "#6ab4d8" },
          ].map((s, i) => (
            <div key={i} style={{ background: T.cardBg, border: `1.5px solid ${s.accent}35`, borderRadius: 16, padding: "14px 10px", textAlign: "center", boxShadow: `0 0 14px ${s.accent}10` }}>
              <div style={{ fontSize: "1.3rem", marginBottom: 5 }}>{s.glyph}</div>
              <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.2rem" }}>{s.num}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "32px 20px 32px", maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.5rem", marginBottom: 10 }}>How It Works</h2>
          <div style={{ width: 48, height: 4, background: "linear-gradient(90deg, #c8a060, #f0c840)", borderRadius: 99, margin: "0 auto" }} />
          <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.72rem", fontStyle: "italic", marginTop: 6 }}>ᚠ ᚢ ᚦ — three steps to forge your legend</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: <HelpCircle size={24} />, title: "1. Assess Yourself",  desc: "Identify your current stage and triggers with our interactive assessment.",                              glyph: "🔮", accent: "#6ab4d8" },
            { icon: <Zap size={24} />,        title: "2. Build Strength",   desc: "Complete daily quests, CBT exercises, and earn XP to level up your resilience.",                        glyph: "⚡", accent: "#7aab6a" },
            { icon: <Shield size={24} />,     title: "3. Stay Free",        desc: "Connect with an anonymous fellowship and unlock recovery milestones on your legend map.",               glyph: "🛡️", accent: "#9a78c0" },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 16px", background: T.cardBg, border: `1.5px solid ${item.accent}35`, borderRadius: 18, boxShadow: `0 0 16px ${item.accent}10` }}>
              <div style={{ width: 48, height: 48, background: `${item.accent}20`, border: `1.5px solid ${item.accent}45`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.4rem" }}>
                {item.glyph}
              </div>
              <div>
                <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "0.95rem", marginBottom: 5 }}>{item.title}</h3>
                <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.78rem", lineHeight: 1.65, fontStyle: "italic" }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ padding: "0 20px 32px", maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(60,32,12,0.95), rgba(40,20,8,0.98))", border: "2px solid rgba(200,160,74,0.4)", borderRadius: 22, padding: "22px 20px", position: "relative", overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,220,130,0.1)" }}>
          {/* Arch glow */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 130, height: 130, borderRadius: "50%", background: "rgba(200,160,74,0.06)", transform: "translate(50%, -50%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Stars */}
            <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={T.gold} style={{ color: T.gold }} />)}
            </div>
            <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.82rem", lineHeight: 1.8, fontStyle: "italic", marginBottom: 16 }}>
              "This quest changed my life. The gamification made recovery feel achievable day by day. 47 days clean and counting!"
            </p>
            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, background: "rgba(200,160,74,0.18)", border: "1.5px solid rgba(200,160,74,0.35)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.gold, fontSize: "0.85rem" }}>A</span>
              </div>
              <div>
                <p style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: T.goldLight, fontSize: "0.78rem" }}>Anonymous Seeker</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted, fontStyle: "italic" }}>47 days sober 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 20px 48px", maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, color: T.goldLight, fontSize: "1.4rem", marginBottom: 8 }}>Ready to begin your legend?</h2>
        <p style={{ fontFamily: "Georgia, serif", color: T.muted, fontSize: "0.78rem", fontStyle: "italic", marginBottom: 20 }}>Free, anonymous, and takes 2 minutes to start.</p>
        <button onClick={handleStart} className="transition-all active:scale-[0.97] group"
          style={{ width: "100%", background: T.questBtn, border: "2px solid #1478b0", borderRadius: 20, padding: "15px 20px", boxShadow: T.questShadow, color: "#fff", fontWeight: 900, fontFamily: "Georgia, serif", fontSize: "0.95rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          Get Started Free
          <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Users size={11} style={{ color: T.muted }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: T.muted, fontStyle: "italic" }}>Join 10,000+ seekers on their recovery journey</span>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "20px 20px 32px", borderTop: "1px solid rgba(200,160,74,0.18)", textAlign: "center", maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: T.muted, marginBottom: 12 }}>© 2026 Control Recovery. Built with ❤️ for Hackathon.</p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "rgba(200,160,74,0.25)", letterSpacing: "0.18em", marginBottom: 12 }}>ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ</p>
        <a href="tel:+919152987821"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(192,96,96,0.12)", border: "1.5px solid rgba(192,96,96,0.3)", borderRadius: 99, padding: "8px 16px", fontFamily: "Georgia, serif", fontWeight: 700, color: "#c06060", fontSize: "0.72rem", textDecoration: "none" }}>
          🚨 Emergency: iCall · 9152987821
        </a>
      </footer>

    </div>
  );
}