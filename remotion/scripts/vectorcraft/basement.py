"""Basement TV room, seen from behind the couch: the four friends watching TV. Drawn in VectorCraft.

  bRoom.svg        (1920 x 1080) one-point-perspective basement: cinder-block back wall, exposed
                   ceiling joists with a duct and pipes, a hanging bulb, a small high window, shelving
                   with boxes and games (left), stairs and a water heater (right), concrete floor, rug
  bTV.svg          (1920 x 1080) TV on a cluttered low cabinet; the screen is left open (Remotion fills it)
  bCouch.svg       (1920 x 1080) the couch from behind: corduroy back, arms, a knitted blanket
  bBack<Name>.svg  (560 x 600) each friend from behind, head and shoulders (Traveler, Tank, Pip, Ria),
                   in their locked colours (TimeTraveler.tsx, Explorer.tsx)
Usage (from remotion/): python3 scripts/vectorcraft/basement.py public/timetraveler/basement
"""
import math, os, random, sys
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
    a.stroke('M1300 160 l-14 60 l10 40 l-18 70 l8 50', color='#3c3e44', lw=3, profile=None)
    # small high window with its well, night outside
    win = [(560, 182), (720, 182), (720, 252), (560, 252)]
    a.shape(pts_d([(548, 172), (732, 172), (732, 262), (548, 262)]), '#8a6a44', lw=4)
    a.shape(pts_d(win), '#1d2b44', lw=3)
    a.shape(pts_d([(560, 230), (720, 230), (720, 252), (560, 252)]), '#3e3528', stroke=False)  # soil in the well
    a.stroke('M640 182 v70 M560 217 h160', color='#8a6a44', lw=6, profile=None, rough=False)
    for (x, y) in ((590, 200), (690, 196), (650, 208)):
        a.shape(f'M{x - 2} {y} a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 Z', '#e8ecf5', stroke=False, rough=0)  # stars
    # posters taped to the blocks: a dinosaur skeleton chart and a starry sky
    a.shape(pts_d([(1250, 230), (1390, 238), (1384, 400), (1246, 394)]), '#e9dfc4', lw=3)
    # a sauropod chart: silhouette, a ground line and a few text lines
    sauropod = 'M1262 352 Q1280 330 1300 330 Q1318 300 1340 290 Q1352 282 1366 284 Q1372 288 1362 292 Q1350 296 1346 306 Q1342 326 1336 340 L1336 362 L1328 362 L1326 344 L1300 346 L1298 362 L1290 362 L1288 346 Q1272 352 1252 356 Z'
    a.shape(sauropod, '#4a5a3a', lw=2.5, rough=0.3)
    a.stroke('M1254 364 H1376', color='#6b5a3a', lw=2.5, profile=None, rough=False)
    v.tool('draw_path', d='M1262 376 h70 M1262 384 h96 M1262 392 h50', fill='none', stroke='#8a7a5a', strokeWidth=2.4)
    v.tool('draw_path', d='M1262 246 h110', fill='none', stroke='#a04030', strokeWidth=6)
    for (x, y) in ((1252, 232), (1384, 240)):
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
    duct = [CEIL(0.0, 0.42), CEIL(1.0, 0.42), CEIL(1.0, 0.58), CEIL(0.0, 0.58)]
    a.shape(pts_d(duct), '#9aa0a8', lw=4)
    seams = ' '.join(pts_d([CEIL(u, 0.42), CEIL(u, 0.58)], closed=False) for u in [i / 9 for i in range(1, 9)])
    v.tool('draw_path', d=seams, fill='none', stroke='#6e737b', strokeWidth=2.5)
    a.stroke(pts_d([CEIL(0, 0.45), CEIL(1, 0.45)], closed=False), color='#d6dae0', lw=3, opacity=60, profile=None)
    for (vv, col, wdt) in ((0.8, '#b06a3a', 9), (0.86, '#c8ccd2', 7)):
        a.stroke(pts_d([CEIL(0, vv), CEIL(1, vv)], closed=False), color=INK, lw=wdt + 5, profile=None, rough=False)
        a.stroke(pts_d([CEIL(0, vv), CEIL(1, vv)], closed=False), color=col, lw=wdt, profile=None, rough=False)
    # hanging bulb on its cord (off), with a pull chain
    a.stroke('M960 120 L960 210', color=INK, lw=3, profile=None, rough=False)
    a.shape('M948 210 h24 v14 h-24 Z', '#4a4a4a', lw=2.5, rough=0)
    a.shape('M960 224 m-16 0 a16 20 0 1 0 32 0 a16 20 0 1 0 -32 0 Z', '#d9d2b0', lw=3, rough=0, opacity=90)
    a.stroke('M968 224 l4 60', color='#8a8a8a', lw=2, profile=None, rough=False)
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
    # ---- left wall: block wall plus a wooden shelving unit full of stuff
    a.shape(pts_d([LEFT(0, 0), LEFT(1, 0), LEFT(1, 1), LEFT(0, 1)]), '#64666d', lw=0, rough=0)
    rows = ' '.join(pts_d([LEFT(0, t), LEFT(1, t)], closed=False) for t in [i / 18 for i in range(1, 18)])
    v.tool('draw_path', d=rows, fill='none', stroke='#55575d', strokeWidth=1.6)
    shelf_u0, shelf_u1 = 0.35, 0.92
    for t in (0.18, 0.36, 0.54, 0.72):
        a.shape(pts_d([LEFT(shelf_u0, t), LEFT(shelf_u1, t), LEFT(shelf_u1, t + 0.025), LEFT(shelf_u0, t + 0.025)]), '#8a6a44', lw=2.5)
    for uu in (shelf_u0, (shelf_u0 + shelf_u1) / 2, shelf_u1):
        a.shape(pts_d([LEFT(uu - 0.012, 0.16), LEFT(uu + 0.012, 0.16), LEFT(uu + 0.012, 0.9), LEFT(uu - 0.012, 0.9)]), '#7a5a38', lw=2.5)
    items = []
    for t_top, t_base in ((0.06, 0.18), (0.24, 0.36), (0.42, 0.54), (0.6, 0.72)):
        uu = shelf_u0 + 0.02
        while uu < shelf_u1 - 0.06:
            wdt = rng.uniform(0.05, 0.1)
            hgt = rng.uniform(0.5, 0.95) * (t_base - t_top)
            col = rng.choice(['#b08a5a', '#c49a62', '#6a7a9a', '#9a4a3a', '#5a7a4a', '#d0c090', '#8a8a8a'])
            items.append((col, pts_d([LEFT(uu, t_base - hgt), LEFT(uu + wdt, t_base - hgt), LEFT(uu + wdt, t_base), LEFT(uu, t_base)])))
            uu += wdt + rng.uniform(0.005, 0.02)
    for col, d in items:
        a.shape(d, col, lw=2.2, rough=0.4)
    labels = ' '.join(pts_d([LEFT(u_, t_), LEFT(u_ + 0.03, t_)], closed=False) for u_ in (0.4, 0.55, 0.7, 0.8) for t_ in (0.3, 0.48, 0.66))
    v.tool('draw_path', d=labels, fill='none', stroke='#f2ead6', strokeWidth=3)
    # ---- right wall: wooden stairs climbing toward the back, a rail, the water heater in the corner
    a.shape(pts_d([RIGHT(0, 0), RIGHT(1, 0), RIGHT(1, 1), RIGHT(0, 1)]), '#64666d', lw=0, rough=0)
    rows = ' '.join(pts_d([RIGHT(0, t), RIGHT(1, t)], closed=False) for t in [i / 18 for i in range(1, 18)])
    v.tool('draw_path', d=rows, fill='none', stroke='#55575d', strokeWidth=1.6)
    # water heater in the back-right corner, pipes up to the ceiling
    hx, hy0, hy1, hw = 1440, 520, 770, 44
    a.shape(smooth_d([(hx - hw, hy1), (hx - hw, hy0 + 14), (hx - hw * 0.6, hy0), (hx + hw * 0.6, hy0), (hx + hw, hy0 + 14), (hx + hw, hy1)], tension=0.25), '#c9ccd0', lw=3.5)
    a.shape(smooth_d([(hx + hw * 0.3, hy1), (hx + hw * 0.3, hy0 + 10), (hx + hw, hy0 + 14), (hx + hw, hy1)], tension=0.25), '#9fa3a8', stroke=False, rough=1)
    a.stroke(f'M{hx - 14} {hy0} V160 M{hx + 14} {hy0} V160', color='#b06a3a', lw=7, profile=None, rough=False)
    a.shape(f'M{hx - 14} {hy0 + 90} h28 v20 h-28 Z', '#e6dfc8', lw=2.5, rough=0)
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
    a.shape(pts_d([P(XL, YC, 9.0), P(XR, YC, 9.0), P(XR, YC, 9.75), P(XL, YC, 9.75)]), '#f0c878', lw=3)
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
    # handrail on the open side: posts standing up from the stringer, a rail along their tops
    posts = []
    rail = []
    for t in [k / 6 for k in range(7)]:
        z, y = on_line(t, 0)
        b = P(XL - 0.03, y, z); top = P(XL - 0.03, y + 1.15, z)
        posts.append((b, top))
        rail.append(top)
    for b, top in posts:
        a.stroke(f'M{b[0]:.1f} {b[1]:.1f} L{top[0]:.1f} {top[1]:.1f}', color=INK, lw=9, profile=None, rough=False)
        a.stroke(f'M{b[0]:.1f} {b[1]:.1f} L{top[0]:.1f} {top[1]:.1f}', color='#7a5836', lw=5, profile=None, rough=False)
    a.stroke(pts_d(rail, closed=False), color=INK, lw=13, profile=None, rough=False)
    a.stroke(pts_d(rail, closed=False), color='#8a6640', lw=8, profile=None, rough=False)
    a.stroke(pts_d([(x, y - 2) for x, y in rail], closed=False), color='#c49a62', lw=2.5, profile=None, rough=False)


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


# ---------------------------------------------------------------- the four friends from behind
def tufts_hair(a, v, hx, hy, r, base, mid, lit, count, length, crown_dy=-0.45, nape=0.42):
    lr = random.Random(int(hx * 7 + r))
    ring = []
    for i in range(19):
        ang = math.radians(-200 + 220 * i / 18)
        rr = r + (r * 0.12 if i % 2 else r * 0.03) + lr.uniform(-r * 0.03, r * 0.03)
        ring.append((hx + math.cos(ang) * rr, hy + math.sin(ang) * rr))
    edge = [(hx + r * 0.95 - i * (r * 1.9 / 11), hy + r * (nape + (0.16 if i % 2 else 0)) - abs(i - 5.5) * r * 0.02) for i in range(12)]
    a.shape(pts_d(ring + edge), base, lw=5)
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
        a.shape(f'M{hx - r} {hy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', '#ffffff', rough=0.8, detail=30)
        tufts_hair(a, v, hx, hy, r, '#3a2314', '#4a2e1c', '#5a3824', 30, r * 0.2)
    elif name == 'Tank':
        hy, r = 250, 118
        a.shape(smooth_d([(-10, 610), (0, 470), (90, 390), (470, 390), (560, 470), (570, 610)], tension=0.35), '#ffffff')  # bare shoulders
        a.shape(smooth_d([(130, 610), (150, 420), (200, 395), (360, 395), (410, 420), (430, 610)], tension=0.3), '#5f7a3a')  # tank top back
        a.shape(smooth_d([(130, 610), (150, 420), (200, 398), (240, 400), (200, 460), (190, 610)], tension=0.3), '#4c6330', stroke=False, rough=1.5)
        a.stroke('M200 470 q80 30 160 0', color='#4c6330', lw=4)
        a.shape(smooth_d([(-10, 610), (0, 470), (90, 390), (130, 395), (60, 470), (40, 610)], tension=0.35), '#e6ebf1', stroke=False, rough=1)
        a.shape(f'M{hx - 60} 330 h120 v80 h-120 Z', '#ffffff', lw=5)  # thick neck
        a.shape(f'M{hx - r} {hy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', '#ffffff', rough=0.8, detail=30)
        # hair pulled back into the bun, with comb lines; beard showing past the jaw on both sides
        a.shape(smooth_d([(hx - r * 0.98, hy + r * 0.1), (hx - r * 0.8, hy - r * 0.7), (hx, hy - r * 1.02), (hx + r * 0.8, hy - r * 0.7), (hx + r * 0.98, hy + r * 0.1), (hx, hy + r * 0.2)], tension=0.4), '#5a3a22')
        combs = ' '.join(f'M{hx + k * 22} {hy + r * 0.15} Q{hx + k * 16} {hy - r * 0.4} {hx + k * 6} {hy - r * 0.9}' for k in range(-4, 5))
        v.tool('draw_path', d=combs, fill='none', stroke='#3e2716', strokeWidth=3)
        a.shape(f'M{hx - 34} {hy - r - 26} a34 30 0 1 0 68 0 a34 30 0 1 0 -68 0 Z', '#5a3a22', lw=5, rough=1, detail=30)
        a.stroke(f'M{hx - 30} {hy - r - 4} Q{hx} {hy - r + 6} {hx + 30} {hy - r - 4}', color='#c94f3d', lw=8, profile=None, rough=False)
        for s in (-1, 1):
            a.shape(smooth_d([(hx + s * r * 0.9, hy + r * 0.3), (hx + s * r * 1.08, hy + r * 0.6), (hx + s * r * 0.85, hy + r * 0.95), (hx + s * r * 0.7, hy + r * 0.6)], tension=0.4), '#5a3a22', lw=4)
    elif name == 'Pip':
        hy, r = 260, 165
        a.shape(smooth_d([(110, 610), (130, 480), (190, 440), (370, 440), (430, 480), (450, 610)], tension=0.35), '#e2553f')
        stripes = ' '.join(f'M{120 + k * 4} {500 + k * 26} H{440 - k * 4}' for k in range(4))
        v.tool('draw_path', d=stripes, fill='none', stroke='#c44331', strokeWidth=8)
        a.shape(f'M{hx - r} {hy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', '#ffffff', rough=0.8, detail=30)
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
        a.shape(f'M{hx - r} {hy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', '#ffffff', rough=0.8, detail=30)
        # smooth black hair pulled up, strand lines toward the tie, the headband, then the ponytail
        a.shape(smooth_d([(hx - r * 1.0, hy + r * 0.25), (hx - r * 0.9, hy - r * 0.6), (hx, hy - r * 1.03), (hx + r * 0.9, hy - r * 0.6), (hx + r * 1.0, hy + r * 0.25), (hx, hy + r * 0.42)], tension=0.4), '#231a20')
        strands = ' '.join(f'M{hx + k * 26} {hy + r * 0.35} Q{hx + k * 18} {hy - r * 0.3} {hx + 10} {hy - r * 0.78}' for k in range(-4, 5))
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
    for n in ('Traveler', 'Tank', 'Pip', 'Ria'):
        back_figure(n, out); print(n, 'ok')
