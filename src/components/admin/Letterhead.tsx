import type { Settings } from '@/lib/settings';

/**
 * Who is issuing this document, at the top of every sheet a customer keeps.
 *
 * WHY IT EXISTS. The printed quotation carried the company's name and its
 * tagline and nothing else — no address, no trade licence, and no way to
 * reply. A customer holding it could not telephone, email or verify who had
 * sent it, and the invoice had no sheet at all. On a document that goes out
 * of the building, the sender's identity is not decoration.
 *
 * EVERY FIELD IS OPTIONAL AND EVERY FIELD IS WIRED. The trade licence has not
 * been issued and there is no registered address yet, so both are absent
 * today — and the moment either is typed into /admin/settings it appears on
 * the next quotation and the next invoice with no deploy and no developer.
 * That is the point of reserving the place rather than waiting: the work is
 * done now, while the facts are known to be missing, instead of being
 * remembered later when they are not.
 *
 * A field that is not set renders NOTHING — not a label with a blank beside
 * it, and never a placeholder. A quotation that says "Trade licence: —" tells
 * a buyer the company has no licence, which is a worse statement than silence
 * and, once there is one, simply wrong.
 */
export default function Letterhead({ site, trnAtIssue }: {
  site: Settings;
  /**
   * The TRN as it stood when the document was ISSUED, not as it stands today.
   * An invoice is a historical record: re-reading the current registration
   * onto a document sent last year would rewrite what the customer was given.
   * Falls back to the setting only when a document carries none — which is
   * every document issued before the company was registered.
   */
  trnAtIssue?: string | null;
}) {
  const trn = (trnAtIssue ?? '').trim() || (site.trn ?? '').trim();
  const licence = (site.licenceNumber ?? '').trim();
  const address = (site.address ?? '').trim();
  const place = [site.city, site.country].filter(Boolean).join(', ');

  return (
    <div className="lh">
      <p className="lh-name">{site.legalName}</p>
      {site.tagline && <p className="lh-tag">{site.tagline}</p>}

      {/* Where the company is. The city and country are known and stated even
          before there is a street address to put above them. */}
      {(address || place) && (
        <p className="lh-line">
          {address && <>{address}<br /></>}
          {place}
        </p>
      )}

      {/* The registrations. Absent until they exist; printed the day they do. */}
      {(licence || trn) && (
        <p className="lh-line">
          {licence && <>Trade licence {licence}</>}
          {licence && trn && <> · </>}
          {trn && <>TRN {trn}</>}
        </p>
      )}

      {/* How to answer this document. A quotation nobody can reply to is a
          quotation that gets replied to by somebody else. */}
      {(site.email || site.whatsappLabel || site.phone) && (
        <p className="lh-line">
          {site.email}
          {site.email && (site.whatsappLabel || site.phone) && <> · </>}
          {site.whatsappLabel ? `WhatsApp ${site.whatsappLabel}` : site.phone}
        </p>
      )}

      <style>{`
        .lh-name {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: 1.32rem; line-height: 1.15; margin: 0 0 .2rem;
          color: var(--ink-900, #14210F);
        }
        .lh-tag { margin: 0 0 .5rem; font-size: .84rem; color: var(--ink-500, #5B6656); }
        /* Tight, because a letterhead is read at a glance and then ignored —
           and because on A4 every millimetre here is a millimetre the lines of
           the quotation do not get. */
        .lh-line {
          margin: 0 0 .15rem; font-size: .74rem; line-height: 1.45;
          color: var(--ink-500, #5B6656);
        }
      `}</style>
    </div>
  );
}
