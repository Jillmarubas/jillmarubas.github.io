"""Pick the pictures for the film-strip edition of "The Hidden Cost of AI" → src/hcai/strip.json.

One picture per idea instead of one per phrase: walk the script line by line, take the strongest visual on the line
(a chart or map, then a photo, a person, an object, a logo) and start a new frame only when the current one has been
up for MIN_HOLD seconds, or a little sooner at a topic change. Words on screen are dropped; place tags and key numbers
are printed on the film's edge under their frame. A chart that keeps updating stays in its frame; when it comes back
after other frames it gets a new frame that already shows what it showed before.

    python3 scripts/hcai_strip.py      (then the film and scripts/mix_hcai.py read strip.json)
"""
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
B = json.load(open(os.path.join(ROOT, 'src/hcai/beats.json')))
T = json.load(open(os.path.join(ROOT, 'src/hcai/timing.json')))
A = json.load(open(os.path.join(ROOT, 'src/hcai/assets.gen.json')))
FPS = 24
MIN_HOLD = 6.0  # seconds a frame stays before the next idea may replace it
TOPIC_HOLD = 3.0  # sooner at a topic change ("clear" in shots.txt), or when a chart arrives
LEAD = 0.22  # the strip settles a little before the word
CAPTION_AHEAD = 3.0  # a tag spoken just before a new frame belongs to that frame
PRI = {'p': 1, 'h': 2, 'c': 3, 'l': 4}  # boards are 0
fr = lambda s: round(s * FPS)
OPT_SKIP = {'ch', 'line', 't', 'kind', 'ref'}
opts = lambda b: {k: str(v) for k, v in b.items() if k not in OPT_SKIP}

frames, nights, captions = [], [], []
for ci, ch in enumerate(T['chapters']):
    beats = [b for b in B if b['ch'] == ci]
    cur = None  # current frame (dict) in this chapter
    night = None
    cluster = 0
    new_topic = True
    history = {}  # (cluster, board) -> [(t, opts)]: every update so far, shown or not
    for li in sorted(set(b['line'] for b in beats)):
        cands = []
        for b in [b for b in beats if b['line'] == li]:
            k = b['kind']
            if k == 'clear':
                cluster += 1
                new_topic = True
                if night:
                    night['end'] = b['t']
                    night = None
                continue
            if k in ('s', 't'):
                continue
            if k in ('k', 'n'):
                captions.append({'ch': ci, 't': b['t'], 'text': str(b['ref'])})
                continue
            if k.startswith('x:'):
                name = k[2:]
                o = opts(b)
                if name == 'chat' and night:
                    night['ups'].append({'at': fr(b['t'] - night['start']), 'o': o})
                    continue
                if name == 'chat' and o.get('mode') != 'mini' and not (cur and cur['kind'] == 'board' and cur['ref'] == 'chat'):
                    night = {'ch': ci, 'start': b['t'] - 0.15, 'end': ch['end'], 'ups': [{'at': fr(0.15), 'o': o}]}
                    nights.append(night)
                    continue
                key = (cluster, name)
                if cur and cur['kind'] == 'board' and cur['ref'] == name and cur['cluster'] == cluster:
                    cur['board']['ups'].append({'at': fr(b['t'] - cur['at']), 'o': o})  # updates in place
                    history.setdefault(key, []).append((b['t'], o))
                    continue
                cands.append((0, b, key, o))
                continue
            if k in PRI and not night:
                cands.append((PRI[k], b, None, None))
        if not cands:
            continue
        for c in cands:  # every chart update counts, shown or not
            if c[2]:
                history.setdefault(c[2], []).append((c[1]['t'], c[3]))
        # scan the line in time order; a long line can give more than one frame. Of the visuals that are allowed
        # at a moment, the strongest within the next two seconds wins.
        cands.sort(key=lambda c: c[1]['t'])
        i = 0
        while i < len(cands):
            c0 = cands[i]
            if c0[0] == 0 and cur and cur['kind'] == 'board' and cur['ref'] == c0[1]['kind'][2:] and cur['cluster'] == cluster:
                cur['board']['ups'].append({'at': fr(c0[1]['t'] - cur['at']), 'o': c0[3]})  # the chart just framed updates in place
                i += 1
                continue
            ok = lambda c: cur is None or (c[1]['t'] - LEAD - cur['at']) >= (TOPIC_HOLD if (new_topic or c[0] == 0) else MIN_HOLD)
            if not ok(cands[i]):
                i += 1
                continue
            window = [c for c in cands[i:] if c[1]['t'] - cands[i][1]['t'] <= 2.0 and ok(c)]
            pri, b, key, o = min(window, key=lambda c: (c[0], c[1]['t']))
            at = b['t'] - LEAD
            if pri == 0:
                name = b['kind'][2:]
                before = [{'at': -200, 'o': oo} for t, oo in history.get(key, []) if t < b['t']]
                f = {'ch': ci, 'at': b['t'] - 0.15, 'kind': 'board', 'ref': name, 'cluster': cluster,
                     'board': {'name': name, 'ups': before + [{'at': fr(0.15), 'o': o}]}}
            else:
                kind = 'p' if b['kind'] == 'c' and A.get(str(b['ref']), {}).get('type') == 'p' else b['kind']
                f = {'ch': ci, 'at': at, 'kind': kind, 'ref': str(b['ref']), 'cluster': cluster}
            frames.append(f)
            cur = f
            new_topic = False
            i = cands.index((pri, b, key, o)) + 1
    if night:
        night['end'] = ch['end']

# a chart's time on screen (the counter counts up over it), and frame numbers like real film
for i, f in enumerate(frames):
    nxt = frames[i + 1]['at'] if i + 1 < len(frames) and frames[i + 1]['ch'] == f['ch'] else T['chapters'][f['ch']]['end']
    f['hold'] = round(nxt - f['at'], 3)
    if f['kind'] == 'board':
        f['board']['dur'] = fr(nxt - f['at'])
    f['n'] = i + 1
    f['captions'] = []
# captions go under the frame that is up when they're said (or the one arriving just after)
for c in captions:
    fs = [f for f in frames if f['ch'] == c['ch']]
    tgt = None
    for f in fs:
        if f['at'] <= c['t'] + CAPTION_AHEAD:
            tgt = f
    if tgt is not None and len(tgt['captions']) < 2:
        tgt['captions'].append({'at': max(tgt['at'], c['t']), 'text': c['text']})
for f in frames:
    f.pop('cluster', None)
json.dump({'frames': frames, 'nights': nights}, open(os.path.join(ROOT, 'src/hcai/strip.json'), 'w'), indent=0, ensure_ascii=False)
holds = [f['hold'] for f in frames]
print(f"{len(frames)} frames, {len(nights)} night screens; hold avg {sum(holds) / len(holds):.1f}s, min {min(holds):.1f}s, max {max(holds):.1f}s")
for ci in range(len(T['chapters'])):
    print(f"  ch{ci}: {sum(1 for f in frames if f['ch'] == ci)} frames")
