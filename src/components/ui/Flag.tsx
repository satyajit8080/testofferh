import { Globe2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Inline SVG flags. Emoji flags don't render on Windows, so we draw our own
 * to keep the location selector consistent on every platform.
 */
export function Flag({ code, className }: { code: string; className?: string }) {
  const cls = cn("h-[15px] w-[22px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-white/15", className);

  switch (code) {
    case "nl":
      return (
        <svg viewBox="0 0 9 6" className={cls} aria-hidden="true">
          <rect width="9" height="2" fill="#AE1C28" />
          <rect y="2" width="9" height="2" fill="#fff" />
          <rect y="4" width="9" height="2" fill="#21468B" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 5 3" className={cls} aria-hidden="true">
          <rect width="5" height="1" fill="#000" />
          <rect y="1" width="5" height="1" fill="#DD0000" />
          <rect y="2" width="5" height="1" fill="#FFCE00" />
        </svg>
      );
    case "gb":
      return (
        <svg viewBox="0 0 60 30" className={cls} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <clipPath id="gb-t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#gb-t)" stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      );
    case "us":
      return (
        <svg viewBox="0 0 19 10" className={cls} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="19" height="10" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 10) / 13} width="19" height={10 / 13} fill="#B22234" />
          ))}
          <rect width="7.6" height={(10 * 7) / 13} fill="#3C3B6E" />
        </svg>
      );
    default:
      return <Globe2 className={cn("h-[18px] w-[18px] text-brand-400", className)} strokeWidth={1.6} aria-hidden="true" />;
  }
}
