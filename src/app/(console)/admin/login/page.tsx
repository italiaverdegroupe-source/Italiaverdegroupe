import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  getSessionUser, verifyPassword, createSession,
  isLocked, recordAttempt, audit, assertSameOrigin,
} from '@/lib/auth';
import { query } from '@/lib/db';
import { imageFor } from '@/lib/products';

/**
 * The avenue of palms, resolved through imageFor so a renamed photograph
 * fails the build rather than leaving the sign-in screen black in production.
 * Chosen on measurement, not taste: of the sixty-six verified photographs it
 * is the calmest and one of the darkest on the right-hand side, which is
 * where the card sits — a busy frame under a frosted panel reads as noise.
 */
const BACKDROP = imageFor('VG-PL-009');

export const dynamic = 'force-dynamic';

type Row = {
  id: string; email: string; name: string; role: 'owner'|'sales'|'viewer';
  locale: string | null; password_hash: string;
};

async function signIn(formData: FormData) {
  'use server';
  await assertSameOrigin();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/admin/login?e=missing');

  if (await isLocked(email)) redirect('/admin/login?e=locked');

  const rows = await query<Row>(
    `SELECT id, email::text AS email, name, role, locale, password_hash
       FROM users WHERE email = $1 AND is_active`, [email]);
  const user = rows[0];

  // Always run a verification so a missing account and a wrong password take
  // comparable time and cannot be told apart by the response.
  const hash = user?.password_hash
    ?? 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const ok = await verifyPassword(password, hash);

  if (!user || !ok) {
    await recordAttempt(email, false);
    redirect('/admin/login?e=bad');
  }

  await recordAttempt(email, true);
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
  await createSession(Number(user.id));
  await audit({
    user: {
      id: Number(user.id), email: user.email, name: user.name,
      role: user.role, locale: user.locale ?? null,
    },
    action: 'auth.signed_in', entity: 'user', entityId: user.id,
  });
  redirect('/admin');
}

const MESSAGES: Record<string, string> = {
  bad: 'Those details do not match an account.',
  missing: 'Enter your email and password.',
  locked: 'Too many failed attempts. Try again in 15 minutes.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await getSessionUser()) redirect('/admin');
  const { e } = await searchParams;

  return (
    <div className="adm-login">
      {/* Three layers in one stacking context, the same structure the public
          hero uses: photograph, directional veil, then content above both.
          The veil is mirrored — darkest on the RIGHT — because that is where
          the card sits, which leaves the avenue legible on the left. */}
      <div className="lg-media">
        <Image src={BACKDROP} alt="" fill priority sizes="100vw" className="lg-img" />
      </div>
      <div className="lg-veil" />

      <div className="lg-mark">
        <span className="lg-mark-name">Verde Garden</span>
        <span className="lg-mark-sub">Trading — Operations</span>
      </div>

      <div className="adm-login-box">
        <p className="lg-eyebrow">Sign in</p>
        <h1>Operations</h1>
        <p className="lg-lede">
          Inventory, quotations, shipments and the money behind them.
        </p>

        {e && <p className="adm-err">{MESSAGES[e] ?? 'Could not sign you in.'}</p>}

        <form action={signIn}>
          <label className="adm-field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="username" autoFocus />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="adm-btn lg-submit">Sign in</button>
        </form>

        {/* The warning is useful; the exact threshold and window are not
            something an unauthenticated page needs to hand out. */}
        <p className="lg-foot">
          Repeated failed attempts temporarily lock the account.
        </p>
      </div>
    </div>
  );
}
