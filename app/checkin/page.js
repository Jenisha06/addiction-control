"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Smile,
  Meh,
  Frown,
  Angry,
  Skull,
  CheckCircle2,
  XCircle,
  Flame,
} from "lucide-react";

const emotions = [
  { icon: <Smile className="text-emerald-500" size={40} />, label: "Great", value: 5 },
  { icon: <Meh className="text-blue-500" size={40} />, label: "Okay", value: 3 },
  { icon: <Frown className="text-orange-500" size={40} />, label: "Low", value: 2 },
  { icon: <Angry className="text-rose-500" size={40} />, label: "Tense", value: 1 },
  { icon: <Skull className="text-slate-500" size={40} />, label: "Bad", value: 0 },
];

export default function CheckInPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [name, setName] = useState("");

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [craving, setCraving] = useState(1);

  /* 🔹 LOAD USER SAFELY */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoadingUser(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists() && snap.data().name) {
        setName(snap.data().name);
        setStep(0);
      } else {
        setStep(-1); // ask name first
      }

      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  /* 🔹 SAVE NAME */
  const saveName = async () => {
    if (!name.trim()) return alert("Enter your name");

    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        name,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    setStep(0);
  };

  /* 🔹 CHECK-IN FINISH */
  const handleFinish = async (didDrink) => {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const logRef = doc(db, "users", user.uid, "logs", today);

    const existing = await getDoc(logRef);
    if (existing.exists()) {
      alert("Already checked in today");
      return;
    }

    await setDoc(logRef, {
      mood,
      craving,
      drank: didDrink,
      createdAt: serverTimestamp(),
    });

    setStep(didDrink ? 4 : 3);
  };

  if (loadingUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-lg mx-auto">
      <AnimatePresence mode="wait">

        {/* STEP -1 : NAME */}
        {step === -1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-3xl font-black">What should we call you?</h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full p-4 rounded-xl border"
            />

            <button
              onClick={saveName}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* STEP 0 : MOOD */}
        {step === 0 && (
          <motion.div key="mood" className="text-center space-y-8">
            <h2 className="text-3xl font-black">
              Hi {name} 👋 How are you feeling?
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {emotions.map((e, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMood(e.value);
                    setStep(1);
                  }}
                >
                  {e.icon}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 1 : CRAVING */}
        {step === 1 && (
          <motion.div key="craving" className="space-y-6 text-center">
            <h2 className="text-3xl font-black">Craving level?</h2>

            <input
              type="range"
              min="1"
              max="5"
              value={craving}
              onChange={(e) => setCraving(Number(e.target.value))}
              className="w-full"
            />

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* STEP 2 : DRINK */}
        {step === 2 && (
          <motion.div key="drink" className="space-y-6 text-center">
            <h2 className="text-3xl font-black">Did you drink today?</h2>

            <button
              onClick={() => handleFinish(false)}
              className="w-full bg-emerald-200 py-6 rounded-xl"
            >
              <CheckCircle2 size={32} /> NO
            </button>

            <button
              onClick={() => handleFinish(true)}
              className="w-full bg-rose-200 py-6 rounded-xl"
            >
              <XCircle size={32} /> YES
            </button>
          </motion.div>
        )}

        {/* STEP 3 : SUCCESS */}
        {step === 3 && (
          <motion.div key="success" className="text-center space-y-6">
            <Flame size={64} className="mx-auto text-emerald-500" />
            <h2 className="text-4xl font-black">Great job!</h2>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-black text-white py-4 rounded-xl"
            >
              Dashboard
            </button>
          </motion.div>
        )}

        {/* STEP 4 : REFLECT */}
        {step === 4 && (
          <motion.div key="reflect" className="text-center space-y-6">
            <h2 className="text-3xl font-black">Tomorrow is a new day</h2>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full border py-4 rounded-xl"
            >
              Continue
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}