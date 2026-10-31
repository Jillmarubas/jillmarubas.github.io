import json, html, re, sys
src_dir = sys.argv[1]; out_html = sys.argv[2]
d = json.load(open(f"{src_dir}/script.json"))
SRC = d["sources"]
E = html.escape
words = lambda t: len(re.findall(r"[A-Za-z0-9'’\-]+", t))

# ---------- SCRIPT.md (clean narration for the voiceover) ----------
md = [f"# {d['title']} — narration (fact-checked {d['checked']})", "",
      f"Voice: {d['voice']['name']} (`{d['voice']['voice_id']}`), `{d['voice']['model']}`.", ""]
for s in d["scenes"]:
    md.append(f"## Scene {s['id']}: {s['title']} ({s['time']})"); md.append("")
    if not s["paras"]: md.append("_No narration._"); md.append("")
    for p in s["paras"]: md += [p["t"], ""]
open(f"{src_dir}/SCRIPT.md", "w").write("\n".join(md))

# ---------- VERIFY.md ----------
def srcs(keys): return ", ".join(f"[{SRC[k]['label']}]({SRC[k]['url']})" for k in keys or [])
v = [f"# {d['title']} — fact check ({d['checked']})", "",
     "✅ confirmed by the sources listed · ⚠️ confirmed in secondary sources, check the primary document · ❌ original claim removed or corrected", "",
     "Primary sites (sec.gov, cftc.gov, wikipedia.org) were blocked in this session's network, so several checks rely on news coverage and papers that quote them.", ""]
for s in d["scenes"]:
    v.append(f"## Scene {s['id']}: {s['title']}"); v.append("")
    v.append("| Status | Narration | Note | Sources |"); v.append("|---|---|---|---|")
    for p in s["paras"]:
        if p["s"] == "keep" and not p.get("src"): continue
        st = "⚠️" if p.get("check") else "✅"
        note = (f"❌ was: “{p['was']}” — " if p.get("was") else ("New line. " if p["s"] == "new" else "")) + p.get("why", "")
        v.append(f"| {st} | {p['t'].replace('|','/')} | {note.replace('|','/')} | {srcs(p.get('src'))} |")
    for sc in s["screen"]:
        v.append(f"| 🖼 | On screen: {sc['now'].replace('|','/')} | was: {sc['was'].replace('|','/')} — {sc['why'].replace('|','/')} | {srcs(sc.get('src'))} |")
    v.append("")
open(f"{src_dir}/VERIFY.md", "w").write("\n".join(v))

# ---------- review page ----------
n_fix = sum(p["s"] == "fix" for s in d["scenes"] for p in s["paras"])
n_new = sum(p["s"] == "new" for s in d["scenes"] for p in s["paras"])
n_keep = sum(p["s"] == "keep" for s in d["scenes"] for p in s["paras"])
n_screen = sum(1 for s in d["scenes"] for sc in s["screen"] if not sc["now"].startswith("No change"))
n_check = sum(1 for s in d["scenes"] for p in s["paras"] if p.get("check"))
tot = sum(words(p["t"]) for s in d["scenes"] for p in s["paras"])

def srclinks(keys):
    if not keys: return ""
    return '<ul class="srcs">' + "".join(f'<li><a href="{E(SRC[k]["url"])}" target="_blank" rel="noopener">{E(SRC[k]["label"])}</a></li>' for k in keys) + "</ul>"

body = []
for s in d["scenes"]:
    body.append(f'<section id="s{s["id"]}"><div class="sechead"><span class="scn">Scene {s["id"]} · {E(s["time"])}</span><h2>{E(s["title"])}</h2></div>')
    if not s["paras"]: body.append('<p class="muted">No narration. Rumble and room tone only.</p>')
    for p in s["paras"]:
        if p["s"] == "keep":
            body.append(f'<p class="line keep">{E(p["t"])}</p>'); continue
        tag = "New line" if p["s"] == "new" else "Changed"
        chk = '<span class="tag check">Check source</span>' if p.get("check") else ""
        was = f'<p class="was"><span class="lbl">Was</span> {E(p["was"])}</p>' if p.get("was") else ""
        body.append(f'''<div class="line {p["s"]}"><div class="tags"><span class="tag">{tag}</span>{chk}</div>
<p class="now">{E(p["t"])}</p>
<details><summary>Why</summary>{was}<p class="why">{E(p.get("why",""))}</p>{srclinks(p.get("src"))}</details></div>''')
    if s["screen"]:
        body.append('<div class="screen"><h3>On screen</h3>')
        for sc in s["screen"]:
            nc = sc["now"].startswith("No change")
            body.append(f'''<div class="sc{' same' if nc else ''}"><p class="was"><span class="lbl">Was</span> {E(sc["was"])}</p>
<p class="now"><span class="lbl">{'Keep' if nc else 'Now'}</span> {E(sc["now"])}</p><p class="why">{E(sc["why"])}</p>{srclinks(sc.get("src"))}</div>''')
        body.append('</div>')
    body.append('</section>')

checks = "".join(f'<li><b>Scene {s["id"]}:</b> {E(p["t"][:90])}…</li>' for s in d["scenes"] for p in s["paras"] if p.get("check"))
nav = "".join(f'<a href="#s{s["id"]}">{s["id"]}</a>' for s in d["scenes"])

page = f'''<title>Invisible Cassette Fact Check</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Courier+Prime:wght@400;700&family=IBM+Plex+Sans+Condensed:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
/* Layout: one reading column; the script reads as a document, with each change set off as an annotated insert. */
:root{{--bg:#ECE3D2;--surface:#F6F0E4;--insert:#F3E7C4;--line:#CBBDA4;--fg:#16191F;--muted:#5F584C;--accent:#8F620E;--threat:#A93226;--ok:#3D6B4A;
--f-display:"Playfair Display",Georgia,serif;--f-body:"Source Serif 4",Georgia,serif;--f-mono:"Courier Prime","Courier New",monospace;--f-ui:"IBM Plex Sans Condensed","Arial Narrow",system-ui,sans-serif}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#0E1117;--surface:#151A23;--insert:#231F14;--line:#2B3342;--fg:#ECE4D4;--muted:#9AA2B0;--accent:#E5A93C;--threat:#E2584A;--ok:#6FB283;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#0E1117;--surface:#151A23;--insert:#231F14;--line:#2B3342;--fg:#ECE4D4;--muted:#9AA2B0;--accent:#E5A93C;--threat:#E2584A;--ok:#6FB283;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{background:var(--bg);color:var(--fg);font-family:var(--f-body);font-size:17px;line-height:1.6;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 64px}}
body::before{{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}}
.wrap{{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:28px}}
header{{display:flex;flex-direction:column;gap:12px;border-bottom:2px solid var(--fg);padding-bottom:18px}}
.eyebrow,.scn{{font-family:var(--f-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}}
h1{{font-family:var(--f-display);font-weight:800;font-size:clamp(30px,7vw,44px);line-height:1.05;margin:0;text-transform:uppercase;letter-spacing:.05em;text-wrap:balance}}
h2{{font-family:var(--f-display);font-size:23px;margin:0;text-transform:uppercase;letter-spacing:.05em;text-wrap:balance}}
h3{{font-family:var(--f-ui);font-size:14px;letter-spacing:.08em;text-transform:uppercase;margin:0;color:var(--muted)}}
.lede{{margin:0;color:var(--muted);font-family:var(--f-ui)}}
.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;font-family:var(--f-ui)}}
.stat{{background:var(--surface);border:1px solid var(--line);padding:10px 12px}}
.stat b{{display:block;font-family:var(--f-mono);font-size:24px;color:var(--fg);font-variant-numeric:tabular-nums}}
.stat span{{font-size:13px;color:var(--muted)}}
.box{{background:var(--surface);border:1px solid var(--line);padding:14px 16px;font-family:var(--f-ui);font-size:15px;display:flex;flex-direction:column;gap:8px}}
.box p,.box ul{{margin:0}} .box ul{{padding-left:18px;display:flex;flex-direction:column;gap:4px}}
nav{{display:flex;flex-wrap:wrap;gap:6px;position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg);padding-block:10px;z-index:5;border-bottom:1px solid var(--line);font-family:var(--f-mono)}}
nav span{{font-size:13px;color:var(--muted);align-self:center;margin-right:4px}}
nav a{{font-size:14px;color:var(--fg);text-decoration:none;border:1px solid var(--line);background:var(--surface);min-width:32px;text-align:center;padding:3px 6px}}
a:focus-visible,summary:focus-visible{{outline:2px solid var(--accent);outline-offset:2px}}
section{{display:flex;flex-direction:column;gap:12px;scroll-margin-top:64px}}
.sechead{{display:flex;flex-direction:column;gap:2px;border-top:1px solid var(--line);padding-top:16px}}
.line{{margin:0}} p.keep{{color:var(--fg)}}
div.line{{background:var(--insert);border-left:3px solid var(--accent);padding:10px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}}
div.line.new{{border-left-color:var(--ok)}}
.tags{{display:flex;gap:6px;flex-wrap:wrap}}
.tag{{font-family:var(--f-mono);font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);border:1px solid currentColor;padding:0 6px}}
div.line.new .tag:first-child{{color:var(--ok)}} .tag.check{{color:var(--threat)}}
.now{{margin:0}}
details{{font-family:var(--f-ui);font-size:15px}}
summary{{cursor:pointer;color:var(--muted);font-weight:600}}
details[open] summary{{margin-bottom:6px}}
.was{{margin:0 0 6px;color:var(--muted);text-decoration:line-through;text-decoration-color:var(--threat);text-decoration-thickness:1px}}
.was .lbl,.now .lbl{{text-decoration:none;display:inline-block;font-family:var(--f-mono);font-size:12px;text-transform:uppercase;color:var(--muted);margin-right:4px}}
.why{{margin:0 0 4px}}
.srcs{{margin:4px 0 0;padding-left:18px;font-size:14px}} .srcs a{{color:var(--accent);overflow-wrap:anywhere}}
.screen{{background:var(--surface);border:1px dashed var(--line);padding:12px 14px;display:flex;flex-direction:column;gap:12px;font-family:var(--f-ui);font-size:15px}}
.sc{{display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--line);padding-top:10px}}
.sc:first-of-type{{border-top:0;padding-top:0}}
.sc .now{{font-family:var(--f-mono);font-size:14px}} .sc.same .was{{text-decoration:none}}
.muted{{color:var(--muted);margin:0}}
</style>
<div class="wrap">
<header>
  <div class="eyebrow">Small Print · Script desk</div>
  <h1>The Invisible Cassette: fact check</h1>
  <p class="lede">The full narration, ready for Edmund. Highlighted lines changed. Tap <b>Why</b> to see the original line, the reason and the sources. Unhighlighted lines are your words, untouched.</p>
  <div class="stats">
    <div class="stat"><b>{n_fix}</b><span>lines corrected</span></div>
    <div class="stat"><b>{n_new}</b><span>lines added</span></div>
    <div class="stat"><b>{n_keep}</b><span>lines unchanged</span></div>
    <div class="stat"><b>{n_screen}</b><span>on-screen fixes</span></div>
    <div class="stat"><b>{tot:,}</b><span>words · about {tot/115:.0f} min with Edmund</span></div>
  </div>
</header>
<div class="box">
  <h3>The four biggest fixes</h3>
  <ul>
    <li>The IEEE quote card at 12:30 couldn't be found anywhere. It's replaced with a sourced card, and Scene 6 gets a real DeepMind quote.</li>
    <li>"Unexplainable" and "no single human": the regulators did explain the crash (one automated $4.1 billion sell order), and a trader later pleaded guilty to spoofing that day. That's now a "but" twist in Scene 2.</li>
    <li>The turbine claim was wrong. It's replaced with two real events: the 2016 South Australia blackout (frequency collapsed in under a second) and the Mohave shaft damage (1970–71).</li>
    <li>AI grid control is still mostly in testing, not deployed. The lines now say so, and RTE's real competition is named.</li>
  </ul>
</div>
<div class="box">
  <h3>Still to confirm in the original documents ({n_check})</h3>
  <p>This session can't open sec.gov, cftc.gov or Wikipedia, so these rest on news coverage and papers that quote the reports. The wording is safe to record, but I'll check the exact on-screen excerpts once those sites are allowed.</p>
  <ul>{checks}</ul>
</div>
<nav aria-label="Scenes"><span>Scene</span>{nav}</nav>
{''.join(body)}
</div>'''
open(out_html, "w").write(page)
print("fix", n_fix, "new", n_new, "keep", n_keep, "screen", n_screen, "check", n_check, "words", tot)
