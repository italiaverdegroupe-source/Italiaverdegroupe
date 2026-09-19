import { deleteRecord, restoreRecord, purgeRecord } from '@/app/(console)/admin/delete-actions';
import { adminUi } from '@/lib/admin-ui';
import { blockerText, type BlockReason, type DeletableKind } from '@/lib/deletion';
import { fmtDate } from '@/components/admin/bits';
import DeleteForm from '@/components/admin/DeleteForm';

/**
 * The delete control, everywhere.
 *
 * One component rather than a button per screen: the rules are identical
 * across all of them, and fourteen copies is fourteen chances to forget the
 * confirmation, the role check or the return path.
 *
 * WHY A FORM AND NOT A FETCH. It is a server action behind an ordinary form,
 * so it works on the slow connection an operations tool is most often used
 * on, and before the page has finished hydrating.
 *
 * WHY THE BUTTONS ARE A CLIENT COMPONENT. Two reasons, both in DeleteForm:
 * the confirmation needs an event handler, and a refusal has to be RETURNED
 * by the action rather than thrown, or a production build replaces it with a
 * digest and the person is told nothing at all.
 *
 * Everything this component decides — the wording, the role, the blockers —
 * is decided on the server and handed down as finished strings, so the
 * browser is never sent the rules, only the outcome.
 */
export default function DeleteControls({
  kind, code, back, deletedAt, deletedBy, role, locale, blockers = [],
}: {
  kind: DeletableKind;
  /** The code or reference a person recognises — never a database id. */
  code: string;
  /** Where to go after. The list the record was on, not the page that is gone. */
  back: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  role: 'owner' | 'sales' | 'viewer';
  locale?: string | null;
  /** Reasons a permanent removal is refused, from blockers(). */
  blockers?: BlockReason[];
}) {
  const t = adminUi(locale);
  if (role === 'viewer') return null;

  const common = { kind, code, back };

  // ── still live: one button, and it is reversible ──
  if (!deletedAt) {
    return (
      <div className="del">
        <DeleteForm
          {...common}
          action={deleteRecord}
          className="adm-btn-sec del-btn"
          label={t('Delete')}
          ask={t('Delete {code}? It will be hidden from the lists, and you can put it back.', { code })}
        />
        <style>{`
          .del { display: inline-grid; gap: 8px; }
          .del-btn { color: var(--terra-700, #A2422A); }
          .del-btn:hover { border-color: var(--terra-700, #A2422A); }
          @media (pointer: coarse) { .del button { min-height: 44px; } }
        `}</style>
      </div>
    );
  }

  // ── deleted: say so plainly, and offer both ways out ──
  return (
    <div className="del-gone">
      <p className="del-note">
        <strong>
          {t('Deleted {when} by {who}', { when: fmtDate(deletedAt), who: deletedBy ?? '—' })}
        </strong>
        <br />
        {t('This is hidden, not gone. Restore it, or remove it from the database for good.')}
      </p>

      <div className="del-row">
        <DeleteForm
          {...common}
          action={restoreRecord}
          className="adm-btn"
          label={t('Restore')}
          ask={t('Put {code} back? It will appear in the lists again.', { code })}
        />
        {/* Owner only, and refused while anything live still points at it —
            the reasons are listed rather than the button simply failing. */}
        {role === 'owner' && blockers.length === 0 && (
          <DeleteForm
            {...common}
            action={purgeRecord}
            className="adm-btn-sec del-btn"
            label={t('Delete for good')}
            ask={t('Permanently remove {code} from the database? This cannot be undone by anybody, including you.', { code })}
          />
        )}
      </div>

      {role === 'owner' && blockers.length > 0 && (
        <div className="del-why">
          <p className="del-why-h">{t('Why this cannot be removed yet')}</p>
          <ul>{blockers.map((b, i) => <li key={i}>{blockerText(b, t)}</li>)}</ul>
        </div>
      )}
      {role === 'owner' && blockers.length === 0 && (
        <p className="del-warn">
          {t('Permanently removing a record cannot be undone by anybody, including you.')}
        </p>
      )}

      <style>{`
        .del-gone {
          display: grid; gap: 10px; padding: 14px 16px;
          background: var(--sand-100, #F3EFE4); border: 1px solid var(--line, #E2DCCB);
          border-inline-start: 3px solid var(--terra-700, #A2422A);
          border-radius: var(--radius, 8px); margin-bottom: 18px;
        }
        .del-note { margin: 0; font-size: .88rem; line-height: 1.55; }
        .del-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: start; }
        .del-btn { color: var(--terra-700, #A2422A); }
        .del-btn:hover { border-color: var(--terra-700, #A2422A); }
        .del-warn { margin: 0; font-size: .8rem; color: var(--fg-mute, #6B6E60); }
        .del-why { font-size: .84rem; }
        .del-why-h {
          margin: 0 0 .3rem; font-size: .68rem; letter-spacing: .14em;
          text-transform: uppercase; color: var(--fg-mute, #6B6E60);
        }
        .del-why ul { margin: 0; padding-inline-start: 1.1rem; }
        .del-why li { margin-bottom: .25rem; }
        @media (pointer: coarse) { .del-gone button { min-height: 44px; } }
        @media print { .del-gone, .del { display: none !important; } }
      `}</style>
    </div>
  );
}
