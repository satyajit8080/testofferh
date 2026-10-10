# Offerhost website

Marketing site for **Offerhost** — dedicated servers on the Offerhost Global Network (**AS208220**, RIPE NCC).

Live: https://offerhost.com · Status: https://offerhost.com/status/

## Stack

Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS 4 · Framer Motion · Lucide icons · dotted-map

## Develop

```bash
npm install
npm run dev
```

## Edit content

| What | File |
| --- | --- |
| **Business facts** — company/imprint, contacts, DDoS numbers, SLA, fees, VAT, stock, delivery, extras, IP prices, testimonials | `src/lib/facts.ts` |
| Brand, ASN, navigation, server plans, locations, footer | `src/lib/site.ts` |
| Use-case pages and knowledge base | `src/lib/content.ts` |
| FAQ | `src/lib/faq.ts` |
| Status page components, incidents, maintenance | `src/lib/status.ts` |
| Page sections | `src/components/` |

## Facts before publishing

Every value in `src/lib/facts.ts` is either confirmed in writing or `null`. A `null` shows on the
site as an amber **To confirm** marker. List what is still missing with:

```bash
npm run facts   # exits 1 while anything is unconfirmed
```

Legal pages show a "Draft" banner until `legal.draft` is set to `false` after legal review.
Customer quotes appear on the homepage only once added to `testimonials` (with permission).

## Build & deploy (cPanel)

```bash
NEXT_PUBLIC_SITE_URL=https://offerhost.com npm run build
```

This writes a fully static site to `out/`. Zip the **contents** of `out/` with forward-slash paths
(on Windows use `tar -a -c -f ../offerhost-site.zip *` from inside `out/`, not `Compress-Archive`),
upload to `public_html`, extract, then set files to `0644` and folders to `0755`.
