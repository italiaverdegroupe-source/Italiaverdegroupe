import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import LegalPage, { LegalContact } from '@/components/LegalPage';
import { getSettings } from '@/lib/settings';

const meta = {
  title: 'Replacements & refunds',
  description:
    'What happens when a tree arrives wrong, arrives damaged, or fails after planting — the windows, the evidence, and what we do.',
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  return { ...meta, alternates: alternates(lang, '/refunds') };
}

const UPDATED = '17 September 2026';

export default async function RefundsPage() {
  const site = await getSettings();

  return (
    <LegalPage
      eyebrow="Legal"
      title="Replacements &amp; refunds"
      updated={UPDATED}
      summary={
        <>A tree is not a product you can send back in its box. This page says
        plainly what we replace, what we refund, what we will not, and how long you
        have — so that nobody discovers the answer during an argument.</>
      }
      sections={[
        {
          id: 'principle',
          heading: 'The principle',
          body: (
            <>
              <p>
                If we sent the wrong thing, or sent it in poor condition, that is
                ours to put right and we will. If a sound tree was planted badly,
                watered badly or planted in the wrong season by somebody else, that
                is not.
              </p>
              <p>
                Most failures in the first season trace to irrigation or planting
                depth, and most of them are recoverable if we hear about them early.
                <strong> Tell us early.</strong> A photograph in week two is worth
                more than a claim in month four, to you as well as to us.
              </p>
            </>
          ),
        },
        {
          id: 'on-delivery',
          heading: 'Something is wrong on delivery',
          body: (
            <>
              <p>
                Check the stock as it is offloaded, with our driver present. If
                anything is visibly wrong:
              </p>
              <ul>
                <li>Note it on the delivery note before the driver leaves</li>
                <li>Photograph it there, on the lorry or on the ground</li>
                <li>Do not plant it</li>
              </ul>
              <p>Then, at our cost and our choice:</p>
              <dl>
                <dt>The wrong specimen, species or grade</dt>
                <dd>
                  Taken back and replaced with what was ordered, or the line
                  credited in full. If the correct specimen cannot be sourced within
                  a workable window, we credit it — we do not hold you to a
                  substitute you did not ask for.
                </dd>
                <dt>Damaged in transit</dt>
                <dd>
                  Replaced or credited. A broken leader, a split root ball or a
                  crushed crown is not something you should have to accept and then
                  argue about.
                </dd>
                <dt>Short delivery</dt>
                <dd>
                  The missing units are delivered on the next run at our cost, or
                  removed from the invoice, whichever you prefer.
                </dd>
              </dl>
              <div className="lgl-note">
                <p>
                  <strong>Why the delivery note matters.</strong> Once a tree is off
                  the lorry and on your site, neither of us can prove what arrived
                  and what happened afterwards. Raised on the day it is
                  straightforwardly ours. Raised in week three it becomes a
                  disagreement about irrigation that nobody can settle. That is the
                  honest reason for the window, not a way of getting out of things.
                </p>
              </div>
            </>
          ),
        },
        {
          id: 'first-days',
          heading: 'Within seven days of delivery',
          body: (
            <>
              <p>
                Damage that was not visible on the day — root damage inside the ball,
                a pest that appears once the tree is out of transit — is covered for{' '}
                <strong>seven days</strong> from delivery. Send us photographs and
                the reference number and we will come and look, or ask for more
                pictures if that settles it faster.
              </p>
              <p>
                If the tree was not sound when it left us, it is replaced or
                credited. If it was sound and something on site has damaged it, we
                will tell you that as well — and tell you what to do about it, which
                is usually worth more than the argument.
              </p>
            </>
          ),
        },
        {
          id: 'establishment',
          heading: 'A tree that fails after planting',
          body: (
            <>
              <p>
                Where <strong>we planted it</strong> — pit preparation, soil
                amendment, staking and irrigation connection all in our scope — we
                stand behind establishment for <strong>ninety days</strong> from
                planting, provided the irrigation we specified has actually been run.
                A specimen that fails in that period is replaced once, at our cost,
                in the next suitable planting window.
              </p>
              <p>
                Where <strong>somebody else planted it</strong>, establishment is not
                something we can warrant, because every factor that decides it was
                out of our hands. What we will still do is come and look, tell you
                what we think went wrong, and if the specimen itself was at fault,
                put it right. We have done that before and we will again.
              </p>
              <p>What no establishment cover extends to, anywhere:</p>
              <ul>
                <li>Drought, or an irrigation system that was off, blocked or never commissioned</li>
                <li>Over-watering and waterlogging, which kills more imported trees here than drought</li>
                <li>Planting too deep — the commonest cause of a slow death over two years</li>
                <li>Storm, flood, fire, vandalism or vehicle damage</li>
                <li>Herbicide, salt or construction spoil in the pit</li>
                <li>Moving the tree again after we delivered it</li>
                <li>A species planted outside the window we advised against in writing</li>
              </ul>
            </>
          ),
        },
        {
          id: 'not-returnable',
          heading: 'What cannot be returned because you changed your mind',
          body: (
            <>
              <p>
                Every specimen we supply is selected for one order at a named
                nursery, certified, shipped and cleared for it. It cannot go back on
                a ship, and there is no shelf for it to return to.
              </p>
              <p>
                So a tree that is exactly what was quoted, arrived sound and was
                accepted on delivery is not returnable for a change of plan, a
                changed drawing, or a project that stalled. That is the honest
                position and we would rather state it here than imply otherwise and
                argue later.
              </p>
              <p>
                If a project stalls, talk to us. We can often hold stock, phase it,
                or take a specimen into another order. Those are things we do because
                they are sensible, not because this page obliges us to — and they
                work far better before the lorry is loaded.
              </p>
            </>
          ),
        },
        {
          id: 'how',
          heading: 'How to make a claim',
          body: (
            <>
              <ol>
                <li>
                  <strong>Send it with the reference number.</strong> Every order and
                  every enquiry has one; it is on the quotation and the delivery
                  note.
                </li>
                <li>
                  <strong>Photographs.</strong> The whole tree, the trunk base where
                  it meets the soil, the foliage, and the pit or root ball if it is
                  planted. Daylight, not a floodlight.
                </li>
                <li>
                  <strong>What has been done to it.</strong> When it was planted, how
                  it is watered and how often. This is not us building a defence —
                  it is the fastest route to knowing what is actually wrong.
                </li>
              </ol>
              <p>
                We acknowledge within two working days and tell you what happens
                next. Where a visit is needed we arrange it within five, subject to
                access.
              </p>
              <p>
                Credits go against the invoice for the order. Where a refund is due
                in money it is paid to the account the payment came from, within
                fourteen days of agreeing it.
              </p>
            </>
          ),
        },
        {
          id: 'disagree',
          heading: 'If we disagree',
          body: (
            <>
              <p>
                Say so. Most disputes about a tree are a disagreement about what
                happened to it, and those are settled by somebody going and looking,
                not by exchanging letters.
              </p>
              <p>
                If we still disagree after that, the{' '}
                <L href="/terms-of-sale">terms of sale</L> govern, and nothing
                on this page removes a right you have under UAE consumer or
                commercial law.
              </p>
              <LegalContact site={site} />
            </>
          ),
        },
      ]}
      footnote={
        <p>
          These windows are ours, set because they are the point past which nobody
          can honestly establish what happened. They are not a limit on being
          reasonable: if you are inside the spirit of this page and outside its
          dates, ask anyway.
        </p>
      }
    />
  );
}
