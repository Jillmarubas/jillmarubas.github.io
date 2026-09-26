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
  privacy: 'private',
  chromiumOptions: {gl: 'swangle'},
  framesPerLambda: Number(framesPerLambda),
});
console.log(JSON.stringify({renderId, bucketName}));
