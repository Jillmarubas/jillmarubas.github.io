import React from 'react';
import {useCurrentFrame} from 'remotion';
import {N3Film, WINDOWS} from './Film';

/** QA: frame i shows scene i late in its window, once everything keyed to its words has landed. */
export const N3_QA = WINDOWS.map((w) => w.from + Math.max(10, Math.round(w.dur * 0.85) - 6));
export const N3QA: React.FC = () => {
  const i = useCurrentFrame();
  return <N3Film offset={N3_QA[i] - i} />;
};
