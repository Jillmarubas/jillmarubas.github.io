#!/usr/bin/env python3
"""Three YouTube thumbnails (1280x720 JPEG) for an A/B/C test in YouTube Studio's Test & Compare.

Usage: python3 -I tools/thumbnails.py      (run from effectcraft/invisible-cassette) -> thumbnails/
V1 vs V2 changes only the text; V1 vs V3 changes only the subject (faces vs a faceless trader).
Palette and fonts are the film's (TERM in mm.jsx, IBM Plex Sans Condensed Bold). The images are the
film's own Higgsfield illustrations (fictional people, no logos).
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance, ImageOps
import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "thumbnails"); os.makedirs(OUT, exist_ok=True)
W, H = 1280, 720
BLACK, AMBER, RED, WHITE = (6, 7, 10), (255, 176, 0), (255, 59, 48), (242, 240, 234)
BOLD = os.path.expanduser("~/.fonts/IBMPlexSansCondensed-Bold.ttf")


def photo(file, box, size, flip=False):
    im = Image.open(os.path.join(HERE, "assets/hf", file)).convert("RGB").crop(box).resize(size, Image.LANCZOS)
    if flip: im = ImageOps.mirror(im)
    im = ImageEnhance.Contrast(im).enhance(1.18)
    return ImageEnhance.Color(im).enhance(1.1)


def fade_mask(w, h, side):
    """opaque photo, fading to black over the last 30 % towards the text side"""
    x = np.linspace(0, 1, w)
    a = np.clip((1 - x) / 0.30, 0, 1) if side == "right" else np.clip(x / 0.30, 0, 1)
    return Image.fromarray((np.tile(a, (h, 1)) * 255).astype(np.uint8))


def crash_line(img, pts, color=RED):
    """a jagged falling ticker line with a glow"""
    glow = Image.new("RGB", img.size, (0, 0, 0)); d = ImageDraw.Draw(glow)
    d.line(pts, fill=color, width=14, joint="curve"); glow = glow.filter(ImageFilter.GaussianBlur(14))
    img = Image.fromarray(np.clip(np.asarray(img, float) + np.asarray(glow, float) * 0.9, 0, 255).astype(np.uint8))
    ImageDraw.Draw(img).line(pts, fill=color, width=7, joint="curve")
    return img


def text_block(img, lines, x, y_mid, align):
    d = ImageDraw.Draw(img)
    fonts = [ImageFont.truetype(BOLD, s) for _, s, _ in lines]
    heights = [f.getbbox(t)[3] - f.getbbox(t)[1] for (t, _, _), f in zip(lines, fonts)]
    gap = 10; y = y_mid - (sum(heights) + gap * (len(lines) - 1)) / 2
    for (t, s, col), f, h in zip(lines, fonts, heights):
        bb = f.getbbox(t); w = bb[2] - bb[0]
        tx = x - w if align == "right" else x
        # dark stroke so the words survive any background at 200 px wide
        d.text((tx - bb[0], y - bb[1]), t, font=f, fill=col, stroke_width=6, stroke_fill=BLACK)
        y += h + gap
    return img


def finish(img):
    a = np.asarray(img, float)
    yy, xx = np.mgrid[0:H, 0:W]; r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
    a *= np.clip(1.12 - 0.38 * r ** 2, 0.55, 1)[..., None]                       # vignette
    a += np.random.default_rng(7).normal(0, 5, a.shape)                          # grain (also dithers)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def make(name, file, box, side, lines, line_pts, flip=False):
    img = Image.new("RGB", (W, H), BLACK)
    pw = 820
    ph = photo(file, box, (pw, H), flip)
    px = 0 if side == "right" else W - pw
    img.paste(ph, (px, 0), fade_mask(pw, H, "right" if side == "right" else "left"))
    img = crash_line(img, line_pts)
    tx, align = (W - 48, "right") if side == "right" else (48, "left")
    img = text_block(img, lines, tx, 360, align)
    img = finish(img)
    p = os.path.join(OUT, name); img.save(p, quality=92, optimize=True)
    img.resize((200, 112), Image.LANCZOS).save(p.replace(".jpg", "_200px.png"))   # the mobile check
    print(p, os.path.getsize(p) // 1024, "KB")


# the falling line runs behind the words, top of the text side to the bottom edge
DROP_R = [(700, 170), (790, 150), (850, 260), (905, 235), (960, 400), (1010, 370), (1070, 560), (1130, 530), (1280, 700)]
DROP_L = [(W - x, y) for x, y in DROP_R]
FACES = (1450, 150, 3250, 1730)          # the woman's hand over her mouth, the man holding his head
make("thumb_v1_nobody_decided.jpg", "shocked.jpg", FACES, "right",
     [("NOBODY", 170, AMBER), ("DECIDED", 170, RED)], DROP_R)
make("thumb_v2_trillion_gone.jpg", "shocked.jpg", FACES, "right",
     [("$1 TRILLION", 128, WHITE), ("GONE", 200, RED)], DROP_R)
# faceless variant: the trader at four red screens, mirrored so the screens sit left and the words right
make("thumb_v3_screens.jpg", "trader.jpg", (1380, 0, 3840, 2160), "right",
     [("NOBODY", 170, AMBER), ("DECIDED", 170, RED)], DROP_R, flip=True)
