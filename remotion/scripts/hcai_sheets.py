"""Contact sheets of candidates: one row per asset, 8 Commons thumbs (0-7) + up to 4 Openverse thumbs (o0-o3)."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.join(os.path.dirname(__file__), '..')
CD = os.path.join(ROOT, 'out/hcai/cands'); OUT = os.path.join(ROOT, 'out/hcai/sheets'); os.makedirs(OUT, exist_ok=True)
assets = json.load(open(os.path.join(ROOT, 'src/hcai/assets.json')))
ids = sys.argv[2:] if len(sys.argv) > 2 else [a['id'] for a in assets]
name = sys.argv[1] if len(sys.argv) > 1 else 'sheet'
A = {a['id']: a for a in assets}
CW, CH, LW, ROWS = 150, 112, 230, 10
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else ImageFont.load_default()
for s in range(0, len(ids), ROWS):
    chunk = ids[s:s + ROWS]
    im = Image.new('RGB', (LW + CW * 12, CH * len(chunk)), 'white'); d = ImageDraw.Draw(im)
    for r, aid in enumerate(chunk):
        y = r * CH
        a = A[aid]
        d.rectangle([0, y, LW - 4, y + CH - 2], fill=(235, 230, 220))
        d.text((6, y + 6), f"{aid} [{a['type']}]", fill='black', font=font)
        q = a['q']; 
        for li in range(0, len(q), 30): d.text((6, y + 26 + li // 30 * 16), q[li:li + 30], fill=(80, 80, 80), font=font)
        cells = [(str(k), os.path.join(CD, f'{aid}_{k}.jpg')) for k in range(8)] + [(f'o{k}', os.path.join(CD, f'{aid}_o{k}.jpg')) for k in range(4)]
        for c, (lab, p) in enumerate(cells):
            x = LW + c * CW
            if os.path.exists(p):
                try:
                    t = Image.open(p).convert('RGB'); t.thumbnail((CW - 6, CH - 20)); im.paste(t, (x + 3, y + 3))
                except Exception: pass
                d.text((x + 4, y + CH - 17), lab, fill=(200, 30, 30), font=font)
        d.line([0, y + CH - 1, im.width, y + CH - 1], fill=(200, 200, 200))
    im.save(os.path.join(OUT, f'{name}_{s // ROWS:02d}.jpg'), quality=82)
print('sheets', (len(ids) + ROWS - 1) // ROWS)
