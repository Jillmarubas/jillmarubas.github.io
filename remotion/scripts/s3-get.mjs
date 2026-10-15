// Download one object from the Remotion bucket (through the session proxy) in 16 MB ranges, retrying a range
// when the proxy drops the connection; a single long GET of a large file can be reset part-way.
// Usage: node -r global-agent/bootstrap scripts/s3-get.mjs <key> <file>
import {S3Client, GetObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3';
import fs from 'node:fs';
const [key, file] = process.argv.slice(2);
const Bucket = 'remotionlambda-useast1-c5w9ygbemk';
const s3 = new S3Client({region: 'us-east-1'});
const {ContentLength: size} = await s3.send(new HeadObjectCommand({Bucket, Key: key}));
const CHUNK = 16 * 1024 * 1024;
const fd = fs.openSync(file, 'w');
for (let start = 0; start < size; start += CHUNK) {
  const end = Math.min(size, start + CHUNK) - 1;
  for (let tries = 1; ; tries++) {
    try {
      const res = await s3.send(new GetObjectCommand({Bucket, Key: key, Range: `bytes=${start}-${end}`}));
      const buf = Buffer.from(await res.Body.transformToByteArray());
      if (buf.length !== end - start + 1) throw new Error(`short range ${buf.length}`);
      fs.writeSync(fd, buf, 0, buf.length, start);
      break;
    } catch (e) {
      if (tries >= 6) throw e;
      await new Promise((r) => setTimeout(r, tries * 2000));
    }
  }
  process.stdout.write(`\r${Math.round((100 * (end + 1)) / size)}%`);
}
fs.closeSync(fd);
console.log(`\n${file} ${size}`);
