"""Build src/hcai/timing.json: the time of every spoken line and word on the final timeline.

One ElevenLabs take per chapter (out/hcai/vo/ch<N>.mp3). Words come from faster-whisper
(base.en), matched to the script with difflib; missed words are interpolated.
Layout per chapter: [card CARD s][VO, with extra silences PAUSE inserted before some lines][TAIL].
The cold open has no card before it; its title sting sits in its tail.
Also writes out/hcai/vo_segments.json: where each slice of each take goes, for the mixer.
"""
import json, os, re, sys, subprocess, difflib
ROOT = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, os.path.join(ROOT, 'src/hcai'))
from tts import tts_text  # noqa: E402

FPS = 24
CARD, LEAD = 3.2, 0.25
TAIL = {0: 5.0, 8: 6.0}
PAUSE = {(0, 3): 0.7, (0, 5): 0.6, (0, 23): 0.4, (2, 14): 1.4, (3, 30): 0.9, (4, 13): 1.0, (6, 9): 1.1, (7, 11): 0.9,
         (8, 8): 1.4, (8, 29): 2.0, (8, 31): 3.4}
chapters = json.load(open(os.path.join(ROOT, 'src/hcai/lines.json')))
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
_m = None
def words(path):
    global _m
    cache = path + '.words.json'
    if os.path.exists(cache): return json.load(open(cache))
    from faster_whisper import WhisperModel
    if _m is None: _m = WhisperModel('base.en', device='cpu', compute_type='int8')
    import numpy as np
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = _m.transcribe(audio, word_timestamps=True)
    r = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
    json.dump(r, open(cache, 'w'))
    return r

def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

out = {'fps': FPS, 'chapters': [], 'lines': []}
segs = []
t = 0.0
for ci, ch in enumerate(chapters):
    vo = os.path.join(ROOT, f'out/hcai/vo/ch{ci}.mp3')
    rec = words(vo)
    D = dur(vo)
    toks, owner, disp = [], [], []
    for k, l in enumerate(ch['lines']):
        for w in tts_text(l['say']).split():
            if norm(w): toks.append(norm(w)); owner.append(k)
    sm = difflib.SequenceMatcher(a=toks, b=[r[0] for r in rec], autojunk=False)
    tof = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n): tof[a + j] = (rec[b + j][1], rec[b + j][2])
    # interpolate missing words
    idx_known = sorted(tof)
    T0 = [None] * len(toks); T1 = [None] * len(toks)
    for i in range(len(toks)):
        if i in tof: T0[i], T1[i] = tof[i]
    for i in range(len(toks)):
        if T0[i] is None:
            p = max([j for j in idx_known if j < i], default=None); n = min([j for j in idx_known if j > i], default=None)
            a = T1[p] if p is not None else 0.0; b = T0[n] if n is not None else D
            ip = p if p is not None else -1; inn = n if n is not None else len(toks)
            u = (i - ip) / (inn - ip); T0[i] = a + u * (b - a); T1[i] = T0[i] + 0.05
    nl = len(ch['lines'])
    ls = [min(T0[i] for i in range(len(toks)) if owner[i] == k) for k in range(nl)]
    le = [max(T1[i] for i in range(len(toks)) if owner[i] == k) for k in range(nl)]
    # cut points for inserted pauses (midway through the silence before the line)
    cuts = sorted(k for (c, k) in PAUSE if c == ci)
    start = t + (1.4 if ci == 0 else CARD)
    vo_at = start + LEAD
    def shift(x):
        return sum(PAUSE[(ci, k)] for k in cuts if x >= (le[k - 1] + ls[k]) / 2)
    bounds = [0.0] + [(le[k - 1] + ls[k]) / 2 for k in cuts] + [D]
    acc = 0.0
    for s in range(len(bounds) - 1):
        if s > 0: acc += PAUSE[(ci, cuts[s - 1])]
        segs.append({'file': f'ch{ci}.mp3', 'src': round(bounds[s], 3), 'len': round(bounds[s + 1] - bounds[s], 3), 'at': round(vo_at + bounds[s] + acc, 3)})
    for k, l in enumerate(ch['lines']):
        ws = [[w, round(vo_at + T0[i] + shift(T0[i]), 3)] for i, w in enumerate(toks) if owner[i] == k]
        out['lines'].append({'ch': ci, 'i': k, 'start': round(vo_at + ls[k] + shift(ls[k]), 3), 'end': round(vo_at + le[k] + shift(le[k]), 3), 'words': ws})
    total_pause = sum(PAUSE[(ci, k)] for k in cuts)
    end = vo_at + D + total_pause + TAIL.get(ci, 0.9)
    out['chapters'].append({'title': ch['title'], 'key': ch['key'], 'start': round(t, 3), 'card': 0.0 if ci == 0 else CARD, 'vo': round(vo_at, 3), 'end': round(end, 3)})
    miss = len(toks) - len(tof)
    print(f'{ch["key"]:<10} {D:6.1f}s  words {len(toks)} missed {miss}')
    t = end
out['duration'] = round(t, 3)
json.dump(out, open(os.path.join(ROOT, 'src/hcai/timing.json'), 'w'))
json.dump(segs, open(os.path.join(ROOT, 'out/hcai/vo_segments.json'), 'w'), indent=1)
print(f'total {int(t // 60)}:{t % 60:04.1f}  frames {round(t * FPS)}')
