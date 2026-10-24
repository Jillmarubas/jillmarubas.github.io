#!/usr/bin/env python3
"""Find flicker in a render: pixels that brighten then darken (or the reverse) on back-to-back frames.

Real motion moves an edge one way; flicker (z-fighting, shadow acne, strobing stripes, popping
particles, jittering labels) flips back and forth. This scores that flip-flop per second and saves a
heat map of where it happens, so the cause can be found before the final render.

    python3 flicker_check.py video.mp4 [--map out.png] [--limit 25000]

Built on 23 Oct 2026 for the compressor cutaway (the user saw flicker in both Remotion and
HyperFrames renders). Seconds over --limit are listed as FLICKER; fast real motion (a spinning part)
also scores, so look at the map before changing anything.
"""
import argparse
import subprocess

import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--map', default=None, help='save a heat map PNG (red = flicker) over a mid frame')
ap.add_argument('--limit', type=float, default=25000, help='per-second score that counts as flicker')
ap.add_argument('--fps', type=float, default=None)
args = ap.parse_args()

W, H = 480, 270
from fractions import Fraction
fps = args.fps or float(Fraction(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', args.video], capture_output=True, text=True).stdout.strip().split(',')[0]))
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', args.video, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.diff(v, axis=0)
flip = (np.sign(d[1:]) != np.sign(d[:-1])) & (np.abs(d[1:]) > 6) & (np.abs(d[:-1]) > 6)
amp = np.minimum(np.abs(d[1:]), np.abs(d[:-1])) * flip
per = amp.reshape(len(amp), -1).sum(1)

bad = 0
for sec in range(int(np.ceil(len(per) / fps))):
    seg = per[int(sec * fps):int((sec + 1) * fps)]
    if not len(seg):
        continue
    flag = seg.mean() > args.limit
    bad += flag
    print(f'{sec:3d}s  score {seg.mean():9.0f}  peak {seg.max():9.0f}{"  FLICKER" if flag else ""}')

if args.map:
    from PIL import Image
    h = amp.mean(0)
    h = np.clip(h / (np.percentile(h, 99.8) + 1e-6), 0, 1)
    mid = len(v) // 2
    fr = np.repeat(v[mid][..., None], 3, 2) * 0.6
    fr[..., 0] = np.clip(fr[..., 0] + h * 255, 0, 255)
    Image.fromarray(fr.astype(np.uint8)).save(args.map)
    print('map:', args.map)
print('RESULT:', 'pass' if bad == 0 else f'{bad} second(s) over the limit')
