/**
 * The Gathering Place community: configuration and data model.
 *
 * Today the community page is a "coming soon" page with a mailing-list sign-up.
 * This module is the seam where a real forum plugs in later:
 *
 *  1. Choose a forum backend (e.g. Discourse, Circle, GitHub Discussions via
 *     Giscus, or a custom API) and implement `CommunityProvider` below.
 *  2. Flip `community.enabled` to true.
 *  3. Add routes under src/pages/community/ (e.g. [space]/index.astro and
 *     [space]/[thread].astro). The /community/* URL space is reserved for this.
 *     If the forum needs live data, add an adapter (@astrojs/netlify or
 *     @astrojs/vercel) and mark those routes `export const prerender = false`.
 */

export type Space = {
  slug: string;
  title: string;
  description: string;
  /** Which kind of conversation lives here. */
  kind: 'discussion' | 'forum' | 'qa' | 'learning' | 'contributors';
};

export type Member = { id: string; name: string; avatar?: string; role?: 'host' | 'contributor' | 'member' };

export type Thread = {
  id: string;
  space: string;
  title: string;
  author: Member;
  createdAt: Date;
  replyCount: number;
  excerpt?: string;
};

export type Post = { id: string; thread: string; author: Member; createdAt: Date; body: string };

/** Implement this to connect a forum backend. */
export interface CommunityProvider {
  listThreads(space: string, opts?: { limit?: number; cursor?: string }): Promise<Thread[]>;
  getThread(id: string): Promise<{ thread: Thread; posts: Post[] } | null>;
}

export const community = {
  enabled: false,
  /** Planned spaces. Shown as "what's coming" now; become real forum spaces later. */
  spaces: [
    {
      slug: 'discussions',
      kind: 'discussion',
      title: 'Discussions',
      description: 'Open conversations about the songs, essays, Torah thoughts and ideas shared here.',
    },
    {
      slug: 'forums',
      kind: 'forum',
      title: 'Forums',
      description: 'Topic rooms for music and creativity, psychology and growth, faith and learning.',
    },
    {
      slug: 'questions',
      kind: 'qa',
      title: 'Q&A',
      description: 'Ask Clifford and the community questions, and find answers that help others too.',
    },
    {
      slug: 'learning',
      kind: 'learning',
      title: 'Shared learning',
      description: 'Study together: reading circles, recorded lectures, and notes shared between members.',
    },
    {
      slug: 'contributors',
      kind: 'contributors',
      title: 'Contributors',
      description: 'Guest voices, artists and thinkers who add their own work and wisdom to the Gathering Place.',
    },
  ] satisfies Space[],
};
