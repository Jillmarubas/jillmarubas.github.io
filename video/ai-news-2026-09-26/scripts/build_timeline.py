"""Build src/data/timeline.json: every script word with the time Joey says it.

Whisper gives timings but its own spelling ("90", "GPT-5.6"); the script gives the
spelling we want on screen. Align the two word sequences, take Whisper's times for
matched words, interpolate the rest, then merge spoken phrases into display tokens
and cut the result into on-screen phrases.
"""
import json, re, difflib, subprocess, os
from sections import SECTIONS, DISPLAY, KEY

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open(os.path.join(ROOT, "data/whisper-words.json")))

NUMS = {"0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six",
        "7": "seven", "8": "eight", "9": "nine", "10": "ten", "20": "twenty", "50": "fifty", "90": "ninety"}

def norm(w):
    w = w.lower().replace("’", "'")
    w = re.sub(r"[^a-z0-9']", "", w)
    return NUMS.get(w, w)

def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out)

def build(key):
    text = SECTIONS[key]
    # script words, remembering where paragraphs start
    words = []
    for pi, para in enumerate(text.split("\n\n")):
        for j, w in enumerate(para.split()):
            words.append(dict(raw=w, para=(j == 0 and pi > 0)))
    # whisper splits "brand-new" etc. differently: compare on hyphen-split sub-tokens
    def expand(seq, get):
        toks, owner = [], []
        for i, x in enumerate(seq):
            for part in re.split(r"[-–]", get(x)):
                n = norm(part)
                if n:
                    toks.append(n); owner.append(i)
        return toks, owner
    st, so = expand(words, lambda x: x["raw"])
    wt, wo = expand(W[key], lambda x: x["w"])
    sm = difflib.SequenceMatcher(a=st, b=wt, autojunk=False)
    times = [[None, None] for _ in words]
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            si, wi = so[a + k], wo[b + k]
            ww = W[key][wi]
            if times[si][0] is None or ww["s"] < times[si][0]:
                times[si][0] = ww["s"]
            if times[si][1] is None or ww["e"] > times[si][1]:
                times[si][1] = ww["e"]
    matched = sum(1 for t in times if t[0] is not None)
    # interpolate gaps by character length between known neighbours
    i = 0
    total = duration(os.path.join(ROOT, f"public/vo/{key}.mp3"))
    while i < len(words):
        if times[i][0] is not None:
            i += 1; continue
        j = i
        while j < len(words) and times[j][0] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else 0.0
        t1 = times[j][0] if j < len(words) else total - 0.2
        lens = [len(words[k]["raw"]) for k in range(i, j)]
        acc, span = t0, max(t1 - t0, 0.05 * (j - i))
        for k in range(i, j):
            d = span * lens[k - i] / sum(lens)
            times[k] = [acc, acc + d]; acc += d
        i = j
    for w, t in zip(words, times):
        w["s"], w["e"] = round(t[0], 3), round(t[1], 3)

    # merge spoken phrases into display tokens
    toks, i = [], 0
    lw = [norm(w["raw"]) for w in words]
    while i < len(words):
        hit = None
        for phrase, disp in DISPLAY:
            p = [norm(x) for x in phrase.split()]
            if lw[i:i + len(p)] == p:
                hit = (len(p), disp); break
        if hit:
            n, disp = hit
            last = words[i + n - 1]["raw"]
            trail = re.search(r"[^\w%¢]+$", last)
            lead = re.match(r"^[\"“(]+", words[i]["raw"])
            t = (lead.group(0) if lead else "") + disp + (trail.group(0) if trail else "")
            toks.append(dict(t=t, s=words[i]["s"], e=words[i + n - 1]["e"], para=words[i]["para"]))
            i += n
        else:
            w = words[i]
            toks.append(dict(t=w["raw"], s=w["s"], e=w["e"], para=w["para"]))
            i += 1
    for t in toks:
        bare = re.sub(r"[^\w'%¢$.,-]", "", t["t"]).strip(".,").lower()
        t["num"] = bool(re.search(r"\d", t["t"]))
        t["key"] = t["num"] or bare in KEY
        t["q"] = '"' in t["t"] or "“" in t["t"]

    # cut into on-screen phrases: sentence ends, long pauses, or too long to read at once
    phrases, cur = [], []
    def flush():
        if cur:
            phrases.append(dict(a=cur[0], b=cur[-1], s=toks[cur[0]]["s"], e=toks[cur[-1]]["e"]))
            cur.clear()
    for k, t in enumerate(toks):
        if cur:
            gap = t["s"] - toks[cur[-1]]["e"]
            chars = sum(len(toks[x]["t"]) + 1 for x in cur)
            prev = toks[cur[-1]]["t"]
            if (t["para"] or gap > 0.42 or re.search(r"[.?!:]\"?$", prev)
                    or (re.search(r"[,;]\"?$", prev) and len(cur) >= 4)
                    or len(cur) >= 7 or chars + len(t["t"]) > 40):
                flush()
        cur.append(k)
    flush()
    return dict(id=key, duration=round(duration(os.path.join(ROOT, f"public/vo/{key}.mp3")), 3),
                words=[dict(t=t["t"], s=t["s"], e=t["e"], k=t["key"], n=t["num"], q=t["q"]) for t in toks],
                phrases=phrases), matched, len(words)

out = []
for key in SECTIONS:
    sec, m, n = build(key)
    print(f"{key}: {n} words, {m} timed by whisper ({100*m/n:.1f}%), {len(sec['words'])} tokens, {len(sec['phrases'])} phrases")
    out.append(sec)
os.makedirs(os.path.join(ROOT, "src/data"), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, "src/data/timeline.json"), "w"), ensure_ascii=False, separators=(",", ":"))
