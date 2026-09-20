// Nothing may write a <script> from a database string without escaping it.
//
//   node tests/xss.test.mjs
//
// src/lib/schema.ts exports ldJson(), which is JSON.stringify followed by
// replacing '<' with its unicode escape. Next's own JSON-LD guide says to do
// exactly that, and for a reason: JSON.stringify leaves "</script>" verbatim,
// so any database string containing one closes the ld+json block early and
// everything after it is parsed as HTML. The site's CSP allows 'unsafe-inline'
// — a deliberate trade for prerendering — so an injected <script> runs.
//
// The helper existed and three call sites used it. Six did not: the homepage
// and /services FAQ blocks (free text a `sales` account can write), every
// journal article's headline, the collections index, the emirate pages and the
// specimen pages. A grep finds them in ten seconds, which is how an auditor
// would have found them.
import { readdirSync, statSync, readFileSync } from 'node:fs';

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = `${dir}/${name}`;
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.tsx?$/.test(name)) files.push(full);
  }
})('src');

// The dangerous shape, whatever the whitespace or line breaks between tokens.
const RAW = /dangerouslySetInnerHTML\s*=\s*\{\{\s*__html:\s*JSON\.stringify/;
const offenders = files.filter((f) => RAW.test(readFileSync(f, 'utf8')));
check('THE POINT: no <script> is built with a bare JSON.stringify',
  offenders.length === 0, offenders.join(' '));

// And every ld+json tag that exists goes through the helper.
const bad = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  if (!src.includes('application/ld+json')) continue;
  const tags = (src.match(/application\/ld\+json/g) ?? []).length;
  const helped = (src.match(/dangerouslySetInnerHTML=\{ldJson\(/g) ?? []).length;
  if (helped < tags) bad.push(`${f} (${helped}/${tags})`);
}
check('every ld+json block uses ldJson()', bad.length === 0, bad.join(' '));

// The helper itself still does the one thing it is for.
const schema = readFileSync('src/lib/schema.ts', 'utf8');
check('and ldJson still escapes the character that closes a script tag',
  /ldJson[\s\S]{0,200}replace\(\/<\/g,\s*'\\\\u003c'\)/.test(schema)
  || /ldJson[\s\S]{0,200}u003c/.test(schema));

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
