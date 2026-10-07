/**
 * What the public sees.
 *
 * The site ships with example entries (sample songs, posts, workshops…) and
 * "[Clifford's …]" placeholders marking facts only Clifford can supply.
 * On the public build both are hidden, so nothing looks unfinished; set
 * PUBLIC_SHOW_PLACEHOLDERS=true (in .env) to see them while filling things in.
 */
export const showPlaceholders = import.meta.env.PUBLIC_SHOW_PLACEHOLDERS === 'true';

/** True when an entry should appear on the site. */
export const isPublic = (data: { draft?: boolean; sample?: boolean }) =>
  !data.draft && (showPlaceholders || !data.sample);

const PLACEHOLDER = /\[(?:Clifford['’]s|Clifford |Placeholder|TODO)[^[\]]*\]/g;

/** True when Markdown has real text once placeholders are taken out. */
export const hasContent = (markdown = '') =>
  markdown
    .replace(PLACEHOLDER, '')
    .split('\n')
    .some((line) => line.replace(/^[\s>*+\-\d.]+/, '').replace(/[*_`#]/g, '').trim());

/** Titles of the "## " sections in a Markdown body that will actually show (used for tables of contents). */
export function visibleSections(body = ''): Set<string> {
  const sections = new Map<string, string[]>();
  let current: string | null = null;
  for (const line of body.split('\n')) {
    const h = line.match(/^##\s+(.+)/);
    if (h) {
      current = h[1].trim();
      sections.set(current, []);
    } else if (current) sections.get(current)!.push(line);
  }
  return new Set([...sections].filter(([, lines]) => showPlaceholders || hasContent(lines.join('\n'))).map(([t]) => t));
}
