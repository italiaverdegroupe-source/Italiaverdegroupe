'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import { BLOCKS, slugify, type BlockKey } from '@/lib/content';

/**
 * Send a validation message back to the form.
 *
 * Throwing from a server action gives the visitor Next's generic failure page
 * in production — the message is stripped, deliberately, so an internal error
 * cannot leak. That is right for a crash and wrong for "you forgot the
 * consent date": the rule may as well not exist if the person never reads it.
 * A refusal is not an error, so it redirects back carrying the reason.
 */
function refuse(tab: string, message: string): never {
  redirect(`/admin/content?tab=${tab}&error=${encodeURIComponent(message)}`);
}

/**
 * Writing content is an owner-and-sales job, not a viewer's, and every write
 * revalidates the public pages it touches — otherwise a correction sits in
 * the database while the cached page keeps showing the mistake.
 */
async function editor() {
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot edit content.');
  return user;
}

const PUBLIC_PAGES = ['/', '/catalog', '/collections', '/services', '/about', '/quote', '/journal'];
const refreshPublic = () => { for (const p of PUBLIC_PAGES) revalidatePath(p); };

export async function saveBlocks(formData: FormData) {
  const user = await editor();
  const changed: string[] = [];

  for (const key of Object.keys(BLOCKS) as BlockKey[]) {
    if (!formData.has(key)) continue;
    const value = String(formData.get(key) ?? '');

    // An empty box means "use what ships in the code", so the row is removed
    // rather than stored blank. There is no state in which the copy is absent.
    if (value.trim() === '') {
      const gone = await query(`DELETE FROM content_blocks WHERE key = $1 RETURNING key`, [key]);
      if (gone.length) changed.push(`${key} (reset)`);
      continue;
    }
    if (value === BLOCKS[key].fallback) {
      await query(`DELETE FROM content_blocks WHERE key = $1`, [key]);
      continue;
    }
    const before = await query<{ value: string }>(
      `SELECT value FROM content_blocks WHERE key = $1`, [key]);
    if (before[0]?.value === value) continue;

    await query(
      `INSERT INTO content_blocks (key, value, updated_by) VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now(), updated_by = $3`,
      [key, value, user.id]);
    changed.push(key);
  }

  if (changed.length) {
    await audit({ user, action: 'content.updated', entity: 'content_block',
                  after: { changed } });
  }
  refreshPublic();
  revalidatePath('/admin/content');
}

export async function saveSeo(formData: FormData) {
  const user = await editor();
  const path = String(formData.get('path') ?? '').trim();
  if (!path.startsWith('/')) refuse('seo', 'A path must start with a slash.');

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const ogRef = String(formData.get('og_ref') ?? '').trim();
  const noindex = formData.get('noindex') === 'on';

  // Nothing set and indexing left on means there is no override to store.
  if (!title && !description && !ogRef && !noindex) {
    await query(`DELETE FROM page_seo WHERE path = $1`, [path]);
  } else {
    await query(
      `INSERT INTO page_seo (path, title, description, og_ref, noindex, updated_by)
       VALUES ($1, NULLIF($2,''), NULLIF($3,''), NULLIF($4,''), $5, $6)
       ON CONFLICT (path) DO UPDATE SET title = NULLIF($2,''), description = NULLIF($3,''),
             og_ref = NULLIF($4,''), noindex = $5, updated_at = now(), updated_by = $6`,
      [path, title, description, ogRef, noindex, user.id]);
  }

  await audit({ user, action: 'seo.updated', entity: 'page_seo', entityId: path,
                after: { title, description, noindex } });
  revalidatePath(path);
  revalidatePath('/admin/content');
}

export async function saveFaq(formData: FormData) {
  const user = await editor();
  const id = String(formData.get('id') ?? '').trim();
  const question = String(formData.get('question') ?? '').trim();
  const answer = String(formData.get('answer') ?? '').trim();

  if (String(formData.get('_delete') ?? '') === '1' && id) {
    await query(`DELETE FROM faqs WHERE id = $1`, [id]);
    await audit({ user, action: 'faq.deleted', entity: 'faq', entityId: id });
    refreshPublic();
    revalidatePath('/admin/content');
    return;
  }

  if (!question || !answer) refuse('faq', 'A question needs both a question and an answer.');

  const params = [question, answer, String(formData.get('category') ?? 'general'),
                  Number(formData.get('sort_order') ?? 100) || 100,
                  formData.get('is_published') === 'on', user.id];

  if (id) {
    await query(
      `UPDATE faqs SET question=$1, answer=$2, category=$3, sort_order=$4,
              is_published=$5, updated_by=$6, updated_at=now() WHERE id=$7`, [...params, id]);
  } else {
    await query(
      `INSERT INTO faqs (question, answer, category, sort_order, is_published, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6)`, params);
  }
  await audit({ user, action: id ? 'faq.updated' : 'faq.created', entity: 'faq', entityId: id || undefined,
                after: { question } });
  refreshPublic();
  revalidatePath('/admin/content');
}

export async function saveTestimonial(formData: FormData) {
  const user = await editor();
  const id = String(formData.get('id') ?? '').trim();

  if (String(formData.get('_delete') ?? '') === '1' && id) {
    await query(`DELETE FROM testimonials WHERE id = $1`, [id]);
    await audit({ user, action: 'testimonial.deleted', entity: 'testimonial', entityId: id });
    refreshPublic();
    revalidatePath('/admin/content');
    return;
  }

  const body = String(formData.get('body') ?? '').trim();
  const author = String(formData.get('author_name') ?? '').trim();
  const consent = String(formData.get('consent_on') ?? '').trim();
  const publish = formData.get('is_published') === 'on';

  if (!body || !author) {
    refuse('voices', 'A testimonial needs the words and the person who said them.');
  }

  // Refused in the console as well as in the schema. Publishing praise nobody
  // agreed to is a legal and reputational risk, and an anonymous testimonial
  // is indistinguishable from an invented one.
  if (publish && !consent) {
    refuse('voices',
      'Record the date this client agreed to be quoted before publishing. A testimonial without consent cannot go on the site.');
  }

  const params = [body, author,
    String(formData.get('author_role') ?? '').trim() || null,
    String(formData.get('company') ?? '').trim() || null,
    String(formData.get('emirate') ?? '').trim() || null,
    String(formData.get('project') ?? '').trim() || null,
    consent || null,
    String(formData.get('consent_note') ?? '').trim() || null,
    Number(formData.get('sort_order') ?? 100) || 100,
    publish, user.id];

  if (id) {
    await query(
      `UPDATE testimonials SET body=$1, author_name=$2, author_role=$3, company=$4,
              emirate=$5, project=$6, consent_on=$7, consent_note=$8, sort_order=$9,
              is_published=$10, updated_by=$11, updated_at=now() WHERE id=$12`, [...params, id]);
  } else {
    await query(
      `INSERT INTO testimonials (body, author_name, author_role, company, emirate, project,
              consent_on, consent_note, sort_order, is_published, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, params);
  }
  await audit({ user, action: id ? 'testimonial.updated' : 'testimonial.created',
                entity: 'testimonial', entityId: id || undefined, after: { author, published: publish } });
  refreshPublic();
  revalidatePath('/admin/content');
}

export async function savePost(formData: FormData) {
  const user = await editor();
  const id = String(formData.get('id') ?? '').trim();

  if (String(formData.get('_delete') ?? '') === '1' && id) {
    const gone = await query<{ slug: string }>(
      `DELETE FROM posts WHERE id = $1 RETURNING slug`, [id]);
    await audit({ user, action: 'post.deleted', entity: 'post', entityId: id });
    if (gone[0]) revalidatePath(`/journal/${gone[0].slug}`);
    revalidatePath('/journal');
    revalidatePath('/sitemap.xml');
    revalidatePath('/admin/content');
    return;
  }

  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  if (!title || !body) refuse('journal', 'An article needs a title and a body.');

  const slug = slugify(String(formData.get('slug') ?? '').trim() || title);
  const status = String(formData.get('status') ?? 'draft') === 'published' ? 'published' : 'draft';

  // A published article must be dated, or it cannot be ordered or shown. If
  // no date was given, it is published now rather than refused.
  const given = String(formData.get('published_at') ?? '').trim();
  const publishedAt = status === 'published' ? (given || new Date().toISOString()) : (given || null);

  const params = [slug, title,
    String(formData.get('excerpt') ?? '').trim() || null,
    body,
    String(formData.get('cover_ref') ?? '').trim() || null,
    String(formData.get('author') ?? '').trim() || null,
    status, publishedAt,
    String(formData.get('seo_title') ?? '').trim() || null,
    String(formData.get('seo_description') ?? '').trim() || null,
    user.id];

  try {
    if (id) {
      await query(
        `UPDATE posts SET slug=$1, title=$2, excerpt=$3, body=$4, cover_ref=$5, author=$6,
                status=$7, published_at=$8, seo_title=$9, seo_description=$10,
                updated_by=$11, updated_at=now() WHERE id=$12`, [...params, id]);
    } else {
      await query(
        `INSERT INTO posts (slug, title, excerpt, body, cover_ref, author, status,
                published_at, seo_title, seo_description, updated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, params);
    }
  } catch (err) {
    // The slug is the article's public address. Two articles cannot share one.
    if (/posts_slug_key/.test((err as Error).message)) {
      refuse('journal',
        `Another article already uses the address /journal/${slug}. Change the title or the address.`);
    }
    throw err;
  }

  await audit({ user, action: id ? 'post.updated' : 'post.created', entity: 'post',
                entityId: id || undefined, after: { slug, status } });
  revalidatePath('/journal');
  revalidatePath(`/journal/${slug}`);
  // The sitemap is generated too. Publishing an article that search engines
  // are never told about is half a publication.
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/content');
}
