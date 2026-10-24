"""Jurassic river forest, drawn in VectorCraft as depth layers for the parallax camera.

Principles taken from the user's landscape references (24 Oct 2026); we take the ideas, never the
compositions:
  - atmospheric perspective: every layer further back is paler, bluer and hazier, with thinner,
    lighter outlines and less detail
  - mist and light shafts between the layers (added in Remotion: JurassicLandscape.tsx)
  - dark, dense foreground framing; the bright, misty middle holds the focal point (a sauropod herd)
  - small figures for scale, a stream with a mossy fallen log
Accuracy (research/jurassic.md): no grass, no flowers, no palms. The plants are conifers
(Araucaria-like), tree ferns, cycads, horsetails, ferns and ginkgo.

Each layer is 2400 x 1080 (the 1920 frame plus room to pan).
Usage (from remotion/): python3 scripts/vectorcraft/landscape.py public/timetraveler/jurassic
"""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vc import VC
from art import Artist, smooth_d, pts_d, lerp, INK

W, H = 2400, 1080
HAZE = (0.80, 0.85, 0.87)  # cool, slightly blue mist


def hx(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))


def tint(c, k):
    """Mix a colour toward the haze by k (0 = as is, 1 = all haze)."""
    r, g, b = hx(c)
    m = [r + (HAZE[0] - r) * k, g + (HAZE[1] - g) * k, b + (HAZE[2] - b) * k]
    return '#' + ''.join(f'{int(max(0, min(1, v)) * 255):02x}' for v in m)


class Layer:
    """Drawing helpers that fade colour and line toward the haze by the layer's depth."""
    def __init__(self, depth, seed, w=W, h=H):
        self.v = VC()
        self.k = depth
        self.lw = 5 * (1 - depth * 0.85)
        self.a = Artist(self.v, w, h, max(1.0, self.lw), seed=seed)
        self.r = random.Random(seed)

    def ink(self):
        return tint(INK, self.k * 0.9)

    def fill(self, d, c, outline=True, lw=None, rough=None, opacity=None):
        args = dict(d=d, fill=tint(c, self.k), stroke=self.ink() if outline and self.lw > 0.8 else 'none', join='round', cap='round')
        if args['stroke'] != 'none':
            args['strokeWidth'] = lw or self.lw
            args['effects'] = [self.a._rough(rough if rough is not None else self.lw * 0.25, 5)]
        if opacity is not None:
            args['opacity'] = opacity
        return self.v.tool('draw_path', **args)

    def line(self, d, c, w, opacity=None, cap='round'):
        args = dict(d=d, fill='none', stroke=tint(c, self.k), strokeWidth=w, cap=cap, join='round')
        if opacity is not None:
            args['opacity'] = opacity
        return self.v.tool('draw_path', **args)

    def hatch(self, d, c, angle=60, spacing=7, width=2, opacity=55):
        if self.k < 0.6:
            self.a.hatch(d, tint(c, self.k), angle=angle, spacing=spacing, width=width, opacity=opacity)

    def save(self, path):
        self.v.tool('export', path=path)
        self.v.close()


# ------------------------------------------------------------------ plant & rock builders
def araucaria(L, x, base, height, crown_w):
    """Monkey-puzzle: bare trunk and a domed crown of whorled, upturned limbs (simplified for distance)."""
    r = L.r
    tw = max(4, height * 0.022)
    L.fill(pts_d([(x - tw, base), (x - tw * 0.4, base - height), (x + tw * 0.4, base - height), (x + tw, base)]), '#6b4428')
    top = base - height
    for i in range(8):
        y = top + 20 + i * crown_w * 0.07
        span = crown_w * (0.25 + 0.75 * math.sin(math.pi * 0.5 * min(1, (i + 1) / 6)))
        for s in (-1, 1):
            pts = [(x, y), (x + s * span * 0.5, y + span * 0.12), (x + s * span * 0.95, y + span * 0.05), (x + s * span, y - span * 0.08)]
            d = smooth_d(pts, closed=False)
            L.line(d, INK, max(3, span * 0.07) + L.lw * 1.6) if L.k < 0.7 else None
            L.line(d, '#2c5747', max(2.5, span * 0.07))
            if L.k < 0.5:
                L.line(smooth_d([(px, py - 2) for px, py in pts], closed=False), '#76aa86', max(1, span * 0.018))
            # hanging branchlets
            if L.k < 0.75:
                for t in (0.35, 0.6, 0.85):
                    bx, by = pts[1] if t < 0.5 else pts[2]
                    bx = x + s * span * t
                    L.line(f'M{bx:.1f} {by:.1f} q{s * 6:.1f} {span * 0.12:.1f} {s * 12:.1f} {span * 0.1:.1f}', '#2c5747', max(2, span * 0.04))


def conifer_spire(L, x, base, height, w):
    """Tall narrow conifer: trunk and stacked, ragged needle masses."""
    r = L.r
    L.fill(pts_d([(x - w * 0.06, base), (x, base - height), (x + w * 0.06, base)]), '#5c3a22')
    n = int(height / (w * 0.35)) + 3
    for i in range(n):
        t = i / n
        y = base - height * 0.25 - t * height * 0.75
        half = w * (1 - t) * 0.6 + w * 0.08
        pts = [(x - half, y + w * 0.08), (x - half * 0.5, y - w * 0.12), (x, y - w * 0.22), (x + half * 0.5, y - w * 0.1), (x + half, y + w * 0.1), (x, y + w * 0.18)]
        L.fill(smooth_d(pts, tension=0.35), '#2b5244' if i % 2 else '#305a4a', outline=L.k < 0.75)


def tree_fern(L, x, base, height, span, lean=0):
    """Tree fern: fibrous trunk and a crown of arching, finely divided fronds."""
    r = L.r
    tw = max(5, height * 0.05)
    top = (x + lean, base - height)
    trunk = [(x - tw, base), (top[0] - tw * 0.7, top[1]), (top[0] + tw * 0.7, top[1]), (x + tw, base)]
    L.fill(pts_d(trunk), '#5e3f26')
    if L.k < 0.6:
        marks = []
        for i in range(int(height / 10)):
            y = base - i * 10
            xx = lerp((x, base), top, i * 10 / height)[0]
            marks.append(f'M{xx - tw * 0.7:.1f} {y:.1f} l{tw * 0.5:.1f} -4 M{xx + tw * 0.1:.1f} {y - 2:.1f} l{tw * 0.5:.1f} -4')
        L.line(' '.join(marks), '#3d2716', 2)
    for j in range(9):
        ang = -170 + j * 20 + r.uniform(-6, 6)
        rad = math.radians(ang)
        length = span * r.uniform(0.75, 1.0)
        tip = (top[0] + math.cos(rad) * length, top[1] + math.sin(rad) * length * 0.45 + length * 0.35)
        mid = (top[0] + math.cos(rad) * length * 0.55, top[1] + math.sin(rad) * length * 0.6 - length * 0.05)
        rach = [top, mid, tip]
        d = smooth_d(rach, closed=False)
        L.line(d, '#2f5e3a', max(2, span * 0.025))
        # leaflets: filled slivers along the frond
        leaves = []
        steps = 14 if L.k < 0.5 else 8
        for i in range(1, steps):
            t = i / steps
            p = lerp(top, mid, t * 2) if t < 0.5 else lerp(mid, tip, (t - 0.5) * 2)
            q = lerp(top, mid, (t + 0.05) * 2) if t < 0.5 else lerp(mid, tip, min(1, (t + 0.05 - 0.5) * 2))
            ux, uy = q[0] - p[0], q[1] - p[1]
            n = math.hypot(ux, uy) or 1
            nx, ny = -uy / n, ux / n
            ll = span * 0.16 * (1 - t * 0.7)
            for s in (-1, 1):
                ex, ey = p[0] + nx * s * ll + ux * 0.4, p[1] + ny * s * ll + uy * 0.4 + ll * 0.3
                leaves.append(f'M{p[0]:.1f} {p[1]:.1f} Q{(p[0] + ex) / 2 + ux * 0.4:.1f} {(p[1] + ey) / 2 + uy * 0.4:.1f} {ex:.1f} {ey:.1f} Q{(p[0] + ex) / 2 - ux * 0.2:.1f} {(p[1] + ey) / 2 - uy * 0.2:.1f} {p[0]:.1f} {p[1]:.1f} Z')
        L.v.tool('draw_path', d=' '.join(leaves), fill=tint('#3f7f4a' if j % 2 else '#4a8c52', L.k), stroke=L.ink() if L.k < 0.6 else 'none', strokeWidth=max(0.8, L.lw * 0.3))


def cycad(L, x, base, size):
    r = L.r
    h = size * 0.8
    L.fill(smooth_d([(x - size * 0.22, base), (x - size * 0.24, base - h * 0.5), (x - size * 0.16, base - h), (x + size * 0.16, base - h), (x + size * 0.24, base - h * 0.5), (x + size * 0.22, base)], tension=0.3), '#8a6a3e')
    d = []
    for row in range(7):
        yy = base - 10 - row * h / 7
        for kx in range(-2, 3):
            xx = x + kx * size * 0.09 + (size * 0.045 if row % 2 else 0)
            if abs(xx - x) < size * 0.2:
                s = size * 0.045
                d.append(f'M{xx - s:.1f} {yy:.1f} L{xx:.1f} {yy - s:.1f} L{xx + s:.1f} {yy:.1f} L{xx:.1f} {yy + s:.1f} Z')
    L.v.tool('draw_path', d=' '.join(d), fill=tint('#a5824c', L.k), stroke=L.ink(), strokeWidth=max(0.8, L.lw * 0.35))
    for ang in (-165, -140, -115, -90, -65, -40, -15):
        rad = math.radians(ang + r.uniform(-5, 5))
        Lf = size * r.uniform(0.9, 1.15)
        tip = (x + math.cos(rad) * Lf, base - h + math.sin(rad) * Lf * 0.7 + Lf * 0.25)
        mid = (x + math.cos(rad) * Lf * 0.5, base - h + math.sin(rad) * Lf * 0.55)
        L.line(smooth_d([(x, base - h), mid, tip], closed=False), '#355f2e', max(2, size * 0.03))
        leaves = []
        for t in [i / 9 for i in range(1, 9)]:
            p = lerp((x, base - h), mid, t * 2) if t < 0.5 else lerp(mid, tip, (t - 0.5) * 2)
            for s in (-1, 1):
                e = (p[0] + s * size * 0.1 + math.cos(rad) * size * 0.05, p[1] + size * 0.11)
                leaves.append(f'M{p[0]:.1f} {p[1]:.1f} Q{(p[0] + e[0]) / 2 + 4:.1f} {(p[1] + e[1]) / 2 - 3:.1f} {e[0]:.1f} {e[1]:.1f} Q{(p[0] + e[0]) / 2 - 4:.1f} {(p[1] + e[1]) / 2 + 3:.1f} {p[0]:.1f} {p[1]:.1f} Z')
        L.v.tool('draw_path', d=' '.join(leaves), fill=tint('#5a9a47', L.k), stroke=L.ink(), strokeWidth=max(0.8, L.lw * 0.3))


def fern_clump(L, x, base, size, colour='#4f8f52'):
    r = L.r
    for ang in [-85 + i * 22 + r.uniform(-8, 8) for i in range(8)]:
        rad = math.radians(ang - 90)
        Lf = size * r.uniform(0.7, 1.05)
        pts = [(x + math.cos(rad) * Lf * t + (t ** 2) * Lf * 0.3 * (1 if math.cos(rad) > 0 else -1), base + math.sin(rad) * Lf * t + (t ** 2) * Lf * 0.4) for t in [i / 8 for i in range(9)]]
        L.line(smooth_d(pts, closed=False), '#2f6a3e', max(1.5, size * 0.025))
        leaves = []
        for i in range(1, 8):
            (px, py), (qx, qy) = pts[i], pts[i + 1]
            ux, uy = qx - px, qy - py
            n = math.hypot(ux, uy) or 1
            nx, ny = -uy / n, ux / n
            ll = size * 0.13 * (1 - i / 9) + size * 0.03
            for s in (-1, 1):
                ex, ey = px + nx * s * ll + ux * 0.6, py + ny * s * ll + uy * 0.6
                leaves.append(f'M{px:.1f} {py:.1f} Q{(px + ex) / 2 + ux * 0.4:.1f} {(py + ey) / 2 + uy * 0.4:.1f} {ex:.1f} {ey:.1f} Q{(px + ex) / 2 - ux * 0.2:.1f} {(py + ey) / 2 - uy * 0.2:.1f} {px:.1f} {py:.1f} Z')
        L.v.tool('draw_path', d=' '.join(leaves), fill=tint(colour, L.k), stroke=L.ink(), strokeWidth=max(0.8, L.lw * 0.3))


def horsetails(L, x, base, height, n=7):
    r = L.r
    for i in range(n):
        xx = x + r.uniform(-30, 30)
        h = height * r.uniform(0.6, 1.0)
        lean = r.uniform(-12, 12)
        L.line(f'M{xx:.1f} {base} q{lean * 0.5:.1f} {-h * 0.5:.1f} {lean:.1f} {-h:.1f}', '#5c8a46', max(3, height * 0.035))
        rings = []
        for j in range(1, int(h / 16)):
            t = j * 16 / h
            px, py = xx + lean * t * t, base - h * t
            rings.append(f'M{px - 5:.1f} {py:.1f} h10')
            rings.append(f'M{px:.1f} {py:.1f} l-9 7 M{px:.1f} {py:.1f} l9 7')
        L.line(' '.join(rings), '#3a5e2c', 1.8)


def rock(L, x, base, w, h, moss=True):
    r = L.r
    pts = [(x - w / 2, base), (x - w * 0.45, base - h * 0.5), (x - w * 0.2, base - h), (x + w * 0.2, base - h * 0.95), (x + w * 0.48, base - h * 0.45), (x + w / 2, base)]
    L.fill(smooth_d(pts, tension=0.35), '#7d8290')
    L.fill(smooth_d([(x + w * 0.05, base), (x + w * 0.2, base - h * 0.9), (x + w * 0.48, base - h * 0.45), (x + w / 2, base)], tension=0.35), '#5f6370', outline=False)
    L.hatch(smooth_d([(x + w * 0.05, base), (x + w * 0.2, base - h * 0.9), (x + w * 0.48, base - h * 0.45), (x + w / 2, base)], tension=0.35), '#4a4d58', angle=55, spacing=6)
    if L.k < 0.6:
        L.line(f'M{x - w * 0.1:.1f} {base - h * 0.9:.1f} q{w * 0.08:.1f} {h * 0.3:.1f} {w * 0.02:.1f} {h * 0.6:.1f}', INK, 2.4)
    if moss:
        L.fill(smooth_d([(x - w * 0.42, base - h * 0.55), (x - w * 0.2, base - h * 1.02), (x + w * 0.18, base - h * 0.98), (x + w * 0.1, base - h * 0.8), (x - w * 0.15, base - h * 0.78), (x - w * 0.35, base - h * 0.4)], tension=0.4), '#6a8a3e')
        L.hatch(smooth_d([(x - w * 0.4, base - h * 0.55), (x - w * 0.2, base - h * 1.0), (x + w * 0.15, base - h * 0.96), (x - w * 0.3, base - h * 0.45)], tension=0.4), '#8fb055', angle=15, spacing=5)


# ------------------------------------------------------------------ the layers
def far_ridge(out):
    L = Layer(0.82, 101)
    # distant volcanic ridge and rock spires, barely there
    pts = [(-10, 1080), (-10, 520)]
    x = 0
    while x < W + 60:
        pts.append((x, 470 + 60 * math.sin(x / 260) + 40 * math.sin(x / 97) + L.r.uniform(-10, 10)))
        x += 60
    pts += [(W + 10, 1080)]
    L.fill(smooth_d(pts, tension=0.3), '#8a8fb0', outline=False)
    for (x, h, w) in ((300, 230, 70), (520, 160, 50), (1700, 260, 80), (1950, 190, 60), (2250, 150, 50)):
        L.fill(smooth_d([(x - w, 560), (x - w * 0.6, 560 - h * 0.7), (x - w * 0.2, 560 - h), (x + w * 0.3, 560 - h * 0.92), (x + w * 0.7, 560 - h * 0.5), (x + w, 560)], tension=0.35), '#8e92b2', outline=False)
    # a volcano venting a thin plume
    L.fill(smooth_d([(1180, 560), (1300, 380), (1360, 372), (1480, 560)], tension=0.25), '#878bab', outline=False)
    band = []
    x = -20
    while x < W + 40:
        hh = L.r.uniform(40, 110)
        band += [(x, 600), (x + 10, 600 - hh * 0.6), (x + 22, 600 - hh), (x + 34, 600 - hh * 0.55), (x + 44, 600)]
        x += L.r.uniform(30, 60)
    L.fill(pts_d([(-20, 1080)] + band + [(W + 40, 1080)]), '#7f8ea0', outline=False)
    L.save(os.path.join(out, 'jFar.svg'))


def far_forest(out):
    L = Layer(0.62, 202)
    L.fill(smooth_d([(-10, 1080), (-10, 640), (400, 620), (900, 650), (1400, 630), (1900, 655), (W + 10, 630), (W + 10, 1080)], tension=0.3), '#4f6e62', outline=False)
    x = -40
    while x < W + 80:
        h = L.r.uniform(240, 380)
        if L.r.random() < 0.45:
            araucaria(L, x, 680, h, h * 0.45)
        else:
            conifer_spire(L, x, 690, h * 1.05, h * 0.22)
        x += L.r.uniform(70, 150)
    L.save(os.path.join(out, 'jForestFar.svg'))


def mid_forest(out):
    L = Layer(0.38, 303)
    L.fill(smooth_d([(-10, 1080), (-10, 760), (500, 740), (1100, 770), (1700, 745), (W + 10, 760), (W + 10, 1080)], tension=0.3), '#466a4c', outline=False)
    for x in (80, 330, 1880, 2150):
        h = L.r.uniform(520, 640)
        araucaria(L, x, 790, h, h * 0.42)
    for x in (560, 760, 1500, 1700, 2320):
        tree_fern(L, x, 800, L.r.uniform(170, 240), L.r.uniform(120, 160), lean=L.r.uniform(-20, 20))
    for x in (230, 980, 1320, 2000):
        horsetails(L, x, 800, 90, n=6)
    for x in range(0, W, 120):
        fern_clump(L, x + L.r.uniform(-30, 30), 805, L.r.uniform(50, 80))
    L.save(os.path.join(out, 'jForestMid.svg'))


def river(out):
    L = Layer(0.12, 404)
    # mossy ground from the mid distance to the bottom of frame
    L.fill(smooth_d([(-10, 1080), (-10, 760), (600, 748), (1200, 760), (1800, 746), (W + 10, 758), (W + 10, 1080)], tension=0.3), '#4a5c34', outline=False)
    L.hatch(smooth_d([(-10, 1080), (-10, 770), (1200, 772), (W + 10, 768), (W + 10, 1080)], tension=0.3), '#4a5a30', angle=6, spacing=6)
    # patches of bare damp earth and leaf litter
    for i in range(18):
        x = L.r.uniform(0, W); y = L.r.uniform(790, 1060); w = L.r.uniform(60, 160) * (y - 700) / 300; h = w * 0.22
        L.fill(smooth_d([(x - w, y), (x - w * 0.4, y - h), (x + w * 0.5, y - h * 0.8), (x + w, y), (x, y + h * 0.6)], tension=0.4), '#6e5a3c', outline=False)
        L.hatch(smooth_d([(x - w, y), (x, y - h), (x + w, y), (x, y + h * 0.6)], tension=0.4), '#4f3f28', angle=10, spacing=5)
    # the stream: wide at the bottom, winding back and narrowing into the mist
    centre = [(1250, 1090), (1150, 990), (1020, 920), (980, 860), (1060, 815), (1180, 785), (1240, 768)]
    widths = [520, 430, 330, 240, 160, 90, 40]
    left = [(x - w / 2, y) for (x, y), w in zip(centre, widths)]
    right = [(x + w / 2, y) for (x, y), w in zip(centre, widths)][::-1]
    L.fill(smooth_d(left + right, tension=0.35), '#4f7f90')
    inner_l = [(x - w * 0.32, y) for (x, y), w in zip(centre, widths)]
    inner_r = [(x + w * 0.12, y) for (x, y), w in zip(centre, widths)][::-1]
    L.fill(smooth_d(inner_l + inner_r, tension=0.35), '#8fbccb', outline=False)  # sky reflection
    L.fill(smooth_d([(x + w * 0.2, y) for (x, y), w in zip(centre, widths)] + [(x + w * 0.45, y) for (x, y), w in zip(centre, widths)][::-1], tension=0.35), '#3d6676', outline=False)  # bank shadow
    ripples = []
    for i in range(40):
        t = L.r.uniform(0, 0.95)
        k = int(t * (len(centre) - 1)); f = t * (len(centre) - 1) - k
        cx, cy = lerp(centre[k], centre[k + 1], f); w = widths[k] + (widths[k + 1] - widths[k]) * f
        x = cx + L.r.uniform(-w * 0.35, w * 0.35); rw = w * L.r.uniform(0.05, 0.14)
        ripples.append(f'M{x - rw:.1f} {cy:.1f} q{rw:.1f} -3 {2 * rw:.1f} 0')
    L.line(' '.join(ripples), '#e6f2f5', 2.4, opacity=85)
    # foam and pebbles along both shorelines
    for side in (left, right):
        L.line(smooth_d(side, closed=False), '#e6f2f5', 3, opacity=70)
        for (x, y) in side[:-1]:
            for j in range(4):
                px = x + L.r.uniform(-30, 30); py = y + L.r.uniform(-10, 10); r = L.r.uniform(4, 10) * (py - 700) / 300
                L.fill(f'M{px - r:.1f} {py:.1f} a{r:.1f} {r * 0.7:.1f} 0 1 0 {2 * r:.1f} 0 a{r:.1f} {r * 0.7:.1f} 0 1 0 {-2 * r:.1f} 0 Z', '#8a8e98', lw=1.6, rough=0.3)
    # exposed roots dipping into the water on the left bank
    for (x, y) in ((900, 900), (960, 960)):
        L.line(f'M{x} {y} q30 10 50 40 M{x + 10} {y + 4} q10 20 4 46', INK, 9)
        L.line(f'M{x} {y} q30 10 50 40 M{x + 10} {y + 4} q10 20 4 46', '#6b4428', 5)
    L.save(os.path.join(out, 'jRiver.svg'))


def props(out):
    """Detailed single assets, each in its own box with its base point noted (for placing in Remotion)."""
    def make(name, w, h, fn, seed):
        L = Layer(0.0, seed, w, h)
        fn(L)
        L.save(os.path.join(out, f'{name}.svg'))
    make('pTreeFernA', 700, 900, lambda L: tree_fern(L, 350, 890, 520, 300, lean=20), 701)
    make('pTreeFernB', 700, 900, lambda L: tree_fern(L, 350, 890, 420, 260, lean=-30), 702)
    make('pCycad', 600, 560, lambda L: cycad(L, 300, 550, 300), 703)
    make('pFernA', 560, 320, lambda L: fern_clump(L, 280, 315, 200), 704)
    make('pFernB', 560, 320, lambda L: fern_clump(L, 280, 315, 170, colour='#3f7f4a'), 705)
    make('pHorsetail', 400, 440, lambda L: horsetails(L, 200, 435, 320, n=11), 706)
    make('pRockA', 520, 280, lambda L: rock(L, 260, 275, 440, 210), 707)
    make('pRockB', 360, 200, lambda L: rock(L, 180, 195, 300, 130), 708)
    def log(L):
        logp = [(40, 150), (400, 128), (800, 132), (1180, 150), (1176, 210), (800, 196), (400, 192), (50, 206)]
        L.fill(smooth_d(logp, tension=0.3), '#6b4a2c')
        L.hatch(smooth_d([(50, 180), (400, 160), (800, 166), (1176, 190), (800, 196), (400, 192), (50, 206)], tension=0.3), '#4a3018', angle=4, spacing=5)
        bark = ' '.join(f'M{x} {150 + (x % 13):.0f} l{40 + x % 30} {-2 + x % 5}' for x in range(80, 1120, 70))
        L.line(bark, '#3d2716', 2.6)
        L.fill('M1172 150 a16 30 0 1 0 8 60 a16 30 0 1 0 -8 -60 Z', '#c99a64')
        L.line('M1174 162 a9 18 0 1 0 4 36 a9 18 0 1 0 -4 -36 M1175 172 a4 8 0 1 0 2 16', '#a87443', 2.4)
        L.fill(smooth_d([(60, 152), (300, 128), (600, 122), (900, 130), (1150, 150), (1100, 162), (900, 146), (600, 140), (300, 146), (80, 170)], tension=0.35), '#6a8a3e')
        L.hatch(smooth_d([(60, 152), (600, 124), (1150, 150), (900, 146), (300, 146), (80, 170)], tension=0.35), '#8fb055', angle=10, spacing=4)
        for x in (180, 430, 690, 950):
            fern_clump(L, x, 140, 70)
        strands = ' '.join(f'M{x} {200 + (x % 11):.0f} q3 {18 + x % 17} -2 {34 + x % 23}' for x in range(90, 1150, 38))
        L.line(strands, '#6a8a3e', 3.2)
    make('pLog', 1240, 300, log, 709)


def near_ground(out):
    L = Layer(0.0, 505)
    for (x, w, h) in ((120, 260, 120), (2280, 300, 140), (700, 140, 60)):
        rock(L, x, 1080, w, h)
    cycad(L, 360, 1080, 230)
    cycad(L, 2030, 1080, 200)
    horsetails(L, 560, 1080, 170, n=9)
    horsetails(L, 1800, 1080, 150, n=8)
    for x in (40, 230, 470, 640, 830, 1620, 1760, 1960, 2180, 2370):
        fern_clump(L, x, 1080, L.r.uniform(110, 170), colour='#4a8a4e' if x % 2 else '#56985a')
    L.save(os.path.join(out, 'jNear.svg'))


def foreground(out):
    """Dark framing: tree-fern fronds hanging from the top corners and big fern leaves at the bottom."""
    L = Layer(0.0, 606)
    dark = '#14261e'
    def frond(base, ang, length, width, droop):
        rad = math.radians(ang)
        tip = (base[0] + math.cos(rad) * length, base[1] + math.sin(rad) * length + droop)
        mid = (base[0] + math.cos(rad) * length * 0.5, base[1] + math.sin(rad) * length * 0.5 + droop * 0.2)
        L.v.tool('draw_path', d=smooth_d([base, mid, tip], closed=False), fill='none', stroke=dark, strokeWidth=width * 0.18, cap='round')
        leaves = []
        for i in range(1, 22):
            t = i / 22
            p = lerp(base, mid, t * 2) if t < 0.5 else lerp(mid, tip, (t - 0.5) * 2)
            q = lerp(base, mid, (t + 0.03) * 2) if t < 0.5 else lerp(mid, tip, min(1, (t + 0.03 - 0.5) * 2))
            ux, uy = q[0] - p[0], q[1] - p[1]
            n = math.hypot(ux, uy) or 1
            nx, ny = -uy / n, ux / n
            ll = width * (1 - t * 0.75)
            for s in (-1, 1):
                ex, ey = p[0] + nx * s * ll + ux * 1.5, p[1] + ny * s * ll + uy * 1.5 + ll * 0.5
                leaves.append(f'M{p[0]:.1f} {p[1]:.1f} Q{(p[0] + ex) / 2 + ux:.1f} {(p[1] + ey) / 2 + uy:.1f} {ex:.1f} {ey:.1f} Q{(p[0] + ex) / 2 - ux * 0.3:.1f} {(p[1] + ey) / 2 - uy * 0.3:.1f} {p[0]:.1f} {p[1]:.1f} Z')
        L.v.tool('draw_path', d=' '.join(leaves), fill=dark, stroke='#0b150f', strokeWidth=1.5)
    for (b, ang, l, w, dr) in (((0, -20), 40, 620, 46, 160), ((-40, 120), 20, 520, 40, 200), ((120, -40), 70, 480, 38, 60),
                               ((-60, 300), 10, 460, 40, 160), ((260, -60), 80, 380, 34, 40), ((60, -40), 55, 560, 42, 120),
                               ((W, -20), 140, 640, 46, 160), ((W + 40, 140), 160, 520, 40, 200), ((W - 140, -40), 110, 470, 38, 60),
                               ((W + 60, 300), 170, 460, 40, 160), ((W - 260, -60), 100, 380, 34, 40), ((W - 60, -40), 125, 560, 42, 120)):
        frond(b, ang, l, w, dr)
    # climbing-fern strands hanging from the top
    for x in (420, 520, 1930, 2050, 2140):
        L.v.tool('draw_path', d=f'M{x} -10 q{L.r.uniform(-30, 30):.1f} 160 {L.r.uniform(-20, 20):.1f} {L.r.uniform(240, 380):.1f}', fill='none', stroke=dark, strokeWidth=5, cap='round')
    for (b, ang, l, w, dr) in (((-60, 1120), -40, 520, 44, -40), ((W + 60, 1120), -140, 520, 44, -40),
                               ((-40, 1140), -20, 600, 48, -20), ((W + 40, 1140), -160, 600, 48, -20), ((240, 1140), -70, 420, 40, -10), ((W - 240, 1140), -110, 420, 40, -10)):
        frond(b, ang, l, w, dr)
    L.save(os.path.join(out, 'jFront.svg'))


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for fn in (far_ridge, river, props, foreground):
        fn(out)
        print(fn.__name__, 'ok')
