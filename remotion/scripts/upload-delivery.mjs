// Upload a finished file to the Remotion bucket under deliveries/ (multipart, through the session proxy).
// Usage: node -r global-agent/bootstrap scripts/upload-delivery.mjs <file> <key> [content-type]
import {S3Client} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import fs from 'node:fs';
const [file, key, type = 'video/mp4'] = process.argv.slice(2);
const Bucket = 'remotionlambda-useast1-c5w9ygbemk';
const up = new Upload({
  client: new S3Client({region: 'us-east-1'}),
  params: {Bucket, Key: key, Body: fs.createReadStream(file), ContentType: type},
  partSize: 64 * 1024 * 1024,
  queueSize: 4,
});
up.on('httpUploadProgress', (p) => process.stdout.write(`\r${Math.round((100 * p.loaded) / (p.total || fs.statSync(file).size))}%`));
await up.done();
console.log(`\ns3://${Bucket}/${key}`);
