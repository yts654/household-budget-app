"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTransactions,
  getTransactionsForMonth,
  CATEGORY_COLORS,
  type Category,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import { useBudgetLimits } from "@/lib/budget-store";
import { useLanguage, useCategoryLabel } from "@/lib/i18n";

export function BudgetProgress() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount } = useCurrency();
  const budgetLimits = useBudgetLimits();
  const { t } = useLanguage();
  const getCatLabel = useCategoryLabel();

  const transactions = getTransactionsForMonth(allTransactions, year, month);
  const expenses = transactions.filter((tx) => tx.type === "expense");
  const catMap = new Map<Category, number>();
  for (const tx of expenses) {
    catMap.set(tx.category, (catMap.get(tx.category) || 0) + tx.amount);
  }

  const budgetItems = Array.from(catMap.entries())
    .filter(([cat]) => budgetLimits[cat])
    .map(([cat, amount]) => {
      const limit = budgetLimits[cat] || 0;
      const percentage = Math.min(Math.round((amount / limit) * 100), 100);
      const isOver = amount > limit;
      return {
        category: cat,
        label: getCatLabel(cat),
        amount,
        color: CATEGORY_COLORS[cat],
        limit,
        percentage,
        isOver,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          {t("budget.progress")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          {budgetItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("budget.noData")}
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
