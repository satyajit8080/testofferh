import type { Metadata } from "next";

/** Per-page metadata with canonical URL and matching Open Graph / Twitter text. */
export function pageMeta(title: string, description: string, path: string): Metadata {
  const full = `${title} | Offerhost`;
  return {
    title: full,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path },
    twitter: { title: full, description },
  };
}
