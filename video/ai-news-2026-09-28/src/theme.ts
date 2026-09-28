import {Easing, continueRender, delayRender, staticFile} from 'remotion';

// Settle Motion tokens, from design-system/settle-motion/tokens.css and settle-motion.html.
// Night panels on black, paper panels for quotes and story cards, one ambient green haze,
// and mint for exactly one job: active, live or done.
export const C = {
  night: '#000000',
  night2: '#151615', // cards on night (graphite)
  edge: '#222622', // 1px edge on night panels
  onNight: '#F2F3F2', // words, once spoken
  onNight2: '#9DA39F', // labels, captions
  floor: '#525252', // words not yet spoken (word-floor)
  paper: '#FEFEFE',
  mist: '#F5F5F5',
  ink: '#0A0C0B',
  ink2: '#5B605C',
  line: '#E1E3E1',
  mint: '#ABFEC1', // active / live / done only
  mintInk: '#0A2A14',
  glow: '#121B15',
  hair: 'rgba(242,243,242,.12)', // hairlines on night
  pillEdge: 'rgba(242,243,242,.22)',
};

// word-floor: opacity of a word that is on screen but not yet spoken
export const WORD_FLOOR = 0.22;

// Fonts are self-hosted in public/fonts (from @fontsource, latin subset), so a render never
// depends on a network fetch, locally or on Lambda. No frame renders until all have loaded.
const FACES: [string, string, string][] = [
  ['Instrument Sans', 'InstrumentSans-var.woff2', '400 700'],
  ['Martian Mono', 'MartianMono-400.woff2', '400'],
  ['Martian Mono', 'MartianMono-500.woff2', '500'],
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
  sans: `'Instrument Sans', 'Helvetica Neue', Arial, sans-serif`,
  mono: `'Martian Mono', ui-monospace, monospace`,
};

// Settle Motion curves and durations (frames at 30 fps)
export const settle = Easing.bezier(0.22, 1, 0.36, 1); // entrances
export const glide = Easing.bezier(0.65, 0, 0.35, 1); // in-view moves, markers, counters
export const depart = Easing.bezier(0.55, 0, 1, 0.45); // exits, one step shorter
export const snap = Easing.bezier(0.34, 1.56, 0.64, 1); // success only
export const DUR = {quick: 6, base: 11, slow: 18, hero: 27};
export const STAGGER = {letter: 1.2, word: 1.8, card: 2.4}; // 40 / 60 / 80 ms
export const RISE = {nudge: 8, sm: 24, card: 48};
export const BLUR_IN = 8; // never more
export const R = {panel: 28, stage: 20, chip: 999};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
