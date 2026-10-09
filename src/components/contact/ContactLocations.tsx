import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Flag } from "@/components/ui/Flag";
import { Reveal } from "@/components/ui/Reveal";
import { locations, networkNodes } from "@/lib/site";

export function ContactLocations() {
  const sites = locations.filter((l) => l.pin);

  return (
    <section aria-labelledby="contact-locations" className="border-y border-line bg-ink-900/40 py-12">
      <Container>
        <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Data Center Locations</p>
            <h2 id="contact-locations" className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Where We Operate
            </h2>
          </div>
          <p className="text-sm text-muted">More locations available on request.</p>
        </Reveal>

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {sites.map((loc, i) => {
            const code = networkNodes.find((n) => n.name === loc.city)?.code;
            return (
              <li key={loc.id}>
                <Reveal delay={i * 0.06} className="group flex h-full items-center gap-3 rounded-[8px] border border-line bg-ink-900/70 p-4 transition-[border-color,background] duration-300 hover:border-line-strong hover:bg-ink-850">
                  <Flag code={loc.id} />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-fg">{loc.city}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-[11px] tracking-wide text-subtle">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {loc.name}
                    </p>
                  </div>
                  {code && (
                    <span className="ml-auto hidden font-mono text-[11px] tracking-widest text-brand-400 transition-colors group-hover:text-glow sm:inline">
                      {code}
                    </span>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
