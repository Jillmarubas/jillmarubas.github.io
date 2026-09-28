import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PERF} from '../perf';

// The Settle night: pure black, one green haze in the upper left (the only ambient colour,
// kept under 14% opacity as in settle-motion.html's night panels), drifting very slowly,
// with fine grain so the haze never bands.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const Field: React.FC<{haze?: number}> = ({haze = 1}) => {
  const frame = PERF.staticField ? 0 : useCurrentFrame();
  const t = frame / 30;
  const p = (Math.sin((t / 60) * Math.PI) + 1) / 2;
  const q = (Math.sin((t / 97) * Math.PI * 2 + 0.7) + 1) / 2;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: '72%',
          height: '120%',
          left: `${-20 + p * 4}%`,
          top: `${-48 + q * 5}%`,
          borderRadius: '50%',
          opacity: haze,
          background: 'radial-gradient(closest-side, rgba(171,254,193,.14), rgba(18,27,21,.5) 55%, rgba(0,0,0,0))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '90%',
          right: `${-22 + q * 3}%`,
          bottom: `${-50 + p * 4}%`,
          borderRadius: '50%',
          opacity: 0.55 * haze,
          background: 'radial-gradient(closest-side, rgba(171,254,193,.06), rgba(18,27,21,.35) 60%, rgba(0,0,0,0))',
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => {
  const frame = useCurrentFrame();
  if (PERF.noGrain) return null;
  const k = Math.floor(frame / 2) % 7;
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: GRAIN,
        backgroundPosition: `${(k * 53) % 240}px ${(k * 97) % 240}px`,
        pointerEvents: 'none',
      }}
    />
  );
};
