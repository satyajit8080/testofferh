import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buildDottedMap } from "@/lib/maps";
import { brand, networkNodes } from "@/lib/site";
import { StatusHeroBody } from "./StatusHeroBody";

export function StatusHero() {
  const world = buildDottedMap(
    { height: 50, grid: "diagonal", region: { lat: { min: 20, max: 66 }, lng: { min: -100, max: 40 } } },
    networkNodes,
  );

  return (
    <section aria-labelledby="status-title" className="relative isolate overflow-hidden pb-12 pt-32 sm:pt-40">
      <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <Container>
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-brand-400" />
            Network Status
          </p>
          <h1 id="status-title" className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Offerhost System Status
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Current operational status of the {brand.networkTitle} ({brand.asn}), our data center locations and customer
            services.
          </p>
        </Reveal>

        <StatusHeroBody world={world} />
      </Container>
    </section>
  );
}
