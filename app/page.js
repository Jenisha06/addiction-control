"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  HelpCircle,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

 const handleStart = () => {
  router.push("/auth");
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 text-slate-800">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Shield size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-blue-900">
            Control.
          </span>
        </div>

        <button
          onClick={handleStart}
          className="bg-white/80 backdrop-blur-sm border border-slate-200 px-5 py-2 rounded-full font-medium hover:bg-white transition-all shadow-sm"
        >
          Login
        </button>
      </header>

      {/* Hero */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-blue-950 leading-tight mb-6"
          >
            Take Back <span className="text-blue-600">Control.</span>
            <br />
            One Day at a Time.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed"
          >
            A gamified recovery journey for alcohol addiction. Transform your
            path to sobriety into an adventure of growth and self-discovery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button
              onClick={handleStart}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              Start My Recovery
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-400 transition-all shadow-sm">
              Learn How It Works
            </button>
          </motion.div>
        </div>

        {/* Image */}
        <div className="flex-1 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-white"
          >
            <Image
              src="https://images.unsplash.com/photo-1766832858735-b3740223153e?auto=format&fit=crop&w=1080&q=80"
              alt="Peaceful nature"
              width={600}
              height={600}
              className="w-full aspect-square object-cover"
            />
          </motion.div>

          {/* Floating Badge */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                Today
              </p>
              <p className="text-sm font-bold">14 Days Clean</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/50 backdrop-blur-lg py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: <HelpCircle size={32} />,
              title: "Assess Yourself",
              desc: "Identify your current stage and triggers with our interactive assessment.",
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: <Zap size={32} />,
              title: "Build Strength",
              desc: "Complete daily quests, CBT exercises, and earn XP to level up your resilience.",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              icon: <Shield size={32} />,
              title: "Stay Free",
              desc: "Connect with an anonymous community and unlock recovery milestones.",
              color: "text-purple-600 bg-purple-50",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-400 border-t border-slate-200 text-sm">
        © 2026 Control Recovery. Built for Hackathon.
        <br />
        <span className="text-xs mt-2 block italic text-rose-400">
          🚨 In case of emergency, please dial your local helpline.
        </span>
      </footer>
    </div>
  );
}
