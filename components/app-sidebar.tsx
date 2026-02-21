"use client";

import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Landmark,
  Briefcase,
} from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { useTransactions, getTransactionsForMonth, getTotalExpense } from "@/lib/store";
import { useMonth } from "@/lib/month-context";
import { useView, type ViewId } from "@/lib/view-context";
import { useBudgetLimits } from "@/lib/budget-store";

const NAV_ITEMS: { label: string; icon: typeof LayoutDashboard; viewId: ViewId }[] = [
  { label: "Dashboard", icon: LayoutDashboard, viewId: "dashboard" },
  { label: "Transactions", icon: Receipt, viewId: "transactions" },
  { label: "Portfolio", icon: Briefcase, viewId: "portfolio" },
  { label: "Analytics", icon: PieChart, viewId: "analytics" },
  { label: "Settings", icon: Settings, viewId: "settings" },
];

export function AppSidebar() {
  const { formatAmount } = useCurrency();
  const allTx = useTransactions();
  const { year, month } = useMonth();
  const { view, setView } = useView();
  const budgetLimits = useBudgetLimits();
  const monthTx = getTransactionsForMonth(allTx, year, month);
  const totalExpense = getTotalExpense(monthTx);
  const monthlyBudget = Object.values(budgetLimits).reduce((sum, v) => sum + v, 0);
  const progressPct = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="bg-sidebar-primary rounded-lg p-2">
          <Landmark className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
            Kakeibo
          </h1>
          <p className="text-xs text-sidebar-foreground/60 italic tracking-wide">Budget Tracker</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.viewId}
            onClick={() => setView(item.viewId)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === item.viewId
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 mt-auto">
        <div className="bg-sidebar-accent rounded-xl p-4">
          <p className="text-xs font-semibold text-sidebar-accent-foreground mb-1">
            Monthly Goal
          </p>
          <p className="text-xs text-sidebar-foreground/60 leading-relaxed">
            Keep spending under {formatAmount(monthlyBudget)}
          </p>
          <div className="mt-3 h-1.5 bg-sidebar-border rounded-full overflow-hidden">
            <div
              className="h-full bg-sidebar-primary rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-sidebar-foreground/50 mt-1.5">
            {formatAmount(totalExpense)} spent ({progressPct}%)
          </p>
        </div>
      </div>
    </aside>
  );
}
