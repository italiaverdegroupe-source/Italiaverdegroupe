// The catalogue itself, in three languages.
//
//   node tests/catalogue-i18n.test.mjs
//
// The chrome, the pages and the legal documents were translated while the
// sixty-eight specimens were not — so /ar/catalog was an Arabic page with an
// English catalogue down the middle of it, which reads worse than an English
// page does. This is what keeps that from coming back, and what keeps the
// translations from being wrong in the ways translated catalogues go wrong.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const PC = require('../.test-build/product-copy.cjs');
const products = JSON.parse(readFileSync('src/data/products.json', 'utf8'));

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// The genera this catalogue sells under their botanical names.
//
// The rule migration 014 states, and the one that costs real money if it is
// broken: a plant schedule that says something other than the binomial is a
// schedule somebody orders the wrong tree from. Where the English name IS the
// botanical name, it must survive into every language unchanged.
const BOTANICAL = [
  'Agave Americana', 'Agave Marginata', 'Agave Mediopicta', 'Agave Attenuata',
  'Agave Filifera', 'Rhapis Excelsa', 'Cycas Revoluta', 'Archontophoenix',
  'Brahea Armata', 'Butia Capitata', 'Chamaerops Humilis', 'Chamaerops Excelsa',
  'Phoenix Canariensis', 'Washingtonia Robusta', 'Ficus Microcarpa',
  'Yucca Rostrata',
];
/** A name that is Latin all the way through — nothing in it to translate. */
const allBotanical = (name) => {
  const g = BOTANICAL.find((b) => name.startsWith(b));
  // Trailing Latin epithets are part of the name; a trailing English word
  // (Large, Tall, Specimen, Young) is a description and must translate.
  return Boolean(g) && name.slice(g.length).trim()
    .match(/^(Alexandrae|Marginata|Alba|Variegata)?$/);
};

// ── every specimen, in every language ────────────────────────
const gaps = [];
for (const p of products) {
  for (const l of ['ar', 'it']) {
    const c = PC.productCopy(p, l);
    if (!c.name) gaps.push(`${p.reference}/${l} name missing`);
    // Identical is CORRECT for a name that is Latin all the way through —
    // "Agave Mediopicta Alba" has nothing in it to translate, and a version of
    // this check that demanded it change would be demanding a mistake. It is
    // only a gap where an English word was left standing.
    else if (c.name === p.name && !allBotanical(p.name)) {
      gaps.push(`${p.reference}/${l} name untranslated: ${p.name}`);
    }
    // A description is prose. There is never a reason for it to be identical.
    if (!c.description || c.description === p.description) {
      gaps.push(`${p.reference}/${l} description`);
    }
  }
}
check('THE POINT: all 68 specimens are translated into both languages',
  gaps.length === 0, `${gaps.length} gap(s): ${gaps.slice(0, 5).join(' ')}`);

const lost = [];
for (const p of products) {
  const genus = BOTANICAL.find((b) => p.name.startsWith(b));
  if (!genus) continue;
  for (const l of ['ar', 'it']) {
    const { name } = PC.productCopy(p, l);
    if (!name.includes(genus)) lost.push(`${p.reference}/${l}: "${name}" lost "${genus}"`);
  }
}
check('THE POINT: a botanical name survives translation unchanged',
  lost.length === 0, lost.slice(0, 3).join(' | '));

// ── and a common name is NOT left in English ─────────────────
// The mirror of the rule above: "Olive Tree Premium" is a description, not a
// binomial, and carrying it through untouched would be the same bug wearing
// the other coat.
const stillEnglish = [];
for (const p of products) {
  if (BOTANICAL.some((b) => p.name.startsWith(b))) continue;
  for (const l of ['ar', 'it']) {
    const { name } = PC.productCopy(p, l);
    if (/\b(Olive|Tree|Cactus|Pear|Barrel|Group|Mixed|Columnar|Golden|Organ|Prickly)\b/.test(name)
        && l === 'ar') {
      stillEnglish.push(`${p.reference}/ar: ${name}`);
    }
  }
}
check('a common name is translated rather than carried through',
  stillEnglish.length === 0, stillEnglish.slice(0, 3).join(' | '));

// ── collections ──────────────────────────────────────────────
const families = [...new Set(products.map((p) => p.family))];
const famGaps = [];
for (const f of families) {
  for (const l of ['ar', 'it']) {
    if (PC.familyName(f, l) === f) famGaps.push(`${f}/${l}`);
    if (!PC.familyBlurb(f, 'x', l) || PC.familyBlurb(f, 'x', l) === 'x') {
      famGaps.push(`${f}/${l} blurb`);
    }
  }
}
check('every collection has a name and a blurb in each language',
  famGaps.length === 0, famGaps.join(' '));

// ── specification tables ─────────────────────────────────────
const attrNames = [...new Set(products.flatMap((p) => Object.keys(p.attributes)))];
const attrGaps = attrNames.filter((n) =>
  ['ar', 'it'].some((l) => PC.attribute(n, '', l).name === n));
check('every specification label is translated', attrGaps.length === 0, attrGaps.join(' '));

// A measurement must NOT be translated: re-typing numbers per locale is how a
// catalogue quotes one size to an Arabic reader and another to an English one.
const measurements = [...new Set(products.flatMap((p) =>
  Object.values(p.attributes).filter((v) => /\d/.test(String(v)))))];
const mangled = measurements.filter((v) =>
  ['ar', 'it'].some((l) => PC.attribute('Height', String(v), l).value !== String(v)));
check('THE POINT: a measurement is identical in all three languages',
  mangled.length === 0, mangled.slice(0, 3).join(' | '));

// ── plurals ──────────────────────────────────────────────────
// "1 specimen" / "12 specimens" is correct English and nonsense elsewhere.
// Arabic distinguishes none, one, two, a few and many; an English 's' on an
// Arabic noun is not a near miss, it is a different word.
const en1 = PC.specimenCount(1, 'en');
const enN = PC.specimenCount(12, 'en');
check('English still says what collections.test.mjs expects',
  en1 === '1 specimen' && enN === '12 specimens', `${en1} / ${enN}`);
check('Italian agrees its noun with the number',
  PC.specimenCount(1, 'it') === '1 esemplare'
  && PC.specimenCount(12, 'it') === '12 esemplari',
  `${PC.specimenCount(1, 'it')} / ${PC.specimenCount(12, 'it')}`);
const ar = [0, 1, 2, 3, 11, 100].map((n) => PC.specimenCount(n, 'ar'));
check('Arabic uses its own forms rather than a number with an s',
  new Set(ar).size >= 5 && !ar.some((s) => /s\b/.test(s)), ar.join(' · '));

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
