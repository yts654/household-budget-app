"use client";

interface PieTooltipPayload {
  payload: { label?: string; name?: string; amount: number; color: string };
}

interface BarTooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

export function PieChartTooltip({
  active,
  payload,
  formatAmount,
}: {
  active?: boolean;
  payload?: PieTooltipPayload[];
  formatAmount: (v: number) => string;
}) {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold text-card-foreground">
        {data.label || data.name}
      </p>
      <p className="text-xs text-muted-foreground">{formatAmount(data.amount)}</p>
    </div>
  );
}

export function BarChartTooltip({
  active,
  payload,
  label,
  formatAmount,
}: {
  active?: boolean;
  payload?: BarTooltipPayload[];
  label?: string;
  formatAmount: (v: number) => string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold text-card-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.dataKey === "income" ? "Income" : "Expense"}:{" "}
          {formatAmount(entry.value)}
        </p>
      ))}
    </div>
  );
}
