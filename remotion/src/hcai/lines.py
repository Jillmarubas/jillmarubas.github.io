"""Parse SCRIPT.md into chapters of spoken lines, each with its [V]/[T]/[M] cues."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(D, 'SCRIPT.md')).read().split('# PRODUCTION NOTES')[0]
chapters, cur, pend = [], None, {'V': [], 'T': [], 'M': []}
for raw in src.splitlines():
    s = raw.strip()
    if s.startswith('## '):
        parts = s[3:].split(' — ')
        cur = {'key': parts[0], 'title': parts[1] if len(parts) > 2 else parts[0], 'lines': []}; chapters.append(cur); continue
    if cur is None or not s or s == '---': continue
    c = re.match(r'^\[(V|T|M)\]\s*(.*)', s)
    if c: pend[c.group(1)].append(c.group(2)); continue
    say = re.sub(r'\s*\[S\d+\]', '', s).replace('**', '').replace('*', '')
    cur['lines'].append({'say': say, **{k.lower(): v for k, v in pend.items() if v}})
    pend = {'V': [], 'T': [], 'M': []}
json.dump(chapters, open(os.path.join(D, 'lines.json'), 'w'), indent=1, ensure_ascii=False)
for ch in chapters:
    w = sum(len(l['say'].split()) for l in ch['lines'])
    print(ch['key'], ch['title'], len(ch['lines']), 'lines', w, 'words', sum(len(l['say']) for l in ch['lines']), 'chars')
