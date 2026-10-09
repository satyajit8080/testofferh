"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Globe2, HardDrive, Headset, SlidersHorizontal, Waypoints, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand } from "@/lib/site";
import { cn } from "@/lib/cn";

type Reason = {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
  /** Layer label and detail in the stack diagram */
  layer: string;
  detail: string;
  /** One-line explanation shown while this layer is active */
  explain: string;
};

const reasons: Reason[] = [
  {
    icon: HardDrive,
    title: "Enterprise Hardware",
    body: "Reliable server hardware designed for continuous workloads.",
    tag: "HW",
    layer: "Hardware",
    detail: "AMD Ryzen · NVMe",
    explain: "Your workload runs on dedicated AMD Ryzen servers with NVMe storage, racked and monitored by our own team.",
  },
  {
    icon: Waypoints,
    title: "Network Control",
    body: "Our own ASN and network infrastructure.",
    tag: "NET",
    layer: "Network",
    detail: `${brand.asn} · BGP`,
    explain: `Traffic leaves over our own network, ${brand.asn}. We control the routing, so there's no reseller in between.`,
  },
  {
    icon: SlidersHorizontal,
    title: "Flexible Infrastructure",
    body: "Choose hardware, bandwidth and locations based on your requirements.",
    tag: "CFG",
    layer: "Configuration",
    detail: "CPU · RAM · Port · Location",
    explain: "Hardware, bandwidth and location are matched to your requirements instead of a fixed bundle.",
  },
  {
    icon: Headset,
    title: "Human Support",
    body: "Real infrastructure-focused support when you need it.",
    tag: "OPS",
    layer: "Support",
    detail: "Infrastructure engineers",
    explain: "When something needs attention, you talk to the people who run the hardware and the network.",
  },
];

const STEP_MS = 3600;
const ROW = 56; // row height in px (h-14)
const GAP = 8; // gap between rows in px (gap-2)
const ease = [0.22, 1, 0.36, 1] as const;

/** Animated "one team, every layer" diagram explaining why Offerhost. */
function StackDiagram({ step, onSelect, running }: { step: number; onSelect: (i: number) => void; running: boolean }) {
  const reduce = useReducedMotion();
  const active = reasons[step];

  return (
    <Reveal delay={0.1} className="ticks mt-10 rounded-[10px] border border-line bg-ink-900/60 p-5 sm:p-6">
      <div className="flex items-center justify-between font-mono text-[10.5px] tracking-[0.18em] text-subtle">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" />
          ONE TEAM · EVERY LAYER
        </span>
        <span>{String(step + 1).padStart(2, "0")} / 04</span>
      </div>

      <div className="mt-5 flex items-center gap-3 font-mono text-[11px] tracking-wide text-muted">
        <span className="rounded border border-line-strong px-2 py-1 text-fg/80">Your workload</span>
        <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
      </div>

      <div className="relative mt-3 pl-7">
        {/* Data path with a pulse flowing through every layer. */}
        <span className="absolute bottom-0 left-[9px] top-0 w-px overflow-hidden bg-line-strong" aria-hidden>
          {!reduce && <span className="absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-glow to-transparent" />}
        </span>
        {/* Packet that moves to the active layer. */}
        <motion.span
          aria-hidden
          className="absolute left-[5px] top-0 h-[9px] w-[9px] rounded-full bg-glow shadow-[0_0_14px_2px_rgb(56_214_255/0.7)]"
          animate={{ y: step * (ROW + GAP) + ROW / 2 - 4.5 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 20 }}
        />

        <ol className="flex flex-col gap-2">
          {reasons.map((r, i) => {
            const on = i === step;
            return (
              <li key={r.tag}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-pressed={on}
                  className="relative flex h-14 w-full items-center gap-3 rounded-md px-3 text-left"
                >
                  {on && (
                    <motion.span
                      layoutId="why-layer"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                      className="absolute inset-0 rounded-md border border-brand-400/60 bg-brand-500/[0.09] shadow-[0_10px_40px_-20px_rgb(42_109_255/0.8)]"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative grid h-8 w-8 shrink-0 place-items-center rounded border transition-colors duration-300",
                      on ? "border-brand-400/70 text-glow" : "border-line text-brand-400/70",
                    )}
                  >
                    <r.icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className={cn("block text-[14px] font-medium transition-colors", on ? "text-white" : "text-fg/70")}>
                      {r.layer}
                    </span>
                    <span className="block truncate font-mono text-[11px] tracking-wide text-subtle">{r.detail}</span>
                  </span>
                  <span
                    className={cn(
                      "relative font-mono text-[10px] tracking-[0.18em] transition-colors",
                      on ? "text-ok" : "text-subtle",
                    )}
                  >
                    {on ? "ACTIVE" : r.tag}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-3 flex items-center gap-3 font-mono text-[11px] tracking-wide text-muted">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line-strong" />
        <span className="flex items-center gap-1.5 rounded border border-line-strong px-2 py-1 text-fg/80">
          <Globe2 className="h-3.5 w-3.5 text-brand-400" />
          Internet
        </span>
      </div>

      <div className="mt-5 min-h-[72px] border-t border-line pt-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
            className="text-[14.5px] leading-relaxed text-fg/85"
          >
            <span className="font-medium text-white">{active.layer}: </span>
            {active.explain}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {reasons.map((r, i) => (
          <span key={r.tag} className="h-0.5 flex-1 overflow-hidden rounded-full bg-line-strong">
            {i < step && <span className="block h-full w-full bg-brand-400/60" />}
            {i === step && (
              <motion.span
                key={`${step}-${running}`}
                className="block h-full bg-brand-400"
                initial={{ width: running && !reduce ? "0%" : "100%" }}
                animate={{ width: "100%" }}
                transition={{ duration: running && !reduce ? STEP_MS / 1000 : 0, ease: "linear" }}
              />
            )}
          </span>
        ))}
      </div>
    </Reveal>
  );
}

export function WhyOfferhost() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const reduce = useReducedMotion();
  const running = inView && !paused && !reduce;

  // Walk through the layers while the section is on screen; hover/focus pauses it.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % reasons.length), STEP_MS);
    return () => clearTimeout(t);
  }, [running, step]);

  return (
    <section ref={ref} id="why" aria-labelledby="why-title" className="relative scroll-mt-24 py-24 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div
            className="lg:sticky lg:top-32 lg:self-start"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <SectionHeading
              id="why-title"
              eyebrow="Why Offerhost"
              title="Why Offerhost?"
              description="Infrastructure built and operated by a team that runs its own network — so the hardware, the routing and the support all come from one place."
            />
            <StackDiagram step={step} onSelect={setStep} running={running} />
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:self-center" onMouseLeave={() => setPaused(false)}>
            {reasons.map((r, i) => {
              const on = i === step;
              return (
                <li key={r.title}>
                  <Reveal
                    delay={i * 0.08}
                    y={28}
                    onMouseEnter={() => {
                      setPaused(true);
                      setStep(i);
                    }}
                    className={cn(
                      "ticks group relative h-full overflow-hidden rounded-[10px] border p-7 transition-[border-color,background-color,box-shadow] duration-500 sm:p-8",
                      on
                        ? "border-brand-400/50 bg-ink-850 shadow-[0_24px_60px_-30px_rgb(42_109_255/0.6)]"
                        : "border-line bg-ink-900/70 hover:border-line-strong",
                    )}
                  >
                    {/* Soft glow that follows the active card. */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl transition-opacity duration-700",
                        on ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="relative flex items-center justify-between">
                      <motion.span
                        animate={on && !reduce ? { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease }}
                        className={cn(
                          "grid h-12 w-12 place-items-center rounded-md border bg-brand-500/10 transition-colors duration-300",
                          on ? "border-brand-400/60 text-glow" : "border-line-strong text-brand-400",
                        )}
                      >
                        <r.icon className="h-6 w-6" strokeWidth={1.5} />
                      </motion.span>
                      <span
                        className={cn(
                          "font-mono text-[10px] tracking-[0.2em] transition-colors",
                          on ? "text-brand-300" : "text-subtle",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")} / {r.tag}
                      </span>
                    </div>
                    <h3 className="relative mt-8 text-xl font-semibold tracking-tight text-white">{r.title}</h3>
                    <p className="relative mt-2 text-[14.5px] leading-relaxed text-muted">{r.body}</p>
                    <span
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-brand-500 via-glow to-transparent transition-transform duration-700",
                        on ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
