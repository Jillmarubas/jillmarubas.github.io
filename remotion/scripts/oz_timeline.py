#!/usr/bin/env python3
"""Oz ch1 timeline: places every narration line on the film clock (with pauses chosen for the picture)
and extracts a mouth-opening envelope for the dialogue lines. Writes src/oz/timeline.json."""
import json, subprocess, array, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 24000 / 1001
timing = json.load(open(f'{ROOT}/src/oz/ch1-vo-timing.json'))
INTRO = 4.0  # the storm is heard before the first word (sound leads picture)
# pause AFTER line n (seconds); default 0.7, 1.0 on a speaker change
GAP = {1: 1.0, 2: 2.6, 3: 1.6, 4: 1.0, 5: 1.0, 6: 1.0, 7: 0.9, 8: 1.4, 9: 1.2, 10: 1.2, 11: 1.4, 12: 1.0, 13: 0.5, 14: 0.6,
       15: 0.5, 16: 0.4, 17: 0.4, 18: 0.5, 19: 0.4, 20: 0.2, 21: 1.0, 22: 1.6, 23: 1.0, 24: 1.4, 25: 1.0, 26: 0.15, 27: 0.6,
       28: 1.2, 29: 0.9, 30: 1.0, 31: 1.4, 32: 3.0, 33: 1.2, 34: 3.0, 35: 0.8, 36: 1.8, 37: 1.6, 38: 1.2, 39: 0.9, 40: 0.8,
       41: 1.2, 42: 1.4, 43: 5.0}
DIALOGUE = {'D', 'E', 'H', 'M'}

def envelope(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    a = array.array('h', raw)
    hop = 16000 / FPS
    out = []
    i = 0.0
    while int(i + hop) <= len(a):
        seg = a[int(i):int(i + hop)]
        r = math.sqrt(sum(x * x for x in seg) / max(1, len(seg))) / 32768
        out.append(r)
        i += hop
    pk = max(out) or 1
    return [round(min(1.0, (v / pk) ** 0.7 * 1.1), 2) for v in out]

t = INTRO
lines = []
for e in timing:
    n = e['line']
    item = {'line': n, 'speaker': e['speaker'], 'start': round(t, 3), 'dur': e['dur'], 'file': e['file']}
    if e['speaker'] in DIALOGUE:
        item['mouth'] = envelope(f"{ROOT}/public/{e['file']}")
    lines.append(item)
    t += e['dur'] + GAP.get(n, 0.7)
total = t
json.dump({'fps': FPS, 'intro': INTRO, 'total': round(total, 3), 'frames': math.ceil(total * FPS), 'lines': lines}, open(f'{ROOT}/src/oz/timeline.json', 'w'))
print(f'total {total:.1f}s = {math.ceil(total * FPS)} frames')
for l in lines:
    print(f"{l['line']:2d} {l['speaker']} {l['start']:7.2f} +{l['dur']:.2f}")
