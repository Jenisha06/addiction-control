"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Flame,
  Clock,
  Plus,
  ArrowUpRight,
  Trophy,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  Map,
  Brain,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { name: "Mon", mood: 2, cravings: 4 },
  { name: "Tue", mood: 3, cravings: 3 },
  { name: "Wed", mood: 2, cravings: 5 },
  { name: "Thu", mood: 4, cravings: 2 },
  { name: "Fri", mood: 5, cravings: 1 },
  { name: "Sat", mood: 4, cravings: 2 },
  { name: "Sun", mood: 5, cravings: 1 },
];

export default function DashboardPage() {
  const router = useRouter();

  // Temporary mock user data (later we connect database)
  const userData = {
    level: 3,
    xp: 2400,
    streak: 14,
    shieldCount: 2,
    moneySaved: 320,
    caloriesAvoided: 1800,
    sobrietyDate: "2026-02-01",
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(userData.sobrietyDate).getTime();
      const diff = Math.max(0, now - start);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const levelProgress = useMemo(() => {
    const nextLevelXP = userData.level * 1000;
    const currentLevelXP = (userData.level - 1) * 1000;
    const progress =
      ((userData.xp - currentLevelXP) /
        (nextLevelXP - currentLevelXP)) *
      100;
    return Math.min(100, Math.max(0, progress));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-lg mx-auto space-y-8"
    >
      {/* HEADER */}
      <header className="flex justify-between items-start pt-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="text-xl font-black">
                {userData.level}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full text-white">
              <Trophy size={14} />
            </div>
          </div>

          <div>
            <h1 className="font-bold text-slate-800">
              Ready for today?
            </h1>

            <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="h-full bg-blue-600"
              />
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {userData.xp} / {userData.level * 1000} XP
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-1 px-3 py-1 bg-rose-50 rounded-full text-rose-600">
            <Flame size={16} />
            <span className="font-black text-sm">
              {userData.streak}d
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full text-blue-600">
            <Shield size={16} />
            <span className="font-black text-sm">
              {userData.shieldCount}
            </span>
          </div>
        </div>
      </header>

      {/* SOBRIETY TIMER */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border text-center space-y-4">
        <p className="text-xs uppercase text-slate-400">
          Alcohol Free For
        </p>

        <div className="flex justify-center gap-6">
          <TimerUnit value={timeLeft.days} label="Days" />
          <TimerUnit value={timeLeft.hours} label="Hours" />
          <TimerUnit value={timeLeft.mins} label="Mins" />
        </div>

        <button
          onClick={() => router.push("/checkin")}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
        >
          <Plus size={18} className="inline mr-2" />
          Daily Check-In
        </button>
      </section>

      {/* ACTION GRID */}
      <section className="grid grid-cols-2 gap-4">
        <DashboardCard
          title="Recovery Map"
          icon={<Map size={24} />}
          onClick={() => router.push("/map")}
        />

        <DashboardCard
          title="CBT Exercises"
          icon={<Brain size={24} />}
          onClick={() => router.push("/cbt")}
        />

        <DashboardCard
          title="Community"
          icon={<MessageSquare size={24} />}
          onClick={() => router.push("/community")}
        />

        <DashboardCard
          title="Craving Help"
          icon={<AlertCircle size={24} />}
          onClick={() => router.push("/emergency")}
        />
      </section>

      {/* INSIGHTS */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Your Insights</h2>
          <button
            onClick={() => router.push("/insights")}
            className="text-blue-600 text-sm font-bold"
          >
            View All <ArrowUpRight size={14} className="inline" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatMiniCard
            label="Saved"
            value={`$${userData.moneySaved}`}
            icon={<DollarSign size={18} />}
          />
          <StatMiniCard
            label="Calories"
            value={userData.caloriesAvoided}
            icon={<Zap size={18} />}
          />
          <StatMiniCard
            label="Health"
            value="84%"
            icon={<Activity size={18} />}
          />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#3B82F6"
                fill="#BFDBFE"
              />
              <Area
                type="monotone"
                dataKey="cravings"
                stroke="#EF4444"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
}

/* SMALL COMPONENTS */

function TimerUnit({ value, label }) {
  return (
    <div>
      <div className="text-3xl font-black text-blue-600">
        {value}
      </div>
      <div className="text-xs text-slate-400 uppercase">
        {label}
      </div>
    </div>
  );
}

function DashboardCard({ title, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-50 p-6 rounded-3xl text-left hover:scale-105 transition"
    >
      <div className="mb-3 text-blue-600">{icon}</div>
      <h3 className="font-bold">{title}</h3>
    </button>
  );
}

function StatMiniCard({ label, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-2xl text-center shadow-sm border">
      <div className="mb-2 text-blue-600">{icon}</div>
      <div className="font-bold">{value}</div>
      <div className="text-xs text-slate-400 uppercase">
        {label}
      </div>
    </div>
  );
}
