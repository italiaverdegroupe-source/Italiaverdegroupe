import type { Metadata } from 'next';
import { alternates, LOCALE_TAG, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Prose from '@/components/Prose';
import { getPost, publishedPosts } from '@/lib/content';
import { ogImage } from '@/lib/site';
import { imageFor } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { ui } from '@/lib/ui';

export const revalidate = 300;
export const dynamicParams = true;

/** Pre-render what exists at build time; anything published later is rendered on demand. */
export async function generateStaticParams() {
  try {
    return (await publishedPosts()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const cover = (ref: string | null) => {
  if (!ref) return null;
  try { return imageFor(ref); } catch { return null; }
};

/**
 * The date an article was published, in the language it is being read in.
 *
 * It was 'en-GB' on both journal pages, so an Arabic reader got "19 September
 * 2026" under an Arabic headline and an Italian reader got the English month
 * name. The locale tag is already derived from the route — nothing had to be
 * looked up, it simply was not passed.
 */
const fmt = (v: string | null, lang: Locale) =>
  v ? new Date(v).toLocaleDateString(LOCALE_TAG[lang],
      { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale; slug: string }> },
): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPost(slug, lang);
  if (!post) return { title: 'Not found', robots: { index: false, follow: false } };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    alternates: alternates(lang, `/journal/${post.slug}`),
    openGraph: {
      type: 'article',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      publishedTime: post.published_at ?? undefined,
      images: [ogImage],
    },
  };
}

export default async function PostPage(
  { params }: { params: Promise<{ lang: Locale; slug: string }> },
) {
  const { lang, slug } = await params;
  const t = ui(lang);
  const [post, site] = await Promise.all([getPost(slug, lang), getSettings()]);
  // A draft, a future date, or a deleted post is a 404 rather than a blank
  // page — an unpublished article must not be reachable by guessing the URL.
  if (!post) notFound();

  const img = cover(post.cover_ref);
  const others = (await publishedPosts(lang)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="section">
      <div className="wrap post-wrap">
        {/* Was the literal word "Journal", which is the one label on an
            Arabic article that stayed English — directly above an Arabic
            headline, so it read as a bug rather than as a section name. */}
        <p className="eyebrow"><L href="/journal">{t('nav.journal')}</L></p>
        <h1 className="post-h1">{post.title}</h1>
        <p className="post-meta">
          <time dateTime={post.published_at ?? undefined}>{fmt(post.published_at, lang)}</time>
          {post.author && <> · {post.author}</>}
        </p>

        {img && (
          <figure className="post-img">
            <Image src={img} alt="" fill sizes="(max-width: 900px) 100vw, 860px" priority />
          </figure>
        )}

        <Prose body={post.body} className="prose post-body" />

        <div className="post-cta">
          <p>{t('jrn.likeThis')}</p>
          <L href="/quote" className="btn btn-primary">Request a quote</L>
        </div>

        {others.length > 0 && (
          <nav className="post-more">
            <h2>{t('jrn.more')}</h2>
            <ul>
              {others.map((o) => (
                <li key={o.id}><L href={`/journal/${o.slug}`}>{o.title}</L></li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type': 'Organization', name: site.legalName },
          publisher: { '@type': 'Organization', name: site.legalName },
        }) }} />

      <style>{`
        .post-wrap { max-width: 860px; }
        .post-h1 { margin-bottom: .3em; }
        .post-meta {
          font-size: .8rem; letter-spacing: .1em; text-transform: uppercase;
          color: var(--brass-700); margin-bottom: 36px;
        }
        .post-img {
          position: relative; aspect-ratio: 16 / 9; margin: 0 0 44px;
          overflow: hidden; border-radius: 3px; background: var(--bg-warm);
        }
        .post-img img { object-fit: cover; }
        .post-body { font-size: 1.04rem; line-height: 1.75; }
        .post-body h2 { margin: 1.9em 0 .5em; }
        .post-body h3 { margin: 1.5em 0 .4em; font-size: 1.1rem; }
        .post-body p, .post-body ul, .post-body ol { margin: 0 0 1.15em; color: var(--fg-soft); }
        .post-body ul, .post-body ol { padding-inline-start: 1.3em; }
        .post-body li { margin-bottom: .4em; }
        .post-body blockquote {
          margin: 1.6em 0; padding-inline-start: 1.2em;
          border-inline-start: 2px solid var(--brass-300);
          font-family: var(--font-display); font-size: 1.1rem; color: var(--fg);
        }
        .post-body a { color: var(--brass-700); }
        .post-cta {
          margin: 52px 0; padding: 30px; background: var(--bg-warm);
          border: 1px solid var(--line); border-radius: 3px;
          display: flex; flex-wrap: wrap; gap: 18px;
          align-items: center; justify-content: space-between;
        }
        .post-cta p { margin: 0; font-family: var(--font-display); font-size: 1.1rem; }
        .post-more { border-top: 1px solid var(--line); padding-top: 28px; }
        .post-more h2 { font-size: 1rem; letter-spacing: .04em; margin-bottom: 14px; }
        .post-more ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .post-more a { color: var(--fg); }
        .post-more a:hover { color: var(--brass-700); }
      `}</style>
    </article>
  );
}
