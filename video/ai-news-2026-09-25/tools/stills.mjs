// Render stills at given times (seconds) from a pre-built bundle, for review.
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [serveUrl, outDir, ...times] = process.argv.slice(2);
const browserExecutable = process.env.BROWSER;
const composition = await selectComposition({serveUrl, id: 'AINewsShort', browserExecutable, chromiumOptions: {gl: 'swangle'}});
for (const t of times) {
  const frame = Math.round(parseFloat(t) * composition.fps);
  const output = path.join(outDir, `t${String(t).padStart(6, '0')}.jpg`);
  const s = Date.now();
  await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, chromiumOptions: {gl: 'swangle'}, scale: 0.5});
  console.log(output, Date.now() - s, 'ms');
}
