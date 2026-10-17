// Starts a render on Lambda and prints the render id and bucket as JSON.
// Progress is read from S3 by render-lambda.sh so no extra Lambda slots are used for polling.
import {renderMediaOnLambda} from '@remotion/lambda/client';

const [composition, region, functionName, serveUrl, framesPerLambda, scale = '1', inputProps = '{}'] = process.argv.slice(2);
const {renderId, bucketName} = await renderMediaOnLambda({
  region,
  functionName,
  serveUrl,
  composition,
  codec: 'h264',
  crf: 16,
  privacy: 'private',
  chromiumOptions: {gl: 'swangle'},
  framesPerLambda: Number(framesPerLambda),
  // SCALE=2 renders a 1080x1920 composition as a 2160x3840 (4K) master
  scale: Number(scale),
  inputProps: JSON.parse(inputProps),
  // motion-blurred 3D frames render several sub-frames; allow up to 4 min per frame
  timeoutInMilliseconds: 240000,
});
console.log(JSON.stringify({renderId, bucketName}));
