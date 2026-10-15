#!/usr/bin/env bash
# Stills of one chapter's animated scenes for review: two per scene (40% and 85% through), tiled 4x4.
# Renders take turns behind a lock, so several people (or agents) can call this at once on a small machine.
# Usage: scripts/hcai_stills.sh <chapter> <outdir> [scale]      e.g. scripts/hcai_stills.sh 3 /tmp/ch3
set -euo pipefail
cd "$(dirname "$0")/.."
CH=${1:?chapter}; OUT=${2:?outdir}; SCALE=${3:-0.25}
mkdir -p "$OUT"
exec 9>/tmp/hcai-render.lock
flock 9
python3 scripts/hcai_strip.py > /dev/null
B=/tmp/hcai-bundle
rm -rf "$B" && npx remotion bundle src/index.ts --out-dir="$B" --log=error > /dev/null
python3 - "$CH" > "$OUT/frames.txt" <<'PY'
import json, sys
S = json.load(open('src/hcai/strip.json'))
for f in S['frames']:
    if f['ch'] == int(sys.argv[1]) and f['mode'] in ('anim', 'anim3d', 'image'):
        for k in (0.4, 0.85):
            print(f"{round((f['at'] + f['hold'] * k) * 24)} {f['ref']}")
PY
rm -f "$OUT"/s[0-9]*.jpg "$OUT"/sheet*.jpg
while read -r FR REF; do echo "$FR $REF"; done < "$OUT/frames.txt" | xargs -P 4 -L 1 sh -c 'npx remotion still '"$B"' HiddenCostAI-strip '"$OUT"'/s$(printf %05d $0)-$1.jpg --frame=$0 --scale='"$SCALE"' --gl=swangle --log=error > /dev/null 2>&1 || echo "still failed: frame $0 ($1)"'
N=$(ls "$OUT"/s[0-9]*.jpg | wc -l)
for i in $(seq 0 16 $((N - 1))); do
  ffmpeg -nostdin -loglevel error -y -pattern_type glob -i "$OUT/s[0-9]*.jpg" -vf "select='between(n\,$i\,$((i + 15)))',tile=4x4" -frames:v 1 "$OUT/sheet$((i / 16 + 1)).jpg"
done
echo "$N stills; sheets: $(ls "$OUT"/sheet*.jpg | tr '\n' ' ')"
