/**
 * Every visible text node on the public site, measured at AA against what is
 * actually behind it.
 *
 *   BASE=http://127.0.0.1:3000 node tests/contrast-sweep.mjs
 *
 * Two stages, and the second is the whole reason this is trustworthy.
 *
 * Stage one reads computed styles and walks up for the first opaque
 * background. That is fast but wrong whenever the thing behind the text is an
 * <img> — which, with next/image, is most of the photographs on this site. It
 * reported fifteen failures; thirteen were light text on a dark photograph
 * that it had mistaken for light text on cream.
 *
 * Stage two settles it the way an eye does: photograph the element's box,
 * blank the glyphs with color:transparent, photograph it again, and compare
 * the declared colour against the worst pixel actually behind the letters.
 * Everything stage one flags is only a suspect until stage two confirms it.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const lin2 = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const L2 = (r, g, b) => 0.2126 * lin2(r) + 0.7152 * lin2(g) + 0.0722 * lin2(b);
const ratio2 = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const B = process.env.BASE ?? 'http://127.0.0.1:3520';
const PAGES = process.env.PAGES?.split(',') ?? [
  '/', '/catalog', '/collections', '/collections/olive-trees', '/services', '/about',
  '/quote', '/journal', '/contact', '/shortlist', '/locations/dubai',
];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const all = [];
for (const path of PAGES) {
  await page.goto(B + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  // A position:fixed overlay — the WhatsApp button, a cookie bar, a sticky
  // toolbar — floats IN FRONT of the copy. Left in, it becomes "the pixel
  // behind the glyph" wherever it happens to sit and reports perfectly good
  // text as unreadable. It is a covering, which is a layout question, not a
  // contrast one; hide it so this measures what the text is actually on.
  await page.addStyleTag({ content: `
    .wa, [data-fixed-overlay] { display: none !important; }
  ` });
  const bad = await page.evaluate(() => {
    const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const parse = (s) => (s.match(/[\d.]+/g) ?? []).map(Number);
    const opaqueBgOf = (el) => {
      for (let n = el; n; n = n.parentElement) {
        const [r, g, b, a = 1] = parse(getComputedStyle(n).backgroundColor);
        if (a >= 0.95 && r !== undefined) return [r, g, b];
      }
      return [255, 255, 255];
    };
    const out = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('body *')) {
      const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      if (!text || text.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.1) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      const [fr, fg, fb, fa = 1] = parse(cs.color);
      if (fa < 0.95) continue;
      const [br, bg, bb] = opaqueBgOf(el);
      const ratio = (Math.max(L(fr,fg,fb), L(br,bg,bb)) + 0.05) / (Math.min(L(fr,fg,fb), L(br,bg,bb)) + 0.05);
      const px = parseFloat(cs.fontSize);
      const bold = Number(cs.fontWeight) >= 700;
      const large = px >= 24 || (bold && px >= 18.66);
      const need = large ? 3 : 4.5;
      if (ratio >= need) continue;
      const key = `${cs.color}|${need}|${el.className}`;
      if (seen.has(key)) continue;
      seen.add(key);
      el.setAttribute('data-vg-suspect', String(out.length));
      out.push({ ratio: +ratio.toFixed(2), need, color: cs.color, size: px,
                 cls: String(el.className).slice(0, 40), tag: el.tagName.toLowerCase(),
                 text: text.slice(0, 40), idx: out.length });
    }
    return out;
  });
  // Stage two. The computed-style pass cannot see an <img> behind the text —
  // next/image renders an element, not a CSS background — so everything it
  // flags is only a SUSPECT. Confirm each one the way the eye does: photograph
  // the box, blank the glyphs, photograph it again, and compare the declared
  // colour against the worst pixel actually behind them.
  const confirmed = [];
  for (const b of bad) {
    const el = page.locator(`[data-vg-suspect="${b.idx}"]`).first();
    if (!(await el.count())) continue;
    const box = await el.boundingBox();
    if (!box || box.width < 2 || box.height < 2) continue;
    const clip = {
      x: Math.max(0, Math.floor(box.x)), y: Math.max(0, Math.floor(box.y)),
      width: Math.min(Math.ceil(box.width), 1280 - Math.floor(box.x)),
      height: Math.min(Math.ceil(box.height), 900 - Math.floor(box.y)),
    };
    if (clip.width < 2 || clip.height < 2 || clip.y >= 900) continue;
    const before = PNG.sync.read(await page.screenshot({ clip }));
    await el.evaluate((e) => { e.dataset.vgPrev = e.style.cssText;
      e.style.setProperty('color', 'transparent', 'important');
      e.style.setProperty('text-shadow', 'none', 'important'); });
    const after = PNG.sync.read(await page.screenshot({ clip }));
    await el.evaluate((e) => { e.style.cssText = e.dataset.vgPrev ?? ''; });
    const [tr, tg, tb] = (b.color.match(/[\d.]+/g) ?? []).map(Number);
    const tL = L2(tr, tg, tb);
    let worst = Infinity, n = 0;
    for (let i = 0; i < before.data.length; i += 4) {
      const d = Math.abs(before.data[i] - after.data[i]) + Math.abs(before.data[i+1] - after.data[i+1])
              + Math.abs(before.data[i+2] - after.data[i+2]);
      if (d < 40) continue;
      n++;
      const r = ratio2(tL, L2(after.data[i], after.data[i+1], after.data[i+2]));
      if (r < worst) worst = r;
    }
    if (!n || worst >= b.need) continue;          // a false alarm, or fine in reality
    confirmed.push({ ...b, ratio: +worst.toFixed(2) });
  }
  for (const b of confirmed) all.push({ path, ...b });
  console.log(`${confirmed.length ? 'FAIL' : 'pass'}  ${path}  ${bad.length} suspected, ${confirmed.length} confirmed`);
}
if (all.length) {
  console.log('\n— distinct failures —');
  for (const a of all) {
    console.log(`  ${String(a.ratio).padStart(5)}:1 (needs ${a.need})  ${a.color}  ${a.size}px  ${a.tag}.${a.cls}  "${a.text}"  [${a.path}]`);
  }
}
await browser.close();
console.log(all.length ? `\n${all.length} FAILING` : '\nall text passes AA');
