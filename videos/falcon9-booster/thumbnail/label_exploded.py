import json, sys
from PIL import Image, ImageDraw, ImageFont
import numpy as np
M, O, D = sys.argv[1:4]
t = open('/home/user/jillmarubas.github.io/effectcraft/falcon9/xrig.jsx').read(); L = json.loads(t[t.index('['):t.rindex(']') + 1])
TEXT = {'engines': '9 Merlin 1D\nengines', 'heat_shield': 'Heat\nshield', 'octaweb': 'Octaweb\nthrust frame', 'engine_section': 'Engine\nsection',
        'rp1': 'RP-1\nkerosene', 'aft_dome': 'Aft\ndome', 'transfer_tube': 'LOX transfer\ntube', 'common_dome': 'Common\ndome',
        'lox': 'Liquid\noxygen', 'copvs': 'Helium tanks\n(COPVs)', 'fwd_dome': 'Forward\ndome', 'skin': 'Aluminium-lithium\ntank skin',
        'pushers': 'Separation\nsystem', 'interstage': 'Interstage', 'thrusters': 'Nitrogen\nthrusters', 'fins': 'Titanium\ngrid fins',
        'legs': 'Landing\nlegs', 'mvac': 'Merlin Vacuum\nengine', 'stage2': 'Second\nstage', 'fairing': 'Payload\nfairing'}
pts = []
for i, l in enumerate(L):
    a = np.asarray(Image.open(f'{M}/m_{i:05d}.png').convert('L')).astype(float)
    ys, xs = np.nonzero(a > 128); pts.append((float(xs.mean()), float(ys.mean())))
im = Image.open(f'{O}/main.png').convert('RGB')
arr = np.asarray(im).sum(axis=2); rows = np.nonzero(arr.max(axis=1) > 60)[0]; top, bot = int(rows.min()), int(rows.max())
d = ImageDraw.Draw(im)
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FX = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
f = ImageFont.truetype(FB, 26)
ORANGE = (255, 90, 20); WHITE = (255, 255, 255); GREY = (200, 204, 210)
GAP, MARGIN = 22, 28
for side in ('up', 'down'):
    idx = sorted([i for i, l in enumerate(L) if l['side'] == side], key=lambda i: pts[i][0])
    ws = [max(d.textlength(s, font=f) for s in TEXT[L[i]['id']].split('\n')) for i in idx]
    c = [pts[i][0] for i in idx]
    for _ in range(200):  # order-preserving spread inside the frame
        for j in range(len(c)):
            c[j] = min(max(c[j], MARGIN + ws[j] / 2), 1920 - MARGIN - ws[j] / 2)
        for j in range(1, len(c)):
            need = (ws[j - 1] + ws[j]) / 2 + GAP
            if c[j] - c[j - 1] < need:
                mid = (c[j] + c[j - 1]) / 2; c[j - 1] = mid - need / 2; c[j] = mid + need / 2
    bus = top - 26 if side == 'up' else bot + 26
    edge = top - 92 if side == 'up' else bot + 92  # label's near edge
    for j, i in enumerate(idx):
        ax, ay = pts[i]
        d.line([(ax, ay), (ax, bus), (c[j], edge)], fill=GREY, width=2, joint='curve')
        d.ellipse([ax - 6, ay - 6, ax + 6, ay + 6], fill=ORANGE, outline=WHITE, width=2)
        lines = TEXT[L[i]['id']].split('\n')
        n = len(lines)
        if side == 'up':
            y = edge - 16 - 32 * n
            d.rectangle([c[j] - ws[j] / 2 - 2, edge - 6, c[j] + ws[j] / 2 + 2, edge - 2], fill=ORANGE)
        else:
            y = edge + 6
            d.rectangle([c[j] - ws[j] / 2 - 2, edge - 2, c[j] + ws[j] / 2 + 2, edge + 2], fill=ORANGE)
        for k, s in enumerate(lines):
            d.text((c[j], y + 8 + 32 * k), s, font=f, fill=WHITE, anchor='ma')
d.text((60, 54), 'FALCON 9', font=ImageFont.truetype(FX, 92), fill=ORANGE, anchor='la')
d.text((64, 156), 'EVERY PART, PULLED APART', font=ImageFont.truetype(FB, 32), fill=GREY, anchor='la')
im.save(f'{D}/thumb_C_exploded_1920.png')
im.resize((1280, 720), Image.LANCZOS).save(f'{D}/thumb_C_exploded.jpg', quality=95)
print('rows', top, bot)
