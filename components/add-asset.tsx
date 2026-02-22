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
  ALL_ASSET_CATEGORIES,
  type AssetCategory,
} from "@/lib/asset-store";
import { useLanguage, useAssetCategoryLabel } from "@/lib/i18n";
import { formatWithComma } from "@/lib/utils";
import { FormDialog } from "@/components/form-dialog";

export function AddAsset() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("savings_account");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [institution, setInstitution] = useState("");
  const [note, setNote] = useState("");
  const { t } = useLanguage();
  const getAssetCatLabel = useAssetCategoryLabel();

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
      title={t("addAsset.title")}
      description={t("addAsset.description")}
      triggerLabel={t("portfolio.addAsset")}
      triggerVariant="outline"
      onSubmit={handleSubmit}
      submitLabel={t("addAsset.submit")}
    >
      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">{t("addAsset.category")}</Label>
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
                {getAssetCatLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">{t("addAsset.name")}</Label>
        <Input
          type="text"
          placeholder={t("addAsset.placeholder.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-secondary text-secondary-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">{t("addAsset.institution")}</Label>
        <Input
          type="text"
          placeholder={t("addAsset.placeholder.institution")}
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
          className="bg-secondary text-secondary-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">
          {t("addAsset.currentValue")} ({"\u00a5"} JPY)
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
          {t("addAsset.note")} <span className="text-muted-foreground">({t("addAsset.optional")})</span>
        </Label>
        <Input
          type="text"
          placeholder={t("addAsset.placeholder.note")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-secondary text-secondary-foreground"
        />
      </div>
    </FormDialog>
  );
}
