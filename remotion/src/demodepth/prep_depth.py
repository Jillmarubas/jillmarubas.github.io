"""Prepare the depth-map parallax test from one archive photo.

Usage: python prep_depth.py <photo.jpg> <out_dir>
Needs: torch (CPU), transformers, opencv-python-headless, pillow, numpy.

Writes into out_dir (all 2400x1350, i.e. 1.25x the 1920x1080 frame so the camera can move):
- photo.png        the cropped photo
- depth.png        Depth Anything V2 Small depth (white = near), lightly smoothed
- clean.png        background with the standing objects removed and the hole filled in (inpainted)
- holes.png        same background with the holes left transparent (to show why filling matters)
- depth_bg.png     depth of the background with the objects removed (ground depth in the hole)
- obj_mid.png      cut-out: shack, farmer, sons, far posts (RGBA)
- obj_near.png     cut-out: the nearest posts and stumps (RGBA)
- layers.json      each layer's mean depth (0-1, 1 = nearest)
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image
from transformers import pipeline

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
PW, PH = 2400, 1350

# 1. Crop the print (drop the mount border) to a 16:9 band around the shack and the family.
im = Image.open(SRC).convert('RGB')
W0, H0 = im.size
x0, x1 = int(W0 * 0.038), int(W0 * 0.960)
cw = x1 - x0
ch = int(cw * 9 / 16)
cy = int(H0 * 0.585)
y0 = max(int(H0 * 0.034), cy - ch // 2)
crop = im.crop((x0, y0, x1, y0 + ch)).resize((PW, PH), Image.LANCZOS)
crop.save(os.path.join(OUT, 'photo.png'))
rgb = np.asarray(crop)

# 2. Depth Anything V2 Small (Apache-2.0). Output is relative inverse depth: larger = nearer.
pipe = pipeline('depth-estimation', model='depth-anything/Depth-Anything-V2-Small-hf', device='cpu')
pred = pipe(crop)['predicted_depth'].squeeze().numpy().astype(np.float32)
pred = cv2.resize(pred, (PW, PH), interpolation=cv2.INTER_CUBIC)
lo, hi = np.percentile(pred, 1), np.percentile(pred, 99.5)
disp = np.clip((pred - lo) / (hi - lo), 0, 1)
# Edge-preserving smoothing keeps object outlines but removes speckle.
disp = cv2.bilateralFilter(disp, 9, 0.08, 7)
Image.fromarray((disp * 255).astype(np.uint8)).save(os.path.join(OUT, 'depth.png'))

# 3. Standing objects = pixels clearly nearer than the ground at the same image row.
#    (The ground's depth changes smoothly with height in frame; posts, people and the shack
#    stick out of that trend.)
# Ground/sky behind = the farther pixels of each row (15th percentile), since objects are nearer.
row_ground = np.percentile(disp, 15, axis=1, keepdims=True).astype(np.float32)
row_ground = cv2.GaussianBlur(row_ground, (1, 61), 0)
stand = (disp - row_ground) > 0.05
stand[: int(PH * 0.15)] = False  # nothing stands in the upper sky
stand = cv2.morphologyEx(stand.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
stand = cv2.morphologyEx(stand, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(stand, 8)
mid = np.zeros((PH, PW), np.uint8)
near = np.zeros((PH, PW), np.uint8)
mid_d, near_d = [], []
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] < 400:
        continue
    m = lab == i
    d = float(np.median(disp[m]))
    # Clearly nearer objects (the front posts and stumps) get their own layer; the rest is mid.
    if d > 0.42:
        near[m] = 255
        near_d.append(d)
    else:
        mid[m] = 255
        mid_d.append(d)


def feather(mask, grow=4, soft=3):
    m = cv2.dilate(mask, np.ones((grow * 2 + 1,) * 2, np.uint8))
    return cv2.GaussianBlur(m, (soft * 2 + 1,) * 2, 0)


def rgba(mask):
    return Image.fromarray(np.dstack([rgb, mask]), 'RGBA')


mid_a, near_a = feather(mid), feather(near)
rgba(mid_a).save(os.path.join(OUT, 'obj_mid.png'))
rgba(near_a).save(os.path.join(OUT, 'obj_near.png'))

# 4. Background: remove the objects and fill the hole (the "clean plate").
hole = cv2.dilate(np.maximum(mid, near), np.ones((19, 19), np.uint8))
bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
small = cv2.resize(bgr, (PW // 2, PH // 2), interpolation=cv2.INTER_AREA)
small_hole = cv2.resize(hole, (PW // 2, PH // 2), interpolation=cv2.INTER_NEAREST)
filled_small = cv2.inpaint(small, small_hole, 12, cv2.INPAINT_TELEA)
filled = cv2.resize(filled_small, (PW, PH), interpolation=cv2.INTER_CUBIC)
# Keep full-res pixels outside the hole; blend the fill in softly.
a = cv2.GaussianBlur(hole, (21, 21), 0)[..., None].astype(np.float32) / 255
clean = (bgr * (1 - a) + filled * a).astype(np.uint8)
# Add matching grain inside the fill so it doesn't look smeared flat.
rng = np.random.default_rng(1936)
grain = rng.normal(0, 6, (PH, PW, 1)).astype(np.float32)
clean = np.clip(clean.astype(np.float32) + grain * a, 0, 255).astype(np.uint8)
Image.fromarray(cv2.cvtColor(clean, cv2.COLOR_BGR2RGB)).save(os.path.join(OUT, 'clean.png'))
Image.fromarray(np.dstack([rgb, 255 - hole]), 'RGBA').save(os.path.join(OUT, 'holes.png'))

# Background depth: inside the hole, use the ground/sky depth of that row (objects removed), so
# the filled background bends like the ground instead of popping forward where the shack was.
bg_depth = np.where(hole > 0, np.broadcast_to(row_ground, disp.shape), disp).astype(np.float32)
bg_depth = cv2.GaussianBlur(bg_depth, (0, 0), 6)
bg_depth = disp * (1 - a[..., 0]) + bg_depth * a[..., 0]
Image.fromarray((np.clip(bg_depth, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'depth_bg.png'))

# The background card sits behind the subjects, at the depth of the horizon band (the classic
# layered setup: one flat card per layer). Objects sit at their own median depth.
band = np.zeros_like(hole)
band[int(PH * 0.40):int(PH * 0.55)] = 1
bg_d = float(np.median(disp[(hole == 0) & (band == 1)]))
json.dump({
    'background': round(bg_d, 4),
    'mid': round(float(np.median(mid_d)) if mid_d else bg_d, 4),
    'near': round(float(np.median(near_d)) if near_d else bg_d, 4),
    'objects': {'mid': len(mid_d), 'near': len(near_d)},
}, open(os.path.join(OUT, 'layers.json'), 'w'), indent=2)
print('done', json.load(open(os.path.join(OUT, 'layers.json'))))
