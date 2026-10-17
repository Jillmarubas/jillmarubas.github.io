// Oz: shared look — cached scissor cuts, colour palette, fabric patterns and the multiplane camera.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {cut, Pt, PaperDefs} from '../paperkite/kit';

export const W = 1920;
export const H = 1080;
export const FPS = 24000 / 1001; // film standard 23.976
export const fr = (s: number) => Math.round(s * FPS);
export const io = Easing.bezier(0.45, 0, 0.2, 1);
export const settle = Easing.bezier(0.22, 1, 0.36, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const rs = (t: number, a: number, b: number, from = 0, to = 1, easing = io) => interpolate(t, [a, b], [from, to], {...cl, easing});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Scissor-cut paths are deterministic, so cache them: the film is ~12,000 frames.
const CACHE = new Map<string, string>();
export const cutC = (pts: Pt[], seed: string, amp = 1.6, seg = 16, closed = true) => {
  const key = seed + '|' + amp + '|' + seg + '|' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(';');
  let v = CACHE.get(key);
  if (!v) {
    v = cut(pts, seed, amp, seg, closed);
    if (CACHE.size > 20000) CACHE.clear();
    CACHE.set(key, v);
  }
  return v;
};

export const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, '0')).join('');
};

// Palette (see ART-REFERENCE.md). Kansas is weathered and dusty but rich, never washed out; Oz is fully saturated.
export const OZ = {
  // Kansas
  skyK: '#9FB3BE',
  skyK2: '#C9D2CF',
  stormSky: '#4E5B57',
  stormGreen: '#5E7462',
  stormDark: '#2C3532',
  dirt: '#8C7356',
  dirtDark: '#6E5A43',
  plow: '#7A634A',
  grass: '#A79A6A',
  grass2: '#8E8558',
  wood: '#8F877B', // weathered unpainted pine
  woodDark: '#6E675D',
  woodLight: '#A69E91',
  roof: '#5F5B55',
  glass: '#2F3A40',
  // costumes
  skinG: '#F0C9A8', // girl
  skinGs: '#D9A585',
  skinW: '#E2B898', // weathered adults
  skinWs: '#C4977A',
  gingham: 'url(#gingham)',
  bonnet: '#E28AA0',
  emDress: '#6B6258',
  apron: '#E7E0D2',
  henryShirt: '#7D8D99',
  trousers: '#5A4A3A',
  boots: '#2A221C',
  beard: '#B9B5AE',
  // Oz
  skyO: '#5FB6F0',
  skyO2: '#BFE6FF',
  grassO: '#3FAE3B',
  grassO2: '#2E8F2E',
  grassO3: '#6CC94A',
  treeO: '#1F7A3A',
  treeO2: '#2E9A47',
  brook: '#3FA8D8',
  brook2: '#9EDCF5',
  flowerR: '#E8344A',
  flowerY: '#F7C51E',
  flowerP: '#B24BCF',
  flowerO: '#F28A1E',
  munchBlue: '#2457C5',
  munchBlue2: '#3B78E0',
  witchWhite: '#F5F2EA',
  silver: '#C9D1D9',
};

// Filters and fabric patterns, once per SVG.
export const OzDefs: React.FC = () => (
  <>
    <PaperDefs />
    <defs>
      <filter id="shade">
        <feColorMatrix type="matrix" values="0.82 0 0 0 0  0 0.82 0 0 0  0 0 0.86 0 0  0 0 0 1 0" />
      </filter>
      {/* blue-and-white gingham: Dorothy's dress, from the book */}
      <pattern id="gingham" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#F4F6FA" />
        <rect width="20" height="40" fill="#5C8BD6" opacity={0.65} />
        <rect width="40" height="20" fill="#5C8BD6" opacity={0.65} />
      </pattern>
      {/* small calico print for Aunt Em */}
      <pattern id="calico" width="36" height="36" patternUnits="userSpaceOnUse">
        <rect width="36" height="36" fill="#6B6258" />
        <circle cx="9" cy="9" r="3" fill="#867B6E" />
        <circle cx="27" cy="25" r="3" fill="#867B6E" />
      </pattern>
      {/* weathered board texture */}
      <pattern id="grain" width="300" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 6 Q80 3 160 7 T300 5 M0 15 Q90 18 170 14 T300 16" stroke="rgba(40,30,20,0.18)" strokeWidth="2" fill="none" />
      </pattern>
      <linearGradient id="skyK" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8EA4B1" />
        <stop offset="1" stopColor="#D4D8CC" />
      </linearGradient>
      <linearGradient id="skyStorm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#25302D" />
        <stop offset="0.55" stopColor="#4B5E52" />
        <stop offset="1" stopColor="#8A9A7E" />
      </linearGradient>
      <linearGradient id="skyO" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3E9FE6" />
        <stop offset="1" stopColor="#CFEFFF" />
      </linearGradient>
      <radialGradient id="sunGlow">
        <stop offset="0" stopColor="#FFF6C8" stopOpacity={0.95} />
        <stop offset="0.4" stopColor="#FFE38A" stopOpacity={0.4} />
        <stop offset="1" stopColor="#FFE38A" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF3C4" stopOpacity={0.55} />
        <stop offset="1" stopColor="#FFF3C4" stopOpacity={0} />
      </linearGradient>
    </defs>
  </>
);

// ---------- multiplane camera (never a zoom: planes scale by d / (d - z)) ----------
export type Cam = {x: number; y: number; z: number};
const CamCtx = createContext<Cam>({x: 0, y: 0, z: 0});
export const Plane: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const c = useContext(CamCtx);
  const s = d / (d - c.z);
  const f = 1000 / d;
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2 - c.x * f} ${-H / 2 - c.y * f})`}>{children}</g>;
};
export const Shot: React.FC<{cam: Cam; children: React.ReactNode; bg?: string; shake?: number}> = ({cam, children, bg = '#000', shake = 0}) => {
  const f = useCurrentFrame();
  const sx = shake ? Math.sin(f * 1.7) * shake + Math.sin(f * 3.1) * shake * 0.5 : 0;
  const sy = shake ? Math.cos(f * 2.3) * shake * 0.7 : 0;
  return (
    <AbsoluteFill style={{background: bg}}>
      <svg width={W} height={H} viewBox={`${sx} ${sy} ${W} ${H}`}>
        <OzDefs />
        <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
      </svg>
    </AbsoluteFill>
  );
};

// Time inside a shot: smooth for the camera, held on twos for drawings.
export const useT = () => useCurrentFrame() / FPS;
export const useTw = () => {
  const f = useCurrentFrame();
  return (f - (f % 2)) / FPS;
};
