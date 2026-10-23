// node src/three-tools/run_glb_export.mjs <entry.ts> <out-dir>
// Bundles an exporter entry (it must set window.exportParts() -> {glb: {name: base64}, rig?}), runs it in
// headless Chromium and writes <name>.glb files plus rig.json. Set PLAYWRIGHT_PATH if playwright isn't local
// (cloud box: PLAYWRIGHT_PATH=/opt/node-tools/node_modules/playwright).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const entry = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3] || 'out');
fs.mkdirSync(out, {recursive: true});
const bundle = path.join(out, '.export.bundle.js');
execFileSync(path.join(here, '../../node_modules/.bin/esbuild'), [entry, '--bundle', '--format=iife', '--resolve-extensions=.ts,.js', `--outfile=${bundle}`, '--log-level=error']);
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.setContent('<html><body></body></html>');
await page.addScriptTag({path: bundle});
const res = await page.evaluate(() => window.exportParts());
let total = 0;
for (const [name, b64] of Object.entries(res.glb)) {
  const buf = Buffer.from(b64, 'base64');
  total += buf.length;
  fs.writeFileSync(path.join(out, `${name}.glb`), buf);
}
if (res.rig) fs.writeFileSync(path.join(out, 'rig.json'), JSON.stringify(res.rig, null, 1));
console.log(Object.keys(res.glb).length, 'models,', Math.round(total / 1024), 'KB');
fs.rmSync(bundle);
await browser.close();
