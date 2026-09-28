// Synthesise the music bed and every SFX for the video, straight from code.
// usage: npm run audio   (writes public/audio/music.mp3, public/audio/sfx/*.wav, public/audio/manifest.json)
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildBlocks} from '../src/runningOrder.ts';
import {musicGainAt} from '../src/musicDuck.ts';
import {SR, dbToGain, normalizePeak, writeWav} from './dsp.mjs';
import {BPM, renderMusic} from './score.mjs';
import * as SFX from './sfx.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'public/audio');
fs.mkdirSync(path.join(out, 'sfx'), {recursive: true});

const timeline = JSON.parse(fs.readFileSync(path.join(root, 'src/data/timeline.json'), 'utf8'));
const dur = (id) => timeline.find((s) => s.id === id).duration;
const {blocks, total} = buildBlocks(dur);

// remotion ships an ffmpeg; use it so the build has no extra dependency
const ffmpeg = (args) => {
  const r = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-y', ...args], {cwd: root, encoding: 'utf8'});
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stderr;
};

console.time('sfx');
for (const [name, gen] of Object.entries(SFX)) {
  const buf = normalizePeak(gen(), -1);
  writeWav(path.join(out, 'sfx', `${name}.wav`), buf);
}
console.timeEnd('sfx');

console.time('music');
const music = renderMusic(blocks, total);
normalizePeak(music, -3);
fs.mkdirSync(path.join(root, 'out'), {recursive: true});
const raw = path.join(root, 'out', 'music-raw.wav');
writeWav(raw, music);
console.timeEnd('music');

// measure the un-ducked bed, bring it to -16 LUFS with a static gain, then bake in the
// ducking (src/musicDuck.ts) so Remotion can play it at a fixed volume
const measure = ffmpeg(['-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
const m = JSON.parse(measure.slice(measure.lastIndexOf('{'), measure.lastIndexOf('}') + 1));
const gain = dbToGain(-16 - Number(m.input_i));
for (let i = 0; i < music[0].length; i++) {
  const g = gain * musicGainAt(i / SR, blocks, total);
  music[0][i] *= g;
  music[1][i] *= g;
}
const ducked = path.join(root, 'out', 'music-ducked.wav');
writeWav(ducked, music);
ffmpeg(['-i', ducked, '-c:a', 'libmp3lame', '-b:a', '256k', path.join(out, 'music.mp3')]);
fs.rmSync(raw);
fs.rmSync(ducked);
console.log(`music: ${total.toFixed(2)} s, bed measured ${m.input_i} LUFS, set to -16 LUFS, ducking baked in`);

fs.writeFileSync(
  path.join(out, 'manifest.json'),
  JSON.stringify({bpm: BPM, total, blocks: blocks.map((b) => ({kind: b.kind, start: +b.start.toFixed(4)}))}, null, 1),
);
