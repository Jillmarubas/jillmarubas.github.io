import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame} from 'remotion';
import {LivingGradient, paletteFrom} from '../gradient/GradientLoop';
import {C} from './design';

/*
 * The ground. SOP: every daily news video sits on the approved living gradient, coloured from
 * the chosen design system. Autopilot Blue's ground is never one grey: the living gradient
 * drifts in its blue-greys, and a top-to-floor wash keeps the single-light-source read
 * (#EAEAEA across the top two-fifths, cooling to #CDDDEC at the floor, one low bloom at 62 % / 118 %).
 */
const PALETTE = paletteFrom([C.lo, C.mid, C.hi, '#C5D3EE'], 0);

export const Ground: React.FC<{f?: number}> = ({f: fo}) => {
  const fr = useCurrentFrame();
  const f = fo ?? fr;
  return (
    <AbsoluteFill style={{background: C.hi}}>
      <LivingGradient palette={PALETTE} loop={360} grain={0} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at ${62 + 3 * Math.sin(f / 300)}% 118%, rgba(129,162,246,.40) 0%, rgba(129,162,246,0) 62%), linear-gradient(180deg, rgba(234,234,234,.78) 0%, rgba(234,234,234,.62) 42%, rgba(220,227,237,.25) 74%, rgba(205,221,236,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Over everything: a very soft cool vignette and static grain (never animated grain, per SOP). */
export const Lens: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 50% 46%, transparent 62%, rgba(16,21,28,0.16) 100%)', pointerEvents: 'none'}} />
    <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain-1024.png')})`, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none'}} />
  </>
);

export const seedOf = (s: string) => random(s);
