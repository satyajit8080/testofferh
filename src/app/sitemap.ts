import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://offerhost.com").replace(/\/$/, "");

const pages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/dedicated-servers/", priority: 0.9, changeFrequency: "weekly" },
  { path: "/asn-ip/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/network/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/data-centers/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about/", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/status/", priority: 0.5, changeFrequency: "daily" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({ url: base + p.path, changeFrequency: p.changeFrequency, priority: p.priority }));
}
