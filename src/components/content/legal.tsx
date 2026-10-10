import Link from "next/link";
import { FileWarning } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { F, Tbc } from "@/components/ui/Tbc";
import { company, contact, legal } from "@/lib/facts";

/** Registered company name, or a marker until confirmed. */
export function Co() {
  return <F v={company.legalName} label="Company legal name" />;
}

export function Email({ k, label }: { k: "salesEmail" | "supportEmail" | "abuseEmail" | "privacyEmail"; label?: string }) {
  const v = contact[k];
  return v ? <a href={`mailto:${v}`}>{v}</a> : <Tbc label={label ?? `${k.replace("Email", "")} email`} />;
}

export function Address() {
  const a = company.address;
  return (
    <>
      <F v={a.street} label="Street" />, <F v={a.postcode} label="Postcode" /> <F v={a.city} label="City" />,{" "}
      <F v={a.country} label="Country" />
    </>
  );
}

export const legalPages = [
  { href: "/legal/terms/", title: "Terms of Service" },
  { href: "/legal/privacy/", title: "Privacy Policy" },
  { href: "/legal/aup/", title: "Acceptable Use Policy" },
  { href: "/legal/sla/", title: "Service Level Agreement" },
  { href: "/legal/refunds/", title: "Refunds & Cancellation" },
  { href: "/legal/imprint/", title: "Imprint" },
];

export function LegalPage({ title, description, current, children }: { title: string; description: string; current: string; children: React.ReactNode }) {
  return (
    <PageShell
      eyebrow="Legal"
      title={title}
      description={description}
      heroExtra={
        <div className="mt-6 space-y-3">
          {legal.draft && (
            <p className="flex max-w-2xl items-start gap-3 rounded-md border border-amber-300/40 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
              <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
              Draft — this document is pending legal review and is not yet in force.
            </p>
          )}
          <p className="font-mono text-[12px] text-subtle">
            Last updated: <F v={legal.lastUpdated} />
          </p>
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Legal documents" className="lg:sticky lg:top-32 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {legalPages.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={p.href === current ? "page" : undefined}
                  className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${p.href === current ? "bg-brand-500/15 text-white" : "text-muted hover:text-white"}`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="prose-doc">{children}</article>
      </div>
    </PageShell>
  );
}
