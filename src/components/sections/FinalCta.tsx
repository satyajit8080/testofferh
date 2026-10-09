import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ServerAisle } from "@/components/visuals/ServerAisle";
import { brand } from "@/lib/site";

export function FinalCta() {
  return (
    <section id="contact" aria-labelledby="cta-title" className="relative scroll-mt-24 py-24 sm:py-28">
      <Container>
        <div className="ticks relative isolate overflow-hidden rounded-[14px] border border-line-strong">
          <ServerAisle idPrefix="cta" className="absolute inset-0 -z-10 h-full w-full opacity-70" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_50%,rgb(42_109_255/0.25),transparent_60%)]" />

          <Reveal className="max-w-2xl px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            <p className="eyebrow">{brand.network}</p>
            <h2 id="cta-title" className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
              Ready to Build on Better Infrastructure?
            </h2>
            <p className="mt-5 text-base text-muted sm:text-lg">
              Deploy powerful dedicated servers on the Offerhost global network.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/dedicated-servers/" size="lg" arrow className="w-full sm:w-auto">
                Explore Dedicated Servers
              </Button>
              <Button href="/contact/" size="lg" variant="secondary" className="w-full sm:w-auto">
                Talk to Our Team
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
