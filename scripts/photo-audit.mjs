// Which catalogue photographs are in doubt, and what each one actually shows.
//
//   node scripts/photo-audit.mjs            the list
//   node scripts/photo-audit.mjs --sheets   …and contact sheets to look at
//
// Twenty-five of the sixty-eight photographs contradict the specimen they are
// attached to — a "Columnar Cactus" illustrated with a barrel, a "Brahea
// armata" (a silver-blue fan palm) illustrated with an avenue of green feather
// palms. A landscape architect spots that instantly and it costs more trust
// than the "Photo under review" notice the site now carries on those cards.
//
// The fix is new photographs, which only the nursery can take. This is the
// working list for that: what to re-shoot, and what is wrong with each one.
import { readFileSync } from 'node:fs';

const all = JSON.parse(readFileSync('src/data/products.json', 'utf8'));
const bad = all.filter((p) => !p.photoVerified);

const families = [...new Set(all.map((p) => p.family))];
const pad = (s, n) => String(s).padEnd(n);

console.log(`\n${bad.length} of ${all.length} catalogue photographs are under review.\n`);

for (const f of families) {
  const mine = all.filter((p) => p.family === f);
  const flagged = mine.filter((p) => !p.photoVerified);
  console.log(`${pad(f, 22)} ${flagged.length} of ${mine.length}`);
}

console.log('');
for (const f of families) {
  const flagged = all.filter((p) => p.family === f && !p.photoVerified);
  if (flagged.length === 0) continue;
  console.log(`\n── ${f}`);
  for (const p of flagged) {
    console.log(`  ${pad(p.reference, 11)} ${pad(p.name, 30)} ${p.photoNote ?? '(no note recorded)'}`);
  }
}

const noNote = bad.filter((p) => !p.photoNote);
if (noNote.length) {
  console.log(`\n${noNote.length} flagged without a note — say what is wrong, or the flag is` +
              ` just a badge nobody can act on:\n  ${noNote.map((p) => p.reference).join(', ')}`);
}

if (process.argv.includes('--sheets')) {
  const { chromium } = await import('playwright');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const base = process.env.BASE ?? 'http://127.0.0.1:3000';
  const browser = await chromium.launch({
    executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (let i = 0; i < bad.length; i += 12) {
    const slice = bad.slice(i, i + 12);
    await page.setContent(
      `<body style="margin:0;background:#fff;font:12px/1.35 system-ui;display:grid;` +
      `grid-template-columns:repeat(4,1fr);gap:8px;padding:8px">` +
      slice.map((p) => `<figure style="margin:0">
        <img src="${base}/products/${p.image}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border:1px solid #ddd">
        <figcaption><b>${p.reference}</b> ${esc(p.name)}<br>
        <span style="color:#a33">${esc(p.photoNote ?? '')}</span></figcaption></figure>`).join('') +
      `</body>`, { waitUntil: 'networkidle' });
    const out = `photo-audit-${i / 12 + 1}.png`;
    await page.screenshot({ path: out, fullPage: true });
    console.log(`wrote ${out}`);
  }
  await browser.close();
}
