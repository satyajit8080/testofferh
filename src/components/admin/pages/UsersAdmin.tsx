"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, Pencil, Search, ShieldCheck, ShieldOff, UserPlus, Users } from "lucide-react";
import { RequireRole, useAdmin } from "@/components/admin/AdminShell";
import { Alert, Badge, Btn, Card, Checkbox, ConfirmBtn, Drawer, Empty, Field, Input, PageHeader, Select, Spinner } from "@/components/admin/ui";
import { api, ApiError, fmtDate, timeAgo, type Invite, type Role, type StaffUser } from "@/lib/admin/api";

const roleInfo: Record<Role, string> = {
  admin: "Everything, including users, deletions and the audit log.",
  editor: "Messages, server plans and the status page. No deletions or user management.",
};

export function UsersAdmin() {
  return (
    <RequireRole role="admin">
      <UsersInner />
    </RequireRole>
  );
}

type DrawerState = { kind: "new" } | { kind: "edit"; user: StaffUser } | null;

function UsersInner() {
  const [items, setItems] = useState<StaffUser[] | null>(null);
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const load = useCallback(
    (q = term) =>
      api<{ items: StaffUser[] }>("admin.php", { params: { action: "users", q } })
        .then((r) => setItems(r.items))
        .catch((e) => setError(e.message)),
    [term],
  );

  useEffect(() => {
    const t = setTimeout(() => load(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term, load]);

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Users"
        description="Staff accounts for this admin panel. Customer accounts live in HostBill."
        actions={
          <Btn variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => setDrawer({ kind: "new" })}>
            Invite user
          </Btn>
        }
      />

      <label className="relative mb-5 block w-full sm:w-72">
        <span className="sr-only">Search users</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search name or email…" className="pl-10" />
      </label>

      {error && <Alert>{error}</Alert>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && <Empty icon={<Users className="h-5 w-5" />} title="No users found" />}

      {items && items.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-wider text-subtle">
                <th scope="col" className="px-5 py-3 font-medium">User</th>
                <th scope="col" className="px-3 py-3 font-medium">Role</th>
                <th scope="col" className="px-3 py-3 font-medium">2FA</th>
                <th scope="col" className="px-3 py-3 font-medium">Last sign-in</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((u) => (
                <tr key={u.id} className={u.active ? "" : "opacity-60"}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-fg">
                      {u.name} {!u.active && <Badge tone="bad">Disabled</Badge>}
                    </p>
                    <p className="text-[12.5px] text-subtle">{u.email}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge tone={u.role === "admin" ? "blue" : "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-3 py-3.5">
                    {u.totpEnabled ? (
                      <span className="inline-flex items-center gap-1 text-ok">
                        <ShieldCheck className="h-4 w-4" /> On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-subtle">
                        <ShieldOff className="h-4 w-4" /> Off
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-muted" title={fmtDate(u.lastLoginAt)}>
                    {u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Btn size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setDrawer({ kind: "edit", user: u })}>
                      Manage
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <UserDrawer state={drawer} onClose={() => setDrawer(null)} onChanged={() => load()} />
    </>
  );
}

function InviteLink({ invite }: { invite: Invite }) {
  const [copied, setCopied] = useState(false);
  return (
    <Alert tone={invite.emailed ? "success" : "info"}>
      <p>
        {invite.emailed ? "We emailed this link to the user." : "The email could not be sent (mail is not configured). Send this link to the user securely."} It works once and expires in {invite.expiresInHours} hours.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded border border-line bg-ink-950/70 px-2 py-1.5 font-mono text-[11.5px] text-fg/90">{invite.link}</code>
        <Btn
          size="sm"
          icon={<Copy className="h-3.5 w-3.5" />}
          onClick={() => navigator.clipboard?.writeText(invite.link).then(() => setCopied(true))}
        >
          {copied ? "Copied" : "Copy"}
        </Btn>
      </div>
    </Alert>
  );
}

function UserDrawer({ state, onClose, onChanged }: { state: DrawerState; onClose: () => void; onChanged: () => void }) {
  const { user: me } = useAdmin();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [invite, setInvite] = useState<Invite | null>(null);
  const [current, setCurrent] = useState<StaffUser | null>(null);

  useEffect(() => {
    setErrors({});
    setError("");
    setInvite(null);
    if (state?.kind === "edit") {
      setCurrent(state.user);
      setRole(state.user.role);
      setActive(state.user.active);
    } else {
      setCurrent(null);
      setName("");
      setEmail("");
      setRole("editor");
    }
  }, [state]);

  const call = async (key: string, action: string, body: unknown) => {
    setBusy(key);
    setError("");
    try {
      const r = await api<{ item?: StaffUser; invite?: Invite }>("admin.php", { method: "POST", params: { action }, body });
      if (r.item) setCurrent(r.item);
      if (r.invite) setInvite(r.invite);
      onChanged();
      return r;
    } catch (err) {
      const ex = err as ApiError;
      setErrors(ex.fields);
      setError(ex.message);
    } finally {
      setBusy("");
    }
  };

  const isSelf = current?.id === me.id;

  return (
    <Drawer
      open={state !== null}
      onClose={onClose}
      title={state?.kind === "edit" ? current?.name ?? "User" : "Invite user"}
      footer={
        state?.kind === "new" ? (
          invite ? (
            <Btn onClick={onClose}>Done</Btn>
          ) : (
            <>
              <Btn onClick={onClose}>Cancel</Btn>
              <Btn variant="primary" loading={busy === "create"} onClick={() => call("create", "user_create", { name, email, role })}>
                Create & send invite
              </Btn>
            </>
          )
        ) : (
          <>
            <Btn onClick={onClose}>Close</Btn>
            <Btn variant="primary" loading={busy === "save"} disabled={!current || isSelf || (role === current.role && active === current.active)} onClick={() => call("save", "user_update", { id: current?.id, role, active })}>
              Save changes
            </Btn>
          </>
        )
      }
    >
      <div className="space-y-5">
        {error && <Alert>{error}</Alert>}

        {state?.kind === "new" && !invite && (
          <>
            <Field label="Name" error={errors.name}>
              {(id, d) => <Input id={id} aria-describedby={d} value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} />}
            </Field>
            <Field label="Email" error={errors.email}>
              {(id, d) => <Input id={id} aria-describedby={d} type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email} />}
            </Field>
            <RoleSelect role={role} setRole={setRole} error={errors.role} />
            <p className="text-[12.5px] text-subtle">The user receives a link to set their own password. You never see or choose it.</p>
          </>
        )}

        {invite && <InviteLink invite={invite} />}

        {state?.kind === "edit" && current && (
          <>
            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13.5px]">
              <dt className="text-subtle">Email</dt>
              <dd className="break-all text-fg">{current.email}</dd>
              <dt className="text-subtle">Created</dt>
              <dd className="text-fg">{fmtDate(current.createdAt)}</dd>
              <dt className="text-subtle">Last sign-in</dt>
              <dd className="text-fg">{fmtDate(current.lastLoginAt)}</dd>
              <dt className="text-subtle">2FA</dt>
              <dd className="text-fg">{current.totpEnabled ? "Enabled" : "Not enabled"}</dd>
            </dl>

            {isSelf ? (
              <Alert tone="info">This is your account. Use My account to change your password or 2FA. Another admin must change your role.</Alert>
            ) : (
              <>
                <RoleSelect role={role} setRole={setRole} />
                <Checkbox label="Account enabled" checked={active} onChange={(e) => setActive(e.target.checked)} />
                {!active && current.active && <p className="text-[12.5px] text-subtle">Disabling signs the user out everywhere immediately.</p>}

                <div className="space-y-3 border-t border-line pt-5">
                  <p className="text-[13px] font-medium text-fg/90">Security</p>
                  <div className="flex flex-wrap gap-2">
                    <Btn size="sm" icon={<KeyRound className="h-3.5 w-3.5" />} loading={busy === "reset"} disabled={!current.active} onClick={() => call("reset", "user_send_reset", { id: current.id })}>
                      Send password reset link
                    </Btn>
                    {current.totpEnabled && (
                      <ConfirmBtn onConfirm={() => call("2fa", "user_reset_2fa", { id: current.id })} loading={busy === "2fa"} confirmLabel="Confirm: remove 2FA">
                        <ShieldOff className="h-3.5 w-3.5" />
                        Reset 2FA
                      </ConfirmBtn>
                    )}
                  </div>
                  <p className="text-[12px] text-subtle">Reset 2FA only after confirming the person's identity, e.g. if they lost their phone.</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}

function RoleSelect({ role, setRole, error }: { role: Role; setRole: (r: Role) => void; error?: string }) {
  return (
    <Field label="Role" error={error} hint={roleInfo[role]}>
      {(id, d) => (
        <Select id={id} aria-describedby={d} value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      )}
    </Field>
  );
}
