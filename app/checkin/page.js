"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  Smile,
  Meh,
  Frown,
  Angry,
  Skull,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  Flame,
  TrendingUp,
  Star,
} from "lucide-react";


const initialUser = {
  streak: 14,
  xp: 2400,
  moneySaved: 320,
  shieldCount: 1,
};

const emotions = [
  { icon: <Smile className="text-emerald-500" size={40} />, label: "Great", value: 5 },
  { icon: <Meh className="text-blue-500" size={40} />, label: "Okay", value: 3 },
  { icon: <Frown className="text-orange-500" size={40} />, label: "Low", value: 2 },
  { icon: <Angry className="text-rose-500" size={40} />, label: "Tense", value: 1 },
  { icon: <Skull className="text-slate-500" size={40} />, label: "Bad", value: 0 },
];

export default function CheckInPage() {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [craving, setCraving] = useState(1);
  const [drank, setDrank] = useState(null);

const handleFinish = async (didDrink) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const userRef = doc(db, "users", user.uid);
    const logRef = doc(db, "users", user.uid, "logs", today);

    const existingLog = await getDoc(logRef);
    if (existingLog.exists()) {
      alert("You already checked in today.");
      return;
    }

    const userSnap = await getDoc(userRef);
    let userData = {};
    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    let newStreak = 0;
    let xpGain = 0;
    let moneyGain = 0;

    const lastCheckIn = userData.lastCheckIn;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (!didDrink) {
      if (lastCheckIn === yesterdayStr) {
        newStreak = (userData.streak || 0) + 1;
      } else {
        newStreak = 1;
      }

      xpGain = 100;
      moneyGain = 20;
    } else {
      newStreak = 0;
      xpGain = 10;
    }

    await setDoc(logRef, {
      mood,
      craving,
      drank: didDrink,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      userRef,
      {
        streak: newStreak,
        xp: (userData.xp || 0) + xpGain,
        moneySaved: (userData.moneySaved || 0) + moneyGain,
        lastCheckIn: today,
      },
      { merge: true }
    );

    setStep(!didDrink ? 3 : 4);

  } catch (error) {
    console.error("Check-in error:", error);
    alert(error.message);
  }
};

  const goDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-lg mx-auto overflow-hidden">
      {/* HEADER */}
      <header className="py-8 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">
          Daily <span className="text-blue-600">Check-In</span>
        </h1>

        <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-blue-600"
          />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* STEP 0 — Mood */}
          {step === 0 && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 text-center"
            >
              <h2 className="text-3xl font-black text-slate-800">
                How are you feeling today?
              </h2>

              <div className="grid grid-cols-5 gap-2">
                {emotions.map((e, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMood(e.value);
                      setStep(1);
                    }}
                    className="group space-y-3"
                  >
                    <div className="bg-white p-4 rounded-3xl shadow-sm border group-hover:scale-110 transition-all">
                      {e.icon}
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-600">
                      {e.label}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Craving */}
          {step === 1 && (
            <motion.div
              key="craving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 text-center"
            >
              <h2 className="text-3xl font-black text-slate-800">
                Cravings intensity?
              </h2>

              <input
                type="range"
                min="1"
                max="5"
                value={craving}
                onChange={(e) =>
                  setCraving(parseInt(e.target.value))
                }
                className="w-full h-3 bg-slate-200 rounded-full accent-blue-600"
              />

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-5 rounded-[32px] font-black text-lg mt-12"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Drank */}
          {step === 2 && (
            <motion.div
              key="drank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 text-center"
            >
              <h2 className="text-3xl font-black text-slate-800">
                Did you drink today?
              </h2>

              <div className="grid gap-4">
                <button
                 onClick={() => handleFinish(false)}
                  className="p-8 bg-emerald-100 rounded-[40px]"
                >
                  <CheckCircle2 size={32} />
                  <p className="text-3xl font-black text-emerald-700">
                    NO
                  </p>
                </button>

                <button
                onClick={() => handleFinish(true)}
                  className="p-8 bg-rose-100 rounded-[40px]"
                >
                  <XCircle size={32} />
                  <p className="text-3xl font-black text-rose-700">
                    YES
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Success */}
          {step === 3 && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-10"
            >
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[48px] flex items-center justify-center mx-auto">
                <Flame size={64} />
              </div>

              <h2 className="text-4xl font-black text-slate-900">
                +100 XP Earned!
              </h2>

              <button
                onClick={goDashboard}
                className="w-full bg-slate-900 text-white py-5 rounded-[32px] font-black text-lg"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}

          {/* STEP 4 — Reflection */}
          {step === 4 && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 text-center"
            >
              <h2 className="text-3xl font-black text-slate-800">
                It's okay. Reflect and move forward.
              </h2>

              <button
                onClick={goDashboard}
                className="w-full border-2 border-slate-200 py-4 rounded-3xl font-black"
              >
                Save & Move On
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
