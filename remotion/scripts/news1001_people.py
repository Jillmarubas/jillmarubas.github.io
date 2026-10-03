"""Download licensed photos of every person named in the AI News 1 Oct script, with licence and author.
Slow on purpose (Wikimedia rate limits shared IPs)."""
import json, re, time, urllib.request, urllib.parse, os, sys, html
UA = {'User-Agent': 'Mozilla/5.0 (news-video-research)'}
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'news1001', 'people')
def fetch(url, tries=6):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:
            print('  retry', i, e, file=sys.stderr); time.sleep(20 * (i + 1))
    raise SystemExit('failed ' + url)
FILES = json.loads(sys.argv[1])  # {slug: commons file name}
meta = {}
mp = os.path.join(OUT, 'credits.json')
if os.path.exists(mp): meta = json.load(open(mp))
for slug, fname in FILES.items():
    if slug in meta: continue
    page = fetch('https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(fname)).decode('utf8', 'replace')
    time.sleep(8)
    lic = re.findall(r'class="licensetpl_short[^"]*"[^>]*>(.*?)<', page)
    author = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    orig = re.search(r'href="(https://upload\.wikimedia\.org/wikipedia/commons/[0-9a-f]/[0-9a-f]{2}/[^"]+)"[^>]*class="internal"', page) or \
           re.search(r'class="fullMedia".*?href="(https://upload\.wikimedia\.org/[^"]+)"', page, re.S)
    a = re.sub('<[^>]+>', '', author.group(1)).strip() if author else '?'
    a = html.unescape(' '.join(a.split()))[:120]
    url = html.unescape(orig.group(1)) if orig else None
    print(slug, '|', lic[:2], '|', a, '|', url)
    if url:
        ext = os.path.splitext(url)[1].lower()
        open(os.path.join(OUT, slug + ext), 'wb').write(fetch(url)); time.sleep(8)
    meta[slug] = {'file': fname, 'license': lic[0] if lic else '?', 'author': a, 'url': 'https://commons.wikimedia.org/wiki/File:' + fname.replace(' ', '_')}
    json.dump(meta, open(mp, 'w'), indent=1)
