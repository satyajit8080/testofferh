import { statusMeta, type Status } from "@/lib/status";
import { cn } from "@/lib/cn";

export function StatusDot({ status, pulse, className }: { status: Status; pulse?: boolean; className?: string }) {
  const { dot } = statusMeta[status];
  return (
    <span className={cn("relative flex h-2 w-2 shrink-0", className)}>
      {pulse && <span className={cn("absolute inset-0 rounded-full animate-pulse-ring", dot)} />}
      <span className={cn("relative h-2 w-2 rounded-full", dot)} />
    </span>
  );
}

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const { label, tone } = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider",
        tone,
        className,
      )}
    >
      <StatusDot status={status} pulse={status !== "operational"} className="h-1.5 w-1.5 [&>span]:h-1.5 [&>span]:w-1.5" />
      {label}
    </span>
  );
}
