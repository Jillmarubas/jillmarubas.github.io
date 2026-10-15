#!/usr/bin/env bash
# Cut the finished film into one review clip per chapter, each 2-pass encoded to fit the 30 MiB chat limit.
set -euo pipefail
cd "$(dirname "$0")/../out/hcai"
SRC=${1:-HiddenCostOfAI_720p.mp4}
python3 - <<'PY' > review/chapters.txt
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
  if ffprobe -v error -show_entries format=duration -of csv=p=0 "review/HiddenCostOfAI_720p_$name.mp4" > /dev/null 2>&1; then echo "$name done already"; return; fi
  local d=$(python3 -c "print($b-$a)")
  local kbps=$(python3 -c "print(int(28*8*1024*1024/$d/1000 - 100))")
  ffmpeg -loglevel error -y -ss "$a" -to "$b" -i "$SRC" -c:v libx264 -preset slow -b:v ${kbps}k -pass 1 -passlogfile "review/$name" -an -f mp4 /dev/null
  ffmpeg -loglevel error -y -ss "$a" -to "$b" -i "$SRC" -c:v libx264 -preset slow -b:v ${kbps}k -pass 2 -passlogfile "review/$name" -c:a aac -b:a 96k -movflags +faststart "review/HiddenCostOfAI_720p_$name.mp4"
  rm -f "review/$name"*.log*
  echo "$name $(du -m review/HiddenCostOfAI_720p_$name.mp4 | cut -f1) MB at ${kbps}k"
}
export -f enc; export SRC
xargs -P 3 -L 1 bash -c 'enc $0 $1 $2' < review/chapters.txt
