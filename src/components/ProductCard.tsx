import L from '@/components/L';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import ShortlistButton from '@/components/ShortlistButton';
import { ui } from '@/lib/ui';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { productCopy } from '@/lib/product-copy';

/**
 * Editorial specimen card: tall portrait frame, the reference used as a
 * typographic mark, specs as a hairline table. No boxed e-commerce tile.
 */
export default function ProductCard(
  { p, priority = false, locale = DEFAULT_LOCALE }:
  { p: Product; priority?: boolean; locale?: Locale },
) {
  // A prop, not the context. This is a SERVER component — it renders an
  // <Image> and a link and nothing interactive, so making it a client one to
  // read a context would ship the whole card to the browser for two words.
  const t = ui(locale);
  // The name shown, and the name the alt text and the shortlist carry, are one
  // value — a card whose picture is described in English on an Arabic page is
  // the version of this bug that a sighted reader never notices.
  const copy = productCopy(p, locale);
  // "On Request" is not a price, it is the absence of one written out in
  // English, and all sixty-eight rows of the catalogue carry it. Because it is
  // a non-empty string the truthiness test that used to live at the call site
  // below always took it, so the translated line underneath was unreachable
  // and every Arabic and Italian card read ON REQUEST in Latin capitals.
  // Treated as the sentinel it is, the sentence comes from the dictionary
  // instead — and the day a real figure lands in the data it still wins.
  const priced = p.price && p.price.trim().toLowerCase() !== 'on request' ? p.price : null;
  const [w, h] = p.imageSize.split('x').map(Number);
  return (
    <article className="spec reveal">
      <L href={`/catalog/${p.slug}`} className="spec-link">
        <div className="spec-frame">
          <Image
            src={`/products/${p.image}`}
            alt={copy.name}
            width={w || 1388}
            height={h || 861}
            // These numbers look wrong and are not. `sizes` tells the browser
            // how wide the IMAGE will be laid out, and the frame below is
            // `aspect-ratio: 4 / 5` with `object-fit: cover` while every
            // source photograph is landscape at about 1.64:1. Cover scales
            // the picture until it fills the box's HEIGHT, so the picture is
            // actually laid out at boxWidth / 0.8 * 1.64 = 2.05x the width of
            // the box it is being cropped into. Describing the box — 90vw,
            // 45vw, 300px — asked for half the pixels the browser then had to
            // stretch over the frame: measured on /catalog at 1440px, a
            // 360x220 file was being blown up into a 272x340 slot, and at
            // 412px/DPR2 an 828-wide file into 1516 device pixels, a 1.83x
            // upscale on the one thing this business sells on the look of.
            // Next does not compensate for object-fit (see
            // node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md,
            // "sizes"), so the crop factor is applied here by hand.
            //
            // The other half of the waste is not fixable from this file: half
            // of every downloaded pixel is thrown away by the crop, because
            // the photographs are landscape and the frame is portrait.
            // Re-cropping public/products/*.jpg to 4:5 would remove that and
            // is the right follow-up.
            sizes="(max-width: 640px) 185vw, (max-width: 1024px) 93vw, 615px"
            priority={priority}
          />
          <span className="spec-ref">{p.reference}</span>
          {!p.photoVerified && (
            // Said plainly, and in the same ink as the reference chip rather
            // than in warning red. A third of the catalogue carries this while
            // the photographs are being retaken, and a grid of red labels
            // reads as a broken site rather than an honest one — which would
            // be the wrong thing to have learned from telling the truth.
            <span className="spec-flag">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {t("New photograph coming")}
            </span>
          )}
        </div>

        <div className="spec-body">
          <h3 className="spec-name">{copy.name}</h3>
          <dl className="spec-dl">
            {p.attributes.Height && (
              <div><dt>{t("Height")}</dt><dd>{p.attributes.Height}</dd></div>
            )}
            {(p.attributes['Pot Size'] || p.attributes.Diameter) && (
              <div>
                <dt>{t(p.attributes['Pot Size'] ? 'cat.pot' : 'cat.diameter')}</dt>
                <dd>{p.attributes['Pot Size'] ?? p.attributes.Diameter}</dd>
              </div>
            )}
          </dl>
          <span className="spec-cta">{priced ?? t('cat.priceOnRequest')}</span>
        </div>
      </L>

      {/* Outside the anchor on purpose: a button nested inside a link is
          invalid HTML, and a keyboard user landing on it would be told they
          are on a link to the specimen rather than on a control. */}
      <div className="spec-add">
        <ShortlistButton item={{ ref: p.reference, name: copy.name, slug: p.slug }} compact />
      </div>

      {/* The CSS that used to be here now lives in src/app/globals.css.
          This component is rendered in a loop on five different templates, so
          a <style> element in its markup was emitted sixty-eight times on
          /catalog alone — a third of that document, byte for byte identical.
          The rules were static and referred only to the design tokens, so
          nothing about them was ever per-card. See the note in globals.css. */}
    </article>
  );
}
