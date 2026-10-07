import { HardDrive, Headset, SlidersHorizontal, Waypoints, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reasons: { icon: LucideIcon; title: string; body: string; tag: string }[] = [
  {
    icon: HardDrive,
    title: "Enterprise Hardware",
    body: "Reliable server hardware designed for continuous workloads.",
    tag: "HW",
  },
  {
    icon: Waypoints,
    title: "Network Control",
    body: "Our own ASN and network infrastructure.",
    tag: "NET",
  },
  {
    icon: SlidersHorizontal,
    title: "Flexible Infrastructure",
    body: "Choose hardware, bandwidth and locations based on your requirements.",
    tag: "CFG",
  },
  {
    icon: Headset,
    title: "Human Support",
    body: "Real infrastructure-focused support when you need it.",
    tag: "OPS",
  },
];

export function WhyOfferhost() {
  return (
    <section id="why" aria-labelledby="why-title" className="relative scroll-mt-24 py-24 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              id="why-title"
              eyebrow="Why Offerhost"
              title="Why Offerhost?"
              description="Infrastructure built and operated by a team that runs its own network — so the hardware, the routing and the support all come from one place."
            />
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <li key={r.title}>
                <Reveal
                  delay={i * 0.07}
                  className="ticks group relative h-full overflow-hidden rounded-[10px] border border-line bg-ink-900/70 p-7 transition-[border-color,background] duration-300 hover:border-brand-400/50 hover:bg-ink-850 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-md border border-line-strong bg-brand-500/10 text-brand-400 transition-colors group-hover:text-glow">
                      <r.icon className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-subtle">
                      {String(i + 1).padStart(2, "0")} / {r.tag}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-white">{r.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{r.body}</p>
                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-brand-500 via-glow to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
