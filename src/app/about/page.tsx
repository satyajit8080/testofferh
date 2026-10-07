import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FinalCta } from "@/components/sections/FinalCta";
import { WhyOfferhost } from "@/components/sections/WhyOfferhost";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { brand, contact, locations } from "@/lib/site";

const title = "About Offerhost | Dedicated Servers & Network (AS208220)";
const description = `Offerhost provides dedicated servers on its own network, ${brand.asn}, registered with ${brand.rir}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about/" },
  openGraph: { title, description, url: "/about/" },
  twitter: { title, description },
};

const facts = [
  { label: "Company", value: contact.company.legalName || brand.name },
  { label: "Network", value: brand.networkTitle },
  { label: "Autonomous System", value: brand.asn },
  { label: "Regional Internet Registry", value: brand.rir },
  { label: "Locations", value: locations.filter((l) => l.pin).map((l) => l.city).join(" · ") },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          id="about-title"
          eyebrow="Company"
          title="About Offerhost"
          description="We provide dedicated servers on a network we run ourselves. The hardware, the routing and the support come from one team."
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact/" size="lg" arrow className="w-full sm:w-auto">
              Contact Us
            </Button>
            <Button href="/network/" size="lg" variant="secondary" className="w-full sm:w-auto">
              Our Network
            </Button>
          </div>
        </PageHero>

        <section aria-labelledby="facts-title" className="pb-8">
          <Container>
            <Reveal className="glass ticks rounded-[12px] p-6 sm:p-8">
              <h2 id="facts-title" className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
                At a glance
              </h2>
              <dl className="mt-5 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
                {facts.map((f) => (
                  <div key={f.label} className="bg-ink-900/90 px-4 py-4">
                    <dt className="text-[12px] text-subtle">{f.label}</dt>
                    <dd className="mt-1 text-[14px] font-medium text-fg">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {contact.company.address && <address className="mt-5 whitespace-pre-line text-[13px] not-italic text-muted">{contact.company.address}</address>}
            </Reveal>
          </Container>
        </section>

        <WhyOfferhost />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
