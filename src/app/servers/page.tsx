import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ServerCard } from "@/components/sections/ServerCard";
import { F, Tbc } from "@/components/ui/Tbc";
import { planDefaults } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { resolvedPlans, stockLabel, vatSuffix, type ResolvedPlan } from "@/lib/plans";
import { locations } from "@/lib/site";

export const metadata = pageMeta(
  "Dedicated Servers — Full Specs & Pricing",
  "Compare Offerhost dedicated servers: CPU generation, ECC, IPMI, setup fee, minimum term, VAT, bandwidth, included IPs and operating systems.",
  "/servers/",
);

const ranges: { id: ResolvedPlan["range"]; title: string; body: string }[] = [
  { id: "ryzen", title: "AMD Ryzen", body: "High clock speeds for hosting, game servers and virtualisation." },
  { id: "10g", title: "10 Gbps", body: "For streaming, CDN edges and anything that moves a lot of traffic." },
  { id: "storage", title: "Storage", body: "Large HDD arrays with NVMe for the OS — backups, media and archives." },
];

const yesNo = (v: boolean) => (v ? "Yes" : "No");

const rows: { label: string; cell: (p: ResolvedPlan) => React.ReactNode }[] = [
  { label: "CPU", cell: (p) => p.cpu.model },
  { label: "CPU generation", cell: (p) => p.cpu.generation },
  { label: "Cores / threads", cell: (p) => `${p.cpu.cores} / ${p.cpu.threads}` },
  { label: "Base / boost clock", cell: (p) => p.cpu.clock },
  { label: "Memory", cell: (p) => p.ram },
  { label: "ECC memory", cell: (p) => <F v={p.ecc} fmt={yesNo} /> },
  { label: "Storage", cell: (p) => p.storage },
  { label: "IPMI / remote console", cell: (p) => <F v={p.ipmi} fmt={yesNo} /> },
  { label: "Port speed", cell: (p) => p.port },
  { label: "Guaranteed bandwidth", cell: (p) => <F v={p.guaranteedBandwidth} /> },
  { label: "Included IPv4", cell: (p) => <F v={p.includedIpv4} /> },
  { label: "Included IPv6", cell: (p) => <F v={p.includedIpv6} /> },
  { label: "Location", cell: (p) => locations.find((l) => l.id === p.location)?.city ?? p.location },
  { label: "Monthly price", cell: (p) => (p.price === null ? "On request" : `€${p.price}`) },
  { label: "VAT", cell: (p) => vatSuffix(p.pricesIncludeVat) || <Tbc /> },
  { label: "Setup fee", cell: (p) => <F v={p.setupFee} fmt={(v) => (v === 0 ? "Free" : `€${v}`)} /> },
  { label: "Minimum term", cell: (p) => <F v={p.minimumTerm} /> },
  { label: "Stock", cell: (p) => <F v={p.stock} fmt={(v) => stockLabel[v].label} /> },
  { label: "Delivery time", cell: (p) => <F v={p.delivery} /> },
];

export default function ServersPage() {
  let i = 0;
  return (
    <PageShell
      eyebrow="Dedicated Servers"
      title="Every server, every spec."
      description="All prices are monthly. Click Configure to add a server to your cart; nothing is charged until checkout."
    >
      <div className="space-y-16">
        {ranges.map((r) => {
          const plans = resolvedPlans.filter((p) => p.range === r.id);
          return (
            <section key={r.id} aria-labelledby={`range-${r.id}`}>
              <h2 id={`range-${r.id}`} className="text-2xl font-semibold tracking-tight text-white">{r.title}</h2>
              <p className="mt-1 text-sm text-muted">{r.body}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {plans.map((p) => (
                  <ServerCard key={p.id} plan={p} index={i++ % 4} />
                ))}
              </div>
            </section>
          );
        })}

        <section id="specs" aria-labelledby="specs-title" className="scroll-mt-32">
          <h2 id="specs-title" className="text-2xl font-semibold tracking-tight text-white">Full specifications</h2>
          <div className="mt-6 overflow-x-auto rounded-[10px] border border-line">
            <table className="w-full min-w-[960px] border-collapse text-[13px]">
              <thead>
                <tr className="bg-ink-850">
                  <th scope="col" className="sticky left-0 bg-ink-850 px-4 py-3 text-left font-normal text-subtle">Spec</th>
                  {resolvedPlans.map((p) => (
                    <th key={p.id} scope="col" className="px-4 py-3 text-left font-semibold text-white">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th scope="row" className="sticky left-0 bg-ink-900 px-4 py-2.5 text-left font-normal text-subtle">{row.label}</th>
                    {resolvedPlans.map((p) => (
                      <td key={p.id} className="px-4 py-2.5 text-fg/90">{row.cell(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="os" aria-labelledby="os-title" className="scroll-mt-32">
          <h2 id="os-title" className="text-2xl font-semibold tracking-tight text-white">Operating systems</h2>
          <p className="mt-1 text-sm text-muted">Available for automatic installation on every server. Custom ISOs can be mounted via the remote console.</p>
          <div className="mt-6">
            {planDefaults.osList ? (
              <ul className="flex flex-wrap gap-2">
                {planDefaults.osList.map((os) => (
                  <li key={os} className="rounded-md border border-line bg-ink-900/70 px-3 py-1.5 text-sm text-fg">{os}</li>
                ))}
              </ul>
            ) : (
              <Tbc label="OS list to confirm" />
            )}
          </div>
          <p className="mt-6 text-sm text-muted">
            Need something not listed? <Link href="/support/#contact" className="text-brand-300 underline">Ask for a custom configuration</Link>.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
