// Autopilot Blue fonts, bundled in public/fonts (SIL OFL, from Fontsource) so renders never fetch Google Fonts.
// Import this file once from any composition that uses the AUTOPILOT tokens.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string][] = [['Instrument Sans', '500', 'InstrumentSans-500-normal.woff2'], ['Instrument Sans', '600', 'InstrumentSans-600-normal.woff2'], ['Hanken Grotesk', '400', 'HankenGrotesk-400-normal.woff2'], ['Hanken Grotesk', '500', 'HankenGrotesk-500-normal.woff2'], ['IBM Plex Mono', '400', 'IBMPlexMono-400-normal.woff2'], ['IBM Plex Mono', '500', 'IBMPlexMono-500-normal.woff2']];

const handle = delayRender('Loading Autopilot Blue fonts');
Promise.all(
  FONTS.map(([family, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style: 'normal', weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
