import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../../config/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('spirituality', ({ data }) => !data.draft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: `Spirituality & Torah · ${site.name}`,
    description: 'Reflections, Torah thoughts and spiritual growth from Clifford Waldman.',
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: `/spirituality/${p.id}/`,
      categories: [p.data.category, ...p.data.tags],
    })),
  });
}
