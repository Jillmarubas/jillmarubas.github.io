#!/usr/bin/env python3
"""World texture for the Scene 7 globe (CC Sphere): Natural Earth 1:50m countries (public domain), drawn
equirectangular in the trading-terminal palette. Usage: python3 -I tools/make_world.py <dir with ne_50m_admin_0_countries.geojson>
Writes assets/world.png (4096 x 2048)."""
import json, os, sys
from PIL import Image, ImageDraw
D = sys.argv[1]; Wd, Hd = 4096, 2048
feats = json.load(open(os.path.join(D, "ne_50m_admin_0_countries.geojson")))["features"]
im = Image.new("RGB", (Wd, Hd), (6, 7, 10)); dr = ImageDraw.Draw(im)
P = lambda lon, lat: ((lon + 180) / 360 * Wd, (90 - lat) / 180 * Hd)
for lon in range(-180, 181, 30): dr.line([P(lon, -90), P(lon, 90)], fill=(40, 30, 10), width=2)
for lat in range(-60, 61, 30): dr.line([P(-180, lat), P(180, lat)], fill=(40, 30, 10), width=2)
for f in feats:
    g = f["geometry"]; polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
    for poly in polys:
        ring = [P(x, y) for x, y in poly[0]]
        if len(ring) > 2: dr.polygon(ring, fill=(20, 22, 27), outline=(255, 176, 0))
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "world.png")
im.save(out); print("wrote", out)
