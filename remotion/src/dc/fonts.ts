// Bundled fonts (public/fonts) so renders never fetch from the network.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string, string][] = [
  ['Fraunces', 'normal', '600', 'Fraunces-600-normal.woff2'],
  ['Fraunces', 'normal', '900', 'Fraunces-900-normal.woff2'],
  ['Fraunces', 'italic', '600', 'Fraunces-600-italic.woff2'],
  ['IBM Plex Sans', 'normal', '500', 'IBMPlexSans-500-normal.woff2'],
  ['IBM Plex Sans', 'normal', '700', 'IBMPlexSans-700-normal.woff2'],
  ['IBM Plex Mono', 'normal', '500', 'IBMPlexMono-500-normal.woff2'],
  ['Caveat', 'normal', '600', 'Caveat-600-normal.woff2'],
];

const handle = delayRender('Loading dc fonts');
Promise.all(
  FONTS.map(([family, style, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style, weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
