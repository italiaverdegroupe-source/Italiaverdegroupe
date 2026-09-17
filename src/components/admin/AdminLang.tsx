import { LOCALES, LOCALE_NAMES, DEFAULT_LOCALE, isLocale } from '@/lib/i18n';
import { setConsoleLocale } from '@/app/(console)/admin/locale-action';

/**
 * The console's language control.
 *
 * A row of three buttons rather than a dropdown. There are three languages and
 * this sits in a sidebar that is already a list of links — a dropdown would be
 * two clicks and a widget to build, where this is one click and a form.
 *
 * It is a server action with no JavaScript behind it, so it works before
 * hydration and on a phone with a bad connection, which is where an operations
 * tool is most often used.
 */
export default function AdminLang({ current }: { current?: string | null }) {
  const active = isLocale(current) ? current : DEFAULT_LOCALE;
  return (
    <form action={setConsoleLocale} className="adm-lang">
      {LOCALES.map((l) => (
        <button key={l} type="submit" name="locale" value={l}
                className="adm-lang-b" data-on={l === active}
                aria-current={l === active ? 'true' : undefined}
                lang={l} title={LOCALE_NAMES[l]}>
          {l === 'ar' ? 'ع' : l.toUpperCase()}
        </button>
      ))}
    </form>
  );
}
