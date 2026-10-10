import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { proof, testimonials } from "@/lib/facts";

/** Named customer quotes. Renders nothing until real, permitted quotes are added to facts.ts. */
export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section id="customers" aria-labelledby="customers-title" className="relative scroll-mt-24 py-24 sm:py-28">
      <Container>
        <SectionHeading id="customers-title" eyebrow="Customers" title="What customers say" />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={t.name}>
              <Reveal delay={i * 0.06} className="flex h-full flex-col rounded-[10px] border border-line bg-ink-900/70 p-6">
                <blockquote className="flex-1 text-[15px] leading-relaxed text-fg/90">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="mt-5 text-sm font-semibold text-white">{t.name}</p>
                <p className="text-[13px] text-muted">
                  {t.role},{" "}
                  {t.url ? (
                    <a href={t.url} className="underline hover:text-white">
                      {t.company}
                    </a>
                  ) : (
                    t.company
                  )}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
        {(proof.trustpilot || proof.lowEndTalk) && (
          <p className="mt-8 flex flex-wrap gap-6 text-sm">
            {proof.trustpilot && <a href={proof.trustpilot} className="text-brand-300 underline">Read our reviews on Trustpilot</a>}
            {proof.lowEndTalk && <a href={proof.lowEndTalk} className="text-brand-300 underline">Offerhost on LowEndTalk</a>}
          </p>
        )}
      </Container>
    </section>
  );
}
