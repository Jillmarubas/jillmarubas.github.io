// Bundled fonts (public/fonts) so renders never fetch from the network.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string][] = [
  ['Poppins', '600', 'Poppins-600-normal.woff2'],
  ['Poppins', '700', 'Poppins-700-normal.woff2'],
  ['Poppins', '800', 'Poppins-800-normal.woff2'],
  ['Nunito', '700', 'Nunito-700-normal.woff2'],
  ['Nunito', '800', 'Nunito-800-normal.woff2'],
];

const handle = delayRender('Loading dcc fonts');
Promise.all(
  FONTS.map(([family, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
