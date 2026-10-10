import { cn } from "@/lib/cn";

/** Visible marker for a business fact that has not been confirmed yet (see src/lib/facts.ts). */
export function Tbc({ label = "To confirm", className }: { label?: string; className?: string }) {
  return (
    <span
      title="Not yet confirmed by Offerhost — see src/lib/facts.ts"
      className={cn(
        "inline-flex items-center rounded-[4px] border border-dashed border-amber-300/50 bg-amber-300/[0.07] px-1.5 py-px align-baseline font-mono text-[0.78em] tracking-wide text-amber-200",
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Renders a fact, or the "To confirm" marker when it is null. */
export function F<T>({ v, fmt, label }: { v: T | null | undefined; fmt?: (v: T) => React.ReactNode; label?: string }) {
  if (v === null || v === undefined) return <Tbc label={label} />;
  return <>{fmt ? fmt(v) : String(v)}</>;
}
