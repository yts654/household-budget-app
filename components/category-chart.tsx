"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTransactions,
  getTransactionsForMonth,
  getTotalExpense,
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  type Category,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import { useLanguage, useCategoryLabel } from "@/lib/i18n";
import { PieChartTooltip } from "@/components/chart-tooltip";

export function CategoryChart() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount } = useCurrency();
  const { t } = useLanguage();
  const getCatLabel = useCategoryLabel();

  const transactions = getTransactionsForMonth(allTransactions, year, month);
  const totalExpense = getTotalExpense(transactions);

  // Build breakdown with translated labels
  const expenses = transactions.filter((tx) => tx.type === "expense");
  const map = new Map<Category, number>();
  for (const tx of expenses) {
    map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
  }
  const breakdown = Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      label: getCatLabel(category),
      amount,
      color: CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          {t("chart.spendingByCategory")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center">
          <div className="h-[200px] w-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieChartTooltip formatAmount={formatAmount} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">{t("chart.total")}</span>
              <span className="text-sm font-bold text-card-foreground">
                {formatAmount(totalExpense)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full max-w-[280px]">
            {breakdown.slice(0, 6).map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {item.label}
                </span>
                <span className="text-xs font-medium text-card-foreground ml-auto">
                  {totalExpense > 0
                    ? Math.round((item.amount / totalExpense) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
