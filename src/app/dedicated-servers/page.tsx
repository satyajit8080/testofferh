import type { Metadata } from "next";
import { Cpu, Network, SlidersHorizontal, Waypoints } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FinalCta } from "@/components/sections/FinalCta";
import { LocationSelector } from "@/components/sections/LocationSelector";
import { PlanCatalog } from "@/components/sections/PlanCatalog";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand, serverPlans } from "@/lib/site";

const title = "Dedicated Servers in Amsterdam | Offerhost (AS208220)";
const description =
  "AMD Ryzen dedicated servers with NVMe storage and 1 Gbps connectivity on the Offerhost network (AS208220). Compare plans and configure your server.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/dedicated-servers/" },
  openGraph: { title, description, url: "/dedicated-servers/" },
  twitter: { title, description },
};

const included = [
  { icon: Waypoints, title: `On ${brand.asn}`, body: "Every server is connected to our own network, routed with BGP." },
  { icon: Network, title: "IPv4 & IPv6", body: "IP addressing on our network. Additional IPs available on request." },
  { icon: Cpu, title: "Dedicated hardware", body: "The whole machine is yours: no shared CPU, memory or disks." },
  { icon: SlidersHorizontal, title: "Custom builds", body: "Need different CPU, memory, storage or location? Ask for a quote." },
];

export default function DedicatedServersPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          id="ds-title"
          eyebrow="Dedicated Servers"
          title="Dedicated Servers on Our Own Network"
          description="AMD Ryzen servers with NVMe storage, connected to the Offerhost Global Network. Pick a plan, or tell us what you need and we'll build it."
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#plans" size="lg" arrow className="w-full sm:w-auto">
              View Plans
            </Button>
            <Button href="/contact/?topic=sales" size="lg" variant="secondary" className="w-full sm:w-auto">
              Request a Custom Build
            </Button>
          </div>
        </PageHero>

        <section id="plans" aria-label="Server plans" className="scroll-mt-24 pb-24">
          <Container>
            <PlanCatalog initial={serverPlans} />
          </Container>
        </section>

        <section aria-labelledby="included-title" className="border-y border-line bg-ink-900 py-20 sm:py-24">
          <Container>
            <SectionHeading id="included-title" eyebrow="Every Server" title="What You Get" />
            <ul className="mt-12 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {included.map((c, i) => (
                <li key={c.title} className="bg-ink-900">
                  <Reveal delay={i * 0.06} className="group h-full p-6 transition-colors hover:bg-ink-850">
                    <c.icon className="h-5 w-5 text-brand-400 transition-colors group-hover:text-glow" strokeWidth={1.6} />
                    <h3 className="mt-4 text-[15px] font-semibold text-fg">{c.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{c.body}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section aria-label="Locations" className="pb-8">
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
