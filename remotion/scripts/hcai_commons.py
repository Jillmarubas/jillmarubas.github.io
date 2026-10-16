"""Search Wikimedia Commons (HTML Special:Search, which isn't throttled like the API on this shared IP) for every
asset in src/hcai/assets.json; keep up to 8 candidates each, with 250px thumbs for contact sheets.
Writes out/hcai/cands/<id>.json and out/hcai/cands/<id>_<k>.jpg. Licences are read later, for picked files only."""
import json, os, re, sys, time, html, urllib.parse, urllib.request, random
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'out/hcai/cands'); os.makedirs(OUT, exist_ok=True)
UA = 'HiddenCostOfAI-documentary/1.0 (https://jillmarubas.github.io; research video)'
def get(url, tries=12):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503, 502): time.sleep(3 + random.random() * 4); continue
            if e.code == 404: return None
            time.sleep(2)
        except Exception: time.sleep(3)
    return None
ITEM = re.compile(r'<li class="mw-search-result mw-search-result-ns-6">.*?href="/wiki/(File:[^"]+)".*?<img[^>]*src="([^"]+)"[^>]*data-file-width="(\d+)" data-file-height="(\d+)"', re.S)
def search(q, kind, n=8):
    ft = 'filetype:drawing' if kind == 'l' else 'filetype:bitmap'
    url = 'https://commons.wikimedia.org/w/index.php?' + urllib.parse.urlencode({'search': f'{ft} {q}', 'title': 'Special:Search', 'ns6': 1, 'fulltext': 1, 'limit': 40, 'profile': 'images'})
    h = get(url)
    if h is None: raise RuntimeError('search failed')
    out = []
    for title, th, w, hh in ITEM.findall(h.decode('utf-8', 'replace')):
        w, hh = int(w), int(hh)
        if kind != 'l' and min(w, hh) < 500: continue
        if kind == 'p' and w < 900: continue
        out.append({'title': urllib.parse.unquote(html.unescape(title)), 'w': w, 'h': hh, 'thumb': html.unescape(th).split('?')[0]})
        if len(out) >= n: break
    return out
def work(a):
    f = os.path.join(OUT, a['id'] + '.json')
    try:
        c = search(a['q'], a['type'])
    except Exception as e:
        return f"FAIL {a['id']} {e}"
    for k, x in enumerate(c):
        tp = os.path.join(OUT, f"{a['id']}_{k}.jpg")
        if not os.path.exists(tp):
            b = get(x['thumb'])
            if b: open(tp, 'wb').write(b)
    json.dump({'asset': a, 'cands': c}, open(f, 'w'), indent=1)
    return f"{a['id']} {len(c)}"
assets = json.load(open(os.path.join(ROOT, 'src/hcai/assets.json')))
only = set(sys.argv[1:])
todo = [a for a in assets if a['id'] in only] if only else [a for a in assets if not os.path.exists(os.path.join(OUT, a['id'] + '.json'))]
with ThreadPoolExecutor(3) as ex:
    for r in ex.map(work, todo): print(r, flush=True)
