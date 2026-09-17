// Undo any translation that would leave half a sentence in English.
//
//   node scripts/i18n-unmix.mjs --write <file…>
//
// The wiring tool moves JSX text nodes into the dictionary. A sentence broken
// by a <Link> or a {variable} is several text nodes, so it comes out as
// several keys — and translating some of them produces a paragraph that is
// half Arabic and half English with the clauses in English word order. That
// reads as a broken site, which is worse than an untranslated one.
//
// So: any element that would end up holding BOTH a translated string and raw
// text is put back exactly as it was. The sentence stays English, in one
// piece, until somebody rewrites the markup so it is a single string with a
// {token} in it — which is a judgement about the sentence, not a transform.
import { readFileSync, writeFileSync } from 'node:fs';
import ts from '../node_modules/typescript/lib/typescript.js';

const args = process.argv.slice(2);
const write = args.includes('--write');
const files = args.filter((a) => !a.startsWith('--'));

let reverted = 0;

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  // Repeat until stable: reverting one element can expose a parent that is
  // now mixed too.
  for (let pass = 0; pass < 6; pass++) {
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const undo = [];

    const isTCall = (n) => ts.isJsxExpression(n) && n.expression
      && ts.isCallExpression(n.expression)
      && n.expression.expression.getText(sf) === 't'
      && n.expression.arguments.length === 1
      && ts.isStringLiteral(n.expression.arguments[0]);

    (function walk(node) {
      // Only TEXT-LEVEL elements. A sentence lives in a <p> or an <li>, not
      // in the <div> six levels up — and checking the whole tree meant the
      // outermost element saw one fragment somewhere and reverted the entire
      // page, which it duly did: 187 translations down to 30.
      const TEXT_LEVEL = new Set(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'dd', 'dt', 'span', 'small', 'strong', 'em', 'label', 'button', 'a',
        'figcaption', 'blockquote', 'summary', 'td', 'th', 'legend']);
      if (ts.isJsxElement(node)
          && TEXT_LEVEL.has(node.openingElement.tagName.getText(sf))) {
        const kids = node.children;
        // Every t() anywhere under this element, not just its direct
        // children — a sentence is usually broken by a <Link>, and the half
        // inside the link is a level down.
        const tCalls = [];
        (function gather(n) {
          if (isTCall(n)) { tCalls.push(n); return; }
          ts.forEachChild(n, gather);
        })(node);
        const rawText = kids.filter((k) => ts.isJsxText(k) && /[A-Za-z]{2}/.test(k.getText(sf)));
        // A fragment gives itself away: it begins in lower case or on a comma,
        // or it trails off on a connector. A whole sentence does neither.
        const looksPartial = (s) => /^[a-z(,.…—-]/.test(s.trim()) || /[,;:—-]$/.test(s.trim());
        const anyFragment = tCalls.some((c) => looksPartial(c.expression.arguments[0].text));
        if (tCalls.length && (rawText.length || anyFragment)) {
          for (const c of tCalls) {
            undo.push({ start: c.getStart(sf), end: c.getEnd(),
                        text: c.expression.arguments[0].text });
          }
        }
      }
      ts.forEachChild(node, walk);
    })(sf);

    if (!undo.length) break;
    // The same t() is reached twice when text-level elements nest — a <span>
    // inside a <label> is visited on its own AND as part of the label. Both
    // visits queued the same range, the second replacement ran against a
    // cursor already past it, and the word was written twice: "optionaloptional".
    // Nine of those shipped into the tree before a test caught "1 specimenspecimen".
    const seen = new Set();
    const unique = undo.filter((u) => {
      const k = `${u.start}:${u.end}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
    undo.length = 0; undo.push(...unique);
    undo.sort((a, b) => a.start - b.start);
    let out = '', pos = 0;
    for (const u of undo) { out += src.slice(pos, u.start) + u.text; pos = u.end; }
    src = out + src.slice(pos);
    reverted += undo.length;
  }
  if (write) writeFileSync(file, src);
}
console.log(`${reverted} translations reverted to keep sentences whole`);
