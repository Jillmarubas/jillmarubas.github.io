// Render only the soundtrack (voice + music bed + SFX) to WAV, for audio-only fixes
// that don't need the 40-minute picture render.
import {renderMedia, selectComposition} from '@remotion/renderer';

const [serveUrl, output] = process.argv.slice(2);
const browserExecutable = process.env.BROWSER;
const composition = await selectComposition({serveUrl, id: 'AINewsShort', browserExecutable});
await renderMedia({composition, serveUrl, codec: 'wav', outputLocation: output, browserExecutable});
console.log('wrote', output);
