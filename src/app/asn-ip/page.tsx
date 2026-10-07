import type { Metadata } from "next";
import { ArrowUpRight, FileSearch, Globe2, Network, ShieldAlert, Waypoints } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AsnCard } from "@/components/sections/AsnCard";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { asnInfo, brand } from "@/lib/site";

const title = `ASN & IP Information | ${brand.asn} · Offerhost`;
const description = `${brand.asn} (${brand.networkTitle}) is registered with ${brand.rir}. Routing, IPv4/IPv6 and how to request IP space or report abuse.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/asn-ip/" },
  openGraph: { title, description, url: "/asn-ip/" },
  twitter: { title, description },
};

const asNumber = brand.asn.replace(/^AS/i, "");

/** Independent public sources anyone can use to verify our routing data. */
const lookups = [
  { name: "RIPE Database", desc: "Registration record for the AS number", href: `https://apps.db.ripe.net/db-web-ui/query?searchtext=${brand.asn}` },
  { name: "Hurricane Electric BGP Toolkit", desc: "Announced prefixes and peers", href: `https://bgp.he.net/${brand.asn}` },
  { name: "bgp.tools", desc: "Live routing and upstream view", href: `https://bgp.tools/as/${asNumber}` },
  { name: "PeeringDB", desc: "Search peering and interconnection records", href: `https://www.peeringdb.com/search?q=${brand.asn}` },
];

const services = [
  { icon: Network, title: "IPv4 & IPv6 for servers", body: "Dedicated servers on our network get IP addressing from our own infrastructure." },
  { icon: Globe2, title: "Additional IP space", body: `Need more addresses? ${asnInfo.ipRanges}. Allocations follow ${brand.rir} policy and need a short justification.` },
  { icon: Waypoints, title: "BGP routing", body: "Traffic is routed with BGP across multiple upstream paths from our own autonomous system." },
];

export default function AsnIpPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          id="asn-title"
          eyebrow="ASN & IP"
          title={
            <>
              Our Network, <span className="text-brand-400">{brand.asn}</span>
            </>
          }
          description={`${brand.networkTitle} is our own autonomous system, registered with ${brand.rir}. Your servers are routed on infrastructure we operate ourselves.`}
          aside={<AsnCard showLink={false} />}
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact/?topic=network" size="lg" arrow className="w-full sm:w-auto">
              Request IP Space
            </Button>
            <Button href="/network/" size="lg" variant="secondary" className="w-full sm:w-auto">
              Explore the Network
            </Button>
          </div>
        </PageHero>

        <section aria-labelledby="ip-title" className="border-y border-line bg-ink-900 py-20 sm:py-24">
          <Container>
            <SectionHeading id="ip-title" eyebrow="IP Services" title="IP Addressing on Our Network" />
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {services.map((s, i) => (
                <li key={s.title}>
                  <Reveal delay={i * 0.07} className="ticks group h-full rounded-[10px] border border-line bg-ink-950/60 p-7 transition-colors hover:border-brand-400/50">
                    <span className="grid h-11 w-11 place-items-center rounded-md border border-line-strong bg-brand-500/10 text-brand-400 transition-colors group-hover:text-glow">
                      <s.icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section aria-labelledby="lookup-title" className="py-20 sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <SectionHeading
              id="lookup-title"
              eyebrow="Public Records"
              title="Verify Our Routing"
              description={`Our registration and routing data are public. Look up ${brand.asn} in these independent tools.`}
            />
            <ul className="divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-ink-900/60">
              {lookups.map((l, i) => (
                <li key={l.name}>
                  <Reveal delay={i * 0.05}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:px-6">
                      <FileSearch className="h-5 w-5 shrink-0 text-brand-400 transition-colors group-hover:text-glow" strokeWidth={1.6} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-fg group-hover:text-white">{l.name}</span>
                        <span className="block text-[13px] text-muted">{l.desc}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-400" />
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section aria-labelledby="abuse-title" className="pb-8">
          <Container>
            <Reveal className="glass ticks flex flex-col gap-6 rounded-[12px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-brand-500/10 text-brand-400">
                  <ShieldAlert className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div>
                  <h2 id="abuse-title" className="text-lg font-semibold text-white">
                    Abuse from {brand.asn}?
                  </h2>
                  <p className="mt-1 max-w-xl text-[14px] text-muted">
                    Report spam, attacks or other abuse from our network. Include IP addresses, timestamps with timezone, and logs.
                  </p>
                </div>
              </div>
              <Button href="/contact/?topic=abuse" variant="secondary" arrow className="w-full shrink-0 sm:w-auto">
                Report Abuse
              </Button>
            </Reveal>
          </Container>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
