#!/usr/bin/env python3
"""Flag on-screen strings that repeat the narration word for word (CLAUDE.md / video-research: keywords only).
Usage: python3 -I tools/text_audit.py   (run from effectcraft/invisible-cassette)
A string is flagged when 3+ consecutive words of it appear in a row in its scene's narration and those
words are most of the string (or 4+ consecutive words anywhere).
Allowed: proper names and terms of art (NAMES below), hyphenated terms (one word), and dates or numbers
(strings with digits: the house rule puts numbers on screen)."""
import json, re, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open(os.path.join(HERE, "../../remotion/src/invisible-cassette/words.json")))
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower().replace("’", "'"))
# narration words; hyphenated pieces ("step" "-by" "-step") are joined into one term like the on-screen text
narr = {}
for k, v in W.items():
    out = []
    for x in v:
        if x["w"].startswith("-") and out: out[-1] += norm(x["w"])
        elif norm(x["w"]): out.append(norm(x["w"]))
    narr[k] = out
def run(a, b):
    best = 0
    for i in range(len(a)):
        for j in range(len(b)):
            k = 0
            while i + k < len(a) and j + k < len(b) and a[i + k] == b[j + k]: k += 1
            best = max(best, k)
    return best
NAMES = ["NEW YORK STOCK EXCHANGE", "DEEP REINFORCEMENT LEARNING", "LEARNING TO RUN A POWER NETWORK", "TRAJECTORY-BASED OPERATIONS", "SPECIFICATION GAMING"]
bad = 0
for n in range(1, 10):
    f = os.path.join(HERE, f"s{n}.jsx")
    src = open(f).read()
    for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', src):
        s = m.group(1)
        if len(s) < 6 or not re.search(r"[A-Z]{2}", s) or s.startswith(("S%d" % n, "ADBE")) or "time" in s: continue
        if re.search(r"\d", s) or any(n.lower() in s.lower() for n in NAMES): continue
        ws = [norm(w) for w in re.split(r"[\s·/:,()?!.–—→>]+", s) if norm(w)]
        if len(ws) < 3: continue
        r = run(ws, narr[str(n)])
        if r >= 4 or (r >= 3 and r >= len(ws) - 1):
            bad += 1; line = src[:m.start()].count("\n") + 1
            print(f"s{n}.jsx:{line}: {r}/{len(ws)} words verbatim: {s}")
print("flagged", bad)
