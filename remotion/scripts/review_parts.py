#!/usr/bin/env python3
"""Cuts a review film into phone-sized parts for the review room.

    python3 scripts/review_parts.py <film.mp4> <out_dir> [--timeline film.mp4.timeline.json] [--group card]

Each part is one chapter (a chapter card joins the chapter after it), encoded 960x540 H.264 at about
850 kbps with a keyframe every second, so each part stays under 120 s and 15 MB and the whole film under
the review page's 256 MB. Writes <out_dir>/parts/NN.mp4 and <out_dir>/manifest.json with, per part: its
film start, duration, file, the narration sentences (times inside the part) and the shot cuts.

The timeline JSON is the one edit/assemble.py writes: {"fps", "parts": [{"name", "start", "end", "words"}]}.
Optional per-part shot cuts come from a "cuts" list (film seconds) in each timeline part.
"""
import argparse, json, pathlib, re, subprocess

ap = argparse.ArgumentParser()
ap.add_argument('film')
ap.add_argument('out')
ap.add_argument('--timeline')
ap.add_argument('--group', default='card', help='parts whose name starts with this join the next part')
ap.add_argument('--kbps', type=int, default=850)
ap.add_argument('--max', type=float, default=120.0)
args = ap.parse_args()

tl = json.load(open(args.timeline or args.film + '.timeline.json'))
fps = tl.get('fps', 30)
out = pathlib.Path(args.out)
(out / 'parts').mkdir(parents=True, exist_ok=True)

# Group: a card joins the chapter that follows it.
groups, pending = [], []
for p in tl['parts']:
    pending.append(p)
    if not p['name'].startswith(args.group):
        groups.append(pending); pending = []
if pending:
    groups.append(pending)

def label(name):
    n = re.sub(r'^\d+[a-z]?_', '', name).replace('_', ' ')
    return n[:1].upper() + n[1:]

def sentences(words, t0):
    out, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.?!]$', w['w']):
            out.append({'s': round(cur[0]['s'] - t0, 3), 'e': round(cur[-1]['e'] - t0, 3), 'text': ' '.join(x['w'] for x in cur)}); cur = []
    if cur:
        out.append({'s': round(cur[0]['s'] - t0, 3), 'e': round(cur[-1]['e'] - t0, 3), 'text': ' '.join(x['w'] for x in cur)})
    return out

manifest = {'fps': fps, 'duration': tl['duration'], 'parts': []}
for i, g in enumerate(groups):
    start, end = g[0]['start'], g[-1]['end']
    # Split a long group into pieces of at most --max seconds, on whole frames.
    n = max(1, int((end - start) // args.max) + (1 if (end - start) % args.max > 0.01 else 0))
    for k in range(n):
        a = start + (end - start) * k / n
        b = start + (end - start) * (k + 1) / n
        a = round(a * fps) / fps; b = round(b * fps) / fps
        idx = len(manifest['parts']) + 1
        f = out / 'parts' / f'{idx:02d}.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{a:.4f}', '-i', args.film, '-t', f'{b - a:.4f}',
                        '-vf', 'scale=960:540:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{args.kbps}k',
                        '-maxrate', f'{int(args.kbps * 1.6)}k', '-bufsize', f'{args.kbps * 2}k', '-g', str(fps), '-keyint_min', str(fps),
                        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(f)], check=True)
        words = [w for p in g for w in p.get('words', []) if a <= w['s'] < b]
        cuts = sorted(round(c - a, 3) for p in g for c in [p['start']] + p.get('cuts', []) if a < c < b)
        name = ' + '.join(label(p['name']) for p in g if not p['name'].startswith(args.group)) or label(g[0]['name'])
        size = f.stat().st_size
        manifest['parts'].append({'n': idx, 'title': name + (f' ({k + 1}/{n})' if n > 1 else ''), 'file': f'parts/{idx:02d}.mp4',
                                  'start': round(a, 3), 'duration': round(b - a, 3), 'bytes': size,
                                  'sentences': sentences(words, a), 'cuts': cuts})
        print(f'part {idx:02d}  {a:7.2f}-{b:7.2f}s  {size / 1e6:5.1f} MB  {name}')
        assert size < 15e6, f'{f} is over 15 MB: lower --kbps'
json.dump(manifest, open(out / 'manifest.json', 'w'), indent=1)
print('total', round(sum(p['bytes'] for p in manifest['parts']) / 1e6, 1), 'MB ->', out / 'manifest.json')
