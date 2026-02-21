"use client";

import { Landmark, LayoutDashboard, Receipt, Briefcase, PieChart, Settings } from "lucide-react";
import { useView, type ViewId } from "@/lib/view-context";

const NAV_ITEMS: { icon: typeof LayoutDashboard; viewId: ViewId; label: string }[] = [
  { icon: LayoutDashboard, viewId: "dashboard", label: "Home" },
  { icon: Receipt, viewId: "transactions", label: "Txns" },
  { icon: Briefcase, viewId: "portfolio", label: "Portfolio" },
  { icon: PieChart, viewId: "analytics", label: "Analytics" },
  { icon: Settings, viewId: "settings", label: "Settings" },
];

export function MobileHeader() {
  const { view, setView } = useView();

  return (
    <>
      <header className="lg:hidden flex items-center gap-3 px-4 py-4 bg-card border-b border-border sticky top-0 z-30">
        <div className="bg-primary rounded-lg p-1.5">
          <Landmark className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-base font-bold text-card-foreground tracking-tight">
          Kakeibo
        </h1>
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
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
