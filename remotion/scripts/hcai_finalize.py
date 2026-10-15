"""Download the picked images at full size, read their licences, cut out objects and people (rembg), and write
src/hcai/assets.gen.json (what the film loads) and src/hcai/ASSETS.md (credits)."""
import json, os, re, sys, io, html, time, random, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..')
CD = os.path.join(ROOT, 'out/hcai/cands'); RAW = os.path.join(ROOT, 'out/hcai/raw'); PUB = os.path.join(ROOT, 'public/hcai')
for d in (RAW, PUB + '/img', PUB + '/cut', PUB + '/logo'): os.makedirs(d, exist_ok=True)
UA = 'HiddenCostOfAI-documentary/1.0 (https://jillmarubas.github.io; research video)'
PEOPLE = {'musk': ('Elon Musk', 'Founder, xAI'), 'altman': ('Sam Altman', 'CEO, OpenAI'), 'nadella': ('Satya Nadella', 'CEO, Microsoft'), 'jevons': ('William Stanley Jevons', 'Economist, 1835–1882')}
def get(url, tries=10, page=False):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                d = r.read()
                if not page and d[:15].lstrip().lower().startswith((b'<!doctype', b'<html')): return None
                return d
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503): time.sleep(3 + random.random() * 4); continue
            if e.code in (400, 404, 403): return None
            time.sleep(2)
        except Exception: time.sleep(3)
    return None
strip = lambda h: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h or ''))).strip()
def commons_meta(title):
    h = get('https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')), page=True)
    h = h.decode('utf-8', 'replace') if h else ''
    lic = re.findall(r'class="licensetpl_short"[^>]*>(.*?)</span>', h, re.S)
    lic = strip(lic[0]) if lic else ('Public domain' if 'Public domain' in h or 'public domain' in h else 'see file page')
    m = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', h, re.S)
    author = strip(m.group(1)) if m else ''
    author = re.sub(r'\s*\(talk.*?\)', '', author).split('  ')[0][:60]
    return lic, author
def fetch(aid, pick, a):
    mode = None
    if ':' in pick: pick, mode = pick.split(':')
    kind = mode or a['type']
    if pick.startswith('o'):
        c = json.load(open(os.path.join(CD, aid + '.ov.json')))['cands'][int(pick[1:])]
        url, lic, author, src, page = c['url'], c['license'].replace('BY-SA', 'CC BY-SA').replace('BY ', 'CC BY ').replace('CC0', 'CC0'), c['artist'], (c.get('source') or 'Openverse').title(), c['page']
        if lic in ('BY', 'BY-SA'): lic = 'CC ' + lic
        data = get(url)
    else:
        c = json.load(open(os.path.join(CD, aid + '.json')))['cands'][int(pick)]
        lic, author = commons_meta(c['title'])
        src, page = 'Wikimedia Commons', 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(c['title'].replace(' ', '_'))
        th = c['thumb']
        data = None
        if a['type'] == 'l':
            for w in (1280, 960, 500):
                data = get(re.sub(r'/\d+px-', f'/{w}px-', th))
                if data: break
        else:
            want = 1920 if c['w'] > 1920 else None
            if want:
                for w in (1920, 1280, 960):
                    data = get(re.sub(r'/\d+px-', f'/{w}px-', th))
                    if data: break
            if not data:  # original file
                orig = re.sub(r'/thumb/(.+?)/\d+px-[^/]+$', r'/\1', th).replace('thumb.wikimedia.org', 'upload.wikimedia.org')
                data = get(orig)
            if not data:
                for w in (1280, 960, 500):
                    data = get(re.sub(r'/\d+px-', f'/{w}px-', th).replace('thumb.wikimedia.org', 'upload.wikimedia.org'))
                    if data: break
        url = th
    if not data: return aid, None
    open(os.path.join(RAW, aid), 'wb').write(data)
    return aid, {'kind': kind, 'license': lic, 'author': author, 'source': src, 'page': page}
picks = json.load(open(os.path.join(ROOT, 'out/hcai/picks.json')))
assets = {a['id']: a for a in json.load(open(os.path.join(ROOT, 'src/hcai/assets.json')))}
metaf = os.path.join(ROOT, 'out/hcai/meta.json')
meta = json.load(open(metaf)) if os.path.exists(metaf) else {}
only = set(sys.argv[1:])
todo = [(i, p) for i, p in picks.items() if i in assets and (i in only if only else (i not in meta or meta[i].get('pick') != p))]
with ThreadPoolExecutor(3) as ex:
    for aid, m in ex.map(lambda t: fetch(t[0], t[1], assets[t[0]]), todo):
        if m is None: print('FAIL download', aid, flush=True); continue
        m['pick'] = picks[aid]; meta[aid] = m; m.pop('done', None)
        print('got', aid, m['license'], '|', m['author'][:30], flush=True)
json.dump(meta, open(metaf, 'w'), indent=1)
# ---- process
from rembg import remove, new_session
sess = new_session('isnet-general-use')
gen = {}
for aid, m in meta.items():
    if aid not in assets: continue
    raw = os.path.join(RAW, aid)
    try:
        im = Image.open(raw); im.load()
    except Exception:
        print('BAD image', aid, flush=True); continue
    kind = m['kind']
    if kind == 'p':
        out = os.path.join(PUB, 'img', aid + '.jpg')
        if not m.get('done'):
            im = im.convert('RGB'); im.thumbnail((1920, 1920)); im.save(out, quality=86)
        src = f'hcai/img/{aid}.jpg'
    elif kind == 'l':
        out = os.path.join(PUB, 'logo', aid + '.png')
        if not m.get('done'):
            im = im.convert('RGBA'); bb = im.getbbox(); im = im.crop(bb) if bb else im; im.save(out)
        src = f'hcai/logo/{aid}.png'
    else:
        out = os.path.join(PUB, 'cut', aid + '.webp')
        if not m.get('done'):
            im = im.convert('RGB'); im.thumbnail((1600, 1600))
            cut = remove(im, session=sess)
            a = cut.split()[-1]
            cov = sum(1 for v in a.getdata() if v > 128) / (a.width * a.height)
            bb = a.point(lambda v: 255 if v > 24 else 0).getbbox()
            if bb:
                pad = int(0.02 * max(cut.size)); bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(cut.width, bb[2] + pad), min(cut.height, bb[3] + pad)); cut = cut.crop(bb)
            cut.thumbnail((1200, 1200)); cut.save(out, quality=88)
            m['coverage'] = round(cov, 3)
            print('cut', aid, m['coverage'], flush=True)
        src = f'hcai/cut/{aid}.webp'
    m['done'] = True
    w, h = Image.open(out).size
    credit = ' · '.join(x for x in [m['author'][:40], m['license'], m['source']] if x)
    if kind == 'l': credit = ''
    g = {'id': aid, 'type': kind, 'src': src, 'w': w, 'h': h, 'credit': credit}
    if aid in PEOPLE: g['name'], g['role'] = PEOPLE[aid]
    gen[aid] = g
json.dump(meta, open(metaf, 'w'), indent=1)
json.dump(gen, open(os.path.join(ROOT, 'src/hcai/assets.gen.json'), 'w'), indent=0, ensure_ascii=False)
rows = ['# The Hidden Cost of AI: image credits', '', 'Every image is used under its free licence (or public domain), cut out or cropped for the collage. Logos are shown for editorial reference only.', '',
        '| Asset | Author | Licence | Source |', '|---|---|---|---|']
for aid in sorted(meta):
    m = meta[aid]
    rows.append(f"| {aid} | {m['author'] or '—'} | {m['license']} | [{m['source']}]({m['page']}) |")
open(os.path.join(ROOT, 'src/hcai/ASSETS.md'), 'w').write('\n'.join(rows) + '\n')
print('assets', len(gen))
