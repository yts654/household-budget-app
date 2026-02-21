"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAssets,
  deleteAsset,
  ASSET_CATEGORY_LABELS,
  ASSET_CATEGORY_COLORS,
  type Asset,
} from "@/lib/asset-store";
import { useCurrency } from "@/lib/currency-context";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

function AssetRow({
  asset,
  formatAmount,
}: {
  asset: Asset;
  formatAmount: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 group hover:bg-secondary/50 rounded-lg transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          backgroundColor: `${ASSET_CATEGORY_COLORS[asset.category]}15`,
          color: ASSET_CATEGORY_COLORS[asset.category],
        }}
      >
        {ASSET_CATEGORY_LABELS[asset.category].charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">
          {asset.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {asset.institution} &middot;{" "}
          {ASSET_CATEGORY_LABELS[asset.category]}
          {asset.note && (
            <span className="text-muted-foreground/60 ml-1">
              &mdash; {asset.note}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className="text-sm font-semibold tabular-nums text-card-foreground">
            {formatAmount(asset.amount)}
          </span>
          <p className="text-xs text-muted-foreground">
            {format(new Date(asset.lastUpdated), "MMM d")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => deleteAsset(asset.id)}
          aria-label={`Delete ${asset.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function AssetList() {
  const assets = useAssets();
  const { formatAmount } = useCurrency();

  const sorted = [...assets].sort((a, b) => b.amount - a.amount);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground">
            All Assets
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {assets.length} holdings
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[460px] pr-2">
          <div className="flex flex-col">
            {sorted.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                formatAmount={formatAmount}
              />
            ))}
            {sorted.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                No assets recorded
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
