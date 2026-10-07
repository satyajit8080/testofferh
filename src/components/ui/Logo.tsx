import Link from "next/link";
import { brand } from "@/lib/site";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <path
        d="M23.6 9.6A10 10 0 1 0 26 16"
        fill="none"
        stroke="var(--color-brand-500)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M16 16 L23.6 9.6" stroke="var(--color-glow)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.6" fill="var(--color-fg)" />
      <circle cx="24.4" cy="8.9" r="2.4" fill="var(--color-glow)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${brand.name} home`} className={cn("group flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[20deg]" />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-[0.18em] text-fg">{brand.wordmark}</span>
        <span className="mt-1 whitespace-nowrap font-mono text-[8.5px] tracking-[0.28em] text-brand-400">{brand.tagline}</span>
      </span>
    </Link>
  );
}
