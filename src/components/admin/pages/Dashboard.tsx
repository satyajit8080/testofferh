"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, CalendarClock, Inbox, Mail, ScrollText, Server, TriangleAlert, Users } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Alert, Badge, Card, Empty, PageHeader, Spinner } from "@/components/admin/ui";
import { api, timeAgo, type AuditRow, type MessageRow } from "@/lib/admin/api";
import { contactTopics } from "@/lib/site";
import { cn } from "@/lib/cn";

type Data = {
  counts: {
    newMessages: number;
    messages7d: number;
    activeStaff: number;
    openIncidents: number;
    upcomingMaintenance: number;
    visiblePlans: number;
    componentsNotOperational: number;
  };
  recentMessages: MessageRow[];
  recentActivity: AuditRow[] | null;
};

export const topicLabel = (v: string) => contactTopics.find((t) => t.value === v)?.label ?? v;

export function Dashboard() {
  const { user } = useAdmin();
  const reduce = useReducedMotion();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Data>("admin.php", { params: { action: "dashboard" } })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const stats = data
    ? [
        { label: "New messages", value: data.counts.newMessages, sub: `${data.counts.messages7d} in the last 7 days`, icon: Inbox, href: "/admin/messages/", hot: data.counts.newMessages > 0 },
        { label: "Open incidents", value: data.counts.openIncidents, sub: `${data.counts.componentsNotOperational} component${data.counts.componentsNotOperational === 1 ? "" : "s"} not operational`, icon: TriangleAlert, href: "/admin/status/", hot: data.counts.openIncidents > 0 },
        { label: "Upcoming maintenance", value: data.counts.upcomingMaintenance, sub: "Scheduled or in progress", icon: CalendarClock, href: "/admin/status/" },
        { label: "Visible plans", value: data.counts.visiblePlans, sub: "Shown on the homepage", icon: Server, href: "/admin/plans/" },
        { label: "Active staff", value: data.counts.activeStaff, sub: "Admin panel accounts", icon: Users, href: user.role === "admin" ? "/admin/users/" : undefined },
      ]
    : [];

  return (
    <>
      <PageHeader eyebrow="Dashboard" title={`Welcome back, ${user.name.split(" ")[0]}`} description="An overview of website activity. Customers, orders and invoices are managed in HostBill." />

      {error && <Alert>{error}</Alert>}
      {!data && !error && <Spinner />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((s, i) => {
              const Icon = s.icon;
              const body = (
                <>
                  <div className="flex items-center justify-between">
                    <span className={cn("grid h-9 w-9 place-items-center rounded-md border bg-brand-500/10 transition-colors", s.hot ? "border-brand-400/60 text-glow" : "border-line text-brand-400 group-hover:text-glow")}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                    </span>
                    {s.href && <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400" />}
                  </div>
                  <p className="mt-4 text-[32px] font-semibold tabular-nums tracking-tight text-white">{s.value}</p>
                  <p className="text-[13.5px] font-medium text-fg/90">{s.label}</p>
                  <p className="mt-0.5 text-[12px] text-subtle">{s.sub}</p>
                </>
              );
              return (
                <motion.div key={s.label} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                  {s.href ? (
                    <Link href={s.href} className="group glass block h-full rounded-[10px] p-5 transition-colors hover:border-brand-400/40">
                      {body}
                    </Link>
                  ) : (
                    <div className="group glass h-full rounded-[10px] p-5">{body}</div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className={cn("mt-6 grid grid-cols-1 gap-6", data.recentActivity && "xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]")}>
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                  <Mail className="h-4 w-4 text-brand-400" />
                  Latest contact messages
                </h2>
                <Link href="/admin/messages/" className="text-[13px] text-brand-400 transition-colors hover:text-glow">
                  View all
                </Link>
              </div>
              {data.recentMessages.length === 0 ? (
                <Empty icon={<Inbox className="h-5 w-5" />} title="No messages yet">
                  Submissions from the /contact/ form will appear here.
                </Empty>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recentMessages.map((m) => (
                    <li key={m.id}>
                      <Link href={`/admin/messages/?id=${m.id}`} className="group flex items-start gap-3 py-3 transition-colors">
                        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", m.status === "new" ? "bg-glow shadow-[0_0_8px_rgb(56_214_255/0.8)]" : "bg-white/15")} />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="truncate text-[14px] font-medium text-fg group-hover:text-white">{m.name}</span>
                            <Badge tone="blue">{topicLabel(m.topic)}</Badge>
                          </span>
                          <span className="mt-0.5 block truncate text-[13px] text-muted">{m.preview}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-subtle">{timeAgo(m.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {data.recentActivity && (
              <Card className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
                    <Activity className="h-4 w-4 text-brand-400" />
                    Recent activity
                  </h2>
                  <Link href="/admin/audit/" className="inline-flex items-center gap-1 text-[13px] text-brand-400 transition-colors hover:text-glow">
                    <ScrollText className="h-3.5 w-3.5" />
                    Audit log
                  </Link>
                </div>
                <ol className="space-y-3 border-l border-line pl-4">
                  {data.recentActivity.map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-400" />
                      <p className="text-[13px] text-fg/90">
                        <span className="font-mono text-[12px] text-brand-300">{a.action}</span>
                        {a.target && <span className="text-muted"> · {a.target}</span>}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-subtle">
                        {a.user ?? "system"} · {timeAgo(a.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
