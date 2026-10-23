import sys, glob, os
from PIL import Image
files = sys.argv[2:]
ims = [Image.open(f).convert('RGBA') for f in files]
H = 360
row = []
for im in ims:
    s = H / im.height
    w = int(im.width * s)
    if w > 1400: s = 1400 / im.width; w = 1400
    row.append(im.resize((w, int(im.height * s))))
W = max(sum(r.width for r in row[:4]) + 40, 400)
rows=[row[i:i+4] for i in range(0,len(row),4)]
out = Image.new('RGB', (max(sum(x.width+10 for x in r) for r in rows)+10, sum(max(x.height for x in r)+10 for r in rows)+10), '#9fb5cf')
y=10
for r in rows:
    x=10
    for im in r:
        out.paste(im, (x, y), im); x += im.width + 10
    y += max(i.height for i in r) + 10
out.save(sys.argv[1])
