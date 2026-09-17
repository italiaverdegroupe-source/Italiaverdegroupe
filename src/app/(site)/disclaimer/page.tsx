import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalContact } from '@/components/LegalPage';
import { getSettings } from '@/lib/settings';
import { getAllProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Website disclaimer',
  description:
    'What the photographs, sizes and growing notes on this site mean, and what they do not promise.',
  alternates: { canonical: '/disclaimer' },
};

const UPDATED = '17 September 2026';

export default async function DisclaimerPage() {
  const site = await getSettings();
  const all = getAllProducts();
  const underReview = all.filter((p) => !p.photoVerified).length;

  return (
    <LegalPage
      eyebrow="Legal"
      title="Website disclaimer"
      updated={UPDATED}
      summary={
        <>Everything here is meant to help you specify a tree accurately. None of it
        is a measurement of the specimen you will receive, and this page says exactly
        where the line is.</>
      }
      sections={[
        {
          id: 'photographs',
          heading: 'The photographs',
          body: (
            <>
              <p>
                A catalogue photograph shows the <strong>kind and grade</strong> of
                specimen a listing refers to. It is not a photograph of the tree that
                will be delivered to you, because the tree that will be delivered to
                you has not been selected yet — it is selected at the nursery against
                your order.
              </p>
              <p>
                Living stock varies. Two olives of the same age, grade and price will
                differ in canopy, trunk character and the exact shape of the head.
                That variation is the thing being bought; a tree that looked
                identical to a photograph would be a manufactured object.
              </p>
              <div className="lgl-note">
                <p>
                  <strong>
                    {underReview} of the {all.length} photographs on this site are
                    currently marked &ldquo;new photograph coming&rdquo;.
                  </strong>{' '}
                  We reviewed the catalogue against its own descriptions and found
                  images that do not represent the specimen they sit on — a barrel
                  cactus on a listing for a columnar one, a feather palm on a listing
                  for a fan palm. Rather than quietly leave them, each is flagged on
                  its card and on its page while replacements are taken. Those
                  listings are still real stock; only the picture is in doubt.
                </p>
              </div>
              <p>
                Photographs of the actual specimen are supplied with the quotation,
                before anything is committed. Those are the ones to decide on.
              </p>
            </>
          ),
        },
        {
          id: 'sizes',
          heading: 'Heights, spreads and pot sizes',
          body: (
            <>
              <p>
                Sizes on this site describe the <strong>grade</strong> — the band a
                specimen is sold in — not a measurement taken of one tree. A listing
                that says 3.0&nbsp;–&nbsp;4.0&nbsp;m means the grade contains trees
                between those heights.
              </p>
              <p>
                Height is measured from the top of the root ball, and a tree keeps
                growing between the quotation and the delivery. Where a scheme depends
                on an exact dimension — a clear stem under a canopy, a height under a
                balcony — say so in the enquiry and it will be measured and confirmed
                on the specific specimen before it ships.
              </p>
              <p>
                Pot and root-ball sizes are nominal and vary with how a grower lifted
                and prepared the tree.
              </p>
            </>
          ),
        },
        {
          id: 'names',
          heading: 'Botanical and common names',
          body: (
            <p>
              We use the names the trade uses, which are not always the names a
              botanist would. Common names in particular are regional and
              overlapping. If a specification turns on identity — for a landscape
              consent, a tender or a plant schedule — quote the botanical name in
              your enquiry and we will confirm in writing what is being supplied
              against it.
            </p>
          ),
        },
        {
          id: 'advice',
          heading: 'Growing and planting notes',
          body: (
            <>
              <p>
                The notes on this site, and anything in the journal, are general
                guidance for UAE conditions. They are not advice about your site.
              </p>
              <p>
                Soil, salinity, irrigation water quality, drainage, wind exposure,
                reflected heat off a wall and the month you plant in all change the
                answer, and none of them can be known from here. Where the outcome
                matters, have somebody look at the site — including us, if planting
                is in scope.
              </p>
              <p>
                Nothing on this site is horticultural, agricultural, legal or
                financial advice you should rely on without checking it against your
                own circumstances.
              </p>
            </>
          ),
        },
        {
          id: 'availability',
          heading: 'Availability and price',
          body: (
            <>
              <p>
                A specimen appearing in the catalogue does not mean one is in stock
                today. The catalogue records what we supply; availability moves with
                each consignment and with the lifting season in Italy.
              </p>
              <p>
                <strong>No price is published on this site.</strong> Anything you
                have been told a tree costs, which did not come from a written
                quotation issued by us, did not come from us. Prices depend on grade,
                quantity, scope and the freight on that consignment, and a quotation
                is the only document that binds either of us.
              </p>
            </>
          ),
        },
        {
          id: 'external',
          heading: 'Links and third parties',
          body: (
            <p>
              Where we link to a grower, an authority or a standard, that is a
              pointer and not an endorsement, and we do not control what is on the
              other end of it. Check anything you intend to rely on at its source.
            </p>
          ),
        },
        {
          id: 'accuracy',
          heading: 'Keeping this site accurate',
          body: (
            <>
              <p>
                We correct what we find. This page exists because the alternative —
                a blanket sentence saying nothing here can be relied upon — tells you
                nothing useful about which parts to check.
              </p>
              <p>
                If something on this site is wrong, tell us. A specimen described
                incorrectly is a defect in our catalogue, and we would rather hear it
                from you than have it sit there.
              </p>
              <LegalContact site={site} />
            </>
          ),
        },
        {
          id: 'related',
          heading: 'What this page does not cover',
          body: (
            <p>
              This disclaimer is about information on the website. What we owe you
              for a tree we actually sold you is on the{' '}
              <Link href="/terms-of-sale">terms of sale</Link>, and what happens when
              one arrives wrong or fails is on the{' '}
              <Link href="/refunds">replacements and refunds policy</Link>. Neither
              of those is disclaimed by anything here.
            </p>
          ),
        },
      ]}
    />
  );
}
