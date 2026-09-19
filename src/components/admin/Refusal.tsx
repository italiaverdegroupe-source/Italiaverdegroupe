/**
 * The reason the last thing somebody tried was refused.
 *
 * Rendered from `?error=` — see admin/refuse.ts for why a refusal travels in
 * the URL rather than being thrown. `role="alert"` because it appears after a
 * navigation the person did not expect to produce a message, and a screen
 * reader would otherwise pass over it.
 */
export default function Refusal({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="adm-err" role="alert">{message}</p>;
}
