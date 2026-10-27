#!/usr/bin/env python3
"""Upload a file to the user's S3 bucket (multipart, resumable by re-running) and print a private
download link that works for 7 days. Reads the AWS keys from the environment (AWS_ACCESS_KEY_ID,
AWS_SECRET_ACCESS_KEY), which the user sets in the cloud environment's settings.

    python3 upload_s3.py FILE [KEY] [BUCKET]
"""
import os, sys, boto3
from boto3.s3.transfer import TransferConfig

f = sys.argv[1]
key = sys.argv[2] if len(sys.argv) > 2 else "masters/" + os.path.basename(f)
bucket = sys.argv[3] if len(sys.argv) > 3 else "remotionlambda-useast1-c5w9ygbemk"
s3 = boto3.client("s3", region_name="us-east-1")
size = os.path.getsize(f); done = [0]
def cb(n):
    done[0] += n
    if done[0] * 20 // size != (done[0] - n) * 20 // size: print(f"uploaded {done[0] * 100 // size}%", flush=True)
s3.upload_file(f, bucket, key, Callback=cb, ExtraArgs={"ContentType": "video/mp4"},
               Config=TransferConfig(multipart_chunksize=64 * 1024 * 1024, max_concurrency=4))
url = s3.generate_presigned_url("get_object", Params={"Bucket": bucket, "Key": key,
      "ResponseContentDisposition": f'attachment; filename="{os.path.basename(f)}"'}, ExpiresIn=7 * 24 * 3600)
print("s3://%s/%s" % (bucket, key)); print("DOWNLOAD LINK (7 days):", url)
