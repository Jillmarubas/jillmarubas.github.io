"""Basement TV room, the reverse shot: the camera stands where the TV is and looks back at the couch.
Same room, same 3D camera as basement.py (P(), box3d(), the wall homographies), so it cuts with the
shot from behind. Left and right swap: the lamp table is now at the right end of the couch.

  bRoomF.svg   (1920 x 1080) the other end of the basement: block wall with a pegboard of tools and a
               movie poster, string lights under the joists, washer and dryer on the left wall,
               a dartboard and stacked boxes on the right, concrete floor and the rug
  bCouchF.svg  (1920 x 1080) the couch from the front: back cushions, the knitted blanket, arms,
               seat cushions with the dents where they sit, wooden feet
  bSideF.svg   (1920 x 1080) the side table and lamp at the right end of the couch
  bTableF.svg  (1920 x 1080) the coffee table in the foreground: drinks, remote, controllers, spilt popcorn
  bBucket.svg  (300 x 320)   striped popcorn bucket, heaped full
  bBowl.svg    (320 x 220)   Pip's glass bowl of popcorn
  bBag.svg     (180 x 220)   Ria's paper bag of popcorn
  pop1-4.svg   (60 x 60)     single popcorn pieces (in hands, flying, crumbs)
  frontLights.json           screen positions of the string-light bulbs (Remotion adds their glow)
Usage (from remotion/): python3 scripts/vectorcraft/basement_front.py public/timetraveler/basement
"""
import json, math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import basement as B
from basement import (P, F, box3d, faces3d, shade, cylinder, wall_joints, LEFT, RIGHT, CEIL, FLOOR, BW,
                      W, H, VC, Artist, pts_d, smooth_d, lerp, INK, homography)

YF, YC = -3.0, 3.1


def circ(x, y, r):
    return f'M{x - r:.1f} {y:.1f} a{r:.1f} {r:.1f} 0 1 0 {2 * r:.1f} 0 a{r:.1f} {r:.1f} 0 1 0 {-2 * r:.1f} 0 Z'


def ell(x, y, rx, ry):
    return f'M{x - rx:.1f} {y:.1f} a{rx:.1f} {ry:.1f} 0 1 0 {2 * rx:.1f} 0 a{rx:.1f} {ry:.1f} 0 1 0 {-2 * rx:.1f} 0 Z'


# ------------------------------------------------------------------ popcorn
def kernel(a, cx, cy, s, rr, lw=None):
    """One popped kernel: 3-5 puffs merged into one cloud outline, wrinkles, a butter patch, a bit of hull."""
    n = rr.randint(3, 5)
    puffs = []
    for i in range(n):
        ang = rr.uniform(0, 2 * math.pi)
        d = rr.uniform(0.1, 0.42) * s if i else 0
        puffs.append((cx + math.cos(ang) * d, cy + math.sin(ang) * d, s * rr.uniform(0.32, 0.48)))
    lw = lw or max(1.2, s * 0.11)
    for x, y, r in puffs:
        a.shape(circ(x, y, r), '#fff2d2', lw=lw, rough=0)
    for x, y, r in puffs:
        a.shape(circ(x, y, r - lw * 0.55), '#fff2d2', stroke=False, rough=0)
    # shade on the lower right of each puff, a highlight on the upper left
    for x, y, r in puffs:
        a.shape(f'M{x + r * 0.15:.1f} {y + r * 0.85:.1f} A{r * 0.8:.1f} {r * 0.8:.1f} 0 0 0 {x + r * 0.85:.1f} {y + r * 0.1:.1f} Q{x + r * 0.35:.1f} {y + r * 0.3:.1f} {x + r * 0.15:.1f} {y + r * 0.85:.1f} Z',
                '#ecd3a0', stroke=False, rough=0)
    x, y, r = rr.choice(puffs)
    a.shape(ell(x - r * 0.1, y + r * 0.1, r * 0.5, r * 0.35), '#f2c75a', stroke=False, rough=0, opacity=75)
    x, y, r = puffs[0]
    a.stroke(f'M{x - r * 0.4:.1f} {y - r * 0.1:.1f} q{r * 0.3:.1f} {-r * 0.3:.1f} {r * 0.6:.1f} 0', color='#c9a874', lw=max(1, s * 0.06), profile=None, rough=False)
    hx, hy, hr = puffs[-1]
    ang = rr.uniform(0, 2 * math.pi)
    tx, ty = hx + math.cos(ang) * hr * 0.9, hy + math.sin(ang) * hr * 0.9
    a.shape(f'M{tx:.1f} {ty:.1f} l{s * 0.14:.1f} {s * 0.05:.1f} l{-s * 0.06:.1f} {s * 0.13:.1f} Z', '#8a5a2a', lw=max(0.8, lw * 0.5), rough=0)


def kernel_sprites(out):
    for k in range(4):
        v = VC(); a = Artist(v, 60, 60, 2, seed=90 + k)
        kernel(a, 30, 30, 34, random.Random(200 + k), lw=3)
        v.tool('export', path=os.path.join(out, f'pop{k + 1}.svg'))
        v.close()


def mound(a, cx, top, bottom, half_w, n, rr, s0=20, s1=28):
    """A heap of kernels: drawn from the back (top) to the front so nearer pieces overlap."""
    pts = []
    for _ in range(n):
        u = rr.uniform(-1, 1)
        h = (1 - u * u) ** 0.8
        y = rr.uniform(bottom - (bottom - top) * h, bottom)
        pts.append((y, cx + u * half_w, rr.uniform(s0, s1)))
    for y, x, s in sorted(pts):
        kernel(a, x, y, s, rr)


def bucket(out):
    v = VC(); a = Artist(v, 300, 320, 5, seed=81); rr = random.Random(8)
    tl, tr, bl, br = (46, 124), (254, 124), (86, 304), (214, 304)
    # pieces behind the rim (the back of the heap)
    mound(a, 150, 36, 128, 104, 34, rr)
    body = f'M{tl[0]} {tl[1]} L{bl[0]} {bl[1]} Q150 {bl[1] + 12} {br[0]} {br[1]} L{tr[0]} {tr[1]} Q150 {tl[1] + 14} {tl[0]} {tl[1]} Z'
    a.shape(body, '#f6efe0', lw=5, rough=0.5)
    # red stripes converging toward the base, following the curve of the cup
    for k in range(7):
        if k % 2:
            continue
        u0, u1 = k / 7, (k + 1) / 7
        q = [lerp(tl, tr, u0), lerp(tl, tr, u1), lerp(bl, br, u1), lerp(bl, br, u0)]
        q = [(x, y + 14 * math.sin(math.pi * (x - 46) / 208)) for x, y in q]
        a.shape(pts_d(q), '#d23a2e', stroke=False, rough=0.3)
    a.shape(f'M{tr[0] - 50} {tr[1] + 10} L{tr[0]} {tr[1]} L{br[0]} {br[1]} L{br[0] - 34} {br[1] + 8} Z', '#000000', stroke=False, rough=0, opacity=18)
    a.hatch(f'M{tr[0] - 40} {tr[1] + 12} L{tr[0]} {tr[1]} L{br[0]} {br[1]} L{br[0] - 30} {br[1] + 8} Z', '#7a2018', angle=75, spacing=6, width=1.6, opacity=35)
    a.shape(ell(122, 214, 34, 30), '#f6efe0', lw=3, rough=0)  # label
    a.shape(ell(122, 214, 26, 22), '#f2c75a', lw=2, rough=0)
    a.stroke('M104 214 q8 -10 18 0 q10 10 18 0', color='#d23a2e', lw=4, profile=None, rough=False)
    a.shape(ell(196, 252, 12, 8), '#e8c88a', stroke=False, rough=0, opacity=55)  # butter grease spot
    a.stroke(f'M{tl[0] + 10} {tl[1] + 20} L{bl[0] + 6} {bl[1] - 14}', color='#ffffff', lw=4, opacity=60, profile=None, rough=False)
    # rolled rim
    a.stroke(f'M{tl[0] - 2} {tl[1]} Q150 {tl[1] + 16} {tr[0] + 2} {tr[1]}', color=INK, lw=14, profile=None, rough=False)
    a.stroke(f'M{tl[0] - 2} {tl[1]} Q150 {tl[1] + 16} {tr[0] + 2} {tr[1]}', color='#f6efe0', lw=8, profile=None, rough=False)
    # pieces spilling over the front of the rim
    for x, y, s in ((92, 126, 24), (140, 134, 26), (196, 128, 24), (238, 120, 22), (60, 118, 22)):
        kernel(a, x, y, s, rr)
    v.tool('export', path=os.path.join(out, 'bBucket.svg'))
    v.close()


def bowl(out):
    v = VC(); a = Artist(v, 320, 220, 5, seed=83); rr = random.Random(9)
    a.shape(ell(160, 82, 132, 22), '#cfe0e6', lw=4, rough=0, opacity=70)  # back of the rim
    mound(a, 160, 14, 92, 120, 40, rr, 18, 24)
    glass = 'M28 82 Q34 190 160 200 Q286 190 292 82 Q160 112 28 82 Z'
    for _ in range(16):  # pieces seen through the glass
        kernel(a, rr.uniform(70, 250), rr.uniform(100, 170), rr.uniform(18, 24), rr)
    a.shape(glass, '#bcd8e2', lw=4, rough=0, opacity=45)
    a.stroke('M50 104 Q60 160 112 182', color='#ffffff', lw=6, opacity=70, profile=None, rough=False)
    a.stroke('M262 112 Q256 150 230 172', color='#ffffff', lw=3, opacity=50, profile=None, rough=False)
    a.stroke('M28 82 Q160 112 292 82', color=INK, lw=6, profile=None, rough=False)
    a.stroke('M30 84 Q160 112 290 84', color='#e8f4f8', lw=2.5, profile=None, rough=False)
    for x, y, s in ((60, 84, 20), (120, 96, 22), (200, 96, 22), (262, 86, 20)):
        kernel(a, x, y, s, rr)
    v.tool('export', path=os.path.join(out, 'bBowl.svg'))
    v.close()


def bag(out):
    v = VC(); a = Artist(v, 180, 220, 4, seed=85); rr = random.Random(10)
    mound(a, 90, 22, 70, 58, 12, rr, 18, 22)
    body = 'M30 64 L22 206 Q90 214 158 206 L150 64 Q90 74 30 64 Z'
    a.shape(body, '#f4ead6', lw=4.5, rough=0.6)
    for k, x in enumerate((38, 70, 102, 134)):
        a.shape(pts_d([(x, 68), (x + 14, 69), (x + 16, 208), (x - 2, 208)]), '#2e6ab0', stroke=False, rough=0.3)
    a.shape('M60 118 h60 v40 h-60 Z', '#f4ead6', lw=3, rough=0.3)
    a.stroke('M70 132 h40 M74 144 h30', color='#d23a2e', lw=4, profile=None, rough=False)
    a.shape('M118 64 L150 64 L154 200 L132 206 Z', '#000000', stroke=False, rough=0, opacity=15)
    a.stroke('M30 64 Q90 74 150 64', color=INK, lw=10, profile=None, rough=False)
    a.stroke('M30 64 Q90 74 150 64', color='#e8dcc0', lw=5, profile=None, rough=False)
    for x, y, s in ((54, 66, 20), (96, 72, 22), (134, 64, 18)):
        kernel(a, x, y, s, rr)
    v.tool('export', path=os.path.join(out, 'bBag.svg'))
    v.close()


# ------------------------------------------------------------------ the room
def wall_blocks(a, v, rr):
    a.shape(pts_d(BW), '#6f7178', lw=4)
    bw, bh = 90, 44
    blocks = {}
    for row in range(int((BW[2][1] - BW[0][1]) / bh) + 1):
        y = BW[0][1] + row * bh
        off = (bw / 2) if row % 2 else 0
        x = BW[0][0] - off - rr.uniform(0, 20)
        while x < BW[1][0]:
            x0, x1 = max(BW[0][0], x + 2), min(BW[1][0], x + bw - 2)
            y0, y1 = y + 2, min(BW[2][1], y + bh - 2)
            if x1 > x0 + 6 and y1 > y0 + 4:
                c = rr.choice(['#7a7c83', '#74767d', '#80828a', '#6d6f76'])
                blocks.setdefault(c, []).append(pts_d([(x0, y0), (x1, y0 + rr.uniform(-1, 1)), (x1, y1), (x0, y1)]))
            x += bw
    for c, ds in blocks.items():
        v.tool('draw_path', d=' '.join(ds), fill=c, stroke='#55575d', strokeWidth=1.6)
    pits = ' '.join(f'M{rr.uniform(430, 1490):.1f} {rr.uniform(170, 760):.1f} a1.6 1.2 0 1 0 3.2 0 a1.6 1.2 0 1 0 -3.2 0 Z' for _ in range(500))
    v.tool('draw_path', d=pits, fill='#55575d', stroke='none', opacity=70)
    for (x, w_) in ((500, 80), (980, 120), (1440, 90)):
        a.shape(smooth_d([(x - w_ / 2, 770), (x - w_ * 0.4, 700), (x - w_ * 0.1, 650), (x + w_ * 0.2, 680), (x + w_ / 2, 770)], tension=0.4), '#5d6067', stroke=False, rough=3, opacity=55)
    a.hatch(pts_d([(430, 760), (1490, 760), (1490, 730), (430, 735)]), '#d9dbd2', angle=90, spacing=5, width=1.6, opacity=45)
    a.stroke('M470 770 l5 -18 l-4 -14 l7 -20', color='#3c3e44', lw=2.4, profile=None)


def pegboard(a, v, rr):
    x0, y0, x1, y1 = 560, 196, 900, 340
    a.shape(pts_d([(x0 + 8, y0 + 8), (x1 + 8, y0 + 8), (x1 + 8, y1 + 8), (x0 + 8, y1 + 8)]), '#4a4c52', stroke=False, rough=0, opacity=70)
    a.shape(pts_d([(x0, y0), (x1, y0), (x1, y1), (x0, y1)]), '#b08a5a', lw=4, rough=0.4)
    holes = ' '.join(circ(x, y, 1.7) for x in range(x0 + 10, x1 - 4, 14) for y in range(y0 + 10, y1 - 4, 14))
    v.tool('draw_path', d=holes, fill='#5a4028', stroke='none')
    a.hatch(pts_d([(x0, y0), (x1, y0), (x1, y1), (x0, y1)]), '#8a6a44', angle=0, spacing=7, width=1.4, opacity=35)
    hooks = []
    # hammer
    a.shape(pts_d([(600, 222), (612, 222), (614, 318), (598, 318)]), '#c49a62', lw=2.6, rough=0.3)
    a.shape(pts_d([(582, 210), (632, 210), (632, 230), (582, 230)]), '#7a7e86', lw=2.6, rough=0.3)
    a.shape('M582 210 q-14 6 -10 22 l10 -2 Z', '#7a7e86', lw=2, rough=0)
    hooks.append((606, 206))
    # wrench
    a.shape('M652 224 h10 v80 h-10 Z', '#a8adb4', lw=2.4, rough=0.3)
    a.shape(circ(657, 222, 13), '#a8adb4', lw=2.4, rough=0)
    a.shape('M651 205 h12 v12 h-12 Z', '#b08a5a', stroke=False, rough=0)
    a.shape(circ(657, 308, 9), '#a8adb4', lw=2.4, rough=0)
    a.shape(circ(657, 308, 4), '#b08a5a', stroke=False, rough=0)
    hooks.append((657, 208))
    # screwdrivers
    for x, col in ((690, '#d23a2e'), (708, '#e8c84a'), (726, '#2e6ab0')):
        a.shape(f'M{x - 6} 222 h12 v34 h-12 Z', col, lw=2.2, rough=0)
        a.stroke(f'M{x} 256 V300', color='#a8adb4', lw=4, profile=None, rough=False)
        hooks.append((x, 218))
    # hand saw
    a.shape('M752 228 L860 238 L858 270 Q800 274 752 262 Z', '#c8ccd2', lw=2.6, rough=0.3)
    v.tool('draw_path', d=' '.join(f'M{752 + k * 8} {262 + k * 0.6:.1f} l4 6 l4 -6' for k in range(13)), fill='none', stroke=INK, strokeWidth=1.4)
    a.shape('M860 232 q24 -4 26 18 q-2 24 -28 22 Z', '#7a4a2a', lw=2.6, rough=0.3)
    a.shape(ell(872, 251, 6, 9), '#b08a5a', stroke=False, rough=0)
    hooks += [(790, 226), (840, 232)]
    # coiled orange extension cord
    for k in range(4):
        a.stroke(ell(800, 308 + k * 1.5, 30 - k * 2, 14 - k), color=INK, lw=7, profile=None, rough=False)
        a.stroke(ell(800, 308 + k * 1.5, 30 - k * 2, 14 - k), color='#e07a2a', lw=4, profile=None, rough=False)
    hooks.append((800, 292))
    # tape measure
    a.shape(f'M846 290 h30 v28 h-30 Z', '#e8c84a', lw=2.4, rough=0.3)
    a.shape(circ(861, 304, 8), '#2a2a2a', stroke=False, rough=0)
    for hx, hy in hooks:
        a.stroke(f'M{hx - 4} {hy} q4 -6 8 0', color='#6a6a6a', lw=2.4, profile=None, rough=False)


def poster(a, v):
    # an original movie poster: "RAPTOR RUN" (a made-up film), sun, palms of the cycad kind, a raptor
    x0, y0, x1, y1 = 1118, 186, 1262, 384
    a.shape(pts_d([(x0 + 6, y0 + 8), (x1 + 6, y0 + 8), (x1 + 6, y1 + 8), (x0 + 6, y1 + 8)]), '#4a4c52', stroke=False, rough=0, opacity=60)
    a.shape(pts_d([(x0, y0), (x1, y0 + 2), (x1 - 2, y1), (x0 + 2, y1 - 2)]), '#2a1a2a', lw=3.5, rough=0.3)
    a.shape(pts_d([(x0 + 8, y0 + 10), (x1 - 8, y0 + 12), (x1 - 9, y1 - 50), (x0 + 9, y1 - 52)]), '#e0703a', lw=2, rough=0)
    a.shape(circ(1190, 262, 34), '#f6c443', stroke=False, rough=0)
    a.shape(pts_d([(x0 + 9, y1 - 52), (x1 - 9, y1 - 50), (x1 - 9, y1 - 74), (x0 + 9, y1 - 70)]), '#3a1a24', stroke=False, rough=0.4)
    raptor = ('M1150 318 Q1160 300 1178 298 Q1190 286 1204 288 Q1214 290 1216 296 L1206 298 Q1200 300 1196 306 '
              'Q1208 310 1216 320 L1206 322 L1200 316 L1192 330 L1198 344 L1188 344 L1184 330 Q1172 330 1166 340 '
              'L1170 344 L1160 344 L1160 330 Q1140 330 1124 320 Q1140 322 1150 318 Z')
    a.shape(raptor, '#2a1018', lw=2, rough=0.3)
    a.shape(pts_d([(x0 + 14, y0 + 18), (x1 - 14, y0 + 20), (x1 - 14, y0 + 40), (x0 + 14, y0 + 38)]), '#f6e8c8', lw=2, rough=0.2)
    v.tool('draw_path', d=f'M{x0 + 22} {y0 + 29} h40 M{x0 + 72} {y0 + 30} h46', fill='none', stroke='#a02a20', strokeWidth=7)
    v.tool('draw_path', d=f'M{x0 + 18} {y1 - 36} h96 M{x0 + 18} {y1 - 24} h70 M{x0 + 18} {y1 - 14} h84', fill='none', stroke='#c9b48a', strokeWidth=2.4)
    for (x, y) in ((x0 + 2, y0 + 2), (x1 - 4, y0 + 4)):
        a.shape(f'M{x - 10} {y - 6} h20 v12 h-20 Z', '#e6e1c6', stroke=False, rough=0, opacity=80)


def washer_dryer(a, v):
    XW, XF = -5.4, -4.5
    units = [('washer', 5.25, 6.15), ('dryer', 4.3, 5.2)]
    for name, z0, z1 in units:  # far first
        y0, y1 = YF, -0.7
        box3d(a, XW, XF, y0, y1, z0, z1, '#d8dade', '#e8eaee', '#f2f3f5', lw=3, rough=0.3)
        S = lambda s, t: P(XF, y0 + t * (y1 - y0), z0 + s * (z1 - z0))
        a.shape(pts_d([S(0.0, 0.84), S(1.0, 0.84), S(1.0, 1.0), S(0.0, 1.0)]), '#c4c7cc', lw=2, rough=0)  # control panel
        for s_, col in ((0.18, '#3a3a3a'), (0.32, '#3a3a3a')):
            c = S(s_, 0.92)
            a.shape(circ(c[0], c[1], 4), col, lw=1.4, rough=0)
        c = S(0.7, 0.92)
        a.shape(pts_d([S(0.55, 0.89), S(0.85, 0.89), S(0.85, 0.95), S(0.55, 0.95)]), '#2a3a2a', lw=1.2, rough=0)
        a.stroke(pts_d([S(0.6, 0.92), S(0.7, 0.92)], closed=False), color='#6ad08a', lw=1.6, profile=None, rough=False)
        ring = [S(0.5 + 0.34 * math.cos(t), 0.45 + 0.27 * math.sin(t)) for t in [k * math.pi / 18 for k in range(36)]]
        a.shape(smooth_d(ring), '#b8bcc2', lw=2.6, rough=0)
        inner = [S(0.5 + 0.25 * math.cos(t), 0.45 + 0.2 * math.sin(t)) for t in [k * math.pi / 18 for k in range(36)]]
        a.shape(smooth_d(inner), '#2c3440' if name == 'washer' else '#3a3e46', lw=2, rough=0)
        if name == 'washer':  # clothes in the drum
            for col, ds, dt in (('#c94f3d', -0.08, 0.38), ('#2e6ab0', 0.1, 0.36), ('#e8c84a', 0.0, 0.32)):
                c = S(0.5 + ds, dt)
                a.shape(ell(c[0], c[1], 7, 5), col, stroke=False, rough=0.6, opacity=80)
        hl = [S(0.32, 0.6), S(0.42, 0.66)]
        a.stroke(pts_d(hl, closed=False), color='#ffffff', lw=2.4, opacity=70, profile=None, rough=False)
        a.hatch(pts_d([P(XF, y1, z0), P(XF, y1, z0 + 0.02), P(XF, y0, z0 + 0.02), P(XF, y0, z0)]), '#9a9ea4', angle=80, spacing=4, width=1.2, opacity=30)
    # detergent bottle and a folded towel on top of the washer
    cylinder(a, v, -5.0, 5.95, 0.13, -0.7, -0.25, '#2e8ad0', '#e8e8e8', band='#f2f2f2')
    box3d(a, -5.3, -4.62, -0.7, -0.6, 5.4, 5.7, '#c96a8a', '#d98aa6', '#e8a6be', lw=1.8, rough=0.4)
    box3d(a, -5.3, -4.62, -0.6, -0.5, 5.43, 5.69, '#e8e0c8', '#f2ead6', '#faf4e4', lw=1.8, rough=0.4)
    # laundry basket on the floor in front, clothes heaped in it
    bx0, bx1, bz0, bz1 = -4.4, -3.7, 4.3, 4.95
    box3d(a, bx0, bx1, YF, -2.45, bz0, bz1, '#5a8ab0', '#4a7aa0', '#6a9ac0', lw=2.6, rough=0.3)
    inset = 0.06
    a.shape(pts_d([P(bx0 + inset, -2.45, bz0 + inset), P(bx1 - inset, -2.45, bz0 + inset), P(bx1 - inset, -2.45, bz1 - inset), P(bx0 + inset, -2.45, bz1 - inset)]), '#2e4a66', lw=1.6, rough=0)
    S = lambda s, t: P(bx1, YF + t * 0.55, bz0 + s * (bz1 - bz0))
    v.tool('draw_path', d=' '.join(pts_d([S(k / 8, 0.25), S(k / 8 + 0.06, 0.25), S(k / 8 + 0.06, 0.75), S(k / 8, 0.75)]) for k in range(1, 8)),
           fill='#2e4a66', stroke='none')
    for col, (x, y, z) in (('#e8e0c8', (-4.15, -2.38, 4.6)), ('#c94f3d', (-3.9, -2.36, 4.45)), ('#3a5a3a', (-4.05, -2.33, 4.8))):
        c = P(x, y, z)
        a.shape(smooth_d([(c[0] - 26, c[1] + 4), (c[0] - 14, c[1] - 6), (c[0] - 2, c[1] - 2), (c[0] + 12, c[1] - 9), (c[0] + 26, c[1] + 3), (c[0] + 10, c[1] + 8), (c[0] - 6, c[1] + 6)], tension=0.4), col, lw=2.2, rough=1)
        a.stroke(f'M{c[0] - 12:.1f} {c[1]:.1f} q8 -4 14 2 M{c[0] + 4:.1f} {c[1] - 2:.1f} q6 2 10 -3', color=shade(col, 0.7), lw=1.6, profile=None, rough=False)
    sock = P(-3.65, -2.6, 4.5)
    a.stroke(f'M{sock[0]:.1f} {sock[1]:.1f} q10 18 4 36 q-2 8 10 8', color=INK, lw=9, profile=None, rough=False)
    a.stroke(f'M{sock[0]:.1f} {sock[1]:.1f} q10 18 4 36 q-2 8 10 8', color='#f2f2f2', lw=5, profile=None, rough=False)


def right_side(a, v, rr):
    # dartboard on the right wall, seen in perspective, with three darts
    ctr = RIGHT(0.18, 0.3)
    def on_wall(du, dt):
        return RIGHT(0.18 + du, 0.3 + dt)
    for rad_, col in ((0.07, '#2a2a2a'), (0.058, '#e8dcc0'), (0.045, '#2a2a2a'), (0.03, '#c94f3d'), (0.012, '#2e8a4a'), (0.005, '#c94f3d')):
        ring = [on_wall(rad_ * 0.62 * math.cos(t), rad_ * math.sin(t) * 1.0) for t in [k * math.pi / 20 for k in range(40)]]
        a.shape(smooth_d(ring), col, lw=2, rough=0)
    spokes = ' '.join(pts_d([on_wall(0, 0), on_wall(0.045 * 0.62 * math.cos(k * math.pi / 10), 0.045 * math.sin(k * math.pi / 10))], closed=False) for k in range(20))
    v.tool('draw_path', d=spokes, fill='none', stroke='#8a8a8a', strokeWidth=1.2)
    for du, dt in ((0.004, -0.01), (-0.012, 0.016), (0.016, 0.02)):
        p0 = on_wall(du, dt)
        a.stroke(f'M{p0[0]:.1f} {p0[1]:.1f} l-26 -6', color=INK, lw=5, profile=None, rough=False)
        a.stroke(f'M{p0[0]:.1f} {p0[1]:.1f} l-26 -6', color='#c8ccd2', lw=2.4, profile=None, rough=False)
        a.shape(f'M{p0[0] - 26:.1f} {p0[1] - 6:.1f} l-10 -8 l2 10 l-8 4 Z', '#2e6ab0', lw=1.4, rough=0)
    # stacked storage boxes in the back right corner, labelled
    sr = random.Random(33)
    stack = [(4.35, 5.35, YF, -1.6, 9.0, 9.9, '#b08a5a'), (4.45, 5.3, -1.6, -0.3, 9.05, 9.85, '#c49a62'), (4.5, 5.25, -0.3, 0.75, 9.1, 9.8, '#a87e50')]
    for x0, x1, y0, y1, z0, z1, col in sorted(stack, key=lambda s: -s[4]):
        box3d(a, x0, x1, y0, y1, z0, z1, shade(col, 0.9), shade(col, 0.75), shade(col, 1.12), lw=2.6, rough=0.5)
        S = lambda s, t: P(x1 if x0 < 0 else x0, y0 + t * (y1 - y0), z0 + s * (z1 - z0))
        L = [P(x0 + (x1 - x0) * u, y0 + (y1 - y0) * t, z0) for u, t in ((0.25, 0.4), (0.75, 0.4), (0.75, 0.7), (0.25, 0.7))]
        a.shape(pts_d(L), '#efe6cc', lw=1.6, rough=0.3)
        a.stroke(f'M{L[0][0] + 6:.1f} {(L[0][1] + L[3][1]) / 2:.1f} H{L[1][0] - 6:.1f}', color='#2a2a6a', lw=2.2, profile=None)
        t0 = [P(x0 + (x1 - x0) * u, y1, z0) for u in (0.45, 0.55)]
        a.shape(pts_d([t0[0], t0[1], P(x0 + (x1 - x0) * 0.55, y1 - (y1 - y0) * 0.25, z0), P(x0 + (x1 - x0) * 0.45, y1 - (y1 - y0) * 0.25, z0)]), '#d8c08a', stroke=False, rough=0, opacity=80)
    # an old guitar case standing in the corner
    gc = [P(4.0, YF, 9.75), P(4.0, 0.6, 9.7), P(4.12, 0.95, 9.7), P(4.24, 0.6, 9.7), P(4.3, YF, 9.75)]
    a.shape(smooth_d(gc, tension=0.3), '#2a2a32', lw=3, rough=0.4)
    a.stroke(pts_d([P(4.05, 0.2, 9.7), P(4.26, 0.2, 9.7)], closed=False), color='#c9a040', lw=3, profile=None, rough=False)


def string_lights(a, v):
    """A sagging string of warm bulbs under the joists, close to the far wall."""
    bulbs = []
    z = 9.7
    xs = [-5.2 + k * 0.62 for k in range(18)]
    def sag(x):
        seg = 2.6
        u = ((x + 5.2) % seg) / seg
        return 2.95 - 0.28 * math.sin(math.pi * u)
    wire = [P(x / 4, sag(x / 4), z) for x in [int(-5.2 * 4) + k for k in range(43)]]
    wire = [P(-5.2 + k * 0.25, sag(-5.2 + k * 0.25), z) for k in range(42)]
    a.stroke(smooth_d(wire, closed=False), color='#1a1a1a', lw=2.4, profile=None, rough=False)
    cols = ['#ffd27a', '#ffb45a', '#ffe8a8', '#ff9a6a']
    for k, x in enumerate(xs):
        p0 = P(x, sag(x), z)
        col = cols[k % 4]
        a.shape(f'M{p0[0] - 3:.1f} {p0[1]:.1f} h6 v5 h-6 Z', '#3a3a3a', lw=1.2, rough=0)
        a.shape(f'M{p0[0]:.1f} {p0[1] + 5:.1f} q6 4 4 12 q-4 6 -8 0 q-2 -8 4 -12 Z', col, lw=1.6, rough=0)
        a.shape(ell(p0[0] - 1, p0[1] + 11, 1.5, 2.5), '#ffffff', stroke=False, rough=0, opacity=80)
        bulbs.append({'x': round(p0[0], 1), 'y': round(p0[1] + 11, 1), 'c': col})
    return bulbs


def room_front(out):
    v = VC(); a = Artist(v, W, H, 4, seed=71); rr = random.Random(5)
    wall_blocks(a, v, rr)
    pegboard(a, v, rr)
    poster(a, v)
    # small high window, night outside, on the far wall at the right
    a.shape(pts_d([(1300, 176), (1440, 176), (1440, 246), (1300, 246)]), '#4a4c52', lw=4)
    a.shape(pts_d([(1300, 176), (1440, 176), (1426, 190), (1300, 190)]), '#3c3e44', lw=2, rough=0.3)
    a.shape(pts_d([(1426, 190), (1440, 176), (1440, 246), (1426, 246)]), '#5a5c62', lw=2, rough=0.3)
    a.shape(pts_d([(1300, 190), (1426, 190), (1426, 246), (1300, 246)]), '#7a5a38', lw=3, rough=0.3)
    a.shape(pts_d([(1310, 198), (1416, 198), (1416, 238), (1310, 238)]), '#16223a', lw=2, rough=0)
    a.shape(smooth_d([(1310, 238), (1310, 226), (1350, 222), (1390, 227), (1416, 224), (1416, 238)], tension=0.4), '#3a2f24', stroke=False, rough=1)
    a.stroke('M1363 190 v56 M1300 218 h126', color='#7a5a38', lw=5, profile=None, rough=False)
    for (x, y) in ((1326, 206), (1398, 204)):
        a.shape(circ(x, y, 1.5), '#e8ecf5', stroke=False, rough=0)
    # ceiling joists (same as the other shot) and the copper line along the far wall
    a.shape(pts_d([CEIL(0, 0), CEIL(1, 0), CEIL(1, 1), CEIL(0, 1)]), '#3a2c20', lw=0, rough=0)
    joists = [pts_d([CEIL(i / 12 - 0.018, 0), CEIL(i / 12 + 0.018, 0), CEIL(i / 12 + 0.018, 1), CEIL(i / 12 - 0.018, 1)]) for i in range(13)]
    v.tool('draw_path', d=' '.join(joists), fill='#7a5a3a', stroke=INK, strokeWidth=3)
    grain = ' '.join(pts_d([CEIL(i / 12 - 0.008, t), CEIL(i / 12 + 0.006, t + 0.25)], closed=False) for i in range(13) for t in (0.1, 0.45, 0.7))
    v.tool('draw_path', d=grain, fill='none', stroke='#5a4028', strokeWidth=2)
    s0, s1 = P(-5.5, 2.95, 9.6), P(5.5, 2.95, 9.6)
    a.stroke(f'M{s0[0]:.1f} {s0[1]:.1f} L{s1[0]:.1f} {s1[1]:.1f}', color=INK, lw=12, profile=None, rough=False)
    a.stroke(f'M{s0[0]:.1f} {s0[1]:.1f} L{s1[0]:.1f} {s1[1]:.1f}', color='#b06a3a', lw=7, profile=None, rough=False)
    bulbs = string_lights(a, v)
    # floor: concrete, stains, the rug (it runs under the couch and the coffee table)
    a.shape(pts_d([FLOOR(0, 0), FLOOR(1, 0), FLOOR(1, 1), FLOOR(0, 1)]), '#5c5d60', lw=0, rough=0)
    for i in range(14):
        u, vv = rr.uniform(0.05, 0.95), rr.uniform(0.05, 0.9)
        c = FLOOR(u, vv); s = 20 + vv * 90
        a.shape(smooth_d([(c[0] - s, c[1]), (c[0] - s * 0.3, c[1] - s * 0.25), (c[0] + s * 0.5, c[1] - s * 0.2), (c[0] + s, c[1]), (c[0], c[1] + s * 0.2)], tension=0.4), '#4f5053', stroke=False, rough=2, opacity=60)
    seam = ' '.join(pts_d([FLOOR(u, 0), FLOOR(u, 1)], closed=False) for u in (0.33, 0.66))
    v.tool('draw_path', d=seam, fill='none', stroke='#45464a', strokeWidth=2)
    rug = [P(-3.6, YF, 8.6), P(3.6, YF, 8.6), P(3.6, YF, 3.4), P(-3.6, YF, 3.4)]
    a.shape(pts_d(rug), '#7a3a30', lw=4)
    inner = [P(-3.2, YF, 8.2), P(3.2, YF, 8.2), P(3.2, YF, 3.4), P(-3.2, YF, 3.4)]
    a.shape(pts_d(inner), '#8e4a3a', lw=2.5)
    pattern = ' '.join(pts_d([P(x, YF, 7.2), P(x + 0.18, YF, 6.95), P(x, YF, 6.7), P(x - 0.18, YF, 6.95)]) for x in [-2.4 + k * 0.6 for k in range(9)])
    v.tool('draw_path', d=pattern, fill='#c9a45a', stroke=INK, strokeWidth=1.6)
    a.hatch(pts_d(rug), '#5a2a22', angle=0, spacing=6, width=1.6, opacity=40)
    # side walls with joints, then the things against them
    a.shape(pts_d([LEFT(0, 0), LEFT(1, 0), LEFT(1, 1), LEFT(0, 1)]), '#64666d', lw=0, rough=0)
    v.tool('draw_path', d=wall_joints(LEFT), fill='none', stroke='#55575d', strokeWidth=1.6)
    a.shape(pts_d([RIGHT(0, 0), RIGHT(1, 0), RIGHT(1, 1), RIGHT(0, 1)]), '#64666d', lw=0, rough=0)
    v.tool('draw_path', d=wall_joints(RIGHT, flip=True), fill='none', stroke='#55575d', strokeWidth=1.6)
    # outlet and a light switch on the left wall, a fuse box on the right wall
    sw = [LEFT(0.82, 0.45), LEFT(0.84, 0.45), LEFT(0.84, 0.5), LEFT(0.82, 0.5)]
    a.shape(pts_d(sw), '#e6e1c6', lw=2, rough=0)
    fb = [RIGHT(0.5, 0.18), RIGHT(0.62, 0.18), RIGHT(0.62, 0.42), RIGHT(0.5, 0.42)]
    a.shape(pts_d(fb), '#8a8e94', lw=3, rough=0.3)
    a.shape(pts_d([RIGHT(0.515, 0.2), RIGHT(0.605, 0.2), RIGHT(0.605, 0.4), RIGHT(0.515, 0.4)]), '#9ea2a8', lw=2, rough=0)
    a.hatch(pts_d([RIGHT(0.58, 0.2), RIGHT(0.605, 0.2), RIGHT(0.605, 0.4), RIGHT(0.58, 0.4)]), '#6a6e74', angle=80, spacing=4, width=1.2, opacity=50)
    a.shape(pts_d([RIGHT(0.525, 0.28), RIGHT(0.535, 0.28), RIGHT(0.535, 0.32), RIGHT(0.525, 0.32)]), '#3a3a3a', lw=1.2, rough=0)
    a.shape(pts_d([RIGHT(0.545, 0.23), RIGHT(0.59, 0.23), RIGHT(0.59, 0.26), RIGHT(0.545, 0.26)]), '#e8c84a', lw=1.2, rough=0)
    a.stroke(pts_d([RIGHT(0.56, 0.18), RIGHT(0.56, 0.0)], closed=False), color='#6a6e74', lw=6, profile=None, rough=False)
    cork = [LEFT(0.5, 0.22), LEFT(0.78, 0.22), LEFT(0.78, 0.46), LEFT(0.5, 0.46)]
    a.shape(pts_d([LEFT(0.49, 0.21), LEFT(0.79, 0.21), LEFT(0.79, 0.47), LEFT(0.49, 0.47)]), '#7a5a38', lw=3.5, rough=0.3)
    a.shape(pts_d(cork), '#b8885a', lw=2, rough=0.3)
    v.tool('draw_path', d=' '.join(circ(*LEFT(rr.uniform(0.51, 0.77), rr.uniform(0.23, 0.45)), 1.4) for _ in range(90)), fill='#8a6038', stroke='none')
    for (u0, t0, du, dt, col, ang) in ((0.52, 0.25, 0.07, 0.08, '#f2f2f2', 1), (0.6, 0.24, 0.08, 0.1, '#e8e0c8', -1), (0.7, 0.27, 0.06, 0.09, '#f2f2f2', 1),
                                     (0.53, 0.36, 0.09, 0.08, '#f6e27a', 0), (0.64, 0.36, 0.07, 0.09, '#f2f2f2', -1), (0.72, 0.37, 0.05, 0.07, '#9ad0f0', 1)):
        q = [LEFT(u0, t0 + 0.005 * ang), LEFT(u0 + du, t0 - 0.005 * ang), LEFT(u0 + du, t0 + dt - 0.005 * ang), LEFT(u0, t0 + dt + 0.005 * ang)]
        a.shape(pts_d(q), col, lw=1.6, rough=0.3)
        if col == '#f2f2f2':  # a photo: picture area with two little figures
            qi = [lerp(q[0], q[2], 0.1), lerp(q[1], q[3], 0.1), lerp(q[2], q[0], 0.25), lerp(q[3], q[1], 0.25)]
            a.shape(pts_d([qi[0], (qi[2][0], qi[0][1]), qi[2], (qi[0][0], qi[2][1])]), '#5a8ab0', stroke=False, rough=0)
            m = lerp(qi[0], qi[2], 0.5)
            a.shape(circ(m[0] - 3, m[1], 2.4), '#ffffff', lw=1, rough=0)
            a.shape(circ(m[0] + 4, m[1] + 1, 2.4), '#ffffff', lw=1, rough=0)
        pin = lerp(q[0], q[1], 0.5)
        a.shape(circ(pin[0], pin[1] + 2, 2.6), rr.choice(['#d23a2e', '#2e8a4a', '#2e6ab0']), lw=1, rough=0)
    washer_dryer(a, v)
    right_side(a, v, rr)
    v.tool('export', path=os.path.join(out, 'bRoomF.svg'))
    v.close()
    return bulbs


# ------------------------------------------------------------------ the couch from the front
GREEN, GREEN_SIDE, GREEN_TOP, GREEN_DARK = '#56623f', '#46512f', '#66724c', '#3a4428'


def cushion_front(a, v, x0, x1, y0, y1, z, col, puff=0.06, ribs=True):
    """A puffy cushion face: corners pulled in, edges bulging, corduroy ribs and piping."""
    c = [P(x0, y1, z), P(x1, y1, z), P(x1, y0, z), P(x0, y0, z)]
    mx, my = (c[0][0] + c[1][0]) / 2, (c[0][1] + c[3][1]) / 2
    def bulge(p, q, k):
        m = lerp(p, q, 0.5)
        return (m[0] + (m[0] - mx) * k, m[1] + (m[1] - my) * k)
    pts = [lerp(c[0], c[1], 0.04), bulge(c[0], c[1], puff), lerp(c[0], c[1], 0.96), lerp(c[1], c[2], 0.06), bulge(c[1], c[2], puff * 0.6),
           lerp(c[1], c[2], 0.94), lerp(c[2], c[3], 0.04), bulge(c[2], c[3], puff), lerp(c[2], c[3], 0.96), lerp(c[3], c[0], 0.06), bulge(c[3], c[0], puff * 0.6), lerp(c[3], c[0], 0.94)]
    d = smooth_d(pts, tension=0.45)
    a.shape(d, col, lw=3.5, rough=0.5)
    if ribs:
        n = int(abs(c[1][0] - c[0][0]) / 9)
        rib = ' '.join(pts_d([lerp(lerp(c[0], c[1], k / n), lerp(c[3], c[2], k / n), 0.08), lerp(lerp(c[0], c[1], k / n), lerp(c[3], c[2], k / n), 0.92)], closed=False) for k in range(1, n))
        v.tool('draw_path', d=rib, fill='none', stroke=shade(col, 0.85), strokeWidth=2.2)
    a.shape(smooth_d([lerp(c[3], c[2], 0.1), lerp(lerp(c[3], c[2], 0.5), (mx, my), 0.25), lerp(c[3], c[2], 0.9), lerp(c[2], c[1], 0.15), lerp(c[3], c[0], 0.15)], tension=0.4),
            shade(col, 0.8), stroke=False, rough=0, opacity=55)
    return d


def couch_front(out):
    v = VC(); a = Artist(v, W, H, 5, seed=73); rr = random.Random(11)
    XO, XI = 4.45, 3.75
    ZB0, ZB1 = 8.0, 8.9
    # floor shadow under the couch
    a.shape(pts_d([P(-XO - 0.2, YF, 6.3), P(XO + 0.2, YF, 6.3), P(XO + 0.2, YF, 9.1), P(-XO - 0.2, YF, 9.1)]), '#2a2b2e', stroke=False, rough=2, opacity=70)
    # back frame and back cushions
    box3d(a, -XO, XO, -2.7, 0.15, ZB0, ZB1, GREEN_DARK, GREEN_DARK, GREEN_TOP, lw=4, rough=0.4)
    top_roll = [P(-XO, 0.15, ZB0), P(XO, 0.15, ZB0), P(XO, -0.05, ZB0 - 0.05), P(-XO, -0.05, ZB0 - 0.05)]
    a.shape(pts_d(top_roll), GREEN, lw=3, rough=0.4)
    splits = [(-XI, -1.27), (-1.23, 1.23), (1.27, XI)]
    for k, (x0, x1) in enumerate(splits):
        cushion_front(a, v, x0, x1, -1.32, 0.0, 7.78, shade(GREEN, 1.0 + 0.03 * (k - 1)), puff=0.08)
        btn = P((x0 + x1) / 2, -0.62, 7.75)
        a.shape(circ(btn[0], btn[1], 4), GREEN_DARK, lw=1.6, rough=0)
        for ang in (0, 120, 240):
            a.stroke(f'M{btn[0]:.1f} {btn[1]:.1f} l{math.cos(math.radians(ang)) * 16:.1f} {math.sin(math.radians(ang)) * 10:.1f}', color=GREEN_DARK, lw=2, profile=None, rough=False)
    # the knitted blanket thrown over the back on the left, hanging down over the cushion
    bl = [P(-3.6, 0.2, 8.1), P(-0.7, 0.2, 8.1), P(-0.75, -0.55, 7.74), P(-1.1, -0.95, 7.72), P(-2.2, -0.75, 7.72), P(-3.2, -1.0, 7.72), P(-3.65, -0.7, 7.74)]
    bd = smooth_d(bl, tension=0.3)
    a.shape(bd, '#c9a45a', lw=4, rough=0.8)
    for row in range(8):
        y = 0.12 - row * 0.12
        pts = []
        for i in range(30):
            x = -3.55 + i * 0.1
            pts.append(P(x, y - (0.04 if i % 2 else 0), 7.76 if y < -0.05 else 8.05))
        v.tool('draw_path', d=pts_d(pts, closed=False), fill='none', stroke='#a04a3a' if row % 2 == 0 else '#e9dcbc', strokeWidth=3.4 if row % 2 == 0 else 2.6)
    tass = ' '.join(f'M{p[0]:.1f} {p[1]:.1f} l{rr.uniform(-3, 3):.1f} {rr.uniform(14, 20):.1f}' for p in [P(-3.6 + k * 0.29, -0.78 - 0.18 * math.sin(k * 0.9), 7.72) for k in range(11)])
    v.tool('draw_path', d=tass, fill='none', stroke='#c9a45a', strokeWidth=4)
    a.hatch(bd, '#8a6a30', angle=75, spacing=7, width=1.6, opacity=30)
    # arms: front face with a scrolled roll, the inner side, the top
    for s in (-1, 1):
        x0, x1 = (-XO, -XI) if s < 0 else (XI, XO)
        y0, y1, z0, z1 = -2.75, -0.5, 6.45, ZB1
        for kind, q in faces3d(x0, x1, y0, y1, z0, z1):
            col = {'front': GREEN, 'side': GREEN_SIDE, 'top': GREEN_TOP}[kind]
            a.shape(pts_d(q), col, lw=3.5, rough=0.5)
            if kind == 'side':
                a.hatch(pts_d(q), '#2c3420', angle=80, spacing=7, width=1.8, opacity=40)
        roll_c = P((x0 + x1) / 2, -0.75, z0 - 0.01)
        rx = abs(P(x1, -0.75, z0)[0] - P(x0, -0.75, z0)[0]) / 2
        a.shape(ell(roll_c[0], roll_c[1], rx * 0.92, rx * 0.55), shade(GREEN, 1.05), lw=3, rough=0.4)
        a.stroke(f'M{roll_c[0] - rx * 0.5:.1f} {roll_c[1]:.1f} a{rx * 0.5:.1f} {rx * 0.3:.1f} 0 1 1 {rx * 0.6:.1f} 4', color=GREEN_DARK, lw=3)
        n = int(rx * 2 / 10)
        ribs = ' '.join(f'M{P(x0, y1, z0)[0] + (k + 0.5) * rx * 2 / n:.1f} {roll_c[1] + rx * 0.6:.1f} V{P(x0, y0, z0)[1] - 4:.1f}' for k in range(n))
        v.tool('draw_path', d=ribs, fill='none', stroke=GREEN_DARK, strokeWidth=2)
    # seat base, with corduroy and a kick pleat
    box3d(a, -XI, XI, -2.7, -1.6, 6.5, 7.9, GREEN_SIDE, GREEN_SIDE, GREEN_TOP, lw=3.5, rough=0.4)
    q = [P(-XI, -1.6, 6.5), P(XI, -1.6, 6.5), P(XI, -2.7, 6.5), P(-XI, -2.7, 6.5)]
    ribs = ' '.join(pts_d([lerp(q[0], q[1], k / 120), lerp(q[3], q[2], k / 120)], closed=False) for k in range(1, 120))
    v.tool('draw_path', d=ribs, fill='none', stroke='#3c4630', strokeWidth=2)
    pl = [P(-XI, -2.45, 6.5), P(XI, -2.45, 6.5)]
    a.stroke(pts_d(pl, closed=False), color=GREEN_DARK, lw=4, profile=None, rough=False)
    for x in (-1.25, 1.25):
        p0, p1 = P(x, -2.45, 6.5), P(x, -2.7, 6.5)
        a.stroke(f'M{p0[0]:.1f} {p0[1]:.1f} L{p1[0]:.1f} {p1[1]:.1f}', color=GREEN_DARK, lw=3, profile=None, rough=False)
    # seat cushions: top (with the dents where each one sits), puffy front, piping
    dents = {0: [-2.6, -0.95], 1: [0.85], 2: [2.6]}
    for k, (x0, x1) in enumerate(splits):
        col = shade(GREEN, 1.0 + 0.03 * (1 - k))
        top = [P(x0, -1.25, 6.45), P(x1, -1.25, 6.45), P(x1, -1.25, 7.78), P(x0, -1.25, 7.78)]
        a.shape(smooth_d([top[0], lerp(top[0], top[1], 0.5), top[1], top[2], top[3]], tension=0.2), shade(col, 1.12), lw=3.2, rough=0.4)
        for i, x in enumerate([x for x in (-2.6, -0.95, 0.85, 2.6) if x0 - 0.3 < x < x1 + 0.3]):
            c = P(x, -1.25, 7.2)
            a.shape(ell(c[0], c[1] + 2, 70, 13), shade(col, 0.85), stroke=False, rough=1.5, opacity=60)
        cushion_front(a, v, x0, x1, -1.62, -1.25, 6.45, col, puff=0.18, ribs=False)
        f0, f1 = P(x0 + 0.05, -1.27, 6.44), P(x1 - 0.05, -1.27, 6.44)
        a.stroke(f'M{f0[0]:.1f} {f0[1]:.1f} Q{(f0[0] + f1[0]) / 2:.1f} {f0[1] - 4:.1f} {f1[0]:.1f} {f1[1]:.1f}', color=shade(col, 0.7), lw=3, profile=None, rough=False)
        a.stroke(f'M{f0[0]:.1f} {f0[1] + 2:.1f} Q{(f0[0] + f1[0]) / 2:.1f} {f0[1] - 2:.1f} {f1[0]:.1f} {f1[1] + 2:.1f}', color=shade(col, 1.3), lw=1.6, opacity=60, profile=None, rough=False)
        wear = P((x0 + x1) / 2 + rr.uniform(-0.4, 0.4), -1.44, 6.45)
        a.shape(ell(wear[0], wear[1], 40, 9), shade(col, 1.15), stroke=False, rough=1.5, opacity=50)
    # wooden feet
    for x in (-XO + 0.12, XO - 0.12):
        box3d(a, x - 0.1, x + 0.1, YF, -2.75, 6.5, 6.7, '#5a3c24', '#4a3220', '#7a5232', lw=2.4, rough=0.2)
    v.tool('export', path=os.path.join(out, 'bCouchF.svg'))
    v.close()


def side_table(out):
    """The lamp table at the right end of the couch (the left end in the shot from behind)."""
    v = VC(); a = Artist(v, W, H, 5, seed=75)
    X0, X1, Z0, Z1, YT = 4.6, 5.35, 6.75, 7.55, -1.35
    for kind, q in faces3d(X0, X1, YT - 0.08, YT, Z0, Z1):
        a.shape(pts_d(q), {'front': '#5e4028', 'side': '#4a3220', 'top': '#7a5232'}[kind], lw=3, rough=0.3)
    for kind, q in faces3d(X0 + 0.04, X1 - 0.04, YT - 0.45, YT - 0.08, Z0 + 0.03, Z1 - 0.03):
        a.shape(pts_d(q), {'front': '#4a3220', 'side': '#33231a', 'top': '#5e4028'}[kind], lw=3, rough=0.3)
    dr = [P(X0 + 0.04, YT - 0.14, Z0 + 0.03), P(X0 + 0.04, YT - 0.14, Z1 - 0.06), P(X0 + 0.04, YT - 0.4, Z1 - 0.06), P(X0 + 0.04, YT - 0.4, Z0 + 0.03)]
    a.shape(pts_d(dr), '#563a26', lw=2.2, rough=0.3)
    kn = P(X0 + 0.04, YT - 0.27, (Z0 + Z1) / 2)
    a.shape(ell(kn[0], kn[1], 3.5, 5), '#c9a040', lw=1.6, rough=0)
    for x, z in ((X0 + 0.05, Z0 + 0.05), (X1 - 0.1, Z0 + 0.05), (X0 + 0.05, Z1 - 0.1)):
        for kind, q in faces3d(x, x + 0.06, YF, YT - 0.45, z, z + 0.06):
            a.shape(pts_d(q), '#4a3220', lw=2.4, rough=0.2)
    # lamp: glazed base, brass neck, shade glowing from inside
    bx, bz = 4.95, 7.15
    b0, b1 = P(bx, YT, bz), P(bx, YT + 0.45, bz)
    R = F * 0.14 / bz
    hgt = b0[1] - b1[1]
    vase = [(b0[0] - R * 0.55, b0[1]), (b0[0] + R * 0.55, b0[1]), (b0[0] + R, b0[1] - hgt * 0.35), (b0[0] + R * 0.7, b0[1] - hgt * 0.75),
            (b0[0] + R * 0.25, b1[1]), (b0[0] - R * 0.25, b1[1]), (b0[0] - R * 0.7, b0[1] - hgt * 0.75), (b0[0] - R, b0[1] - hgt * 0.35)]
    a.shape(ell(b0[0], b0[1], R * 0.9, R * 0.15), '#2e1f14', stroke=False, rough=0, opacity=70)
    a.shape(smooth_d(vase, tension=0.4), '#3f7f86', lw=3, rough=0.3)
    a.shape(smooth_d([(b0[0] + R * 0.1, b0[1]), (b0[0] + R * 0.55, b0[1]), (b0[0] + R, b0[1] - hgt * 0.35), (b0[0] + R * 0.7, b0[1] - hgt * 0.75), (b0[0] + R * 0.25, b1[1]), (b0[0] + R * 0.3, b0[1] - hgt * 0.5)], tension=0.4), '#2c5c62', stroke=False, rough=0)
    a.stroke(f'M{b0[0] - R * 0.95:.1f} {b0[1] - hgt * 0.4:.1f} Q{b0[0]:.1f} {b0[1] - hgt * 0.32:.1f} {b0[0] + R * 0.95:.1f} {b0[1] - hgt * 0.4:.1f}', color='#d9b45a', lw=2.4, profile=None, rough=False)
    a.stroke(f'M{b0[0] - R * 0.6:.1f} {b0[1] - hgt * 0.62:.1f} Q{b0[0] - R * 0.82:.1f} {b0[1] - hgt * 0.4:.1f} {b0[0] - R * 0.5:.1f} {b0[1] - hgt * 0.12:.1f}', color='#bfe4e6', lw=2, opacity=70, profile=None, rough=False)
    n0, n1 = P(bx, YT + 0.45, bz), P(bx, YT + 0.75, bz)
    a.stroke(f'M{n0[0]:.1f} {n0[1]:.1f} L{n1[0]:.1f} {n1[1]:.1f}', color='#8a6a2a', lw=4, profile=None, rough=False)
    t_c, b_c = P(bx, YT + 1.15, bz), P(bx, YT + 0.7, bz)
    rt, rb = F * 0.16 / bz, F * 0.3 / bz
    sh = f'M{t_c[0] - rt:.1f} {t_c[1]:.1f} L{b_c[0] - rb:.1f} {b_c[1]:.1f} A{rb:.1f} {rb * 0.18:.1f} 0 0 0 {b_c[0] + rb:.1f} {b_c[1]:.1f} L{t_c[0] + rt:.1f} {t_c[1]:.1f} A{rt:.1f} {rt * 0.15:.1f} 0 0 1 {t_c[0] - rt:.1f} {t_c[1]:.1f} Z'
    a.shape(sh, '#f6cf88', lw=4, rough=0.3)
    v.tool('draw_path', d=' '.join(f'M{t_c[0] - rt + k * rt / 4.5:.1f} {t_c[1] + 2:.1f} L{b_c[0] - rb + k * rb / 4.5:.1f} {b_c[1]:.1f}' for k in range(1, 9)), fill='none', stroke='#e0aa5a', strokeWidth=1.6)
    a.stroke(f'M{b_c[0] - rb:.1f} {b_c[1]:.1f} A{rb:.1f} {rb * 0.18:.1f} 0 0 0 {b_c[0] + rb:.1f} {b_c[1]:.1f}', color='#c98a3a', lw=5, profile=None, rough=False)
    # the bright underside of the shade and the light pool on the table top
    a.shape(ell(b_c[0], b_c[1] + 1, rb * 0.9, rb * 0.14), '#fff2c8', stroke=False, rough=0, opacity=90)
    pool = P(bx, YT, bz)
    a.shape(ell(pool[0], pool[1], 56, 9), '#c99a5a', stroke=False, rough=0, opacity=50)
    # a mug and a soda can
    cylinder(a, v, 4.75, 6.95, 0.07, YT, YT + 0.22, '#c94f3d', '#3a2414')
    cylinder(a, v, 5.2, 7.35, 0.055, YT, YT + 0.28, '#3a7ab0', '#c8ccd2', band='#e8ecf2')
    v.tool('export', path=os.path.join(out, 'bSideF.svg'))
    v.close()


def coffee_table(out):
    v = VC(); a = Artist(v, W, H, 5, seed=77); rr = random.Random(13)
    X0, X1, Z0, Z1, YT = -2.4, 2.4, 4.2, 5.5, -1.62
    for x, z in ((X0 + 0.1, Z1 - 0.25), (X1 - 0.25, Z1 - 0.25)):  # back legs
        box3d(a, x, x + 0.15, YF, YT - 0.3, z, z + 0.15, '#4a3220', '#3a2718', '#5e4028', lw=2.6, rough=0.2)
    box3d(a, X0 + 0.08, X1 - 0.08, YT - 0.32, YT - 0.12, Z0 + 0.05, Z1 - 0.05, '#4a3220', '#3a2718', '#5e4028', lw=3, rough=0.3)  # apron
    box3d(a, X0, X1, YT - 0.12, YT, Z0, Z1, '#5e4028', '#4a3220', '#7a5232', lw=4, rough=0.3)
    for dx0, dx1 in ((X0 + 0.25, -0.1), (0.1, X1 - 0.25)):
        dq = [P(dx0, YT - 0.15, Z0 + 0.05), P(dx1, YT - 0.15, Z0 + 0.05), P(dx1, YT - 0.29, Z0 + 0.05), P(dx0, YT - 0.29, Z0 + 0.05)]
        a.shape(pts_d(dq), '#563a26', lw=2.4, rough=0.3)
        kn = P((dx0 + dx1) / 2, YT - 0.22, Z0 + 0.04)
        a.shape(ell(kn[0], kn[1], 7, 5), '#c9a040', lw=2, rough=0)
        a.stroke(f'M{kn[0] - 3:.1f} {kn[1] - 2:.1f} a3 2 0 0 1 5 -1', color='#f6e2a0', lw=1.4, profile=None, rough=False)
        v.tool('draw_path', d=' '.join(smooth_d([lerp(dq[0], dq[3], t), lerp(lerp(dq[0], dq[1], 0.5), lerp(dq[3], dq[2], 0.5), t + rr.uniform(-0.05, 0.05)), lerp(dq[1], dq[2], t)], closed=False) for t in (0.3, 0.65)),
               fill='none', stroke='#3e2a1a', strokeWidth=1.4)
    ef = [P(X0, YT, Z0), P(X1, YT, Z0), P(X1, YT - 0.12, Z0), P(X0, YT - 0.12, Z0)]
    v.tool('draw_path', d=smooth_d([lerp(ef[0], ef[3], 0.5), lerp(ef[0], ef[1], 0.3), lerp(ef[0], ef[1], 0.7), lerp(ef[1], ef[2], 0.5)], closed=False), fill='none', stroke='#4a3220', strokeWidth=1.4)
    for x in (-1.9, 0.6, 2.0):  # dents and scuffs on the front edge
        c = P(x, YT - 0.06, Z0)
        a.stroke(f'M{c[0]:.1f} {c[1]:.1f} l{rr.uniform(6, 14):.1f} {rr.uniform(-2, 2):.1f}', color='#a8784a', lw=1.6, opacity=70, profile=None, rough=False)
    top = [P(X0, YT, Z0), P(X1, YT, Z0), P(X1, YT, Z1), P(X0, YT, Z1)]
    grain = ' '.join(smooth_d([P(X0 + 0.1, YT, z), P(-0.8, YT, z + rr.uniform(-0.03, 0.03)), P(0.9, YT, z + rr.uniform(-0.03, 0.03)), P(X1 - 0.1, YT, z)], closed=False, tension=0.4)
                     for z in [Z0 + 0.12 + k * 0.17 + rr.uniform(-0.03, 0.03) for k in range(7)])
    v.tool('draw_path', d=grain, fill='none', stroke='#5e4028', strokeWidth=1.8)
    knot = P(1.4, YT, 4.9)
    a.shape(ell(knot[0], knot[1], 16, 4), '#5e4028', stroke=False, rough=0.5)
    for (x, z) in ((-1.0, 4.95), (0.4, 4.45)):  # ring stains from glasses
        c = P(x, YT, z)
        a.stroke(ell(c[0], c[1], 22, 6), color='#4a3220', lw=2, opacity=60, profile=None, rough=False)
    e0, e1 = P(X0 + 0.05, YT, Z0), P(X1 - 0.05, YT, Z0)
    a.stroke(f'M{e0[0]:.1f} {e0[1] + 2:.1f} L{e1[0]:.1f} {e1[1] + 2:.1f}', color='#a8784a', lw=3, opacity=70, profile=None, rough=False)
    # front legs (they go off the bottom of the frame)
    for x in (X0 + 0.1, X1 - 0.25):
        box3d(a, x, x + 0.15, YF, YT - 0.12, Z0 + 0.05, Z0 + 0.2, '#4a3220', '#3a2718', '#5e4028', lw=2.6, rough=0.2)
    # drinks: two big soda cups with lids and straws
    for (x, z, col) in ((-1.75, 4.65, '#d23a2e'), (2.05, 4.6, '#2e6ab0')):
        cylinder(a, v, x, z, 0.14, YT, YT + 0.62, col, '#f2f2f2', band='#f6efe0')
        st0, st1 = P(x + 0.03, YT + 0.62, z), P(x + 0.12, YT + 0.95, z)
        a.stroke(f'M{st0[0]:.1f} {st0[1]:.1f} L{st1[0]:.1f} {st1[1]:.1f}', color=INK, lw=8, profile=None, rough=False)
        a.stroke(f'M{st0[0]:.1f} {st0[1]:.1f} L{st1[0]:.1f} {st1[1]:.1f}', color='#f2f2f2', lw=4, profile=None, rough=False)
        a.stroke(f'M{st0[0] + 1:.1f} {st0[1] - 8:.1f} L{st1[0]:.1f} {st1[1] + 4:.1f}', color='#d23a2e', lw=1.6, profile=None, rough=False, opacity=80)
        drops = P(x + 0.02, YT + 0.3, z - 0.15)
        v.tool('draw_path', d=' '.join(ell(drops[0] + dx, drops[1] + dy, 1.4, 2.2) for dx, dy in ((-8, -6), (2, 10), (9, -14))), fill='#e8f4ff', stroke='none', opacity=70)
    # TV remote and two game controllers lying on the table
    for kind, q in faces3d(-0.5, 0.25, YT, YT + 0.06, 4.55, 4.72):
        a.shape(pts_d(q), {'front': '#1a1a1e', 'side': '#26262a', 'top': '#2c2c32'}[kind], lw=2.2, rough=0)
    for i, x in enumerate((-0.4, -0.25, -0.1, 0.05)):
        c = P(x, YT + 0.06, 4.63)
        a.shape(ell(c[0], c[1], 3.5, 1.6), '#c94f3d' if i == 0 else '#6a6a72', stroke=False, rough=0)
    for (cx, cz, ang, col) in ((0.85, 4.75, -10, '#2a2a32'), (-0.95, 4.45, 14, '#f2f2f2')):
        c = P(cx, YT, cz)
        sx = F * 0.17 / cz
        sy = sx * abs(YT) / cz
        body = [(-1, 0.1), (-0.6, -0.5), (0.6, -0.5), (1, 0.1), (0.85, 0.6), (0.45, 0.4), (-0.45, 0.4), (-0.85, 0.6)]
        pts = [(c[0] + (x * math.cos(math.radians(ang)) - y * math.sin(math.radians(ang))) * sx, c[1] + (x * math.sin(math.radians(ang)) + y * math.cos(math.radians(ang))) * sy * 1.6) for x, y in body]
        a.shape(smooth_d(pts, tension=0.45), col, lw=2.6, rough=0)
        for bx_, by_, bc in ((0.5, -0.1, '#d23a2e'), (0.65, 0.05, '#2e8a4a'), (-0.5, 0.0, '#5a5a62')):
            px = c[0] + (bx_ * math.cos(math.radians(ang)) - by_ * math.sin(math.radians(ang))) * sx
            py = c[1] + (bx_ * math.sin(math.radians(ang)) + by_ * math.cos(math.radians(ang))) * sy * 1.6
            a.shape(ell(px, py, 4, 2.4), bc, stroke=False, rough=0)
        cable = f'M{c[0]:.1f} {c[1] - sy:.1f} q{rr.uniform(-30, 30):.1f} {-rr.uniform(6, 10):.1f} {rr.uniform(-60, 60):.1f} {-rr.uniform(14, 20):.1f} q{rr.uniform(-40, 40):.1f} -8 {rr.uniform(-80, 80):.1f} -4'
        a.stroke(cable, color='#1a1a1a', lw=2.4, profile=None)
    # a crumpled candy wrapper and spilt popcorn across the top
    w_ = P(1.05, YT, 5.25)
    a.shape(smooth_d([(w_[0] - 16, w_[1]), (w_[0] - 6, w_[1] - 8), (w_[0] + 10, w_[1] - 6), (w_[0] + 18, w_[1] + 2), (w_[0] + 4, w_[1] + 6)], tension=0.3), '#8a3ac0', lw=2, rough=1.5)
    a.stroke(f'M{w_[0] - 8:.1f} {w_[1] - 2:.1f} l12 2', color='#e8c84a', lw=2, profile=None)
    for _ in range(26):
        x, z = rr.uniform(-2.2, 2.2), rr.uniform(4.3, 5.4)
        c = P(x, YT, z)
        kernel(a, c[0], c[1] - 6, F * 0.06 / z * rr.uniform(0.8, 1.1), rr)
    v.tool('export', path=os.path.join(out, 'bTableF.svg'))
    v.close()


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    bulbs = room_front(out); print('room ok')
    couch_front(out); print('couch ok')
    side_table(out); print('side table ok')
    coffee_table(out); print('table ok')
    bucket(out); bowl(out); bag(out); kernel_sprites(out); print('props ok')
    with open(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'timetraveler', 'frontLights.json'), 'w') as f:
        json.dump(bulbs, f)
