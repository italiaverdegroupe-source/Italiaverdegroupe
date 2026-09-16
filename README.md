# Verde Garden Trading

Italian trees and plants, imported and supplied across the United Arab Emirates.

## Phase 1 — public website

Next.js 16 (App Router) + TypeScript. Server-rendered for SEO, quotation-based
(no checkout), catalogue driven by data rather than hardcoded markup.

```
src/lib/site.ts        every value an administrator may change (VAT, emirates,
                       contact, lead times) — moves to the settings table in Phase 2
src/lib/products.ts    catalogue access layer — swap the JSON source for Postgres
                       without touching a component
src/lib/locations.ts   per-emirate content; each page says something specific
src/lib/db.ts          lead capture -> Postgres, with a logged fallback
src/app/api/quote      validated, rate-limited, honeypotted enquiry endpoint
```

### Catalogue data

68 specimens extracted from the 2025 trade catalogue, with product photos cropped
from the source PDF by card coordinates (not by image order, which is unreliable).

### Commercial rules encoded here

- **VAT is off** (`site.vatEnabled = false`) until a TRN is issued. Charging VAT
  without registration is an offence, so quotes carry
  "exclusive of VAT where applicable" instead of a VAT line.
- **No prices are published.** Every specimen is individually quoted.
- Company name, licence number, TRN, phone and address are settings, not literals.

## Run

```bash
npm install
npm run build
npm start
```

| Variable               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `DATABASE_URL`         | Postgres for lead capture. Without it, leads are logged. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and robots.   |

## Phase 2 — operations console

`/admin` is the internal console. It is `noindex`, absent from the sitemap, and
every route redirects to `/admin/login` without a session.

```
db/migrations/001_admin.sql   users, sessions, settings, audit_log,
                              login_attempts, lead_notes, lead work columns
src/lib/auth.ts               scrypt passwords, hashed session tokens,
                              per-email lockout, audit helper, origin check
src/app/admin/*               login, overview, leads list, lead detail
```

### Security notes

- Passwords use scrypt from the Node standard library, cost parameters stored
  with each hash so they can be raised without invalidating existing passwords.
- Only the SHA-256 of a session token is stored: a database dump cannot be
  replayed as a login.
- Failed logins are counted **per email**, not only per IP — rotating IPs is
  cheap, so an IP-only counter protects nothing.
- A login for an unknown account still runs a full password verification, so
  timing does not reveal which emails exist.
- Every operator state change is written to `audit_log` with before/after.

### Creating an operator

```bash
node scripts/hash-password.mjs 'the password'
# then INSERT the hash into users — never let the plaintext near the database
```

## Phase 2b — inventory

The decision this part exists to get right: **trees are not one kind of stock.**

| | `stock_items` | `stock_batches` |
| --- | --- | --- |
| What | one unique specimen | a lot of interchangeable plants |
| Quantity | always 1 | a number |
| Price | its own | per unit |
| Example | a 300-year-old olive | 500 identical 2 m ficus |

Modelling both as "product + quantity" is the mistake that forces a rebuild the
first time a six-figure specimen is sold, so they are separate tables over a
shared catalogue reference, with one `inventory_movements` ledger explaining
every change to either.

### Sellable is narrower than in stock

A tree can be physically present and still not sellable. `SELLABLE_ITEM_SQL`
requires all of:

- status is `available`
- health is not `critical` or `dead`
- any acclimatisation period has passed — Italian stock needs weeks to adjust
  to the Gulf before it can be promised to anyone
- it sits in a location flagged `sellable` — a supplier's yard in Puglia and a
  container at sea are both "in stock" and neither can be sold from

The specimen page states which of these is blocking rather than leaving someone
to work it out.

### Trees grow

Height and girth are rows in `specimen_measurements` with a date, not fixed
columns on the product. A tree measured at 4.0 m in March is not 4.0 m in
October, and a quotation is priced against the measurement of the day.
