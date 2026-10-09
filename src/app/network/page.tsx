import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FinalCta } from "@/components/sections/FinalCta";
import { NetworkSection } from "@/components/sections/NetworkSection";
import { NetworkStats } from "@/components/sections/NetworkStats";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { brand, networkNodes } from "@/lib/site";

const title = `Network | ${brand.networkTitle} (${brand.asn})`;
const description = `The ${brand.networkTitle}: BGP routing, premium transit, IPv4/IPv6 and DDoS protection across ${networkNodes.map((n) => n.name).join(", ")}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/network/" },
  openGraph: { title, description, url: "/network/" },
  twitter: { title, description },
};

export default function NetworkPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          id="network-page-title"
          eyebrow="Network"
          title={brand.networkTitle}
          description={`Our own autonomous system, ${brand.asn}, connecting ${networkNodes.map((n) => n.name).join(", ")}. We operate the routing, so your traffic doesn't depend on someone else's network decisions.`}
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/asn-ip/" size="lg" arrow className="w-full sm:w-auto">
              ASN & IP Details
            </Button>
            <Button href="/status/" size="lg" variant="secondary" className="w-full sm:w-auto">
              Network Status
            </Button>
          </div>
        </PageHero>

        <NetworkSection />
        <NetworkStats />

        <section aria-label="Status" className="pt-20">
          <Container>
            <Reveal>
              <Link href="/status/" className="glass ticks group flex flex-col gap-4 rounded-[12px] p-6 transition-colors hover:border-brand-400/40 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <span className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-brand-500/10 text-brand-400 transition-colors group-hover:text-glow">
                    <Activity className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold text-white">Current network status</span>
                    <span className="mt-1 block text-[14px] text-muted">Component status, incidents and scheduled maintenance.</span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-400 group-hover:text-glow">
                  View status page
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          </Container>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
