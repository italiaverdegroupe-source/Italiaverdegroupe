import Link from 'next/link';

/**
 * A record the console asked for and could not find.
 *
 * Ten pages call notFound() when an order, quotation, shipment or lead code
 * does not resolve. Before the console had its own root layout those landed on
 * the site's 404, complete with the marketing header; after the split they
 * landed on Next's unstyled default, which is worse — a signed-in operator
 * with no branding and no way back. This is the console's own.
 */
export default function ConsoleNotFound() {
  return (
    <>
      <h1>No such record</h1>
      <p className="adm-sub">
        That code does not match anything in the system. It may have been
        cancelled, renumbered, or mistyped.
      </p>
      <div className="adm-panel adm-pad">
        <p className="adm-sub" style={{ marginBottom: 18 }}>
          Try the list it should be in:
        </p>
        <div className="adm-filters" style={{ marginBottom: 0 }}>
          <Link className="adm-chip" href="/admin">Overview</Link>
          <Link className="adm-chip" href="/admin/orders">Orders</Link>
          <Link className="adm-chip" href="/admin/quotes">Quotations</Link>
          <Link className="adm-chip" href="/admin/shipments">Shipments</Link>
          <Link className="adm-chip" href="/admin/leads">Leads</Link>
          <Link className="adm-chip" href="/admin/inventory">Inventory</Link>
        </div>
      </div>
    </>
  );
}
