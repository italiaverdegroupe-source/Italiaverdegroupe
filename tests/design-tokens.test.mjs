// Every `var(--token)` on this site must resolve to something.
//
//   node tests/design-tokens.test.mjs
//
// This exists because `--rule` and `--brass-600` were used in six files and
// defined in none. CSS does not complain about that: a custom property with no
// value makes the whole declaration invalid at computed-value time, so
// `border-top: 1px solid var(--rule)` quietly becomes no border at all and
// `color: var(--brass-600)` quietly inherits. Nothing errors, nothing logs, and
// the page just looks slightly wrong forever. A grep is the only thing that
// catches it, so here is the grep, as a test.
//
// Needs no server and no database.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e)) files.push(p);
  }
})('src');

const defined = new Set();
const used = new Map();          // token -> Set of files
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1]);
  // Only bare uses. `var(--x, #fff)` carries its own answer and is fine.
  for (const m of s.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g)) {
    if (!used.has(m[1])) used.set(m[1], new Set());
    used.get(m[1]).add(f);
  }
}

check('the stylesheet was actually read', files.length > 10 && defined.size > 20,
  `${files.length} files, ${defined.size} tokens`);

// next/font declares these on the <html> element rather than in a stylesheet,
// so they are legitimately absent from the source — but only if every shell
// still asks for them. The site and the console have a root layout each, and a
// console that forgot would fall back to the browser's serif on every screen.
const roots = files.filter((f) => /layout\.tsx$/.test(f) && readFileSync(f, 'utf8').includes('<html'));
check('both root layouts were found', roots.length === 2, roots.join(', '));
const declaresFont = (f, t) => {
  const s = readFileSync(f, 'utf8');
  return s.includes(`variable: '${t}'`) || s.includes(`variable: "${t}"`);
};

const latinFonts = ['--font-inter', '--font-fraunces'];
for (const t of latinFonts) {
  const declaring = roots.filter((f) => declaresFont(f, t));
  check(`${t} is declared by next/font in every root layout`,
    declaring.length === roots.length, `${declaring.length} of ${roots.length}`);
}

// The Arabic faces are the opposite rule: the SITE layout must declare them,
// and the console must not. Arabic pages set --font-sans and --font-display to
// these under [dir='rtl'], so a site layout that dropped them would render
// Arabic in a Latin serif with no Arabic glyphs in it. The console is an
// English-only tool, and loading two Arabic webfonts on every operations
// screen would be weight bought for nobody.
const arabicFonts = ['--font-arabic-display', '--font-arabic-body'];
const siteRoot = roots.find((f) => f.includes('[lang]'));
const consoleRoot = roots.find((f) => f.includes('(console)'));
check('the site root layout is the one under [lang]', Boolean(siteRoot), String(siteRoot));
check('the console has a root layout of its own', Boolean(consoleRoot), String(consoleRoot));
for (const t of arabicFonts) {
  check(`${t} is declared by the site layout`,
    Boolean(siteRoot) && declaresFont(siteRoot, t));
  check(`${t} is NOT loaded by the console`,
    Boolean(consoleRoot) && !declaresFont(consoleRoot, t));
}

const fromFont = [...latinFonts, ...arabicFonts];

const missing = [...used.keys()].filter((t) => !defined.has(t) && !fromFont.includes(t));
check('THE POINT: no custom property is used without being defined',
  missing.length === 0,
  missing.map((t) => `${t} (${[...used.get(t)].join(', ')})`).join(' | '));

// The two that started this, named so a revert is loud rather than subtle.
for (const t of ['--line', '--line-soft', '--bg-raised', '--olive-400', '--brass-700']) {
  check(`${t} is defined`, defined.has(t));
}

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
