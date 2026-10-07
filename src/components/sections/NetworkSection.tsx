import { GitFork, Network, ShieldCheck, Workflow, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DotMap } from "@/components/visuals/DotMap";
import { NetworkOverlay } from "@/components/visuals/NetworkOverlay";
import { buildDottedMap } from "@/lib/maps";
import { brand, networkLinks, networkNodes } from "@/lib/site";

const capabilities: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: GitFork, title: "BGP Routing", body: "Intelligent routing across multiple network paths." },
  { icon: Workflow, title: "Premium Transit", body: "High-quality upstream connectivity." },
  { icon: Network, title: "IP Infrastructure", body: "Reliable IPv4 and IPv6 infrastructure." },
  { icon: ShieldCheck, title: "DDoS Protection", body: "Network protection for critical workloads." },
];

const anchors: Record<string, "left" | "right" | "top" | "bottom"> = {
  ams: "top",
  fra: "right",
  lon: "left",
  nyc: "left",
};

export function NetworkSection() {
  // Crop to the northern hemisphere band where the network lives.
  const world = buildDottedMap(
    { height: 56, grid: "diagonal", region: { lat: { min: -40, max: 72 }, lng: { min: -140, max: 160 } } },
    networkNodes,
  );
  const unit = world.height / 60;

  return (
    <section
      id="network"
      aria-labelledby="network-title"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-ink-900 py-24 sm:py-28"
    >
      <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <Container className="relative">
        <SectionHeading
          id="network-title"
          align="center"
          eyebrow="Offerhost Network"
          title={
            <>
              Connected to the Internet.
              <br />
              <span className="text-brand-400">Built for Performance.</span>
            </>
          }
        />

        <Reveal className="relative mx-auto mt-14 max-w-[1180px]">
          <div className="relative overflow-hidden rounded-[12px] border border-line bg-ink-950/60 p-2 sm:p-6">
            <div className="-ml-[16%] -mr-[52%] sm:mx-0">
              <DotMap map={world} radius={0.2} className="h-auto w-full text-brand-300/[0.22]">
                <NetworkOverlay
                  idPrefix="net"
                  unit={unit * 1.15}
                  bend={0.28}
                  nodes={networkNodes.map((n) => ({
                    id: n.id,
                    label: n.name,
                    anchor: anchors[n.id],
                    ...world.pins[n.id],
                  }))}
                  links={networkLinks}
                />
              </DotMap>
            </div>

            {/* Center label */}
            <div className="pointer-events-none relative mb-2 mt-1 flex justify-center sm:absolute sm:inset-x-0 sm:top-[58%] sm:m-0">
              <div className="glass rounded-md px-4 py-2.5 text-center sm:px-6 sm:py-3.5">
                <p className="font-mono text-lg font-semibold tracking-wider text-white sm:text-2xl">{brand.asn}</p>
                <p className="mt-0.5 font-mono text-[9px] tracking-[0.24em] text-brand-400 sm:text-[11px]">
                  {brand.network}
                </p>
              </div>
            </div>

            <div className="absolute left-4 top-4 hidden items-center gap-2 font-mono text-[10px] tracking-widest text-subtle sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-glow" />
              POINTS OF PRESENCE
            </div>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c, i) => (
            <li key={c.title} className="bg-ink-900">
              <Reveal delay={i * 0.06} className="group h-full p-6 transition-colors hover:bg-ink-850">
                <c.icon className="h-5 w-5 text-brand-400 transition-colors group-hover:text-glow" strokeWidth={1.6} />
                <h3 className="mt-4 text-[15px] font-semibold text-fg">{c.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{c.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
