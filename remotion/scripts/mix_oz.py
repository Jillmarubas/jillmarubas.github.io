"""Sound mix for "The Cyclone" (Oz ch1). Narration (ElevenLabs, the user's voices) + sound effects from public/oz/sfx
(cues 01a-08a made by the user, 08b-25 generated with ElevenLabs Sound Effects). Placed on src/oz/timeline.json.
Psychology-skill rules (ch1-sound-cues.md): sound leads the picture by ~0.5 s at mood changes; one dominant sound under
the voice; the voice is never masked (effects duck ~9 dB under speech); the storm is muffled inside the house; tension
rises on a Shepard tone and is released into silence at the landing; colour arrives with birdsong.
Usage: python3 scripts/mix_oz.py [--report]"""
import json, os, subprocess, sys, wave
import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TL = json.load(open(os.path.join(ROOT, 'src', 'oz', 'timeline.json')))
L = TL['lines']
S = lambda n: L[n - 1]['start']
E = lambda n: L[n - 1]['start'] + L[n - 1]['dur']
DUR = TL['frames'] / TL['fps']
CACHE = {}


def load(path):
    if path not in CACHE:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, 'public', path), '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
        CACHE[path] = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768
    return CACHE[path]


def db(x): return 20 * np.log10(max(float(x), 1e-9))


def body_rms(a):
    w = SR // 20
    n = max(1, len(a) // w)
    r = np.sqrt((a[: n * w] ** 2).mean(axis=1).reshape(n, w).mean(axis=1))
    r = np.sort(r)[n // 2:]
    return float(np.sqrt((r ** 2).mean())) or 1e-9


def lowpass(a, hz):
    F = np.fft.rfft(a, axis=0)
    f = np.fft.rfftfreq(len(a), 1 / SR)
    return np.fft.irfft(F * (1 / (1 + (f / hz) ** 4))[:, None], n=len(a), axis=0).astype(np.float32)


N = int(DUR * SR) + SR
voice = np.zeros((N, 2), np.float32)
fx = np.zeros((N, 2), np.float32)
report = []


def place(name, at, length=None, level=-30, peak=False, fi=0.3, fo=0.6, lp=None, pan=None, start=0.0, loop=True, label=''):
    a = load(f'oz/sfx/{name}.mp3')
    src = a[int(start * SR):]
    length = length or len(src) / SR
    n = int(length * SR)
    if len(src) < n:
        if loop:  # loop with a short crossfade
            xf = int(0.25 * SR)
            out = src.copy()
            while len(out) < n:
                nxt = a.copy()
                out[-xf:] = out[-xf:] * np.linspace(1, 0, xf)[:, None] + nxt[:xf] * np.linspace(0, 1, xf)[:, None]
                out = np.concatenate([out, nxt[xf:]])
            src = out
        else:
            n = len(src)
    seg = src[:n].copy()
    if lp:
        seg = lowpass(seg, lp)
    ref = float(np.abs(seg).max()) if peak else body_rms(seg)
    seg *= 10 ** ((level - db(ref)) / 20)
    f1, f2 = max(1, int(fi * SR)), max(1, int(fo * SR))
    seg[:f1] *= np.linspace(0, 1, min(f1, n))[:, None][: len(seg[:f1])]
    seg[-f2:] *= np.linspace(1, 0, min(f2, n))[:, None][-len(seg[-f2:]):]
    if pan is not None:  # pan: function of time (s) -> -1..1, equal-power
        t = np.arange(len(seg)) / SR
        p = np.clip(pan(t), -1, 1)
        seg[:, 0] *= np.cos((p + 1) * np.pi / 4) * 1.41
        seg[:, 1] *= np.sin((p + 1) * np.pi / 4) * 1.41
    p0 = int(at * SR)
    e = min(N, p0 + len(seg))
    fx[p0:e] += seg[: e - p0]
    report.append(f'{at:7.2f}s  {label or name:<34} {length:5.1f}s  {"peak" if peak else "body"} {level}')


def shepard(start, end, release, lo=-40, hi=-27, period=6.0):
    n = int((end - start) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    K = 7
    for k in range(K):
        pos = (k + t / period) % K
        ph = 2 * np.pi * np.cumsum(55.0 * 2 ** pos) / SR
        out += (np.exp(-0.5 * ((pos - K / 2) / 1.1) ** 2) * np.sin(ph)).astype(np.float32)
    out /= np.sqrt((out ** 2).mean())
    out *= 10 ** (np.linspace(lo, hi, n) / 20)
    out[: int(1.5 * SR)] *= np.linspace(0, 1, int(1.5 * SR))
    r = int((release - start) * SR)
    out[r: r + int(0.4 * SR)] *= np.linspace(1, 0, int(0.4 * SR))
    out[r + int(0.4 * SR):] = 0
    p = int(start * SR)
    fx[p: p + n] += np.stack([out, out], 1)
    report.append(f'{start:7.2f}s  Shepard tone, released at {release:.2f}')


# ---------- narration: every line levelled to the same body loudness ----------
for l in L:
    a = load(l['file'])
    a = a * 10 ** ((-20 - db(body_rms(a))) / 20)
    p = int(l['start'] * SR)
    voice[p: p + len(a)] += a[: N - p]

swirl = lambda t: np.sin(t * 0.9) * 0.8  # the wind circles the listener
# 1. cold open: the house is flying (sound before picture)
place('01a-tornado', 0.0, S(2) + 5.5, -24, fi=0.8, fo=0.3, pan=swirl, label='tornado roar (swirling)')
place('01b-house-creak', 1.0, S(2) + 4.5, -30, fo=0.3, label='house creaking')
place('13-muffled-storm', S(2) + 5.5, E(2) - S(2) - 5.3, -27, fi=0.05, fo=0.15, label='storm through the walls')
place('11b-dishes', S(2) + 6, 3.0, -16, peak=True, label='dishes rattling')
place('14-rocking', S(2) + 5.5, E(2) - S(2) - 5.3, -31, fi=0.05, fo=0.15, label='room creaking')
# 2. CUT to near-silence: the title, then the still gray prairie
place('02a-prairie-wind', S(3) - 0.9, S(12) + 8 - S(3) + 0.9, -36, fi=1.0, fo=1.5, label='dry prairie wind (bed)')
place('02b-fly', S(3) + 0.6, 4.9, -30, peak=True, loop=False, pan=lambda t: np.sin(t * 2) * 0.7, label='a single fly')
place('02b-fly', S(5) + 19, 4.9, -32, peak=True, loop=False, pan=lambda t: -np.sin(t * 1.5) * 0.7, label='a single fly')
place('04a-windmill', S(4) + 1.0, 5.0, -24, peak=True, loop=False, pan=lambda t: 0.6 + t * 0, label='windmill, far')
place('03a-floorboard', S(4) + 16.5, 2.0, -18, peak=True, loop=False, label='floorboard (inside)')
place('03b-trapdoor', S(4) + 24.5, 2.0, -20, peak=True, loop=False, label='trapdoor (soft)')
place('04b-cow', S(7) + 8, 3.0, -26, peak=True, loop=False, lp=2500, pan=lambda t: 0.7 + t * 0, label='cow, far away')
place('04a-windmill', S(9) + 3, 5.0, -26, peak=True, loop=False, pan=lambda t: -0.5 + t * 0, label='windmill, far')
place('04b-cow', S(9) + 11, 3.0, -27, peak=True, loop=False, lp=2500, pan=lambda t: -0.6 + t * 0, label='cow, far away')
# 3. Toto: the first warmth
for k, d in enumerate([1.5, 5.2, 9.0, 13.5]):
    place('05-dog-yip', S(10) + d, 3.0, -14 - k, peak=True, loop=False, pan=lambda t: np.sin(t + k) * 0.5, label='Toto yips')
# 4. the storm comes (sound leads the picture)
place('06a-wind-rising', S(12) + 8.5, 8.1, -22, peak=True, loop=False, pan=lambda t: -0.8 + t * 0.05, label='north wind rising (left)')
place('06b-grass-rustle', S(12) + 8.5, S(16) - S(12) - 8.5, -30, fi=1.0, label='grass bowing in waves')
place('07-whistle-wind', S(12) + 15.5, 5.0, -20, peak=True, loop=False, pan=lambda t: 0.8 - t * 0.05, label='south wind whistles (right)')
place('08a-storm-building', S(12) + 16, S(17) - S(12) - 16, -26, fi=1.5, fo=0.2, label='storm building (bed)')
place('01a-tornado', S(13), S(17) - S(13), -30, fi=4.0, fo=0.2, lp=1800, label='the cyclone, distant')
place('08b-boots', S(15) + 0.2, 3.0, -16, peak=True, loop=False, label='boots running on dirt')
place('08c-horses', S(15) + 1.2, 3.0, -18, peak=True, loop=False, pan=lambda t: 0.7 + t * 0, label='horses neigh')
place('09a-screen-door', S(15) + 4.8, 1.5, -12, peak=True, loop=False, label='screen door bangs')
# 5. inside: the storm is muffled
place('13-muffled-storm', S(17), S(23) - S(17), -27, fi=0.05, fo=0.3, label='storm outside, muffled (bed)')
place('10-dog-scramble', S(17) + 0.9, 3.0, -14, peak=True, loop=False, label='Toto scrambles under the bed')
place('09b-trapdoor-open', S(19) + 0.6, 1.5, -10, peak=True, loop=False, label='trapdoor thrown open')
place('11a-gust', E(20) - 1.2, 3.0, -6, peak=True, loop=False, label='GREAT SHRIEK of wind')
place('11c-walls-shake', E(20) - 0.6, 3.0, -9, peak=True, loop=False, label='walls shudder')
place('11b-dishes', S(21) - 0.2, 2.5, -11, peak=True, loop=False, label='dishes rattle')
shepard(S(22) - 0.6, S(25) + 2, release=S(25) - 0.2)
# 6. lift-off
place('12a-house-groan', S(23) - 0.3, 4.0, -10, peak=True, loop=False, label='timber groans')
place('12b-wind-swirl', S(23) + 1.0, S(25) - S(23) - 1.0, -24, fi=0.8, fo=0.6, pan=swirl, label='wind swirling all around')
place('01a-tornado', S(23), S(25) - S(23), -25, fi=0.6, fo=1.0, pan=lambda t: -swirl(t), label='the cyclone (outside)')
# 7. the eye: calm inside, roar outside (muffled)
place('13-muffled-storm', S(25) - 0.3, S(32) + 10 - S(25), -29, fi=0.8, fo=4.0, label='roar outside, muffled')
place('14-rocking', S(25), S(26) - S(25) + 1, -27, fi=1.0, fo=1.0, label='gentle rocking creak')
for k, d in enumerate([0.8, 2.6, 4.4, 6.2]):
    place('05-dog-yip', S(26) + d, 3.0, -16, peak=True, loop=False, pan=lambda t, k=k: (-1) ** k * 0.4 + t * 0, label='Toto barks')
place('15a-dog-yelp', E(26) - 0.7, 1.5, -10, peak=True, loop=False, label='Toto yelps')
place('15b-whoosh', E(26) - 0.6, 1.5, -12, peak=True, loop=False, label='falling whoosh')
place('11a-gust', S(27) + 0.2, 3.0, -16, peak=True, loop=False, lp=3000, label='gust from the hole')
place('03b-trapdoor', S(28) + 20.5, 2.0, -11, peak=True, loop=False, label='trapdoor shut (relief)')
place('17-howling-wind', S(29) - 0.5, S(32) + 6 - S(29), -31, fi=1.5, fo=5.0, lp=1500, label='long howling wind')
place('14-rocking', S(32), 10.0, -31, fi=0.5, fo=4.0, label='swaying floor')
place('18-wind-fading', S(32) + 7, 8.0, -28, peak=False, loop=False, fo=2.5, label='wind drifts far away')
# 8. the landing, then TRUE silence
place('19a-crash', S(33) - 0.25, 3.0, -2, peak=True, loop=False, fi=0.005, label='HEAVY THUMP')
place('19b-wood-crack', S(33) - 0.15, 2.0, -6, peak=True, loop=False, fi=0.005, fo=0.4, label='timber crack')
# (S(34) .. S(35)+2: nothing at all)
place('21-bird', S(35) + 6.0, 3.0, -22, peak=True, loop=False, pan=lambda t: 0.6 + t * 0, label='one soft bird (outside)')
# 9. colour arrives with birdsong
place('22a-door-creak', S(36) + 3.4, 2.5, -12, peak=True, loop=False, label='door creaks open')
place('22b-birdsong', S(36) + 3.8, DUR - S(36) - 3.8, -29, fi=0.4, fo=3.0, label='burst of birdsong (bed)')
place('22c-brook', S(36) + 4.0, DUR - S(36) - 4.0, -33, fi=1.5, fo=3.0, label='brook (bed)')
place('23a-tiny-bells', S(39) + 0.5, S(40) + 3.5 - S(39) - 0.5, -25, fi=2.0, fo=0.15, label='tiny hat bells, walking')
place('23b-footsteps', S(39) + 0.5, S(40) + 3.5 - S(39) - 0.5, -32, fi=2.0, fo=0.3, label='small footsteps on grass')
place('24-bells-stop', S(40) + 3.4, 1.5, -18, peak=True, loop=False, label='the bells stop')
place('25-shimmer', S(43) + 4.4, 3.0, -12, peak=True, loop=False, fo=1.2, label='silver shoes: the sting')

# ---------- duck the effects under the voice so the narrator is never masked ----------
env = np.abs(voice).max(axis=1)
w = int(0.25 * SR)
c = np.concatenate([[0], np.cumsum(env, dtype=np.float64)])
idx = np.arange(len(env))
lo, hi = np.clip(idx - w // 2, 0, len(env)), np.clip(idx + w // 2, 0, len(env))
env = ((c[hi] - c[lo]) / np.maximum(1, hi - lo)).astype(np.float32)
duck = 1 - 0.65 * np.clip(env / (10 ** (-30 / 20)), 0, 1)  # up to ~-9 dB under speech
mix = voice + fx * duck[:, None]
mix = mix[: int(DUR * SR)]
# silence after the thump stays silent
a, b = int((S(34) - 0.6) * SR), int((S(35) + 2.0) * SR)
mix[a:b] = voice[a:b]

rms = float(np.sqrt((mix ** 2).mean()))
mix *= 10 ** ((-19 - db(rms)) / 20)
th = 10 ** (-3 / 20)
m = np.abs(mix)
o = m > th
mix[o] = np.sign(mix[o]) * (th + (1 - th) * np.tanh((m[o] - th) / (1 - th))) * 10 ** (-1 / 20)
os.makedirs(os.path.join(ROOT, 'out', 'oz'), exist_ok=True)
wp = os.path.join(ROOT, 'out', 'oz', 'mix.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
vp = os.path.join(ROOT, 'out', 'oz', 'voice.wav')
v = voice[: int(DUR * SR)] * 10 ** ((-19 - db(float(np.sqrt((mix ** 2).mean())))) / 20)
with wave.open(vp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((np.clip(voice[: int(DUR * SR)], -1, 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(ROOT, 'public', 'oz', 'mix.m4a')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wp, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', out], check=True)
print(f'{DUR:.1f}s  master rms {db(float(np.sqrt((mix ** 2).mean()))):.1f} dBFS, peak {db(float(np.abs(mix).max())):.1f} dBFS -> {out}')
if '--report' in sys.argv:
    print('\n'.join(report))
