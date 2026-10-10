import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { legalPages } from "@/components/content/legal";
import { PageShell } from "@/components/layout/PageShell";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Legal", "Offerhost terms, privacy policy, acceptable use policy, SLA, refund policy and imprint.", "/legal/");

export default function LegalIndex() {
  return (
    <PageShell eyebrow="Legal" title="Legal & Company" description="The documents that govern our services, and who we are.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {legalPages.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="group flex items-center justify-between rounded-[10px] border border-line bg-ink-900/70 p-5 text-fg transition-colors hover:border-brand-400/50">
              {p.title}
              <ArrowRight className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
