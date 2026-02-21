"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/lib/currency-context";
import { useBudgetLimits, saveBudgetLimits } from "@/lib/budget-store";
import { formatWithComma } from "@/lib/utils";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES } from "@/lib/store";
import { Loader2, LogOut, Save, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function SettingsView() {
  const { currency, exchangeRate, rateDate } = useCurrency();
  const { data: session, update: updateSession } = useSession();
  const budgetLimits = useBudgetLimits();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Budget state
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [budgetSaving, setBudgetSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session?.user]);

  useEffect(() => {
    const inputs: Record<string, string> = {};
    for (const cat of EXPENSE_CATEGORIES) {
      if (cat === "savings" || cat === "other") continue;
      inputs[cat] = formatWithComma(String(budgetLimits[cat] || 0));
    }
    setBudgetInputs(inputs);
  }, [budgetLimits]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);

    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to update profile.");
    } else {
      if (data.emailChangeMessage) {
        toast.success(data.emailChangeMessage);
        // Reset email field to current email since change is pending
        setEmail(data.email);
      } else {
        toast.success("Profile updated.");
      }
      await updateSession({ name: displayName, email: data.email });
    }
    setProfileSaving(false);
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to change password.");
    } else {
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  }

  async function handleBudgetSave() {
    setBudgetSaving(true);
    const limits: Record<string, number> = {};
    for (const [cat, val] of Object.entries(budgetInputs)) {
      limits[cat] = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
    }
    await saveBudgetLimits(limits);
    toast.success("Budget limits saved.");
    setBudgetSaving(false);
  }

  function handleBudgetInput(cat: string, value: string) {
    setBudgetInputs((prev) => ({ ...prev, [cat]: formatWithComma(value) }));
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Profile Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-name">Display Name</Label>
              <Input
                id="settings-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Changing your email requires verification via the new address.
              </p>
            </div>
            <Button type="submit" disabled={profileSaving} className="w-fit">
              {profileSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-pw">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={10}
                  placeholder="Min 10 chars, upper+lower+number+special"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && <PasswordStrength password={newPassword} />}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button type="submit" disabled={passwordSaving} className="w-fit">
              {passwordSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Budget Limits Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Monthly Budget Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPENSE_CATEGORIES.filter((c) => c !== "savings" && c !== "other").map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <Label className="w-28 text-sm shrink-0">
                  {CATEGORY_LABELS[cat]}
                </Label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {currency === "JPY" ? "\u00a5" : ""}
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={budgetInputs[cat] || ""}
                    onChange={(e) => handleBudgetInput(cat, e.target.value)}
                    className="pl-7 tabular-nums"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleBudgetSave}
            disabled={budgetSaving}
            className="mt-4 w-fit"
          >
            {budgetSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Budget Limits
          </Button>
        </CardContent>
      </Card>

      {/* Exchange Rate Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Exchange Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-card-foreground">
            Base currency: <span className="font-semibold">JPY</span>
          </p>
          <p className="text-card-foreground">
            Display currency: <span className="font-semibold">{currency}</span>
            <span className="text-xs text-muted-foreground ml-2">
              (toggle in the header)
            </span>
          </p>
          {exchangeRate && (
            <>
              <Separator />
              <p className="text-card-foreground">
                1 JPY ={" "}
                <span className="font-semibold tabular-nums">
                  {exchangeRate.toFixed(2)}
                </span>{" "}
                VND
              </p>
              {rateDate && (
                <p className="text-muted-foreground text-xs">
                  Rate fetched: {rateDate}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Signed in as {session?.user?.email}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">v1.2.0</p>
            </div>
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "10+ chars", pass: password.length >= 10 },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special char", pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const color =
    passed <= 1
      ? "bg-destructive"
      : passed <= 2
        ? "bg-warning"
        : passed <= 4
          ? "bg-warning"
          : "bg-success";

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < passed ? color : "bg-muted"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[10px] ${c.pass ? "text-success" : "text-muted-foreground"}`}
          >
            {c.pass ? "\u2713" : "\u2717"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
