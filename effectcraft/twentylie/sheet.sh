#!/bin/sh
# Contact sheet of frames: ./sheet.sh project comp out.jpg t1 t2 ...
P=$1; C=$2; O=$3; shift 3; D=$(mktemp -d); i=0
for t in "$@"; do effectcraft-cli render-frame --project "$PWD/$P" --comp "$C" --time $t --max-side 480 --out $D/$(printf %02d $i)_$t.png >/dev/null 2>&1; i=$((i+1)); done
python3 - "$D" "$O" <<'PY'
import sys, glob, os
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1] + "/*.png")); n = len(fs); cols = 4; rows = (n + cols - 1) // cols
S = Image.new("RGB", (cols * 480, rows * 270)); d = ImageDraw.Draw(S)
for k, f in enumerate(fs):
    S.paste(Image.open(f).convert("RGB"), ((k % cols) * 480, (k // cols) * 270))
    d.text(((k % cols) * 480 + 5, (k // cols) * 270 + 5), os.path.basename(f).split("_", 1)[1][:-4], fill="yellow")
S.save(sys.argv[2])
PY
rm -rf $D
