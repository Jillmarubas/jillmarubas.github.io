// Cobalt Haze tokens (design-system/cobalt-haze/tokens.css), translated for video.
import {Easing, continueRender, delayRender, staticFile} from 'remotion';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  cobalt950: '#041F5C',
  cobalt800: '#05348E',
  cobalt600: '#18469C',
  azure400: '#4D71AD',
  periwinkle200: '#A9BAD4',
  ice100: '#B1C8E0',
  haze100: '#C9C6CD',
  frost: '#F4F6FB',
  text1: '#F4F6FB',
  text2: '#D6DFF0',
  rule: 'rgba(255,255,255,0.16)',
  ok: '#86E8C6',
  warn: '#F7CD86',
  err: '#FF9C9C',
  glassChrome: 'rgba(255,255,255,0.08)',
  glassPanel: 'rgba(255,255,255,0.12)',
  glassModal: 'rgba(255,255,255,0.18)',
  glassSheet: 'rgba(4,31,92,0.60)',
  rim: 'rgba(255,255,255,0.26)',
  rimStrong: 'rgba(244,246,251,0.75)',
};

export const SHADOW = {
  float: '0 24px 60px rgba(2,14,48,0.35)',
  litTop: 'inset 0 1px 0 rgba(255,255,255,0.30)',
  shadeBottom: 'inset 0 -1px 0 rgba(0,0,0,0.12)',
};

export const F = {
  sans: "'Geist', 'Segoe UI', system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'Geist Mono', ui-monospace, Consolas, monospace",
};

// Cobalt Haze's --ease-glass for arrivals; ease-in-out (peak speed at the midpoint) for moves.
export const glass = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.45, 0, 0.2, 1);
export const depart = Easing.bezier(0.55, 0, 1, 0.45);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FONTS: [string, string, string, string][] = [
  ['Geist', 'normal', '300', 'Geist-300-normal.woff2'],
  ['Geist', 'normal', '400', 'Geist-400-normal.woff2'],
  ['Geist', 'normal', '500', 'Geist-500-normal.woff2'],
  ['Geist', 'normal', '600', 'Geist-600-normal.woff2'],
  ['Geist Mono', 'normal', '500', 'GeistMono-500-normal.woff2'],
  ['Instrument Serif', 'italic', '400', 'InstrumentSerif-400-italic.woff2'],
];

// Fonts are bundled in public/fonts so renders never depend on fetching Google Fonts.
const handle = delayRender('Loading Cobalt Haze fonts');
Promise.all(
  FONTS.map(([family, style, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style, weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
