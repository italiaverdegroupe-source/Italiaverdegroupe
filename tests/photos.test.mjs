// What the catalogue promises about its own photographs.
//
//   node tests/photos.test.mjs
//
// Twenty-five of the sixty-eight photographs contradict the specimen they are
// attached to — a "Columnar Cactus" illustrated with a barrel, a Brahea armata
// (a silver-blue fan palm) illustrated with an avenue of green feather palms.
// They are flagged, and the site says "Photo under review" on those cards.
// What is tested here is that the flag actually means something: that nothing
// flagged is ever what a collection or the home page leads with, and that
// every flag carries a note saying what is wrong, because a flag nobody can
// act on is a badge.
//
// Needs no server and no database.
import { readFileSync, existsSync } from 'node:fs';

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const all = JSON.parse(readFileSync('src/data/products.json', 'utf8'));
const families = [...new Set(all.map((p) => p.family))];
const verified = all.filter((p) => p.photoVerified);
const flagged = all.filter((p) => !p.photoVerified);

check('the catalogue was read', all.length > 50, `${all.length} specimens`);

// ── the flag means something ─────────────────────────────────
const noNote = flagged.filter((p) => !p.photoNote || p.photoNote.length < 20);
check('THE POINT: every flagged photograph says what is wrong with it',
  noNote.length === 0, noNote.map((p) => p.reference).join(', '));

const notedButFine = verified.filter((p) => p.photoNote);
check('and nothing carries a note while still claiming to be verified',
  notedButFine.length === 0, notedButFine.map((p) => p.reference).join(', '));

// ── nothing doubtful is ever led with ────────────────────────
// Mirrors getFamilies(): a curated cover is a preference, not an override.
const FAMILY_COVER = {
  Palms: 'VG-PL-020',
  'Ornamental Trees': 'VG-TR-002',
  'Cacti & Succulents': 'VG-CA-004',
};
const coverOf = (family) => {
  const list = all.filter((p) => p.family === family);
  return list.find((p) => p.reference === FAMILY_COVER[family] && p.photoVerified)
    ?? list.find((p) => p.photoVerified) ?? list[0];
};
const badCovers = families.map(coverOf).filter((p) => !p.photoVerified);
check('THE POINT: no collection is fronted by a photograph the catalogue doubts',
  badCovers.length === 0, badCovers.map((p) => `${p.family}→${p.reference}`).join(', '));

for (const [family, ref] of Object.entries(FAMILY_COVER)) {
  const named = all.find((p) => p.reference === ref);
  check(`the curated cover for ${family} exists and belongs to it`,
    named !== undefined && named.family === family, `${ref} → ${named?.family}`);
}

// The home page takes one showcase specimen per family. A family with nothing
// verified simply drops out of that row rather than crashing it — but it also
// means a whole family goes unrepresented, which is worth knowing about.
const unrepresented = families.filter((f) => !verified.some((p) => p.family === f));
check('every family still has at least one photograph fit to lead with',
  unrepresented.length === 0, unrepresented.join(', '));

// ── the data points at real files ────────────────────────────
const missing = all.filter((p) => !existsSync(`public/products/${p.image}`));
check('every specimen points at a photograph that exists on disk',
  missing.length === 0, missing.map((p) => `${p.reference}:${p.image}`).join(', '));

const dupImage = new Map();
for (const p of all) dupImage.set(p.image, (dupImage.get(p.image) ?? 0) + 1);
const shared = [...dupImage.entries()].filter(([, n]) => n > 1);
check('no two specimens are illustrated by the same photograph',
  shared.length === 0, shared.map(([f, n]) => `${f}×${n}`).join(', '));

const dupRef = new Map();
for (const p of all) dupRef.set(p.reference, (dupRef.get(p.reference) ?? 0) + 1);
check('references are unique',
  [...dupRef.values()].every((n) => n === 1),
  [...dupRef.entries()].filter(([, n]) => n > 1).map(([r]) => r).join(', '));

const dupSlug = new Map();
for (const p of all) dupSlug.set(p.slug, (dupSlug.get(p.slug) ?? 0) + 1);
check('slugs are unique, so no two specimens claim the same URL',
  [...dupSlug.values()].every((n) => n === 1),
  [...dupSlug.entries()].filter(([, n]) => n > 1).map(([s]) => s).join(', '));

// ── the shape the pages rely on ──────────────────────────────
const noHeight = all.filter((p) => !/([\d.]+)\s*-\s*([\d.]+)\s*m/.test(p.attributes?.Height ?? ''));
check('every specimen states a height range, which the collections page reads',
  noHeight.length === 0, noHeight.map((p) => p.reference).join(', '));

console.log(`\n  ${flagged.length} of ${all.length} photographs are under review` +
  ` — see scripts/photo-audit.mjs`);
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
