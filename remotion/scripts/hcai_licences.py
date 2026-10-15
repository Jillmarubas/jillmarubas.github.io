"""Re-read licences for Commons picks whose first licence tag was GFDL (usually dual-licensed) or unreadable.
Prefers public domain / CC0, then CC BY, then CC BY-SA. Prints any that are GFDL-only."""
import json, os, re, time, html, urllib.parse, urllib.request, random
ROOT = os.path.join(os.path.dirname(__file__), '..')
mf = os.path.join(ROOT, 'out/hcai/meta.json'); meta = json.load(open(mf))
UA = 'HiddenCostOfAI-documentary/1.0 (https://jillmarubas.github.io; research video)'
def page(u):
    for k in range(15):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60) as r: return r.read().decode('utf-8', 'replace')
        except Exception: time.sleep(3 + random.random() * 4)
    return ''
strip = lambda h: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h or ''))).strip()
rank = lambda l: 0 if re.search(r'public domain|CC0|PD', l, re.I) else 1 if re.search(r'CC BY \d', l) and 'SA' not in l else 2 if 'CC BY' in l else 3
for aid, m in meta.items():
    if m['source'] != 'Wikimedia Commons' or not ('GFDL' in m['license'] or m['license'] == 'see file page' or not m['author']): continue
    h = page(m['page'])
    lics = [strip(x) for x in re.findall(r'class="licensetpl_short"[^>]*>(.*?)</span>', h, re.S)]
    if not lics and re.search(r'public domain', h, re.I): lics = ['Public domain']
    if lics: m['license'] = sorted(lics, key=rank)[0]
    mm = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', h, re.S)
    if mm: m['author'] = re.sub(r'\s*\(talk.*?\)', '', strip(mm.group(1)))[:60]
    print(aid, '→', m['license'], '|', m['author'][:30], flush=True)
json.dump(meta, open(mf, 'w'), indent=1)
print('GFDL-only:', [k for k, v in meta.items() if 'GFDL' in v['license']])
