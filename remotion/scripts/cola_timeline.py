"""Single source of truth for ColaOrigin timing: writes src/cola/timeline.json.

Every animated event (id, start frame, duration) is defined here once. The React
choreography reads the same file, and scripts/mix_cola_audio.py places each sound
effect from it, so picture and sound can never drift apart.

Sound placement: 'hit' puts the recording's strike (its measured onset) on the frame the
object lands; 'swish' centres a whoosh on the middle of the move.
"""
import json, os

FPS = 30
CUTS = [0, 180, 390, 600, 780, 1050, 1260, 1470, 1650, 1800]
WHIP = 8  # half-length of the whip pan at each cut, in frames

# measured strike/peak times inside each recording (seconds), see mix_cola_audio.py --onsets
ONSET = {'bottle_table': 1.48, 'coin_cup': 0.07, 'cork': 0.25, 'page_turn': 0.05, 'whoosh7': 0.26, 'whoosh8': 0.22,
         'type_key': 0.17, 'type_bell': 0.09, 'coins': 0.15, 'coin_spin': 0.05, 'soda_pour': 0.05, 'typewriter': 0.93, 'whoosh1': 0.11}

# (id, scene, local start, duration, [sound specs])
# sound spec: ('swish'|'hit'|'at', file, gain, extra) ; 'hit' lands on start+duration, 'swish' on the midpoint
E = [
    ('s0.glass', 0, 6, 16, [('swish', 'whoosh7', 0.7), ('hit', 'bottle_table', 0.9)]),
    ('s0.leaf', 0, 26, 18, [('swish', 'whoosh8', 0.35)]),
    ('s0.kola', 0, 38, 16, [('swish', 'whoosh7', 0.45)]),
    ('s0.pour', 0, 62, 80, [('at', 'soda_pour', 0.7, {'len': 4.2})]),
    ('s1.card', 1, 10, 16, [('swish', 'whoosh8', 0.5), ('hit', 'page_turn', 0.9, {'len': 0.55})]),
    ('s1.watch', 1, 26, 16, [('swish', 'whoosh7', 0.5), ('hit', 'coin_cup', 0.8)]),
    ('s1.specs', 1, 40, 16, [('swish', 'whoosh8', 0.45)]),
    ('s2.bottle', 2, 10, 18, [('swish', 'whoosh7', 0.7), ('hit', 'bottle_table', 0.9)]),
    ('s2.leaf0', 2, 30, 18, [('swish', 'whoosh8', 0.3)]),
    ('s2.leaf1', 2, 38, 18, []),
    ('s2.leaf2', 2, 46, 18, [('swish', 'whoosh8', 0.25)]),
    ('s2.kola0', 2, 56, 16, [('swish', 'whoosh7', 0.35)]),
    ('s2.kola1', 2, 62, 16, []),
    ('s3.stamp', 3, 22, 12, [('swish', 'whoosh7', 0.6), ('hit', 'bottle_table', 1.0, {'from': 0.03, 'len': 0.45})]),
    ('s3.knock', 3, 66, 10, [('swish', 'whoosh8', 0.8)]),
    ('s3.jug', 3, 80, 14, [('hit', 'cork', 1.0)]),
    ('s4.glass', 4, 10, 16, [('swish', 'whoosh7', 0.7), ('hit', 'bottle_table', 0.9)]),
    ('s4.pour', 4, 36, 80, [('at', 'soda_pour', 0.7, {'len': 4.2})]),
    ('s4.coin', 4, 150, 22, [('swish', 'whoosh8', 0.6), ('hit', 'coin_spin', 1.0, {'len': 4.2})]),
    ('s5.leaf', 5, 10, 18, [('swish', 'whoosh7', 0.6)]),
    ('s5.kola', 5, 18, 18, [('swish', 'whoosh8', 0.6)]),
    ('s5.write', 5, 20, 60, [('at', 'typewriter', 0.7, {'from': 0.9, 'len': 1.8})]),
    ('s5.strike', 5, 100, 12, [('at', 'type_key', 1.0)]),
    ('s6.card', 6, 10, 16, [('swish', 'whoosh8', 0.5), ('hit', 'page_turn', 0.9, {'len': 0.55})]),
    ('s6.coins', 6, 50, 60, [('at', 'coins', 0.9, {'len': 2.6})]),
    ('s7.b0', 7, 10, 16, [('swish', 'whoosh7', 0.4), ('hit', 'bottle_table', 0.8)]),
    ('s7.b1', 7, 18, 16, [('hit', 'bottle_table', 0.75, {'from': 5.55, 'len': 0.5})]),
    ('s7.b2', 7, 26, 16, [('hit', 'bottle_table', 0.7, {'from': 8.21, 'len': 0.5})]),
    ('s7.pop', 7, 84, 10, [('at', 'cork', 1.0)]),
    ('s8.earth', 8, 6, 18, [('at', 'whoosh1', 0.8, {'len': 1.6})]),
    ('s8.bell', 8, 104, 10, [('at', 'type_bell', 0.8)]),
]

events, cues = {}, []
for eid, sc, start, dur, sounds in E:
    f0 = CUTS[sc] + start
    events[eid] = {'f': f0, 'd': dur}
    for kind, file, gain, *extra in sounds:
        x = extra[0] if extra else {}
        frm = x.get('from', max(0.0, ONSET[file] - 0.02) if kind == 'hit' else 0.0)
        if kind == 'hit':
            at = f0 + dur - 0.02 * FPS  # playback starts 20 ms before the strike, so it lands on the landing frame
        elif kind == 'swish':
            at = f0 + dur / 2 - ONSET[file] * FPS
        else:
            at = f0
        cues.append({'id': eid, 'file': file, 'at': round(at, 2), 'gain': gain, 'from': round(frm, 3), 'len': x.get('len', 1.2)})
# a whoosh centred on every whip pan
for i, c in enumerate(CUTS[1:-1]):
    f = 'whoosh8' if i % 2 else 'whoosh7'
    cues.append({'id': f'whip{i+1}', 'file': f, 'at': round(c - ONSET[f] * FPS, 2), 'gain': 0.8, 'from': 0.0, 'len': 1.0})

out = {'fps': FPS, 'cuts': CUTS, 'whip': WHIP, 'events': events, 'cues': sorted(cues, key=lambda c: c['at'])}
path = os.path.join(os.path.dirname(__file__), '..', 'src', 'cola', 'timeline.json')
json.dump(out, open(path, 'w'), indent=1)
print(f'{len(events)} events, {len(out["cues"])} sound cues -> {os.path.relpath(path)}')
