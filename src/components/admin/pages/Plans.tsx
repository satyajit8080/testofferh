"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, EyeOff, Pencil, Plus, Server, Star, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Alert, Badge, Btn, Card, Checkbox, ConfirmBtn, Drawer, Empty, Field, Input, PageHeader, Select, Spinner } from "@/components/admin/ui";
import { Flag } from "@/components/ui/Flag";
import { api, ApiError, type Plan } from "@/lib/admin/api";
import { locations } from "@/lib/site";

const planLocations = locations.filter((l) => l.pin);

type Form = Omit<Plan, "id" | "price" | "sortOrder" | "updatedAt"> & { id: number; price: string };

const blank: Form = {
  id: 0,
  slug: "",
  name: "",
  summary: "",
  cpu: "",
  ram: "",
  storage: "",
  network: "",
  price: "",
  location: "nl",
  featured: false,
  badge: "",
  orderUrl: "",
  visible: true,
};

export function Plans() {
  const [items, setItems] = useState<Plan[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Form | null>(null);
  const [moving, setMoving] = useState(false);

  const load = () =>
    api<{ items: Plan[] }>("admin.php", { params: { action: "plans" } })
      .then((r) => setItems(r.items))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const move = async (index: number, dir: -1 | 1) => {
    if (!items) return;
    const next = [...items];
    const [p] = next.splice(index, 1);
    next.splice(index + dir, 0, p);
    setItems(next);
    setMoving(true);
    try {
      await api("admin.php", { method: "POST", params: { action: "plans_reorder" }, body: { ids: next.map((x) => x.id) } });
    } catch (e) {
      setError((e as ApiError).message);
      load();
    } finally {
      setMoving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Server plans"
        description="Plans shown in the Dedicated Servers section of the homepage. Saved changes appear for visitors on their next page load."
        actions={
          <Btn variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ ...blank })}>
            New plan
          </Btn>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && (
        <Empty icon={<Server className="h-5 w-5" />} title="No plans yet">
          Create a plan to show it on the homepage.
        </Empty>
      )}

      {items && items.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {items.map((p, i) => {
              const loc = planLocations.find((l) => l.id === p.location);
              return (
                <li key={p.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex shrink-0 gap-1 sm:flex-col">
                    <button type="button" aria-label={`Move ${p.name} up`} disabled={i === 0 || moving} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition-colors hover:text-white disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label={`Move ${p.name} down`} disabled={i === items.length - 1 || moving} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition-colors hover:text-white disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-white">{p.name}</span>
                      {p.featured && (
                        <Badge tone="blue">
                          <Star className="h-3 w-3" />
                          {p.badge || "Featured"}
                        </Badge>
                      )}
                      {!p.visible && (
                        <Badge tone="warn">
                          <EyeOff className="h-3 w-3" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] text-muted">{[p.cpu, p.ram, p.storage, p.network].join(" · ")}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-subtle">
                      {loc && <Flag code={loc.id} className="h-[10px] w-[15px]" />}
                      {loc?.city ?? p.location} · {p.slug}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="font-semibold tabular-nums text-white">
                      €{p.price % 1 ? p.price.toFixed(2) : p.price}
                      <span className="text-[12px] font-normal text-muted"> /mo</span>
                    </p>
                    <Btn size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing({ ...p, price: String(p.price) })}>
                      Edit
                    </Btn>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <PlanDrawer
        form={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </>
  );
}

function PlanDrawer({ form, onClose, onSaved }: { form: Form | null; onClose: () => void; onSaved: () => void }) {
  const { user } = useAdmin();
  const [f, setF] = useState<Form>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "delete">("");

  useEffect(() => {
    if (form) {
      setF(form);
      setErrors({});
      setError("");
    }
  }, [form]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const text = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(k, e.target.value as never);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const found: Record<string, string> = {};
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) found.slug = "Use lowercase letters, numbers and hyphens.";
    for (const [k, label] of [["name", "Name"], ["cpu", "CPU"], ["ram", "Memory"], ["storage", "Storage"], ["network", "Network"]] as const) if (!f[k].trim()) found[k] = `${label} is required.`;
    if (!(Number(f.price) > 0)) found.price = "Enter a price above 0.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy("save");
    setError("");
    try {
      await api("admin.php", { method: "POST", params: { action: "plan_save" }, body: f });
      onSaved();
    } catch (err) {
      const ex = err as ApiError;
      setErrors(ex.fields);
      setError(ex.message);
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await api("admin.php", { method: "POST", params: { action: "plan_delete" }, body: { id: f.id } });
      onSaved();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy("");
    }
  };

  const input = (k: "slug" | "name" | "summary" | "cpu" | "ram" | "storage" | "network" | "badge" | "orderUrl", label: string, opts: { optional?: boolean; hint?: string; placeholder?: string } = {}) => (
    <Field label={label} error={errors[k]} optional={opts.optional} hint={opts.hint}>
      {(id, d) => <Input id={id} aria-describedby={d} value={f[k]} onChange={text(k)} invalid={!!errors[k]} placeholder={opts.placeholder} />}
    </Field>
  );

  return (
    <Drawer
      open={form !== null}
      onClose={onClose}
      title={f.id ? `Edit ${form?.name}` : "New plan"}
      footer={
        <>
          {f.id > 0 && user.role === "admin" && (
            <span className="mr-auto">
              <ConfirmBtn onConfirm={remove} loading={busy === "delete"} confirmLabel="Delete plan">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </ConfirmBtn>
            </span>
          )}
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" loading={busy === "save"} onClick={() => save()}>
            {f.id ? "Save changes" : "Create plan"}
          </Btn>
        </>
      }
    >
      <form noValidate onSubmit={save} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          {input("name", "Name", { placeholder: "Ryzen 9 5950X" })}
          {input("slug", "ID", { hint: "Used in links, e.g. /contact/?plan=…" })}
        </div>
        {input("summary", "Summary", { optional: true, placeholder: "16 cores for demanding applications" })}
        <div className="grid gap-5 sm:grid-cols-2">
          {input("cpu", "CPU")}
          {input("ram", "Memory")}
          {input("storage", "Storage")}
          {input("network", "Network")}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price (EUR / month)" error={errors.price}>
            {(id, d) => <Input id={id} aria-describedby={d} inputMode="decimal" value={f.price} onChange={text("price")} invalid={!!errors.price} />}
          </Field>
          <Field label="Location" error={errors.location}>
            {(id, d) => (
              <Select id={id} aria-describedby={d} value={f.location} onChange={text("location")} invalid={!!errors.location}>
                {planLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.city}, {l.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        {input("orderUrl", "Order link", { optional: true, hint: "HostBill cart link for this plan. Empty = the Configure button opens the contact form.", placeholder: "/clients/?cmd=cart&action=add&id=…" })}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3 pt-1">
            <Checkbox label="Visible on the homepage" checked={f.visible} onChange={(e) => set("visible", e.target.checked)} />
            <Checkbox label="Featured (highlighted card)" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
          </div>
          {input("badge", "Badge text", { optional: true, placeholder: "MOST POPULAR" })}
        </div>
        <button type="submit" hidden />
      </form>
    </Drawer>
  );
}
