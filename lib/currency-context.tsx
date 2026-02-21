"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type CurrencyCode = "JPY" | "VND";

interface ExchangeRateData {
  rate: number;
  date: string;
  fallback?: boolean;
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRate: number | null;
  rateDate: string;
  isLoading: boolean;
  formatAmount: (amountInJPY: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("JPY");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRate() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/exchange-rate");
        const data: ExchangeRateData = await res.json();
        setExchangeRate(data.rate);
        setRateDate(data.date);
      } catch {
        // Use fallback rate
        setExchangeRate(185);
        setRateDate(new Date().toISOString().split("T")[0]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRate();
  }, []);

  const formatAmount = useCallback(
    (amountInJPY: number): string => {
      const formatWithComma = (n: number): string => {
        const abs = Math.abs(n);
        const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return n < 0 ? `-${formatted}` : formatted;
      };

      if (currency === "JPY") {
        return `\u00a5${formatWithComma(amountInJPY)}`;
      }
      // Convert JPY to VND
      const rate = exchangeRate ?? 185;
      const vndAmount = Math.round(amountInJPY * rate);
      return `${formatWithComma(vndAmount)} \u20ab`;
    },
    [currency, exchangeRate]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        rateDate,
        isLoading,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
