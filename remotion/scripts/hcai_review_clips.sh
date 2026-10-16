#!/usr/bin/env bash
# Cut the finished film into one review clip per chapter, each 2-pass encoded to fit the 30 MiB chat limit.
# Usage: scripts/hcai_review_clips.sh [film.mp4] [dir under out/hcai] [clip name prefix]
#   e.g. scripts/hcai_review_clips.sh HiddenCostOfAI_strip_720p.mp4 review_calm HiddenCostOfAI_calm
set -euo pipefail
cd "$(dirname "$0")/../out/hcai"
SRC=${1:-HiddenCostOfAI_720p.mp4}; DIR=${2:-review}; TAG=${3:-HiddenCostOfAI_720p}
mkdir -p "$DIR"
python3 - <<'PY' > "$DIR/chapters.txt"
import json
t = json.load(open('../../src/hcai/timing.json'))
names = ['00-cold-open', '01-the-cloud-is-a-building', '02-the-power', '03-the-water', '04-the-hands', '05-the-rocks', '06-who-pays', '07-the-other-side', '08-the-answer']
for c, n in zip(t['chapters'], names):
    a, b = round(c['start'] * 24) / 24, round(c['end'] * 24) / 24
    print(n, a, b)
PY
enc() {
  local name=$1 a=$2 b=$3
  # resumable: skip a clip that already finished (a readable mp4 of the right length)
  if ffprobe -v error -show_entries format=duration -of csv=p=0 "$DIR/${TAG}_$name.mp4" > /dev/null 2>&1; then echo "$name done already"; return; fi
  local d=$(python3 -c "print($b-$a)")
  local kbps=$(python3 -c "print(int(28*8*1024*1024/$d/1000 - 100))")
  ffmpeg -loglevel error -y -ss "$a" -to "$b" -i "$SRC" -c:v libx264 -preset slow -b:v ${kbps}k -pass 1 -passlogfile "$DIR/$name" -an -f mp4 /dev/null
  ffmpeg -loglevel error -y -ss "$a" -to "$b" -i "$SRC" -c:v libx264 -preset slow -b:v ${kbps}k -pass 2 -passlogfile "$DIR/$name" -c:a aac -b:a 96k -movflags +faststart "$DIR/${TAG}_$name.part.mp4"
  # only a finished encode gets the final name, so a killed run never looks done
  mv "$DIR/${TAG}_$name.part.mp4" "$DIR/${TAG}_$name.mp4"
  rm -f "$DIR/$name"*.log*
  echo "$name $(du -m "$DIR/${TAG}_$name.mp4" | cut -f1) MB at ${kbps}k"
}
export -f enc; export SRC DIR TAG
xargs -P 3 -L 1 bash -c 'enc $0 $1 $2' < "$DIR/chapters.txt"
