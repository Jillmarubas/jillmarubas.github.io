import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/*
 * The "living gradient" background the user approved (Sept 2026): large soft blobs of colour
 * drifting on closed paths with a fine static grain on top. It is the standard backdrop for
 * daily news videos and takes its colours from whatever design system is chosen (see
 * `paletteFrom`). Every motion completes a whole number of cycles per `loop` frames, so any
 * video length loops seamlessly. The approved speed is SPEED 2 / TRAVEL 2.2 / sway 4 degrees.
 */
export const GRADIENT_LOOP = 450; // 15 s at 30 fps

/** Four colours are enough to drive the whole field. */
export type GradientPalette = {
  edge: string; // the dominant colour at the sides (periwinkle in the reference)
  mid: string; // the band through the middle (mint)
  glow: string; // the light corner glow (pale aqua)
  haze?: string; // optional accent haze; defaults to a mix of edge and glow
};

/** The reference palette (blue / mint / aqua), sampled from the user's image. */
export const REFERENCE_PALETTE: GradientPalette = {edge: '#84A7E3', mid: '#9EE0C4', glow: '#BDEEF0', haze: '#8FB6E2'};

/**
 * Build a palette from a design system's colours: pass them in order of importance
 * (e.g. [primary, secondary, light accent]). Colours are softened toward white so text on
 * top stays readable; pass `soften: 0` to use them as they are.
 */
export const paletteFrom = (colors: string[], soften = 0.35): GradientPalette => {
  const [a, b = a, c = mix(b, '#FFFFFF', 0.5), d] = colors;
  const s = (x: string) => mix(x, '#FFFFFF', soften);
  return {edge: s(a), mid: s(b), glow: s(c), haze: d ? s(d) : undefined};
};

type Blob = {c: string; x: number; y: number; ax: number; ay: number; k: number; ph: number; r: number; o: number};
const SPEED = 2; // each blob completes SPEED x k cycles per loop
const TRAVEL = 2.2; // how far the colours wander
const SWAY = 4; // degrees the whole field rocks

const blobsFor = (p: GradientPalette): Blob[] => {
  const haze = p.haze ?? mix(p.edge, p.glow, 0.4);
  return [
    {c: p.mid, x: 0.52, y: 0.45, ax: 0.1, ay: 0.08, k: 1, ph: 0.0, r: 0.42, o: 0.95}, // the middle band
    {c: mix(p.mid, '#FFFFFF', 0.1), x: 0.38, y: 0.9, ax: 0.08, ay: 0.05, k: 2, ph: 1.3, r: 0.36, o: 0.85},
    {c: p.glow, x: 0.86, y: 0.88, ax: 0.07, ay: 0.06, k: 1, ph: 2.1, r: 0.4, o: 0.95}, // corner glow
    {c: p.edge, x: 0.08, y: 0.35, ax: 0.06, ay: 0.12, k: 1, ph: 3.6, r: 0.45, o: 0.9},
    {c: mix(p.edge, '#FFFFFF', 0.04), x: 0.9, y: 0.22, ax: 0.07, ay: 0.09, k: 2, ph: 4.4, r: 0.38, o: 0.85},
    {c: mix(p.mid, p.glow, 0.5), x: 0.68, y: 0.62, ax: 0.12, ay: 0.08, k: 1, ph: 5.2, r: 0.3, o: 0.6},
    {c: haze, x: 0.24, y: 0.12, ax: 0.09, ay: 0.05, k: 3, ph: 0.8, r: 0.3, o: 0.55},
  ];
};

export const LivingGradient: React.FC<{palette?: GradientPalette; loop?: number; grain?: number}> = ({palette = REFERENCE_PALETTE, loop = GRADIENT_LOOP, grain = 0.16}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const th = (2 * Math.PI * f) / loop;
  const layers = blobsFor(palette).map((b) => {
    const w = th * b.k * SPEED;
    const x = (b.x + b.ax * TRAVEL * Math.sin(w + b.ph)) * 100;
    const y = (b.y + b.ay * TRAVEL * Math.cos(w + b.ph * 1.3)) * 100;
    const r = b.r * (1 + 0.18 * Math.sin(w + b.ph * 0.7));
    const a = Math.round(b.o * 255).toString(16).padStart(2, '0');
    return `radial-gradient(ellipse ${r * 100}% ${r * 150}% at ${x}% ${y}%, ${b.c}${a} 0%, ${b.c}00 70%)`;
  });
  const sway = Math.sin(th * 2) * SWAY;
  const {edge, mid, glow} = palette;
  const base = `linear-gradient(90deg, ${edge} 0%, ${mix(edge, mid, 0.55)} 35%, ${mid} 52%, ${mix(mid, glow, 0.5)} 70%, ${edge} 100%)`;
  // the grain tile is sized for 4K; scale it so the grain looks the same at any resolution
  const tile = 1024 * (Math.max(width, height) / 3840) * 2;
  return (
    <AbsoluteFill style={{background: base, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: layers.join(','), transform: `scale(1.18) rotate(${sway}deg)`}} />
      {grain > 0 && (
        <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: grain}}>
          <div style={{width, height, backgroundImage: `url(${staticFile('grain-1024.png')})`, backgroundSize: `${tile}px`}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** The approved 4K loop in the reference colours. */
export const GradientLoop: React.FC = () => <LivingGradient />;

/** Demo: the same motion in a news-style palette, to show it follows any design system. */
export const GradientLoopNewsDemo: React.FC = () => <LivingGradient palette={paletteFrom(['#1E3A8A', '#DC2626', '#F59E0B'], 0.45)} />;

function mix(a: string, b: string, k: number) {
  const p = (h: string) => {
    const x = h.replace('#', '');
    const n = parseInt(x.length === 3 ? x.split('').map((c) => c + c).join('') : x.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = p(a);
  const B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
