import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import { STATUSES, StatusPill, fmtDate } from '@/components/admin/bits';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Lead = {
  id: string; reference: string; created_at: string; enquiry_type: string;
  name: string; company: string | null; email: string; phone: string | null;
  emirate: string | null; project_type: string | null; service_scope: string | null;
  product_ref: string | null; quantity: number | null; required_date: string | null;
  message: string | null; source: string | null; status: string;
  next_follow_up: string | null; last_contacted: string | null; consent: boolean;
};
type Note = { id: string; at: string; user_email: string | null; kind: string; body: string };

async function updateLead(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change leads.');

  const reference = String(formData.get('reference'));
  const status = String(formData.get('status'));
  const followUp = String(formData.get('next_follow_up') ?? '').trim() || null;
  const note = String(formData.get('note') ?? '').trim();

  if (!STATUSES.includes(status as never)) throw new Error('Unknown status.');

  const before = (await query<Lead>(
    'SELECT * FROM leads WHERE reference = $1', [reference]))[0];
  if (!before) notFound();

  await query(
    `UPDATE leads
        SET status = $2, next_follow_up = $3, updated_at = now(),
            last_contacted = CASE WHEN $2 <> 'new' THEN now() ELSE last_contacted END
      WHERE reference = $1`,
    [reference, status, followUp]);

  if (before.status !== status) {
    await query(
      `INSERT INTO lead_notes (lead_id, user_id, user_email, kind, body)
       VALUES ($1,$2,$3,'status',$4)`,
      [before.id, user.id, user.email, `Status ${before.status} → ${status}`]);
    await audit({
      user, action: 'lead.status_changed', entity: 'lead', entityId: reference,
      before: { status: before.status }, after: { status },
    });
  }
  if (note) {
    await query(
      `INSERT INTO lead_notes (lead_id, user_id, user_email, kind, body)
       VALUES ($1,$2,$3,'note',$4)`, [before.id, user.id, user.email, note]);
    await audit({ user, action: 'lead.note_added', entity: 'lead', entityId: reference });
  }

  revalidatePath(`/admin/leads/${reference}`);
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}

export default async function LeadPage({ params }: { params: Promise<{ reference: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { reference } = await params;

  const lead = (await query<Lead>('SELECT * FROM leads WHERE reference = $1', [reference]))[0];
  if (!lead) notFound();

  const notes = await query<Note>(
    `SELECT id, at, user_email, kind, body FROM lead_notes
      WHERE lead_id = $1 ORDER BY at DESC`, [lead.id]);

  const wa = lead.phone
    ? `https://wa.me/${lead.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `Hello ${lead.name}, thank you for your enquiry with ${site.legalName} (ref ${lead.reference}).`)}`
    : null;

  const F: [string, string | number | null][] = [
    ['Reference', lead.reference],
    ['Received', fmtDate(lead.created_at)],
    ['Enquiry type', lead.enquiry_type],
    ['Company', lead.company],
    ['Emirate', lead.emirate],
    ['Project type', lead.project_type],
    ['Scope required', lead.service_scope],
    ['Specimen', lead.product_ref],
    ['Quantity', lead.quantity],
    ['Required on site by', lead.required_date],
    ['Source', lead.source],
    ['Consent recorded', lead.consent ? 'Yes' : 'No'],
    ['Last contacted', lead.last_contacted ? fmtDate(lead.last_contacted) : null],
  ];

  return (
    <>
      <p className="adm-sub"><Link href="/admin/leads">← All leads</Link></p>
      <h1>{lead.name}</h1>
      <p className="adm-sub">
        <StatusPill status={lead.status} /> &nbsp;{lead.reference}
        {lead.company ? ` · ${lead.company}` : ''}
      </p>

      <div className="adm-two">
        <div className="adm-panel adm-pad">
          <h2>Enquiry</h2>
          <dl className="adm-dl">
            {F.filter(([, v]) => v !== null && v !== '').map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
            ))}
            <div><dt>Email</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
            {lead.phone && (
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                  {wa && <> · <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></>}
                </dd>
              </div>
            )}
          </dl>

          {lead.message && (
            <>
              <h2 style={{ marginTop: 24 }}>Message</h2>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{lead.message}</p>
            </>
          )}

          <h2 style={{ marginTop: 28 }}>Activity</h2>
          {notes.length === 0 ? (
            <p className="adm-sub" style={{ margin: 0 }}>Nothing logged yet.</p>
          ) : notes.map((n) => (
            <div key={n.id} className="adm-note">
              <div className="adm-note-meta">
                {fmtDate(n.at)} · {n.user_email ?? 'system'} · {n.kind}
              </div>
              <div>{n.body}</div>
            </div>
          ))}
        </div>

        <div className="adm-panel adm-pad">
          <h2>Work this lead</h2>
          {user.role === 'viewer' ? (
            <p className="adm-sub">You have read-only access.</p>
          ) : (
            <form action={updateLead}>
              <input type="hidden" name="reference" value={lead.reference} />
              <label className="adm-field">
                <span>Status</span>
                <select name="status" defaultValue={lead.status}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Next follow-up</span>
                <input type="date" name="next_follow_up" defaultValue={lead.next_follow_up ?? ''} />
              </label>
              <label className="adm-field">
                <span>Add a note</span>
                <textarea name="note" rows={5} placeholder="What was said, what was agreed, what is next." />
              </label>
              <button className="adm-btn adm-save" type="submit" style={{ width: '100%' }}>Save</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
