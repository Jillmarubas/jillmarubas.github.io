#!/usr/bin/env bash
# Join the Lambda chapter parts and mux the mix (SOP, "Join Lambda parts video-only"): each part carries a silent
# audio track a few AAC frames longer than its picture, so joining whole files adds a gap at every join. Strip the
# audio first, join the pictures, mux the mix (out/hcai/mix.wav unless a third argument names another), then check every frame sits at n/24 and the end lands at frames/24.
# Usage: scripts/hcai_assemble.sh <partsdir> <out.mp4> [mix.wav]     e.g. scripts/hcai_assemble.sh out/hcai/parts720 out/hcai/HiddenCostOfAI_720p.mp4
#        scripts/hcai_assemble.sh out/hcai/strip720 out/hcai/HiddenCostOfAI_strip_720p.mp4 out/hcai/mix_strip.wav
set -euo pipefail
cd "$(dirname "$0")/.."
PARTS=${1:?parts dir}; OUT=${2:?output}; MIX=${3:-out/hcai/mix.wav}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
for i in $(seq 0 8); do
  ffmpeg -loglevel error -y -i "$PARTS/part$i.mp4" -an -c:v copy "$TMP/v$i.mp4"
  echo "file '$TMP/v$i.mp4'" >> "$TMP/list.txt"
done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$TMP/list.txt" -c:v copy "$TMP/video.mp4"
ffmpeg -loglevel error -y -i "$TMP/video.mp4" -i "$MIX" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -shortest -movflags +faststart "$OUT"
ffprobe -v error -select_streams v:0 -show_entries packet=pts_time -of csv=p=0 "$OUT" | python3 -c '
import sys
p = sorted(float(x) for x in sys.stdin if x.strip())
drift = max(abs(t - i / 24) for i, t in enumerate(p))
print("frames", len(p), "last frame at", round(p[-1], 4), "expected", round((len(p) - 1) / 24, 4), "max drift", round(drift, 4), "s")
sys.exit(1 if drift > 0.01 else 0)'
ffprobe -v error -show_entries format=duration:stream=codec_name,duration -of compact "$OUT"
