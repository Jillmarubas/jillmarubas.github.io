"""A detailed Jurassic monkey-puzzle tree (Araucaria; its cones are known from Jurassic fossils,
e.g. Araucaria mirabilis), drawn in VectorCraft. A still illustration, not a rig.

What makes it detailed:
  - trunk: taper, flared buttress roots, bark ring scars and scale marks, light from the upper left,
    moss at the foot
  - crown: whorls of branches pointing in every direction; branches behind the trunk are darker
    (depth), branches in front lighter with sunlit top edges
  - each branch carries rope-like branchlets covered in overlapping scale-leaves; tips curl upward
  - round cones near the top, crayon shading on the undersides
  - ground: a cycad and ferns (no grass in the Jurassic), rocks, a soft shadow
Usage (from remotion/): python3 scripts/vectorcraft/tree_detailed.py <out_dir>
"""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vc import VC
from art import Artist, smooth_d, pts_d, lerp, INK

W, H = 1200, 1600
CX = 600
BARK, BARK_D, BARK_L, BARK_X = '#6b4428', '#4a2c18', '#8f6038', '#3a2212'
MOSS, MOSS_L = '#5f7f3a', '#86a64e'
FRONT = dict(rope='#2c5747', scale='#4a8266', lit='#76aa86', shade='#1f3d33')
BACK = dict(rope='#1f3b31', scale='#2f5545', lit='#3e6a58', shade='#162a22')
rng = random.Random(7)


def trunk_half(y):
    """Trunk half-width at height y (flares at the base, thin at the top)."""
    t = (1540 - y) / (1540 - 220)
    w = 16 + 52 * (1 - t) ** 1.3
    if y > 1440:
        w += (y - 1440) ** 1.6 * 0.12
    return w


def trunk_x(y):
    return CX + math.sin((1540 - y) / 520) * 10  # a gentle lean


def poly_curve(fn, t0, t1, n):
    return [fn(t0 + (t1 - t0) * i / n) for i in range(n + 1)]


def tube(a, pts, width, colors, lw=3.0):
    """A rope of foliage: ink outline, green core, lit top edge, scale-leaf chevrons."""
    d = smooth_d(pts, closed=False, tension=0.5)
    a.v.tool('draw_path', d=d, fill='none', stroke=INK, strokeWidth=width + lw * 2, cap='round', join='round',
             effects=[a._rough(0.8, 6)])
    a.v.tool('draw_path', d=d, fill='none', stroke=colors['rope'], strokeWidth=width, cap='round', join='round')
    # underside shade and sunlit top edge
    sh = [(x + 1, y + width * 0.22) for x, y in pts]
    lt = [(x - 1, y - width * 0.26) for x, y in pts]
    a.v.tool('draw_path', d=smooth_d(sh, closed=False), fill='none', stroke=colors['shade'], strokeWidth=width * 0.45, cap='round')
    a.v.tool('draw_path', d=smooth_d(lt, closed=False), fill='none', stroke=colors['lit'], strokeWidth=max(1.5, width * 0.18), cap='round')


def chevrons(pts, width, spacing):
    """Overlapping scale-leaves: little Vs pointing toward the tip, returned as one path string."""
    out = []
    acc = 0.0
    for i in range(1, len(pts)):
        (x0, y0), (x1, y1) = pts[i - 1], pts[i]
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg == 0:
            continue
        ux, uy = (x1 - x0) / seg, (y1 - y0) / seg
        nx, ny = -uy, ux
        s = spacing - acc
        while s < seg:
            px, py = x0 + ux * s, y0 + uy * s
            h = width * 0.42
            out.append(f'M{px + nx * h - ux * 4:.1f} {py + ny * h - uy * 4:.1f} L{px + ux * 2:.1f} {py + uy * 2:.1f} L{px - nx * h - ux * 4:.1f} {py - ny * h - uy * 4:.1f}')
            s += spacing
        acc = seg - (s - spacing)
    return ' '.join(out)


def branch(a, x0, y0, ang, L, colors, scale_paths, depth):
    """One limb from the whorl: out, sagging, tip curling up, with hanging rope branchlets."""
    cx = math.cos(ang)
    D = 0.22 * L
    U = 0.30 * L
    def centre(t):
        x = x0 + L * cx * t
        y = y0 + D * math.sin(math.pi * t * 0.85) - U * t ** 3 + depth * 26 * t
        return (x, y)
    pts = poly_curve(centre, 0, 1, 16)
    width = 14 + 6 * (L / 460)
    # branchlets first (they hang below the limb)
    n = max(2, int(L / 34))
    side = 1 if cx >= 0 else -1
    ts = sorted(rng.uniform(0.12, 0.92) for _ in range(n))
    for k, t in enumerate(ts):
        bx, by = centre(t)
        bl = rng.uniform(34, 70) * (0.6 + 0.4 * (1 - t))
        lean = side * rng.uniform(4, 30)
        if rng.random() < 0.4:
            # an upward branchlet curving out and up over the limb
            bpts = [(bx, by), (bx + lean * 0.7, by - bl * 0.45), (bx + lean * 1.2, by - bl * 0.7), (bx + lean * 1.1, by - bl * 0.95)]
        else:
            # a hanging branchlet whose tip turns up
            bpts = [(bx, by), (bx + lean * 0.5, by + bl * 0.55), (bx + lean, by + bl * 0.85), (bx + lean * 1.4, by + bl * 0.7)]
        tube(a, bpts, width * 0.62, colors, lw=2.4)
        scale_paths.append(chevrons(bpts, width * 0.62, 7))
    tube(a, pts, width, colors)
    scale_paths.append(chevrons(pts, width, 8))
    # a tuft at the upturned tip
    tx, ty = pts[-1]
    tuft = [(tx, ty), (tx + cx * 10, ty - 22), (tx + cx * 4, ty - 40)]
    tube(a, tuft, width * 0.7, colors, lw=2.4)
    scale_paths.append(chevrons(tuft, width * 0.7, 7))
    return pts[-1]


def crown(a, front):
    """Whorls from the top down; returns cone positions (top whorls)."""
    cones = []
    whorls = 11
    for i in range(whorls):
        y = 250 + i * 55
        t = i / (whorls - 1)
        L = 110 + 360 * math.sin(math.pi * 0.5 * min(1, t * 1.15))
        k = 7
        offset = i * 0.83 + rng.uniform(-0.2, 0.2)
        scale_paths = []
        colors = FRONT if front else BACK
        items = []
        for j in range(k):
            ang = offset + j * 2 * math.pi / k
            depth = math.sin(ang)
            if (depth >= -0.05) != front:
                continue
            if front and abs(math.cos(ang)) < 0.42:
                continue
            items.append((depth, ang))
        items.sort()  # far ones first within the set
        for depth, ang in items:
            tip = branch(a, trunk_x(y), y, ang, L * (0.75 + 0.25 * abs(math.cos(ang))) * rng.uniform(0.85, 1.1), colors, scale_paths, depth)
            if front and 1 <= i <= 4 and rng.random() < 0.5:
                cones.append(tip)
        d = ' '.join(p for p in scale_paths if p)
        if d:
            a.v.tool('draw_path', d=d, fill='none', stroke=colors['scale'], strokeWidth=2.2, cap='round', join='round')
    return cones


def trunk(a):
    ys = list(range(1560, 214, -20))
    left = [(trunk_x(y) - trunk_half(y), y) for y in ys]
    right = [(trunk_x(y) + trunk_half(y), y) for y in reversed(ys)]
    a.shape(smooth_d(left + right, tension=0.3), BARK, lw=5)
    # light from the upper left: lit strip on the left, shadow on the right
    a.shape(smooth_d([(trunk_x(y) + trunk_half(y) * 0.25, y) for y in ys] + right, tension=0.3), BARK_D, stroke=False, rough=1.5)
    a.hatch(smooth_d([(trunk_x(y) + trunk_half(y) * 0.45, y) for y in ys] + right, tension=0.3), BARK_X, angle=75, spacing=7, width=2, opacity=60)
    a.shape(smooth_d([(trunk_x(y) - trunk_half(y) * 0.8, y) for y in ys] + [(trunk_x(y) - trunk_half(y) * 0.45, y) for y in reversed(ys)], tension=0.3), BARK_L, stroke=False, rough=1)
    # ring scars where old branches fell: arcs that wrap round the cylinder
    rings = []
    for y in range(860, 1460, 38):
        w = trunk_half(y); x = trunk_x(y)
        yy = y + rng.uniform(-6, 6)
        rings.append(f'M{x - w * 0.92:.1f} {yy:.1f} Q{x:.1f} {yy + w * 0.28:.1f} {x + w * 0.92:.1f} {yy:.1f}')
    a.v.tool('draw_path', d=' '.join(rings), fill='none', stroke=BARK_X, strokeWidth=3.2, cap='round', effects=[a._rough(0.8, 8)])
    # scale marks between the rings (staggered little lens strokes)
    marks = []
    for y in range(260, 1500, 16):
        w = trunk_half(y); x = trunk_x(y)
        for k in range(-2, 3):
            if rng.random() < 0.55:
                px = x + k * w * 0.36 + (8 if (y // 16) % 2 else 0) * (w / 60)
                if abs(px - x) < w * 0.85:
                    marks.append(f'M{px - 4:.1f} {y:.1f} q4 3 8 0')
    a.v.tool('draw_path', d=' '.join(marks), fill='none', stroke=BARK_X, strokeWidth=2, cap='round', opacity=75)
    # knots
    for (y, s) in ((1010, 1), (1230, -1), (1360, 1)):
        x = trunk_x(y) + s * trunk_half(y) * 0.3
        a.shape(f'M{x - 9} {y} a9 6 0 1 0 18 0 a9 6 0 1 0 -18 0 Z', BARK_D, lw=3, rough=0.5, detail=30)
        a.shape(f'M{x - 4} {y} a4 2.6 0 1 0 8 0 a4 2.6 0 1 0 -8 0 Z', BARK_X, stroke=False, rough=0)
    # buttress roots
    for (dx, L, s) in ((-1, 150, 0.9), (-0.4, 90, 0.6), (0.5, 110, 0.7), (1, 160, 1.0)):
        x0 = trunk_x(1470) + dx * trunk_half(1470) * 0.8
        root = [(x0 - 18, 1470), (x0 + dx * L * 0.5, 1530), (x0 + dx * L, 1566), (x0 + dx * L * 0.45, 1570), (x0 + 18, 1500)]
        a.shape(smooth_d(root, tension=0.4), BARK if dx < 0 else BARK_D, lw=4.5)
    # moss: low patches hugging the left roots and the foot of the trunk
    for (x, y, w, h) in ((trunk_x(1500) - 70, 1528, 70, 22), (trunk_x(1480) - 120, 1552, 60, 16)):
        patch = [(x - w / 2, y + h / 2), (x - w / 3, y - h / 2), (x, y - h * 0.6), (x + w / 3, y - h * 0.4), (x + w / 2, y + h / 2)]
        a.shape(smooth_d(patch, tension=0.4), MOSS, lw=3)
        a.hatch(smooth_d(patch, tension=0.4), MOSS_L, angle=20, spacing=5, width=2, opacity=85)


def cone(a, x, y):
    # big round seed cone with diamond scales
    r = 27
    a.shape(f'M{x - r} {y} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', '#8a7a3a', lw=3.5, rough=0.6, detail=30)
    d = []
    for k in range(-3, 4):
        d.append(f'M{x - r * 0.9:.1f} {y + k * 6:.1f} Q{x:.1f} {y + k * 6 - 6:.1f} {x + r * 0.9:.1f} {y + k * 6:.1f}')
        d.append(f'M{x + k * 6:.1f} {y - r * 0.9:.1f} Q{x + k * 6 + 6:.1f} {y:.1f} {x + k * 6:.1f} {y + r * 0.9:.1f}')
    a.v.tool('draw_path', d=' '.join(d), fill='none', stroke='#5e5226', strokeWidth=1.8, opacity=85)
    a.shape(f'M{x - r * 0.55} {y - r * 0.4} a{r * 0.3} {r * 0.2} 0 1 0 {r * 0.6} 0 a{r * 0.3} {r * 0.2} 0 1 0 {-r * 0.6} 0 Z', '#c8b56a', stroke=False, rough=0)


def ground(a):
    a.shape(smooth_d([(150, 1600), (220, 1556), (420, 1540), (600, 1548), (820, 1538), (1000, 1552), (1060, 1600)], closed=False, tension=0.4) + ' Z', '#7a6244', lw=4)
    a.hatch(smooth_d([(160, 1600), (420, 1556), (820, 1556), (1050, 1600)], tension=0.4), '#5e4a32', angle=10, spacing=6, width=2, opacity=70)
    a.v.tool('draw_path', d='M200 1560 Q600 1530 1020 1560 Q600 1600 200 1560 Z', fill='#2a3a20', stroke='none', opacity=35)
    for (x, y, s) in ((380, 1556, 30), (840, 1560, 24), (930, 1552, 14)):
        a.shape(smooth_d([(x - s, y + 6), (x - s * 0.7, y - s * 0.6), (x + s * 0.3, y - s * 0.8), (x + s, y + 6)]), '#80848f', lw=3.5)
        a.shape(smooth_d([(x - s * 0.6, y - s * 0.4), (x + s * 0.2, y - s * 0.7), (x + s * 0.6, y - s * 0.2), (x, y - s * 0.3)]), '#a3a7b0', stroke=False, rough=0.8)


def fern(a, x, y, size, flip=1):
    """Arching fern fronds with paired leaflets."""
    for k, ang in enumerate((-80, -58, -36, -14, 8, 30, 52)):
        r = math.radians(ang - 90)
        L = size * (0.8 + 0.25 * math.cos(math.radians(ang)))
        pts = [(x + flip * math.cos(r) * L * t + flip * (t ** 2) * L * 0.25 * math.copysign(1, math.cos(r) or 1), y + math.sin(r) * L * t + (t ** 2) * L * 0.35) for t in [i / 8 for i in range(9)]]
        a.stroke(smooth_d(pts, closed=False), color='#2f6a3e', lw=4, profile=None, rough=False)
        leaves = []
        for i in range(1, 8):
            (px, py), (qx, qy) = pts[i], pts[i + 1]
            ux, uy = qx - px, qy - py
            n = math.hypot(ux, uy) or 1
            nx, ny = -uy / n, ux / n
            ll = 14 * (1 - i / 9) + 4
            for s in (-1, 1):
                tipx, tipy = px + nx * s * ll + ux * 0.6, py + ny * s * ll + uy * 0.6
                leaves.append(f'M{px:.1f} {py:.1f} Q{px + nx * s * ll * 0.5 + ux * 0.9:.1f} {py + ny * s * ll * 0.5 + uy * 0.9:.1f} {tipx:.1f} {tipy:.1f} Q{px + nx * s * ll * 0.5 - ux * 0.1:.1f} {py + ny * s * ll * 0.5 - uy * 0.1:.1f} {px:.1f} {py:.1f} Z')
        a.v.tool('draw_path', d=' '.join(leaves), fill='#4f8f52', stroke='#24502f', strokeWidth=1.6)


def cycad(a, x, y):
    """Stout cycad: a scaly pineapple-like trunk with a crown of stiff fronds."""
    trunk_pts = [(x - 40, y), (x - 44, y - 80), (x - 30, y - 150), (x + 30, y - 150), (x + 44, y - 80), (x + 40, y)]
    a.shape(smooth_d(trunk_pts, tension=0.3), '#8a6a3e', lw=4.5)
    d = []
    for row in range(8):
        yy = y - 12 - row * 17
        for k in range(-2, 3):
            xx = x + k * 16 + (8 if row % 2 else 0)
            if abs(xx - x) < 38:
                d.append(f'M{xx - 8:.1f} {yy:.1f} L{xx:.1f} {yy - 8:.1f} L{xx + 8:.1f} {yy:.1f} L{xx:.1f} {yy + 8:.1f} Z')
    a.v.tool('draw_path', d=' '.join(d), fill='#a5824c', stroke=INK, strokeWidth=1.8)
    a.shape(smooth_d([(x + 10, y), (x + 40, y), (x + 44, y - 80), (x + 30, y - 150), (x + 14, y - 150)], tension=0.3), '#5e4626', stroke=False, rough=1, opacity=55)
    for ang in (-160, -130, -100, -75, -50, -20):
        r = math.radians(ang)
        L = 150
        tip = (x + math.cos(r) * L, y - 150 + math.sin(r) * L * 0.75)
        mid = (x + math.cos(r) * L * 0.5, y - 150 + math.sin(r) * L * 0.6 - 20)
        a.stroke(smooth_d([(x, y - 150), mid, tip], closed=False), color='#3c6b33', lw=5, profile=None, rough=False)
        leaves = []
        pts = [lerp((x, y - 150), mid, t) for t in (0.3, 0.6, 0.9)] + [lerp(mid, tip, t) for t in (0.3, 0.6, 0.9)]
        for (px, py) in pts:
            for s in (-1, 1):
                tx, ty = px + s * 16 + math.cos(r) * 10, py + 18 + math.sin(r) * 4
                leaves.append(f'M{px:.1f} {py:.1f} Q{(px + tx) / 2 + 5:.1f} {(py + ty) / 2 - 4:.1f} {tx:.1f} {ty:.1f} Q{(px + tx) / 2 - 5:.1f} {(py + ty) / 2 + 4:.1f} {px:.1f} {py:.1f} Z')
        a.v.tool('draw_path', d=' '.join(leaves), fill='#5a9a47', stroke='#24502f', strokeWidth=1.6)


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    v = VC()
    a = Artist(v, W, H, 5, seed=1234)
    crown(a, front=False)         # branches behind the trunk
    trunk(a)
    cones = crown(a, front=True)  # branches in front
    leader = [(trunk_x(250), 250), (trunk_x(210) + 2, 205), (trunk_x(180) - 2, 168), (trunk_x(160), 150)]
    tube(a, leader, 18, FRONT)
    a.v.tool('draw_path', d=chevrons(leader, 18, 8), fill='none', stroke=FRONT['scale'], strokeWidth=2.2)
    for (x, y) in cones[:4]:
        cone(a, x, y - 26)
    ground(a)
    fern(a, 330, 1560, 150)
    fern(a, 900, 1566, 130, flip=-1)
    cycad(a, 220, 1580)
    fern(a, 760, 1580, 100)
    v.tool('export', path=os.path.join(out, 'jurassicTree.svg'))
    v.tool('export', path=os.path.join(out, 'jurassicTree.png'), options={"background": "transparent", "rect": [0, 0, W, H], "ppi": 72})
    v.close()
    print('ok', os.path.getsize(os.path.join(out, 'jurassicTree.svg')))
