import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { articles } from "@/lib/content";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Knowledge Base", "Short how-to guides for Offerhost dedicated servers: first steps, Proxmox, IPv6, reverse DNS, looking glass and rescue system.", "/kb/");

export default function KbIndex() {
  return (
    <PageShell eyebrow="Knowledge Base" title="Guides" description="Short, practical answers for running your server.">
      <ul className="divide-y divide-line rounded-[10px] border border-line bg-ink-900/70">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link href={`/kb/${a.slug}/`} className="block p-5 hover:bg-white/[0.02]">
              <span className="font-medium text-white">{a.title}</span>
              <span className="mt-1 block text-sm text-muted">{a.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
