import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { networkStats } from "@/lib/site";

export function NetworkStats() {
  return (
    <section id="stats" aria-label="Network statistics" className="relative scroll-mt-24 border-y border-line bg-ink-900">
      <Container>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {networkStats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.06}
              className="flex flex-col-reverse gap-2 border-line px-2 py-10 sm:px-8 [&:nth-child(odd)]:border-r lg:[&:not(:last-child)]:border-r [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0"
            >
              <dt className="text-[13px] text-muted">{s.label}</dt>
              <dd className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {s.value}
              </dd>
            </Reveal>
          ))}
        </dl>
        <p className="border-t border-line py-3 text-center font-mono text-[10.5px] tracking-wide text-subtle">
          Indicative figures for information only — not a contractual service level.
        </p>
      </Container>
    </section>
  );
}
