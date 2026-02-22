"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../src/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { checkLevelUnlock } from "../utils/progression";
import {
  Lock,
  Star,
  Mountain,
  Wind,
  Waves,
  Home,
  Zap,
  Trophy,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";

const levels = [
  {
    id: 1,
    name: "Awareness Island",
    description: "Understand your starting point",
    color: "bg-blue-400",
    icon: <Waves size={32} />,
    requirements: { minDaysSober: 0, minStreak: 0, minXP: 0, requiredModules: [] },
    xpReward: 200,
    moduleId: "awareness-island",
  },
  {
    id: 2,
    name: "Detox Valley",
    description: "The first 7 days of strength",
    color: "bg-emerald-400",
    icon: <Wind size={32} />,
    requirements: { minDaysSober: 3, minStreak: 2, minXP: 1000, requiredModules: ["intro-reflection"] },
    xpReward: 500,
    moduleId: "detox-valley",
  },
  {
    id: 3,
    name: "Trigger Control",
    description: "Mastering your environment",
    color: "bg-orange-400",
    icon: <Mountain size={32} />,
    requirements: { minDaysSober: 7, minStreak: 5, minXP: 2500, requiredModules: ["identify-triggers", "urge-surfing"] },
    xpReward: 800,
    moduleId: "trigger-control",
  },
  {
    id: 4,
    name: "Social Strength",
    description: "New boundaries, new connections",
    color: "bg-purple-400",
    icon: <Home size={32} />,
    requirements: { minDaysSober: 21, minStreak: 7, minXP: 5000, requiredModules: ["boundary-script", "social-planning"] },
    xpReward: 1200,
    moduleId: "social-strength",
  },
  {
    id: 5,
    name: "Freedom Peak",
    description: "Living a life uncontrolled",
    color: "bg-yellow-400",
    icon: <Trophy size={32} />,
    requirements: { minDaysSober: 60, minStreak: 14, minXP: 8000, requiredModules: [] },
    xpReward: 2000,
    moduleId: "freedom-peak",
  },
];

export default function RecoveryMapPage() {
  const [userData, setUserData] = useState(null);
  const [dailyInput, setDailyInput] = useState("");
  const [dailySubmitted, setDailySubmitted] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();
  }, []);

  // Track daily quest submission
  useEffect(() => {
    if (!userData) return;
    const today = new Date().toISOString().slice(0, 10);
    setDailySubmitted(userData.dailyQuestDate === today);
  }, [userData]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // Update XP in Firebase & local state
  const updateXP = async (amount) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, { xp: (userData.xp || 0) + amount });

    setUserData(prev => ({ ...prev, xp: (prev.xp || 0) + amount }));
  };

  // Complete a module
const completeModule = async (moduleId) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  // Safely derive the current modules
  const currentModules = userData?.completedModules || [];

  // Add the new module without duplicates
  const updatedModules = [...new Set([...currentModules, moduleId])];

  // Update Firestore
  await updateDoc(userRef, { completedModules: updatedModules });

  // Update local state
  setUserData((prev) => ({
    ...prev,
    completedModules: updatedModules,
  }));
};


  // Update streak
  const updateStreak = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const today = new Date().toISOString().slice(0, 10);

    const newStreak = userData.lastActive !== today ? (userData.currentStreak || 0) + 1 : userData.currentStreak;

    await updateDoc(userRef, { currentStreak: newStreak, lastActive: today });

    setUserData(prev => ({ ...prev, currentStreak: newStreak, lastActive: today }));
  };

  // Handle daily quest submission
  const submitDailyQuest = async () => {
    if (!dailyInput.trim()) return;

    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const today = new Date().toISOString().slice(0, 10);

    await updateDoc(userRef, {
      xp: (userData.xp || 0) + 50,
      completedModules: [...(userData.completedModules || []), "daily-gratitude"],
      currentStreak: userData.lastActive !== today ? (userData.currentStreak || 0) + 1 : userData.currentStreak,
      lastActive: today,
      dailyQuestDate: today,
      dailyGratitude: dailyInput
    });

    setUserData(prev => ({
      ...prev,
      xp: (prev.xp || 0) + 50,
      completedModules: [...(prev.completedModules || []), "daily-gratitude"],
      currentStreak: prev.lastActive !== today ? (prev.currentStreak || 0) + 1 : prev.currentStreak,
      lastActive: today,
      dailyQuestDate: today,
      dailyGratitude: dailyInput
    }));

    setDailySubmitted(true);
    toast.success("Daily quest submitted! +50 XP");
  };

  // Handle level challenge
  const handleStartChallenge = async (level) => {
    if (!userData.completedModules?.includes(level.moduleId)) {
      await completeModule(level.moduleId);
      await updateXP(level.xpReward);
      toast.success(`Level "${level.name}" completed! +${level.xpReward} XP`);
    } else {
      toast("Level already completed! 🎉");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      <Toaster position="top-center" />

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Recovery <span className="text-blue-600">Map</span>
          </h1>
          <p className="text-slate-500 font-medium">Your adventure to freedom</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border flex items-center gap-2">
          <Star className="text-yellow-400" size={20} fill="currentColor" />
          <motion.span
            key={userData.xp}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="font-black text-slate-800"
          >
            {userData.xp} XP
          </motion.span>
        </div>
      </header>

      {/* MAP */}
      <div className="relative max-w-sm mx-auto space-y-24 py-12">
        {/* Progress Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-200 -translate-x-1/2 rounded-full overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(100, (userData.xp / 10000) * 100)}%` }}
            className="w-full bg-blue-500"
          />
        </div>

        {levels.map((level, index) => {
          const { unlocked, progress } = checkLevelUnlock(level, userData);
          const nextXP = levels[index + 1]?.requirements.minXP || Infinity;
          const isCompleted = userData.completedModules?.includes(level.moduleId);

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative flex items-center gap-6 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
            >
              {/* NODE */}
              <div className="relative">
                <motion.div
                  whileHover={unlocked ? { scale: 1.1 } : {}}
                  className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-xl relative z-10 ${
                    unlocked ? level.color : "bg-slate-300"
                  } ${unlocked ? "text-white" : "text-slate-500"}`}
                >
                  {unlocked ? level.icon : <Lock size={32} />}
                </motion.div>

                {isCompleted && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg z-20">
                    <CheckCircle2 size={16} />
                  </div>
                )}

                {unlocked && !isCompleted && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md z-20">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className={`flex-1 ${index % 2 === 0 ? "text-left" : "text-right"}`}>
                <h3 className={`font-black text-xl mb-1 ${unlocked ? "text-slate-900" : "text-slate-400"}`}>
                  {level.name}
                </h3>
                <div className="text-sm text-slate-500 leading-tight mb-3">
                  {unlocked ? (
                    level.description
                  ) : (
                    <div className="text-xs space-y-1">
                      <p>Days Sober: {Math.floor(progress.days * 100)}%</p>
                      <p>Streak: {Math.floor(progress.streak * 100)}%</p>
                      <p>XP: {Math.floor(progress.xp * 100)}%</p>
                      <p>Modules: {Math.floor(progress.modules * 100)}%</p>
                    </div>
                  )}
                </div>

                {unlocked && (
                  <button
                    className={`inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors ${
                      isCompleted ? "text-emerald-600" : "text-blue-600"
                    }`}
                    onClick={() => handleStartChallenge(level)}
                  >
                    {isCompleted ? "REVISIT" : "START CHALLENGE"}
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DAILY QUEST */}
      <div className="bg-blue-600 p-8 rounded-[40px] text-white space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Zap size={120} />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black">Daily Challenge</h2>
          {dailySubmitted ? (
            <p className="opacity-80 font-medium">You submitted today! 🎉</p>
          ) : (
            <>
              <p className="opacity-80 font-medium mb-4">
                Write down 3 things you're grateful for today to earn 50 XP.
              </p>
              <textarea
                className="w-full p-3 rounded-lg text-black font-medium"
                rows={3}
                placeholder="I am grateful for..."
                value={dailyInput}
                onChange={(e) => setDailyInput(e.target.value)}
              />
              <button
                className="mt-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all"
                onClick={submitDailyQuest}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}