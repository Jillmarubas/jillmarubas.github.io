// Scene clock helpers: useS plus a forgiving word lookup and "fraction through a line".
import {useS} from './timing';

export const useT = () => {
  const s = useS();
  /** Local time `word` is spoken (n-th occurrence); falls back to `fb` if the recogniser missed it. */
  const ww = (word: string, fb: number, n = 0) => {
    try {
      return s.w(word, n);
    } catch {
      return fb;
    }
  };
  /** Local time a fraction `f` of the way through chapter line i. */
  const mid = (i: number, f: number) => s.L(i) + (s.Le(i) - s.L(i)) * f;
  return {...s, ww, mid};
};
