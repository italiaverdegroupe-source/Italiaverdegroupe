// How somebody actually reaches this company.
//
//   node tests/contact.test.mjs
//   BASE=http://127.0.0.1:3000 node tests/contact.test.mjs   (…and the pages)
//
// Every channel on this site is gated on being configured — the rule is that
// an advertised channel nobody answers is worse than none. The cost of that
// rule is that a typo in one field silently removes the only way to contact
// the company, from every page, with nothing on screen to show it happened.
// Nobody files a bug for a footer that is merely missing a line.
//
// So this checks both halves: the channels that ARE set reach the right
// place, and the ones that are NOT stay invisible rather than rendering a
// dead icon.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { renderToStaticMarkup } = require('../node_modules/react-dom/server.browser.js');
const Social = require('../.test-build/social.cjs').default;
const { site } = require('../.test-build/site.cjs');

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── the details themselves ───────────────────────────────────
// A contact detail is the one field where "roughly right" is worthless: an
// email with a typo bounces and a WhatsApp number with a stray character opens
// a chat with nobody.
check('the enquiry mailbox is a real address',
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(site.email), site.email);

// wa.me takes digits only, with the country code and no +. A number stored
// with spaces or a + produces a link that opens WhatsApp on an error.
check('THE POINT: the WhatsApp number is in the form wa.me accepts',
  /^\d{8,15}$/.test(site.whatsapp), `wa.me/${site.whatsapp}`);
check('and the number shown to a reader matches the one dialled',
  site.whatsappLabel.replace(/\D/g, '') === site.whatsapp,
  `${site.whatsappLabel} → ${site.whatsapp}`);

// ── the marks, and the rule that hides them ──────────────────
const html = (links) => renderToStaticMarkup(Social({ links }));

check('THE POINT: nothing is drawn when no account has been added',
  html({}) === '' || !html({}).includes('<svg'),
  'an icon linking nowhere is a dead end in the one place a visitor looks');

const one = html({ facebook: 'https://facebook.com/verdegarden' });
// On the label, not on the bare word: the component ships an inline <style>
// whose comment happens to mention Instagram, and a naive substring match
// reported a mark that is not there. The label is what a screen reader
// announces and what actually distinguishes one mark from another.
const marks = (h) => [...h.matchAll(/aria-label="([^"]+)"/g)].map((m) => m[1]);
check('a saved link draws its own mark, and only its own',
  marks(one).join() === 'Facebook', marks(one).join(' ') || '(none)');
check('and points at the address that was saved',
  one.includes('href="https://facebook.com/verdegarden"'));

const all = html({
  instagram: 'https://instagram.com/x', linkedin: 'https://linkedin.com/company/x',
  facebook: 'https://facebook.com/x', youtube: 'https://youtube.com/@x',
  tiktok: 'https://tiktok.com/@x',
});
for (const name of ['Instagram', 'LinkedIn', 'Facebook', 'YouTube', 'TikTok']) {
  check(`${name} has a mark of its own`, all.includes(`aria-label="${name}"`));
}
// Five accounts, five links — a mark that renders without an href is a button
// that looks like a link and does nothing.
check('every mark carries an href', (all.match(/<a href="http/g) ?? []).length === 5,
  `${(all.match(/<a href="http/g) ?? []).length} of 5`);

// A half-typed value must not produce a mark. "instagram.com/x" without a
// scheme is a RELATIVE link — it would point at a page on this site.
check('a link with no scheme is refused rather than rendered',
  !html({ instagram: 'instagram.com/verdegarden' }).includes('<svg'));
check('and so is a javascript: URL somebody pasted into the console',
  !html({ facebook: 'javascript:alert(1)' }).includes('<svg'));

// Every outbound link opens away from the site and cannot reach back into it.
check('outbound links are safe to open',
  all.includes('rel="noopener noreferrer me"') && all.includes('target="_blank"'));

// ── on the page ──────────────────────────────────────────────
if (!process.env.BASE) {
  console.log('  SKIP  the rendered pages — BASE is not set');
} else {
  const B = process.env.BASE;
  const missing = [];
  for (const path of ['/', '/ar', '/it', '/contact', '/ar/contact']) {
    const body = await (await fetch(`${B}${path}`)).text();
    if (!body.includes(`mailto:${site.email}`)) missing.push(`${path}: no mailbox`);
    if (!body.includes(`wa.me/${site.whatsapp}`)) missing.push(`${path}: no WhatsApp`);
  }
  check('THE POINT: every page carries a way to reach the company',
    missing.length === 0, missing.join(' | '));

  // The floating button is the one a buyer standing on a site actually uses.
  const home = await (await fetch(`${B}/`)).text();
  check('the WhatsApp button is on the page, not only in the footer',
    home.includes('class="wa"'));
}

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
