"use client";

import { useMonth } from "@/lib/month-context";
import { useTransactions } from "@/lib/store";
import { useLanguage, useMonthName } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MonthSelector() {
  const { year, month, setMonth } = useMonth();
  const transactions = useTransactions();
  const getMonthName = useMonthName();

  // Build available months from transactions with translated names
  const set = new Set<string>();
  const availableMonths: { year: number; month: number; label: string }[] = [];
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!set.has(key)) {
      set.add(key);
      availableMonths.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${getMonthName(d.getMonth())} ${d.getFullYear()}`,
      });
    }
  }
  availableMonths.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const currentKey = `${year}-${month}`;
  const currentIndex = availableMonths.findIndex(
    (m) => `${m.year}-${m.month}` === currentKey
  );

  const currentLabel =
    availableMonths.find((m) => m.year === year && m.month === month)?.label ??
    `${getMonthName(month)} ${year}`;

  function goNext() {
    if (currentIndex > 0) {
      const next = availableMonths[currentIndex - 1];
      setMonth(next.year, next.month);
    }
  }

  function goPrev() {
    if (currentIndex < availableMonths.length - 1) {
      const prev = availableMonths[currentIndex + 1];
      setMonth(prev.year, prev.month);
    }
  }

  const canGoNext = currentIndex > 0;
  const canGoPrev = currentIndex < availableMonths.length - 1;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={goPrev}
        disabled={!canGoPrev}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select
        value={currentKey}
        onValueChange={(val) => {
          const [y, m] = val.split("-").map(Number);
          setMonth(y, m);
        }}
      >
        <SelectTrigger className="w-[180px] bg-card text-card-foreground border-border h-9 text-sm">
          <SelectValue>{currentLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((m) => (
            <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={goNext}
        disabled={!canGoNext}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
