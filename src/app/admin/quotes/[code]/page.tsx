import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  getQuote, getQuoteItems, getQuoteEvents, getQuoteVersions, totalsOf,
  acceptQuote, newVersion, logQuoteEvent, ISSUED, QUOTE_STATUSES,
} from '@/lib/quotes';
import { listSpecimens } from '@/lib/inventory';
import { getAllProducts } from '@/lib/products';
import { site } from '@/lib/site';
import { fmtDate } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

async function addLine(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change quotations.');

  const code = String(formData.get('code'));
  const version = Number(formData.get('version'));
  const q = await getQuote(code, version);
  if (!q) notFound();
  if (q.status !== 'draft') {
    throw new Error('This version has been issued. Create a new version to change it.');
  }

  const kind = String(formData.get('kind') ?? 'product') as 'specimen' | 'product' | 'service';
  const description = String(formData.get('description') ?? '').trim();
  const quantity = kind === 'specimen' ? 1 : Math.max(1, Number(formData.get('quantity') ?? 1));
  const unitPrice = Number(formData.get('unit_price') ?? 0);
  const discount = Number(formData.get('discount_pct') ?? 0);

  let stockItemId: string | null = null;
  let productRef: string | null = null;
  let landed: number | null = null;
  let label = description;

  if (kind === 'specimen') {
    const specCode = String(formData.get('specimen_code') ?? '').trim();
    const rows = await query<{ id: string; product_ref: string; landed_cost_aed: string | null }>(
      `SELECT id, product_ref, landed_cost_aed FROM stock_items WHERE code = $1`, [specCode]);
    if (!rows[0]) throw new Error('That specimen does not exist.');
    stockItemId = rows[0].id;
    productRef = rows[0].product_ref;
    landed = rows[0].landed_cost_aed ? Number(rows[0].landed_cost_aed) : null;
    if (!label) label = `${specCode} — ${productRef}`;
  } else if (kind === 'product') {
    productRef = String(formData.get('product_ref') ?? '').trim() || null;
    if (!label && productRef) label = productRef;
  }
  if (!label) throw new Error('A line needs a description.');

  const { rows: [n] } = { rows: await query<{ next: string }>(
    `SELECT COALESCE(max(line_no), 0) + 1 AS next FROM quote_items WHERE quote_id = $1`, [q.id]) };

  await query(
    `INSERT INTO quote_items
       (quote_id, line_no, kind, stock_item_id, product_ref, description,
        quantity, unit_price, discount_pct, landed_unit_cost_aed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [q.id, Number(n.next), kind, stockItemId, productRef, label,
     quantity, unitPrice, discount, landed]);

  await audit({ user, action: 'quote.line_added', entity: 'quote', entityId: `${code} v${version}` });
  revalidatePath(`/admin/quotes/${code}`);
}

async function setStatus(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change quotations.');

  const code = String(formData.get('code'));
  const version = Number(formData.get('version'));
  const status = String(formData.get('status'));
  if (!QUOTE_STATUSES.includes(status as never)) throw new Error('Unknown status.');

  const q = await getQuote(code, version);
  if (!q) notFound();

  if (status === 'accepted') {
    // Reserving stock is part of accepting, in one transaction, under a lock.
    const { reservedSpecimens } = await acceptQuote(code, version, user);
    await audit({ user, action: 'quote.accepted', entity: 'quote', entityId: `${code} v${version}`,
                  after: { reserved: reservedSpecimens } });
  } else {
    await query(
      `UPDATE quotes SET status = $3, issued_on = CASE WHEN $3 = 'sent' AND issued_on IS NULL
                                                       THEN current_date ELSE issued_on END,
                          updated_at = now()
        WHERE code = $1 AND version = $2`, [code, version, status]);
    await logQuoteEvent(q.id, status, user);
    await audit({ user, action: `quote.${status}`, entity: 'quote', entityId: `${code} v${version}`,
                  before: { status: q.status }, after: { status } });
  }

  revalidatePath(`/admin/quotes/${code}`);
  revalidatePath('/admin/quotes');
}

async function reviseQuote(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot revise quotations.');

  const code = String(formData.get('code'));
  const { version } = await newVersion(code, user);
  await audit({ user, action: 'quote.revised', entity: 'quote', entityId: code,
                after: { version } });
  revalidatePath(`/admin/quotes/${code}`);
  redirect(`/admin/quotes/${code}?v=${version}`);
}

export default async function QuotePage({
  params, searchParams,
}: { params: Promise<{ code: string }>; searchParams: Promise<{ v?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { code } = await params;
  const { v } = await searchParams;

  const q = await getQuote(code, v ? Number(v) : undefined);
  if (!q) notFound();

  const [items, events, versions, sellable] = await Promise.all([
    getQuoteItems(q.id), getQuoteEvents(q.id), getQuoteVersions(code),
    listSpecimens({ status: 'available' }),
  ]);
  const t = totalsOf(q, items);
  const catalogue = getAllProducts();
  const editable = q.status === 'draft';

  return (
    <>
      <p className="adm-sub"><Link href="/admin/quotes">← Quotations</Link></p>
      <h1>{q.code} <span style={{ fontSize: '.55em', color: '#8A8D7D' }}>v{q.version}</span></h1>
      <p className="adm-sub">
        <span className={`pill pill-${q.status === 'accepted' ? 'won' : q.status === 'draft' ? 'new' : ['rejected','expired','superseded'].includes(q.status) ? 'lost' : 'quoted'}`}>{q.status}</span>
        {' '}{q.customer_name}{q.customer_company ? ` · ${q.customer_company}` : ''}
        {q.emirate ? ` · ${q.emirate}` : ''}
        {q.valid_until ? ` · valid until ${fmtDate(q.valid_until).slice(0,11)}` : ''}
      </p>

      {versions.length > 1 && (
        <p className="adm-sub">
          Versions:{' '}
          {versions.map((ver) => (
            <Link key={ver.version} href={`/admin/quotes/${code}?v=${ver.version}`}
                  className="adm-chip" data-on={String(ver.version === q.version)}
                  style={{ marginRight: 6 }}>
              v{ver.version} · {ver.status}
            </Link>
          ))}
        </p>
      )}

      {!editable && (
        <p className="adm-sub">
          This version has been issued, so its lines are locked. Use <b>Revise</b> to
          create v{versions[0].version + 1} — the customer is holding this document.
        </p>
      )}

      <div className="adm-two">
        <div>
          <div className="adm-panel" style={{ marginBottom: 20 }}>
            <table className="adm-t">
              <thead>
                <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th>
                    <th>Disc.</th><th>Line total</th>
                    {user.role === 'owner' && <th>Landed</th>}</tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={7} className="adm-empty">No lines yet.</td></tr>
                ) : items.map((it) => {
                  const gross = Number(it.unit_price) * it.quantity;
                  const line = gross * (1 - Number(it.discount_pct) / 100);
                  return (
                    <tr key={it.id}>
                      <td className="num">{it.line_no}</td>
                      <td>
                        {it.description}
                        {it.specimen_code && <><br /><span style={{ color:'#8A8D7D', fontSize:'.76rem' }}>specimen {it.specimen_code}</span></>}
                      </td>
                      <td className="num">{it.quantity}</td>
                      <td className="num">{aed(Number(it.unit_price))}</td>
                      <td className="num">{Number(it.discount_pct) ? `${it.discount_pct}%` : '—'}</td>
                      <td className="num">{aed(line)}</td>
                      {user.role === 'owner' && (
                        <td className="num">{it.landed_unit_cost_aed ? aed(Number(it.landed_unit_cost_aed)) : '—'}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
            <h2>Totals</h2>
            <dl className="adm-dl">
              <div><dt>Subtotal</dt><dd>AED {aed(t.subtotal)}</dd></div>
              {t.discount > 0 && <div><dt>Discount</dt><dd>− AED {aed(t.discount)}</dd></div>}
              <div><dt>Net</dt><dd>AED {aed(t.net)}</dd></div>
              {q.vat_enabled
                ? <div><dt>VAT {(Number(q.vat_rate) * 100).toFixed(0)}%</dt><dd>AED {aed(t.vat)}</dd></div>
                : <div><dt>VAT</dt><dd>Not applicable — exclusive of VAT where applicable</dd></div>}
              <div><dt><b>Total</b></dt><dd><b>AED {aed(t.total)}</b></dd></div>
            </dl>
            {user.role === 'owner' && (
              <>
                <h2 style={{ marginTop: 22 }}>Margin (internal)</h2>
                <dl className="adm-dl">
                  <div><dt>Landed cost</dt><dd>AED {aed(t.cost)}</dd></div>
                  <div><dt>Gross profit</dt><dd>AED {aed(t.profit)}</dd></div>
                  <div><dt>Margin</dt><dd>{t.marginPct}%</dd></div>
                </dl>
                {t.cost === 0 && items.length > 0 && (
                  <p className="adm-sub" style={{ margin: '10px 0 0' }}>
                    No landed cost on these lines, so the margin shown is not real.
                    Cost the shipment first.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="adm-panel adm-pad">
            <h2>History</h2>
            {events.length === 0 ? <p className="adm-sub" style={{ margin:0 }}>Nothing yet.</p>
              : events.map((e) => (
                <div key={e.id} className="adm-note">
                  <div className="adm-note-meta">{fmtDate(e.at)} · {e.user_email ?? 'system'} · {e.kind}</div>
                  {e.note && <div>{e.note}</div>}
                </div>
              ))}
          </div>
        </div>

        {user.role !== 'viewer' && (
          <div>
            <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
              <h2>Actions</h2>
              <p style={{ marginBottom: 14 }}>
                <Link href={`/admin/quotes/${code}/print?v=${q.version}`} className="adm-btn adm-btn-sec adm-print"
                      target="_blank" style={{ display:'block', textAlign:'center', textDecoration:'none' }}>
                  Print / save as PDF
                </Link>
              </p>
              <form action={setStatus} style={{ marginBottom: 14 }}>
                <input type="hidden" name="code" value={q.code} />
                <input type="hidden" name="version" value={q.version} />
                <label className="adm-field"><span>Status</span>
                  <select name="status" defaultValue={q.status}>
                    {QUOTE_STATUSES.filter((s) => s !== 'superseded').map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <button className="adm-btn adm-set-status" type="submit" style={{ width:'100%' }}>
                  Update status
                </button>
                <p className="adm-sub" style={{ margin:'10px 0 0' }}>
                  Accepting reserves every specimen and lot on the quotation, in one
                  transaction. If a tree has gone since, the whole acceptance is refused.
                </p>
              </form>
              <form action={reviseQuote}>
                <input type="hidden" name="code" value={q.code} />
                <button className="adm-btn adm-btn-sec adm-revise" type="submit" style={{ width:'100%' }}>
                  Revise — create v{versions[0].version + 1}
                </button>
              </form>
            </div>

            {editable && (
              <div className="adm-panel adm-pad">
                <h2>Add a line</h2>
                <form action={addLine}>
                  <input type="hidden" name="code" value={q.code} />
                  <input type="hidden" name="version" value={q.version} />
                  <label className="adm-field"><span>Kind</span>
                    <select name="kind" defaultValue="product">
                      <option value="specimen">specimen — one named tree</option>
                      <option value="product">product — from the catalogue</option>
                      <option value="service">service — delivery, crane, planting</option>
                    </select>
                  </label>
                  <label className="adm-field"><span>Specimen code (for specimen lines)</span>
                    <select name="specimen_code" defaultValue="">
                      <option value="">—</option>
                      {sellable.filter((s) => s.is_sellable).map((s) => (
                        <option key={s.code} value={s.code}>{s.code} — {s.product_ref}</option>
                      ))}
                    </select>
                  </label>
                  <label className="adm-field"><span>Catalogue reference (for product lines)</span>
                    <select name="product_ref" defaultValue="">
                      <option value="">—</option>
                      {catalogue.map((p) => <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>)}
                    </select>
                  </label>
                  <label className="adm-field"><span>Description</span><input name="description" /></label>
                  <label className="adm-field"><span>Quantity</span><input name="quantity" type="number" min={1} defaultValue={1} /></label>
                  <label className="adm-field"><span>Unit price (AED)</span><input name="unit_price" type="number" step="0.01" /></label>
                  <label className="adm-field"><span>Discount %</span><input name="discount_pct" type="number" step="0.01" min={0} max={100} defaultValue={0} /></label>
                  <button className="adm-btn adm-add-line" type="submit" style={{ width:'100%' }}>Add line</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
