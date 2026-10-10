import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Extra content under the hero text (e.g. a draft banner or buttons). */
  heroExtra?: React.ReactNode;
};

/** Header + page hero + footer for every inner page. */
export function PageShell({ eyebrow, title, description, children, heroExtra }: Props) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <section className="relative isolate overflow-hidden pb-10 pt-32 sm:pt-40">
          <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
          <Container>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-brand-400" />
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">{title}</h1>
            {description && <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{description}</p>}
            {heroExtra}
          </Container>
        </section>
        <Container className="pb-24">{children}</Container>
      </main>
      <Footer />
    </>
  );
}

/** Card section with a heading, used on most inner pages. */
export function Panel({ id, title, children, className }: { id?: string; title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`min-w-0 scroll-mt-32 rounded-[10px] border border-line bg-ink-900/70 p-6 sm:p-8 ${className ?? ""}`}>
      {title && <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

/** Two-column definition table. */
export function FactTable({ rows }: { rows: { label: React.ReactNode; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-md border border-line">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
          <dt className="text-[13px] text-subtle">{r.label}</dt>
          <dd className="text-sm text-fg">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
