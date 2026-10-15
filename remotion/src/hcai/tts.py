"""Text sent to ElevenLabs per chapter: acronyms and numbers spelled for speech."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
SUBS = [('$1.32', 'one dollar thirty-two'), ('$12.50', 'twelve dollars fifty'), ('$29', 'twenty-nine dollars'), ('$270', 'two hundred seventy dollars'),
        ('$2', 'two dollars'), ('0.34', 'zero point three four'), ('0.24', 'zero point two four'), ('0.26', 'zero point two six'),
        ('1.2', 'one point two'), ('4.4%', 'four point four percent'), ('mid-2000s', 'mid two-thousands'), ('3 a.m.', 'three A M'),
        ('xAI', 'x A I'), ('H100', 'H one hundred'), ('TSMC', 'T S M C'), ('PJM', 'P J M'), ('GPU', 'G P U'), ('LED', 'L E D'),
        ('CEO', 'C E O'), ('US', 'U S'), ('AI', 'A I'), ('TIME', 'Time'), ('ONE', 'one'), ('ALL', 'all'), ('The Dalles', 'The Dals'),
        ('Loudoun', 'Loudon')]
def tts_text(s):
    for a, b in SUBS:
        s = re.sub(r'(?<![\w-])' + re.escape(a) + r'(?![\w-])', b, s)
    s = re.sub(r'(\d)%', r'\1 percent', s)
    return s.replace(' — ', ', ').replace(' —', ',').replace('—', ', ')
if __name__ == "__main__":
  segs = json.load(open(os.path.join(D, 'lines.json')))
  out = [' '.join(tts_text(l['say']) for l in s['lines']) for s in segs]
  json.dump(out, open(os.path.join(D, 'tts.json'), 'w'), indent=1, ensure_ascii=False)
  for s, t in zip(segs, out): print(s['key'], len(t))
  print('total', sum(map(len, out)))
