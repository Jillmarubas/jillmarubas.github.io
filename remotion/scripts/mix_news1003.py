"""Mix and master the soundtrack for "AI News, 3 Oct 2026": out/news1003/mix.wav (+ soundtrack.m4a).

Voice + one effect only (the user's rules, 1 and 3 Oct 2026): no background music, and a
single short swoosh (BigSoundBank, CC0, public/sfx/whoosh7.mp3, 0.94 s) instead of the long
10.9 s whoosh. It plays once as each scene's pieces fly past the lens, and a little louder on
story cards. Cue times come from src/news1003/timing.json and the scene list in
src/news1003/scenes.tsx (the same windows Film.tsx computes).
Master: -14 LUFS integrated, -1 dBTP (ffmpeg loudnorm, 2-pass), 48 kHz stereo.
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
FPS = 24
LEAD = 7
EXIT_BEFORE = 8  # Film.tsx: exitAt = dur - 8
T = json.load(open(os.path.join(ROOT, 'src/news1003/timing.json')))
N = int((T['duration'] + 0.5) * SR)
TMP = '/tmp/news1003_mix'
OUT = os.path.join(ROOT, 'out/news1003')
os.makedirs(TMP, exist_ok=True)
os.makedirs(OUT, exist_ok=True)


def load(path):
    out = os.path.join(TMP, re.sub(r'[^\w.]', '_', os.path.basename(path)) + '.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '2', '-ar', str(SR), '-sample_fmt', 's16', out], check=True)
    w = wave.open(out)
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768


def place(buf, sig, t, gain=1.0):
    i0 = int(t * SR)
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: max(0, N - i0)]
    buf[i0:i0 + len(sig)] += sig * gain


rms = lambda x: float(np.sqrt((x ** 2).mean() + 1e-12))
fr = lambda s: round(s * FPS)

# ------------------------------------------------------------------ scene windows (mirror of Film.tsx / scenes.tsx)
src = open(os.path.join(ROOT, 'src/news1003/scenes.tsx')).read()
body = src[src.index('export const SCENES'):]
scenes = []
for m in re.finditer(r"\.\.\.run\((\d+), \[([^\]]*)\]\)|\{ch: (\d+), from: 0, C: Card\(", body):
    if m.group(1):
        n = len([x for x in m.group(2).split(',') if x.strip()])
        scenes += [(int(m.group(1)), i, False) for i in range(n)]
    else:
        scenes.append((int(m.group(3)), 0, True))
line = {(l['ch'], l['i']): l for l in T['lines']}
starts = [fr(T['chapters'][ch]['start']) if card else fr(line[(ch, i)]['start']) - LEAD for ch, i, card in scenes]
total = fr(T['duration'])
wins = [(starts[k], (starts[k + 1] if k + 1 < len(scenes) else total) - starts[k], scenes[k][2]) for k in range(len(scenes))]
print(len(wins), 'scenes')

# ------------------------------------------------------------------ voice
vo = np.zeros((N, 2), np.float32)
for ci, ch in enumerate(T['chapters']):
    v = load(os.path.join(ROOT, f'public/news1003/vo/s{ci}.mp3'))
    active = v[np.abs(v).max(1) > 0.02]
    v *= 10 ** (-18 / 20) / rms(active)
    place(vo, v, ch['vo'])

# ------------------------------------------------------------------ the single swoosh
sw = load(os.path.join(ROOT, 'public/sfx/whoosh7.mp3'))
peak_at = int(np.argmax(np.abs(sw).max(1))) / SR  # align the loudest point to the moment pieces pass the lens
fx = np.zeros((N, 2), np.float32)
cues = []
for k, (f0, dur, card) in enumerate(wins):
    if k + 1 < len(wins):
        t = (f0 + dur - EXIT_BEFORE + 9) / FPS - peak_at  # mid-exit
        g = 0.55 if wins[k + 1][2] else 0.32
        place(fx, sw, t, g)
        cues.append(round(t, 2))
fx *= 10 ** (-24 / 20) / max(1e-6, rms(sw[np.abs(sw).max(1) > 0.01]))

mix = vo + fx
raw = os.path.join(TMP, 'raw.wav')
wv = wave.open(raw, 'wb')
wv.setnchannels(2)
wv.setsampwidth(2)
wv.setframerate(SR)
wv.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
wv.close()

# ------------------------------------------------------------------ master: 2-pass loudnorm to -14 LUFS / -1 dBTP
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(p1[p1.rindex('{'):p1.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
mixp = os.path.join(OUT, 'mix.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), mixp], check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mixp, '-c:a', 'aac', '-b:a', '256k', os.path.join(OUT, 'soundtrack.m4a')], check=True)
p2 = subprocess.run(['ffmpeg', '-hide_banner', '-i', mixp, '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
k = json.loads(p2[p2.rindex('{'):p2.rindex('}') + 1])
print(f"swooshes: {len(cues)}  master: {k['input_i']} LUFS, {k['input_tp']} dBTP, duration {N / SR:.2f}s")
vr, fr_ = rms(vo[np.abs(vo).max(1) > 0.01]), rms(fx[np.abs(fx).max(1) > 0.001])
print(f'voice vs swoosh body: {20 * np.log10(vr / fr_):.1f} dB')
