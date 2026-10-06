/**
 * Site-wide settings. Everyday values (name, social links, announcement) live in
 * src/content/settings/site.json and are edited from the dashboard at /admin.
 * Navigation and form endpoints stay here.
 */

import settings from '../content/settings/site.json';

/** Name, description, email, social links and the announcement bar: edited in the dashboard (/admin → Site settings). */
export const site = {
  name: settings.name,
  owner: settings.owner,
  domain: 'cliffordwaldman.com',
  url: 'https://cliffordwaldman.com',
  description: settings.description,
  // Public contact email is optional. Leave empty to show only the form.
  email: settings.email,
};

export type SocialIcon = 'x' | 'soundcloud' | 'youtube' | 'instagram' | 'facebook' | 'spotify' | 'link';

/** Social "doors" that lead back here. */
export const socials = settings.socials.filter((s) => s.url) as { label: string; handle: string; url: string; icon: SocialIcon }[];

/** Optional site-wide banner, switched on from the dashboard. */
export const announcement = settings.announcement;

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
