// Dump the film's sound cues (scene windows, typed prompts, key taps, clicks) to out/gpt1010/cues.json
// for scripts/mix_gpt1010.py. Bundles src/gpt1010/cues.ts with esbuild so the mixer reads the exact
// same times the picture uses.
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('out/gpt1010');
fs.mkdirSync(out, {recursive: true});
const tmp = path.join(out, 'cues.bundle.mjs');
await build({stdin: {contents: "export {SOUND} from './src/gpt1010/cues'; export {WINDOWS, DURATION, CHAPTERS} from './src/gpt1010/plan';", resolveDir: path.resolve('.'), loader: 'ts'}, bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'error'});
const m = await import(tmp);
const json = {duration: m.DURATION, chapters: m.CHAPTERS.map((c) => ({vo: c.vo})), windows: m.WINDOWS.map((w) => ({name: w.name, start: w.start, tr: w.tr, ch: w.ch, from: w.from})), ...m.SOUND()};
fs.writeFileSync(path.join(out, 'cues.json'), JSON.stringify(json, null, 1));
fs.unlinkSync(tmp);
console.log(`${json.windows.length} scenes, ${json.typed.length} typed, ${json.keys.length} keys, ${json.clicks.length} clicks`);
