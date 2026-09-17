/**
 * Writes the real pixel dimensions of each photograph back into products.json.
 *
 * imageSize is what next/image is given as width and height, and it is how the
 * browser reserves space before the file arrives. Wrong values do not fail —
 * they shift the page as it loads, which is the worst kind of bug to notice
 * later. Anything that changes the files has to run this.
 */
import sharp from 'sharp';
import fs from 'node:fs';

const FILE = 'src/data/products.json';
const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const list = Array.isArray(raw) ? raw : raw.products;

let changed = 0;
for (const p of list) {
  const path = `public/products/${p.image}`;
  if (!fs.existsSync(path)) { console.log(`  MISSING ${p.reference} ${p.image}`); continue; }
  const { width, height } = await sharp(path).metadata();
  const next = `${width}x${height}`;
  if (p.imageSize !== next) { console.log(`  ${p.reference} ${p.imageSize} -> ${next}`); p.imageSize = next; changed++; }
}
fs.writeFileSync(FILE, JSON.stringify(raw, null, 2) + '\n');
console.log(`${changed} dimensions updated.`);
