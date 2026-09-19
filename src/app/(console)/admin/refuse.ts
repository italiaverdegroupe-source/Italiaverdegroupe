import { redirect } from 'next/navigation';

/**
 * Tell somebody why the console would not do what they asked.
 *
 * THROWING DOES NOT WORK, and it is worth being precise about why, because it
 * looks like it does. `throw new Error(t('A quotation needs a customer.'))`
 * inside a server action shows that sentence in development and shows a digest
 * in production: Next replaces the message before it leaves the server so that
 * a stack trace, a failing query or a connection string can never reach a
 * browser. That is right for a crash. It is wrong for a rule, because a rule
 * nobody can read may as well not exist — the operator presses the button,
 * lands on an error page with a number on it, and has no idea what to change.
 *
 * Fifty-six refusals across this console were written that way, in three
 * languages, and not one of them had ever been read by anybody.
 *
 * So a refusal is not an error. It redirects back to the screen it came from
 * carrying the reason, the page renders it above the form, and it survives a
 * reload, works with JavaScript off and can be linked to. The message is
 * already translated by the caller — the language belongs to the session, not
 * to this function.
 */
export function refuse(back: string, message: string): never {
  redirect(`${back}${back.includes('?') ? '&' : '?'}error=${encodeURIComponent(message)}`);
}
