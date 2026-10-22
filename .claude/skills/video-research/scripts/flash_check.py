#!/usr/bin/env python3
"""Flash-safety check (WCAG 2.3.1, "Three Flashes or Below Threshold") for a rendered video.

Usage: python3 flash_check.py video.mp4 [--grid 3] [--width 192]
Exit code 0 = pass, 1 = fail, 2 = error.

How it works (an approximation of WCAG's general-flash and red-flash rules, not a certified
PEAT/Harding test):
- Frames are decoded small and split into a grid of tiles. 3x3 tiles are about 11% of the screen
  each, close to WCAG's minimum flashing area (25% of a 10-degree field, about 341x256 px on a
  1024x768 screen).
- General flash: per tile, the mean relative luminance (sRGB linearized, 0.2126R + 0.7152G +
  0.0722B). A transition is a swing of >= 0.10 from the last turning point, where the darker side
  is < 0.80. Two opposite transitions = one flash.
- Red flash: per tile, the red metric max(0, (R - G - B) * 320) on 0-1 linear values, counted only
  while the tile is saturated red (R / (R + G + B) >= 0.8). A transition is a swing of >= 20.
- Fail if any tile has more than 3 flashes inside any 1-second window.
"""
import argparse
import json
import subprocess
import sys

import numpy as np


def probe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
         'stream=width,height,r_frame_rate', '-of', 'json', path],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(out)['streams'][0]
    num, den = s['r_frame_rate'].split('/')
    return s['width'], s['height'], float(num) / float(den)


def frames(path, w, h):
    p = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}:flags=area', '-f', 'rawvideo',
         '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    size = w * h * 3
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    p.wait()


def srgb_to_linear(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def transitions(series, min_delta, dark_limit=None):
    """Indices where the value reverses after a swing of >= min_delta (turning-point method)."""
    out = []
    ref = series[0]
    direction = 0
    ext = series[0]
    for i in range(1, len(series)):
        v = series[i]
        if direction >= 0 and v > ext:
            ext = v
        elif direction <= 0 and v < ext:
            ext = v
        swing = v - ref
        if abs(swing) >= min_delta:
            darker = min(v, ref)
            if dark_limit is None or darker < dark_limit:
                new_dir = 1 if swing > 0 else -1
                if new_dir != direction:
                    out.append(i)
                    direction = new_dir
            ref = v
            ext = v
    return out


def worst_window(trans, fps):
    """Max number of flashes (pairs of transitions) inside any 1 s window, and its start frame."""
    win = int(round(fps))
    best, at = 0, 0
    j = 0
    for i in range(len(trans)):
        while trans[i] - trans[j] >= win:
            j += 1
        n = (i - j + 1) // 2
        if n > best:
            best, at = n, trans[j]
    return best, at


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--grid', type=int, default=3)
    ap.add_argument('--width', type=int, default=192)
    a = ap.parse_args()
    try:
        vw, vh, fps = probe(a.video)
    except Exception as e:  # noqa: BLE001
        print(f'error: cannot read {a.video}: {e}')
        return 2
    w = a.width - a.width % a.grid
    h = int(round(w * vh / vw))
    h -= h % a.grid
    g = a.grid
    lum, red = [], []
    for f in frames(a.video, w, h):
        lin = srgb_to_linear(f.astype(np.float32))
        L = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]
        tot = lin.sum(axis=2) + 1e-6
        sat_red = (lin[..., 0] / tot) >= 0.8
        rm = np.maximum(0, (lin[..., 0] - lin[..., 1] - lin[..., 2]) * 320) * sat_red
        tiles_L = L.reshape(g, h // g, g, w // g).mean(axis=(1, 3)).ravel()
        tiles_R = rm.reshape(g, h // g, g, w // g).mean(axis=(1, 3)).ravel()
        lum.append(tiles_L)
        red.append(tiles_R)
    if not lum:
        print('error: no frames decoded')
        return 2
    lum = np.array(lum)
    red = np.array(red)
    worst = {'general': (0, 0, -1), 'red': (0, 0, -1)}
    for t in range(lum.shape[1]):
        n, at = worst_window(transitions(lum[:, t], 0.10, dark_limit=0.80), fps)
        if n > worst['general'][0]:
            worst['general'] = (n, at, t)
        n, at = worst_window(transitions(red[:, t], 20.0), fps)
        if n > worst['red'][0]:
            worst['red'] = (n, at, t)
    fail = False
    print(f'{a.video}: {lum.shape[0]} frames at {fps:g} fps, {g}x{g} tiles')
    for kind in ('general', 'red'):
        n, at, tile = worst[kind]
        status = 'FAIL' if n > 3 else 'ok'
        fail |= n > 3
        where = f' (worst at {at / fps:.2f} s, tile {tile})' if n else ''
        print(f'  {kind:7s} flashes in worst 1 s window: {n}  [{status}]{where}')
    print('RESULT: FAIL (more than 3 flashes in 1 s)' if fail else 'RESULT: pass')
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
