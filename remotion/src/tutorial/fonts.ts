// Inter stands in for the macOS system font (SF Pro can't be bundled). Bundled in public/fonts
// (SIL OFL, from Fontsource) so renders never fetch Google Fonts. Import once per composition.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string][] = [['Inter', '400', 'Inter-400-normal.woff2'], ['Inter', '500', 'Inter-500-normal.woff2'], ['Inter', '600', 'Inter-600-normal.woff2'], ['Inter', '700', 'Inter-700-normal.woff2'], ['IBM Plex Mono', '400', 'IBMPlexMono-400-normal.woff2']];

const handle = delayRender('Loading tutorial fonts');
Promise.all(
  FONTS.map(([family, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style: 'normal', weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
