"""Close-up assets for the over-the-shoulder shot, drawn in VectorCraft at full detail.

  cuDiploHead.svg   (1400 x 1000) a Diplodocus head and neck lowering from the upper right, chewing a
                    monkey-puzzle branchlet. Square snout, peg teeth only at the front of the jaws (fossil),
                    polygonal scales and a speckled pattern (fossil skin + melanosomes), midline spines
                    (keratin spines are known in diplodocids), skin folds on the neck. Colours: a guess,
                    countershaded. Light from the upper right (rim light), crayon shading underneath.
  cuTravelerBack.svg (900 x 1000) the time traveler from behind: messy hair, hood, yellow hoodie with
                    folds, brown backpack with flap, buckles and stitching. Same locked colours as
                    TimeTraveler.tsx.
Usage (from remotion/): python3 scripts/vectorcraft/closeup.py public/timetraveler/closeup
"""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vc import VC
from art import Artist, smooth_d, pts_d, lerp, INK
import tree_detailed as td

rng = random.Random(42)


def inside(poly, x, y):
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]; xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi):
            c = not c
        j = i
    return c


def scale_cells(a, poly, size, shade_fn, outline='#6a6555', margin=0.9):
    """Irregular polygonal scales: a hex grid whose shared corners are jittered the same way,
    so the cells tile without gaps. Each cell is coloured by shade_fn(x, y)."""
    jit = {}
    def corner(x, y):
        key = (round(x, 1), round(y, 1))
        if key not in jit:
            h = random.Random(hash(key))
            jit[key] = (x + h.uniform(-size * 0.18, size * 0.18), y + h.uniform(-size * 0.18, size * 0.18))
        return jit[key]
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    groups = {}
    hstep = size * math.sqrt(3)
    row = 0
    y = min(ys)
    while y < max(ys) + size:
        x = min(xs) + (hstep / 2 if row % 2 else 0)
        while x < max(xs) + size:
            pts = [corner(x + size * math.cos(math.pi / 3 * k + math.pi / 6), y + size * math.sin(math.pi / 3 * k + math.pi / 6)) for k in range(6)]
            if all(inside(poly, px, py) for px, py in pts):
                c = shade_fn(x, y)
                groups.setdefault(c, []).append(pts_d([(lerp((x, y), p, margin)) for p in pts]))
            x += hstep
        y += size * 1.5
        row += 1
    for c, ds in groups.items():
        a.v.tool('draw_path', d=' '.join(ds), fill=c, stroke=outline, strokeWidth=1.0, opacity=92)


# ------------------------------------------------------------------ Diplodocus head and neck
DI = dict(dorsal='#76705e', side='#958f7a', belly='#d6ccb3', speckL='#c9bfa4', speckD='#4f4b3f', rim='#f4ecd2', spine='#b6ad92', eye='#d79a3a')


def diplo_head(out):
    v = VC(); a = Artist(v, 1400, 1000, 6, seed=88)
    # neck: centreline from the upper right down to the back of the skull, widths growing toward the body
    centre = [(1460, 40), (1300, 110), (1150, 210), (1010, 330), (910, 440), (830, 520)]
    widths = [300, 285, 262, 240, 220, 205]
    def edge(sign):
        out_pts = []
        for i, ((x, y), w) in enumerate(zip(centre, widths)):
            (x0, y0) = centre[max(0, i - 1)]; (x1, y1) = centre[min(len(centre) - 1, i + 1)]
            ux, uy = x1 - x0, y1 - y0
            n = math.hypot(ux, uy) or 1
            nx, ny = uy / n, -ux / n  # left normal (toward the top of the neck)
            out_pts.append((x + nx * w / 2 * sign, y + ny * w / 2 * sign))
        return out_pts
    top = edge(1); bot = edge(-1)
    neck = top + bot[::-1]
    # spines along the top of the neck (behind the outline)
    sp = []
    for i in range(len(top) - 1):
        for t in (0.15, 0.5, 0.85):
            p = lerp(top[i], top[i + 1], t); q = lerp(top[i], top[i + 1], t + 0.18)
            hgt = 52 * (1 - (i + t) / len(top)) + 16
            sp.append(f'M{p[0]:.1f} {p[1]:.1f} L{(p[0] + q[0]) / 2 - 6:.1f} {(p[1] + q[1]) / 2 - hgt:.1f} L{q[0]:.1f} {q[1]:.1f} Z')
    v.tool('draw_path', d=' '.join(sp), fill=DI['spine'], stroke=INK, strokeWidth=4, effects=[a._rough(0.8, 8)])
    a.shape(smooth_d(neck, tension=0.35), DI['side'], lw=7)
    # countershading: pale belly band along the underside, dark band along the back
    a.shape(smooth_d(bot + [lerp(b, t, 0.3) for b, t in zip(bot, top)][::-1], tension=0.35), DI['belly'], stroke=False, rough=2)
    a.shape(smooth_d(top + [lerp(t, b, 0.28) for t, b in zip(top, bot)][::-1], tension=0.35), DI['dorsal'], stroke=False, rough=2)

    def neck_shade(x, y):
        # which band is this point in? project onto the nearest centreline segment
        best = None
        for i in range(len(centre) - 1):
            (x0, y0), (x1, y1) = centre[i], centre[i + 1]
            ux, uy = x1 - x0, y1 - y0
            L2 = ux * ux + uy * uy
            t = max(0, min(1, ((x - x0) * ux + (y - y0) * uy) / L2))
            px, py = x0 + ux * t, y0 + uy * t
            d = math.hypot(x - px, y - py)
            if best is None or d < best[0]:
                n = math.hypot(ux, uy); nx, ny = uy / n, -ux / n
                side = (x - px) * nx + (y - py) * ny
                w = widths[i] + (widths[i + 1] - widths[i]) * t
                best = (d, side / (w / 2))
        s = best[1]
        r = rng.random()
        if r < 0.07:
            return DI['speckL']
        if r < 0.12:
            return DI['speckD']
        return DI['dorsal'] if s > 0.45 else DI['belly'] if s < -0.4 else DI['side']
    scale_cells(a, neck, 10, neck_shade)
    # skin folds across the neck, tapering strokes
    for i in range(1, 16):
        t = i / 16
        k = int(t * (len(centre) - 1)); f = t * (len(centre) - 1) - k
        p_top = lerp(top[k], top[k + 1], f); p_bot = lerp(bot[k], bot[k + 1], f)
        mid = lerp(p_top, p_bot, 0.5)
        a.stroke(smooth_d([lerp(p_top, p_bot, 0.15), (mid[0] - 14, mid[1] + 6), lerp(p_top, p_bot, 0.85)], closed=False), color='#3e3a30', lw=4, opacity=60)
    # rim light along the top (sun from the upper right), crayon shadow underneath
    a.stroke(smooth_d([lerp(t, b, 0.05) for t in top for b in [bot[top.index(t)]]], closed=False), color=DI['rim'], lw=8, opacity=85)
    a.hatch(smooth_d(bot + [lerp(b, t, 0.22) for b, t in zip(bot, top)][::-1], tension=0.35), '#3e3a30', angle=70, spacing=7, width=2.2, opacity=55)

    # head: long, low skull with a broad square snout, pointing down-left
    head = [(860, 448), (800, 404), (720, 396), (650, 410), (590, 446), (500, 488), (400, 522), (318, 548), (282, 580), (284, 622), (330, 652), (440, 668), (580, 664), (710, 644), (812, 604), (868, 540)]
    a.shape(smooth_d(head, tension=0.35), DI['side'], lw=7)
    a.shape(smooth_d([(290, 628), (330, 652), (440, 668), (580, 664), (710, 644), (812, 604), (760, 620), (600, 646), (450, 652), (340, 640)], tension=0.35), DI['belly'], stroke=False, rough=1.5)
    a.shape(smooth_d([(860, 448), (800, 404), (720, 396), (650, 410), (590, 446), (500, 488), (400, 522), (440, 534), (580, 476), (690, 432), (800, 432)], tension=0.35), DI['dorsal'], stroke=False, rough=1.5)
    def head_shade(x, y):
        r = rng.random()
        if r < 0.1:
            return DI['speckL']
        if r < 0.16:
            return DI['speckD']
        return DI['dorsal'] if y < 500 - (x - 300) * 0.16 else DI['side'] if y < 630 else DI['belly']
    scale_cells(a, head, 6.5, head_shade)
    # mouth line, lip edge and the comb of peg teeth at the front of both jaws
    a.stroke(smooth_d([(286, 604), (360, 606), (450, 604), (540, 596), (600, 588)], closed=False), lw=5, profile=None)
    teeth = []
    for i in range(9):
        x = 300 + i * 13
        teeth.append(f'M{x:.1f} {604:.1f} l-6 18 l7 -1 Z')   # upper, angled forward
        teeth.append(f'M{x + 5:.1f} {607:.1f} l-5 -16 l7 2 Z')  # lower
    v.tool('draw_path', d=' '.join(teeth), fill='#f7f1e0', stroke=INK, strokeWidth=2)
    # nostril toward the front-top of the snout, cheek wrinkles
    a.shape('M326 560 q16 -12 34 -5 q-14 9 -34 5 Z', '#2a1b12', stroke=False, rough=0)
    a.stroke('M560 470 q30 -24 70 -30', color='#3e3a30', lw=4, opacity=70)  # bony ridge over the snout
    for k in range(4):
        a.stroke(f'M{560 + k * 18} {598 - k * 3} q8 10 4 22', color='#3e3a30', lw=3, opacity=70)
    # eye: lids, amber iris, round pupil, highlight, wrinkles around it
    ex, ey = 676, 478
    a.shape(f'M{ex - 46} {ey + 2} Q{ex} {ey - 40} {ex + 46} {ey + 2} Q{ex} {ey + 32} {ex - 46} {ey + 2} Z', '#5a5446', lw=5)
    a.shape(f'M{ex - 26} {ey} a26 24 0 1 0 52 0 a26 24 0 1 0 -52 0 Z', DI['eye'], lw=3.5, rough=0.5, detail=30)
    a.shape(f'M{ex - 9} {ey} a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z', INK, stroke=False, rough=0)
    a.shape(f'M{ex + 2} {ey - 9} a5 4 0 1 0 10 0 a5 4 0 1 0 -10 0 Z', '#ffffff', stroke=False, rough=0)
    a.shape(f'M{ex - 46} {ey + 2} Q{ex} {ey - 40} {ex + 46} {ey + 2} Q{ex} {ey - 20} {ex - 46} {ey + 2} Z', '#6c6656', lw=4)  # upper lid
    for k in range(5):
        ang = math.radians(200 + k * 30)
        a.stroke(f'M{ex + math.cos(ang) * 50:.1f} {ey + math.sin(ang) * 36:.1f} l{math.cos(ang) * 16:.1f} {math.sin(ang) * 12:.1f}', color='#3e3a30', lw=3)
    a.stroke(f'M{ex - 52} {ey - 22} Q{ex} {ey - 54} {ex + 56} {ey - 18}', lw=6)  # brow ridge
    # rim light on the head top, crayon shadow under the jaw
    a.stroke(smooth_d([(840, 432), (720, 404), (620, 428), (500, 494), (380, 536)], closed=False), color=DI['rim'], lw=7, opacity=85)
    a.hatch(smooth_d([(320, 640), (470, 664), (700, 630), (790, 594), (700, 612), (470, 648), (330, 632)], tension=0.35), '#3e3a30', angle=80, spacing=6, width=2, opacity=60)
    # a monkey-puzzle branchlet hanging from the mouth, a few scale-leaves falling
    td.rng = random.Random(5)
    for pts, w in (([(330, 608), (300, 660), (316, 730), (290, 800)], 26), ([(380, 610), (400, 680), (380, 760)], 22), ([(310, 612), (250, 650), (200, 700)], 20), ([(360, 612), (340, 690), (360, 740)], 18)):
        # sharp triangular leaves sticking out along both edges, then the rope and its scale pattern
        spikes = []
        dense = [lerp(pts[i], pts[i + 1], t / 6) for i in range(len(pts) - 1) for t in range(6)] + [pts[-1]]
        for i in range(len(dense) - 1):
            (x0, y0), (x1, y1) = dense[i], dense[i + 1]
            ux, uy = x1 - x0, y1 - y0
            n = math.hypot(ux, uy) or 1
            ux, uy = ux / n, uy / n
            nx, ny = -uy, ux
            for sgn in (-1, 1):
                bx, by = x0 + nx * sgn * w * 0.45, y0 + ny * sgn * w * 0.45
                tx, ty = bx + nx * sgn * w * 0.55 + ux * w * 0.5, by + ny * sgn * w * 0.55 + uy * w * 0.5
                spikes.append(f'M{bx - ux * 5:.1f} {by - uy * 5:.1f} L{tx:.1f} {ty:.1f} L{bx + ux * 5:.1f} {by + uy * 5:.1f} Z')
        v.tool('draw_path', d=' '.join(spikes), fill='#2c5747', stroke=INK, strokeWidth=1.8)
        td.tube(a, pts, w, td.FRONT, lw=3)
        v.tool('draw_path', d=td.chevrons(pts, w, 7), fill='none', stroke=td.FRONT['scale'], strokeWidth=2.4)
    for (x, y) in ((240, 840), (330, 880), (270, 930)):
        a.shape(f'M{x} {y} l9 -18 l9 18 Z', '#2c5747', lw=2.4, rough=0.3)
    v.tool('export', path=os.path.join(out, 'cuDiploHead.svg'))
    v.close()


# ------------------------------------------------------------------ the traveler from behind
TT = dict(skin='#ffffff', skinShade='#e6ebf1', hair='#4a2e1c', hairLight='#6e4630', hoodie='#f6c443', hoodieShade='#dfa52a', hoodieDeep='#c98f1f', pack='#8a5a33', packDark='#6b4325', packLight='#a87447', watch='#2d6cdf')


def traveler_back(out):
    v = VC(); a = Artist(v, 900, 1000, 9, seed=99)
    hx, hy, r = 450, 380, 250
    # shoulders and hoodie back (cut off by the frame bottom)
    hoodie = [(40, 1010), (60, 820), (140, 700), (300, 640), (600, 640), (760, 700), (840, 820), (860, 1010)]
    a.shape(smooth_d(hoodie, tension=0.35), TT['hoodie'])
    # shadow side (light from the upper right): the left of his back
    a.shape(smooth_d([(40, 1010), (60, 820), (140, 700), (300, 640), (380, 650), (260, 760), (200, 1010)], tension=0.35), TT['hoodieShade'], stroke=False, rough=2)
    a.hatch(smooth_d([(40, 1010), (60, 820), (140, 710), (240, 690), (160, 1010)], tension=0.35), TT['hoodieDeep'], angle=60, spacing=8, width=2.4, opacity=60)
    # fabric folds and the shoulder seams
    for d in ('M150 760 q60 30 90 90', 'M760 760 q-60 30 -90 90', 'M120 900 q40 20 60 70', 'M800 900 q-40 20 -60 70'):
        a.stroke(d, color=TT['hoodieDeep'], lw=6)
    v.tool('draw_path', d='M140 702 Q200 760 210 840 M760 702 Q700 760 690 840', fill='none', stroke='#b07a18', strokeWidth=3, dash=[10, 8])
    # backpack straps over the shoulders, then the pack itself
    for s in (-1, 1):
        a.stroke(f'M{450 + s * 150} 650 q{s * 10} 80 {s * 40} 200', color=INK, lw=48, profile=None, rough=False)
        a.stroke(f'M{450 + s * 150} 650 q{s * 10} 80 {s * 40} 200', color=TT['packDark'], lw=34, profile=None, rough=False)
    pack = [(220, 1010), (230, 790), (270, 740), (450, 720), (630, 740), (670, 790), (680, 1010)]
    a.shape(smooth_d(pack, tension=0.3), TT['pack'])
    a.shape(smooth_d([(220, 1010), (230, 790), (270, 740), (350, 728), (300, 800), (290, 1010)], tension=0.3), TT['packDark'], stroke=False, rough=1.5)
    a.shape(smooth_d([(250, 760), (450, 734), (650, 760), (660, 880), (450, 900), (240, 880)], tension=0.3), TT['packLight'])  # top flap
    v.tool('draw_path', d='M262 768 Q450 746 638 768 L646 868 Q450 886 254 868 Z', fill='none', stroke='#5a3a1e', strokeWidth=3, dash=[10, 7])
    for x in (360, 540):
        a.shape(f'M{x - 26} 880 h52 v44 h-52 Z', '#d9b45a', lw=5)  # buckles
        a.shape(f'M{x - 14} 892 h28 v20 h-28 Z', TT['pack'], stroke=False, rough=0)
        a.stroke(f'M{x} 880 v-40', color=TT['packDark'], lw=20, profile=None, rough=False)
    # a patch on the flap: a little clock, the traveler's emblem
    a.shape('M420 800 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z', '#2d6cdf', lw=4, rough=0.5, detail=30)
    a.stroke('M450 800 v-18 M450 800 l12 8', color='#ffffff', lw=5, profile=None, rough=False)
    for k in range(6):
        a.stroke(f'M{250 + k * 70} {960 + (k % 2) * 10} q20 -6 40 0', color='#5a3a1e', lw=3)  # scuffs
    # hood bunched at the neck
    hood = [(250, 660), (280, 600), (380, 570), (520, 570), (620, 600), (650, 660), (560, 690), (340, 690)]
    a.shape(smooth_d(hood, tension=0.4), TT['hoodie'])
    a.stroke('M300 640 Q450 600 600 640', color=TT['hoodieDeep'], lw=7)
    a.stroke('M330 668 Q450 640 570 668', color=TT['hoodieShade'], lw=6)
    # head from behind: white skin at the nape, the rest covered by messy hair
    a.shape(f'M{hx - r} {hy} a{r} {r} 0 1 0 {2 * r} 0 a{r} {r} 0 1 0 {-2 * r} 0 Z', TT['skin'], rough=1, detail=30)
    a.shape(smooth_d([(hx + r * 0.3, hy + r * 0.9), (hx + r * 0.85, hy + r * 0.4), (hx + r * 0.95, hy), (hx + r * 0.7, hy + r * 0.75)], tension=0.4), TT['skinShade'], stroke=False, rough=0.5)
    # hair: a dark base cap with a jagged nape, then overlapping pointed tufts in two tones
    tufts = []
    n = 18
    for i in range(n + 1):
        ang = math.radians(-200 + 220 * i / n)
        rr = r + (30 if i % 2 else 6) + rng.uniform(-8, 8)
        tufts.append((hx + math.cos(ang) * rr, hy + math.sin(ang) * rr))
    nape = []
    for i in range(12):
        x = hx + r * 0.95 - i * (r * 1.9 / 11)
        y = hy + r * (0.42 + (0.16 if i % 2 else 0)) - abs(i - 5.5) * 6
        nape.append((x, y))
    a.shape(pts_d(tufts + nape), '#3a2314')
    def tuft(cx, cy, size, ang, colour):
        ra = math.radians(ang)
        tip = (cx + math.cos(ra) * size * 1.6, cy + math.sin(ra) * size * 1.6)
        l = (cx + math.cos(ra + 1.6) * size * 0.42, cy + math.sin(ra + 1.6) * size * 0.42)
        rr_ = (cx + math.cos(ra - 1.6) * size * 0.42, cy + math.sin(ra - 1.6) * size * 0.42)
        back = (cx - math.cos(ra) * size * 0.5, cy - math.sin(ra) * size * 0.5)
        a.shape(smooth_d([back, l, tip, rr_], tension=0.45), colour, lw=4, rough=1)
    clumps = []
    for i in range(34):
        ang = rng.uniform(-200, 20)
        rr = rng.uniform(0.15, 0.95) * r
        cx, cy = hx + math.cos(math.radians(ang)) * rr, hy + math.sin(math.radians(ang)) * rr - 30
        if cy > hy + r * 0.3:
            continue
        clumps.append((cy, cx, ang))
    for cy, cx, ang in sorted(clumps):
        # tufts flow outward and down from the crown; lit ones on the upper right
        # flow outward from the crown (just above the centre of the back of the head)
        flow = math.degrees(math.atan2(cy - (hy - r * 0.45), cx - hx)) + rng.uniform(-18, 18)
        lit = cx > hx + r * 0.2 and cy < hy - r * 0.35 and rng.random() < 0.5
        tuft(cx, cy, rng.uniform(32, 50), flow, '#5a3824' if lit else TT['hair'])
    strands = []
    for i in range(30):
        ang = math.radians(rng.uniform(-190, 10))
        rr = rng.uniform(0.2, 0.9) * r
        x, y = hx + math.cos(ang) * rr, hy + math.sin(ang) * rr - 20
        strands.append(f'M{x:.1f} {y:.1f} q{rng.uniform(-14, 14):.1f} {rng.uniform(14, 24):.1f} {rng.uniform(-10, 10):.1f} {rng.uniform(28, 44):.1f}')
    v.tool('draw_path', d=' '.join(strands), fill='none', stroke='#2e1c10', strokeWidth=3.4, cap='round')
    a.stroke(smooth_d([(hx + r * 0.25, hy - r * 0.9), (hx + r * 0.6, hy - r * 0.72), (hx + r * 0.85, hy - r * 0.42)], closed=False), color='#a8774f', lw=7, opacity=80)
    # goggles strap round the back of the head (the Jurassic outfit)
    a.stroke(f'M{hx - r * 0.98} {hy - r * 0.15} Q{hx} {hy + r * 0.12} {hx + r * 0.98} {hy - r * 0.15}', color=INK, lw=26, profile=None, rough=False)
    a.stroke(f'M{hx - r * 0.98} {hy - r * 0.15} Q{hx} {hy + r * 0.12} {hx + r * 0.98} {hy - r * 0.15}', color='#6b4428', lw=14, profile=None, rough=False)
    v.tool('export', path=os.path.join(out, 'cuTravelerBack.svg'))
    v.close()


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    diplo_head(out); print('diplo head ok')
    traveler_back(out); print('traveler back ok')
