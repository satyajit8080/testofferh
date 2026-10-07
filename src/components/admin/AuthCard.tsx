"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AuthCard({ icon, eyebrow, title, description, children }: { icon: React.ReactNode; eyebrow: string; title: string; description?: React.ReactNode; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass ticks rounded-[12px] p-6 sm:p-8"
    >
      <span className="grid h-11 w-11 place-items-center rounded-md border border-brand-400/50 bg-brand-500/10 text-glow shadow-[0_0_20px_-6px_rgb(56_214_255/0.55)]">
        {icon}
      </span>
      <p className="eyebrow mt-6">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">{title}</h1>
      {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-7">{children}</div>
    </motion.div>
  );
}
