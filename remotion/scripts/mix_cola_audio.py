"""Mix and master the ColaOrigin soundtrack into one file: public/cola-mix.wav.

Reads src/cola/timeline.json (the same timing the animation uses), places every CC0
recording from public/sfx at its cue, adds the music bed, then masters:
  - overall level to TARGET_RMS (about -16 dBFS; social platforms play at -14 LUFS)
  - a look-ahead peak limiter at -1 dBFS so nothing clips
Prints, for every cue, how far its loudest 100 ms sits above the music underneath.
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
TARGET_RMS_DB = -14.5
CEILING = 10 ** (-1 / 20)
MUSIC_GAIN = 0.22

def load(path):
    w = wave.open(path)
    ch, sr, n = w.getnchannels(), w.getframerate(), w.getnframes()
    d = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32).reshape(-1, ch) / 32768
    if ch == 1:
        d = np.repeat(d, 2, axis=1)
    assert sr == SR, (path, sr)
    return d

tl = json.load(open(os.path.join(ROOT, 'src/cola/timeline.json')))
fps = tl['fps']
N = int(tl['cuts'][-1] / fps * SR)
music = load(os.path.join(ROOT, 'public/cola-music.wav'))[:N] * MUSIC_GAIN
fx = np.zeros((N, 2), np.float32)
for c in tl['cues']:
    src = load(os.path.join(ROOT, 'public/sfx', c['file'] + '.wav'))
    a = int(c['from'] * SR)
    seg = src[a:a + int(c['len'] * SR)].copy()
    fi, fo = int(0.008 * SR), min(len(seg) // 3, int(0.06 * SR))
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]
    seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
    i0 = int(c['at'] / fps * SR)
    if i0 < 0:
        seg, i0 = seg[-i0:], 0
    seg = seg[: N - i0]
    fx[i0:i0 + len(seg)] += seg * c['gain']
mix = music + fx

# master: level, then look-ahead limiter (5 ms look-ahead, 80 ms release)
rms = np.sqrt((mix ** 2).mean())
mix *= 10 ** (TARGET_RMS_DB / 20) / rms
peak = np.abs(mix).max(1)
look = int(0.005 * SR)
need = np.minimum(1.0, CEILING / np.maximum(peak, 1e-9))
# minimum over the look-ahead window so gain is down before the peak arrives
pad = np.concatenate([need, np.ones(look)])
win = np.lib.stride_tricks.sliding_window_view(pad, look + 1).min(1)[:N]
rel = np.exp(-1 / (0.08 * SR))
g = np.empty(N, np.float32); cur = 1.0
for i in range(N):  # attack instantly, release slowly
    t = win[i]
    cur = t if t < cur else t + (cur - t) * rel
    g[i] = cur
mix *= g[:, None]
out = np.clip(mix, -1, 1)

with wave.open(os.path.join(ROOT, 'public/cola-mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
subprocess.run(['npx', 'remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', 'public/cola-mix.wav', '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', 'out/cola-soundtrack.m4a'], cwd=ROOT, check=True)

db = lambda x: 20 * np.log10(max(float(x), 1e-9))
mono, mus = out.mean(1), (music * (10 ** (TARGET_RMS_DB / 20) / rms)).mean(1)
print(f'master: rms {db(np.sqrt((mono**2).mean())):.1f} dBFS, peak {db(np.abs(out).max()):.1f} dBFS, limiter max reduction {db(g.min()):.1f} dB')
for c in tl['cues']:
    a = int(c['at'] / fps * SR); b = a + int(min(c['len'], 1.0) * SR); w = int(0.1 * SR)
    seg = mono[a:b]
    if len(seg) <= w:
        continue
    loud = max(np.sqrt((seg[i:i + w] ** 2).mean()) for i in range(0, len(seg) - w, w // 2))
    under = np.sqrt((mus[a:b] ** 2).mean())
    print(f"  {c['at']/fps:5.1f}s {c['id']:9s} {c['file']:13s} peak {db(loud):6.1f} dBFS  (+{db(loud)-db(under):4.1f} dB over music)")
