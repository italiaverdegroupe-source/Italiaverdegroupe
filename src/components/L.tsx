'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { localePath } from '@/lib/i18n';
import { useLocale } from './LocaleProvider';

/**
 * A link that knows what language the page is in.
 *
 * Every internal href in this codebase is written unprefixed — `/catalog`,
 * `/collections/olive-trees` — because that is what it is called. This adds
 * the locale prefix when there is one to add. Written the other way round,
 * with the prefix at each of the sixty-odd call sites, the site would work
 * until somebody added the sixty-first link and forgot, and the symptom would
 * be an Arabic reader silently dropped back into English mid-journey.
 *
 * Anything that is not an internal path — a mailto:, a tel:, an https:// to
 * somewhere else, a bare #anchor — is passed through untouched by
 * localePath(), because a language prefix on a telephone number is not a
 * telephone number.
 */
export default function L({ href, ...rest }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  return <Link href={typeof href === 'string' ? localePath(locale, href) : href} {...rest} />;
}
