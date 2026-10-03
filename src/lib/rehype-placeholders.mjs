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

export function rehypePlaceholders() {
  return (tree) => transform(tree);
}
