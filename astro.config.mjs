// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { loadEnv } from 'vite';
import { rehypePlaceholders } from './src/lib/rehype-placeholders.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
// See src/lib/visibility.ts: placeholders are hidden unless this is set to true.
const showPlaceholders = (env.PUBLIC_SHOW_PLACEHOLDERS ?? process.env.PUBLIC_SHOW_PLACEHOLDERS) === 'true';

// https://astro.build/config
export default defineConfig({
  site: 'https://cliffordwaldman.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    // Any "[Clifford's … here]" / "[Placeholder …]" / "[TODO …]" text in Markdown is
    // highlighted when PUBLIC_SHOW_PLACEHOLDERS=true, and quietly removed otherwise.
    processor: unified({ rehypePlugins: [[rehypePlaceholders, { hide: !showPlaceholders }]] }),
  },
});
