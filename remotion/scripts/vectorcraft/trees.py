"""A Jurassic monkey-puzzle conifer (Araucaria-like: tall bare trunk, domed crown of
tiered branches; research/jurassic.md) drawn in VectorCraft, for the tree-sway test.

Writes, into <out>:
  treeTrunk.svg / treeMid.svg / treeTop.svg  the three parts Remotion bends (600 x 1000 box each)
  treeWhole.png                              the same tree as one picture, for EffectCraft puppet pins
Usage (from remotion/): python3 scripts/vectorcraft/trees.py public/timetraveler/trees
"""
import math, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vc import VC
from art import Artist, smooth_d, pts_d, INK

W, H = 600, 1000
BARK, BARK_D = '#6b4428', '#4e301b'
NEEDLE, NEEDLE_D, NEEDLE_L = '#2f5d50', '#234538', '#4f8a6e'


def trunk(a, y0, y1, w0, w1):
    a.shape(pts_d([(300 - w0, y0), (300 - w1, y1), (300 + w1, y1), (300 + w0, y0)]), BARK)
    rng = random.Random(int(y0))
    for k in range(int((y0 - y1) / 34)):
        y = y0 - 20 - k * 34
        x = 300 + rng.uniform(-w1 * 0.5, w1 * 0.5)
        a.stroke(f'M{x:.1f} {y} q{rng.uniform(-4, 4):.1f} -10 0 -20', color=BARK_D, lw=3)


def tier(a, y, half, droop, seed):
    """One whorl of branches: a drooping, scalloped mass of needles either side of the trunk."""
    rng = random.Random(seed)
    for side in (-1, 1):
        pts = [(300, y - 10)]
        n = 6
        for k in range(1, n + 1):
            x = 300 + side * half * k / n
            pts.append((x, y - 18 + droop * (k / n) ** 2 + rng.uniform(-4, 4)))
        for k in range(n, 0, -1):
            x = 300 + side * half * k / n
            pts.append((x - side * 8, y + 22 + droop * (k / n) ** 2 + (10 if k % 2 else 0)))
        pts.append((300, y + 18))
        a.shape(smooth_d(pts, tension=0.35), NEEDLE)
        # shade on the underside, light needle strokes on top
        a.shape(smooth_d([(300, y + 10)] + [(300 + side * half * k / n, y + 10 + droop * (k / n) ** 2) for k in range(1, n + 1)] + [(300 + side * half * k / n - side * 8, y + 20 + droop * (k / n) ** 2) for k in range(n, 0, -1)], tension=0.35), NEEDLE_D, stroke=False, rough=1.5)
        for k in range(10):
            t = rng.uniform(0.15, 0.95)
            x = 300 + side * half * t
            yy = y - 8 + droop * t * t
            a.stroke(f'M{x:.1f} {yy:.1f} l{side * rng.uniform(6, 14):.1f} {rng.uniform(4, 10):.1f}', color=NEEDLE_L, lw=3.5)


def draw_part(a, part):
    if part in ('trunk', 'whole'):
        trunk(a, 1000, 560, 34, 26)
    if part in ('mid', 'whole'):
        trunk(a, 600, 330, 27, 18)
        for i, (y, half, droop) in enumerate([(560, 250, 70), (500, 240, 62), (440, 220, 54)]):
            tier(a, y, half, droop, 10 + i)
    if part in ('top', 'whole'):
        trunk(a, 360, 120, 19, 8)
        for i, (y, half, droop) in enumerate([(380, 200, 46), (320, 175, 40), (260, 145, 32), (200, 110, 24), (150, 70, 16)]):
            tier(a, y, half, droop, 20 + i)
        a.shape(smooth_d([(286, 140), (300, 96), (314, 140)], tension=0.4), NEEDLE)


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for part, name in (('trunk', 'treeTrunk'), ('mid', 'treeMid'), ('top', 'treeTop')):
        v = VC(); a = Artist(v, W, H, 6, seed=900 + len(name))
        draw_part(a, part)
        v.tool('export', path=os.path.join(out, f'{name}.svg'))
        v.close()
    v = VC(); a = Artist(v, W, H, 6, seed=911)
    draw_part(a, 'whole')
    v.tool('export', path=os.path.join(out, 'treeWhole.png'), options={"background": "transparent", "rect": [0, 0, W, H], "ppi": 72})
    v.close()
    print('ok')
