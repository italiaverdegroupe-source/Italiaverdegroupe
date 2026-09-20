import map from '@/data/map.json';
import type { Locale } from '@/lib/i18n';
import { ui } from '@/lib/ui';

/**
 * How a tree actually gets from an Italian nursery to an Emirati garden.
 *
 * Three routes, drawn on real geography and animated along it: a ship the long
 * way round through Suez and in through the Strait of Hormuz, two aircraft over
 * Anatolia and down the Gulf, and a lorry that crosses to Tunis and runs the
 * North African coast. Coastlines are Natural Earth (via world-atlas),
 * projected to Mercator at build time and baked into `map.json` — 23 KB of path
 * data, no map library, no tiles, no API key, nothing fetched at runtime.
 *
 * It is dark where the rest of the page is light, on purpose: this is the one
 * panel that is meant to read as an instrument rather than a page, and a
 * glowing line says "in transit" in a way a line on paper does not. Every bit
 * of motion is CSS or SMIL with no JavaScript, and all of it stops for anyone
 * whose system asks for reduced motion — the routes stay drawn, the vehicles go.
 */
/* JSON imports widen `[x, y]` to `number[]`, which loses the pair. The routes
   below index these by name, so the tuple is what has to come back out. */
const P = map.points as unknown as Record<string, [number, number]>;

/**
 * Waypoints to a curve.
 *
 * Catmull-Rom converted to cubic Béziers. A polyline through these points
 * would kink at every one of them, and a shipping lane that turns a corner in
 * open water is the detail that tells somebody who moves freight for a living
 * that nobody checked. The curve passes through each point exactly.
 */
function smooth(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  const d: string[] = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    // 6 is the standard Catmull-Rom tension; lower would round the corners off
    // the Red Sea and push the line onto Saudi Arabia.
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d.push(`C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`);
  }
  return d.join(' ');
}

const at = (...keys: string[]) => keys.map((k) => P[k]);

/** Livorno, the Med, Suez, the Red Sea, Bab el-Mandeb, and in through Hormuz. */
const SEA = smooth(at(
  'seaLivorno', 'seaTyrrh', 'seaIonian', 'seaMedE', 'seaPortSaid', 'seaSuez',
  'seaRedN', 'seaRedS', 'seaBab', 'seaAden', 'seaArabian', 'seaOman',
  'hormuz', 'dubai',
));

/** Rome, up over the Aegean and Anatolia, down the Gulf. */
const AIR = smooth(at('airRome', 'airAegean', 'airAnat', 'airGulf', 'dubai'));

/** Palermo to Tunis, then the whole North African coast and across Arabia. */
const LAND = smooth(at(
  'landPalermo', 'tunis', 'landTripoli', 'landBenghazi', 'landTobruk',
  'landAlex', 'landCairo', 'landSinai', 'landAqaba', 'landTabuk',
  'landRiyadh', 'dubai',
));

const ORIGINS = [
  { key: 'lombardia', label: 'Lombardia' },
  { key: 'toscana', label: 'Toscana' },
  { key: 'puglia', label: 'Puglia' },
  { key: 'sicilia', label: 'Sicilia' },
] as const;

export default function RouteMap({ locale }: { locale: Locale }) {
  const t = ui(locale);
  return (
    <figure className="map">
      <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img"
           aria-label={t('map.alt')}>
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7FD4D0" />
            <stop offset="55%" stopColor="#9FD6B4" />
            <stop offset="100%" stopColor="#E7C271" />
          </linearGradient>
          <linearGradient id="airGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F2E2B4" />
            <stop offset="100%" stopColor="#E7C271" />
          </linearGradient>
          <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E29A5C" />
            <stop offset="100%" stopColor="#E7C271" />
          </linearGradient>

          {/* The water. Lit from the north-west, like the light in the photographs. */}
          <radialGradient id="seaFill" cx="28%" cy="12%" r="115%">
            <stop offset="0%" stopColor="#16323A" />
            <stop offset="55%" stopColor="#0E2028" />
            <stop offset="100%" stopColor="#081319" />
          </radialGradient>
          <linearGradient id="landFill" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#3A4433" />
            <stop offset="100%" stopColor="#272E24" />
          </linearGradient>

          {/* One blur, reused. Three separate filters cost three passes. */}
          <filter id="glow" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowSoft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>

          <radialGradient id="pinGlow">
            <stop offset="0%" stopColor="#E7C271" stopOpacity=".55" />
            <stop offset="100%" stopColor="#E7C271" stopOpacity="0" />
          </radialGradient>

          {/* The vehicles, defined once and placed by <use>. */}
          <g id="ship">
            <path d="M-14 4h28l-3.4 6H-10.6Z" />
            <path d="M-9 4V-1h7v5" />
            <rect x="-8" y="-4.6" width="3.4" height="3.4" />
            <rect x="-4" y="-4.6" width="3.4" height="3.4" />
            <rect x="0" y="-4.6" width="3.4" height="3.4" />
            <path d="M3.4 4V-2.6h4.2V4" />
          </g>
          <g id="plane">
            <path d="M13 0 3 3.4h-7.4l-4 8.6h-2.6l2-8.6h-4l-2.6 3.4h-2l1.4-6.8-1.4-6.8h2L-2 -3.4h4l-2-8.6h2.6l4 8.6H3.4Z" />
          </g>
          <g id="truck">
            <path d="M-13-5h13v8h-13Z" />
            <path d="M0-1.4h6.6L10.6 2v1H0Z" />
            <circle cx="-8.4" cy="4.6" r="2.4" />
            <circle cx="6.6" cy="4.6" r="2.4" />
          </g>
        </defs>

        <rect className="sea" width={map.width} height={map.height} fill="url(#seaFill)" />

        {/* Graticule. Almost invisible, and the reason the water reads as a
            chart rather than a dark rectangle. */}
        <g className="grid">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={`h${i}`} x1="0" x2={map.width} y1={i * 100 + 40} y2={i * 100 + 40} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <line key={`v${i}`} y1="0" y2={map.height} x1={i * 100 + 50} x2={i * 100 + 50} />
          ))}
        </g>

        <path className="land" d={map.land} fill="url(#landFill)" />
        <path className="italy" d={map.italy} />
        <path className="uae" d={map.uae} />

        {/* Each route is three paths: the lane it always follows, the bright
            draw that reveals it once, and a short pulse that keeps running. */}
        {[
          { k: 'sea', d: SEA, grad: 'seaGrad', delay: 0.2, flow: 9 },
          { k: 'air', d: AIR, grad: 'airGrad', delay: 0.7, flow: 5.5 },
          { k: 'land', d: LAND, grad: 'landGrad', delay: 1.2, flow: 12 },
        ].map((r) => (
          <g key={r.k} className={`rt rt-${r.k}`}>
            <path className="lane" d={r.d} />
            <path className="draw" d={r.d} stroke={`url(#${r.grad})`} filter="url(#glow)"
                  style={{ animationDelay: `${r.delay}s` }} />
            <path className="pulse" d={r.d} stroke={`url(#${r.grad})`}
                  style={{ animationDuration: `${r.flow}s`, animationDelay: `${r.delay + 1.4}s` }} />
          </g>
        ))}

        {/* A ship, two aircraft and a lorry, each on its own route. The sea
            leg is slowest and the air leg quickest because that is the whole
            point of offering three of them. */}
        <g className="veh veh-ship" filter="url(#glow)">
          <animateMotion dur="26s" repeatCount="indefinite" path={SEA} />
          <use href="#ship" transform="scale(1.35)" />
        </g>
        {[0, 5.5].map((begin) => (
          <g key={begin} className="veh veh-air" filter="url(#glow)">
            <animateMotion dur="11s" begin={`${begin}s`} repeatCount="indefinite"
                           rotate="auto" path={AIR} />
            <use href="#plane" transform="scale(1.2)" />
          </g>
        ))}
        <g className="veh veh-truck" filter="url(#glow)">
          <animateMotion dur="30s" repeatCount="indefinite" path={LAND} />
          <use href="#truck" transform="scale(1.3)" />
        </g>

        {ORIGINS.map((o, i) => (
          <g key={o.key} className="origin" style={{ animationDelay: `${0.3 + i * 0.16}s` }}
             transform={`translate(${P[o.key][0]} ${P[o.key][1]})`}>
            <circle className="ring" r="7" />
            <circle className="dot" r="3.4" />
            <text className="lbl" x="11" y="4">{o.label}</text>
          </g>
        ))}

        {/* The three places the routes are defined by. Naming them is what
            turns a decorative line into a claim somebody can check. */}
        {[
          { k: 'tunis', label: t('map.tunis'), dx: -12, dy: 20, anchor: 'end' as const, major: false },
          { k: 'seaSuez', label: t('map.suez'), dx: 15, dy: 16, anchor: 'start' as const, major: false },
          { k: 'hormuz', label: t('map.hormuz'), dx: 13, dy: -8, anchor: 'start' as const, major: true },
        ].map((w, i) => (
          <g key={w.k} className={`way ${w.major ? 'way-major' : 'way-minor'}`}
             style={{ animationDelay: `${2.4 + i * 0.2}s` }}
             transform={`translate(${P[w.k][0]} ${P[w.k][1]})`}>
            <circle className="way-dot" r="3" />
            <text className="way-lbl" x={w.dx} y={w.dy} textAnchor={w.anchor}>{w.label}</text>
          </g>
        ))}

        <g className="dest" transform={`translate(${P.dubai[0]} ${P.dubai[1]})`}>
          <circle className="halo-out" r="13" filter="url(#glowSoft)" fill="url(#pinGlow)" />
          <circle className="halo" r="11" />
          <circle className="dot dest-dot" r="5" />
          <text className="lbl dest-lbl" x="0" y="46" textAnchor="middle">{t('map.uae')}</text>
          <text className="sub" x="0" y="64" textAnchor="middle">{t('map.allEmirates')}</text>
        </g>

        {/* Out over the water west of Sardinia rather than above the Alps.
            Sat above Italy it was in the top 80 units of the frame, which is
            exactly where the page's sticky header lands once the panel is
            scrolled to — so the one word naming the country was the one word
            covered up. */}
        <text className="flag" x="150" y="212">{t('map.italy')}</text>

        <style>{`
          .map { margin: 0; width: 100%; }
          .map svg { width: 100%; height: auto; display: block; border-radius: 6px; }

          .grid line { stroke: #FFFDF8; stroke-width: .5; opacity: .045; }
          .land  { stroke: #4A5540; stroke-width: .8; }
          .italy { fill: #4E7B3F; stroke: #6E9A54; stroke-width: 1.2; }
          .uae   { fill: #A9752E; stroke: #E0A94C; stroke-width: 1.2; }

          /* ── routes ── */
          .lane {
            fill: none; stroke: #FFFDF8; stroke-width: 1.2;
            opacity: .08; stroke-linecap: round;
          }
          .draw {
            fill: none; stroke-width: 2.6; stroke-linecap: round;
            /* Longer than any of the three paths, so one value reveals all of
               them. Measuring each would need JavaScript on a server component. */
            stroke-dasharray: 4000; stroke-dashoffset: 4000;
            animation: draw 2.6s cubic-bezier(.33,0,.2,1) forwards;
          }
          @keyframes draw { to { stroke-dashoffset: 0; } }

          .pulse {
            fill: none; stroke-width: 3.4; stroke-linecap: round; opacity: 0;
            stroke-dasharray: 26 3974; stroke-dashoffset: 4000;
            animation: flow linear infinite;
          }
          @keyframes flow {
            0%   { stroke-dashoffset: 4000; opacity: 0; }
            6%   { opacity: .95; }
            94%  { opacity: .95; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }

          /* ── vehicles ── */
          .veh { opacity: 0; animation: appear .7s ease 2.2s forwards; }
          .veh-ship  use { fill: #DCEFE6; }
          .veh-air   use { fill: #F6E7BE; }
          .veh-truck use { fill: #F2C79B; }

          /* ── pins ── */
          .origin, .dest, .way { opacity: 0; animation: appear .5s ease forwards; }
          .dest { animation-delay: 2.9s; }

          .dot  { fill: #CFE6BA; }
          .ring { fill: none; stroke: #8FBE6E; stroke-width: 1.6; opacity: .6; }
          .way-dot { fill: #E7C271; opacity: .85; }
          .dest-dot { fill: #F0B75A; }
          .halo {
            fill: none; stroke: #E0A94C; stroke-width: 2;
            transform-origin: center; transform-box: fill-box;
            animation: pulse 2.8s ease-in-out 3.2s infinite;
          }
          @keyframes pulse {
            0%,100% { opacity: .9; transform: scale(1); }
            55%     { opacity: 0;  transform: scale(2.4); }
          }
          @keyframes appear { to { opacity: 1; } }

          /* ── type ──
             Every label is drawn twice by the browser: once as a fat stroke in
             the colour of the water, then the fill on top. Without it the
             route lines run straight through the words — "all seven emirates"
             had a shipping lane through the middle of it — and no amount of
             moving the labels fixes that when four routes cross the frame. */
          .map text {
            paint-order: stroke fill;
            stroke: #0B1A20; stroke-width: 3.5px; stroke-linejoin: round;
          }
          .lbl {
            font-family: var(--font-inter), system-ui, sans-serif;
            font-size: 15px; font-weight: 600; fill: #EDE6D6; letter-spacing: .02em;
          }
          .way-lbl {
            font-family: var(--font-inter), system-ui, sans-serif;
            font-size: 13px; font-weight: 500; fill: #D9C79B; letter-spacing: .06em;
          }
          .dest-lbl { font-size: 15px; letter-spacing: .13em; fill: #F0D9A4; }
          .sub {
            font-family: var(--font-inter), system-ui, sans-serif;
            font-size: 13px; fill: #B9A87F;
          }
          .flag {
            font-family: var(--font-fraunces), serif;
            font-size: 34px; fill: #CFE6BA; letter-spacing: .16em; opacity: .3;
          }

          /* A phone renders this about a third the width, so everything that is
             words grows rather than shrinking into the sea. */
          /* A phone draws this 1200-unit frame about 320 pixels wide — a
             scale of roughly 0.27, at which the desktop's 15px label lands at
             four physical pixels. Making every label big enough to read would
             bury the map under its own words, so the map keeps the three
             things it is actually saying — where the trees come from, where
             they go, and the strait they come in through — and drops the rest.
             The nursery pins stay; only their names go. */
          @media (max-width: 720px) {
            .origin .lbl, .way-minor .way-lbl { display: none; }

            /* The sizes are a budget, not a preference. Dubai sits at x=942 of
               1200, so a label centred on it has 258 units of room each side —
               516 in all. "UNITED ARAB EMIRATES" is 20 characters at roughly
               .7em of advance each, so anything past 36px runs off the right
               edge of the map, which is what the first attempt did. */
            .dest-lbl { font-size: 34px; letter-spacing: .06em; }
            .sub { font-size: 29px; transform: translateY(20px); }

            /* Same arithmetic, other direction: started at the strait there
               are only 227 units to the frame edge, so the label is hung off
               the other side of its pin instead of shrinking to fit. */
            .way-lbl { font-size: 33px; }
            .way-major .way-lbl { text-anchor: end; transform: translateX(-26px); }

            /* 62px rather than 78, so the word still fits the width it now
               sits in, out over the western Mediterranean. */
            .flag { font-size: 62px; }

            .draw { stroke-width: 6; }
            .pulse { stroke-width: 8; }
            .lane { stroke-width: 3; }
            .map text { stroke-width: 7px; }
          }

          @media (prefers-reduced-motion: reduce) {
            .draw { stroke-dashoffset: 0; animation: none; }
            .pulse { display: none; }
            .origin, .dest, .way { opacity: 1; animation: none; }
            .halo { animation: none; opacity: .5; }
            /* The vehicles are the motion. Left visible they would sit frozen
               at whatever point the path starts, which reads as a bug. */
            .veh { display: none; }
          }
        `}</style>
      </svg>
    </figure>
  );
}
