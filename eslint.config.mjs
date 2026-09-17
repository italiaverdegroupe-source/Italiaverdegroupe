import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * `next lint` was removed in Next 16, which left `npm run lint` failing with
 * "Invalid project directory: .../lint" — a script that looks like a linter,
 * runs like a mistake, and had nothing behind it. This is the replacement the
 * upgrade guide points at (`next-lint-to-eslint-cli`), with the config the
 * ESLint reference recommends for a TypeScript App Router project.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Test harnesses are plain scripts run by hand, not part of the bundle.
    'tests/**',
    'scripts/**',
    // Generated: esbuild's CJS of the library modules, so the suites can
    // require them. Linting a build output tells you about esbuild.
    '.test-build/**',
  ]),
]);
