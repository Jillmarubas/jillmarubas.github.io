// node src/cutaway/effectcraft/run_export.mjs <out-dir>
// Bundles export.ts, runs it in headless Chromium and writes one .glb per part plus pivots.json.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright'); // globally installed in the cloud box: PLAYWRIGHT_PATH=/opt/node-tools/node_modules/playwright

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.resolve(process.argv[2] || 'out');
fs.mkdirSync(out, {recursive: true});
const bundle = path.join(out, '.export.bundle.js');
execFileSync(path.join(here, '../../../node_modules/.bin/esbuild'), [path.join(here, 'export.ts'), '--bundle', '--format=iife', '--resolve-extensions=.ts,.js', `--outfile=${bundle}`, '--log-level=error']);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.setContent('<html><body></body></html>');
await page.addScriptTag({path: bundle});
const res = await page.evaluate(() => window.exportParts());
for (const [name, b64] of Object.entries(res.glb)) {
  fs.writeFileSync(path.join(out, `${name}.glb`), Buffer.from(b64, 'base64'));
  console.log(name, Math.round(Buffer.from(b64, 'base64').length / 1024), 'KB');
}
fs.writeFileSync(path.join(out, 'pivots.json'), JSON.stringify(res.pivots, null, 1));
fs.rmSync(bundle);
await browser.close();
