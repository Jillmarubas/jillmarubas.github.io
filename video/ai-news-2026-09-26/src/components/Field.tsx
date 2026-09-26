import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// The Frost Glass field: six radial blooms over a warm floor, drifting slowly,
// with grain on top so the gradients never band. Same stops as frost-glass-layer.html.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const Field: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  // a 52 s alternate drift, as on the site, plus a slower second axis
  const p = (Math.sin((t / 52) * Math.PI) + 1) / 2;
  const q = (Math.sin((t / 83) * Math.PI * 2 + 1.3) + 1) / 2;
  const tx = p * 2.5 - q * 1.2;
  const ty = -p * 2.5 + q * 1.4;
  const sc = 1 + p * 0.08;
  const a = (x: number) => (x * intensity).toFixed(3);
  return (
    <AbsoluteFill style={{background: '#0a0a0a', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: '-15%',
          transform: `translate3d(${tx}%, ${ty}%, 0) scale(${sc})`,
          background: [
            `radial-gradient(44% 38% at 12% 8%, rgba(250,90,5,${a(0.62)}), rgba(250,90,5,0) 70%)`,
            `radial-gradient(40% 34% at 84% 12%, rgba(255,162,58,${a(0.44)}), rgba(255,162,58,0) 70%)`,
            `radial-gradient(42% 38% at 78% 54%, rgba(214,31,90,${a(0.42)}), rgba(214,31,90,0) 70%)`,
            `radial-gradient(40% 34% at 16% 60%, rgba(124,58,190,${a(0.30)}), rgba(124,58,190,0) 70%)`,
            `radial-gradient(46% 40% at 54% 92%, rgba(250,90,5,${a(0.44)}), rgba(250,90,5,0) 72%)`,
            `radial-gradient(70% 60% at 50% 44%, rgba(250,90,5,${a(0.16)}), rgba(250,90,5,0) 78%)`,
            'linear-gradient(160deg, #1a0d05 0%, #0d0a08 45%, #140a10 100%)',
          ].join(','),
        }}
      />
      {/* a vignette so type on the left always has a quieter backdrop */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(8,6,5,.55) 0%, rgba(8,6,5,.18) 55%, rgba(8,6,5,0) 100%)',
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  // shift the tile every other frame so the grain lives like film, not a static screen
  const k = Math.floor(frame / 2) % 7;
  const ox = (k * 53) % 240;
  const oy = (k * 97) % 240;
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: GRAIN,
        backgroundPosition: `${ox}px ${oy}px`,
        pointerEvents: 'none',
      }}
    />
  );
};
