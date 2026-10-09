import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { brand } from "@/lib/site";

/** Hero for inner pages: grid + blue glow (same treatment as /status/ and /contact/). */
export function PageHero({
  id,
  eyebrow,
  title,
  description,
  aside,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  /** Optional visual shown to the right on large screens. */
  aside?: React.ReactNode;
  /** Optional actions under the description. */
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="relative isolate overflow-hidden pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <Container className={aside ? "grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : undefined}>
        <Reveal className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-brand-400" />
            {eyebrow}
          </p>
          <h1 id={id} className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-[56px] lg:leading-[1.04]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">{description}</p>
          {children ?? (
            <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-line bg-ink-950/50 px-3 py-1.5 font-mono text-[11px] tracking-wider text-fg/80">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              {brand.asn} · {brand.rir}
            </p>
          )}
        </Reveal>
        {aside && (
          <Reveal delay={0.12} className="w-full">
            {aside}
          </Reveal>
        )}
      </Container>
    </section>
  );
}
