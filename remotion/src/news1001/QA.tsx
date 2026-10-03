import React from 'react';
import {useCurrentFrame} from 'remotion';
import {N1Film, WINDOWS} from './Film';

/** QA: frame i shows scene i once its pieces have landed (60 % in, at most 4 s in). */
export const N1_QA = WINDOWS.map((w) => w.from + Math.min(Math.round(w.dur * 0.6), 96));
export const N1QA: React.FC = () => {
  const i = useCurrentFrame();
  return <N1Film offset={N1_QA[i] - i} />;
};
