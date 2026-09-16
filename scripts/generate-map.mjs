// Regenerates src/data/map.json — the Italy → UAE map baked into the homepage.
//
//   npm i -D world-atlas topojson-client d3-geo
//   node scripts/generate-map.mjs
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

const W = 1200, H = 620;
// Framed on the corridor itself: western Med to the Gulf of Oman.
const projection = geoMercator().center([33.5, 35.2]).scale(900).translate([W / 2, H / 2]);
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
  points: {
    toscana:  pt(11.25, 43.55),
    puglia:   pt(16.60, 40.90),
    sicilia:  pt(14.15, 37.55),
    lombardia:pt(9.70, 45.55),
    dubai:    pt(55.27, 25.20),
  },
};
fs.writeFileSync('src/data/map.json', JSON.stringify(out));
const kb = (s) => (s.length / 1024).toFixed(1) + ' KB';
console.log('land ', kb(out.land), '| italy', kb(out.italy), '| uae', kb(out.uae));
console.log('total', kb(out.land + out.italy + out.uae));
console.log('points', out.points);
