import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white border border-brand-400/60 shadow-[0_0_0_1px_rgb(42_109_255/0.25),0_10px_30px_-10px_rgb(42_109_255/0.8)] hover:bg-brand-400 hover:shadow-[0_0_0_1px_rgb(77_141_255/0.5),0_14px_40px_-10px_rgb(56_214_255/0.55)]",
  secondary:
    "bg-white/[0.03] text-fg border border-line-strong hover:border-brand-400/70 hover:bg-brand-500/10",
  ghost: "text-fg/90 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
};

export function Button({ href, children, variant = "primary", size = "md", arrow, className, onClick }: Props) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-[6px] font-medium tracking-tight transition-all duration-200",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </Link>
  );
}
