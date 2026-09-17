import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies, headers } from 'next/headers';
import { query } from '@/lib/db';
import { clientIpForRecord } from '@/lib/client-ip';

const scrypt = promisify(_scrypt) as (
  pw: string | Buffer, salt: string | Buffer, len: number, opts: object,
) => Promise<Buffer>;

/* ── password hashing ──────────────────────────────────────────
   scrypt from the Node standard library: no dependency to keep patched, and
   the cost parameters are stored with the hash so they can be raised later
   without invalidating existing passwords. */
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(keyB64, 'base64');
  const actual = await scrypt(password.normalize('NFKC'), salt, expected.length, {
    N: Number(N), r: Number(r), p: Number(p),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ── sessions ──────────────────────────────────────────────────
   The cookie carries a random token; only its SHA-256 is stored, so a leaked
   database dump cannot be replayed as a login. */
export const SESSION_COOKIE = 'vg_session';
const SESSION_DAYS = 14;

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

export type SessionUser = {
  id: number; email: string; name: string; role: 'owner' | 'sales' | 'viewer';
};

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const h = await headers();
  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at, user_agent, ip)
     VALUES ($1, $2, now() + ($3 || ' days')::interval, $4, $5)`,
    [hashToken(token), userId, String(SESSION_DAYS),
     h.get('user-agent')?.slice(0, 400) ?? null, clientIpForRecord(h)],
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await query<SessionUser & { expired: boolean }>(
    `SELECT u.id, u.email::text AS email, u.name, u.role,
            (s.expires_at <= now()) AS expired
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND u.is_active`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row || row.expired) return null;
  return { id: Number(row.id), email: row.email, name: row.name, role: row.role };
}

/**
 * The SHA-256 of the caller's own session token.
 *
 * Changing a password destroys every other session belonging to that account.
 * This is how the one doing the changing is spared — improving your own
 * password should not sign you out of the screen you are standing on.
 */
export async function currentTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
  jar.delete(SESSION_COOKIE);
}

/* ── brute-force throttling ────────────────────────────────────
   The comment that used to sit here claimed failures were counted "per email
   as well as per IP". They were not: the query filtered on email alone and the
   ip column it stored was never read. That is not a small gap in a company
   this size. The owner's address is on the contact page, so anyone at all
   could lock the only person who can reach the console out of it for fifteen
   minutes, from anywhere, with six wrong guesses — and repeat that all day.
   Locking the real operator out was easier than guessing the password.

   Now the hard lock is keyed on the pair. Six failures from ONE address lock
   that address; the owner sitting somewhere else is unaffected. A much higher
   count across all addresses still locks the email, because that pattern is
   distributed guessing rather than somebody mistyping.

   This only became worth doing once the address itself became trustworthy —
   see client-ip.ts. A lock keyed on a value the attacker chooses is theatre. */
const MAX_PER_ADDRESS = 6;
const MAX_PER_EMAIL = 30;
const WINDOW_MIN = 15;

export async function isLocked(email: string): Promise<boolean> {
  const h = await headers();
  const ip = clientIpForRecord(h);
  const rows = await query<{ here: string; anywhere: string }>(
    `SELECT count(*) FILTER (WHERE $2::text IS NOT NULL AND ip = $2) AS here,
            count(*) AS anywhere
       FROM login_attempts
      WHERE email = $1 AND NOT successful
        AND at > now() - ($3 || ' minutes')::interval`,
    [email.toLowerCase(), ip, String(WINDOW_MIN)],
  );
  const here = Number(rows[0]?.here ?? 0);
  const anywhere = Number(rows[0]?.anywhere ?? 0);

  // Nothing identified the caller at all: there is no pair to key on, so fall
  // back to the old email-only rule rather than letting it through unlimited.
  if (!ip) return anywhere >= MAX_PER_ADDRESS;

  return here >= MAX_PER_ADDRESS || anywhere >= MAX_PER_EMAIL;
}

export async function recordAttempt(email: string, successful: boolean): Promise<void> {
  const h = await headers();
  await query('INSERT INTO login_attempts (email, ip, successful) VALUES ($1, $2, $3)',
              [email.toLowerCase(), clientIpForRecord(h), successful]);
}

/* ── audit ─────────────────────────────────────────────────────
   Every state change an operator makes is recorded. "Who changed this price"
   must be answerable a year from now. */
export async function audit(opts: {
  user: SessionUser | null; action: string; entity: string;
  entityId?: string | number; before?: unknown; after?: unknown;
}): Promise<void> {
  const h = await headers();
  await query(
    `INSERT INTO audit_log (user_id, user_email, action, entity, entity_id, before, after, ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [opts.user?.id ?? null, opts.user?.email ?? null, opts.action, opts.entity,
     opts.entityId != null ? String(opts.entityId) : null,
     opts.before ? JSON.stringify(opts.before) : null,
     opts.after ? JSON.stringify(opts.after) : null,
     clientIpForRecord(h)],
  );
}

/**
 * Reject cross-site form posts: SameSite=Lax is the primary defence, this is
 * the belt.
 *
 * It used to compare Origin against the `host` header alone. Next's own Server
 * Action check reads `x-forwarded-host ?? host`, and behind two proxies those
 * two can differ — at which point this guard rejects the operator's own login
 * and the console is simply unusable, with an error that says the opposite of
 * what happened. So the comparison is against the set of names this request
 * could legitimately have been addressed to, including the configured
 * canonical one.
 *
 * Widening it does not weaken it. The attack is a form on somebody else's site
 * posting here, and a browser will not let that page set `x-forwarded-host`
 * (or any other header) on a cross-site form POST — a fetch that tried would
 * need a preflight, and the preflight would fail. What the attacker controls
 * is Origin, which is exactly what is being checked, and their own domain is
 * in none of these sets.
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get('origin');
  if (!origin) return;                       // same-origin navigations may omit it

  let originHost: string;
  try { originHost = new URL(origin).host.toLowerCase(); }
  catch { throw new Error('Cross-origin request rejected.'); }

  const allowed = new Set<string>();
  const add = (v?: string | null) => {
    const one = v?.split(',')[0]?.trim().toLowerCase();
    if (one) allowed.add(one);
  };
  add(h.get('host'));
  add(h.get('x-forwarded-host'));
  try {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    }
  } catch { /* a malformed setting must not decide an auth question */ }

  if (!allowed.has(originHost)) throw new Error('Cross-origin request rejected.');
}
