#!/usr/bin/env python3
"""Bake the price onto the price-tag cut-out, so tag and price are one image (no drifting text).

    python3 bake_tags.py ASSETS_DIR  -> writes O03_tag_<price>.png for each price below
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
A = sys.argv[1]
FONT = "/root/.fonts/Fraunces-Black.ttf"
CX, CY, ANG = 1790, 735, 34   # centre of the tag body and its slant in the 2688x1520 image
PRICES = {"20mo": "$20/mo", "200mo": "$200/mo", "500mo": "$500/mo", "20": "$20"}
base = Image.open(os.path.join(A, "O03_price_tag.png")).convert("RGBA")
for key, s in PRICES.items():
    f = ImageFont.truetype(FONT, 185 if len(s) < 6 else 150)
    w = int(f.getlength(s)) + 40
    t = Image.new("RGBA", (w, 220), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((w / 2, 110), s, font=f, fill=(28, 24, 20, 238), anchor="mm")
    t = t.filter(ImageFilter.GaussianBlur(0.6)).rotate(-ANG, resample=Image.BICUBIC, expand=True)
    im = base.copy()
    # keep the ink only where the tag is (multiply-like: ink alpha limited by tag alpha)
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    layer.alpha_composite(t, (int(CX - t.width / 2), int(CY - t.height / 2)))
    r, g, b, a = layer.split()
    a = Image.composite(a, Image.new("L", im.size, 0), base.split()[3].point(lambda v: 255 if v > 200 else 0))
    layer.putalpha(a)
    im.alpha_composite(layer)
    im.save(os.path.join(A, f"O03_tag_{key}.png"))
    print("tag", key)
