#!/usr/bin/env python3
"""Encode review parts for the review room: 960x540 H.264, at most 120 s and under 15 MB each.

    python3 review_parts.py OUTDIR name=chapter.mp4 [name=chapter.mp4 ...]

Each input (a chapter, or a whole film) is split into parts of at most 120 s and encoded at about
850 kbps video + 96 kbps AAC, so a part stays under 15 MB and the whole film under the page's
256 MB. Writes OUTDIR/<name>_pNN.mp4 and OUTDIR/parts.json ({name: {duration, parts: [{file,
start, duration, bytes}]}}). A part that already exists with the same source and range is kept,
so re-running after a fix only re-encodes what changed.
"""
import json, math, os, subprocess, sys

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
man_path = os.path.join(out, "parts.json")
old = json.load(open(man_path)) if os.path.exists(man_path) else {}
man = {}
for arg in sys.argv[2:]:
    name, src = arg.split("=", 1)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                               capture_output=True, text=True).stdout)
    n = max(1, math.ceil(dur / 120.0)); step = dur / n
    mtime = os.path.getmtime(src); parts = []
    for i in range(n):
        f = f"{name}_p{i:02d}.mp4"; a = i * step; d = min(step, dur - a); p = os.path.join(out, f)
        prev = next((q for q in old.get(name, {}).get("parts", []) if q["file"] == f), None)
        if not (prev and os.path.exists(p) and prev.get("src_mtime") == mtime and abs(prev["start"] - a) < 1e-3):
            for kbps in (850, 700, 560):
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{a:.3f}", "-i", src, "-t", f"{d:.3f}",
                                "-vf", "scale=960:540:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-profile:v", "high",
                                "-b:v", f"{kbps}k", "-maxrate", f"{int(kbps * 1.4)}k", "-bufsize", f"{kbps * 3}k", "-pix_fmt", "yuv420p",
                                "-c:a", "aac", "-b:a", "96k", "-ac", "2", "-movflags", "+faststart", p], check=True)
                if os.path.getsize(p) < 15 * 1024 * 1024: break
            print("encoded", f, f"{os.path.getsize(p) / 1e6:.1f} MB")
        parts.append({"file": f, "start": round(a, 4), "duration": round(d, 4), "bytes": os.path.getsize(p), "src_mtime": mtime})
    man[name] = {"duration": round(dur, 4), "parts": parts}
json.dump(man, open(man_path, "w"), indent=1)
print("total", f"{sum(q['bytes'] for m in man.values() for q in m['parts']) / 1e6:.1f} MB")
