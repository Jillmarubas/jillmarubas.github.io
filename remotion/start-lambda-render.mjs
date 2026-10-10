// Starts a render on Lambda and prints the render id and bucket as JSON.
// Progress is read from S3 by render-lambda.sh so no extra Lambda slots are used for polling.
import {renderMediaOnLambda} from '@remotion/lambda/client';

const [composition, region, functionName, serveUrl, framesPerLambda] = process.argv.slice(2);
const {renderId, bucketName} = await renderMediaOnLambda({
  region,
  functionName,
  serveUrl,
  composition,
  codec: 'h264',
  crf: 16,
  // SCALE=2 renders a 1920×1080 composition natively at 3840×2160 (4K): everything is drawn in code, so it stays sharp
  scale: Number(process.env.SCALE || 1),
  privacy: 'private',
  chromiumOptions: {gl: 'swangle'},
  framesPerLambda: Number(framesPerLambda),
  // motion-blurred 3D frames render several sub-frames; allow up to 4 min per frame
  timeoutInMilliseconds: 240000,
});
console.log(JSON.stringify({renderId, bucketName}));
