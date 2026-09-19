'use client';

/**
 * A submit button that asks first.
 *
 * The only reason this is a client component is `confirm()`, which needs an
 * event handler and therefore cannot live in the server component that renders
 * the rest of the delete control. It is deliberately the browser's own dialog:
 * a custom modal here would be a second render path and a state machine on a
 * control whose entire job is to make somebody pause for a second, and it
 * would be the thing that breaks before hydration — which is exactly when a
 * destructive button must not be one click.
 *
 * With JavaScript off there is no dialog and the form still submits. That is
 * the right failure: a soft delete is reversible, and the permanent one is
 * owner-only, refused while anything points at the record, and already
 * requires the row to have been deleted once.
 */
export default function ConfirmButton({
  ask, className, formAction, children,
}: {
  ask: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      onClick={(e) => { if (!window.confirm(ask)) e.preventDefault(); }}
    >
      {children}
    </button>
  );
}
