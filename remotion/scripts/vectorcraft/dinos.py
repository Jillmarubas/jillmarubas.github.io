"""Draw the Jurassic creatures in VectorCraft, one SVG per moving part.

Anatomy and skin follow remotion/src/timetraveler/research/jurassic.md:
  Allosaurus      pebbly 1-2 mm scales with a few larger ovals; brow horns; three-fingered hands, palms inward;
                  body level, tail stiff and off the ground.            colour: unknown -> countershaded
  Stegosaurus     small polygonal scales broken by larger oval bumps in rosettes; two staggered rows of plates
                  with grooved keratin; four tail spikes; short front legs, low head.  colour: unknown
  Diplodocus      polygonal scales; patterned/speckled skin (juvenile melanosomes); midline spines;
                  pillar legs, front feet a horseshoe with one thumb claw; tail held off the ground.
  Archaeopteryx   feathered wings with three clawed fingers, toothed jaws, long feathered bony tail.
                  colour: wing feather mostly black (fossil)
  Rhamphorhynchus membrane wings on the long fourth finger, fuzz (pycnofibers), needle teeth, tail vane.
  Juramaia        shrew-sized, furry (hair traces), climber, insect-eater, big eyes (night).
Every part of one creature shares that creature's box, so the parts line up by stacking them.
Usage (from remotion/): python3 scripts/vectorcraft/dinos.py public/timetraveler/dinos [part ...]
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vc import VC
from art import Artist, smooth_d, pts_d, lerp, INK


def inside_poly(region_pts, x, y):
    c = False
    j = len(region_pts) - 1
    for i in range(len(region_pts)):
        xi, yi = region_pts[i]; xj, yj = region_pts[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi):
            c = not c
        j = i
    return c


def dots(a, region_pts, color, n, rmin, rmax, seed=1, opacity=None):
    """Scatter small scale dots inside a polygon (approximate, via rejection)."""
    import random
    rng = random.Random(seed)
    xs = [p[0] for p in region_pts]; ys = [p[1] for p in region_pts]
    inside = lambda x, y: inside_poly(region_pts, x, y)
    d = []
    tries = 0
    while len(d) < n and tries < n * 30:
        tries += 1
        x = rng.uniform(min(xs), max(xs)); y = rng.uniform(min(ys), max(ys))
        if inside(x, y):
            r = rng.uniform(rmin, rmax)
            d.append(f'M{x - r:.1f} {y:.1f} a{r:.1f} {r * 0.85:.1f} 0 1 0 {2 * r:.1f} 0 a{r:.1f} {r * 0.85:.1f} 0 1 0 {-2 * r:.1f} 0 Z')
    if d:
        args = dict(d=' '.join(d), fill=color, stroke='none')
        if opacity is not None:
            args['opacity'] = opacity
        a.v.tool('draw_path', **args)


def rosettes(a, region_pts, base, ring, n, seed=3):
    """Stegosaur skin: a larger oval bump ringed by small scales."""
    import random
    rng = random.Random(seed)
    xs = [p[0] for p in region_pts]; ys = [p[1] for p in region_pts]
    centres = []
    for _ in range(n * 20):
        if len(centres) >= n:
            break
        x = rng.uniform(min(xs) + 20, max(xs) - 20); y = rng.uniform(min(ys) + 20, max(ys) - 20)
        # cheap inside test against the bounding ellipse of the region
        cx = (min(xs) + max(xs)) / 2; cy = (min(ys) + max(ys)) / 2
        if ((x - cx) / ((max(xs) - min(xs)) / 2)) ** 2 + ((y - cy) / ((max(ys) - min(ys)) / 2)) ** 2 < 0.7:
            if all((x - u) ** 2 + (y - w) ** 2 > 40 ** 2 for u, w in centres):
                centres.append((x, y))
    big = []; small = []
    for (x, y) in centres:
        big.append(f'M{x - 8} {y} a8 6 0 1 0 16 0 a8 6 0 1 0 -16 0 Z')
        for k in range(8):
            ang = k * math.pi / 4
            sx, sy = x + math.cos(ang) * 14, y + math.sin(ang) * 11
            small.append(f'M{sx - 3} {sy} a3 2.6 0 1 0 6 0 a3 2.6 0 1 0 -6 0 Z')
    a.v.tool('draw_path', d=' '.join(big), fill=base, stroke=INK, strokeWidth=1.6)
    a.v.tool('draw_path', d=' '.join(small), fill=ring, stroke='none')


def hexes(a, region_pts, color, size, opacity=55):
    """Diplodocus polygonal scales, as a light hex net clipped by bounding test."""
    xs = [p[0] for p in region_pts]; ys = [p[1] for p in region_pts]
    cx = (min(xs) + max(xs)) / 2; cy = (min(ys) + max(ys)) / 2
    rx = (max(xs) - min(xs)) / 2; ry = (max(ys) - min(ys)) / 2
    d = []
    h = size * math.sqrt(3) / 2
    y = min(ys); row = 0
    while y < max(ys):
        x = min(xs) + (size * 0.75 if row % 2 else 0)
        while x < max(xs):
            pts = [(x + size / 2 * math.cos(math.pi / 3 * k), y + size / 2 * math.sin(math.pi / 3 * k)) for k in range(6)]
            # keep a hex only if every corner sits well inside the outline
            if all(inside_poly(region_pts, px, py) for px, py in pts) and inside_poly(region_pts, x, y - size) and inside_poly(region_pts, x, y + size):
                d.append(pts_d(pts))
            x += size * 1.5
        y += h; row += 1
    a.v.tool('draw_path', d=' '.join(d), fill='none', stroke=color, strokeWidth=2.2, opacity=opacity)


# ============================================================ ALLOSAURUS  (900 x 520, faces right)
AL = dict(back='#6f6a3e', side='#8b8450', belly='#e3d6a8', band='#55512f', horn='#c4512b', far='#5f5a34', claw='#efe6cf')


def allo_tail(a):
    top = [(345, 214), (260, 222), (170, 232), (90, 242), (24, 250)]
    bot = [(24, 252), (90, 262), (180, 276), (270, 292), (350, 300)]
    a.shape(smooth_d(top + bot, tension=0.35), AL['side'])
    a.shape(smooth_d([(340, 280), (260, 286), (170, 270), (90, 258), (30, 252), (100, 266), (190, 284), (280, 298), (345, 300)], tension=0.35), AL['belly'], stroke=False, rough=1.5)
    for x in (300, 240, 180, 125, 75):
        a.shape(pts_d([(x, 220 + (345 - x) * 0.09), (x - 18, 222 + (345 - x) * 0.09), (x - 10, 250 + (345 - x) * 0.04), (x + 6, 248 + (345 - x) * 0.04)]), AL['band'], stroke=False, rough=1.5)
    dots(a, top + bot, AL['back'], 60, 1.6, 3.2, seed=11, opacity=70)


def allo_body(a):
    body = [(330, 214), (420, 180), (520, 178), (590, 196), (640, 150), (668, 140), (692, 196), (640, 262), (606, 300), (520, 330), (420, 326), (340, 300)]
    a.shape(smooth_d(body, tension=0.4), AL['side'])
    belly = [(350, 300), (430, 322), (520, 326), (600, 298), (640, 262), (676, 214), (650, 268), (600, 316), (520, 336), (420, 332), (346, 302)]
    a.shape(smooth_d([(345, 288), (430, 312), (520, 316), (598, 290), (636, 256), (670, 210), (690, 200), (642, 264), (606, 302), (520, 332), (420, 328), (342, 300)], tension=0.4), AL['belly'], stroke=False, rough=2)
    # darker back and tiger-ish bands (display pattern: a guess)
    a.shape(smooth_d([(332, 216), (420, 182), (520, 180), (588, 198), (640, 152), (664, 146), (600, 214), (520, 208), (420, 214), (340, 236)], tension=0.4), AL['back'], stroke=False, rough=2)
    for x in (380, 440, 500, 560):
        a.shape(pts_d([(x, 188 - (x - 380) * 0.02), (x + 18, 186), (x + 12, 236), (x - 4, 238)]), AL['band'], stroke=False, rough=1.5)
    dots(a, body, AL['back'], 140, 1.6, 3.4, seed=12, opacity=60)
    dots(a, body, AL['belly'], 18, 3.5, 5, seed=13, opacity=45)  # the few larger ovals
    # neck skin folds
    a.stroke(smooth_d([(640, 210), (652, 236), (648, 262)], closed=False), lw=3.5, opacity=70)


def allo_head(a):
    # skull with the brow horn in front of the eye, nasal ridge, upper teeth
    skull = [(640, 160), (660, 122), (700, 108), (730, 112), (790, 128), (850, 150), (868, 166), (860, 178), (800, 184), (740, 190), (690, 194), (652, 186)]
    a.shape(smooth_d(skull, tension=0.35), AL['side'])
    a.shape(smooth_d([(652, 182), (700, 190), (760, 186), (830, 178), (864, 172), (850, 182), (780, 190), (700, 198)], tension=0.3), AL['belly'], stroke=False, rough=1)
    # teeth along the upper jaw
    t = []
    for i in range(9):
        x = 700 + i * 17
        y = 190 - i * 1.9
        t.append(f'M{x} {y} L{x + 5} {y + 12} L{x + 10} {y} Z')
    a.v.tool('draw_path', d=' '.join(t), fill='#fffaf0', stroke=INK, strokeWidth=2)
    # brow horn (display colour guessed), nasal ridge bumps
    a.shape(pts_d([(694, 116), (712, 88), (728, 114)]), AL['horn'], lw=4, rough=0.8)
    a.stroke(smooth_d([(740, 116), (770, 118), (800, 128), (830, 142)], closed=False), lw=4)
    a.shape('M706 140 a11 12 0 1 0 22 0 a11 12 0 1 0 -22 0 Z', '#f6d65a', lw=3.5, rough=0, )
    a.shape('M713 140 a4 9 0 1 0 8 0 a4 9 0 1 0 -8 0 Z', INK, stroke=False, rough=0)
    a.stroke('M698 124 Q718 116 736 126', lw=6)
    a.shape('M836 150 a6 4 0 1 0 12 0 a6 4 0 1 0 -12 0 Z', INK, stroke=False, rough=0)
    dots(a, skull, AL['back'], 40, 1.4, 2.6, seed=14, opacity=60)


def allo_jaw(a):
    jaw = [(680, 190), (740, 188), (800, 184), (846, 178), (838, 192), (790, 208), (730, 222), (690, 220), (668, 204)]
    a.shape(smooth_d(jaw, tension=0.35), AL['belly'])
    t = []
    for i in range(8):
        x = 712 + i * 16
        y = 189 - i * 1.6
        t.append(f'M{x} {y} L{x + 5} {y - 10} L{x + 10} {y} Z')
    a.v.tool('draw_path', d=' '.join(t), fill='#fffaf0', stroke=INK, strokeWidth=2)
    a.stroke(smooth_d([(700, 212), (760, 204), (820, 190)], closed=False), color='#b8aa7c', lw=3)


def allo_arm(fill, dx=0, dy=0):
    def draw(a):
        sx, sy = 590 + dx, 262 + dy
        arm = [(sx - 14, sy - 6), (sx + 14, sy - 4), (sx + 30, sy + 36), (sx + 52, sy + 50), (sx + 46, sy + 62), (sx + 20, sy + 52), (sx - 4, sy + 20)]
        a.shape(smooth_d(arm, tension=0.3), fill)
        # three big curved claws, hand edge-on (palms face inward)
        for k, (cx, cy) in enumerate([(sx + 50, sy + 54), (sx + 46, sy + 60), (sx + 40, sy + 62)]):
            a.shape(f'M{cx} {cy - 4} Q{cx + 16} {cy} {cx + 14} {cy + 16} Q{cx + 8} {cy + 6} {cx - 2} {cy + 4} Z', AL['claw'], lw=2.5, rough=0)
    return draw


def allo_leg(fill, dx=0, dy=0):
    def draw(a):
        hx, hy = 400 + dx, 256 + dy
        leg = [(hx - 50, hy - 30), (hx + 44, hy - 34), (hx + 60, hy + 40), (hx + 40, hy + 116), (hx + 6, hy + 190), (hx + 26, hy + 232), (hx + 70, hy + 240), (hx + 76, hy + 252), (hx - 10, hy + 252), (hx - 22, hy + 196), (hx - 6, hy + 120), (hx - 40, hy + 50)]
        a.shape(smooth_d(leg, tension=0.3), fill)
        a.shape(smooth_d([(hx - 40, hy - 18), (hx + 30, hy - 22), (hx + 44, hy + 30), (hx + 10, hy + 70), (hx - 30, hy + 40)], tension=0.4), AL['back'] if fill == AL['side'] else '#4e4a2b', stroke=False, rough=2)
        # three forward toes with claws
        for k in range(3):
            tx = hx + 46 + k * 12
            a.shape(f'M{tx} {hy + 244} q10 -2 14 8 q-8 2 -14 2 Z', AL['claw'], lw=2, rough=0)
        a.stroke(smooth_d([(hx + 4, hy + 150), (hx + 10, hy + 180)], closed=False), lw=3, opacity=70)
        dots(a, leg, AL['back'], 50, 1.4, 2.8, seed=15 + dx, opacity=55)
    return draw


# ============================================================ STEGOSAURUS  (900 x 520, faces right)
ST = dict(body='#8a7a4c', back='#6e6038', belly='#e0d2a0', far='#6b5e38', plate='#d8b46a', plateEdge='#b4472f', spike='#efe2bf')


def plate_d(x, y, h, w):
    return smooth_d([(x - w * 0.5, y + 6), (x - w * 0.42, y - h * 0.45), (x, y - h), (x + w * 0.45, y - h * 0.42), (x + w * 0.5, y + 6)], tension=0.4)


def steg_body(a):
    # far row of plates first (behind), offset forward
    far_plates = [(300, 196, 70, 54), (380, 160, 104, 76), (460, 166, 96, 70), (540, 200, 66, 52), (600, 236, 40, 34)]
    for (x, y, h, w) in far_plates:
        a.shape(plate_d(x + 30, y + 4, h * 0.9, w * 0.9), '#b8954f', lw=4)
    body = [(240, 250), (300, 196), (380, 158), (460, 162), (540, 196), (600, 236), (650, 278), (640, 320), (560, 340), (440, 360), (320, 344), (250, 312)]
    a.shape(smooth_d(body, tension=0.4), ST['body'])
    a.shape(smooth_d([(250, 300), (330, 336), (440, 350), (560, 332), (636, 314), (560, 352), (440, 368), (320, 352), (250, 316)], tension=0.4), ST['belly'], stroke=False, rough=2)
    a.shape(smooth_d([(244, 248), (300, 200), (380, 162), (460, 166), (540, 200), (600, 240), (520, 238), (420, 222), (320, 236)], tension=0.4), ST['back'], stroke=False, rough=2)
    rosettes(a, body, '#9a8a58', '#6e6038', 9, seed=21)
    # near row of plates with grooved keratin and a red display edge (colour is a guess)
    for (x, y, h, w) in [(270, 214, 60, 48), (340, 172, 96, 72), (420, 156, 120, 84), (500, 176, 94, 70), (570, 214, 58, 46), (626, 254, 34, 30)]:
        a.shape(plate_d(x, y, h, w), ST['plate'], lw=5)
        a.shape(plate_d(x, y - h * 0.18, h * 0.62, w * 0.62), ST['plateEdge'], stroke=False, rough=1)
        for g in (-0.18, 0, 0.18):
            a.stroke(f'M{x + w * g:.1f} {y:.1f} L{x + w * g * 0.5:.1f} {y - h * 0.8:.1f}', color='#9a7a3a', lw=2.5, profile=None, opacity=80)


def steg_tail(a):
    top = [(262, 236), (200, 232), (140, 232), (80, 236), (34, 242)]
    bot = [(30, 250), (80, 258), (140, 270), (200, 290), (262, 314)]
    a.shape(smooth_d(top + bot, tension=0.35), ST['body'])
    a.shape(smooth_d([(250, 300), (190, 282), (130, 266), (70, 254), (40, 250), (90, 264), (150, 278), (210, 296), (258, 312)], tension=0.35), ST['belly'], stroke=False, rough=1.5)
    for (x, y, h, w) in [(220, 236, 40, 34), (176, 234, 28, 26)]:
        a.shape(plate_d(x, y, h, w), ST['plate'], lw=4)
    # the thagomizer: four spikes angled up and back
    for (x, y, ang, L) in [(108, 238, -150, 70), (76, 240, -160, 64), (92, 252, 160, 60), (60, 252, 170, 54)]:
        r = math.radians(ang)
        tx, ty = x + math.cos(r) * L, y + math.sin(r) * L
        nx, ny = -math.sin(r) * 9, math.cos(r) * 9
        a.shape(pts_d([(x + nx, y + ny), (tx, ty), (x - nx, y - ny)]), ST['spike'], lw=4, rough=0.6)
    rosettes(a, top + bot, '#9a8a58', '#6e6038', 3, seed=22)


def steg_head(a):
    head = [(610, 262), (650, 286), (700, 304), (742, 318), (756, 334), (740, 346), (700, 348), (660, 336), (620, 318), (600, 290)]
    a.shape(smooth_d(head, tension=0.4), ST['body'])
    a.shape(smooth_d([(620, 318), (660, 334), (700, 344), (740, 344), (700, 352), (650, 344)], tension=0.4), ST['belly'], stroke=False, rough=1)
    a.shape('M742 330 Q760 334 756 344 L740 344 Z', '#c9b98a', lw=3, rough=0)  # keratin beak
    a.shape('M700 316 a7 8 0 1 0 14 0 a7 8 0 1 0 -14 0 Z', INK, stroke=False, rough=0)
    a.shape('M703 312 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 Z', '#ffffff', stroke=False, rough=0)
    # throat armour: little bony discs (ossicles)
    dots(a, [(630, 320), (690, 340), (680, 352), (630, 336)], '#c9b98a', 10, 3, 4.5, seed=23)


def steg_leg(hx, hy, foot_y, fill, thick, seed):
    def draw(a):
        leg = [(hx - thick, hy - 30), (hx + thick, hy - 30), (hx + thick * 0.9, hy + 60), (hx + thick * 0.7, foot_y - 10), (hx + thick * 0.9 + 6, foot_y), (hx - thick * 0.9 - 4, foot_y), (hx - thick * 0.7, foot_y - 10), (hx - thick * 0.9, hy + 60)]
        a.shape(smooth_d(leg, tension=0.2), fill)
        for k in range(3):
            a.shape(f'M{hx - thick * 0.6 + k * thick * 0.6} {foot_y - 2} a7 6 0 0 1 14 0 Z', ST['spike'], lw=2.5, rough=0)
        rosettes(a, leg, '#9a8a58', '#5e5232', 1, seed=seed)
    return draw


# ============================================================ DIPLODOCUS  (1600 x 700, faces right)
DI = dict(body='#8f8a78', back='#6e6a5e', belly='#d8cfb8', far='#77725f', speckL='#c8bfa6', speckD='#5a5649', spine='#b6ad92')


def spines(a, pts, size):
    d = []
    for i in range(len(pts) - 1):
        x, y = pts[i]; x2, y2 = pts[i + 1]
        mx, my = (x + x2) / 2, (y + y2) / 2
        d.append(f'M{x:.1f} {y:.1f} L{mx:.1f} {my - size:.1f} L{x2:.1f} {y2:.1f} Z')
    a.v.tool('draw_path', d=' '.join(d), fill=DI['spine'], stroke=INK, strokeWidth=3)


def diplo_body(a):
    body = [(560, 300), (660, 260), (780, 250), (900, 270), (980, 310), (970, 400), (930, 450), (800, 490), (680, 480), (580, 440), (548, 370)]
    spines(a, [(600, 286), (660, 264), (720, 254), (780, 252), (840, 258), (900, 272), (950, 290)], 18)
    a.shape(smooth_d(body, tension=0.4), DI['body'], lw=7)
    a.shape(smooth_d([(580, 430), (680, 470), (800, 478), (930, 440), (960, 410), (930, 470), (800, 500), (680, 492), (575, 446)], tension=0.4), DI['belly'], stroke=False, rough=2)
    a.shape(smooth_d([(565, 302), (660, 264), (780, 254), (900, 274), (975, 312), (880, 316), (760, 300), (640, 318)], tension=0.4), DI['back'], stroke=False, rough=2)
    hexes(a, body, DI['back'], 16)
    dots(a, body, DI['speckL'], 70, 4, 9, seed=31, opacity=75)
    dots(a, body, DI['speckD'], 50, 3, 7, seed=32, opacity=70)


def diplo_neck(a):
    # long neck held a little above level, small horse-like head with peg teeth
    top = [(930, 290), (1060, 240), (1200, 200), (1340, 170), (1450, 150), (1500, 140)]
    head = [(1500, 140), (1540, 136), (1576, 150), (1592, 168), (1580, 182), (1540, 186), (1500, 182)]
    bot = [(1490, 184), (1440, 196), (1330, 228), (1190, 280), (1060, 340), (980, 420), (940, 400)]
    spines(a, [(960, 278), (1040, 246), (1120, 222), (1200, 202), (1280, 186), (1360, 168), (1440, 152)], 14)
    a.shape(smooth_d(top + head + bot, tension=0.35), DI['body'], lw=7)
    a.shape(smooth_d([(1490, 182), (1440, 192), (1330, 222), (1190, 272), (1060, 330), (990, 400), (1060, 350), (1190, 290), (1330, 236), (1440, 200)], tension=0.35), DI['belly'], stroke=False, rough=2)
    hexes(a, top + bot, DI['back'], 14)
    dots(a, top + bot, DI['speckL'], 50, 3, 7, seed=33, opacity=75)
    dots(a, top + bot, DI['speckD'], 36, 2.5, 6, seed=34, opacity=70)
    # face: eye, nostril high on the head, peg teeth at the front of the jaw
    a.shape('M1520 152 a6 7 0 1 0 12 0 a6 7 0 1 0 -12 0 Z', INK, stroke=False, rough=0)
    a.shape('M1522 149 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 Z', '#ffffff', stroke=False, rough=0)
    a.shape('M1504 138 a5 3 0 1 0 10 0 a5 3 0 1 0 -10 0 Z', INK, stroke=False, rough=0)
    a.v.tool('draw_path', d=' '.join(f'M{1560 + i * 7} 178 l2 8 l3 -8 Z' for i in range(4)), fill='#fffaf0', stroke=INK, strokeWidth=1.6)
    a.stroke('M1550 176 Q1570 180 1588 174', lw=3)


def diplo_tail(a):
    top = [(612, 296), (500, 290), (380, 290), (260, 300), (150, 314), (60, 326), (8, 332)]
    bot = [(8, 334), (60, 332), (150, 330), (260, 334), (380, 346), (500, 380), (612, 440)]
    spines(a, [(580, 292), (510, 289), (440, 288), (370, 290), (300, 296), (230, 304), (160, 312)], 14)
    a.shape(smooth_d(top + bot, tension=0.35), DI['body'], lw=7)
    a.shape(smooth_d([(600, 430), (500, 372), (380, 340), (260, 330), (150, 328), (260, 338), (380, 352), (500, 388), (606, 444)], tension=0.35), DI['belly'], stroke=False, rough=2)
    hexes(a, top + bot, DI['back'], 14)
    dots(a, top + bot, DI['speckL'], 60, 3, 8, seed=35, opacity=75)
    dots(a, top + bot, DI['speckD'], 40, 2.5, 6, seed=36, opacity=70)


def diplo_leg(hx, hy, fill, front, seed):
    def draw(a):
        w = 46 if front else 54
        foot = 676
        leg = [(hx - w, hy - 40), (hx + w, hy - 40), (hx + w * 0.92, hy + 100), (hx + w * 0.86, foot - 14), (hx + w + 6, foot), (hx - w - 6, foot), (hx - w * 0.86, foot - 14), (hx - w * 0.92, hy + 100)]
        a.shape(smooth_d(leg, tension=0.2), fill, lw=7)
        hexes(a, leg, DI['back'], 14, opacity=45)
        dots(a, leg, DI['speckD'], 14, 2.5, 5, seed=seed, opacity=60)
        if front:
            # horseshoe of finger bones: no toes showing, one thumb claw
            a.shape(f'M{hx + w * 0.6} {foot - 22} q18 4 16 20 l-14 -2 Z', '#efe6cf', lw=3, rough=0)
        else:
            for k in range(3):
                a.shape(f'M{hx - w * 0.5 + k * w * 0.55} {foot - 2} a8 7 0 0 1 16 0 Z', '#efe6cf', lw=2.5, rough=0)
    return draw


# ============================================================ ARCHAEOPTERYX  (420 x 300, faces right)
AR = dict(wing='#1d1d22', covert='#3a3a44', body='#4a4a52', belly='#7d7d86', face='#d9c3a5', claw='#efe6cf')


def arch_tail(a):
    # long bony tail with a feather on each side of every vertebra
    for i in range(10):
        x = 160 - i * 14
        y = 168 + i * 2.5
        for s in (-1, 1):
            a.shape(smooth_d([(x, y), (x - 10, y + s * 14), (x - 22, y + s * 24), (x - 16, y + s * 6)], tension=0.4), AR['wing'], lw=2.5, rough=0.5)
    a.stroke('M170 166 Q100 180 22 194', color=INK, lw=6, profile='taperEnd', rough=False)


def arch_body(a):
    body = [(160, 150), (210, 120), (250, 110), (272, 96), (300, 86), (330, 92), (346, 104), (330, 112), (300, 114), (276, 128), (262, 170), (230, 196), (180, 192), (156, 176)]
    a.shape(smooth_d(body, tension=0.4), AR['body'], lw=4)
    a.shape(smooth_d([(250, 150), (262, 170), (230, 194), (200, 194), (240, 170)], tension=0.4), AR['belly'], stroke=False, rough=1)
    # toothed snout (no beak)
    a.shape(smooth_d([(306, 100), (330, 98), (350, 104), (330, 112), (304, 112)], tension=0.3), AR['face'], lw=3)
    a.v.tool('draw_path', d=' '.join(f'M{314 + i * 7} 108 l2 5 l3 -5 Z' for i in range(4)), fill='#fffaf0', stroke=INK, strokeWidth=1.2)
    a.shape('M292 96 a5 6 0 1 0 10 0 a5 6 0 1 0 -10 0 Z', '#f2c14e', lw=2, rough=0)
    a.shape('M295 96 a2 4 0 1 0 4 0 a2 4 0 1 0 -4 0 Z', INK, stroke=False, rough=0)
    # legs like a bird's
    for (x, dx) in ((210, 0), (228, 10)):
        a.stroke(f'M{x} 190 L{x + 6 + dx} 240 L{x - 4 + dx} 280', color=AR['face'], lw=6, profile=None, rough=False)
        a.stroke(f'M{x - 4 + dx} 280 l18 2 M{x - 4 + dx} 280 l12 -8 M{x - 4 + dx} 280 l-12 0', color=AR['face'], lw=4, profile=None, rough=False)
    for k in range(10):
        x = 180 + k * 8
        a.stroke(f'M{x} {150 + (k % 3) * 8} q4 6 2 12', color=AR['covert'], lw=3)


def arch_wing(fill, primary):
    def draw(a):
        sx, sy = 236, 130
        # primaries fanning out behind the arm
        for k in range(8):
            ang = math.radians(-150 + k * 9)
            L = 150 - k * 6
            tx, ty = sx + math.cos(ang) * L, sy + math.sin(ang) * L
            a.shape(smooth_d([(sx, sy), (lerp((sx, sy), (tx, ty), 0.5)[0] - 6, lerp((sx, sy), (tx, ty), 0.5)[1] - 8), (tx, ty), (lerp((sx, sy), (tx, ty), 0.5)[0] + 6, lerp((sx, sy), (tx, ty), 0.5)[1] + 8)], tension=0.4), primary, lw=3, rough=0.6)
        a.shape(smooth_d([(sx + 10, sy), (sx - 40, sy - 50), (sx - 90, sy - 70), (sx - 60, sy - 30), (sx - 20, sy + 4)], tension=0.4), fill, lw=3.5)
        # three clawed fingers on the wing's leading edge
        for k in range(3):
            cx, cy = sx - 70 + k * 8, sy - 74 + k * 4
            a.shape(f'M{cx} {cy} q-10 -8 -6 -18 q4 8 12 10 Z', AR['claw'], lw=2, rough=0)
    return draw


# ============================================================ RHAMPHORHYNCHUS  (560 x 320, faces right)
RH = dict(fuzz='#8a6b4e', fuzzDark='#6a4f38', membrane='#b98b6a', membraneDark='#9a7052', vane='#c0502f', beak='#e6d2a8')


def rham_tail(a):
    a.stroke('M250 170 Q150 186 60 204', color=INK, lw=6, profile=None, rough=False)
    a.stroke('M250 170 Q150 186 60 204', color=RH['fuzzDark'], lw=3, profile=None, rough=False)
    a.shape(pts_d([(62, 204), (30, 186), (6, 206), (34, 226)]), RH['vane'], lw=3.5, rough=0.6)


def rham_body(a):
    body = [(240, 160), (280, 144), (320, 140), (350, 130), (380, 126), (450, 132), (472, 140), (450, 146), (380, 146), (350, 152), (330, 172), (290, 184), (250, 180)]
    a.shape(smooth_d(body, tension=0.35), RH['fuzz'], lw=4)
    a.shape(smooth_d([(380, 128), (450, 132), (474, 140), (450, 146), (380, 146)], tension=0.3), RH['beak'], lw=3)
    # needle-like teeth pointing forward
    a.v.tool('draw_path', d=' '.join(f'M{392 + i * 10} 145 l6 8 l-1 -8 Z' for i in range(6)), fill='#fffaf0', stroke=INK, strokeWidth=1.2)
    a.shape('M360 134 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z', '#f2c14e', lw=2, rough=0)
    a.shape('M364 134 a2 4 0 1 0 4 0 a2 4 0 1 0 -4 0 Z', INK, stroke=False, rough=0)
    for k in range(14):
        x = 250 + k * 6
        a.stroke(f'M{x} {150 + (k % 3) * 9} l-3 8', color=RH['fuzzDark'], lw=2.5)  # pycnofiber fuzz
    a.stroke('M276 182 L268 214 L280 222', color=RH['fuzzDark'], lw=4, profile=None, rough=False)


def rham_wing(fill):
    def draw(a):
        sx, sy = 300, 150
        # membrane stretched along the very long fourth finger back to the leg
        wing = [(sx, sy), (sx - 10, sy - 40), (sx - 60, sy - 100), (sx - 140, sy - 136), (sx - 220, sy - 140), (sx - 160, sy - 110), (sx - 100, sy - 60), (sx - 40, sy + 20)]
        a.shape(smooth_d(wing, tension=0.35), fill, lw=4)
        a.stroke(smooth_d([(sx, sy), (sx - 10, sy - 40), (sx - 60, sy - 100), (sx - 140, sy - 136), (sx - 220, sy - 140)], closed=False), color=RH['fuzzDark'], lw=6, profile='taperEnd', rough=False)
        for k in range(4):
            a.stroke(smooth_d([lerp((sx - 60, sy - 100), (sx - 220, sy - 140), k / 4), lerp((sx - 40, sy + 20), (sx - 160, sy - 110), k / 4)], closed=False), color=RH['membraneDark'], lw=2, profile=None, rough=False, opacity=60)
        a.shape(f'M{sx - 14} {sy - 46} q-8 -8 -4 -16 q2 8 10 10 Z', '#efe6cf', lw=2, rough=0)
    return draw


# ============================================================ JURAMAIA  (320 x 180, faces right)
JU = dict(fur='#7b5a40', furDark='#5c4230', belly='#c9a986', nose='#e89a9a')


def jura_tail(a):
    a.stroke('M86 112 Q40 100 6 74', color=INK, lw=8, profile='taperEnd', rough=False)
    a.stroke('M86 112 Q40 100 6 74', color='#c98f80', lw=4, profile='taperEnd', rough=False)


def jura_body(a):
    body = [(80, 120), (96, 82), (140, 66), (200, 70), (240, 82), (270, 92), (298, 104), (290, 112), (262, 118), (230, 136), (180, 146), (120, 146)]
    a.shape(smooth_d(body, tension=0.4), JU['fur'], lw=4)
    a.shape(smooth_d([(110, 140), (180, 140), (230, 128), (240, 134), (180, 150), (120, 150)], tension=0.4), JU['belly'], stroke=False, rough=1)
    for k in range(16):
        x = 110 + k * 8
        a.stroke(f'M{x} {80 + (k % 3) * 10} q4 6 0 12', color=JU['furDark'], lw=2.5)
    a.shape('M290 104 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0 Z', JU['nose'], lw=2.5, rough=0)
    a.shape('M232 88 a9 10 0 1 0 18 0 a9 10 0 1 0 -18 0 Z', INK, stroke=False, rough=0)  # big night eye
    a.shape('M236 84 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 Z', '#ffffff', stroke=False, rough=0)
    a.shape(smooth_d([(206, 74), (212, 54), (226, 66)], tension=0.4), JU['furDark'], lw=3)  # ear
    for k in range(3):
        a.stroke(f'M282 {104 + k * 3} l26 {-8 + k * 8}', color=INK, lw=1.6, profile=None, rough=False)  # whiskers
    # little climbing feet with claws
    for (x, y) in ((130, 146), (150, 148), (222, 136), (240, 132)):
        a.stroke(f'M{x} {y - 6} l2 18 l8 2', color=JU['furDark'], lw=6, profile=None, rough=False)


# ------------------------------------------------------------ registry
PARTS = {
    'alloTail': (900, 520, 6, allo_tail),
    'alloLegFar': (900, 520, 6, allo_leg(AL['far'], dx=-26, dy=-6)),
    'alloArmFar': (900, 520, 6, allo_arm(AL['far'], dx=-12, dy=-4)),
    'alloBody': (900, 520, 6, allo_body),
    'alloLegNear': (900, 520, 6, allo_leg(AL['side'])),
    'alloArmNear': (900, 520, 6, allo_arm(AL['side'])),
    'alloJaw': (900, 520, 6, allo_jaw),
    'alloHead': (900, 520, 6, allo_head),
    'stegTail': (900, 520, 6, steg_tail),
    'stegLegBackFar': (900, 520, 6, steg_leg(430, 310, 496, ST['far'], 34, 41)),
    'stegLegFrontFar': (900, 520, 6, steg_leg(590, 310, 496, ST['far'], 26, 42)),
    'stegBody': (900, 520, 6, steg_body),
    'stegHead': (900, 520, 6, steg_head),
    'stegLegBackNear': (900, 520, 6, steg_leg(390, 316, 500, ST['body'], 38, 43)),
    'stegLegFrontNear': (900, 520, 6, steg_leg(560, 316, 500, ST['body'], 28, 44)),
    'diploTail': (1600, 700, 7, diplo_tail),
    'diploLegBackFar': (1600, 700, 7, diplo_leg(690, 430, DI['far'], False, 51)),
    'diploLegFrontFar': (1600, 700, 7, diplo_leg(930, 430, DI['far'], True, 52)),
    'diploBody': (1600, 700, 7, diplo_body),
    'diploNeck': (1600, 700, 7, diplo_neck),
    'diploLegBackNear': (1600, 700, 7, diplo_leg(640, 440, DI['body'], False, 53)),
    'diploLegFrontNear': (1600, 700, 7, diplo_leg(890, 440, DI['body'], True, 54)),
    'archWingFar': (420, 300, 3.5, arch_wing('#2c2c34', '#141418')),
    'archTail': (420, 300, 3.5, arch_tail),
    'archBody': (420, 300, 3.5, arch_body),
    'archWingNear': (420, 300, 3.5, arch_wing(AR['covert'], AR['wing'])),
    'rhamWingFar': (560, 320, 4, rham_wing(RH['membraneDark'])),
    'rhamTail': (560, 320, 4, rham_tail),
    'rhamBody': (560, 320, 4, rham_body),
    'rhamWingNear': (560, 320, 4, rham_wing(RH['membrane'])),
    'juraTail': (320, 180, 3.5, jura_tail),
    'juraBody': (320, 180, 3.5, jura_body),
}

if __name__ == '__main__':
    out = sys.argv[1]
    names = sys.argv[2:] or list(PARTS)
    os.makedirs(out, exist_ok=True)
    for i, name in enumerate(names):
        w, h, line, fn = PARTS[name]
        v = VC()
        a = Artist(v, w, h, line, seed=500 + i * 37)
        fn(a)
        a.v.tool('export', path=os.path.join(out, f'{name}.svg'))
        v.close()
        print(name, os.path.getsize(os.path.join(out, f'{name}.svg')))
