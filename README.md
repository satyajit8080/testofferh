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

## Sales chat assistant (24/7)

A floating chat bubble (`src/components/layout/ChatWidget.tsx`) on every page answers sales and
pre-sales questions with Claude and emails qualified leads to the sales team. Because the site is
static, the backend is a small PHP endpoint that ships with the build: `public/api/chat.php` →
`/api/chat.php`. Plan names, specs and prices come from `src/lib/site.ts`, exported at build time to
`/api/chat-knowledge.json`, so the assistant always quotes what the website shows.

Opening the chat first shows a short lead form — **name**, **email** and optional **Telegram ID**.
`public/api/lead.php` validates it and emails the lead to `SALES_EMAIL` straight away, so a contact
is captured even if the visitor never sends a message. The details are remembered in the browser
(`localStorage`) and sent with each chat request, so the assistant greets the visitor by name and
includes their email and Telegram in any follow-up lead it sends.

Server setup (once, PHP 8.1+):

1. In `public_html/api/`, run `composer install --no-dev` (cPanel Terminal), or run it locally in
   `public/api/` before building so `vendor/` is included in `out/`.
2. Copy `config.example.php` to `config.local.php` and set `ANTHROPIC_API_KEY`, `SALES_EMAIL`,
   `MAIL_FROM` and `ALLOWED_ORIGINS` (or set them as environment variables). `.htaccess` blocks
   public access to the config file and `vendor/`.

Locally, `npm run dev` doesn't run PHP: build, then `php -S localhost:8080 -t out`, or point the
widget at another host with `NEXT_PUBLIC_CHAT_ENDPOINT`.

## Build & deploy (cPanel)

```bash
NEXT_PUBLIC_SITE_URL=https://offerhost.com npm run build
```

This writes a fully static site to `out/`. Zip the **contents** of `out/` with forward-slash paths
(on Windows use `tar -a -c -f ../offerhost-site.zip *` from inside `out/`, not `Compress-Archive`),
upload to `public_html`, extract, then set files to `0644` and folders to `0755`.
