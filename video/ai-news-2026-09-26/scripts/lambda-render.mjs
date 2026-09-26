// Render AINews on Remotion Lambda and download the MP4 to out/.
import {getFunctions, getRenderProgress, getSites, renderMediaOnLambda, downloadMedia} from '@remotion/lambda';

const region = process.env.REMOTION_REGION || 'us-east-1';
// more than one compatible function may exist: use the one with the most headroom
const [fn] = (await getFunctions({region, compatibleOnly: true})).sort((a, b) => b.timeoutInSeconds - a.timeoutInSeconds || b.memorySizeInMb - a.memorySizeInMb);
if (!fn) throw new Error('No compatible Remotion Lambda function. Run `npm run lambda:deploy` first.');
const {sites} = await getSites({region});
const site = sites.find((s) => s.id === 'ai-news-2026-09-26');
if (!site) throw new Error('Site not deployed. Run `npm run lambda:deploy` first.');

const {renderId, bucketName} = await renderMediaOnLambda({
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
  // newer AWS accounts allow ~10 concurrent Lambdas: 8 chunks + the orchestrator stays under that
  framesPerLambda: Math.ceil(17930 / 8),
  downloadBehavior: {type: 'download', fileName: 'ai-news-2026-09-26.mp4'},
});
console.log(`render ${renderId} started on ${fn.functionName}`);

for (;;) {
  await new Promise((r) => setTimeout(r, 5000));
  const p = await getRenderProgress({renderId, bucketName, functionName: fn.functionName, region});
  if (p.fatalErrorEncountered) throw new Error(JSON.stringify(p.errors, null, 2));
  process.stdout.write(`\r${(p.overallProgress * 100).toFixed(1)}%  `);
  if (p.done) {
    console.log(`\ndone: ${p.outputFile}  cost ≈ $${p.costs.accruedSoFar.toFixed(3)}`);
    break;
  }
}
const {outputPath} = await downloadMedia({bucketName, region, renderId, outPath: 'out/ai-news-2026-09-26.mp4'});
console.log(`saved ${outputPath}`);
