"""Documentary music bed for ColaOrigin: plucked-string arpeggios (Karplus-Strong) over a
soft mid-register pad, one chord per scene, mastered to about -18 dBFS RMS so it sits
under the recorded sound effects. Writes public/cola-music.wav (stereo, 48 kHz)."""
import math, random, struct, wave
import numpy as np

SR, FPS, FRAMES = 48000, 30, 1800
N = int(SR * FRAMES / FPS)
L = np.zeros(N); R = np.zeros(N)
rnd = random.Random(11)
CUTS = [0, 180, 390, 600, 780, 1050, 1260, 1470, 1650, 1800]
# A minor -> F -> C -> G ... warm, reflective documentary progression (MIDI notes)
CHORDS = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67], [57, 60, 64, 72],
          [53, 57, 60, 69], [50, 57, 62, 65], [52, 55, 59, 64], [57, 61, 64, 69]]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def pluck(t0, freq, amp, pan):
    n = int(SR * 2.8)
    period = int(SR / freq)
    buf = np.array([rnd.uniform(-1, 1) for _ in range(period)])
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    out *= amp
    i0 = int(t0 * SR)
    seg = out[: max(0, min(n, N - i0))]
    L[i0:i0 + len(seg)] += seg * (1 - pan)
    R[i0:i0 + len(seg)] += seg * pan

def pad(t0, t1, notes, amp):
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
    t = np.arange(i1 - i0) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (t[-1] - t) / 1.2 + 1e-9)
    sig = sum(np.sin(2 * np.pi * hz(m) * t) + 0.35 * np.sin(2 * np.pi * hz(m) * 2.003 * t) for m in notes)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.2 * t)
    L[i0:i1] += sig * env * lfo * amp
    R[i0:i1] += sig * env * lfo * amp * 0.9

beat = 60 / 84 / 2  # eighth notes at 84 bpm
for s, chord in enumerate(CHORDS):
    a, b = CUTS[s] / FPS, CUTS[s + 1] / FPS
    pad(max(0, a - 0.3), min(FRAMES / FPS, b + 0.3), [m - 12 for m in chord[:3]], 0.018)
    t, k = a + 0.1, 0
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    while t < b - 0.2:
        note = chord[pattern[k % 8]] + (12 if k % 16 == 7 else 0)
        pluck(t, hz(note), 0.16 if k % 4 else 0.22, 0.3 + 0.4 * (k % 2))
        t += beat
        k += 1

# gentle fade-out at the end, then master to -18 dBFS RMS with a soft limiter
fade = np.ones(N); fl = int(SR * 1.5); fade[-fl:] = np.linspace(1, 0, fl)
L *= fade; R *= fade
# gentle low-pass (two one-pole stages, ~3 kHz) so the music leaves room for the sound effects
def lowpass(x, fc=3000):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y
L = lowpass(lowpass(L)); R = lowpass(lowpass(R))
mix = np.stack([L, R], 1)
rms = np.sqrt((mix ** 2).mean())
mix *= (10 ** (-18 / 20)) / rms
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
with wave.open('public/cola-music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767 * 0.95).astype(np.int16).tobytes())
print('music: %.1fs, rms %.1f dBFS' % (N / SR, 20 * math.log10(np.sqrt((mix ** 2).mean()))))
