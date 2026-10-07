export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-ok">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-ok animate-pulse-ring" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
      </span>
      {label}
    </span>
  );
}
