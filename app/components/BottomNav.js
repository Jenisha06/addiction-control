"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, User, Map, MessageSquare, Brain , Bot } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",      icon: Home,          path: "/dashboard" },
  { label: "Map",       icon: Map,           path: "/map" },
  { label: "CBT",       icon: Brain,         path: "/cbt" },
  { label: "Community", icon: MessageSquare, path: "/community" },
  {
    label:"ChatBot", icon:Bot,path:"/chatbot"
  },
  { label: "Profile",   icon: User,          path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 px-4 pb-5 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center justify-around px-2 py-2 rounded-[28px] border border-white/60"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="flex flex-col items-center justify-center relative px-3 py-1.5 min-w-[52px]"
            >
              {/* Active pill background */}
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl bg-slate-900"
                  transition={{ type: "spring", damping: 26, stiffness: 380 }}
                />
              )}

              <span className="relative z-10">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </span>

              <span
                className={`relative z-10 text-[10px] font-bold mt-0.5 transition-colors duration-200 ${
                  active ? "text-white" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}