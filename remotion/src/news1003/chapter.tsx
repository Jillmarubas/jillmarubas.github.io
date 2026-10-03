import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F} from './design';
import {e01, Kicker, Piece} from './kit';
import {Logo3D} from './Logo3D';

/**
 * Story card in Autopilot Blue: the title at full ink, with the story number dissolving
 * down the veil ramp behind it (decorative, aria-hidden in spirit), and the story's 3D mark.
 */
export const ChapterCard: React.FC<{n: number; title: string; logo?: string; logoFit?: number}> = ({n, title, logo, logoFit = 0.72}) => {
  const f = useCurrentFrame();
  const veils = [0.62, 0.34, 0.2, 0.11, 0.05];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 150, top: 150, display: 'flex', flexDirection: 'column'}}>
        {veils.map((v, i) => (
          <div key={i} style={{fontFamily: F.display, fontWeight: 500, fontSize: 150, lineHeight: 1.0, letterSpacing: '-0.04em', color: `rgba(${C.inkRgb},${v * e01(f, i * 2, 12)})`, transform: `translateY(${(1 - e01(f, i * 2, 14)) * 30}px)`}}>
            {String(n).padStart(2, '0')}
          </div>
        ))}
      </div>
      <Piece x={1010} y={540} at={4} from="rise">
        <div style={{width: 1000}}>
          <Kicker text={`Story ${n} of 5`} at={6} />
          <div style={{fontFamily: F.display, fontWeight: 600, fontSize: 104, color: C.ink, lineHeight: 0.98, letterSpacing: '-0.035em', marginTop: 22}}>{title}</div>
        </div>
      </Piece>
      {logo && (
        <Piece x={1640} y={270} at={8} from="rise" shadow={false}>
          <Logo3D name={logo} w={340} h={300} at={8} fit={logoFit} />
        </Piece>
      )}
    </AbsoluteFill>
  );
};
