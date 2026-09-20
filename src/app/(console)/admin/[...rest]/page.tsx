import { notFound } from 'next/navigation';

/**
 * Every /admin URL that matches no real console route, caught here so the
 * console answers it instead of the shop front.
 *
 * WHAT WENT WRONG. /admin/invoices, /admin/customers, /admin/deliveries —
 * sections a reviewer or a new operator guesses at because they sound like
 * things this business has — matched no route at all. A path that matches
 * nothing never reaches a layout: `experimental.globalNotFound` is on, and
 * Next's own reference is explicit that global-not-found is "used when a
 * requested URL doesn't match any route at all" and that it "skips rendering"
 * the layouts (03-api-reference/03-file-conventions/not-found.md). So the
 * request fell straight through both root layouts to
 * src/app/global-not-found.tsx, which is the PUBLIC site's 404: marketing
 * header, Catalogue and Collections in the navigation, "Request a quote", the
 * footer, and not one link back to /admin. A signed-in operator was put out
 * on the shop front with no way back except the Back button.
 *
 * The console's own 404, src/app/(console)/admin/not-found.tsx, could not help
 * with this. A not-found.tsx only fires for a notFound() thrown INSIDE a
 * segment that matched, which is why a mistyped record code
 * (/admin/orders/ZZZ-NOPE) has always been handled correctly and a mistyped
 * SECTION name never was.
 *
 * WHY THIS AND NOT A HEADER IN THE PROXY. The other way to fix it is to have
 * src/proxy.ts put the path on a header and have global-not-found.tsx branch
 * on it — but /admin is exempt from the proxy on purpose (see isExempt there:
 * the console is never redirected and never rewritten, because moving a
 * signed-in operator between hostnames drops the session cookie), so that
 * route means un-exempting the console to fix its 404. A catch-all segment
 * costs nothing, keeps the console's own not-found.tsx as the single place the
 * console's 404 is written, and leaves the proxy alone.
 *
 * It does not shadow anything. A static segment always wins over a dynamic
 * one, and a dynamic one over a catch-all, so every real console route still
 * matches itself; `[...rest]` requires at least one segment, so /admin itself
 * is still the overview page. What is left over is exactly the set of URLs
 * that used to fall out of the console.
 *
 * notFound() is called synchronously, before any await. That is what keeps the
 * HTTP status at 404: the response body starts streaming at the first Suspense
 * fallback or suspending await, and "the status code of the response cannot be
 * updated" once it has (03-api-reference/03-file-conventions/loading.md). A
 * 404 that answers 200 is a soft 404, and although the console is noindex
 * either way, an uptime check or a log filter that counts 404s should keep
 * seeing them.
 */
export default function AdminCatchAll(): never {
  notFound();
}
