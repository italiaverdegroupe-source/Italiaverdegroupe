/**
 * Italy → UAE sourcing route.
 *
 * Deliberately inline SVG + CSS only: no map library, no Lottie, no canvas.
 * The whole thing is a few KB of markup, ships zero JavaScript, and never
 * blocks the hero copy from painting. Motion is disabled for anyone who
 * asked their OS for reduced motion.
 */
export default function RouteMap({ className = '' }: { className?: string }) {
  return (
    <div className={`route ${className}`} aria-hidden="true">
      <svg viewBox="0 0 820 360" role="presentation" focusable="false">
        <defs>
          <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4B87C" />
            <stop offset="55%" stopColor="#B08D4F" />
            <stop offset="100%" stopColor="#7C9B6F" />
          </linearGradient>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="#D4B87C" stopOpacity=".55" />
            <stop offset="100%" stopColor="#D4B87C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* graticule — a hint of globe, not a map that pretends to be accurate */}
        <g className="grat" stroke="currentColor" fill="none" strokeWidth="1">
          {[70, 130, 190, 250, 310].map((y) => (
            <path key={y} d={`M 20 ${y} Q 410 ${y - 34} 800 ${y}`} />
          ))}
          {[120, 260, 400, 540, 680].map((x) => (
            <path key={x} d={`M ${x} 26 Q ${x + (410 - x) * 0.13} 180 ${x} 334`} />
          ))}
        </g>

        {/* the flight path */}
        <path id="arcpath" className="arc" d="M 168 214 Q 410 44 664 172"
              fill="none" stroke="url(#arc)" strokeWidth="2.5" strokeLinecap="round" />

        {/* travelling marker */}
        <g className="pip">
          <animateMotion dur="5.5s" repeatCount="indefinite" keyPoints="0;1"
                         keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.2 1"
                         path="M 168 214 Q 410 44 664 172" />
          <circle r="16" fill="url(#glow)" />
          <circle r="4.5" fill="#FBF9F4" />
        </g>

        {/* origin — Italy */}
        <g className="node origin" transform="translate(168 214)">
          <circle className="halo" r="9" />
          <circle r="5.5" />
          <text x="0" y="34" textAnchor="middle" className="label">ITALIA</text>
          <text x="0" y="52" textAnchor="middle" className="sub">Toscana · Puglia · Sicilia</text>
        </g>

        {/* destination — UAE */}
        <g className="node dest" transform="translate(664 172)">
          <circle className="halo" r="9" />
          <circle r="5.5" />
          <text x="0" y="34" textAnchor="middle" className="label">UNITED ARAB EMIRATES</text>
          <text x="0" y="52" textAnchor="middle" className="sub">All seven emirates</text>
        </g>
      </svg>

      <style>{`
        .route { width: 100%; color: rgb(255 255 255 / .16); }
        .route svg { width: 100%; height: auto; overflow: visible; }

        .grat path { stroke-dasharray: 2 7; opacity: .75; }

        .arc {
          stroke-dasharray: 700;
          stroke-dashoffset: 700;
          animation: draw 2.6s cubic-bezier(.45,0,.2,1) .35s forwards;
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }

        .pip { opacity: 0; animation: fade .6s ease 2.6s forwards; }
        @keyframes fade { to { opacity: 1; } }

        .node circle { fill: #FBF9F4; }
        .node .halo {
          fill: none; stroke: #D4B87C; stroke-width: 1.5;
          transform-origin: center; transform-box: fill-box;
          animation: pulse 3s ease-in-out infinite;
        }
        .dest .halo { animation-delay: 1.5s; }
        @keyframes pulse {
          0%, 100% { opacity: .9; transform: scale(1); }
          50%      { opacity: .25; transform: scale(1.75); }
        }

        .node { opacity: 0; animation: fade .7s ease forwards; }
        .origin { animation-delay: .2s; }
        .dest   { animation-delay: 2.5s; }

        .label {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .14em;
          fill: #FBF9F4;
        }
        .sub {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 10px; letter-spacing: .04em; fill: rgb(251 249 244 / .6);
        }

        @media (max-width: 640px) {
          .label { font-size: 13px; }
          .sub   { font-size: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .arc  { stroke-dashoffset: 0; animation: none; }
          .node, .pip { opacity: 1; animation: none; }
          .halo { animation: none; opacity: .5; }
          .pip  { display: none; }
        }
      `}</style>
    </div>
  );
}
