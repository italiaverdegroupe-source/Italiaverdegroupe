/**
 * Who is this request actually from?
 *
 * The answer matters in two places where being wrong is not cosmetic: the
 * audit log, which exists to answer "who changed this price" a year from now,
 * and the rate limiters, which are worth nothing if a visitor can pick their
 * own key.
 *
 * The chain in front of this app is: browser → Cloudflare → Railway → here.
 *
 * `x-forwarded-for` is a LIST, and each proxy APPENDS the address it received
 * the connection from. So its left-most entry is not the client — it is
 * whatever the client typed into the header before sending, and every browser
 * and every curl can type anything there. Reading `split(',')[0]` therefore
 * reads an attacker-chosen string and files it in the audit log as evidence.
 *
 * `CF-Connecting-IP` is different: Cloudflare sets it on every request it
 * proxies and OVERWRITES any copy the client sent. Behind Cloudflare it is the
 * only header here a visitor cannot choose for themselves.
 *
 * One honest limit, stated rather than papered over: the Railway origin is
 * still reachable on its own *.up.railway.app hostname, and a request that
 * goes straight there never passes Cloudflare, so it can forge
 * CF-Connecting-IP too. `trusted` says which case we are in, so callers that
 * enforce something can treat the two differently instead of pretending the
 * distinction does not exist.
 */

export type ClientIp = {
  /** Best available address, or null if nothing identified one. */
  ip: string | null;
  /** True when the value came from a header the client could not have written. */
  trusted: boolean;
};

export function clientIpOf(h: Headers): ClientIp {
  const cf = h.get('cf-connecting-ip')?.trim();
  if (cf) return { ip: cf, trusted: true };

  // Not proxied by Cloudflare. Whatever we read now is a hint, not evidence.
  const xff = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (xff) return { ip: xff, trusted: false };

  const real = h.get('x-real-ip')?.trim();
  if (real) return { ip: real, trusted: false };

  return { ip: null, trusted: false };
}

/**
 * The address to record.
 *
 * An untrusted value is prefixed rather than dropped: it is still the best
 * lead available when something goes wrong, but a row in audit_log reading
 * `~203.0.113.7` says plainly that nobody verified it, which a bare address
 * does not. Reading that column later, the difference is the whole point.
 */
export function clientIpForRecord(h: Headers): string | null {
  const { ip, trusted } = clientIpOf(h);
  if (!ip) return null;
  return trusted ? ip : `~${ip}`;
}
