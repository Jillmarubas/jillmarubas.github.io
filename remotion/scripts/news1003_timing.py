"""Build src/news1003/timing.json: when every script line starts, in seconds, on the final timeline.

Each chapter's voiceover (public/news1003/vo/s<N>.mp3, one ElevenLabs take per chapter) is
aligned to the script by its pauses: a line boundary is placed on the pause nearest to where
the line's share of the chapter's characters says it should fall. Chapters whose
voiceover does not exist yet get estimated times (the measured pace of the takes we have), so
the picture can be built before the audio arrives and re-timed in one run when it does.

Layout: [chapter card CARD s] [voiceover] [TAIL s] for every chapter; the cold open has no card
before it (its title card sits on its last line) and the ending has no card.
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS = 24
CARD, TAIL, LEAD = 2.6, 0.8, 0.3
CHARS_PER_S = 11.2  # measured on the takes we have (ch0: 10.7, ch1: 11.6)
PAUSE_EST = 0.45     # estimated breath between lines when there is no take yet
TMP = '/tmp/news1003_vo'
os.makedirs(TMP, exist_ok=True)

chapters = json.load(open(os.path.join(ROOT, 'src/news1003/lines.json')))


import sys
sys.path.insert(0, os.path.join(ROOT, 'src/news1003'))
from tts import tts_text  # noqa: E402


def norm(w):
    return re.sub(r'[^a-z0-9]', '', w.lower().replace('neighbourhood', 'neighborhood').replace('centre', 'center').replace('fibre', 'fiber').replace('vapour', 'vapor').replace('labour', 'labor').replace('neighbour', 'neighbor'))


_model = None


def words(path):
    """Word-level timestamps from a local speech recogniser (faster-whisper, base.en)."""
    global _model
    from faster_whisper import WhisperModel
    if _model is None:
        _model = WhisperModel('base.en', device='cpu', compute_type='int8')
    segs, _ = _model.transcribe(path, word_timestamps=True)
    return [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]


def align(spoken, rec):
    """Start/end time of every spoken line, by matching script words to recognised words."""
    import difflib
    toks, owner = [], []
    for k, l in enumerate(spoken):
        for w in tts_text(l['say']).split():
            if norm(w):
                toks.append(norm(w))
                owner.append(k)
    sm = difflib.SequenceMatcher(a=toks, b=[r[0] for r in rec], autojunk=False)
    t_of = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n):
            t_of[a + j] = (rec[b + j][1], rec[b + j][2])
    starts, ends = [], []
    global WORDS
    WORDS = []
    for k in range(len(spoken)):
        WORDS.append([(toks[i], t_of[i][0] if i in t_of else None) for i, o in enumerate(owner) if o == k])
        idx = [i for i, o in enumerate(owner) if o == k]
        hit = [t_of[i] for i in idx if i in t_of]
        starts.append(hit[0][0] if hit else None)
        ends.append(hit[-1][1] if hit else None)
    # fill any line the recogniser missed by interpolating between neighbours
    for arr in (starts, ends):
        for k in range(len(arr)):
            if arr[k] is None:
                prev = next((arr[j] for j in range(k - 1, -1, -1) if arr[j] is not None), 0.0)
                arr[k] = prev
    for k, wl in enumerate(WORDS):
        known = [(j, t) for j, (_, t) in enumerate(wl) if t is not None]
        a0, a1 = (starts[k], ends[k])
        for j, (tok, t) in enumerate(wl):
            if t is not None:
                continue
            prev = next(((jj, tt) for jj, tt in reversed(known) if jj < j), (-1, a0))
            nxt = next(((jj, tt) for jj, tt in known if jj > j), (len(wl), a1))
            u = (j - prev[0]) / max(1, nxt[0] - prev[0])
            wl[j] = (tok, prev[1] + u * (nxt[1] - prev[1]))
    return starts, ends


def pauses(path):
    wav = os.path.join(TMP, os.path.basename(path) + '.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '1', '-ar', '16000', wav], check=True, cwd=ROOT)
    w = wave.open(wav)
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    fr = 160
    e = np.sqrt(np.add.reduceat(x[: len(x) // fr * fr] ** 2, np.arange(0, len(x) // fr * fr, fr)) / fr)
    quiet = 20 * np.log10(e + 1e-9) < -45
    runs, s = [], None
    for k, q in enumerate(quiet):
        if q and s is None:
            s = k
        if not q and s is not None:
            if k - s >= 15:
                runs.append(((s + k) / 2 / 100, (k - s) / 100))
            s = None
    speech_start = next((k for k, q in enumerate(quiet) if not q), 0) / 100
    return len(x) / 16000, speech_start, runs


out = {'fps': FPS, 'chapters': [], 'lines': []}
t = 0.0
for ci, ch in enumerate(chapters):
    card = 0.0 if ch['key'] in ('hook', 'preview', 'outro') else CARD
    lines = ch['lines']
    spoken = [l for l in lines if l['say']]
    vo = os.path.join(ROOT, f'public/news1003/vo/s{ci}.mp3')
    start = t + card
    if os.path.exists(vo):
        dur, _, _ = pauses(vo)
        starts, ends = align(spoken, words(os.path.join(TMP, os.path.basename(vo) + '.wav')))
        wl = WORDS
        has_vo = True
    else:
        starts, ends, x = [], [], 0.0
        for l in spoken:
            d = len(l['say']) / CHARS_PER_S
            starts.append(x)
            ends.append(x + d)
            x += d + PAUSE_EST
        dur = x
        has_vo = False
        wl = [[] for _ in spoken]
    vo_at = start + LEAD
    k = 0
    for li, l in enumerate(lines):
        ws = []
        if l['say']:
            a, b = vo_at + starts[k], vo_at + ends[k]
            ws = [[w, round(vo_at + t, 3)] for w, t in wl[k]]
            k += 1
        else:  # a silent beat: sits on the pause before the next spoken line
            a = b = vo_at + (starts[k] if k < len(starts) else dur)
        out['lines'].append({'ch': ci, 'i': li, 'start': round(a, 3), 'end': round(b, 3), 'say': l['say'], 'show': l['show'], 'words': ws})
    end = vo_at + dur + TAIL + (1.2 if ci == 0 else 0) + (3.0 if ci == len(chapters) - 1 else 0)
    out['chapters'].append({'title': ch['title'], 'key': ch['key'], 'start': round(t, 3), 'card': card, 'vo': round(vo_at, 3), 'hasVo': has_vo, 'end': round(end, 3)})
    t = end

out['duration'] = round(t, 3)
json.dump(out, open(os.path.join(ROOT, 'src/news1003/timing.json'), 'w'), indent=1)
print(f'{len(out["lines"])} lines, total {int(t // 60)}:{t % 60:04.1f}')
for c in out['chapters']:
    print(f'  {c["start"]:7.1f}s  {c["title"]:<40} vo={"yes" if c["hasVo"] else "est"}')
