import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PERF} from '../perf';

// The background: a slow-moving gradient field in Settle's green family (mint, deep green and a
// cool teal) over black. Blooms drift on long, unrelated periods (60–110 s) so the motion never
// repeats noticeably and never competes with the words. It also gives the glass panels
// something to frost: over flat black, backdrop blur would be invisible.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const wave = (t: number, period: number, phase: number) => Math.sin((t / period) * Math.PI * 2 + phase);

type Bloom = {x: number; y: number; w: number; h: number; ax: number; ay: number; px: number; py: number; ph: number; rgb: string; a: number};
const BLOOMS: Bloom[] = [
  {x: 12, y: 10, w: 62, h: 70, ax: 9, ay: 7, px: 83, py: 61, ph: 0.0, rgb: '171,254,193', a: 0.3}, // mint
  {x: 82, y: 22, w: 56, h: 64, ax: 8, ay: 9, px: 97, py: 73, ph: 1.7, rgb: '31,138,98', a: 0.52}, // deep green
  {x: 70, y: 88, w: 70, h: 62, ax: 10, ay: 6, px: 71, py: 109, ph: 3.1, rgb: '27,112,128', a: 0.48}, // cool teal
  {x: 18, y: 84, w: 54, h: 56, ax: 7, ay: 8, px: 89, py: 67, ph: 4.4, rgb: '64,160,110', a: 0.32}, // green
  {x: 48, y: 46, w: 80, h: 76, ax: 6, ay: 5, px: 113, py: 79, ph: 2.3, rgb: '18,60,44', a: 0.6}, // body
];

export const Field: React.FC<{haze?: number}> = ({haze = 1}) => {
  const frame = PERF.staticField ? 0 : useCurrentFrame();
  const t = frame / 30;
  const bg = BLOOMS.map((b) => {
    const x = b.x + b.ax * wave(t, b.px, b.ph);
    const y = b.y + b.ay * wave(t, b.py, b.ph + 1.3);
    const a = (b.a * (0.85 + 0.15 * wave(t, b.px * 0.7, b.ph + 2)) * haze).toFixed(3);
    return `radial-gradient(${b.w}% ${b.h}% at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(${b.rgb},${a}), rgba(${b.rgb},0) 70%)`;
  });
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: [...bg, '#020504'].join(',')}} />
      {/* keep the reading column (left) calmer than the rest, so floor-grey words stay legible */}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.18) 50%, rgba(0,0,0,0) 100%)'}} />
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
