// Deploy the Remotion Lambda function and upload this project as a site.
// Needs REMOTION_AWS_ACCESS_KEY_ID / REMOTION_AWS_SECRET_ACCESS_KEY (or the AWS_* pair)
// for a user with the Remotion Lambda policy: `npx remotion lambda policies user`.
import {deployFunction, deploySite, getOrCreateBucket} from '@remotion/lambda';
import path from 'node:path';

const region = process.env.REMOTION_REGION || 'us-east-1';

const {functionName, alreadyExisted} = await deployFunction({
  region,
  timeoutInSeconds: 900,
  memorySizeInMb: 3009,
  diskSizeInMb: 10240,
  createCloudWatchLogGroup: true,
});
console.log(`function ${functionName} ${alreadyExisted ? '(already deployed)' : '(created)'}`);

const {bucketName} = await getOrCreateBucket({region});
const {serveUrl} = await deploySite({
  region,
  bucketName,
  entryPoint: path.resolve('src/index.ts'),
  siteName: 'ai-news-2026-09-26',
});
console.log(`site ${serveUrl}`);
