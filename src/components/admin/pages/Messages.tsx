"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Inbox, Mail, RotateCcw, Search, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { topicLabel } from "@/components/admin/pages/Dashboard";
import { Alert, Badge, Btn, Card, ConfirmBtn, Drawer, Empty, Field, Input, PageHeader, Pager, Spinner, Textarea } from "@/components/admin/ui";
import { api, ApiError, fmtDate, timeAgo, type MessageFull, type MessageRow } from "@/lib/admin/api";
import { serverPlans } from "@/lib/site";
import { cn } from "@/lib/cn";

const filters = [
  { value: "new", label: "New" },
  { value: "handled", label: "Handled" },
  { value: "", label: "All" },
] as const;

type ListData = { items: MessageRow[]; total: number; pageSize: number };

export function Messages() {
  const [filter, setFilter] = useState<"new" | "handled" | "">("new");
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListData | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(term.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [term]);

  const load = useCallback(() => {
    api<ListData>("admin.php", { params: { action: "messages", status: filter, q: search, page } })
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [filter, search, page]);

  useEffect(load, [load]);

  // Deep link from the dashboard: /admin/messages/?id=12
  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (id > 0) setOpenId(id);
  }, []);

  const open = (id: number | null) => {
    setOpenId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("id", String(id));
    else url.searchParams.delete("id");
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <PageHeader eyebrow="Inbox" title="Contact messages" description="Submissions from the /contact/ form. Mark them handled once someone has replied." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter messages" className="inline-flex w-fit rounded-md border border-line bg-ink-950/50 p-1">
          {filters.map((f) => (
            <button
              key={f.label}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
              className={cn("rounded-[5px] px-3.5 py-1.5 text-[13px] transition-colors", filter === f.value ? "bg-brand-500/20 text-white" : "text-muted hover:text-white")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search messages</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search name, email, text…" className="pl-10" />
        </label>
      </div>

      {error && <Alert>{error}</Alert>}
      {!data && !error && <Spinner />}

      {data && data.items.length === 0 && (
        <Empty icon={<Inbox className="h-5 w-5" />} title={search ? "No matching messages" : filter === "new" ? "Inbox zero" : "No messages"}>
          {filter === "new" && !search ? "There are no unhandled messages." : "Try a different filter or search."}
        </Empty>
      )}

      {data && data.items.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {data.items.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m.id)} className="group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-5">
                  <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", m.status === "new" ? "bg-glow shadow-[0_0_8px_rgb(56_214_255/0.8)]" : "bg-white/15")} aria-label={m.status === "new" ? "New" : "Handled"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={cn("text-[14px]", m.status === "new" ? "font-semibold text-white" : "font-medium text-fg/85")}>{m.name}</span>
                      <span className="truncate text-[12.5px] text-subtle">{m.email}</span>
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-muted">{m.preview}</span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="blue">{topicLabel(m.topic)}</Badge>
                      {m.plan && <Badge>{serverPlans.find((p) => p.id === m.plan)?.name ?? m.plan}</Badge>}
                      {m.company && <Badge>{m.company}</Badge>}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-[11px] text-subtle" title={fmtDate(m.createdAt)}>
                    {timeAgo(m.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data && <Pager page={page} total={data.total} pageSize={data.pageSize} onPage={setPage} />}

      <MessageDrawer id={openId} onClose={() => open(null)} onChanged={load} />
    </>
  );
}

function MessageDrawer({ id, onClose, onChanged }: { id: number | null; onClose: () => void; onChanged: () => void }) {
  const { user } = useAdmin();
  const [item, setItem] = useState<MessageFull | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "status" | "delete">("");

  useEffect(() => {
    setItem(null);
    setError("");
    if (!id) return;
    api<{ item: MessageFull }>("admin.php", { params: { action: "message", id } })
      .then((r) => {
        setItem(r.item);
        setNote(r.item.note);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const update = async (status: "new" | "handled", kind: "save" | "status") => {
    if (!item) return;
    setBusy(kind);
    setError("");
    try {
      const r = await api<{ item: MessageFull }>("admin.php", { method: "POST", params: { action: "message_update" }, body: { id: item.id, status, note } });
      setItem(r.item);
      onChanged();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!item) return;
    setBusy("delete");
    try {
      await api("admin.php", { method: "POST", params: { action: "message_delete" }, body: { id: item.id } });
      onChanged();
      onClose();
    } catch (e) {
      setError((e as ApiError).message);
      setBusy("");
    }
  };

  const planName = item?.plan ? serverPlans.find((p) => p.id === item.plan)?.name ?? item.plan : "";

  return (
    <Drawer
      open={id !== null}
      onClose={onClose}
      title={item ? `Message from ${item.name}` : "Message"}
      footer={
        item && (
          <>
            {user.role === "admin" && (
              <span className="mr-auto">
                <ConfirmBtn onConfirm={remove} loading={busy === "delete"} confirmLabel="Delete permanently">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </ConfirmBtn>
              </span>
            )}
            <Btn onClick={() => update(item.status, "save")} loading={busy === "save"} disabled={note === item.note}>
              Save note
            </Btn>
            {item.status === "new" ? (
              <Btn variant="primary" onClick={() => update("handled", "status")} loading={busy === "status"} icon={<CheckCircle2 className="h-4 w-4" />}>
                Mark handled
              </Btn>
            ) : (
              <Btn onClick={() => update("new", "status")} loading={busy === "status"} icon={<RotateCcw className="h-4 w-4" />}>
                Reopen
              </Btn>
            )}
          </>
        )
      }
    >
      {error && <Alert>{error}</Alert>}
      {!item && !error && <Spinner />}
      {item && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {item.status === "new" ? <Badge tone="blue">New</Badge> : <Badge tone="ok">Handled</Badge>}
            <Badge tone="blue">{topicLabel(item.topic)}</Badge>
            {planName && <Badge>{planName}</Badge>}
          </div>

          <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13.5px]">
            <dt className="text-subtle">From</dt>
            <dd className="text-fg">{item.name}</dd>
            <dt className="text-subtle">Email</dt>
            <dd className="break-all">
              <a href={`mailto:${item.email}?subject=${encodeURIComponent("Re: your message to Offerhost")}`} className="inline-flex items-center gap-1.5 text-brand-400 hover:text-glow">
                <Mail className="h-3.5 w-3.5" />
                {item.email}
              </a>
            </dd>
            {item.company && (
              <>
                <dt className="text-subtle">Company</dt>
                <dd className="text-fg">{item.company}</dd>
              </>
            )}
            <dt className="text-subtle">Received</dt>
            <dd className="text-fg">{fmtDate(item.createdAt)}</dd>
            {item.status === "handled" && (
              <>
                <dt className="text-subtle">Handled</dt>
                <dd className="text-fg">
                  {fmtDate(item.handledAt)}
                  {item.handledBy && <span className="text-muted"> by {item.handledBy}</span>}
                </dd>
              </>
            )}
          </dl>

          <div className="rounded-[8px] border border-line bg-ink-950/60 p-4">
            {/* Rendered as text: React escapes it, and whitespace is preserved. */}
            <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-fg/90">{item.message}</p>
          </div>

          <Field label="Internal note" optional hint="Only visible to staff.">
            {(fid, d) => <Textarea id={fid} aria-describedby={d} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={4} />}
          </Field>

          <p className="font-mono text-[11px] leading-relaxed text-subtle">
            IP {item.ip}
            <br />
            {item.userAgent}
          </p>
        </div>
      )}
    </Drawer>
  );
}
