/**
 * Contrast measured off the rendered page, not off the stylesheet.
 *
 *   BASE=http://127.0.0.1:3000 node tests/hero-contrast.mjs
 *
 * Needs a running server and playwright. It exists because the homepage puts
 * copy on a photograph, and on a photograph the answer is different at every
 * viewport width: the same headline crosses open sky at 1024px and the crown
 * of a tree at 2560px. A stylesheet cannot tell you which.
 *
 * For each piece of copy: screenshot its box, hide the text, screenshot the
 * same box again. The second shot is exactly what is behind the glyphs. The
 * ratio reported is the declared text colour against the WORST pixel of that
 * background — the one closest in luminance to the text — which is the pixel
 * that decides whether a letter is readable.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const B = process.env.BASE ?? 'http://127.0.0.1:3520';
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const TARGETS = [
  ['.hdr .brand-txt strong', 4.5], ['.hdr .brand-txt em', 4.5],
  ['.hdr .brand-line', 4.5], ['.hdr .nav a', 4.5],
  ['.hero .eyebrow', 4.5], ['.hero h1', 3], ['.hero h1 em', 3],
  ['.hero-lede', 4.5], ['.hero-cta .btn-ghost', 4.5],
  ['.hero-assure li span', 4.5],
  ['.hero-feat-eyebrow', 4.5], ['.hero-feat-name', 4.5], ['.hero-feat-note', 4.5],
  ['.hero-seal strong', 3], ['.hero-seal b', 4.5],
];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let failed = 0;
for (const [w, h] of [[2560, 1100], [1600, 1000], [1280, 800], [1024, 768], [860, 900], [768, 1024], [390, 844], [320, 640]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(B, { waitUntil: 'networkidle' });
  // Links and buttons fade their colour over .16s. Screenshotting straight
  // after setting color:transparent catches them mid-fade, and the half-faded
  // glyphs read as a background far darker than anything on the page. Stop
  // every transition before measuring anything.
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' });
  // A position:fixed overlay — the WhatsApp button, a cookie bar, a sticky
  // toolbar — floats IN FRONT of the copy. Left in, it becomes "the pixel
  // behind the glyph" wherever it happens to sit and reports perfectly good
  // text as unreadable. It is a covering, which is a layout question, not a
  // contrast one; hide it so this measures what the text is actually on.
  await page.addStyleTag({ content: `
    .wa, [data-fixed-overlay] { display: none !important; }
  ` });
  await page.waitForTimeout(700);
  console.log(`\n── ${w}×${h} ───────────────────────────────`);
  for (const [sel, need] of TARGETS) {
    const el = page.locator(sel).first();
    if (!(await el.count())) { console.log(`  n/a   ${sel}`); continue; }
    const box = await el.boundingBox();
    if (!box || box.width < 2 || box.height < 2) { console.log(`  n/a   ${sel} (not rendered)`); continue; }
    const vis = await el.evaluate((e) => getComputedStyle(e).visibility);
    if (vis === 'hidden' || (await el.evaluate((e) => getComputedStyle(e).display)) === 'none') {
      console.log(`  n/a   ${sel} (hidden)`); continue;
    }
    const clip = {
      x: Math.max(0, Math.floor(box.x)), y: Math.max(0, Math.floor(box.y)),
      width: Math.min(Math.ceil(box.width), w - Math.floor(box.x)),
      height: Math.min(Math.ceil(box.height), h - Math.floor(box.y)),
    };
    if (clip.width < 2 || clip.height < 2 || clip.y >= h) { console.log(`  n/a   ${sel} (off-screen)`); continue; }
    const colour = await el.evaluate((e) => getComputedStyle(e).color);
    const [tr, tg, tb] = colour.match(/[\d.]+/g).map(Number);
    const tL = L(tr, tg, tb);

    // color:transparent rather than visibility:hidden. Hiding the element
    // takes its own background with it — a button would then be measured
    // against the photograph behind it instead of against its own fill, which
    // is not what anybody reads.
    const before = PNG.sync.read(await page.screenshot({ clip }));
    await el.evaluate((e) => {
      e.dataset.vgPrev = e.style.cssText;
      e.style.setProperty('color', 'transparent', 'important');
      e.style.setProperty('text-shadow', 'none', 'important');
    });
    const after = PNG.sync.read(await page.screenshot({ clip }));
    await el.evaluate((e) => { e.style.cssText = e.dataset.vgPrev ?? ''; delete e.dataset.vgPrev; });

    let worst = Infinity, n = 0;
    for (let i = 0; i < before.data.length; i += 4) {
      const d = Math.abs(before.data[i] - after.data[i]) + Math.abs(before.data[i+1] - after.data[i+1])
              + Math.abs(before.data[i+2] - after.data[i+2]);
      if (d < 40) continue;                        // not a glyph pixel
      n++;
      const r = ratio(tL, L(after.data[i], after.data[i+1], after.data[i+2]));
      if (r < worst) worst = r;
    }
    if (!n) { console.log(`  n/a   ${sel} (no glyph pixels)`); continue; }
    const ok = worst >= need;
    if (!ok) failed++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${sel.padEnd(26)} ${worst.toFixed(2)}:1  (needs ${need}:1, ${n}px)`);
  }
  await page.close();
}
await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nevery measured ratio passes');
process.exit(failed ? 1 : 0);
