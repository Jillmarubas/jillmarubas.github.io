// Fonts are bundled in public/fonts so renders never depend on fetching Google Fonts.
import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS: [string, string, string, string][] = [['Caveat', 'normal', '600', 'Caveat-600-normal.woff2'], ['Inter', 'italic', '800', 'Inter-800-italic.woff2'], ['Inter', 'normal', '500', 'Inter-500-normal.woff2'], ['Inter', 'normal', '800', 'Inter-800-normal.woff2'], ['Poppins', 'normal', '600', 'Poppins-600-normal.woff2'], ['Poppins', 'normal', '700', 'Poppins-700-normal.woff2'], ['Poppins', 'normal', '800', 'Poppins-800-normal.woff2']];

const handle = delayRender('Loading fonts');
Promise.all(
  FONTS.map(([family, style, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {style, weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
