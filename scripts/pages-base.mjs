// Prefixes root-relative links in the built site so it works from a sub-folder, e.g.
// https://dipaiteam1-a11y.github.io/cliffordwaldman-site/ (GitHub Pages preview).
// Usage: node scripts/pages-base.mjs dist /cliffordwaldman-site
// Not needed on the real domain, where the site lives at "/".
import fs from "node:fs";
import path from "node:path";

const [root = "dist", rawBase = ""] = process.argv.slice(2);
const base = rawBase.replace(/\/$/, "");
if (!base) process.exit(0);

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );

const prefix = (url) =>
  url.startsWith("/") && !url.startsWith("//") ? base + url : url;
let files = 0;
for (const file of walk(root)) {
  if (!/\.(html|css)$/.test(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = before
    .replace(
      /\b(href|src|action)="(\/[^"]*)"/g,
      (_, attr, url) => `${attr}="${prefix(url)}"`,
    )
    .replace(
      /\bsrcset="([^"]*)"/g,
      (_, list) =>
        `srcset="${list
          .split(",")
          .map((part) => part.trim().replace(/^\S+/, prefix))
          .join(", ")}"`,
    )
    .replace(/url\((\/[^)]*)\)/g, (_, url) => `url(${prefix(url)})`);
  if (after !== before) {
    fs.writeFileSync(file, after);
    files++;
  }
}
console.log(`Prefixed links with ${base} in ${files} files.`);
