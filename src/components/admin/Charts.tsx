/**
 * Charts, drawn as SVG on the server.
 *
 * No charting library. The three or four shapes this console needs are a few
 * lines of geometry each, and a dependency would cost more than it saves: a
 * runtime bundle shipped to a browser that is only ever going to draw a
 * twenty-point series, a theme to override, and something else to keep
 * patched. These render on the server, arrive as markup, and inherit the
 * console's own colours.
 *
 * Every one of them states what it does when it has nothing to draw, rather
 * than rendering an empty frame that looks like a broken chart. An operations
 * console is read by somebody deciding whether to act; "no data yet" and
 * "something failed" must never look the same.
 */

const INK = '#14150F';
const LINE = '#E4DFD2';
const MUTED = '#61645A';

/* The series colours, in order. Olive first because it is the brand, then a
   brass and a terracotta that stay distinguishable in greyscale — which is how
   half of these end up being printed. */
export const SERIES = ['#3F5C2D', '#A68849', '#9B5A3C', '#6E7F5B', '#C2A76A', '#7A6A55'];

function Empty({ label }: { label: string }) {
  return <p className="adm-chart-empty">{label}</p>;
}

/* ── a value over time ─────────────────────────────────────────
   An area rather than a line: with counts this small the fill is what makes a
   flat week legible as a flat week instead of a thin horizontal scratch. */
export function TimeArea({
  points, height = 132, label, suffix = '',
}: {
  points: { t: string; v: number }[];
  height?: number;
  label: string;
  suffix?: string;
}) {
  if (points.length < 2) return <Empty label={`${label} — not enough days recorded yet.`} />;

  const W = 640;
  const H = height;
  const pad = { t: 10, r: 4, b: 20, l: 4 };
  const max = Math.max(1, ...points.map((p) => p.v));
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (innerW * i) / (points.length - 1);
  const y = (v: number) => pad.t + innerH - (innerH * v) / max;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(pad.t + innerH).toFixed(1)} L${x(0).toFixed(1)},${(pad.t + innerH).toFixed(1)} Z`;
  const total = points.reduce((s, p) => s + p.v, 0);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img"
           aria-label={`${label}: ${total}${suffix} between ${first.t} and ${last.t}, peaking at ${max}`}>
        <defs>
          <linearGradient id="tareaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[0]} stopOpacity=".26" />
            <stop offset="100%" stopColor={SERIES[0]} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* One rule at the peak, labelled, so the shape has a scale without a
            full grid competing with it. */}
        <line x1={pad.l} y1={y(max)} x2={W - pad.r} y2={y(max)} stroke={LINE} strokeDasharray="2 4" />
        <text x={pad.l} y={y(max) - 4} fontSize="9.5" fill={MUTED} letterSpacing=".06em">{max}</text>
        <path d={area} fill="url(#tareaFill)" />
        <path d={line} fill="none" stroke={SERIES[0]} strokeWidth="1.8"
              strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          p.v > 0 ? <circle key={p.t} cx={x(i)} cy={y(p.v)} r="2.1" fill={SERIES[0]} /> : null
        ))}
        <text x={pad.l} y={H - 5} fontSize="9.5" fill={MUTED}>{first.t}</text>
        <text x={W - pad.r} y={H - 5} fontSize="9.5" fill={MUTED} textAnchor="end">{last.t}</text>
      </svg>
    </figure>
  );
}

/* ── a ranked comparison ───────────────────────────────────────
   Horizontal, because the labels are words — "Ras Al Khaimah" under a vertical
   column has to be turned on its side or truncated, and both are worse than
   simply putting the bar next to it. */
export function BarList({
  rows, label, max: givenMax, unit = '',
}: {
  rows: { k: string; v: number }[];
  label: string;
  max?: number;
  unit?: string;
}) {
  if (rows.length === 0) return <Empty label={`${label} — nothing recorded yet.`} />;
  const max = Math.max(1, givenMax ?? Math.max(...rows.map((r) => r.v)));

  return (
    <ul className="adm-bars" aria-label={label}>
      {rows.map((r, i) => (
        <li key={r.k}>
          <span className="adm-bar-k" title={r.k}>{r.k}</span>
          <span className="adm-bar-track">
            <span className="adm-bar-fill"
                  style={{ width: `${Math.max(1.5, (r.v / max) * 100)}%`,
                           background: SERIES[i % SERIES.length] }} />
          </span>
          <span className="adm-bar-v">{r.v}{unit}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── a pipeline ────────────────────────────────────────────────
   Not a funnel drawn as a tapering shape: those encode the number twice, once
   as width and once as area, and the eye reads the area. Equal-height bars on
   a shared scale say the same thing without the distortion. */
export function Funnel({ stages }: { stages: { k: string; v: number; href?: string }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.v));
  return (
    <ol className="adm-funnel">
      {stages.map((s, i) => {
        const prev = i > 0 ? stages[i - 1].v : null;
        const pct = prev && prev > 0 ? Math.round((s.v / prev) * 100) : null;
        return (
          <li key={s.k}>
            <span className="adm-funnel-top">
              <b>{s.v}</b>
              {pct !== null && <i title={`${pct}% of the previous stage`}>{pct}%</i>}
            </span>
            <span className="adm-funnel-track">
              <span className="adm-funnel-fill"
                    style={{ height: `${Math.max(3, (s.v / max) * 100)}%`,
                             background: SERIES[0], opacity: 1 - i * 0.12 }} />
            </span>
            <span className="adm-funnel-k">{s.k}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ── a share of a whole ────────────────────────────────────────
   A ring, and only when there are few enough slices to tell apart. Beyond
   about six a ring is a colour-matching exercise, so the caller gets a bar
   list instead — see the overview. */
export function Donut({
  rows, label, size = 132,
}: {
  rows: { k: string; v: number }[];
  label: string;
  size?: number;
}) {
  const total = rows.reduce((s, r) => s + r.v, 0);
  if (total === 0) return <Empty label={`${label} — nothing recorded yet.`} />;

  const r = size / 2 - 11;
  const c = 2 * Math.PI * r;

  // Each arc starts where the previous one ended. Worked out up front rather
  // than by adding to a variable inside the map: a render that mutates as it
  // goes gives a different answer the second time React calls it.
  const arcs: { k: string; frac: number; start: number }[] = [];
  let start = 0;
  for (const row of rows) {
    const frac = row.v / total;
    arcs.push({ k: row.k, frac, start });
    start += frac;
  }

  return (
    <div className="adm-donut">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img"
           aria-label={`${label}: ${rows.map((x) => `${x.k} ${x.v}`).join(', ')}`}>
        <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
          <circle r={r} fill="none" stroke={LINE} strokeWidth="11" />
          {arcs.map((a, i) => (
            <circle key={a.k} r={r} fill="none" strokeWidth="11"
                    stroke={SERIES[i % SERIES.length]}
                    strokeDasharray={`${(c * a.frac).toFixed(2)} ${(c * (1 - a.frac)).toFixed(2)}`}
                    strokeDashoffset={(-c * a.start).toFixed(2)} />
          ))}
        </g>
        <text x={size / 2} y={size / 2 - 1} textAnchor="middle" fontSize="19"
              fontWeight="500" fill={INK}>{total}</text>
        <text x={size / 2} y={size / 2 + 13} textAnchor="middle" fontSize="8.5"
              fill={MUTED} letterSpacing=".14em">TOTAL</text>
      </svg>
      <ul className="adm-legend">
        {rows.map((row, i) => (
          <li key={row.k}>
            <i style={{ background: SERIES[i % SERIES.length] }} aria-hidden="true" />
            <span>{row.k}</span>
            <b>{row.v}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
