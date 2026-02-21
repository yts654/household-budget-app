"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTransactions,
  getTransactionsForMonth,
  getCategoryBreakdown,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import { useBudgetLimits } from "@/lib/budget-store";

export function BudgetProgress() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount } = useCurrency();
  const budgetLimits = useBudgetLimits();

  const transactions = getTransactionsForMonth(allTransactions, year, month);
  const breakdown = getCategoryBreakdown(transactions);

  const budgetItems = breakdown
    .filter((item) => budgetLimits[item.category])
    .map((item) => {
      const limit = budgetLimits[item.category] || 0;
      const percentage = Math.min(Math.round((item.amount / limit) * 100), 100);
      const isOver = item.amount > limit;
      return { ...item, limit, percentage, isOver };
    });

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Budget Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          {budgetItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No expense data this month
            </p>
          )}
          {budgetItems.map((item) => (
            <div key={item.category} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-card-foreground">
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    item.isOver ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {formatAmount(item.amount)} / {formatAmount(item.limit)}
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.isOver ? "#ef4444" : item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
