"use client";

import { CalendarClock, CheckCircle2, History } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { findComponent, type ComponentGroup } from "@/lib/status";
import { useStatusData } from "./StatusData";
import { StatusPill } from "./StatusPill";

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const names = (ids: string[], groups: ComponentGroup[]) => ids.map((id) => findComponent(id, groups)?.name ?? id).join(", ");

function Empty({ icon: Icon, text }: { icon: typeof CheckCircle2; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-line-strong bg-white/[0.015] px-5 py-6 text-sm text-muted">
      <Icon className="h-5 w-5 shrink-0 text-ok" strokeWidth={1.6} />
      {text}
    </div>
  );
}

export function MaintenanceList() {
  const { maintenance, groups } = useStatusData();
  return (
    <Reveal>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <CalendarClock className="h-5 w-5 text-brand-400" strokeWidth={1.6} />
        Scheduled Maintenance
      </h2>
      <div className="mt-4 space-y-3">
        {maintenance.length === 0 ? (
          <Empty icon={CheckCircle2} text="No maintenance is currently scheduled." />
        ) : (
          maintenance.map((m) => (
            <article key={m.id} className="rounded-[10px] border border-brand-400/30 bg-brand-500/[0.06] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium text-fg">{m.title}</h3>
                <StatusPill status="maintenance" />
              </div>
              <p className="mt-2 font-mono text-[12px] text-muted">
                {fmt.format(new Date(m.startsAt))} → {fmt.format(new Date(m.endsAt))}
              </p>
              <p className="mt-3 text-sm text-fg/85">{m.description}</p>
              <p className="mt-3 text-[12px] text-subtle">Affects: {names(m.components, groups)}</p>
            </article>
          ))
        )}
      </div>
    </Reveal>
  );
}

export function IncidentList() {
  const { incidents, groups } = useStatusData();
  const sorted = [...incidents].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return (
    <Reveal>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <History className="h-5 w-5 text-brand-400" strokeWidth={1.6} />
        Past Incidents
      </h2>
      <div className="mt-4 space-y-3">
        {sorted.length === 0 ? (
          <Empty icon={CheckCircle2} text="No incidents have been reported." />
        ) : (
          sorted.map((inc) => (
            <article key={inc.id} className="rounded-[10px] border border-line bg-ink-900/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium text-fg">{inc.title}</h3>
                <StatusPill status={inc.resolvedAt ? "operational" : inc.impact} />
              </div>
              <p className="mt-1 text-[12px] text-subtle">Affects: {names(inc.components, groups)}</p>
              <ol className="mt-4 space-y-3 border-l border-line pl-4">
                {inc.updates.map((u) => (
                  <li key={`${u.at}-${u.status}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-400" />
                    <p className="text-sm text-fg/90">
                      <span className="font-semibold capitalize text-white">{u.status}</span> — {u.message}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-subtle">{fmt.format(new Date(u.at))}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))
        )}
      </div>
    </Reveal>
  );
}
