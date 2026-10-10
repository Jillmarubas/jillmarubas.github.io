// Scene clock: every scene knows its own local time in seconds and can ask when a word is spoken.
import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS} from '../gpt1010/design';
import {CHAPTERS, DURATION, LINES, Win, line, wordAt} from './plan';

export {CHAPTERS, DURATION, LINES, line};
export const SceneCtx = createContext<Win | null>(null);

export const useS = () => {
  const f = useCurrentFrame();
  const s = useContext(SceneCtx);
  if (!s) throw new Error('useS outside a scene');
  const t = f / FPS;
  /** Local time (s) the n-th occurrence of `word` is spoken. */
  const w = (word: string, n = 0) => wordAt(s, word, n) - s.start;
  /** Local start / end of chapter line i. */
  const L = (i: number) => line(s.ch, i).start - s.start;
  const Le = (i: number) => line(s.ch, i).end - s.start;
  /** Absolute → local. */
  const loc = (abs: number) => abs - s.start;
  return {t, dur: s.end - s.start, w, L, Le, loc, win: s};
};
