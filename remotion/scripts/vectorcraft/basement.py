"""Basement TV room, seen from behind the couch: the four friends watching TV. Drawn in VectorCraft.

  bRoom.svg        (1920 x 1080) one-point-perspective basement: cinder-block back wall, exposed
                   ceiling joists with a duct and pipes, a hanging bulb, a small high window, shelving
                   with boxes and games (left), stairs and a water heater (right), concrete floor, rug
  bTV.svg          (1920 x 1080) TV on a cluttered low cabinet; the screen is left open (Remotion fills it)
  bCouch.svg       (1920 x 1080) the couch from behind: corduroy back, arms, a knitted blanket
  bLamp.svg        (1920 x 1080) the side table with the table lamp, a mug, a soda can and the remote
  bBack<Name>.svg  (560 x 600) each friend from behind, head and shoulders (Traveler, Tank, Pip, Ria),
                   in their locked colours (TimeTraveler.tsx, Explorer.tsx)
Usage (from remotion/): python3 scripts/vectorcraft/basement.py public/timetraveler/basement
"""
import math, os, random, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vc import VC
from art import Artist, smooth_d, pts_d, lerp, INK

W, H = 1920, 1080
VP = (960, 470)                       # vanishing point (behind the TV)
BW = [(420, 160), (1500, 160), (1500, 770), (420, 770)]  # back wall: TL, TR, BR, BL
rng = random.Random(3)


def homography(quad):
    """Map the unit square to a quad (TL, TR, BR, BL) with perspective."""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = quad
    dx1, dx2, dx3 = x1 - x2, x3 - x2, x0 - x1 + x2 - x3
    dy1, dy2, dy3 = y1 - y2, y3 - y2, y0 - y1 + y2 - y3
    if abs(dx3) < 1e-9 and abs(dy3) < 1e-9:
        a, b, c, d, e, f, g, h = x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0
    else:
        den = dx1 * dy2 - dx2 * dy1
        g = (dx3 * dy2 - dx2 * dy3) / den
        h = (dx1 * dy3 - dx3 * dy1) / den
        a, b, c = x1 - x0 + g * x1, x3 - x0 + h * x3, x0
        d, e, f = y1 - y0 + g * y1, y3 - y0 + h * y3, y0
    def m(u, v):
        w = g * u + h * v + 1
        return ((a * u + b * v + c) / w, (d * u + e * v + f) / w)
    return m


def quad_d(m, u0, v0, u1, v1):
    return pts_d([m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)])


# the four room surfaces (unit square corners in TL, TR, BR, BL order)
LEFT = homography([(-60, -60), BW[0], BW[3], (-60, 1140)])     # u: front→back, v: top→bottom
RIGHT = homography([BW[1], (1980, -60), (1980, 1140), BW[2]])  # u: back→front
CEIL = homography([(-60, -60), (1980, -60), BW[1], BW[0]])      # u: left→right, v: front→back
FLOOR = homography([BW[3], BW[2], (1980, 1140), (-60, 1140)])   # u: left→right, v: back→front


def room(out):
    v = VC(); a = Artist(v, W, H, 4, seed=31)
    # ---- back wall: cinder blocks, staggered, each a little different, with mortar and stains
    a.shape(pts_d(BW), '#6f7178', lw=4)
    bw, bh = 90, 44
    blocks = {}
    for row in range(int((BW[2][1] - BW[0][1]) / bh) + 1):
        y = BW[0][1] + row * bh
        off = (bw / 2) if row % 2 else 0
        x = BW[0][0] - off
        while x < BW[1][0]:
            x0, x1 = max(BW[0][0], x + 2), min(BW[1][0], x + bw - 2)
            y0, y1 = y + 2, min(BW[2][1], y + bh - 2)
            if x1 > x0 + 6 and y1 > y0 + 4:
                c = rng.choice(['#7a7c83', '#74767d', '#80828a', '#6d6f76'])
                blocks.setdefault(c, []).append(pts_d([(x0, y0), (x1, y0 + rng.uniform(-1, 1)), (x1, y1), (x0, y1)]))
            x += bw
    for c, ds in blocks.items():
        v.tool('draw_path', d=' '.join(ds), fill=c, stroke='#55575d', strokeWidth=1.6)
    # pitting on the blocks, water stains and white efflorescence near the floor, a crack
    pits = ' '.join(f'M{rng.uniform(430, 1490):.1f} {rng.uniform(170, 760):.1f} a1.6 1.2 0 1 0 3.2 0 a1.6 1.2 0 1 0 -3.2 0 Z' for _ in range(500))
    v.tool('draw_path', d=pits, fill='#55575d', stroke='none', opacity=70)
    for (x, w_) in ((560, 90), (1180, 130), (1390, 70)):
        a.shape(smooth_d([(x - w_ / 2, 770), (x - w_ * 0.4, 690), (x - w_ * 0.1, 640), (x + w_ * 0.2, 670), (x + w_ / 2, 770)], tension=0.4), '#5d6067', stroke=False, rough=3, opacity=55)
    a.hatch(pts_d([(430, 760), (1490, 760), (1490, 730), (430, 735)]), '#d9dbd2', angle=90, spacing=5, width=1.6, opacity=45)
    a.stroke('M452 770 l6 -22 l-5 -18 l8 -24 l-3 -14', color='#3c3e44', lw=2.6, profile=None)
    a.stroke('M453 730 l12 -8 l4 -10', color='#3c3e44', lw=1.6, profile=None)
    # small high window, recessed in the block wall. It sits above eye level and left of centre, so
    # the top and left reveals show and the frame is pushed back toward the vanishing point.
    a.shape(pts_d([(548, 172), (732, 172), (732, 262), (548, 262)]), '#4a4c52', lw=4)
    a.shape(pts_d([(548, 172), (732, 172), (732, 187), (569, 187)]), '#3c3e44', lw=2.5, rough=0.3)   # top reveal
    a.shape(pts_d([(548, 172), (569, 187), (569, 262), (548, 262)]), '#5a5c62', lw=2.5, rough=0.3)   # left reveal
    a.shape(pts_d([(569, 187), (732, 187), (732, 262), (569, 262)]), '#7a5a38', lw=3, rough=0.3)     # wooden frame
    glass = [(581, 197), (721, 197), (721, 252), (581, 252)]
    a.shape(pts_d(glass), '#16223a', lw=2.5, rough=0)
    # through the glass: night sky, the corrugated steel well liner, soil with pebbles and weeds
    a.shape(pts_d([(581, 214), (721, 214), (721, 252), (581, 252)]), '#2c3440', stroke=False, rough=0)
    v.tool('draw_path', d=' '.join(f'M{x} 214 V236' for x in range(584, 721, 5)), fill='none', stroke='#3c4654', strokeWidth=1.6)
    a.shape(smooth_d([(581, 252), (581, 236), (610, 233), (650, 237), (690, 232), (721, 235), (721, 252)], tension=0.4), '#3a2f24', stroke=False, rough=1)
    v.tool('draw_path', d=' '.join(f'M{x:.1f} {y:.1f} a{s:.1f} {s * 0.7:.1f} 0 1 0 {2 * s:.1f} 0 a{s:.1f} {s * 0.7:.1f} 0 1 0 {-2 * s:.1f} 0 Z'
                                  for x, y, s in [(rng.uniform(584, 716), rng.uniform(239, 250), rng.uniform(1.2, 2.6)) for _ in range(16)]), fill='#5a5048', stroke='none')
    weeds = ' '.join(f'M{x:.1f} 238 q{rng.uniform(-4, 4):.1f} {-rng.uniform(6, 10):.1f} {rng.uniform(-6, 6):.1f} {-rng.uniform(10, 18):.1f}' for x in [rng.uniform(590, 712) for _ in range(7)])
    v.tool('draw_path', d=weeds, fill='none', stroke='#2e3a26', strokeWidth=2)
    for (x, y) in ((596, 203), (688, 201), (652, 208), (707, 206)):
        a.shape(f'M{x - 1.6} {y} a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z', '#e8ecf5', stroke=False, rough=0)  # stars
    a.stroke('M651 187 v75 M569 224 h163', color='#7a5a38', lw=6, profile=None, rough=False)       # muntins
    a.stroke('M590 248 l22 -46 M600 250 l14 -30 M664 248 l20 -44', color='#c8d4ea', lw=1.6, profile=None, rough=False, opacity=35)  # reflections
    a.stroke('M732 187 q-14 4 -18 18 M732 196 q-8 2 -10 10 M720 187 l12 16', color='#b8bcc4', lw=1, profile=None, rough=False, opacity=45)  # cobweb
    # a sauropod chart taped to the blocks, curling a little at one corner
    PX, PY = -780, 120
    T_ = lambda d: re.sub(r'(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)', lambda m: f'{float(m.group(1)) + PX:g} {float(m.group(2)) + PY:g}', d)
    a.shape(pts_d([(1250 + PX, 230 + PY), (1390 + PX, 238 + PY), (1384 + PX, 400 + PY), (1252 + PX, 396 + PY), (1246 + PX, 384 + PY)]), '#e9dfc4', lw=3)
    a.shape(pts_d([(1252 + PX, 396 + PY), (1246 + PX, 384 + PY), (1258 + PX, 388 + PY)]), '#c9bfa4', lw=2, rough=0)
    sauropod = 'M1262 352 Q1280 330 1300 330 Q1318 300 1340 290 Q1352 282 1366 284 Q1372 288 1362 292 Q1350 296 1346 306 Q1342 326 1336 340 L1336 362 L1328 362 L1326 344 L1300 346 L1298 362 L1290 362 L1288 346 Q1272 352 1252 356 Z'
    a.shape(T_(sauropod), '#4a5a3a', lw=2.5, rough=0.3)
    ribs_ = ' '.join(f'M{1300 + PX + k * 6} {334 + PY - k * 2} v{10 - k * 0.5:.1f}' for k in range(5))
    v.tool('draw_path', d=ribs_, fill='none', stroke='#c9d0b0', strokeWidth=1.6)
    a.stroke(f'M{1254 + PX} {364 + PY} H{1376 + PX}', color='#6b5a3a', lw=2.5, profile=None, rough=False)
    v.tool('draw_path', d=f'M{1262 + PX} {376 + PY} h70 M{1262 + PX} {384 + PY} h96 M{1262 + PX} {392 + PY} h50', fill='none', stroke='#8a7a5a', strokeWidth=2.4)
    v.tool('draw_path', d=f'M{1262 + PX} {246 + PY} h110 M{1262 + PX} {258 + PY} h60', fill='none', stroke='#a04030', strokeWidth=6)
    for (x, y) in ((1252 + PX, 232 + PY), (1384 + PX, 240 + PY)):
        a.shape(f'M{x - 10} {y - 6} h20 v12 h-20 Z', '#e6e1c6', stroke=False, rough=0, opacity=80)
    # ---- ceiling: dark subfloor between exposed joists running front to back, a duct and pipes
    a.shape(pts_d([CEIL(0, 0), CEIL(1, 0), CEIL(1, 1), CEIL(0, 1)]), '#3a2c20', lw=0, rough=0)
    joists = []
    for i in range(13):
        u = i / 12
        joists.append(pts_d([CEIL(u - 0.018, 0), CEIL(u + 0.018, 0), CEIL(u + 0.018, 1), CEIL(u - 0.018, 1)]))
    v.tool('draw_path', d=' '.join(joists), fill='#7a5a3a', stroke=INK, strokeWidth=3)
    grain = ' '.join(pts_d([CEIL(i / 12 - 0.008, t), CEIL(i / 12 + 0.006, t + 0.25)], closed=False) for i in range(13) for t in (0.1, 0.45, 0.7))
    v.tool('draw_path', d=grain, fill='none', stroke='#5a4028', strokeWidth=2)
    # sheet-metal duct hanging under the joists, in real 3D, running from the left wall and turning
    # up into the ceiling before it reaches the stair opening
    DX0, DX1, DY0, DZ0, DZ1 = -5.5, 3.75, 2.78, 8.3, 8.75
    box3d(a, DX0, DX1, DY0, YC_ROOM, DZ0, DZ1, '#9aa0a8', '#8a9098', '#7c828a', lw=3.5, rough=0.3)
    seam_x = [DX0 + 0.9 + k * 1.15 for k in range(8) if DX0 + 0.9 + k * 1.15 < DX1 - 0.2]
    seams = ' '.join(pts_d([P(x, YC_ROOM, DZ0), P(x, DY0, DZ0), P(x, DY0, DZ1)], closed=False) for x in seam_x)
    v.tool('draw_path', d=seams, fill='none', stroke='#5e636b', strokeWidth=2.4)
    rivets = ' '.join(f'M{P(x + 0.06, y, DZ0)[0]:.1f} {P(x + 0.06, y, DZ0)[1]:.1f} m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 Z' for x in seam_x for y in (2.86, 2.98))
    v.tool('draw_path', d=rivets, fill='#5e636b', stroke='none')
    hl = [P(DX0, YC_ROOM - 0.08, DZ0), P(DX1, YC_ROOM - 0.08, DZ0)]
    a.stroke(pts_d(hl, closed=False), color='#d6dae0', lw=2.5, opacity=55, profile=None, rough=False)
    for x in seam_x[1::3]:  # hanger straps wrapping the duct
        a.shape(pts_d([P(x + 0.3, YC_ROOM, DZ0), P(x + 0.42, YC_ROOM, DZ0), P(x + 0.42, DY0, DZ0), P(x + 0.3, DY0, DZ0)]), '#6e737b', lw=1.6, rough=0)
    # a return grille on the duct's underside
    gx0 = -1.6
    a.shape(pts_d([P(gx0, DY0, DZ0 + 0.1), P(gx0 + 0.8, DY0, DZ0 + 0.1), P(gx0 + 0.8, DY0, DZ1 - 0.1), P(gx0, DY0, DZ1 - 0.1)]), '#c8ccd2', lw=2, rough=0)
    v.tool('draw_path', d=' '.join(pts_d([P(gx0 + k * 0.1, DY0, DZ0 + 0.14), P(gx0 + k * 0.1, DY0, DZ1 - 0.14)], closed=False) for k in range(1, 8)), fill='none', stroke='#6e737b', strokeWidth=1.6)
    # copper water line and a galvanised gas line, with hangers, elbowing up before the stairs
    for (py, pz, col, rad) in ((2.92, 9.0, '#b06a3a', 0.045), (2.86, 9.3, '#a8adb4', 0.036)):
        s0, s1 = P(-5.7, py, pz), P(3.85, py, pz)
        wpx = 2 * F * rad / pz
        line = f'M{s0[0]:.1f} {s0[1]:.1f} L{s1[0]:.1f} {s1[1]:.1f} L{P(3.95, YC_ROOM, pz)[0]:.1f} {P(3.95, YC_ROOM, pz)[1]:.1f}'
        a.stroke(line, color=INK, lw=wpx + 4, profile=None, rough=False)
        a.stroke(line, color=col, lw=wpx, profile=None, rough=False)
        a.stroke(f'M{s0[0]:.1f} {s0[1] - wpx * 0.25:.1f} L{s1[0]:.1f} {s1[1] - wpx * 0.25:.1f}', color='#f0d8c0' if col == '#b06a3a' else '#e6eaee', lw=1.6, opacity=55, profile=None, rough=False)
        for x in (-4.2, -1.9, 0.6, 2.9):
            b0, b1 = P(x, py, pz), P(x, YC_ROOM, pz)
            a.stroke(f'M{b0[0]:.1f} {b0[1]:.1f} L{b1[0]:.1f} {b1[1]:.1f}', color='#3a3a3a', lw=2.4, profile=None, rough=False)
            a.shape(f'M{b0[0] - wpx * 0.7:.1f} {b0[1] - wpx * 0.6:.1f} h{wpx * 1.4:.1f} v{wpx * 1.2:.1f} h{-wpx * 1.4:.1f} Z', '#4a4a4a', lw=1.4, rough=0)
    # hanging bulb (off): junction box on the joist, braided cord, ceramic socket with ridges,
    # glass bulb with its filament and a highlight, and a short bead chain with a pull
    a.shape('M948 112 h24 v10 h-24 Z', '#5a5a5a', lw=2.2, rough=0)
    a.stroke('M960 122 C962 150 958 180 960 204', color=INK, lw=3.2, profile=None, rough=False)
    a.stroke('M960 122 C962 150 958 180 960 204', color='#4a3a2a', lw=1.4, profile=None, rough=False)
    a.shape(smooth_d([(951, 204), (969, 204), (971, 222), (949, 222)], tension=0.1), '#e8e0cc', lw=2.4, rough=0)
    v.tool('draw_path', d='M950 210 h20 M950 215 h20', fill='none', stroke='#a89e88', strokeWidth=1.4)
    a.shape('M952 222 h16 v6 h-16 Z', '#b8a878', lw=1.8, rough=0)
    a.shape(smooth_d([(952, 228), (968, 228), (976, 242), (974, 256), (960, 264), (946, 256), (944, 242)], tension=0.45), '#d9d2b0', lw=2.6, rough=0, opacity=88)
    a.stroke('M955 230 L957 246 Q960 250 963 246 L965 230', color='#8a7a5a', lw=1.4, profile=None, rough=False)
    a.stroke('M950 240 Q951 250 956 256', color='#ffffff', lw=2.2, opacity=70, profile=None, rough=False)
    beads = ' '.join(f'M{970 + k * 0.2:.1f} {216 + k * 4.2:.1f} m-1.3 0 a1.3 1.3 0 1 0 2.6 0 a1.3 1.3 0 1 0 -2.6 0 Z' for k in range(9))
    v.tool('draw_path', d=beads, fill='#9a9a9a', stroke='none')
    a.shape('M969 254 l2.4 7 h-4.8 Z', '#d9b45a', lw=1.2, rough=0)
    # ---- floor: concrete with stains, a drain, then a worn rug in perspective
    a.shape(pts_d([FLOOR(0, 0), FLOOR(1, 0), FLOOR(1, 1), FLOOR(0, 1)]), '#5c5d60', lw=0, rough=0)
    for i in range(14):
        u, vv = rng.uniform(0.05, 0.95), rng.uniform(0.05, 0.9)
        c = FLOOR(u, vv); s = 20 + vv * 90
        a.shape(smooth_d([(c[0] - s, c[1]), (c[0] - s * 0.3, c[1] - s * 0.25), (c[0] + s * 0.5, c[1] - s * 0.2), (c[0] + s, c[1]), (c[0], c[1] + s * 0.2)], tension=0.4), '#4f5053', stroke=False, rough=2, opacity=60)
    seam = ' '.join(pts_d([FLOOR(u, 0), FLOOR(u, 1)], closed=False) for u in (0.33, 0.66))
    v.tool('draw_path', d=seam, fill='none', stroke='#45464a', strokeWidth=2)
    rug = [FLOOR(0.12, 0.25), FLOOR(0.88, 0.25), FLOOR(0.95, 1.05), FLOOR(0.05, 1.05)]
    a.shape(pts_d(rug), '#7a3a30', lw=4)
    inner = [FLOOR(0.18, 0.33), FLOOR(0.82, 0.33), FLOOR(0.88, 1.05), FLOOR(0.12, 1.05)]
    a.shape(pts_d(inner), '#8e4a3a', lw=2.5)
    pattern = ' '.join(pts_d([FLOOR(u, 0.42), FLOOR(u + 0.03, 0.47), FLOOR(u, 0.52), FLOOR(u - 0.03, 0.47)]) for u in [0.25 + i * 0.07 for i in range(8)])
    v.tool('draw_path', d=pattern, fill='#c9a45a', stroke=INK, strokeWidth=1.6)
    fringe = ' '.join(pts_d([FLOOR(u, 0.25), FLOOR(u, 0.235)], closed=False) for u in [0.12 + i * 0.019 for i in range(41)])
    v.tool('draw_path', d=fringe, fill='none', stroke='#d8c8a0', strokeWidth=2)
    a.hatch(pts_d(rug), '#5a2a22', angle=0, spacing=6, width=1.6, opacity=40)
    # ---- left wall: staggered cinder blocks, then a real 3D wooden shelving unit standing against it
    a.shape(pts_d([LEFT(0, 0), LEFT(1, 0), LEFT(1, 1), LEFT(0, 1)]), '#64666d', lw=0, rough=0)
    v.tool('draw_path', d=wall_joints(LEFT), fill='none', stroke='#55575d', strokeWidth=1.6)
    shelf_unit(a, v)
    # ---- right wall: blocks, the water heater in the back corner (clear of the stairs), the stairs
    a.shape(pts_d([RIGHT(0, 0), RIGHT(1, 0), RIGHT(1, 1), RIGHT(0, 1)]), '#64666d', lw=0, rough=0)
    v.tool('draw_path', d=wall_joints(RIGHT, flip=True), fill='none', stroke='#55575d', strokeWidth=1.6)
    hx, hy0, hy1, hw = 1350, 520, 770, 44
    a.shape(smooth_d([(hx - 50, 774), (hx + 50, 774), (hx + 46, 780), (hx - 46, 780)], tension=0.3), '#2e3034', stroke=False, rough=1, opacity=70)
    a.shape(smooth_d([(hx - hw, hy1), (hx - hw, hy0 + 14), (hx - hw * 0.6, hy0), (hx + hw * 0.6, hy0), (hx + hw, hy0 + 14), (hx + hw, hy1)], tension=0.25), '#c9ccd0', lw=3.5)
    a.shape(smooth_d([(hx + hw * 0.3, hy1), (hx + hw * 0.3, hy0 + 10), (hx + hw, hy0 + 14), (hx + hw, hy1)], tension=0.25), '#9fa3a8', stroke=False, rough=1)
    a.hatch(smooth_d([(hx + hw * 0.3, hy1), (hx + hw * 0.3, hy0 + 10), (hx + hw, hy0 + 14), (hx + hw, hy1)], tension=0.25), '#7a7e84', angle=80, spacing=5, width=1.4, opacity=50)
    a.stroke(f'M{hx - hw * 0.7} {hy0 + 6} V{hy1 - 4}', color='#eef0f2', lw=3, opacity=60, profile=None, rough=False)
    a.stroke(f'M{hx - hw} {hy0 + 40} H{hx + hw} M{hx - hw} {hy1 - 30} H{hx + hw}', color='#8a8e94', lw=2.4, profile=None, rough=False)
    a.shape(f'M{hx - 14} {hy0 + 90} h28 v20 h-28 Z', '#e6dfc8', lw=2.5, rough=0)
    v.tool('draw_path', d=f'M{hx - 10} {hy0 + 96} h16 M{hx - 10} {hy0 + 102} h20', fill='none', stroke='#8a7a5a', strokeWidth=1.4)
    a.shape(f'M{hx - 20} {hy1 - 22} h18 v12 h-18 Z', '#3a3a3a', lw=2, rough=0)   # gas valve box
    a.shape(f'M{hx - 15} {hy1 - 19} h8 v6 h-8 Z', '#c94f3d', stroke=False, rough=0)
    for px_ in (hx - 14, hx + 14):  # pipes up the back wall to the ceiling, with an elbow and a valve
        a.stroke(f'M{px_} {hy0} V172 Q{px_} 162 {px_ + 8} 162', color=INK, lw=12, profile=None, rough=False)
        a.stroke(f'M{px_} {hy0} V172 Q{px_} 162 {px_ + 8} 162', color='#b06a3a', lw=7, profile=None, rough=False)
        a.stroke(f'M{px_ - 2} {hy0} V176', color='#e8b890', lw=1.6, opacity=60, profile=None, rough=False)
        a.shape(f'M{px_ - 7} {hy0 - 40} h14 v10 h-14 Z', '#c9a040', lw=1.8, rough=0)
    a.shape(f'M{hx + 6} {hy0 - 52} h16 v5 h-16 Z', '#2a6ab0', lw=1.6, rough=0)
    stairs(a, v)
    v.tool('export', path=os.path.join(out, 'bRoom.svg'))
    v.close()


# ---- real 3D for the stairs: camera at the origin looking down +z, back wall at z = 10
F = 1000.0
def P(x, y, z):
    return (960 + F * x / z, 470 - F * y / z)


def box_faces(x0, x1, y0, y1, z0, z1):
    """Visible faces of an axis-aligned box seen from the origin (camera left of and level with it)."""
    faces = []
    faces.append(('front', [P(x0, y1, z0), P(x1, y1, z0), P(x1, y0, z0), P(x0, y0, z0)]))     # faces the camera
    faces.append(('side', [P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1), P(x0, y0, z0)]))      # left end, seen because camera x < x0
    if y1 < 0:
        faces.append(('top', [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]))   # below eye level: see the top
    elif y0 > 0:
        faces.append(('under', [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)]))  # above eye level: see underneath
    return faces


YC_ROOM = 3.1    # ceiling height (the floor is at -3.0); matches the wall and ceiling homographies


def shade(hexc, k):
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(c * k))) for c in (r, g, b))


def faces3d(x0, x1, y0, y1, z0, z1):
    """The faces of an axis-aligned box that the camera (at the origin) can see, for any position."""
    f = [('front', [P(x0, y1, z0), P(x1, y1, z0), P(x1, y0, z0), P(x0, y0, z0)])]
    if x0 > 0:
        f.append(('side', [P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1), P(x0, y0, z0)]))
    if x1 < 0:
        f.append(('side', [P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1), P(x1, y0, z0)]))
    if y1 < 0:
        f.append(('top', [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]))
    elif y0 > 0:
        f.append(('top', [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)]))
    return f


def box3d(a, x0, x1, y0, y1, z0, z1, front, side, top, lw=2.4, rough=0.4):
    for kind, q in faces3d(x0, x1, y0, y1, z0, z1):
        a.shape(pts_d(q), {'front': front, 'side': side, 'top': top}[kind], lw=lw, rough=rough)


def wall_joints(m, flip=False):
    """Mortar joints for a side wall in perspective: 18 courses, staggered vertical joints."""
    d = []
    for i in range(18):
        t0, t1 = i / 18, (i + 1) / 18
        d.append(pts_d([m(0, t0), m(1, t0)], closed=False))
        off = 0.5 if i % 2 else 0.0
        for k in range(9):
            u = (k + off) / 8.5
            if 0 < u < 1:
                d.append(pts_d([m(u, t0), m(u, t1)], closed=False))
    return ' '.join(d)


def cylinder(a, v, xc, zc, r, y0, y1, body, lid, band=None, glass=False):
    """An upright can or jar: body with elliptical ends, a lid, a highlight and a shadow side."""
    cx, cyb = P(xc, y0, zc)
    _, cyt = P(xc, y1, zc)
    R = F * r / zc
    eb, et = max(1.2, R * abs(y0) / zc), max(1.2, R * abs(y1) / zc)
    outline = (f'M{cx - R:.1f} {cyt:.1f} L{cx - R:.1f} {cyb:.1f} A{R:.1f} {eb:.1f} 0 0 0 {cx + R:.1f} {cyb:.1f} '
               f'L{cx + R:.1f} {cyt:.1f} A{R:.1f} {et:.1f} 0 0 0 {cx - R:.1f} {cyt:.1f} Z')
    a.shape(outline, body, lw=2, rough=0, opacity=75 if glass else None)
    if band:
        hb = (cyb - cyt) * 0.42
        a.shape(f'M{cx - R:.1f} {cyt + hb * 0.6:.1f} L{cx - R:.1f} {cyt + hb * 1.6:.1f} A{R:.1f} {eb:.1f} 0 0 0 {cx + R:.1f} {cyt + hb * 1.6:.1f} '
                f'L{cx + R:.1f} {cyt + hb * 0.6:.1f} A{R:.1f} {et:.1f} 0 0 1 {cx - R:.1f} {cyt + hb * 0.6:.1f} Z', band, lw=1.4, rough=0)
    a.shape(f'M{cx + R * 0.35:.1f} {cyt:.1f} L{cx + R * 0.35:.1f} {cyb + eb * 0.9:.1f} A{R:.1f} {eb:.1f} 0 0 0 {cx + R:.1f} {cyb:.1f} L{cx + R:.1f} {cyt:.1f} Z',
            shade(body, 0.7), stroke=False, rough=0, opacity=60)
    a.stroke(f'M{cx - R * 0.55:.1f} {cyt + 3:.1f} V{cyb - 2:.1f}', color='#ffffff', lw=max(1.2, R * 0.18), opacity=45, profile=None, rough=False)
    if y1 < 0:
        a.shape(f'M{cx - R:.1f} {cyt:.1f} a{R:.1f} {et:.1f} 0 1 0 {2 * R:.1f} 0 a{R:.1f} {et:.1f} 0 1 0 {-2 * R:.1f} 0 Z', lid, lw=1.8, rough=0)
        a.stroke(f'M{cx - R * 0.7:.1f} {cyt:.1f} a{R * 0.7:.1f} {et * 0.7:.1f} 0 1 0 {1.4 * R:.1f} 0', color=shade(lid, 0.7), lw=1.2, profile=None, rough=False)


def shelf_unit(a, v):
    """A wooden shelving unit standing against the left wall, built in 3D, full of basement stuff.
    Levels are drawn outward from eye level's far side (top level first, then the bottom, ...) so a
    nearer board always covers what is behind it; inside a level, far items come first."""
    sr = random.Random(12)
    XW, XF = -5.4, -4.62
    ZS = [6.7, 7.95, 9.2]
    LV = [-2.85, -1.55, -0.25, 1.05, 2.3]
    T = 0.08
    wood, wood_side, wood_top = '#8a6a44', '#6e5232', '#a98252'
    order = sorted(range(len(LV)), key=lambda i: -abs(LV[i] + 0.5))
    for i in order:
        y = LV[i]
        box3d(a, XW, XF, y - T, y, ZS[0] - 0.05, ZS[-1] + 0.12, wood, wood_side, wood_top, lw=2.4, rough=0.3)
        g0 = P(XF, y - T * 0.5, ZS[0]); g1 = P(XF, y - T * 0.5, ZS[-1])
        a.stroke(f'M{g0[0]:.1f} {g0[1]:.1f} L{g1[0]:.1f} {g1[1]:.1f}', color='#5a4028', lw=1.4, profile=None, rough=False)
        gap = (LV[i + 1] - y - T) if i + 1 < len(LV) else (2.95 - y)
        items = []
        for s0, s1 in zip(ZS[:-1], ZS[1:]):
            z = s0 + 0.12
            while z < s1 - 0.2:
                kind = sr.choice(['box', 'box', 'games', 'books', 'can', 'jar', 'books'])
                L = {'box': sr.uniform(0.35, 0.5), 'games': sr.uniform(0.4, 0.55), 'books': sr.uniform(0.3, 0.45),
                     'can': 0.24, 'jar': 0.2}[kind]
                if z + L > s1 - 0.08:
                    break
                items.append((z, kind, L, sr.random()))
                z += L + sr.uniform(0.03, 0.1)
        for z, kind, L, rr in sorted(items, reverse=True):
            shelf_item(a, v, sr, kind, XW + 0.05, z, L, y, gap, rr)
    # front posts with screws at each board, standing in front of everything
    for z in ZS:
        z0 = z - 0.05 if z == ZS[0] else z - 0.045
        box3d(a, XF - 0.09, XF + 0.01, -3.0, 2.45, z0, z0 + 0.09, '#7a5a38', '#6a4c2e', wood_top, lw=2.4, rough=0.3)
        for y in LV:
            c = P(XF + 0.01, y - T * 0.5, z0 + 0.045)
            a.shape(f'M{c[0] - 1.6:.1f} {c[1]:.1f} a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z', '#c9c2a8', stroke=False, rough=0)
    a.hatch(pts_d([P(XF + 0.01, 2.45, ZS[0] - 0.05), P(XF + 0.01, 2.45, ZS[0] + 0.04), P(XF + 0.01, -3.0, ZS[0] + 0.04), P(XF + 0.01, -3.0, ZS[0] - 0.05)]),
            '#4a3420', angle=80, spacing=5, width=1.4, opacity=40)


def shelf_item(a, v, sr, kind, xw, z, L, y, gap, rr):
    if kind == 'box':  # cardboard box: flaps and tape on top, a label and marker writing on its side
        col = sr.choice(['#b08a5a', '#c49a62', '#a87e50'])
        h = min(gap - 0.12, sr.uniform(0.55, 0.95))
        x1 = xw + sr.uniform(0.55, 0.68)
        box3d(a, xw, x1, y, y + h, z, z + L, shade(col, 0.92), col, shade(col, 1.12), lw=2.2, rough=0.5)
        S = lambda s, t: P(x1, y + t * h, z + s * L)
        a.shape(pts_d([S(0.15, 0.48), S(0.62, 0.48), S(0.62, 0.78), S(0.15, 0.78)]), '#efe6cc', lw=1.4, rough=0.3)
        m0, m1 = S(0.2, 0.62), S(0.55, 0.64)
        a.stroke(f'M{m0[0]:.1f} {m0[1]:.1f} L{m1[0]:.1f} {m1[1]:.1f}', color='#2a2a6a', lw=2, profile=None)
        t0, t1, t2, t3 = S(0.42, 1.0), S(0.52, 1.0), S(0.52, 0.8), S(0.42, 0.8)
        a.shape(pts_d([t0, t1, t2, t3]), '#d8c08a', stroke=False, rough=0, opacity=80)
        if y + h < 0:
            xm = (xw + x1) / 2
            f0, f1 = P(xm, y + h, z), P(xm, y + h, z + L)
            a.stroke(f'M{f0[0]:.1f} {f0[1]:.1f} L{f1[0]:.1f} {f1[1]:.1f}', color=shade(col, 0.6), lw=1.6, profile=None, rough=False)
            a.shape(pts_d([P(xm - 0.05, y + h, z), P(xm + 0.05, y + h, z), P(xm + 0.05, y + h, z + L), P(xm - 0.05, y + h, z + L)]), '#d8c08a', stroke=False, rough=0, opacity=80)
    elif kind == 'games':  # a stack of board-game boxes lying flat, each a little offset
        hh = y
        for k in range(sr.randint(2, 4)):
            col = sr.choice(['#3a5a9a', '#9a3a3a', '#2a7a4a', '#d0a040', '#5a3a7a', '#c96a2a'])
            th = sr.uniform(0.13, 0.2)
            if hh + th > y + gap - 0.1:
                break
            dz = sr.uniform(-0.04, 0.04)
            x1 = xw + sr.uniform(0.5, 0.66)
            box3d(a, xw, x1, hh, hh + th, z + dz, z + L + dz, shade(col, 0.85), col, shade(col, 1.15), lw=2, rough=0.3)
            S = lambda s, t: P(x1, hh + t * th, z + dz + s * L)
            l0, l1 = S(0.0, 0.3), S(1.0, 0.3)
            a.stroke(f'M{l0[0]:.1f} {l0[1]:.1f} L{l1[0]:.1f} {l1[1]:.1f}', color=shade(col, 0.6), lw=1.4, profile=None, rough=False)
            a.shape(pts_d([S(0.08, 0.45), S(0.45, 0.45), S(0.45, 0.85), S(0.08, 0.85)]), '#f2ead6', stroke=False, rough=0, opacity=70)
            b0, b1 = S(0.55, 0.65), S(0.9, 0.65)
            a.stroke(f'M{b0[0]:.1f} {b0[1]:.1f} L{b1[0]:.1f} {b1[1]:.1f}', color='#f2ead6', lw=1.6, profile=None, rough=False, opacity=80)
            hh += th
    elif kind == 'books':  # a row of books, spines out, uneven heights, one leaning
        zz = z
        while zz < z + L - 0.05:
            col = sr.choice(['#6a2a2a', '#2a4a6a', '#3a5a3a', '#7a6a3a', '#4a3a5a', '#8a4a2a', '#c9b48a'])
            th = sr.uniform(0.06, 0.12)
            h = min(gap - 0.1, sr.uniform(0.55, 0.9))
            x1 = xw + sr.uniform(0.42, 0.55)
            box3d(a, xw, x1, y, y + h, zz, zz + th, shade(col, 0.85), col, shade(col, 1.15), lw=1.6, rough=0.2)
            for tt in (0.12, 0.86):
                c0, c1 = P(x1, y + tt * h, zz), P(x1, y + tt * h, zz + th)
                a.stroke(f'M{c0[0]:.1f} {c0[1]:.1f} L{c1[0]:.1f} {c1[1]:.1f}', color='#e8d8a8', lw=1.4, profile=None, rough=False, opacity=80)
            zz += th + 0.005
    elif kind == 'can':  # paint can: label band, a drip down the side
        col = sr.choice(['#c8ccd2', '#b8bcc2'])
        h = min(gap - 0.12, 0.42)
        cylinder(a, v, xw + 0.3, z + 0.12, 0.12, y, y + h, col, '#9aa0a8', band=sr.choice(['#3a6ab0', '#c94f3d', '#e8c84a']))
        c = P(xw + 0.3 - 0.06, y + h, z + 0.12 - 0.11)
        a.shape(f'M{c[0]:.1f} {c[1]:.1f} q2 10 0 16 q-3 3 -4 -2 q0 -8 1 -14 Z', '#e0e4ea', lw=1.2, rough=0)
    else:  # glass jar of screws and nails
        h = min(gap - 0.12, 0.36)
        cylinder(a, v, xw + 0.3, z + 0.1, 0.1, y, y + h, '#9fb4ac', '#7a6a4a', glass=True)
        cx, cy = P(xw + 0.3, y + h * 0.3, z + 0.1)
        R = F * 0.1 / (z + 0.1)
        dots = ' '.join(f'M{cx + sr.uniform(-R * 0.7, R * 0.7):.1f} {cy + sr.uniform(-R * 0.8, R * 0.8):.1f} l{sr.uniform(-3, 3):.1f} {sr.uniform(-2, 2):.1f}' for _ in range(14))
        v.tool('draw_path', d=dots, fill='none', stroke='#4a4a4a', strokeWidth=1.6)


def stairs(a, v):
    """Open-riser wooden stairs against the right wall, climbing from the front toward the back
    up to an opening in the ceiling. Faces are drawn back to front so nearer steps cover farther ones."""
    XL, XR = 4.25, 5.4          # open side and wall side
    YF, YC = -3.0, 3.1          # floor and ceiling
    N, RUN, Z0 = 12, 0.3, 6.0
    RISE = (YC - YF) / N
    # dark floor shadow under the stairs
    a.shape(pts_d([P(XL, YF, Z0), P(XR, YF, Z0), P(XR, YF, Z0 + N * RUN), P(XL, YF, Z0 + N * RUN)]), '#2e3034', stroke=False, rough=2, opacity=60)
    # warm light from the opening in the ceiling at the top, and the shadow the stairs cast on the wall
    # the stairwell opening in the ceiling over the top steps: the lit upstairs wall seen through it,
    # the far header joist (facing us) and the cut edge of the subfloor
    OX0, OZ0, OZ1, HD = XL - 0.15, 8.0, 9.75, 0.35
    a.shape(pts_d([P(OX0, YC, OZ0), P(XR, YC, OZ0), P(XR, YC, OZ1), P(OX0, YC, OZ1)]), '#f0c878', lw=3, rough=0.3)
    a.shape(pts_d([P(OX0, YC, OZ0), P(XR, YC, OZ0), P(XR, YC, OZ0 + 0.5), P(OX0, YC, OZ0 + 0.5)]), '#ffe2a8', stroke=False, rough=0, opacity=80)
    a.shape(pts_d([P(OX0, YC + HD, OZ1), P(XR, YC + HD, OZ1), P(XR, YC, OZ1), P(OX0, YC, OZ1)]), '#9a7448', lw=2.6, rough=0.3)
    a.hatch(pts_d([P(OX0, YC + HD, OZ1), P(XR, YC + HD, OZ1), P(XR, YC, OZ1), P(OX0, YC, OZ1)]), '#6e5232', angle=0, spacing=5, width=1.4, opacity=45)
    e0, e1 = P(OX0, YC, OZ0), P(XR, YC, OZ0)
    a.stroke(f'M{e0[0]:.1f} {e0[1]:.1f} L{e1[0]:.1f} {e1[1]:.1f}', color='#5a4028', lw=6, profile=None, rough=False)
    e2 = P(OX0, YC, OZ1)
    a.stroke(f'M{e0[0]:.1f} {e0[1]:.1f} L{e2[0]:.1f} {e2[1]:.1f}', color='#5a4028', lw=5, profile=None, rough=False)
    shadow = [P(XR, YF + 0.0, Z0 + 0.4), P(XR, YC - 0.4, Z0 + N * RUN), P(XR, YC - 0.4 - 1.6, Z0 + N * RUN), P(XR, YF, Z0 + 2.6)]
    a.shape(pts_d(shadow), '#3a3c42', stroke=False, rough=2, opacity=70)
    # wall-side stringer: a dark board fixed to the wall along the line of the steps
    wall_str = [P(XR - 0.01, YF + RISE, Z0), P(XR - 0.01, YC, Z0 + N * RUN), P(XR - 0.01, YC - 0.45, Z0 + N * RUN), P(XR - 0.01, YF + RISE - 0.45, Z0)]
    a.shape(pts_d(wall_str), '#5a4028', lw=3)
    cols = {'front': '#8a6640', 'side': '#7a5836', 'top': '#a98252', 'under': '#5e4429'}
    for i in range(N, 0, -1):  # back (top) step first
        z0 = Z0 + (i - 1) * RUN
        y1 = YF + i * RISE
        for kind, quad in box_faces(XL, XR - 0.04, y1 - 0.09, y1, z0, z0 + RUN + 0.04):
            a.shape(pts_d(quad), cols[kind], lw=2.6, rough=0.4)
        if y1 < 0:  # wear on the treads you can see the top of
            c0, c1 = P(XL + 0.3, y1, z0 + 0.12), P(XR - 0.3, y1, z0 + 0.12)
            a.stroke(f'M{c0[0]:.1f} {c0[1]:.1f} L{c1[0]:.1f} {c1[1]:.1f}', color='#c49a62', lw=2.5, profile=None, rough=False)
    # open-side stringer: a thick diagonal board with a face toward the camera
    top_line = [(Z0 - 0.05, YF + RISE * 0.6), (Z0 + N * RUN, YC - 0.05)]
    def on_line(t, drop):
        z = top_line[0][0] + (top_line[1][0] - top_line[0][0]) * t
        y = top_line[0][1] + (top_line[1][1] - top_line[0][1]) * t - drop
        return z, y
    pts_top = [P(XL - 0.06, on_line(t, 0)[1], on_line(t, 0)[0]) for t in (0, 1)]
    pts_bot = [P(XL - 0.06, on_line(t, 0.55)[1], on_line(t, 0.55)[0]) for t in (1, 0)]
    a.shape(pts_d(pts_top + pts_bot), '#7a5836', lw=3.5)
    a.hatch(pts_d(pts_top + pts_bot), '#4a3420', angle=30, spacing=6, width=1.8, opacity=50)
    grain = [P(XL - 0.06, on_line(t, d)[1], on_line(t, d)[0]) for t, d in ((0.05, 0.2), (0.6, 0.2))]
    a.stroke(f'M{grain[0][0]:.1f} {grain[0][1]:.1f} L{grain[1][0]:.1f} {grain[1][1]:.1f}', color='#5a4028', lw=2.4, profile=None, rough=False)
    # the bottom of the stringer resting on the floor
    foot = [P(XL - 0.06, YF, Z0 - 0.3), P(XL - 0.06, YF + RISE * 0.6, Z0 - 0.05), P(XL - 0.06, YF + RISE * 0.6 - 0.55, Z0 - 0.05)]
    a.shape(pts_d(foot), '#6e5232', lw=3)
    # handrail on the open side: posts standing up from the stringer, a rail along their tops.
    # The rail climbs until it meets the ceiling at the stairwell opening; nothing pokes through it.
    def rail_y(t):
        return on_line(t, 0)[1] + 1.15
    t_end = (YC - 0.02 - rail_y(0)) / (rail_y(1) - rail_y(0))
    posts = []
    for t in [k / 6 for k in range(7)]:
        if t > t_end:
            break
        z, y = on_line(t, 0)
        posts.append((P(XL - 0.03, y, z), P(XL - 0.03, min(y + 1.15, YC - 0.02), z)))
    z_e, _ = on_line(t_end, 0)
    rail = [P(XL - 0.03, rail_y(0), on_line(0, 0)[0]), P(XL - 0.03, YC - 0.02, z_e)]
    for b, top in posts:
        a.stroke(f'M{b[0]:.1f} {b[1]:.1f} L{top[0]:.1f} {top[1]:.1f}', color=INK, lw=9, profile=None, rough=False)
        a.stroke(f'M{b[0]:.1f} {b[1]:.1f} L{top[0]:.1f} {top[1]:.1f}', color='#7a5836', lw=5, profile=None, rough=False)
    a.stroke(pts_d(rail, closed=False), color=INK, lw=13, profile=None, rough=False)
    a.stroke(pts_d(rail, closed=False), color='#8a6640', lw=8, profile=None, rough=False)
    a.stroke(pts_d([(x, y - 2) for x, y in rail], closed=False), color='#c49a62', lw=2.5, profile=None, rough=False)
    # a thicker newel post at the bottom, with a cap
    z0n, y0n = on_line(0, 0)
    for kind, q in faces3d(XL - 0.12, XL + 0.04, y0n - 0.3, y0n + 1.3, z0n - 0.08, z0n + 0.08):
        a.shape(pts_d(q), {'front': '#8a6640', 'side': '#7a5836', 'top': '#a98252'}[kind], lw=2.6, rough=0.3)
    for kind, q in faces3d(XL - 0.15, XL + 0.07, y0n + 1.3, y0n + 1.4, z0n - 0.11, z0n + 0.11):
        a.shape(pts_d(q), {'front': '#9a7448', 'side': '#8a6640', 'top': '#b48c5a'}[kind], lw=2.4, rough=0.3)


def tv(out):
    v = VC(); a = Artist(v, W, H, 4, seed=41)
    # low cabinet with doors, a console, controllers, a stack of game cases, cables, a plant
    cab = [(720, 610), (1200, 610), (1210, 760), (710, 760)]
    a.shape(pts_d(cab), '#6e5232', lw=4)
    a.shape(pts_d([(720, 610), (1200, 610), (1204, 626), (716, 626)]), '#8a6a44', lw=3)
    a.stroke('M960 630 V752 M740 640 h200 M980 640 h200', color='#4a3420', lw=3, profile=None)
    for x in (930, 990):
        a.shape(f'M{x - 4} 690 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z', '#d9b45a', lw=1.5, rough=0)
    a.hatch(pts_d(cab), '#4a3420', angle=0, spacing=6, width=1.6, opacity=40)
    a.shape(pts_d([(760, 588), (880, 588), (884, 610), (756, 610)]), '#2a2a30', lw=3)  # console
    a.shape('M770 597 h20 v4 h-20 Z', '#3ac0ff', stroke=False, rough=0)
    for i in range(5):
        a.shape(pts_d([(1080, 610 - i * 9), (1150, 610 - i * 9), (1150, 602 - i * 9), (1080, 602 - i * 9)]), ['#3a5a9a', '#9a3a3a', '#2a7a4a', '#d0a040', '#5a3a7a'][i], lw=2, rough=0.3)
    a.shape(smooth_d([(990, 610), (1004, 600), (1030, 600), (1044, 610), (1030, 616), (1004, 616)], tension=0.4), '#30303a', lw=2.5)
    a.stroke('M840 610 q-20 60 30 120 q40 30 140 20', color='#1a1a1a', lw=3, profile=None)
    a.shape('M1170 610 h30 l-4 -30 h-22 Z', '#b0603a', lw=2.5, rough=0.3)  # plant pot
    for k in range(6):
        ang = math.radians(-140 + k * 20)
        a.stroke(f'M1185 582 q{math.cos(ang) * 30:.1f} {math.sin(ang) * 40 - 20:.1f} {math.cos(ang) * 46:.1f} {math.sin(ang) * 50:.1f}', color='#3f7a4a', lw=6)
    # the TV: bezel and stand; the screen area is left empty for Remotion
    a.shape('M940 560 h40 l20 30 h-80 Z', '#202024', lw=3, rough=0.5)
    sx0, sy0, sx1, sy1 = 690, 300, 1230, 560
    bezel = f'M{sx0 - 16} {sy0 - 16} H{sx1 + 16} V{sy1 + 16} H{sx0 - 16} Z M{sx0} {sy0} V{sy1} H{sx1} V{sy0} Z'
    v.tool('draw_path', d=bezel, fill='#141418', stroke=INK, strokeWidth=4, effects=[a._rough(0.6, 6)])
    a.stroke(f'M{sx0 - 10} {sy0 - 10} H{sx1 + 10}', color='#5a5a66', lw=2.5, profile=None, rough=False)
    a.shape(f'M{sx1 - 30} {sy1 + 6} a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 Z', '#ff4a3a', stroke=False, rough=0)
    v.tool('export', path=os.path.join(out, 'bTV.svg'))
    v.close()


def couch(out):
    v = VC(); a = Artist(v, W, H, 5, seed=51)
    body = [(300, 1100), (310, 850), (360, 820), (960, 812), (1560, 820), (1610, 850), (1620, 1100)]
    a.shape(smooth_d(body, tension=0.2), '#4f5a3a')
    # corduroy ribs, seams, wear patches
    ribs = ' '.join(f'M{x} {830 + abs(x - 960) * 0.012:.1f} V1090' for x in range(330, 1600, 11))
    v.tool('draw_path', d=ribs, fill='none', stroke='#414b30', strokeWidth=3)
    a.stroke('M310 900 Q960 880 1610 900', color='#3a4228', lw=5, profile=None)
    v.tool('draw_path', d='M320 912 Q960 892 1600 912', fill='none', stroke='#6a7450', strokeWidth=2, dash=[10, 7])
    for (x, y, w_) in ((620, 950, 90), (1260, 980, 120)):
        a.shape(smooth_d([(x - w_, y), (x, y - w_ * 0.3), (x + w_, y), (x, y + w_ * 0.3)], tension=0.4), '#5c6844', stroke=False, rough=2, opacity=70)
    # arms rising at both ends
    for s in (-1, 1):
        x = 960 + s * 660
        arm = [(x - 60, 1100), (x - 64, 800), (x - 40, 776), (x + 40, 776), (x + 64, 800), (x + 60, 1100)]
        a.shape(smooth_d(arm, tension=0.25), '#566240')
        a.stroke(f'M{x - 50} 810 Q{x} 790 {x + 50} 810', color='#6a7450', lw=4)
    # knitted blanket over the right half of the back: zigzag rows
    blanket = [(1150, 808), (1420, 814), (1440, 980), (1400, 1100), (1180, 1100), (1140, 960)]
    a.shape(smooth_d(blanket, tension=0.3), '#c9a45a')
    zig = []
    for row in range(10):
        y = 830 + row * 26
        pts = [(1150 + i * 18, y + (8 if i % 2 else 0)) for i in range(17)]
        zig.append(pts_d(pts, closed=False))
    v.tool('draw_path', d=' '.join(zig[::2]), fill='none', stroke='#a04a3a', strokeWidth=4)
    v.tool('draw_path', d=' '.join(zig[1::2]), fill='none', stroke='#e9dcbc', strokeWidth=3)
    tassels = ' '.join(f'M{1180 + i * 22} 1090 l{rng.uniform(-3, 3):.1f} 14' for i in range(11))
    v.tool('draw_path', d=tassels, fill='none', stroke='#c9a45a', strokeWidth=4)
    a.hatch(smooth_d(body, tension=0.2), '#2c3420', angle=80, spacing=8, width=2, opacity=40)
    v.tool('export', path=os.path.join(out, 'bCouch.svg'))
    v.close()


def lamp_table(out):
    """The side table at the left end of the couch with the table lamp (the warm light source), a mug,
    a soda can and the TV remote. The table is below eye level and left of centre, so its top and
    its right side show, receding toward the vanishing point."""
    v = VC(); a = Artist(v, W, H, 5, seed=61)
    def back(p, k=0.075):
        return (p[0] + (VP[0] - p[0]) * k, p[1] + (VP[1] - p[1]) * k)
    FL, FR = (140, 796), (338, 796)
    BL, BR = back(FL), back(FR)
    # dark recess between the legs, under the drawer, above the lower shelf
    a.shape(pts_d([(170, 880), back((328, 880)), back((328, 990)), (170, 990)]), '#1a120c', stroke=False, rough=0)
    # back right leg (in shadow), then the lower shelf with comics and a game box on it
    bl = back((320, 880))
    a.shape(pts_d([bl, (bl[0] + 14, bl[1]), (bl[0] + 10, 1060), (bl[0] + 3, 1060)]), '#2e1f14', lw=3)
    sh = [(156, 990), (324, 990), back((324, 990)), back((156, 990))]
    a.shape(pts_d(sh), '#5a3c24', lw=3)
    a.shape(pts_d([(156, 990), (324, 990), (324, 1002), (156, 1002)]), '#3e2a1a', lw=2.5)
    for k, col in enumerate(['#c94f3d', '#3a6ab0', '#e8c84a']):
        y = 984 - k * 6
        a.shape(pts_d([(186 + k * 4, y), (262 + k * 4, y), (270 + k * 4, y - 8), (194 + k * 4, y - 8)]), col, lw=1.8, rough=0.3)
    a.shape(pts_d([(272, 988), (318, 988), (318, 960), (272, 960)]), '#2a7a4a', lw=2, rough=0.3)
    a.shape(pts_d([(278, 966), (300, 966), (300, 978), (278, 978)]), '#f2ead6', stroke=False, rough=0, opacity=70)
    # front legs, tapered, with a scuffed foot
    for x0, x1 in ((150, 170), (308, 328)):
        a.shape(pts_d([(x0, 880), (x1, 880), (x1 - 4, 1080), (x0 + 4, 1080)]), '#4a3220', lw=3.5)
        a.stroke(f'M{x0 + 5} 890 L{x0 + 7} 1070', color='#6e4a2c', lw=2.2, profile=None, rough=False)
    # apron with the drawer (front) and the side panel
    a.shape(pts_d([(150, 810), (328, 810), (328, 880), (150, 880)]), '#4a3220', lw=3.5)
    a.shape(pts_d([(328, 810), back((328, 810)), back((328, 880)), (328, 880)]), '#33231a', lw=3)
    a.hatch(pts_d([(328, 810), back((328, 810)), back((328, 880)), (328, 880)]), '#1e150e', angle=70, spacing=5, width=1.6, opacity=55)
    a.shape(pts_d([(166, 822), (312, 822), (312, 868), (166, 868)]), '#563a26', lw=2.5, rough=0.3)
    v.tool('draw_path', d='M172 834 q40 -4 70 2 q30 4 64 -1 M172 852 q50 3 90 -2 q26 -3 44 1', fill='none', stroke='#3e2a1a', strokeWidth=1.6)
    a.shape('M231 845 a8 6 0 1 0 16 0 a8 6 0 1 0 -16 0 Z', '#c9a040', lw=2, rough=0)
    a.stroke('M234 843 a4 3 0 0 1 6 -2', color='#f6e2a0', lw=1.6, profile=None, rough=False)
    # the top: edge band, side of the edge, then the surface with grain, worn corner and lamp light
    a.shape(pts_d([FL, FR, (FR[0], 810), (FL[0], 810)]), '#5e4028', lw=3.5)
    a.shape(pts_d([FR, BR, (BR[0], BR[1] + 13), (FR[0], 810)]), '#3e2a1a', lw=3)
    a.shape(pts_d([FL, FR, BR, BL]), '#7a5232', lw=3.5)
    v.tool('draw_path', d=' '.join(pts_d([lerp(FL, BL, t), lerp(FR, BR, t + 0.04)], closed=False) for t in (0.2, 0.45, 0.7, 0.9)), fill='none', stroke='#5e4028', strokeWidth=1.4)
    a.shape(smooth_d([(186, 788), (230, 778), (290, 782), (300, 792), (240, 795), (180, 795)], tension=0.4), '#a8784a', stroke=False, rough=0, opacity=55)
    a.stroke(f'M{FL[0] + 4} {FL[1] + 2} H{FR[0] - 6}', color='#a8784a', lw=2, opacity=60, profile=None, rough=False)
    # lamp: contact shadow, glazed ceramic base, brass neck and switch, harp, shade
    a.shape('M196 786 a34 6 0 1 0 68 0 a34 6 0 1 0 -68 0 Z', '#2e1f14', stroke=False, rough=0, opacity=70)
    base = [(208, 786), (252, 786), (262, 766), (258, 744), (244, 728), (216, 728), (202, 744), (198, 766)]
    a.shape(smooth_d(base, tension=0.4), '#3f7f86', lw=3.5, rough=0.3)
    a.shape(smooth_d([(240, 784), (252, 786), (262, 766), (258, 744), (244, 728), (236, 730), (248, 750), (250, 768)], tension=0.4), '#2c5c62', stroke=False, rough=0)
    a.stroke('M203 760 Q230 766 257 760', color='#d9b45a', lw=3, profile=None, rough=False)
    a.stroke('M210 748 Q207 762 212 776', color='#bfe4e6', lw=3, opacity=70, profile=None, rough=False)
    a.shape('M206 786 a24 4 0 1 0 48 0', '#2c5c62', lw=2.4, rough=0)
    a.shape('M224 728 h12 v-20 h-12 Z', '#b8903a', lw=2.4, rough=0)
    a.shape('M236 714 h7 v5 h-7 Z', '#8a6a2a', lw=1.6, rough=0)
    a.stroke('M230 708 L230 690', color='#8a6a2a', lw=3, profile=None, rough=False)
    shade_d = 'M196 640 L170 712 A60 9 0 0 0 290 712 L264 640 A34 6 0 0 0 196 640 Z'
    a.shape(shade_d, '#f0c27a', lw=4, rough=0.4)
    a.shape('M240 640 L262 712 A60 9 0 0 0 290 712 L264 640 Z', '#d9a45a', stroke=False, rough=0, opacity=70)
    v.tool('draw_path', d=' '.join(f'M{196 + k * 6.8:.1f} 641 L{170 + k * 12:.1f} {712 + 6 * math.sin(math.pi * k / 10):.1f}' for k in range(1, 10)), fill='none', stroke='#d49a4a', strokeWidth=1.6)
    a.stroke('M170 712 A60 9 0 0 0 290 712', color='#b8782e', lw=6, profile=None, rough=False)
    a.shape('M196 640 a34 6 0 1 0 68 0 a34 6 0 1 0 -68 0 Z', '#fff2c8', lw=3, rough=0)  # looking into the lit top
    a.shape('M222 641 a8 4 0 1 0 16 0 a8 4 0 1 0 -16 0 Z', '#ffffff', stroke=False, rough=0)
    # mug (behind, on the right), soda can, remote
    mx, my, mr = 330, 780, 12
    a.stroke(f'M{mx + mr - 1} {my - 18} q12 2 9 12 q-3 6 -9 5', color=INK, lw=7, profile=None, rough=False)
    a.stroke(f'M{mx + mr - 1} {my - 18} q12 2 9 12 q-3 6 -9 5', color='#c94f3d', lw=3.5, profile=None, rough=False)
    a.shape(f'M{mx - mr} {my - 24} V{my} A{mr} 3 0 0 0 {mx + mr} {my} V{my - 24} Z', '#c94f3d', lw=2.6, rough=0)
    a.shape(f'M{mx - mr} {my - 24} a{mr} 3.4 0 1 0 {2 * mr} 0 a{mr} 3.4 0 1 0 {-2 * mr} 0 Z', '#3a2414', lw=2, rough=0)
    a.stroke(f'M{mx - mr + 4} {my - 20} V{my - 4}', color='#f2a090', lw=2, opacity=70, profile=None, rough=False)
    cx_, cy_, cr = 176, 792, 9
    a.shape(f'M{cx_ - cr} {cy_ - 30} V{cy_} A{cr} 2.5 0 0 0 {cx_ + cr} {cy_} V{cy_ - 30} Z', '#3a7ab0', lw=2.4, rough=0)
    a.shape(f'M{cx_ - cr} {cy_ - 20} h{2 * cr} v9 h{-2 * cr} Z', '#e8ecf2', stroke=False, rough=0, opacity=85)
    a.shape(f'M{cx_ - cr} {cy_ - 30} a{cr} 2.6 0 1 0 {2 * cr} 0 a{cr} 2.6 0 1 0 {-2 * cr} 0 Z', '#c8ccd2', lw=1.8, rough=0)
    a.shape(f'M{cx_ - 2} {cy_ - 31} h5 v2 h-5 Z', '#8a8e94', stroke=False, rough=0)
    a.stroke(f'M{cx_ - cr + 3} {cy_ - 26} V{cy_ - 3}', color='#ffffff', lw=1.8, opacity=60, profile=None, rough=False)
    a.shape(pts_d([(262, 793), (318, 791), (322, 785), (266, 787)]), '#222226', lw=2, rough=0)
    v.tool('draw_path', d='M272 789 a1.6 1 0 1 0 3.2 0 a1.6 1 0 1 0 -3.2 0 Z M284 789 h8 M298 788 h8', fill='#c94f3d', stroke='#6a6a72', strokeWidth=1.4)
    # lamp cord running off the back of the table and down to the floor
    a.stroke('M252 780 Q300 772 352 774 Q366 776 366 800 L370 1070', color='#1a1a1a', lw=3, profile=None)
    v.tool('export', path=os.path.join(out, 'bLamp.svg'))
    v.close()


# ---------------------------------------------------------------- the four friends from behind
def tufts_hair(a, v, hx, hy, r, base, mid, lit, count, length, crown_dy=-0.45, nape=0.42):
    lr = random.Random(int(hx * 7 + r))
    # crown: an uneven, rounded outline (no regular bumps)
    ring = []
    for i in range(15):
        ang = math.radians(-200 + 220 * i / 14)
        rr = r * (1.07 + lr.uniform(-0.035, 0.05))
        ring.append((hx + math.cos(ang) * rr, hy + math.sin(ang) * rr))
    # nape: locks of different widths and lengths, leaning a little, so it never reads as a zigzag
    edge = []
    x = hx + r * 0.97
    while x > hx - r * 0.97:
        w = r * lr.uniform(0.12, 0.26)
        lm = x - w / 2
        curve = -abs(lm - hx) / r * r * 0.1
        valley_y = hy + r * (nape - 0.03 + lr.uniform(-0.02, 0.03)) + curve
        tip_y = valley_y + r * lr.uniform(0.05, 0.17)
        edge.append((x, valley_y))
        edge.append((lm + lr.uniform(-w * 0.25, w * 0.25), tip_y))
        x -= w
    edge.append((hx - r * 0.97, hy + r * (nape - 0.04)))
    a.shape(smooth_d(ring + edge, tension=0.35), base, lw=5)
    clumps = []
    for i in range(count):
        ang = lr.uniform(-200, 20); rr = lr.uniform(0.15, 0.95) * r
        cx, cy = hx + math.cos(math.radians(ang)) * rr, hy + math.sin(math.radians(ang)) * rr - r * 0.1
        if cy < hy + r * 0.28:
            clumps.append((cy, cx))
    for cy, cx in sorted(clumps):
        flow = math.atan2(cy - (hy + r * crown_dy), cx - hx) + math.radians(lr.uniform(-18, 18))
        size = lr.uniform(0.75, 1.1) * length
        tip = (cx + math.cos(flow) * size * 1.6, cy + math.sin(flow) * size * 1.6)
        l = (cx + math.cos(flow + 1.6) * size * 0.42, cy + math.sin(flow + 1.6) * size * 0.42)
        rr_ = (cx + math.cos(flow - 1.6) * size * 0.42, cy + math.sin(flow - 1.6) * size * 0.42)
        back = (cx - math.cos(flow) * size * 0.5, cy - math.sin(flow) * size * 0.5)
        a.shape(smooth_d([back, l, tip, rr_], tension=0.45), lit if (cx > hx + r * 0.2 and lr.random() < 0.35) else mid, lw=2.6, rough=0.6)


def ear(a, cx, cy, size, side):
    """An ear seen from behind: the back of the helix sticking out of the head, with its inner fold."""
    s = side
    pts = [(cx, cy - size * 0.55), (cx + s * size * 0.45, cy - size * 0.6), (cx + s * size * 0.62, cy - size * 0.1),
           (cx + s * size * 0.45, cy + size * 0.5), (cx + s * size * 0.05, cy + size * 0.62), (cx - s * size * 0.2, cy)]
    a.shape(smooth_d(pts, tension=0.45), '#ffffff', lw=4, rough=0.5)
    a.stroke(f'M{cx + s * size * 0.12:.1f} {cy - size * 0.35:.1f} Q{cx + s * size * 0.45:.1f} {cy - size * 0.2:.1f} {cx + s * size * 0.3:.1f} {cy + size * 0.35:.1f}',
             color='#c9d0d9', lw=4, profile='lens')


def head(a, hx, hy, r):
    """The head (locked character white) with its shade side: the lamp is on the left, so the right
    and lower part falls into a soft blue-grey shadow."""
    a.shape(f'M{hx - r} {hy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', '#ffffff', rough=0.8, detail=30)
    pts = [(hx + r * math.cos(math.radians(d)), hy + r * math.sin(math.radians(d))) for d in range(-55, 96, 10)]
    inner = [(hx + r * 0.2 + r * 0.72 * math.cos(math.radians(d)), hy + r * 0.05 + r * 0.9 * math.sin(math.radians(d))) for d in range(90, -56, -10)]
    a.shape(smooth_d(pts + inner, tension=0.4), '#e6ebf1', stroke=False, rough=0)


def back_figure(name, out):
    v = VC(); a = Artist(v, 560, 600, 6, seed=hash(name) % 1000)
    hx = 280
    if name == 'Traveler':
        hy, r = 230, 150
        a.shape(smooth_d([(20, 610), (40, 470), (120, 400), (440, 400), (520, 470), (540, 610)], tension=0.35), '#f6c443')
        a.shape(smooth_d([(20, 610), (40, 470), (120, 400), (200, 405), (120, 480), (110, 610)], tension=0.35), '#dfa52a', stroke=False, rough=1.5)
        for s in (-1, 1):
            a.stroke(f'M{hx + s * 90} 400 q{s * 6} 60 {s * 22} 200', color=INK, lw=30, profile=None, rough=False)
            a.stroke(f'M{hx + s * 90} 400 q{s * 6} 60 {s * 22} 200', color='#6b4325', lw=20, profile=None, rough=False)
        a.shape(smooth_d([(150, 420), (170, 380), (240, 362), (320, 362), (390, 380), (410, 420), (350, 440), (210, 440)], tension=0.4), '#f6c443')
        a.stroke('M190 410 Q280 384 370 410', color='#c98f1f', lw=5)
        for sd in (-1, 1):
            ear(a, hx + sd * r * 0.97, hy + r * 0.26, r * 0.3, sd)
        head(a, hx, hy, r)
        tufts_hair(a, v, hx, hy, r, '#3a2314', '#4a2e1c', '#5a3824', 30, r * 0.2)
    elif name == 'Tank':
        hy, r = 250, 118
        a.shape(smooth_d([(-10, 610), (0, 470), (90, 390), (470, 390), (560, 470), (570, 610)], tension=0.35), '#ffffff')  # bare shoulders
        # thick neck flaring into the trapezius, with the nape crease and the shoulder muscles
        a.shape(smooth_d([(hx - 58, 318), (hx + 58, 318), (hx + 66, 368), (hx + 130, 398), (hx + 150, 430), (hx - 150, 430), (hx - 130, 398), (hx - 66, 368)], tension=0.35), '#ffffff', lw=5)
        a.shape(smooth_d([(hx + 30, 330), (hx + 60, 330), (hx + 66, 370), (hx + 128, 398), (hx + 140, 425), (hx + 40, 420)], tension=0.4), '#e6ebf1', stroke=False, rough=1)
        for sd in (-1, 1):
            a.stroke(f'M{hx + sd * 150} 470 Q{hx + sd * 210} 440 {hx + sd * 250} 520', color='#c9d0d9', lw=5)   # deltoid
            a.stroke(f'M{hx + sd * 160} 540 Q{hx + sd * 175} 580 {hx + sd * 150} 610', color='#c9d0d9', lw=4)   # shoulder blade
        a.shape(smooth_d([(570, 610), (560, 470), (470, 390), (430, 395), (500, 470), (520, 610)], tension=0.35), '#e6ebf1', stroke=False, rough=1)
        a.shape(smooth_d([(130, 610), (150, 420), (200, 395), (360, 395), (410, 420), (430, 610)], tension=0.3), '#5f7a3a')  # tank top back
        a.shape(smooth_d([(130, 610), (150, 420), (200, 398), (240, 400), (200, 460), (190, 610)], tension=0.3), '#4c6330', stroke=False, rough=1.5)
        a.stroke('M200 470 q80 30 160 0', color='#4c6330', lw=4)
        a.shape(smooth_d([(-10, 610), (0, 470), (90, 390), (130, 395), (60, 470), (40, 610)], tension=0.35), '#e6ebf1', stroke=False, rough=1)
        # beard: from behind it shows as a bristly fringe past the jaw, below each ear
        for sd in (-1, 1):
            outer = [(hx + sd * r * 1.1 * math.cos(math.radians(d)), hy + r * 1.08 * math.sin(math.radians(d))) for d in range(12, 86, 8)]
            inner = [(hx + sd * r * 0.8 * math.cos(math.radians(d)), hy + r * 0.8 * math.sin(math.radians(d))) for d in range(84, 10, -8)]
            a.shape(smooth_d(outer + inner, tension=0.4), '#5a3a22', lw=4, rough=1.6, detail=20)
        for sd in (-1, 1):
            ear(a, hx + sd * r * 0.97, hy + r * 0.22, r * 0.3, sd)
        head(a, hx, hy, r)
        # hair pulled back into the bun, with comb lines; beard showing past the jaw on both sides
        a.shape(smooth_d([(hx - r * 0.98, hy + r * 0.1), (hx - r * 0.8, hy - r * 0.7), (hx, hy - r * 1.02), (hx + r * 0.8, hy - r * 0.7), (hx + r * 0.98, hy + r * 0.1), (hx, hy + r * 0.2)], tension=0.4), '#5a3a22')
        combs = ' '.join(f'M{hx + k * 22} {hy + r * 0.15} Q{hx + k * 16} {hy - r * 0.4} {hx + k * 6} {hy - r * 0.9}' for k in range(-4, 5))
        v.tool('draw_path', d=combs, fill='none', stroke='#3e2716', strokeWidth=3)
        a.shape(f'M{hx - 34} {hy - r - 26} a34 30 0 1 0 68 0 a34 30 0 1 0 -68 0 Z', '#5a3a22', lw=5, rough=1, detail=30)
        a.stroke(f'M{hx - 30} {hy - r - 4} Q{hx} {hy - r + 6} {hx + 30} {hy - r - 4}', color='#c94f3d', lw=8, profile=None, rough=False)
    elif name == 'Pip':
        hy, r = 260, 165
        a.shape(smooth_d([(110, 610), (130, 480), (190, 440), (370, 440), (430, 480), (450, 610)], tension=0.35), '#e2553f')
        stripes = ' '.join(f'M{120 + k * 4} {500 + k * 26} H{440 - k * 4}' for k in range(4))
        v.tool('draw_path', d=stripes, fill='none', stroke='#c44331', strokeWidth=8)
        for sd in (-1, 1):
            ear(a, hx + sd * r * 0.97, hy + r * 0.18, r * 0.27, sd)
        head(a, hx, hy, r)
        tufts_hair(a, v, hx, hy, r, '#141118', '#1f1b24', '#34303c', 34, r * 0.17, nape=0.36)
        a.stroke(f'M{hx} {hy - r - 6} q20 -40 52 -26 q12 10 -4 22', color=INK, lw=10, profile=None, rough=False)  # cowlick
        a.stroke(f'M{hx} {hy - r - 6} q20 -40 52 -26 q12 10 -4 22', color='#1f1b24', lw=4, profile=None, rough=False)
        for s in (-1, 1):  # glasses arms hooking round the back of the head
            a.stroke(f'M{hx + s * r * 1.0} {hy + 8} q{-s * 10} 24 {-s * 26} 30', color='#e08a1e', lw=7, profile=None, rough=False)
    else:  # Ria
        hy, r = 240, 140
        a.shape(smooth_d([(50, 610), (70, 470), (140, 410), (420, 410), (490, 470), (510, 610)], tension=0.35), '#c4622d')
        a.shape(smooth_d([(160, 430), (210, 392), (350, 392), (400, 430), (360, 456), (200, 456)], tension=0.4), '#c4622d')  # collar up
        a.stroke('M200 440 Q280 420 360 440', color='#a54f22', lw=5)
        for sd in (-1, 1):
            ear(a, hx + sd * r * 0.97, hy + r * 0.2, r * 0.27, sd)
        head(a, hx, hy, r)
        # smooth black hair pulled up, strand lines toward the tie, the headband, then the ponytail
        a.shape(smooth_d([(hx - r * 1.02, hy - r * 0.02), (hx - r * 0.9, hy - r * 0.6), (hx, hy - r * 1.03), (hx + r * 0.9, hy - r * 0.6), (hx + r * 1.02, hy - r * 0.02), (hx + r * 0.6, hy + r * 0.3), (hx, hy + r * 0.44), (hx - r * 0.6, hy + r * 0.3)], tension=0.4), '#231a20')
        strands = ' '.join(f'M{hx + k * 26} {hy + r * (0.38 - abs(k) * 0.07):.1f} Q{hx + k * 18} {hy - r * 0.3} {hx + 10} {hy - r * 0.78}' for k in range(-4, 5))
        v.tool('draw_path', d=strands, fill='none', stroke='#3a2e36', strokeWidth=3)
        a.stroke(f'M{hx - r} {hy - r * 0.25} Q{hx} {hy - r * 0.62} {hx + r} {hy - r * 0.25}', color=INK, lw=22, profile=None, rough=False)
        a.stroke(f'M{hx - r} {hy - r * 0.25} Q{hx} {hy - r * 0.62} {hx + r} {hy - r * 0.25}', color='#3f8f5a', lw=12, profile=None, rough=False)
        pony = [(hx - 4, hy - r * 0.8), (hx + 40, hy - r * 0.5), (hx + 70, hy + r * 0.3), (hx + 90, hy + r * 1.2), (hx + 50, hy + r * 1.7), (hx + 30, hy + r * 1.0), (hx + 6, hy + r * 0.2), (hx - 20, hy - r * 0.55)]
        a.shape(smooth_d(pony, tension=0.4), '#231a20')
        a.stroke(f'M{hx + 20} {hy - r * 0.2} Q{hx + 60} {hy + r * 0.6} {hx + 64} {hy + r * 1.4}', color='#3a2e36', lw=4)
        a.shape(f'M{hx - 22} {hy - r * 0.78} h40 v18 h-40 Z', '#3f8f5a', lw=3, rough=0.3)  # hair tie
    v.tool('export', path=os.path.join(out, f'bBack{name}.svg'))
    v.close()


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    room(out); print('room ok')
    tv(out); print('tv ok')
    couch(out); print('couch ok')
    lamp_table(out); print('lamp ok')
    for n in ('Traveler', 'Tank', 'Pip', 'Ria'):
        back_figure(n, out); print(n, 'ok')
