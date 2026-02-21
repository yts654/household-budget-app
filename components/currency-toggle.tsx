"use client";

import { useCurrency, type CurrencyCode } from "@/lib/currency-context";
import { RefreshCw } from "lucide-react";

export function CurrencyToggle() {
  const { currency, setCurrency, exchangeRate, rateDate, isLoading } =
    useCurrency();

  const options: CurrencyCode[] = ["JPY", "VND"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        {options.map((code) => (
          <button
            key={code}
            onClick={() => setCurrency(code)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              currency === code
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {code}
          </button>
        ))}
      </div>
      {currency === "VND" && exchangeRate && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <span className="tabular-nums">
                1 JPY = {exchangeRate.toFixed(1)} VND
              </span>
              <span className="text-muted-foreground/60">({rateDate})</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
