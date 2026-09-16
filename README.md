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
