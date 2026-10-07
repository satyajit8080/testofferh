import { HISTORY_DAYS, statusMeta, type DayStatus } from "@/lib/status";
import { cn } from "@/lib/cn";

const barColor: Record<NonNullable<DayStatus>, string> = {
  operational: "bg-ok/80",
  maintenance: "bg-brand-400/80",
  degraded: "bg-amber-300/80",
  partial_outage: "bg-orange-400/80",
  major_outage: "bg-red-400/80",
};

/** Daily history strip. Days without recorded data are shown neutral — never assumed up. */
export function UptimeBars({ history = [], label }: { history?: DayStatus[]; label: string }) {
  // Right-align: the last entry is today.
  const days: DayStatus[] = [...Array(Math.max(0, HISTORY_DAYS - history.length)).fill(null), ...history.slice(-HISTORY_DAYS)];
  const recorded = days.filter((d) => d !== null);
  const up = recorded.filter((d) => d === "operational" || d === "maintenance").length;
  const pct = recorded.length ? `${((up / recorded.length) * 100).toFixed(2)}%` : "—";

  return (
    <div>
      <div
        role="img"
        aria-label={`${label}: ${recorded.length ? `${pct} of recorded days without incidents` : "no history recorded yet"}`}
        className="flex h-7 items-stretch gap-[2px]"
      >
        {days.map((d, i) => (
          <span
            key={i}
            title={d ? statusMeta[d].label : "No data"}
            className={cn(
              "flex-1 rounded-[1px] transition-opacity hover:opacity-70",
              d ? barColor[d] : "bg-white/[0.06]",
              // Thin the strip on small screens: show the last 45 days only.
              i < HISTORY_DAYS - 45 && "hidden sm:block",
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[10.5px] tracking-wide text-subtle">
        <span>
          <span className="sm:hidden">45</span>
          <span className="hidden sm:inline">{HISTORY_DAYS}</span> days ago
        </span>
        <span className="hidden h-px flex-1 bg-line mx-3 sm:block" />
        <span>{recorded.length ? `${pct} uptime` : "No history yet"}</span>
        <span className="hidden h-px flex-1 bg-line mx-3 sm:block" />
        <span>Today</span>
      </div>
    </div>
  );
}
