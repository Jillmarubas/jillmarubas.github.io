#!/usr/bin/env python3
"""Align script lines to a voice-over without a speech model.

Detects pauses in the audio, then places each line boundary on the pause closest to where
the line should end by character count. Good to about one pause (~0.2 s) on clean TTS.

    python3 align_vo.py vo.mp3 lines.txt out.json      # lines.txt: one script line per row
"""
import json, re, subprocess, sys

src, lines_path, out = sys.argv[1:4]
lines = [l.strip() for l in open(lines_path) if l.strip()]
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "silencedetect=n=-38dB:d=0.12",
                      "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                           capture_output=True, text=True).stdout)
pauses = [((s + e) / 2, s, e) for s, e in zip(st, en) if s > 0.05 and e < dur - 0.05]
speech0 = en[0] if st and st[0] < 0.05 else 0.0
speech1 = st[-1] if en and en[-1] > dur - 0.05 else dur
total = sum(len(l) for l in lines)
res, cum, prev_end, used = [], 0, speech0, set()
for i, l in enumerate(lines):
    cum += len(l)
    if i == len(lines) - 1:
        end, nxt = speech1, None
    else:
        target = speech0 + (speech1 - speech0) * cum / total
        cands = [p for p in pauses if p[1] > prev_end + 0.3 and p not in used]
        p = min(cands, key=lambda p: abs(p[0] - target))
        used.add(p); end, nxt = p[1], p[2]
    res.append({"line": l, "start": round(prev_end, 3), "end": round(end, 3)})
    prev_end = nxt if nxt is not None else end
json.dump({"duration": dur, "lines": res}, open(out, "w"), indent=1)
for r in res: print(f'{r["start"]:7.2f} {r["end"]:7.2f}  {r["line"][:70]}')
