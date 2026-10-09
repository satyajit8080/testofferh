"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown, Loader2, Send } from "lucide-react";
import { contact, contactTopics, serverPlans, type ContactTopic } from "@/lib/site";
import { cn } from "@/lib/cn";

type Fields = {
  name: string;
  email: string;
  company: string;
  topic: ContactTopic | "";
  plan: string;
  message: string;
  /** Honeypot — real visitors never see or fill this. */
  website: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const empty: Fields = { name: "", email: "", company: "", topic: "", plan: "", message: "", website: "" };

const MAX = { name: 100, email: 200, company: 120, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Fields): FieldErrors {
  const e: FieldErrors = {};
  if (!f.name.trim()) e.name = "Please enter your name.";
  else if (f.name.length > MAX.name) e.name = `Name must be ${MAX.name} characters or fewer.`;
  if (!f.email.trim()) e.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(f.email.trim()) || f.email.length > MAX.email) e.email = "Please enter a valid email address.";
  if (f.company.length > MAX.company) e.company = `Company must be ${MAX.company} characters or fewer.`;
  if (!f.topic) e.topic = "Please choose a topic.";
  if (f.message.trim().length < 10) e.message = "Please tell us a little more (at least 10 characters).";
  else if (f.message.length > MAX.message) e.message = `Message must be ${MAX.message} characters or fewer.`;
  return e;
}

const isTopic = (v: string | null): v is ContactTopic => contactTopics.some((t) => t.value === v);

const control =
  "w-full rounded-[6px] border bg-ink-950/60 px-3.5 text-[14px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:outline-none disabled:opacity-60";
const controlOk = "border-line-strong hover:border-brand-400/40 focus:border-brand-400 focus:shadow-[0_0_0_3px_rgb(42_109_255/0.25)]";
const controlBad = "border-red-400/60 focus:border-red-400 focus:shadow-[0_0_0_3px_rgb(248_113_113/0.2)]";

export function ContactForm() {
  const uid = useId();
  const reduce = useReducedMotion();
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Static export: read ?plan= / ?topic= on the client (useSearchParams would need a Suspense boundary).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const topic = params.get("topic");
    const next: Partial<Fields> = {};
    if (plan && serverPlans.some((p) => p.id === plan)) {
      next.plan = plan;
      next.topic = "sales";
    }
    if (isTopic(topic)) next.topic = topic;
    if (Object.keys(next).length) setFields((f) => ({ ...f, ...next }));
  }, []);

  const id = (k: keyof Fields) => `${uid}-${k}`;

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...fields, [k]: e.target.value };
    setFields(next);
    // Re-validate live once a field has been touched, so errors clear as soon as they're fixed.
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
    if (status === "error") setStatus("idle");
  };

  const blur = (k: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(fields)[k] }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const found = validate(fields);
    setErrors(found);
    setTouched({ name: true, email: true, company: true, topic: true, message: true });
    const firstBad = (Object.keys(found) as (keyof Fields)[])[0];
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstBad))}`)?.focus();
      return;
    }

    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch(contact.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({ ...fields, name: fields.name.trim(), email: fields.email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: FieldErrors } | null;
      if (res.ok && data?.ok) {
        setStatus("success");
        setFields(empty);
        setTouched({});
        return;
      }
      if (data?.fields) setErrors(data.fields);
      setServerError(data?.error ?? "We couldn't send your message. Please try again in a moment.");
      setStatus("error");
    } catch {
      setServerError("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const busy = status === "submitting";
  const fallbackEmail = contact.sales.email || contact.support.email;

  const label = (k: keyof Fields, text: string, required?: boolean) => (
    <label htmlFor={id(k)} className="mb-2 flex items-center gap-1 text-[13px] font-medium text-fg/90">
      {text}
      {required ? (
        <span aria-hidden="true" className="text-brand-400">
          *
        </span>
      ) : (
        <span className="font-mono text-[10.5px] tracking-wide text-subtle">(optional)</span>
      )}
    </label>
  );

  const error = (k: keyof Fields) => (
    <AnimatePresence initial={false}>
      {errors[k] && (
        <motion.p
          id={`${id(k)}-error`}
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <span className="flex items-center gap-1.5 pt-1.5 text-[12.5px] text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors[k]}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );

  const aria = (k: keyof Fields, required?: boolean) => ({
    id: id(k),
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id(k)}-error` : undefined,
    "aria-required": required || undefined,
    disabled: busy,
  });

  if (status === "success") {
    return (
      <motion.div
        role="status"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[420px] flex-col items-center justify-center px-2 py-10 text-center"
      >
        <span className="relative grid h-14 w-14 place-items-center rounded-full border border-ok/30 bg-ok/10">
          <span className="absolute inset-0 rounded-full bg-ok/20 animate-pulse-ring" />
          <CheckCircle2 className="relative h-7 w-7 text-ok" strokeWidth={1.6} />
        </span>
        <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Thanks for getting in touch. Our team will reply to the email address you provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-[6px] border border-line-strong px-4 text-sm text-fg transition-colors hover:border-brand-400/70 hover:bg-brand-500/10"
        >
          Send another message
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-busy={busy} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("name", "Name", true)}
          <input
            {...aria("name", true)}
            type="text"
            autoComplete="name"
            maxLength={MAX.name}
            value={fields.name}
            onChange={set("name")}
            onBlur={blur("name")}
            placeholder="Jane Doe"
            className={cn(control, "h-11", errors.name ? controlBad : controlOk)}
          />
          {error("name")}
        </div>
        <div>
          {label("email", "Email", true)}
          <input
            {...aria("email", true)}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={MAX.email}
            value={fields.email}
            onChange={set("email")}
            onBlur={blur("email")}
            placeholder="you@company.com"
            className={cn(control, "h-11", errors.email ? controlBad : controlOk)}
          />
          {error("email")}
        </div>
      </div>

      <div>
        {label("company", "Company")}
        <input
          {...aria("company")}
          type="text"
          autoComplete="organization"
          maxLength={MAX.company}
          value={fields.company}
          onChange={set("company")}
          onBlur={blur("company")}
          className={cn(control, "h-11", errors.company ? controlBad : controlOk)}
        />
        {error("company")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("topic", "Topic", true)}
          <div className="relative">
            <select
              {...aria("topic", true)}
              value={fields.topic}
              onChange={set("topic")}
              onBlur={blur("topic")}
              className={cn(control, "h-11 appearance-none pr-10", !fields.topic && "text-subtle", errors.topic ? controlBad : controlOk)}
            >
              <option value="" disabled>
                Choose a topic…
              </option>
              {contactTopics.map((t) => (
                <option key={t.value} value={t.value} className="bg-ink-900 text-fg">
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          </div>
          {error("topic")}
        </div>
        <div>
          {label("plan", "Server plan of interest")}
          <div className="relative">
            <select
              {...aria("plan")}
              value={fields.plan}
              onChange={set("plan")}
              className={cn(control, "h-11 appearance-none pr-10", !fields.plan && "text-subtle", controlOk)}
            >
              <option value="" className="bg-ink-900 text-fg">
                No specific plan
              </option>
              {serverPlans.map((p) => (
                <option key={p.id} value={p.id} className="bg-ink-900 text-fg">
                  {p.name} · €{p.price}/mo
                </option>
              ))}
              <option value="custom" className="bg-ink-900 text-fg">
                Custom configuration
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          </div>
        </div>
      </div>

      <div>
        {label("message", "Message", true)}
        <textarea
          {...aria("message", true)}
          rows={6}
          maxLength={MAX.message}
          value={fields.message}
          onChange={set("message")}
          onBlur={blur("message")}
          placeholder="Tell us about your workload, location, bandwidth and IP requirements…"
          className={cn(control, "block min-h-[150px] resize-y py-3 leading-relaxed", errors.message ? controlBad : controlOk)}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{error("message")}</div>
          <span className="shrink-0 pt-1.5 font-mono text-[10.5px] tabular-nums text-subtle">
            {fields.message.length}/{MAX.message}
          </span>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" value={fields.website} onChange={set("website")} />
      </div>

      <AnimatePresence initial={false}>
        {status === "error" && serverError && (
          <motion.div
            role="alert"
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 rounded-[6px] border border-red-400/30 bg-red-400/10 px-3.5 py-3 text-[13px] text-red-300"
          >
            <AlertCircle className="mt-px h-4 w-4 shrink-0 text-red-400" />
            <span>
              {serverError}
              {fallbackEmail && (
                <>
                  {" "}
                  You can also email us at{" "}
                  <a href={`mailto:${fallbackEmail}`} className="text-fg underline underline-offset-2 hover:text-white">
                    {fallbackEmail}
                  </a>
                  .
                </>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-subtle">
          Fields marked <span className="text-brand-400">*</span> are required. We only use your details to reply to this
          request.
        </p>
        <button
          type="submit"
          disabled={busy}
          className={cn(
            "group relative inline-flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[6px] border border-brand-400/60 bg-brand-500 px-6 text-sm font-medium text-white transition-all duration-200",
            "shadow-[0_0_0_1px_rgb(42_109_255/0.25),0_10px_30px_-10px_rgb(42_109_255/0.8)]",
            "hover:bg-brand-400 hover:shadow-[0_0_0_1px_rgb(77_141_255/0.5),0_14px_40px_-10px_rgb(56_214_255/0.55)]",
            "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand-500",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
