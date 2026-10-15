"""Mix "The Hidden Cost of AI": voiceover + ElevenLabs music beds + ElevenLabs sound effects → out/hcai/mix.wav.

- Voice: each slice of each chapter take goes where out/hcai/vo_segments.json says (pauses already built in).
- Music: one bed per chapter (out/hcai/music/m<N>.mp3), looped with 4 s crossfades to fill the chapter,
  ducked under the voice by a side-chain envelope, with the script's [M] cues as automation (drops, pauses).
- Effects: every "s" beat in src/hcai/beats.json, a soft swoosh on every scene clear and chapter card,
  and ambience beds for the hot aisle, the turbines, the empty office and the night hum.
- Master: two-pass loudnorm to -14 LUFS, -1 dBTP (YouTube).
"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.join(os.path.dirname(__file__), '..')
O = os.path.join(ROOT, 'out/hcai')
SR = 48000
T = json.load(open(os.path.join(ROOT, 'src/hcai/timing.json')))
B = json.load(open(os.path.join(ROOT, 'src/hcai/beats.json')))
SEG = json.load(open(os.path.join(O, 'vo_segments.json')))
# --strip: the film-strip edition (src/hcai/strip.json) → out/hcai/mix_strip.wav
STRIP = json.load(open(os.path.join(ROOT, 'src/hcai/strip.json'))) if '--strip' in sys.argv else None
OUT = 'mix_strip.wav' if STRIP else 'mix.wav'
# --no-sfx: voice and music only (the user is making their own effects; their files go in out/hcai/sfx_user/)
NO_SFX = '--no-sfx' in sys.argv
USER_SFX = '--user-sfx' in sys.argv
N = int((T['duration'] + 1) * SR)
db = lambda x: 10 ** (x / 20)
_cache = {}
def load(p):
    if p not in _cache:
        raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        _cache[p] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _cache[p]
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-9)
def place(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    a, b = max(0, i), min(len(buf), i + len(x))
    buf[a:b] += x[a - i:b - i] * gain
def fade(x, fi=0.01, fo=0.01):
    x = x.copy(); n = len(x)
    a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None]
    return x

# ---------------------------------------------------------------- voice
vo = np.zeros((N, 2), np.float32)
for s in SEG:
    x = load(os.path.join(O, 'vo', s['file']))
    seg = x[int(s['src'] * SR): int((s['src'] + s['len']) * SR)]
    place(vo, fade(seg, 0.005, 0.02), s['at'])
vo_level = rms(vo[np.abs(vo).max(1) > 0.01])
print('voice rms dBFS', round(20 * np.log10(vo_level), 1))

# ---------------------------------------------------------------- music beds
mus = np.zeros((N, 2), np.float32)
XF = 4.0
for ci, ch in enumerate(T['chapters']):
    x = load(os.path.join(O, 'music', f'm{ci}.mp3'))
    x = x / rms(x) * vo_level * db(-12)  # bed sits 12 dB under the voice before ducking
    a, e = ch['start'], ch['end'] + (1.5 if ci < len(T['chapters']) - 1 else 0)
    need = e - a
    out = np.zeros((int(need * SR) + SR, 2), np.float32)
    pos, n = 0, int(XF * SR)
    first = True
    while pos < len(out):
        seg = x.copy()
        if not first: seg[:n] *= np.linspace(0, 1, n)[:, None]
        seg[-n:] *= np.linspace(1, 0, n)[:, None]
        m = min(len(seg), len(out) - pos)
        out[pos:pos + m] += seg[:m]
        pos += len(seg) - n; first = False
    out = fade(out[: int(need * SR)], 1.2 if ci else 2.5, 2.0)
    place(mus, out, a)

# automation from the script's [M] cues: (time, gain dB) ramps
lines = {(l['ch'], l['i']): l for l in T['lines']}
def L(c, i): return lines[(c, i)]
auto = []  # (t0, t1, gain_dB) windows with 0.6 s ramps
def dip(t0, t1, g): auto.append((t0, t1, g))
dip(0.0, L(0, 5)['start'] - 0.1, -30)            # cold open: silence, one keyboard click (bed creeps in after the hard cut)
dip(L(2, 14)['start'] - 1.6, L(2, 14)['start'] + 0.2, -24)  # a beat of silence before Three Mile Island
dip(L(2, 36)['start'] - 0.3, L(2, 39)['end'], -6)          # a single held note
dip(L(4, 13)['start'] - 0.8, L(4, 16)['start'] - 0.3, -40)  # music drops out, only room tone
dip(L(6, 9)['start'] - 1.0, L(6, 9)['end'], -8)
dip(L(7, 11)['start'] - 0.8, L(7, 12)['start'] - 0.2, -30)  # the music pauses
dip(L(8, 8)['start'] - 1.2, L(8, 11)['end'], -14)          # near-silence for the answer
dip(L(8, 29)['start'] - 1.8, L(8, 29)['start'], -10)
g = np.zeros(N, np.float32)
tt = np.arange(N) / SR
for t0, t1, gd in auto:
    w = np.clip(np.minimum((tt - t0) / 0.6 + 1, (t1 - tt) / 0.6 + 1), 0, 1)
    g = np.minimum(g, gd * w)
mus *= (10 ** (g / 20))[:, None]

# side-chain duck: about -9 dB while the narrator speaks, back up in the gaps
env = np.abs(vo).max(1)
hop = 480
e = env[: len(env) // hop * hop].reshape(-1, hop).max(1)
sm = np.zeros_like(e); a_att, a_rel = 0.5, 0.04
for i in range(1, len(e)):
    k = a_att if e[i] > sm[i - 1] else a_rel
    sm[i] = sm[i - 1] + k * (e[i] - sm[i - 1])
duck = 1 - 0.65 * np.clip(sm / 0.05, 0, 1)
duck = np.repeat(duck, hop)
duck = np.pad(duck, (0, N - len(duck)), constant_values=1)
mus *= duck[:, None]

# ---------------------------------------------------------------- effects
fx = np.zeros((N, 2), np.float32)
LEVEL = {  # dB relative to the voice level (peak-ish feel); beds are lower
    'key': -6, 'enter': -4, 'typing': -10, 'swoosh': -16, 'sting_title': -4, 'sting': -6, 'gavel': -8, 'stamp': -8, 'pen': -10,
    'tv_static': -14, 'oven': -12, 'drips': -14, 'cooling_tower': -18, 'meeting': -18, 'powerline': -18, 'counter': -14, 'sand': -14,
    'digging': -16, 'trucks': -16, 'steam_engine': -16, 'monitor_off': -10, 'photo_drop': -16, 'ewaste': -14, 'protest': -20, 'wind_turbine': -18,
    'fans': -16, 'turbines': -18, 'room_tone': -14, 'hum_night': -12,
}
BED = {'fans': 6.0, 'turbines': 6.5, 'room_tone': 0, 'hum_night': 0}  # seconds (0 = until a later line)
def sfx(name): return load(os.path.join(O, 'sfx', name + '.mp3'))
def put(name, t, dur=None, gain_db=None):
    x = sfx(name)
    x = x / max(rms(x), 1e-4) * vo_level * db(gain_db if gain_db is not None else LEVEL.get(name, -12))
    if dur:
        reps = int(np.ceil(dur * SR / len(x))) + 1
        x = np.concatenate([x] * reps)[: int(dur * SR)]
        x = fade(x, 0.8, 1.5)
    else:
        x = fade(x, 0.003, 0.05)
    place(fx, x, t)
if not USER_SFX:
    for b in B:
        if b['kind'] != 's': continue
        name = b['ref']
        if name in BED:
            d = BED[name]
            if name == 'room_tone': d = L(4, 16)['start'] - b['t']
            if name == 'hum_night': d = L(6, 16)['end'] - b['t'] + 0.5
            put(name, b['t'] - 0.3, d)
        else:
            put(name, b['t'] - (0.05 if name in ('key', 'enter', 'gavel', 'stamp') else 0.15))
    # a soft swoosh on every scene clear (film-strip edition: on every slide of the strip), and on every chapter card
    if STRIP:
        for prev, f in zip(STRIP['frames'], STRIP['frames'][1:]):
            if f['ch'] == prev['ch']: put('swoosh', f['at'] - 0.25, gain_db=-21)
    else:
        for b in B:
            if b['kind'] == 'clear': put('swoosh', b['t'] + 0.05)
    for ci, ch in enumerate(T['chapters'][1:], 1): put('swoosh', ch['start'] + 0.1, gain_db=-12)
    put('sting_title', [l for l in T['lines'] if l['ch'] == 0][-1]['end'] + 0.4, gain_db=-3)
    # the cursor: one click at the very start, one at the very end
    put('key', 0.6)
else:
    # the user's own effects (out/hcai/sfx_user/<name>.mp3): each goes where the old cue was; a file not there yet is skipped
    UD = os.path.join(O, 'sfx_user')
    RENAME = {'enter': 'enter_send', 'gavel': 'court_gavel', 'sting_title': 'title_hit', 'stamp': 'rubber_stamp', 'digging': 'mine_digging',
              'fans': 'datacenter_fans', 'turbines': 'gas_turbines', 'cooling_tower': 'cooling_tower', 'drips': 'water_drips',
              'protest': 'protest_crowd', 'room_tone': 'office_night', 'trucks': 'mining_trucks', 'ewaste': 'ewaste_clatter',
              'pen': 'pen_signature', 'powerline': 'power_lines', 'hum_night': 'night_hum', 'steam_engine': 'steam_engine'}
    ULEVEL = {'film_advance': -24, 'chapter_turn': -16, 'typing': -12, 'enter_send': -9, 'title_hit': -4, 'key_click': -9,
              'court_gavel': -9, 'rubber_stamp': -9, 'pen_signature': -11, 'ewaste_clatter': -14, 'water_drips': -15, 'mine_digging': -16,
              'mining_trucks': -17, 'cooling_tower': -18, 'power_lines': -18, 'datacenter_fans': -18, 'gas_turbines': -18,
              'protest_crowd': -20, 'office_night': -17, 'night_hum': -13, 'steam_engine': -16}
    UBED = {'datacenter_fans': 6.0, 'gas_turbines': 6.5, 'office_night': 0, 'night_hum': 0}
    missing = set()
    def uput(name, t, dur=None, gain_db=None):
        f = os.path.join(UD, name + '.mp3')
        if not os.path.exists(f):
            missing.add(name)
            return
        x = load(f)
        loud = x[np.abs(x).max(1) > 0.01]  # level by the audible part, so sparse hits don't come out loud
        g = gain_db if gain_db is not None else ULEVEL.get(name, -14)
        x = x / max(rms(loud if len(loud) else x), 1e-4) * vo_level * db(g)
        peak = np.abs(x).max()
        if peak > vo_level * db(g + 20): x *= vo_level * db(g + 20) / peak  # very quiet files: don't lift the clicks (or hiss) too far
        if dur:
            reps = int(np.ceil(dur * SR / len(x))) + 1
            x = fade(np.concatenate([x] * reps)[: int(dur * SR)], 0.8, 1.5)
        else:
            x = fade(x, 0.003, 1.0 if len(x) > 3 * SR else 0.05)
        place(fx, x, t)
    for b in B:
        if b['kind'] != 's': continue
        name = RENAME.get(b['ref'])
        if b['ref'] == 'key':
            name = 'typing' if b['t'] < 60 else 'key_click'
        if not name: continue  # dropped: stings, oven, wind turbine, TV static, meeting, sand
        if name in UBED:
            d = UBED[name]
            if name == 'office_night': d = L(4, 16)['start'] - b['t']
            if name == 'night_hum': d = L(6, 16)['end'] - b['t'] + 0.5
            uput(name, b['t'] - 0.3, d)
        elif name == 'typing':
            uput(name, b['t'] + 0.35)  # the question starts typing about 10 frames after the screen appears
        else:
            uput(name, b['t'] - (0.05 if name in ('enter_send', 'court_gavel', 'rubber_stamp', 'key_click') else 0.15))
    if STRIP:  # the strip's slides: up to three takes of the film advance, in turn
        takes = [n for n in ('film_advance', 'film_advance_1', 'film_advance_2', 'film_advance_3') if os.path.exists(os.path.join(UD, n + '.mp3'))] or ['film_advance']
        k = 0
        for prev, f in zip(STRIP['frames'], STRIP['frames'][1:]):
            if f['ch'] == prev['ch'] and f.get('mode', 'strip') == 'strip':  # only when the strip itself moves
                uput(takes[k % len(takes)], f['at'] - 0.4)
                k += 1
    for ci, ch in enumerate(T['chapters'][1:], 1): uput('chapter_turn', ch['start'] + 0.1)
    uput('title_hit', [l for l in T['lines'] if l['ch'] == 0][-1]['end'] + 0.4, gain_db=-3)
    print('effects not here yet:', ', '.join(sorted(missing)) or 'none')

if NO_SFX: fx[:] = 0
mix = vo + mus + fx
peak = np.abs(mix).max()
print('pre-master peak', round(20 * np.log10(peak), 1), 'dBFS')
raw = os.path.join(O, OUT.replace('.wav', '_raw.wav'))
pcm = (np.clip(mix / max(1.0, peak), -1, 1) * 32767).astype(np.int16)
import wave
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# report: each effect cue vs the music under it
m_rms = rms(mus[np.abs(vo).max(1) > 0.01])
print('music under voice', round(20 * np.log10(m_rms / vo_level), 1), 'dB re voice')
# two-pass loudnorm
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'alimiter=limit=0.84:attack=3:release=60:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
af = f"alimiter=limit=0.84:attack=3:release=60:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), os.path.join(O, OUT)], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', os.path.join(O, OUT), '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
print('master', js['input_i'], 'LUFS', js['input_tp'], 'dBTP')
