import {Easing, continueRender, delayRender, staticFile} from 'remotion';

// Frost Glass tokens, lifted from design-system/frost-glass and site/index.html.
export const C = {
  ground: '#0a0a0a',
  accent: '#fa5a05',
  accentHi: '#ff7a2e',
  accentDim: '#c2450a',
  text: '#f3efe9',
  text2: '#9c948b',
  faint: '#8a837a',
  danger: '#ff5a5a',
  glass: 'rgba(12,10,8,.55)',
  glassStrong: 'rgba(10,8,6,.62)',
  glassRaised: 'rgba(26,22,18,.55)',
  rim: 'rgba(255,255,255,.14)',
  rimLit: 'rgba(255,255,255,.30)',
};

export const glassDepth =
  '0 18px 46px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.13), inset 0 -1px 0 rgba(0,0,0,.28)';

// Fonts are self-hosted in public/fonts (Google Fonts, latin subset), so a render never
// depends on a network fetch — locally or on Lambda. No frame renders until all have loaded.
const FACES: [string, string, string][] = [
  ['Archivo', 'Archivo-var.woff2', '100 900'],
  ['IBM Plex Sans', 'IBMPlexSans-var.woff2', '100 700'],
  ['IBM Plex Mono', 'IBMPlexMono-400.woff2', '400'],
  ['IBM Plex Mono', 'IBMPlexMono-500.woff2', '500'],
  ['IBM Plex Mono', 'IBMPlexMono-600.woff2', '600'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(
    FACES.map(([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      throw err;
    });
}

export const F = {
  display: `'Archivo', 'Arial Black', sans-serif`,
  body: `'IBM Plex Sans', sans-serif`,
  mono: `'IBM Plex Mono', monospace`,
};

// Settle Motion curves
export const settle = Easing.bezier(0.22, 1, 0.36, 1);
export const depart = Easing.bezier(0.55, 0, 1, 0.45);
export const snap = Easing.bezier(0.34, 1.56, 0.64, 1);
export const glide = Easing.bezier(0.65, 0, 0.35, 1);

export const FPS = 30;
export const W = 1920;
export const H = 1080;
