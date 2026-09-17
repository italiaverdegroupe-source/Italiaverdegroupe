import { getSettings } from '@/lib/settings';

/**
 * WhatsApp, where a UAE trade buyer will actually look for it.
 *
 * It was in the footer, which is the one place a supplier's number is no use:
 * somebody standing on a site with a landscape architect asking "can you get
 * forty of these" is not going to scroll to the bottom of a page. In this
 * market WhatsApp is not a nicety alongside a phone number, it is the channel
 * — quotations, photographs of stock, delivery slots all move through it.
 *
 * It renders only when a number has actually been configured. An advertised
 * channel nobody answers is worse than none, which is the same rule the footer
 * and the quote form already follow.
 *
 * The message is pre-filled but deliberately short and neutral: anything
 * longer reads as a script the sender has to delete before they can type, and
 * a pre-filled message that makes a claim on their behalf ("I am interested in
 * buying…") is putting words in a stranger's mouth.
 */
export default async function WhatsAppButton() {
  const site = await getSettings();
  const digits = site.whatsapp.replace(/[^\d]/g, '');
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hello ${site.legalName} — I have a question about your trees.`,
  )}`;

  return (
    <>
      <a
        className="wa"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Message ${site.legalName} on WhatsApp${site.whatsappLabel ? `, ${site.whatsappLabel}` : ''}`}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.003a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.18 8.18 0 0 1 5.82 2.41 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.24.25-.41.09-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.63 4.18 3.69.58.25 1.04.4 1.4.52.59.18 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
        </svg>
        <span className="wa-txt">WhatsApp</span>
      </a>

      <style>{`
        .wa {
          position: fixed; z-index: 60;
          inset-inline-end: clamp(14px, 2.2vw, 26px); bottom: clamp(14px, 2.2vw, 26px);
          display: inline-flex; align-items: center; gap: 9px;
          padding: 13px 18px 13px 15px; border-radius: 999px;
          background: #1F7A44; color: #fff; text-decoration: none;
          font-size: .9rem; font-weight: 500; letter-spacing: .01em;
          box-shadow: 0 14px 34px -12px rgb(10 30 18 / .55),
                      0 2px 6px rgb(10 30 18 / .22);
          transition: transform .18s var(--ease), background .18s ease;
        }
        .wa:hover { background: #1A6B3B; transform: translateY(-2px); }
        .wa:active { transform: translateY(0); }
        /* The focus ring has to clear the button's own colour, so it is drawn
           outside it rather than on it. */
        .wa:focus-visible { outline: 3px solid #14150F; outline-offset: 3px; }

        /* On a phone the label costs width the thumb wants for the page, and
           the mark alone is unambiguous — this is the one logo in the world
           that needs no caption. The accessible name stays either way. */
        @media (max-width: 560px) {
          .wa { padding: 14px; gap: 0; }
          .wa-txt { display: none; }
        }
        /* At 320px the button is 16% of the width of the screen and there is
           no column of margin for it to sit in, so it lands on the paragraph.
           A floating button overlapping copy as you scroll past is normal; one
           that takes a sixth of a narrow screen is not. */
        @media (max-width: 400px) {
          .wa { padding: 11px; inset-inline-end: 10px; bottom: 10px; }
          .wa svg { width: 21px; height: 21px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wa { transition: background .18s ease; }
          .wa:hover { transform: none; }
        }
        @media print { .wa { display: none; } }
      `}</style>
    </>
  );
}
