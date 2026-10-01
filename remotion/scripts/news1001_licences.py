"""Read licence + author for each Commons file (page HTML, slow, retries) into credits.json."""
import html, json, re, sys, time, urllib.error, urllib.parse, urllib.request
UA = {'User-Agent': 'Mozilla/5.0 (news-video-research)'}
out, files = sys.argv[1], json.loads(sys.argv[2])
mp = f'{out}/credits.json'
try:
    meta = json.load(open(mp))
except Exception:
    meta = {}
for slug, (name, local) in files.items():
    name = name.replace(' ', '_')
    if meta.get(slug, {}).get('license', '?') not in ('?', 'PAGE-FAIL', ''):
        continue
    page = ''
    for i in range(10):
        try:
            page = urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(name), headers=UA), timeout=60).read().decode('utf8', 'replace').replace('&#95;', '_')
            break
        except Exception as e:
            time.sleep(10 + 10 * i)
    lic = re.findall(r'class="licensetpl_short[^"]*"[^>]*>(.*?)<', page)
    au = re.search(r'id="fileinfotpl_aut".*?</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    a = html.unescape(' '.join(re.sub('<[^>]+>', ' ', au.group(1)).split()))[:140] if au else '?'
    meta[slug] = {'file': name, 'license': lic[0].strip() if lic else ('?' if page else 'PAGE-FAIL'), 'author': a, 'local': local, 'page': 'https://commons.wikimedia.org/wiki/File:' + name}
    print(slug, meta[slug]['license'], '|', a, flush=True)
    json.dump(meta, open(mp, 'w'), indent=1)
    time.sleep(6)
