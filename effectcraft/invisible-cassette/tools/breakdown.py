#!/usr/bin/env python3
"""Per-scene production breakdown (the brief's "role"): for every shot, the PhotoCraft prep, the EffectCraft
composition (layer stack and Z, camera keys, on-screen keywords, easing) and the sound triggers, read from
the scene sources (s1.jsx … s10.jsx), DIRECTIVES.md, events.json and the cue lists the mix uses.

Usage: python3 -I tools/breakdown.py    (run from effectcraft/invisible-cassette) -> breakdown.html
"""
import html, json, os, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IC = os.path.join(HERE, "../../remotion/src/invisible-cassette")
WORDS = json.load(open(os.path.join(IC, "words.json")))
EVENTS = json.load(open(os.path.join(HERE, "events.json")))
TITLES = {1: "The crash no human could see", 2: "The autopsy of a phantom", 3: "The physics of the grid", 4: "Handing over the switch",
          5: "Inside the vector space", 6: "Specification gaming", 7: "Cross-sector velocity", 8: "The reality of the kill switch",
          9: "The modern paradox", 10: "The final sign-off"}
PHOTO = {"nyse": "Highsmith NYSE floor (LoC IIIF 4793 px)", "tva": "TVA generator room 1942 (LoC TIFF 9164 px)", "control": "HAER CA-3155 control room",
         "switchyard": "Highsmith Hoover switchyard", "switchboard": "HAER MT main control switchboard", "powerlines": "HAER Morony–Rainbow line",
         "skyline": "Highsmith Manhattan at dusk"}
norm = lambda w: re.sub(r"[^a-z0-9.$%]", "", w.lower())
esc = html.escape


def evaluator(scene, lead):
    ws = WORDS.get(str(scene), [])

    def at(phrase, after=None):
        p = [norm(x) for x in phrase.split()]
        a = 0 if after is None else max(0, after - lead)
        for i, w in enumerate(ws):
            if w["s"] < a: continue
            if all(i + k < len(ws) and norm(ws[i + k]["w"]).startswith(p[k]) for k in range(len(p))): return w["s"] + lead
        raise ValueError(phrase)
    return {"at": at, "vo": lambda t: t + lead, "F": 1 / 24, "W": 1920, "H": 1080, "Math": None}


# Evaluates our own shot-time expressions (vo(…), at("…"), S.x) from the repo scene files, with no builtins;
# the input is never external data.
def ev(expr, ns):
    e = expr.strip().replace("Math.max", "max").replace("Math.min", "min")
    try: return float(eval(e, {"__builtins__": {"max": max, "min": min}}, ns))
    except Exception: return None


def split_top(s):
    """Split on commas that are not inside brackets or quotes."""
    out, depth, cur, q = [], 0, "", None
    for ch in s:
        if q: cur += ch; q = None if ch == q else q; continue
        if ch in "\"'": q = ch
        elif ch in "([{": depth += 1
        elif ch in ")]}": depth -= 1
        if ch == "," and depth == 0: out.append(cur); cur = ""
        else: cur += ch
    return out + [cur]


def call_args(src, start):
    """Arguments of the call whose '(' is at src[start]."""
    depth, i = 0, start
    while i < len(src):
        if src[i] == "(": depth += 1
        elif src[i] == ")":
            depth -= 1
            if depth == 0: return split_top(src[start + 1:i])
        i += 1
    return []


def tc(t):
    return "—" if t is None else f"{int(t // 60):02d}:{t % 60:05.2f}"


def parse_scene(n):
    src = open(os.path.join(HERE, f"s{n}.jsx")).read()
    lead = 4.0 if n == 1 else 1.0
    ns = evaluator(n, lead)
    for m in re.finditer(r"^var (END|LEAD)\s*=\s*([^;]+);", src, re.M):
        v = ev(m.group(2), ns)
        if v is not None: ns[m.group(1)] = v
    for m in re.finditer(r"^var S = \{([^}]*)\}", src, re.M):  # scene 1's shot table
        S = {}
        for k, v in re.findall(r"(\w+):\s*([^,]+(?:\([^)]*\))?)", m.group(1)): S[k] = ev(v, ns)
        ns["S"] = type("S", (), S)
    for m in re.finditer(r"^var (\w+ = [^;]+);", src, re.M):
        for part in split_top(m.group(1)):
            k, _, e = part.partition("=")
            k = k.strip()
            if k and k not in ns:
                v = ev(e, ns)
                if v is not None: ns[k] = v
    for k in ("T_DOSSIER", "T_LAMP", "T_QUOTE", "T_CREDITS", "T_ENDSCREEN"):
        m = re.search(k + r" = ([\d.]+)", src)
        if m: ns[k] = float(m.group(1))
    shots = []
    blocks = re.split(r"\n(?=// [A-Z0-9]+[0-9]? ·|// [A-Z] ·|// [A-Z][0-9] ·)", src)
    for b in blocks:
        m = re.search(r'Shot\("([^"]+)"', b)
        if not m: continue
        args = call_args(b, b.index("(", m.start()))
        note = " ".join(l[3:] for l in b.splitlines() if l.startswith("// "))
        a, e = ev(args[1], ns), ev(args[2], ns)
        cam = re.search(r"cam\(o, \{([^}]*)\}", b)
        photos = re.findall(r'photoShot\(o, "(\w+)"', b)
        texts = re.findall(r'(?:word|label|tag|num)\(o, "([^"]+)"', b)
        kinds = [k for k, pat in [("slide", r"slideIn\(|doc\("), ("drop", r"dropIn\("), ("pin", r"pinCard\("), ("stamp", r"TERM\.red, size"),
                                  ("map", r"mapDraw\("), ("highlight", r"highlight\(|\bhl\("), ("globe", r"CC Sphere"), ("particles", r"particle")] if re.search(pat, b)]
        shots.append({"name": m.group(1), "a": a, "b": e, "note": note, "cam": cam.group(1) if cam else "", "photos": photos, "texts": texts,
                      "kinds": kinds, "red": "red: true" in b})
    return shots, ns.get("END")


def cam_desc(c):
    o = dict(re.findall(r"(\w+):\s*(-?[\d.]+|true|PHOTO_APERTURE)", c))
    parts = ["35 mm (zoom 1866.67), DOF on, focus locked to Z 0"]
    parts.append(("pull-back " if o.get("pull") else "push-in ") + (f"to ×{o['push']}" if "push" in o else "≈ 0.6 %/s") + " (clamped 0.4–0.75 %/s)")
    if "x0" in o or "x1" in o: parts.append(f"track X {o.get('x0', '0')} → {o.get('x1', '0')} px")
    if "y0" in o or "y1" in o: parts.append(f"track Y {o.get('y0', '0')} → {o.get('y1', '0')} px")
    parts.append(f"Dutch {o.get('d0', '±0.6')}° → {o.get('d1', '∓0.6')}° (|0.5–1.0|°, through level)")
    parts.append("aperture 60 + 12 px box blur on the near layer" if o.get("aperture") == "PHOTO_APERTURE" else "aperture 200 (≈ 15 px blur at Z −250)")
    return "; ".join(parts)


def cues_for(n):
    f = os.path.join(IC, "cues", f"s{n}.json")
    return json.load(open(f)) if os.path.exists(f) else {"cues": [], "rumble": [], "silence": [], "bassout": [], "shepard": []}


SFX_NAME = {"F1": "desk thump (stamp)", "F2": "binder drop", "F3": "paper slide", "F4": "paper slide", "F5": "dossier into folder", "F6": "highlighter",
            "F7": "pin", "F8": "pencil", "K1": "ticker clatter", "K2": "tape whip", "K3": "shutter", "K4": "relay click", "K5": "data chatter",
            "K6": "phone ring", "K7": "terminal", "K8": "lamp switch", "K9": "breaker", "T1": "sub swell", "T2": "chime", "T3": "impact",
            "T4": "particle dissolve", "T5": "glide", "T6": "dolly whoosh", "E1": "inverter hum", "E2": "machine hum", "E3": "wind on lines",
            "E4": "turbine hall", "E5": "shaft strain", "A1": "room tone", "A2": "trading floor", "A3": "server room", "A4": "control room",
            "A5": "port", "A6": "airfield", "A7": "switchyard wind", "A8": "city", "A9": "underground"}


def cue_label(x):
    b = os.path.basename(x["f"])
    if x["bus"] == "vo": return "voice"
    if x["bus"] == "music": return "music " + b.split(".")[0]
    fam = b[:2]
    return SFX_NAME.get(fam, b.split(".")[0]) + f" ({b.split('.')[0]})"


def scene_html(n):
    shots, end = parse_scene(n)
    cu = cues_for(n)
    dirs = [l for l in open(os.path.join(HERE, "DIRECTIVES.md")).read().splitlines() if l.startswith(f"| {n} |")]
    out = [f'<section class="scene" id="s{n}"><div class="eyebrow">Scene {n} · {tc(end)}</div><h2>{esc(TITLES[n])}</h2>']
    if dirs:
        out.append('<div class="box"><b>Production-file directives (as corrected)</b><ul>')
        for d in dirs:
            c = [x.strip() for x in d.strip("|").split("|")]
            out.append(f"<li><span class='k'>{esc(c[1])}</span> → {esc(c[2])}: {esc(c[3])}</li>")
        out.append("</ul></div>")
    turns = [e for e in EVENTS.get(str(n), []) if e[0] == "turn" and len(e) > 2 and e[2] == "cold"]
    if turns:
        out.append('<p class="muted">Story-turn package at ' + ", ".join(tc(e[1]) for e in turns) +
                   ': 0.3 s of silence on the music bed, a hard cut on the word, a 0.7 s bass drop-out, and the grade flips cold (Tint 22 %, white → #C7DBFF).</p>')
    for s in shots:
        a, b = s["a"], s["b"]
        cl = "shot down" if s["red"] else "shot"
        out.append(f'<article class="{cl}"><div class="head"><span class="tc">{tc(a)}–{tc(b)}</span><b>{esc(s["name"])}</b></div>')
        if s["note"]: out.append(f'<p class="line">{esc(s["note"])}</p>')
        if s["photos"]:
            for p in s["photos"]:
                lj = json.load(open(os.path.join(HERE, "assets/layers", p, "layers.json")))
                out.append(f'<p><b>PhotoCraft</b>: {esc(PHOTO.get(p, p))} → 2400 × 1350 crop; Depth Anything V2 masks; Refine Edge radius 2, feather 0.75 px → '
                           f'<span class="k">mid.png</span>{" + <span class=k>near.png</span>" if lj.get("near") else " (no foreground object: near layer empty)"}; '
                           'selection expanded 12 px, Content-Aware Fill → <span class="k">bg.png</span>; all three at the same canvas with alpha.</p>')
            out.append('<p><b>Layer stack</b>: Layer 2 foreground occlusion Z −250 (soft) · Layer 1 midground Z 0 (sharp) · Layer 0 filled plate Z +400; '
                       'scaled so they line up through the lens at frame 1; Tint into the amber palette; lower-third bar for keywords.</p>')
        else:
            extra = ", ".join(s["kinds"]) if s["kinds"] else "drawn shapes and type"
            out.append(f'<p><b>Layer stack</b>: terminal backdrop (grid + symbol columns, Z +350){" or a scene backdrop" if s["red"] is False else " (red variant)"} · {esc(extra)} at Z 0 · '
                       'smoke, grain 12 % (overlay), dust motes and an 18 % vignette on top (scene finish).</p>')
        if s["cam"] or True: out.append(f'<p><b>Camera</b>: {esc(cam_desc(s["cam"]))}</p>')
        if s["texts"]: out.append('<p><b>On screen</b>: ' + " · ".join(f'<span class="k">{esc(t)}</span>' for t in s["texts"]) + "</p>")
        snd = [x for x in cu["cues"] if a is not None and b is not None and a - 0.5 <= x["at"] < b and x["bus"] != "vo"]
        if snd: out.append('<p><b>Sound</b>: ' + "; ".join(f'{tc(x["at"])} {esc(cue_label(x))}' for x in sorted(snd, key=lambda x: x["at"])) + "</p>")
        out.append("</article>")
    beds = []
    for r in cu.get("rumble", []): beds.append(f"rumble {tc(r[0])}–{tc(r[1])} at {r[2]} dB")
    for r in cu.get("shepard", []): beds.append(f"Shepard tone + tick {tc(r[0])}–{tc(r[1])} (cut dead)")
    if beds: out.append('<p class="muted">Beds: ' + "; ".join(beds) + ".</p>")
    out.append("</section>")
    return "\n".join(out)


css = open(os.path.join(HERE, "breakdown-s1.html")).read()
css = css[css.index("<style>"):css.index("</style>") + 8]
css = css.replace("</style>", ".scene{display:flex;flex-direction:column;gap:12px;padding-top:12px;border-top:1px solid var(--line)}"
                  "nav{display:flex;flex-wrap:wrap;gap:8px}nav a{color:var(--amber);font-family:var(--fm);font-size:13px}</style>")
body = ['<title>Film Breakdown</title><meta name="claude:viewport-fit-sides" content="cover">',
        '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap">',
        css, '<div class="wrap"><header><div class="eyebrow">The Invisible Cassette · full film · v2</div><h1>Shot-by-shot breakdown</h1>',
        '<p class="muted">Every scene rebuilt to the production file\'s visual directives (as corrected by the fact-check), in the trading-terminal palette, 24 fps. '
        'For each shot: PhotoCraft prep, EffectCraft layer stack and Z, camera keys, on-screen keywords and the sound triggers.</p></header>',
        '<section class="box"><h2>Rules on every shot</h2><ul>'
        '<li>Photos: three layers from PhotoCraft (plate Z +400, subject Z 0, occlusion Z −250 with 15–20 px of depth-of-field blur).</li>'
        '<li>Camera: 35 mm; no static frames: a 4–6 % push per 8–10 s (or a pull-back where the directive asks) and a 0.5–1° Dutch drift through level; camera keys ease at 55 % influence, the Dutch at 50 %.</li>'
        '<li>Easing: documents slide in with ease-out cubic inertia (first key 80 % influence, last 0.1 %) plus paper friction; stamps and red badges slam 115 % → 100 % over 2 frames with a desk thump; folders drop with gravity and a 2-frame settle; highlighter wipes take 0.5 s.</li>'
        '<li>Finish: film grain 12 % overlay, vignette 18 %, smoke, floating dust motes; one palette; keywords and numbers only (audited by tools/text_audit.py).</li>'
        '<li>Sound: a constant 45 Hz rumble (with a 90 Hz layer for phones) under the film at −28 dB, swelling on tense stretches; every visual event carries its Foley on the frame.</li></ul></section>',
        '<nav>' + " ".join(f'<a href="#s{n}">{n}</a>' for n in range(1, 11)) + '</nav>']
for n in range(1, 11): body.append(scene_html(n))
body.append("</div>")
open(os.path.join(HERE, "breakdown.html"), "w").write("\n".join(body))
print("wrote breakdown.html")
