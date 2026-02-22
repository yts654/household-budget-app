"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions, getTransactionsForMonth, getTotalIncome, getTotalExpense } from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import { useLanguage, useMonthName } from "@/lib/i18n";
import { BarChartTooltip } from "@/components/chart-tooltip";

export function MonthlyChart() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount, currency } = useCurrency();
  const { t } = useLanguage();
  const getMonthName = useMonthName();

  // Build monthly data with translated month names
  const data: { month: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    while (m < 0) { m += 12; y--; }
    const filtered = getTransactionsForMonth(allTransactions, y, m);
    data.push({
      month: getMonthName(m, true),
      income: getTotalIncome(filtered),
      expense: getTotalExpense(filtered),
    });
  }

  function tickFormatter(v: number) {
    if (currency === "VND") {
      return `${(v / 1000000).toFixed(0)}M`;
    }
    return `${(v / 10000).toFixed(0)}0k`;
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          {t("chart.monthlyOverview")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={tickFormatter}
              />
              <Tooltip
                content={<BarChartTooltip formatAmount={formatAmount} />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar
                dataKey="income"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#0d9488]" />
            <span className="text-xs text-muted-foreground">{t("chart.income")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
            <span className="text-xs text-muted-foreground">{t("chart.expenses")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
