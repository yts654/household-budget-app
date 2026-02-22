"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { useLanguage, type Locale } from "@/lib/i18n";

const LANG_OPTIONS: { code: Locale; flag: string; label: string }[] = [
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}", label: "EN" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", label: "JA" },
  { code: "vi", flag: "\u{1F1FB}\u{1F1F3}", label: "VI" },
];

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowResendButton(false);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("EMAIL_NOT_VERIFIED")) {
        setError(t("login.verifyEmail"));
        setShowResendButton(true);
      } else if (result.error.includes("ACCOUNT_LOCKED")) {
        setError(t("login.accountLocked"));
      } else {
        setError(t("login.invalidCredentials"));
      }
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError(t("login.passwordsNoMatch"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      setLoading(false);
      return;
    }

    setSuccessMessage(data.message || t("login.checkEmail"));
    setTab("login");
    setLoading(false);
  }

  async function handleResendVerification() {
    setResendLoading(true);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccessMessage(t("login.verificationSent"));
      setShowResendButton(false);
    } else {
      setError(data.error || t("login.resendFailed"));
    }
    setResendLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-primary rounded-xl p-3 w-fit">
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-card-foreground">
            {t("brand.name")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t("brand.fullTitle")}
          </p>

          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {LANG_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  locale === lang.code
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "register"); setError(""); setSuccessMessage(""); setShowResendButton(false); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">{t("login.signIn")}</TabsTrigger>
              <TabsTrigger value="register">{t("login.createAccount")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-email">{t("login.email")}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-password">{t("login.password")}</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {successMessage && (
                  <div className="flex items-start gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {showResendButton && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                  >
                    {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Mail className="mr-2 h-4 w-4" />
                    {t("login.resendVerification")}
                  </Button>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("login.signIn")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-name">{t("login.displayName")}</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder={t("login.yourName")}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-email">{t("login.email")}</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-password">{t("login.password")}</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("settings.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={10}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-confirm">{t("login.confirmPassword")}</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("login.createAccount")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const { t } = useLanguage();

  if (!password) return null;

  const checks = [
    { label: t("pw.tenCharsFull"), pass: password.length >= 10 },
    { label: t("pw.lowercase"), pass: /[a-z]/.test(password) },
    { label: t("pw.uppercase"), pass: /[A-Z]/.test(password) },
    { label: t("pw.number"), pass: /[0-9]/.test(password) },
    { label: t("pw.special"), pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const strengthLabel =
    passed <= 1 ? t("pw.weak") : passed <= 2 ? t("pw.fair") : passed <= 4 ? t("pw.good") : t("pw.strong");
  const color =
    passed <= 1
      ? "bg-destructive"
      : passed <= 2
        ? "bg-warning"
        : passed <= 4
          ? "bg-warning"
          : "bg-success";

  return (
    <div className="flex flex-col gap-1.5 mt-1">
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
        <span className="text-[10px] text-muted-foreground ml-auto">{strengthLabel}</span>
      </div>
    </div>
  );
}
