"""Download the chosen Commons photos at 1920 px (a standard Commons thumbnail size; originals and odd sizes get HTTP 429/400) into public/photos/ and write credits.json.
Edit `picks` (key -> Commons file title) for each episode. Run from the episode folder:
    python3 scripts/fetch.py"""
import json, re, time, urllib.parse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from commons import get
OUT = os.path.join(os.getcwd(), "public/photos")
os.makedirs(OUT, exist_ok=True)
picks = {
 "datacenter": "File:Cern datacenter.jpg",
 "unsc": "File:United Nations Headquarters - Security Council chamber, angled view (cropped).jpg",
 "altman": "File:Sam Altman speaking at TED (cropped).jpg",
 "amodei": "File:Dario Amodei at TechCrunch Disrupt 2023 01.jpg",
 "trumpxi2": "File:Welcome ceremony of Trump by Xi Jinping (2)-20260514.jpg",
 "whitehouse": "File:The White House June 2024.jpg",
}
credits = {}
for key, title in picks.items():
    p = dict(action="query", format="json", titles=title, prop="imageinfo", iiprop="url|extmetadata", iiurlwidth=1920,
             iiextmetadatafilter="LicenseShortName|Artist")
    d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)))
    pg = list(d["query"]["pages"].values())[0]
    ii = pg["imageinfo"][0]; m = ii["extmetadata"]
    url = (ii.get("thumburl") or ii["url"]).split("?")[0]  # tracking params can make the CDN refuse
    if not os.path.exists(f"{OUT}/{key}.jpg"):  # re-runs only fetch what is missing
        open(f"{OUT}/{key}.jpg", "wb").write(get(url))
    credits[key] = dict(title=title[5:], artist=re.sub("<[^>]+>", "", m["Artist"]["value"]).strip(),
                        license=m["LicenseShortName"]["value"], source=ii["descriptionurl"])
    print(key, ii.get("thumbwidth"), ii.get("thumbheight"), credits[key]["license"], credits[key]["artist"])
    time.sleep(3)
json.dump(credits, open(f"{OUT}/credits.json", "w"), indent=2, ensure_ascii=False)
