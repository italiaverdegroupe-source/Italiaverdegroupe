import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  ALERT_KINDS, kindByKey, listAlerts, listRules, markDone, reopen,
  runScan, lastRun, outboundQueue, seedDefaultRules, type Severity,
} from '@/lib/alerts';
import { drainOutbound, outboundSummary, requeueBlocked } from '@/lib/outbound';
import { mailProvider, sendMail, mailFrom } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const SEV: Severity[] = ['info', 'warning', 'urgent'];
const pillFor = (s: string) =>
  s === 'urgent' ? 'pill-lost' : s === 'warning' ? 'pill-negotiation' : 'pill-qualified';

/**
 * The From address, for display only.
 *
 * mailFrom() throws when nothing is configured, which is right for a send and
 * wrong for a page: a settings screen that 500s because a setting is missing
 * is the least useful place for it to fail.
 */
const safeFrom = () => {
  try { return mailFrom(); } catch { return 'not set'; }
};

const when = (v: string | null) => {
  if (!v) return '—';
  const d = new Date(v);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return d.toISOString().slice(0, 10);
};

// ── actions ──────────────────────────────────────────────────

async function requireEditor() {
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change alerts.');
  return user;
}

/**
 * Send whatever is waiting, now, rather than at the next tick.
 *
 * The drain runs on the same fifteen-minute timer as the alert scan, which is
 * right for a queue nobody is watching and wrong for the ten minutes after
 * somebody has just pasted in an SMTP password and wants to know.
 */
async function sendNow() {
  'use server';
  const user = await requireEditor();
  const r = await drainOutbound({ limit: 50 });
  await audit({
    user, action: 'outbound.drained', entity: 'outbound',
    after: { sent: r.sent, failed: r.failed, retried: r.retried },
  });
  revalidatePath('/admin/alerts');
}

/**
 * One email to the person who just configured the mailbox.
 *
 * Every other message in this system is queued and drained. This one is sent
 * inline and its error is thrown at the screen, because the only question
 * being asked is "do these credentials work", and an answer that arrives in a
 * table fifteen minutes later does not answer it.
 */
async function sendTest(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role !== 'owner') throw new Error('Only the owner can send a test.');

  const to = String(formData.get('to') ?? '').trim();
  if (!to.includes('@')) throw new Error('Enter an email address to send the test to.');

  // The outcome is recorded rather than thrown.
  //
  // A thrown server action reaches the browser as Next's generic error page
  // with the message stripped out in a production build — and the whole
  // question being asked here is *why* the mail server refused. "An error
  // occurred" is the one answer that does not answer it. So both outcomes go
  // to the audit log and the page prints the last one underneath the button.
  let ok = true;
  let detail = '';
  try {
    await sendMail({
      to,
      subject: 'Verde Garden Trading — mail is working',
      text: [
        'This is the test message from the operations console.',
        '',
        `If you are reading it, outgoing mail is configured correctly and every`,
        `notification queued in the console will now be delivered.`,
        '',
        `Sent from: ${mailFrom()}`,
        `Provider: ${mailProvider()}`,
      ].join('\n'),
    });
  } catch (err) {
    ok = false;
    detail = err instanceof Error ? err.message : String(err);
  }

  await audit({
    user, action: 'outbound.test', entity: 'outbound',
    after: { to, ok, detail: detail.slice(0, 500) },
  });
  revalidatePath('/admin/alerts');
}

/**
 * Release the backlog that was written 'blocked' when nothing could send.
 *
 * Seven days rather than everything. The rows older than that describe stock
 * levels, permits and quotations as they were months ago; delivering them now
 * would be a burst of notices about situations that have already resolved,
 * which is how somebody learns to ignore this system's email.
 */
/**
 * One address on every rule at once.
 *
 * There are sixteen rules and each has its own "Also email" field, so turning
 * notifications on meant typing the same mailbox sixteen times and saving
 * sixteen forms — which is how a company ends up with it on four of them and
 * wonders why it hears about permits but not overdue invoices. The per-rule
 * field stays: a company that wants stock warnings at the yard and invoices at
 * accounts still sets those one at a time. This is the first step, not the
 * only one.
 */
async function emailAll(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role !== 'owner') throw new Error('Only the owner can change rules.');

  const to = String(formData.get('email_all') ?? '').trim();
  // Empty clears them — deliberately possible, because turning it off should
  // be as easy as turning it on and not a matter of emptying sixteen fields.
  if (to && !to.includes('@')) throw new Error('That is not an email address.');

  const rows = await query<{ id: string }>(
    `UPDATE alert_rules SET email_to = $1, updated_at = now(), updated_by = $2
      WHERE email_to IS DISTINCT FROM $1 RETURNING id`, [to || null, user.id]);

  await audit({
    user, action: 'alert_rule.email_all', entity: 'alert_rule',
    after: { email_to: to || null, rules: rows.length },
  });
  revalidatePath('/admin/alerts');
}

async function requeueNow() {
  'use server';
  const user = await requireEditor();
  const n = await requeueBlocked(7);
  await audit({
    user, action: 'outbound.requeued', entity: 'outbound', after: { requeued: n },
  });
  revalidatePath('/admin/alerts');
}

async function dismiss(formData: FormData) {
  'use server';
  const user = await requireEditor();
  await markDone(String(formData.get('id') ?? ''), user.id);
  revalidatePath('/admin/alerts');
}

async function undo(formData: FormData) {
  'use server';
  await requireEditor();
  await reopen(String(formData.get('id') ?? ''));
  revalidatePath('/admin/alerts');
}

async function scanNow() {
  'use server';
  const user = await requireEditor();
  await seedDefaultRules();                 // no-op once rules exist
  const r = await runScan('manual');
  await audit({ user, action: 'alerts.scanned', entity: 'alert',
                after: { raised: r.raised, checked: r.checked, errors: r.errors } });
  revalidatePath('/admin/alerts');
}

/**
 * Save one rule. Only the configurable parts move: an administrator changes
 * when and whom a rule warns, never what it queries.
 */
async function saveRule(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role !== 'owner') throw new Error('Only the owner can change alert rules.');

  const id = String(formData.get('id') ?? '');
  const severity = String(formData.get('severity') ?? 'info');
  if (!SEV.includes(severity as Severity)) throw new Error('Unknown severity.');

  const rawThreshold = String(formData.get('threshold') ?? '').trim();
  const threshold = rawThreshold === '' ? null : Number(rawThreshold);
  if (threshold !== null && !Number.isInteger(threshold)) {
    throw new Error('The number is a count of days, hours or units — it has to be whole.');
  }
  if (threshold !== null && threshold < 0) throw new Error('The number cannot be negative.');

  const role = String(formData.get('to_role') ?? '').trim();

  await query(
    `UPDATE alert_rules
        SET is_active = $2, severity = $3, threshold = $4, to_role = $5,
            email_to = $6, whatsapp_to = $7, template = $8,
            updated_at = now(), updated_by = $9
      WHERE id = $1`,
    [id, formData.get('is_active') === 'on', severity, threshold,
     role === '' ? null : role,
     String(formData.get('email_to') ?? '').trim() || null,
     String(formData.get('whatsapp_to') ?? '').trim() || null,
     String(formData.get('template') ?? '').trim() || null,
     user.id]);

  await audit({ user, action: 'alert_rule.updated', entity: 'alert_rule', entityId: id,
                after: { severity, threshold, active: formData.get('is_active') === 'on' } });
  revalidatePath('/admin/alerts');
}

// ── page ─────────────────────────────────────────────────────

export default async function AlertsPage({ searchParams }: {
  searchParams: Promise<{ show?: string; tab?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const { show, tab } = await searchParams;
  const includeDone = show === 'all';
  const view = tab === 'rules' ? 'rules' : tab === 'outbound' ? 'outbound' : 'inbox';

  const [alerts, rules, runs, outbound, counts, tests] = await Promise.all([
    listAlerts({ id: user.id, role: user.role }, { includeDone }),
    listRules(),
    lastRun(),
    outboundQueue(60),
    outboundSummary(),
    query<{ at: string; after: { to?: string; ok?: boolean; detail?: string } }>(
      `SELECT at, after FROM audit_log
        WHERE action = 'outbound.test' ORDER BY at DESC LIMIT 1`),
  ]);
  const lastTest = tests[0];
  const provider = mailProvider();
  // How many rules would actually send. A queue with a provider and no
  // recipients is as silent as one with recipients and no provider, and the
  // rules screen is the only place that second half can be seen.
  const withEmail = rules.filter((r) => (r.email_to ?? '').trim() !== '').length;
  const run = runs[0];
  const open = alerts.filter((a) => !a.done_at);
  const urgent = open.filter((a) => a.severity === 'urgent').length;
  const blocked = outbound.filter((m) => m.status === 'blocked').length;

  return (
    <>
      <h1>Alerts</h1>
      <p className="adm-sub">
        The part of the system that speaks first. Everything else waits to be
        asked — an invoice falls overdue in silence, a permit lapses while a
        container is at sea. These are the conditions worth being interrupted for.
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{open.length}</b><span>Open</span></div>
        <div className="adm-card"><b>{urgent}</b><span>Urgent</span></div>
        <div className="adm-card"><b>{rules.filter((r) => r.is_active).length}</b><span>Active rules</span></div>
        <div className="adm-card">
          <b>{run ? when(run.started_at) : 'never'}</b><span>Last check</span>
        </div>
      </div>

      <div className="adm-filters" style={{ marginBottom: 18 }}>
        <Link className="adm-chip" data-on={view === 'inbox'} href="/admin/alerts">Inbox</Link>
        <Link className="adm-chip" data-on={view === 'rules'} href="/admin/alerts?tab=rules">Rules</Link>
        <Link className="adm-chip" data-on={view === 'outbound'} href="/admin/alerts?tab=outbound">
          Outbound{blocked > 0 ? ` (${blocked} blocked)` : ''}
        </Link>
        <form action={scanNow} style={{ marginInlineStart: 'auto' }}>
          <button type="submit" className="adm-btn adm-scan">Run checks now</button>
        </form>
      </div>

      {run?.error && (
        <p className="adm-err">Last check reported: {run.error}</p>
      )}

      {view === 'inbox' && (
        <>
          <div className="adm-filters" style={{ marginBottom: 12 }}>
            <Link className="adm-chip" data-on={!includeDone} href="/admin/alerts">Open</Link>
            <Link className="adm-chip" data-on={includeDone} href="/admin/alerts?show=all">
              Including dealt with
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="adm-panel adm-pad">
              <p className="adm-empty">
                Nothing needs attention. The checks ran {run ? when(run.started_at) : 'never'} —
                if that says never, press <b>Run checks now</b>.
              </p>
            </div>
          ) : (
            <div className="adm-panel">
              <table className="adm-t">
                <thead>
                  <tr><th>Severity</th><th>What</th><th>Raised</th><th /></tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id} style={a.done_at ? { opacity: 0.5 } : undefined}>
                      <td><span className={`pill ${pillFor(a.severity)}`}>{a.severity}</span></td>
                      <td>
                        <b>{a.href ? <Link href={a.href}>{a.title}</Link> : a.title}</b>
                        {a.body && <div className="adm-sub" style={{ margin: 0 }}>{a.body}</div>}
                        <div className="adm-sub" style={{ margin: 0, fontSize: 12 }}>
                          {kindByKey(a.kind)?.label ?? a.kind}
                        </div>
                      </td>
                      <td>{when(a.raised_at)}</td>
                      <td className="num">
                        {a.done_at ? (
                          <form action={undo}>
                            <input type="hidden" name="id" value={a.id} />
                            <button type="submit" className="adm-btn-sec adm-undo">Reopen</button>
                          </form>
                        ) : (
                          <form action={dismiss}>
                            <input type="hidden" name="id" value={a.id} />
                            <button type="submit" className="adm-btn-sec adm-done">Dealt with</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="adm-sub" style={{ fontSize: 12 }}>
            Dealt-with alerts are kept, not deleted. “Was anyone warned before
            that container sat at the port for a week” has to stay answerable.
          </p>
        </>
      )}

      {view === 'rules' && (
        <>
          <p className="adm-sub">
            Each rule is a row, so the numbers are yours to change: warn five
            days before an invoice falls due instead of three, or drop the low
            stock floor to two. What stays in code is the query behind each
            kind — a new kind of warning genuinely is development, and a screen
            pretending otherwise would be misleading.
          </p>
          {user.role !== 'owner' && (
            <p className="adm-err">You can see these, but only the owner can change them.</p>
          )}
          {user.role === 'owner' && rules.length > 0 && (
            <div className="adm-panel adm-pad adm-rule-all">
              <p className="adm-sub" style={{ margin: 0 }}>
                {withEmail === 0 ? (
                  <>
                    <strong>No rule has an address on it</strong>, so nothing would be
                    emailed even with a mail provider configured. An alert with no
                    recipient is raised in the console and goes no further.
                  </>
                ) : (
                  <>{withEmail} of {rules.length} rules send an email.</>
                )}
              </p>
              <form action={emailAll} className="adm-out-test">
                <input name="email_all" type="email" className="adm-search"
                       placeholder="Send every alert to…" defaultValue={user.email} />
                <button type="submit" className="adm-btn">Apply to all {rules.length}</button>
              </form>
            </div>
          )}
          {rules.length === 0 && (
            <div className="adm-panel adm-pad">
              <p className="adm-empty">No rules yet. Press <b>Run checks now</b> to install the defaults.</p>
            </div>
          )}

          {rules.map((r) => {
            const k = kindByKey(r.kind);
            return (
              <form key={r.id} action={saveRule} className="adm-panel adm-pad" style={{ marginBottom: 16 }}>
                <input type="hidden" name="id" value={r.id} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0 }}>{r.name}</h2>
                  <span className="pill pill-quoted">{k?.trigger === 'event' ? 'on the event' : 'on a schedule'}</span>
                  <code style={{ fontSize: 12, opacity: 0.6 }}>{r.kind}</code>
                </div>
                {k && <p className="adm-sub" style={{ marginTop: 6 }}>{k.why}</p>}

                <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                  <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" name="is_active" defaultChecked={r.is_active}
                           style={{ width: 16, height: 16 }} disabled={user.role !== 'owner'} />
                    <span>Active</span>
                  </label>

                  <label className="adm-field">
                    <span>Severity</span>
                    <select name="severity" defaultValue={r.severity} disabled={user.role !== 'owner'}>
                      {SEV.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>

                  {k?.thresholdLabel && (
                    <label className="adm-field">
                      <span>{k.thresholdLabel}</span>
                      <input name="threshold" type="number" min={0} step="1"
                             defaultValue={r.threshold ?? ''} disabled={user.role !== 'owner'} />
                    </label>
                  )}

                  <label className="adm-field">
                    <span>Only this role sees it</span>
                    <select name="to_role" defaultValue={r.to_role ?? ''} disabled={user.role !== 'owner'}>
                      <option value="">Everyone</option>
                      <option value="owner">Owner</option>
                      <option value="sales">Sales</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </label>

                  <label className="adm-field">
                    <span>Also email</span>
                    <input name="email_to" type="email" defaultValue={r.email_to ?? ''}
                           placeholder="nobody" disabled={user.role !== 'owner'} />
                  </label>

                  <label className="adm-field">
                    <span>Also WhatsApp</span>
                    <input name="whatsapp_to" defaultValue={r.whatsapp_to ?? ''}
                           placeholder="nobody" disabled={user.role !== 'owner'} />
                  </label>

                  <label className="adm-field" style={{ gridColumn: '1 / -1' }}>
                    <span>
                      Wording — leave empty for the built-in text.
                      {k?.tokens.length ? ` Available: ${k.tokens.map((t) => `{${t}}`).join(' ')}` : ''}
                    </span>
                    <input name="template" defaultValue={r.template ?? ''}
                           disabled={user.role !== 'owner'} />
                  </label>
                </div>

                {user.role === 'owner' && (
                  <button type="submit" className="adm-btn adm-save-rule">Save</button>
                )}
              </form>
            );
          })}

          <div className="adm-panel adm-pad">
            <h2>Kinds available</h2>
            <p className="adm-sub">
              {ALERT_KINDS.length} in total. A kind with no rule raises nothing —
              silence is a choice, not a fault.
            </p>
          </div>
        </>
      )}

      {view === 'outbound' && (
        <>
          {/* This paragraph used to say "nothing here is sent yet" as a fact
              about the world. It is a fact about a setting, and the setting
              can change without anybody editing this file. */}
          {provider ? (
            <p className="adm-sub">
              Anything addressed outside the console. Mail goes out over{' '}
              <strong>{provider === 'smtp' ? 'SMTP' : 'Resend'}</strong>, from{' '}
              <strong>{safeFrom()}</strong>. Queued messages are sent on the same
              fifteen-minute tick as the alert scan; a failure waits and is tried
              again, up to five times, and then stops with the reason on the row.
            </p>
          ) : (
            <p className="adm-sub">
              Anything addressed outside the console. <strong>Nothing is being
              sent</strong>, because no mail provider is configured — set{' '}
              <code>SMTP_URL</code> (a mailbox on the company domain) or{' '}
              <code>RESEND_API_KEY</code>, plus <code>MAIL_FROM</code>, and these
              rows go out on the next tick. They wait with the reason attached
              rather than being dropped, and rather than this system claiming to
              have sent an email it never could.
            </p>
          )}

          <div className="adm-cards adm-out-cards">
            {(['queued', 'sending', 'sent', 'failed', 'blocked'] as const).map((k) => (
              <div className="adm-card" key={k}>
                <b>{counts[k] ?? 0}</b><span>{k}</span>
              </div>
            ))}
          </div>

          {user.role !== 'viewer' && (
            <div className="adm-out-acts">
              <form action={sendNow}>
                <button type="submit" className="adm-btn" disabled={!provider}>
                  Send what is waiting
                </button>
              </form>
              {provider && (counts.blocked ?? 0) > 0 && (
                <form action={requeueNow}>
                  <button type="submit" className="adm-btn adm-btn-sec">
                    Requeue the last 7 days of blocked
                  </button>
                </form>
              )}
              {user.role === 'owner' && (
                <form action={sendTest} className="adm-out-test">
                  <input name="to" type="email" className="adm-search"
                         placeholder="Send a test to…" defaultValue={user.email}
                         required disabled={!provider} />
                  <button type="submit" className="adm-btn adm-btn-sec" disabled={!provider}>
                    Test
                  </button>
                </form>
              )}
            </div>
          )}
          {/* What happened the last time somebody pressed Test. Printed here
              rather than thrown, because a production build strips the reason
              out of a thrown server action and the reason is the answer. */}
          {lastTest && (
            <p className={lastTest.after?.ok ? 'adm-sub' : 'adm-err'}>
              {lastTest.after?.ok
                ? `Test message accepted for ${lastTest.after?.to} — ${when(lastTest.at)}.`
                : `Test message failed ${when(lastTest.at)}: ${lastTest.after?.detail ?? 'no reason given'}`}
            </p>
          )}
          {outbound.length === 0 ? (
            <div className="adm-panel adm-pad">
              <p className="adm-empty">
                Nothing queued. No rule has an email address or WhatsApp number on it.
              </p>
            </div>
          ) : (
            <div className="adm-panel">
              <table className="adm-t">
                <thead>
                  <tr><th>Channel</th><th>To</th><th>Subject</th><th>State</th><th>Queued</th></tr>
                </thead>
                <tbody>
                  {outbound.map((m) => (
                    <tr key={m.id}>
                      <td>{m.channel}</td>
                      <td>{m.address}</td>
                      <td>{m.subject}</td>
                      <td>
                        <span className={`pill ${
                          m.status === 'sent' ? 'pill-won'
                          : m.status === 'failed' ? 'pill-lost'
                          : m.status === 'blocked' ? 'pill-negotiation'
                          : 'pill-new'}`}>
                          {m.status}
                        </span>
                        {m.status_note && (
                          <div className="adm-sub" style={{ margin: 0, fontSize: 12 }}>{m.status_note}</div>
                        )}
                      </td>
                      <td>{when(m.queued_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
