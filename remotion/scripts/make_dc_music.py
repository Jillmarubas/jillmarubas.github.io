"""Music bed for "Why people hate data centres", synthesised so it's fully original and free.

Vox-style scoring: a quiet, rhythmic bed under the narration that changes texture about every
20 seconds and gets a new key and mood per chapter; each chapter card gets a short sting.
Reads src/dc/timing.json, writes out/dc-music.wav (stereo, 48 kHz, about -20 dBFS RMS).
"""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
T = json.load(open(os.path.join(ROOT, 'src/dc/timing.json')))
DUR = T['duration']
N = int(DUR * SR) + SR
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(5)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# one mood per chapter: (bpm, chords as MIDI triads/tetrads, pulse?, arp density)
MOODS = [
    (72, [[45, 52, 57, 60], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], False, 0.35),  # cold open: sparse, uneasy
    (86, [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 62]], False, 1.0),  # the cloud: curious
    (92, [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [45, 52, 57, 61]], True, 1.0),  # the bill: driving
    (80, [[52, 59, 64, 67], [48, 55, 60, 64], [45, 52, 57, 60], [47, 54, 59, 62]], False, 0.7),  # the water: airy
    (76, [[45, 52, 57, 60], [44, 51, 56, 60], [41, 48, 53, 56], [40, 47, 52, 56]], True, 0.6),  # the neighbours: dark
    (96, [[43, 50, 55, 59], [40, 47, 52, 55], [36, 43, 48, 52], [38, 45, 50, 54]], True, 1.0),  # the deal: bouncy
    (80, [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]], False, 0.7),  # who decides: reflective
    (88, [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]], False, 1.0),  # can it be fixed: hopeful
    (72, [[41, 48, 53, 57], [43, 50, 55, 59], [48, 55, 60, 64], [48, 55, 60, 64]], False, 0.5),  # ending: resolve
]

_pl = {}
def pluck_wave(m):
    """Karplus-Strong pluck, cached per note (vectorised by period blocks)."""
    if m in _pl:
        return _pl[m]
    p = int(SR / hz(m))
    n = int(SR * 2.4)
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for k in range(0, n, p):
        seg = buf.copy()
        out[k:k + p] = seg[: min(p, n - k)]
        buf = 0.996 * 0.5 * (seg + np.roll(seg, -1))
    b, a = butter(2, 3200 / (SR / 2))
    _pl[m] = lfilter(b, a, out)
    return _pl[m]

def add(sig, t0, gain, pan=0.5):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    s = sig[: N - i0] * gain
    L[i0:i0 + len(s)] += s * (1 - pan)
    R[i0:i0 + len(s)] += s * pan

def pad(t0, t1, notes, amp):
    t = np.arange(int((t1 - t0) * SR)) / SR
    if len(t) < 10:
        return
    env = np.minimum(1, t / 1.5) * np.minimum(1, (t[-1] - t) / 1.5)
    sig = sum(np.sin(2 * np.pi * hz(m) * t + i) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.004 * t) for i, m in enumerate(notes))
    add(sig * env * (0.85 + 0.15 * np.sin(2 * np.pi * 0.17 * t)), t0, amp)

def thump(t0, amp):
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 40 * np.exp(-t * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9), t0, amp)

def sting(t0):
    """Chapter card: a soft low boom plus a bell-like FM chord."""
    t = np.arange(int(3.0 * SR)) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 30 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.2)
    bell = sum(np.sin(2 * np.pi * hz(m) * t + 1.8 * np.sin(2 * np.pi * hz(m) * 3.5 * t) * np.exp(-t * 3)) * np.exp(-t * 1.6) for m in (69, 76, 81))
    add(boom * 0.5 + bell * 0.06, t0, 1.0)

for ci, ch in enumerate(T['chapters']):
    bpm, chords, pulse, dens = MOODS[ci]
    bar = 4 * 60 / bpm
    a = ch['start'] + (ch['card'] if ch['card'] else 0)
    b = ch['end'] + (0.6 if ci < len(T['chapters']) - 1 else 0)
    if ch['card']:
        sting(ch['start'] + 0.15)
    t, k = a, 0
    while t < b - 0.1:
        chord = chords[k % len(chords)]
        section = int((t - a) // 22)  # texture changes about every 22 s
        pad(t - 0.2, min(b, t + bar + 0.4), [m for m in chord[:3]], 0.010)
        steps = 8
        for s in range(steps):
            tt = t + s * bar / steps
            if tt >= b:
                break
            if rng.random() > dens * (0.55 + 0.45 * (section % 2)):
                continue
            note = chord[[0, 2, 1, 3, 2, 1, 3, 2][s]] + 12 + (12 if (s == 7 and section % 3 == 2) else 0)
            add(pluck_wave(note), tt, 0.11 if s % 2 else 0.15, 0.3 + 0.4 * (s % 2))
        if pulse and section % 2 == 0:
            for s in range(4):
                thump(t + s * bar / 4, 0.16)
        t += bar
        k += 1

# ending: long fade; master
fade = np.ones(N)
fl = int(SR * 4)
end = int(DUR * SR)
fade[end - fl:end] = np.linspace(1, 0, fl)
fade[end:] = 0
mix = np.stack([L * fade, R * fade], 1)
rms = np.sqrt((mix[:end] ** 2).mean())
mix *= 10 ** (-20 / 20) / rms
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
with wave.open(os.path.join(ROOT, 'out/dc-music.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix[:end], -1, 1) * 32767 * 0.95).astype(np.int16).tobytes())
print(f'music: {end / SR:.1f}s')
