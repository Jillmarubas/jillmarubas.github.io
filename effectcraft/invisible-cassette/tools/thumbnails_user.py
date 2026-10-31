#!/usr/bin/env python3
"""Text on the user's own three thumbnail images (thumbnails/user_src/idea1-3.jpg) -> thumbnails/thumb_user_*.jpg.

Usage: python3 -I tools/thumbnails_user.py      (run from effectcraft/invisible-cassette)
Three words or fewer each, in the film's type (IBM Plex Sans Condensed Bold) and colours, placed in each
picture's dark empty side with a soft shadow gradient behind it; 1280x720 JPEG plus a 200 px mobile check.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(HERE, "thumbnails/user_src"), os.path.join(HERE, "thumbnails")
W, H = 1280, 720
BLACK, AMBER, RED, WHITE = (6, 7, 10), (255, 176, 0), (255, 59, 48), (242, 240, 234)
BOLD = os.path.expanduser("~/.fonts/IBMPlexSansCondensed-Bold.ttf")


def load(name):
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    w, h = im.size; cw = min(w, round(h * 16 / 9)); ch = round(cw * 9 / 16)
    x0, y0 = (w - cw) // 2, (h - ch) // 2
    return im.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.LANCZOS)


def shade(img, side, strength=0.55, width=0.5):
    """darken the text side softly so the words read on any phone screen"""
    x = np.linspace(0, 1, W)
    ramp = np.clip((x - (1 - width)) / width, 0, 1) if side == "right" else np.clip((width - x) / width, 0, 1)
    a = np.asarray(img, float) * (1 - strength * ramp ** 1.5)[None, :, None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def fit(text, size, maxw):
    while True:
        f = ImageFont.truetype(BOLD, size); bb = f.getbbox(text)
        if bb[2] - bb[0] <= maxw or size <= 40: return f
        size -= 4


def words(img, lines, x, y_mid, align, maxw):
    d = ImageDraw.Draw(img)
    fonts = [fit(t, s, maxw) for t, s, _ in lines]
    hs = [f.getbbox(t)[3] - f.getbbox(t)[1] for (t, _, _), f in zip(lines, fonts)]
    y = y_mid - (sum(hs) + 12 * (len(lines) - 1)) / 2
    for (t, _, col), f, h in zip(lines, fonts, hs):
        bb = f.getbbox(t); w = bb[2] - bb[0]
        tx = x - w if align == "right" else x
        d.text((tx - bb[0], y - bb[1]), t, font=f, fill=col, stroke_width=6, stroke_fill=BLACK)
        y += h + 12
    return img


def make(out, src, lines, side, y_mid, maxw, strength=0.55):
    img = shade(load(src), side, strength)
    x, align = (W - 44, "right") if side == "right" else (44, "left")
    img = words(img, lines, x, y_mid, align, maxw)
    p = os.path.join(OUT, out); img.save(p, quality=92, optimize=True)
    img.resize((200, 112), Image.LANCZOS).save(p.replace(".jpg", "_200px.png"))
    print(p, os.path.getsize(p) // 1024, "KB")


# 1 · the hooded machine at the laptop: the words sit over the dark laptop lid, right of the hands
make("thumb_user1_nobody_decided.jpg", "idea1.jpg", [("NOBODY", 160, AMBER), ("DECIDED", 160, RED)], "right", 540, 520, 0.45)
# 2 · the machine at the breaker: the empty dark right half
make("thumb_user2_no_off_switch.jpg", "idea2.jpg", [("NO OFF", 170, WHITE), ("SWITCH", 170, RED)], "right", 360, 540)
# 3 · the machine holding Earth: the starfield on the right
make("thumb_user3_too_slow.jpg", "idea3.jpg", [("HUMANS:", 150, WHITE), ("TOO SLOW", 150, RED)], "right", 360, 430)
