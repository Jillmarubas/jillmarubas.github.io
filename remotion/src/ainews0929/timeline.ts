// The running order: VO clips and stingers laid end to end, plus word-level cue lookup.
import timings from './timings.json';
import {FPS} from './theme';

export type SectionId = 'hook' | 'preview' | 's1' | 's2' | 's3' | 's4' | 's5' | 'outro';
type Word = {t: string; s: number; e: number};
const T = timings as unknown as Record<SectionId, {duration: number; words: Word[]}>;

export type Block =
  | {kind: 'vo'; id: SectionId; start: number; len: number}
  | {kind: 'title'; start: number; len: number}
  | {kind: 'stinger'; story: number; start: number; len: number}
  | {kind: 'end'; start: number; len: number};

const ORDER: (SectionId | 'title' | 'end' | `st${number}`)[] = [
  'hook', 'title', 'preview', 'st1', 's1', 'st2', 's2', 'st3', 's3', 'st4', 's4', 'st5', 's5', 'outro', 'end',
];
const LEAD = 0.5; // silence before the first word
const GAP = 0.45; // breath after each VO clip
const TITLE = 3.2;
const STINGER = 2.4;
const END = 4.5;

const blocks: Block[] = [];
let t = LEAD;
for (const id of ORDER) {
  if (id === 'title') blocks.push({kind: 'title', start: t, len: TITLE}), (t += TITLE);
  else if (id === 'end') blocks.push({kind: 'end', start: t, len: END}), (t += END);
  else if (id.startsWith('st')) blocks.push({kind: 'stinger', story: Number(id.slice(2)), start: t, len: STINGER}), (t += STINGER);
  else {
    const len = T[id as SectionId].duration;
    blocks.push({kind: 'vo', id: id as SectionId, start: t, len});
    t += len + GAP;
  }
}
export const BLOCKS = blocks;
export const TOTAL_FRAMES = Math.ceil(t * FPS);
export const fr = (sec: number) => Math.round(sec * FPS);

export const voStart = (id: SectionId) => {
  const b = blocks.find((x) => x.kind === 'vo' && x.id === id);
  if (!b) throw new Error(`no block ${id}`);
  return b.start;
};
export const blockOf = (kind: Block['kind'], story?: number) => {
  const b = blocks.find((x) => x.kind === kind && (story === undefined || (x.kind === 'stinger' && x.story === story)));
  if (!b) throw new Error(`no block ${kind}`);
  return b;
};

const bare = (w: string) => w.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9$%'-]/g, '');

// Absolute frame at which `word` (the nth time it's said in that section) starts.
export const cue = (id: SectionId, word: string, nth = 1): number => {
  const target = bare(word);
  let seen = 0;
  for (const w of T[id].words) {
    if (bare(w.t) === target && ++seen === nth) return fr(voStart(id) + w.s);
  }
  throw new Error(`word "${word}"#${nth} not in ${id}`);
};
export const sectionEnd = (id: SectionId) => fr(voStart(id) + T[id].duration);
export const sectionStart = (id: SectionId) => fr(voStart(id));

// Absolute frame of the occurrence of `word` nearest to `sec` (section-relative seconds).
export const cueNear = (id: SectionId, word: string, sec: number): number => {
  const target = bare(word);
  let best: Word | null = null;
  for (const w of T[id].words) if (bare(w.t) === target && (!best || Math.abs(w.s - sec) < Math.abs(best.s - sec))) best = w;
  if (!best) throw new Error(`word "${word}" not in ${id}`);
  return fr(voStart(id) + best.s);
};
