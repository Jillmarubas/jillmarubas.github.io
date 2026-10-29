// Bundled fonts (public/fonts, SIL OFL 1.1 via @fontsource) so renders never fetch from the network.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string, string][] = [
  ['Playfair Display', 'normal', '700', 'PlayfairDisplay-700-normal.woff2'],
  ['Playfair Display', 'normal', '900', 'PlayfairDisplay-900-normal.woff2'],
  ['Playfair Display', 'italic', '400', 'PlayfairDisplay-400-italic.woff2'],
  ['Courier Prime', 'normal', '400', 'CourierPrime-400-normal.woff2'],
  ['Courier Prime', 'normal', '700', 'CourierPrime-700-normal.woff2'],
  ['Special Elite', 'normal', '400', 'SpecialElite-400-normal.woff2'],
  ['IBM Plex Sans Condensed', 'normal', '400', 'IBMPlexSansCondensed-400-normal.woff2'],
  ['IBM Plex Sans Condensed', 'normal', '700', 'IBMPlexSansCondensed-700-normal.woff2'],
];

const handle = delayRender('Loading Invisible Cassette fonts');
Promise.all(
  FONTS.map(([family, style, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style, weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
