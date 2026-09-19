# Handover

What is built, what is left, and what only the owner can do.

Everything below was checked against the running production build and the live
database on 19 September 2026, not assumed.

---

## 1. What only you can supply

The software is finished around each of these. Nothing needs a developer; each
is a field in the console or a variable on Railway, and each one is wired the
moment it is filled.

### a. A way to send email — **nothing can be emailed today**

There is no mail transport configured on the Railway service, so the system
cannot send anything at all: not a notification when an enquiry arrives, not
an alert about an overdue invoice, not the test message on the alerts screen.
Enquiries are still captured — they go into the database and appear on
**Leads**, and an alert is raised on the **Alerts** screen the moment one
arrives — but nothing leaves the building, so unless somebody opens the
console, nobody knows.

Set these three on the Railway service (**web → Variables**):

| Variable | What it is |
|---|---|
| `SMTP_URL` *or* `RESEND_API_KEY` | the account that sends the mail |
| `MAIL_FROM` | the address it is sent from, e.g. `no-reply@verdegardenae.com` |

There is no separate "send enquiries to" address: who is told what is decided
by the alert rules in (b), which is one place rather than two that can
disagree.

A Gmail account works: turn on two-factor authentication, create an *app
password*, and use
`SMTP_URL=smtps://italiaverdegroupe%40gmail.com:APPPASSWORD@smtp.gmail.com:465`.
The `@` in the address must be written `%40`. Gmail's own limit is about 500
messages a day, which is far above anything this business will send.

### b. A recipient on the alert rules — **16 rules, 0 recipients**

Every rule is written and switched on. None has anybody to notify, so every
one of them raises an alert on the **Alerts** screen and stops there. Open
**Alerts → the rules**, and set a person or an email address on each. It takes
about five minutes and it is what turns the alerts from a screen you have to
remember to look at into something that reaches you.

This only does anything once (a) is done.

### c. The trade licence, the TRN and the registered address

Not issued yet, and deliberately **not invented anywhere**. No document, no
page and no piece of search-engine markup claims a number this company does
not hold.

The places are reserved and proven to work. Type them into **Settings** and
they appear on the next quotation and the next invoice with no deploy:

| Field on the Settings screen | Where it shows up |
|---|---|
| Trade licence number | letterhead of every quotation and invoice |
| TRN | the same letterhead, and the VAT line once VAT is switched on |
| Registered address, City, Country | under the company name on both documents |

`tests/walkthrough.mjs` fills them in, checks both documents print them, takes
them out again and checks the documents go back to saying nothing — so this is
not a promise, it is a test that runs.

**VAT stays off until the TRN exists.** The console refuses to switch VAT on
without one, because charging VAT without registration is an offence. Until
then every quotation says "exclusive of VAT where applicable", which is the
correct thing for an unregistered company to say.

### d. Reinstall the Railway GitHub App — **pushes are not deploying**

This one is invisible until you look for it, and it is the reason to check it
first. The Railway service watches
`italiaverdegroupe-source/Italiaverdegroupe`, branch
`claude/peaceful-feynman-ealwig`, but the **Railway GitHub App is no longer
installed on the repository**, so the webhook that starts a build is not being
delivered. Railway reports auto-deploy as disabled and refuses to enable it:
*"this repository does not have a Railway GitHub App installation."*

The effect: a whole day of commits sat on GitHub with the live site still
running an older build, with nothing failing and nothing to notice. It was
found by comparing the deployed commit against the branch head, which is worth
doing after any push until this is fixed.

Install it at **[github.com/apps/railway](https://github.com/apps/railway)**,
grant it this repository, then in Railway refresh the repositories and switch
auto-deploy back on. Until then every release is a manual deploy from the
Railway dashboard — pick the service, Deployments, and deploy the branch head.

### e. Google Search Console

Set `GOOGLE_SITE_VERIFICATION` on Railway to the token Google gives you, then
verify the property and submit `https://verdegardenae.com/sitemap.xml`. The
sitemap, `robots.txt` and the structured data are already written and correct;
this is the step that tells Google to come and read them.

### f. Two decisions that are yours, not mine

- **`CANONICAL_REDIRECT=1`** would send `www.verdegardenae.com` and the Railway
  address permanently to `verdegardenae.com`. It is good for search ranking and
  it is a permanent redirect, which is hard to undo if a hostname is wrong. It
  is left off until you say so.
- **The Cloudflare transform rule** that adds the `x-edge-secret` header. The
  secret is already set on Railway; the rule at the Cloudflare end has not been
  confirmed from here. Until it is, the application cannot tell a visitor who
  came through Cloudflare from one who found the Railway address directly —
  which only affects how rate limiting counts, nothing a visitor would see.

---

## 2. What is done

- **The public site** in English, Arabic and Italian — every page, every label,
  every legal document. 683 console strings and every page sentence are
  translated; a missing one is a failing test, not a silent gap.
- **The catalogue**: 68 specimens, 18 collections, 7 emirate pages, all
  prerendered, all three languages.
- **The operations console**: leads, quotations with versions, orders,
  deliveries, invoices, payments, stock, shipments with a customs checklist,
  landed cost, reports, alerts, content editing, settings, accounts, backups.
- **Documents**: a quotation and an invoice laid out for A4, in the language of
  whoever issues them, right-to-left when that language is Arabic.
- **Deleting**, everywhere, added this week: reversible by default, refused
  where the law requires a record kept, permanent only for the owner and only
  once nothing points at the record.
- **Backups** run and are being kept — three good runs recorded.
- **The journal** has its first article, on what decides whether an olive
  tree survives its first Emirati summer, in all three languages. Written in
  the console like any other, and kept in `db/seed/posts/` so it can be
  restored or translated side by side.

## 3. Running it

```bash
npm install
npm run build
npm start            # or, as production does: node .next/standalone/server.js
npm test             # library suites
BASE=http://127.0.0.1:3000 VG_USER=… VG_PW='…' npm test   # and the browser ones
```

The browser suites must run against `npm run build`, not `next dev`. Three of
the defects fixed this week did not exist in a development build and could not
have been found in one.

Schema changes live in `db/migrations/*.sql` and are applied by hand, oldest
first. `016_deletion.sql` is applied to production already.
