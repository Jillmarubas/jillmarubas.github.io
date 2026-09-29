import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/*
 * A soft blue / mint / aqua gradient in the style of the user's reference, brought to life:
 * large blobs of colour drift on closed paths so the loop is seamless (every motion completes a
 * whole number of cycles over the composition), with a fine static grain on top like the
 * reference. Colours were sampled from the reference; the artwork itself is original.
 */
export const GRADIENT_LOOP = 450; // 15 s at 30 fps

type Blob = {c: string; x: number; y: number; ax: number; ay: number; k: number; ph: number; r: number; o: number};
const BLOBS: Blob[] = [
  {c: '#9EE0C4', x: 0.52, y: 0.45, ax: 0.10, ay: 0.08, k: 1, ph: 0.0, r: 0.42, o: 0.95}, // mint column
  {c: '#A6E4CF', x: 0.38, y: 0.9, ax: 0.08, ay: 0.05, k: 2, ph: 1.3, r: 0.36, o: 0.85}, // mint pool, bottom
  {c: '#BDEEF0', x: 0.86, y: 0.88, ax: 0.07, ay: 0.06, k: 1, ph: 2.1, r: 0.40, o: 0.95}, // pale aqua corner
  {c: '#83A6E3', x: 0.08, y: 0.35, ax: 0.06, ay: 0.12, k: 1, ph: 3.6, r: 0.45, o: 0.9}, // periwinkle, left
  {c: '#86A9E6', x: 0.9, y: 0.22, ax: 0.07, ay: 0.09, k: 2, ph: 4.4, r: 0.38, o: 0.85}, // periwinkle, top right
  {c: '#96D2D6', x: 0.68, y: 0.62, ax: 0.12, ay: 0.08, k: 1, ph: 5.2, r: 0.30, o: 0.6}, // aqua bridge
  {c: '#8FB6E2', x: 0.24, y: 0.12, ax: 0.09, ay: 0.05, k: 3, ph: 0.8, r: 0.30, o: 0.55}, // soft blue haze
];

export const GradientLoop: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const th = (2 * Math.PI * f) / GRADIENT_LOOP;
  const layers = BLOBS.map((b) => {
    const x = (b.x + b.ax * Math.sin(th * b.k + b.ph)) * 100;
    const y = (b.y + b.ay * Math.cos(th * b.k + b.ph * 1.3)) * 100;
    const r = b.r * (1 + 0.08 * Math.sin(th * b.k + b.ph * 0.7));
    const a = Math.round(b.o * 255).toString(16).padStart(2, '0');
    return `radial-gradient(ellipse ${r * 100}% ${r * 150}% at ${x}% ${y}%, ${b.c}${a} 0%, ${b.c}00 70%)`;
  });
  // a gentle breathing of the whole field so it never feels static
  const sway = Math.sin(th) * 1.5;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(90deg, #86AAE3 0%, #93C4D8 35%, #A0DDC6 52%, #9CCFE0 70%, #88AEE5 100%)', overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: layers.join(','), transform: `scale(1.08) rotate(${sway}deg)`}} />
      {/* fine grain, as in the reference: a static tiled noise, blended softly */}
      <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.16}}>
        <div style={{width, height, backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: `${1024 * (width / 3840) * 2}px`, imageRendering: 'pixelated'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
void Img;
