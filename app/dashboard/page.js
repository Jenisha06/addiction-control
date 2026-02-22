"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Flame,
  Plus,
  Trophy,
  Shield,
  Activity,
  DollarSign,
  Map,
  Brain,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../../src/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  // 🔐 Load User + Checkins
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // 🔹 Load profile
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        // 🔹 Load checkins
        const q = query(
          collection(db, "users", user.uid, "checkins"),
          orderBy("date", "asc")
        );

        const snapshot = await getDocs(q);

        const formatted = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCheckins(formatted);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // ⏳ Sobriety timer
  useEffect(() => {
    if (!userData?.sobrietyDate) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(userData.sobrietyDate).getTime();
      const diff = Math.max(0, now - start);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userData]);

  // 📈 Level progress
  const levelProgress = useMemo(() => {
    if (!userData?.level || !userData?.xp) return 0;

    const nextLevelXP = userData.level * 1000;
    const currentLevelXP = (userData.level - 1) * 1000;

    return Math.min(
      100,
      Math.max(
        0,
        ((userData.xp - currentLevelXP) /
          (nextLevelXP - currentLevelXP)) *
          100
      )
    );
  }, [userData]);

  // 🔥 Real consecutive streak calculation
  const streak = useMemo(() => {
    if (!checkins.length) return 0;

    const sorted = [...checkins].sort(
      (a, b) => b.date.toDate() - a.date.toDate()
    );

    let count = 0;
    let current = new Date();

    for (let checkin of sorted) {
      const checkDate = checkin.date.toDate();
      const diff =
        Math.floor(
          (current - checkDate) / (1000 * 60 * 60 * 24)
        );

      if (diff === 0 || diff === 1) {
        count++;
        current = checkDate;
      } else {
        break;
      }
    }

    return count;
  }, [checkins]);

  // 💰 Auto money saved
  const moneySaved = useMemo(() => {
    if (!userData?.sobrietyDate || !userData?.drinkCostPerDay)
      return 0;

    const days =
      (Date.now() - new Date(userData.sobrietyDate)) /
      (1000 * 60 * 60 * 24);

    return Math.floor(days) * userData.drinkCostPerDay;
  }, [userData]);

  // 📊 Chart data from checkins
  const chartData = useMemo(() => {
    return checkins.map((c) => ({
      name: c.date.toDate().toLocaleDateString("en-US", {
        weekday: "short",
      }),
      mood: c.mood,
      cravings: c.cravings,
    }));
  }, [checkins]);

  if (loading)
    return <div className="p-10 text-center font-bold">Loading...</div>;

  if (!userData)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        No user data found.
      </div>
    );

    

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
                {userData.level ?? 1}
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

            <p className="text-xs text-slate-400 font-bold uppercase">
              {userData.xp ?? 0} / {(userData.level ?? 1) * 1000} XP
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <StatBubble icon={<Flame size={16} />} value={`${streak}d`} />
          <StatBubble icon={<Shield size={16} />} value={userData.shieldCount ?? 0} />
        </div>
      </header>

      {/* TIMER */}
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
        <DashboardCard title="Recovery Map" icon={<Map size={24} />} onClick={() => router.push("/map")} />
        <DashboardCard title="CBT Exercises" icon={<Brain size={24} />} onClick={() => router.push("/cbt")} />
        <DashboardCard title="Community" icon={<MessageSquare size={24} />} onClick={() => router.push("/community")} />
        <DashboardCard title="Craving Help" icon={<AlertCircle size={24} />} onClick={() => router.push("/emergency")} />
      </section>

      {/* INSIGHTS */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Your Insights</h2>
          <button onClick={() => router.push("/insights")} className="text-blue-600 text-sm font-bold">
            View All <ArrowUpRight size={14} className="inline" />
          </button>
        </div>

     <div className="grid grid-cols-3 gap-4 mb-6">
  <StatMiniCard label="Saved" value={`$${moneySaved}`} icon={<DollarSign size={18} />} />
  <StatMiniCard label="Calories" value={userData.caloriesAvoided ?? 0} icon={<Zap size={18} />} />
  <StatMiniCard label="Health" value="84%" icon={<Activity size={18} />} />
</div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="mood" stroke="#3B82F6" fill="#BFDBFE" />
              <Area type="monotone" dataKey="cravings" stroke="#EF4444" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
}

/* COMPONENTS */

function TimerUnit({ value, label }) {
  return (
    <div>
      <div className="text-3xl font-black text-blue-600">{value}</div>
      <div className="text-xs text-slate-400 uppercase">{label}</div>
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
      <div className="text-xs text-slate-400 uppercase">{label}</div>
    </div>
  );
}

function StatBubble({ icon, value }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full text-blue-600">
      {icon}
      <span className="font-black text-sm">{value}</span>
    </div>
  );
}