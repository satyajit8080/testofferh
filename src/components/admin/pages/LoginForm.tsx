"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/admin/AuthCard";
import { Alert, Btn, Checkbox, Field, Input, PasswordInput } from "@/components/admin/ui";
import { api, ApiError, safeNext, setCsrf, type User } from "@/lib/admin/api";

type Errors = Partial<Record<"email" | "password" | "code", string>>;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [code, setCode] = useState("");
  const [mfa, setMfa] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("reset") === "1") setNotice("Your password has been updated. Sign in with your new password.");
    if (p.get("expired") === "1") setNotice("Your session has ended. Please sign in again.");
    if (p.get("setup") === "1") setNotice("Your admin account is ready. Sign in to continue.");
    // Already signed in? Go straight to the panel.
    api<{ user: User }>("auth.php", { params: { action: "me" } })
      .then(() => window.location.replace(safeNext(p.get("next"))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mfa) codeRef.current?.focus();
  }, [mfa]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const found: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) found.email = "Enter a valid email address.";
    if (!password) found.password = "Enter your password.";
    if (mfa && !/^\d{6}$/.test(code.replace(/\s/g, ""))) found.code = "Enter the 6-digit code from your authenticator app.";
    setErrors(found);
    setError("");
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const res = await api<{ user?: User; csrf?: string }>("auth.php", {
        method: "POST",
        params: { action: "login" },
        body: { email: email.trim(), password, remember, code: mfa ? code.replace(/\s/g, "") : "" },
      });
      if (res.csrf) setCsrf(res.csrf);
      window.location.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    } catch (err) {
      const ex = err as ApiError;
      if (ex.body?.mfaRequired) {
        // Password accepted; ask for the 2FA code. (A 200 with mfaRequired arrives as an ApiError because ok=false.)
        setMfa(true);
        if (ex.status !== 200) {
          setErrors({ code: ex.message });
          setCode("");
        }
      } else {
        setError(ex.status === 429 ? ex.message : ex.message || "Sign-in failed.");
        if (ex.status === 401) setPassword("");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      icon={mfa ? <ShieldCheck className="h-5 w-5" strokeWidth={1.6} /> : <LockKeyhole className="h-5 w-5" strokeWidth={1.6} />}
      eyebrow="Admin"
      title={mfa ? "Two-factor authentication" : "Sign in to Offerhost Admin"}
      description={mfa ? "Enter the 6-digit code from your authenticator app." : "For Offerhost staff. Customers can sign in to the client area."}
    >
      <form noValidate onSubmit={submit} className="space-y-5" aria-busy={busy}>
        {notice && !error && <Alert tone="success">{notice}</Alert>}
        {error && <Alert>{error}</Alert>}

        {!mfa ? (
          <>
            <Field label="Email" error={errors.email}>
              {(id, d) => (
                <Input id={id} aria-describedby={d} type="email" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email} disabled={busy} autoFocus />
              )}
            </Field>
            <Field label="Password" error={errors.password}>
              {(id, d) => (
                <PasswordInput id={id} aria-describedby={d} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} disabled={busy} />
              )}
            </Field>
            <div className="flex items-center justify-between gap-3">
              <Checkbox label="Remember me for 30 days" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <Link href="/admin/forgot-password/" className="text-[13px] text-brand-400 transition-colors hover:text-glow">
                Forgot password?
              </Link>
            </div>
          </>
        ) : (
          <Field label="Authentication code" error={errors.code}>
            {(id, d) => (
              <Input
                ref={codeRef}
                id={id}
                aria-describedby={d}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]*"
                maxLength={7}
                placeholder="123 456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                invalid={!!errors.code}
                disabled={busy}
                className="text-center font-mono text-lg tracking-[0.4em]"
              />
            )}
          </Field>
        )}

        <Btn type="submit" variant="primary" loading={busy} className="h-11 w-full" icon={!busy ? <ArrowRight className="h-4 w-4" /> : undefined}>
          {busy ? "Signing in…" : mfa ? "Verify" : "Sign in"}
        </Btn>

        {mfa && (
          <button
            type="button"
            onClick={() => {
              setMfa(false);
              setCode("");
              setErrors({});
            }}
            className="flex w-full items-center justify-center gap-1.5 text-[13px] text-muted transition-colors hover:text-white"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Use a different account
          </button>
        )}
      </form>
    </AuthCard>
  );
}
