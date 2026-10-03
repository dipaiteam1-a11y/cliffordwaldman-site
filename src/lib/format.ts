const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDate = (d?: Date) => (d ? dateFmt.format(d) : '');
export const formatDateTime = (d?: Date) => (d ? dateTimeFmt.format(d) : '');

export const songCollectionLabel: Record<string, string> = {
  'lollipop-cruise': 'Lollipop Cruise',
  'book-of-songs': 'Book of Songs',
  single: 'Songs',
};

export const writingKindLabel: Record<string, string> = {
  essay: 'Essay',
  book: 'Book',
  literary: 'Literary work',
  'book-of-songs': 'Book of Songs',
  future: 'Future writing',
};

export const spiritCategoryLabel: Record<string, string> = {
  torah: 'Torah thoughts',
  faith: 'Faith',
  growth: 'Spiritual growth',
  'human-development': 'Human development',
  ideas: 'Divine & psychological ideas',
};

export const workshopTypeLabel: Record<string, string> = {
  workshop: 'Workshop',
  lecture: 'Lecture',
  program: 'Educational program',
  recording: 'Recording',
};

export const videoCategoryLabel: Record<string, string> = {
  'music-video': 'Music videos',
  interview: 'Interviews',
  lecture: 'Lectures',
  'visual-story': 'Visual storytelling',
};

/** Split plain text into segments, marking placeholder text for highlighting. */
export function splitPlaceholders(text: string): { text: string; placeholder: boolean }[] {
  const re = /\[(?:Clifford['’]s|Clifford |Placeholder|TODO)[^\[\]]*\]/g;
  const out: { text: string; placeholder: boolean }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), placeholder: false });
    out.push({ text: m[0], placeholder: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), placeholder: false });
  return out;
}
