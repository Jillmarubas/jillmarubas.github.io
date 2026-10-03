"""Text sent to ElevenLabs per segment: acronyms and numbers spelled for speech."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
SUBS = [('GPT-6', 'G P T six'), ('GPT', 'G P T'), ('IPO', 'I P O'), ('FTC', 'F T C'), ('CEOs', 'C E Os'), ('xAI', 'ex A I'),
        ('API', 'A P I'), ('iOS', 'eye O S'), ('IRS', 'I R S'), ('UNSW', 'U N S W'), ('EU', 'E U'), ('FBI', 'F B I'),
        ('Kimi K3', 'Kimi K three'), ('NScale', 'En-scale'), ('U.S.', 'U S'), ('US', 'U S'), ('AI', 'A I'),
        ('2023', 'twenty twenty-three'), ('2025', 'twenty twenty-five'), ('29th', 'twenty-ninth'), ('Gemini 4', 'Gemini four'),
        ('Gemini 3', 'Gemini three'), ('SB Energy', 'S B Energy')]
def tts_text(s):
    for a, b in SUBS:
        s = re.sub(r'(?<![\w-])' + re.escape(a) + r'(?![\w-])', b, s)
    return s.replace(' — ', ', ').replace(' —', ',').replace('—', ', ')
if __name__ == "__main__":
  segs = json.load(open(os.path.join(D, 'lines.json')))
  out = [' '.join(tts_text(l['say']) for l in s['lines']) for s in segs]
  json.dump(out, open(os.path.join(D, 'tts.json'), 'w'), indent=1, ensure_ascii=False)
  for s, t in zip(segs, out): print(s['key'], len(t))
  print('total', sum(map(len, out)))
