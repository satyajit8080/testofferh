"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShieldCheck, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { brand, clientArea, mainNav } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Hint cookie set by the admin API at sign-in. It only shows a link; access is checked server-side.
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    setIsStaff(/(?:^|;\s*)oh_staff=1(?:;|$)/.test(document.cookie));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; close it on desktop resize.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  // "/" or Ctrl/⌘+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
          scrolled || menuOpen
            ? "border-b border-line bg-ink-950/75 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-ink-950/70 to-transparent",
        )}
      >
        <div className="hidden border-b border-line/60 bg-ink-950/40 sm:block">
          <Container className="flex h-8 items-center justify-between font-mono text-[11px] tracking-wider text-subtle">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              {brand.network} · {brand.asn} · {brand.rir}
            </span>
            <span className="flex items-center gap-4">
              <span className="hidden md:inline">Amsterdam · Frankfurt · London · New York</span>
              <Link href="/status/" className="text-fg/70 transition-colors hover:text-white">
                System Status →
              </Link>
              {isStaff && (
                <Link href="/admin/" className="flex items-center gap-1 text-brand-400 transition-colors hover:text-glow">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </Link>
              )}
            </span>
          </Container>
        </div>

        <Container className="flex h-16 items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="relative rounded-md px-3.5 py-2 text-[14px] text-fg/80 transition-colors hover:text-white after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-brand-400 after:transition-transform after:duration-300 hover:after:scale-x-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-md text-fg/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <a
              href={clientArea.login}
              className="hidden px-3 text-[14px] text-fg/80 transition-colors hover:text-white sm:inline"
            >
              Login
            </a>
            <span className="hidden sm:inline-flex">
              <Button href={clientArea.register} size="sm" native>
                Get Started
              </Button>
            </span>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-md border border-line text-fg transition-colors hover:border-line-strong lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-line bg-ink-950 lg:hidden"
            >
              <Container className="flex h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto py-4 sm:h-[calc(100dvh-6rem)]">
                {mainNav.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b border-line py-3.5 text-[17px] text-fg"
                    >
                      {item.label}
                      <span className="font-mono text-[11px] text-subtle">0{i + 1}</span>
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button href={clientArea.login} variant="secondary" native>
                    Login
                  </Button>
                  <Button href={clientArea.register} native>
                    Get Started
                  </Button>
                </div>
                {isStaff && (
                  <Link href="/admin/" className="mt-3 flex items-center justify-center gap-2 rounded-[6px] border border-line py-2.5 text-sm text-fg/80">
                    <ShieldCheck className="h-4 w-4 text-brand-400" />
                    Admin panel
                  </Link>
                )}
                <p className="mt-4 font-mono text-[11px] tracking-wider text-subtle">
                  {brand.asn} · {brand.rir}
                </p>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
