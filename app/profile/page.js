"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  Shield,
  Trophy,
  Award,
  Zap,
  Flame,
  Heart,
  LogOut,
  Edit3,
  Plus,
  CheckCircle2,
  Target,
  Phone,
  ArrowRight,
  Wind,
  Gamepad,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext"; // adjust if needed

const habitOptions = [
  { id: "exercise", icon: <Flame size={18} />, label: "Exercise", color: "text-rose-600 bg-rose-50" },
  { id: "meditation", icon: <Wind size={18} />, label: "Meditation", color: "text-blue-600 bg-blue-50" },
  { id: "reading", icon: <Target size={18} />, label: "Reading", color: "text-emerald-600 bg-emerald-50" },
  { id: "gaming", icon: <Gamepad size={18} />, label: "Gaming", color: "text-purple-600 bg-purple-50" },
];

const achievements = [
  { id: 1, name: "1 Day Strong", icon: <Award className="text-blue-500" />, completed: true, date: "Feb 15, 2026" },
  { id: 2, name: "7 Days Clean", icon: <Trophy className="text-emerald-500" />, completed: true, date: "Feb 22, 2026" },
  { id: 3, name: "Trigger Master", icon: <Target className="text-rose-500" />, completed: false, description: "Log 5 triggers" },
  { id: 4, name: "Stress Survivor", icon: <Shield className="text-purple-500" />, completed: false, description: "Complete 3 CBT sessions" },
  { id: 5, name: "Community Leader", icon: <Heart className="text-amber-500" />, completed: false, description: "Help 3 people" },
];

export default function ProfilePage() {
  const { userData } = useApp();
  const [activeTab, setActiveTab] = useState("profile");

  const updateHabit = (habitId) => {
    toast.success("Habit preference updated!", {
      icon: <CheckCircle2 className="text-emerald-500" />,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 pb-32 max-w-lg mx-auto overflow-hidden">

      {/* HEADER */}
      <header className="flex justify-between items-start pt-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-xl">
              <User size={40} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Anonymous User</h1>
            <p className="text-slate-400 text-xs uppercase">
              Level {userData.level}
            </p>
          </div>
        </div>
        <Settings size={22} className="text-slate-400" />
      </header>

      {/* TABS */}
      <div className="flex bg-white p-1.5 rounded-3xl border">
        {["profile", "habits", "achievements"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl border">
              <h2 className="font-bold mb-4">Your Progress</h2>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(userData.xp % 1000) / 10}%` }}
                  className="h-full bg-blue-600"
                />
              </div>

              <p className="text-xs mt-2 text-slate-500">
                {userData.xp} XP
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "habits" && (
          <motion.div
            key="habits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {habitOptions.map((h) => (
              <button
                key={h.id}
                onClick={() => updateHabit(h.id)}
                className="flex justify-between items-center p-5 bg-white rounded-2xl border"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.color}`}>
                    {h.icon}
                  </div>
                  <span>{h.label}</span>
                </div>
                <Plus size={16} />
              </button>
            ))}
          </motion.div>
        )}

        {activeTab === "achievements" && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-white p-6 rounded-2xl border flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">{ach.name}</h3>
                  <p className="text-xs text-slate-500">
                    {ach.completed ? ach.date : ach.description}
                  </p>
                </div>

                {ach.completed ? (
                  <CheckCircle2 className="text-blue-600" />
                ) : (
                  <ArrowRight className="text-slate-300" />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGOUT */}
      <button className="w-full text-rose-500 font-bold text-xs py-8">
        <LogOut size={18} className="inline mr-2" />
        Log Out
      </button>
    </div>
  );
}
