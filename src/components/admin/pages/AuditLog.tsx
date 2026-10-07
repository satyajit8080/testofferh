"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronRight, ScrollText, Search } from "lucide-react";
import { RequireRole } from "@/components/admin/AdminShell";
import { Alert, Card, Empty, Input, PageHeader, Pager, Select, Spinner } from "@/components/admin/ui";
import { api, fmtDate, type AuditRow } from "@/lib/admin/api";
import { cn } from "@/lib/cn";

const areas = [
  { value: "", label: "All activity" },
  { value: "auth", label: "Sign-ins & security" },
  { value: "user", label: "Users" },
  { value: "message", label: "Messages" },
  { value: "plan", label: "Plans" },
  { value: "status", label: "Status page" },
];

const tone = (action: string) =>
  /failed|disabled|deleted|2fa_reset/.test(action) ? "text-orange-400" : action.startsWith("auth.") ? "text-brand-300" : "text-glow";

export function AuditLog() {
  return (
    <RequireRole role="admin">
      <AuditInner />
    </RequireRole>
  );
}

function AuditInner() {
  const [area, setArea] = useState("");
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AuditRow[]; total: number; pageSize: number } | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(term.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    api<{ items: AuditRow[]; total: number; pageSize: number }>("admin.php", { params: { action: "audit", area, q: search, page } })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [area, search, page]);

  return (
    <>
      <PageHeader eyebrow="Security" title="Audit log" description="Every sign-in and admin action, newest first. Entries can't be edited or deleted from the panel." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-60">
          <label className="sr-only" htmlFor="audit-area">
            Filter by area
          </label>
          <Select
            id="audit-area"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setPage(1);
            }}
          >
            {areas.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </div>
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search the audit log</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="User, target, action or IP…" className="pl-10" />
        </label>
      </div>

      {error && <Alert>{error}</Alert>}
      {!data && !error && <Spinner />}
      {data && data.items.length === 0 && <Empty icon={<ScrollText className="h-5 w-5" />} title="No entries" />}

      {data && data.items.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-wider text-subtle">
                <th scope="col" className="px-5 py-3 font-medium">When</th>
                <th scope="col" className="px-3 py-3 font-medium">Action</th>
                <th scope="col" className="px-3 py-3 font-medium">Target</th>
                <th scope="col" className="px-3 py-3 font-medium">User</th>
                <th scope="col" className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((a) => (
                <Fragment key={a.id}>
                  <tr>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px] text-muted">{fmtDate(a.at)}</td>
                    <td className="px-3 py-3">
                      {a.details ? (
                        <button
                          type="button"
                          aria-expanded={expanded === a.id}
                          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                          className={cn("inline-flex items-center gap-1 font-mono text-[12px] hover:underline", tone(a.action))}
                        >
                          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded === a.id && "rotate-90")} />
                          {a.action}
                        </button>
                      ) : (
                        <span className={cn("pl-[18px] font-mono text-[12px]", tone(a.action))}>{a.action}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-fg/85">{a.target ?? "—"}</td>
                    <td className="px-3 py-3 text-fg/85">{a.user ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-subtle">{a.ip}</td>
                  </tr>
                  {expanded === a.id && a.details && (
                    <tr>
                      <td colSpan={5} className="bg-ink-950/50 px-5 py-3">
                        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11.5px] text-fg/80">{JSON.stringify(a.details, null, 2)}</pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {data && <Pager page={page} total={data.total} pageSize={data.pageSize} onPage={setPage} />}
    </>
  );
}
