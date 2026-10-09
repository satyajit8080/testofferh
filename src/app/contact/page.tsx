import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactFaq } from "@/components/contact/ContactFaq";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactLocations } from "@/components/contact/ContactLocations";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand } from "@/lib/site";

const title = "Contact Offerhost | Dedicated Servers & Network (AS208220)";
const description =
  "Contact the Offerhost team about dedicated servers in Amsterdam, Frankfurt, London and New York, ASN & IP space, technical support, billing or abuse reports for AS208220.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact/" },
  openGraph: { title, description, url: "/contact/" },
  twitter: { title, description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: title,
  description,
  about: { "@type": "Organization", name: brand.name, slogan: brand.description },
};

export default function ContactPage() {
  return (
    <>
      <a
        href="#contact-form"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to contact form
      </a>
      <Header />
      <main id="main">
        <ContactHero />

        <Container className="pb-20 sm:pb-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            <Reveal
              delay={0.08}
              id="contact-form"
              className="glass ticks relative scroll-mt-28 self-start rounded-[12px] p-5 sm:p-8"
              aria-labelledby="contact-form-title"
              role="region"
            >
              <div className="mb-7 flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-brand-400/50 bg-brand-500/10 text-glow shadow-[0_0_20px_-6px_rgb(56_214_255/0.55)]">
                  <MessageSquareText className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div>
                  <h2 id="contact-form-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Send us a message
                  </h2>
                  <p className="mt-1 text-sm text-muted">Tell us what you need and we&apos;ll route it to the right team.</p>
                </div>
              </div>
              <ContactForm />
            </Reveal>

            <aside aria-label="Other ways to reach us" className="lg:sticky lg:top-32 lg:self-start">
              <ContactChannels />
            </aside>
          </div>
        </Container>

        <ContactLocations />

        <section aria-labelledby="faq-title" className="py-20 sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <SectionHeading
              id="faq-title"
              eyebrow="FAQ"
              title="Before You Get in Touch"
              description="Quick answers to the questions we hear most. Can't find what you need? Send us a message."
            />
            <Reveal delay={0.08}>
              <ContactFaq />
            </Reveal>
          </Container>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
