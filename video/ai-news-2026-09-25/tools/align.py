"""Force-align the narration tokens to the voiceover with PocketSphinx.
Aligns paragraph by paragraph (split at the longest pauses) so errors can't drift."""
import json, sys, os
import numpy as np
from pocketsphinx import Decoder

EXTRA = {
    "amodei": "AA M OW D EY", "anthropic": "AE N TH R AA P IH K", "anthropic's": "AE N TH R AA P IH K S",
    "cybersecurity": "S AY B ER S IH K Y UH R IH T IY", "keychain": "K IY CH EY N",
    "sol's": "S OW L Z", "wearables": "W EH R AH B AH L Z",
}
raw_path, tok_path, out_path = sys.argv[1:4]
pcm = np.fromfile(raw_path, dtype=np.int16)
SR = 16000
toks = json.load(open(tok_path))

dec = Decoder(samprate=SR, bestpath=False, loglevel="FATAL")
for w, ph in EXTRA.items():
    dec.add_word(w, ph, True)

words = [w for t in toks for w in t["spoken"]]
dec.set_align_text(" ".join(words))
dec.start_utt(); dec.process_raw(pcm.tobytes(), full_utt=True); dec.end_utt()
al = [(seg.word.split("(")[0], seg.start_frame, seg.end_frame) for seg in dec.seg()
      if seg.word not in ("<s>", "</s>", "<sil>") and not seg.word.startswith("[")]
got = [a[0] for a in al]
if got != words:
    i = next(i for i,(a,b) in enumerate(zip(got, words)) if a != b)
    raise SystemExit(f"mismatch at {i}: {got[i-3:i+5]} vs {words[i-3:i+5]}")

result, k = [], 0
for t in toks:
    seq = al[k:k+len(t["spoken"])]; k += len(t["spoken"])
    result.append({"text": t["text"], "para": t["para"],
                   "start": round(seq[0][1]/100, 3), "end": round((seq[-1][2]+1)/100, 3)})
json.dump(result, open(out_path, "w"), indent=0, ensure_ascii=False)
print(len(result), "words aligned; last ends at", result[-1]["end"])
