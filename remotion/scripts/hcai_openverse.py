"""Second source: Openverse (Flickr and other CC collections) for every asset; up to 6 candidates each.
Writes out/hcai/cands/<id>.ov.json and thumbs <id>_o<k>.jpg. Anonymous limit: 20/min, 200/day."""
import json, os, sys, time, urllib.parse, urllib.request, random
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'out/hcai/cands')
UA = 'HiddenCostOfAI-documentary/1.0'
def get(url, binary=False, tries=6):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                d = r.read(); return d if binary else json.loads(d)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                ra = e.headers.get('retry-after') if e.headers else None
                print('429', ra, flush=True); time.sleep(float(ra) + 1 if ra and ra.replace('.', '').isdigit() else 30); continue
            if e.code in (404, 403, 410): return None
            time.sleep(3)
        except Exception: time.sleep(3)
    return None
assets = json.load(open(os.path.join(ROOT, 'src/hcai/assets.json')))
only = set(sys.argv[1:])
for a in assets:
    if a['type'] == 'l' or (only and a['id'] not in only): continue
    f = os.path.join(OUT, a['id'] + '.ov.json')
    if os.path.exists(f) and not only: continue
    q = urllib.parse.urlencode({'q': a['q'].replace(' isolated', ''), 'license': 'by,by-sa,cc0,pdm', 'page_size': 12, 'mature': 'false'})
    d = get('https://api.openverse.org/v1/images/?' + q)
    if d is None: print('FAIL', a['id'], flush=True); continue
    out = []
    for r in d.get('results', []):
        w, h = r.get('width') or 0, r.get('height') or 0
        if w and min(w, h) < 500: continue
        th = r['url'].replace('_b.jpg', '_n.jpg') if 'staticflickr' in r['url'] else r.get('thumbnail')
        out.append({'title': r['title'], 'w': w, 'h': h, 'url': r['url'], 'thumb': th, 'page': r.get('foreign_landing_url'),
                    'license': (r['license'].upper() + ' ' + (r.get('license_version') or '')).strip(), 'artist': r.get('creator') or '', 'source': r.get('source'), 'desc': ''})
        if len(out) >= 6: break
    for k, x in enumerate(out):
        tp = os.path.join(OUT, f"{a['id']}_o{k}.jpg")
        if x['thumb'] and not os.path.exists(tp):
            b = get(x['thumb'], binary=True)
            if b: open(tp, 'wb').write(b)
    json.dump({'asset': a, 'cands': out}, open(f, 'w'), indent=1)
    print(a['id'], len(out), flush=True)
    time.sleep(3.2)
