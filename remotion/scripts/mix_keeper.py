"""Sound mix for Keeper (23.976 fps). CC0 recordings from BigSoundBank plus one synthesized Shepard tone.
No music. Sources download into out/keeper-src/. Writes public/keeper/mix.m4a.
Sound design follows the video-production-psychology skill:
- off-screen sound opens the film (a fog horn we never see the source of until the end),
- a Shepard tone (endlessly rising) carries the tension from the climb until the boat turns, then is released,
- mood shifts are led by audio a beat before the picture (the horn, the Shepard start, the dawn gulls),
- inside the tower the storm is muffled (low-passed).
Usage: python3 scripts/mix_keeper.py [--report]"""
import os, subprocess, sys, wave
import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'out', 'keeper-src')
DUR = 1439 / (24000 / 1001)  # frames / fps
SOUNDS = {
    '0740': 'rain and thunder #2',
    '2570': 'waves crash over a cliff',
    '1451': 'strong wind and trees #2 (storm)',
    '1715': 'wind from inside #2 (storm)',
    '3113': 'thunder #2',
    '3115': 'thunder #4',
    '2718': 'thunder #1',
    '1049': 'gas fog horn #2',
    '0606': 'steps on a stone staircase',
    '0148': 'glass burst',
    '3446': 'church bell, one stroke',
    '0267': 'sea waves with tern calls',
    '2573': 'gulls on the harbour',
}

def load(i):
    os.makedirs(SRC, exist_ok=True)
    mp3, wav = f'{SRC}/{i}.mp3', f'{SRC}/{i}.wav'
    if not os.path.exists(mp3):
        subprocess.run(['curl', '-sSf', '-o', mp3, f'https://bigsoundbank.com/UPLOAD/mp3/{i}.mp3'], check=True)
    if not os.path.exists(wav):
        subprocess.run(['npx', 'remotion', 'ffmpeg', '-y', '-v', 'error', '-i', mp3, '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s16le', wav], check=True, cwd=ROOT)
    with wave.open(wav) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768

def db(x): return 20 * np.log10(max(x, 1e-9))
def body_rms(a):
    w = SR // 20
    n = max(1, len(a) // w)
    r = np.sqrt((a[: n * w] ** 2).mean(axis=1).reshape(n, w).mean(axis=1))
    r = np.sort(r)[n // 2:]
    return float(np.sqrt((r ** 2).mean()))

def loudest(a, length):
    w = int(length * SR)
    e = (a ** 2).mean(axis=1)
    c = np.cumsum(e)
    s = c[w:] - c[:-w]
    return int(np.argmax(s)) if len(s) else 0

def lowpass(a, hz):
    """Muffle: FFT low-pass with a soft roll-off (sound heard through stone walls)."""
    F = np.fft.rfft(a, axis=0)
    f = np.fft.rfftfreq(len(a), 1 / SR)
    g = 1 / (1 + (f / hz) ** 4)
    return np.fft.irfft(F * g[:, None], n=len(a), axis=0).astype(np.float32)

mix = np.zeros((int(DUR * SR) + SR * 2, 2), np.float32)
report = []

def place(i, at, length, level_db, src_start=0.0, fade_in=0.4, fade_out=0.6, auto_start=False, peak=False, lp=None, label=''):
    a = load(i)
    s0 = loudest(a, length) if auto_start else int(src_start * SR)
    seg = a[s0: s0 + int(length * SR)].copy()
    if len(seg) < int(length * SR):
        seg = np.tile(a, (int(np.ceil(length * SR / len(a))) + 1, 1))[: int(length * SR)].copy()
    if lp:
        seg = lowpass(seg, lp)
    ref = float(np.abs(seg).max()) if peak else body_rms(seg)
    seg *= 10 ** ((level_db - db(ref)) / 20)
    n = len(seg)
    fi, fo = max(1, int(fade_in * SR)), max(1, int(fade_out * SR))
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]
    seg[n - fo:] *= np.linspace(1, 0, fo)[:, None]
    p = int(at * SR)
    end = min(len(mix), p + n)
    mix[p:end] += seg[: end - p]
    report.append(f'{at:6.2f}s  {label or SOUNDS[i]:<40} body {db(body_rms(seg)):6.1f}  peak {db(np.abs(seg).max()):6.1f}')

def shepard(start, end, release, lo_db=-36, hi_db=-23, period=7.0):
    """Endlessly rising Shepard tone: octave-spaced glides, Gaussian loudness over log-frequency."""
    n = int((end - start) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    K, fmin = 7, 55.0
    for k in range(K):
        pos = (k + t / period) % K  # position in octaves above fmin
        f = fmin * 2 ** pos
        ph = 2 * np.pi * np.cumsum(f) / SR
        amp = np.exp(-0.5 * ((pos - K / 2) / 1.1) ** 2)
        out += (amp * np.sin(ph)).astype(np.float32)
    out /= np.sqrt((out ** 2).mean())
    lvl = 10 ** (np.linspace(lo_db, hi_db, n) / 20)
    out *= lvl
    fi = int(1.2 * SR)
    out[:fi] *= np.linspace(0, 1, fi)
    r = int((release - start) * SR)
    rl = int(0.5 * SR)
    out[r: r + rl] *= np.linspace(1, 0, rl)
    out[r + rl:] = 0
    p = int(start * SR)
    mix[p: p + n] += np.stack([out, out], axis=1)
    report.append(f'{start:6.2f}s  {"Shepard tone (synth), released " + str(release):<40} rises {lo_db} -> {hi_db} dBFS')

INSIDE = (14.0, 35.0)  # the tower interior: storm muffled
# --- beds
place('0740', 0, INSIDE[0] + 0.3, -25, src_start=10, fade_in=0.05, label='rain + storm (outside)')
place('0740', INSIDE[0], INSIDE[1] - INSIDE[0], -30, src_start=40, lp=900, fade_in=0.3, fade_out=0.2, label='rain, muffled (inside)')
place('0740', INSIDE[1] - 0.2, 46.0 - INSIDE[1] + 0.2, -25, src_start=80, fade_in=0.2, fade_out=2.5, label='rain + storm (outside)')
place('2570', 0, INSIDE[0] + 0.3, -26, src_start=20, fade_in=0.05, label='cliff waves')
place('1451', 0, INSIDE[0] + 0.3, -29, src_start=30, fade_in=0.05, label='storm wind')
place('1715', INSIDE[0], INSIDE[1] - INSIDE[0], -30, src_start=15, fade_in=0.3, fade_out=0.2, label='storm through the walls')
place('1451', INSIDE[1] - 0.2, 46.5 - INSIDE[1], -27, src_start=90, fade_in=0.2, fade_out=3.0, label='storm wind on the gallery')
place('2570', 39.3, 9.5, -28, src_start=120, fade_in=0.4, fade_out=3.0, label='cliff waves (village)')
place('0267', 45.3, DUR - 45.3, -30, src_start=2, fade_in=2.5, fade_out=1.5, label='calmer sea (dawn coming)')
place('2573', 51.0, DUR - 51.0, -30, src_start=10, fade_in=0.6, fade_out=1.5, label='harbour gulls (lead the dawn cut)')
# --- the boat's horn: heard before anything is seen, muffled inside, answered at the end
place('1049', 0.3, 3.6, -7, src_start=0, fade_in=0.05, fade_out=0.6, peak=True, label='fog horn, off-screen (hook)')
place('1049', 15.6, 3.6, -16, src_start=0, fade_in=0.05, fade_out=0.6, peak=True, lp=700, label='fog horn through the window')
place('1049', 48.0, 3.6, -9, src_start=0, fade_in=0.05, fade_out=0.8, peak=True, label='fog horn: the boat answers')
# --- thunder on the lightning (distant ones low-passed)
place('2718', 3.3, 4.0, -14, auto_start=True, fade_in=0.05, fade_out=1.5, peak=True, lp=500, label='distant thunder')
place('3113', 7.05, 3.5, -4, auto_start=True, fade_in=0.01, fade_out=1.2, peak=True, label='THUNDER on the rocks')
place('3115', 22.3, 4.0, -13, auto_start=True, fade_in=0.02, fade_out=1.5, peak=True, lp=800, label='thunder heard in the stairwell')
place('3113', 31.55, 3.0, -5, auto_start=True, fade_in=0.01, fade_out=1.0, peak=True, label='THUNDER: rocks dead ahead')
place('3115', 33.75, 3.0, -12, auto_start=True, fade_in=0.02, fade_out=1.0, peak=True, lp=900, label='thunder shows the rope')
# --- foley
place('0606', 19.2, 6.6, -26, src_start=2, fade_in=0.2, fade_out=0.4, label='steps on the stone stair')
place('0148', 29.83, 1.4, -4, auto_start=True, fade_in=0.005, fade_out=0.4, peak=True, label='the pane bursts')
place('1451', 29.8, 1.9, -19, src_start=200, fade_in=0.05, fade_out=0.6, label='gust blows the flames out')
for k, r in enumerate([0.4, 1.6, 2.8, 4.0]):
    place('3446', 35 + r - 0.02, 6.0, -3 - k * 0.5, auto_start=True, fade_in=0.005, fade_out=2.5, peak=True, label=f'bell stroke {k + 1}')
place('3446', 58.85, DUR - 58.85, -15, auto_start=True, fade_in=0.01, fade_out=0.6, peak=True, label='one soft bell (the lamp glows)')
# --- tension: starts a beat before the climb, released exactly as the boat turns for home
shepard(18.6, 46.2, release=45.5)

mix = mix[: int(DUR * SR)]
rms = float(np.sqrt((mix ** 2).mean()))
mix *= 10 ** ((-18 - db(rms)) / 20)
th = 10 ** (-3 / 20)
m = np.abs(mix)
over = m > th
mix[over] = np.sign(mix[over]) * (th + (1 - th) * np.tanh((m[over] - th) / (1 - th))) * 10 ** (-1 / 20)
wavp = os.path.join(ROOT, 'out', 'keeper-mix.wav')
with wave.open(wavp, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
os.makedirs(os.path.join(ROOT, 'public', 'keeper'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'keeper', 'mix.m4a')
subprocess.run(['npx', 'remotion', 'ffmpeg', '-y', '-v', 'error', '-i', wavp, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', out], check=True, cwd=ROOT)
print(f'master rms {db(float(np.sqrt((mix ** 2).mean()))):.1f} dBFS, peak {db(float(np.abs(mix).max())):.1f} dBFS -> {out}')
if '--report' in sys.argv:
    print('\n'.join(report))
