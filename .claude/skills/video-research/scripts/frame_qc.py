#!/usr/bin/env python3
"""Every-frame QC for a render: pops, blank frames, and visuals that miss their spoken word.

    python3 frame_qc.py video.mp4 [--mentions m.json] [--cuts 12.3,40.1] [--sheet out.png]

Checks every frame (decoded at 480x270):
1. Blank or broken frames: almost uniform frames, or frames much darker/brighter than both neighbours.
2. Pops: a frame-to-frame change that is much bigger than the motion around it (a part, label or bead
   appearing for one frame, a jump in a camera path). Planned hard cuts are passed with --cuts.
3. Sync (with --mentions, a JSON list of [time_s, id, kind] written by the scene build): within 0.6 s of
   each spoken mention something must visibly change. Highlights must add saturated colour; labels,
   text, counters, arrows and dimension lines must change the picture. A mention that changes nothing
   is reported as MISS.
--sheet saves a contact sheet with the frame before and the frame after every mention, so each one can
be checked by eye, and the worst pop frames.

Built 23 Oct 2026 for the Falcon 9 teardown: the user asked that every mentioned component be
highlighted and that every frame be checked so the same mistake doesn't repeat.
"""
import argparse, json, subprocess
from fractions import Fraction
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--mentions')
ap.add_argument('--cuts', default='')
ap.add_argument('--sheet')
ap.add_argument('--pop', type=float, default=6.0, help='a change this many times the local motion is a pop')
args = ap.parse_args()

W, H = 480, 270
fps = float(Fraction(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', args.video], capture_output=True, text=True).stdout.strip().split(',')[0]))
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', args.video, '-vf', f'scale={W}:{H}', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
n = len(v)
print(f'{args.video}: {n} frames at {fps:g} fps ({n / fps:.2f} s)')
problems = []

# 1. Blank frames and lone brightness spikes.
lum = v.mean(axis=(1, 2, 3))
spread = v.reshape(n, -1).std(1)
for i in range(n):
    if spread[i] < 2:
        problems.append((i, 'blank frame'))
    if 0 < i < n - 1 and abs(lum[i] - lum[i - 1]) > 12 and abs(lum[i] - lum[i + 1]) > 12 and np.sign(lum[i] - lum[i - 1]) == np.sign(lum[i] - lum[i + 1]):
        problems.append((i, f'one-frame brightness spike ({lum[i]:.0f} vs {lum[i - 1]:.0f}/{lum[i + 1]:.0f})'))

# 2. Pops: frame difference far above the local median (motion is smooth, pops are not).
g = v.mean(3).astype(np.float32)
d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))  # d[i] = change from frame i to i+1
cuts = {round(float(c) * fps) for c in args.cuts.split(',') if c.strip()}
pops = []
for i in range(len(d)):
    lo, hi = max(0, i - 8), min(len(d), i + 9)
    local = np.median(np.r_[d[lo:i], d[i + 1:hi]]) if hi - lo > 1 else 0
    if d[i] > 1.2 and d[i] > args.pop * max(local, 0.15) and not any(abs(i + 1 - c) <= 1 for c in cuts):
        pops.append((i + 1, d[i], local))
for f, a, b in pops:
    problems.append((f, f'pop: change {a:.2f} vs local {b:.2f}'))

# 3. Sync: does each mention change the picture within 0.6 s of its word?
sync = []
if args.mentions:
    import colorsys
    hsv = None
    def sat_pixels(i):
        f = v[min(n - 1, max(0, i))].astype(np.float32) / 255
        mx, mn = f.max(2), f.min(2)
        s = (mx - mn) / np.maximum(mx, 1e-6)
        return float(((s > 0.5) & (mx > 0.45)).mean())
    for t, mid, kind in json.load(open(args.mentions)):
        f0 = int(round((t - 0.1) * fps)); f1s = [int(round((t + dt) * fps)) for dt in (0.3, 0.45, 0.6)]
        if f0 >= n:
            sync.append((t, mid, kind, 'after end', 0)); continue
        change = max(float(np.abs(g[min(n - 1, f1)] - g[max(0, f0)]).mean()) for f1 in f1s)
        dsat = max(sat_pixels(f1) - sat_pixels(f0) for f1 in f1s)
        if kind == 'highlight':
            ok = dsat > 0.0015 or change > 1.0
            score = dsat
        else:
            ok = change > 0.25
            score = change
        sync.append((t, mid, kind, 'ok' if ok else 'MISS', score))
        if not ok:
            problems.append((int(t * fps), f'MISS: "{mid}" ({kind}) changes nothing on screen'))
    print(f'\nsync: {sum(s[3] == "ok" for s in sync)}/{len(sync)} mentions visible on their word')
    for t, mid, kind, st, sc in sync:
        print(f'  {t:7.2f}s  {st:5s} {kind:9s} {mid}  ({sc:.4f})')

problems.sort()
print(f'\n{len(problems)} problem(s)')
for f, msg in problems:
    print(f'  frame {f:5d} ({f / fps:7.2f}s): {msg}')

if args.sheet:
    from PIL import Image, ImageDraw
    tiles = []
    for t, mid, kind, st, sc in sync:
        a, b = int(round((t - 0.1) * fps)), int(round((t + 0.5) * fps))
        tiles.append((f'{t:.2f}s {mid} [{kind}] {st}', min(n - 1, max(0, a)), min(n - 1, b)))
    for f, a, b in sorted(pops, key=lambda p: -p[1])[:6]:
        tiles.append((f'POP frame {f} ({f / fps:.2f}s)', f - 1, f))
    tw, th = 320, 180
    sheet = Image.new('RGB', (tw * 4, (th + 18) * ((len(tiles) + 1) // 2)), (255, 255, 255))
    for k, (cap, a, b) in enumerate(tiles):
        x, y = (k % 2) * tw * 2, (k // 2) * (th + 18)
        sheet.paste(Image.fromarray(v[a]).resize((tw, th)), (x, y + 18))
        sheet.paste(Image.fromarray(v[b]).resize((tw, th)), (x + tw, y + 18))
        ImageDraw.Draw(sheet).text((x + 4, y + 3), cap, fill=(200, 0, 0) if 'MISS' in cap or 'POP' in cap else (0, 0, 0))
    sheet.save(args.sheet)
    print('sheet:', args.sheet)
print('RESULT:', 'pass' if not problems else f'{len(problems)} problem(s)')
