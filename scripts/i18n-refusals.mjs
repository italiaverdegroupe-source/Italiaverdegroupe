// Put every console refusal into the operator's own language.
//
//   node scripts/i18n-refusals.mjs [--dry]
//
// A refusal — "Viewers cannot raise invoices." — is the sentence somebody
// reads at the one moment they most need to understand what just happened.
// They were all English, on screens that are otherwise Italian or Arabic.
//
// This rewrites `new Error('…')` and `refuse('tab', '…')` to route through
// adminUi, and declares the translator inside the function that needs it,
// immediately after the `user` it depends on.
//
// TWO THINGS IT HAS TO GET RIGHT, both learned the hard way in this codebase:
//
//   · `t` IS ALREADY TAKEN in four files, where it holds order totals. A
//     translator declared as `t` there shadows money. So the name is checked
//     per function and falls back to `tr`.
//   · IT ONLY REWRITES WHAT IT CAN ANCHOR. The translator has to go after the
//     `const user = await getSessionUser()` and its null guard, so an action
//     that gets its user from a helper — content/actions.ts calls editor() —
//     is skipped rather than guessed at. Those are wired by hand; the audit is
//     what says whether any are left, not this script's own output.
//   · A STRING THAT IS NOT A SENTENCE must not be touched. Only literals that
//     are already keys in the dictionary are rewritten, so a template literal,
//     a SQL fragment or an audit action name is left exactly as it is — a
//     blind replacement once put t() inside a SQL string and returned 500 for
//     the whole console.
//
// It runs on the TypeScript AST, not on text.
import ts from 'typescript';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const KEYS = new Set(require('../.test-build/admin-ui.cjs').ADMIN_KEYS);
const DRY = process.argv.includes('--dry');

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e)) files.push(p);
  }
})('src/app/(console)');
files.push('src/components/admin/bits.tsx');

let rewritten = 0, touched = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!/new Error\('|refuse\('/.test(src)) continue;

  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  /** The enclosing function of a node, so a translator lands in the right scope. */
  const fnOf = (n) => {
    for (let p = n.parent; p; p = p.parent) {
      if (ts.isFunctionDeclaration(p) || ts.isArrowFunction(p) || ts.isFunctionExpression(p)) return p;
    }
    return null;
  };

  /** Is `name` already bound anywhere inside this function? */
  const binds = (fn, name) => {
    let found = false;
    const visit = (n) => {
      if (found) return;
      if ((ts.isVariableDeclaration(n) || ts.isParameter(n))
          && ts.isIdentifier(n.name) && n.name.text === name) found = true;
      ts.forEachChild(n, visit);
    };
    visit(fn);
    return found;
  };

  /**
   * The statement the translator goes after.
   *
   * NOT the `const user = await getSessionUser()` line, which is where this
   * first put it: getSessionUser returns `User | null`, and the very next
   * statement is the `if (!user) redirect(…)` that narrows it. Inserted
   * between the two, `user.locale` is a type error on every file it touched —
   * caught by tsc rather than by a reviewer, which is the point of running it.
   *
   * So it goes after the guard where there is one, and after the declaration
   * where the function checks `user` some other way.
   */
  const anchorIn = (fn) => {
    let decl = null, guard = null;
    const visit = (n) => {
      if (ts.isVariableStatement(n) && !decl) {
        const d = n.declarationList.declarations[0];
        if (d && ts.isIdentifier(d.name) && d.name.text === 'user'
            && d.initializer && /getSessionUser/.test(d.initializer.getText())) decl = n;
      }
      if (decl && !guard && ts.isIfStatement(n)
          && /^!\s*user$/.test(n.expression.getText().trim())
          && !n.elseStatement) guard = n;
      ts.forEachChild(n, visit);
    };
    visit(fn);
    return guard ?? decl;
  };

  const edits = [];          // { start, end, text }
  const needTranslator = new Map();  // fn -> { name, after }

  const visit = (node) => {
    let lit = null;
    if (ts.isNewExpression(node) && node.expression.getText() === 'Error'
        && node.arguments?.length === 1 && ts.isStringLiteral(node.arguments[0])) {
      lit = node.arguments[0];
    }
    if (ts.isCallExpression(node) && node.expression.getText() === 'refuse'
        && node.arguments.length === 2 && ts.isStringLiteral(node.arguments[1])) {
      lit = node.arguments[1];
    }
    if (lit && KEYS.has(lit.text)) {
      const fn = fnOf(lit);
      const after = fn && anchorIn(fn);
      if (after) {
        const name = binds(fn, 't') ? 'tr' : 't';
        if (!needTranslator.has(fn)) needTranslator.set(fn, { name, after });
        edits.push({ start: lit.getStart(sf), end: lit.getEnd(),
                     text: `${needTranslator.get(fn).name}(${lit.getText()})` });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (!edits.length) continue;

  for (const [, { name, after }] of needTranslator) {
    const indent = ' '.repeat(after.getStart(sf) - sf.getLineStarts()
      [sf.getLineAndCharacterOfPosition(after.getStart(sf)).line]);
    edits.push({ start: after.getEnd(), end: after.getEnd(),
                 text: `\n${indent}const ${name} = adminUi(user.locale);` });
  }

  let out = src;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  if (!/from '@\/lib\/admin-ui'/.test(out)) {
    out = out.replace(/^(import .*\n)/m, `$1import { adminUi } from '@/lib/admin-ui';\n`);
  } else if (!/\badminUi\b[^;]*from '@\/lib\/admin-ui'/.test(out)) {
    out = out.replace(/import \{ ([^}]*) \} from '@\/lib\/admin-ui';/,
                      (m, names) => `import { adminUi, ${names.trim()} } from '@/lib/admin-ui';`);
  }

  rewritten += edits.filter((e) => e.end > e.start).length;
  touched++;
  if (!DRY) writeFileSync(file, out);
  console.log(`${DRY ? 'would rewrite' : 'rewrote'} ${file}  (${edits.filter((e) => e.end > e.start).length})`);
}

console.log(`\n${rewritten} refusals in ${touched} files`);
