import Link from "next/link";
import { FactTable, PageShell, Panel } from "@/components/layout/PageShell";
import { ServerCard } from "@/components/sections/ServerCard";
import { F } from "@/components/ui/Tbc";
import { amsterdam, proof } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { resolvedPlans } from "@/lib/plans";
import { brand } from "@/lib/site";

export const metadata = pageMeta(
  "Dedicated Servers in Amsterdam",
  `Dedicated servers in Amsterdam, Netherlands on ${brand.asn}: Ryzen, 10 Gbps and storage servers, data centre details and network test tools.`,
  "/locations/amsterdam/",
);

export default function AmsterdamPage() {
  const plans = resolvedPlans.filter((p) => p.location === "nl");
  return (
    <PageShell
      eyebrow="Location · Netherlands"
      title="Dedicated Servers in Amsterdam"
      description="Amsterdam is one of Europe's largest internet exchange hubs, with short routes to users across Western Europe and the UK."
    >
      <div className="grid gap-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Data centre">
            <FactTable
              rows={[
                { label: "City", value: "Amsterdam, Netherlands" },
                { label: "Facility", value: <F v={amsterdam.facility} /> },
                { label: "Certifications", value: <F v={amsterdam.certifications} /> },
                { label: "Power", value: <F v={amsterdam.power} /> },
                { label: "Network", value: `${brand.networkTitle} (${brand.asn})` },
              ]}
            />
          </Panel>
          <Panel title="Test before you order">
            <div className="prose-doc">
              <ul>
                <li><a href={proof.lookingGlass}>Looking glass</a> — ping and traceroute from our routers.</li>
                <li>Test IP: <F v={amsterdam.testIp} /></li>
                <li><a href={proof.bgpTools}>{brand.asn} on bgp.tools</a> — upstreams and peers.</li>
                <li><Link href="/status/">Status page</Link> — incidents per location.</li>
              </ul>
            </div>
          </Panel>
        </div>
        <section aria-labelledby="ams-plans">
          <h2 id="ams-plans" className="text-2xl font-semibold tracking-tight text-white">Servers available in Amsterdam</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((p, i) => (
              <ServerCard key={p.id} plan={p} index={i % 4} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
