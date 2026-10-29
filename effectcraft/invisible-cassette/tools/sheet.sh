#!/bin/bash
# Usage: tools/sheet.sh <project.ecproj> <comp> <out.png> t1 t2 ...   (renders half-size stills, 3-wide contact sheet)
P=$1; C=$2; OUT=$3; shift 3
EC=/opt/ec/effectcraft-0.18.0-linux-x86_64/bin/effectcraft-cli
D=$(mktemp -d)
for t in "$@"; do $EC render-frame --project "$P" --comp "$C" --time $t --scale 0.5 --out $D/$t.png >/dev/null 2>&1 || echo "fail $t"; done
python3 - "$D" "$OUT" "$@" <<'PY'
import sys
from PIL import Image, ImageDraw
d, out, ts = sys.argv[1], sys.argv[2], sys.argv[3:]
ims = []
for t in ts:
    try: im = Image.open(f"{d}/{t}.png").convert("RGB").resize((560, 315))
    except Exception: im = Image.new("RGB", (560, 315), (80, 0, 0))
    ImageDraw.Draw(im).text((8, 6), t, fill=(0, 255, 255)); ims.append(im)
cols = 3; rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (560 * cols, 315 * rows))
for i, im in enumerate(ims): S.paste(im, ((i % cols) * 560, (i // cols) * 315))
S.save(out)
PY
rm -rf $D
