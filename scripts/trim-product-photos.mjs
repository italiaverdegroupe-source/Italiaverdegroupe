/**
 * Takes the printed card's white margin off the catalogue photographs.
 *
 * The 68 product photos were cropped out of the 2025 trade catalogue PDF by
 * card coordinates, and every one of them carries about twenty pixels of the
 * card's white paper on each side. Inside a framed, cream-backed figure on the
 * product page that margin reads as a second border, and the photograph sits
 * in the middle of it looking like a thumbnail of itself — on the one page
 * where a buyer decides.
 *
 * Detection scans inward for the first row and column that is not near-white
 * AND not flat. Both tests matter: a white margin is flat AND white, whereas a
 * genuinely overexposed sky is white but not flat, and a wall in shadow is
 * flat but not white. Neither is trimmed.
 *
 * Two safety rails, because this rewrites the only copy of the company's
 * photographs:
 *   - nothing is trimmed by more than MAX_FRACTION of a side, so a pale
 *     photograph cannot be eaten;
 *   - originals are copied to .photo-originals/ first (outside public/, which
 *     is served), and git still holds them either way.
 *
 *   node scripts/trim-product-photos.mjs --dry     see what it would do
 *   node scripts/trim-product-photos.mjs           do it
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'public/products';
// NOT inside public/. Anything under public/ is served, so a backup there
// publishes 68 duplicate photographs at a guessable path and doubles what the
// deployment ships. The originals are in git history anyway; this is a
// convenience copy for the minutes between running this and looking at the
// result.
const BACKUP = '.photo-originals';
const NEAR_WHITE = 244;   // a printed page, not a bright sky
const FLATNESS = 14;      // max channel spread across the line
const MAX_FRACTION = 0.08;
const DRY = process.argv.includes('--dry');

const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
if (!DRY) fs.mkdirSync(BACKUP, { recursive: true });

let changed = 0, skipped = 0, capped = 0;

for (const file of files) {
  const src = path.join(DIR, file);
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const at = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2]]; };
  const lineIsMargin = (pts) => {
    let min = [255, 255, 255], max = [0, 0, 0], sum = 0, n = 0;
    for (const [x, y] of pts) {
      const p = at(x, y);
      for (let k = 0; k < 3; k++) { if (p[k] < min[k]) min[k] = p[k]; if (p[k] > max[k]) max[k] = p[k]; }
      sum += (p[0] + p[1] + p[2]) / 3; n++;
    }
    const spread = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
    return sum / n >= NEAR_WHITE && spread <= FLATNESS;
  };

  const row = (y) => Array.from({ length: Math.ceil(W / 2) }, (_, i) => [i * 2, y]);
  const col = (x) => Array.from({ length: Math.ceil(H / 2) }, (_, i) => [x, i * 2]);

  const limitY = Math.floor(H * MAX_FRACTION);
  const limitX = Math.floor(W * MAX_FRACTION);
  let top = 0, bottom = 0, left = 0, right = 0;
  while (top < limitY && lineIsMargin(row(top))) top++;
  while (bottom < limitY && lineIsMargin(row(H - 1 - bottom))) bottom++;
  while (left < limitX && lineIsMargin(col(left))) left++;
  while (right < limitX && lineIsMargin(col(W - 1 - right))) right++;

  const hitCap = top === limitY || bottom === limitY || left === limitX || right === limitX;
  if (hitCap) capped++;

  const nw = W - left - right;
  const nh = H - top - bottom;
  if (nw < W * 0.5 || nh < H * 0.5 || (top + bottom + left + right) < 4) {
    skipped++;
    console.log(`  skip  ${file}  (${top},${right},${bottom},${left})`);
    continue;
  }

  console.log(`  trim  ${file}  ${W}x${H} -> ${nw}x${nh}  (t${top} r${right} b${bottom} l${left})${hitCap ? '  CAPPED' : ''}`);
  changed++;
  if (DRY) continue;

  fs.copyFileSync(src, path.join(BACKUP, file));
  const out = await sharp(src)
    .extract({ left, top, width: nw, height: nh })
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(src, out);
}

console.log(`\n${changed} trimmed, ${skipped} left alone, ${capped} hit the ${MAX_FRACTION * 100}% cap.`);
if (!DRY) console.log(`Originals in ${BACKUP}`);
