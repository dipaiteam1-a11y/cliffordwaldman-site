/**
 * Rehype plugin: wraps placeholder text such as
 *   [Clifford's exact lyrics here]   [Placeholder: photo]   [TODO: add date]
 * in <mark class="placeholder"> so unfinished content is visible on the page.
 * The same pattern is used by `npm run placeholders` to list every one.
 */
export const PLACEHOLDER_RE = /\[(?:Clifford['’]s|Clifford |Placeholder|TODO)[^\[\]]*\]/g;

const SKIP = new Set(['code', 'pre', 'script', 'style', 'mark']);

function transform(node) {
  if (!node.children) return;
  const out = [];
  for (const child of node.children) {
    if (child.type === 'element' && SKIP.has(child.tagName)) {
      out.push(child);
      continue;
    }
    if (child.type === 'text') {
      const value = child.value;
      PLACEHOLDER_RE.lastIndex = 0;
      let last = 0;
      let m;
      let found = false;
      while ((m = PLACEHOLDER_RE.exec(value))) {
        found = true;
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
        out.push({
          type: 'element',
          tagName: 'mark',
          properties: { className: ['placeholder'] },
          children: [{ type: 'text', value: m[0] }],
        });
        last = m.index + m[0].length;
      }
      if (found) {
        if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
        continue;
      }
      out.push(child);
      continue;
    }
    transform(child);
    out.push(child);
  }
  node.children = out;
}

/* ---- Public build: drop placeholders, then tidy what they leave behind ---- */

const isBlank = (node) =>
  node.type === 'text'
    ? !node.value.trim()
    : node.type === 'element' && !['img', 'iframe', 'audio', 'video', 'br', 'hr', 'input'].includes(node.tagName)
      ? (node.children ?? []).every(isBlank)
      : node.type === 'comment';

const TIDY = new Set(['p', 'li', 'ul', 'ol', 'blockquote', 'figure', 'figcaption', 'em', 'strong', 'span', 'a', 'dd', 'dt', 'dl', 'div', 'td', 'tr']);

function strip(node) {
  if (!node.children) return;
  node.children = node.children
    .map((child) => {
      if (child.type === 'text') {
        PLACEHOLDER_RE.lastIndex = 0;
        return { ...child, value: child.value.replace(PLACEHOLDER_RE, '').replace(/ {2,}/g, ' ') };
      }
      if (child.type === 'element' && !SKIP.has(child.tagName)) strip(child);
      return child;
    })
    .filter((child) => !(child.type === 'element' && TIDY.has(child.tagName) && isBlank(child)));
}

const level = (n) => (n.type === 'element' && /^h[1-6]$/.test(n.tagName) ? Number(n.tagName[1]) : 0);

/** Remove headings left with nothing under them (up to the next heading of the same or higher rank). */
function dropEmptySections(node) {
  const kids = node.children ?? [];
  const keep = kids.map(() => true);
  for (let i = kids.length - 1; i >= 0; i--) {
    const l = level(kids[i]);
    if (!l) continue;
    let hasContent = false;
    for (let j = i + 1; j < kids.length; j++) {
      const lj = level(kids[j]);
      if (lj && lj <= l) break;
      if (keep[j] && !isBlank(kids[j])) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) keep[i] = false;
  }
  node.children = kids.filter((_, i) => keep[i]);
}

/** @param {{ hide?: boolean }} [options] hide: remove placeholders instead of highlighting them */
export function rehypePlaceholders(options = {}) {
  return (tree) => {
    if (options.hide) {
      strip(tree);
      dropEmptySections(tree);
    } else transform(tree);
  };
}
