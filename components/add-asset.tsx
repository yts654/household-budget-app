"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addAsset,
  ASSET_CATEGORY_LABELS,
  ALL_ASSET_CATEGORIES,
  type AssetCategory,
} from "@/lib/asset-store";
import { formatWithComma } from "@/lib/utils";
import { FormDialog } from "@/components/form-dialog";

export function AddAsset() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("savings_account");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [institution, setInstitution] = useState("");
  const [note, setNote] = useState("");

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmountDisplay(formatWithComma(e.target.value));
  }

  function getRawAmount(): number {
    return parseInt(amountDisplay.replace(/[^\d]/g, ""), 10) || 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = getRawAmount();
    if (!name || !parsedAmount || !institution) return;

    addAsset({
      name,
      category,
      amount: parsedAmount,
      institution,
      lastUpdated: new Date().toISOString().split("T")[0],
      ...(note ? { note } : {}),
    });

    setName("");
    setCategory("savings_account");
    setAmountDisplay("");
    setInstitution("");
    setNote("");
    setOpen(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="New Asset"
      description="Register a new asset holding. Amounts are in JPY."
      triggerLabel="Add Asset"
      triggerVariant="outline"
      onSubmit={handleSubmit}
      submitLabel="Add Asset"
    >
      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">Category</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as AssetCategory)}
        >
          <SelectTrigger className="bg-secondary text-secondary-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_ASSET_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {ASSET_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">Name</Label>
        <Input
          type="text"
          placeholder="e.g. Main Savings, Toyota Stock"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-secondary text-secondary-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">Institution</Label>
        <Input
          type="text"
          placeholder="e.g. MUFG Bank, SBI Securities"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
          className="bg-secondary text-secondary-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">
          {"Current Value (\u00a5 JPY)"}
        </Label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="1,000,000"
          value={amountDisplay}
          onChange={handleAmountChange}
          required
          className="bg-secondary text-secondary-foreground tabular-nums"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">
          Note <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          type="text"
          placeholder="e.g. NISA account, matures 2027"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-secondary text-secondary-foreground"
        />
      </div>
    </FormDialog>
  );
}
