"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Heart,
  Plus,
  Shield,
  Sparkles,
  Search,
  Smile,
} from "lucide-react";

const mockPosts = [
  {
    id: 1,
    user: "SoberSamurai",
    avatar: "bg-blue-100 text-blue-600",
    time: "2h ago",
    tag: "Wins",
    content:
      "Just hit my 30-day milestone! I never thought I could make it past the first week, but the CBT exercises really helped during the evening cravings.",
    likes: 42,
    replies: 12,
    badges: ["30 Days", "Helper"],
  },
  {
    id: 2,
    user: "RisingPhoenix",
    avatar: "bg-emerald-100 text-emerald-600",
    time: "4h ago",
    tag: "Struggles",
    content:
      "Had a really tough time at a wedding last night. Everyone was drinking, but I stayed strong with soda and lime. Feeling proud but exhausted.",
    likes: 128,
    replies: 24,
    badges: ["7 Days"],
  },
  {
    id: 3,
    user: "MindfulMover",
    avatar: "bg-purple-100 text-purple-600",
    time: "6h ago",
    tag: "Advice",
    content:
      "If you're feeling an urge, try the 5-Minute Delay method. Set a timer and do one task. Usually, the wave passes by the time the alarm goes off!",
    likes: 85,
    replies: 15,
    badges: ["90 Days", "Pro"],
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Wins", "Struggles", "Advice", "Buddy"];

  const filteredPosts = mockPosts.filter(
    (p) => activeTab === "All" || p.tag === activeTab
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto overflow-hidden">
      {/* Header */}
      <header className="p-6 bg-white border-b border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900">
            Safe <span className="text-purple-600">Space</span>
          </h1>

          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              1,240 Online
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search stories & advice..."
            className="w-full bg-slate-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            {/* User */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${post.avatar}`}
                >
                  {post.user[0]}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {post.user}
                    {post.user === "MindfulMover" && (
                      <Shield
                        size={14}
                        className="text-blue-500"
                        fill="currentColor"
                      />
                    )}
                  </h3>

                  <div className="flex gap-1">
                    {post.badges.map((b) => (
                      <span
                        key={b}
                        className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {post.time}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  post.tag === "Wins"
                    ? "bg-emerald-50 text-emerald-600"
                    : post.tag === "Struggles"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {post.tag}
              </span>

              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                "{post.content}"
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-50 flex items-center gap-6">
              <Action icon={<Heart size={18} />} value={post.likes} />
              <Action icon={<MessageSquare size={18} />} value={post.replies} />
              <Action icon={<Smile size={18} />} label="Support" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Button */}
      <div className="fixed bottom-28 right-6 max-w-lg mx-auto w-full px-6 flex justify-end pointer-events-none">
        <button className="w-16 h-16 bg-purple-600 text-white rounded-[24px] shadow-2xl shadow-purple-200 flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all pointer-events-auto">
          <Plus size={32} />
        </button>
      </div>

      {/* Buddy Section */}
      <div className="p-6 bg-slate-900 mx-4 mb-4 rounded-[32px] text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={80} />
        </div>

        <div className="relative z-10">
          <h3 className="font-black text-lg">Accountability Buddy</h3>
          <p className="text-xs text-white/60 font-medium">
            Match with someone at your level.
          </p>
        </div>

        <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest relative z-10">
          Join Beta
        </button>
      </div>
    </div>
  );
}

function Action({ icon, value, label }) {
  return (
    <button className="flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors group">
      <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-purple-50 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-black">
        {value ?? label}
      </span>
    </button>
  );
}
