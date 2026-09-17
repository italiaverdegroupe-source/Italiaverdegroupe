import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import LegalPage, { LegalContact } from '@/components/LegalPage';
import { getSettings } from '@/lib/settings';
import { site as fallback } from '@/lib/site';

const meta = {
  title: 'Terms of sale',
  description:
    'How a quotation becomes an order: prices, lead times, delivery and offloading, acceptance on site, payment, title and risk.',
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  return { ...meta, alternates: alternates(lang, '/terms-of-sale') };
}

const UPDATED = '17 September 2026';

export default async function TermsOfSalePage() {
  const site = await getSettings();
  const lead = fallback.leadTimeWeeks;

  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of sale"
      updated={UPDATED}
      summary={
        <>These apply to every quotation we issue and every order that follows one.
        They are written to be read before you sign, not after something has gone
        wrong.</>
      }
      sections={[
        {
          id: 'who',
          heading: 'Who you are contracting with',
          body: <LegalContact site={site} />,
        },
        {
          id: 'quotation',
          heading: 'Quotations',
          body: (
            <>
              <p>
                Nothing on this website is priced. Every quotation is written for one
                enquiry, against the stock and the freight costs available at the
                time, and it states what it covers.
              </p>
              <ul>
                <li>
                  A quotation is valid for <strong>{site.quoteValidityDays} days</strong>{' '}
                  from issue unless it says otherwise. After that it lapses and we
                  re-quote — not to extract more money, but because a consignment,
                  an exchange rate and a nursery&rsquo;s availability all move.
                </li>
                <li>
                  It is an offer to sell the specimens described, in the scope
                  described. Supply only, supply and delivery, and supply with
                  delivery and planting are three different scopes and three
                  different prices.
                </li>
                <li>
                  Quantities and grades are as stated. A tree is quoted against a
                  size band, not a measured height, because it keeps growing between
                  the quotation and the delivery.
                </li>
              </ul>
              <p>
                {site.vatEnabled
                  ? `Prices are exclusive of VAT, which is added at ${(site.vatRate * 100).toFixed(0)}% where it applies.`
                  : 'Prices are exclusive of VAT. We are not currently VAT-registered, so no VAT is charged and none is shown — a supplier who is not registered may not charge it.'}
              </p>
            </>
          ),
        },
        {
          id: 'order',
          heading: 'When an order exists',
          body: (
            <>
              <p>
                An order exists when you accept a quotation in writing — by email, by
                signed copy, or by purchase order referencing it — and we confirm it.
                Our confirmation is the point at which we commit stock and begin
                buying. Before that, nothing is reserved.
              </p>
              <p>
                Where your purchase order carries its own printed conditions, they do
                not replace these. We will not accept terms nobody has read to us; if
                yours must apply, say so before we confirm and we will agree in
                writing which ones.
              </p>
            </>
          ),
        },
        {
          id: 'lead-time',
          heading: 'Lead times, and why they are ranges',
          body: (
            <>
              <p>
                Typical lead time is <strong>{lead.min}–{lead.max} weeks</strong> from
                order confirmation to delivery on site: selection at the grower,
                phytosanitary certification and permits, the sailing, clearance, and
                acclimatisation on arrival.
              </p>
              <p>
                A date we give you is an estimate made in good faith. Trees are
                living stock moving through customs on a ship, and the calendar
                constrains both ends — lifting season in Italy and the UAE summer
                both limit when a specimen can safely travel and establish.
              </p>
              <p>
                <strong>We will not accept a delivery date that would cost you the
                tree.</strong> If you need a species outside its window we will say
                so and propose either a different species or a different date. That
                is not us being difficult; it is the difference between a tree that
                establishes and one that dies in its first summer at your cost.
              </p>
              <p>
                Time is not of the essence unless a quotation says so in those words.
                We are not liable for delay caused by anything outside our control,
                including weather, port congestion, vessel delay, customs or
                agricultural inspection, or a grower&rsquo;s failure — but we will tell
                you as soon as we know, not on the day it was due.
              </p>
            </>
          ),
        },
        {
          id: 'delivery',
          heading: 'Delivery, access and offloading',
          body: (
            <>
              <p>
                Delivery is to the site named on the order, during working hours, on a
                date agreed in advance. Where offloading is in scope we bring the crane
                or hiab the root ball needs.
              </p>
              <p>What we need from you, and what happens without it:</p>
              <dl>
                <dt>Access confirmed before the date is agreed</dt>
                <dd>
                  Gate widths, overhead lines, ground bearing and the standing room a
                  crane needs. We ask before scheduling. A low-loader that cannot
                  turn into a site is a wasted day charged at cost.
                </dd>
                <dt>Somebody there to receive it</dt>
                <dd>
                  With authority to sign. A failed delivery because nobody attended is
                  re-charged, and the tree goes back onto a lorry it should not be on.
                </dd>
                <dt>Somewhere to put it</dt>
                <dd>
                  Pits dug, or a shaded standing area with water. A specimen left in
                  full sun on a slab on a July afternoon can be lost in a day.
                </dd>
              </dl>
              <p>
                We may deliver an order in parts where it is sensible to, and each
                part is invoiced as it is delivered.
              </p>
            </>
          ),
        },
        {
          id: 'acceptance',
          heading: 'Checking the trees on arrival',
          body: (
            <>
              <p>
                <strong>Inspect the stock when it is offloaded, with our driver
                present.</strong> This is the single most important paragraph on this
                page. Anything visibly wrong — the wrong specimen, a damaged root
                ball, a broken leader, a tree that travelled badly — must be raised
                then and noted on the delivery note, and photographed.
              </p>
              <p>
                Raise it then and it is ours. Raise it three weeks later and neither
                of us can tell whether it arrived that way, and the answer will turn
                on irrigation and planting depth rather than on the consignment. That
                is not a technicality we hide behind: it is the honest limit of what
                anybody can establish after the fact.
              </p>
              <p>
                Damage not visible on delivery, and anything else, is covered by the{' '}
                <L href="/refunds">replacements and refunds policy</L>, which
                sets out the windows and what we do.
              </p>
            </>
          ),
        },
        {
          id: 'payment',
          heading: 'Payment',
          body: (
            <>
              <p>
                Payment terms are stated on the quotation. Because we buy, ship and
                clear stock before it reaches you, an order normally carries an
                advance against confirmation, with the balance on delivery. A project
                supplied in phases may carry a retention, released on the date the
                order states.
              </p>
              <ul>
                <li>Invoices are payable in {site.currency} unless agreed otherwise.</li>
                <li>
                  Overdue sums may carry interest at 1% a month from the due date. We
                  would rather telephone you than charge it.
                </li>
                <li>
                  Where an account is materially overdue we may hold further
                  deliveries. We will tell you before we do, not by not arriving.
                </li>
                <li>
                  Payment may not be withheld by set-off against a claim we have not
                  agreed.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'title',
          heading: 'Title and risk',
          body: (
            <>
              <p>
                <strong>Risk</strong> passes when the stock is offloaded at your site.
                From that moment its watering, shading and protection are yours.
              </p>
              <p>
                <strong>Title</strong> stays with us until the invoice for that stock
                is paid in full. Until then it remains our property, and we may
                recover it. In practice this matters only where an account goes
                badly wrong; it is on the page because it would be worse to leave it
                unsaid.
              </p>
            </>
          ),
        },
        {
          id: 'cancellation',
          heading: 'Cancelling or changing an order',
          body: (
            <>
              <p>
                Tell us as early as you can. What it costs depends entirely on where
                the tree has got to:
              </p>
              <dl>
                <dt>Before we have committed to the grower</dt>
                <dd>Cancelled at no charge, and your advance is returned in full.</dd>
                <dt>After selection, before it ships</dt>
                <dd>
                  The costs we have actually incurred — deposit to the nursery,
                  certification, permits — are charged. The rest is returned.
                </dd>
                <dt>Once it has sailed, or on arrival</dt>
                <dd>
                  A specimen selected to your specification cannot be put back. The
                  order stands. If it is a species we can sell to somebody else we
                  will try, and credit you what we recover, less costs — but we will
                  not promise that in advance.
                </dd>
              </dl>
              <p>
                Changes of specification are treated as a re-quotation, not an
                amendment, because they usually change which tree it is.
              </p>
            </>
          ),
        },
        {
          id: 'liability',
          heading: 'What we are responsible for',
          body: (
            <>
              <p>
                We are responsible for supplying stock that matches what was quoted,
                in sound condition, with the paperwork a consignment of live plants
                requires. Where we have not, the{' '}
                <L href="/refunds">replacements and refunds policy</L> says what
                we do about it.
              </p>
              <p>
                We are not responsible for what happens to a tree after it is planted
                by somebody else, in ground we did not prepare, on irrigation we did
                not design. Where planting is in our scope, it is ours.
              </p>
              <p>
                To the extent the law allows, our liability for an order is limited
                to the value of that order, and we are not liable for loss of profit,
                loss of contract, delay to a wider programme, or other indirect loss.
                This does not limit liability for death or personal injury caused by
                our negligence, or for fraud.
              </p>
            </>
          ),
        },
        {
          id: 'law',
          heading: 'Governing law',
          body: (
            <p>
              These terms are governed by the laws of the United Arab Emirates as
              applied in {site.city}. Talk to us first — most disputes about a tree
              are a disagreement about what happened to it, and those are settled by
              going and looking. If that fails, the courts of {site.city} have
              jurisdiction.
            </p>
          ),
        },
      ]}
    />
  );
}
