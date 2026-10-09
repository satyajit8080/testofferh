"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { Reveal } from "@/components/ui/Reveal";
import { useLiveData } from "@/lib/live";
import { locations, type ServerPlan } from "@/lib/site";
import { cn } from "@/lib/cn";
import { ServerCard } from "./ServerCard";

const specLabels = ["CPU", "Memory", "Storage", "Network"];

/** Plan cards + a spec comparison table, both from the same (live) plan list. */
export function PlanCatalog({ initial }: { initial: ServerPlan[] }) {
  const plans = useLiveData("plans", initial, (raw) => (Array.isArray(raw.items) && raw.items.length ? (raw.items as ServerPlan[]) : null));

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, i) => (
          <ServerCard key={plan.id} plan={plan} index={i} />
        ))}
      </div>

      <Reveal className="mt-20">
        <p className="eyebrow">Compare</p>
        <h2 id="compare-title" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
          Plans Side by Side
        </h2>
        <div className="relative mt-6 overflow-x-auto rounded-[10px] border border-line bg-ink-900/70">
          <table aria-labelledby="compare-title" className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-wider text-subtle">
                <th scope="col" className="px-5 py-3.5 font-medium">Plan</th>
                {specLabels.map((l) => (
                  <th key={l} scope="col" className="px-4 py-3.5 font-medium">
                    {l}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3.5 font-medium">Location</th>
                <th scope="col" className="px-5 py-3.5 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {plans.map((p) => {
                const loc = locations.find((l) => l.id === p.location);
                // HostBill order links live outside this app: use a plain anchor for them.
                const Configure = p.orderUrl ? "a" : Link;
                return (
                  <tr key={p.id} className={cn("transition-colors hover:bg-white/[0.02]", p.featured && "bg-brand-500/[0.06]")}>
                    <th scope="row" className="px-5 py-4 font-semibold text-white">
                      {p.name}
                      {p.badge && <span className="ml-2 font-mono text-[10px] tracking-wider text-brand-400">{p.badge}</span>}
                    </th>
                    {specLabels.map((_, i) => (
                      <td key={i} className="px-4 py-4 text-fg/85">
                        {p.specs[i] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-fg/85">
                        {loc && <Flag code={loc.id} className="h-[11px] w-[16px]" />}
                        {loc?.city ?? p.location}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-white">€{p.price}</span>
                      <span className="text-[12px] text-muted"> /mo</span>
                      <Configure
                        href={p.orderUrl || `/contact/?plan=${p.id}`}
                        className="ml-3 inline-flex items-center gap-1 text-[12.5px] text-brand-400 transition-colors hover:text-glow"
                        aria-label={`Configure ${p.name}`}
                      >
                        Configure
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Configure>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-subtle">Prices per month. The final configuration and price are confirmed when you order.</p>
      </Reveal>
    </>
  );
}
