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
  // Trimmed, because the text comes out of the URL and a URL can be sent to
  // somebody. React escapes it, so there is no markup to inject — but a link
  // that puts a paragraph of invented instructions above the form is a
  // plausible way to talk an operator into something. The longest real
  // refusal in this console is under 200 characters.
  const shown = message.slice(0, 240);
  return <p className="adm-err" role="alert">{shown}</p>;
}
