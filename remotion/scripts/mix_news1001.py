"""Mix and master the soundtrack for "AI News, 1 Oct 2026": out/news1001/mix.wav.

No ElevenLabs credits are used for music or effects (the user's rule). Sources:
  - voiceover: Asher (ElevenLabs), one take per segment, public/news1001/vo/s<N>.mp3
  - music: Kevin MacLeod (incompetech.com), CC BY 4.0, dark suspense cues, one per story,
    crossfaded at story changes and ducked ~12 dB under the voice
  - effects: Kenney.nl audio packs (CC0) and BigSoundBank recordings (CC0) already in public/sfx
Cue times come from src/news1001/timing.json and the scene list in src/news1001/scenes.tsx
(the same windows Film.tsx computes). Master: -14 LUFS integrated, -1 dBTP (ffmpeg loudnorm, 2-pass).
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
FPS = 24
LEAD = 8
T = json.load(open(os.path.join(ROOT, 'src/news1001/timing.json')))
N = int((T['duration'] + 0.5) * SR)
TMP = '/tmp/news1001_mix'
os.makedirs(TMP, exist_ok=True)
MUS = os.path.join(ROOT, 'out/news1001/music')
SFX = os.path.join(ROOT, 'out/news1001/sfx')


def load(path):
    out = os.path.join(TMP, re.sub(r'[^\w.]', '_', os.path.basename(path)) + '.wav')
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '2', '-ar', str(SR), '-sample_fmt', 's16', out], check=True)
    w = wave.open(out)
    d = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768
    return d


def place(buf, sig, t, gain=1.0):
    i0 = int(t * SR)
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: max(0, N - i0)]
    buf[i0:i0 + len(sig)] += sig * gain


rms = lambda x: float(np.sqrt((x ** 2).mean() + 1e-12))
fr = lambda s: round(s * FPS)

# ------------------------------------------------------------------ scene windows (mirror of Film.tsx)
src = open(os.path.join(ROOT, 'src/news1001/scenes.tsx')).read()
scenes = [(int(a), int(b), 'card: true' in rest, name) for a, b, name, rest in re.findall(r"\{ch: (\d+), from: (\d+), C: ([^,}]+(?:\([^)]*\))?)(.*?)\}", src)]
line = {(l['ch'], l['i']): l for l in T['lines']}
starts = [fr(T['chapters'][ch]['start']) if card else fr(line[(ch, fm)]['start']) - LEAD for ch, fm, card, _ in scenes]
total = fr(T['duration'])
WIN = []
for k, (ch, fm, card, name) in enumerate(scenes):
    nxt = starts[k + 1] if k + 1 < len(scenes) else total
    nm = scenes[k + 1] if k + 1 < len(scenes) else None
    ls = [] if card else [fr(l['start']) - starts[k] for l in T['lines'] if l['ch'] == ch and l['i'] >= fm and (nm is None or nm[0] != ch or nm[2] or l['i'] < nm[1])]
    WIN.append({'name': name.split('.')[-1].strip(), 'ch': ch, 'from': starts[k], 'dur': nxt - starts[k], 'lines': ls, 'card': card})
W = {w['name']: w for w in WIN if not w['card']}
L = lambda name, k: W[name]['from'] + (W[name]['lines'][k] if k < len(W[name]['lines']) else W[name]['dur'] - 10)
sec = lambda frame: frame / FPS

# ------------------------------------------------------------------ voice
vo = np.zeros((N, 2), np.float32)
for ci, ch in enumerate(T['chapters']):
    v = load(os.path.join(ROOT, f'public/news1001/vo/s{ci}.mp3'))
    active = v[np.abs(v).max(1) > 0.02]
    v *= 10 ** (-18 / 20) / rms(active)
    place(vo, v, ch['vo'])

# ------------------------------------------------------------------ music: one suspense cue per story, crossfaded
# dark, low, minor-key suspense cues only (the user rejected the playful spy/pizzicato ones)
CUES = ['Anxiety', 'Anxiety', 'Static Motion', 'Apprehension', 'Interloper', 'Penumbra', 'Unanswered Questions', 'Long Note Three', 'Echoes of Time v2', 'Anxiety']
music = np.zeros((N, 2), np.float32)
XF = 1.6
i = 0
while i < len(CUES):
    j = i
    while j + 1 < len(CUES) and CUES[j + 1] == CUES[i] and (i, j + 1) != (0, 9):
        j += 1
    t0 = T['chapters'][i]['start']
    t1 = T['chapters'][j]['end'] if j + 1 < len(CUES) else T['duration'] + 0.5
    m = load(os.path.join(MUS, f'{CUES[i]}.mp3'))
    m = m[int(2.0 * SR):] if i > 0 else m  # skip slow intros mid-film
    m *= 10 ** (-20 / 20) / rms(m[: 60 * SR])
    need = int((t1 - t0 + XF) * SR)
    while len(m) < need:  # loop if a story outlasts the cue
        m = np.concatenate([m, m])
    seg = m[:need].copy()
    n_in = int(XF * SR)
    seg[:n_in] *= np.linspace(0, 1, n_in)[:, None] if i > 0 else 1
    seg[-n_in:] *= np.linspace(1, 0, n_in)[:, None]
    place(music, seg, t0 - (XF / 2 if i > 0 else 0))
    i = j + 1

# duck under the voice (smoothed: ~250 ms attack, ~700 ms release)
env = np.abs(vo).max(1)
hop = SR // 100
blk = np.array([env[k:k + hop].max() for k in range(0, N, hop)])
talk = (blk > 0.01).astype(float)
duck = np.empty_like(talk)
cur = 0.0
for k, x in enumerate(talk):
    cur += (x - cur) * (0.04 if x > cur else 0.014)
    duck[k] = cur
gain = 10 ** ((-12 * np.repeat(duck, hop)[:N]) / 20)
music *= gain[:, None] * 0.95

# ------------------------------------------------------------------ effects
fx = np.zeros((N, 2), np.float32)
kn = lambda pack, f: load(os.path.join(SFX, pack, 'Audio', f))
bsb = lambda f: load(os.path.join(ROOT, 'public/sfx', f))
slides = [kn('casino-audio', f'card-slide-{k}.ogg') for k in range(1, 9)]
whoosh = [bsb('whoosh1.mp3'), bsb('whoosh7.mp3'), bsb('whoosh8.mp3')]
stamp = kn('impact-sounds', 'impactSoft_heavy_002.ogg')
stamp2 = kn('impact-sounds', 'impactPunch_medium_001.ogg')
bell = kn('impact-sounds', 'impactBell_heavy_001.ogg')
chips = [kn('casino-audio', f'chips-stack-{k}.ogg') for k in range(1, 7)]
tick = kn('interface-sounds', 'tick_002.ogg')
pop = kn('interface-sounds', 'pluck_001.ogg')
pop2 = kn('interface-sounds', 'pluck_002.ogg')
click = kn('rpg-audio', 'metalClick.ogg')
flip = [kn('rpg-audio', f'bookFlip{k}.ogg') for k in (1, 2, 3)]
thud = kn('impact-sounds', 'impactGeneric_light_002.ogg')
for s in [stamp, stamp2, bell, tick, pop, pop2, click, thud] + slides + whoosh + chips + flip:
    s *= 10 ** (-14 / 20) / max(1e-6, float(np.abs(s).max()))  # every cue peak-normalised, then gained below

for k, w in enumerate(WIN):
    t = sec(w['from'])
    if w['card']:
        place(fx, whoosh[0], t, 0.9)
        place(fx, stamp2, t + 4 / FPS, 1.2)
    else:
        place(fx, slides[k % 8], t + 2 / FPS, 0.75)
        place(fx, slides[(k + 3) % 8], t + 14 / FPS, 0.45)
    place(fx, whoosh[1 + k % 2], sec(w['from'] + w['dur'] - 10), 0.35)  # pieces fly past the lens

def stamp_at(frame, g=1.3):
    place(fx, stamp, sec(frame), g)
    place(fx, thud, sec(frame), 0.5)

def money(frame, n=6, every=5):
    for q in range(n):
        place(fx, chips[q % 6], sec(frame + q * every), 0.55)

def ticks(frame, n=10, every=3):
    for q in range(n):
        place(fx, tick, sec(frame + q * every), 0.35 * (1 - q / (n + 2)))

# hook
money(W['H3']['from'] + 2, 10, 5)
ticks(W['H3']['from'] + 4, 14, 3)
place(fx, bell, sec(L('H3', 0) + 70), 1.0)
for q in range(3):
    place(fx, flip[q], sec(W['H4']['from'] + q * 12 + 4), 0.8)
# preview: seven folders, then seven CONFIRMED stamps
for q in range(7):
    place(fx, flip[q % 3], sec(L('P0', q) - 2), 0.7)
    stamp_at(L('P0', 7) + 10 + q * 4, 0.9)
# story 1
place(fx, click, sec(L('G2', 1) + 50), 0.6)
ticks(W['G3']['from'] + 10, 10, 3)
stamp_at(L('G5', 1) + 30, 0.6)
# story 2
stamp_at(W['F1']['from'] + 34)
stamp_at(W['F4']['from'] + 20, 0.6)
# story 3
stamp_at(W['A1']['from'] + 20)
stamp_at(L('A6', 1) + 110, 1.5)
# story 4
ticks(W['M1']['from'] + 12, 16, 3)
stamp_at(W['M7']['from'] + 20, 0.7)  # the padlock drops
# story 5
money(L('T2', 0) + 70, 3, 6)
money(L('T2', 0) + 130, 10, 4)
stamp_at(L('T3', 1) + 70)
money(W['T6']['from'] + 4, 14, 4)
# story 6
money(W['O0']['from'] + 6, 10, 5)
place(fx, bell, sec(L('O0', 1) + 10), 1.0)
span = max(30, (L('O2', 2) - L('O2', 1)) / 3)
for q in range(3):
    stamp_at(int(L('O2', 1) + q * span - 6 + 40), 0.9)
# story 7: message pops
place(fx, pop, sec(W['D0']['from'] + 40), 0.8)
place(fx, pop2, sec(W['D0']['from'] + 60), 0.8)
ticks(W['D1']['from'] + 10, 12, 3)
sp = L('D2', 1) - L('D2', 0)
place(fx, pop, sec(W['D2']['from'] + sp * 0.62), 0.8)
place(fx, pop2, sec(W['D2']['from'] + sp * 0.75), 0.8)
place(fx, pop, sec(W['D4']['from'] + 12), 0.8)
place(fx, pop2, sec(W['D4']['from'] + 40), 0.8)
# outro: like, subscribe, the lamp switches off
spE = L('E1', 1) - L('E1', 0)
place(fx, click, sec(W['E1']['from'] + spE * 0.12), 0.8)
place(fx, click, sec(W['E1']['from'] + spE * 0.36), 0.8)
place(fx, click, sec(W['E2']['from'] + 40), 1.0)

# the user chose no background music (1 Oct 2026, round 5): voice + effects only
MUSIC = False
mix = vo + fx + (music if MUSIC else 0)
out = os.path.join(ROOT, 'out/news1001/mix-raw.wav')
pk = float(np.abs(mix).max())
if pk > 0.98:
    mix *= 0.98 / pk
w = wave.open(out, 'wb')
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
w.close()

# loudness: two-pass loudnorm to -14 LUFS / -1 dBTP
probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', out, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
mj = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
final = os.path.join(ROOT, 'out/news1001/mix.wav')
af = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={mj['input_i']}:measured_TP={mj['input_tp']}:measured_LRA={mj['input_lra']}:measured_thresh={mj['input_thresh']}:offset={mj['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', out, '-af', af, '-ar', str(SR), final], check=True)
print('scenes', len(WIN), 'duration', T['duration'], 'input', mj['input_i'], 'LUFS ->', final)
