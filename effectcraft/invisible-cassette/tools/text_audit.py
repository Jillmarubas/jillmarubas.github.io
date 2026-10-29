#!/usr/bin/env python3
"""Flag on-screen strings that repeat the narration word for word (CLAUDE.md / video-research: keywords only).
Usage: python3 -I tools/text_audit.py   (run from effectcraft/invisible-cassette)
A string is flagged when 3+ consecutive words of it appear in a row in its scene's narration and those
words are most of the string (or 4+ consecutive words anywhere)."""
import json, re, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open(os.path.join(HERE, "../../remotion/src/invisible-cassette/words.json")))
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower().replace("’", "'"))
narr = {k: [norm(x["w"]) for x in v if norm(x["w"])] for k, v in W.items()}
def run(a, b):
    best = 0
    for i in range(len(a)):
        for j in range(len(b)):
            k = 0
            while i + k < len(a) and j + k < len(b) and a[i + k] == b[j + k]: k += 1
            best = max(best, k)
    return best
bad = 0
for n in range(1, 10):
    f = os.path.join(HERE, f"s{n}.jsx")
    src = open(f).read()
    for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', src):
        s = m.group(1)
        if len(s) < 6 or not re.search(r"[A-Z]{2}", s) or s.startswith(("S%d" % n, "ADBE")) or "time" in s: continue
        ws = [norm(w) for w in re.split(r"[\s·/:,()?!.\-–—→>]+", s) if norm(w)]
        if len(ws) < 3: continue
        r = run(ws, narr[str(n)])
        if r >= 4 or (r >= 3 and r >= len(ws) - 1):
            bad += 1; line = src[:m.start()].count("\n") + 1
            print(f"s{n}.jsx:{line}: {r}/{len(ws)} words verbatim: {s}")
print("flagged", bad)
