"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, Globe2, ShieldCheck, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/site";

const trust = [
  { icon: Waypoints, label: brand.asn },
  { icon: Globe2, label: brand.rir },
  { icon: ShieldCheck, label: "Premium Network" },
  { icon: Activity, label: "24/7 Infrastructure" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroCopy() {
  const reduce = useReducedMotion();
  const up = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease } };

  return (
    <div className="relative max-w-[640px]">
      <motion.p {...up(0.05)} className="eyebrow flex items-center gap-3">
        <span className="h-px w-8 bg-brand-400" />
        Global Infrastructure
      </motion.p>

      <motion.h1
        id="hero-title"
        {...up(0.12)}
        className="mt-6 text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-[52px] lg:text-[56px] xl:text-[64px]"
      >
        High-Performance Dedicated Servers <br className="hidden sm:block" />
        Built on Our{" "}
        <span className="relative whitespace-nowrap text-brand-400">
          Own Network
          <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-brand-400 via-glow to-transparent" />
        </span>
      </motion.h1>

      <motion.p {...up(0.22)} className="mt-6 max-w-[540px] text-[16px] leading-relaxed text-muted sm:text-[18px]">
        Enterprise dedicated servers, premium IP infrastructure, and high-performance connectivity from strategically
        located data centers.
      </motion.p>

      <motion.div {...up(0.32)} className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button href="#servers" size="lg" arrow className="w-full sm:w-auto">
          View Dedicated Servers
        </Button>
        <Button href="#network" size="lg" variant="secondary" className="w-full sm:w-auto">
          Explore Our Network
        </Button>
      </motion.div>

      <motion.ul
        {...up(0.42)}
        aria-label="Network credentials"
        className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-6 sm:flex sm:flex-wrap sm:gap-x-8"
      >
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-[13px] text-fg/85">
            <Icon className="h-4 w-4 text-brand-400" strokeWidth={1.75} />
            <span className={label === brand.asn ? "font-mono tracking-wide" : undefined}>{label}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
