"""Split a film into phone-sized review parts for the review room (video-production-psychology skill, step 6).
Usage: python3 scripts/review_parts.py <film.mp4> <outdir> [--spec src/<film>/review.json]
Each chapter becomes one or more parts of at most 120 s, H.264 at ~850 kb/s (portrait 540x960 or
landscape 960x540, matching the film), AAC audio, fast-start, each under 15 MB. Parts are cut on
exact frames. Writes <outdir>/parts.json for review_page.py."""
import json, os, subprocess, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
film, outdir = args[0], args[1]
spec_path = sys.argv[sys.argv.index('--spec') + 1] if '--spec' in sys.argv else None
if spec_path is None:
    name = os.path.basename(outdir.rstrip('/'))
    spec_path = os.path.join(ROOT, 'src', name, 'review.json')
spec = json.load(open(spec_path))
fps = spec['fpsNum'] / spec['fpsDen']
fr = lambda s: round(s * fps)
os.makedirs(outdir, exist_ok=True)

def probe(path):
    out = subprocess.run(['npx', 'remotion', 'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, cwd=ROOT).stdout.strip().splitlines()[-1]
    w, h = map(int, out.strip(',').split(',')[:2])
    return w, h

w, h = probe(film)
size = '540:960' if h > w else '960:540'
parts = []
for ci, ch in enumerate(spec['chapters']):
    a, b = fr(ch['start']), min(fr(ch['end']), spec['frames'])
    max_frames = int(120 * fps)
    k = 0
    while a < b:
        e = min(b, a + max_frames)
        name = f"{spec['slug']}-c{spec['cut']}-ch{ci + 1}{'' if k == 0 and e == b else chr(97 + k)}.mp4"
        out = os.path.join(outdir, name)
        # Seek on the input (exact when re-encoding) and take exactly e - a frames.
        # Remotion's bundled ffmpeg has no trim/setpts filters, so no filter graph is used for cutting.
        scale = [] if (w, h) == tuple(map(int, size.split(':'))) else ['-vf', f'scale={size}:flags=lanczos']
        cmd = ['npx', 'remotion', 'ffmpeg', '-y', '-v', 'error', '-ss', f'{a / fps:.6f}', '-i', film, *scale,
               '-frames:v', str(e - a), '-t', f'{(e - a) / fps:.6f}', '-pix_fmt', 'yuv420p',
               '-r', f"{spec['fpsNum']}/{spec['fpsDen']}", '-c:v', 'libx264', '-preset', 'slow', '-b:v', '850k', '-maxrate', '1100k', '-bufsize', '1700k',
               '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', out]
        subprocess.run(cmd, check=True, cwd=ROOT)
        mb = os.path.getsize(out) / 1e6
        assert mb < 15, f'{name} is {mb:.1f} MB (limit 15)'
        parts.append({'file': name, 'chapter': ci, 'startFrame': a, 'endFrame': e, 'mb': round(mb, 2)})
        print(f'{name}: frames {a}-{e} ({(e - a) / fps:.2f} s), {mb:.2f} MB')
        a, k = e, k + 1
json.dump({'spec': spec, 'parts': parts}, open(os.path.join(outdir, 'parts.json'), 'w'), indent=1)
print('total', round(sum(p['mb'] for p in parts), 2), 'MB')
