import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {Logo3D} from './Logo3D';
import {Kicker, Piece, e01} from './kit';

/** Story card: the story number, its title on a torn paper strip, a red rule drawing on, and the story's mark. */
export const ChapterCard: React.FC<{n: number; title: string; logo?: string; logoFit?: number}> = ({n, title, logo, logoFit = 0.7}) => {
  const f = useCurrentFrame();
  const rule = e01(f, 10, 14);
  return (
    <AbsoluteFill>
      <Piece x={430} y={520} at={0} from="l" rot={-3} dur={16}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 520, lineHeight: 0.8, color: C.ink, opacity: 0.92}}>{String(n).padStart(2, '0')}</div>
      </Piece>
      <Piece x={1180} y={520} at={4} from="r" rot={1.5} dur={18}>
        <div style={{background: C.card, padding: '34px 56px 40px', clipPath: 'polygon(0 4%, 3% 0, 97% 3%, 100% 0, 99% 96%, 96% 100%, 2% 97%, 0 100%)'}}>
          <Kicker text={`Story ${n} of 7`} at={8} color={C.red} />
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, color: C.ink, lineHeight: 0.98, marginTop: 14, maxWidth: 900}}>{title}</div>
          <div style={{height: 6, background: C.red, width: `${rule * 100}%`, marginTop: 22}} />
        </div>
      </Piece>
      {logo && (
        <Piece x={1640} y={250} at={8} from="t" rot={6} shadow={false}>
          <Logo3D name={logo} w={300} h={300} at={8} fit={logoFit} />
        </Piece>
      )}
    </AbsoluteFill>
  );
};
