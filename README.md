# Jain Shikanji — Unified Restaurant Platform

One website, four roles — Customer, Admin, Kitchen, and Waiter — plus QR
table ordering with live billing, payment, and order tracking. Built on
Next.js + TypeScript + Tailwind as a single codebase (no separate
frontend/backend, no separate apps per role).

## Setup

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## What's built (Phases 1-5, all tested end-to-end)

| Route | Role | What it does |
|---|---|---|
| `/`, `/about`, `/menu`, `/find-us`, `/buy-online`, `/social-bits`, `/contact` | Customer | Brand website — heritage story, menu, outlets, quick-commerce links, contact form |
| `/order-now` | Customer | Table picker — entry point into QR ordering (stand-in for scanning a physical QR code) |
| `/table/[tableId]` | Customer | QR table ordering — browse menu, review bill, choose payment (UPI/Counter), track order with live ETA |
| `/admin/dashboard` | Admin | Live stats — active orders, today's revenue, menu/table/lead counts |
| `/admin/menu-manager` | Admin | Add items, **ON/OFF stock toggle** (Petpooja-style), remove items |
| `/admin/tables` | Admin | Add/remove tables, Free ↔ Occupied toggle |
| `/admin/staff-log` | Admin | Log and view staff activity |
| `/kitchen` | Kitchen | Live KOT queue — **aggregated view** (same item across tables summed into one prep card) and **by-table view**, with urgency timers (amber at 6 min, pulsing red at 12 min) |
| `/waiter` | Waiter | Table picker with live "ready to serve" alerts when the kitchen finishes an order |
| `/waiter/order/[tableId]` | Waiter | Manual order entry for a table |

Each role has its own distinct visual language (see Section "Role UIs" below)
rather than one shared look with different permissions.

## Folder structure

```
jainshikanji-site/
├── src/
│   ├── pages/
│   │   ├── index.tsx, about.tsx, menu.tsx, find-us.tsx,      → Customer pages
│   │   │   buy-online.tsx, social-bits.tsx, contact.tsx,
│   │   │   order-now.tsx
│   │   ├── admin/
│   │   │   ├── index.tsx           → redirects to /admin/dashboard
│   │   │   ├── dashboard.tsx       → live stats (orders, revenue, menu, tables, leads)
│   │   │   ├── menu-manager.tsx    → add/edit items, ON/OFF stock toggle
│   │   │   ├── tables.tsx          → add/remove tables, free/occupied toggle
│   │   │   └── staff-log.tsx       → log and view staff actions
│   │   ├── kitchen/
│   │   │   └── index.tsx           → aggregated + by-table KOT queue, urgency timers
│   │   ├── waiter/
│   │   │   ├── index.tsx           → table picker, ready-to-serve alerts
│   │   │   └── order/[tableId].tsx → manual order entry
│   │   ├── table/
│   │   │   └── [tableId].tsx       → QR ordering: menu, bill, payment, tracking
│   │   └── api/
│   │       ├── contact.ts, newsletter.ts, menu.ts, outlets.ts   → Phase 1
│   │       ├── vistona-webhook.ts                                → future integration stub
│   │       ├── orders.ts               → GET/POST/PUT orders (status, items, payment)
│   │       ├── orders/seed.ts          → POST, creates demo orders (dev/testing only)
│   │       └── admin/
│   │           ├── menu.ts, tables.ts, staff-log.ts, stats.ts
│   ├── components/
│   │   ├── Layout/Header.tsx, Layout/Footer.tsx    → Customer site chrome
│   │   ├── Hero.tsx, MenuCard.tsx, OutletCard.tsx,
│   │   │   ContactForm.tsx, NewsletterForm.tsx
│   │   ├── Admin/AdminLayout.tsx, Admin/StatCard.tsx
│   │   └── Waiter/WaiterLayout.tsx
│   ├── data/                # site content — edit without touching code
│   │   ├── menu.json            → includes `available` (Admin ON/OFF toggle)
│   │   ├── outlets.json
│   │   └── tables.json
│   ├── lib/
│   │   ├── storage.ts       → append-only logs (contact leads, newsletter, staff log)
│   │   ├── adminStore.ts    → CRUD for menu.json / tables.json
│   │   └── ordersStore.ts   → order CRUD + buildOrder() (billing + ETA calculation)
│   └── types/index.ts
├── data/                     # runtime logs land here (gitignored)
├── public/images/
├── package.json, tailwind.config.js, tsconfig.json, .env.example
```

## Role UIs — each one deliberately different

| Role | Visual language |
|---|---|
| Customer | Warm cream/green/gold, rounded cards, food-forward |
| Admin | Dense dashboard, sidebar nav, data tables, stat cards with icons |
| Kitchen | Near-black background, huge bold text, urgency-colored borders (green → amber → pulsing red) |
| Waiter | Mobile-first, teal accent, big tap targets, live "ready to serve" alerts |

_app.tsx only wraps customer-facing pages with the shared Header/Footer —
`/admin`, `/kitchen`, `/waiter`, and `/table` each render their own full
layout, standalone.

## Order lifecycle (how the pieces connect)

1. Customer scans a QR code (or picks a table via `/order-now`) → `/table/[id]`
2. Adds items, reviews the bill (subtotal + 5% tax + total), picks a payment
   method, places the order
3. Order appears instantly on `/kitchen`, aggregated with any other active
   orders for the same items
4. Kitchen marks items ready → customer sees live status + ETA countdown on
   their phone, waiter sees a pulsing "ready to serve" badge on `/waiter`
5. Admin dashboard reflects active orders and today's revenue in real time

Waiter-taken orders (`/waiter/order/[tableId]`) go through the exact same
`POST /api/orders` and show up on `/kitchen` identically — one order pipeline
for both entry points.

## Billing & payment (prototype-level)

- Bill = subtotal + flat 5% tax, computed server-side from real menu prices
  (never trusts a price the client sends)
- Payment methods: **Pay at Counter** (cash) or **Pay via UPI** — the UPI
  option builds a real `upi://pay?...` deep link (opens GPay/PhonePe/Paytm
  with the amount pre-filled), which needs no payment-gateway account or API
  key. It cannot auto-confirm payment, so there's a manual "I've Paid"
  button — clearly a self-reported confirmation, not verified.
- **Before going live**: replace `RESTAURANT_UPI_ID` in
  `src/pages/table/[tableId].tsx` with the restaurant's real UPI ID.

## Order tracking

Every order gets an `estimatedReadyAt` timestamp (8 base minutes + 2 min per
item, capped at 40) computed at creation. The customer's `/table/[id]` page
shows a live "Ready in ~N min" countdown that flips to "Ready! 🎉" once the
kitchen marks every item ready.

## What's real vs. stubbed

- **Real and working, tested end-to-end**: everything in the table above —
  full customer site, Admin CRUD + stock toggle, Kitchen aggregation +
  urgency timers, Waiter manual orders + ready alerts, QR ordering with
  billing/payment/tracking.
- **Stubbed for later**: `/api/vistona-webhook` — marked in code, ready for
  Vistona Global integration without touching anything else.
- **Kitchen Screen polls every 5 seconds** (`POLL_MS` in
  `src/pages/kitchen/index.tsx`) instead of using WebSockets — a
  straightforward substitute; swapping in a WebSocket subscription later
  doesn't require any other change.
- **Known prototype limitation**: Admin's Menu Manager edits
  `src/data/menu.json` directly on disk. The customer-facing `/menu` page
  imports that same file statically at build time, so an admin edit won't
  show there until the dev server restarts. Disappears once Phase 6 swaps
  file storage for a real database.
- **Swap before production**: `src/lib/storage.ts`, `adminStore.ts`, and
  `ordersStore.ts` all write to local JSON files — fine for a prototype.
  Replace all three with PostgreSQL before going live (see the project
  blueprint's Database & API Design section). No authentication/login yet —
  `/admin`, `/kitchen`, and `/waiter` are reachable by anyone who knows the
  URL; add role-based login before deploying for real use.

## Testing the flows without physical QR codes / real staff

- **QR ordering**: go to `/order-now`, pick a table, order normally.
- **Kitchen**: visit `/kitchen` — if empty, click "Load demo orders" (or
  `POST /api/orders/seed`) to generate sample orders with overlapping items,
  so you can see aggregation in action.
- **Waiter ready-alert**: place an order (via `/table/[id]` or
  `/waiter/order/[id]`), mark one of its items ready on `/kitchen`, then open
  `/waiter` — that table shows a pulsing "Ready to serve!" badge.

## Next step: Phase 6

Swap JSON file storage for PostgreSQL, add role-based login for
`/admin` `/kitchen` `/waiter`, deploy (Vercel + a managed Postgres), and do a
final QA pass.
