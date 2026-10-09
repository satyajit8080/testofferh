import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Globe2, MapPin } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FinalCta } from "@/components/sections/FinalCta";
import { LocationSelector } from "@/components/sections/LocationSelector";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Flag } from "@/components/ui/Flag";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand, locations, networkNodes } from "@/lib/site";

const sites = locations.filter((l) => l.pin);
const title = "Data Center Locations | Offerhost";
const description = `Offerhost infrastructure in ${sites.map((s) => s.city).join(", ")}, connected by our own network ${brand.asn}. More locations on request.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/data-centers/" },
  openGraph: { title, description, url: "/data-centers/" },
  twitter: { title, description },
};

export default function DataCentersPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          id="dc-title"
          eyebrow="Data Centers"
          title="Deploy Where You Need It"
          description={`Infrastructure in ${sites.map((s) => s.city).join(", ")}, all connected to the ${brand.networkTitle}. Need another region? Ask us.`}
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/dedicated-servers/" size="lg" arrow className="w-full sm:w-auto">
              View Servers
            </Button>
            <Button href="/contact/?topic=sales" size="lg" variant="secondary" className="w-full sm:w-auto">
              Ask About a Location
            </Button>
          </div>
        </PageHero>

        <section aria-labelledby="sites-title" className="pb-20">
          <Container>
            <SectionHeading id="sites-title" eyebrow="Locations" title="Our Sites" />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sites.map((s, i) => {
                const node = networkNodes.find((n) => n.name === s.city);
                return (
                  <li key={s.id}>
                    <Reveal delay={i * 0.06} className="ticks group h-full rounded-[10px] border border-line bg-ink-900/70 p-6 transition-colors hover:border-brand-400/50 hover:bg-ink-850">
                      <div className="flex items-center justify-between">
                        <Flag code={s.id} className="h-[18px] w-[27px]" />
                        {node && <span className="font-mono text-[12px] tracking-widest text-brand-400 group-hover:text-glow">{node.code}</span>}
                      </div>
                      <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">{s.city}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {s.name}
                      </p>
                      <p className="mt-4 border-t border-line pt-4 font-mono text-[11px] tracking-wider text-subtle">
                        {brand.asn} · Point of presence
                      </p>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
            <Reveal className="mt-4 flex flex-col gap-4 rounded-[10px] border border-dashed border-line-strong bg-white/[0.015] p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-3 text-[14px] text-muted">
                <Globe2 className="h-5 w-5 shrink-0 text-brand-400" strokeWidth={1.6} />
                More locations are available on request.
              </p>
              <Link href="/status/" className="inline-flex items-center gap-2 text-[13.5px] text-brand-400 transition-colors hover:text-glow">
                <Activity className="h-4 w-4" />
                Location status
              </Link>
            </Reveal>
          </Container>
        </section>

        <section aria-label="Choose a region" className="border-t border-line bg-ink-900 pb-24">
          <Container>
            <LocationSelector />
          </Container>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
