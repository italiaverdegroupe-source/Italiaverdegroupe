/**
 * A fixed-window limiter that does not pretend to know more than it does.
 *
 * The thing a limiter needs, and the thing an HTTP request does not reliably
 * give you, is a stable identity for the caller. Through our own edge there is
 * one: an address the edge vouched for. Reached directly on the origin's
 * *.up.railway.app hostname, there is not — the caller picks their own
 * headers, so every request can arrive as a new person with a fresh
 * allowance. A limiter keyed on that is decoration.
 *
 * So callers are split in two.
 *
 * VERIFIED callers get an allowance each, as you would expect, and nothing
 * anybody else does can take it away from them.
 *
 * UNVERIFIED callers get an allowance each too, and then a ceiling across all
 * of them together.
 *
 * An earlier attempt here capped how many DISTINCT unverified callers could
 * hold an allowance, pushing the rest into one shared bucket. That bounded the
 * attacker — and denied real people. Measured: a flood occupying the fifty
 * slots and burning the overflow made the next genuine visitor a 429. Which is
 * the fundamental problem, stated plainly: WITHOUT VERIFICATION THERE IS NO
 * WAY TO TELL a hundred real visitors from one machine with a hundred invented
 * addresses. Any rule that stops the second stops the first.
 *
 * So the choice is made deliberately, in the direction lib/db.ts names: losing
 * an enquiry is the worst thing this codebase can do. The per-caller limit
 * stops naive repetition, and one ceiling bounds the total damage a forger can
 * do in a window. Below that ceiling nobody is refused for somebody else's
 * behaviour. A forger can spend the ceiling — that is the cost of not having
 * verification — but sixty enquiries in ten minutes is already several years
 * of this company's real volume, so the bound is far above the business and
 * far below "unlimited", which is where it started.
 *
 * Configure EDGE_SECRET and the matching Cloudflare rule and this path stops
 * mattering: verified visitors are never touched by the ceiling at all.
 *
 * State is per instance and in memory. One replica runs this today; with two,
 * each keeps its own counts and the effective limits double. Stated rather
 * than discovered later.
 */

export type LimiterOptions = {
  /** Length of the window, in milliseconds. */
  windowMs: number;
  /** Requests allowed per caller per window. */
  perCaller: number;
  /** Accepted requests allowed per window across all UNVERIFIED callers. */
  globalUnverified: number;
  /**
   * Optional: how many distinct unverified callers may hold an allowance of
   * their own before the rest share one. Left unset by default — see above,
   * it denies real visitors to bound an attacker. Kept because a surface with
   * no enquiries to lose may want the opposite trade.
   */
  unverifiedCallers?: number;
  /** Hard cap on tracked callers, so the map cannot grow without bound. */
  maxTracked?: number;
  /** Called when the ceiling refuses a request. */
  onGlobalLimit?: (count: number) => void;
};

export type Caller = { id: string | null; verified: boolean };

/**
 * Reserved keys start with "!", which the caller-derived prefixes "v:" and
 * "u:" can never produce. The first version built keys as `~${id}`, which put
 * them in the same namespace as the reserved ones: sending the address
 * "shared" landed you on the shared bucket and let you burn it for everybody,
 * and a verified id of "~1.2.3.4" collided exactly with unverified 1.2.3.4,
 * so a forger could spend one named person's allowance.
 */
const SHARED_UNVERIFIED = '!shared';
const UNIDENTIFIED = '!none';

export class Limiter {
  private hits = new Map<string, { n: number; t: number }>();
  private globalN = 0;
  private globalT = 0;

  constructor(private readonly o: LimiterOptions) {}

  /** True when this request should be refused. */
  limited(caller: Caller, now: number = Date.now()): boolean {
    if (now - this.globalT > this.o.windowMs) { this.globalT = now; this.globalN = 0; }

    const key = this.keyFor(caller, now);
    const cur = this.hits.get(key);
    if (cur && now - cur.t <= this.o.windowMs) {
      if (cur.n + 1 > this.o.perCaller) return true;      // refused: costs nothing
      if (!caller.verified && this.globalN + 1 > this.o.globalUnverified) {
        this.o.onGlobalLimit?.(this.globalN + 1);
        return true;
      }
      cur.n += 1;
      if (!caller.verified) this.globalN += 1;
      return false;
    }

    if (!caller.verified && this.globalN + 1 > this.o.globalUnverified) {
      this.o.onGlobalLimit?.(this.globalN + 1);
      return true;
    }
    this.makeRoom(now);
    this.hits.set(key, { n: 1, t: now });
    if (!caller.verified) this.globalN += 1;
    return false;
  }

  private keyFor(caller: Caller, now: number): string {
    if (!caller.id) return UNIDENTIFIED;
    if (caller.verified) return `v:${caller.id}`;

    const mine = `u:${caller.id}`;
    // Already being counted: keep counting them, never promote to the shared
    // bucket mid-window — that would hand them a fresh allowance.
    if (this.hits.has(mine)) return mine;

    const cap = this.o.unverifiedCallers;
    if (cap === undefined) return mine;

    this.prune(now);
    let distinct = 0;
    for (const k of this.hits.keys()) {
      if (k.startsWith('u:')) distinct += 1;
      if (distinct >= cap) return SHARED_UNVERIFIED;
    }
    return mine;
  }

  private prune(now: number): void {
    for (const [k, v] of this.hits) if (now - v.t > this.o.windowMs) this.hits.delete(k);
  }

  private makeRoom(now: number): void {
    const max = this.o.maxTracked ?? 5000;
    if (this.hits.size < max) return;
    this.prune(now);
    // Still full: drop the single oldest entry. The version this replaced
    // called clear() here, which was a reset switch anybody could pull — five
    // thousand invented keys and every counter on the instance, including the
    // attacker's own, went back to zero.
    while (this.hits.size >= max) {
      let oldestKey: string | null = null;
      let oldestAt = Infinity;
      for (const [k, v] of this.hits) if (v.t < oldestAt) { oldestAt = v.t; oldestKey = k; }
      if (oldestKey === null) return;
      this.hits.delete(oldestKey);
    }
  }

  /** Test seam. */
  get tracked(): number { return this.hits.size; }
}
