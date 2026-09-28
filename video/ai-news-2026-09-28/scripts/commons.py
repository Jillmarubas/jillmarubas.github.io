"""Search Wikimedia Commons for real photos (with retries for HTTP 429).
    python3 scripts/commons.py "Anthony Albanese" "White House north facade" """
import json, re, sys, time, urllib.request, urllib.parse
UA = "AINewsDailyVideo/1.0 (jillmar.automation@gmail.com) python-urllib"
def get(url, tries=6):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=40).read()
        except Exception as e:
            time.sleep(3 * (i + 1))
    raise SystemExit("failed " + url)
def search(q, n=10):
    p = dict(action="query", format="json", generator="search", gsrsearch=q + " filetype:bitmap",
             gsrnamespace=6, gsrlimit=n, prop="imageinfo", iiprop="url|size|extmetadata",
             iiextmetadatafilter="LicenseShortName|Artist|ImageDescription|DateTimeOriginal")
    d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)))
    out = []
    for pg in d.get("query", {}).get("pages", {}).values():
        ii = pg["imageinfo"][0]; m = ii.get("extmetadata", {})
        strip = lambda k: re.sub("<[^>]+>", "", m.get(k, {}).get("value", "")).strip()
        out.append(dict(title=pg["title"], w=ii["width"], h=ii["height"], url=ii["url"],
                        lic=strip("LicenseShortName"), artist=strip("Artist")[:60], date=strip("DateTimeOriginal")[:20]))
    return out
if __name__ == "__main__":
    for q in sys.argv[1:]:
        print("==", q)
        for r in search(q):
            print(f"  {r['title'][:75]} | {r['w']}x{r['h']} | {r['lic']} | {r['artist']} | {r['date']}")
        time.sleep(2)
