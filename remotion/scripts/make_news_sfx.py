"""Sound for AI News Daily: whoosh, impact, tick and a 64 s seamless pad bed.
Writes out/ainews0929/sfx/*.wav (mixer inputs; big WAVs stay out of public/). Needs numpy."""
import os, wave
import numpy as np

SR = 44100
OUT = 'out/ainews0929/sfx'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def save(name, x, peak=0.85):
    x = x / (np.abs(x).max() or 1) * peak
    with wave.open(f'{OUT}/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def lowpass(x, cut):  # one-pole, cut can vary per sample (0..1)
    y = np.zeros_like(x); s = 0.0
    cut = np.broadcast_to(cut, x.shape)
    for i in range(len(x)):
        s += cut[i] * (x[i] - s); y[i] = s
    return y


# whoosh: noise swell with a sweeping low-pass
n = int(0.7 * SR); t = np.arange(n) / n
env = np.sin(np.pi * t) ** 1.6
save('whoosh', lowpass(rng.uniform(-1, 1, n), 0.015 + 0.2 * env) * env, 0.6)

# impact: pitched-down sine thump + a little noise
n = int(0.9 * SR); t = np.arange(n) / SR
ph = np.cumsum(2 * np.pi * (38 + 110 * np.exp(-t * 28)) / SR)
thump = np.sin(ph) * np.exp(-t * 6)
save('impact', thump + 0.15 * lowpass(rng.uniform(-1, 1, n), 0.08) * np.exp(-t * 14))

# tick
n = int(0.03 * SR); t = np.arange(n) / SR
save('tick', np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 260), 0.4)

# bed: 64 s pad, chords on a 16 s cycle, loops seamlessly (every partial completes whole cycles)
L = 64; n = L * SR; t = np.arange(n) / SR
chords = [[110, 164.81, 220, 277.18], [98, 146.83, 196, 246.94], [87.31, 130.81, 174.61, 220], [98, 146.83, 196, 293.66]]
bed = np.zeros(n)
for k, ch in enumerate(chords * 4):
    a, b = k * 4.0, k * 4.0 + 4.0
    w = np.clip(np.minimum((t - a + 1.0) / 1.5, (b + 1.0 - t) / 1.5), 0, 1)  # 1 s crossfades
    for f in ch:
        f = round(f * L) / L  # whole cycles over the loop
        bed += w * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t + 1.0)) / len(ch)
air = lowpass(rng.uniform(-1, 1, n), 0.02)
air = air * (1 - np.abs(np.linspace(-1, 1, n)) ** 8)  # fade the noise at the seam
bed = bed + 0.35 * air
save('bed', bed, 0.7)
print('ok', os.listdir(OUT))
