"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  addTransaction,
  EXPENSE_CATEGORIES,
  type Category,
  type TransactionType,
} from "@/lib/store";
import { useCurrency } from "@/lib/currency-context";
import { useLanguage, useCategoryLabel } from "@/lib/i18n";
import { formatWithComma } from "@/lib/utils";
import { FormDialog } from "@/components/form-dialog";

export function AddTransaction() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<Category>("food");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const getCatLabel = useCategoryLabel();

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmountDisplay(formatWithComma(e.target.value));
  }

  function getRawAmount(): number {
    return parseInt(amountDisplay.replace(/[^\d]/g, ""), 10) || 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = getRawAmount();
    if (!parsedAmount || !description) return;
    addTransaction({
      type,
      category: type === "income" ? "income" : category,
      amount: parsedAmount,
      description,
      date,
    });
    setAmountDisplay("");
    setDescription("");
    setCategory("food");
    setOpen(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title={t("addTx.title")}
      description={t("addTx.dialogDesc")}
      triggerLabel={t("transactions.add")}
      onSubmit={handleSubmit}
      submitLabel={t("addTx.addEntry")}
    >
      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">{t("addTx.type")}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            className={
              type === "expense"
                ? "flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "flex-1"
            }
            onClick={() => setType("expense")}
          >
            {t("addTx.expense")}
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            className={
              type === "income"
                ? "flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                : "flex-1"
            }
            onClick={() => setType("income")}
          >
            {t("addTx.income")}
          </Button>
        </div>
      </div>

      {type === "expense" && (
        <div className="flex flex-col gap-2">
          <Label className="text-card-foreground">{t("addTx.category")}</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as Category)}
          >
            <SelectTrigger className="bg-secondary text-secondary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {getCatLabel(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">
          {t("addTx.amount")} ({currency === "JPY" ? "\u00a5 JPY" : "JPY"})
        </Label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="10,000"
          value={amountDisplay}
          onChange={handleAmountChange}
          required
          className="bg-secondary text-secondary-foreground tabular-nums"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">{t("addTx.description")}</Label>
        <Input
          type="text"
          placeholder={t("addTx.placeholder.desc")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="bg-secondary text-secondary-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-card-foreground">{t("addTx.date")}</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="bg-secondary text-secondary-foreground"
        />
      </div>
    </FormDialog>
  );
}
