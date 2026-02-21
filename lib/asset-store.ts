"use client";

import useSWR, { mutate } from "swr";

export type AssetCategory =
  | "savings_account"
  | "fixed_deposit"
  | "stocks"
  | "bonds"
  | "mutual_funds"
  | "etf"
  | "real_estate"
  | "cryptocurrency"
  | "pension"
  | "cash"
  | "other";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  amount: number; // in JPY
  institution: string;
  lastUpdated: string;
  note?: string;
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  savings_account: "Savings Account",
  fixed_deposit: "Fixed Deposit",
  stocks: "Stocks",
  bonds: "Bonds",
  mutual_funds: "Mutual Funds",
  etf: "ETF",
  real_estate: "Real Estate",
  cryptocurrency: "Crypto",
  pension: "Pension / iDeCo",
  cash: "Cash on Hand",
  other: "Other",
};

export const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  savings_account: "#3b82f6",
  fixed_deposit: "#6366f1",
  stocks: "#f59e0b",
  bonds: "#0ea5e9",
  mutual_funds: "#ef4444",
  etf: "#f97316",
  real_estate: "#10b981",
  cryptocurrency: "#eab308",
  pension: "#8b5cf6",
  cash: "#64748b",
  other: "#94a3b8",
};

export const ALL_ASSET_CATEGORIES: AssetCategory[] = [
  "savings_account",
  "fixed_deposit",
  "stocks",
  "bonds",
  "mutual_funds",
  "etf",
  "real_estate",
  "cryptocurrency",
  "pension",
  "cash",
  "other",
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAssets(): Asset[] {
  const { data } = useSWR<Asset[]>("/api/assets", fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });
  return data || [];
}

export async function addAsset(asset: Omit<Asset, "id">) {
  await fetch("/api/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  });
  mutate("/api/assets");
}

export async function updateAsset(id: string, updates: Partial<Omit<Asset, "id">>) {
  await fetch(`/api/assets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  mutate("/api/assets");
}

export async function deleteAsset(id: string) {
  await fetch(`/api/assets/${id}`, { method: "DELETE" });
  mutate("/api/assets");
}

// ----- computed helpers -----
export function getTotalAssets(assetList: Asset[]): number {
  return assetList.reduce((sum, a) => sum + a.amount, 0);
}

export function getAssetBreakdown(assetList: Asset[]): {
  category: AssetCategory;
  label: string;
  amount: number;
  color: string;
  count: number;
}[] {
  const map = new Map<AssetCategory, { amount: number; count: number }>();
  for (const a of assetList) {
    const existing = map.get(a.category) || { amount: 0, count: 0 };
    map.set(a.category, {
      amount: existing.amount + a.amount,
      count: existing.count + 1,
    });
  }
  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      label: ASSET_CATEGORY_LABELS[category],
      amount: data.amount,
      color: ASSET_CATEGORY_COLORS[category],
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Group assets by investment vs liquid vs fixed */
export function getAssetAllocation(assetList: Asset[]) {
  const liquid = ["savings_account", "cash"];
  const fixed = ["fixed_deposit", "real_estate", "pension"];
  const investment = ["stocks", "bonds", "mutual_funds", "etf", "cryptocurrency"];

  let liquidTotal = 0;
  let fixedTotal = 0;
  let investmentTotal = 0;
  let otherTotal = 0;

  for (const a of assetList) {
    if (liquid.includes(a.category)) liquidTotal += a.amount;
    else if (fixed.includes(a.category)) fixedTotal += a.amount;
    else if (investment.includes(a.category)) investmentTotal += a.amount;
    else otherTotal += a.amount;
  }

  return [
    { name: "Liquid", amount: liquidTotal, color: "#0ea5e9" },
    { name: "Investment", amount: investmentTotal, color: "#f59e0b" },
    { name: "Fixed", amount: fixedTotal, color: "#6366f1" },
    ...(otherTotal > 0 ? [{ name: "Other", amount: otherTotal, color: "#94a3b8" }] : []),
  ];
}
