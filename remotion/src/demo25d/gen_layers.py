"""Draws the shared 2.5D cut-out layers for the Remotion vs HyperFrames demo.

Every layer is 2400x1350 RGBA (1.25x the 1920x1080 frame) so the camera can move
without showing edges. All art is drawn in code, seeded, so both tools get the
exact same pixels.
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 2400, 1350
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1987)


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def save(img, name):
    img.save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, img.size)


# 1. Sky: navy top to amber horizon, sun glow, faint stars.
def sky():
    y = np.linspace(0, 1, H)[:, None]
    top, mid, low = np.array(hexrgb("#0b1424")), np.array(hexrgb("#3a3150")), np.array(hexrgb("#e09a4a"))
    t1 = np.clip(y / 0.45, 0, 1)
    t2 = np.clip((y - 0.40) / 0.22, 0, 1)
    col = top * (1 - t1) + mid * t1
    col = col * (1 - t2) + low * t2
    col = np.broadcast_to(col[:, None, :], (H, W, 3)).astype(float).copy()
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W * 0.56) / W) ** 2 + ((yy - H * 0.58) / H) ** 2 * 2.2)
    glow = np.exp(-(d / 0.20) ** 2)[..., None]
    col = col + glow * np.array([110, 70, 25])
    core = np.exp(-(d / 0.025) ** 2)[..., None]
    col = col + core * np.array([120, 110, 80])
    stars = (rng.random((H, W)) > 0.9993) & (yy < H * 0.4)
    col[stars] = col[stars] * 0.3 + np.array([230, 230, 240]) * 0.7 * (1 - yy[stars, None] / (H * 0.4))
    img = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    save(img, "sky.png")


def ridge(y0, amp, freqs, seed, jag=0.0):
    r = np.random.default_rng(seed)
    x = np.arange(W)
    y = np.full(W, float(y0))
    for f, a in freqs:
        y += a * amp * np.sin(x / W * math.pi * 2 * f + r.random() * 6.28)
    if jag:
        n = np.cumsum(r.normal(0, jag, W))
        n -= np.linspace(n[0], n[-1], W)
        y += n
    return y


def silhouette(yline, color_top, color_bottom, name, blur=0, extra=None):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    pts = [(i, float(yline[i])) for i in range(W)] + [(W, H), (0, H)]
    md.polygon(pts, fill=255)
    if extra:
        extra(md)
    grad = np.zeros((H, W, 3))
    ymin = yline.min()
    t = np.clip((np.arange(H) - ymin) / (H - ymin), 0, 1)[:, None, None]
    grad[:] = np.array(color_top) * (1 - t) + np.array(color_bottom) * t
    fill = Image.fromarray(grad.astype(np.uint8), "RGB").convert("RGBA")
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    img.paste(fill, (0, 0), mask)
    return img


# 2. Far mountains, cool and hazy (atmospheric perspective).
def mountains():
    y = ridge(H * 0.50, 70, [(1.3, 1), (3.1, 0.55), (7.7, 0.2)], 3, jag=1.6)
    img = silhouette(y, hexrgb("#6a6688"), hexrgb("#3f4260"), "mountains", blur=1)
    save(img, "mountains.png")


# 3. Haze band that sits between the mountains and the city.
def haze():
    yy, xx = np.mgrid[0:H, 0:W]
    band = np.exp(-((yy - H * 0.64) / (H * 0.07)) ** 2)
    wav = 0.75 + 0.25 * np.sin(xx / W * 9.0) * np.sin(xx / W * 3.3 + 1)
    a = np.clip(band * wav * 190, 0, 255).astype(np.uint8)
    rgb = np.zeros((H, W, 3), np.uint8)
    rgb[:] = hexrgb("#f0b878")
    img = Image.fromarray(np.dstack([rgb, a]), "RGBA").filter(ImageFilter.GaussianBlur(12))
    save(img, "haze.png")


# 4. City skyline with warm lit windows and two factory chimneys.
def city():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base = int(H * 0.82)
    body = hexrgb("#151b2b") + (255,)
    x = 0
    r = np.random.default_rng(11)
    towers = []
    while x < W:
        w = int(r.integers(60, 170))
        center = 1 - abs((x + w / 2) / W - 0.5) * 1.6
        h = int(r.integers(70, 200) + 220 * max(center, 0) * r.random())
        towers.append((x, base - h, x + w, base))
        x += w + int(r.integers(-10, 14))
    for (x0, y0, x1, y1) in towers:
        d.rectangle([x0, y0, x1, H], fill=body)
        if r.random() < 0.25:
            d.rectangle([x0 + (x1 - x0) // 2 - 3, y0 - 50, x0 + (x1 - x0) // 2 + 3, y0], fill=body)
    for cx in (int(W * 0.28), int(W * 0.31)):
        d.polygon([(cx - 22, base - 380), (cx + 22, base - 380), (cx + 34, base), (cx - 34, base)], fill=body)
    for (x0, y0, x1, y1) in towers:
        for wy in range(y0 + 16, base - 10, 22):
            for wx in range(x0 + 10, x1 - 12, 18):
                if r.random() < 0.28:
                    warm = lerp(hexrgb("#f6c66a"), hexrgb("#ffe7b0"), r.random())
                    d.rectangle([wx, wy, wx + 7, wy + 10], fill=warm + (int(150 + 100 * r.random()),))
    d.rectangle([0, base, W, H], fill=body)
    save(img, "city.png")


# 5. Near hill with bare trees.
def tree(d, x, y, length, angle, depth, width, color):
    if depth == 0 or length < 4:
        return
    x2 = x + length * math.cos(angle)
    y2 = y - length * math.sin(angle)
    d.line([(x, y), (x2, y2)], fill=color, width=max(1, int(width)))
    r = np.random.default_rng(int(x * 7 + y * 13 + depth))
    for da in (-0.42, 0.38):
        tree(d, x2, y2, length * (0.68 + 0.12 * r.random()), angle + da + r.normal(0, 0.12), depth - 1, width * 0.68, color)


def hill():
    y = ridge(H * 0.80, 40, [(0.6, 1), (1.7, 0.4)], 5, jag=0.5)
    img = silhouette(y, hexrgb("#0b0f18"), hexrgb("#06080d"), "hill")
    d = ImageDraw.Draw(img)
    col = hexrgb("#0b0f18") + (255,)
    for tx, ln in ((int(W * 0.18), 120), (int(W * 0.80), 150), (int(W * 0.86), 90)):
        tree(d, tx, float(y[tx]) + 8, ln, math.pi / 2, 9, 16, col)
    save(img, "hill.png")


# 6. Foreground grass, blurred, cut off by the frame corners.
def foreground():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = np.random.default_rng(23)
    for side in (0, 1):
        for _ in range(140):
            bx = r.normal(W * 0.12, W * 0.07) if side == 0 else r.normal(W * 0.9, W * 0.06)
            h = r.uniform(120, 420)
            lean = r.normal(0, 70)
            w = r.uniform(10, 26)
            pts = [(bx - w, H), (bx + w, H), (bx + lean, H - h)]
            d.polygon(pts, fill=(14, 12, 16, 255))
    d.rectangle([0, H - 60, W, H], fill=(4, 5, 8, 255))
    img = img.filter(ImageFilter.GaussianBlur(10))
    save(img, "foreground.png")


# 7. Film grain tile (mid-grey noise, used with overlay blending).
def grain():
    n = rng.normal(128, 38, (512, 512)).clip(0, 255).astype(np.uint8)
    Image.fromarray(n, "L").convert("RGB").save(os.path.join(OUT, "grain.png"))
    print("wrote grain.png")


sky(); mountains(); haze(); city(); hill(); foreground(); grain()
