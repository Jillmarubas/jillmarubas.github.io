# Word timings for a VO file: python3 words.py in.mp3 out.json
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
m = WhisperModel('small.en', device='cpu', compute_type='int8')
segs, _ = m.transcribe(a, word_timestamps=True, beam_size=5)
words = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
json.dump({'duration': len(a) / 16000, 'words': words}, open(sys.argv[2], 'w'), indent=0)
print(' '.join(f"{x['w']}@{x['s']:.2f}" for x in words))
