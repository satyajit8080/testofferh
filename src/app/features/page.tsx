import { CheckCircle2 } from "lucide-react";
import { PageShell, Panel } from "@/components/layout/PageShell";
import { F } from "@/components/ui/Tbc";
import { extras, ipPricing } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta(
  "Features & Add-ons",
  "Remote console, rescue system, OS auto-install, failover IPs, private VLAN, backup storage, API and the extra IP price list.",
  "/features/",
);

export default function FeaturesPage() {
  return (
    <PageShell eyebrow="Features & Add-ons" title="The tools you expect from a server provider." description="Manage your server without opening a ticket, and add the network and storage options you need.">
      <div className="grid gap-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {extras.map((x) => (
            <li key={x.id} id={x.id} className="flex scroll-mt-32 flex-col rounded-[10px] border border-line bg-ink-900/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-white">{x.name}</h2>
                {x.available === true && <CheckCircle2 className="h-5 w-5 shrink-0 text-ok" aria-label="Available" />}
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{x.description}</p>
              <dl className="mt-4 space-y-1 border-t border-line pt-3 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-subtle">Availability</dt>
                  <dd><F v={x.available} fmt={(v) => (v ? "Included / available" : "Not offered yet")} /></dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-subtle">Price</dt>
                  <dd><F v={x.price} /></dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <Panel id="ip-pricing" title="Extra IP addresses">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-subtle">
                  <th className="py-2 pr-4 font-normal">Item</th>
                  <th className="py-2 pr-4 font-normal">Setup</th>
                  <th className="py-2 font-normal">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {ipPricing.map((r) => (
                  <tr key={r.item} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 text-white">{r.item}</td>
                    <td className="py-2.5 pr-4"><F v={r.setup} /></td>
                    <td className="py-2.5"><F v={r.monthly} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-muted">
            IPv4 requests need a short justification, as required by RIPE NCC policy. Included IPs per server are listed in the <a href="/servers/#specs" className="text-brand-300 underline">full specifications</a>.
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}
