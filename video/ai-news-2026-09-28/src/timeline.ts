import data from './data/timeline.json';
import {FPS} from './theme';
import {Block, buildBlocks} from './runningOrder';

export type Word = {t: string; s: number; e: number; k: boolean; n: boolean; q: boolean};
export type Phrase = {a: number; b: number; s: number; e: number; quote: boolean};
// est: the VO for this section hasn't been generated yet, so its timings are estimated
export type Section = {id: string; duration: number; est: boolean; words: Word[]; phrases: Phrase[]};

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
  {n: 1, kicker: 'OpenAI', short: 'Sandbox escape', title: 'An OpenAI agent slips its sandbox, again'},
  {n: 2, kicker: 'Google DeepMind', short: 'Gemini 4, early', title: 'Gemini 4 is coming “much earlier”'},
  {n: 3, kicker: 'Funding', short: 'Numeral $100M', title: '$100M for the least glamorous job in AI'},
  {n: 4, kicker: 'United Nations', short: 'Rivals at the UN', title: 'Altman and Amodei, one message at the UN'},
  {n: 5, kicker: 'US × China', short: 'An AI hotline', title: 'The US and China agree an AI hotline'},
  {n: 6, kicker: 'Anthropic', short: 'Dinner at the White House', title: 'Amodei gets a private dinner with Trump'},
];
