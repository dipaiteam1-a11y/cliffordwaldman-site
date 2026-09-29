// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypePlaceholders } from './src/lib/rehype-placeholders.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://cliffordwaldman.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    // Any "[Clifford's … here]" / "[Placeholder …]" / "[TODO …]" text in Markdown
    // is automatically highlighted so unfinished spots are easy to see.
    processor: unified({ rehypePlugins: [rehypePlaceholders] }),
  },
});
