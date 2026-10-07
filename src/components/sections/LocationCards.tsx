"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import type { DottedMapData } from "@/lib/maps";
import type { Location } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Flag } from "@/components/ui/Flag";

export type LocationCardData = Location & { map: DottedMapData };

export function LocationCards({ cards }: { cards: LocationCardData[] }) {
  const [selected, setSelected] = useState(cards[0]?.id);
  const current = cards.find((c) => c.id === selected);

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Deployment location"
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {cards.map((card, i) => {
          const active = card.id === selected;
          const pin = card.map.pins[card.id];
          return (
            <motion.button
              key={card.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(card.id)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[8px] border p-4 text-left transition-[border-color,background,box-shadow] duration-300",
                i === cards.length - 1 && "col-span-2 sm:col-span-1",
                active
                  ? "border-brand-400/80 bg-brand-500/[0.08] shadow-[0_0_0_1px_rgb(42_109_255/0.35),0_18px_50px_-24px_rgb(42_109_255/0.7)]"
                  : "border-line bg-ink-900/70 hover:border-line-strong hover:bg-ink-850",
              )}
            >
              <div className="flex items-center justify-between">
                <Flag code={card.id} />
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border transition-colors",
                    active ? "border-brand-400 bg-brand-500 text-white" : "border-line-strong text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              </div>

              <div className="relative my-3 flex h-20 items-center justify-center">
                <svg
                  viewBox={`0 0 ${card.map.width} ${card.map.height}`}
                  className={cn(
                    "h-full w-auto max-w-full transition-colors duration-300",
                    active ? "text-brand-400/70" : "text-brand-300/25 group-hover:text-brand-300/40",
                  )}
                  aria-hidden="true"
                >
                  <g fill="currentColor">
                    {card.map.dots.map(([x, y]) => (
                      <circle key={`${x}-${y}`} cx={x} cy={y} r={0.28} />
                    ))}
                  </g>
                  {pin && (
                    <g>
                      <circle cx={pin.x} cy={pin.y} r={1.6} fill="#38d6ff" opacity={active ? 0.25 : 0}>
                        {active && <animate attributeName="r" values="0.8;2.4;0.8" dur="2.4s" repeatCount="indefinite" />}
                      </circle>
                      <circle cx={pin.x} cy={pin.y} r={0.7} fill={active ? "#e6f6ff" : "#4d8dff"} />
                    </g>
                  )}
                </svg>
              </div>

              <span className="text-[14px] font-semibold text-fg">{card.name}</span>
              <span className="mt-0.5 flex items-center gap-1 font-mono text-[11px] tracking-wide text-subtle">
                <MapPin className="h-3 w-3" />
                {card.city}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-4 font-mono text-[12px] tracking-wide text-muted">
        <span className="text-subtle">Selected region:</span>{" "}
        <span className="text-fg">
          {current?.id === "more"
            ? "Additional locations are available on request"
            : `${current?.name} · ${current?.city}`}
        </span>
      </p>
    </>
  );
}
