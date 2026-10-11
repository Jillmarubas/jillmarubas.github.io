"""Mix and master "ChatGPT Now Builds Answers You Can Click" (AI News Daily, 10 Oct 2026): out/gpt1010/mix.wav (+ soundtrack.m4a).

Voice + effects only (no music, the user's rule): the single short swoosh (public/sfx/whoosh7.mp3,
BigSoundBank CC0) once per scene change, plus the user's own recordings (public/cc1003/sfx/):
laptop typing under every typed prompt, an Enter key on each submit (and on the Tab press), and a
mouse click where the cursor clicks. No synthesized effects. All times come from
out/gpt1010/cues.json (node scripts/gpt1010_cues.mjs), which bundles the same src/gpt1010/cues.ts
and plan.ts the picture uses; keystroke times mirror keys.ts typeTimes().
Master: -14 LUFS integrated, -1 dBTP (ffmpeg loudnorm, 2 pass), 48 kHz stereo.
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
Q = json.load(open(os.path.join(ROOT, 'out/gpt1010/cues.json')))
DUR = Q['duration']
N = int((DUR + 0.5) * SR)
OUT = os.path.join(ROOT, 'out/gpt1010')
TMP = '/tmp/gpt1010_mix'
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)
SC = Q['windows']
CH = Q['chapters']
print(len(SC), 'scenes')

def rnd(seed):
    h = 2166136261
    for ch in seed:
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return (h % 10000) / 10000


def type_times(text, at, by):
    n = len(text)
    natural = 1 / 15
    span = max(0.2, by - 0.18 - at)
    step = min(natural, span / max(1, n))
    out, t = [], at
    for i in range(n):
        out.append(t)
        t += step * (0.7 + rnd(text + str(i)) * 0.6) + (step * 0.25 if text[i] == ' ' else 0)
    last = out[-1] if out else at
    lim = by - 0.18
    if last > lim:
        out = [at + (x - at) * (lim - at) / max(0.001, last - at) for x in out]
    return out

# ------------------------------------------------------------- typed prompts, key taps, clicks (from cues.json)
keys, enters, clicks = [], [], list(Q['clicks'])
for c in Q['typed']:
    if c.get('enter') is None:
        keys += type_times(c['text'], c['at'], c['at'] + 99)
    else:
        keys += type_times(c['text'], c['at'], c['enter'])
        enters.append(c['enter'])
taps = list(Q['keys'])
print(len(keys), 'keystrokes')

# ------------------------------------------------------------- sounds


def load(path):
    out = os.path.join(TMP, re.sub(r'[^\w.]', '_', os.path.basename(path)) + '.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '2', '-ar', str(SR), '-sample_fmt', 's16', out], check=True)
    w = wave.open(out)
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768


def place(buf, sig, t, gain=1.0, pan=0.0):
    i0 = int(t * SR)
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: max(0, N - i0)]
    g = np.array([gain * (1 - max(0, pan)), gain * (1 + min(0, pan))])
    buf[i0:i0 + len(sig)] += sig * g


rms = lambda x: float(np.sqrt((x ** 2).mean() + 1e-12))
voice = np.zeros((N, 2), np.float32)
fx = np.zeros((N, 2), np.float32)
for ci, ch in enumerate(CH):
    vo = load(os.path.join(ROOT, f'public/gpt1010/vo/s{ci}.mp3'))
    place(voice, vo, ch['vo'])
v_rms = rms(voice[np.abs(voice).max(1) > 0.02])

whoosh = load(os.path.join(ROOT, 'public/sfx/whoosh7.mp3'))
w_body = rms(whoosh[np.abs(whoosh).max(1) > 0.02])
transitions = [s['start'] for k, s in enumerate(SC) if k > 0 and s['tr'] != 'cut']
for k, t0 in enumerate(transitions):
    first = SC[k + 1]['ch'] != SC[k]['ch']
    gain = v_rms / w_body * (10 ** ((-12 if first else -16) / 20))
    place(fx, whoosh, t0 - 0.12, gain, pan=0.25 if k % 2 else -0.25)
# Typing: the user's own laptop-keyboard recording (public/cc1003/sfx/typing-laptop.wav, 3 Oct 2026),
# replacing the synthesized clicks. One burst per typed command: starts with the first key, stops
# after the last, loops with a crossfade when a command takes longer than the 4 s clip.
typing = load(os.path.join(ROOT, 'public/cc1003/sfx/typing-laptop.wav'))
typ_level = v_rms * 10 ** (-17 / 20) / rms(typing)
XF = int(0.25 * SR)


def burst(dur, off):
    n = int(dur * SR)
    out = np.zeros((n, 2), np.float32)
    pos, o = 0, int(off * SR) % len(typing)
    while pos < n:
        seg = np.roll(typing, -o, axis=0)
        take = min(len(seg), n - pos)
        piece = seg[:take].copy()
        if pos > 0:  # crossfade into the previous loop
            m = min(XF, take)
            piece[:m] *= np.linspace(0, 1, m)[:, None]
            out[pos:pos + m] *= np.linspace(1, 0, m)[:, None]
        out[pos:pos + take] += piece
        pos += take - XF if take == len(seg) else take
        o = (o + int(rnd(str(pos)) * len(typing))) % len(typing)
    fi, fo = int(0.03 * SR), int(0.15 * SR)
    out[:fi] *= np.linspace(0, 1, fi)[:, None]
    out[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return out


ks = sorted(keys)
runs, cur = [], [ks[0]]
for t0 in ks[1:]:
    if t0 - cur[-1] > 0.5:
        runs.append(cur)
        cur = []
    cur.append(t0)
runs.append(cur)
for i, r in enumerate(runs):
    d = r[-1] - r[0] + 0.12
    if d < 0.25:
        continue
    place(fx, burst(d, rnd('o' + str(i)) * 4), r[0] - 0.02, typ_level, pan=0)
print(len(runs), 'typing bursts')



def one_shot(name, max_s=0.6):
    """A single recorded hit, trimmed to where the sound starts, with its body level."""
    x = load(os.path.join(ROOT, 'public/cc1003/sfx', name))
    env = np.abs(x).max(1)
    on = int(np.argmax(env > 0.05 * env.max()))
    x = x[max(0, on - int(0.005 * SR)):][: int(max_s * SR)]
    return x, rms(x[np.abs(x).max(1) > 0.02 * np.abs(x).max()])


# The user's own recordings (3 Oct 2026): mouse click at the cursor clicks, Enter key when a command is submitted.
click, c_rms = one_shot('mouse-click.wav')
for t0 in clicks:
    place(fx, click, t0, v_rms * 10 ** (-15 / 20) / c_rms)
enter_key, e_rms = one_shot('enter-key.wav')
for t0 in enters:
    place(fx, enter_key, t0, v_rms * 10 ** (-13 / 20) / e_rms)
for t0 in taps:  # Tab: the same real key recording, a touch softer
    place(fx, enter_key, t0, v_rms * 10 ** (-15 / 20) / e_rms)
print(len(clicks), 'mouse clicks,', len(enters), 'enter keys')

mix = voice + fx
pre = os.path.join(TMP, 'pre.wav')
w = wave.open(pre, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix / max(1.0, np.abs(mix).max()), -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
# loudnorm 2-pass
meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', pre, '-af', af, '-ar', '48000', os.path.join(OUT, 'mix.wav')], check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(OUT, 'mix.wav'), '-c:a', 'aac', '-b:a', '256k', os.path.join(OUT, 'soundtrack.m4a')], check=True)
fin = subprocess.run(['ffmpeg', '-hide_banner', '-i', os.path.join(OUT, 'mix.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('\n'.join(l for l in fin.splitlines()[-12:] if l.strip()))
