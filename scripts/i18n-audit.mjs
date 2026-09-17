// What is translated, and what is still English pretending otherwise.
//
//   node scripts/i18n-audit.mjs
//
// Written because "the site speaks three languages" is easy to say and hard
// to be sure of. It walks the source for strings a visitor or an operator can
// actually read, and reports them by surface with the reason each one is or is
// not covered — so the answer is a number rather than an impression.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e)) files.push(p);
  }
})('src');

/** Text a person reads: between tags, and in the attributes that speak. */
function visibleStrings(src) {
  const out = [];
  // JSX text nodes, at least two words or one long word
  for (const m of src.matchAll(/>\s*([A-Z][^<>{}\n]{3,120}?)\s*</g)) out.push(m[1].trim());
  for (const a of ['aria-label', 'placeholder', 'title', 'alt']) {
    for (const m of src.matchAll(new RegExp(`${a}="([^"]{3,120})"`, 'g'))) out.push(m[1]);
  }
  // Thrown messages an operator sees on screen
  for (const m of src.matchAll(/(?:Error|refuse)\([^)]*?['"`]([A-Z][^'"`]{8,160})['"`]/g)) out.push(m[1]);
  return out.filter((s) => !/^[\s\d.,:%·—–-]*$/.test(s));
}

const site = files.filter((f) => f.includes('[lang]') || (f.includes('components') && !f.includes('components/admin')));
const consoleFiles = files.filter((f) => f.includes('(console)') || f.includes('components/admin'));

const UI = require('../.test-build/ui.cjs');
const C = require('../.test-build/content.cjs');
const SC = require('../.test-build/site-copy.cjs');
const A = require('../.test-build/admin-ui.cjs');

const covered = new Set([
  ...Object.values(UI.UI_DICTS.en),
  ...Object.keys(UI.UI_DICTS.en),
  ...Object.values(C.BLOCKS).map((b) => b.fallback),
  ...SC.COPY_KEYS,
  ...A.ADMIN_KEYS,
]);
const isCovered = (s) => covered.has(s) || [...covered].some((c) => c.includes(s) || s.includes(c));

function report(label, list) {
  const found = new Map();
  for (const f of list) {
    for (const s of visibleStrings(readFileSync(f, 'utf8'))) {
      if (!found.has(s)) found.set(s, f);
    }
  }
  const uncovered = [...found].filter(([s]) => !isCovered(s));
  const words = (a) => a.reduce((n, [s]) => n + s.split(/\s+/).length, 0);
  console.log(`\n══ ${label}`);
  console.log(`   ${found.size} readable strings, ${found.size - uncovered.length} translatable, `
    + `${uncovered.length} still English-only (${words(uncovered)} words)`);
  const byFile = new Map();
  for (const [s, f] of uncovered) {
    const k = f.replace('src/app/', '').replace('src/', '');
    (byFile.get(k) ?? byFile.set(k, []).get(k)).push(s);
  }
  for (const [f, ss] of [...byFile].sort((a, b) => b[1].length - a[1].length).slice(0, 14)) {
    console.log(`   ${String(ss.length).padStart(4)}  ${f}`);
  }
  return uncovered.length;
}

// How much of the console is actually WIRED to the dictionary, which is a
// different question from how much of the dictionary is translated. A
// dictionary can be 100% translated and cover a tenth of the screens.
function consoleWiring() {
  let wired = 0, hard = 0;
  const perFile = [];
  for (const f of consoleFiles) {
    const src = readFileSync(f, 'utf8');
    const w = (src.match(/\bt\(['"`]/g) ?? []).length;
    const h = visibleStrings(src).length;
    wired += w; hard += Math.max(0, h - w);
    if (h - w > 0) perFile.push([f.replace('src/app/(console)/admin/', '').replace('src/components/admin/', 'nav:'), h - w]);
  }
  console.log(`\n══ CONSOLE WIRING`);
  console.log(`   ${wired} strings go through the dictionary; ~${hard} are still written into the screen`);
  for (const [f, n] of perFile.sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`   ${String(n).padStart(4)}  ${f}`);
  }
}

console.log('═══ what a reader can see, and whether it can be translated ═══');
const a = report('PUBLIC SITE', site);
const b = report('OPERATIONS CONSOLE', consoleFiles);
consoleWiring();
console.log(`\n   total still English-only: ${a + b}`);
