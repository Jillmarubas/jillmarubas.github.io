"""Synthesise the promo's sound bed into public/space-sfx.wav (no external deps)."""
import math, random, struct, wave

SR, FPS, FRAMES = 44100, 30, 480
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

def rumble(f0, f1, amp=0.3):
    state = [0.0]
    a, b = f0 / FPS, f1 / FPS
    def fn(t):
        state[0] += 0.03 * ((rnd.random() * 2 - 1) - state[0])
        env = min(1, t / 0.4) * min(1, max(0, (b - a - t) / 1.2))
        return amp * state[0] * 6 * env
    add(a, int((b - a) * SR), fn)

beat = 60 / 96
t = 0.3
while t < FRAMES / FPS - 0.8:
    kick(t, 0.22)
    hat(t + beat / 2, 0.03)
    t += beat
for f0, f1, ch in [(0, 110, [98, 146.8, 196, 246.9]), (100, 230, [110, 164.8, 220]), (221, 330, [87.3, 130.8, 174.6]), (320, 480, [98, 146.8, 196, 293.7])]:
    pad(f0, f1, ch)
for fr in (100, 221, 320, 401):
    whoosh(fr)
for fr in (20, 246, 336, 410):
    impact(fr, 0.4)
for i in range(7):
    tick(150 + i * 5, 0.08)
for fr in range(112, 146, 3):
    tick(fr, 0.04)
rumble(232, 318, 0.35)
peak = max(abs(x) for x in buf) or 1
with wave.open('public/space-sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x / peak * 0.85)) * 32767)) for x in buf))
print('ok')
