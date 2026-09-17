// The compliance checklist on a shipment.
//
//   node tests/compliance.test.mjs
//
// Until this feature existed the table had a read path and nothing else: the
// panel said "No document checklist on this shipment" on every shipment there
// has ever been, because nothing in the application could put a row in it.
// What is tested here is therefore the write half — and specifically the two
// things that would hurt: a posted string reaching a CHECK constraint, and a
// certificate that expired after somebody ticked it off.
//
// Needs a database. No server, no browser.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const P = require('../.test-build/procurement.cjs');

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── a shipment of its own ────────────────────────────────────
await db.query(`DELETE FROM shipments WHERE code = 'SHP-COMPLY'`);   // documents cascade
const { rows: [ship] } = await db.query(
  `INSERT INTO shipments (code, status) VALUES ('SHP-COMPLY','in_transit') RETURNING id`);

// ── the standard checklist ───────────────────────────────────
const first = await P.seedShipmentChecklist(ship.id);
check('a new shipment can be given the standard checklist in one press',
  first === P.STANDARD_CHECKLIST.length, `${first} rows`);

const again = await P.seedShipmentChecklist(ship.id);
check('THE POINT: pressing it twice does not make two phytosanitary rows',
  again === 0 && (await P.getShipmentDocuments(ship.id)).length === P.STANDARD_CHECKLIST.length,
  `added ${again}`);

const kinds = (await P.getShipmentDocuments(ship.id)).map((d) => d.kind);
check('the permit and the phytosanitary certificate are both on it',
  kinds.includes('import_permit') && kinds.includes('phytosanitary'), kinds.join(' '));
check('CITES is not, because it applies to a minority of consignments',
  !kinds.includes('cites'));

// ── a posted string is an assertion, not a fact ──────────────
let refused = null;
try {
  await P.saveShipmentDocument({ shipmentId: ship.id, kind: 'bribe_receipt', status: 'required' });
} catch (e) { refused = e.message; }
check('an unknown document type is refused before it reaches the constraint',
  refused !== null && /bribe_receipt/.test(refused), String(refused));

refused = null;
try {
  await P.saveShipmentDocument({ shipmentId: ship.id, kind: 'invoice', status: 'lost_it' });
} catch (e) { refused = e.message; }
check('and so is an unknown status', refused !== null && /lost_it/.test(refused), String(refused));

// ── editing a row ────────────────────────────────────────────
const permit = (await P.getShipmentDocuments(ship.id)).find((d) => d.kind === 'import_permit');
await P.saveShipmentDocument({
  shipmentId: ship.id, id: permit.id, kind: 'import_permit',
  reference: '  MOC-88412  ', status: 'received',
  issuedOn: '2026-08-01', expiresOn: '2026-12-01', note: '   ',
});
const saved = (await P.getShipmentDocuments(ship.id)).find((d) => d.id === permit.id);
check('a reference is stored trimmed', saved.reference === 'MOC-88412', String(saved.reference));
check('a status is kept', saved.status === 'received', saved.status);
check('a field left blank is null, not an empty string somebody has to notice',
  saved.note === null, JSON.stringify(saved.note));
check('the dates are stored as dates', saved.issued_on === '2026-08-01' && saved.expires_on === '2026-12-01',
  `${saved.issued_on} → ${saved.expires_on}`);

// ── a document cannot be edited through another shipment ─────
const { rows: [other] } = await db.query(
  `INSERT INTO shipments (code, status) VALUES ('SHP-COMPLY-2','planned')
   ON CONFLICT (code) DO UPDATE SET status='planned' RETURNING id`);
await P.saveShipmentDocument({
  shipmentId: other.id, id: permit.id, kind: 'import_permit',
  reference: 'STOLEN', status: 'verified',
});
const untouched = (await P.getShipmentDocuments(ship.id)).find((d) => d.id === permit.id);
check('THE POINT: a row belonging to one shipment cannot be edited through another',
  untouched.reference === 'MOC-88412', String(untouched.reference));

// ── the countdown comes from the database ────────────────────
await db.query(
  `UPDATE shipment_documents SET expires_on = current_date - 2, status = 'verified'
    WHERE shipment_id = $1 AND kind = 'phytosanitary'`, [ship.id]);
await db.query(
  `UPDATE shipment_documents SET expires_on = current_date + 9
    WHERE shipment_id = $1 AND kind = 'certificate_of_origin'`, [ship.id]);

const docs = await P.getShipmentDocuments(ship.id);
const phy = docs.find((d) => d.kind === 'phytosanitary');
const org = docs.find((d) => d.kind === 'certificate_of_origin');
check('an expired document counts down past zero', Number(phy.days_to_expiry) === -2,
  String(phy.days_to_expiry));
check('one due soon says how soon', Number(org.days_to_expiry) === 9, String(org.days_to_expiry));
check('one with no expiry says nothing rather than guessing',
  docs.find((d) => d.kind === 'packing_list').days_to_expiry === null);

// This is the rule the console screen depends on: "verified" is not the end of
// the story if the certificate has since expired. Dimming that row for being
// ticked off is how a container ends up sitting at the port.
const settled = (d) =>
  (d.status === 'verified' || d.status === 'not_applicable') &&
  (d.days_to_expiry === null ? 1 : Number(d.days_to_expiry)) >= 0;
check('THE POINT: a verified certificate that has expired is still outstanding',
  settled(phy) === false, `${phy.status}, ${phy.days_to_expiry} days`);

// ── ordering is the order somebody works in ──────────────────
check('outstanding documents come before the ones that are done',
  docs.findIndex((d) => !settled(d)) < docs.findIndex((d) => settled(d))
  || docs.every((d) => !settled(d)),
  docs.map((d) => `${d.kind}${settled(d) ? '✓' : ''}`).join(' '));

// ── removing ─────────────────────────────────────────────────
await P.removeShipmentDocument(ship.id, org.id);
check('a document can be taken off the list',
  (await P.getShipmentDocuments(ship.id)).every((d) => d.id !== org.id));

await P.removeShipmentDocument(other.id, permit.id);
check('but not through a shipment it does not belong to',
  (await P.getShipmentDocuments(ship.id)).some((d) => d.id === permit.id));

await db.query(`DELETE FROM shipments WHERE code IN ('SHP-COMPLY','SHP-COMPLY-2')`);
await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
