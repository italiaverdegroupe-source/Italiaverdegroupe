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
src/lib/users.ts              operator accounts, password policy, the rule
                              that there is always one active owner
src/app/(site)/*              the public marketing site, its own root layout
src/app/(console)/*           the operations console, its own root layout —
                              two audiences, two shells, so the console never
                              inherits the site's header, footer or metadata
```

### Security notes

- Passwords use scrypt from the Node standard library, cost parameters stored
  with each hash so they can be raised without invalidating existing passwords.
- Only the SHA-256 of a session token is stored: a database dump cannot be
  replayed as a login.
- The client's address is read from `CF-Connecting-IP`, which Cloudflare
  overwrites on every request it proxies. `x-forwarded-for` is a list every
  proxy **appends** to, so its first entry is whatever the caller typed before
  sending — reading it, as this did, filed an attacker-chosen string in
  `audit_log` as evidence and handed the rate limiter a key the caller picks.
  Where the header is absent the address is still recorded, prefixed `~`, and
  the console prints it as **unverified** rather than as a fact.
- Failed logins lock the **(email, address) pair** at six in fifteen minutes,
  and the email itself at thirty. The rule before counted the email alone, so
  anyone who knew the owner's address — it is on the contact page — could lock
  the only account that reaches the console, from anywhere, with six wrong
  guesses, and repeat it all day. Locking the real operator out was easier than
  guessing the password. The pair is only worth keying on because the address
  itself is now trustworthy.
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

## Phase 2c — procurement, shipping, landed cost

### The decision this part exists to get right

**Freight is not allocated by value.** A container is sold by the space it
holds, so a large cheap olive consumes far more of the freight bill than a
small expensive one. Each cost line therefore carries its own basis:

| Cost | Spread by | Why |
| --- | --- | --- |
| freight, inland transport | **volume** | you pay for container space |
| customs duty, insurance | **value** | assessed on declared value |
| clearance, handling | **count** | charged per piece or movement |

`tests/landed-cost.test.mjs` costs the same container both ways:

```
freight by VOLUME  ancient olive AED 8,763.50   →  margin at AED 9,500 =  7.8%
freight by VALUE   ancient olive AED 6,827.37   →  margin at AED 9,500 = 28.1%
```

Twenty points of margin that do not exist. Every price set from the second
number would be set too low.

### The engine refuses to invent numbers

- A basis with no denominator (freight by weight when nothing has a weight) is
  reported and left visibly unallocated, not spread arbitrarily.
- A missing exchange rate is flagged, never treated as 1:1.
- A foreign-currency cost sitting at a rate of 1.00 is flagged — it is almost
  always an unfilled field, and it understates landed cost by roughly the
  exchange rate.

Exchange rates are stored per line and used as stored. Recomputing an old
shipment at today's rate would quietly rewrite margins already reported.

### Compliance is a record, not an attachment

MOCCAE import permits expire six months from issue, and an expired permit means
a container of live trees sitting at the port accruing storage. Permits are
first-class rows with an expiry, shipments reference one, and the shipment page
says so plainly when it has lapsed.

```bash
node tests/landed-cost.test.mjs   # after: npx esbuild src/lib/landed-cost.ts \
                                  #   --format=esm --outfile=.test-build/landed-cost.mjs

npx esbuild src/lib/client-ip.ts  --format=cjs --outfile=.test-build/client-ip.cjs
npx esbuild src/lib/rate-limit.ts --format=cjs --outfile=.test-build/rate-limit.cjs
node tests/auth-hardening.test.mjs   # address trust + the lockout, against real rows
node tests/rate-limit.test.mjs       # 400 invented addresses do not buy 400 allowances
```

## Phase 2d — quotations

The business runs on quotations, not a checkout, so three things are enforced
rather than left to discipline.

### An issued quotation is never edited

Repricing creates a **new version** and supersedes the old one. The customer is
holding the document that was sent; editing it in place makes "what did we
actually quote, and when" unanswerable. Specimen lines are deliberately not
copied forward — one specimen belongs to one quotation, and the tree may be
gone by the time v2 is written.

### Every number is a snapshot

Unit price, landed cost, VAT rate and *whether VAT applied at all* are stored on
the quotation. Looking them up live would rewrite last quarter's documents the
day a setting changes. A quotation issued before the company held a TRN must
never acquire a VAT line later — charging VAT without registration is an
offence, and rewriting history to look compliant is worse than the original gap.

### Accepting reserves stock under a row lock

`acceptQuote` takes `SELECT … FOR UPDATE` on each specimen before reading its
status, inside one transaction. `tests/concurrency.test.mjs` runs two
salespeople accepting two quotations for the same tree at the same instant:

```
with the lock     → one reserves it, the other is refused
without the lock  → BOTH succeed, and the tree is sold twice
```

A unique partial index on `quote_items(stock_item_id)` stops the same specimen
reaching two quotations in the first place.

### Arabic PDFs

The customer-facing sheet is a print stylesheet, not a server-generated PDF.
Arabic needs bidirectional layout and letter shaping, which most server-side
PDF libraries mangle; the browser already does it correctly, so print-to-PDF
produces a better document with no dependency to keep patched.

```bash
node tests/concurrency.test.mjs
```

## Phase 2e — orders, deliveries, invoices, payments

### Fulfilment is partial

An order for 200 trees arrives in three containers over two months. Progress is
tracked **per line** as a cumulative `delivered_qty`, and the order status is
*derived* from the lines rather than set by hand — so "partially delivered"
cannot drift out of step with the quantities. Delivering more than remains is
refused outright; `tests/partial-delivery.test.mjs` checks the refusal leaves
nothing half-applied.

### UAE B2B payment reality

Not edge cases here, so they are in the schema:

- **LPO number** — a customer's accounts department pays against their own
  purchase order number. Without it on the invoice, the invoice waits.
- **Advance** — an advance invoice bills the agreed percentage, not the order.
- **Retention** — 5–10% held for months after handover on landscaping work.
  Counting it as collected on delivery overstates available cash.

### Credit is the cash-flow risk

Contractors pay late. `credit_limit_aed` sits on the customer and the finance
page opens on outstanding, overdue, and 1–30 / 31–60 / 61–90 / 90+ buckets.

### E-invoicing

UAE e-invoicing is Peppol **PINT AE**: structured XML through an accredited
provider, not a PDF. Invoices already carry `pint_id` and `pint_status`, and
snapshot the TRN and VAT position at issue, so switching it on is a mapping
rather than a migration.

```bash
node tests/partial-delivery.test.mjs
```

## Phase 2f — settings: the golden rule

> *The system must be configurable by administrators and must not require
> developer intervention for normal business operations.*

`src/lib/site.ts` holds the **defaults**. `src/lib/settings.ts` reads the
`settings` table on top of them, so what the site and every document actually
use can change from `/admin/settings` with no deploy: company identity, contact
channels, currency, quotation validity, TRN and VAT.

Two rules the console enforces:

- **VAT cannot be switched on without a TRN.** Charging VAT without a
  registration number is an offence, so the combination is refused before it
  can reach a customer document.
- **Enabling VAT applies to the next document, never the last one.** Each
  quotation and invoice stores the tax position it was issued under. Switching
  VAT on today does not retroactively add a VAT line to a quotation sent last
  month — and the test checks exactly that.

Contact channels appear on the site only once configured. An advertised number
nobody answers is worse than none.

If the database is unreachable the compiled defaults are used rather than
throwing: a settings outage must not take the public site down with it.

## Phase 2g — reports

One query per question a manager actually asks, from the brief's own list:

| Question | Answer |
| --- | --- |
| Which trees make money? | units, revenue, landed cost, profit, margin per reference |
| Which channel generates revenue? | lead → quote → order → **money**, per source |
| Who buys, and who returns? | revenue per customer, repeat flagged |
| Where is the money? | revenue per emirate |
| Who converts? | quotations, accepted, conversion rate, value won |
| What is stuck? | stock held over 90 days, with what it cost |
| What is coming? | inbound shipments, and whether the permit still covers them |
| How much cash is tied up? | landed cost of everything not yet sold |

Figures come from the snapshots stored on each document — the price quoted, the
landed cost at the time — so a report of last quarter still reads as last
quarter rather than being re-derived from today's numbers.

Deliberately tables rather than charts: "which trees make money" needs a margin
to one decimal, not a doughnut. The worked example in the test is the point —
the ancient olive sells for AED 38,000, costs AED 35,054 landed, and returns
**7.8%**. That is a number to act on.

```bash
# figures are checked against independently computed SQL, not eyeballed
```

## The homepage photograph

The hero is one picture the owner chose, full bleed, with the copy on it —
`public/brand/hero-terrace.webp`. It sits in `public/brand`, never
`public/products`, so it cannot be reached through `imageFor()` or turn up in
the catalogue as something a customer can ask a price for.

Two things follow from putting words on a photograph rather than on a panel.

**The wash is measured, not guessed.** Behind the headline the sky runs at
0.46–0.82 relative luminance, so near-black type is already about 9:1 there and
a heavy scrim would only hide a picture that does not need hiding. The wash is
held flat at .46 for the first two fifths and let down slowly after that, which
costs the sunrise nothing and still has something left where the last word of
the headline reaches the crown of the tree — the one dark thing any of the copy
crosses. That word measured 1.6:1 before and 3.9:1 after at 1280px.

**A phone gets the picture, not a rumour of one.** A portrait window onto a
2.1:1 photograph throws away nine tenths of the width, and the tenth left has
to sit under a wash heavy enough to read four paragraphs through. Below 860px
the picture stops being a backdrop and becomes a band at the top, at its own
shape, with the words underneath.

```bash
BASE=http://127.0.0.1:3000 node tests/hero-contrast.mjs
```

It screenshots each piece of copy, sets it to `color: transparent`, screenshots
again, and compares the declared colour against the worst pixel actually behind
the glyphs, at eight widths from 320 to 2560. Ratios off a stylesheet would say
nothing here: the same headline crosses open sky at one width and a tree at
another.

### Link previews

`site.ogImage` is a 1200×630 crop of the same photograph, named by every page
rather than dropped in as `app/opengraph-image.jpg`. Next merges `openGraph`
shallowly, so any page that sets a title of its own replaces the whole object —
image included — and the convention file reaches only the pages that never set
one. Product pages override it with the specimen's own photograph, which is
what someone sharing a tree means to send.
