"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ComponentGroup, Status } from "@/lib/status";
import { StatusDot, StatusPill } from "./StatusPill";
import { UptimeBars } from "./UptimeBars";
import { cn } from "@/lib/cn";

const severity: Status[] = ["operational", "maintenance", "degraded", "partial_outage", "major_outage"];

export function ComponentGroupCard({ group }: { group: ComponentGroup }) {
  const [open, setOpen] = useState(true);
  const worst = group.components.reduce<Status>(
    (w, c) => (severity.indexOf(c.status) > severity.indexOf(w) ? c.status : w),
    "operational",
  );

  return (
    <section aria-labelledby={`group-${group.id}`} className="overflow-hidden rounded-[10px] border border-line bg-ink-900/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`group-${group.id}-body`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] sm:px-6"
      >
        <span className="flex items-center gap-3">
          <StatusDot status={worst} pulse={worst !== "operational"} />
          <h2 id={`group-${group.id}`} className="text-[15px] font-semibold text-fg">
            {group.title}
          </h2>
          <span className="font-mono text-[11px] text-subtle">{group.components.length}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline-flex">
            <StatusPill status={worst} />
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={`group-${group.id}-body`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="divide-y divide-line border-t border-line"
          >
            {group.components.map((c) => (
              <li key={c.id} className="px-5 py-5 sm:px-6">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div>
                    <p className="text-[14px] font-medium text-fg">{c.name}</p>
                    {c.description && <p className="mt-0.5 text-[12.5px] text-muted">{c.description}</p>}
                  </div>
                  <StatusPill status={c.status} />
                </div>
                <UptimeBars history={c.history} label={c.name} />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}
