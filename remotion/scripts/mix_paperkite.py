"""Sound mix for PaperKite: CC0 recordings from BigSoundBank (bigsoundbank.com, CC0), no music.
Downloads the sources into out/paperkite-src/, levels each by the loudness of its body (RMS of
the active part, not the peak), lays the cues on the scene cuts and writes public/paperkite/mix.m4a.
Usage: python3 scripts/mix_paperkite.py [--report]"""
import os, subprocess, sys
import wave
import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'out', 'paperkite-src')
FPS = 23
CUTS = [0, 115, 311, 495, 644, 851, 1058, 1277, 1380]
T = [c / FPS for c in CUTS]
DUR = T[-1]
SOUNDS = {  # BigSoundBank id: what it is
    '0999': 'birds waking (dawn chorus)',
    '0908': 'wind in tall grass',
    '0146': 'strong wind #1',
    '0267': 'sea waves with tern calls',
    '1020': 'field cricket',
    '1796': 'whoosh #4',
    '1801': 'whoosh #8',
    '0164': 'turned page',
    '0018': 'torn paper #1',
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
    """RMS of the louder half of 50 ms windows: the body of the sound, ignoring silence."""
    w = SR // 20
    n = len(a) // w
    r = np.sqrt((a[: n * w] ** 2).mean(axis=1).reshape(n, w).mean(axis=1))
    r = np.sort(r)[n // 2:]
    return float(np.sqrt((r ** 2).mean()))

def loudest(a, length):
    """Start sample of the loudest `length`-second window (for one-shots inside longer takes)."""
    w = int(length * SR)
    e = np.convolve((a ** 2).mean(axis=1), np.ones(SR // 100), 'same')
    c = np.cumsum(e)
    s = c[w:] - c[:-w]
    return int(np.argmax(s)) if len(s) else 0

mix = np.zeros((int(DUR * SR) + SR, 2), np.float32)
report = []

def place(i, at, length, level_db, src_start=0.0, fade_in=0.4, fade_out=0.6, auto_start=False, label='', peak=False):
    """Beds are levelled by body loudness; short one-shots (peak=True) by their peak."""
    a = load(i)
    s0 = loudest(a, length) if auto_start else int(src_start * SR)
    seg = a[s0: s0 + int(length * SR)].copy()
    if len(seg) < int(length * SR):  # loop beds that are too short
        reps = int(np.ceil(length * SR / len(a)))
        seg = np.tile(a, (reps, 1))[: int(length * SR)].copy()
    g = 10 ** ((level_db - db(float(np.abs(seg).max()) if peak else body_rms(seg))) / 20)
    seg *= g
    n = len(seg)
    fi, fo = max(1, int(fade_in * SR)), max(1, int(fade_out * SR))
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]
    seg[n - fo:] *= np.linspace(1, 0, fo)[:, None]
    p = int(at * SR)
    mix[p: p + n] += seg[: len(mix) - p]
    report.append(f'{at:6.2f}s  {label or SOUNDS[i]:<34} body {db(body_rms(seg)):5.1f} dBFS  peak {db(np.abs(seg).max()):5.1f}')

# --- ambience beds (body levels well under the effects)
place('0999', T[1] - 0.3, T[2] - T[1] + 0.8, -31, src_start=40, label='birds: town morning')
place('0908', T[2] - 0.4, T[4] - T[2] + 0.8, -30, src_start=5, label='wind in grass: hill + gust')
place('0146', T[3] + 1.0, 4.8, -22, src_start=20, fade_in=1.4, fade_out=1.6, label='gust')
place('0267', T[4] - 0.4, T[5] - T[4] + 0.8, -27, src_start=3, label='sea + gulls')
place('0908', T[5] - 0.4, T[6] - T[5] + 0.6, -36, src_start=40, label='night wind')
place('1020', T[5] + 3.5, T[6] - T[5] - 3.0, -33, src_start=2, fade_in=2.5, label='crickets (night falls)')
place('0999', T[6] - 0.3, T[8] - T[6] + 0.3, -31, src_start=120, fade_out=2.5, label='birds: dawn + end')

# --- effects
for k, c in enumerate(T[1:-1]):  # one swoosh per paper wipe, centred on the cut
    i = '1796' if k % 2 == 0 else '1801'
    place(i, c - 0.45, 0.85, -7, auto_start=True, fade_in=0.02, fade_out=0.2, label=f'wipe swoosh {k + 1}', peak=True)
    place('0164', c - 0.3, 0.6, -12, fade_in=0.01, fade_out=0.15, label=f'wipe paper {k + 1}', peak=True)
for fr in (20, 25, 30):  # title strips land
    place('0164', fr / FPS, 0.6, -10, fade_in=0.01, fade_out=0.15, label='title strip', peak=True)
for fr in (10, 15, 20, 40):  # end strips land
    place('0164', T[7] + fr / FPS, 0.6, -10, fade_in=0.01, fade_out=0.15, label='end strip', peak=True)
place('0018', T[3] + 64 / FPS - 0.05, 0.5, -3, auto_start=True, fade_in=0.005, fade_out=0.12, label='SNAP (string breaks)', peak=True)
place('0164', T[6] + 150 / FPS - 0.1, 0.6, -8, fade_in=0.01, fade_out=0.15, label='catch', peak=True)

# --- master: about -18 dBFS RMS, peaks at -1 dBFS
mix = mix[: int(DUR * SR)]
rms = float(np.sqrt((mix ** 2).mean()))
mix *= 10 ** ((-18 - db(rms)) / 20)
pk = np.abs(mix).max()
if pk > 10 ** (-1 / 20):
    # soft-knee limiter on the few loud transients
    th = 10 ** (-3 / 20)
    m = np.abs(mix)
    over = m > th
    mix[over] = np.sign(mix[over]) * (th + (1 - th) * np.tanh((m[over] - th) / (1 - th))) * 10 ** (-1 / 20) / 1.0
wav = os.path.join(ROOT, 'out', 'paperkite-mix.wav')
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(ROOT, 'public', 'paperkite', 'mix.m4a')
subprocess.run(['npx', 'remotion', 'ffmpeg', '-y', '-v', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', out], check=True, cwd=ROOT)
print(f'master rms {db(float(np.sqrt((mix ** 2).mean()))):.1f} dBFS, peak {db(float(np.abs(mix).max())):.1f} dBFS -> {out}')
if '--report' in sys.argv:
    print('\n'.join(report))
