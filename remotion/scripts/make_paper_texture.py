"""Paper-fibre texture for the Paper Kite film (multiply overlay, 1080x1920, drawn in code)."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
rng = np.random.default_rng(7)

def blur_noise(scale, sigma):
    n = rng.standard_normal((H // scale + 2, W // scale + 2)).astype(np.float32)
    img = Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(img.filter(ImageFilter.GaussianBlur(sigma)), np.float32) / 255 - 0.5

base = 0.55 * blur_noise(60, 30) + 0.35 * blur_noise(12, 4) + 0.25 * blur_noise(2, 0.6)
fib = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(fib)
for _ in range(2600):  # short paper fibres
    x, y = rng.uniform(0, W), rng.uniform(0, H)
    a, L = rng.uniform(0, np.pi), rng.uniform(6, 26)
    pts = [(x + np.cos(a + k * 0.15) * L * k / 4, y + np.sin(a + k * 0.15) * L * k / 4) for k in range(5)]
    d.line(pts, fill=int(rng.uniform(40, 110)), width=1)
fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.5)), np.float32) / 255
v = 236 + base * 26 - fib * 24
out = Image.fromarray(np.clip(v, 0, 255).astype(np.uint8))
path = os.path.join(os.path.dirname(__file__), '..', 'public', 'paperkite', 'fiber.png')
out.save(path, optimize=True)
print('saved', path, os.path.getsize(path))
