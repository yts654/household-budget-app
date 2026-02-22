"use client";

import { Landmark, LayoutDashboard, Receipt, Briefcase, PieChart, Settings } from "lucide-react";
import { useView, type ViewId } from "@/lib/view-context";
import { useLanguage, type Locale } from "@/lib/i18n";

const LANG_OPTIONS: { code: Locale; flag: string }[] = [
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "vi", flag: "\u{1F1FB}\u{1F1F3}" },
];

const NAV_ITEMS: { icon: typeof LayoutDashboard; viewId: ViewId; labelKey: string }[] = [
  { icon: LayoutDashboard, viewId: "dashboard", labelKey: "nav.home" },
  { icon: Receipt, viewId: "transactions", labelKey: "nav.txns" },
  { icon: Briefcase, viewId: "portfolio", labelKey: "nav.portfolio" },
  { icon: PieChart, viewId: "analytics", labelKey: "nav.analytics" },
  { icon: Settings, viewId: "settings", labelKey: "nav.settings" },
];

export function MobileHeader() {
  const { view, setView } = useView();
  const { t, locale, setLocale } = useLanguage();

  // Cycle to next language on tap
  function cycleLanguage() {
    const currentIndex = LANG_OPTIONS.findIndex((l) => l.code === locale);
    const next = LANG_OPTIONS[(currentIndex + 1) % LANG_OPTIONS.length];
    setLocale(next.code);
  }

  return (
    <>
      <header className="lg:hidden flex items-center gap-3 px-4 py-4 bg-card border-b border-border sticky top-0 z-30">
        <div className="bg-primary rounded-lg p-1.5">
          <Landmark className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-base font-bold text-card-foreground tracking-tight flex-1">
          {t("brand.name")}
        </h1>
        <button
          onClick={cycleLanguage}
          className="text-lg px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Switch language"
        >
          {LANG_OPTIONS.find((l) => l.code === locale)?.flag}
        </button>
      </header>

      {/* Bottom tab bar on mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around py-2 px-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.viewId}
            onClick={() => setView(item.viewId)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
              view === item.viewId
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
