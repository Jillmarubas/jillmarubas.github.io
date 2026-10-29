#!/usr/bin/env python3
"""Join the scene previews into the full film and write the review-room timeline.

Usage: python3 -I tools/assemble_film.py      (run from effectcraft/invisible-cassette)
Reads render/<part>-half-av.mp4 in film order, writes render/film-half.mp4 (960x540, H.264 + AAC) and
../../remotion/src/invisible-cassette/timeline_full.json (shots = scenes and act cards, lines = narration
with film times, chapters = act starts for the review parts).
"""
import json, os, subprocess

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IC = os.path.join(HERE, "../../remotion/src/invisible-cassette")
# (render name, label, scene id whose narration it carries, voice offset inside the part)
ORDER = [
    ("s1-mm", "Act I · 1 The crash no human could see", 1, 4.0),
    ("s2", "Act I · 2 The autopsy of a phantom", 2, 1.0),
    ("act2", "Act II card · The velocity crisis", None, 0),
    ("s3", "Act II · 3 The physics of the grid", 3, 1.0),
    ("s4", "Act II · 4 Handing over the switch", 4, 1.0),
    ("act3", "Act III card · The explainability problem", None, 0),
    ("s5", "Act III · 5 Inside the vector space", 5, 1.0),
    ("s6", "Act III · 6 Specification gaming", 6, 1.0),
    ("act4", "Act IV card · The invisible cascade", None, 0),
    ("s7", "Act IV · 7 Cross-sector velocity", 7, 1.0),
    ("s8", "Act IV · 8 The reality of the kill switch", 8, 1.0),
    ("act5", "Act V card · The unintended compact", None, 0),
    ("s9", "Act V · 9 The modern paradox", 9, 1.0),
    ("s10", "Act V · 10 The final sign-off", None, 0),
]


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


timing = {s["id"]: s for s in json.load(open(os.path.join(IC, "timing.json")))["scenes"]}
files, shots, lines, chapters, t = [], [], [], [], 0.0
for name, lab, sid, off in ORDER:
    f = os.path.join(HERE, "render", f"{name}-half-av.mp4")
    if not os.path.exists(f):
        raise SystemExit(f"missing {f}")
    d = dur(f)
    files.append(f)
    shots.append({"name": lab, "start": round(t, 2), "end": round(t + d, 2)})
    if "card" in lab or name == "s1-mm":
        chapters.append(round(t, 2))
    if sid:
        for ln in timing[sid]["lines"]:
            lines.append({"start": round(t + off + ln["start"], 2), "end": round(t + off + ln["end"], 2), "text": " ".join(w["w"] for w in ln["words"])})
    t += d

lst = os.path.join(HERE, "render", "concat.txt")
open(lst, "w").write("".join(f"file '{f}'\n" for f in files))
out = os.path.join(HERE, "render", "film-half.mp4")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-vf", "scale=960:540,fps=24", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out], check=True)
tl = {"title": "Invisible Cassette Review", "version": "Full film v1 · MagnatesMedia look · trading terminal", "shots": shots, "lines": lines, "chapters": chapters}
json.dump(tl, open(os.path.join(IC, "timeline_full.json"), "w"), indent=1)
print(f"film {t:.1f} s ({t / 60:.1f} min) -> {out}; chapters at {chapters}")
