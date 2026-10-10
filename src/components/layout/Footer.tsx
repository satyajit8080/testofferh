import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Tbc } from "@/components/ui/Tbc";
import { brand, footerColumns } from "@/lib/site";
import { company, proof } from "@/lib/facts";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-950">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] lg:gap-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">{brand.description}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 font-mono text-[11px] tracking-wider text-fg/80">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {brand.asn} · {brand.rir}
          </p>
          {(proof.trustpilot || proof.lowEndTalk) && (
            <p className="mt-4 flex gap-4 text-[13px]">
              {proof.trustpilot && <a href={proof.trustpilot} className="text-fg/80 hover:text-white">Trustpilot reviews</a>}
              {proof.lowEndTalk && <a href={proof.lowEndTalk} className="text-fg/80 hover:text-white">LowEndTalk</a>}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-5">
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("http") ? (
                      <a href={l.href} target="_blank" rel="noopener" className="text-sm text-fg/80 transition-colors hover:text-white">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-fg/80 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-[12.5px] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {company.legalName ?? <Tbc label="Company legal name" />} · Reg. no.{" "}
            {company.registrationNumber ?? <Tbc />} · VAT {company.vatId ?? <Tbc />} ·{" "}
            <Link href="/legal/imprint/" className="underline hover:text-fg">Imprint</Link>
          </p>
          <p className="font-mono tracking-wider">{brand.network}</p>
        </Container>
      </div>
    </footer>
  );
}
