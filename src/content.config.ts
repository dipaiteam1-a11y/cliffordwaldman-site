/**
 * Content collections: the "shape" of every song, chapter, essay, post and workshop.
 * If a content file is missing a required field, `npm run build` stops and says which.
 */
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const md = (base: string) => glob({ pattern: '**/[^_]*.{md,mdx}', base: `./src/content/${base}` });

/** Optional artwork: a path under /public (e.g. "/images/songs/my-song.jpg") plus alt text. */
const artwork = z
  .object({
    src: z.string(),
    alt: z.string(),
  })
  .optional();

/* ------------------------------------------------------------------ Songs */

const songs = defineCollection({
  loader: md('songs'),
  schema: z.object({
    title: z.string(),
    /** Which body of work this song belongs to. */
    collection: z.enum(['lollipop-cruise', 'book-of-songs', 'single']).default('single'),
    /** One or two sentences for song lists. */
    summary: z.string(),
    /**
     * Where the audio comes from:
     *  - { type: file, src: /audio/my-song.mp3 }    self-hosted in /public/audio
     *  - { type: soundcloud, url: https://soundcloud.com/… }  a SoundCloud track URL
     */
    audio: z
      .object({
        type: z.enum(['file', 'soundcloud']),
        src: z.string().optional(),
        url: z.string().optional(),
      })
      .refine((a) => (a.type === 'file' ? !!a.src : /^https?:\/\//.test(a.url ?? '')), {
        message: 'Audio: upload a file (type "file") or paste a SoundCloud link (type "soundcloud").',
      }),
    /** Optional YouTube video ID or URL for the song. */
    youtube: z.string().optional(),
    artwork,
    credits: z
      .array(z.object({ role: z.string(), name: z.string() }))
      .default([]),
    year: z.union([z.number(), z.string()]).optional(),
    /**
     * Lyrics. Paste LRC format ("[01:23.45] a line") for synced lyrics,
     * or plain lines for lyrics without timing.
     */
    lyrics: z.string(),
    /** Sort order in lists (lower comes first). */
    order: z.number().default(100),
    draft: z.boolean().default(false),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

/* -------------------------------------------------------- Lollipop Cruise */

const chapters = defineCollection({
  loader: md('lollipop/chapters'),
  schema: z.object({
    title: z.string(),
    part: z.number().default(1),
    partTitle: z.string().optional(),
    order: z.number(),
    summary: z.string(),
    status: z.enum(['published', 'in-progress', 'future']).default('published'),
    songs: z.array(reference('songs')).default([]),
    characters: z.array(reference('characters')).default([]),
    artwork,
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

const characters = defineCollection({
  loader: md('lollipop/characters'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    summary: z.string(),
    songs: z.array(reference('songs')).default([]),
    artwork,
    order: z.number().default(100),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

const stories = defineCollection({
  loader: md('lollipop/stories'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Link a story to the song it grew from, and/or a chapter. */
    song: reference('songs').optional(),
    chapter: reference('chapters').optional(),
    date: z.coerce.date().optional(),
    artwork,
    order: z.number().default(100),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

/* ---------------------------------------------------------------- Writing */

const writing = defineCollection({
  loader: md('writing'),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['essay', 'book', 'literary', 'book-of-songs', 'future']),
    status: z.enum(['published', 'in-development', 'planned']).default('published'),
    summary: z.string(),
    date: z.coerce.date().optional(),
    artwork,
    draft: z.boolean().default(false),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

/* ----------------------------------------------------------- Spirituality */

const spirituality = defineCollection({
  loader: md('spirituality'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['torah', 'faith', 'growth', 'human-development', 'ideas']),
    /** e.g. the weekly Torah portion, "Parashat Bereshit" */
    portion: z.string().optional(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

/* -------------------------------------------------------------- Workshops */

const workshops = defineCollection({
  loader: md('workshops'),
  schema: z.object({
    title: z.string(),
    type: z.enum(['workshop', 'lecture', 'program', 'recording']),
    status: z.enum(['upcoming', 'ongoing', 'past', 'on-request']).default('on-request'),
    summary: z.string(),
    /** Start date/time, e.g. 2026-11-12T19:00 */
    date: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    format: z.enum(['in-person', 'online', 'hybrid']).optional(),
    price: z.string().optional(),
    registrationUrl: z.string().optional(),
    /** YouTube ID or URL of a recording. */
    recording: z.string().optional(),
    topics: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

/* ----------------------------------------------------------------- Videos */

const videos = defineCollection({
  loader: file('./src/content/videos.json', { parser: (text) => JSON.parse(text).videos }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    category: z.enum(['music-video', 'interview', 'lecture', 'visual-story']),
    /** YouTube video ID (the part after v=) or full URL. Leave empty until ready. */
    youtube: z.string().default(''),
    description: z.string(),
    date: z.coerce.date().optional(),
    song: reference('songs').optional(),
    /** Example content shipped with the site; hidden on the public build. */
    sample: z.boolean().default(false),
  }),
});

/* ---------------------------------------------------- Long-form page copy */

const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
  }),
});

export const collections = { songs, chapters, characters, stories, writing, spirituality, workshops, videos, pages };
