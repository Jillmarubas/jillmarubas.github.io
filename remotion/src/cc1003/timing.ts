// Scene clock: every scene knows its own local time in seconds and can ask when a word is spoken.
import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import T from './timing.json';
import {FPS} from './design';

export type Line = {ch: number; i: number; start: number; end: number; say: string; show: string; words: [string, number][]};
export type Chapter = {title: string; key: string; start: number; card: number; vo: number; hasVo: boolean; end: number};
export const LINES = T.lines as Line[];
export const CHAPTERS = T.chapters as Chapter[];
export const DURATION = T.duration as number;
export const line = (ch: number, i: number) => {
  const l = LINES.find((x) => x.ch === ch && x.i === i);
  if (!l) throw new Error(`no line ${ch}.${i}`);
  return l;
};

export type SceneWin = {ch: number; from: number; to: number; start: number; end: number};
export const SceneCtx = createContext<SceneWin>({ch: 0, from: 0, to: 0, start: 0, end: 1});

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

export const useS = () => {
  const f = useCurrentFrame();
  const s = useContext(SceneCtx);
  const t = f / FPS;
  const chLines = LINES.filter((l) => l.ch === s.ch);
  /** Local time (s) the n-th occurrence of `word` is spoken, searching this scene's lines first. */
  const w = (word: string, n = 0) => {
    const key = norm(word);
    const pick = (ls: Line[]) => ls.flatMap((l) => l.words.filter(([x]) => x === key).map(([, tt]) => tt));
    const inScene = pick(chLines.filter((l) => l.i >= s.from && l.i < s.to));
    const hits = inScene.length > n ? inScene : pick(chLines);
    if (hits.length <= n) throw new Error(`word "${word}" (#${n}) not found in chapter ${s.ch}`);
    return hits[n] - s.start;
  };
  /** Local start / end of chapter line i. */
  const L = (i: number) => line(s.ch, i).start - s.start;
  const Le = (i: number) => line(s.ch, i).end - s.start;
  return {t, dur: s.end - s.start, w, L, Le, win: s};
};
