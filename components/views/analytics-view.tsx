"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSelector } from "@/components/month-selector";
import { BudgetProgress } from "@/components/budget-progress";
import {
  useTransactions,
  getTransactionsForMonth,
  getTotalIncome,
  getTotalExpense,
  getCategoryBreakdown,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Category,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MessageSquareText,
} from "lucide-react";

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getPreviousMonth(year: number, month: number) {
  let pMonth = month - 1;
  let pYear = year;
  if (pMonth < 0) {
    pMonth = 11;
    pYear--;
  }
  return { year: pYear, month: pMonth };
}

function calcDelta(current: number, previous: number): { pct: number; direction: "up" | "down" | "flat" } {
  if (previous === 0 && current === 0) return { pct: 0, direction: "flat" };
  if (previous === 0) return { pct: 100, direction: "up" };
  const pct = Math.round(((current - previous) / previous) * 100);
  const direction = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return { pct, direction };
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function DeltaIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (direction === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

function deltaColor(direction: "up" | "down" | "flat", isExpense?: boolean) {
  if (direction === "flat") return "text-muted-foreground";
  if (isExpense) return direction === "up" ? "text-destructive" : "text-[#10b981]";
  return direction === "up" ? "text-[#10b981]" : "text-destructive";
}

/** Generate a short, data-driven summary of the month. */
function generateSummary(
  currentIncome: number,
  prevIncome: number,
  currentExpense: number,
  prevExpense: number,
  topIncrease: { label: string; pct: number } | null,
  topDecrease: { label: string; pct: number } | null,
  currentLabel: string,
  prevLabel: string,
  formatAmount: (n: number) => string,
): string {
  const parts: string[] = [];

  // Income commentary
  const incDelta = calcDelta(currentIncome, prevIncome);
  if (incDelta.direction === "up") {
    parts.push(`Income rose ${formatPct(incDelta.pct)} compared to ${prevLabel}, reaching ${formatAmount(currentIncome)}.`);
  } else if (incDelta.direction === "down") {
    parts.push(`Income declined ${Math.abs(incDelta.pct)}% from ${prevLabel}, totaling ${formatAmount(currentIncome)}.`);
  } else {
    parts.push(`Income remained steady at ${formatAmount(currentIncome)}.`);
  }

  // Expense commentary
  const expDelta = calcDelta(currentExpense, prevExpense);
  if (expDelta.direction === "up") {
    parts.push(`Spending increased by ${formatPct(expDelta.pct)} to ${formatAmount(currentExpense)}.`);
  } else if (expDelta.direction === "down") {
    parts.push(`Spending dropped ${Math.abs(expDelta.pct)}%, down to ${formatAmount(currentExpense)}.`);
  } else {
    parts.push(`Spending held flat at ${formatAmount(currentExpense)}.`);
  }

  // Net savings
  const netCurrent = currentIncome - currentExpense;
  const netPrev = prevIncome - prevExpense;
  if (netCurrent > 0 && netCurrent > netPrev) {
    parts.push(`Net savings improved to ${formatAmount(netCurrent)}.`);
  } else if (netCurrent > 0) {
    parts.push(`Net savings were ${formatAmount(netCurrent)}.`);
  } else if (netCurrent < 0) {
    parts.push(`The month ended with a deficit of ${formatAmount(Math.abs(netCurrent))}.`);
  }

  // Category highlights
  if (topIncrease && topIncrease.pct > 10) {
    parts.push(`Biggest increase: ${topIncrease.label} (+${topIncrease.pct}%).`);
  }
  if (topDecrease && topDecrease.pct < -10) {
    parts.push(`Largest cut: ${topDecrease.label} (${topDecrease.pct}%).`);
  }

  return parts.join(" ");
}

export function AnalyticsView() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount } = useCurrency();

  const currentTx = getTransactionsForMonth(allTransactions, year, month);
  const prev = getPreviousMonth(year, month);
  const prevTx = getTransactionsForMonth(allTransactions, prev.year, prev.month);

  const currentIncome = getTotalIncome(currentTx);
  const prevIncome = getTotalIncome(prevTx);
  const currentExpense = getTotalExpense(currentTx);
  const prevExpense = getTotalExpense(prevTx);
  const currentNet = currentIncome - currentExpense;
  const prevNet = prevIncome - prevExpense;

  const incomeDelta = calcDelta(currentIncome, prevIncome);
  const expenseDelta = calcDelta(currentExpense, prevExpense);
  const netDelta = calcDelta(currentNet, prevNet);

  const currentLabel = MONTH_NAMES_SHORT[month];
  const prevLabel = MONTH_NAMES_SHORT[prev.month];

  // --- Expense category comparison ---
  const currentExpenseBreakdown = getCategoryBreakdown(currentTx);
  const prevExpenseBreakdown = getCategoryBreakdown(prevTx);
  const prevExpenseMap = new Map(prevExpenseBreakdown.map((b) => [b.category, b.amount]));

  const expenseCategoryRows = currentExpenseBreakdown.map((item) => {
    const prevAmt = prevExpenseMap.get(item.category) || 0;
    const d = calcDelta(item.amount, prevAmt);
    return { ...item, prevAmount: prevAmt, delta: d };
  });
  // Categories from last month that vanished this month
  const currentExpenseCats = new Set(currentExpenseBreakdown.map((b) => b.category));
  const removedExpenseCats = prevExpenseBreakdown
    .filter((b) => !currentExpenseCats.has(b.category))
    .map((item) => ({
      ...item,
      amount: 0,
      prevAmount: item.amount,
      delta: calcDelta(0, item.amount),
      removed: true,
    }));

  // --- Income source comparison ---
  const currentIncomeTx = currentTx.filter((t) => t.type === "income");
  const prevIncomeTx = prevTx.filter((t) => t.type === "income");

  // Group income by description
  function groupByDesc(txs: typeof currentIncomeTx) {
    const map = new Map<string, number>();
    for (const t of txs) {
      map.set(t.description, (map.get(t.description) || 0) + t.amount);
    }
    return map;
  }
  const currentIncomeMap = groupByDesc(currentIncomeTx);
  const prevIncomeMap = groupByDesc(prevIncomeTx);

  const allIncomeSources = new Set([...currentIncomeMap.keys(), ...prevIncomeMap.keys()]);
  const incomeRows = Array.from(allIncomeSources).map((source) => {
    const cur = currentIncomeMap.get(source) || 0;
    const pre = prevIncomeMap.get(source) || 0;
    const d = calcDelta(cur, pre);
    return { source, current: cur, previous: pre, delta: d };
  }).sort((a, b) => b.current - a.current);

  // --- Summary insight ---
  let topIncrease: { label: string; pct: number } | null = null;
  let topDecrease: { label: string; pct: number } | null = null;
  for (const row of expenseCategoryRows) {
    if (row.delta.direction === "up" && (!topIncrease || row.delta.pct > topIncrease.pct)) {
      topIncrease = { label: row.label, pct: row.delta.pct };
    }
    if (row.delta.direction === "down" && (!topDecrease || row.delta.pct < topDecrease.pct)) {
      topDecrease = { label: row.label, pct: row.delta.pct };
    }
  }
  const summaryText = generateSummary(
    currentIncome, prevIncome, currentExpense, prevExpense,
    topIncrease, topDecrease, currentLabel, prevLabel, formatAmount,
  );

  return (
    <div className="flex flex-col gap-6">
      <MonthSelector />

      {/* Summary Insight Card */}
      <Card className="border-none shadow-sm bg-primary/5">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <MessageSquareText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {currentLabel} Summary
              </p>
              <p className="text-sm leading-relaxed text-card-foreground">
                {summaryText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month-over-Month Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Income", current: currentIncome, prev: prevIncome, delta: incomeDelta, isExpense: false, icon: TrendingUp },
          { label: "Expenses", current: currentExpense, prev: prevExpense, delta: expenseDelta, isExpense: true, icon: TrendingDown },
          { label: "Net Savings", current: currentNet, prev: prevNet, delta: netDelta, isExpense: false, icon: TrendingUp },
        ].map((card) => (
          <Card key={card.label} className="border-none shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${deltaColor(card.delta.direction, card.isExpense)}`}>
                  <DeltaIcon direction={card.delta.direction} />
                  {formatPct(card.delta.pct)}
                </div>
              </div>
              <p className="text-xl font-bold text-card-foreground">{formatAmount(card.current)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {prevLabel}: {formatAmount(card.prev)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income Sources Comparison */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Income Sources: {currentLabel} vs {prevLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{currentLabel}</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{prevLabel}</th>
                  <th className="text-right py-2.5 pl-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody>
                {incomeRows.map((row) => (
                  <tr key={row.source} className={`border-b border-border/50 last:border-0 ${row.current === 0 ? "opacity-50" : ""}`}>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                        <span className="text-card-foreground font-medium">{row.source}</span>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-4 tabular-nums text-card-foreground">{formatAmount(row.current)}</td>
                    <td className="text-right py-2.5 px-4 tabular-nums text-muted-foreground">{formatAmount(row.previous)}</td>
                    <td className="text-right py-2.5 pl-4">
                      <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${deltaColor(row.delta.direction)}`}>
                        <DeltaIcon direction={row.delta.direction} />
                        {row.delta.pct === 100 && row.previous === 0 ? "New" : formatPct(row.delta.pct)}
                      </div>
                    </td>
                  </tr>
                ))}
                {incomeRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No income data for comparison</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Category Comparison */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Expense Categories: {currentLabel} vs {prevLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{currentLabel}</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{prevLabel}</th>
                  <th className="text-right py-2.5 pl-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategoryRows.map((item) => (
                  <tr key={item.category} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-card-foreground font-medium">{item.label}</span>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-4 tabular-nums text-card-foreground">{formatAmount(item.amount)}</td>
                    <td className="text-right py-2.5 px-4 tabular-nums text-muted-foreground">{formatAmount(item.prevAmount)}</td>
                    <td className="text-right py-2.5 pl-4">
                      <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${deltaColor(item.delta.direction, true)}`}>
                        <DeltaIcon direction={item.delta.direction} />
                        {item.delta.pct === 100 && item.prevAmount === 0 ? "New" : formatPct(item.delta.pct)}
                      </div>
                    </td>
                  </tr>
                ))}
                {removedExpenseCats.map((item) => (
                  <tr key={item.category} className="border-b border-border/50 last:border-0 opacity-50">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-4 tabular-nums text-muted-foreground">{formatAmount(0)}</td>
                    <td className="text-right py-2.5 px-4 tabular-nums text-muted-foreground">{formatAmount(item.prevAmount)}</td>
                    <td className="text-right py-2.5 pl-4">
                      <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${deltaColor(item.delta.direction, true)}`}>
                        <DeltaIcon direction={item.delta.direction} />
                        {formatPct(item.delta.pct)}
                      </div>
                    </td>
                  </tr>
                ))}
                {expenseCategoryRows.length === 0 && removedExpenseCats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No expense data for comparison</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <BudgetProgress />
    </div>
  );
}
