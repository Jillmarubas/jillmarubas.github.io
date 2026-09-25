import {Easing} from 'remotion';

// Colours are the portfolio's own tokens (site/index.html + the frost glass layer).
export const C = {
  ground: '#0a0a0a',
  accent: '#fa5a05',
  accentHover: '#ff7a2e',
  accentDim: '#c2450a',
  amber: '#ffa23a',
  magenta: '#d61f5a',
  violet: '#7c3abe',
  text: '#f3efe9',
  text2: '#9c948b',
  faint: '#8a837a',
  success: '#3ddc84',
  danger: '#ff5a5a',
  glass: 'rgba(12,10,8,.55)',
  glassStrong: 'rgba(10,8,6,.62)',
  glassRaised: 'rgba(26,22,18,.55)',
  rim: 'rgba(255,255,255,.14)',
  rimLit: 'rgba(255,255,255,.30)',
};

export const F = {
  display: "'Archivo', 'Arial Black', sans-serif",
  body: "'IBM Plex Sans', 'Segoe UI', sans-serif",
  mono: "'IBM Plex Mono', Consolas, monospace",
};

// Settle Motion curves (design-system/settle-motion/tokens.css)
export const E = {
  settle: Easing.bezier(0.22, 1, 0.36, 1),
  glide: Easing.bezier(0.65, 0, 0.35, 1),
  depart: Easing.bezier(0.55, 0, 1, 0.45),
  snap: Easing.bezier(0.34, 1.56, 0.64, 1),
};

// Settle Motion durations, in seconds
export const D = {quick: 0.2, base: 0.36, slow: 0.6, hero: 0.9};
export const STAGGER = {letter: 0.04, word: 0.06, card: 0.08};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// The glass recipe, scaled 2x from the web layer for a 1080px-wide frame.
export const glassStyle = (strong = false): React.CSSProperties => ({
  background: strong ? C.glassStrong : C.glass,
  backdropFilter: 'blur(28px) saturate(150%)',
  WebkitBackdropFilter: 'blur(28px) saturate(150%)',
  border: `2px solid ${C.rim}`,
  borderRadius: 36,
  boxShadow:
    '0 36px 92px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.13), inset 0 -2px 0 rgba(0,0,0,.28)',
});

// Nested inside glass: fill and rim only, never a second blur.
export const innerStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: `2px solid ${C.rim}`,
  borderRadius: 20,
  boxShadow: 'inset 0 2px 0 rgba(255,255,255,.12)',
};
