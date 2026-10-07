"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { KeyRound, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Alert, Badge, Btn, Card, Field, Input, PageHeader, PasswordInput, StrengthMeter } from "@/components/admin/ui";
import { api, ApiError } from "@/lib/admin/api";

export function Account() {
  const { user } = useAdmin();
  return (
    <>
      <PageHeader eyebrow="Account" title="My account" description="Your sign-in details and security settings." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13.5px]">
              <dt className="text-subtle">Name</dt>
              <dd className="text-fg">{user.name}</dd>
              <dt className="text-subtle">Email</dt>
              <dd className="break-all text-fg">{user.email}</dd>
              <dt className="text-subtle">Role</dt>
              <dd>
                <Badge tone={user.role === "admin" ? "blue" : "neutral"}>{user.role}</Badge>
              </dd>
            </dl>
            <p className="mt-4 text-[12px] text-subtle">To change your name or email, ask another admin.</p>
          </Card>
          <ChangePassword />
        </div>
        <TwoFactor />
      </div>
    </>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!current) found.current = "Enter your current password.";
    if (password.length < 12) found.password = "Use at least 12 characters.";
    if (confirm !== password) found.confirm = "The passwords don't match.";
    setErrors(found);
    setError("");
    setDone(false);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await api("auth.php", { method: "POST", params: { action: "change_password" }, body: { current, password } });
      setDone(true);
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      const ex = err as ApiError;
      setErrors(ex.fields);
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
        <KeyRound className="h-4 w-4 text-brand-400" />
        Change password
      </h2>
      <p className="mt-1 text-[13px] text-muted">You'll stay signed in here; other devices are signed out.</p>
      <form noValidate onSubmit={submit} className="mt-5 space-y-5">
        {done && <Alert tone="success">Password updated.</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="Current password" error={errors.current}>
          {(id, d) => <PasswordInput id={id} aria-describedby={d} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} invalid={!!errors.current} />}
        </Field>
        <Field label="New password" error={errors.password}>
          {(id, d) => (
            <>
              <PasswordInput id={id} aria-describedby={d} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} />
              <StrengthMeter password={password} />
            </>
          )}
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          {(id, d) => <PasswordInput id={id} aria-describedby={d} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={!!errors.confirm} />}
        </Field>
        <Btn type="submit" variant="primary" loading={busy}>
          Update password
        </Btn>
      </form>
    </Card>
  );
}

function TwoFactor() {
  const { user, setUser } = useAdmin();
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const begin = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await api<{ secret: string; uri: string }>("auth.php", { method: "POST", params: { action: "totp_begin" } });
      // QR is generated in the browser; the secret never goes to a third-party service.
      const qr = await QRCode.toDataURL(r.uri, { margin: 1, width: 200, color: { dark: "#03060c", light: "#e8eefb" } });
      setSetup({ secret: r.secret, qr });
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const enable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("auth.php", { method: "POST", params: { action: "totp_enable" }, body: { code: code.replace(/\s/g, "") } });
      setUser({ ...user, totpEnabled: true });
      setSetup(null);
      setCode("");
      setNotice("Two-factor authentication is on. You'll need a code from your app each time you sign in.");
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("auth.php", { method: "POST", params: { action: "totp_disable" }, body: { password, code: code.replace(/\s/g, "") } });
      setUser({ ...user, totpEnabled: false });
      setPassword("");
      setCode("");
      setNotice("Two-factor authentication is off.");
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const codeInput = (
    <Field label="6-digit code">
      {(id, d) => (
        <Input id={id} aria-describedby={d} inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123 456" className="font-mono tracking-[0.3em]" />
      )}
    </Field>
  );

  return (
    <Card className="p-5 sm:p-6" ticks>
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Smartphone className="h-4 w-4 text-brand-400" />
          Two-factor authentication
        </h2>
        {user.totpEnabled ? <Badge tone="ok">On</Badge> : <Badge tone="warn">Off</Badge>}
      </div>
      <p className="mt-1 text-[13px] text-muted">
        Use an authenticator app (such as 1Password, Bitwarden, Google Authenticator or Authy) to generate a code at sign-in. Strongly recommended for admins.
      </p>

      <div className="mt-5 space-y-5">
        {notice && <Alert tone="success">{notice}</Alert>}
        {error && <Alert>{error}</Alert>}

        {!user.totpEnabled && !setup && (
          <Btn variant="primary" loading={busy} icon={<ShieldCheck className="h-4 w-4" />} onClick={begin}>
            Set up two-factor
          </Btn>
        )}

        {!user.totpEnabled && setup && (
          <form noValidate onSubmit={enable} className="space-y-5">
            <ol className="list-decimal space-y-2 pl-5 text-[13.5px] text-fg/90">
              <li>Scan this QR code with your authenticator app.</li>
              <li>Enter the 6-digit code it shows to confirm.</li>
            </ol>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} className="rounded-md border border-line-strong" />
              <div className="min-w-0 text-[12.5px] text-muted">
                <p>Can't scan? Enter this key manually:</p>
                <code className="mt-1.5 block break-all rounded border border-line bg-ink-950/70 px-2 py-1.5 font-mono text-[12px] tracking-wider text-fg">{setup.secret.match(/.{1,4}/g)?.join(" ")}</code>
              </div>
            </div>
            {codeInput}
            <div className="flex gap-2">
              <Btn type="submit" variant="primary" loading={busy}>
                Turn on
              </Btn>
              <Btn type="button" onClick={() => setSetup(null)}>
                Cancel
              </Btn>
            </div>
          </form>
        )}

        {user.totpEnabled && (
          <form noValidate onSubmit={disable} className="space-y-5 border-t border-line pt-5">
            <p className="text-[13px] text-muted">To turn two-factor off, confirm your password and a current code.</p>
            <Field label="Password">
              {(id, d) => <PasswordInput id={id} aria-describedby={d} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
            </Field>
            {codeInput}
            <Btn type="submit" variant="danger" loading={busy} icon={<ShieldOff className="h-4 w-4" />}>
              Turn off two-factor
            </Btn>
          </form>
        )}
      </div>
    </Card>
  );
}
