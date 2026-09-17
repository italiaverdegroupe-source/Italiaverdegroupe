import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import Image from 'next/image';
import { getBlocks, publishedPosts, getSeo } from '@/lib/content';
import { ogImage } from '@/lib/site';
import { imageFor } from '@/lib/products';
import { getSettings } from '@/lib/settings';

// Served from the database, so it revalidates on a timer and immediately when
// a post is published. Rendering it statically at build time would mean a
// deploy for every article, which is exactly what the console exists to avoid.
export const revalidate = 300;

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const [c, seo, site] = await Promise.all([getBlocks(), getSeo('/journal'), getSettings()]);
  return {
    title: seo?.title ?? c['journal.title'],
    description: seo?.description ?? c['journal.intro'],
    alternates: alternates(lang, '/journal'),
    robots: seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: seo?.title ?? `${c['journal.title']} — ${site.legalName}`,
      images: [ogImage],
    },
  };
}

const cover = (ref: string | null) => {
  if (!ref) return null;
  try { return imageFor(ref); } catch { return null; }   // a renamed photo must not 500 the page
};

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default async function JournalPage() {
  const [c, posts] = await Promise.all([getBlocks(), publishedPosts()]);

  return (
    <section className="section">
      <div className="wrap">
        <header className="jr-head">
          <p className="eyebrow">Journal</p>
          <h1>{c['journal.title']}</h1>
          <p className="lede">{c['journal.intro']}</p>
        </header>

        {posts.length === 0 ? (
          <p className="jr-empty">
            Nothing published yet. Articles appear here as they are written.
          </p>
        ) : (
          <div className="jr-grid">
            {posts.map((p) => {
              const img = cover(p.cover_ref);
              return (
                <article key={p.id} className="jr-card">
                  <L href={`/journal/${p.slug}`} className="jr-link">
                    {img && (
                      <span className="jr-img">
                        <Image src={img} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" />
                      </span>
                    )}
                    <span className="jr-body">
                      <time className="jr-date" dateTime={p.published_at ?? undefined}>
                        {fmt(p.published_at)}
                      </time>
                      <span className="jr-title">{p.title}</span>
                      {p.excerpt && <span className="jr-ex">{p.excerpt}</span>}
                    </span>
                  </L>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .jr-head { max-width: 58ch; margin-bottom: 52px; }
        .jr-head h1 { margin-bottom: .4em; }
        .jr-empty { color: var(--fg-soft); }
        .jr-grid {
          display: grid; gap: 30px;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
        }
        .jr-card { margin: 0; }
        .jr-link { display: grid; gap: 16px; text-decoration: none; color: inherit; }
        .jr-img {
          position: relative; display: block; aspect-ratio: 4 / 3;
          overflow: hidden; border-radius: 3px; background: var(--bg-warm);
        }
        .jr-img img { object-fit: cover; transition: transform .5s ease; }
        .jr-link:hover .jr-img img { transform: scale(1.04); }
        .jr-body { display: grid; gap: 8px; }
        .jr-date {
          font-size: .74rem; letter-spacing: .12em; text-transform: uppercase;
          color: var(--brass-700);
        }
        .jr-title { font-family: var(--font-display); font-size: 1.24rem; line-height: 1.3; }
        .jr-link:hover .jr-title { color: var(--brass-700); }
        .jr-ex { color: var(--fg-soft); font-size: .93rem; line-height: 1.6; }
      `}</style>
    </section>
  );
}
