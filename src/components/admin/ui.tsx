"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronDown, Eye, EyeOff, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Form controls (same look as the public contact form)
// ---------------------------------------------------------------------------

const base =
  "w-full rounded-[6px] border bg-ink-950/60 px-3.5 text-[14px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:outline-none disabled:opacity-60";
const okCls = "border-line-strong hover:border-brand-400/40 focus:border-brand-400 focus:shadow-[0_0_0_3px_rgb(42_109_255/0.25)]";
const badCls = "border-red-400/60 focus:border-red-400 focus:shadow-[0_0_0_3px_rgb(248_113_113/0.2)]";

type FieldProps = { label: string; error?: string; hint?: React.ReactNode; optional?: boolean; className?: string; children: (id: string, describedBy?: string) => React.ReactNode };

export function Field({ label, error, hint, optional, className, children }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : "", hint ? hintId : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-center gap-1 text-[13px] font-medium text-fg/90">
        {label}
        {optional && <span className="font-mono text-[10.5px] tracking-wide text-subtle">(optional)</span>}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={hintId} className="pt-1.5 text-[12px] text-subtle">
          {hint}
        </p>
      )}
      <FieldError id={errId} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <span className="flex items-center gap-1.5 pt-1.5 text-[12.5px] text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {message}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className, ...rest }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(base, "h-11", invalid ? badCls : okCls, className)} {...rest} />;
});

export function PasswordInput({ invalid, className, ...rest }: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={cn(base, "h-11 pr-11", invalid ? badCls : okCls, className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-subtle transition-colors hover:text-fg"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function Select({ invalid, className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={cn(base, "h-11 appearance-none pr-10 [&>option]:bg-ink-900", invalid ? badCls : okCls, className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
    </div>
  );
}

export function Textarea({ invalid, className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={cn(base, "block min-h-[110px] resize-y py-3 leading-relaxed", invalid ? badCls : okCls, className)} {...rest} />;
}

export function Checkbox({ label, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer select-none items-center gap-2.5 text-[13.5px] text-fg/90", className)}>
      <input type="checkbox" className="peer sr-only" {...rest} />
      <span
        aria-hidden="true"
        className="grid h-[18px] w-[18px] place-items-center rounded-[4px] border border-line-strong bg-ink-950/60 transition-colors peer-checked:border-brand-400 peer-checked:bg-brand-500 peer-focus-visible:shadow-[0_0_0_3px_rgb(42_109_255/0.35)] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M2.5 6.2 5 8.5l4.5-5" />
        </svg>
      </span>
      {label}
    </label>
  );
}

/** Simple, dependency-free strength estimate (length + character variety). */
export function passwordScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (classes >= 3) score++;
  if (pw.length >= 20 || (classes === 4 && pw.length >= 14)) score++;
  if (pw.length < 12) score = Math.min(score, 1);
  if (new Set(pw).size < 5) score = 0;
  return Math.max(pw.length ? 1 : 0, score) as 0 | 1 | 2 | 3 | 4;
}

const strength = [
  { label: "", bar: "" },
  { label: "Too weak", bar: "bg-red-400" },
  { label: "Fair", bar: "bg-orange-400" },
  { label: "Good", bar: "bg-brand-400" },
  { label: "Strong", bar: "bg-ok" },
];

export function StrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  return (
    <div className="pt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full bg-white/[0.08] transition-colors duration-300", score >= i && strength[score].bar)} />
        ))}
      </div>
      <p className="mt-1.5 flex justify-between text-[12px] text-subtle">
        <span>At least 12 characters. A few random words work well.</span>
        {password && <span className="shrink-0 pl-3 text-fg/80">{strength[score].label}</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Btn({ variant = "secondary", size = "md", loading, icon, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-[6px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "h-8 px-3 text-[12.5px]" : "h-10 px-4 text-sm",
        variant === "primary" &&
          "border border-brand-400/60 bg-brand-500 text-white shadow-[0_0_0_1px_rgb(42_109_255/0.25),0_10px_30px_-12px_rgb(42_109_255/0.8)] hover:bg-brand-400 disabled:hover:bg-brand-500",
        variant === "secondary" && "border border-line-strong bg-white/[0.02] text-fg hover:border-brand-400/70 hover:bg-brand-500/10",
        variant === "danger" && "border border-red-400/40 text-red-300 hover:border-red-400/70 hover:bg-red-400/10",
        variant === "ghost" && "text-fg/80 hover:bg-white/5 hover:text-white",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : icon}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-[6px] border px-3.5 py-3 text-[13px]",
        tone === "error" && "border-red-400/30 bg-red-400/10 text-red-300",
        tone === "success" && "border-ok/30 bg-ok/10 text-ok",
        tone === "info" && "border-brand-400/30 bg-brand-500/10 text-brand-300",
      )}
    >
      <Icon className="mt-px h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "blue" | "ok" | "warn" | "bad"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] border px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-wider",
        tone === "neutral" && "border-line-strong text-muted",
        tone === "blue" && "border-brand-400/30 bg-brand-500/10 text-brand-300",
        tone === "ok" && "border-ok/30 bg-ok/10 text-ok",
        tone === "warn" && "border-amber-300/30 bg-amber-300/10 text-amber-300",
        tone === "bad" && "border-red-400/30 bg-red-400/10 text-red-400",
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin text-brand-400 motion-reduce:animate-none" />
      {label}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-line-strong bg-white/[0.015] px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-md border border-line bg-brand-500/10 text-brand-400">{icon}</span>
      <p className="mt-4 text-[15px] font-medium text-fg">{title}</p>
      {children && <div className="mt-1.5 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout pieces
// ---------------------------------------------------------------------------

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-6 bg-brand-400" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, ticks }: { className?: string; children: React.ReactNode; ticks?: boolean }) {
  return <div className={cn("glass relative rounded-[10px]", ticks && "ticks", className)}>{children}</div>;
}

/** Slide-over panel used for editing records. Traps nothing fancy, but closes on Escape and restores focus. */
export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("input,select,textarea,button")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex justify-end bg-ink-950/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full w-full max-w-xl flex-col border-l border-line-strong bg-ink-900 shadow-[0_0_80px_-20px_rgb(0_0_0/0.9)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <h2 id={titleId} className="truncate text-base font-semibold text-white">
                {title}
              </h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Two-step inline confirmation for destructive actions (no browser confirm()). */
export function ConfirmBtn({ onConfirm, children, confirmLabel = "Confirm", loading, size = "sm" }: { onConfirm: () => void; children: React.ReactNode; confirmLabel?: string; loading?: boolean; size?: "sm" | "md" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return armed ? (
    <Btn variant="danger" size={size} loading={loading} onClick={onConfirm}>
      {confirmLabel}
    </Btn>
  ) : (
    <Btn variant="ghost" size={size} onClick={() => setArmed(true)} className="text-red-300 hover:text-red-300">
      {children}
    </Btn>
  );
}

export function Pager({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3 text-[13px] text-muted">
      <span className="font-mono text-[12px]">
        Page {page} of {pages} · {total} total
      </span>
      <span className="flex gap-2">
        <Btn size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Btn>
        <Btn size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Btn>
      </span>
    </nav>
  );
}
