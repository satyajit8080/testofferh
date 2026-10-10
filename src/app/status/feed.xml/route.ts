import { findComponent, incidents, maintenance } from "@/lib/status";

export const dynamic = "force-static";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const names = (ids: string[]) => ids.map((id) => findComponent(id)?.name ?? id).join(", ");

/** RSS feed of incidents and maintenance — lets customers subscribe to the static status page. */
export function GET() {
  const items = [
    ...incidents.map((i) => ({
      id: i.id,
      title: `${i.resolvedAt ? "[Resolved] " : ""}${i.title}`,
      date: i.updates.at(-1)?.at ?? i.startedAt,
      body: `Affects: ${names(i.components)}\n\n${i.updates.map((u) => `${u.at} — ${u.status}: ${u.message}`).join("\n")}`,
    })),
    ...maintenance.map((m) => ({
      id: m.id,
      title: `[Maintenance] ${m.title}`,
      date: m.startsAt,
      body: `${m.startsAt} → ${m.endsAt}\nAffects: ${names(m.components)}\n\n${m.description}`,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Offerhost Status</title>
<link>${site}/status/</link>
<description>Incidents and scheduled maintenance for the Offerhost network (AS208220).</description>
${items
  .map(
    (i) => `<item>
<title>${esc(i.title)}</title>
<link>${site}/status/#${esc(i.id)}</link>
<guid isPermaLink="false">${esc(i.id)}</guid>
<pubDate>${new Date(i.date).toUTCString()}</pubDate>
<description>${esc(i.body)}</description>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
