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
 * `CF-Connecting-IP` is better: Cloudflare sets it on every request it proxies
 * and overwrites any copy the client sent. But — and this is the part the
 * first version of this file got wrong — that only helps if the request
 * actually WENT THROUGH Cloudflare. The Railway origin still answers on its
 * own *.up.railway.app hostname, so anyone can send CF-Connecting-IP straight
 * there. Trusting the header on sight made forging it strictly easier than
 * forging x-forwarded-for, and worse, wrote the forged value into audit_log
 * WITHOUT the "~" marker: the log would have claimed more confidence than the
 * old code did, which is the opposite of the point.
 *
 * So the header is trusted only when the request also carries proof it came
 * through our own edge: a secret header Cloudflare adds and the public
 * internet cannot. Until that is configured, EVERY address is treated as
 * unverified — which is the safe direction to be wrong in, and exactly how
 * this behaved before CF-Connecting-IP was read at all.
 *
 * To switch it on (both halves, or neither):
 *   1. Railway: set EDGE_SECRET to a long random string.
 *   2. Cloudflare → Rules → Transform Rules → Modify Request Header:
 *      set static `x-edge-secret` to the same string, for this zone.
 * Cloudflare overwrites the header on every proxied request, so a copy sent by
 * a visitor is replaced rather than passed through.
 */

/** IPv6 at its longest is 45 characters. Anything longer is not an address. */
const MAX_LEN = 45;

export type ClientIp = {
  /** Best available address, or null if nothing identified one. */
  ip: string | null;
  /** True when the value came from a header the client could not have written. */
  trusted: boolean;
};

function fromEdge(h: Headers): boolean {
  const expected = process.env.EDGE_SECRET;
  if (!expected) return false;
  const got = h.get('x-edge-secret');
  if (!got || got.length !== expected.length) return false;
  // Not timing-safe, and does not need to be: a wrong guess costs the caller
  // nothing worse than being treated as unverified, which is the default.
  return got === expected;
}

export function clientIpOf(h: Headers): ClientIp {
  const cut = (v: string | undefined | null) => {
    const s = v?.trim();
    return s ? s.slice(0, MAX_LEN) : null;
  };

  if (fromEdge(h)) {
    const cf = cut(h.get('cf-connecting-ip'));
    if (cf) return { ip: cf, trusted: true };
  }

  // Either no proof of the edge, or it vouched for nothing. Whatever we read
  // now is a hint, not evidence.
  const cf = cut(h.get('cf-connecting-ip'));
  if (cf) return { ip: cf, trusted: false };

  const xff = cut(h.get('x-forwarded-for')?.split(',')[0]);
  if (xff) return { ip: xff, trusted: false };

  const real = cut(h.get('x-real-ip'));
  if (real) return { ip: real, trusted: false };

  return { ip: null, trusted: false };
}

/**
 * The address to record.
 *
 * An unverified value is prefixed rather than dropped: it is still the best
 * lead available when something goes wrong, but a row in audit_log reading
 * `~203.0.113.7` says plainly that nobody verified it, which a bare address
 * does not. Reading that column later, the difference is the whole point.
 *
 * Length is capped here too. login_attempts.ip is indexed, and a btree entry
 * has a maximum size — an unbounded caller-supplied string was enough to make
 * the INSERT throw, which would have meant a sign-in attempt leaving no trace
 * in the one log an operator reads during an attack.
 */
export function clientIpForRecord(h: Headers): string | null {
  const { ip, trusted } = clientIpOf(h);
  if (!ip) return null;
  return trusted ? ip : `~${ip}`;
}
