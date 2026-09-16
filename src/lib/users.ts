import { query, requirePool } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

/**
 * Operator accounts.
 *
 * This module exists because the roles did not: the database has carried
 * owner, sales and viewer since the first migration and every page respects
 * them, but there was no screen to create an account or change a password.
 * That made hiring a salesperson — and changing the owner's own password — a
 * developer task, which is exactly what the brief said must never happen.
 *
 * One invariant runs through all of it: THE SYSTEM MUST ALWAYS HAVE AT LEAST
 * ONE ACTIVE OWNER. Losing the last one is not an inconvenience, it is a
 * lockout that nobody inside the company can undo, so every path that could
 * cause it is refused rather than warned about.
 */

export type Role = 'owner' | 'sales' | 'viewer';
export const ROLES: Role[] = ['owner', 'sales', 'viewer'];

export const ROLE_MEANS: Record<Role, string> = {
  owner:  'Everything, including money, settings, content and these accounts.',
  sales:  'Leads, quotations, orders, inventory and deliveries. Not settings or accounts.',
  viewer: 'Can read, can change nothing.',
};

export type UserRow = {
  id: string; email: string; name: string; role: Role;
  is_active: boolean; last_login_at: string | null; created_at: string;
  sessions: string;
};

export const listUsers = () =>
  query<UserRow>(`
    SELECT u.id::text, u.email::text, u.name, u.role, u.is_active,
           u.last_login_at::text, u.created_at::text,
           (SELECT count(*) FROM sessions s
             WHERE s.user_id = u.id AND s.expires_at > now())::text AS sessions
      FROM users u
     ORDER BY u.is_active DESC, u.role, lower(u.name)`);

/* ── password policy ───────────────────────────────────────────
   Length, and a refusal to use something guessable. Deliberately no
   composition rules — no "must contain a symbol" — because they push people
   towards Password1! and NIST dropped them for that reason. Length and not
   being an obvious guess are what actually help. */

const MIN_LENGTH = 10;

/** Not a breach corpus — that needs a service. These are the ones people here actually pick. */
const OBVIOUS = [
  'password', 'passw0rd', 'qwerty', 'letmein', 'welcome', 'admin', 'administrator',
  '12345678', '123456789', '1234567890', 'iloveyou', 'dubai', 'emirates', 'uae',
  'verdegarden', 'verde garden', 'olive', 'changeme', 'secret', 'trustno1',
];

/** Returns a reason the password is unusable, or null if it is fine. */
export function passwordProblem(password: string, opts: { email?: string; name?: string } = {}): string | null {
  const pw = password.normalize('NFKC');
  if (pw.length < MIN_LENGTH) {
    return `A password needs at least ${MIN_LENGTH} characters. Length is what protects it — a long phrase beats a short puzzle.`;
  }
  if (pw.length > 200) return 'That password is longer than 200 characters.';
  if (pw.trim() !== pw) return 'A password cannot begin or end with a space — it is too easy to lose one.';

  const lower = pw.toLowerCase();
  if (OBVIOUS.some((w) => lower === w || lower.startsWith(w))) {
    return 'That is one of the first things anyone would try. Choose something that is not a guess.';
  }
  // A password built from the account it protects is not a secret.
  const local = (opts.email ?? '').split('@')[0].toLowerCase();
  if (local.length >= 4 && lower.includes(local)) {
    return 'The password contains the email address it protects. Use something unrelated to the account.';
  }
  const first = (opts.name ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  if (first.length >= 4 && lower.includes(first)) {
    return 'The password contains the account holder’s name. Use something unrelated to it.';
  }
  if (/^(.)\1+$/.test(pw)) return 'That is one character repeated.';
  return null;
}

/* ── the last-owner invariant ──────────────────────────────────
   Counted inside the same transaction as the change, not before it, so two
   owners cannot each demote the other at the same moment and leave none. */

async function activeOwnersExcluding(client: {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: { n: string }[] }>;
}, exceptId: string): Promise<number> {
  const { rows } = await client.query(
    `SELECT count(*)::text AS n FROM users
      WHERE role = 'owner' AND is_active AND id <> $1`, [exceptId]);
  return Number(rows[0].n);
}

export class Refused extends Error {}

export async function createUser(input: {
  email: string; name: string; role: Role; password: string;
}): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Refused('That is not an email address.');
  if (!name) throw new Refused('An account needs a name, so the audit log reads as people rather than numbers.');
  if (!ROLES.includes(input.role)) throw new Refused('Unknown role.');

  const problem = passwordProblem(input.password, { email, name });
  if (problem) throw new Refused(problem);

  const hash = await hashPassword(input.password);
  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO users (email, name, role, password_hash) VALUES ($1,$2,$3,$4) RETURNING id::text`,
      [email, name, input.role, hash]);
    return rows[0].id;
  } catch (err) {
    if (/users_email_key/.test((err as Error).message)) {
      throw new Refused(`There is already an account for ${email}.`);
    }
    throw err;
  }
}

/**
 * Change a password.
 *
 * Every other session belonging to that user is destroyed. A password is
 * changed either because it may be known to someone else or because someone
 * is leaving, and in both cases a cookie that keeps working for another
 * fortnight defeats the point. The session doing the changing is kept, so
 * nobody logs themselves out by improving their own password.
 */
export async function setPassword(opts: {
  userId: string; password: string; email: string; name: string;
  keepTokenHash?: string | null;
}): Promise<void> {
  const problem = passwordProblem(opts.password, { email: opts.email, name: opts.name });
  if (problem) throw new Refused(problem);

  const hash = await hashPassword(opts.password);
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [opts.userId, hash]);
    await client.query(
      `DELETE FROM sessions WHERE user_id = $1 AND ($2::text IS NULL OR token_hash <> $2)`,
      [opts.userId, opts.keepTokenHash ?? null]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** Verify the password currently on an account. Used before letting someone change it. */
export async function checkCurrentPassword(userId: string, password: string): Promise<boolean> {
  const rows = await query<{ password_hash: string }>(
    `SELECT password_hash FROM users WHERE id = $1`, [userId]);
  if (!rows[0]) return false;
  return verifyPassword(password, rows[0].password_hash);
}

/**
 * Change a user's role and whether they can sign in.
 *
 * Refuses to remove the last active owner. Deactivating also destroys the
 * account's sessions: getSessionUser already refuses an inactive user, but
 * leaving live rows behind means "who is signed in" reads wrong, and
 * revoking access should actually revoke it.
 */
export async function updateUser(opts: {
  userId: string; role: Role; isActive: boolean; name: string;
}): Promise<void> {
  if (!ROLES.includes(opts.role)) throw new Refused('Unknown role.');
  const name = opts.name.trim();
  if (!name) throw new Refused('An account needs a name.');

  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [before] } = await client.query<{ role: Role; is_active: boolean }>(
      `SELECT role, is_active FROM users WHERE id = $1 FOR UPDATE`, [opts.userId]);
    if (!before) throw new Refused('No such account.');

    const wasCountingOwner = before.role === 'owner' && before.is_active;
    const stillCountingOwner = opts.role === 'owner' && opts.isActive;
    if (wasCountingOwner && !stillCountingOwner) {
      const others = await activeOwnersExcluding(client, opts.userId);
      if (others === 0) {
        throw new Refused(
          'This is the only active owner. Removing it would leave nobody able to administer the system, and nobody inside the company could undo that. Make somebody else an owner first.');
      }
    }

    await client.query(
      `UPDATE users SET role = $2, is_active = $3, name = $4 WHERE id = $1`,
      [opts.userId, opts.role, opts.isActive, name]);

    if (!opts.isActive) {
      await client.query(`DELETE FROM sessions WHERE user_id = $1`, [opts.userId]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** Sign an account out everywhere. */
export async function revokeSessions(userId: string): Promise<number> {
  const rows = await query<{ token_hash: string }>(
    `DELETE FROM sessions WHERE user_id = $1 RETURNING token_hash`, [userId]);
  return rows.length;
}
