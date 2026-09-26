// Render AINews on Remotion Lambda and download the MP4 to out/.
import {getRenderProgress, getSites, renderMediaOnLambda, downloadMedia} from '@remotion/lambda';
import {speculateFunctionName} from '@remotion/lambda/client';

const region = process.env.REMOTION_REGION || 'us-east-1';
// Address the function by its deterministic name (what lambda:deploy creates). Probing
// with getFunctions() invokes every function to read its version, and those calls are
// throttled while a render is using all of this account's ~10 concurrent slots.
const fn = {functionName: speculateFunctionName({memorySizeInMb: 3008, diskSizeInMb: 10240, timeoutInSeconds: 900})};
const {sites} = await getSites({region});
const site = sites.find((s) => s.id === 'ai-news-2026-09-26');
if (!site) throw new Error('Site not deployed. Run `npm run lambda:deploy` first.');

// RENDER_ID=… re-attaches to a render that is already running instead of starting one
const {renderId, bucketName} = process.env.RENDER_ID
  ? {renderId: process.env.RENDER_ID, bucketName: sites.find((x) => x.id === 'ai-news-2026-09-26').bucketName}
  : await renderMediaOnLambda({
    region,
    functionName: fn.functionName,
    serveUrl: site.serveUrl,
    composition: 'AINews',
    codec: 'h264',
    crf: 18,
    audioCodec: 'aac',
    audioBitrate: '320k',
    imageFormat: 'jpeg',
    jpegQuality: 92,
    // This account allows ~10 concurrent Lambdas (18 chunks were throttled), so: 8 chunks
    // plus the orchestrator. One frame at a time ran ~2.5 fps per Lambda and timed out at
    // 900 s; a 3008 MB Lambda has 2 vCPUs, so render two frames at a time.
    concurrencyPerLambda: 2,
    framesPerLambda: Math.ceil(17930 / 8),
    downloadBehavior: {type: 'download', fileName: 'ai-news-2026-09-26.mp4'},
    });
console.log(`render ${renderId} ${process.env.RENDER_ID ? 'resumed' : 'started'} on ${fn.functionName}`);

for (;;) {
  await new Promise((r) => setTimeout(r, 5000));
  // a progress check is itself a Lambda call; while every slot is rendering it can be
  // throttled, so wait and ask again instead of giving up on a healthy render
  let p;
  try {
    p = await getRenderProgress({renderId, bucketName, functionName: fn.functionName, region});
  } catch (e) {
    if (e.name === 'TooManyRequestsException') continue;
    throw e;
  }
  if (p.fatalErrorEncountered) throw new Error(JSON.stringify(p.errors, null, 2));
  process.stdout.write(`\r${(p.overallProgress * 100).toFixed(1)}%  `);
  if (p.done) {
    console.log(`\ndone: ${p.outputFile}  cost ≈ $${p.costs.accruedSoFar.toFixed(3)}`);
    break;
  }
}
const {outputPath} = await downloadMedia({bucketName, region, renderId, outPath: 'out/ai-news-2026-09-26.mp4'});
console.log(`saved ${outputPath}`);
