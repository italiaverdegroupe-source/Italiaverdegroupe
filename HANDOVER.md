# Handover

What is built, what is left, and what only the owner can do.

Everything below was checked against the running production build and the live
database on 19 September 2026, not assumed.

---

## 1. What only you can supply

The software is finished around each of these. Nothing needs a developer; each
is a field in the console or a variable on Railway, and each one is wired the
moment it is filled.

### a. A way to send email — **SMTP cannot work on this Railway plan**

`SMTP_URL` and `MAIL_FROM` are set on the service, and mail still does not
leave the building. This was not guessed: two messages were put on the real
queue in production, the server's own drain loop tried to send them, and the
queue recorded exactly why each one failed.

```
connect ENETUNREACH 2607:f8b0:4023:c03::6c:465
Connection timeout
```

Both are Railway, not this application, and Railway's own account data
confirms it:

- **The workspace is on the Hobby plan, and Railway disables outbound SMTP
  below Pro.** Their documentation is explicit: *"SMTP is only available on
  the Pro plan and above. Free, Trial, and Hobby plans must use transactional
  email services with HTTPS APIs."* That is the connect timeout — the packet
  is dropped at the egress layer, which is why it hangs rather than being
  refused.
- **Outbound IPv6 is off** (`ipv6EgressEnabled: false`), so the first attempt,
  which resolved smtp.gmail.com to an IPv6 address, failed instantly with
  `ENETUNREACH`. Turning it on would not help: the plan blocks the port on
  either protocol.

No Gmail app password, no port, and no change to this code can get around a
block at the platform. There are two ways out.

**Resend — recommended, free, and already supported by this application.**
Nothing needs to be built: `sendMail()` uses the Resend HTTPS API whenever
`RESEND_API_KEY` is set, and HTTPS is not blocked on any plan. Railway
recommends it over SMTP even on Pro.

1. Create an account at [resend.com](https://resend.com) — the free tier is
   3,000 messages a month, 100 a day, which is far above anything this
   business will send.
2. Add `verdegardenae.com` as a domain and paste the DKIM/SPF records it gives
   you into Cloudflare DNS. This is what lets the company send as itself; mail
   from a verified domain also lands in inboxes rather than spam folders,
   which Gmail SMTP would not have done.
3. On the Railway service set:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | the key Resend gives you |
| `MAIL_FROM` | `no-reply@verdegardenae.com` — **it must be on the verified domain**; Resend will refuse a gmail.com sender, because nobody here owns gmail.com |

4. **Delete `SMTP_URL`.** This one matters: `mailProvider()` prefers SMTP
   whenever it is set, so leaving a dead `SMTP_URL` beside a working
   `RESEND_API_KEY` keeps everything exactly as broken as it is now.
5. Redeploy, then **Alerts → send a test message**. The queue records the
   outcome either way — a provider id when it goes, the provider's own words
   when it does not.

**Or upgrade Railway to Pro** (~$20 a month) and the Gmail SMTP URL already
set will start working after a redeploy. It costs money every month to make
the weaker of the two options work, so it is only worth it if there is another
reason to be on Pro.

Until one of these is done, enquiries are still captured — they go into the
database, appear on **Leads**, and raise an alert on the **Alerts** screen —
but nothing reaches an inbox, so unless somebody opens the console, nobody
knows.

### b. A recipient on the alert rules — **done**

All 16 rules are active and every one now notifies
`italiaverdegroupe@gmail.com`. Change any of them in a few seconds on
**Alerts → the rules**; a rule can go to a person, a role or a different
address.

They will start arriving the moment (a) is done, and not before.

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
