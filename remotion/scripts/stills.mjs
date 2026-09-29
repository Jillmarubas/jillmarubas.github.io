// Render preview stills for QA: node scripts/stills.mjs <CompositionId> <outdir> <scale> <frame...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [id, outDir, scale, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell')).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];
const composition = await selectComposition({serveUrl, id, browserExecutable, chromiumOptions: {gl: 'swangle'}});
for (const fr of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: Number(fr), output: `${outDir}/p${fr}.jpg`, imageFormat: 'jpeg', scale: Number(scale), browserExecutable, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log(`frame ${fr}: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
