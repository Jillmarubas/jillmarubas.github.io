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
  {ch: 0, from: 0, to: 2, name: 'HookApp'},
  {ch: 0, from: 2, to: 3, name: 'HookDate', tr: 'zoom', pre: 0.3},
  {ch: 0, from: 3, to: 4, name: 'HookPlan'},
  {ch: 1, from: 0, name: 'Plan'},
  {ch: 2, from: 0, to: 1, name: 'IuiIntro'},
  {ch: 2, from: 1, to: 2, name: 'IuiBlocks'},
  {ch: 2, from: 2, to: 3, name: 'IuiFormats'},
  {ch: 2, from: 3, to: 4, name: 'IuiRollout'},
  {ch: 2, from: 4, to: 5, name: 'IuiModels'},
  {ch: 2, from: 5, name: 'IuiWhy'},
  {ch: 3, from: 0, to: 2, name: 'TryOpen'},
  {ch: 3, from: 2, to: 4, name: 'TryBill', tr: 'cut', pre: 0.2},
  {ch: 3, from: 4, to: 5, name: 'TryBike'},
  {ch: 3, from: 5, to: 6, name: 'TryMap'},
  {ch: 3, from: 6, to: 7, name: 'TipFormat'},
  {ch: 3, from: 7, name: 'TipReasoning'},
  {ch: 4, from: 0, to: 2, name: 'WaitOld'},
  {ch: 4, from: 2, to: 3, name: 'WaitNew'},
  {ch: 4, from: 3, name: 'Speed44'},
  {ch: 5, from: 0, name: 'StreamDemo'},
  {ch: 6, from: 0, to: 1, name: 'AudioDrop'},
  {ch: 6, from: 1, to: 2, name: 'AudioOutputs'},
  {ch: 6, from: 2, to: 3, name: 'AudioPlans'},
  {ch: 6, from: 3, name: 'AudioSpecs'},
  {ch: 7, from: 0, to: 4, name: 'NotesDemo'},
  {ch: 7, from: 4, name: 'NotesCheck'},
  {ch: 8, from: 0, to: 2, name: 'CodexIntro'},
  {ch: 8, from: 2, to: 3, name: 'CodexWho'},
  {ch: 8, from: 3, name: 'CodexFree'},
  {ch: 9, from: 0, to: 3, name: 'CodexUse'},
  {ch: 9, from: 3, name: 'CodexOff'},
  {ch: 10, from: 0, to: 1, name: 'Todo'},
  {ch: 10, from: 1, name: 'Morph'},
  {ch: 11, from: 0, name: 'Outro'},
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
