import Link from "next/link";
import { ArrowUpRight, Activity, FileCheck2, Radar, Route, Search } from "lucide-react";
import { PageShell, Panel } from "@/components/layout/PageShell";
import { Tbc } from "@/components/ui/Tbc";
import { proof } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { asnInfo, brand } from "@/lib/site";

export const metadata = pageMeta(
  `Network & Proof — ${brand.asn}`,
  `Verify the Offerhost network yourself: ${brand.asn} on bgp.tools, RIPEstat and Hurricane Electric, our looking glass, status history and SLA.`,
  "/network/",
);

const tools = [
  { href: proof.bgpTools, name: "bgp.tools", body: `Upstreams, peers, prefixes and RPKI status for ${brand.asn}.`, icon: Route },
  { href: proof.lookingGlass, name: "Looking Glass", body: "Run ping, traceroute and BGP route lookups from our own routers.", icon: Search },
  { href: proof.ripestat, name: "RIPEstat", body: "Registry data, routing history and visibility from RIPE NCC.", icon: Radar },
  { href: proof.heBgp, name: "Hurricane Electric BGP Toolkit", body: "Independent view of announced prefixes and peers.", icon: Route },
];

export default function NetworkPage() {
  return (
    <PageShell
      eyebrow="Network & Proof"
      title={`Don't take our word for it. Check ${brand.asn}.`}
      description="Everything below is public and independent of us: look up our routing, test our network from our own routers, and read our incident history."
    >
      <div className="grid gap-6">
        <ul className="grid gap-4 sm:grid-cols-2">
          {tools.map(({ href, name, body, icon: Icon }) => (
            <li key={name}>
              <a href={href} target="_blank" rel="noopener" className="group flex h-full flex-col rounded-[10px] border border-line bg-ink-900/70 p-6 transition-colors hover:border-brand-400/50">
                <span className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-brand-400" strokeWidth={1.5} />
                  <ArrowUpRight className="h-4 w-4 text-subtle transition-colors group-hover:text-white" />
                </span>
                <span className="mt-4 text-base font-semibold text-white">{name}</span>
                <span className="mt-1 text-sm text-muted">{body}</span>
                <span className="mt-3 font-mono text-[11px] text-subtle">{href.replace("https://", "")}</span>
              </a>
            </li>
          ))}
          <li>
            <div className="flex h-full flex-col rounded-[10px] border border-line bg-ink-900/70 p-6">
              <Route className="h-6 w-6 text-brand-400" strokeWidth={1.5} />
              <span className="mt-4 text-base font-semibold text-white">PeeringDB</span>
              {proof.peeringDb ? (
                <a href={proof.peeringDb} target="_blank" rel="noopener" className="mt-1 text-sm text-brand-300 underline">
                  View our PeeringDB record
                </a>
              ) : (
                <span className="mt-2 text-sm">
                  <Tbc label="PeeringDB record to add" />
                </span>
              )}
            </div>
          </li>
        </ul>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title={<span className="flex items-center gap-2"><Activity className="h-5 w-5 text-brand-400" /> Status & incident history</span>}>
            <p className="text-sm text-muted">Live component status, past incidents and scheduled maintenance. Subscribe by RSS to get every update.</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/status/" className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-400">Open status page</Link>
              <a href="/status/feed.xml" className="rounded-md border border-line-strong px-4 py-2 text-fg hover:border-brand-400/60">RSS feed</a>
            </div>
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-brand-400" /> SLA with credits</span>}>
            <p className="text-sm text-muted">Network availability commitment, hardware replacement time and the service credit you receive when we miss it.</p>
            <div className="mt-4 text-sm">
              <Link href="/legal/sla/" className="rounded-md border border-line-strong px-4 py-2 text-fg hover:border-brand-400/60">Read the SLA</Link>
            </div>
          </Panel>
        </div>

        <Panel title="Registry details">
          <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
            {asnInfo.rows.map((r) => (
              <div key={r.label} className="bg-ink-900 px-4 py-3">
                <dt className="text-[12px] text-subtle">{r.label}</dt>
                <dd className="mt-1 font-mono text-sm text-fg">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted">
            Announced prefixes are listed live on <a href={proof.bgpTools} className="text-brand-300 underline">bgp.tools</a>.
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}
