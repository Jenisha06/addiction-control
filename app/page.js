"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, HelpCircle,
  Zap, Star, Users, Trophy, Heart,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => router.push("/login");

  const scrollToHow = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-slate-800 overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-5 py-4">
        <div className="flex justify-between items-center max-w-xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Shield size={20} />
            </div>
            <span className="text-lg font-black tracking-tight text-blue-900">Control.</span>
          </div>
          <button
            onClick={handleStart}
            className="bg-white border border-slate-200 px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
          >
            Log In
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="px-5 pt-12 pb-10 max-w-xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wide mb-6"
        >
          <Star size={12} fill="currentColor" /> #1 Recovery Companion
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-5xl font-extrabold text-blue-950 leading-[1.15] mb-4"
        >
          Take Back{" "}
          <span className="text-blue-600">Control.</span>
          <br />
          One Day at a Time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed"
        >
          A gamified recovery journey for alcohol addiction. Transform your
          path to sobriety into an adventure of growth and self-discovery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-base hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
          >
            Start My Recovery
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={scrollToHow}
            className="w-full bg-white text-slate-700 border border-slate-200 px-6 py-4 rounded-2xl font-bold text-base hover:border-blue-300 active:scale-95 transition-all shadow-sm"
          >
            Learn How It Works
          </button>
        </motion.div>

        {/* Hero Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-10 relative"
        >
          {/* Main visual */}
          <div
            className="w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #0891b2 70%, #10b981 100%)",
              minHeight: 220,
            }}
          >
            {/* Decorative circles */}
            <div className="relative p-8 flex flex-col items-center justify-center min-h-[220px]">
              <div className="absolute top-4 right-4 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-blue-300/20" />

              {/* Stats row */}
              <div className="relative z-10 flex items-center gap-6">
                {[
                  { num: "14", label: "Days Clean", icon: <CheckCircle2 size={16} /> },
                  { num: "2.4k", label: "XP Earned", icon: <Zap size={16} /> },
                  { num: "Lv 5", label: "Recovery", icon: <Trophy size={16} /> },
                ].map((s, i) => (
                  <div key={i} className="text-center text-white">
                    <div className="flex items-center justify-center gap-1 opacity-70 mb-1">{s.icon}<span className="text-xs uppercase tracking-wide">{s.label}</span></div>
                    <div className="text-2xl font-black">{s.num}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="relative z-10 mt-6 w-full max-w-[260px]">
                <div className="flex justify-between text-white/70 text-xs mb-1.5">
                  <span>Level 5</span><span>2,400 / 5,000 XP</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "48%" }}
                    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute -bottom-4 -left-2 bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100"
          >
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Today's streak</p>
              <p className="text-sm font-black text-slate-800">14 Days Clean 🔥</p>
            </div>
          </motion.div>

          {/* Floating badge right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.85 }}
            className="absolute -bottom-4 -right-2 bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100"
          >
            <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Achievement</p>
              <p className="text-sm font-black text-slate-800">2 Week Warrior</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="px-5 pt-14 pb-6 max-w-xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: "10k+", label: "Recoveries", icon: <Heart size={18} className="text-rose-500" /> },
            { num: "94%",  label: "Success Rate", icon: <Star size={18} className="text-amber-500" /> },
            { num: "50k+", label: "Days Sober", icon: <Shield size={18} className="text-blue-500" /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-xl font-black text-slate-900">{s.num}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-5 py-12 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">How It Works</h2>
          <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              icon: <HelpCircle size={26} />,
              title: "1. Assess Yourself",
              desc: "Identify your current stage and triggers with our interactive assessment.",
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: <Zap size={26} />,
              title: "2. Build Strength",
              desc: "Complete daily quests, CBT exercises, and earn XP to level up your resilience.",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              icon: <Shield size={26} />,
              title: "3. Stay Free",
              desc: "Connect with an anonymous community and unlock recovery milestones.",
              color: "text-purple-600 bg-purple-50",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 bg-white rounded-3xl shadow-sm border border-slate-100"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-base font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        <div className="bg-blue-600 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-4 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="white" className="text-white" />)}
            </div>
            <p className="text-sm leading-relaxed mb-4 text-blue-100">
              "This app changed my life. The gamification made recovery feel achievable day by day. 
              47 days clean and counting!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">A</div>
              <div>
                <p className="text-xs font-bold">Anonymous User</p>
                <p className="text-xs text-blue-200">47 days sober 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 pb-16 max-w-xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Ready to start?</h2>
          <p className="text-slate-500 text-sm mb-6">It's free, anonymous and takes 2 minutes.</p>
          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-base hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
          >
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <Users size={12} />
            <span>Join 10,000+ people on their recovery journey</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-5 py-8 border-t border-slate-100 text-center max-w-xl mx-auto">
        <p className="text-xs text-slate-400">© 2026 Control Recovery. Built with ❤️ for Hackathon.</p>
        <a
          href="tel:+911800-11-0031"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-500 bg-rose-50 px-4 py-2 rounded-full border border-rose-100"
        >
          🚨 Emergency Helpline — iCall: 9152987821
        </a>
      </footer>

    </div>
  );
}