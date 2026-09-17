/**
 * A fixed-window limiter that does not pretend to know more than it does.
 *
 * The thing a limiter needs, and the thing an HTTP request does not reliably
 * give you, is a stable identity for the caller. Behind Cloudflare there is
 * one: CF-Connecting-IP, which the edge overwrites. Reached directly on its
 * *.up.railway.app hostname, there is not — the caller picks their own
 * x-forwarded-for, so every request can arrive as a new person with a fresh
 * allowance. A limiter keyed on that is decoration.
 *
 * So callers are split in two.
 *
 * VERIFIED callers (the edge vouched for the address) get an allowance each,
 * as you would expect.
 *
 * UNVERIFIED callers get an allowance each as well — but only while the number
 * of distinct unverified callers stays small. Past that, they all share one.
 * The reasoning: this business sees a handful of enquiries a week, so dozens
 * of distinct unverified addresses in ten minutes is not a busy afternoon, it
 * is one machine inventing addresses. Collapsing them into a single bucket
 * takes the attack from unlimited to one allowance, while a real visitor
 * arriving on a day when the edge is bypassed still gets their own.
 *
 * Losing an enquiry is the worst thing this codebase can do — see lib/db.ts —
 * so every threshold here is set far above real traffic rather than close to
 * it, and the global ceiling logs loudly when it bites.
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
  /** Requests allowed across all callers per window, whoever they are. */
  global: number;
  /** How many distinct unverified callers get an allowance of their own. */
  unverifiedCallers?: number;
  /** Hard cap on tracked callers, so the map cannot grow without bound. */
  maxTracked?: number;
  /** Called when the global ceiling refuses a request. */
  onGlobalLimit?: (count: number) => void;
};

export type Caller = { id: string | null; verified: boolean };

const SHARED_UNVERIFIED = '~shared';
const UNIDENTIFIED = '~none';

export class Limiter {
  private hits = new Map<string, { n: number; t: number }>();
  private globalN = 0;
  private globalT = 0;

  constructor(private readonly o: LimiterOptions) {}

  /** True when this request should be refused. */
  limited(caller: Caller, now: number = Date.now()): boolean {
    if (now - this.globalT > this.o.windowMs) { this.globalT = now; this.globalN = 0; }
    this.globalN += 1;
    if (this.globalN > this.o.global) {
      this.o.onGlobalLimit?.(this.globalN);
      return true;
    }

    const key = this.keyFor(caller, now);
    const cur = this.hits.get(key);
    if (cur && now - cur.t <= this.o.windowMs) {
      cur.n += 1;
      return cur.n > this.o.perCaller;
    }
    this.makeRoom(now);
    this.hits.set(key, { n: 1, t: now });
    return false;
  }

  private keyFor(caller: Caller, now: number): string {
    if (!caller.id) return UNIDENTIFIED;
    if (caller.verified) return caller.id;

    const mine = `~${caller.id}`;
    // Already being counted: keep counting them, never promote to the shared
    // bucket mid-window — that would hand them a fresh allowance.
    if (this.hits.has(mine)) return mine;

    this.prune(now);
    const cap = this.o.unverifiedCallers ?? 50;
    let distinct = 0;
    for (const k of this.hits.keys()) {
      if (k.startsWith('~') && k !== SHARED_UNVERIFIED && k !== UNIDENTIFIED) distinct += 1;
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
