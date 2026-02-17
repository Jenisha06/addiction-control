"use client";

import { useApp } from "@/context/AppContext";
import {
  DollarSign,
  Zap,
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Stethoscope,
  Smile,
} from "lucide-react";

import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
} from "recharts";

const moodData = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 4 },
  { day: "Wed", value: 2 },
  { day: "Thu", value: 5 },
  { day: "Fri", value: 4 },
  { day: "Sat", value: 6 },
  { day: "Sun", value: 7 },
];

const recoveryMilestones = [
  { time: "20 mins", impact: "Heart rate and blood pressure drop.", completed: true },
  { time: "12 hours", impact: "Carbon monoxide level drops to normal.", completed: true },
  { time: "48 hours", impact: "Taste and smell improve.", completed: true },
  { time: "72 hours", impact: "Breathing becomes easier.", completed: false },
  { time: "1 month", impact: "Liver begins repairing.", completed: false },
  { time: "1 year", impact: "Heart disease risk halves.", completed: false },
];

export default function Insights() {
  const { userData } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 pb-32">
      <header>
        <h1 className="text-3xl font-black text-slate-900">
          Your <span className="text-blue-600">Insights</span>
        </h1>
        <p className="text-slate-500">Tracking your progress</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<DollarSign className="text-emerald-600" size={24} />}
          label="Money Saved"
          value={`$${userData.moneySaved || 0}`}
          color="bg-emerald-50"
          trend="+ $20 today"
        />
        <StatCard
          icon={<Zap className="text-orange-600" size={24} />}
          label="Calories Avoided"
          value={userData.caloriesAvoided || 0}
          color="bg-orange-50"
          trend="+ 500 today"
        />
      </div>

      {/* Recovery Timeline */}
      <section className="bg-white p-8 rounded-3xl shadow border space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Stethoscope className="text-blue-600" />
          Health Recovery
        </h2>

        {recoveryMilestones.map((m, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                m.completed ? "bg-blue-600 text-white" : "bg-slate-200"
              }`}
            >
              {m.completed && <CheckCircle2 size={14} />}
            </div>

            <div>
              <p className="font-bold text-sm">{m.time}</p>
              <p className="text-sm text-slate-600">{m.impact}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Mood Chart */}
      <section className="bg-white p-8 rounded-3xl shadow space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          Mood Stability <Smile size={20} />
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fill="#93C5FD"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Performance */}
      <section className="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Zap className="text-yellow-400" fill="currentColor" />
          Performance
        </h2>
        <p>You've completed 92% of your habits this month.</p>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div className={`${color} p-6 rounded-3xl shadow space-y-3`}>
      <div className="bg-white p-2 rounded-xl w-fit">{icon}</div>
      <div>
        <p className="text-xs uppercase font-bold text-slate-500">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
        <TrendingUp size={12} />
        {trend}
      </div>
    </div>
  );
}
