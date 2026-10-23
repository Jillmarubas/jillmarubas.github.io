# Paces the voiceover for an explainer (target 130-150 wpm) without speeding or slowing the voice:
# longer pauses between sentences, and a longer breath where the script starts a new visual beat.
# Writes edit/out/<chapter>.wav and edit/out/<chapter>.timing.json (word times on the new track,
# plus the start time of every beat). Usage: python3 edit/pace.py
import json, re, subprocess, numpy as np, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
VO, OUT = ROOT / 'vo', ROOT / 'edit' / 'out'
OUT.mkdir(exist_ok=True)
SR = 48000
SENTENCE_GAP = 0.38   # extra seconds after a sentence
BEAT_GAP = 0.85       # extra seconds where a new visual beat starts
LEAD_IN, TAIL = 0.6, 1.2

def load(f):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(f), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
blocks = json.load(open(VO / 'blocks.json'))
segs = json.load(open(VO / 'segments.json'))
block_keys = list(blocks)
names = sorted(segs)
# Words per script block, so beat starts can be found in the transcript (counted on the script text).
def beat_word_starts(name):
    i = {'00': 0, '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6, '07': 7, '08': 8}[name[:2]]
    bl = [b.replace('RP-1', 'R-P-one').replace('B1067', 'B-ten-sixty-seven') for b in blocks[block_keys[i]]]
    if name == '07a_math': bl = bl[:-1] if 'doesn' in bl[-1] else bl
    if name == '07b_record': bl = [b for b in bl if 'doesn' in b]
    out, n = [], 0
    for b in bl:
        out.append(n); n += len(b.split())
    return out, n

report = []
for name in names:
    a = load(VO / f'{name}.mp3')
    words = json.load(open(VO / f'{name}.words.json'))['words']
    starts, nscript = beat_word_starts(name)
    # Map script word index -> transcript word index by proportion (transcripts merge/split a few words).
    beat_idx = sorted({min(len(words) - 1, round(s * len(words) / max(1, nscript))) for s in starts} - {0})
    # Snap each beat to the nearest sentence start.
    sent_start = [i for i in range(1, len(words)) if re.search(r'[.?!]$', words[i - 1]['w'])]
    beat_idx = sorted({min(sent_start, key=lambda j: abs(j - b)) for b in beat_idx}) if sent_start else []
    cuts = []  # (sample position, extra seconds)
    for i in sent_start:
        gap0, gap1 = words[i - 1]['e'], words[i]['s']
        mid = (gap0 + gap1) / 2 if gap1 > gap0 else gap1 - 0.02
        cuts.append((int(mid * SR), BEAT_GAP if i in beat_idx else SENTENCE_GAP, i))
    pieces, last, shift, offs = [np.zeros(int(LEAD_IN * SR), np.float32)], 0, LEAD_IN, []
    for pos, extra, i in cuts:
        pieces.append(a[last:pos]); pieces.append(np.zeros(int(extra * SR), np.float32))
        offs.append((pos / SR, extra)); last = pos
    pieces.append(a[last:]); pieces.append(np.zeros(int(TAIL * SR), np.float32))
    track = np.concatenate(pieces)
    def remap(t):
        return t + LEAD_IN + sum(e for p, e in offs if p <= t)
    tw = [{'w': w['w'], 's': round(remap(w['s']), 3), 'e': round(remap(w['e']), 3)} for w in words]
    beats = [0.0] + [round(tw[i]['s'], 3) for i in beat_idx]
    dur = len(track) / SR
    (OUT / f'{name}.timing.json').write_text(json.dumps({'chapter': name, 'duration': round(dur, 3), 'beats': beats, 'words': tw}, indent=0))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', str(OUT / f'{name}.wav')], input=track.tobytes(), check=True)
    wpm = len(words) / (dur / 60)
    report.append((name, round(len(a) / SR, 1), round(dur, 1), round(wpm), len(beats)))
total = sum(r[2] for r in report)
for r in report: print(*r)
print('total', round(total, 1), 's =', round(total / 60, 2), 'min, overall wpm', round(sum(len(json.load(open(VO / f'{n}.words.json'))['words']) for n in names) / (total / 60)))
