import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FeatureStrip } from "@/components/sections/FeatureStrip";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { NetworkSection } from "@/components/sections/NetworkSection";
import { NetworkStats } from "@/components/sections/NetworkStats";
import { ServerPlans } from "@/components/sections/ServerPlans";
import { WhyOfferhost } from "@/components/sections/WhyOfferhost";
import { brand } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  description:
    "High-performance dedicated servers, premium network infrastructure and global connectivity powered by Offerhost AS208220.",
  slogan: brand.description,
};

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <FeatureStrip />
        <ServerPlans />
        <NetworkSection />
        <WhyOfferhost />
        <NetworkStats />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
