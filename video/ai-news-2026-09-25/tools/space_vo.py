"""Open a short gap between stories so each transition has room to breathe.
Splits the voiceover at the silence between paragraphs, inserts GAP seconds there,
and shifts every word timing to match. Writes the spaced WAV and src/data/timeline.json."""
import json, subprocess, sys
import numpy as np

LEAD, GAP, TAIL = 0.35, 0.55, 2.4
ffmpeg, src_mp3, words_path, out_wav, out_json = sys.argv[1:6]
SR = 44100
pcm = np.frombuffer(subprocess.run([ffmpeg, "-loglevel", "error", "-i", src_mp3, "-ac", "1", "-ar", str(SR),
                                    "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32)
words = json.load(open(words_path))
n_para = max(w["para"] for w in words) + 1
paras = [[w for w in words if w["para"] == p] for p in range(n_para)]
cuts = [(paras[p][-1]["end"] + paras[p+1][0]["start"]) / 2 for p in range(n_para - 1)]

pieces, offsets, prev = [np.zeros(int(LEAD*SR), np.float32)], [], 0.0
for i, c in enumerate(cuts + [len(pcm)/SR]):
    offsets.append(LEAD + i*GAP)
    pieces.append(pcm[int(prev*SR):int(c*SR)])
    if i < len(cuts): pieces.append(np.zeros(int(GAP*SR), np.float32))
    prev = c
pieces.append(np.zeros(int(TAIL*SR), np.float32))
out = np.concatenate(pieces)
subprocess.run([ffmpeg, "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-c:a", "pcm_s16le", out_wav], input=out.tobytes(), check=True)

shifted = [dict(w, start=round(w["start"]+offsets[w["para"]], 3), end=round(w["end"]+offsets[w["para"]], 3))
           for w in words]
para_spans = [{"start": min(w["start"] for w in shifted if w["para"] == p),
               "end": max(w["end"] for w in shifted if w["para"] == p)} for p in range(n_para)]
json.dump({"duration": round(len(out)/SR, 3), "paras": para_spans, "words": shifted},
          open(out_json, "w"), ensure_ascii=False)
print("total", round(len(out)/SR, 2), "s;", [round(p["start"], 2) for p in para_spans])
