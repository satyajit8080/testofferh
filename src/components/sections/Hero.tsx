import { Container } from "@/components/ui/Container";
import { DotMap } from "@/components/visuals/DotMap";
import { NetworkOverlay } from "@/components/visuals/NetworkOverlay";
import { ServerAisle } from "@/components/visuals/ServerAisle";
import { buildDottedMap } from "@/lib/maps";
import { networkNodes } from "@/lib/site";
import { AsnCard } from "./AsnCard";
import { HeroCopy } from "./HeroCopy";

const heroNodes = networkNodes.filter((n) => n.id !== "nyc");
const anchors: Record<string, "left" | "right" | "top" | "bottom"> = { lon: "bottom", ams: "top", fra: "bottom" };

export function Hero() {
  const europe = buildDottedMap(
    { height: 44, grid: "diagonal", region: { lat: { min: 40, max: 60 }, lng: { min: -12, max: 22 } } },
    heroNodes,
  );
  const unit = (europe.height / 60) * 1.4;

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-24 sm:pt-32">
      {/* Visual layer: data-center aisle + European network map */}
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[72%]">
        <ServerAisle className="absolute inset-0 h-full w-full opacity-40 lg:opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-ink-950/10 lg:via-ink-950/30" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950 to-transparent" />

        <div className="absolute left-[8%] top-[14%] hidden w-[58%] max-w-[620px] text-brand-300/25 [mask-image:linear-gradient(to_right,transparent_5%,black_30%)] lg:block">
          <DotMap map={europe} radius={0.2} className="h-auto w-full">
            <NetworkOverlay
              idPrefix="hero"
              unit={unit}
              bend={0.35}
              nodes={heroNodes.map((n) => ({
                id: n.id,
                label: n.name,
                sub: n.code,
                anchor: anchors[n.id],
                ...europe.pins[n.id],
              }))}
              links={[
                ["lon", "ams"],
                ["ams", "fra"],
                ["lon", "fra"],
              ]}
            />
          </DotMap>
        </div>
      </div>
      <div className="bg-grid absolute inset-0 -z-20 opacity-60 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />

      <Container className="grid items-center gap-12 pb-16 pt-8 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 lg:pb-24 xl:grid-cols-[minmax(0,1fr)_420px]">
        <HeroCopy />
        <AsnCard className="lg:mt-24" />
      </Container>
    </section>
  );
}
