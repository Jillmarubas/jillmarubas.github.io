"""Download the chosen Commons photos at 2400 px into public/photos/ and write credits.json.
Edit `picks` (key -> Commons file title) for each episode. Run from the episode folder:
    python3 scripts/fetch.py"""
import json, re, time, urllib.parse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from commons import get
OUT = os.path.join(os.getcwd(), "public/photos")
os.makedirs(OUT, exist_ok=True)
picks = {
 "albanese": "File:Anthony Albanese-CHOGM 2024.jpg",
 "altman": "File:Sam Altman speaking at TED (cropped).jpg",
 "amodei": "File:Dario Amodei at TechCrunch Disrupt 2023 01.jpg",
 "whitehouse": "File:The White House June 2024.jpg",
 "whitehall": "File:Cabinet Office, 70 Whitehall, London.jpg",
 "westminster": "File:Palace of Westminster at dusk from Westminster Bridge.jpg",
 "canberra": "File:Parliament House at dusk, Canberra ACT.jpg",
 "newmexico": "File:Near the Doña Ana Mountains - Flickr - aspidoscelis.jpg",
 "bloom": "File:Bloom Energy Servers at eBay HQ.jpg",
 "pipeline": "File:Constructing natural gas pipe, Finland.jpg",
 "datacenter": "File:Cern datacenter.jpg",
 "oraclehq": "File:Oracle Headquarters Redwood Shores.jpg",
}
credits = {}
for key, title in picks.items():
    p = dict(action="query", format="json", titles=title, prop="imageinfo", iiprop="url|extmetadata", iiurlwidth=2400,
             iiextmetadatafilter="LicenseShortName|Artist")
    d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)))
    pg = list(d["query"]["pages"].values())[0]
    ii = pg["imageinfo"][0]; m = ii["extmetadata"]
    url = ii.get("thumburl") or ii["url"]
    open(f"{OUT}/{key}.jpg", "wb").write(get(url))
    credits[key] = dict(title=title[5:], artist=re.sub("<[^>]+>", "", m["Artist"]["value"]).strip(),
                        license=m["LicenseShortName"]["value"], source=ii["descriptionurl"])
    print(key, ii.get("thumbwidth"), ii.get("thumbheight"), credits[key]["license"], credits[key]["artist"])
    time.sleep(1.5)
json.dump(credits, open(f"{OUT}/credits.json", "w"), indent=2, ensure_ascii=False)
