"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAssets, getAssetAllocation } from "@/lib/asset-store";
import { useTransactions, getCumulativeSavings } from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { Briefcase, Shield, PiggyBank } from "lucide-react";

export function AssetSummaryCards() {
  const assets = useAssets();
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();

  const accumulatedSavings = getCumulativeSavings(transactions);
  const allocation = getAssetAllocation(assets);

  const liquidAmount = allocation.find((a) => a.name === "Liquid")?.amount ?? 0;
  const investmentAmount = allocation.find((a) => a.name === "Investment")?.amount ?? 0;
  const fixedAmount = allocation.find((a) => a.name === "Fixed")?.amount ?? 0;

  const cards = [
    {
      title: "Accumulated Savings",
      value: formatAmount(accumulatedSavings),
      subtitle: "From monthly budget",
      icon: PiggyBank,
      iconColor: "text-[#10b981]",
      bgColor: "bg-[#10b981]/10",
    },
    {
      title: "Investments",
      value: formatAmount(investmentAmount),
      subtitle: "Stocks, ETFs, Crypto",
      icon: Briefcase,
      iconColor: "text-[#f59e0b]",
      bgColor: "bg-[#f59e0b]/10",
    },
    {
      title: "Liquid + Fixed",
      value: formatAmount(liquidAmount + fixedAmount),
      subtitle: `Liquid ${formatAmount(liquidAmount)}`,
      icon: Shield,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="border-none shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${card.bgColor} rounded-lg p-2`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {card.title}
            </p>
            <p className="text-xl font-bold tracking-tight mt-1 text-card-foreground">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
