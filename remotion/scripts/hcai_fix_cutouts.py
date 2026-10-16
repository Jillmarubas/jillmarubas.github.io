"""Hand fixes for cut-outs rembg got wrong. Run after hcai_finalize.py.

Each fix reads the untouched rembg output kept in out/hcai/<id>_rembg.webp (copied there the first time), so the
script can be re-run safely.
- water_bottle: rembg kept the bottle's dark cast shadow as a round blob under it. Keep the bottle's own silhouette
  (straight sides down to the base, then the base ellipse seen from slightly above) and drop everything outside it.
- question_mark: rembg kept wisps of the grey background around the sign (and in its hook). Keep only the red sign.
"""
import os, shutil
import numpy as np
from PIL import Image, ImageFilter
ROOT = os.path.join(os.path.dirname(__file__), '..')

def load(aid):
    keep = os.path.join(ROOT, f'out/hcai/{aid}_rembg.webp')
    pub = os.path.join(ROOT, f'public/hcai/cut/{aid}.webp')
    if not os.path.exists(keep): shutil.copy(pub, keep)
    return Image.open(keep).convert('RGBA'), pub

def save(aid, im, a, pub, pad=24):
    im.putalpha(Image.fromarray(a.astype(np.uint8)))
    bb = Image.fromarray(a.astype(np.uint8)).point(lambda v: 255 if v > 24 else 0).getbbox()
    w, h = im.size
    im = im.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(w, bb[2] + pad), min(h, bb[3] + pad)))
    im.save(pub, quality=90)
    print(aid, im.size)

def water_bottle():
    im, pub = load('water_bottle')
    w, h = im.size
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    # sides at y=905: 369..622, tapering a touch to 374..616 at y=990, where the base ellipse (centre 495,990; 121 x 46) begins
    top, base = 905.0, 990.0
    t = np.clip((yy - top) / (base - top), 0, 1)
    left, right = 369 + 5 * t, 622 - 6 * t
    inside = ((yy < top) & (xx >= 330) & (xx <= 655)) | ((yy <= base) & (xx >= left) & (xx <= right))  # 330..655 also drops a stray speck
    ell = ((xx - 495) / 121) ** 2 + ((yy - base) / 46) ** 2 <= 1
    mask = np.array(Image.fromarray(((inside | ell) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))
    save('water_bottle', im, np.minimum(np.array(im.split()[-1]), mask), pub)

def question_mark():
    im, pub = load('question_mark')
    px = np.array(im).astype(float)
    red = (px[..., 0] - px[..., 1:3].max(2) > 35) & (px[..., 3] > 24)  # the sign is red all over; the smoke is grey
    m = Image.fromarray((red * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))  # close: fill glints on the paint
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))  # open: drop specks
    save('question_mark', im, np.minimum(px[..., 3], np.array(m)), pub, pad=12)

water_bottle()
question_mark()
