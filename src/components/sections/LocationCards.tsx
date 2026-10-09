"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import type { DottedMapData } from "@/lib/maps";
import type { Location } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Flag } from "@/components/ui/Flag";

export type LocationCardData = Location & { map: DottedMapData };

const ease = [0.22, 1, 0.36, 1] as const;

/** Per-dot distance from the pin (or map centre), 0–1, used to light the map up in a wave. */
function waveDistances(map: DottedMapData, pin?: { x: number; y: number }) {
  const ox = pin?.x ?? map.width / 2;
  const oy = pin?.y ?? map.height / 2;
  const d = map.dots.map(([x, y]) => Math.hypot(x - ox, y - oy));
  const max = Math.max(...d, 1);
  return d.map((v) => v / max);
}

function LocationMap({ card, active, reduce }: { card: LocationCardData; active: boolean; reduce: boolean }) {
  const pin = card.map.pins[card.id];
  const dist = useMemo(() => waveDistances(card.map, pin), [card.map, pin]);

  return (
    <svg viewBox={`0 0 ${card.map.width} ${card.map.height}`} className="h-full w-auto max-w-full" aria-hidden="true">
      <g>
        {card.map.dots.map(([x, y], i) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={0.28}
            // Selecting a card ripples the highlight outward from the city; hover gets a quicker ripple.
            style={{ transitionDelay: reduce ? "0s" : `${dist[i] * (active ? 0.55 : 0.18)}s` }}
            className={cn(
              "transition-[fill] duration-500",
              active ? "fill-brand-400/75" : "fill-brand-300/25 group-hover:fill-brand-300/45",
            )}
          />
        ))}
      </g>
      {pin && (
        <g>
          {active &&
            !reduce &&
            [0, 1.2].map((begin) => (
              <circle key={begin} cx={pin.x} cy={pin.y} r={0.7} fill="none" stroke="#38d6ff" strokeWidth={0.25}>
                <animate attributeName="r" values="0.7;4" dur="2.4s" begin={`${begin}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2.4s" begin={`${begin}s`} repeatCount="indefinite" />
              </circle>
            ))}
          <circle cx={pin.x} cy={pin.y} r={1.6} fill="#38d6ff" opacity={active ? 0.25 : 0} />
          <circle
            cx={pin.x}
            cy={pin.y}
            r={0.7}
            fill={active ? "#e6f6ff" : "#4d8dff"}
            className={cn(!active && !reduce && "animate-blink")}
          />
        </g>
      )}
    </svg>
  );
}

export function LocationCards({ cards }: { cards: LocationCardData[] }) {
  const [selected, setSelected] = useState(cards[0]?.id);
  const current = cards.find((c) => c.id === selected);
  const reduce = useReducedMotion() ?? false;

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Deployment location"
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {cards.map((card, i) => {
          const active = card.id === selected;
          return (
            <motion.button
              key={card.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(card.id)}
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduce ? undefined : { y: -4 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className={cn(
                "group relative flex flex-col rounded-[8px] border p-4 text-left transition-[border-color,background-color] duration-300",
                i === cards.length - 1 && "col-span-2 sm:col-span-1",
                active ? "border-transparent" : "border-line bg-ink-900/70 hover:border-line-strong hover:bg-ink-850",
              )}
            >
              {/* Selection highlight glides between cards. */}
              {active && (
                <motion.span
                  layoutId="location-highlight"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px] border border-brand-400/80 bg-brand-500/[0.08] shadow-[0_0_0_1px_rgb(42_109_255/0.35),0_18px_50px_-24px_rgb(42_109_255/0.7)]"
                  aria-hidden
                >
                  {!reduce && (
                    <span className="absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-brand-400/[0.10] to-transparent" />
                  )}
                </motion.span>
              )}

              <div className="relative flex items-center justify-between">
                <Flag code={card.id} />
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border transition-colors",
                    active ? "border-brand-400 bg-brand-500 text-white" : "border-line-strong text-transparent",
                  )}
                >
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.span
                        initial={reduce ? false : { scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </div>

              <div className="relative my-3 flex h-20 items-center justify-center">
                <LocationMap card={card} active={active} reduce={reduce} />
              </div>

              <span className="relative text-[14px] font-semibold text-fg">{card.name}</span>
              <span className="relative mt-0.5 flex items-center gap-1 font-mono text-[11px] tracking-wide text-subtle">
                <MapPin className={cn("h-3 w-3 transition-colors", active && "text-brand-300")} />
                {card.city}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-4 flex font-mono text-[12px] tracking-wide text-muted">
        <span className="text-subtle">Selected region:</span>&nbsp;
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current?.id}
            initial={reduce ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.22, ease }}
            className="text-fg"
          >
            {current?.id === "more"
              ? "Additional locations are available on request"
              : `${current?.name} · ${current?.city}`}
          </motion.span>
        </AnimatePresence>
      </p>
    </>
  );
}
