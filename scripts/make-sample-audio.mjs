/**
 * Generates the three short test tracks in public/audio/ used by the sample songs.
 * Each lyric timestamp gets a chord change and a soft bell, so you can hear
 * whether the highlighted lyric line is in sync. Replace these with real
 * recordings (MP3 recommended) and delete this script when no longer needed.
 *
 *   node scripts/make-sample-audio.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const RATE = 11025;

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz
const CHORDS = {
  C: [60, 64, 67, 72], Am: [57, 60, 64, 69], F: [53, 57, 60, 65], G: [55, 59, 62, 67],
  Dm: [50, 57, 62, 65], Em: [52, 59, 64, 67], E: [52, 56, 59, 64], D: [50, 54, 57, 62], Bm: [47, 54, 59, 62],
};

function render({ file, length, lines, progression, bpm }) {
  const n = Math.floor(RATE * length);
  const buf = new Float32Array(n);
  const beat = 60 / bpm / 2; // eighth notes

  const pluck = (start, freq, dur, amp) => {
    const s0 = Math.floor(start * RATE);
    const len = Math.floor(dur * RATE);
    for (let i = 0; i < len && s0 + i < n; i++) {
      const t = i / RATE;
      const env = Math.exp(-t * 3.2) * Math.min(1, t * 200);
      buf[s0 + i] += amp * env * (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(4 * Math.PI * freq * t));
    }
  };

  // Segments: from each line time to the next (first segment from 0).
  const bounds = [0, ...lines, length];
  for (let seg = 0; seg < bounds.length - 1; seg++) {
    const chord = CHORDS[progression[seg % progression.length]];
    const pattern = [0, 1, 2, 3, 2, 1];
    let k = 0;
    for (let t = bounds[seg]; t < bounds[seg + 1] - 0.05; t += beat, k++) {
      pluck(t, NOTE(chord[pattern[k % pattern.length]]), 1.2, 0.18);
      if (k % 4 === 0) pluck(t, NOTE(chord[0] - 12), 1.6, 0.22);
    }
  }
  // Bell on every lyric line
  for (const t of lines) pluck(t, NOTE(96), 0.6, 0.12);

  // Fade out and normalise
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const tail = (n - i) / RATE;
    if (tail < 2) buf[i] *= tail / 2;
    peak = Math.max(peak, Math.abs(buf[i]));
  }
  const pcm = Buffer.alloc(n);
  for (let i = 0; i < n; i++) pcm[i] = Math.round(128 + (buf[i] / peak) * 110);

  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + n, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE, 28);
  h.writeUInt16LE(1, 32);
  h.writeUInt16LE(8, 34); // 8-bit
  h.write('data', 36);
  h.writeUInt32LE(n, 40);
  mkdirSync('public/audio', { recursive: true });
  writeFileSync(`public/audio/${file}`, Buffer.concat([h, pcm]));
  console.log(`wrote public/audio/${file} (${length}s)`);
}

// Line times must match the LRC timestamps in src/content/songs/*.md
render({
  file: 'sample-song-one.wav', length: 44, bpm: 96,
  progression: ['C', 'C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'F', 'G', 'C'],
  lines: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
});
render({
  file: 'sample-song-two.wav', length: 46, bpm: 84,
  progression: ['Dm', 'Dm', 'F', 'C', 'G', 'Dm', 'F', 'C', 'G', 'Dm', 'F', 'C'],
  lines: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43],
});
render({
  file: 'sample-song-three.wav', length: 40, bpm: 108,
  progression: ['E', 'E', 'D', 'Bm', 'E', 'D', 'Bm', 'E', 'D', 'E'],
  lines: [2.5, 6, 9.5, 13, 16.5, 22, 25.5, 29, 32.5, 36],
});
