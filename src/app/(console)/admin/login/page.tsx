import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  getSessionUser, verifyPassword, createSession,
  isLocked, recordAttempt, audit, assertSameOrigin,
} from '@/lib/auth';
import { query } from '@/lib/db';
import { getAllProducts } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { site } from '@/lib/site';
import { LOCALES } from '@/lib/i18n';
import { adminUi } from '@/lib/admin-ui';
import { browserLocale } from '@/lib/i18n-server';

/**
 * An olive tree from Tuscany, on a terrace, with the Dubai skyline behind it
 * at first light.
 *
 * It replaced an avenue of palms, and the reason is that it argues rather than
 * decorates: this company's whole proposition is a mature Italian specimen
 * standing in the Emirates, and the photograph says that before a word of the
 * page is read. It is also composed for this layout — the sun and the skyline
 * fall on the left, the tree and the villa on the right, so the card has
 * somewhere to sit that is already quiet.
 *
 * In public/brand rather than resolved through imageFor: it is not a specimen
 * in the catalogue, and pointing the sign-in screen at a product photograph
 * meant the screen changed whenever the catalogue did.
 */
const BACKDROP = '/brand/console-dawn.webp';

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
    ?? 'scrypt$16384$8$1$AAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
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
  // Nobody is signed in yet, so there is no stored preference to read. The
  // browser's own preference is the only thing known about this person, and
  // guessing from it is better than showing an Italian owner an English form
  // before they have had a chance to say so.
  const t = adminUi(await browserLocale());
  const { e } = await searchParams;
  const cfg = await getSettings();

  /**
   * Three numbers, and every one of them is counted rather than typed.
   *
   * A sign-in screen is the wrong place for business figures — nobody has
   * proved who they are yet, and "AED 737,400 outstanding" above a password
   * box is a leak, not a flourish. These are facts already published on the
   * public site: how big the catalogue is, where the company delivers, and
   * how many languages it answers in. They are read from the same sources
   * the catalogue and the footer read, so they cannot drift into a boast.
   */
  const facts: [string, string][] = [
    [String(getAllProducts().length), t('specimens')],
    [String(site.emirates.length), t('emirates')],
    [String(LOCALES.length), t('languages')],
  ];

  // The time where the company trades, not where the server happens to run.
  const now = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  const welcome = (cfg.consoleWelcome ?? '').trim();

  return (
    <div className="adm-login">
      {/* Four layers in one stacking context: photograph, a veil that darkens
          towards the card, a warm wash that keeps the sunrise from going
          grey under it, then the content. */}
      <div className="lg-media">
        <Image src={BACKDROP} alt="" fill priority sizes="100vw" className="lg-img" />
      </div>
      <div className="lg-veil" />

      {/* ── the company, on the light half ── */}
      <aside className="lg-story">
        <div className="lg-mark">
          <span className="lg-mark-leaf" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                 stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 21V11" />
              <path d="M12 11c0-4.5 3-7.5 8-8 .5 5-2.5 8.5-8 8z" />
              <path d="M12 16c-3.5 0-6-2.2-6.4-5.6 3.6-.3 5.9 1.8 6.4 5.6z" />
            </svg>
          </span>
          <span className="lg-mark-txt">
            <b>{t('Verde Garden')}</b>
            <i>{t('Trading — Operations')}</i>
          </span>
        </div>

        <h2 className="lg-claim">{t('Italian roots for a greener tomorrow')}</h2>
        <p className="lg-claim-sub">
          {t('Mature specimens lifted in Italy, cleared, acclimatised and planted across the Emirates.')}
        </p>

        <dl className="lg-facts">
          {facts.map(([n, label]) => (
            <div key={label}>
              <dt>{n}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>

        <p className="lg-clock">
          <span className="lg-dot" aria-hidden="true" />
          {t('Dubai')} · {now}
        </p>
      </aside>

      {/* ── the door, on the quiet half ── */}
      <div className="adm-login-box">
        <p className="lg-eyebrow">{t('Sign in')}</p>
        <h1>{welcome ? t('Welcome back, {name}', { name: welcome }) : t('Welcome back')}</h1>
        <p className="lg-lede">
          {t('Inventory, quotations, shipments and the money behind them.')}
        </p>

        {e && <p className="adm-err">{MESSAGES[e] ?? 'Could not sign you in.'}</p>}

        <form action={signIn}>
          <label className="adm-field">
            <span>{t("Email")}</span>
            <input name="email" type="email" required autoComplete="username" autoFocus />
          </label>
          <label className="adm-field">
            <span>{t("Password")}</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="adm-btn lg-submit">{t("Sign in")}</button>
        </form>

        {/* The warning is useful; the exact threshold and window are not
            something an unauthenticated page needs to hand out. */}
        <p className="lg-foot">
          {t("Repeated failed attempts temporarily lock the account.")}
        </p>
      </div>
    </div>
  );
}
