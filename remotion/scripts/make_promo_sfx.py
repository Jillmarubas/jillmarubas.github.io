"""Synthesise the promo's sound bed into public/promo-sfx.wav (no external deps)."""
import math, random, struct, wave

SR, FPS, FRAMES = 44100, 30, 420
buf = [0.0] * int(SR * FRAMES / FPS)
rnd = random.Random(3)

def add(t0, n, fn):
    i0 = int(t0 * SR)
    for k in range(n):
        if 0 <= i0 + k < len(buf):
            buf[i0 + k] += fn(k / SR)

def whoosh(frame, d=0.5, amp=0.35):
    # band-limited noise swell: one-pole low-pass whose cutoff sweeps up then down
    state = [0.0]
    def fn(t):
        x = t / d
        cut = 0.02 + 0.25 * math.sin(math.pi * min(1, x))
        state[0] += cut * ((rnd.random() * 2 - 1) - state[0])
        return amp * state[0] * math.sin(math.pi * min(1, x)) * 3
    add(frame / FPS - d / 2, int(d * SR), fn)

def impact(frame, amp=0.5):
    ph = [0.0]
    def fn(t):
        ph[0] += 2 * math.pi * (40 + 90 * math.exp(-t * 30)) / SR
        return amp * math.sin(ph[0]) * math.exp(-t * 9)
    add(frame / FPS, int(0.4 * SR), fn)

def tick(frame, amp=0.05):
    add(frame / FPS, int(0.02 * SR), lambda t: amp * math.sin(2 * math.pi * 2400 * t) * math.exp(-t * 300))

def kick(t0, amp=0.32):
    ph = [0.0]
    def fn(t):
        ph[0] += 2 * math.pi * (48 + 110 * math.exp(-t * 40)) / SR
        return amp * math.sin(ph[0]) * math.exp(-t * 12)
    add(t0, int(0.3 * SR), fn)

def hat(t0, amp=0.04):
    add(t0, int(0.05 * SR), lambda t: amp * (rnd.random() * 2 - 1) * math.exp(-t * 90))

def pad(f0, f1, freqs, amp=0.025):
    a, b = f0 / FPS, f1 / FPS
    def fn(t):
        env = min(1, t / 0.6) * min(1, max(0, (b - a - t) / 0.8))
        return amp * env * sum(math.sin(2 * math.pi * f * t) + 0.4 * math.sin(2 * math.pi * f * 2.001 * t) for f in freqs)
    add(a, int((b - a) * SR), fn)

beat = 60 / 112
t = 0.3
while t < FRAMES / FPS - 0.8:
    kick(t)
    hat(t + beat / 2)
    t += beat
for f0, f1, ch in [(0, 100, [110, 164.8, 220]), (90, 200, [98, 146.8, 196]), (190, 280, [87.3, 130.8, 174.6]), (262, 420, [110, 164.8, 220, 277.2])]:
    pad(f0, f1, ch)
for fr in (91, 191, 269, 348):
    whoosh(fr)
for fr in (24, 104, 208, 286):
    impact(fr)
for fr in range(48, 70, 2):
    tick(fr)
for fr in range(300, 316, 2):
    tick(fr)

peak = max(abs(x) for x in buf) or 1
with wave.open('public/promo-sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x / peak * 0.85)) * 32767)) for x in buf))
print('ok')
