"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ExternalLink, Inbox, LayoutDashboard, LogOut, Menu, ScrollText, Server, ShieldCheck, UserCog, Users, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Spinner } from "@/components/admin/ui";
import { api, setCsrf, type Role, type User } from "@/lib/admin/api";
import { brand } from "@/lib/site";
import { cn } from "@/lib/cn";

type Ctx = { user: User; setUser: (u: User) => void };
const AdminContext = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminShell");
  return ctx;
}

const nav: { href: string; label: string; icon: typeof Inbox; roles?: Role[] }[] = [
  { href: "/admin/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/messages/", label: "Messages", icon: Inbox },
  { href: "/admin/plans/", label: "Server plans", icon: Server },
  { href: "/admin/status/", label: "Status page", icon: Activity },
  { href: "/admin/users/", label: "Users", icon: Users, roles: ["admin"] },
  { href: "/admin/audit/", label: "Audit log", icon: ScrollText, roles: ["admin"] },
  { href: "/admin/account/", label: "My account", icon: UserCog },
];

function toLogin(extra = "") {
  const next = window.location.pathname + window.location.search;
  window.location.replace(`/admin/login/?next=${encodeURIComponent(next)}${extra}`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    api<{ user: User; csrf: string }>("auth.php", { params: { action: "me" } })
      .then((r) => {
        setCsrf(r.csrf);
        setUser(r.user);
      })
      .catch(() => toLogin());
    const onUnauthorized = () => toLogin("&expired=1");
    window.addEventListener("oh:unauthorized", onUnauthorized);
    return () => window.removeEventListener("oh:unauthorized", onUnauthorized);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const signOut = useCallback(async () => {
    try {
      await api("auth.php", { method: "POST", params: { action: "logout" } });
    } finally {
      window.location.replace("/admin/login/");
    }
  }, []);

  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  const items = nav.filter((n) => !n.roles || n.roles.includes(user.role));
  const isActive = (href: string) => (href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href.replace(/\/$/, "")));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
      </div>
      <p className="mx-5 mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-line px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-brand-400">
        <ShieldCheck className="h-3 w-3" />
        ADMIN PANEL
      </p>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors",
                    active ? "bg-brand-500/[0.12] text-white" : "text-fg/75 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-glow shadow-[0_0_10px_rgb(56_214_255/0.8)]" />}
                  <Icon className={cn("h-[18px] w-[18px] transition-colors", active ? "text-glow" : "text-brand-400 group-hover:text-glow")} strokeWidth={1.6} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong bg-brand-500/10 text-[13px] font-semibold text-brand-300">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium text-fg">{user.name}</p>
            <p className="truncate font-mono text-[10.5px] uppercase tracking-wider text-subtle">{user.role}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/" className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-line text-[12.5px] text-fg/80 transition-colors hover:border-line-strong hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" />
            View site
          </Link>
          <button type="button" onClick={signOut} className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-line text-[12.5px] text-fg/80 transition-colors hover:border-red-400/50 hover:text-red-300">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-wider text-subtle">
          {brand.asn} · {brand.rir}
        </p>
      </div>
    </div>
  );

  return (
    <AdminContext.Provider value={{ user, setUser }}>
      <div className="min-h-dvh lg:pl-64">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-ink-950/90 backdrop-blur-xl lg:block">{sidebar}</aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ink-950/80 px-4 backdrop-blur-xl lg:hidden">
          <Logo />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-fg transition-colors hover:border-line-strong"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <motion.div className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)}>
              <motion.aside
                id="admin-menu"
                initial={reduce ? { opacity: 0 } : { x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { x: -40, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="h-full w-72 max-w-[85vw] border-r border-line bg-ink-950"
              >
                {sidebar}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative isolate">
          <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <main id="main" className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

/** Wrap admin-only pages so editors see a clear message (the API refuses them anyway). */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAdmin();
  if (user.role !== role) {
    return (
      <div className="rounded-[10px] border border-dashed border-line-strong px-6 py-14 text-center text-sm text-muted">
        This section is only available to admins.
      </div>
    );
  }
  return <>{children}</>;
}
