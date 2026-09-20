// Regenerates src/data/map.json — the Italy → UAE map baked into the homepage.
//
//   node scripts/generate-map.mjs
//
// world-atlas, topojson-client and d3-geo are pinned in devDependencies rather
// than installed ad hoc when somebody needs them. They are only used here, so
// pinning costs a little build time — but an unpinned `npm i -D world-atlas`
// two years from now fetches whatever Natural Earth has become since, and the
// coastlines move under a map nobody was expecting to change.
//
// Coastlines are Natural Earth (via world-atlas), projected to Mercator here so
// the site ships plain SVG paths: no map library, no tiles, no API key.
// Adjust `center` / `scale` below to reframe, then check the result on the page.
import fs from 'node:fs';
import * as topojson from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

const load = (f) => {
  const t = JSON.parse(fs.readFileSync(`node_modules/world-atlas/${f}`, 'utf8'));
  return topojson.feature(t, t.objects.countries).features;
};
const coarse = load('countries-110m.json');   // context countries
const fine   = load('countries-50m.json');    // Italy + UAE, the two that matter

const NAME = (f) => f.properties?.name ?? '';

// Only the countries the route actually crosses. A full world map is 400 KB of
// path data and says nothing extra at this scale.
const CONTEXT = [
  'Spain','France','Switzerland','Austria','Slovenia','Croatia','Bosnia and Herz.',
  'Montenegro','Albania','Greece','Macedonia','Bulgaria','Turkey','Cyprus','Syria',
  'Lebanon','Israel','Palestine','Jordan','Iraq','Iran','Kuwait','Saudi Arabia',
  'Qatar','Bahrain','Oman','Yemen','Egypt','Libya','Tunisia','Algeria','Morocco','Sudan',
];

// Taller than it was, and deliberately. The old 1200x620 frame stopped at
// about 15N, which cut off Bab el-Mandeb and the Gulf of Aden — so a sea route
// drawn on it could not show the way a ship actually reaches the UAE and had
// to cheat straight across Arabia. The corridor now fits from Milan down to
// the Horn and round to the Strait of Hormuz.
const W = 1200, H = 780;
const projection = geoMercator().center([33.5, 30]).scale(900).translate([W / 2, H / 2]);
const path = geoPath(projection);

const round = (d) => d && d.replace(/-?\d+(\.\d+)?/g, (m) => (+m).toFixed(1));
const draw  = (feats) => round(feats.map((f) => path(f)).filter(Boolean).join(' '));

const italy = fine.find((f) => NAME(f) === 'Italy');
const uae   = fine.find((f) => NAME(f) === 'United Arab Emirates');
const ctx   = coarse.filter((f) => CONTEXT.includes(NAME(f)));

const pt = (lon, lat) => projection([lon, lat]).map((n) => +n.toFixed(1));

const out = {
  width: W, height: H,
  land:  draw(ctx),
  italy: draw([italy]),
  uae:   draw([uae]),
  // Every waypoint the three routes are drawn through. They are real places,
  // because a route that bends where no sea or road does is the one thing a
  // buyer who ships for a living will notice immediately.
  points: {
    // the nurseries
    lombardia: pt(9.70, 45.55),
    toscana:   pt(11.25, 43.55),
    puglia:    pt(16.60, 40.90),
    sicilia:   pt(14.15, 37.55),

    // SEA — Livorno, the length of the Med, Suez, the Red Sea, Bab el-Mandeb,
    // the Gulf of Aden, the Arabian Sea and in through the Strait of Hormuz.
    seaLivorno: pt(10.30, 43.45),
    seaTyrrh:   pt(11.80, 39.20),
    seaIonian:  pt(17.20, 35.40),
    seaMedE:    pt(26.50, 33.40),
    seaPortSaid:pt(32.30, 31.26),
    seaSuez:    pt(32.60, 29.40),
    seaRedN:    pt(35.60, 26.20),
    seaRedS:    pt(40.20, 16.80),
    seaBab:     pt(43.35, 12.60),
    seaAden:    pt(47.80, 12.20),
    seaArabian: pt(56.20, 17.40),
    seaOman:    pt(58.80, 22.60),
    hormuz:     pt(56.45, 26.55),

    // AIR — Rome up over Anatolia and down the Gulf, which is the shape a
    // flight plan on this pair of airports actually has.
    airRome:  pt(12.50, 41.90),
    airAegean:pt(25.00, 39.60),
    airAnat:  pt(38.00, 36.20),
    airGulf:  pt(49.50, 28.60),

    // LAND — Palermo to Tunis, then east along the North African coast, over
    // Sinai and across the peninsula.
    landPalermo: pt(13.36, 38.12),
    tunis:       pt(10.18, 36.80),
    landTripoli: pt(13.19, 32.88),
    landBenghazi:pt(20.07, 32.12),
    landTobruk:  pt(23.96, 32.08),
    landAlex:    pt(29.92, 31.20),
    landCairo:   pt(31.24, 30.04),
    landSinai:   pt(34.00, 29.30),
    landAqaba:   pt(35.00, 29.53),
    landTabuk:   pt(38.60, 27.40),
    landRiyadh:  pt(46.72, 24.69),

    dubai: pt(55.27, 25.20),
  },
};
fs.writeFileSync('src/data/map.json', JSON.stringify(out));
const kb = (s) => (s.length / 1024).toFixed(1) + ' KB';
console.log('land ', kb(out.land), '| italy', kb(out.italy), '| uae', kb(out.uae));
console.log('total', kb(out.land + out.italy + out.uae));
console.log('points', out.points);
