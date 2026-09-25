import timeline from '../data/timeline.json';

export type Word = {text: string; para: number; start: number; end: number};

export const WORDS: Word[] = timeline.words;
export const PARAS: {start: number; end: number}[] = timeline.paras;
export const DURATION: number = timeline.duration;

const norm = (s: string) => s.toLowerCase().replace(/[“”"'’.,:;?!]/g, '');

const find = (phrase: string, after: number): number => {
  const target = phrase.split(/\s+/).map(norm);
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].start < after) continue;
    if (target.every((t, j) => WORDS[i + j] && norm(WORDS[i + j].text) === t)) return i;
  }
  throw new Error(`Cue not found in the voiceover: "${phrase}"`);
};

/** Time (s) the first word of `phrase` starts, searching from `after`. */
export const cue = (phrase: string, after = 0) => WORDS[find(phrase, after)].start;

/** Time (s) the last word of `phrase` ends. */
export const cueEnd = (phrase: string, after = 0) => {
  const i = find(phrase, after);
  return WORDS[i + phrase.split(/\s+/).length - 1].end;
};

/** The spoken words of `phrase`, with their timings, for text that lights up in sync. */
export const wordsOf = (phrase: string, after = 0): Word[] => {
  const i = find(phrase, after);
  return WORDS.slice(i, i + phrase.split(/\s+/).length);
};

/** Story n (1-6) as its paragraph span; 0 is the hook, 7 the outro. */
export const para = (n: number) => PARAS[n];
