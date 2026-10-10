import Link from "next/link";
import { FactTable, PageShell, Panel } from "@/components/layout/PageShell";
import { F } from "@/components/ui/Tbc";
import { ddos } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { brand } from "@/lib/site";

export const metadata = pageMeta(
  "DDoS Protection",
  "What DDoS protection is included with Offerhost servers, who filters the traffic, mitigation capacity and when an IP is null-routed.",
  "/ddos/",
);

export default function DdosPage() {
  return (
    <PageShell
      eyebrow="Network Security"
      title="DDoS Protection"
      description={`What is included, who filters the traffic before it reaches ${brand.asn}, and exactly when an IP gets null-routed. Every number on this page is confirmed in writing by the provider that does the filtering.`}
    >
      <div className="grid gap-6">
        <Panel title="At a glance">
          <FactTable
            rows={[
              { label: "Included with every server", value: <F v={ddos.includedInAllPlans} fmt={(v) => (v ? "Yes, at no extra cost" : "No — see upgrade below")} /> },
              { label: "Who filters", value: <F v={ddos.filteringProvider} /> },
              { label: "Where filtering happens", value: <F v={ddos.filteringPoint} /> },
              { label: "Total mitigation capacity", value: <F v={ddos.capacity} /> },
              { label: "Mitigation per IP", value: <F v={ddos.perIpLimit} /> },
              { label: "Mode", value: <F v={ddos.mode} /> },
              { label: "Time to mitigate", value: <F v={ddos.timeToMitigate} /> },
              { label: "Attack types covered", value: <F v={ddos.vectors} fmt={(v) => v.join(", ")} /> },
            ]}
          />
        </Panel>

        <Panel id="null-routing" title="When does an IP get null-routed?">
          <div className="prose-doc">
            <p>
              A null-route (blackhole) drops all traffic to one IP address at the upstream edge. It takes that IP offline, but keeps
              every other customer on the network reachable. It is the last resort, used only when an attack exceeds what can be
              filtered.
            </p>
            <ul>
              <li>Trigger: <F v={ddos.nullRouteTrigger} /></li>
              <li>Duration: <F v={ddos.nullRouteDuration} /></li>
              <li>Only the attacked IP is null-routed — other IPs on your server stay online.</li>
              <li>You are notified by email when a null-route starts and ends.</li>
            </ul>
            <p>
              Null-routing during an attack is excluded from the <Link href="/legal/sla/">SLA</Link> because it protects the network
              for everyone.
            </p>
          </div>
        </Panel>

        <Panel title="What it does not cover">
          <div className="prose-doc">
            <ul>
              <li>Application-layer (L7) attacks such as HTTP floods against your website. Use a reverse proxy or WAF in front of your application for those.</li>
              <li>Attacks that originate from your own server — those fall under the <Link href="/legal/aup/">Acceptable Use Policy</Link>.</li>
            </ul>
          </div>
        </Panel>

        <Panel title="Upgrade">
          <p className="text-sm text-fg/90">
            <F v={ddos.upgrade} label="Upgrade option to confirm" />
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}
