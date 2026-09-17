// The five legal documents, in three languages.
//
//   node tests/legal.test.mjs
//   BASE=http://127.0.0.1:3000 node tests/legal.test.mjs     (…and the pages)
//
// These pages were 4,463 words of JSX in five components. A clause could be
// changed in one language and not the others, a section could be dropped in
// translation, and a `{token}` could be misspelt and render as the literal
// word "{city}" on a contract page — none of it visible until a customer read
// it. Now the documents are data, so all of that is checkable:
//
//   · every document exists in all three languages
//   · the same sections, in the same order, under the same anchors — because
//     an anchor is a URL somebody may have sent to their lawyer
//   · the same block structure, so a list does not become a paragraph
//   · every {token} used is one the page actually supplies
//   · every internal link points at a page that exists
//   · nothing left in English on an Arabic or Italian page
//   · the clauses the owner asked for are present in all three: governing law,
//     the language clause, complaints, retention, cookies, delivery
//
// With BASE set it also loads the fifteen pages and checks the rendered text
// — that no token survived to the screen, that the English-prevails banner is
// on the translated pages and not the English one, and that the contents list
// and the headings agree.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { LEGAL_DOCS, getLegalDoc, getLegalIndex } = require('../.test-build/legal.cjs');

const LOCALES = ['en', 'ar', 'it'];
const SLUGS = ['privacy', 'terms', 'terms-of-sale', 'refunds', 'disclaimer'];

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── every document, in every language ────────────────────────
const missing = [];
for (const s of SLUGS) {
  for (const l of LOCALES) {
    const d = LEGAL_DOCS[s]?.[l];
    if (!d || !d.title || !d.sections?.length) missing.push(`${s}/${l}`);
  }
}
check('THE POINT: all five documents exist in all three languages',
  missing.length === 0, missing.join(' '));

// ── the same shape in every language ─────────────────────────
// An anchor is a URL. /privacy#how-long sent to a lawyer must still be
// #how-long when they open it in Arabic.
const shapeOf = (d) => d.sections.map((s) =>
  `${s.id}:${s.body.map((b) => b.t).join(',')}`).join('|');

const drift = [];
for (const s of SLUGS) {
  const base = shapeOf(LEGAL_DOCS[s].en);
  for (const l of ['ar', 'it']) {
    const got = shapeOf(LEGAL_DOCS[s][l]);
    if (got !== base) {
      const a = base.split('|'), b = got.split('|');
      const at = a.findIndex((x, i) => x !== b[i]);
      drift.push(`${s}/${l} §${at + 1}: "${a[at] ?? '—'}" vs "${b[at] ?? '—'}"`);
    }
  }
}
check('THE POINT: same sections, same anchors, same block structure in each language',
  drift.length === 0, drift.join(' | '));

// list items are counted too — a bullet dropped in translation is a lost clause
const counts = [];
for (const s of SLUGS) {
  for (const l of ['ar', 'it']) {
    LEGAL_DOCS[s].en.sections.forEach((sec, i) => {
      sec.body.forEach((b, j) => {
        const o = LEGAL_DOCS[s][l].sections[i]?.body[j];
        if (!o) return;
        const n = (x) => (x.items?.length ?? 0);
        if (n(b) !== n(o)) counts.push(`${s}/${l} #${sec.id} block ${j}: ${n(b)} vs ${n(o)}`);
      });
    });
  }
}
check('no list or definition item is dropped in translation',
  counts.length === 0, counts.join(' | '));

// ── tokens ───────────────────────────────────────────────────
// What each page actually supplies. Mirrors the page components; a token used
// in a document and not listed here renders as the literal "{leadMin}".
const SUPPLIED = {
  privacy: [], terms: [], refunds: [],
  'terms-of-sale': ['quoteValidityDays', 'leadMin', 'leadMax', 'vat'],
  disclaimer: ['underReview', 'total'],
};
const ALWAYS = ['legalName', 'city', 'country', 'address', 'currency'];

const textOf = (d) => {
  const out = [];
  const push = (b) => {
    if (b.text) out.push(b.text);
    if (b.items) for (const i of b.items) out.push(typeof i === 'string' ? i : `${i.term} ${i.def}`);
  };
  d.sections.forEach((s) => { out.push(s.heading); s.body.forEach(push); });
  out.push(d.title, d.summary, d.metaTitle, d.metaDescription, d.cardLine, d.cardNote);
  if (d.footnote) out.push(d.footnote);
  return out.filter(Boolean).join('\n');
};

const unknown = [];
for (const s of SLUGS) {
  const ok = new Set([...ALWAYS, ...SUPPLIED[s]]);
  for (const l of LOCALES) {
    for (const m of textOf(LEGAL_DOCS[s][l]).matchAll(/\{(\w+)\}/g)) {
      if (!ok.has(m[1])) unknown.push(`${s}/${l}: {${m[1]}}`);
    }
  }
}
check('THE POINT: every {token} is one the page supplies',
  unknown.length === 0, [...new Set(unknown)].join(' '));

// and the reverse: a token used in English must be used in the translations,
// or the translated clause has silently lost the company name or the city.
const lost = [];
for (const s of SLUGS) {
  const en = [...new Set([...textOf(LEGAL_DOCS[s].en).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
  for (const l of ['ar', 'it']) {
    const got = new Set([...textOf(LEGAL_DOCS[s][l]).matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
    for (const t of en) if (!got.has(t)) lost.push(`${s}/${l}: {${t}}`);
  }
}
check('no token is dropped from a translation', lost.length === 0, lost.join(' '));

// ── links ────────────────────────────────────────────────────
const PAGES = new Set(['/quote', '/contact', '/catalog', '/collections', '/journal',
  '/about', '/services', '/legal', '/shortlist',
  ...SLUGS.map((s) => `/${s}`)]);
const badLinks = [];
for (const s of SLUGS) {
  for (const l of LOCALES) {
    for (const m of textOf(LEGAL_DOCS[s][l]).matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (href.startsWith('/') && !PAGES.has(href)) badLinks.push(`${s}/${l}: ${href}`);
      // A document must not link to itself — a reader clicking it goes nowhere.
      if (href === `/${s}`) badLinks.push(`${s}/${l}: links to itself`);
    }
  }
}
check('every internal link points at a page that exists',
  badLinks.length === 0, [...new Set(badLinks)].join(' '));

// links must survive translation, or an Arabic reader loses the route to the
// terms of sale that the English reader was given.
const linkDrift = [];
for (const s of SLUGS) {
  const en = [...textOf(LEGAL_DOCS[s].en).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).sort();
  for (const l of ['ar', 'it']) {
    const got = [...textOf(LEGAL_DOCS[s][l]).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).sort();
    if (en.join() !== got.join()) linkDrift.push(`${s}/${l}: ${en.join()} vs ${got.join()}`);
  }
}
check('the same links appear in every language', linkDrift.length === 0, linkDrift.join(' | '));

// ── actually translated ──────────────────────────────────────
// Latin letters are legitimate in Arabic and Italian text — Olea europaea,
// WCAG, Railway, VAT, HttpOnly. What is NOT legitimate is a whole English
// sentence, so this looks for a run of English words rather than any Latin.
const ENGLISH_RUN = /\b(?:the|and|of|to|for|that|with|from|which|because|this)\b[^.!?]{0,80}\b(?:the|and|of|to|for|that|with|from|which|because|this)\b/i;
const untranslated = [];
for (const s of SLUGS) {
  for (const l of ['ar', 'it']) {
    const en = textOf(LEGAL_DOCS[s].en).split('\n');
    textOf(LEGAL_DOCS[s][l]).split('\n').forEach((line, i) => {
      if (l === 'ar' && ENGLISH_RUN.test(line)) untranslated.push(`${s}/ar: ${line.slice(0, 60)}`);
      // Italian shares many short words with English, so the test there is
      // identity with the English line, which is the actual failure mode.
      if (l === 'it' && line === en[i] && line.length > 40) {
        untranslated.push(`${s}/it: ${line.slice(0, 60)}`);
      }
    });
  }
}
check('THE POINT: nothing is left in English on a translated page',
  untranslated.length === 0, [...new Set(untranslated)].slice(0, 4).join(' | '));

// ── the clauses that were missing, and were asked for ────────
// Each is checked in all three languages by a word that cannot appear by
// accident, so this fails if a clause is written in English and not translated.
const REQUIRED = {
  'governing law': { all: SLUGS, en: /governed by the laws/i, ar: /قوانين دولة الإمارات/, it: /regolat[aeio] dalle leggi/i },
  'the English-prevails clause': { all: SLUGS, en: /the English governs/i, ar: /يُعتدّ بالنص الإنجليزي/, it: /prevale l’inglese/i },
  'a complaints route': { all: ['privacy', 'terms', 'terms-of-sale', 'refunds'], en: /complain/i, ar: /شكوى|الشكاوى|الشكوى/, it: /reclam/i },
  'data retention periods': { all: ['privacy'], en: /five years/i, ar: /خمس سنوات/, it: /cinque anni/i },
  'the regulator to complain to': { all: ['privacy'], en: /UAE Data Office/i, ar: /مكتب البيانات/, it: /UAE Data Office/i },
  'cookies and local storage': { all: ['privacy'], en: /local storage/i, ar: /التخزين المحلي/, it: /archivio locale/i },
  'delivery and offloading': { all: ['terms-of-sale'], en: /offload/i, ar: /تنزيل|التنزيل/, it: /scarico/i },
  'import permits and plant health': { all: ['terms-of-sale'], en: /phytosanitary/i, ar: /الصحة النباتية/, it: /fitosanitar/i },
  'force majeure': { all: ['terms-of-sale'], en: /force majeure/i, ar: /القوة القاهرة/, it: /forza maggiore/i },
  'statutory rights are untouched': { all: ['refunds'], en: /under UAE consumer or commercial law/i, ar: /حماية المستهلك/, it: /a tutela dei consumatori/i },
};
for (const [name, r] of Object.entries(REQUIRED)) {
  const gaps = [];
  for (const s of r.all) {
    for (const l of LOCALES) {
      if (!r[l].test(textOf(LEGAL_DOCS[s][l]))) gaps.push(`${s}/${l}`);
    }
  }
  check(`every document that needs it has ${name}`, gaps.length === 0, gaps.join(' '));
}

// ── the index page reads from the same documents ─────────────
for (const l of LOCALES) {
  const idx = getLegalIndex(l);
  check(`/legal lists all five documents in ${l}`,
    idx.length === 5 && idx.every((d) => d.title && d.cardLine && d.cardNote),
    idx.map((d) => d.slug).join(' '));
}

// ── nothing empty, nothing absurd ────────────────────────────
const empties = [];
for (const s of SLUGS) {
  for (const l of LOCALES) {
    const d = getLegalDoc(s, l);
    if (d.metaDescription.length < 80 || d.metaDescription.length > 320) {
      empties.push(`${s}/${l} description ${d.metaDescription.length}`);
    }
    d.sections.forEach((sec) => {
      if (!sec.body.length) empties.push(`${s}/${l} #${sec.id} empty`);
      if (!/^[a-z0-9-]+$/.test(sec.id)) empties.push(`${s}/${l} #${sec.id} bad anchor`);
    });
  }
}
check('every section has a body and a usable anchor, every description a sane length',
  empties.length === 0, empties.join(' | '));

// ── the rendered pages ───────────────────────────────────────
if (!process.env.BASE) {
  console.log('  SKIP  the rendered pages — BASE is not set');
} else {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });
  const page = await browser.newPage();
  const B = process.env.BASE;

  const tokensOnScreen = [];
  const bannerWrong = [];
  const tocWrong = [];
  const shortPages = [];

  for (const l of LOCALES) {
    for (const s of [...SLUGS, 'legal']) {
      const url = `${B}${l === 'en' ? '' : `/${l}`}/${s}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const r = await page.evaluate(() => ({
        text: document.body.innerText,
        banner: Boolean(document.querySelector('.lgl-prevails')),
        toc: [...document.querySelectorAll('.lgl-toc a')].map((a) => a.getAttribute('href')),
        heads: [...document.querySelectorAll('.lgl-body section')].map((x) => `#${x.id}`),
      }));
      // A literal {token} on a contract page is the failure this whole file
      // was written to catch.
      const left = r.text.match(/\{[a-zA-Z]\w*\}/g);
      if (left) tokensOnScreen.push(`${url}: ${[...new Set(left)].join(' ')}`);
      if (s !== 'legal') {
        if (r.banner !== (l !== 'en')) bannerWrong.push(`${url}: banner=${r.banner}`);
        if (r.toc.join() !== r.heads.join()) tocWrong.push(`${url}`);
        if (r.text.length < 2500) shortPages.push(`${url}: ${r.text.length}`);
      }
    }
  }
  check('THE POINT: no {token} survives to the screen on any legal page',
    tokensOnScreen.length === 0, tokensOnScreen.join(' | '));
  check('the English-prevails banner is on the translated pages and not the English',
    bannerWrong.length === 0, bannerWrong.join(' | '));
  check('the contents list matches the sections it points at',
    tocWrong.length === 0, tocWrong.join(' '));
  check('every legal page carries its whole document, not a stub',
    shortPages.length === 0, shortPages.join(' | '));

  await browser.close();
}

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
