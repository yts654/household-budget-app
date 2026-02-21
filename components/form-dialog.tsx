"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  triggerLabel: string;
  triggerVariant?: "default" | "outline";
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  children: ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  triggerLabel,
  triggerVariant = "default",
  onSubmit,
  submitLabel,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerVariant === "outline" ? (
          <Button
            variant="outline"
            className="gap-2 border-border text-foreground hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            <span>{triggerLabel}</span>
          </Button>
        ) : (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>{triggerLabel}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
          {children}
          <Button
            type="submit"
            className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
