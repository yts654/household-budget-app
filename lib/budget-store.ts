"use client";

import useSWR, { mutate } from "swr";

const DEFAULT_LIMITS: Record<string, number> = {
  food: 40000,
  transport: 15000,
  housing: 90000,
  utilities: 20000,
  entertainment: 10000,
  shopping: 15000,
  health: 5000,
  education: 20000,
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useBudgetLimits(): Record<string, number> {
  const { data } = useSWR<Record<string, number>>("/api/budget-limits", fetcher, {
    fallbackData: DEFAULT_LIMITS,
    revalidateOnFocus: false,
  });

  // Merge defaults with user-saved limits
  const merged = { ...DEFAULT_LIMITS };
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "number") {
        merged[key] = value;
      }
    }
  }
  return merged;
}

export async function saveBudgetLimits(limits: Record<string, number>) {
  await fetch("/api/budget-limits", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(limits),
  });
  mutate("/api/budget-limits");
}

export { DEFAULT_LIMITS };
