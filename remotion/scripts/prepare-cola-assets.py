"""Prepare assets for the ColaOrigin video.

- Coin faces: crops the public-domain 1887 Liberty Head nickel scan (Smithsonian NNC via
  Wikimedia Commons) into circular obverse/reverse colour maps plus a relief (bump) map.
- Sound: decodes the CC0 BigSoundBank recordings in public/sfx/*.mp3 and peak-normalises
  them to -1 dBFS WAVs so levels in the mix are predictable.
Needs: pip install pillow numpy ; npm install (for remotion's ffmpeg)
"""
import os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..')
ARC = os.path.join(ROOT, 'public', 'archive')

scan = Image.open(os.path.join(ARC, 'nickel_1887.jpg')).convert('RGB')
W, H = scan.size
for name, cx in (('obverse', W * 0.254), ('reverse', W * 0.746)):
    r = H * 0.468
    face = scan.crop((int(cx - r), int(H / 2 - r), int(cx + r), int(H / 2 + r))).resize((1024, 1024), Image.LANCZOS)
    mask = Image.new('L', (1024, 1024), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 1023, 1023), fill=255)
    # desaturate slightly toward nickel grey, keep the patina
    a = np.asarray(face).astype(np.float32)
    grey = a.mean(2, keepdims=True)
    a = a * 0.55 + grey * 0.45
    col = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    bg = Image.new('RGB', (1024, 1024), (150, 150, 146))
    bg.paste(col, (0, 0), mask)
    bg.save(os.path.join(ARC, f'nickel_{name}.jpg'), quality=92)
    # relief: high-pass of luminance so raised design catches light
    l = np.asarray(col.convert('L')).astype(np.float32)
    blur = np.asarray(col.convert('L').filter(ImageFilter.GaussianBlur(18))).astype(np.float32)
    hp = np.clip((l - blur) * 2.2 + 128, 0, 255).astype(np.uint8)
    rel = Image.fromarray(hp).filter(ImageFilter.GaussianBlur(1.2))
    rb = Image.new('L', (1024, 1024), 128)
    rb.paste(rel, (0, 0), mask)
    rb.save(os.path.join(ARC, f'nickel_{name}_bump.png'))
print('coin textures ready')

SFX = os.path.join(ROOT, 'public', 'sfx')
for f in sorted(os.listdir(SFX)):
    if not f.endswith('.mp3'):
        continue
    wav = os.path.join(SFX, f[:-4] + '.wav')
    subprocess.run(['npx', 'remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(SFX, f), '-ac', '2', '-ar', '48000', wav], check=True, cwd=ROOT)
    import wave
    w = wave.open(wav)
    n, ch = w.getnframes(), w.getnchannels()
    d = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32)
    w.close()
    # Loudness-normalise the body of the sound, not its peak: a single click would
    # otherwise set the gain and leave the rest of the recording inaudible.
    frames = d.reshape(-1, ch).mean(1)
    win = 4800
    blocks = np.array([np.sqrt((frames[i:i + win] ** 2).mean()) for i in range(0, max(1, len(frames) - win), win)] or [1.0])
    active = blocks[blocks > blocks.max() * 0.1]
    body = np.median(active) if len(active) else blocks.max()
    target = 32767 * 10 ** (-16 / 20)
    d = d * (target / max(body, 1.0))
    d = np.tanh(d / 32767 / 0.9) * 0.9 * 32767  # soft-limit peaks below -1 dBFS
    w = wave.open(wav, 'wb')
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(48000)
    w.writeframes(d.astype(np.int16).tobytes()); w.close()
    print('sfx', f[:-4], f'{n/48000:.1f}s')
