"use client";

import { createContext, useContext, useState } from "react";
import { doc, updateDoc, increment, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../src/lib/firebase";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userData, setUserData] = useState({
    xp: 1200,
    level: 3,
    streak: 3,
    moneySaved: 120,
    caloriesAvoided: 3400,
  });

const addXP = async (amount, exerciseId = null) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data();

    let newXP = (data.xp || 0) + amount;
    let newLevel = data.level || 1;

    // 🔥 Level up logic
    while (newXP >= newLevel * 1000) {
      newLevel++;
    }

    // 🔥 CBT streak logic
    let newStreak = data.cbtStreak || 0;
    let today = new Date().toDateString();
    let lastDate = data.lastCbtDate
      ? new Date(data.lastCbtDate.seconds * 1000).toDateString()
      : null;

    if (exerciseId) {
      if (lastDate === today) {
        // already counted today
      } else {
        if (lastDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastDate === yesterday.toDateString()) {
            newStreak++;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      // Save CBT history
      await addDoc(
        collection(db, "users", user.uid, "cbtHistory"),
        {
          exerciseId,
          xpEarned: amount,
          completedAt: serverTimestamp(),
        }
      );
    }

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      cbtStreak: newStreak,
      lastCbtDate: serverTimestamp(),
      cbtCompletedCount: increment(1),
    });

  } catch (err) {
    console.error("XP update failed:", err);
  }
};
  return (
    <AppContext.Provider value={{ userData, setUserData, addXP }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
