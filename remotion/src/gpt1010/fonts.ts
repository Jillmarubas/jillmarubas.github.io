// Bundled in public/fonts (SIL OFL) so renders never fetch Google Fonts.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string][] = [
  ['Geist', '800', 'Geist-800-normal.woff2'], ['Geist', '900', 'Geist-900-normal.woff2'],
  ['Inter', '400', 'Inter-400-normal.woff2'], ['Inter', '500', 'Inter-500-normal.woff2'], ['Inter', '600', 'Inter-600-normal.woff2'], ['Inter', '700', 'Inter-700-normal.woff2'],
  ['IBM Plex Mono', '400', 'IBMPlexMono-400-normal.woff2'], ['IBM Plex Mono', '500', 'IBMPlexMono-500-normal.woff2'],
];

const handle = delayRender('Loading gpt1010 fonts');
Promise.all(
  FONTS.map(([family, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style: 'normal', weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
