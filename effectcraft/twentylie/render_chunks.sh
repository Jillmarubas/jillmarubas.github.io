#!/bin/sh
# Render a comp in short chunks so a container restart only loses the chunk in progress.
# Re-running skips chunks that already finished. Usage: ./render_chunks.sh coldopen ColdOpen 47.5
set -e
cd "$(dirname "$0")"
P=$1; COMP=$2; DUR=$3; STEP=${4:-6}
mkdir -p renders/$P
python3 - "$DUR" "$STEP" > renders/$P/ranges.txt <<'PY'
import sys, math
# Frame-aligned chunk edges at 23.976 fps (the end of a range is exclusive).
f = 1001 / 24000; n = math.floor(float(sys.argv[1]) / f + 1e-6); k = round(float(sys.argv[2]) / f)
for a in range(0, n, k): print(f"{a * f:.6f} {min(a + k, n) * f:.6f}")
PY
i=0
while read -r a b; do
  out=renders/$P/part_$(printf %03d $i).mp4
  if [ ! -f "$out" ]; then
    effectcraft-cli render --project "$PWD/$P.ecproj" --comp "$COMP" --start "$a" --end "$b" \
      --out "$PWD/$out.tmp.mp4" --format h264 --audio off --video-quality 18 >/dev/null 2>&1
    mv "$out.tmp.mp4" "$out"; echo "part $i done ($a-$b s)"
  fi
  i=$((i + 1))
done < renders/$P/ranges.txt
ls renders/$P/part_*.mp4 | sed "s|^renders/$P/|file '|; s|$|'|" > renders/$P/list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i renders/$P/list.txt -c copy renders/${P}_video.mp4
echo "ALL DONE renders/${P}_video.mp4"
