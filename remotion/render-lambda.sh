#!/usr/bin/env bash
# Deploy the Remotion project to S3 and render a composition on AWS Lambda.
# Usage: ./render-lambda.sh <CompositionId> <out.mp4>
set -euo pipefail
cd "$(dirname "$0")"

if [ "${1:-}" = "--check" ]; then
  export GLOBAL_AGENT_HTTP_PROXY=$HTTPS_PROXY GLOBAL_AGENT_NO_PROXY="localhost,127.0.0.1,::1" NODE_OPTIONS="${NODE_OPTIONS:-} -r global-agent/bootstrap"
  npx remotion lambda functions ls --region=us-east-1 && npx remotion lambda sites ls --region=us-east-1
  exit
fi

COMP=${1:?composition id}
OUT=${2:?output file}
mkdir -p "$(dirname "$OUT")"

REGION=us-east-1
FUNCTION=remotion-render-4-0-529-mem3008mb-disk10240mb-900sec
SITE=${SITE:-jillmar-motion}
# Account concurrency is 10: 1 orchestrator + 8 renderers, leaving one slot spare.
FRAMES_PER_LAMBDA=${FRAMES_PER_LAMBDA:-50}

# The AWS SDK ignores HTTPS_PROXY; route it through the session proxy, which signs requests.
export GLOBAL_AGENT_HTTP_PROXY=$HTTPS_PROXY
export GLOBAL_AGENT_NO_PROXY="localhost,127.0.0.1,::1"
export NODE_OPTIONS="${NODE_OPTIONS:-} -r global-agent/bootstrap"

SERVE_URL=$(npx remotion lambda sites create src/index.ts --site-name="$SITE" --region="$REGION" --log=error -q | tail -1)
[ -n "$SERVE_URL" ] || SERVE_URL="https://remotionlambda-useast1-c5w9ygbemk.s3.us-east-1.amazonaws.com/sites/$SITE/index.html"

read -r RENDER_ID BUCKET < <(node start-lambda-render.mjs "$COMP" "$REGION" "$FUNCTION" "$SERVE_URL" "$FRAMES_PER_LAMBDA" |
  python3 -c 'import json,sys; d=json.loads(sys.stdin.read().strip().splitlines()[-1]); print(d["renderId"], d["bucketName"])')
BASE="https://$BUCKET.s3.$REGION.amazonaws.com/renders/$RENDER_ID"
echo "render $RENDER_ID started"

while true; do
  sleep 15
  P=$(curl -sS "$BASE/progress.json" || true)
  STATUS=$(python3 -c '
import json,sys
try: d=json.loads(sys.argv[1])
except Exception: print("wait"); sys.exit()
if d.get("fatalErrorTimestamp"): print("fail " + json.dumps(d.get("errors"))[:600])
elif d.get("postRenderData"): print("done " + d["postRenderData"]["outputFile"])
else: print("frames %s rendered" % d.get("framesRendered"))' "$P")
  echo "$STATUS"
  case "$STATUS" in
    done*) curl -sS -o "$OUT" "$BASE/out.mp4"; echo "saved $OUT"; break ;;
    fail*) exit 1 ;;
  esac
done
