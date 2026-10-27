#!/usr/bin/env python3
"""Add text and red-marker marks to the three Higgsfield thumbnail plates.

    python3 make_thumbs.py        # reads raw/T1-3.png, writes thumb_1-3.jpg (1920x1080) and squint.png

Fonts are the film's own: Fraunces Black (titles), IBM Plex Mono (receipts), red marker strokes.
"""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080
FRAUNCES = "/root/.fonts/Fraunces-Black.ttf"
MONO = "/root/.fonts/IBMPlexMono-Medium.ttf"
RED = (214, 40, 40)


def plate(n):
    return Image.open(os.path.join(HERE, "raw", f"T{n}.png")).convert("RGB").resize((W, H), Image.LANCZOS)


def font(path, size):
    return ImageFont.truetype(path, size)


def shadow_text(img, xy, text, f, fill, stroke=0, stroke_fill=(0, 0, 0), blur=18, shadow_alpha=170, anchor="la"):
    """Text with a soft drop shadow so it holds on any background at phone size."""
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((xy[0] + 6, xy[1] + 10), text, font=f, fill=(0, 0, 0, shadow_alpha),
                            stroke_width=stroke, stroke_fill=(0, 0, 0, shadow_alpha), anchor=anchor)
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(img).text(xy, text, font=f, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill, anchor=anchor)


def marker_loop(img, cx, cy, rx, ry, width=11, seed=3, turns=1.12, tilt=-6):
    """Hand-drawn red marker loop, like the circle around BET in the film."""
    rnd = random.Random(seed)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    pts = []
    start = math.radians(200)
    n = 160
    t = math.radians(tilt)
    for i in range(n + 1):
        a = start + 2 * math.pi * turns * i / n
        wob = 1 + 0.05 * math.sin(3 * a + 1.3) + 0.03 * math.sin(7 * a)
        x, y = rx * wob * math.cos(a), ry * wob * math.sin(a)
        pts.append((cx + x * math.cos(t) - y * math.sin(t), cy + x * math.sin(t) + y * math.cos(t)))
    for i in range(len(pts) - 1):
        w = int(width * (0.75 + 0.25 * math.sin(i / 9)))
        d.line([pts[i], pts[i + 1]], fill=RED + (235,), width=w)
        d.ellipse([pts[i][0] - w / 2, pts[i][1] - w / 2, pts[i][0] + w / 2, pts[i][1] + w / 2], fill=RED + (235,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(0.8)))


def fit(path, text, max_w, start):
    size = start
    while size > 20:
        f = font(path, size)
        if f.getbbox(text)[2] - f.getbbox(text)[0] <= max_w:
            return f
        size -= 4
    return font(path, size)


def save(img, n):
    out = os.path.join(HERE, f"thumb_{n}.jpg")
    img.convert("RGB").save(out, "JPEG", quality=92, optimize=True, progressive=True)
    return out


# 1. Bill shock: he stares at an A4 bill (no numbers on it). Hook: WHO PAYS?
im = Image.open(os.path.join(HERE, "raw", "T1b.png")).convert("RGB").resize((W, H), Image.LANCZOS).convert("RGBA")  # A4 bill version
f_big = fit(FRAUNCES, "PAYS?", 760, 300)
shadow_text(im, (1490, 330), "WHO", f_big, (255, 255, 255), anchor="ms")
shadow_text(im, (1490, 610), "PAYS?", f_big, (255, 214, 64), anchor="ms")
save(im, 1)

# 2. Direct gaze, 3 a.m., servers glowing red. Hook: THE REAL BILL
im = plate(2).convert("RGBA")
f_small = fit(FRAUNCES, "THE REAL", 520, 150)
f_bill = fit(FRAUNCES, "BILL", 560, 330)
shadow_text(im, (90, 380), "THE REAL", f_small, (255, 255, 255), anchor="ls")
shadow_text(im, (80, 650), "BILL", f_bill, RED, stroke=4, stroke_fill=(255, 255, 255), anchor="ls")
save(im, 2)

# 3. Magnifier, gaze toward the price. Hook: $20* (the asterisk is the curiosity gap)
im = Image.open(os.path.join(HERE, "raw", "T3b.png")).convert("RGB").resize((W, H), Image.LANCZOS).convert("RGBA")  # glasses visible through the magnifier
f_price = font(FRAUNCES, 290)
f_star = font(FRAUNCES, 220)
d = ImageDraw.Draw(im)
w_total = d.textlength("$20", font=f_price) + 8 + d.textlength("*", font=f_star)
x0 = 1480 - w_total / 2
d.text((x0, 590), "$20", font=f_price, fill=(28, 26, 24), anchor="ls")
d.text((x0 + d.textlength("$20", font=f_price) + 8, 420), "*", font=f_star, fill=RED, anchor="ls")
base3 = im.copy()  # $20* without the small print, for variant 3b
fine = ("*Plan limits apply. Usage beyond the allowance is billed in credits. Allowances may change. "
        "Heavy users may pay more. Prices shown are monthly. See terms for details.")
fm = font(MONO, 17)
lines, cur = [], ""
for word in fine.split():
    if fm.getlength(cur + " " + word) > 600:
        lines.append(cur.strip()); cur = word
    else:
        cur += " " + word
lines.append(cur.strip())
for i, ln in enumerate(lines):
    d.text((1180, 660 + i * 24), ln, font=fm, fill=(110, 100, 90))
marker_loop(im, 1478, 700, 360, 78, width=9, seed=9, tilt=-2)
save(im, 3)

# 3b. Same, but the small print is one readable line: "*Terms & conditions apply"
im = base3
d = ImageDraw.Draw(im)
tc = "*Terms & conditions apply"
ftc = fit(MONO, tc, 640, 60)
d.text((1478, 712), tc, font=ftc, fill=(58, 52, 46), anchor="mm")
tw = d.textlength(tc, font=ftc)
marker_loop(im, 1478, 712, tw / 2 + 50, 62, width=9, seed=9, tilt=-2)
save(im, "3b")

# Squint test: all three at 120 px and 320 px wide.
sheet = Image.new("RGB", (3 * 330 + 20, 200 + 90), (40, 40, 40))
for i in range(3):
    t = Image.open(os.path.join(HERE, f"thumb_{i + 1}.jpg"))
    sheet.paste(t.resize((320, 180), Image.LANCZOS), (10 + i * 330, 10))
    sheet.paste(t.resize((120, 68), Image.LANCZOS), (10 + i * 330, 205))
sheet.save(os.path.join(HERE, "squint.png"))
for i in range(3):
    p = os.path.join(HERE, f"thumb_{i + 1}.jpg")
    print(p, f"{os.path.getsize(p) / 1e6:.2f} MB")
