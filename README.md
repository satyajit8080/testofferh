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
| Brand, ASN, navigation, server plans, locations, footer | `src/lib/site.ts` |
| Status page components, incidents, maintenance | `src/lib/status.ts` |
| Page sections | `src/components/` |

## Build & deploy (cPanel)

```bash
NEXT_PUBLIC_SITE_URL=https://offerhost.com npm run build
```

This writes a fully static site to `out/`. Zip the **contents** of `out/` with forward-slash paths
(on Windows use `tar -a -c -f ../offerhost-site.zip *` from inside `out/`, not `Compress-Archive`),
upload to `public_html`, extract, then set files to `0644` and folders to `0755`.
