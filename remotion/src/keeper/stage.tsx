// The Keeper: multiplane camera, time helpers, palettes, rain, lightning and lantern light.
// The camera physically moves through stacked paper planes (dolly, truck, crane). It never zooms:
// near planes grow and slide faster than far ones, which is what makes the move feel embodied.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {PaperDefs, W, H} from '../paperkite/kit';
import {mix} from '../paperkite/set';

export const FPS = 24000 / 1001; // film standard 23.976
export const fr = (s: number) => Math.round(s * FPS);
export const io = Easing.bezier(0.45, 0, 0.2, 1);
export const settle = Easing.bezier(0.22, 1, 0.36, 1);
export const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const rs = (t: number, a: number, b: number, from = 0, to = 1, easing = io) => interpolate(t, [a, b], [from, to], {...clampOpts, easing});
export {mix};
export const lerpT = (a: number, b: number, k: number) => a + (b - a) * k;

// Seconds since the shot started: smooth for the camera, held on twos for everything drawn.
export const useT = () => useCurrentFrame() / FPS;
export const useTw = () => {
  const f = useCurrentFrame();
  return (f - (f % 2)) / FPS;
};

// ---------- palettes ----------
export const N = {
  sky: '#343A46',
  cloud: '#2A2F39',
  cloud2: '#3B424F',
  sea1: '#46505C',
  sea2: '#3D4653',
  sea3: '#343C48',
  sea4: '#2A313C',
  crest: '#222832',
  foam: '#AEB5B9',
  rock: '#1C1F24',
  rock2: '#262A31',
  cliff: '#2B2F28',
  cliff2: '#353930',
  tower: '#A9A499',
  towerShade: '#8C887F',
  cap: '#2A2D33',
  glass: '#2B3139',
  wall: '#474A52',
  wall2: '#3D4048',
  stone: '#52555D',
  wood: '#4F4339',
  rain: 'rgba(214,222,230,0.42)',
};
export const D = {
  sky: '#EED8C2',
  cloud: '#F6EBDD',
  cloud2: '#E9D6C3',
  sea1: '#BAC4C3',
  sea2: '#A9B6B5',
  sea3: '#97A6A6',
  sea4: '#869696',
  crest: '#7A8B8C',
  foam: '#F4EFE6',
  rock: '#6F6A63',
  rock2: '#807A72',
  cliff: '#A4A58D',
  cliff2: '#B4B49B',
  tower: '#F1EBDF',
  towerShade: '#DCD4C6',
  cap: '#5A5650',
  glass: '#B9C3C6',
  wall: '#C9BFAF',
  wall2: '#BDB2A1',
  stone: '#D3CABA',
  wood: '#9C8A74',
  rain: 'rgba(255,255,255,0)',
};
export type Pal = typeof N;
export const palMix = (t: number): Pal => {
  const o = {} as Record<string, string>;
  (Object.keys(N) as (keyof Pal)[]).forEach((k) => {
    o[k] = k === 'rain' ? N.rain : mix(N[k], D[k], t);
  });
  return o as Pal;
};
export const AMBER = '#F2A93B';
export const AMBER_HI = '#FFD98A';

// ---------- camera ----------
export type Cam = {x: number; y: number; z: number};
const CamCtx = createContext<Cam>({x: 0, y: 0, z: 0});

// A paper plane at depth d (1000 = the reference plane). Scale and parallax come from the camera.
export const Plane: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const c = useContext(CamCtx);
  const s = d / (d - c.z);
  const f = 1000 / d;
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2 - c.x * f} ${-H / 2 - c.y * f})`}>{children}</g>;
};

export const Shot: React.FC<{cam: Cam; children: React.ReactNode; bg?: string}> = ({cam, children, bg = N.sky}) => (
  <AbsoluteFill style={{background: bg}}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <PaperDefs />
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor={AMBER_HI} stopOpacity={0.85} />
          <stop offset="0.35" stopColor={AMBER} stopOpacity={0.35} />
          <stop offset="1" stopColor={AMBER} stopOpacity={0} />
        </radialGradient>
        <filter id="dim">
          <feColorMatrix type="matrix" values="0.6 0 0 0 0  0 0.63 0 0 0  0 0 0.72 0 0  0 0 0 1 0" />
        </filter>
      </defs>
      <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
    </svg>
  </AbsoluteFill>
);

// Warm light pooling around a lantern or a lit window.
export const Glow: React.FC<{x: number; y: number; r: number; a?: number}> = ({x, y, r, a = 1}) =>
  a > 0.01 ? <circle cx={x} cy={y} r={r} fill="url(#glow)" opacity={a} style={{mixBlendMode: 'screen'}} /> : null;

// Night tone for paper characters (they are lit by the scene, not by daylight).
export const Dim: React.FC<{on?: number; children: React.ReactNode}> = ({on = 1, children}) =>
  on > 0.5 ? <g filter="url(#dim)">{children}</g> : <>{children}</>;

// Lightning: a bright strike, a second flicker, then decay. Never more than one strike per second.
export const flash = (t: number, at: number[]) =>
  at.reduce((m, a) => {
    const k = t - a;
    if (k < 0 || k > 0.5) return m;
    const v = k < 0.06 ? 1 : k < 0.13 ? 0.35 : k < 0.2 ? 0.75 : 0.75 * Math.exp(-(k - 0.2) * 9);
    return Math.max(m, v);
  }, 0);

export const FlashOverlay: React.FC<{v: number}> = ({v}) =>
  v > 0.01 ? <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#DCE3EA" opacity={v * 0.14} style={{mixBlendMode: 'screen'}} /> : null;

// Rain in screen space, held on twos: thin paper slivers slanting with the wind.
export const Rain: React.FC<{t: number; density?: number; seed?: string; slant?: number; color?: string}> = ({t, density = 1, seed = 'rn', slant = 0.28, color = N.rain}) => {
  const n = Math.round(150 * density);
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    const sp = 1500 + random(`${seed}s${i}`) * 900;
    const len = 50 + random(`${seed}l${i}`) * 70;
    const y = ((random(`${seed}y${i}`) * (H + 300) + t * sp) % (H + 300)) - 150;
    const x = ((random(`${seed}x${i}`) * (W + 400) + y * slant) % (W + 400)) - 200;
    lines.push(`M${x.toFixed(0)} ${y.toFixed(0)}l${(len * slant).toFixed(0)} ${len.toFixed(0)}`);
  }
  return <path d={lines.join('')} stroke={color} strokeWidth={2.6} strokeLinecap="round" />;
};
