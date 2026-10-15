// Download one object from the Remotion bucket (through the session proxy).
// Usage: node -r global-agent/bootstrap scripts/s3-get.mjs <key> <file>
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import fs from 'node:fs';
import {pipeline} from 'node:stream/promises';
const [key, file] = process.argv.slice(2);
const res = await new S3Client({region: 'us-east-1'}).send(new GetObjectCommand({Bucket: 'remotionlambda-useast1-c5w9ygbemk', Key: key}));
await pipeline(res.Body, fs.createWriteStream(file));
console.log(file, fs.statSync(file).size);
