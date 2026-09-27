import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {HumLine, Kicker, e01} from './kit';

/* ------------------------------------------------------------------ chapter card */
const WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
export const ChapterCard: React.FC<{n: number; title: string}> = ({n, title}) => {
  const f = useCurrentFrame();
  const o = e01(f, 0, 16);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: -60, top: 60, fontFamily: F.display, fontWeight: 900, fontSize: 1000, lineHeight: 0.8, color: C.hum, opacity: 0.92 * o, transform: `translateX(${(1 - o) * -120}px)`}}>{n}</div>
      <div style={{position: 'absolute', left: 760, top: 400, width: 1040}}>
        <Kicker text={`Chapter ${WORDS[n]}`} at={6} />
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 128, color: C.ink, lineHeight: 0.95, marginTop: 20, letterSpacing: '-0.02em', opacity: e01(f, 10, 16), transform: `translateY(${(1 - e01(f, 10, 16)) * 40}px)`}}>{title}</div>
      </div>
      <HumLine x={760} y={720} w={900} at={18} amp={18} />
    </AbsoluteFill>
  );
};

