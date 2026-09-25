#!/usr/bin/env bash
# Master -> upload file: loudness to YouTube's -14 LUFS, and a size under GitHub's 100 MB limit.
set -euo pipefail
FFMPEG=${1:-ffmpeg}
cd "$(dirname "$0")/.."
IN=out/master.mp4
OUT=out/ai-news-short-2026-09-25.mp4
LIMIT_MB=95

# 1. measure, then normalise in a second pass (linear, so the mix doesn't pump)
STATS=$("$FFMPEG" -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
AF="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

# 2. keep the master's video if it already fits, else a two-pass encode sized to fit
SIZE_MB=$(( $(stat -c %s "$IN") / 1000000 ))
DUR=$("$FFMPEG" -hide_banner -i "$IN" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
if [ "$SIZE_MB" -le "$LIMIT_MB" ]; then
  "$FFMPEG" -loglevel error -y -i "$IN" -c:v copy -af "$AF" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT"
else
  KBPS=$(python3 -c "print(int(($LIMIT_MB*8000/$DUR - 192)*0.97))")
  echo "master is ${SIZE_MB} MB; re-encoding video at ${KBPS} kb/s"
  "$FFMPEG" -loglevel error -y -i "$IN" -c:v libx264 -preset slow -b:v ${KBPS}k -pass 1 -passlogfile out/x264 -an -f null /dev/null
  "$FFMPEG" -loglevel error -y -i "$IN" -c:v libx264 -preset slow -b:v ${KBPS}k -pass 2 -passlogfile out/x264 \
    -pix_fmt yuv420p -profile:v high -af "$AF" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT"
  rm -f out/x264*
fi
ls -la "$OUT"
