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

## Customer accounts (HostBill)

Customers sign in, sign up, order, pay and manage servers in **HostBill** at `/clients/`. The site's
**Login** and **Get Started** buttons link there; the URLs are in `clientArea` in `src/lib/site.ts`
(confirm they match your HostBill install). A plan's **Order link** (set in Admin → Server plans) can
point to its HostBill cart page; without one, "Configure" opens the contact form.

## Admin panel (`/admin/`)

Staff-only panel (PHP + MySQL on the same cPanel account). There is no public sign-up.

| Section | What it does | Roles |
| --- | --- | --- |
| Dashboard | Real counts: new messages, open incidents, maintenance, plans, staff; recent activity | all |
| Messages | Read `/contact/` submissions, internal notes, mark handled | all (delete: admin) |
| Server plans | Create/edit/reorder/hide homepage plans | all (delete: admin) |
| Status page | Component statuses, incidents with updates, maintenance windows | all (some deletes: admin) |
| Users | Invite staff, change role, disable, reset 2FA, send reset link | admin |
| Audit log | Every sign-in and admin action | admin |
| My account | Change password, two-factor authentication (TOTP) | all |

The homepage plans and `/status/` load the latest data from `/api/site.php` when a visitor opens them.
The values in `src/lib/site.ts` / `src/lib/status.ts` are only a fallback (used in `npm run dev` or if
the database is unavailable). Search engines may see the fallback values, so keep `site.ts` roughly
in sync when prices change.

### One-time setup on cPanel

1. **Create the database** — cPanel → *MySQL® Databases*: create a database (e.g. `offerhost_site`) and a
   user with a strong password, then add the user to the database with **ALL PRIVILEGES**.
2. **Import the schema** — cPanel → *phpMyAdmin* → select the database → *Import* → `server/schema.sql`.
   This creates the tables and seeds the current plans and status components.
3. **Create the config file outside `public_html`** — copy `server/offerhost-config.example.php` to
   `/home/offerhost/offerhost-config.php` (File Manager → the folder *above* `public_html`) and fill in:
   - `db.name`, `db.user`, `db.pass`
   - `app_key`: 32+ random bytes (used to encrypt 2FA secrets; never change it afterwards)
   - `mail.from` (a mailbox on your domain) and `mail.contact_to` (where contact messages are emailed)
   - `setup_token`: a long random string, used once in step 5

   Set the file's permissions to **0600**. It is in `.gitignore` and must never be committed.
4. **Deploy** the site build as usual (see below).
5. **Create the first admin** — open `https://offerhost.com/admin/setup/`, enter the `setup_token`, your
   name, email and password. Setup only works while no account exists. Then **clear `setup_token`** in
   the config file.
6. Sign in at `/admin/login/` and turn on two-factor authentication under **My account**.
7. **Cloudflare** — add a Cache Rule: *URI Path starts with* `/api/` **or** `/admin/` → *Bypass cache*.
   (The server already sends `Cache-Control: no-store` for both, so this is a safety net.) Keep
   *SSL/TLS → Always Use HTTPS* on.

Generate random values in cPanel → *Terminal* (if available) or on your PC with PHP:
`php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"`

### Security notes

- Passwords: Argon2id (bcrypt fallback); minimum 12 characters. Reset links are single-use, expire after
  1 hour (invites: 72 hours) and sign the user out everywhere.
- Sessions: random token in an `HttpOnly; Secure; SameSite=Strict` cookie (`__Host-` prefix over HTTPS);
  only its SHA-256 is stored. 2 h idle / 12 h max, or 30 days with "Remember me".
- Every POST needs a same-origin `Origin` header **and** the session's CSRF token; every admin action is
  checked server-side against the user's role (`ACTIONS` in `public/api/admin.php`).
- Rate limits: sign-in 8 attempts / 15 min per email and 30 / 15 min per IP, password reset, setup,
  contact form (5 / hour per IP). Error messages never reveal whether an account exists.
- All SQL uses prepared statements. `public/api/_lib/` is blocked by `.htaccess`.

### Contact form

`/contact/` posts to `/api/contact.php`. Each message is stored for **Admin → Messages** and emailed to
`mail.contact_to` (if set). The old `contact.html` in `public_html` is separate and left untouched.

### Deploy additions

Besides the usual site files, the build now contains the folders `admin/` and `api/` (incl.
`api/.htaccess`, `api/_lib/.htaccess`, `admin/.htaccess`). Folders `0755`, files `0644`.
