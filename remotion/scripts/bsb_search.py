"""Search BigSoundBank (CC0 sounds) and print id | title | length | description.
Usage: python3 scripts/bsb_search.py rain "fog+horn" "church+bell"
Each result's id comes from its own link slug (".../gas-fog-horn-2-s1049.html"), so ids and titles always match.
Download: https://bigsoundbank.com/UPLOAD/mp3/<id>.mp3 (the mixers fetch these themselves)."""
import html, re, subprocess, sys

def search(q):
    t = subprocess.run(['curl', '-sS', '--max-time', '25', f'https://bigsoundbank.com/search?q={q}'], capture_output=True, text=True).stdout
    for m in re.finditer(r"<h2[^>]*><a href='/([^']+)-s(\d+)\.html'>(.*?)</a>(.*?)Length: (\d+:\d+)", t, re.S):
        _, i, title, rest, ln = m.groups()
        desc = re.sub('<[^>]+>', '', rest.split('<div>')[-1]) if '<div>' in rest else ''
        yield i, html.unescape(re.sub('<[^>]+>', '', title)), ln, re.sub(r'\s+', ' ', html.unescape(desc)).strip()[:110]

for q in sys.argv[1:]:
    print('==', q)
    for r in search(q):
        print(*r, sep=' | ')
