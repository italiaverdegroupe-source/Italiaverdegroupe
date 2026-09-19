'use client';

import { useActionState } from 'react';

/**
 * One delete, restore or permanent-removal button, with whatever the server
 * said back.
 *
 * WHY THIS IS A CLIENT COMPONENT, twice over. `confirm()` needs an event
 * handler, which a server component cannot have. And `useActionState` is the
 * only way a refusal reaches the screen at all: a server action that THROWS
 * has its message replaced by a digest in a production build, so the careful
 * sentence about why a paid invoice cannot be deleted would arrive as
 * nothing. Returned, it renders here.
 *
 * WHY EACH BUTTON IS ITS OWN FORM. `useActionState` binds one action to one
 * form. Restore and "delete for good" are different actions with different
 * answers, so they are two forms sitting side by side — which is valid HTML,
 * where nesting them would not be.
 *
 * With JavaScript off there is no dialog and the form still posts, which is
 * the right failure: the reversible delete is reversible, and the permanent
 * one is owner-only, refused while anything points at the record, and already
 * requires the row to have been deleted once.
 */
export default function DeleteForm({
  action, kind, code, back, label, ask, className,
}: {
  action: (prev: string | null, formData: FormData) => Promise<string | null>;
  kind: string;
  code: string;
  back: string;
  label: string;
  /** The question the browser asks before the form is allowed to post. */
  ask: string;
  className?: string;
}) {
  const [refusal, submit, pending] = useActionState(action, null);

  return (
    <form action={submit} className="delf">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        className={className}
        disabled={pending}
        onClick={(e) => { if (!window.confirm(ask)) e.preventDefault(); }}
      >
        {label}
      </button>
      {/* aria-live, because the refusal appears without the page changing and
          a screen reader would otherwise never mention it. */}
      <p className="delf-why" role="status" aria-live="polite">{refusal ?? ''}</p>

      <style>{`
        .delf { display: grid; gap: 0; align-content: start; }
        .delf-why:empty { display: none; }
        .delf-why {
          margin: 8px 0 0; padding: 10px 12px; font-size: .84rem; line-height: 1.5;
          background: var(--sand-100, #F3EFE4);
          border-inline-start: 3px solid var(--terra-700, #A2422A);
          border-radius: var(--radius, 8px);
          color: var(--ink-900, #14210F);
        }
      `}</style>
    </form>
  );
}
