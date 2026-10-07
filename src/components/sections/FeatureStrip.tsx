"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { NetworkGlyph, PulseGlyph, RackGlyph, ThroughputGlyph } from "@/components/visuals/FeatureGlyphs";
import { brand, locations } from "@/lib/site";
import { cn } from "@/lib/cn";

const locationCount = locations.filter((l) => l.countries).length;

type Feature = {
  glyph: () => React.ReactElement;
  title: string;
  body: string;
  /** Short monospace status line; `clock` renders a live UTC clock. */
  status: string | "clock";
};

const features: Feature[] = [
  {
    glyph: RackGlyph,
    title: "Premium Data Centers",
    body: "Enterprise-grade infrastructure in strategically selected locations.",
    status: `${locationCount} regions · online`,
  },
  {
    glyph: NetworkGlyph,
    title: "Own ASN & Network",
    body: `Powered by Offerhost's own ${brand.asn} network infrastructure.`,
    status: `${brand.asn} · BGP`,
  },
  {
    glyph: ThroughputGlyph,
    title: "High-Speed Connectivity",
    body: "Premium transit, peering and high-performance network connectivity.",
    status: "Transit · Peering",
  },
  {
    glyph: PulseGlyph,
    title: "24/7 Infrastructure",
    body: "Continuous monitoring and infrastructure support.",
    status: "clock",
  },
];

const CYCLE_MS = 3200;

function UtcClock() {
  // Render a placeholder on the server, then tick on the client (avoids hydration mismatch).
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => new Date().toISOString().slice(11, 19);
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums">{now ?? "--:--:--"} UTC</span>;
}

export function FeatureStrip() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Highlight travels card to card; pauses while the visitor is hovering.
  useEffect(() => {
    if (reduce || hovering) return;
    const t = setInterval(() => setActive((a) => (a + 1) % features.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduce, hovering]);

  // Cursor spotlight, driven by CSS variables (no re-renders).
  const onMove = (e: React.MouseEvent) => {
    const el = listRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section aria-label="Platform highlights" className="relative overflow-hidden border-y border-line bg-ink-900/60">
      {/* Scanning light along the top edge */}
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-glow to-transparent"
          initial={{ left: "-35%" }}
          animate={{ left: "105%" }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
        />
      )}
      {/* Faint moving grid */}
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_40%,transparent)]"
      />

      <Container className="relative">
        <div ref={listRef} onMouseMove={onMove} onMouseLeave={() => setHovering(false)} className="group/list relative">
          {/* Cursor spotlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/list:opacity-100"
            style={{
              background:
                "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgb(42 109 255 / 0.10), transparent 70%)",
            }}
          />

          <ul className="relative grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {features.map((f, i) => {
            const on = active === i;
            const Glyph = f.glyph;
            return (
              <motion.li
                key={f.title}
                onMouseEnter={() => {
                  setHovering(true);
                  setActive(i);
                }}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative border-line sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(odd)]:border-r lg:border-b-0! lg:[&:not(:last-child)]:border-r"
              >
                {/* Active indicator slides between cards */}
                {on && (
                  <motion.span
                    layoutId="feature-active"
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-brand-500 via-glow to-brand-500 shadow-[0_0_18px_rgb(56_214_255/0.7)]"
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                    "relative flex h-full gap-4 px-1 py-7 transition-colors duration-500 sm:px-6 lg:py-9",
                    on && "bg-gradient-to-b from-brand-500/[0.07] to-transparent",
                  )}
                >
                  <div className="flex flex-col items-start gap-3">
                    <span
                      className={cn(
                        "font-mono text-[11px] tracking-widest transition-colors duration-500",
                        on ? "text-brand-400" : "text-subtle",
                      )}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className={cn(
                        "relative grid h-14 w-14 place-items-center rounded-md border bg-brand-500/10 text-brand-400 transition-[border-color,box-shadow,color] duration-500",
                        on
                          ? "border-brand-400/70 text-glow shadow-[0_0_0_1px_rgb(42_109_255/0.25),0_0_24px_-4px_rgb(56_214_255/0.55)]"
                          : "border-line-strong",
                      )}
                    >
                      <Glyph />
                    </span>
                  </div>
                  <div className="pt-6">
                    <h3 className="text-[15px] font-semibold text-fg">{f.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{f.body}</p>
                    <p className="mt-3 flex items-center gap-2 font-mono text-[10.5px] tracking-wider text-subtle">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inset-0 rounded-full bg-ok animate-pulse-ring" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
                      </span>
                      {f.status === "clock" ? <UtcClock /> : f.status}
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
