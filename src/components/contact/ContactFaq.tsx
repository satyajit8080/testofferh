"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { contactFaq } from "@/lib/site";
import { cn } from "@/lib/cn";

export function ContactFaq() {
  const uid = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-ink-900/60">
      {contactFaq.map((item, i) => {
        const expanded = open === i;
        const panel = `${uid}-panel-${i}`;
        const button = `${uid}-button-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={button}
                type="button"
                aria-expanded={expanded}
                aria-controls={panel}
                onClick={() => setOpen(expanded ? null : i)}
                className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-fg transition-colors hover:bg-white/[0.02] hover:text-white sm:px-6"
              >
                {item.q}
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-[transform,border-color,color] duration-300",
                    expanded ? "rotate-45 border-brand-400/60 text-glow" : "border-line text-brand-400 group-hover:border-line-strong",
                  )}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={panel}
                  role="region"
                  aria-labelledby={button}
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted sm:px-6">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
