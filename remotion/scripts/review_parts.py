#!/usr/bin/env python3
"""Cut a film into review parts for the review room (video-production-psychology, section 6).

Usage: python3 -I scripts/review_parts.py <film.mp4> <out_dir> [--start S] [--max 110] [--split s1,s2,...]
Each part: 960x540 H.264 (about 850 kb/s) + AAC 96 kb/s, at most --max seconds and under 15 MB.
Parts break at --split times when given (chapter or scene boundaries), else every --max seconds.
Writes <out_dir>/manifest.json: {"fps", "parts": [{"file", "start", "dur"}]} where start is film time.
"""
import argparse, json, os, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("film")
ap.add_argument("out")
ap.add_argument("--start", type=float, default=0.0, help="film time of the input's first frame")
ap.add_argument("--max", type=float, default=110.0)
ap.add_argument("--split", default="")
ap.add_argument("--fps", type=int, default=24)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.film], capture_output=True, text=True).stdout)

cuts = sorted({0.0, dur, *[float(x) - a.start for x in a.split.split(",") if x.strip()]})
bounds = []
for s, e in zip(cuts, cuts[1:]):
    n = max(1, int((e - s) // a.max) + (1 if (e - s) % a.max > 0.01 else 0))
    step = (e - s) / n
    bounds += [(s + i * step, s + (i + 1) * step) for i in range(n)]

parts = []
for i, (s, e) in enumerate(bounds):
    name = f"part{i + 1:02d}.mp4"
    path = os.path.join(a.out, name)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.3f}", "-i", a.film, "-t", f"{e - s:.3f}",
                    "-vf", "scale=960:540:flags=lanczos,format=yuv420p", "-r", str(a.fps),
                    "-c:v", "libx264", "-preset", "slow", "-b:v", "850k", "-maxrate", "1200k", "-bufsize", "2400k",
                    "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", path], check=True)
    mb = os.path.getsize(path) / 1e6
    assert mb < 15, f"{name} is {mb:.1f} MB (limit 15)"
    parts.append({"file": name, "start": round(a.start + s, 3), "dur": round(e - s, 3)})
    print(f"{name}: {a.start + s:.2f}-{a.start + e:.2f}s, {mb:.1f} MB")

json.dump({"fps": a.fps, "parts": parts}, open(os.path.join(a.out, "manifest.json"), "w"), indent=1)
