import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import LegalPage, { LegalContact } from '@/components/LegalPage';
import { getSettings } from '@/lib/settings';

const meta = {
  title: 'Privacy policy',
  description:
    'What Verde Garden Trading records when you send an enquiry, how long it is kept, who sees it, and what this site does not do.',
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  return { ...meta, alternates: alternates(lang, '/privacy') };
}

/** Written down, not generated. See the note in LegalPage. */
const UPDATED = '17 September 2026';

export default async function PrivacyPage() {
  const site = await getSettings();

  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated={UPDATED}
      summary={
        <>This site sets no cookies for visitors, runs no analytics and carries no
        advertising or tracking of any kind. The only personal data it holds is what
        you type into an enquiry form and send us.</>
      }
      sections={[
        {
          id: 'who',
          heading: 'Who is responsible',
          body: (
            <>
              <p>
                {site.legalName} is the controller of the personal data described
                here, which means we decide what is collected and why, and we are
                the ones answerable for it.
              </p>
              <LegalContact site={site} />
            </>
          ),
        },
        {
          id: 'what',
          heading: 'What we collect, and only when you send it',
          body: (
            <>
              <p>
                Nothing is collected by visiting. The catalogue, the collections and
                every article on this site can be read without identifying yourself
                in any way.
              </p>
              <p>
                When you send an enquiry — from the quotation form, a specimen page
                or a shortlist — we record exactly the fields you filled in:
              </p>
              <ul>
                <li>Your name, and your company if you gave one</li>
                <li>Your email address, and your telephone or WhatsApp number if you gave one</li>
                <li>The emirate, project type and scope you selected, if any</li>
                <li>The specimens you asked about and the quantities</li>
                <li>Anything you wrote in the message box</li>
                <li>Which page the enquiry came from, and your browser&rsquo;s user-agent string</li>
                <li>A reference number, and the date and time it arrived</li>
              </ul>
              <p>
                That is the whole list. We do not record your IP address against an
                enquiry, we do not build a profile of you, and we do not buy or
                append data about you from anywhere else.
              </p>
              <div className="lgl-note">
                <p>
                  <strong>Your shortlist never leaves your browser.</strong> The
                  specimens you collect are kept in your own device&rsquo;s local
                  storage. Nothing about them reaches us until you press send on the
                  enquiry, and if you never send one we never know you made a list.
                  Clearing your browser data clears it.
                </p>
              </div>
            </>
          ),
        },
        {
          id: 'why',
          heading: 'Why we hold it',
          body: (
            <>
              <p>
                To answer you, to price the specimens you asked about, and — if it
                becomes an order — to import, deliver and invoice it. That is the
                contract you are asking us to enter, and it is the lawful basis for
                holding the enquiry.
              </p>
              <p>
                Records that relate to a completed sale are also kept because UAE
                commercial and tax law requires a business to keep its books and
                supporting documents. We cannot delete an invoice on request for
                the same reason a bank cannot delete a statement.
              </p>
              <p>
                We do not send marketing email. If that ever changes, it will be
                something you opt into deliberately, not something an enquiry signs
                you up to.
              </p>
            </>
          ),
        },
        {
          id: 'cookies',
          heading: 'Cookies and tracking',
          body: (
            <>
              <p>
                <strong>This site sets no cookies on a visitor&rsquo;s browser.</strong>{' '}
                There is no analytics script, no advertising pixel, no social
                embed and no third-party tag on any public page. Nothing follows you
                from here to anywhere else, and this page is not asking you to
                consent to anything, because there is nothing to consent to.
              </p>
              <p>
                One cookie exists in this system and you will never receive it: a
                session cookie set when a member of our own staff signs into the
                operations console at a separate address. It holds a random token,
                nothing about you, and it is never set on the public site.
              </p>
              <p>
                Your browser stores your shortlist locally, as described above.
                That is storage on your device, not a cookie, and it is never
                transmitted anywhere.
              </p>
            </>
          ),
        },
        {
          id: 'who-sees',
          heading: 'Who sees it',
          body: (
            <>
              <p>
                Our own staff, through the operations console, and only those with
                an account. Beyond that, an enquiry is shared only where the work
                itself requires it:
              </p>
              <dl>
                <dt>The Italian nursery</dt>
                <dd>
                  Receives the specification of what you want — species, size,
                  quantity. It does not need your name or your contact details and
                  is not given them.
                </dd>
                <dt>Freight, clearance and delivery</dt>
                <dd>
                  Once there is an order, the delivery address, site contact name
                  and telephone number go to the carrier and to customs, because a
                  consignment cannot be cleared or delivered without them.
                </dd>
                <dt>Our hosting and database providers</dt>
                <dd>
                  The site runs on Railway and the database on Neon. They process
                  data on our instructions in order to run the service and do not
                  use it for anything of their own.
                </dd>
              </dl>
              <p>
                We do not sell personal data, and we have never shared it with a
                marketing, advertising or data-broking business of any kind.
              </p>
            </>
          ),
        },
        {
          id: 'where',
          heading: 'Where it is held',
          body: (
            <p>
              Our hosting and database providers operate in data centres outside the
              United Arab Emirates, so an enquiry is stored abroad. Transfers of
              that kind are permitted under UAE data protection law where the
              recipient is bound to protect the data, and both providers are
              contractually bound to do so. If you would rather your details were
              not stored this way, send us the specification without them and we
              will quote it against a reference instead of a name.
            </p>
          ),
        },
        {
          id: 'how-long',
          heading: 'How long we keep it',
          body: (
            <>
              <dl>
                <dt>An enquiry that never became an order</dt>
                <dd>
                  Kept while we are still in conversation, and for two years after
                  the last contact — trees are specified years before they are
                  planted, and somebody who asked about olives in 2026 is often the
                  same project in 2028. After that it is deleted.
                </dd>
                <dt>An order, a quotation that became one, and its invoices</dt>
                <dd>
                  Kept for the period UAE commercial and tax law requires for
                  accounting records, and then deleted.
                </dd>
                <dt>Sign-in records for our own staff accounts</dt>
                <dd>
                  Ninety days, which is what the lockout that protects those
                  accounts needs in order to work.
                </dd>
              </dl>
            </>
          ),
        },
        {
          id: 'rights',
          heading: 'What you can ask us to do',
          body: (
            <>
              <p>Under UAE data protection law you may ask us to:</p>
              <ul>
                <li>Tell you what we hold about you, and give you a copy</li>
                <li>Correct anything that is wrong</li>
                <li>Delete it, where we are not required to keep it</li>
                <li>Stop using it for a particular purpose</li>
                <li>Hand it over in a form you can take elsewhere</li>
              </ul>
              <p>
                Ask through the <L href="/quote">enquiry form</L> and quote
                your reference number if you have one. We will answer within thirty
                days. There is no charge. If we cannot do what you asked — a paid
                invoice, for instance — we will tell you which record it is and
                which obligation stops us, rather than simply refusing.
              </p>
            </>
          ),
        },
        {
          id: 'security',
          heading: 'How it is protected',
          body: (
            <>
              <p>
                Everything travels over an encrypted connection. Staff accounts use
                hashed passwords, expiring sessions and a lockout after repeated
                failed sign-ins, and every change made in the console is recorded
                against the account that made it. The database is backed up nightly
                to encrypted storage and the backup is read back to check it
                arrived intact.
              </p>
              <p>
                No system is beyond reach. If a breach ever affects your data we
                will tell you and the regulator, and we will tell you what we know
                rather than waiting until we know everything.
              </p>
            </>
          ),
        },
        {
          id: 'children',
          heading: 'Children',
          body: (
            <p>
              This is a trade catalogue sold to businesses and to adults
              commissioning landscaping. It is not directed at children and we do
              not knowingly collect anything from one. If you believe a child has
              sent us their details, tell us and we will delete them.
            </p>
          ),
        },
        {
          id: 'changes',
          heading: 'Changes to this policy',
          body: (
            <p>
              When this policy changes, the date at the top changes with it. We do
              not rewrite it quietly. If a change affects what we do with an enquiry
              you have already sent, we will say so directly rather than relying on
              you to re-read the page.
            </p>
          ),
        },
      ]}
      footnote={
        <p>
          This policy is written to be read rather than to be survived. If a
          sentence in it is unclear, that is a fault in the policy — tell us and we
          will fix the sentence.
        </p>
      }
    />
  );
}
