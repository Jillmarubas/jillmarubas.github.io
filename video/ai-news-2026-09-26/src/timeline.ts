import data from './data/timeline.json';
import {FPS} from './theme';
import {Block, buildBlocks} from './runningOrder';

export type Word = {t: string; s: number; e: number; k: boolean; n: boolean; q: boolean};
export type Phrase = {a: number; b: number; s: number; e: number};
export type Section = {id: string; duration: number; words: Word[]; phrases: Phrase[]};

export const SECTIONS = data as Section[];
export const sec = (id: string) => {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`no section ${id}`);
  return s;
};

// Words inside quotation marks, so quoted speech can be set differently.
export const quotedMask = (s: Section) => {
  const mask: boolean[] = [];
  let open = false;
  for (const w of s.words) {
    const opens = /^["“]/.test(w.t);
    const closes = /["”][.,?!]*$/.test(w.t);
    if (opens) open = true;
    mask.push(open);
    if (closes && (open || !opens)) open = false;
  }
  return mask;
};

const bare = (t: string) => t.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9$%.¢'-]/g, '').replace(/[.,]+$/, '');

// Index of the nth occurrence of a word in a section (as displayed, case-insensitive).
export const wi = (id: string, word: string, nth = 1) => {
  const s = sec(id);
  const target = bare(word);
  let seen = 0;
  for (let i = 0; i < s.words.length; i++) {
    if (bare(s.words[i].t) === target && ++seen === nth) return i;
  }
  throw new Error(`word "${word}"#${nth} not in ${id}`);
};

// Seconds (section-local) at which the phrase containing word i starts.
export const phraseStartOf = (id: string, i: number) => {
  const s = sec(id);
  const p = s.phrases.find((ph) => i >= ph.a && i <= ph.b)!;
  return p.s;
};

// ---- the running order (shared with the audio synth) -----------------------------
export type {Block};
const {blocks, total: t} = buildBlocks((id) => sec(id).duration);
export const BLOCKS = blocks;
export const TOTAL_SECONDS = t;
export const TOTAL_FRAMES = Math.ceil(t * FPS);
export const voBlock = (id: string) => blocks.find((b) => b.kind === 'vo' && b.id === id)!;
export const f = (sec: number) => Math.round(sec * FPS);

export const STORIES = [
  {n: 1, kicker: 'OpenAI', title: 'GPT-6 Sol and Luna land at half the price'},
  {n: 2, kicker: 'Anthropic', title: 'Claude Opus 5.5 answers ninety minutes earlier'},
  {n: 3, kicker: 'Geopolitics', title: 'The White House asks labs to hold models back from the UK'},
  {n: 4, kicker: 'AI safety', title: 'An OpenAI agent breaches Australia’s Medicare portal'},
  {n: 5, kicker: 'Infrastructure', title: 'Oracle invokes force majeure on Project Jupiter'},
];
