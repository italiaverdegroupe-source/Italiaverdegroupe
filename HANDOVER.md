# Handover

What is built, what is left, and what only the owner can do.

Everything below was checked against the running production build and the live
database on 19 September 2026, not assumed.

---

## 1. What only you can supply

The software is finished around each of these. Nothing needs a developer; each
is a field in the console or a variable on Railway, and each one is wired the
moment it is filled.

### a. A way to send email — **done, and proved**

Mail works. A message was put on the real queue in production, the server's
own drain loop sent it, and it arrived in the inbox — not the spam folder —
on the first attempt:

```
status:      sent
attempts:    1
status_note: Sent (01a0bc32-1365-7359-95a8-2ecab5a2be74)
```

It goes over **Resend's HTTPS API**, not SMTP, and that was not a preference.
Railway disables outbound SMTP below the Pro plan, so the Gmail SMTP URL that
was tried first could not open a socket at all — one attempt died with
`ENETUNREACH` on IPv6 (outbound IPv6 is off on this service) and the next hung
until it timed out, because the packet is dropped at the platform's egress
layer. Resend needs only HTTPS, which nothing blocks.

What is set on the Railway service:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | the Resend key |
| `MAIL_FROM` | an address on `verdegardenae.com` |
| `MAIL_REPLY_TO` | `italiaverdegroupe@gmail.com`, so a reply reaches a mailbox that exists — the domain itself has no MX and receives nothing |

`SMTP_URL` is **deleted**, and it must stay deleted: `mailProvider()` prefers
SMTP whenever it is set, so putting it back would silently disable a working
Resend key.

**The DNS, verified from outside Cloudflare rather than taken on trust:**

```
MX   send.verdegardenae.com              feedback.forge.rmta.net (10)
TXT  send.verdegardenae.com              v=spf1 ip4:52.3.252.119 ip4:44.222.39.36
                                         ip4:199.249.231.0/24 ~all
TXT  resend._domainkey.verdegardenae.com p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ… (218 chars)
```

**Why this domain is one to be careful with.** There is already a DMARC record
on it, from GoDaddy, set to quarantine:

```
v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
```

`p=quarantine` means anything claiming to be from this domain that fails DMARC
goes to spam. The two records above are what stop that: the return path is
`send.verdegardenae.com` and DKIM signs as `verdegardenae.com`, and with
`aspf=r`/`adkim=r` — relaxed — both align with the parent domain, so DMARC
passes. That is why a brand-new sending domain landed in an inbox.

Two things follow, and both matter more than they look:

- **Never add a second `_dmarc` record.** Resend may offer one. Two DMARC
  records on the same name cancel each other out and the domain ends up with
  no policy at all — worse than either record alone.
- **Never remove the SPF or DKIM record** while that DMARC policy stands. The
  day one of them goes, every notification this system sends goes to spam,
  silently, and the queue will still say `sent`.

### b. A recipient on the alert rules — **done**

All 16 rules are active and every one now notifies
`italiaverdegroupe@gmail.com`. Change any of them in a few seconds on
**Alerts → the rules**; a rule can go to a person, a role or a different
address.

They arrive — (a) is done and was tested end to end.

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
