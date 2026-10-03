/**
 * Minimal, forgiving LRC parser.
 *
 * Supports:
 *   [mm:ss] line            [mm:ss.xx] line        [mm:ss:xx] line
 *   [00:12.00][01:40.00] a repeated chorus line (several stamps, one line)
 *   [ti:Title] [ar:Artist] [offset:+250]  (metadata; offset in ms)
 *   Plain lines with no timestamp (then the whole song is shown untimed)
 *   An empty timed line ("[01:02.00]") marks an instrumental break.
 */

export type LyricLine = {
  /** Seconds from the start of the track, or null when untimed. */
  time: number | null;
  text: string;
  /** True for blank timed lines, shown as an instrumental marker. */
  instrumental: boolean;
  /** Line begins a new stanza (there was a blank line before it). */
  stanzaStart: boolean;
};

export type ParsedLyrics = {
  lines: LyricLine[];
  synced: boolean;
  meta: Record<string, string>;
};

const STAMP = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
const META = /^\[([a-z]+):(.*)\]$/i;

function toSeconds(min: string, sec: string, frac?: string): number {
  let f = 0;
  if (frac) f = Number(frac) / Math.pow(10, frac.length);
  return Number(min) * 60 + Number(sec) + f;
}

export function parseLrc(source: string): ParsedLyrics {
  const meta: Record<string, string> = {};
  const timed: LyricLine[] = [];
  const plain: LyricLine[] = [];
  let pendingStanza = false;

  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      pendingStanza = true;
      continue;
    }

    STAMP.lastIndex = 0;
    const stamps: number[] = [];
    let m: RegExpExecArray | null;
    let rest = line;
    // Collect leading timestamps only.
    while ((m = STAMP.exec(rest)) && m.index === 0) {
      stamps.push(toSeconds(m[1], m[2], m[3]));
      rest = rest.slice(m[0].length);
      STAMP.lastIndex = 0;
    }

    if (stamps.length) {
      const text = rest.trim();
      for (const time of stamps) {
        timed.push({ time, text, instrumental: text === '', stanzaStart: pendingStanza });
      }
      pendingStanza = false;
      continue;
    }

    const metaMatch = line.match(META);
    if (metaMatch && /^(ti|ar|al|au|by|re|ve|length|offset|la)$/i.test(metaMatch[1])) {
      meta[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      continue;
    }

    plain.push({ time: null, text: line, instrumental: false, stanzaStart: pendingStanza });
    pendingStanza = false;
  }

  if (timed.length) {
    const offset = Number(meta.offset || 0) / 1000;
    timed.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
    for (const l of timed) l.time = Math.max(0, (l.time ?? 0) - offset);
    // Stanza breaks become meaningful after sorting: an instrumental gap starts a new stanza.
    for (let i = 1; i < timed.length; i++) {
      if (timed[i - 1].instrumental) timed[i].stanzaStart = true;
    }
    if (timed[0]) timed[0].stanzaStart = false;
    return { lines: timed, synced: true, meta };
  }

  if (plain[0]) plain[0].stanzaStart = false;
  return { lines: plain, synced: false, meta };
}

/** Format seconds as m:ss for display. */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
