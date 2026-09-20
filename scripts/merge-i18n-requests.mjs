// Merges i18n-requests/*.json into the console dictionary.
//
//   node scripts/merge-i18n-requests.mjs [--check]
//
// The dictionaries are single files thousands of lines long, and several
// agents fixing different screens all need to add strings to them at once.
// Letting each one edit the file directly means the last writer wins and the
// rest of the work is silently lost, so they each write a request file instead
// and this merges them in one pass.
//
// A key already present is left exactly as it is: a translation somebody
// reviewed is not overwritten by a generated one.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const CHECK = process.argv.includes('--check');
const DIR = 'i18n-requests';
if (!existsSync(DIR)) { console.log('no requests'); process.exit(0); }

const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
const wanted = {};
for (const f of files) {
  const body = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
  for (const [k, v] of Object.entries(body)) wanted[k] = { ...v, _from: f };
}
const keys = Object.keys(wanted);
console.log(`${files.length} request file(s), ${keys.length} key(s)`);
if (!keys.length) process.exit(0);

const P = 'src/lib/admin-ui.ts';
let src = readFileSync(P, 'utf8');
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// The English key list, then the Italian and Arabic maps, in file order.
const listAnchor = '  "Nothing left to invoice on {code}.",';
const itAnchor = '  "Nothing left to invoice on {code}.":\n    "Non resta nulla da fatturare su {code}.",';
const arAnchor = '  "Nothing left to invoice on {code}.":\n    "لم يبقَ شيء لإصدار فاتورة به على {code}.",';
for (const a of [listAnchor, itAnchor, arAnchor]) {
  if (!src.includes(a)) { console.error('anchor missing:', a.slice(0, 40)); process.exit(1); }
}

const added = [];
for (const k of keys) {
  if (src.includes(`  "${esc(k)}",`)) { console.log('  already present:', k); continue; }
  added.push(k);
}
if (!added.length) { console.log('nothing to add'); process.exit(0); }
if (CHECK) { console.log('would add:', added.join(' | ')); process.exit(0); }

src = src.replace(listAnchor,
  listAnchor + '\n' + added.map((k) => `  "${esc(k)}",`).join('\n'));
src = src.replace(itAnchor,
  itAnchor + '\n' + added.map((k) => `  "${esc(k)}":\n    "${esc(wanted[k].it)}",`).join('\n'));
src = src.replace(arAnchor,
  arAnchor + '\n' + added.map((k) => `  "${esc(k)}":\n    "${esc(wanted[k].ar)}",`).join('\n'));
writeFileSync(P, src);
console.log('merged into', P, '→', added.join(' | '));
