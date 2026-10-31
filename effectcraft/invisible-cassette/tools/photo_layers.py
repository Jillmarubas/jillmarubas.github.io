#!/usr/bin/env python3
"""Split one public-domain photo into three parallax layers (the paste's PhotoCraft rule + SOP method B).

Usage (venv with onnxruntime, opencv-python-headless, pillow, numpy, huggingface_hub):
  python tools/photo_layers.py <photo> <out_dir> [--crop X0,X1] [--cy 0.5] [--delta 0.05] [--near 0.42] [--sky 0.15]

1. Crop to 16:9 and resize to 2400x1350 (1.25x the frame, so the camera can move).
2. Depth: Depth Anything V2 Small (Apache-2.0), ONNX weights from onnx-community, on the CPU.
3. Masks, as in remotion/src/parallax/prep_depth.py: pixels clearly nearer than the ground of their row
   are "standing"; components above --near are the foreground occlusion layer, the rest the midground.
4. PhotoCraft does the cutting: each mask is placed into the photo, loaded as a selection, refined
   (Refine Edge, feather 0.75 px) and output as a new layer with a mask; the same selection, expanded
   12 px, is Content-Aware Filled on the background plate. Every layer is exported at the same
   2400x1350 canvas with alpha for 1:1 alignment in EffectCraft.
Writes: photo.png, depth.png, mask_mid.png, mask_near.png, bg.png (Layer 0), mid.png (Layer 1),
near.png (Layer 2), check.jpg.
"""
import argparse, json, os, subprocess, sys
import cv2, numpy as np
from PIL import Image

PC = "/opt/pc/photocraft-0.17.0-linux-x86_64/bin/photocraft-cli"
Image.MAX_IMAGE_PIXELS = None
ap = argparse.ArgumentParser()
ap.add_argument("photo"); ap.add_argument("out")
ap.add_argument("--crop", default="0,1"); ap.add_argument("--cy", type=float, default=0.5)
ap.add_argument("--delta", type=float, default=0.05); ap.add_argument("--near", type=float, default=0.42)
ap.add_argument("--sky", type=float, default=0.15)
ap.add_argument("--fg-rows", type=float, default=0.0, help="also put every row below this fraction of the height on the foreground layer (e.g. water or ground nearest the lens)")
a = ap.parse_args()
OUT = os.path.abspath(a.out); os.makedirs(OUT, exist_ok=True)
PW, PH = 2400, 1350

# 1. crop
im = Image.open(a.photo).convert("RGB"); W0, H0 = im.size
f0, f1 = (float(v) for v in a.crop.split(","))
x0, x1 = int(W0 * f0), int(W0 * f1); cw = x1 - x0; ch = int(cw * 9 / 16)
if ch > H0: ch = H0; cw = int(ch * 16 / 9); x0 = (x0 + x1 - cw) // 2
y0 = min(max(0, int(H0 * a.cy) - ch // 2), H0 - ch)
if cw < 2400: print(f"warning: source band is {cw} px wide (< 2400)", file=sys.stderr)
crop = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((PW, PH), Image.LANCZOS)
photo = os.path.join(OUT, "photo.png"); crop.save(photo)
rgb = np.asarray(crop)

# 2. depth (ONNX Depth Anything V2 Small)
import onnxruntime as ort
from huggingface_hub import hf_hub_download
sess = ort.InferenceSession(hf_hub_download("onnx-community/depth-anything-v2-small", "onnx/model.onnx"))
iw, ih = 924, 518  # multiples of 14, 16:9
x = cv2.resize(rgb, (iw, ih), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
pred = sess.run(None, {"pixel_values": x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
pred = cv2.resize(pred.astype(np.float32), (PW, PH), interpolation=cv2.INTER_CUBIC)
lo, hi = np.percentile(pred, 1), np.percentile(pred, 99.5)
disp = cv2.bilateralFilter(np.clip((pred - lo) / (hi - lo), 0, 1).astype(np.float32), 9, 0.08, 7)
Image.fromarray((disp * 255).astype(np.uint8)).save(os.path.join(OUT, "depth.png"))

# 3. masks (same logic as prep_depth.py)
row_ground = cv2.GaussianBlur(np.percentile(disp, 15, axis=1, keepdims=True).astype(np.float32), (1, 61), 0)
stand = (disp - row_ground) > a.delta
stand[: int(PH * a.sky)] = False
stand = cv2.morphologyEx(stand.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
stand = cv2.morphologyEx(stand, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(stand, 8)
mid = np.zeros((PH, PW), np.uint8); near = np.zeros((PH, PW), np.uint8); depths = {"mid": [], "near": []}
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] < 400: continue
    m = lab == i; d = float(np.median(disp[m]))
    (near if d > a.near else mid)[m] = 255; depths["near" if d > a.near else "mid"].append(d)
# big merged components (a trading post joined to the crowd) also split per pixel: the clearly
# nearest parts (depth above --near) become the foreground occlusion layer
both = np.maximum(mid, near) > 0
near = (both & (cv2.GaussianBlur(disp, (0, 0), 3) > a.near)).astype(np.uint8) * 255
near = cv2.morphologyEx(near, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
mid = ((both & (near == 0))).astype(np.uint8) * 255
if a.fg_rows > 0:
    near[int(PH * a.fg_rows):, :] = 255; mid[int(PH * a.fg_rows):, :] = 0


def mask_png(m, name):
    p = os.path.join(OUT, name)
    Image.fromarray(np.dstack([np.full_like(m, 255)] * 3 + [m]), "RGBA").save(p)
    return p


mm, mn = mask_png(mid, "mask_mid.png"), mask_png(near, "mask_near.png")
mu = mask_png(np.maximum(mid, near), "mask_all.png")


# 4. PhotoCraft: refine-edge cut-outs and the content-aware-filled plate
def pc(*args):
    r = subprocess.run([PC, "run", photo, *args], capture_output=True, text=True)
    if r.returncode: raise SystemExit("photocraft: " + r.stderr[-800:])
    return r.stdout


def placed_select(mask):  # place the mask, load its transparency as the selection, remove it
    return ["--cmd", "file.placeEmbedded", "--params", json.dumps({"path": mask, "fit": False, "smartObject": False}),
            "--cmd", "select.loadSelection", "--params", json.dumps({"channel": "transparency"}),
            "--cmd", "layer.delete", "--params", "{}",
            "--cmd", "layer.select", "--params", json.dumps({"name": "Background"})]


def cutout(mask, name):
    if not np.asarray(Image.open(mask))[..., 3].any():
        Image.new("RGBA", (PW, PH)).save(os.path.join(OUT, name)); return
    tmp = os.path.join(OUT, "_" + name)
    pc(*placed_select(mask), "--cmd", "select.refineEdge", "--params", json.dumps({"radius": 2, "feather": 0.75, "output": "newLayerWithMask"}),
       "--cmd", "layer.exportAs", "--params", json.dumps({"path": tmp}))
    c = np.asarray(Image.open(tmp).convert("RGBA")).astype(int); h, w = c.shape[:2]; m = c[..., 3] > 250
    ys, xs = np.nonzero(np.asarray(Image.open(mask))[..., 3] > 0)
    best = min(((np.abs(rgb[y:y + h, xx:xx + w][m] - c[..., :3][m]).mean(), xx, y)
                for y in range(max(0, ys.min() - 8), min(PH - h, ys.min() + 8) + 1)
                for xx in range(max(0, xs.min() - 8), min(PW - w, xs.min() + 8) + 1)))
    full = Image.new("RGBA", (PW, PH)); full.paste(Image.open(tmp).convert("RGBA"), (best[1], best[2]))
    full.save(os.path.join(OUT, name)); os.remove(tmp)


cutout(mm, "mid.png"); cutout(mn, "near.png")
pc(*placed_select(mu), "--cmd", "select.modify.expand", "--params", '{"radius": 12}',
   "--cmd", "edit.contentAwareFill", "--params", '{"sampling": "auto"}', "--out", os.path.join(OUT, "bg.png"))

# check sheet: photo | depth / bg | mid+near on red
red = Image.new("RGBA", (PW, PH), (200, 0, 0, 255))
red.alpha_composite(Image.open(os.path.join(OUT, "mid.png"))); red.alpha_composite(Image.open(os.path.join(OUT, "near.png")).point(lambda v: v))
sheet = Image.new("RGB", (1200 * 2, 675 * 2))
for k, p in enumerate([crop, Image.open(os.path.join(OUT, "depth.png")).convert("RGB"), Image.open(os.path.join(OUT, "bg.png")).convert("RGB"), red.convert("RGB")]):
    sheet.paste(p.resize((1200, 675)), ((k % 2) * 1200, (k // 2) * 675))
sheet.save(os.path.join(OUT, "check.jpg"), quality=85)
json.dump({k: round(float(np.median(v)), 3) if v else None for k, v in depths.items()}, open(os.path.join(OUT, "layers.json"), "w"))
print("ok", OUT, {k: len(v) for k, v in depths.items()})
