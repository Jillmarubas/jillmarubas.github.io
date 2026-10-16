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
  // the 2D animations (src/hcai/anim) and the street-map style
  ['Poppins', 'normal', '700', 'Poppins-700-normal.woff2'],
  ['Poppins', 'normal', '800', 'Poppins-800-normal.woff2'],
  ['Inter', 'normal', '500', 'Inter-500-normal.woff2'],
  ['Inter', 'normal', '700', 'Inter-700-normal.woff2'],
];
const handle = delayRender('Loading hcai fonts');
Promise.all(
  FONTS.map(([family, style, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style, weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
