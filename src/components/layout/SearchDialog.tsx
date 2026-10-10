"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { brand, serverPlans } from "@/lib/site";
import { articles, useCases } from "@/lib/content";
import { cn } from "@/lib/cn";

type Entry = { label: string; hint: string; href: string };

// Site search over pages, plans, use cases and guides. "#" entries are homepage sections.
const entries: Entry[] = [
  { label: "Dedicated Servers — full specs", hint: "Servers", href: "/servers/" },
  ...serverPlans.map((p) => ({ label: p.name, hint: p.price === null ? "Price on request" : `€${p.price}/mo`, href: `/servers/#plan-${p.id}` })),
  { label: "Cart", hint: "Order", href: "/cart/" },
  { label: "DDoS Protection", hint: "Network", href: "/ddos/" },
  { label: `${brand.asn} — network, bgp.tools & looking glass`, hint: brand.rir, href: "/network/" },
  { label: "System status & incident history", hint: "Status", href: "/status/" },
  { label: "Features, add-ons & extra IP pricing", hint: "Features", href: "/features/" },
  { label: "Support, contact & FAQ", hint: "Support", href: "/support/" },
  { label: "Amsterdam data centre", hint: "Location", href: "/locations/amsterdam/" },
  ...useCases.map((u) => ({ label: u.title, hint: "Use case", href: `/use-cases/${u.slug}/` })),
  ...articles.map((a) => ({ label: a.title, hint: "Guide", href: `/kb/${a.slug}/` })),
  { label: "Service Level Agreement", hint: "Legal", href: "/legal/sla/" },
  { label: "Terms of Service", hint: "Legal", href: "/legal/terms/" },
  { label: "Privacy Policy", hint: "Legal", href: "/legal/privacy/" },
  { label: "Acceptable Use Policy & abuse", hint: "Legal", href: "/legal/aup/" },
  { label: "Refunds & cancellation", hint: "Legal", href: "/legal/refunds/" },
  { label: "Imprint — company details", hint: "Legal", href: "/legal/imprint/" },
  { label: "Data center locations", hint: "NL · DE · UK · US", href: "#locations" },
];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? entries.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(q)) : entries;
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const go = (entry?: Entry) => {
    if (!entry) return;
    onClose();
    if (!entry.href.startsWith("#")) {
      window.location.href = entry.href;
      return;
    }
    const target = document.querySelector(entry.href);
    // Sections live on the homepage; from other pages, navigate there instead.
    if (!target) {
      window.location.href = `/${entry.href}`;
      return;
    }
    window.history.pushState(null, "", entry.href);
    // Defer a tick so the closing overlay doesn't interfere with scrolling.
    setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-ink-950/70 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass w-full max-w-xl overflow-hidden rounded-lg"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter") {
                    go(results[active]);
                  }
                }}
                placeholder="Search servers, network, locations…"
                className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No results</li>}
              {results.map((r, i) => (
                <li key={r.label}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                      i === active ? "bg-brand-500/15 text-white" : "text-fg/85",
                    )}
                  >
                    <span>{r.label}</span>
                    <span className="flex items-center gap-2 font-mono text-[11px] text-subtle">
                      {r.hint}
                      {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-brand-400" />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
