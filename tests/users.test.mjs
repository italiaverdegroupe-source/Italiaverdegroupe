// The invariant that matters here is not a feature, it is a lockout: the
// system must always have one active owner, or nobody inside the company can
// administer it again. Everything else is ordinary account handling.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

process.env.DATABASE_URL = 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const U = require('../.test-build/users.cjs');

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};
const refusal = async (fn) => {
  try { await fn(); return null; } catch (e) { return e.message; }
};

await db.query(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test-%')`);
await db.query(`DELETE FROM users WHERE email LIKE 'test-%'`);

// ── the password policy ──────────────────────────────────────
const P = (pw, o) => U.passwordProblem(pw, o);
check('a short password is refused', P('Short1!') !== null);
check('exactly ten characters is accepted', P('Gulio1256&') === null, String(P('Gulio1256&')));
check('a long passphrase with no symbols is accepted',
      P('correct horse battery staple') === null);
check('an obvious guess is refused', P('password123') !== null);
check('a password containing its own email is refused',
      P('italiaverdegroupe99', { email: 'italiaverdegroupe@gmail.com' }) !== null);
check('a password containing the holder’s name is refused',
      P('mohamed-tree-99', { name: 'Mohamed Ali' }) !== null);
check('one repeated character is refused', P('aaaaaaaaaaaa') !== null);
check('leading or trailing space is refused', P(' longenoughpw ') !== null);
check('no symbol or capital is demanded',
      P('thequietolivetree') === null, String(P('thequietolivetree')));

// ── creating accounts ────────────────────────────────────────
const salesId = await U.createUser({
  email: 'test-sales@example.ae', name: 'Test Salesperson', role: 'sales',
  password: 'the-quiet-olive-1',
});
check('an account is created', !!salesId);

check('a duplicate email is refused',
      (await refusal(() => U.createUser({
        email: 'TEST-SALES@example.ae', name: 'Again', role: 'sales', password: 'the-quiet-olive-1',
      })))?.includes('already an account'));

check('a bad email is refused',
      (await refusal(() => U.createUser({
        email: 'not-an-email', name: 'X', role: 'sales', password: 'the-quiet-olive-1',
      }))) !== null);

check('a weak password is refused at creation',
      (await refusal(() => U.createUser({
        email: 'test-weak@example.ae', name: 'X', role: 'sales', password: 'short',
      })))?.includes('at least 10'));

// ── the last-owner invariant ─────────────────────────────────
await db.query(`UPDATE users SET is_active = false WHERE role = 'owner' AND email NOT LIKE 'test-%'`);
const ownerId = (await db.query(
  `INSERT INTO users (email, name, role, password_hash, is_active)
   VALUES ('test-owner@example.ae','Test Owner','owner','scrypt$1$1$1$AA$AA', true)
   RETURNING id::text`)).rows[0].id;

const only = (await db.query(
  `SELECT count(*)::int AS n FROM users WHERE role='owner' AND is_active`)).rows[0].n;
check('the fixture leaves exactly one active owner', only === 1, String(only));

check('the only owner cannot be switched off',
      (await refusal(() => U.updateUser({
        userId: ownerId, role: 'owner', isActive: false, name: 'Test Owner',
      })))?.includes('only active owner'));

check('the only owner cannot be demoted',
      (await refusal(() => U.updateUser({
        userId: ownerId, role: 'sales', isActive: true, name: 'Test Owner',
      })))?.includes('only active owner'));

const stillOwner = (await db.query(
  `SELECT role, is_active FROM users WHERE id = $1`, [ownerId])).rows[0];
check('and the refusal left the account untouched',
      stillOwner.role === 'owner' && stillOwner.is_active === true);

// with a second owner, the first may step down
// The passphrase deliberately shares nothing with the name: the rule above
// refuses a password containing the holder's own name, and it is right to.
const secondId = await U.createUser({
  email: 'test-owner2@example.ae', name: 'Second Owner', role: 'owner',
  password: 'a-quiet-row-of-cypress',
});
check('once a second owner exists, the first can be demoted',
      (await refusal(() => U.updateUser({
        userId: ownerId, role: 'sales', isActive: true, name: 'Test Owner',
      }))) === null);
check('and is now sales',
      (await db.query(`SELECT role FROM users WHERE id=$1`, [ownerId])).rows[0].role === 'sales');

check('but the remaining one cannot then be switched off',
      (await refusal(() => U.updateUser({
        userId: secondId, role: 'owner', isActive: false, name: 'Second Owner',
      })))?.includes('only active owner'));

// ── passwords and sessions ───────────────────────────────────
const mk = async (userId, hash) => db.query(
  `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1,$2, now() + interval '14 days')`,
  [hash, userId]);
await mk(salesId, 'hash-laptop');
await mk(salesId, 'hash-phone');
await mk(salesId, 'hash-office');
const count = async (id) => (await db.query(
  `SELECT count(*)::int AS n FROM sessions WHERE user_id = $1`, [id])).rows[0].n;
check('three sessions exist', await count(salesId) === 3);

await U.setPassword({
  userId: salesId, password: 'a-different-olive-2',
  email: 'test-sales@example.ae', name: 'Test Salesperson',
  keepTokenHash: 'hash-laptop',
});
const left = (await db.query(
  `SELECT token_hash FROM sessions WHERE user_id = $1`, [salesId])).rows.map((r) => r.token_hash);
check('changing a password signs out every other device',
      left.length === 1 && left[0] === 'hash-laptop', left.join(','));

check('the new password verifies', await U.checkCurrentPassword(salesId, 'a-different-olive-2'));
check('the old one does not', !(await U.checkCurrentPassword(salesId, 'the-quiet-olive-1')));

check('a weak password is refused on change',
      (await refusal(() => U.setPassword({
        userId: salesId, password: 'olive', email: 'test-sales@example.ae', name: 'Test Salesperson',
      })))?.includes('at least 10'));
check('and the refusal did not change the password',
      await U.checkCurrentPassword(salesId, 'a-different-olive-2'));

// an owner resetting somebody else keeps nothing
await mk(salesId, 'hash-new-phone');
await U.setPassword({
  userId: salesId, password: 'reset-by-the-owner-3',
  email: 'test-sales@example.ae', name: 'Test Salesperson', keepTokenHash: null,
});
check('an owner’s reset signs the account out everywhere', await count(salesId) === 0);

// switching an account off ends its sessions
await mk(salesId, 'hash-again');
await U.updateUser({ userId: salesId, role: 'sales', isActive: false, name: 'Test Salesperson' });
check('switching an account off ends its sessions immediately', await count(salesId) === 0);

await db.query(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test-%')`);
await db.query(`DELETE FROM users WHERE email LIKE 'test-%'`);
await db.query(`UPDATE users SET is_active = true WHERE role = 'owner'`);
await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
