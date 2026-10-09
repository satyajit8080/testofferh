"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, MailCheck, Sparkles } from "lucide-react";
import { AuthCard } from "@/components/admin/AuthCard";
import { Alert, Btn, Field, Input, PasswordInput, StrengthMeter } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function BackToLogin() {
  return (
    <Link href="/admin/login/" className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-muted transition-colors hover:text-white">
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to sign in
    </Link>
  );
}

/** Shared new-password + confirm fields with client-side checks matching the server's rules. */
function usePasswordPair() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const check = () => {
    const e: Record<string, string> = {};
    if (password.length < 12) e.password = "Use at least 12 characters.";
    else if (password.length > 128) e.password = "Use 128 characters or fewer.";
    else if (new Set(password).size < 5) e.password = "This password is too simple.";
    if (confirm !== password) e.confirm = "The passwords don't match.";
    return e;
  };
  return { password, setPassword, confirm, setConfirm, check };
}

function PasswordPair({ pair, errors, busy }: { pair: ReturnType<typeof usePasswordPair>; errors: Record<string, string>; busy: boolean }) {
  return (
    <>
      <Field label="New password" error={errors.password}>
        {(id, d) => (
          <>
            <PasswordInput id={id} aria-describedby={d} autoComplete="new-password" value={pair.password} onChange={(e) => pair.setPassword(e.target.value)} invalid={!!errors.password} disabled={busy} />
            <StrengthMeter password={pair.password} />
          </>
        )}
      </Field>
      <Field label="Confirm new password" error={errors.confirm}>
        {(id, d) => (
          <PasswordInput id={id} aria-describedby={d} autoComplete="new-password" value={pair.confirm} onChange={(e) => pair.setConfirm(e.target.value)} invalid={!!errors.confirm} disabled={busy} />
        )}
      </Field>
    </>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setFieldError("Enter a valid email address.");
    setFieldError("");
    setError("");
    setBusy(true);
    try {
      const res = await api<{ message: string }>("auth.php", { method: "POST", params: { action: "forgot" }, body: { email: email.trim() } });
      setDone(res.message);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard icon={done ? <MailCheck className="h-5 w-5" strokeWidth={1.6} /> : <KeyRound className="h-5 w-5" strokeWidth={1.6} />} eyebrow="Admin" title={done ? "Check your email" : "Reset your password"} description={done ? undefined : "Enter your staff email address and we'll send you a link to choose a new password."}>
      {done ? (
        <>
          <Alert tone="success">{done}</Alert>
          <BackToLogin />
        </>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Email" error={fieldError}>
            {(id, d) => <Input id={id} aria-describedby={d} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!fieldError} disabled={busy} autoFocus />}
          </Field>
          <Btn type="submit" variant="primary" loading={busy} className="h-11 w-full">
            {busy ? "Sending…" : "Send reset link"}
          </Btn>
          <BackToLogin />
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const pair = usePasswordPair();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = pair.check();
    setErrors(found);
    setError("");
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await api("auth.php", { method: "POST", params: { action: "reset" }, body: { token, password: pair.password } });
      window.location.replace("/admin/login/?reset=1");
    } catch (err) {
      const ex = err as ApiError;
      setErrors(ex.fields);
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  if (token === null) return null;

  return (
    <AuthCard icon={<KeyRound className="h-5 w-5" strokeWidth={1.6} />} eyebrow="Admin" title="Choose a new password" description="This signs you out on every other device.">
      {!token ? (
        <>
          <Alert>This reset link is incomplete. Open the link from your email again, or request a new one.</Alert>
          <BackToLogin />
        </>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-5">
          {error && (
            <Alert>
              {error}{" "}
              {/expired|invalid/i.test(error) && (
                <Link href="/admin/forgot-password/" className="underline underline-offset-2">
                  Request a new link
                </Link>
              )}
            </Alert>
          )}
          <PasswordPair pair={pair} errors={errors} busy={busy} />
          <Btn type="submit" variant="primary" loading={busy} className="h-11 w-full">
            {busy ? "Saving…" : "Set new password"}
          </Btn>
          <BackToLogin />
        </form>
      )}
    </AuthCard>
  );
}

export function SetupForm() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const pair = usePasswordPair();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ available: boolean }>("auth.php", { params: { action: "setup_status" } })
      .then((r) => setAvailable(r.available))
      .catch(() => setAvailable(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = pair.check();
    if (!token.trim()) found.token = "Enter the setup token from the config file.";
    if (!name.trim()) found.name = "Enter your name.";
    if (!EMAIL_RE.test(email.trim())) found.email = "Enter a valid email address.";
    setErrors(found);
    setError("");
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await api("auth.php", { method: "POST", params: { action: "setup" }, body: { token: token.trim(), name: name.trim(), email: email.trim(), password: pair.password } });
      window.location.replace("/admin/login/?setup=1");
    } catch (err) {
      const ex = err as ApiError;
      setErrors(ex.fields);
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  if (available === null) return null;

  return (
    <AuthCard icon={<Sparkles className="h-5 w-5" strokeWidth={1.6} />} eyebrow="First-time setup" title="Create the first admin" description={available ? "This page only works once, while no admin account exists." : undefined}>
      {!available ? (
        <>
          <Alert tone="info">Setup is not available. Either an admin account already exists, or no setup token is set in the server config.</Alert>
          <BackToLogin />
        </>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Setup token" error={errors.token} hint="The setup_token value from offerhost-config.php.">
            {(id, d) => <PasswordInput id={id} aria-describedby={d} autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} invalid={!!errors.token} disabled={busy} />}
          </Field>
          <Field label="Your name" error={errors.name}>
            {(id, d) => <Input id={id} aria-describedby={d} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} disabled={busy} />}
          </Field>
          <Field label="Email" error={errors.email}>
            {(id, d) => <Input id={id} aria-describedby={d} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email} disabled={busy} />}
          </Field>
          <PasswordPair pair={pair} errors={errors} busy={busy} />
          <Btn type="submit" variant="primary" loading={busy} className="h-11 w-full">
            {busy ? "Creating…" : "Create admin account"}
          </Btn>
        </form>
      )}
    </AuthCard>
  );
}
