#!/usr/bin/env python3
"""Shorten pauses in a voice-over without changing the speed of the voice.

Every silence longer than --max is cut down to --max (half kept on each side,
so breaths and word tails stay natural). Joins get a 10 ms crossfade.

    python3 tighten_vo.py in.mp3 out.wav [--max 0.22] [--db -40]
"""
import argparse, re, subprocess, tempfile, os

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst")
ap.add_argument("--max", type=float, default=0.22, help="longest pause kept, seconds")
ap.add_argument("--db", type=float, default=-40, help="silence threshold, dB")
a = ap.parse_args()

log = subprocess.run(["ffmpeg", "-hide_banner", "-i", a.src, "-af",
                      f"silencedetect=n={a.db}dB:d={a.max}", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "csv=p=0", a.src], capture_output=True, text=True).stdout)

keep, t, half = [], 0.0, a.max / 2
for s, e in zip(starts, ends):
    if s <= 0.01:            # leading silence: trim to a short lead-in
        t = max(0.0, e - 0.05); continue
    keep.append((t, s + half)); t = e - half
keep.append((t, dur))

with tempfile.TemporaryDirectory() as d:
    parts = []
    for i, (s, e) in enumerate(keep):
        p = os.path.join(d, f"{i:04d}.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.src, "-ss", f"{s:.3f}", "-to", f"{e:.3f}",
                        "-af", "afade=t=in:d=0.01,areverse,afade=t=in:d=0.01,areverse", "-ar", "48000", "-ac", "1", p], check=True)
        parts.append(p)
    lst = os.path.join(d, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, a.dst], check=True)

new = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "csv=p=0", a.dst], capture_output=True, text=True).stdout)
print(f"{a.src}: {dur:.2f}s -> {new:.2f}s ({len(starts)} pauses shortened)")
