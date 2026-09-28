// Time the same frames with individual effects switched off (inputProps from src/perf.ts),
// using Lambda's software GL, to see what each effect costs per frame.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';

const FRAMES = [300, 900, 1200, 1900, 2300, 2800, 3700, 4500, 5150, 7700, 8400, 10500, 11900, 14450, 16700, 17800];
const VARIANTS = {
  baseline: {},
  noGrain: {noGrain: true},
  staticField: {staticField: true},
  noBackdrop: {noBackdrop: true},
  noTextShadow: {noTextShadow: true},
  allOff: {noGrain: true, staticField: true, noBackdrop: true, noTextShadow: true},
};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
for (const [name, inputProps] of Object.entries(VARIANTS)) {
  const composition = await selectComposition({serveUrl, id: 'AINews', inputProps, puppeteerInstance: browser});
  // warm-up so font loading and image decode are not counted
  await renderStill({composition, serveUrl, frame: FRAMES[0], output: '/tmp/bench.jpg', inputProps, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}});
  const t0 = performance.now();
  for (const frame of FRAMES) {
    await renderStill({composition, serveUrl, frame, output: '/tmp/bench.jpg', imageFormat: 'jpeg', inputProps, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}});
  }
  console.log(`${name.padEnd(13)} ${((performance.now() - t0) / FRAMES.length).toFixed(0)} ms/frame`);
}
await browser.close({silent: true});
