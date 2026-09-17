import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getAllProducts } from '@/lib/products';
import {
  BLOCKS, getBlocks, blocksByLocale, listSeo, allFaqs, allTestimonials, allPosts, type BlockKey,
} from '@/lib/content';
import { saveBlocks, saveSeo, saveFaq, saveTestimonial, savePost } from './actions';
import { adminUi } from '@/lib/admin-ui';
import {
  LOCALES, LOCALE_NAMES, DEFAULT_LOCALE, isLocale, localePath, type Locale,
} from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const TABS = [
  ['copy', 'Site copy'],
  ['seo', 'Search'],
  ['faq', 'Questions'],
  ['voices', 'Testimonials'],
  ['journal', 'Journal'],
] as const;

const SEO_PATHS = ['/', '/catalog', '/collections', '/services', '/about', '/quote', '/journal'];
const FAQ_CATEGORIES = ['general', 'buying', 'delivery', 'planting', 'care', 'import', 'payment'];

export default async function ContentPage({ searchParams }: {
  searchParams: Promise<{ tab?: string; loc?: string; edit?: string; error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);

  const { tab, loc, edit, error } = await searchParams;
  const view = TABS.some(([k]) => k === tab) ? tab! : 'copy';
  const readOnly = user.role === 'viewer';

  // Which language's copy is on screen. English by default, because it is
  // the one that has to be right before any translation of it can be.
  const lang: Locale = isLocale(loc) ? loc : DEFAULT_LOCALE;

  const [blocks, stored, seo, faqs, voices, posts] = await Promise.all([
    // What the public site would actually render in this language, fallbacks
    // and all — so the boxes show what a visitor sees, not a blank.
    getBlocks(lang), blocksByLocale(), listSeo(), allFaqs(), allTestimonials(), allPosts(),
  ]);
  const englishOf = (k: string) => stored[k]?.[DEFAULT_LOCALE] ?? BLOCKS[k as BlockKey].fallback;
  const translated = (Object.keys(BLOCKS) as BlockKey[])
    .filter((k) => (stored[k]?.[lang] ?? '').trim() !== '').length;
  const products = getAllProducts();
  const editing = edit ? posts.find((p) => p.id === edit) : undefined;

  const groups = [...new Set((Object.keys(BLOCKS) as BlockKey[]).map((k) => BLOCKS[k].group))];

  return (
    <>
      <h1>{t("Content")}</h1>
      <p className="adm-sub">
        {t("The words on the public site, and what a search engine is told about each page. Everything here has a compiled default — clear a box and the original text comes back, so nothing typed here can leave a page blank.")}
      </p>

      {readOnly && <p className="adm-err">{t("You can see this, but you cannot change it.")}</p>}

      {/* A refused save says why, here, instead of becoming a blank error page. */}
      {error && <p className="adm-err">{error}</p>}

      <div className="adm-filters" style={{ marginBottom: 20 }}>
        {TABS.map(([k, label]) => (
          <Link key={k} className="adm-chip" data-on={view === k}
                href={`/admin/content?tab=${k}`}>{label}</Link>
        ))}
        <Link className="adm-chip" href="/journal" target="_blank"
              style={{ marginInlineStart: 'auto' }}>{t("View the site →")}</Link>
      </div>

      {/* ── site copy ─────────────────────────────────────── */}
      {view === 'copy' && (
        <>
          {/* One language at a time. A single form with three boxes per field
              would be three times the page and would make it easy to save a
              translation into the wrong one; a tab is unambiguous, and the
              hidden field below is what the action actually trusts. */}
          <div className="adm-filters adm-langs">
            {LOCALES.map((l) => {
              const done = (Object.keys(BLOCKS) as BlockKey[])
                .filter((k) => (stored[k]?.[l] ?? '').trim() !== '').length;
              const total = Object.keys(BLOCKS).length;
              return (
                <Link key={l} className="adm-chip" data-on={lang === l}
                      href={`/admin/content?tab=copy&loc=${l}`}>
                  {LOCALE_NAMES[l]}
                  {l !== DEFAULT_LOCALE && (
                    <span className="adm-langs-n">{done}/{total}</span>
                  )}
                </Link>
              );
            })}
            <Link className="adm-chip" href={localePath(lang, '/')} target="_blank"
                  style={{ marginInlineStart: 'auto' }}>
              {t("View this language →")}
            </Link>
          </div>

          {lang !== DEFAULT_LOCALE && (
            <p className="adm-sub">
              {translated === 0
                ? <>Nothing is translated into <strong>{LOCALE_NAMES[lang]}</strong> yet. Every box below shows the English it currently falls back to — the site is already serving that, so a half-finished translation is not a half-finished page.</>
                : <><strong>{translated}</strong> of {Object.keys(BLOCKS).length} blocks are written in {LOCALE_NAMES[lang]}. The rest fall back to English on the live site. Emptying a box removes the translation and returns that block to English.</>}
            </p>
          )}

        <form action={saveBlocks}>
          <input type="hidden" name="locale" value={lang} />
          {groups.map((group) => (
            <div key={group} className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
              <h2>{group}</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                {(Object.keys(BLOCKS) as BlockKey[]).filter((k) => BLOCKS[k].group === group).map((k) => {
                  const def = BLOCKS[k];
                  const own = (stored[k]?.[lang] ?? '').trim();
                  // English shows what the site renders; a translation tab
                  // shows only what has actually been translated, so an empty
                  // box reads as "not done" rather than as English that was
                  // typed in and will now stop following the English.
                  const current = lang === DEFAULT_LOCALE ? blocks[k] : own;
                  const isDefault = lang === DEFAULT_LOCALE
                    ? current === def.fallback : own === '';
                  const rtl = lang === 'ar';
                  return (
                    <label key={k} className="adm-field">
                      <span>
                        {def.label}
                        {lang === DEFAULT_LOCALE && !isDefault && (
                          <span className="pill pill-quoted" style={{ marginInlineStart: 8 }}>edited</span>
                        )}
                        {lang !== DEFAULT_LOCALE && (
                          <span className={`pill ${own ? 'pill-qualified' : 'pill-quoted'}`}
                                style={{ marginInlineStart: 8 }}>
                            {own ? 'translated' : 'English'}
                          </span>
                        )}
                      </span>
                      {def.kind === 'text'
                        ? <textarea name={k} rows={3} defaultValue={current} disabled={readOnly}
                                    dir={rtl ? 'rtl' : undefined} lang={lang} />
                        : <input name={k} defaultValue={current} disabled={readOnly}
                                 dir={rtl ? 'rtl' : undefined} lang={lang} />}
                      {/* The source text, to translate FROM. Without it the
                          translator is working from memory of another tab. */}
                      {lang !== DEFAULT_LOCALE && (
                        <span className="adm-src" lang="en" dir="ltr">{englishOf(k)}</span>
                      )}
                      <span className="adm-sub" style={{ margin: 0, fontSize: 12 }}>{def.where}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {!readOnly && <button type="submit" className="adm-btn adm-save-copy">
              {t("Save")} {LOCALE_NAMES[lang]}
            </button>}
          <p className="adm-sub" style={{ fontSize: 12 }}>
            {t("Saving publishes straight to the live site. Clearing a box restores the text the site ships with rather than leaving it empty. A page already being viewed may need one refresh to show the change — pages are cached and rebuilt behind the first request after a save.")}
          </p>
        </form>
        </>
      )}

      {/* ── search ────────────────────────────────────────── */}
      {view === 'seo' && (
        <>
          <p className="adm-sub">
            {t("These override what each page already generates. Leave a box empty and the built-in title or description is used — which for the 68 catalogue pages is already written from the specimen itself, so emptying a box is safe and blanking one is not possible.")}
          </p>
          {SEO_PATHS.map((path) => {
            const row = seo.find((r) => r.path === path);
            return (
              <form key={path} action={saveSeo} className="adm-panel adm-pad" style={{ marginBottom: 14 }}>
                <input type="hidden" name="path" value={path} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <h2 style={{ margin: 0 }}>{path === '/' ? 'Homepage' : path}</h2>
                  {row && <span className="pill pill-quoted">overridden</span>}
                  {row?.noindex && <span className="pill pill-lost">hidden from search</span>}
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <label className="adm-field">
                    <span>{t("Title — aim for 50–60 characters")}</span>
                    <input name="title" defaultValue={row?.title ?? ''} maxLength={120} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Description — aim for 140–160 characters")}</span>
                    <textarea name="description" rows={2} defaultValue={row?.description ?? ''}
                              maxLength={320} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Sharing image — a catalogue reference")}</span>
                    <select name="og_ref" defaultValue={row?.og_ref ?? ''} disabled={readOnly}>
                      <option value="">{t("Default")}</option>
                      {products.map((p) => (
                        <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" name="noindex" defaultChecked={row?.noindex ?? false}
                           style={{ width: 16, height: 16 }} disabled={readOnly} />
                    <span>{t("Keep this page out of search results")}</span>
                  </label>
                </div>
                {!readOnly && <button type="submit" className="adm-btn adm-save-seo">{t("Save")}</button>}
              </form>
            );
          })}
        </>
      )}

      {/* ── questions ─────────────────────────────────────── */}
      {view === 'faq' && (
        <>
          <p className="adm-sub">
            {t("Published questions appear on the homepage and are published as structured data, so they can answer the question inside a search result rather than only on the page.")}
          </p>

          {[...faqs, null].map((f, i) => (
            <form key={f?.id ?? 'new'} action={saveFaq} className="adm-panel adm-pad"
                  style={{ marginBottom: 14, opacity: f && !f.is_published ? 0.72 : 1 }}>
              {f && <input type="hidden" name="id" value={f.id} />}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <h2 style={{ margin: 0 }}>{f ? `Question ${i + 1}` : 'Add a question'}</h2>
                {f && <span className={`pill ${f.is_published ? 'pill-won' : 'pill-new'}`}>
                  {f.is_published ? 'live' : 'draft'}</span>}
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="adm-field">
                  <span>{t("Question")}</span>
                  <input name="question" defaultValue={f?.question ?? ''} disabled={readOnly} />
                </label>
                <label className="adm-field">
                  <span>{t("Answer")}</span>
                  <textarea name="answer" rows={3} defaultValue={f?.answer ?? ''} disabled={readOnly} />
                </label>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
                  <label className="adm-field">
                    <span>{t("Topic")}</span>
                    <select name="category" defaultValue={f?.category ?? 'general'} disabled={readOnly}>
                      {FAQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>{t("Order")}</span>
                    <input name="sort_order" type="number" defaultValue={f?.sort_order ?? 100} disabled={readOnly} />
                  </label>
                  <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" name="is_published" defaultChecked={f?.is_published ?? false}
                           style={{ width: 16, height: 16 }} disabled={readOnly} />
                    <span>{t("Live on the site")}</span>
                  </label>
                </div>
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="adm-btn adm-save-faq">{f ? 'Save' : 'Add'}</button>
                  {f && (
                    <button type="submit" name="_delete" value="1" className="adm-btn-sec adm-del-faq">
                      {t("Delete")}
                    </button>
                  )}
                </div>
              )}
            </form>
          ))}
        </>
      )}

      {/* ── testimonials ──────────────────────────────────── */}
      {view === 'voices' && (
        <>
          <p className="adm-err" style={{ background: 'transparent', border: '1px solid var(--rule, #E4DFD2)' }}>
            {t("A testimonial cannot be published without the date the client agreed to be quoted. Publishing praise nobody consented to is a legal and reputational risk, and an anonymous testimonial reads as an invented one. Record the real conversation.")}
          </p>

          {[...voices, null].map((v) => (
            <form key={v?.id ?? 'new'} action={saveTestimonial} className="adm-panel adm-pad"
                  style={{ marginBottom: 14, opacity: v && !v.is_published ? 0.72 : 1 }}>
              {v && <input type="hidden" name="id" value={v.id} />}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <h2 style={{ margin: 0 }}>{v ? v.author_name : 'Add a testimonial'}</h2>
                {v && <span className={`pill ${v.is_published ? 'pill-won' : 'pill-new'}`}>
                  {v.is_published ? 'live' : 'draft'}</span>}
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="adm-field">
                  <span>{t("What they said")}</span>
                  <textarea name="body" rows={3} defaultValue={v?.body ?? ''} disabled={readOnly} />
                </label>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
                  <label className="adm-field">
                    <span>{t("Name")}</span>
                    <input name="author_name" defaultValue={v?.author_name ?? ''} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Role")}</span>
                    <input name="author_role" defaultValue={v?.author_role ?? ''} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Company")}</span>
                    <input name="company" defaultValue={v?.company ?? ''} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Emirate")}</span>
                    <input name="emirate" defaultValue={v?.emirate ?? ''} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Project")}</span>
                    <input name="project" defaultValue={v?.project ?? ''} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Consent given on")}</span>
                    <input name="consent_on" type="date" defaultValue={v?.consent_on ?? ''} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("How consent was given")}</span>
                    <input name="consent_note" defaultValue={v?.consent_note ?? ''}
                           placeholder={t("email of 12 March, site meeting…")} disabled={readOnly} />
                  </label>
                  <label className="adm-field">
                    <span>{t("Order")}</span>
                    <input name="sort_order" type="number" defaultValue={v?.sort_order ?? 100} disabled={readOnly} />
                  </label>
                  <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" name="is_published" defaultChecked={v?.is_published ?? false}
                           style={{ width: 16, height: 16 }} disabled={readOnly} />
                    <span>{t("Live on the site")}</span>
                  </label>
                </div>
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="adm-btn adm-save-voice">{v ? 'Save' : 'Add'}</button>
                  {v && (
                    <button type="submit" name="_delete" value="1" className="adm-btn-sec adm-del-voice">
                      {t("Delete")}
                    </button>
                  )}
                </div>
              )}
            </form>
          ))}
        </>
      )}

      {/* ── journal ───────────────────────────────────────── */}
      {view === 'journal' && (
        <>
          <p className="adm-sub">
            Articles are the part of the site that reaches people who have not heard of the company — someone searching whether an olive survives a Gulf summer. Formatting: <code>## heading</code>,{' '}
            <code>- bullet</code>, <code>**bold**</code>, <code>[text](link)</code>. Anything else appears as typed.
          </p>

          <div className="adm-panel" style={{ marginBottom: 18 }}>
            <table className="adm-t">
              <thead><tr><th>{t("Title")}</th><th>{t("Address")}</th><th>{t("State")}</th><th>{t("Date")}</th><th /></tr></thead>
              <tbody>
                {posts.length === 0 && (
                  <tr><td colSpan={5}><span className="adm-empty">{t("No articles yet.")}</span></td></tr>
                )}
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.title}</b></td>
                    <td><code style={{ fontSize: 12 }}>{t("/journal/")}{p.slug}</code></td>
                    <td>
                      <span className={`pill ${p.status === 'published' ? 'pill-won' : 'pill-new'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.published_at?.slice(0, 10) ?? '—'}</td>
                    <td className="num">
                      <Link className="adm-chip" href={`/admin/content?tab=journal&edit=${p.id}`}>{t("Edit")}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={savePost} className="adm-panel adm-pad">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h2 style={{ margin: 0 }}>{editing ? 'Edit article' : 'New article'}</h2>
              {editing && <Link className="adm-chip" href="/admin/content?tab=journal">{t("Start a new one instead")}</Link>}
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <label className="adm-field">
                <span>{t("Title")}</span>
                <input name="title" defaultValue={editing?.title ?? ''} disabled={readOnly} />
              </label>
              <label className="adm-field">
                <span>{t("Address — leave empty and it is made from the title")}</span>
                <input name="slug" defaultValue={editing?.slug ?? ''} placeholder={t("olive-trees-gulf-summer")}
                       disabled={readOnly} />
              </label>
              <label className="adm-field">
                <span>{t("Summary — shown in the list and to search engines")}</span>
                <textarea name="excerpt" rows={2} defaultValue={editing?.excerpt ?? ''} disabled={readOnly} />
              </label>
              <label className="adm-field">
                <span>{t("Body")}</span>
                <textarea name="body" rows={16} defaultValue={editing?.body ?? ''}
                          style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                          disabled={readOnly} />
              </label>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                <label className="adm-field">
                  <span>{t("Cover photograph")}</span>
                  <select name="cover_ref" defaultValue={editing?.cover_ref ?? ''} disabled={readOnly}>
                    <option value="">{t("None")}</option>
                    {products.map((p) => (
                      <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  <span>{t("Author")}</span>
                  <input name="author" defaultValue={editing?.author ?? ''} disabled={readOnly} />
                </label>
                <label className="adm-field">
                  <span>{t("State")}</span>
                  <select name="status" defaultValue={editing?.status ?? 'draft'} disabled={readOnly}>
                    <option value="draft">{t("Draft")}</option>
                    <option value="published">{t("Published")}</option>
                  </select>
                </label>
                <label className="adm-field">
                  <span>{t("Publish date")}</span>
                  <input name="published_at" type="date"
                         defaultValue={editing?.published_at?.slice(0, 10) ?? ''} disabled={readOnly} />
                </label>
                <label className="adm-field">
                  <span>{t("Search title — optional")}</span>
                  <input name="seo_title" defaultValue={editing?.seo_title ?? ''} disabled={readOnly} />
                </label>
                <label className="adm-field">
                  <span>{t("Search description — optional")}</span>
                  <input name="seo_description" defaultValue={editing?.seo_description ?? ''} disabled={readOnly} />
                </label>
              </div>
            </div>
            {!readOnly && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="adm-btn adm-save-post">
                  {editing ? 'Save article' : 'Create article'}
                </button>
                {editing && (
                  <button type="submit" name="_delete" value="1" className="adm-btn-sec adm-del-post">
                    {t("Delete")}
                  </button>
                )}
              </div>
            )}
          </form>
        </>
      )}
    </>
  );
}
