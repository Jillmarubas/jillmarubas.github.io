#!/usr/bin/env python3
"""Cut a finished film into small phone-friendly preview parts for the review page.

Each chapter is split into equal parts of at most MAX_PART seconds, encoded at 960x540 (2-pass x264, AAC) so every
file stays under the review page's 15 MB per-file limit. Each part's file name carries a hash of its contents, so a
re-encoded part never plays from a stale cache. Writes the parts plus manifest.json (chapters, parts, scenes, narration
lines) into the output folder; scripts/review_page.py then builds the page from it.

Usage: python3 scripts/review_parts.py <film.mp4> <outdir> [chapter numbers to (re)encode, default all; -1 = manifest only]
  e.g. python3 scripts/review_parts.py out/hcai/HiddenCostOfAI_2D_full_720p.mp4 out/review/hcai
       python3 scripts/review_parts.py out/hcai/HiddenCostOfAI_2D_full_720p.mp4 out/review/hcai 3 5
"""
import difflib, glob, hashlib, json, math, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

MAX_PART = 120.0          # seconds per part
# 850 kbps video keeps the whole film near 240 MB, under the page's 256 MB total
LIMIT_MB = 14.2           # target size per part (the page's per-file cap is 15 MB)
FPS = 24
ROOT = os.path.join(os.path.dirname(__file__), '..')

film, out = sys.argv[1], sys.argv[2]
only = {int(a) for a in sys.argv[3:]}
os.makedirs(os.path.join(out, 'v'), exist_ok=True)

timing = json.load(open(os.path.join(ROOT, 'src/hcai/timing.json')))
strip = json.load(open(os.path.join(ROOT, 'src/hcai/strip.json')))
fr = lambda t: round(t * FPS) / FPS
chapters, jobs = [], []
for ci, c in enumerate(timing['chapters']):
    a, b = fr(c['start']), fr(c['end'])
    n = max(1, math.ceil((b - a) / MAX_PART - 1e-6))
    cuts = [fr(a + (b - a) * k / n) for k in range(n)] + [b]
    parts = []
    for k in range(n):
        name = f'v/c{ci}p{k}'
        parts.append({'src': name, 'start': cuts[k], 'end': cuts[k + 1]})
        if not only or ci in only:
            jobs.append((name, cuts[k], cuts[k + 1]))
    chapters.append({'n': ci, 'title': c['title'].capitalize(), 'start': a, 'end': b, 'parts': parts})

# The timed words come from speech recognition (lower case, no punctuation). Align them with the script's spoken
# lines so the page shows the narration as written.
spoken = []
for raw in open(os.path.join(ROOT, 'src/hcai/SCRIPT.md')):
    raw = raw.strip()
    if re.match(r'#+ .*(FACT|SOURCE|NOTES)', raw, re.I):
        break
    if raw and not re.match(r'(\[|#|\*\*|-|\||>)', raw):
        spoken += raw.replace('*', '').split()
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
asr = [(norm(w[0]), li) for li, ln in enumerate(timing['lines']) for w in ln['words']]
match = {}
for blk in difflib.SequenceMatcher(None, [a for a, _ in asr], [norm(w) for w in spoken], autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        match[blk.a + k] = blk.b + k
span = {}
for i, (_, li) in enumerate(asr):
    if i in match:
        lo, hi = span.get(li, (match[i], match[i]))
        span[li] = (min(lo, match[i]), max(hi, match[i]))
lines = []
for li, ln in enumerate(timing['lines']):
    if li in span:
        text = ' '.join(spoken[span[li][0]:span[li][1] + 1])
    else:
        text = re.sub(r"\bi\b", "I", ' '.join(w[0] for w in ln['words']))
        text = text[:1].upper() + text[1:]
    lines.append({'t': round(ln['start'], 2), 'e': round(ln['end'], 2), 'text': text})

# each scene is named by the narration line it opens on: that is what the reviewer hears
starts = [{'t': 0.0, 'ref': 'title'}] + [{'t': s['at'], 'ref': s['ref']} for s in strip['frames']] + \
         [{'t': nt['start'], 'ref': 'night'} for nt in strip['nights']]
starts.sort(key=lambda s: s['t'])
scenes = []
for i, s in enumerate(starts):
    end = starts[i + 1]['t'] if i + 1 < len(starts) else timing['duration']
    said = next((ln['text'] for ln in lines if s['t'] - 0.4 <= ln['t'] < end), '')
    words = said.split()
    quote = ' '.join(words[:9]) + ('…' if len(words) > 9 else '')
    kind = {'map': 'Map', 'night': 'Night chat', 'title': 'Title'}.get(s['ref'], '')
    label = (kind + (' · ' if kind and quote else '') + (f'“{quote}”' if quote else '')) or 'No narration'
    scenes.append({'t': round(s['t'], 3), 'label': label, 'ref': s['ref']})

def enc(job):
    name, a, b = job
    d = b - a
    kbps = min(850, int(LIMIT_MB * 8 * 1024 * 1024 / d / 1000) - 96 - 30)
    dst = os.path.join(out, name + '.mp4')
    log = dst + '.2pass'
    base = ['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-ss', f'{a:.4f}', '-i', film, '-t', f'{d:.4f}',
            '-vf', 'scale=960:540:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-b:v', f'{kbps}k',
            '-maxrate', f'{int(kbps * 1.6)}k', '-bufsize', f'{kbps * 2}k', '-g', '48', '-pix_fmt', 'yuv420p',
            '-passlogfile', log]
    subprocess.run(base + ['-pass', '1', '-an', '-f', 'mp4', '/dev/null'], check=True)
    subprocess.run(base + ['-pass', '2', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart',
                           dst + '.part.mp4'], check=True)
    os.replace(dst + '.part.mp4', dst)
    for f in glob.glob(log + '*'):
        os.remove(f)
    return f'{name} {d:.1f}s {os.path.getsize(dst) / 1e6:.1f} MB at {kbps}k'


def finalize(name):
    """Give a freshly encoded part its hashed name; return the part's current hashed file, or None."""
    plain = os.path.join(out, name + '.mp4')
    if os.path.exists(plain):
        h = hashlib.md5(open(plain, 'rb').read()).hexdigest()[:8]
        for old in glob.glob(os.path.join(out, name + '-*.mp4')):
            os.remove(old)
        os.replace(plain, os.path.join(out, f'{name}-{h}.mp4'))
    found = glob.glob(os.path.join(out, name + '-*.mp4'))
    return os.path.relpath(found[0], out) if found else None


with ThreadPoolExecutor(2) as pool:
    for line in pool.map(enc, jobs):
        print(line, flush=True)
for c in chapters:
    for p in c['parts']:
        p['src'] = finalize(p['src'])
missing = [c['n'] for c in chapters if any(p['src'] is None for p in c['parts'])]
if missing:
    print('chapters with no encoded parts yet:', missing)
json.dump({'title': 'The Hidden Cost of AI', 'fps': FPS, 'duration': fr(timing['duration']), 'chapters': chapters,
           'scenes': scenes, 'lines': lines}, open(os.path.join(out, 'manifest.json'), 'w'), separators=(',', ':'))


print(f'{len(jobs)} parts; manifest has {len(chapters)} chapters, {len(scenes)} scenes, {len(lines)} lines')
