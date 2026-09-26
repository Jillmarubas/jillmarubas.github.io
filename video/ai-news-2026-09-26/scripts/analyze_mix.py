"""Meter a rendered mix: integrated loudness, true peak, speech vs. gap levels, and the
loudest moments (so an SFX that jumps over the voice shows up with its timecode).
usage: python3 scripts/analyze_mix.py out/mix.wav"""
import re, subprocess, sys, json, statistics, os

src = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-v", "verbose", "-i", src, "-af", "ebur128=peak=true:framelog=verbose", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
rows = []
for m in re.finditer(r"t:\s*([\d.]+)\s+TARGET:.*?M:\s*(-?[\d.]+|-inf)\s+S:\s*(-?[\d.]+|-inf)", out):
    t, M, S = float(m.group(1)), m.group(2), m.group(3)
    rows.append((t, float(M) if M != "-inf" else -99.0, float(S) if S != "-inf" else -99.0))
summary = out[out.rfind("Summary:"):]
I = re.search(r"I:\s*(-?[\d.]+) LUFS", summary).group(1)
LRA = re.search(r"LRA:\s*([\d.]+) LU", summary).group(1)
TP = re.search(r"Peak:\s*(-?[\d.]+) dBFS", summary).group(1)
print(f"integrated {I} LUFS · LRA {LRA} LU · true peak {TP} dBTP")

# rebuild the running order (same maths as src/timeline.ts) to label speech vs gaps
tl = json.load(open(os.path.join(root, "src/data/timeline.json")))
dur = {s["id"]: s["duration"] for s in tl}
blocks, t = [], 0.6
def vo(i, tail):
    global t
    blocks.append(("vo", i, t, t + dur[i])); t += dur[i] + tail
vo("01-hook", 0.3); blocks.append(("sting", "", t, t + 3.6)); t += 3.8; vo("02-preview", 0.6)
for k, i in enumerate(["03-story1", "04-story2", "05-story3", "06-story4", "07-story5"]):
    blocks.append(("card", str(k + 1), t, t + 3.2)); t += 3.2; vo(i, 0.8)
blocks.append(("recap", "", t, t + 2)); t += 2; vo("08-wrap", 0.6); vo("09-outro", 0.4); blocks.append(("end", "", t, t + 9))

def label(x):
    for kind, i, a, b in blocks:
        if a <= x < b: return f"{kind} {i}".strip()
    return "gap"

speech = [S for (x, M, S) in rows if label(x).startswith("vo") and S > -60]
gaps = [S for (x, M, S) in rows if not label(x).startswith("vo") and S > -70]
print(f"short-term during speech: median {statistics.median(speech):.1f} LUFS, p95 {sorted(speech)[int(.95*len(speech))]:.1f}")
print(f"short-term in cards/stings/end: median {statistics.median(gaps):.1f} LUFS, max {max(gaps):.1f}")
per = {}
for x, M, S in rows:
    lb = label(x)
    if lb.startswith("vo") and S > -60: per.setdefault(lb, []).append(S)
for k, v in per.items():
    print(f"  {k:14s} median short-term {statistics.median(v):6.1f} LUFS")
# loudest momentary spikes
spikes = sorted(rows, key=lambda r: -r[1])[:8]
print("loudest momentary (400 ms) windows:")
for x, M, S in sorted(spikes):
    print(f"  {int(x // 60)}:{x % 60:05.2f}  M {M:6.1f}  S {S:6.1f}  [{label(x)}]")
