"""Parse shots.txt into beats.json (every beat with its time on the film) and assets.json (what to fetch)."""
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from tts import tts_text
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
T = json.load(open(os.path.join(D, 'timing.json')))
L = {(l['ch'], l['i']): l for l in T['lines']}
beats, assets, errs = [], {}, []
cur = None
for n, raw in enumerate(open(os.path.join(D, 'shots.txt')), 1):
    s = raw.rstrip('\n')
    if not s.strip() or s.lstrip().startswith('#'): continue
    if s.startswith('+'):
        _, aid, kind, q = s.split(None, 3)
        assets[aid] = {'id': aid, 'type': kind, 'q': q.strip()}
        continue
    if s.startswith('='):
        m = re.match(r'=\s*(\d+)\.(\d+)\s*(clear)?', s)
        cur = (int(m.group(1)), int(m.group(2)))
        if m.group(3): beats.append({'ch': cur[0], 'line': cur[1], 't': L[cur]['start'] - 0.35, 'kind': 'clear'})
        continue
    cue, rest = [x.strip() for x in s.split('>', 1)]
    parts = [x.strip() for x in rest.split(';')]
    kind, _, ref = parts[0].partition(' ')
    opts = dict(p.split('=', 1) for p in parts[1:] if '=' in p)
    line = L[cur]
    if cue == '^':
        t = line['start']
    else:
        word, _, occ = cue.partition('#')
        occ = int(occ or 1)
        ALIAS = {'dalles': 'dals', 'loudoun': 'loudon', 'gpu': 'g', 'h100': 'h', 'xai': 'x', 'tsmc': 't', 'pjm': 'p', 'led': 'l',
                 '35': 'thirtyfive', '270': 'seventy', '4.4': 'four', '3': 'three'}
        tok = ALIAS.get(word.lower()) or [norm(w) for w in tts_text(word).split() if norm(w)][0]
        hits = [w for w in line['words'] if w[0] == tok] or [w for w in line['words'] if w[0].startswith(tok)] or [w for w in line['words'] if tok in w[0]]
        if len(hits) < occ:
            errs.append(f'{n}: {cur} cue "{cue}" not in: {" ".join(w[0] for w in line["words"])}'); t = line['start']
        else: t = hits[occ - 1][1]
    b = {'ch': cur[0], 'line': cur[1], 't': round(t, 3), 'kind': kind, **opts}
    if kind in ('p', 'c', 'h', 'l'):
        aid, eq, q = ref.partition('=')
        aid = aid.strip()
        if eq:
            if aid in assets and assets[aid]['q'] != q.strip(): errs.append(f'{n}: asset {aid} redefined')
            assets[aid] = {'id': aid, 'type': kind, 'q': q.strip()}
        elif aid not in assets: errs.append(f'{n}: asset {aid} used before definition')
        b['ref'] = aid
    else:
        b['ref'] = ref.strip()
    beats.append(b)
beats.sort(key=lambda b: (b['t'], b['kind'] != 'clear'))
json.dump(beats, open(os.path.join(D, 'beats.json'), 'w'), indent=0, ensure_ascii=False)
json.dump(list(assets.values()), open(os.path.join(D, 'assets.json'), 'w'), indent=1, ensure_ascii=False)
print(len(beats), 'beats;', len(assets), 'assets;', sum(1 for a in assets.values() if a['type']=='p'), 'photos', sum(1 for a in assets.values() if a['type']=='c'), 'cutouts')
for e in errs: print('ERR', e)
