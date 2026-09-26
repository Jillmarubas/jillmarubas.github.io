// Render AINews on Remotion Lambda and assemble out/ai-news-2026-09-26.mp4.
//
// Why it is split: this account allows ~10 concurrent Lambdas (8 renderers + the
// orchestrator), a Lambda may run 900 s, and a 1080p frame costs ~1 s in Lambda's software
// renderer — so 17,930 frames cannot fit in one render. Instead:
//   1. one audio-only render of the whole mix (WAV; no screenshots, so it is quick),
//   2. the picture as sequential muted H.264 parts, 8 chunks each, sized to finish in time,
//   3. locally: join the parts without re-encoding and mux the audio, encoded once to AAC.
// A single audio render means no joins in the sound; the picture joins are frame-exact
// because every part starts on a keyframe. Finished parts are skipped on a re-run.
import {downloadMedia, getRenderProgress, getSites, renderMediaOnLambda} from '@remotion/lambda';
import {speculateFunctionName} from '@remotion/lambda/client';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const region = process.env.REMOTION_REGION || 'us-east-1';
const TOTAL_FRAMES = 17930;
const PARTS = 5;
const CHUNKS = 8;
const OUT = path.resolve('out');
const PARTS_DIR = path.join(OUT, 'parts');
fs.mkdirSync(PARTS_DIR, {recursive: true});

// The function lambda:deploy creates, addressed by name: probing functions with
// getFunctions() invokes them, and those calls are throttled while a render is using
// every concurrent slot.
const functionName = speculateFunctionName({memorySizeInMb: 3008, diskSizeInMb: 10240, timeoutInSeconds: 900});
const {sites} = await getSites({region});
const site = sites.find((s) => s.id === 'ai-news-2026-09-26');
if (!site) throw new Error('Site not deployed. Run `npm run lambda:deploy` first.');

const render = async (label, file, options) => {
  if (fs.existsSync(file)) {
    console.log(`${label}: already downloaded, skipping`);
    return;
  }
  const {renderId, bucketName} = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl: site.serveUrl,
    composition: 'AINews',
    imageFormat: 'jpeg',
    jpegQuality: 92,
    ...options,
  });
  console.log(`${label}: render ${renderId} started`);
  let cost = 0;
  for (;;) {
    await new Promise((r) => setTimeout(r, 8000));
    let p;
    try {
      p = await getRenderProgress({renderId, bucketName, functionName, region});
    } catch (e) {
      // a progress check is itself a Lambda call and is throttled while all slots render
      if (e.name === 'TooManyRequestsException') continue;
      throw e;
    }
    if (p.fatalErrorEncountered) throw new Error(`${label}: ${p.errors.map((x) => x.message).join('\n')}`);
    process.stdout.write(`\r${label}: ${(p.overallProgress * 100).toFixed(1)}%   `);
    if (p.done) {
      cost = p.costs.accruedSoFar;
      break;
    }
  }
  await downloadMedia({bucketName, region, renderId, outPath: file});
  console.log(`\n${label}: done, ≈ $${cost.toFixed(3)} → ${path.relative(process.cwd(), file)}`);
};

// 1. the whole soundtrack, once
await render('audio', path.join(PARTS_DIR, 'audio.wav'), {
  codec: 'wav',
  inputProps: {audioOnly: true}, // same audio tags, no picture to lay out (src/Video.tsx)
  framesPerLambda: Math.ceil(TOTAL_FRAMES / CHUNKS),
});

// 2. the picture, in sequential parts
const perPart = Math.ceil(TOTAL_FRAMES / PARTS);
for (let i = 0; i < PARTS; i++) {
  const from = i * perPart;
  const to = Math.min(TOTAL_FRAMES, from + perPart) - 1;
  await render(`video ${i + 1}/${PARTS} (frames ${from}-${to})`, path.join(PARTS_DIR, `video-${i + 1}.mp4`), {
    codec: 'h264',
    crf: 18,
    muted: true,
    frameRange: [from, to],
    framesPerLambda: Math.ceil((to - from + 1) / CHUNKS),
    concurrencyPerLambda: 2,
  });
}

// 3. join and mux with Remotion's bundled ffmpeg
const list = path.join(PARTS_DIR, 'list.txt');
fs.writeFileSync(list, Array.from({length: PARTS}, (_, i) => `file 'video-${i + 1}.mp4'`).join('\n') + '\n');
const ff = (args) => {
  const r = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-y', ...args], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(r.stderr);
};
ff([
  '-f', 'concat', '-safe', '0', '-i', list,
  '-i', path.join(PARTS_DIR, 'audio.wav'),
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', '-shortest',
  path.join(OUT, 'ai-news-2026-09-26.mp4'),
]);
console.log('saved out/ai-news-2026-09-26.mp4');
