import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { useCases } from "@/lib/content";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Use Cases", "Dedicated servers for Proxmox, web hosting, game servers, streaming and blockchain nodes.", "/use-cases/");

export default function UseCasesIndex() {
  return (
    <PageShell eyebrow="Use Cases" title="What customers run on Offerhost" description="Pick a workload to see the hardware that fits it.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((u) => (
          <li key={u.slug}>
            <Link href={`/use-cases/${u.slug}/`} className="group flex h-full flex-col rounded-[10px] border border-line bg-ink-900/70 p-6 hover:border-brand-400/50">
              <span className="text-base font-semibold text-white">{u.title}</span>
              <span className="mt-2 flex-1 text-sm text-muted">{u.description}</span>
              <ArrowRight className="mt-4 h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
