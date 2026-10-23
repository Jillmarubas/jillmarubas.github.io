"""Draw the Ice Age scene pieces in VectorCraft (headless MCP server) and export one SVG each.

Each piece is drawn in the same box as its code-drawn twin (remotion/src/timetraveler/pieces.ts).
Hand-drawn quality comes from VectorCraft itself:
  - Roughen (smooth points) on every outlined shape, so the ink line wobbles like a pen line,
  - Scribble on shade shapes, a crayon-hatch texture,
  - the 'lens' width profile on detail strokes, so they taper like brush strokes.
Usage (from remotion/): python3 scripts/vectorcraft/art.py public/timetraveler/vector [piece ...]
  Writes <piece>.svg (used by the scene), <piece>.png (preview) and <piece>.vectorcraft (editable).
"""
import math, random, sys, os, json
from vc import VC

INK = '#2a1b12'
C = dict(
    far='#8ea6c4', farShade='#7891b2', farSnow='#e3ecf5', farSnowShade='#c6d4e6',
    mid='#6d89ae', midShade='#5a7499', midSnow='#eaf0f7', midSnowShade='#c9d6e7',
    hill='#e6eef7', hillShade='#c3d3e6', snow='#f3f7fb', snowShade='#d2deeb',
    pine='#2f5d50', pineDark='#234538', pineLight='#3f7564', bark='#6b4428', barkDark='#4e301b',
    rock='#767c8c', rockDark='#585d6b', rockLight='#9096a5', cave='#1c1922', caveRim='#3a3542',
    log='#7a4a2a', logDark='#5a3419', logEnd='#c99a64', logRing='#a87443', ash='#9a9aa3',
    fur='#7b4a2c', furDark='#5a341e', furLight='#9b6a44', tusk='#f3e6c8', tuskShade='#d8c49c',
    ice='#cfe8f7',
)


def pts_d(pts, closed=True):
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return s + (' Z' if closed else '')


def smooth_d(pts, closed=True, tension=0.5):
    """Catmull-Rom through the points, written as cubic Beziers."""
    n = len(pts)
    if n < 3:
        return pts_d(pts, closed)
    out = [f'M{pts[0][0]:.1f} {pts[0][1]:.1f}']
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3)
        out.append(f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}')
    return ' '.join(out) + (' Z' if closed else '')


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


class Artist:
    def __init__(self, v, w, h, line, seed=1):
        self.v, self.w, self.h, self.line = v, w, h, line
        self.r = random.Random(seed)
        self.seed = seed
        v.cmd('file.new', width=w, height=h, units='Pixels', backgroundContents='transparent')

    def _rough(self, size=None, detail=4):
        self.seed += 1
        return {"effect": "distort.roughen", "params": {"size": size if size is not None else self.line * 0.28, "relative": False, "detail": detail, "points": "smooth", "seed": self.seed}}

    def shape(self, d, fill, stroke=True, lw=None, rough=None, detail=4, opacity=None):
        eff = [] if rough == 0 else [self._rough(rough, detail)]
        args = dict(d=d, fill=fill, stroke=INK if stroke else 'none', join='round', cap='round', effects=eff)
        if stroke:
            args['strokeWidth'] = lw or self.line
        if opacity is not None:
            args['opacity'] = opacity
        return self.v.tool('draw_path', **args)

    def hatch(self, d, color, angle=35, spacing=None, width=None, opacity=70):
        self.seed += 1
        sp = spacing or self.line * 1.5
        return self.v.tool('draw_path', d=d, fill=color, stroke='none', opacity=opacity, effects=[
            {"effect": "stylize.scribble", "params": {"angle": angle, "strokeWidth": width or self.line * 0.45, "spacing": sp, "curviness": 6, "overlap": -1, "seed": self.seed}}])

    def stroke(self, d, color=INK, lw=None, profile='lens', rough=True, opacity=None):
        eff = [self._rough(self.line * 0.18, 3)] if rough else []
        args = dict(d=d, fill='none', stroke=color, strokeWidth=lw or self.line * 0.8, cap='round', join='round', effects=eff)
        if opacity is not None:
            args['opacity'] = opacity
        r = self.v.tool('draw_path', **args)
        if profile:
            self.v.cmd('stroke.set', profile=profile)
        return r

    def export(self, path):
        self.v.tool('export', path=path)
        self.v.tool('export', path=path.replace('.svg', '.png'), options={"background": "transparent"})


# ------------------------------------------------------------------ mountains
def range_piece(a, peaks, base_fill, shade, snow, snow_shade, ridge_bumps=3):
    w, h, r = a.w, a.h, a.r
    base = h + 6
    ridge = [(-8, base)]
    tips = []
    for i, (x, y) in enumerate(peaks):
        if i > 0:
            px, py = peaks[i - 1]
            vy = max(py, y) + (h - max(py, y)) * r.uniform(0.38, 0.52)
            vx = (px + x) / 2 + r.uniform(-40, 40)
            # little bumps on the shoulders on the way down and up
            for k in range(1, ridge_bumps + 1):
                t = k / (ridge_bumps + 1)
                q = lerp((px, py), (vx, vy), t)
                ridge.append((q[0], q[1] + r.uniform(-12, 12)))
            ridge.append((vx, vy))
            for k in range(1, ridge_bumps + 1):
                t = k / (ridge_bumps + 1)
                q = lerp((vx, vy), (x, y), t)
                ridge.append((q[0], q[1] + r.uniform(-12, 12)))
        elif x > 0:
            ridge.append((-8, y + (h - y) * 0.5))
        ridge.append((x, y))
        tips.append(len(ridge) - 1)
    ridge.append((w + 8, peaks[-1][1] + (h - peaks[-1][1]) * 0.5))
    ridge.append((w + 8, base))
    a.shape(pts_d(ridge), base_fill, lw=a.line)

    for ti in tips:
        x, y = ridge[ti]
        # shade: left face of each peak (the moon is up to the right)
        left = [p for p in ridge[max(0, ti - ridge_bumps - 1):ti + 1]]
        foot = (x + r.uniform(-30, 10), base)
        shade_pts = left + [(x + r.uniform(-6, 6), y + (base - y) * 0.35), foot, (left[0][0], base)]
        a.shape(pts_d(shade_pts), shade, stroke=False, rough=a.line * 0.3)
        a.hatch(pts_d(shade_pts), snow_shade if False else shade, angle=60, opacity=55)
        # snow cap with drips
        lp = ridge[max(0, ti - 2)]
        rp = ridge[min(len(ridge) - 1, ti + 2)]
        t = 0.75
        cl = lerp((x, y), lp, t)
        cr = lerp((x, y), rp, t)
        cap = [(x, y - 2), cl]
        nd = 5
        for k in range(1, nd):
            q = lerp(cl, cr, k / nd)
            drop = r.uniform(18, 46) if k % 2 else r.uniform(-4, 8)
            cap.append((q[0], q[1] + drop))
        cap.append(cr)
        a.shape(smooth_d(cap, tension=0.35), snow, lw=a.line * 0.8)
        # shaded side of the snow
        cs = [(x, y), cl, lerp(cl, cr, 0.25), (x - 2, y + (cl[1] - y) * 0.9)]
        a.shape(pts_d(cs), snow_shade, stroke=False, rough=a.line * 0.2)
        # rock ridge lines running down from the peak
        a.stroke(smooth_d([(x, y + 10), (x + r.uniform(-8, 8), y + (base - y) * 0.3), (foot[0] + 10, y + (base - y) * 0.62)], closed=False), lw=a.line * 0.75)
        for k in range(2):
            sx = x + r.uniform(20, 70)
            sy = y + (base - y) * r.uniform(0.3, 0.5)
            a.stroke(smooth_d([(sx, sy), (sx + r.uniform(-10, 10), sy + 40), (sx + r.uniform(-20, 20), sy + 80)], closed=False), lw=a.line * 0.55, opacity=70)


def far_mountains(a):
    range_piece(a, [(120, 160), (420, 60), (700, 190), (960, 40), (1260, 150), (1560, 70), (1860, 180), (2150, 90), (2330, 170)],
                C['far'], C['farShade'], C['farSnow'], C['farSnowShade'])


def mid_mountains(a):
    range_piece(a, [(60, 200), (380, 90), (760, 220), (1080, 110), (1420, 240), (1760, 80), (2120, 210), (2480, 120)],
                C['mid'], C['midShade'], C['midSnow'], C['midSnowShade'])


# ------------------------------------------------------------------ hills
def hills(a):
    w, h, r = a.w, a.h, a.r
    bumps = [0, 380, 820, 1300, 1760, 2240, 2700, 3000]
    tops = [120, 70, 130, 60, 110, 80, 130, 90]
    top = []
    for i in range(1, len(bumps)):
        x0, x1 = bumps[i - 1], bumps[i]
        y0, y1 = tops[i - 1], tops[i]
        for k in range(8):
            t = k / 8
            x = x0 + (x1 - x0) * t
            # a soft hump between the two tops
            y = y0 + (y1 - y0) * t - math.sin(t * math.pi) * 34 + r.uniform(-3, 3)
            top.append((x, y))
    top.append((w + 8, tops[-1]))
    outline = [(-8, h + 6), (-8, tops[0])] + top + [(w + 8, h + 6)]
    a.shape(smooth_d(outline[1:-1], closed=False) + f' L{w + 8} {h + 6} L-8 {h + 6} Z', C['hill'])
    # shaded hollows between the hills
    for i in range(1, len(bumps) - 1):
        x = bumps[i]
        y = tops[i]
        sh = [(x - 160, y + 70), (x - 40, y + 18), (x + 120, y + 30), (x + 230, y + 90), (x + 60, y + 120)]
        a.shape(smooth_d(sh), C['hillShade'], stroke=False, rough=3)
        a.hatch(smooth_d(sh), C['snowShade'], angle=20, opacity=60)
    # wind lines in the snow
    for k in range(14):
        x = r.uniform(40, w - 200)
        y = r.uniform(170, h - 30)
        L = r.uniform(80, 200)
        a.stroke(smooth_d([(x, y), (x + L / 2, y - 6), (x + L, y)], closed=False), color=C['hillShade'], lw=5, opacity=90)
    # a few rocks and dry tufts poking through the snow
    for k in range(9):
        x = r.uniform(80, w - 80)
        y = r.uniform(150, h - 40)
        s = r.uniform(14, 26)
        a.shape(smooth_d([(x - s, y + 4), (x - s * 0.6, y - s * 0.6), (x + s * 0.4, y - s * 0.8), (x + s, y + 4)]), C['rockDark'], lw=a.line * 0.7)
        a.shape(smooth_d([(x - s * 1.3, y + 6), (x, y - 2), (x + s * 1.3, y + 6), (x, y + 10)]), C['snow'], stroke=False, rough=1.5)
    for k in range(8):
        x = r.uniform(60, w - 60)
        y = r.uniform(140, h - 30)
        for j in range(4):
            a.stroke(f'M{x} {y} Q{x + (j - 1.5) * 6} {y - 14} {x + (j - 1.5) * 11} {y - 26}', color='#8b7a55', lw=3.5, profile='taperEnd', rough=False)


# ------------------------------------------------------------------ pine
def pine(a):
    r = a.r
    cx = 120
    # trunk with bark lines
    a.shape(smooth_d([(108, 312), (106, 396), (134, 396), (132, 312)]), C['bark'])
    for k in range(3):
        y = 330 + k * 20
        a.stroke(f'M{112 + k * 3} {y} q4 8 0 16', color=C['barkDark'], lw=3)
    tiers = [(18, 64, 150), (88, 88, 236), (162, 112, 330)]
    for i, (top, half, bot) in enumerate(tiers):
        # drooping bough edge: scallops along the bottom
        pts = [(cx, top)]
        n = 5 + i
        right = (cx + half, bot)
        left = (cx - half, bot)
        pts.append(lerp((cx, top), right, 0.5))
        pts.append((right[0] + 4, right[1] - 6))
        for k in range(1, n):
            q = lerp(right, left, k / n)
            pts.append((q[0], q[1] + (10 if k % 2 else -6) + r.uniform(-3, 3)))
        pts.append((left[0] - 4, left[1] - 6))
        pts.append(lerp((cx, top), left, 0.5))
        a.shape(smooth_d(pts, tension=0.3), C['pine'])
        # left (shade) half
        sh = [(cx, top + 6), (cx - half * 0.5, top + (bot - top) * 0.5), (left[0] + 6, left[1] - 6), (cx - half * 0.3, bot + 2), (cx + 6, bot - 10)]
        a.shape(smooth_d(sh, tension=0.3), C['pineDark'], stroke=False, rough=2)
        a.hatch(smooth_d(sh, tension=0.3), C['pineDark'], angle=70, opacity=60)
        # needle strokes
        for k in range(6):
            t = r.uniform(0.35, 0.9)
            y = top + (bot - top) * t
            x = cx + r.uniform(-half * t * 0.8, half * t * 0.8)
            a.stroke(f'M{x:.1f} {y:.1f} l{r.uniform(-14, 14):.1f} {r.uniform(10, 18):.1f}', color=C['pineLight'], lw=4)
        # snow resting on the bough
        sw = half * 0.75
        sy = top + (bot - top) * 0.42
        snow = [(cx - 6, top + 8), (cx + 8, top + 6), (cx + sw * 0.6, sy - 6), (cx + sw, sy + 12), (cx + sw * 0.5, sy + 4), (cx + 4, sy + 16), (cx - sw * 0.5, sy + 6), (cx - sw, sy + 14), (cx - sw * 0.7, sy - 8)]
        a.shape(smooth_d(snow, tension=0.35), C['snow'], lw=a.line * 0.8)
        a.stroke(smooth_d([(cx - sw * 0.6, sy + 8), (cx, sy + 12), (cx + sw * 0.4, sy + 6)], closed=False), color=C['snowShade'], lw=4, rough=False)
        # snow along the scalloped tips
        for k in range(1, n, 2):
            q = lerp(right, left, k / n)
            a.shape(smooth_d([(q[0] - 14, q[1] - 2), (q[0], q[1] - 12), (q[0] + 14, q[1] - 2), (q[0], q[1] + 4)]), C['snow'], lw=3, rough=1)


# ------------------------------------------------------------------ cave
def cave(a):
    r = a.r
    mound = [(8, 440), (14, 330), (40, 240), (110, 160), (200, 108), (300, 62), (400, 48), (500, 70), (590, 120), (660, 200), (700, 300), (712, 440)]
    a.shape(smooth_d(mound, closed=False, tension=0.45) + ' Z', C['rock'])
    # shade on the left of the mound
    sh = [(14, 440), (20, 320), (60, 220), (140, 150), (190, 170), (170, 280), (200, 440)]
    a.shape(smooth_d(sh, tension=0.4), C['rockDark'], stroke=False, rough=3)
    a.hatch(smooth_d(sh, tension=0.4), C['rockDark'], angle=55, opacity=65)
    # light facets on the right
    for poly in ([(520, 120), (600, 150), (650, 230), (590, 230)], [(560, 270), (660, 270), (690, 360), (600, 350)]):
        a.shape(pts_d(poly), C['rockLight'], stroke=False, rough=2)
    # rock slabs: cracks that split the mound into big stones
    cracks = [
        [(110, 160), (150, 230), (130, 320), (170, 440)],
        [(300, 62), (290, 140), (240, 200)],
        [(500, 70), (520, 160), (600, 220), (700, 260)],
        [(560, 300), (600, 380), (590, 440)],
        [(40, 300), (110, 330)],
        [(620, 150), (660, 200)],
    ]
    for c in cracks:
        a.stroke(smooth_d(c, closed=False), lw=a.line * 0.85)
    # cave mouth
    mouth = [(240, 440), (238, 360), (262, 290), (310, 248), (362, 236), (416, 250), (462, 296), (482, 370), (484, 440)]
    a.shape(smooth_d(mouth, closed=False, tension=0.45) + ' Z', C['caveRim'])
    inner = [(262, 440), (262, 370), (282, 310), (324, 270), (364, 262), (406, 274), (444, 314), (460, 380), (462, 440)]
    a.shape(smooth_d(inner, closed=False, tension=0.45) + ' Z', C['cave'], stroke=False, rough=2)
    # icicles hanging from the arch
    for k, (x, y, L) in enumerate([(286, 300, 34), (312, 274, 48), (340, 262, 30), (372, 260, 54), (402, 268, 36), (430, 288, 44)]):
        a.shape(pts_d([(x - 7, y - 4), (x + 7, y - 4), (x + r.uniform(-2, 2), y + L)]), C['ice'], lw=3, rough=0.6)
    # snow cap with drips
    cap = [(120, 160), (200, 100), (300, 52), (400, 38), (500, 60), (590, 112), (630, 150), (600, 158), (575, 185), (548, 150), (500, 138), (470, 170), (440, 128), (380, 120), (350, 156), (322, 124), (270, 136), (230, 172), (200, 150), (150, 180)]
    a.shape(smooth_d(cap, tension=0.4), C['snow'])
    a.stroke(smooth_d([(220, 130), (330, 96), (450, 92), (560, 128)], closed=False), color=C['snowShade'], lw=6, rough=False)
    # snow drift and pebbles at the foot
    a.shape(smooth_d([(0, 440), (40, 412), (130, 400), (220, 420), (236, 440)], closed=False) + ' Z', C['snow'], lw=a.line * 0.8)
    a.shape(smooth_d([(488, 440), (540, 414), (640, 404), (712, 420), (716, 440)], closed=False) + ' Z', C['snow'], lw=a.line * 0.8)
    for (x, y, s) in [(70, 408, 12), (190, 418, 9), (600, 410, 11), (660, 418, 8)]:
        a.shape(smooth_d([(x - s, y + 4), (x - s * 0.5, y - s * 0.7), (x + s * 0.6, y - s * 0.6), (x + s, y + 4)]), C['rockDark'], lw=3)


# ------------------------------------------------------------------ logs
def logs(a):
    r = a.r
    def log(cx, cy, ang, end_right):
        L, R = 92, 15
        ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
        def T(x, y):
            return (cx + x * ca - y * sa, cy + x * sa + y * ca)
        body = [T(-L, -R), T(-L * 0.4, -R - 2), T(L * 0.3, -R + 1), T(L, -R), T(L, R), T(L * 0.2, R + 2), T(-L * 0.5, R - 1), T(-L, R)]
        a.shape(smooth_d(body, tension=0.15), C['log'])
        # bark: long lines along the log
        for k in range(4):
            y = -R + 6 + k * 7
            x0 = r.uniform(-L + 12, -10)
            a.stroke(pts_d([T(x0, y), T(x0 + r.uniform(30, 60), y + r.uniform(-1, 1))], closed=False), color=C['logDark'], lw=3)
        # a knot
        kx, ky = T(r.uniform(-30, 30), r.uniform(-4, 4))
        a.shape(f'M{kx - 5} {ky} a5 3.5 0 1 0 10 0 a5 3.5 0 1 0 -10 0 Z', C['logDark'], lw=2.5, rough=0)
        # cut end with growth rings
        ex, ey = T(L if end_right else -L, 0)
        a.shape(f'M{ex - 11} {ey} a11 15 0 1 0 22 0 a11 15 0 1 0 -22 0 Z', C['logEnd'], lw=a.line * 0.8, rough=0.8, detail=30)
        a.stroke(f'M{ex - 6.5} {ey} a6.5 9.5 0 1 0 13 0 a6.5 9.5 0 1 0 -13 0', color=C['logRing'], lw=2.5, profile=None, rough=False)
        a.stroke(f'M{ex - 2} {ey} a2 3 0 1 0 4 0', color=C['logRing'], lw=2, profile=None, rough=False)
        # charred top edge near the fire
        a.stroke(pts_d([T(-20, -R + 2), T(30, -R + 1)], closed=False), color='#2b1a10', lw=5)
    # ash bed
    a.shape(smooth_d([(20, 80), (60, 66), (110, 62), (160, 66), (200, 80), (110, 88)]), C['ash'], lw=a.line * 0.7)
    log(110, 52, -14, True)
    log(110, 52, 14, False)
    # embers
    for (x, y) in [(96, 72), (118, 76), (132, 70), (104, 64)]:
        a.shape(f'M{x - 4} {y} a4 3 0 1 0 8 0 a4 3 0 1 0 -8 0 Z', '#ff9a3c', lw=1.5, rough=0)


# ------------------------------------------------------------------ foreground rock
def rock(a):
    r = a.r
    body = [(20, 400), (14, 300), (60, 210), (160, 140), (300, 84), (440, 96), (560, 150), (650, 240), (690, 400)]
    a.shape(smooth_d(body, closed=False, tension=0.4) + ' Z', C['rock'])
    sh = [(20, 400), (22, 300), (70, 220), (170, 160), (230, 230), (210, 330), (260, 400)]
    a.shape(smooth_d(sh, tension=0.4), C['rockDark'], stroke=False, rough=3)
    a.hatch(smooth_d(sh, tension=0.4), C['rockDark'], angle=50, opacity=65)
    a.shape(pts_d([(470, 130), (580, 180), (640, 280), (540, 260)]), C['rockLight'], stroke=False, rough=3)
    for c in ([(160, 140), (230, 230), (220, 330), (260, 400)], [(440, 96), (470, 200), (540, 260), (640, 300)], [(320, 260), (400, 300), (420, 380)]):
        a.stroke(smooth_d(c, closed=False), lw=a.line * 0.9)
    cap = [(110, 170), (200, 120), (300, 78), (440, 86), (560, 138), (620, 196), (580, 200), (552, 230), (520, 180), (460, 170), (430, 210), (390, 160), (320, 150), (290, 190), (250, 160), (190, 176), (150, 210)]
    a.shape(smooth_d(cap, tension=0.4), C['snow'])
    a.stroke(smooth_d([(190, 140), (300, 104), (440, 110), (540, 150)], closed=False), color=C['snowShade'], lw=7, rough=False)


# ------------------------------------------------------------------ branch
def branch(a):
    r = a.r
    spine = [(915, 40), (760, 52), (600, 86), (440, 140), (300, 196), (170, 244), (40, 270)]
    # the branch as a tapering filled shape
    top = [(x, y - 26 + i * 3.2) for i, (x, y) in enumerate(spine)]
    bot = [(x, y + 26 - i * 3.2) for i, (x, y) in enumerate(spine)][::-1]
    a.shape(smooth_d(top + bot, tension=0.3), C['bark'])
    for k in range(5):
        x = 860 - k * 150
        y = 46 + k * 40
        a.stroke(f'M{x} {y} l-40 {6 + k}', color=C['barkDark'], lw=3)
    twigs = []
    for k in range(7):
        t = 0.1 + k * 0.13
        i = min(len(spine) - 2, int(t * (len(spine) - 1)))
        base = lerp(spine[i], spine[i + 1], t * (len(spine) - 1) - i)
        down = 1 if k % 2 else -1
        tip = (base[0] - 70 - r.uniform(0, 40), base[1] + down * r.uniform(40, 70) + 30)
        twigs.append((base, tip))
        a.stroke(smooth_d([base, lerp(base, tip, 0.5), tip], closed=False), color=C['bark'], lw=9, profile='taperEnd')
    # needle clusters: fans of tapered strokes
    for (base, tip) in twigs + [(s, (s[0] - 60, s[1] + 40)) for s in spine[1:-1]]:
        for k in range(18):
            t = 0.12 + k * 0.05
            p = lerp(base, tip, t)
            ang = math.radians(r.uniform(60, 120) + (k % 2) * 180)
            L = r.uniform(36, 58)
            q = (p[0] + math.cos(ang) * L * 0.6, p[1] + abs(math.sin(ang)) * L)
            a.stroke(f'M{p[0]:.1f} {p[1]:.1f} L{q[0]:.1f} {q[1]:.1f}', color=C['pine'] if k % 3 else C['pineDark'], lw=10, rough=False)
    # outline pass on the needle mass (a few darker strokes)
    for (base, tip) in twigs:
        a.stroke(smooth_d([base, lerp(base, tip, 0.5), tip], closed=False), color=C['pineDark'], lw=5)
    # snow lying along the top of the branch, with clumps
    snow = [(x, y - 24 + i * 3.2) for i, (x, y) in enumerate(spine)]
    cap = snow + [(x + r.uniform(-8, 8), y - 14 - r.uniform(4, 14)) for (x, y) in snow[::-1]]
    a.shape(smooth_d(cap, tension=0.4), C['snow'], lw=a.line * 0.8)
    for (base, tip) in twigs[::2]:
        m = lerp(base, tip, 0.55)
        a.shape(smooth_d([(m[0] - 22, m[1]), (m[0] - 6, m[1] - 16), (m[0] + 18, m[1] - 12), (m[0] + 22, m[1] + 2)]), C['snow'], lw=3, rough=1)
    # icicles
    for (x, y) in [(690, 76), (520, 116), (360, 176)]:
        a.shape(pts_d([(x - 6, y), (x + 6, y), (x, y + r.uniform(28, 44))]), C['ice'], lw=3, rough=0.5)


# ------------------------------------------------------------------ mammoth (faces right, 560 x 420)
MLW = 9


def mammoth_body(a):
    r = a.r
    # tail with a tuft
    a.stroke('M112 170 Q84 200 88 246', color=INK, lw=16, profile='taperEnd', rough=False)
    a.stroke('M112 170 Q84 200 88 246', color=C['furDark'], lw=9, profile='taperEnd', rough=False)
    a.shape(smooth_d([(80, 238), (96, 236), (102, 262), (86, 272), (74, 258)]), C['furDark'], lw=MLW * 0.6)
    # body with a domed hump and a shaggy fur skirt along the bottom
    top = [(118, 250), (106, 190), (130, 130), (190, 88), (250, 66), (310, 72), (370, 96), (420, 130), (448, 190), (446, 250)]
    skirt = []
    xs = list(range(446, 110, -22))
    for i, x in enumerate(xs):
        skirt.append((x, 292 + (14 if i % 2 else -4) + r.uniform(-4, 4)))
    a.shape(smooth_d(top + skirt, tension=0.35), C['fur'], lw=MLW)
    # belly shade and back highlight
    a.shape(smooth_d([(130, 250), (200, 262), (300, 266), (420, 252), (440, 286), (300, 300), (150, 290)], tension=0.35), C['furDark'], stroke=False, rough=3)
    a.hatch(smooth_d([(130, 250), (200, 262), (300, 266), (420, 252), (440, 286), (300, 300), (150, 290)], tension=0.35), C['furDark'], angle=80, opacity=70)
    a.shape(smooth_d([(180, 104), (250, 80), (320, 88), (370, 112), (300, 108), (230, 118)], tension=0.4), C['furLight'], stroke=False, rough=3)
    # fur strands: tapered strokes following the body
    for k in range(26):
        x = r.uniform(140, 430)
        y = r.uniform(120, 270)
        L = r.uniform(18, 34)
        a.stroke(f'M{x:.1f} {y:.1f} q{r.uniform(-6, 2):.1f} {L / 2:.1f} {r.uniform(-8, 0):.1f} {L:.1f}', color=C['furDark'], lw=4.5)
    for k in range(8):
        x = r.uniform(190, 360)
        y = r.uniform(86, 120)
        a.stroke(f'M{x:.1f} {y:.1f} q-6 10 -4 22', color=C['furLight'], lw=4)


def mammoth_head(a):
    r = a.r
    head = [(382, 210), (372, 150), (390, 104), (428, 78), (472, 80), (504, 106), (514, 150), (504, 198), (480, 226), (440, 232), (404, 228)]
    a.shape(smooth_d(head, tension=0.4), C['fur'], lw=MLW)
    # hairy dome on top
    tuft = [(410, 96), (424, 66), (440, 84), (452, 58), (466, 82), (482, 66), (488, 94), (460, 100), (430, 104)]
    a.shape(smooth_d(tuft, tension=0.3), C['furDark'], lw=MLW * 0.7)
    # small ear
    a.shape(smooth_d([(420, 146), (404, 158), (408, 182), (426, 184), (432, 162)], tension=0.4), C['furLight'], lw=MLW * 0.7)
    a.stroke('M418 156 q-4 12 2 22', color=C['furDark'], lw=4)
    # eye with a highlight and a heavy brow
    a.shape('M462 140 a8 10 0 1 0 16 0 a8 10 0 1 0 -16 0 Z', INK, stroke=False, rough=0)
    a.shape('M466 136 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 Z', '#ffffff', stroke=False, rough=0)
    a.stroke('M452 124 Q470 114 488 124', lw=6)
    # fur strands on the cheek
    for k in range(8):
        x = r.uniform(420, 495)
        y = r.uniform(160, 215)
        a.stroke(f'M{x:.1f} {y:.1f} q-3 8 -2 16', color=C['furDark'], lw=4)


def mammoth_trunk(a):
    # from the face down, curling forward at the tip
    outer = [(452, 196), (486, 198), (500, 236), (506, 290), (510, 334), (526, 352), (540, 346), (542, 362), (520, 374), (494, 362), (484, 330), (480, 288), (474, 244), (456, 222)]
    a.shape(smooth_d(outer, tension=0.4), C['fur'], lw=MLW)
    a.shape(smooth_d([(456, 222), (474, 244), (480, 288), (484, 330), (494, 362), (500, 340), (494, 290), (488, 240), (470, 210)], tension=0.4), C['furDark'], stroke=False, rough=1.5)
    # wrinkle rings
    for y in range(236, 340, 16):
        a.stroke(f'M{478 + (y - 236) * 0.05:.1f} {y} q14 4 26 0', color=C['furDark'], lw=4)


def mammoth_tusks(a):
    # near tusk sweeping forward and up; far tusk peeking behind it
    far = [(462, 214), (520, 236), (548, 206), (548, 170), (540, 196), (514, 220), (468, 226)]
    a.shape(smooth_d(far, tension=0.4), C['tuskShade'], lw=MLW * 0.8)
    near = [(470, 222), (530, 256), (556, 226), (554, 180), (548, 214), (522, 240), (474, 236)]
    a.shape(smooth_d(near, tension=0.4), C['tusk'], lw=MLW * 0.85)
    for t in (0.35, 0.55, 0.75):
        a.stroke(f'M{470 + 80 * t:.1f} {230 + 18 * math.sin(t * 3):.1f} l4 -10', color=C['tuskShade'], lw=3.5)


def mammoth_leg(hip, fill, far=False):
    def draw(a):
        r = a.r
        x, y = hip
        x -= 0
        top = y - 30  # starts inside the body, hidden by it or by the fur
        foot = 392
        # fill without an outline across the top, so it melts into the body fur
        shape = [(x - 30, top), (x - 32, y + 40), (x - 30, foot - 20), (x - 30, foot), (x + 30, foot), (x + 30, foot - 20), (x + 32, y + 40), (x + 30, top)]
        a.shape(smooth_d(shape, tension=0.2), fill, stroke=False, rough=2)
        # outline only on the sides and bottom
        a.stroke(smooth_d([(x - 30, y + 10), (x - 32, y + 40), (x - 30, foot - 20), (x - 30, foot)], closed=False), lw=MLW, profile=None)
        a.stroke(smooth_d([(x + 30, y + 10), (x + 32, y + 40), (x + 30, foot - 20), (x + 30, foot)], closed=False), lw=MLW, profile=None)
        a.stroke(f'M{x - 32} {foot} Q{x} {foot + 12} {x + 32} {foot}', lw=MLW, profile=None)
        # shaggy fur fringe at the knee and toenails
        fringe = [(x - 34, y + 46)]
        for k in range(7):
            fringe.append((x - 34 + (k + 1) * 68 / 7, y + 46 + (12 if k % 2 == 0 else 0)))
        a.shape(pts_d([(x - 30, y + 20)] + fringe + [(x + 30, y + 20)]), C['furDark'] if not far else '#4a2a17', lw=MLW * 0.6)
        for k in range(3):
            nx = x - 18 + k * 18
            a.shape(f'M{nx - 7} {foot - 2} a7 6 0 0 1 14 0 Z', C['tusk'], lw=3, rough=0.4)
        for k in range(4):
            a.stroke(f'M{x - 18 + k * 12} {y + 70} q-2 14 0 26', color=C['furDark'] if not far else '#3e2313', lw=4)
    return draw


HIPS = {
    'mammothLegFrontNear': (372, 262),
    'mammothLegFrontFar': (340, 256),
    'mammothLegBackNear': (190, 262),
    'mammothLegBackFar': (222, 256),
}

PIECES = {
    'farMountains': (2400, 420, 4, far_mountains),
    'midMountains': (2600, 440, 4.5, mid_mountains),
    'hills': (2900, 320, 5, hills),
    'pine': (240, 400, 5, pine),
    'cave': (720, 440, 5, cave),
    'logs': (220, 90, 5, logs),
    'rock': (700, 400, 5, rock),
    'branch': (900, 380, 5, branch),
    'mammothBody': (560, 420, MLW, mammoth_body),
    'mammothHead': (560, 420, MLW, mammoth_head),
    'mammothTrunk': (560, 420, MLW, mammoth_trunk),
    'mammothTusks': (560, 420, MLW, mammoth_tusks),
    'mammothLegFrontNear': (560, 420, MLW, mammoth_leg(HIPS['mammothLegFrontNear'], C['fur'])),
    'mammothLegFrontFar': (560, 420, MLW, mammoth_leg(HIPS['mammothLegFrontFar'], C['furDark'], far=True)),
    'mammothLegBackNear': (560, 420, MLW, mammoth_leg(HIPS['mammothLegBackNear'], C['fur'])),
    'mammothLegBackFar': (560, 420, MLW, mammoth_leg(HIPS['mammothLegBackFar'], C['furDark'], far=True)),
}

if __name__ == '__main__':
    out = sys.argv[1]
    names = sys.argv[2:] or list(PIECES)
    os.makedirs(out, exist_ok=True)
    for i, name in enumerate(names):
        w, h, line, fn = PIECES[name]
        v = VC()  # a fresh headless session per piece
        a = Artist(v, w, h, line, seed=17 + i * 101)
        fn(a)
        doc = v.tool('inspect_document', depth=1)
        a.export(os.path.join(out, f'{name}.svg'))
        v.cmd('document.save', path=os.path.join(out, f'{name}.vectorcraft'))
        v.close()
        print(name, 'ok', os.path.getsize(os.path.join(out, f'{name}.svg')), 'bytes')
