import { asnInfo, brand, locations, networkStats, serverPlans } from "@/lib/site";

// Emitted at build time as /api/chat-knowledge.json so the PHP chat endpoint
// (public/api/chat.php) quotes the same plans and prices as the website.
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    brand,
    asn: asnInfo,
    plans: serverPlans.map((p) => ({
      name: p.name,
      summary: p.summary,
      specs: p.specs,
      priceEurPerMonth: p.price,
      location: locations.find((l) => l.id === p.location)?.city ?? p.location,
    })),
    locations: locations.map((l) => ({ name: l.name, city: l.city })),
    networkStats,
  });
}
