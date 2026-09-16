import Link from 'next/link';
import React from 'react';

/**
 * Renders a restricted markdown subset from the console into React elements.
 *
 * Deliberately NOT dangerouslySetInnerHTML with a sanitiser. Writing a
 * sanitiser is writing a security control, and getting one wrong turns every
 * admin password into a stored-XSS vector on the public site. Parsing to
 * elements makes that impossible by construction: there is no path from the
 * database to raw markup, because markup is never produced.
 *
 * Supported, because it is what a blog post actually needs: headings,
 * paragraphs, bullet and numbered lists, block quotes, bold, italic, and
 * links. Anything else is shown as the literal text that was typed, which is
 * honest — the editor sees exactly what the reader will see.
 */

/** http(s) and same-site links only. javascript:, data: and the rest are dropped. */
function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const u = new URL(href);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Inline formatting inside one line of text. */
function inline(text: string, keyBase: string): React.ReactNode[] {
  return text.split(TOKEN).filter(Boolean).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      // A link that is not safe keeps its text and loses its target, rather
      // than vanishing — the reader still gets the sentence.
      if (!href) return <span key={key}>{link[1]}</span>;
      return href.startsWith('/')
        ? <Link key={key} href={href}>{link[1]}</Link>
        : <a key={key} href={href} rel="noopener nofollow" target="_blank">{link[1]}</a>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export default function Prose({ body, className }: { body: string; className?: string }) {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (!para.length) return;
    out.push(<p key={`p${out.length}`}>{inline(para.join(' '), `p${out.length}`)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((t, i) => <li key={i}>{inline(t, `li${out.length}-${i}`)}</li>);
    out.push(list.ordered
      ? <ol key={`l${out.length}`}>{items}</ol>
      : <ul key={`l${out.length}`}>{items}</ul>);
    list = null;
  };
  const flush = () => { flushPara(); flushList(); };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === '') { flush(); continue; }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const Tag = heading[1].length === 2 ? 'h2' : 'h3';
      out.push(<Tag key={`h${out.length}`}>{inline(heading[2], `h${out.length}`)}</Tag>);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flush();
      out.push(<blockquote key={`q${out.length}`}>{inline(quote[1], `q${out.length}`)}</blockquote>);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushPara();
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushPara();
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(numbered[1]);
      continue;
    }

    flushList();
    para.push(line.trim());
  }
  flush();

  return <div className={className}>{out}</div>;
}
