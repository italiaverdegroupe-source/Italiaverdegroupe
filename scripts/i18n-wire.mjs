// Move the words out of the screens and into the dictionary.
//
//   node scripts/i18n-wire.mjs --list  <file…>     what it would take
//   node scripts/i18n-wire.mjs --write <file…>     do it
//
// This is the second version. The first matched >…< with a regular expression
// and pulled `useState` out of `useState<Err | null>(null)` as though it were
// a sentence — the same class of mistake that put t() inside a SQL query and
// returned a 500 from /admin. A pattern that cannot tell markup from code will
// always eventually find the string that is neither.
//
// So this parses. TypeScript is already a dependency, so the file becomes a
// real syntax tree and the question stops being "does this look like text"
// and becomes "is this node a JsxText node", which has one answer.
//
// Rewritten: JSX text, and the value of aria-label / placeholder / title /
// alt when it is a plain string. Nothing else — not a string in code, not an
// object key, not a class name, not a query.
import { readFileSync, writeFileSync } from 'node:fs';
import ts from '../node_modules/typescript/lib/typescript.js';

const args = process.argv.slice(2);
const write = args.includes('--write');
const files = args.filter((a) => !a.startsWith('--'));

const ATTRS = new Set(['aria-label', 'placeholder', 'title', 'alt']);

/** Worth a dictionary entry: has letters, is not an acronym or a symbol. */
function worthIt(s) {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!/[A-Za-z]/.test(t)) return false;
  if (/^[A-Z]{2,5}$/.test(t)) return false;        // TRN, VAT, UAE
  if (/^[A-Za-z]{1,2}$/.test(t)) return false;
  return true;
}

let total = 0;
const collected = new Set();

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];

  (function walk(node) {
    if (ts.isJsxText(node)) {
      const raw = node.getFullText(sf);
      const text = raw.trim();
      if (worthIt(text)) {
        // Whitespace either side is layout — JSX collapses it, but keeping it
        // means the diff is the words and nothing else.
        const i = raw.indexOf(text[0]);
        // JSX text can hold a real newline mid-sentence; the dictionary key is
        // the sentence, so the break is normalised out of the key and the
        // indentation does not become part of the translated string.
        const key = text.replace(/\s*\n\s*/g, ' ');
        edits.push({
          start: node.getFullStart(), end: node.getFullStart() + raw.length,
          text: `${raw.slice(0, i)}{t(${JSON.stringify(key)})}${raw.slice(i + text.length)}`,
          key,
        });
      }
    } else if (ts.isJsxAttribute(node) && node.initializer
               && ts.isStringLiteral(node.initializer)
               && ATTRS.has(node.name.getText(sf))) {
      const key = node.initializer.text;
      if (worthIt(key)) {
        edits.push({
          start: node.initializer.getStart(sf), end: node.initializer.getEnd(),
          text: `{t(${JSON.stringify(key)})}`, key,
        });
      }
    }
    ts.forEachChild(node, walk);
  })(sf);

  edits.sort((a, b) => a.start - b.start);
  for (const e of edits) collected.add(e.key);
  total += edits.length;

  if (write && edits.length) {
    let out = '', pos = 0;
    for (const e of edits) { out += src.slice(pos, e.start) + e.text; pos = e.end; }
    writeFileSync(file, out + src.slice(pos));
  }
  console.log(`${String(edits.length).padStart(4)}  ${file.replace('src/app/', '').replace('src/', '')}`);
}

console.log(`\n${total} strings${write ? ', rewritten' : ' (nothing written — pass --write)'}`);
console.log(`${collected.size} distinct\n`);

// A sentence broken in half by a <Link> comes out as two keys, and half a
// sentence cannot be translated: Arabic and Italian put the clauses in a
// different order, so the two halves would be rendered back in English word
// order with the link stranded in the middle. These are flagged rather than
// wired, because the fix is to rewrite the markup so the sentence is one
// string — which is a judgement, not a transform.
const fragment = (s) => /^[a-z(,.…—-]/.test(s.trim()) || /[,;:—-]$/.test(s.trim());
const frags = [...collected].filter(fragment);
const whole = [...collected].filter((s) => !fragment(s));

if (frags.length) {
  console.log(`── ${frags.length} look like sentence FRAGMENTS — rewrite the markup, do not translate these ──`);
  for (const s of frags.sort()) console.log(`  ! ${JSON.stringify(s)}`);
  console.log('');
}
console.log(`── ${whole.length} whole strings, ready for the dictionary ──`);
for (const s of whole.sort()) console.log(`  ${JSON.stringify(s)},`);
