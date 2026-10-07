"use client";

import { motion } from "framer-motion";
import { ArrowRight, Info, Network } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { asnInfo, brand } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Network-operations style card summarising the ASN. */
export function AsnCard({ className }: { className?: string }) {
  return (
    <motion.aside
      id="asn"
      aria-labelledby="asn-card-title"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass ticks w-full scroll-mt-28 rounded-[10px]", className)}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 id="asn-card-title" className="flex items-center gap-2 text-[13px] font-medium text-fg/90">
          <Network className="h-4 w-4 text-brand-400" />
          Our ASN &amp; IP Information
        </h2>
        <span className="font-mono text-[10px] tracking-widest text-subtle">NOC</span>
      </div>

      <div className="px-5 pb-5 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Autonomous System</p>
            <p className="mt-1 font-mono text-[34px] font-semibold leading-none tracking-tight text-white sm:text-[40px]">
              {brand.asn}
            </p>
          </div>
          <StatusBadge label={asnInfo.status} />
        </div>
        <p className="mt-3 font-mono text-[11px] tracking-[0.18em] text-brand-400">{brand.network}</p>

        <dl className="mt-5 divide-y divide-line border-y border-line">
          {asnInfo.rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
              <dt className="text-muted">{row.label}</dt>
              <dd className="text-right font-medium text-fg">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-line-strong bg-white/[0.02] px-3 py-2 text-[12px] text-muted">
          <Info className="h-3.5 w-3.5 shrink-0 text-brand-400" />
          {asnInfo.ipRanges}
        </p>

        <Link
          href="#network"
          className="group mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-brand-500/60 bg-brand-500/15 text-sm font-medium text-white transition-colors hover:bg-brand-500/30"
        >
          View ASN Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.aside>
  );
}
