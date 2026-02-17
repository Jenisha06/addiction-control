"use client";

import { motion } from "framer-motion";
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

/* Temporary user data (replace with database later) */
const userData = {
  xp: 2400,
};

const levels = [
  {
    id: 1,
    name: "Awareness Island",
    description: "Understand your starting point",
    color: "bg-blue-400",
    icon: <Waves size={32} />,
    requiredXP: 0,
  },
  {
    id: 2,
    name: "Detox Valley",
    description: "The first 7 days of strength",
    color: "bg-emerald-400",
    icon: <Wind size={32} />,
    requiredXP: 1000,
  },
  {
    id: 3,
    name: "Trigger Control",
    description: "Mastering your environment",
    color: "bg-orange-400",
    icon: <Mountain size={32} />,
    requiredXP: 3000,
  },
  {
    id: 4,
    name: "Social Strength",
    description: "New boundaries, new connections",
    color: "bg-purple-400",
    icon: <Home size={32} />,
    requiredXP: 6000,
  },
  {
    id: 5,
    name: "Freedom Peak",
    description: "Living a life uncontrolled",
    color: "bg-yellow-400",
    icon: <Trophy size={32} />,
    requiredXP: 10000,
  },
];

export default function RecoveryMapPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Recovery <span className="text-blue-600">Map</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Your adventure to freedom
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-sm border flex items-center gap-2">
          <Star
            className="text-yellow-400"
            size={20}
            fill="currentColor"
          />
          <span className="font-black text-slate-800">
            {userData.xp} XP
          </span>
        </div>
      </header>

      {/* MAP */}
      <div className="relative max-w-sm mx-auto space-y-24 py-12">
        {/* Progress Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-200 -translate-x-1/2 rounded-full overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: `${Math.min(
                100,
                (userData.xp / 10000) * 100
              )}%`,
            }}
            className="w-full bg-blue-500"
          />
        </div>

        {levels.map((level, index) => {
          const isUnlocked =
            userData.xp >= level.requiredXP;

          const isCompleted =
            userData.xp >=
            (levels[index + 1]?.requiredXP ||
              Infinity);

          return (
            <motion.div
              key={level.id}
              initial={{
                opacity: 0,
                x: index % 2 === 0 ? -20 : 20,
              }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative flex items-center gap-6 ${
                index % 2 === 0
                  ? "flex-row"
                  : "flex-row-reverse"
              }`}
            >
              {/* NODE */}
              <div className="relative">
                <motion.div
                  whileHover={
                    isUnlocked
                      ? { scale: 1.1 }
                      : {}
                  }
                  className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-xl relative z-10
                    ${
                      isUnlocked
                        ? level.color
                        : "bg-slate-300"
                    }
                    ${
                      isUnlocked
                        ? "text-white"
                        : "text-slate-500"
                    }
                  `}
                >
                  {isUnlocked ? (
                    level.icon
                  ) : (
                    <Lock size={32} />
                  )}
                </motion.div>

                {isCompleted && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg z-20">
                    <CheckCircle2 size={16} />
                  </div>
                )}

                {isUnlocked && !isCompleted && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md z-20">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* INFO */}
              <div
                className={`flex-1 ${
                  index % 2 === 0
                    ? "text-left"
                    : "text-right"
                }`}
              >
                <h3
                  className={`font-black text-xl mb-1 ${
                    isUnlocked
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {level.name}
                </h3>

                <p className="text-sm text-slate-500 leading-tight mb-3">
                  {isUnlocked
                    ? level.description
                    : `Unlock at ${level.requiredXP} XP`}
                </p>

                {isUnlocked && (
                  <button
                    className={`inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors
                      ${
                        isCompleted
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }
                    `}
                  >
                    {isCompleted
                      ? "REVISIT"
                      : "START CHALLENGE"}
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
          <h2 className="text-2xl font-black">
            Daily Challenge
          </h2>
          <p className="opacity-80 font-medium mb-6">
            Write down 3 things you're grateful for today
            to earn 50 XP.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all">
            Accept Quest
          </button>
        </div>
      </div>
    </div>
  );
}
