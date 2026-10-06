# The Gathering Place: cliffordwaldman.com

The central home for Clifford Waldman's music, writing, clinical psychology, spirituality,
workshops and community. X, SoundCloud and YouTube are the doors; this site is the house.

Built with [Astro](https://astro.build) (static, content-first) and TypeScript. All words, songs,
chapters, posts and workshops live in plain Markdown and JSON files, so new content can be
added without touching code.

---

## Contents

1. [Quick start](#quick-start)
2. [How the site is organised](#how-the-site-is-organised)
3. [Adding a song with timed lyrics](#adding-a-song-with-timed-lyrics)
4. [Adding Lollipop Cruise chapters, characters and stories](#adding-lollipop-cruise-chapters-characters-and-stories)
5. [Adding writing, spirituality posts, workshops and videos](#adding-writing-spirituality-posts-workshops-and-videos)
6. [Editing page text](#editing-page-text)
7. [Forms (contact, mailing list, interest lists)](#forms)
8. [Deploying (Netlify or Vercel)](#deploying)
9. [Connecting cliffordwaldman.com](#connecting-the-domain-cliffordwaldmancom)
10. [Adding a forum to The Gathering Place later](#adding-a-forum-later)
11. [Accessibility and design notes](#accessibility-and-design-notes)
12. [Placeholders to fill in](#placeholders-to-fill-in)

---

## Quick start

You need [Node.js](https://nodejs.org) 22.12 or newer.

```bash
npm install         # once
npm run dev         # local preview at http://localhost:4321 (updates as you edit)
npm run build       # production build into dist/ (also checks every content file)
npm run preview     # serve the built site locally
npm run check       # TypeScript / Astro checks
npm run placeholders  # list every [Clifford's …] placeholder still to fill in
```

If a content file is missing a required field or has a typo in a field name, `npm run build`
stops and tells you exactly which file and field.

---

## How the site is organised

```
src/
├── config/site.ts         ← social links, navigation, form settings
├── content.config.ts      ← the "shape" (schema) of every kind of content
├── content/
│   ├── songs/             ← one .md file per song (lyrics + audio)
│   ├── lollipop/
│   │   ├── chapters/      ← one .md file per chapter
│   │   ├── characters/    ← one .md file per character
│   │   └── stories/       ← one .md file per story
│   ├── writing/           ← essays, books, the Book of Songs, future writing
│   ├── spirituality/      ← blog-style posts (Torah thoughts, reflections…)
│   ├── workshops/         ← workshops, lectures, programs, recordings
│   ├── videos.json        ← the list of YouTube videos
│   └── pages/             ← long page text: My Story, music essay, Psychology,
│                            Lollipop Cruise intro, Witnessing Groups, Community
├── components/            ← building blocks (LyricsPlayer, DoorsMap, forms…)
├── layouts/               ← page shell (header, footer, meta tags)
├── lib/                   ← LRC parser, helpers, community (forum) data model
├── pages/                 ← one file per URL
└── styles/global.css      ← colours, fonts, light/dark theme
public/
├── audio/                 ← self-hosted song files (MP3 recommended)
└── images/                ← artwork and photos
```

### Site map

| Menu | Pages |
| --- | --- |
| Home | `/`: who Clifford is, the "doors around the hearth" map, where to start |
| My Story | `/my-story`: personal + professional story, with a slot for the music essay |
| Music | `/music` (Music & Lyrics), `/music/<song>` (synced lyrics player), `/lollipop-cruise`, `/videos` |
| Writing | `/writing`, `/writing/<piece>` (includes the Book of Songs) |
| Psychology | `/psychology`: professional page with inquiry form and emergency notice |
| Spirituality | `/spirituality`, `/spirituality/<post>`, `/spirituality/topic/<topic>`, RSS at `/spirituality/rss.xml` |
| Workshops | `/workshops`, `/workshops/<item>`, `/workshops/witnessing-groups` |
| The Gathering Place | `/community`: coming soon + mailing list (forum-ready) |
| Contact | `/contact`: form with topic dropdown (`/contact?topic=workshop` pre-selects a topic) |

---

## Adding a song with timed lyrics

1. **Add the audio.** Either:
   - put an MP3 in `public/audio/` (e.g. `public/audio/my-song.mp3`), **or**
   - use the song's SoundCloud URL (e.g. `https://soundcloud.com/clifford/my-song`).
2. **Add artwork (optional).** Put a square image (e.g. 1200×1200 JPG) in `public/images/songs/`.
3. **Create the song file** `src/content/songs/my-song.md`. The file name becomes the web
   address: `cliffordwaldman.com/music/my-song`.

```markdown
---
title: My Song
collection: lollipop-cruise     # lollipop-cruise | book-of-songs | single
summary: One or two sentences shown in song lists.
audio:
  type: file
  src: /audio/my-song.mp3
# …or for SoundCloud:
# audio:
#   type: soundcloud
#   url: https://soundcloud.com/clifford/my-song
youtube: https://www.youtube.com/watch?v=XXXXXXXXXXX   # optional
artwork:
  src: /images/songs/my-song.jpg
  alt: Short description of the artwork
credits:
  - role: Words & music
    name: Clifford Waldman
year: 2026
order: 10          # position in song lists (lower = earlier)
draft: false       # true hides the song from the site
lyrics: |
  [00:12.50] First line of the song, exactly as written
  [00:16.20] Second line
  [00:20.00]
  [00:24.80] A new verse after an instrumental break
  [00:31.00][01:45.00] A chorus line sung twice can have two timestamps
---

## About this song

Any notes, story or background. This appears under the player.
```

### Timing the lyrics (LRC format)

Each line starts with `[minutes:seconds.hundredths]`, the moment that line begins.

- `[01:05.30]` means 1 minute, 5.3 seconds.
- An empty timed line (`[00:20.00]` with nothing after it) shows a ♪ for an instrumental break.
- A blank line between lines adds space between stanzas.
- A line with several timestamps (`[00:31.00][01:45.00] …`) appears at each of those times.
- `[offset:+200]` near the top shifts every line 200 ms earlier (use `-200` for later).
- **No timestamps at all?** Just paste the plain lyrics. They'll display normally, without syncing.

**The easy way to get timestamps:** open the song in a free LRC tool such as
[lrcgenerator.com](https://lrcgenerator.com) or the "LRC Maker" apps, tap along as the song plays,
and paste the result into `lyrics:`. Keep the two-space indent under `lyrics: |`.

**Checking sync:** run `npm run dev`, open the song, press play, and watch the highlight. If every
line is a little late or early, adjust with `[offset:…]` rather than editing each line.

### How the player behaves

- Lyrics are shown **exactly as written** beside the player (below it on phones, where the
  player stays pinned at the top).
- The current line highlights as the song plays; past lines dim.
- Clicking a line, or tabbing to it and pressing Enter, jumps the audio there.
- "Follow along" auto-scrolls the lyrics. It pauses for a few seconds if the visitor scrolls,
  and it respects the "reduce motion" setting.
- Lyrics are part of the page itself, so they're readable without JavaScript and by search engines.

### Sample songs and test audio

`sample-song-one/two/three.md` are test songs with placeholder lyrics. Like all example
content they carry `sample: true`, so they only appear when `PUBLIC_SHOW_PLACEHOLDERS=true`. Their audio files
(`public/audio/sample-song-*.wav`) are generated tones with a bell on every lyric timestamp.
Regenerate them with `npm run sample-audio`. When real songs are in, delete the three sample
`.md` files, the `.wav` files, their artwork in `public/images/songs/`, and
`scripts/make-sample-audio.mjs`. Also update any chapter, character, story or video that
references a sample song, or the build will say which reference is broken.

---

## Adding Lollipop Cruise chapters, characters and stories

**Chapter:** `src/content/lollipop/chapters/05-the-storm.md`

```markdown
---
title: "Chapter Five: The Storm"
part: 2                    # which Part it belongs to
partTitle: The Open Sea    # the Part's name (repeat on each chapter in that Part)
order: 5                   # reading order
summary: One or two sentences for the chapter list.
status: published          # published | in-progress | future
songs: [my-song]           # song file names (without .md): shown on the chapter page
characters: [character-one]
artwork:
  src: /images/lollipop/chapter-five.jpg
  alt: Description of the artwork
---

The chapter text, in ordinary paragraphs.
```

- `status: future` puts the chapter under **Future chapters** on the Lollipop Cruise page.
- Songs listed here automatically show "In the Lollipop Cruise" links back to the chapter.

**Character:** `src/content/lollipop/characters/captain.md` with `name`, `role`, `summary`,
`songs: [...]`, optional `artwork`, `order`, then the profile text. Chapters that list the
character appear on the character's page automatically.

**Story:** `src/content/lollipop/stories/how-it-began.md` with `title`, `summary`, optional
`song: my-song` (for the story behind a song), optional `chapter: 05-the-storm`, optional
`artwork`, `order`, then the story text.

All artwork (chapters, characters, stories) is collected into the **Artwork** gallery automatically.
Replace the cover at `public/images/lollipop/cover.svg` (or change the path in
`src/pages/lollipop-cruise/index.astro`).

---

## Adding writing, spirituality posts, workshops and videos

**Essay / book / literary piece:** `src/content/writing/my-essay.md`

```markdown
---
title: On Listening
kind: essay            # essay | book | literary | book-of-songs | future
status: published      # published | in-development | planned
date: 2026-10-01
summary: A short description.
---
Text…
```

**Spirituality / Torah post:** `src/content/spirituality/my-post.md`

```markdown
---
title: Light in the Beginning
date: 2026-10-15
category: torah        # torah | faith | growth | human-development | ideas
portion: Parashat Bereshit   # optional
summary: A short description for the post list and RSS feed.
tags: [creation, light]
---
Text…  Hebrew can be written inline: <span lang="he" dir="rtl">בראשית</span>
```

Posts are listed newest first, filterable by topic, and included in the RSS feed.

**Workshop / lecture / program / recording:** `src/content/workshops/my-workshop.md`

```markdown
---
title: Songwriting as Self-Discovery
type: workshop         # workshop | lecture | program | recording
status: upcoming       # upcoming | ongoing | past | on-request
summary: Short description.
date: 2026-11-12T19:00
location: Community Hall, City   # or "Online"
format: hybrid         # in-person | online | hybrid
price: "$40"
registrationUrl: https://www.eventbrite.com/e/...   # optional; defaults to the contact form
recording: https://www.youtube.com/watch?v=...      # for past events
topics: [Songwriting, Creativity]
---
Full description…
```

- `upcoming` items appear in the **Schedule**; `on-request` ones under **Lecture topics**;
  `program`s under **Educational programs**; `past` items with a recording under **Recordings**.

**Video:** add an entry to `src/content/videos.json`:

```json
{
  "id": "my-music-video",
  "title": "My Song (official video)",
  "category": "music-video",
  "youtube": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "description": "A short description.",
  "date": "2026-10-01",
  "song": "my-song"
}
```

`category` is one of `music-video`, `interview`, `lecture`, `visual-story`. Videos show a
thumbnail and only load YouTube's player when clicked (faster pages, fewer cookies).
`"song"` is optional and adds a link to the song's lyrics page.

---

## Editing page text

Long page text lives in `src/content/pages/`:

| File | Page |
| --- | --- |
| `my-story.md` | My Story (each `##` heading becomes a section and a contents link) |
| `music-essay.md` | The essay about music slot on My Story |
| `psychology.md` | Clinical Psychology (identity, background, credentials, areas of work) |
| `lollipop-cruise.md` | Lollipop Cruise introduction |
| `witnessing-groups.md` | Artist Creative Development & Witnessing Groups |
| `community.md` | Welcome text on The Gathering Place page |

Short headline text for the home page is at the top of `src/pages/index.astro` (look for
the `intro`, `worlds` and `starts` lists). Social links and menu labels are in
`src/config/site.ts`.

**Placeholder convention:** any text in square brackets that starts with `Clifford's`,
`Placeholder` or `TODO`, like `[Clifford's exact lyrics here]`, is shown highlighted in yellow
on the site so nothing unfinished goes unnoticed. Replace the whole bracketed text, brackets
included. `npm run placeholders` lists every one that's left.

**Adding photos:** put images in `public/images/` and reference them as `/images/name.jpg`.
In Markdown: `![Description of the photo](/images/name.jpg)`.

---

## Forms

There are three forms, each with its own name so submissions arrive sorted:

| Form name | Where | Purpose |
| --- | --- | --- |
| `contact` | `/contact`, `/psychology#inquiry` | Contact form with topic dropdown (General, Professional inquiry, Workshop, Collaboration, Media / speaking) |
| `gathering-list` | Home, `/community` | Mailing list for The Gathering Place |
| `witnessing-interest` | `/workshops/witnessing-groups` | Interest sign-up for the Witnessing Groups |

**On Netlify (default, no setup):** Netlify Forms detects the forms automatically on deploy.
Submissions appear under *Site → Forms*. Set up email notifications under
*Site configuration → Notifications → Form submission notifications*. Spam is filtered with
a honeypot field. Visitors see `/thanks` after submitting.

**On Vercel or elsewhere (Formspree or similar):** create forms at
[formspree.io](https://formspree.io), then set these environment variables in the hosting dashboard
(see `.env.example`):

```
PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx
PUBLIC_SIGNUP_FORM_ENDPOINT=https://formspree.io/f/yyyyyyy
```

When set, the forms post to those endpoints instead of Netlify. Any service that accepts a
standard HTML form POST works. Redeploy after changing them.

**Privacy:** the psychology inquiry form asks visitors not to include personal health details,
and shows an emergency notice. Web forms are not a secure channel for clinical information.

---

## Deploying

### Netlify (recommended: forms work with zero setup)

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project →** choose the repository.
3. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`, Node 22).
4. Deploy. Every push to the main branch redeploys automatically, and pull requests get preview links.

### Vercel

1. In Vercel: **Add New → Project →** import the repository. Astro is detected automatically
   (`vercel.json` sets build command and output directory).
2. Add the Formspree environment variables (see [Forms](#forms)), since Netlify Forms doesn't run on Vercel.
3. Deploy.

---

## Connecting the domain cliffordwaldman.com

The site is already configured for `https://cliffordwaldman.com` (see `site` in
`astro.config.mjs` and `src/config/site.ts`). It's used for canonical links, the sitemap and RSS.

**Netlify**

1. *Site configuration → Domain management → Add a domain →* `cliffordwaldman.com`.
2. Either switch the domain's nameservers to Netlify DNS (simplest; Netlify shows the four
   nameservers to enter at your registrar), **or** keep your registrar's DNS and add:
   - `A` record for `@` → `75.2.60.5`
   - `CNAME` record for `www` → `<your-site-name>.netlify.app`
3. Netlify issues a free HTTPS certificate automatically. `netlify.toml` redirects `www` to the bare domain.

**Vercel**

1. *Project → Settings → Domains → Add* `cliffordwaldman.com` (and `www.cliffordwaldman.com`).
2. At your registrar add the records Vercel shows, typically:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` record for `www` → `cname.vercel-dns.com`
3. Choose the bare domain as primary; Vercel redirects `www` and handles HTTPS.

Always use the values your hosting dashboard shows, as they occasionally change. DNS
changes can take from a few minutes to 48 hours to spread.

---

## Adding a forum later

The Gathering Place (`/community`) is currently a "coming soon" page with a mailing list. The
code is prepared for a real community:

- `src/lib/community.ts` defines the planned spaces (Discussions, Forums, Q&A, Shared learning,
  Contributors), the data types (`Space`, `Thread`, `Post`, `Member`) and a `CommunityProvider`
  interface to implement for whichever backend is chosen (Discourse, Circle, GitHub Discussions,
  a custom API…).
- The `/community/*` URL space is reserved. Add `src/pages/community/[space]/index.astro` and
  `[space]/[thread].astro` to render spaces and threads.
- For live data, add an Astro adapter (`npx astro add netlify` or `npx astro add vercel`) and
  mark those routes `export const prerender = false`. The rest of the site stays static.
- A hosted forum (e.g. Discourse at `community.cliffordwaldman.com`) is also an option: link to it
  from `/community` and keep the mailing list.

---

## Accessibility and design notes

- **Design:** warm parchment tones with a lamplit "hearth" glow. Headings use *Fraunces* (a soft,
  literary display serif) and body text uses *Source Sans 3*. Hebrew text falls back to *Frank
  Ruhl Libre*. Fonts are self-hosted (no Google requests). Each area has its own accent colour:
  terracotta for music, rose for Lollipop Cruise, blue for writing, teal for psychology (quieter,
  more clinical styling), gold for spirituality, olive for workshops.
- **Home page:** the Gathering Place sits at the centre as a hearth, with the eight sections
  arranged around it as arched doors (a two-column grid on phones).
- **Light & dark theme:** follows the device setting; the sun/moon button overrides it and is remembered.
- **Accessibility:** WCAG AA colour contrast in both themes, visible keyboard focus everywhere,
  "skip to content" link, semantic landmarks and headings, labelled form fields, keyboard-operable
  menus (Escape closes), lyric lines are real buttons, and all animation stops under
  `prefers-reduced-motion`.
- **Performance:** static HTML, almost no JavaScript (only the lyrics player, menus, theme toggle
  and click-to-load videos), sitemap at `/sitemap-index.xml`.

---

## Placeholders to fill in

### What visitors see (and how to see the gaps)

The public site never shows unfinished text:

- **`[Clifford's …]` / `[TODO …]` placeholders are hidden.** In Markdown they are removed, and a
  heading left with nothing under it is dropped too (tables of contents follow). In titles and
  summaries they are left out.
- **Example entries are hidden.** Every sample song, chapter, character, story, post, workshop,
  video and essay has `sample: true` in its frontmatter. Delete that line (or the file) once it
  holds real content.
- **Empty sections show a "coming soon" panel** (`src/components/ComingSoon.astro`) instead of an
  empty grid, with a link to the mailing list.

To see every placeholder and sample highlighted while filling things in, put
`PUBLIC_SHOW_PLACEHOLDERS=true` in `.env` and run `npm run dev` (or set the same variable in your
host's environment for a staging build). Leave it unset for the live site.

The general copy (home page introduction, section descriptions, page intros) was written to fit
the site and makes no claims about Clifford's life or credentials. Clifford should still read it
and adjust anything to his own voice.

### The list

Everything below is placeholder text that Clifford needs to replace with his own words or details.
Nothing here was invented: lyrics, biography, credentials, license numbers and quotes are all
left for Clifford. Run `npm run placeholders` for the current list with line numbers.

**Also replace (not bracketed):**

- `src/config/site.ts`: the three social URLs (currently the generic X, SoundCloud and YouTube
  home pages), and optionally a public `email`.
- `public/audio/sample-song-*.wav`: test tones, to be replaced by real recordings.
- `public/images/songs/*.svg`, `public/images/lollipop/*.svg`: placeholder artwork.
- `public/images/og-default.png`: the image shown when the site is shared on social media (1200×630).
- The three sample songs, and the sample chapters, characters, stories, posts, workshops and
  videos, which exist to show how each content type looks.

<!-- PLACEHOLDER-LIST:START -->

_153 placeholders in total (generated by `npm run placeholders -- --readme`)._

**`src/components/YouTubeLite.astro`**

- [ ] [TODO: YouTube link for “{title}”]

**`src/config/site.ts`**

- [ ] [TODO: X handle]
- [ ] [TODO: SoundCloud profile]
- [ ] [TODO: YouTube channel]

**`src/content/lollipop/chapters/01-first-chapter.md`**

- [ ] [Clifford's chapter title]
- [ ] [Clifford's title for Part One]
- [ ] [Clifford's summary of Chapter One]
- [ ] [Clifford's text for Chapter One. Write the chapter here in ordinary paragraphs.]
- [ ] [Clifford's text continues. Songs listed in this file's `songs:` field appear below the chapter automatically, with a link to hear them with synced lyrics.]

**`src/content/lollipop/chapters/02-second-chapter.md`**

- [ ] [Clifford's chapter title]
- [ ] [Clifford's title for Part One]
- [ ] [Clifford's summary of Chapter Two]
- [ ] [Clifford's text for Chapter Two.]

**`src/content/lollipop/chapters/03-future-chapter.md`**

- [ ] [Clifford's chapter title]
- [ ] [Clifford's title for Part Two]
- [ ] [Clifford's teaser for a future chapter]
- [ ] [Clifford's teaser or notes for this future chapter.]

**`src/content/lollipop/chapters/04-future-chapter.md`**

- [ ] [Clifford's chapter title]
- [ ] [Clifford's title for Part Two]
- [ ] [Clifford's teaser for a future chapter]
- [ ] [Clifford's teaser or notes for this future chapter.]

**`src/content/lollipop/characters/character-one.md`**

- [ ] [Clifford's character name: Character One]
- [ ] [Clifford's one-line role, e.g. who they are on the cruise]
- [ ] [Clifford's short description of this character]
- [ ] [Clifford's character profile: who they are, what they want, how they change across the chapters.]

**`src/content/lollipop/characters/character-two.md`**

- [ ] [Clifford's character name: Character Two]
- [ ] [Clifford's one-line role]
- [ ] [Clifford's short description of this character]
- [ ] [Clifford's character profile.]

**`src/content/lollipop/stories/a-lollipop-cruise-story.md`**

- [ ] [Clifford's story title]
- [ ] [Clifford's summary]
- [ ] [Clifford's story text.]

**`src/content/lollipop/stories/story-behind-sample-song-one.md`**

- [ ] [Clifford's summary]
- [ ] [Clifford's story: how this song came to be, the moment in the Lollipop Cruise it belongs to, and anything the listener might like to know.]

**`src/content/pages/community.md`**

- [ ] [Clifford's welcome to the community, in his own words: why he's building it and who it's for.]

**`src/content/pages/lollipop-cruise.md`**

- [ ] [Clifford's introduction to the Lollipop Cruise: what it is, where it came from, and how to explore it.]
- [ ] [Clifford's note on how the songs, chapters and characters fit together.]

**`src/content/pages/music-essay.md`**

- [ ] [Clifford's title for his essay about music]
- [ ] [Clifford's personal essay about music goes here, in full. This slot appears on the My Story page. Edit src/content/pages/music-essay.md to replace it.]

**`src/content/pages/my-story.md`**

- [ ] [Clifford's opening: where the story starts, in his own words.]
- [ ] [Clifford's relationship with music: when it started, what it gave him, how it has stayed with him.]
- [ ] [Clifford's description of the mission that runs through all of his work.]
- [ ] [Clifford's professional path: the work, the places, the turning points. Told as a story rather than a résumé.]
- [ ] [Clifford's background in psychology and how it shapes the way he sees people, creativity and growth.]
- [ ] [Clifford's account of how his work has evolved toward creativity and spirituality, and what brought him to build The Gathering Place.]

**`src/content/pages/psychology.md`**

- [ ] [Clifford's professional statement: how he describes his clinical work and approach.]
- [ ] [Clifford's clinical background and experience.]
- [ ] [Clifford's degree, institution, year]
- [ ] [Clifford's licensure: state/country and license number, exactly as registered]
- [ ] [Clifford's professional memberships]
- [ ] [Clifford's additional training or certifications]
- [ ] [Clifford's area of work]
- [ ] [Clifford's description of how he works with clients.]
- [ ] [Clifford's format: in person, online, or both]
- [ ] [Clifford's practice location or region served]
- [ ] [Clifford's fees and insurance information]

**`src/content/pages/witnessing-groups.md`**

- [ ] [Clifford's description of the program in his own words.]
- [ ] [Clifford's description of who the group is for: art forms, experience levels, commitment.]
- [ ] [TODO: format, in person or online]
- [ ] [TODO: group size]
- [ ] [TODO: schedule, frequency and start date]
- [ ] [TODO: cost]

**`src/content/songs/sample-song-one.md`**

- [ ] [Clifford's one-line description of this song]
- [ ] [TODO: year]
- [ ] [Clifford's exact lyrics here — verse 1, line 1]
- [ ] [Clifford's exact lyrics here — verse 1, line 2]
- [ ] [Clifford's exact lyrics here — verse 1, line 3]
- [ ] [Clifford's exact lyrics here — verse 1, line 4]
- [ ] [Clifford's exact lyrics here — verse 2, line 1]
- [ ] [Clifford's exact lyrics here — verse 2, line 2]
- [ ] [Clifford's exact lyrics here — chorus, line 1]
- [ ] [Clifford's exact lyrics here — chorus, line 2]
- [ ] [Clifford's exact lyrics here — closing line]
- [ ] [Clifford's notes on this song: where it came from, what it means, the moment it belongs to in the Lollipop Cruise.]

**`src/content/songs/sample-song-three.md`**

- [ ] [Clifford's one-line description of this song]
- [ ] [Clifford's exact lyrics here — line 1]
- [ ] [Clifford's exact lyrics here — line 2]
- [ ] [Clifford's exact lyrics here — line 3]
- [ ] [Clifford's exact lyrics here — line 4]
- [ ] [Clifford's exact lyrics here — line 5]
- [ ] [Clifford's exact lyrics here — line 6]
- [ ] [Clifford's exact lyrics here — line 7]
- [ ] [Clifford's exact lyrics here — line 8]
- [ ] [Clifford's exact lyrics here — line 9]
- [ ] [Clifford's exact lyrics here — line 10]
- [ ] [Clifford's notes on this song.]

**`src/content/songs/sample-song-two.md`**

- [ ] [Clifford's one-line description of this song]
- [ ] [Clifford's exact lyrics here — verse 1, line 1]
- [ ] [Clifford's exact lyrics here — verse 1, line 2]
- [ ] [Clifford's exact lyrics here — chorus, line 1]
- [ ] [Clifford's exact lyrics here — chorus, line 2]
- [ ] [Clifford's exact lyrics here — verse 2, line 1]
- [ ] [Clifford's exact lyrics here — verse 2, line 2]
- [ ] [Clifford's exact lyrics here — bridge]
- [ ] [Clifford's exact lyrics here — final line]
- [ ] [Clifford's notes on this song and its place in the Book of Songs.]

**`src/content/spirituality/sample-growth.md`**

- [ ] [Clifford's post title on spiritual growth]
- [ ] [Clifford's summary]
- [ ] [Clifford's post text.]

**`src/content/spirituality/sample-reflection.md`**

- [ ] [Clifford's reflection title]
- [ ] [Clifford's summary]
- [ ] [Clifford's reflection text.]

**`src/content/spirituality/sample-torah-thought.md`**

- [ ] [Clifford's title for this Torah thought]
- [ ] [TODO: Torah portion]
- [ ] [Clifford's summary]
- [ ] [Clifford's Torah thought. Quote verses exactly as you want them to appear. Hebrew text displays in a Hebrew typeface automatically, for example:]
- [ ] [Clifford's Hebrew text here]
- [ ] [Clifford's reflection continues.]

**`src/content/videos.json`**

- [ ] [Clifford's music video title]
- [ ] [Clifford's description]
- [ ] [Clifford's interview title]
- [ ] [Clifford's description of the interview]
- [ ] [Clifford's lecture title]
- [ ] [Clifford's description of the lecture]
- [ ] [Clifford's visual story title]
- [ ] [Clifford's description of this visual story]

**`src/content/workshops/sample-lecture-topic.md`**

- [ ] [Clifford's lecture title]
- [ ] [Clifford's description]
- [ ] [Clifford's topic]
- [ ] [Clifford's lecture description: outline, length, audience.]

**`src/content/workshops/sample-program.md`**

- [ ] [Clifford's educational program title]
- [ ] [Clifford's description]
- [ ] [Clifford's program description: sessions, structure, how to join.]

**`src/content/workshops/sample-recording.md`**

- [ ] [Clifford's recorded lecture title]
- [ ] [Clifford's description]
- [ ] [Clifford's notes about this lecture.]

**`src/content/workshops/sample-upcoming-workshop.md`**

- [ ] [Clifford's workshop title]
- [ ] [Clifford's description of this workshop]
- [ ] [TODO: venue or 'Online']
- [ ] [TODO: price]
- [ ] [Clifford's topic]
- [ ] [Clifford's description of the session.]
- [ ] [Clifford's note on who this workshop is for.]

**`src/content/writing/book-of-songs.md`**

- [ ] [Clifford's description of the Book of Songs]
- [ ] [Clifford's description of the Book of Songs: what it gathers, why, and who it's for.]
- [ ] [Clifford's update on where the book stands.]

**`src/content/writing/future-writing.md`**

- [ ] [Clifford's future writing project]
- [ ] [Clifford's note about writing still to come]
- [ ] [Clifford's notes on future writing.]

**`src/content/writing/on-music-essay.md`**

- [ ] [Clifford's essay title: on music]
- [ ] [Clifford's summary]
- [ ] [Clifford's personal essay about music goes here.]

**`src/content/writing/sample-book.md`**

- [ ] [Clifford's book title]
- [ ] [Clifford's description of this book]
- [ ] [Clifford's description of the book, where to find it, and any excerpts.]

**`src/content/writing/sample-essay.md`**

- [ ] [Clifford's essay title]
- [ ] [Clifford's one-paragraph summary of this essay]
- [ ] [Clifford's essay text. Write in ordinary paragraphs; use `##` for section headings.]
- [ ] [Clifford's pull-quote, if any]
- [ ] [Clifford's essay continues.]

<!-- PLACEHOLDER-LIST:END -->
