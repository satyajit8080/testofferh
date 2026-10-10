"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Clock, Cpu, HardDrive, MapPin, MemoryStick, Network } from "lucide-react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Tbc } from "@/components/ui/Tbc";
import { Flag } from "@/components/ui/Flag";
import { RackGlyph } from "@/components/visuals/FeatureGlyphs";
import { locations } from "@/lib/site";
import { stockLabel, vatSuffix, type ResolvedPlan } from "@/lib/plans";
import { cn } from "@/lib/cn";

const specIcon = (spec: string) => {
  const s = spec.toLowerCase();
  if (s.includes("xeon") || s.includes("ryzen") || s.includes("epyc") || s.includes("cpu")) return Cpu;
  if (s.includes("ddr")) return MemoryStick;
  if (s.includes("ssd") || s.includes("nvme") || s.includes("raid")) return HardDrive;
  if (s.includes("gbps") || s.includes("ipv")) return Network;
  return Check;
};

/** Counts up to the price once the card scrolls into view. Server HTML shows the real price. */
function PriceCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      €{shown}
    </span>
  );
}

const beam: React.CSSProperties = {
  background:
    "conic-gradient(from 0deg, transparent 0%, transparent 62%, var(--color-brand-500) 76%, var(--color-glow) 86%, transparent 94%)",
};

export function ServerCard({ plan, index }: { plan: ResolvedPlan; index: number }) {
  const featured = plan.featured;
  const reduce = useReducedMotion();
  const loc = locations.find((l) => l.id === plan.location);

  return (
    <motion.article
      id={`plan-${plan.id}`}
      aria-labelledby={`plan-${plan.id}-name`}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex scroll-mt-28 rounded-[10px] p-px transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5",
        featured
          ? "shadow-[0_30px_80px_-30px_rgb(42_109_255/0.6)] hover:shadow-[0_34px_90px_-25px_rgb(56_214_255/0.5)]"
          : "hover:shadow-[0_24px_60px_-30px_rgb(42_109_255/0.55)]",
      )}
    >
      {/* Border: static line + rotating light beam */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 rounded-[10px]", featured ? "bg-brand-500/45" : "bg-line group-hover:bg-brand-400/30")}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[10px] transition-opacity duration-500",
          featured ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <span
          className="absolute inset-[-60%] animate-[spin_5s_linear_infinite] motion-reduce:animate-none"
          style={{ ...beam, animationDelay: `${-index * 1.2}s` }}
        />
      </span>

      {featured && (
        <span className="absolute -top-3 left-6 z-10 overflow-hidden rounded-[4px] bg-brand-500 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-white shadow-[0_6px_20px_-6px_rgb(42_109_255/0.9)]">
          {plan.badge}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:animate-[badge-shine_3.2s_ease-in-out_infinite]"
          />
        </span>
      )}

      {/* Card body */}
      <div
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-[9px] p-6",
          featured ? "bg-gradient-to-b from-[#0d1a3a] via-ink-850 to-ink-900" : "bg-ink-900",
        )}
      >
        {/* Soft glow that follows the card on hover */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl transition-opacity duration-500",
            featured ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            {loc && (
              <p className="mb-2 flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] tracking-wider text-subtle">
                <Flag code={loc.id} className="h-[11px] w-[16px]" />
                <MapPin className="h-3 w-3" />
                {loc.city} · {loc.id.toUpperCase()}
              </p>
            )}
            <h3 id={`plan-${plan.id}-name`} className="text-lg font-semibold tracking-tight text-white">
              {plan.name}
            </h3>
            <p className="mt-1 text-[13px] text-muted">{plan.summary}</p>
          </div>
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-md border bg-brand-500/10 transition-[border-color,color,box-shadow] duration-300",
              featured
                ? "border-brand-400/60 text-glow shadow-[0_0_20px_-4px_rgb(56_214_255/0.55)]"
                : "border-line text-brand-400 group-hover:border-brand-400/60 group-hover:text-glow",
            )}
          >
            <RackGlyph />
          </span>
        </div>

        <motion.ul
          className="relative mt-6 space-y-2.5 border-t border-line pt-5"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 + index * 0.1 } } }}
        >
          {plan.specs.map((spec) => {
            const Icon = specIcon(spec);
            return (
              <motion.li
                key={spec}
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2.5 text-[13.5px] text-fg/90"
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-400 transition-colors group-hover:text-glow" strokeWidth={1.6} />
                {spec}
              </motion.li>
            );
          })}
        </motion.ul>

        <div className="relative mt-5 flex flex-wrap items-center gap-2 text-[11.5px]">
          {plan.stock ? (
            <span className={cn("rounded-[4px] border px-2 py-0.5 font-mono tracking-wide", stockLabel[plan.stock].tone)}>
              {stockLabel[plan.stock].label}
            </span>
          ) : (
            <Tbc label="Stock" />
          )}
          <span className="flex items-center gap-1 text-muted">
            <Clock className="h-3.5 w-3.5" />
            {plan.delivery ?? <Tbc label="Delivery time" />}
          </span>
        </div>

        <div className="relative mt-auto pt-6">
          <p className="flex items-baseline gap-1.5">
            {plan.price === null ? (
              <span className="text-[22px] font-semibold tracking-tight text-white">Price on request</span>
            ) : (
              <>
                <span className="text-[34px] font-semibold tracking-tight text-white">
                  <PriceCounter value={plan.price} />
                </span>
                <span className="text-[13px] text-muted">/ month {vatSuffix(plan.pricesIncludeVat)}</span>
              </>
            )}
          </p>
          <p className="mt-1 text-[12px] text-subtle">
            Setup: {plan.setupFee === null ? <Tbc /> : plan.setupFee === 0 ? "free" : `€${plan.setupFee}`}
          </p>
          <AddToCartButton
            planId={plan.id}
            planName={plan.name}
            orderable={plan.orderable}
            featured={featured}
            className="mt-4"
          />
        </div>
      </div>
    </motion.article>
  );
}
