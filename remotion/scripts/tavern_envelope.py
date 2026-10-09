"""Per-frame loudness envelope + onset times for the Rainy Tavern scene (drives subtle audio-reactive light)."""
import sys, wave, json, numpy as np
w = wave.open(sys.argv[1]); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
FPS = 30
n = int(len(x) / sr * FPS)
rms = np.array([np.sqrt(np.mean(x[int(i*sr/FPS):int((i+1)*sr/FPS)]**2) + 1e-12) for i in range(n)])
db = 20 * np.log10(rms + 1e-9)
sm = np.convolve(db, np.ones(15) / 15, 'same')        # ~0.5 s smoothing
lo, hi = np.percentile(sm, 5), np.percentile(sm, 95)
env = np.clip((sm - lo) / (hi - lo), 0, 1)
# onsets: spectral flux peaks
fr = int(sr * 0.023); hp = fr // 2
mag = np.array([np.abs(np.fft.rfft(x[i:i+fr] * np.hanning(fr))) for i in range(0, len(x) - fr, hp)])
flux = np.maximum(0, np.diff(mag, axis=0)).sum(1)
thr = flux.mean() + 1.5 * flux.std()
peaks = [i for i in range(2, len(flux) - 2) if flux[i] > thr and flux[i] == flux[i-2:i+3].max()]
t = [round(i * hp / sr, 2) for i in peaks]
# thin to >= 0.35 s apart
out = []
for v in t:
    if not out or v - out[-1] >= 0.35: out.append(v)
json.dump({"fps": FPS, "frames": n, "env": [round(float(v), 3) for v in env], "onsets": out}, open(sys.argv[2], "w"))
print("frames", n, "onsets", len(out), "env mean", round(float(env.mean()), 2))
