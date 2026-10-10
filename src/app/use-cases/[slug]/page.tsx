import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/content/Blocks";
import { PageShell } from "@/components/layout/PageShell";
import { ServerCard } from "@/components/sections/ServerCard";
import { findArticle, findUseCase, useCases } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { findPlan } from "@/lib/plans";

export const dynamicParams = false;

export function generateStaticParams() {
  return useCases.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const u = findUseCase((await params).slug);
  return u ? pageMeta(u.title, u.description, `/use-cases/${u.slug}/`) : {};
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const u = findUseCase((await params).slug);
  if (!u) notFound();
  const plans = u.plans.map(findPlan).filter((p) => p !== undefined);
  return (
    <PageShell eyebrow={`Use case · ${u.name}`} title={u.title} description={u.intro}>
      <div className="grid gap-14">
        <article className="prose-doc">
          <Blocks blocks={u.body} />
          {u.kb && (
            <>
              <h2>Guides</h2>
              <ul>
                {u.kb.map((s) => {
                  const a = findArticle(s);
                  return a ? (
                    <li key={s}>
                      <Link href={`/kb/${s}/`}>{a.title}</Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </>
          )}
        </article>
        <section aria-labelledby="recommended">
          <h2 id="recommended" className="text-2xl font-semibold tracking-tight text-white">Recommended servers</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((p, i) => (
              <ServerCard key={p.id} plan={p} index={i} />
            ))}
          </div>
        </section>
        <nav aria-label="Other use cases" className="flex flex-wrap gap-2 text-sm">
          {useCases
            .filter((o) => o.slug !== u.slug)
            .map((o) => (
              <Link key={o.slug} href={`/use-cases/${o.slug}/`} className="rounded-md border border-line px-3 py-1.5 text-fg/85 hover:border-brand-400/50 hover:text-white">
                {o.name}
              </Link>
            ))}
        </nav>
      </div>
    </PageShell>
  );
}
