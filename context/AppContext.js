"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userData, setUserData] = useState({
    xp: 1200,
    level: 3,
    streak: 3,
    moneySaved: 120,
    caloriesAvoided: 3400,
  });

  const addXP = (amount) => {
    setUserData((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
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
