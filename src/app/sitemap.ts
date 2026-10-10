import type { MetadataRoute } from "next";
import { articles, useCases } from "@/lib/content";

export const dynamic = "force-static";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/servers/",
    "/ddos/",
    "/network/",
    "/status/",
    "/features/",
    "/support/",
    "/locations/amsterdam/",
    "/use-cases/",
    ...useCases.map((u) => `/use-cases/${u.slug}/`),
    "/kb/",
    ...articles.map((a) => `/kb/${a.slug}/`),
    "/legal/",
    "/legal/terms/",
    "/legal/privacy/",
    "/legal/aup/",
    "/legal/sla/",
    "/legal/refunds/",
    "/legal/imprint/",
  ];
  return paths.map((p) => ({ url: `${site}${p}` }));
}
