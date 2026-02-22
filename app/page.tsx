"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { SummaryCards } from "@/components/summary-cards";
import { MonthlyChart } from "@/components/monthly-chart";
import { CategoryChart } from "@/components/category-chart";
import { TransactionsView } from "@/components/views/transactions-view";
import { AnalyticsView } from "@/components/views/analytics-view";
import { SettingsView } from "@/components/views/settings-view";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { AssetList } from "@/components/asset-list";
import { AddAsset } from "@/components/add-asset";
import { AssetSummaryCards } from "@/components/asset-summary-cards";
import { CurrencyToggle } from "@/components/currency-toggle";
import { MonthSelector } from "@/components/month-selector";
import { CurrencyProvider } from "@/lib/currency-context";
import { MonthProvider } from "@/lib/month-context";
import { ViewProvider, useView } from "@/lib/view-context";
import { useLanguage } from "@/lib/i18n";

function AppContent() {
  const { view } = useView();
  const { t } = useLanguage();

  const VIEW_TITLES: Record<string, string> = {
    dashboard: t("nav.dashboard"),
    transactions: t("nav.transactions"),
    portfolio: t("nav.portfolio"),
    analytics: t("nav.analytics"),
    settings: t("nav.settings"),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {VIEW_TITLES[view]}
              </h2>
              <CurrencyToggle />
            </div>
          </div>

          {/* ========== DASHBOARD ========== */}
          {view === "dashboard" && (
            <div className="flex flex-col gap-6">
              <MonthSelector />
              <SummaryCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MonthlyChart />
                </div>
                <div>
                  <CategoryChart />
                </div>
              </div>
            </div>
          )}

          {/* ========== TRANSACTIONS ========== */}
          {view === "transactions" && <TransactionsView />}

          {/* ========== PORTFOLIO ========== */}
          {view === "portfolio" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-end">
                <AddAsset />
              </div>
              <AssetSummaryCards />
              <PortfolioOverview />
              <AssetList />
            </div>
          )}

          {/* ========== ANALYTICS ========== */}
          {view === "analytics" && <AnalyticsView />}

          {/* ========== SETTINGS ========== */}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <CurrencyProvider>
      <MonthProvider>
        <ViewProvider>
          <AppContent />
        </ViewProvider>
      </MonthProvider>
    </CurrencyProvider>
  );
}
