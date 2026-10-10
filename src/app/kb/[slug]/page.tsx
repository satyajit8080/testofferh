import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/content/Blocks";
import { PageShell } from "@/components/layout/PageShell";
import { articles, findArticle } from "@/lib/content";
import { pageMeta } from "@/lib/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle((await params).slug);
  return a ? pageMeta(a.title, a.description, `/kb/${a.slug}/`) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle((await params).slug);
  if (!a) notFound();
  return (
    <PageShell eyebrow="Knowledge Base" title={a.title} description={a.description}>
      <article className="prose-doc">
        <Blocks blocks={a.body} />
        <p>
          <Link href="/kb/">← All articles</Link> · Still stuck? <Link href="/support/">Contact support</Link>.
        </p>
      </article>
    </PageShell>
  );
}
