// Render specific frames (or every Nth frame) to out/frames/ for frame-by-frame review.
// usage: node scripts/stills.mjs 120 480 900     |  node scripts/stills.mjs --every 60 [--from A --to B]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? Number(args[args.indexOf(k) + 1]) : d);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const comp = await selectComposition({serveUrl, id: 'AINews'});
let frames = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--')).map(Number);
if (args.includes('--every')) {
  const every = opt('--every', 60);
  frames = [];
  for (let f = opt('--from', 0); f < Math.min(opt('--to', comp.durationInFrames), comp.durationInFrames); f += every) frames.push(f);
}
fs.mkdirSync('out/frames', {recursive: true});
console.log(`duration ${comp.durationInFrames} frames = ${(comp.durationInFrames / 30).toFixed(2)} s; rendering ${frames.length} stills`);
const t0 = Date.now();
// a handful in parallel, sharing one browser
const queue = [...frames];
const worker = async () => {
  while (queue.length) {
    const f = queue.shift();
    await renderStill({composition: comp, serveUrl, frame: f, output: `out/frames/f${String(f).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5});
  }
};
await Promise.all([worker(), worker(), worker()]);
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
