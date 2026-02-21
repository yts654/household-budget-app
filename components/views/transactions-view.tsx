"use client";

import { AddTransaction } from "@/components/add-transaction";
import { MonthSelector } from "@/components/month-selector";
import {
  useTransactions,
  getTransactionsForMonth,
  deleteTransaction,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Transaction,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useMonth } from "@/lib/month-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

function TransactionRow({
  tx,
  formatAmount,
}: {
  tx: Transaction;
  formatAmount: (v: number) => string;
}) {
  const isIncome = tx.type === "income";
  return (
    <div className="flex items-center gap-4 py-3.5 px-3 group hover:bg-secondary/50 rounded-lg transition-colors border-b border-border/40 last:border-b-0">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          backgroundColor: `${CATEGORY_COLORS[tx.category]}15`,
          color: CATEGORY_COLORS[tx.category],
        }}
      >
        {CATEGORY_LABELS[tx.category].charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">
          {tx.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[tx.category]}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">
          {format(new Date(tx.date), "MMM d, yyyy")}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-sm font-semibold tabular-nums ${
            isIncome ? "text-primary" : "text-card-foreground"
          }`}
        >
          {isIncome ? "+" : "\u2212"}
          {formatAmount(tx.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => deleteTransaction(tx.id)}
          aria-label={`Delete ${tx.description}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function TransactionsView() {
  const allTransactions = useTransactions();
  const { year, month } = useMonth();
  const { formatAmount } = useCurrency();

  const monthTx = getTransactionsForMonth(allTransactions, year, month);
  const sorted = [...monthTx].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MonthSelector />
        <AddTransaction />
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-card-foreground">
              All Transactions
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {sorted.length} entries
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[600px] pr-2">
            <div className="flex flex-col">
              {sorted.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} formatAmount={formatAmount} />
              ))}
              {sorted.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-16">
                  No transactions this month
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
