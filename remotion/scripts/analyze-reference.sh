#!/usr/bin/env bash
# Break a reference video down for study.
# Usage: scripts/analyze-reference.sh <video.mp4> <outdir>
# Produces: <outdir>/sheet_N.png (4 fps contact sheets with timestamps) and <outdir>/metrics.txt
# Needs: npm install (for remotion's ffmpeg), pip install pillow numpy, Chromium headless shell.
set -euo pipefail
cd "$(dirname "$0")/.."
VIDEO=$(realpath "$1"); OUT=$(realpath -m "$2"); mkdir -p "$OUT/f" "$OUT/n"
BROWSER=${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}

npx remotion ffprobe "$VIDEO" 2>&1 | grep -E "Duration|Video:" | sed 's/^ *//' > "$OUT/probe.txt"
npx remotion ffmpeg -loglevel error -y -i "$VIDEO" -r 4 -q:v 3 "$OUT/f/%03d.jpg"
npx remotion ffmpeg -loglevel error -y -i "$VIDEO" -s 90x160 -f image2 "$OUT/n/%04d.png"

python3 - "$OUT" <<'PY'
import os, re, sys, numpy as np
from PIL import Image
out = sys.argv[1]
probe = open(f'{out}/probe.txt').read()
fps = float(re.search(r'([\d.]+) fps', probe).group(1))
fr = sorted(os.listdir(f'{out}/f'))
for s in range(0, len(fr), 14):
    cells = ''.join(f'<div class=c><img src="f/{f}"><b>{(int(f[:3])-1)*0.25:.2f}s</b></div>' for f in fr[s:s+14])
    open(f'{out}/sheet_{s//14}.html', 'w').write(f'<html><body style="margin:0;background:#222"><style>.c{{position:relative;display:inline-block;width:200px;margin:2px}}img{{width:200px;display:block}}b{{position:absolute;top:4px;left:4px;background:#000c;color:#ff0;font:14px monospace;padding:2px}}</style>{cells}</body></html>')
files = sorted(os.listdir(f'{out}/n'))
rgb = [np.asarray(Image.open(f'{out}/n/{f}').convert('RGB')).astype(np.float32) for f in files]
g = [x.mean(2) for x in rgb]
d = np.array([np.abs(g[k] - g[k-1]).mean() for k in range(1, len(g))])
thr = max(18, np.percentile(d, 99) * 0.6)
cuts = []
for k in range(1, len(d) - 1):
    if d[k] > thr and d[k] >= d[k-1] and d[k] >= d[k+1] and (not cuts or (k - cuts[-1]) / fps > 0.3):
        cuts.append(k)
times = [round((c + 1) / fps, 2) for c in cuts]
shots = np.diff([0] + times + [len(g) / fps])
active = d > max(0.15, np.percentile(d, 55))
moves, k = [], 0
while k < len(active):
    if active[k]:
        s = k
        while k < len(active) and active[k]:
            k += 1
        if k - s >= 3:
            moves.append((s, k))
    k += 1
L = np.array([(b - a) / fps for a, b in moves]) if moves else np.array([0.0])
peak = np.array([np.argmax(d[a:b]) / max(1, b - a - 1) for a, b in moves]) if moves else np.array([0.0])
px = np.concatenate([x.reshape(-1, 3) for x in rgb[::max(1, len(rgb) // 40)]])
lum = np.array([x.mean() for x in g])
report = f"""{probe.strip()}
fps {fps} | duration {len(g)/fps:.2f}s | frames {len(g)}
hard cuts ({len(times)}): {times}
shot length: mean {shots.mean():.2f}s  min {shots.min():.2f}s  max {shots.max():.2f}s
luma mean {lum.mean():.0f} (min {lum.min():.0f} max {lum.max():.0f}) | contrast {np.mean([x.std() for x in g]):.0f} | saturation {(px.max(1)-px.min(1)).mean():.0f}/255
moves: {len(moves)} | median {np.median(L)*1000:.0f} ms = {np.median(L)*fps:.0f} frames | peak speed at {np.median(peak)*100:.0f}% of the move | still {(~active).sum()/len(active)*100:.0f}% of runtime
"""
open(f'{out}/metrics.txt', 'w').write(report)
print(report)
PY
for h in "$OUT"/sheet_*.html; do "$BROWSER" --no-sandbox --hide-scrollbars --window-size=1428,730 --screenshot="${h%.html}.png" "file://$h" 2>/dev/null; done
echo "contact sheets: $OUT/sheet_*.png"
