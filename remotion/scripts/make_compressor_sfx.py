"""Sound for the compressor cutaway demo (src/cutaway). Writes public/cutaway/compressor_sfx.wav.

Layers (Murch's rule of five, one of each kind). The user found the first two mixes comic
(pitched "boop" ticks, a slide-whistle rise, a pitch-drop "bonk"), so everything here is
unpitched or inharmonic, short and low in the mix, like a documentary about real machines:
  1. motor hum      - 100/150/200/300 Hz partials with slow beating, starts a beat before the motor turns
  2. mechanics      - valve clicks and the relay as band-passed noise transients (no sine bodies)
  3. metal          - one inharmonic clank when the parts seat back together
  4. whooshes       - two short CC0 whooshes from public/sfx: the slice and the explode
No noise beds, no label ticks, no rising tones.
The crank angle is the same function as compressor.ts (phiAt), so valve ticks land on the frames
where the reeds open.
"""
import math
import os
import subprocess
import wave

import numpy as np

SR = 48000
DUR = 27.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'cutaway', 'compressor_sfx.wav')

T = dict(sliceA=3.6, sliceB=5.4, explode=6.4, labels=[7.6, 8.4, 9.2, 10.0, 10.8], reassemble=12.7, cut=13.8,
         motorOn=14.3, fast=19.2, fastFull=21.2, pullBack=22.9, outLabel=23.9, end=27.0)
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def omega(s):
    if s < T['motorOn']:
        return 0.0
    if s < T['motorOn'] + 0.5:
        return 0.22 * (s - T['motorOn']) / 0.5
    if s < T['fast']:
        return 0.22
    if s < T['fastFull']:
        k = (s - T['fast']) / (T['fastFull'] - T['fast'])
        return 0.22 + (1.6 - 0.22) * float(smooth(k))
    return 1.6


# Crank angle, integrated exactly like phiAt() in compressor.ts (dt = 1/600 s), plus the rest angle.
DT = 1 / 600
cache = [0.0]
for i in range(int(DUR / DT) + 2):
    cache.append(cache[-1] + 2 * math.pi * omega(i * DT) * DT)
cache = np.array(cache)
phi = 0.35 + np.interp(t, np.arange(len(cache)) * DT, cache)
p = np.mod(phi, 2 * math.pi)
P_SUC = (0.6, math.pi)
P_DIS = (5.0, 2 * math.pi)


def bump(p, a, b):
    x = np.where((p > a) & (p < b), np.sin(math.pi * (p - a) / (b - a)), 0.0)
    return np.sqrt(np.clip(x, 0, 1))


def noise(n):
    return rng.standard_normal(n)


def onepole_lp(x, fc):
    a = math.exp(-2 * math.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def bandpass(x, f0, q=1.2):
    """Biquad band-pass with a per-sample centre frequency (array or float)."""
    f0 = np.broadcast_to(np.asarray(f0, dtype=float), x.shape)
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        w = 2 * math.pi * f0[i] / SR
        al = math.sin(w) / (2 * q)
        b0, b2 = al, -al
        a0, a1, a2 = 1 + al, -2 * math.cos(w), 1 - al
        yi = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[i]
        y2, y1 = y1, yi
        y[i] = yi
    return y


def env(a, b, fade_in=0.05, fade_out=0.3):
    return smooth((t - a) / max(fade_in, 1e-3)) * (1 - smooth((t - (b - fade_out)) / max(fade_out, 1e-3)))


def db(x):
    return 10 ** (x / 20)


def load_mp3(name):
    path = os.path.join(ROOT, 'public', 'sfx', name)
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def place(buf, clip, at, gain):
    i = int(at * SR)
    j = min(N, i + len(clip))
    if i < N and j > i:
        buf[i:j] += clip[: j - i] * gain


def click(fc=3000, dur=0.018, decay=320.0, q=1.5):
    """A short unpitched mechanical click: a band-passed noise transient."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = noise(n) * np.exp(-tt * decay)
    return bandpass(x, fc, q=q) * 2.5


def clank(dur=0.6):
    """One metal-on-metal seat: inharmonic partials (a struck steel part) plus a dull low body."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for f, a, d in [(412, 1.0, 9), (1093, 0.55, 14), (1877, 0.35, 20), (2741, 0.22, 28), (3960, 0.12, 40)]:
        out += a * np.sin(2 * math.pi * f * tt + f) * np.exp(-tt * d)
    out += 0.8 * bandpass(noise(n), 180, q=0.8) * np.exp(-tt * 18)
    out += click(2500, dur, 250, 1.0)[:n] * 0.6
    return out * np.minimum(1, tt / 0.0015)


mix = np.zeros(N)

# 1. Room tone.
# (No room tone: a noise bed under the whole film reads as constant hiss.)

# 2. Motor hum: leads the picture by ~0.2 s, rises a little in pitch and level as it speeds up.
fast = smooth((t - T['fast']) / (T['fastFull'] - T['fast']))
hum_env = smooth((t - (T['motorOn'] - 0.2)) / 0.6) * (1 - smooth((t - 25.8) / 1.2))
pitch = 1 + 0.06 * fast
ph = 2 * math.pi * np.cumsum(np.full(N, 50.0) * pitch) / SR
hum = 0.9 * np.sin(2 * ph) + 0.55 * np.sin(3 * ph) + 0.45 * np.sin(4 * ph) + 0.2 * np.sin(6 * ph) + 0.08 * np.sin(8 * ph)
beat = 1 + 0.12 * np.sin(2 * math.pi * 0.7 * t)
mix += hum * hum_env * beat * db(-30) * (0.75 + 0.35 * fast)

# 3. Gas: shown only from the cut on.
show = (t >= T['cut']).astype(float) * (1 - smooth((t - 25.6) / 1.2))
suc = bump(p, *P_SUC)
dis = bump(p, *P_DIS)
comp = ((p >= P_SUC[1]) & (p < P_DIS[0])).astype(float)
comp_k = np.clip((p - P_SUC[1]) / (P_DIS[0] - P_SUC[1]), 0, 1) * comp
# No noise beds here: filtered-noise swells read as whooshes (the user heard "swoosh the whole
# video" in the first cut). Gas is told by the picture; sound stays mechanical and tonal.

# 4. Mechanics and metal.
ticks = np.zeros(N)
place(ticks, clank(), T['reassemble'] + 0.32 * 0.8 + 0.75, db(-16))  # parts seat back together
relay = click(2200, 0.03, 260, 1.2)
relay[int(0.008 * SR):int(0.028 * SR)] += click(3400, 0.02, 400, 1.2) * 0.7
place(ticks, relay, T['motorOn'] - 0.25, db(-14))  # start relay
# Reed valves: a soft click each time a valve opens; quieter as the motor speeds up (they blend into the hum).
for a, fc, gain in [(P_SUC[0], 2600, -26), (P_DIS[0], 3600, -22)]:
    cyc = np.floor((phi - a) / (2 * math.pi))
    edges = np.where((np.diff(cyc) > 0) & (t[1:] > T['cut']))[0]
    for e in edges:
        place(ticks, click(fc, 0.014, 420, 2.0), e / SR, db(gain - 8 * float(fast[e])))
mix += ticks

# 5. Whooshes (CC0 recordings).
# Only two short whooshes, on the two big moves (slice and explode).
w7 = load_mp3('whoosh7.mp3')
w1 = load_mp3('whoosh1.mp3')[: int(1.1 * SR)].copy()
w1[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
place(mix, w1, T['sliceA'] - 0.15, db(-17))
place(mix, w7, T['explode'] - 0.1, db(-17))

# Master: gentle limit, then loudnorm to the house -14 LUFS / -1 dBTP.
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.4) * 0.8
os.makedirs(os.path.dirname(OUT), exist_ok=True)
tmp = OUT + '.raw.wav'
with wave.open(tmp, 'w') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
# Two-pass loudnorm in linear mode: one fixed gain for the whole track. (Single-pass loudnorm
# works like an automatic gain control and pumped quiet parts up by ~30 dB.)
import json
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
af = ('loudnorm=I=-14:TP=-1:LRA=11:linear=true:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}'
      ':measured_thresh={input_thresh}:offset={target_offset}').format(**m)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', af, '-ar', str(SR), '-ac', '2', OUT], check=True)
os.remove(tmp)
print('wrote', OUT)
