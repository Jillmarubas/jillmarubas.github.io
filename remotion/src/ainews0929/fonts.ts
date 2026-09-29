// Fonts are bundled in public/fonts so renders never depend on fetching Google Fonts.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string, string][] = [
  ['Geist', 'normal', '300', 'Geist-300-normal.woff2'],
  ['Geist', 'normal', '400', 'Geist-400-normal.woff2'],
  ['Geist', 'normal', '500', 'Geist-500-normal.woff2'],
  ['Geist', 'normal', '600', 'Geist-600-normal.woff2'],
  ['Geist', 'normal', '800', 'Geist-800-normal.woff2'], // thumbnails only
  ['Geist', 'normal', '900', 'Geist-900-normal.woff2'], // thumbnails only
  ['Geist Mono', 'normal', '500', 'GeistMono-500-normal.woff2'],
  ['Instrument Serif', 'italic', '400', 'InstrumentSerif-400-italic.woff2'],
];

const handle = delayRender('Loading Cobalt Haze fonts');
Promise.all(
  FONTS.map(([family, style, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style, weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
