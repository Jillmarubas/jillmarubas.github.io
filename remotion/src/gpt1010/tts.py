"""Text sent to ElevenLabs per chapter: acronyms and file names spelled for speech."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
SUBS = [('UI', 'U I'), ('AI', 'A I'), ('SSH', 'S S H'), ('MP3', 'M P three'), ('WAV', 'wave'), ('M4A', 'M four A'), ('FLAC', 'flack')]
def tts_text(s):
    for a, b in SUBS:
        s = re.sub(r'(?<![\w-])' + re.escape(a) + r'(?![\w-])', b, s)
    return s
if __name__ == "__main__":
    segs = json.load(open(os.path.join(D, 'lines.json')))
    out = [' '.join(tts_text(l['say']) for l in s['lines']) for s in segs]
    json.dump(out, open(os.path.join(D, 'tts.json'), 'w'), indent=1, ensure_ascii=False)
    for s, t in zip(segs, out): print(s['key'], len(t))
    print('total', sum(map(len, out)))
