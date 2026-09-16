import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Prose from '@/components/Prose';
import { getPost, publishedPosts } from '@/lib/content';
import { imageFor } from '@/lib/products';
import { getSettings } from '@/lib/settings';

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

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found', robots: { index: false, follow: false } };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPost(slug), getSettings()]);
  // A draft, a future date, or a deleted post is a 404 rather than a blank
  // page — an unpublished article must not be reachable by guessing the URL.
  if (!post) notFound();

  const img = cover(post.cover_ref);
  const others = (await publishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="section">
      <div className="wrap post-wrap">
        <p className="eyebrow"><Link href="/journal">Journal</Link></p>
        <h1 className="post-h1">{post.title}</h1>
        <p className="post-meta">
          <time dateTime={post.published_at ?? undefined}>{fmt(post.published_at)}</time>
          {post.author && <> · {post.author}</>}
        </p>

        {img && (
          <figure className="post-img">
            <Image src={img} alt="" fill sizes="(max-width: 900px) 100vw, 860px" priority />
          </figure>
        )}

        <Prose body={post.body} className="prose post-body" />

        <div className="post-cta">
          <p>Looking for a specimen like this?</p>
          <Link href="/quote" className="btn btn-primary">Request a quote</Link>
        </div>

        {others.length > 0 && (
          <nav className="post-more">
            <h2>More from the journal</h2>
            <ul>
              {others.map((o) => (
                <li key={o.id}><Link href={`/journal/${o.slug}`}>{o.title}</Link></li>
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
          color: var(--brass-600); margin-bottom: 36px;
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
        .post-body a { color: var(--brass-600); }
        .post-cta {
          margin: 52px 0; padding: 30px; background: var(--bg-warm);
          border: 1px solid var(--rule); border-radius: 3px;
          display: flex; flex-wrap: wrap; gap: 18px;
          align-items: center; justify-content: space-between;
        }
        .post-cta p { margin: 0; font-family: var(--font-display); font-size: 1.1rem; }
        .post-more { border-top: 1px solid var(--rule); padding-top: 28px; }
        .post-more h2 { font-size: 1rem; letter-spacing: .04em; margin-bottom: 14px; }
        .post-more ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .post-more a { color: var(--fg); }
        .post-more a:hover { color: var(--brass-600); }
      `}</style>
    </article>
  );
}
