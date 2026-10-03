"""Mix and master the soundtrack for "Why people hate data centres": out/dc-mix.wav.

Layers, all timed from src/dc/timing.json and the scene list in src/dc/scenes.tsx:
  - voiceover: one ElevenLabs take per chapter (public/dc/vo/ch<N>.mp3), levelled to the same loudness
  - music: out/dc-music.wav (make_dc_music.py), ducked about 10 dB under the voice
  - the hum: a synthesised mains-and-fans drone under the cold open and "Remember that hum?"
  - soft whooshes as each scene's pieces fly toward the viewer; a louder one on chapter cards
Master: about -16 dBFS RMS, look-ahead limiter at -1.5 dBFS.
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
FPS = 30
T = json.load(open(os.path.join(ROOT, 'src/dc/timing.json')))
N = int(T['duration'] * SR)
TMP = '/tmp/dc_mix'
os.makedirs(TMP, exist_ok=True)

def load(path):
    if not path.endswith('.wav'):
        out = os.path.join(TMP, os.path.basename(path) + '.wav')
        subprocess.run(['npx', 'remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '2', '-ar', str(SR), out], check=True, cwd=ROOT)
        path = out
    w = wave.open(path)
    d = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, w.getnchannels()) / 32768
    if d.shape[1] == 1:
        d = np.repeat(d, 2, 1)
    return d

def place(buf, sig, t, gain=1.0):
    i0 = int(t * SR)
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: max(0, N - i0)]
    buf[i0:i0 + len(sig)] += sig * gain

rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
db = lambda x: 20 * np.log10(max(float(x), 1e-9))

# ---- voice
vo = np.zeros((N, 2), np.float32)
for ci, ch in enumerate(T['chapters']):
    p = os.path.join(ROOT, f'public/dc/vo/ch{ci}.mp3')
    if not os.path.exists(p):
        print(f'  (no voiceover yet for chapter {ci})')
        continue
    v = load(p)
    active = v[np.abs(v).max(1) > 0.02]
    v *= 10 ** (-19 / 20) / rms(active)  # same speech loudness for every take
    place(vo, v, ch['vo'])

# ---- music, ducked under the voice (smoothed envelope, 250 ms attack, 600 ms release)
music = load(os.path.join(ROOT, 'out/dc-music.wav'))[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0)))
env = np.abs(vo).max(1)
hop = SR // 100
blk = np.array([env[i:i + hop].max() for i in range(0, N, hop)])
talk = (blk > 0.01).astype(float)
duck = np.empty_like(talk)
cur = 0.0
for i, x in enumerate(talk):
    cur += (x - cur) * (0.04 if x > cur else 0.017)
    duck[i] = cur
gain = 10 ** ((-10 * np.repeat(duck, hop)[:N]) / 20)
music *= gain[:, None] * 0.55

# ---- the hum: 60 Hz mains harmonics + fan whine, slow beating
def hum(t0, t1, amp):
    t = np.arange(int((t1 - t0) * SR)) / SR
    env = np.minimum(1, t / 2.0) * np.minimum(1, (t[-1] - t) / 2.5)
    s = 0.6 * np.sin(2 * np.pi * 120 * t) + 0.35 * np.sin(2 * np.pi * 180.4 * t) + 0.2 * np.sin(2 * np.pi * 240 * t) + 0.05 * np.sin(2 * np.pi * 2310 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t))
    s *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t)
    return np.stack([s * env * amp, s * env * amp * 0.92], 1)

line = {(l['ch'], l['i']): l for l in T['lines']}
fx = np.zeros((N, 2), np.float32)
place(fx, hum(0.0, line[(0, 4)]['start'] + 1.0, 0.05), 0.0)
c4 = T['chapters'][4]
place(fx, hum(c4['vo'] - 0.5, line[(4, 3)]['start'], 0.045), c4['vo'] - 0.5)

# ---- whooshes: each scene hands over (pieces fly toward the viewer), chapter cards
sfx = {n: load(os.path.join(ROOT, f'public/sfx/{n}.wav')) for n in ('whoosh1', 'whoosh7', 'whoosh8')}
for n in sfx:
    sfx[n] *= 10 ** (-14 / 20) / rms(sfx[n][np.abs(sfx[n]).max(1) > 0.01])
scenes = re.findall(r"\{ch: (\d+), from: (\d+), C: [^}]*?(card: true)?\}", open(os.path.join(ROOT, 'src/dc/scenes.tsx')).read())
starts = []
for ch, frm, card in scenes:
    ch, frm = int(ch), int(frm)
    starts.append((T['chapters'][ch]['start'] if card else line[(ch, frm)]['start'] - 10 / FPS, bool(card)))
for k, (t, card) in enumerate(starts):
    if k == 0:
        continue
    if card:
        place(fx, sfx['whoosh1'][: int(1.4 * SR)], t - 0.1, 0.55)
    else:
        w = sfx['whoosh7' if k % 2 else 'whoosh8'][: int(0.9 * SR)]
        place(fx, w, t - 14 / FPS - 0.12, 0.28)

# ---- master
mix = vo + music + fx
mix *= 10 ** (-16 / 20) / rms(mix)
CEIL = 10 ** (-1.5 / 20)
peak = np.abs(mix).max(1)
look = int(0.005 * SR)
need = np.minimum(1.0, CEIL / np.maximum(peak, 1e-9))
win = np.lib.stride_tricks.sliding_window_view(np.concatenate([need, np.ones(look)]), look + 1).min(1)[:N]
g = np.empty(N, np.float32)
cur, rel = 1.0, np.exp(-1 / (0.08 * SR))
for i in range(N):
    x = win[i]
    cur = x if x < cur else x + (cur - x) * rel
    g[i] = cur
out = np.clip(mix * g[:, None], -1, 1)
with wave.open(os.path.join(ROOT, 'out/dc-mix.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
subprocess.run(['npx', 'remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', 'out/dc-mix.wav', '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', 'out/dc-soundtrack.m4a'], cwd=ROOT, check=True)
m = out.mean(1)
vo_on = np.abs(vo).max(1) > 0.02
print(f'master: {N / SR / 60:.1f} min, rms {db(rms(m)):.1f} dBFS, peak {db(np.abs(out).max()):.1f} dBFS, limiter max {db(g.min()):.1f} dB')
print(f'voice vs music while talking: {db(rms(vo[vo_on])) - db(rms(music[vo_on])):.1f} dB')
