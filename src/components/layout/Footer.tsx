import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { brand, footerColumns } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-950">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] lg:gap-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">{brand.description}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 font-mono text-[11px] tracking-wider text-fg/80">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {brand.asn} · {brand.rir}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-4">
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-fg/80 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-[12.5px] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Offerhost. All rights reserved.</p>
          <p className="font-mono tracking-wider">{brand.network}</p>
        </Container>
      </div>
    </footer>
  );
}
