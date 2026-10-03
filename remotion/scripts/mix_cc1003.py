"""Mix and master "Claude Code Just Got Mods" (AI News Daily, 3 Oct 2026): out/cc1003/mix.wav (+ soundtrack.m4a).

Voice + effects only (no music, the user's rule): the single short swoosh (public/sfx/whoosh7.mp3,
BigSoundBank CC0) once per scene change, plus soft synthesized laptop keystrokes under every
typed command and mouse clicks where the cursor clicks. Scene windows mirror Film.tsx; word
lookups mirror timing.ts useS().w(); keystroke times mirror keys.ts typeTimes().
Master: -14 LUFS integrated, -1 dBTP (ffmpeg loudnorm, 2 pass), 48 kHz stereo.
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
TR = 0.5
T = json.load(open(os.path.join(ROOT, 'src/cc1003/timing.json')))
DUR = T['duration']
N = int((DUR + 0.5) * SR)
OUT = os.path.join(ROOT, 'out/cc1003')
TMP = '/tmp/cc1003_mix'
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)
rng = np.random.default_rng(7)

# ------------------------------------------------------------- scene windows (mirror of Film.tsx)
src = open(os.path.join(ROOT, 'src/cc1003/scenes.ts')).read()
SC = []
for m in re.finditer(r"\{ch: (\d+), from: (\d+)(?:, to: (\d+))?, C: (\w+)(?:, tr: '(\w+)')?(?:, pre: ([\d.]+))?\}", src):
    SC.append({'ch': int(m[1]), 'from': int(m[2]), 'to': int(m[3]) if m[3] else 99, 'name': m[4], 'tr': m[5], 'pre': float(m[6]) if m[6] else 0.4})
CH = T['chapters']
LINES = T['lines']
line = lambda ch, i: next(l for l in LINES if l['ch'] == ch and l['i'] == i)
for k, s in enumerate(SC):
    first = k == 0 or SC[k - 1]['ch'] != s['ch']
    s['start'] = 0 if k == 0 else CH[s['ch']]['start'] if first else line(s['ch'], s['from'])['start'] - s['pre']
for k, s in enumerate(SC):
    s['end'] = SC[k + 1]['start'] + TR if k < len(SC) - 1 else DUR
print(len(SC), 'scenes')

norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())


def W(k, word, n=0):
    """Absolute time of the n-th `word` in scene k (scene lines first, then the chapter)."""
    s = SC[k]
    chl = [l for l in LINES if l['ch'] == s['ch']]
    pick = lambda ls: [t for l in ls for (x, t) in l['words'] if x == norm(word)]
    hits = pick([l for l in chl if s['from'] <= l['i'] < s['to']])
    if len(hits) <= n:
        hits = pick(chl)
    return hits[n]


L = lambda k, i: line(SC[k]['ch'], i)['start']
Le = lambda k, i: line(SC[k]['ch'], i)['end']
scene = lambda name: next(k for k, s in enumerate(SC) if s['name'] == name)


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

# ------------------------------------------------------------- typed commands (mirror of the scenes)
LYDIA = 'create a mod that draws my context window as a stacked bar above the prompt, one color per category like /context, toggled with /context-bar'
cmds = []  # (text, at, enter or None, scene end)
k = scene('HookLaptop'); cmds.append(('add a button that shows my token usage', W(k, 'describing'), None, SC[k]['end'] - TR))
k = scene('BuildMod')
launch = L(k, 3) - 0.55
cb2 = W(k, 'again') - 0.75
cmds += [('claude --version', W(k, 'make'), W(k, 'two') - 0.15, 0), ('claude', launch - 0.55, launch, 0), (LYDIA, W(k, 'asked'), W(k, 'work', 1) - 0.1, 0),
         ('/context-bar', W(k, 'type'), W(k, 'colored') - 0.15, 0), ('/context-bar', cb2, W(k, 'hide') - 0.05, 0)]
k = scene('SwitchModel'); cmds.append(('/model sonnet', W(k, 'type') - 0.1, W(k, 'sonnet', 1) + 0.35, 0))
k = scene('ClaimCredit'); cmds.append(('/claim-credit', W(k, 'type') - 0.05, W(k, 'credit') + 0.4, 0))
k = scene('AuditCmd'); cmds.append(('/checkup prompt-audit', W(k, 'type') - 0.05, W(k, 'audit', 1) + 0.35, 0))
k = scene('YskEnable'); cmds.append(('/plugin enable cc-plugin-you-should-know@builtin', W(k, 'command') - 0.6, L(k, 4) - 0.2, 0))
k = scene('EvalBuild'); cmds.append(('/claude-api build-eval how often does our support bot send a ticket to the right team?', W(k, 'ask') - 0.1, Le(k, 2) + 0.25, 0))
keys, enters, clicks = [], [], []
for text, at, en, end in cmds:
    if en is None:
        tt = [x for x in type_times(text, at, at + 99) if x < end]
    else:
        tt = type_times(text, at, en)
        enters.append(en)
    keys += tt
# EvalClimb types its card over 1.6 s from 0.15 (no Enter); Outro types a comment
k = scene('EvalClimb'); s0 = SC[k]['start']
c = '/claude-api hillclimb make each ticket cheaper to handle without getting more of them wrong'
keys += [s0 + 0.15 + 1.6 * i / len(c) for i in range(0, len(c), 2)]
k = scene('Outro')
msg = "What's the first mod you'll build?"
tc = W(k, 'comments')
keys += [tc + 0.2 + 1.3 * i / len(msg) for i in range(len(msg))]
clicks += [W(k, 'like') - 0.03, W(k, 'subscribe') - 0.03]
k = scene('SecondFreebie'); clicks.append(W(k, 'usage') - 0.08)
k = scene('EvalPipeline'); clicks.append(W(k, 'approve'))
print(len(keys), 'keystrokes,', len(enters), 'enters,', len(clicks), 'clicks')

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


def lowpass(x, a):
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def key_click(seed, strong=False):
    """A soft laptop key: a short damped noise tick plus a low thock."""
    r = np.random.default_rng(seed)
    n = int(0.045 * SR)
    t = np.arange(n) / SR
    tick = r.standard_normal(n) * np.exp(-t * (480 + r.uniform(-60, 60)))
    tick = tick - lowpass(tick, 0.08)  # high-pass: keep the click
    thock = np.sin(2 * np.pi * (170 + r.uniform(-25, 25)) * t) * np.exp(-t * 90) * 0.5
    s = tick * 0.6 + thock
    if strong:
        s = s * 1.5 + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 60) * 0.5
    s /= np.max(np.abs(s)) + 1e-9
    return np.stack([s, s], 1).astype(np.float32)


def mouse_click():
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for off, f in ((0, 2600), (0.028, 1900)):
        i = int(off * SR)
        tt = t[: n - i]
        s[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 700)
    s /= np.max(np.abs(s))
    return np.stack([s, s], 1).astype(np.float32)


rms = lambda x: float(np.sqrt((x ** 2).mean() + 1e-12))
voice = np.zeros((N, 2), np.float32)
fx = np.zeros((N, 2), np.float32)
for ci, ch in enumerate(CH):
    vo = load(os.path.join(ROOT, f'public/cc1003/vo/s{ci}.mp3'))
    place(voice, vo, ch['vo'])
v_rms = rms(voice[np.abs(voice).max(1) > 0.02])

whoosh = load(os.path.join(ROOT, 'public/sfx/whoosh7.mp3'))
w_body = rms(whoosh[np.abs(whoosh).max(1) > 0.02])
transitions = [s['start'] for k, s in enumerate(SC) if k > 0 and s['tr'] != 'cut']
for k, t0 in enumerate(transitions):
    first = SC[k + 1]['from'] == 0 and SC[k + 1]['ch'] != SC[k]['ch']
    gain = v_rms / w_body * (10 ** ((-12 if first else -16) / 20))
    place(fx, whoosh, t0 - 0.12, gain, pan=0.25 if k % 2 else -0.25)
kc_level = v_rms * 10 ** (-21 / 20)
for i, t0 in enumerate(sorted(keys)):
    s = key_click(i)
    place(fx, s, t0, kc_level / rms(s) * (0.8 + 0.4 * rnd(str(i))), pan=(rnd('p' + str(i)) - 0.5) * 0.3)
for i, t0 in enumerate(enters):
    s = key_click(1000 + i, strong=True)
    place(fx, s, t0, kc_level * 1.6 / rms(s))
mc = mouse_click()
for t0 in clicks:
    place(fx, mc, t0, v_rms * 10 ** (-18 / 20) / rms(mc))

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
