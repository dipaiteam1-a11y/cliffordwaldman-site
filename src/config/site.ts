/**
 * Site-wide settings. This is the one TypeScript file Clifford may want to edit:
 * social links, navigation labels and form endpoints all live here.
 */

export const site = {
  name: 'The Gathering Place',
  owner: 'Clifford Waldman',
  domain: 'cliffordwaldman.com',
  url: 'https://cliffordwaldman.com',
  description:
    'The Gathering Place: home to the music, writing, psychology, spirituality and community work of Clifford Waldman.',
  // Public contact email is optional. Leave empty to show only the form.
  email: '',
};

/**
 * Social "doors" that lead back here. Replace each URL with Clifford's real profile.
 * They are listed in the README under "Placeholders to fill in".
 */
export const socials = [
  { label: 'X', handle: '[TODO: X handle]', url: 'https://x.com/', icon: 'x' },
  { label: 'SoundCloud', handle: '[TODO: SoundCloud profile]', url: 'https://soundcloud.com/', icon: 'soundcloud' },
  { label: 'YouTube', handle: '[TODO: YouTube channel]', url: 'https://www.youtube.com/', icon: 'youtube' },
] as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'My Story', href: '/my-story' },
  {
    label: 'Music',
    href: '/music',
    children: [
      { label: 'Music & Lyrics', href: '/music', description: 'Songs with synced lyrics' },
      { label: 'Lollipop Cruise', href: '/lollipop-cruise', description: 'A creative universe in chapters' },
      { label: 'Videos & Media', href: '/videos', description: 'Music videos, talks and interviews' },
    ],
  },
  { label: 'Writing', href: '/writing' },
  { label: 'Psychology', href: '/psychology' },
  { label: 'Spirituality', href: '/spirituality' },
  {
    label: 'Workshops',
    href: '/workshops',
    children: [
      { label: 'Workshops & Lectures', href: '/workshops', description: 'Topics, schedule and recordings' },
      { label: 'Witnessing Groups', href: '/workshops/witnessing-groups', description: 'Artist creative development' },
    ],
  },
  { label: 'The Gathering Place', href: '/community' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Forms. By default the site uses Netlify Forms (no setup needed on Netlify).
 * To use Formspree or another service instead, set PUBLIC_CONTACT_FORM_ENDPOINT
 * and PUBLIC_SIGNUP_FORM_ENDPOINT in your hosting dashboard (see .env.example).
 */
export const forms = {
  contactEndpoint: import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT || '',
  signupEndpoint: import.meta.env.PUBLIC_SIGNUP_FORM_ENDPOINT || '',
  /** Page shown after a Netlify form submits. */
  thanksPage: '/thanks',
  contactTopics: [
    { value: 'general', label: 'General' },
    { value: 'professional', label: 'Professional inquiry' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'media', label: 'Media / speaking' },
  ],
};

/** Workshop registration default (used when a workshop has no link of its own). */
export const registration = {
  defaultUrl: '/contact?topic=workshop',
};
