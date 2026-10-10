// The scene list (pure data, no React) and every scene's window on the timeline. Film.tsx maps the
// names to components; cues.ts and the sound mixer read the same windows, so picture and sound agree.
import T from './timing.json';

export type Tr = 'whipL' | 'whipR' | 'up' | 'zoom' | 'fade' | 'cut';
export type Spec = {ch: number; from: number; to?: number; name: string; tr?: Tr; pre?: number};
export type Line = {ch: number; i: number; start: number; end: number; say: string; show: string; words: [string, number][]};
export type Chapter = {title: string; key: string; start: number; card: number; vo: number; hasVo: boolean; end: number};
export const LINES = T.lines as Line[];
export const CHAPTERS = T.chapters as Chapter[];
export const DURATION = T.duration as number;
export const TR = 0.5; // transition overlap (s)

export const SPEC: Spec[] = [
  // 0 hook
  {ch: 0, from: 0, to: 1, name: 'HPrice'},
  {ch: 0, from: 1, to: 2, name: 'HCan'},
  {ch: 0, from: 2, to: 3, name: 'HWhich', tr: 'zoom'},
  {ch: 0, from: 3, name: 'HPromise'},
  // 1 plan
  {ch: 1, from: 0, name: 'Plan'},
  // 2 meet the three
  {ch: 2, from: 0, to: 2, name: 'MGpt'},
  {ch: 2, from: 2, to: 3, name: 'MIui'},
  {ch: 2, from: 3, to: 4, name: 'MClaude'},
  {ch: 2, from: 4, to: 5, name: 'MSizes'},
  {ch: 2, from: 5, to: 6, name: 'MGemini'},
  {ch: 2, from: 6, to: 7, name: 'MGoogle'},
  {ch: 2, from: 7, name: 'MSources', tr: 'fade'},
  // 3 prices
  {ch: 3, from: 0, to: 3, name: 'PTable'},
  {ch: 3, from: 3, to: 5, name: 'PCheap'},
  {ch: 3, from: 5, to: 7, name: 'PMain'},
  {ch: 3, from: 7, to: 10, name: 'PMainFeat'},
  {ch: 3, from: 10, to: 14, name: 'PPower'},
  {ch: 3, from: 14, name: 'PAdvice'},
  // 4 price verdict
  {ch: 4, from: 0, name: 'VPrice'},
  // 5 free plans
  {ch: 5, from: 0, to: 1, name: 'FIntro'},
  {ch: 5, from: 1, to: 3, name: 'FGpt'},
  {ch: 5, from: 3, to: 5, name: 'FClaude'},
  {ch: 5, from: 5, name: 'FGemini'},
  // 6 free verdict
  {ch: 6, from: 0, name: 'VFree'},
  // 7 round 1
  {ch: 7, from: 0, to: 3, name: 'R1Iui'},
  {ch: 7, from: 3, to: 5, name: 'R1Stream'},
  {ch: 7, from: 5, to: 7, name: 'R1Gemini'},
  {ch: 7, from: 7, to: 9, name: 'R1Claude'},
  {ch: 7, from: 9, name: 'R1Try'},
  {ch: 8, from: 0, name: 'V1'},
  // 9 round 2
  {ch: 9, from: 0, to: 3, name: 'R2Claude'},
  {ch: 9, from: 3, to: 5, name: 'R2Artifacts'},
  {ch: 9, from: 5, to: 6, name: 'R2Gpt'},
  {ch: 9, from: 6, to: 8, name: 'R2Gemini'},
  {ch: 9, from: 8, to: 10, name: 'R2Try'},
  {ch: 9, from: 10, name: 'R2Trick'},
  {ch: 10, from: 0, name: 'V2'},
  // 11 round 3
  {ch: 11, from: 0, to: 2, name: 'R3Flow'},
  {ch: 11, from: 2, to: 6, name: 'R3Who'},
  {ch: 11, from: 6, to: 7, name: 'R3Context'},
  {ch: 11, from: 7, to: 8, name: 'R3Check'},
  {ch: 11, from: 8, name: 'R3Try'},
  {ch: 12, from: 0, name: 'V3'},
  // 13 round 4
  {ch: 13, from: 0, to: 2, name: 'R4Nano'},
  {ch: 13, from: 2, to: 3, name: 'R4Synth'},
  {ch: 13, from: 3, to: 4, name: 'R4Video'},
  {ch: 13, from: 4, to: 7, name: 'R4Rest'},
  {ch: 13, from: 7, name: 'R4Try'},
  {ch: 14, from: 0, name: 'V4'},
  // 15 round 5
  {ch: 15, from: 0, to: 4, name: 'R5Cc'},
  {ch: 15, from: 4, to: 6, name: 'R5Codex'},
  {ch: 15, from: 6, to: 8, name: 'R5Jules'},
  {ch: 15, from: 8, name: 'R5Try'},
  {ch: 16, from: 0, name: 'V5'},
  // 17 round 6
  {ch: 17, from: 0, to: 3, name: 'R6Gemini'},
  {ch: 17, from: 3, to: 5, name: 'R6Claude'},
  {ch: 17, from: 5, to: 6, name: 'R6Gpt'},
  {ch: 17, from: 6, name: 'R6Try'},
  {ch: 18, from: 0, name: 'V6'},
  // 19 round 7
  {ch: 19, from: 0, to: 3, name: 'R7Gemini'},
  {ch: 19, from: 3, to: 5, name: 'R7Audio'},
  {ch: 19, from: 5, to: 7, name: 'R7Claude'},
  {ch: 19, from: 7, name: 'R7Try'},
  {ch: 20, from: 0, name: 'V7'},
  // 21 round 8
  {ch: 21, from: 0, to: 3, name: 'R8Gpt'},
  {ch: 21, from: 3, to: 4, name: 'R8Gemini'},
  {ch: 21, from: 4, to: 5, name: 'R8Claude'},
  {ch: 21, from: 5, name: 'R8Try'},
  {ch: 22, from: 0, name: 'V8'},
  // 23 round 9
  {ch: 23, from: 0, to: 2, name: 'R9Intro'},
  {ch: 23, from: 2, to: 4, name: 'R9Gpt'},
  {ch: 23, from: 4, to: 6, name: 'R9Claude'},
  {ch: 23, from: 6, to: 8, name: 'R9Gemini'},
  {ch: 23, from: 8, name: 'R9Advice'},
  {ch: 24, from: 0, name: 'V9'},
  // 25–29 prompts, mistakes, tips
  {ch: 25, from: 0, name: 'Prompts'},
  {ch: 26, from: 0, name: 'Mistakes'},
  {ch: 27, from: 0, name: 'TipsGpt'},
  {ch: 28, from: 0, name: 'TipsClaude'},
  {ch: 29, from: 0, name: 'TipsGemini'},
  // 30 which one to pay for
  {ch: 30, from: 0, to: 3, name: 'Score'},
  {ch: 30, from: 3, to: 9, name: 'Persona'},
  {ch: 30, from: 9, name: 'OneTip'},
  // 31–32 verdict + outro
  {ch: 31, from: 0, name: 'Final'},
  {ch: 32, from: 0, name: 'Outro'},
];

export const line = (ch: number, i: number) => {
  const l = LINES.find((x) => x.ch === ch && x.i === i);
  if (!l) throw new Error(`no line ${ch}.${i}`);
  return l;
};

export type Win = Spec & {to: number; start: number; end: number; tr: Tr; idx: number};
export const WINDOWS: Win[] = (() => {
  const out: Win[] = SPEC.map((s, k) => {
    const first = k === 0 || SPEC[k - 1].ch !== s.ch;
    const start = k === 0 ? 0 : first ? CHAPTERS[s.ch].start : line(s.ch, s.from).start - (s.pre ?? 0.4);
    return {...s, to: s.to ?? 99, start, end: 0, tr: s.tr ?? (first ? 'zoom' : k % 2 ? 'whipL' : 'whipR'), idx: k};
  });
  out.forEach((w, k) => (w.end = k < out.length - 1 ? out[k + 1].start + TR : DURATION));
  return out;
})();
export const win = (name: string) => {
  const w = WINDOWS.find((x) => x.name === name);
  if (!w) throw new Error(`no scene ${name}`);
  return w;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Absolute time the n-th `word` is spoken, searching the scene's own lines first, then its chapter. */
export const wordAt = (s: Win, word: string, n = 0) => {
  const key = norm(word);
  const chLines = LINES.filter((l) => l.ch === s.ch);
  const pick = (ls: Line[]) => ls.flatMap((l) => l.words.filter(([x]) => x === key).map(([, tt]) => tt));
  const inScene = pick(chLines.filter((l) => l.i >= s.from && l.i < s.to));
  const hits = inScene.length > n ? inScene : pick(chLines);
  if (hits.length <= n) throw new Error(`word "${word}" (#${n}) not found in chapter ${s.ch} (${s.name})`);
  return hits[n];
};
/** Absolute-time helpers bound to one scene. */
export const at = (name: string) => {
  const s = win(name);
  return {s, w: (word: string, n = 0) => wordAt(s, word, n), L: (i: number) => line(s.ch, i).start, Le: (i: number) => line(s.ch, i).end};
};
