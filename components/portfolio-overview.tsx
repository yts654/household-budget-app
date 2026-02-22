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
  useAssets,
  getTotalAssets,
  getAssetBreakdown,
  getAssetAllocation,
} from "@/lib/asset-store";
import { useTransactions, getCumulativeSavings } from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useLanguage, useAssetCategoryLabel } from "@/lib/i18n";
import { PieChartTooltip } from "@/components/chart-tooltip";
import { Briefcase, Shield, Droplets, PiggyBank } from "lucide-react";

export function PortfolioOverview() {
  const assets = useAssets();
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { t } = useLanguage();
  const getAssetCatLabel = useAssetCategoryLabel();

  const accumulatedSavings = getCumulativeSavings(transactions);
  const totalRegistered = getTotalAssets(assets);
  const totalAssets = totalRegistered + accumulatedSavings;

  // Build breakdown with translated labels
  const rawBreakdown = getAssetBreakdown(assets);
  const breakdown = rawBreakdown.map((item) => ({
    ...item,
    label: getAssetCatLabel(item.category),
  }));

  const rawAllocation = getAssetAllocation(assets);

  // Translate allocation names
  const allocationNameMap: Record<string, string> = {
    Liquid: t("allocation.liquid"),
    Investment: t("allocation.investment"),
    Fixed: t("allocation.fixed"),
    Savings: t("allocation.savings"),
    Other: t("allocation.other"),
  };

  const allocation = accumulatedSavings > 0
    ? [...rawAllocation, { name: "Savings", amount: accumulatedSavings, color: "#10b981" }]
    : rawAllocation;

  const allocationIcons: Record<string, typeof Briefcase> = {
    Liquid: Droplets,
    Investment: Briefcase,
    Fixed: Shield,
    Savings: PiggyBank,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Allocation Donut */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {t("portfolio.assetAllocation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center">
            <div className="h-[220px] w-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="amount"
                    stroke="none"
                  >
                    {allocation.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PieChartTooltip formatAmount={formatAmount} />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-muted-foreground">{t("portfolio.netWorth")}</span>
                <span className="text-sm font-bold text-card-foreground">
                  {formatAmount(totalAssets)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {allocation.map((item) => {
                const Icon = allocationIcons[item.name] || Briefcase;
                const pct =
                  totalAssets > 0
                    ? Math.round((item.amount / totalAssets) * 100)
                    : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2"
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: item.color }}
                    />
                    <div>
                      <p className="text-xs font-medium text-card-foreground">
                        {allocationNameMap[item.name] || item.name}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {pct}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {t("portfolio.byCategory")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center">
            <div className="h-[220px] w-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                    stroke="none"
                  >
                    {breakdown.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PieChartTooltip formatAmount={formatAmount} />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-muted-foreground">
                  {breakdown.length} {t("portfolio.types")}
                </span>
                <span className="text-sm font-bold text-card-foreground">
                  {assets.length} {t("portfolio.items")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full max-w-[320px]">
              {breakdown.map((item) => {
                const pct =
                  totalAssets > 0
                    ? Math.round((item.amount / totalAssets) * 100)
                    : 0;
                return (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {item.label}
                    </span>
                    <span className="text-xs font-medium text-card-foreground ml-auto tabular-nums">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
