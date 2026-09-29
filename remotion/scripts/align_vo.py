"""Word timings for VO clips: Whisper timestamps mapped onto the exact script words.

Usage: python3 scripts/align_vo.py <script.json> <vo_dir> <out.json>
script.json is {section_id: text}; each section's audio is <vo_dir>/<section_id>.mp3.
Output: {section_id: {"duration": s, "words": [{"t": word, "s": start, "e": end}]}}.
Script words Whisper missed get times interpolated between their matched neighbours.
"""
import difflib, json, os, re, sys
from faster_whisper import WhisperModel

script_path, vo_dir, out_path = sys.argv[1:4]
script = json.load(open(script_path))
model = WhisperModel('base.en', device='cpu', compute_type='int8')
norm = lambda w: re.sub(r"[^a-z0-9]", '', w.lower())


result = {}
for sid, text in script.items():
    path = f'{vo_dir}/{sid}.mp3'
    if not os.path.exists(path):
        print(f'skip {sid}: no audio'); continue
    segs, info = model.transcribe(path, word_timestamps=True, language='en', beam_size=5)
    dur = info.duration
    heard = [w for s in segs for w in s.words]
    words = text.split()
    a = [norm(w) for w in words]
    b = [norm(w.word) for w in heard]
    times = [None] * len(words)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            h = heard[blk.b + k]
            times[blk.a + k] = (h.start, h.end)
    # Interpolate unmatched words between known neighbours.
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(words)):
        if times[i]:
            continue
        prev = max([k for k in known if k < i], default=None)
        nxt = min([k for k in known if k > i], default=None)
        s0 = times[prev][1] if prev is not None else 0.0
        s1 = times[nxt][0] if nxt is not None else dur
        lo = prev if prev is not None else -1
        hi = nxt if nxt is not None else len(words)
        span = (s1 - s0) / (hi - lo - 1 or 1)
        st = s0 + span * (i - lo - 1)
        times[i] = (st, st + span)
    matched = len(known) / max(1, len(words))
    result[sid] = {'duration': round(dur, 3), 'words': [{'t': w, 's': round(s, 3), 'e': round(e, 3)} for w, (s, e) in zip(words, times)]}
    print(f'{sid}: {dur:.2f}s, {len(words)} words, {matched:.0%} matched')

json.dump(result, open(out_path, 'w'), indent=0)
