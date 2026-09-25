"""Split the narration into display tokens, each with the words the aligner should hear."""
import json, re, sys

SPOKEN = {
    "5.5": "five point five", "5": "five", "4": "four", "GPT-6": "g p t six",
    "AI": "a i", "AI,": "a i", "DNA": "d n a", "UN": "u n", "UN.": "u n", "UN,": "u n",
    "CEOs": "c e o's", "OpenAI": "open a i", "OpenAI's": "open a i's", "U.S.": "u s",
    "CRISPR-like": "crisper like", "ART.": "art", "DeepMind's": "deep mind's",
    "Ray-Ban": "ray ban", "two-point-oh.": "two point oh", "six-point-four": "six point four",
    "twenty-second,": "twenty second", "twenty-one": "twenty one", "computer-use": "computer use",
    "keychain-sized": "keychain sized", "long-running": "long running", "post-training,": "post training",
    "centralised": "centralized", "Qi": "chee",
}

def tokens(text):
    out = []
    for para_i, para in enumerate([p for p in text.split("\n\n") if p.strip()]):
        for raw in para.split():
            spoken = SPOKEN.get(raw) or SPOKEN.get(raw.strip('".,:?')) or raw
            spoken = re.sub(r"[^a-z' ]", " ", spoken.lower().replace("-", " ")).split()
            spoken = [w.strip("'") if not w.endswith("'s") else w for w in spoken]
            out.append({"text": raw.replace('"', "“" if raw.startswith('"') else "”") if '"' in raw else raw,
                        "spoken": [w for w in spoken if w], "para": para_i})
    return out

if __name__ == "__main__":
    text = open(sys.argv[1]).read().split("\n", 2)[2].strip()
    json.dump(tokens(text), open(sys.argv[2], "w"), indent=0, ensure_ascii=False)
