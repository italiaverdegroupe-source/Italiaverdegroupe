import map from '@/data/map.json';

/**
 * The Italy → UAE sourcing route, drawn on real geography.
 *
 * Coastlines come from Natural Earth (via world-atlas), projected to Mercator
 * at build time and baked into `map.json` — 23 KB of path data, no map library,
 * no tiles, no API key, and nothing to fetch at runtime. Motion is pure CSS and
 * stops entirely for anyone who asked their OS for reduced motion.
 */
const P = map.points;
const ORIGINS = [
  { key: 'lombardia', label: 'Lombardia', at: P.lombardia },
  { key: 'toscana', label: 'Toscana', at: P.toscana },
  { key: 'puglia', label: 'Puglia', at: P.puglia },
  { key: 'sicilia', label: 'Sicilia', at: P.sicilia },
] as const;

// One sweeping arc from the middle of the growing regions to the Gulf.
const START = P.toscana;
const END = P.dubai;
const ARC = `M ${START[0]} ${START[1]} Q ${(START[0] + END[0]) / 2} ${Math.min(START[1], END[1]) - 150} ${END[0]} ${END[1]}`;

export default function RouteMap() {
  return (
    <figure className="map">
      <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img"
           aria-label="Sourcing route from nurseries in Lombardia, Toscana, Puglia and Sicilia to the United Arab Emirates">
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4B7340" />
            <stop offset="50%" stopColor="#B08D4F" />
            <stop offset="100%" stopColor="#C8823C" />
          </linearGradient>
          <radialGradient id="pinGlow">
            <stop offset="0%" stopColor="#B08D4F" stopOpacity=".5" />
            <stop offset="100%" stopColor="#B08D4F" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect className="sea" width={map.width} height={map.height} />
        <path className="land" d={map.land} />
        <path className="italy" d={map.italy} />
        <path className="uae" d={map.uae} />

        <path className="route" d={ARC} />

        {/* a specimen travelling the route */}
        <g className="cargo">
          <animateMotion dur="7s" repeatCount="indefinite" path={ARC}
                         calcMode="spline" keyPoints="0;1" keyTimes="0;1"
                         keySplines="0.42 0 0.25 1" />
          <circle r="20" fill="url(#pinGlow)" />
          <g transform="translate(-9,-9) scale(0.75)">
            <path className="cargo-tree"
                  d="M12 23V14M12 15c0-5.2 3.6-9.4 8.2-9.4.5 4.6-2.8 9.4-8.2 9.4Zm0 4.6c-4 0-7-3.3-7-7.3 3.5.4 7 3.4 7 7.3Z" />
          </g>
        </g>

        {ORIGINS.map((o, i) => (
          <g key={o.key} className="origin" style={{ animationDelay: `${0.3 + i * 0.18}s` }}
             transform={`translate(${o.at[0]} ${o.at[1]})`}>
            <circle className="ring" r="7" />
            <circle className="dot" r="3.4" />
            <text className="lbl" x="11" y="4">{o.label}</text>
          </g>
        ))}

        <g className="dest" transform={`translate(${P.dubai[0]} ${P.dubai[1]})`}>
          <circle className="halo" r="11" />
          <circle className="dot dest-dot" r="5" />
          <text className="lbl dest-lbl" x="0" y="-20" textAnchor="middle">UNITED ARAB EMIRATES</text>
          <text className="sub" x="0" y="-6" textAnchor="middle">all seven emirates</text>
        </g>

        <text className="flag" x={P.toscana[0] - 6} y={P.toscana[1] - 64}>ITALY</text>
      </svg>

      <style>{`
        .map { margin: 0; width: 100%; }
        .map svg { width: 100%; height: auto; display: block; }

        .sea   { fill: #EFEADF; }
        .land  { fill: #DCD2BC; stroke: #CFC2A6; stroke-width: 1; }
        .italy { fill: #3C6033; stroke: #2E4A28; stroke-width: 1.2; }
        .uae   { fill: #B8873C; stroke: #96773B; stroke-width: 1.2; }

        .route {
          fill: none; stroke: url(#routeGrad); stroke-width: 3.2;
          stroke-linecap: round; stroke-dasharray: 10 9;
          stroke-dashoffset: 1600;
          animation: trace 3s cubic-bezier(.4,0,.2,1) .4s forwards;
        }
        @keyframes trace { to { stroke-dashoffset: 0; } }

        .cargo { opacity: 0; animation: appear .5s ease 2.4s forwards; }
        .cargo-tree { fill: none; stroke: #2E4A28; stroke-width: 2.1;
                      stroke-linecap: round; stroke-linejoin: round; }

        .origin, .dest { opacity: 0; animation: appear .5s ease forwards; }
        .dest { animation-delay: 3.1s; }

        .dot  { fill: #2E4A28; }
        .ring { fill: none; stroke: #3C6033; stroke-width: 1.6; opacity: .55; }
        .dest-dot { fill: #8A5A1E; }
        .halo {
          fill: none; stroke: #B8873C; stroke-width: 2;
          transform-origin: center; transform-box: fill-box;
          animation: pulse 2.6s ease-in-out 3.3s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: .9; transform: scale(1); }
          55%     { opacity: 0;  transform: scale(2.3); }
        }
        @keyframes appear { to { opacity: 1; } }

        .lbl {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 15px; font-weight: 600; fill: #24361F; letter-spacing: .02em;
        }
        .dest-lbl { font-size: 15px; letter-spacing: .13em; fill: #6B4715; }
        .sub {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 13px; fill: #7A6440;
        }
        .flag {
          font-family: var(--font-fraunces), serif;
          font-size: 34px; fill: #2E4A28; letter-spacing: .16em; opacity: .28;
        }

        @media (max-width: 720px) {
          .lbl { font-size: 24px; }
          .dest-lbl { font-size: 22px; }
          .sub { font-size: 20px; }
          .flag { font-size: 46px; }
          .route { stroke-width: 5; }
        }

        @media (prefers-reduced-motion: reduce) {
          .route { stroke-dashoffset: 0; animation: none; }
          .origin, .dest { opacity: 1; animation: none; }
          .halo { animation: none; opacity: .5; }
          .cargo { display: none; }
        }
      `}</style>
    </figure>
  );
}
