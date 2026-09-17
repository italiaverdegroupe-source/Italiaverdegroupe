// Compile the library modules the test suites load.
//
//   node scripts/build-tests.mjs          (or: npm run test:build)
//
// The suites import plain JavaScript out of .test-build/ rather than the
// TypeScript in src/lib, because they run under node with no bundler. That
// directory is generated and gitignored — which meant, until this script
// existed, that six suites could not be run at all on a fresh checkout: the
// esbuild command was a comment in one test file and a memory everywhere else.
// A test you cannot run is not a test.
import { build } from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';

const OUT = '.test-build';

/** Each library a suite requires, in the format that suite asks for. */
const TARGETS = [
  { file: 'admin-ui', format: 'cjs' },
  { file: 'alerts', format: 'cjs' },
  { file: 'backup', format: 'cjs' },
  { file: 'client-ip', format: 'cjs' },
  { file: 'content', format: 'cjs' },
  { file: 'mail', format: 'cjs' },
  { file: 'orders', format: 'cjs' },
  { file: 'outbound', format: 'cjs' },
  { file: 'procurement', format: 'cjs' },
  { file: 'quotes', format: 'cjs' },
  { file: 'reports', format: 'cjs' },
  { file: 'settings', format: 'cjs' },
  { file: 'site-copy', format: 'cjs' },
  { file: 'rate-limit', format: 'cjs' },
  { file: 's3', format: 'cjs' },
  { file: 'ui', format: 'cjs' },
  { file: 'users', format: 'cjs' },
  { file: 'i18n', format: 'cjs' },
  { file: 'legal/index', format: 'cjs', out: 'legal' },
  { file: 'product-copy', format: 'cjs' },
  { file: 'landed-cost', format: 'esm', ext: 'mjs' },
];

/** tests/content.test.mjs renders this one to check what it lets through. */
const COMPONENTS = [{ from: 'src/components/Prose.tsx', file: 'prose', format: 'cjs' }];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const jobs = [
  ...TARGETS.map((t) => ({ ...t, from: `src/lib/${t.file}.ts` })),
  ...COMPONENTS,
];

await Promise.all(jobs.map((t) => build({
  entryPoints: [t.from],
  outfile: `${OUT}/${t.out ?? t.file}.${t.ext ?? (t.format === 'esm' ? 'mjs' : 'cjs')}`,
  bundle: true,
  format: t.format,
  platform: 'node',
  target: 'node22',
  jsx: 'automatic',
  // Anything with a runtime of its own stays external: bundling pg would give
  // each module its own connection pool, and bundling React would give the
  // renderer a second copy of it.
  packages: 'external',
  // @/ is the app's alias; esbuild does not read tsconfig paths by default.
  alias: { '@': new URL('../src', import.meta.url).pathname },
  logLevel: 'warning',
})));

console.log(`built ${jobs.length} modules into ${OUT}/`);
