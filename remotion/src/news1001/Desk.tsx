import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {C} from './design';

/*
 * The late-night desk: textured paper under one warm lamp. The pool of light drifts slowly,
 * the edges fall off into shadow, and a fine grain sits over everything. A rough-ink SVG filter
 * (#rough) is defined here for stamps.
 */
export const Desk: React.FC<{f?: number}> = ({f: fo}) => {
  const fr = useCurrentFrame();
  const f = fo ?? fr;
  const lx = 46 + 6 * Math.sin(f / 260);
  const ly = 42 + 5 * Math.sin(f / 330 + 1.3);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Img src={staticFile('dc/paper.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 78% at ${lx}% ${ly}%, rgba(255,236,200,0.22) 0%, rgba(255,236,200,0) 55%, rgba(26,18,10,0.38) 100%)`}} />
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={3} />
        </filter>
      </svg>
    </AbsoluteFill>
  );
};

/** Lens layer over everything: vignette and film grain (grain re-seeded every 2 frames). */
export const Lens: React.FC<{f?: number}> = ({f: fo}) => {
  const fr = useCurrentFrame();
  const f = fo ?? fr;
  const g = Math.floor(f / 2);
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 82% 82% at 50% 48%, transparent 58%, rgba(14,10,6,0.42) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('grain-1024.png')})`,
          backgroundPosition: `${Math.floor(random(`gx${g}`) * 1024)}px ${Math.floor(random(`gy${g}`) * 1024)}px`,
          opacity: 0.09,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
