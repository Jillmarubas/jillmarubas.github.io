"""Align every script paragraph to the voiceover's word timings and write timing.json.

Usage: python3 -I build_timing.py <folder with script.json and words.json>
Each line gets start/end (seconds, local to its scene take) and the time of every word,
so visuals can land on the word that names them.
"""
import difflib, json, re, sys

d = sys.argv[1]
S = json.load(open(f"{d}/script.json"))
W = json.load(open(f"{d}/words.json"))

NUM = {"0": "zero", "1": "one", "2": "two", "4": "four", "6": "six", "36": "thirty six", "42": "forty two",
       "50": "fifty", "60": "sixty", "75": "seventy five", "14": "fourteen", "20": "twenty", "200": "two hundred",
       "104": "hundred and four", "1993": "1993", "2003": "2003", "2010": "2010", "2016": "2016", "2019": "2019",
       "2020": "2020", "1970": "1970", "1971": "1971"}


def toks(s):
    return re.findall(r"[a-z0-9]+", s.lower().replace("’", "'").replace("'", "").replace("-", " "))


out = {"fps": 24, "scenes": []}
for sc in S["scenes"]:
    if not sc["paras"]:
        continue
    ws = W[str(sc["id"])]
    # heard tokens, each pointing back to its word
    heard, owner = [], []
    for wi, w in enumerate(ws):
        for t in toks(w["w"]):
            heard.append(t)
            owner.append(wi)
    ref, para_of = [], []
    for pi, p in enumerate(sc["paras"]):
        for t in toks(p["t"]):
            ref.append(t)
            para_of.append(pi)
    sm = difflib.SequenceMatcher(a=ref, b=heard, autojunk=False)
    ref2word = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            ref2word[a + k] = owner[b + k]
    lines = []
    for pi, p in enumerate(sc["paras"]):
        idx = [k for k in range(len(ref)) if para_of[k] == pi and k in ref2word]
        wi0, wi1 = ref2word[idx[0]], ref2word[idx[-1]]
        lines.append({"i": pi, "start": ws[wi0]["s"], "end": ws[wi1]["e"],
                      "words": [{"w": ws[k]["w"], "t": ws[k]["s"]} for k in range(wi0, wi1 + 1)],
                      "text": p["t"]})
    out["scenes"].append({"id": sc["id"], "title": sc["title"], "dur": ws[-1]["e"] + 0.6, "lines": lines})

json.dump(out, open(f"{d}/timing.json", "w"), indent=1)
for s in out["scenes"]:
    print(s["id"], round(s["dur"], 1), " ".join(f"{l['start']:.1f}" for l in s["lines"]))
