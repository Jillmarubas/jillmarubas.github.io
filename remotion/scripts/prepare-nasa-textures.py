"""Download NASA public-domain Moon and Earth maps and convert them for three.js.

Writes public/real/: moon_color_4k.jpg, moon_height_4k.png, moon_normal_4k.jpg,
earth_day_4k.jpg, earth_clouds.jpg. Needs: pip install pillow numpy
Sources: NASA SVS CGI Moon Kit (LRO/LOLA), NASA Visible Earth Blue Marble.
"""
import os, subprocess
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'real')
os.makedirs(OUT, exist_ok=True)
SRC = {
    'moon_color.tif': 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_16bit_srgb_4k.tif',
    'moon_height.tif': 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_16_uint.tif',
    'earth_day.jpg': 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.200412.3x5400x2700.jpg',
    'earth_clouds.jpg': 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg',
}
for name, url in SRC.items():
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        subprocess.run(['curl', '-sSf', '-o', path, url], check=True)

a = np.asarray(Image.open(os.path.join(OUT, 'moon_color.tif')))
if a.dtype != np.uint8:
    a = (a / 257).astype(np.uint8)
Image.fromarray(a).convert('RGB').save(os.path.join(OUT, 'moon_color_4k.jpg'), quality=92)

h = np.asarray(Image.open(os.path.join(OUT, 'moon_height.tif'))).astype(np.float32)
lo, hi = np.percentile(h, 0.5), np.percentile(h, 99.5)
height = Image.fromarray((np.clip((h - lo) / (hi - lo), 0, 1) * 255).astype(np.uint8)).resize((4096, 2048), Image.LANCZOS)
height.save(os.path.join(OUT, 'moon_height_4k.png'))

# Tangent-space normal map from the height field (u = east, v = north).
hh = np.asarray(height).astype(np.float32) / 255
dx = np.roll(hh, -1, 1) - np.roll(hh, 1, 1)
dy = np.roll(hh, -1, 0) - np.roll(hh, 1, 0)
nx, ny, nz = -dx * 18, dy * 18, np.ones_like(hh)
length = np.sqrt(nx**2 + ny**2 + nz**2)
normal = np.stack([(nx / length + 1) / 2, (ny / length + 1) / 2, (nz / length + 1) / 2], -1)
Image.fromarray((normal * 255).astype(np.uint8)).save(os.path.join(OUT, 'moon_normal_4k.jpg'), quality=92)

Image.open(os.path.join(OUT, 'earth_day.jpg')).resize((4096, 2048), Image.LANCZOS).save(os.path.join(OUT, 'earth_day_4k.jpg'), quality=90)
for tmp in ('moon_color.tif', 'moon_height.tif', 'earth_day.jpg'):
    os.remove(os.path.join(OUT, tmp))
print('textures ready in', os.path.abspath(OUT))
