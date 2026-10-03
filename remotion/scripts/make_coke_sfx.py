"""Synthesise the promo's sound bed into public/coke-sfx.wav (no external deps)."""
import math, random, struct, wave

SR, FPS, FRAMES = 44100, 30, 1800
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

def fizz(f0, f1, amp=0.05):
    a, b = f0 / FPS, f1 / FPS
    def fn(t):
        env = min(1, t / 0.3) * min(1, max(0, (b - a - t) / 0.6))
        pop = (rnd.random() * 2 - 1) if rnd.random() < 0.02 else 0
        return amp * env * ((rnd.random() * 2 - 1) * 0.35 + pop)
    add(a, int((b - a) * SR), fn)

def clink(frame, amp=0.12):
    add(frame / FPS, int(0.6 * SR), lambda t: amp * math.exp(-t * 7) * (math.sin(2 * math.pi * 2350 * t) + 0.6 * math.sin(2 * math.pi * 3710 * t) + 0.3 * math.sin(2 * math.pi * 5120 * t)))

# slow, warm bed: one chord per scene, soft pulse
beat = 60 / 72
t = 0.5
while t < FRAMES / FPS - 1.5:
    kick(t, 0.12)
    t += beat
cuts = [0, 180, 390, 600, 780, 1050, 1260, 1470, 1650, 1800]
chords = [[110, 164.8, 220], [98, 146.8, 196], [87.3, 130.8, 174.6], [82.4, 123.5, 164.8], [110, 138.6, 164.8, 220],
          [98, 123.5, 146.8, 196], [87.3, 110, 130.8, 174.6], [98, 146.8, 196, 246.9], [110, 164.8, 220, 277.2]]
for i, ch in enumerate(chords):
    pad(max(0, cuts[i] - 10), min(1800, cuts[i + 1] + 10), ch, 0.022)
for c in cuts[1:-1]:
    whoosh(c, 0.55, 0.3)
fizz(24, 170)
fizz(800, 1040)
clink(924); clink(934, 0.06); clink(940, 0.03)
impact(630, 0.45)                       # prohibition stamp
for s in cuts[:-1]:                     # typewriter under each body line
    for k in range(10):
        tick(s + 60 + k * 3, 0.03)
for k in range(24):                     # coins stacking
    tick(1300 + k * 3, 0.06)
peak = max(abs(x) for x in buf) or 1
with wave.open('public/coke-sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x / peak * 0.85)) * 32767)) for x in buf))
print('ok')
