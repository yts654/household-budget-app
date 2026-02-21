"use client";

import useSWR, { mutate } from "swr";

export type Category =
  | "food"
  | "transport"
  | "housing"
  | "utilities"
  | "entertainment"
  | "shopping"
  | "health"
  | "education"
  | "savings"
  | "income"
  | "other";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  description: string;
  date: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  housing: "Housing",
  utilities: "Utilities",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health: "Health",
  education: "Education",
  savings: "Savings",
  income: "Income",
  other: "Other",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: "#f59e0b",
  transport: "#3b82f6",
  housing: "#6366f1",
  utilities: "#0ea5e9",
  entertainment: "#ef4444",
  shopping: "#f97316",
  health: "#10b981",
  education: "#8b5cf6",
  savings: "#14b8a6",
  income: "#3b82f6",
  other: "#94a3b8",
};

export const EXPENSE_CATEGORIES: Category[] = [
  "food",
  "transport",
  "housing",
  "utilities",
  "entertainment",
  "shopping",
  "health",
  "education",
  "savings",
  "other",
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTransactions(): Transaction[] {
  const { data } = useSWR<Transaction[]>("/api/transactions", fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });
  return data || [];
}

export async function addTransaction(tx: Omit<Transaction, "id">) {
  await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  });
  mutate("/api/transactions");
}

export async function deleteTransaction(id: string) {
  await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  mutate("/api/transactions");
}

// ----- computed helpers -----
export function getTransactionsForMonth(txs: Transaction[], year: number, month: number): Transaction[] {
  return txs.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getTotalIncome(txs: Transaction[]): number {
  return txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpense(txs: Transaction[]): number {
  return txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
}

export function getBalance(txs: Transaction[]): number {
  return getTotalIncome(txs) - getTotalExpense(txs);
}

export function getCategoryBreakdown(txs: Transaction[]): { category: Category; label: string; amount: number; color: string }[] {
  const expenses = txs.filter((t) => t.type === "expense");
  const map = new Map<Category, number>();
  for (const tx of expenses) {
    map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      label: CATEGORY_LABELS[category],
      amount,
      color: CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Get monthly totals for the 6 months up to and including the given month */
export function getMonthlyData(txs: Transaction[], year: number, month: number) {
  const result: { month: string; income: number; expense: number }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    while (m < 0) { m += 12; y--; }
    const filtered = getTransactionsForMonth(txs, y, m);
    result.push({
      month: monthNames[m],
      income: getTotalIncome(filtered),
      expense: getTotalExpense(filtered),
    });
  }
  return result;
}

/** Cumulative savings from all "savings" category expense transactions */
export function getCumulativeSavings(txs: Transaction[]): number {
  return txs
    .filter((t) => t.type === "expense" && t.category === "savings")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Get savings for a specific month */
export function getSavingsForMonth(txs: Transaction[], year: number, month: number): number {
  return getTransactionsForMonth(txs, year, month)
    .filter((t) => t.type === "expense" && t.category === "savings")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Get cumulative savings up to (but not including) a given month */
export function getCumulativeSavingsUntil(txs: Transaction[], year: number, month: number): number {
  return txs
    .filter((t) => {
      if (t.type !== "expense" || t.category !== "savings") return false;
      const d = new Date(t.date);
      const txYear = d.getFullYear();
      const txMonth = d.getMonth();
      return txYear < year || (txYear === year && txMonth < month);
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Get available months from all transactions, sorted newest first */
export function getAvailableMonths(txs: Transaction[]): { year: number; month: number; label: string }[] {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const set = new Set<string>();
  const result: { year: number; month: number; label: string }[] = [];

  for (const tx of txs) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!set.has(key)) {
      set.add(key);
      result.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      });
    }
  }

  return result.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}
