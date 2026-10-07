import { Activity, CalendarClock, Waypoints } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { DotMap } from "@/components/visuals/DotMap";
import { NetworkOverlay } from "@/components/visuals/NetworkOverlay";
import { buildDottedMap } from "@/lib/maps";
import { brand, networkLinks, networkNodes } from "@/lib/site";
import { findComponent, nodeComponent, overallStatus, statusMeta } from "@/lib/status";
import { StatusDot } from "./StatusPill";
import { cn } from "@/lib/cn";

const headline: Record<string, string> = {
  operational: "All Systems Operational",
  maintenance: "Scheduled Maintenance in Progress",
  degraded: "Some Systems Degraded",
  partial_outage: "Partial Service Outage",
  major_outage: "Major Service Outage",
};

const anchors: Record<string, "left" | "right" | "top" | "bottom"> = { ams: "top", fra: "right", lon: "left", nyc: "left" };

export function StatusHero({ updatedAt }: { updatedAt: string }) {
  const overall = overallStatus();
  const world = buildDottedMap(
    { height: 50, grid: "diagonal", region: { lat: { min: 20, max: 66 }, lng: { min: -100, max: 40 } } },
    networkNodes,
  );
  const unit = (world.height / 60) * 1.2;

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

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Overall status */}
          <Reveal
            delay={0.08}
            className={cn(
              "glass ticks flex flex-col justify-between rounded-[12px] p-6 sm:p-8",
              overall === "operational" && "shadow-[0_0_0_1px_rgb(47_212_122/0.18),0_30px_80px_-40px_rgb(47_212_122/0.45)]",
            )}
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-white/[0.03]">
                  <StatusDot status={overall} pulse className="h-3 w-3 [&>span]:h-3 [&>span]:w-3" />
                </span>
                <span className={cn("font-mono text-[11px] uppercase tracking-[0.2em]", statusMeta[overall].tone.split(" ")[0])}>
                  {statusMeta[overall].label}
                </span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-[32px]">{headline[overall]}</h2>
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
              {[
                { icon: Waypoints, label: "ASN", value: brand.asn },
                { icon: Activity, label: "Monitoring", value: "24/7" },
                { icon: CalendarClock, label: "Last updated", value: updatedAt },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-ink-900/90 px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-[11px] text-subtle">
                    <Icon className="h-3.5 w-3.5 text-brand-400" />
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-[13px] text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Points of presence map */}
          <Reveal delay={0.14} className="relative overflow-hidden rounded-[12px] border border-line bg-ink-950/60 p-3 sm:p-5">
            <p className="absolute left-4 top-4 z-10 flex items-center gap-2 font-mono text-[10px] tracking-widest text-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-glow" />
              POINTS OF PRESENCE
            </p>
            <DotMap map={world} radius={0.2} className="mt-6 h-auto w-full text-brand-300/[0.22]">
              <NetworkOverlay
                idPrefix="status"
                unit={unit}
                bend={0.28}
                nodes={networkNodes.map((n) => ({
                  id: n.id,
                  label: n.name,
                  sub: statusMeta[findComponent(nodeComponent[n.id])?.status ?? "operational"].label.toUpperCase(),
                  anchor: anchors[n.id],
                  ...world.pins[n.id],
                }))}
                links={networkLinks}
              />
            </DotMap>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
