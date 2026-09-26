"""Tile out/frames/*.jpg into timestamped 4x4 contact sheets for review."""
import glob, sys, os
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
fs = sorted(glob.glob("out/frames/f*.jpg"))
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 18)
except OSError:
    font = ImageFont.load_default()
per, tw, th = 16, 480, 270
for k in range(0, len(fs), per):
    sheet = Image.new("RGB", (tw * 4, th * 4), "black")
    for i, f in enumerate(fs[k:k + per]):
        im = Image.open(f).convert("RGB").resize((tw, th))
        fr = int(os.path.basename(f)[1:6]); t = fr / 30
        d = ImageDraw.Draw(im)
        label = f"{int(t // 60)}:{t % 60:04.1f}  f{fr}"
        d.rectangle([0, 0, 190, 26], fill=(0, 0, 0))
        d.text((6, 3), label, fill=(255, 255, 255), font=font)
        sheet.paste(im, ((i % 4) * tw, (i // 4) * th))
    sheet.save(f"{out}/sheet_{k // per:02d}.jpg", quality=85)
print(len(fs), "frames")
