import json, sys, glob, os
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=4)
out = {}
for f in sorted(glob.glob("public/vo/*.mp3")):
    segs, info = m.transcribe(f, word_timestamps=True, beam_size=5, vad_filter=False)
    words = [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3)) for s in segs for w in s.words]
    key = os.path.basename(f)[:-4]
    out[key] = words
    print(key, len(words), words[:3], flush=True)
json.dump(out, open("data/whisper-words.json", "w"), indent=0)
