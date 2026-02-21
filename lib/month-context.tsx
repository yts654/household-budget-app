"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MonthContextValue {
  year: number;
  month: number; // 0-indexed
  setMonth: (year: number, month: number) => void;
}

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonthState] = useState(now.getMonth());

  function setMonth(y: number, m: number) {
    setYear(y);
    setMonthState(m);
  }

  return (
    <MonthContext.Provider value={{ year, month, setMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
}
