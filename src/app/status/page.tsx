import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ComponentGroupCard } from "@/components/status/ComponentGroupCard";
import { IncidentList, MaintenanceList } from "@/components/status/IncidentHistory";
import { StatusHero } from "@/components/status/StatusHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { componentGroups, statusMeta, type Status } from "@/lib/status";

const title = "System Status | Offerhost AS208220";
const description =
  "Current status of the Offerhost Global Network (AS208220), data center locations and customer services.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/status/" },
  openGraph: { title, description, url: "/status/" },
  twitter: { title, description },
};

// Build time (UTC) — the page is static, so this is when the status was last published.
const updatedAt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
}).format(new Date());

const legend: Status[] = ["operational", "degraded", "partial_outage", "major_outage", "maintenance"];

export default function StatusPage() {
  return (
    <>
      <Header />
      <main id="main">
        <StatusHero updatedAt={updatedAt} />

        <Container className="pb-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <Reveal className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Components</h2>
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10.5px] tracking-wide text-subtle">
                  {legend.map((s) => (
                    <li key={s} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-[1px] ${statusMeta[s].dot}`} />
                      {statusMeta[s].label}
                    </li>
                  ))}
                  <li className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[1px] bg-white/[0.12]" />
                    No data
                  </li>
                </ul>
              </Reveal>
              {componentGroups.map((g) => (
                <ComponentGroupCard key={g.id} group={g} />
              ))}
            </div>

            <aside className="space-y-10 lg:sticky lg:top-32 lg:self-start">
              <MaintenanceList />
              <IncidentList />
              <Reveal className="glass ticks rounded-[10px] p-6">
                <LifeBuoy className="h-6 w-6 text-brand-400" strokeWidth={1.5} />
                <h2 className="mt-4 text-base font-semibold text-white">Experiencing an issue?</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  If something isn&apos;t working and it&apos;s not listed here, our infrastructure team can help.
                </p>
                <Link
                  href="/contact/?topic=support"
                  className="group mt-5 flex h-10 items-center justify-center gap-2 rounded-[6px] bg-brand-500 text-sm font-medium text-white transition-colors hover:bg-brand-400"
                >
                  Contact Support
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Reveal>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
