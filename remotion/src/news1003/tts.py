"""Text sent to ElevenLabs per chapter: acronyms and numbers spelled for speech."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
SUBS = [("NVIDIA's", "Nvidia's"), ('DGX Spark', 'D G X Spark'), ('ConnectX-7', 'Connect X seven'), ('RAMpocalypse', 'RAM-pocalypse'),
        ('128 gigabytes', 'one hundred twenty-eight gigabytes'), ('128 gigabyte', 'one hundred twenty-eight gigabyte'), ('128 gigs', 'one hundred twenty-eight gigs'),
        ('64 gigabyte', 'sixty-four gigabyte'), ('64 gig', 'sixty-four gig'), ('October 23rd', 'October twenty-third'),
        ('4,999 dollars', 'four thousand nine hundred ninety-nine dollars'), ('7,000 to 9,000 dollars', 'seven thousand to nine thousand dollars'),
        ('20-core', 'twenty-core'), ('Arm CPU', 'Arm C P U'), ('300,000', 'three hundred thousand'), ('30,000', 'thirty thousand'),
        ('16 new', 'sixteen new'), ('300 schools', 'three hundred schools'), ('220 billion', 'two hundred twenty billion'),
        ('100-million-dollar', 'hundred-million-dollar'), ('10,000', 'ten thousand'), ('2027', 'twenty twenty-seven'), ('12-week', 'twelve-week'),
        ('48 percent', 'forty-eight percent'), ('48 hours', 'forty-eight hours'), ('900', 'nine hundred'), ('50 petabytes', 'fifty petabytes'),
        ('NDAs', 'N D As'), ('AWS', 'A W S'), ('CEO', 'C E O'), ('FTC', 'F T C'), ('U.S.', 'U S'), ('AI', 'A I')]
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
