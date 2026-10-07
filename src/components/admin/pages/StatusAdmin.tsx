"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, ExternalLink, MessageSquarePlus, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Alert, Badge, Btn, Card, Checkbox, ConfirmBtn, Drawer, Empty, Field, Input, PageHeader, Select, Spinner, Textarea } from "@/components/admin/ui";
import { StatusDot, StatusPill } from "@/components/status/StatusPill";
import { api, ApiError, fmtDate } from "@/lib/admin/api";
import { statusMeta, type Status } from "@/lib/status";
import { cn } from "@/lib/cn";

type Component = { id: string; name: string; description: string; status: Status; updatedAt: string };
type Group = { id: string; title: string; components: Component[] };
type Step = "investigating" | "identified" | "monitoring" | "resolved";
type Incident = { id: number; title: string; impact: Exclude<Status, "operational">; components: string[]; startedAt: string; resolvedAt: string | null; updates: { id: number; status: Step; message: string; at: string }[] };
type Maint = { id: number; title: string; description: string; components: string[]; startsAt: string; endsAt: string };
type Data = { groups: Group[]; incidents: Incident[]; maintenance: Maint[] };

const STATUSES = Object.keys(statusMeta) as Status[];
const IMPACTS = STATUSES.filter((s) => s !== "operational") as Exclude<Status, "operational">[];
const STEPS: Step[] = ["investigating", "identified", "monitoring", "resolved"];

/** ISO (UTC) → value for <input type="datetime-local"> in the browser's timezone. */
const toLocal = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : "");

type DrawerState =
  | { kind: "component"; groupId: string; component?: Component }
  | { kind: "group"; group: Group }
  | { kind: "incident"; incident?: Incident }
  | { kind: "update"; incident: Incident }
  | { kind: "maintenance"; item?: Maint }
  | null;

export function StatusAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    api<Data>("admin.php", { params: { action: "status" } })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const post = async (action: string, body: unknown) => {
    const r = await api<Data>("admin.php", { method: "POST", params: { action }, body });
    setData({ groups: r.groups, incidents: r.incidents, maintenance: r.maintenance });
  };

  const quickStatus = async (groupId: string, c: Component, status: Status) => {
    setSavingId(c.id);
    setError("");
    try {
      await post("component_save", { originalId: c.id, id: c.id, groupId, name: c.name, description: c.description, status });
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSavingId("");
    }
  };

  const allComponents = data?.groups.flatMap((g) => g.components) ?? [];
  const name = (id: string) => allComponents.find((c) => c.id === id)?.name ?? id;
  const open = data?.incidents.filter((i) => !i.resolvedAt) ?? [];
  const resolved = data?.incidents.filter((i) => i.resolvedAt) ?? [];
  const now = Date.now();
  const upcoming = data?.maintenance.filter((m) => new Date(m.endsAt).getTime() >= now) ?? [];
  const pastMaint = data?.maintenance.filter((m) => new Date(m.endsAt).getTime() < now) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Status page"
        title="Network status"
        description="Changes are published to /status/ immediately. Set component statuses by hand; incidents don't change them automatically."
        actions={
          <>
            <a href="/status/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-line-strong px-4 text-sm text-fg transition-colors hover:border-brand-400/70 hover:bg-brand-500/10">
              <ExternalLink className="h-4 w-4" />
              View public page
            </a>
            <Btn variant="primary" icon={<TriangleAlert className="h-4 w-4" />} onClick={() => setDrawer({ kind: "incident" })}>
              Report incident
            </Btn>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {!data && !error && <Spinner />}

      {data && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {/* Components */}
          <section aria-labelledby="components-h" className="space-y-4">
            <h2 id="components-h" className="text-[15px] font-semibold text-white">
              Components
            </h2>
            {data.groups.map((g) => (
              <Card key={g.id} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                  <h3 className="truncate text-[14px] font-semibold text-fg">{g.title}</h3>
                  <span className="flex shrink-0 gap-1">
                    <Btn size="sm" variant="ghost" aria-label={`Rename ${g.title}`} onClick={() => setDrawer({ kind: "group", group: g })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Btn>
                    <Btn size="sm" variant="ghost" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setDrawer({ kind: "component", groupId: g.id })}>
                      Add
                    </Btn>
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {g.components.map((c) => (
                    <li key={c.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                      <span className="flex min-w-0 flex-1 items-center gap-2.5">
                        <StatusDot status={c.status} pulse={c.status !== "operational"} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] text-fg">{c.name}</span>
                          {c.description && <span className="block truncate text-[12px] text-subtle">{c.description}</span>}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <label className="sr-only" htmlFor={`st-${c.id}`}>
                          Status of {c.name}
                        </label>
                        <Select id={`st-${c.id}`} value={c.status} disabled={savingId === c.id} onChange={(e) => quickStatus(g.id, c, e.target.value as Status)} className="h-9 w-full text-[13px] sm:w-52">
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusMeta[s].label}
                            </option>
                          ))}
                        </Select>
                        <Btn size="sm" variant="ghost" aria-label={`Edit ${c.name}`} onClick={() => setDrawer({ kind: "component", groupId: g.id, component: c })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Btn>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </section>

          <div className="space-y-8">
            {/* Incidents */}
            <section aria-labelledby="incidents-h">
              <h2 id="incidents-h" className="mb-4 text-[15px] font-semibold text-white">
                Open incidents
              </h2>
              {open.length === 0 ? (
                <Empty icon={<CheckCircle2 className="h-5 w-5" />} title="No open incidents" />
              ) : (
                <div className="space-y-3">
                  {open.map((i) => (
                    <IncidentCard key={i.id} incident={i} name={name} onUpdate={() => setDrawer({ kind: "update", incident: i })} onEdit={() => setDrawer({ kind: "incident", incident: i })} />
                  ))}
                </div>
              )}
              {resolved.length > 0 && (
                <details className="group mt-4">
                  <summary className="cursor-pointer list-none text-[13px] text-muted transition-colors hover:text-white">
                    <span className="group-open:hidden">Show</span>
                    <span className="hidden group-open:inline">Hide</span> {resolved.length} resolved incident{resolved.length === 1 ? "" : "s"}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {resolved.map((i) => (
                      <IncidentCard key={i.id} incident={i} name={name} onUpdate={() => setDrawer({ kind: "update", incident: i })} onEdit={() => setDrawer({ kind: "incident", incident: i })} />
                    ))}
                  </div>
                </details>
              )}
            </section>

            {/* Maintenance */}
            <section aria-labelledby="maint-h">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="maint-h" className="text-[15px] font-semibold text-white">
                  Maintenance
                </h2>
                <Btn size="sm" icon={<CalendarClock className="h-3.5 w-3.5" />} onClick={() => setDrawer({ kind: "maintenance" })}>
                  Schedule
                </Btn>
              </div>
              {upcoming.length === 0 ? (
                <Empty icon={<CalendarClock className="h-5 w-5" />} title="Nothing scheduled" />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((m) => (
                    <MaintCard key={m.id} item={m} name={name} onEdit={() => setDrawer({ kind: "maintenance", item: m })} />
                  ))}
                </div>
              )}
              {pastMaint.length > 0 && (
                <p className="mt-3 text-[12px] text-subtle">
                  {pastMaint.length} past maintenance window{pastMaint.length === 1 ? "" : "s"} (no longer shown publicly).
                </p>
              )}
            </section>
          </div>
        </div>
      )}

      {data && <StatusDrawer state={drawer} groups={data.groups} onClose={() => setDrawer(null)} post={post} />}
    </>
  );
}

function IncidentCard({ incident: i, name, onUpdate, onEdit }: { incident: Incident; name: (id: string) => string; onUpdate: () => void; onEdit: () => void }) {
  const latest = i.updates[0];
  return (
    <Card className={cn("p-4 sm:p-5", !i.resolvedAt && "border-orange-400/30")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-[14.5px] font-semibold text-white">{i.title}</h3>
        <StatusPill status={i.resolvedAt ? "operational" : i.impact} />
      </div>
      <p className="mt-1 text-[12px] text-subtle">
        Started {fmtDate(i.startedAt)}
        {i.resolvedAt && ` · Resolved ${fmtDate(i.resolvedAt)}`}
      </p>
      <p className="mt-1 text-[12px] text-subtle">Affects: {i.components.map(name).join(", ")}</p>
      {latest && (
        <p className="mt-3 text-[13px] text-fg/90">
          <span className="font-semibold capitalize text-white">{latest.status}</span> — {latest.message}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn size="sm" variant={i.resolvedAt ? "secondary" : "primary"} icon={<MessageSquarePlus className="h-3.5 w-3.5" />} onClick={onUpdate}>
          {i.resolvedAt ? "Reopen / update" : "Post update"}
        </Btn>
        <Btn size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={onEdit}>
          Edit
        </Btn>
        <span className="ml-auto self-center font-mono text-[11px] text-subtle">{i.updates.length} updates</span>
      </div>
    </Card>
  );
}

function MaintCard({ item: m, name, onEdit }: { item: Maint; name: (id: string) => string; onEdit: () => void }) {
  const active = new Date(m.startsAt).getTime() <= Date.now();
  return (
    <Card className="border-brand-400/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-[14.5px] font-semibold text-white">{m.title}</h3>
        <Badge tone="blue">{active ? "In progress" : "Scheduled"}</Badge>
      </div>
      <p className="mt-1 font-mono text-[12px] text-muted">
        {fmtDate(m.startsAt)} → {fmtDate(m.endsAt)}
      </p>
      <p className="mt-2 line-clamp-2 text-[13px] text-fg/85">{m.description}</p>
      <p className="mt-2 text-[12px] text-subtle">Affects: {m.components.map(name).join(", ")}</p>
      <div className="mt-3">
        <Btn size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={onEdit}>
          Edit
        </Btn>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function ComponentPicker({ groups, value, onChange, error }: { groups: Group[]; value: string[]; onChange: (v: string[]) => void; error?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-fg/90">Affected components</legend>
      <div className={cn("max-h-64 space-y-4 overflow-y-auto rounded-[6px] border bg-ink-950/60 p-3.5", error ? "border-red-400/60" : "border-line-strong")}>
        {groups.map((g) => (
          <div key={g.id}>
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-wider text-subtle">{g.title}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {g.components.map((c) => (
                <Checkbox key={c.id} label={c.name} checked={value.includes(c.id)} onChange={(e) => onChange(e.target.checked ? [...value, c.id] : value.filter((x) => x !== c.id))} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="pt-1.5 text-[12.5px] text-red-400">{error}</p>}
    </fieldset>
  );
}

function StatusDrawer({ state, groups, onClose, post }: { state: DrawerState; groups: Group[]; onClose: () => void; post: (action: string, body: unknown) => Promise<void> }) {
  const { user } = useAdmin();
  const [f, setF] = useState<Record<string, string>>({});
  const [comps, setComps] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "delete">("");

  useEffect(() => {
    setErrors({});
    setError("");
    if (!state) return;
    if (state.kind === "component") {
      const c = state.component;
      setF({ id: c?.id ?? "", name: c?.name ?? "", description: c?.description ?? "", status: c?.status ?? "operational", groupId: state.groupId });
    } else if (state.kind === "group") {
      setF({ title: state.group.title });
    } else if (state.kind === "incident") {
      const i = state.incident;
      setF({ title: i?.title ?? "", impact: i?.impact ?? "degraded", startedAt: toLocal(i?.startedAt ?? new Date().toISOString()), status: "investigating", message: "" });
      setComps(i?.components ?? []);
    } else if (state.kind === "update") {
      setF({ status: state.incident.resolvedAt ? "monitoring" : state.incident.updates[0]?.status ?? "investigating", message: "" });
    } else if (state.kind === "maintenance") {
      const m = state.item;
      setF({ title: m?.title ?? "", description: m?.description ?? "", startsAt: toLocal(m?.startsAt), endsAt: toLocal(m?.endsAt) });
      setComps(m?.components ?? []);
    }
  }, [state]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const run = async (kind: "save" | "delete", action: string, body: unknown) => {
    setBusy(kind);
    setError("");
    try {
      await post(action, body);
      onClose();
    } catch (err) {
      const ex = err as ApiError;
      setErrors(ex.fields);
      setError(ex.message);
    } finally {
      setBusy("");
    }
  };

  if (!state) return <Drawer open={false} onClose={onClose} title="" children={null} />;

  let title = "";
  let body: React.ReactNode = null;
  let submit: () => void = () => {};
  let del: (() => void) | null = null;

  if (state.kind === "group") {
    title = "Rename group";
    body = (
      <Field label="Title" error={errors.title}>
        {(id, d) => <Input id={id} aria-describedby={d} value={f.title ?? ""} onChange={set("title")} invalid={!!errors.title} />}
      </Field>
    );
    submit = () => run("save", "group_save", { id: state.group.id, title: f.title });
  }

  if (state.kind === "component") {
    const editing = !!state.component;
    title = editing ? `Edit ${state.component!.name}` : "Add component";
    body = (
      <>
        <Field label="Name" error={errors.name}>
          {(id, d) => <Input id={id} aria-describedby={d} value={f.name ?? ""} onChange={set("name")} invalid={!!errors.name} />}
        </Field>
        <Field label="ID" error={errors.id} hint={editing ? "IDs can't be changed after creation." : "Lowercase letters, numbers and hyphens, e.g. ams-2."}>
          {(id, d) => <Input id={id} aria-describedby={d} value={f.id ?? ""} onChange={set("id")} disabled={editing} invalid={!!errors.id} />}
        </Field>
        <Field label="Description" optional error={errors.description}>
          {(id, d) => <Input id={id} aria-describedby={d} value={f.description ?? ""} onChange={set("description")} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Group" error={errors.groupId}>
            {(id, d) => (
              <Select id={id} aria-describedby={d} value={f.groupId ?? ""} onChange={set("groupId")}>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Status" error={errors.status}>
            {(id, d) => (
              <Select id={id} aria-describedby={d} value={f.status ?? ""} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusMeta[s].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </>
    );
    submit = () => run("save", "component_save", { originalId: state.component?.id ?? "", ...f });
    if (editing && user.role === "admin") del = () => run("delete", "component_delete", { id: state.component!.id });
  }

  if (state.kind === "incident") {
    const editing = !!state.incident;
    title = editing ? "Edit incident" : "Report incident";
    body = (
      <>
        <Field label="Title" error={errors.title}>
          {(id, d) => <Input id={id} aria-describedby={d} value={f.title ?? ""} onChange={set("title")} invalid={!!errors.title} placeholder="Packet loss in Frankfurt" />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Impact" error={errors.impact}>
            {(id, d) => (
              <Select id={id} aria-describedby={d} value={f.impact ?? ""} onChange={set("impact")}>
                {IMPACTS.map((s) => (
                  <option key={s} value={s}>
                    {statusMeta[s].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Started" error={errors.startedAt} hint="Your local time">
            {(id, d) => <Input id={id} aria-describedby={d} type="datetime-local" value={f.startedAt ?? ""} onChange={set("startedAt")} />}
          </Field>
        </div>
        <ComponentPicker groups={groups} value={comps} onChange={setComps} error={errors.components} />
        {!editing && (
          <>
            <Field label="Current status" error={errors.status}>
              {(id, d) => (
                <Select id={id} aria-describedby={d} value={f.status ?? ""} onChange={set("status")}>
                  {STEPS.filter((s) => s !== "resolved").map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="First update (public)" error={errors.message}>
              {(id, d) => <Textarea id={id} aria-describedby={d} value={f.message ?? ""} onChange={set("message")} invalid={!!errors.message} maxLength={2000} placeholder="We are investigating reports of…" />}
            </Field>
          </>
        )}
        <Alert tone="info">Remember to update the affected components' statuses too.</Alert>
      </>
    );
    submit = () => run("save", "incident_save", { id: state.incident?.id ?? 0, ...f, startedAt: fromLocal(f.startedAt ?? ""), components: comps });
    if (editing && user.role === "admin") del = () => run("delete", "incident_delete", { id: state.incident!.id });
  }

  if (state.kind === "update") {
    const inc = state.incident;
    title = "Post incident update";
    body = (
      <>
        <p className="text-[14px] font-semibold text-white">{inc.title}</p>
        <Field label="Status" error={errors.status}>
          {(id, d) => (
            <Select id={id} aria-describedby={d} value={f.status ?? ""} onChange={set("status")}>
              {STEPS.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Update (public)" error={errors.message}>
          {(id, d) => <Textarea id={id} aria-describedby={d} value={f.message ?? ""} onChange={set("message")} invalid={!!errors.message} maxLength={2000} />}
        </Field>
        {f.status === "resolved" && <Alert tone="info">Posting “Resolved” closes the incident. Set the affected components back to Operational if appropriate.</Alert>}
        {inc.updates.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-medium text-fg/90">Timeline</p>
            <ol className="space-y-3 border-l border-line pl-4">
              {inc.updates.map((u) => (
                <li key={u.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-400" />
                  <p className="text-[13px] text-fg/90">
                    <span className="font-semibold capitalize text-white">{u.status}</span> — {u.message}
                  </p>
                  <p className="font-mono text-[11px] text-subtle">{fmtDate(u.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </>
    );
    submit = () => run("save", "incident_update", { id: inc.id, ...f });
  }

  if (state.kind === "maintenance") {
    const editing = !!state.item;
    title = editing ? "Edit maintenance" : "Schedule maintenance";
    body = (
      <>
        <Field label="Title" error={errors.title}>
          {(id, d) => <Input id={id} aria-describedby={d} value={f.title ?? ""} onChange={set("title")} invalid={!!errors.title} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Starts" error={errors.startsAt} hint="Your local time">
            {(id, d) => <Input id={id} aria-describedby={d} type="datetime-local" value={f.startsAt ?? ""} onChange={set("startsAt")} invalid={!!errors.startsAt} />}
          </Field>
          <Field label="Ends" error={errors.endsAt} hint="Your local time">
            {(id, d) => <Input id={id} aria-describedby={d} type="datetime-local" value={f.endsAt ?? ""} onChange={set("endsAt")} invalid={!!errors.endsAt} />}
          </Field>
        </div>
        <ComponentPicker groups={groups} value={comps} onChange={setComps} error={errors.components} />
        <Field label="Description (public)" error={errors.description}>
          {(id, d) => <Textarea id={id} aria-describedby={d} value={f.description ?? ""} onChange={set("description")} invalid={!!errors.description} maxLength={2000} />}
        </Field>
      </>
    );
    submit = () => run("save", "maintenance_save", { id: state.item?.id ?? 0, ...f, startsAt: fromLocal(f.startsAt ?? ""), endsAt: fromLocal(f.endsAt ?? ""), components: comps });
    if (editing) del = () => run("delete", "maintenance_delete", { id: state.item!.id });
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          {del && (
            <span className="mr-auto">
              <ConfirmBtn onConfirm={del} loading={busy === "delete"} confirmLabel="Delete">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </ConfirmBtn>
            </span>
          )}
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" loading={busy === "save"} onClick={submit}>
            {state.kind === "update" ? "Post update" : "Save"}
          </Btn>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-5"
      >
        {error && <Alert>{error}</Alert>}
        {body}
      </form>
    </Drawer>
  );
}
