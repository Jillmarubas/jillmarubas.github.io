"""Fetch Wikimedia Commons files as 1280px (or 500px) thumbnails, falling back to the original,
then read each file page for licence + author. Originals of big JPGs are often rate-limited (429).
Usage: news1003_commons.py <outdir> '{"slug": "File name.ext"}'"""
import hashlib, html, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (news-video-research; jillmarubas.github.io)'}


def fetch(url, tries=4):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code in (400, 404):
                return None
            time.sleep(8 * (i + 1))
        except Exception:
            time.sleep(8 * (i + 1))
    return None


out, files = sys.argv[1], json.loads(sys.argv[2])
os.makedirs(out, exist_ok=True)
mp = os.path.join(out, 'credits.json')
meta = json.load(open(mp)) if os.path.exists(mp) else {}
for slug, name in files.items():
    name = name.replace(' ', '_')
    if slug in meta and meta[slug].get('ok') and meta[slug].get('license') not in ('?', 'PAGE-FAIL'):
        continue
    h = hashlib.md5(name.encode()).hexdigest()
    q = urllib.parse.quote(name)
    ext = os.path.splitext(name)[1].lower()
    data = None
    if ext == '.svg':
        data = fetch(f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{q}')
    else:
        for w in (1280, 500):
            data = fetch(f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}', tries=2)
            if data:
                break
        if not data:
            data = fetch(f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{q}')
    time.sleep(2)
    if data:
        open(os.path.join(out, slug + ext), 'wb').write(data)
    page = (fetch('https://commons.wikimedia.org/wiki/File:' + q) or b'').decode('utf8', 'replace').replace('&#95;', '_')
    time.sleep(3)
    lic = re.findall(r'class="licensetpl_short[^"]*"[^>]*>(.*?)<', page)
    au = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    a = html.unescape(' '.join(re.sub('<[^>]+>', ' ', au.group(1)).split()))[:140] if au else '?'
    meta[slug] = {'file': name, 'license': (lic[0].strip() if lic else ('?' if page else 'PAGE-FAIL')), 'author': a,
                  'ok': bool(data), 'local': slug + ext, 'page': 'https://commons.wikimedia.org/wiki/File:' + name}
    print(slug, meta[slug]['ok'], len(data or b''), meta[slug]['license'], '|', a, flush=True)
    json.dump(meta, open(mp, 'w'), indent=1)
