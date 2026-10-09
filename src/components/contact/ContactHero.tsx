import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { DotMap } from "@/components/visuals/DotMap";
import { buildDottedMap } from "@/lib/maps";
import { brand, networkNodes } from "@/lib/site";

export function ContactHero() {
  const world = buildDottedMap(
    { height: 50, grid: "diagonal", region: { lat: { min: 20, max: 66 }, lng: { min: -100, max: 40 } } },
    networkNodes,
  );

  return (
    <section aria-labelledby="contact-title" className="relative isolate overflow-hidden pb-12 pt-32 sm:pb-16 sm:pt-40">
      <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      {/* Decorative points-of-presence map, faded behind the copy on large screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6%] top-24 -z-10 hidden w-[58%] max-w-[860px] opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)] lg:block"
      >
        <DotMap map={world} radius={0.2} className="h-auto w-full text-brand-300/[0.2]">
          {networkNodes.map((n) => {
            const p = world.pins[n.id];
            if (!p) return null;
            return (
              <g key={n.id}>
                <circle cx={p.x} cy={p.y} r={0.8} fill="var(--color-glow)" className="animate-blink" opacity={0.3} />
                <circle cx={p.x} cy={p.y} r={0.32} fill="var(--color-glow)" />
              </g>
            );
          })}
        </DotMap>
      </div>

      <Container>
        <Reveal className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-brand-400" />
            Contact
          </p>
          <h1 id="contact-title" className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-[56px] lg:leading-[1.04]">
            Talk to Our Infrastructure Team
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Questions about dedicated servers, IP space or the {brand.networkTitle}? Send us a message and the right
            team will get back to you.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-line bg-ink-950/50 px-3 py-1.5 font-mono text-[11px] tracking-wider text-fg/80">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {brand.asn} · {brand.rir}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
