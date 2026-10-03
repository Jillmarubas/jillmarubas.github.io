#!/usr/bin/env bash
# Render a long film on Lambda as one composition per chapter, in parallel, picture only.
# Deploys the site once, starts every part, polls progress.json in S3, downloads each out.mp4.
# Usage: SITE=<site> FRAMES_PER_LAMBDA=<n> ./render-parts.sh <CompositionPrefix> <parts> <outdir>
#   e.g. ./render-parts.sh AINews1003 8 out/news1003/parts   (renders AINews1003-part0 .. part7)
set -euo pipefail
cd "$(dirname "$0")"
PREFIX=${1:?composition prefix}
PARTS=${2:?number of parts}
OUTDIR=${3:?output dir}
mkdir -p "$OUTDIR"
REGION=us-east-1
FUNCTION=remotion-render-4-0-529-mem3008mb-disk10240mb-900sec
SITE=${SITE:?site name}
FRAMES_PER_LAMBDA=${FRAMES_PER_LAMBDA:-24}

export GLOBAL_AGENT_HTTP_PROXY=$HTTPS_PROXY
export GLOBAL_AGENT_NO_PROXY="localhost,127.0.0.1,::1"
export NODE_OPTIONS="${NODE_OPTIONS:-} -r global-agent/bootstrap"

SERVE_URL=$(npx remotion lambda sites create src/index.ts --site-name="$SITE" --region="$REGION" --log=error -q | tail -1)
[ -n "$SERVE_URL" ] || SERVE_URL="https://remotionlambda-useast1-c5w9ygbemk.s3.us-east-1.amazonaws.com/sites/$SITE/index.html"
echo "site $SERVE_URL"

declare -A BASES
for ((i = 0; i < PARTS; i++)); do
  read -r RID BUCKET < <(node start-lambda-render.mjs "$PREFIX-part$i" "$REGION" "$FUNCTION" "$SERVE_URL" "$FRAMES_PER_LAMBDA" |
    python3 -c 'import json,sys; d=json.loads(sys.stdin.read().strip().splitlines()[-1]); print(d["renderId"], d["bucketName"])')
  BASES[$i]="https://$BUCKET.s3.$REGION.amazonaws.com/renders/$RID"
  echo "part$i render $RID"
  sleep 2
done

left=$PARTS
declare -A DONE
while [ "$left" -gt 0 ]; do
  sleep 20
  for ((i = 0; i < PARTS; i++)); do
    [ -n "${DONE[$i]:-}" ] && continue
    P=$(curl -sS "${BASES[$i]}/progress.json" || true)
    S=$(python3 -c '
import json,sys
try: d=json.loads(sys.argv[1])
except Exception: print("wait"); sys.exit()
if d.get("fatalErrorTimestamp"): print("fail " + json.dumps(d.get("errors"))[:400])
elif d.get("postRenderData"): print("done")
else: print("%s frames" % d.get("framesRendered"))' "$P")
    case "$S" in
      done) curl -sS -o "$OUTDIR/part$i.mp4" "${BASES[$i]}/out.mp4"; DONE[$i]=1; left=$((left - 1)); echo "part$i saved" ;;
      fail*) echo "part$i $S"; exit 1 ;;
      *) echo "part$i $S" ;;
    esac
  done
done
echo "all parts saved in $OUTDIR"
