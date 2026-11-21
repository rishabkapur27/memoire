# Mémoire · Bread pre-orders

A pre-order web app for **Mémoire**, an artisan French bakehouse in Gurgaon. Customers reserve tomorrow's loaves for pickup or delivery; the bakery sees exactly how much to bake.

## Who it's for

- **Customers** want fresh sourdough without queuing or finding it sold out.
- **The baker** mixes dough 36 hours ahead and needs to know demand by 8 pm the night before, so nothing is wasted.

## Features

- **Live availability**: each bread has a daily capacity; customers only see and book what's left.
- **Bake-day rules**: book up to 7 days ahead, orders close 8 pm IST the evening before, closed Mondays. All time logic is in IST regardless of server timezone.
- **Pickup or delivery** with slots, Gurgaon pincode check, delivery fee and free-delivery threshold.
- **Order confirmation and tracking** by unguessable order code, with a status timeline.
- **Bakehouse dashboard** (`/admin`): orders by bake day, printable bake sheet (pickup vs delivery totals per bread), one-tap status flow (Received → Confirmed → Ready → Collected / Cancelled), revenue at a glance.
- **Menu management** (`/admin/products`): edit price, daily capacity and visibility.
- **Journal** with SEO articles, sitemap, robots, JSON-LD (Bakery, BlogPosting), OG image.
- **Microsoft Clarity** and **Google Search Console** hooks via env vars.

## Production details

- **No overselling**: orders are placed in a transaction that locks product rows (`SELECT ... FOR UPDATE`) and re-checks remaining capacity.
- **Idempotent submits**: each checkout carries a client request UUID (unique in DB), so double clicks or retries never create duplicate orders.
- **Server-side validation** with Zod (phone normalisation, slots, pincode, quantities); prices are always taken from the database, never the client.
- **Admin auth**: password compared via HMAC + constant-time check, HMAC-signed, httpOnly, expiring session cookie; every admin page and action re-verifies.
- Honeypot spam field, security headers, error boundaries, loading states, branded 404, `/api/health` endpoint.
- Unit tests for cutoff/date logic, pricing and validation (`npm test`).

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · Postgres (Neon or Supabase) via `postgres` · Zod · Vitest · Vercel

## Run locally

```bash
cp .env.example .env.local   # fill DATABASE_URL, ADMIN_PASSWORD, ADMIN_SECRET
npm install
npm run db:setup             # creates tables and seeds the menu (idempotent)
npm run dev
```

## Deploy

1. Import the repo into Vercel.
2. Add a Postgres database (Neon via Vercel Marketplace, or Supabase pooled connection string) as `DATABASE_URL`.
3. Set `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET` (and optional vars from `.env.example`).
4. Run `npm run db:setup` once against the production database.
5. Add the custom domain in Vercel and point DNS at it.

## Built with AI

Designed and built with Claude (Anthropic) as a pair programmer: architecture, schema, UI, tests and copy were produced iteratively with AI and reviewed by hand.
