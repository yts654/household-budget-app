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
import { useLanguage, type Locale } from "@/lib/i18n";

const LANG_OPTIONS: { code: Locale; flag: string }[] = [
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "vi", flag: "\u{1F1FB}\u{1F1F3}" },
];

export function AppSidebar() {
  const { formatAmount } = useCurrency();
  const allTx = useTransactions();
  const { year, month } = useMonth();
  const { view, setView } = useView();
  const budgetLimits = useBudgetLimits();
  const { t, locale, setLocale } = useLanguage();
  const monthTx = getTransactionsForMonth(allTx, year, month);
  const totalExpense = getTotalExpense(monthTx);
  const monthlyBudget = Object.values(budgetLimits).reduce((sum, v) => sum + v, 0);
  const progressPct = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;

  const NAV_ITEMS: { labelKey: string; icon: typeof LayoutDashboard; viewId: ViewId }[] = [
    { labelKey: "nav.dashboard", icon: LayoutDashboard, viewId: "dashboard" },
    { labelKey: "nav.transactions", icon: Receipt, viewId: "transactions" },
    { labelKey: "nav.portfolio", icon: Briefcase, viewId: "portfolio" },
    { labelKey: "nav.analytics", icon: PieChart, viewId: "analytics" },
    { labelKey: "nav.settings", icon: Settings, viewId: "settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="bg-sidebar-primary rounded-lg p-2">
          <Landmark className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
            {t("brand.name")}
          </h1>
          <p className="text-xs text-sidebar-foreground/60 italic tracking-wide">{t("brand.subtitle")}</p>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-1 bg-sidebar-accent/60 rounded-lg p-1">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`flex-1 text-center py-1.5 rounded-md text-sm transition-all ${
                locale === lang.code
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              }`}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 mt-2 flex-1">
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
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 mt-auto">
        <div className="bg-sidebar-accent rounded-xl p-4">
          <p className="text-xs font-semibold text-sidebar-accent-foreground mb-1">
            {t("sidebar.monthlyGoal")}
          </p>
          <p className="text-xs text-sidebar-foreground/60 leading-relaxed">
            {t("sidebar.keepUnder")} {formatAmount(monthlyBudget)}
          </p>
          <div className="mt-3 h-1.5 bg-sidebar-border rounded-full overflow-hidden">
            <div
              className="h-full bg-sidebar-primary rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-sidebar-foreground/50 mt-1.5">
            {formatAmount(totalExpense)} {t("sidebar.spent")} ({progressPct}%)
          </p>
        </div>
      </div>
    </aside>
  );
}
