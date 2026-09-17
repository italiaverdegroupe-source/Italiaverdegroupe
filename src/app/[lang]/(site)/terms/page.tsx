import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import LegalPage, { LegalContact } from '@/components/LegalPage';
import { getSettings } from '@/lib/settings';

const meta = {
  title: 'Terms of use',
  description:
    'The terms on which this website may be used: what the catalogue is, what it is not, and what you may do with what is on it.',
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  return { ...meta, alternates: alternates(lang, '/terms') };
}

const UPDATED = '17 September 2026';

export default async function TermsPage() {
  const site = await getSettings();

  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of use"
      updated={UPDATED}
      summary={
        <>These govern the use of this website. The terms that govern buying a tree
        from us are separate, and they are on the <L href="/terms-of-sale">terms
        of sale</L>.</>
      }
      sections={[
        {
          id: 'who',
          heading: 'Whose site this is',
          body: <LegalContact site={site} />,
        },
        {
          id: 'agreement',
          heading: 'Using the site means accepting these terms',
          body: (
            <p>
              By browsing this website you accept these terms. If you do not accept
              them, the remedy is simple and costs nothing: stop using the site.
              Nothing here restricts a right you have under UAE law that cannot be
              given away by agreement.
            </p>
          ),
        },
        {
          id: 'catalogue',
          heading: 'What the catalogue is, and is not',
          body: (
            <>
              <p>
                The catalogue is a record of the kinds of specimen we supply and the
                sizes they are usually available in. <strong>It is not an offer to
                sell, and nothing on it is a contract.</strong> No price is published
                on this site; every specimen is quoted individually, because
                availability, size and the cost of getting a tree here change with
                each consignment.
              </p>
              <p>
                A sale begins when we issue a written quotation and you accept it.
                Until then, an enquiry is a question and our reply is an answer to
                it.
              </p>
              <p>
                Living stock is not manufactured. Two olives of the same age and
                grade are not the same tree, and the specimen you receive will not be
                identical to a photograph. What that means in practice is set out on
                the <L href="/disclaimer">disclaimer</L>.
              </p>
            </>
          ),
        },
        {
          id: 'enquiries',
          heading: 'Enquiries you send us',
          body: (
            <>
              <p>
                Send us accurate details. A delivery quoted against the wrong emirate,
                the wrong access or the wrong quantity is a delivery that has to be
                re-quoted, and on a live tree that costs time nobody has.
              </p>
              <p>You agree not to use the forms on this site to:</p>
              <ul>
                <li>Send anything unlawful, abusive or deliberately false</li>
                <li>Impersonate somebody else or a company you do not represent</li>
                <li>Send automated or bulk submissions, or anything designed to
                    overload the site</li>
                <li>Send us marketing. We did not ask for any</li>
              </ul>
              <p>
                We reject submissions that appear automated. That protection counts
                requests rather than reading them, so on a rare occasion it may
                delay a genuine enquiry — if a form will not send, tell us and we
                will take the details directly.
              </p>
            </>
          ),
        },
        {
          id: 'content',
          heading: 'What is on the site, and who owns it',
          body: (
            <>
              <p>
                The text, photographs, specifications, articles and the design of
                this site belong to {site.legalName} or to whoever licensed them to
                us. The name, the mark and the lockup are ours.
              </p>
              <p>You may, without asking:</p>
              <ul>
                <li>Read, print and save pages for your own use or your project&rsquo;s</li>
                <li>Put a specimen page or a collection into a specification,
                    a tender or a presentation for a client</li>
                <li>Link to any page here from anywhere</li>
              </ul>
              <p>You may not, without written permission:</p>
              <ul>
                <li>Republish the catalogue, or a substantial part of it, as your own</li>
                <li>Use our photographs in your own marketing or product listings</li>
                <li>Scrape or systematically copy the site, by any means</li>
                <li>Present our stock as yours, or imply an agency or a partnership
                    that does not exist</li>
              </ul>
              <p>
                Botanical names are nobody&rsquo;s property. Nothing here stops you
                using them.
              </p>
            </>
          ),
        },
        {
          id: 'availability',
          heading: 'Availability of the site',
          body: (
            <p>
              We try to keep this site up, and we do not promise that it always will
              be. It may be unavailable for maintenance, for a deployment, or because
              something upstream of us has failed. We may change, move or withdraw
              any page without notice. An enquiry that does not send because the site
              was down is not an enquiry we received — if it matters, send it again.
            </p>
          ),
        },
        {
          id: 'links',
          heading: 'Links to other sites',
          body: (
            <p>
              Where we link to somebody else — a grower, an authority, a standard —
              the link is a pointer, not an endorsement, and what is on the other
              end is not ours to control or to answer for. Check anything you intend
              to rely on at its source.
            </p>
          ),
        },
        {
          id: 'liability',
          heading: 'Our responsibility for the site itself',
          body: (
            <>
              <p>
                Information on this site is given in good faith and for general
                guidance. Heights, spreads and pot sizes are indicative of the grade,
                not measurements of the specimen you will receive, and growing advice
                here is not a substitute for somebody looking at your actual site,
                soil and irrigation.
              </p>
              <p>
                To the extent the law allows, we are not liable for loss arising from
                relying on general information on this website, or from the site
                being unavailable. This does not limit our responsibility for the
                trees we actually sell you — that is on the{' '}
                <L href="/terms-of-sale">terms of sale</L>, and it is a real
                responsibility, not a disclaimed one.
              </p>
              <p>
                Nothing here excludes liability for death or personal injury caused
                by our negligence, or for fraud. No wording can, and we would not
                want it to.
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
              applied in {site.city}, and the courts of {site.city} have
              jurisdiction over any dispute arising from them.
            </p>
          ),
        },
        {
          id: 'changes',
          heading: 'Changes to these terms',
          body: (
            <p>
              We may revise these terms. The version that applies to your use of the
              site is the one published when you use it, and the date at the top says
              which that is. Terms that apply to an order are fixed when the
              quotation is accepted and do not change under it afterwards.
            </p>
          ),
        },
      ]}
    />
  );
}
