"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wind,
  Phone,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function EmergencyOverlay({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("options");
  const [bubbles, setBubbles] = useState([]);
  const [popCount, setPopCount] = useState(0);
  const [phase, setPhase] = useState("inhale");

  // Breathing cycle
  useEffect(() => {
    if (activeTab !== "breathing") return;
    const interval = setInterval(() => {
      setPhase((p) =>
        p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale"
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Add bubbles
  useEffect(() => {
    if (activeTab !== "game") return;
    const interval = setInterval(() => {
      const newBubble = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      };
      setBubbles((prev) => [...prev, newBubble]);
    }, 800);
    return () => clearInterval(interval);
  }, [activeTab]);

  const popBubble = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setPopCount((c) => c + 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0F172A] z-[100] flex flex-col items-center justify-center p-6 text-white overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={() => {
            setActiveTab("options");
            onClose();
          }}
          className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-4 rounded-2xl"
        >
          <X size={24} />
        </button>

        {activeTab === "options" && (
          <div className="w-full max-w-md space-y-8 text-center">
            <h1 className="text-3xl font-bold">
              This craving is <span className="text-blue-400">temporary</span>
            </h1>

            <div className="space-y-4">
              <EmergencyOption
                icon={<Wind size={20} />}
                title="60s Breathing"
                onClick={() => setActiveTab("breathing")}
              />
              <EmergencyOption
                icon={<Sparkles size={20} />}
                title="Quick Focus Game"
                onClick={() => setActiveTab("game")}
              />
              <EmergencyOption
                icon={<MessageSquare size={20} />}
                title="Talk to Support AI"
                onClick={() => setActiveTab("support")}
              />

              <a
                href="tel:988"
                className="block bg-rose-500 py-4 rounded-2xl font-bold"
              >
                <Phone className="inline mr-2" size={18} />
                Call 988
              </a>
            </div>
          </div>
        )}

        {activeTab === "breathing" && (
          <div className="text-center space-y-10">
            <h2 className="text-3xl font-bold uppercase">
              {phase === "inhale"
                ? "Breathe In"
                : phase === "hold"
                ? "Hold"
                : "Breathe Out"}
            </h2>

            <motion.div
              animate={{
                scale:
                  phase === "inhale"
                    ? 1.4
                    : phase === "hold"
                    ? 1.4
                    : 1,
              }}
              transition={{ duration: 4 }}
              className="w-48 h-48 border-2 border-white/20 rounded-full mx-auto flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            </motion.div>

            <button
              onClick={() => setActiveTab("options")}
              className="text-sm opacity-70"
            >
              Back
            </button>
          </div>
        )}

        {activeTab === "game" && (
          <div className="w-full h-full flex flex-col">
            <div className="text-center pt-10">
              <h2 className="text-xl font-bold">
                Score: {popCount}
              </h2>
            </div>

            <div className="flex-1 relative">
              <AnimatePresence>
                {bubbles.map((b) => (
                  <motion.button
                    key={b.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    onClick={() => popBubble(b.id)}
                    className="absolute w-14 h-14 bg-blue-400/30 border-2 border-blue-400 rounded-full"
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="text-center pb-8">
              <button
                onClick={() => setActiveTab("options")}
                className="bg-white/10 px-6 py-2 rounded-xl"
              >
                Quit
              </button>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-6 rounded-2xl">
              <ShieldCheck size={28} />
              <div>
                <h3 className="font-bold">Control AI Support</h3>
                <p className="text-sm opacity-70">
                  Always here to listen.
                </p>
              </div>
            </div>

            <SupportMessage text="I'm feeling a strong urge." isUser />
            <SupportMessage
              text="I hear you. This urge will pass. Take a breath with me."
            />

            <button
              onClick={() => setActiveTab("options")}
              className="text-sm opacity-70"
            >
              Back
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function EmergencyOption({ icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition"
    >
      {icon}
      <span className="font-medium">{title}</span>
      <ChevronRight className="ml-auto opacity-50" size={18} />
    </button>
  );
}

function SupportMessage({ text, isUser }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] p-3 rounded-2xl text-sm ${
          isUser ? "bg-blue-600" : "bg-white/10"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
