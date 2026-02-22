"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  useTransactions,
  getTransactionsForMonth,
  getTotalIncome,
  getTotalExpense,
  getBalance,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import { useLanguage } from "@/lib/i18n";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

export function SummaryCards() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount } = useCurrency();
  const { t } = useLanguage();

  const transactions = getTransactionsForMonth(allTransactions, year, month);
  const income = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);
  const balance = getBalance(transactions);
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  const cards = [
    {
      title: t("summary.monthlyIncome"),
      value: formatAmount(income),
      icon: TrendingUp,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t("summary.monthlyExpenses"),
      value: formatAmount(expense),
      icon: TrendingDown,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: t("summary.balance"),
      value: formatAmount(balance),
      icon: Wallet,
      iconColor: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      title: t("summary.savingsRate"),
      value: `${savingsRate}%`,
      icon: PiggyBank,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="border-none shadow-sm card-hover"
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
