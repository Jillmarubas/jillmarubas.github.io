#!/usr/bin/env python3
"""Build the review room page (index.html) next to the parts from review_parts.py.

    python3 review_page.py OUTDIR META.json

META.json: {"title": "The $20 Lie", "fps": [24000, 1001],
            "chapters": [{"id": "ch1", "label": "1 · The $20 Bet",
                          "lines": [{"t0": 12.3, "t1": 18.9, "scene": "1.1", "text": "..."}]}]}
Chapter ids must match the part names in OUTDIR/parts.json. Line times are seconds inside the
chapter. The page plays each chapter at phone size with a frame-accurate film timecode
(HH:MM:SS:FF, non-drop), the scene and narration line under the playhead, a scene timeline with
note pins, and a notes list stored in the artifact's `db` (collection "notes"), which Claude
reads back, answers and marks Fixed. Publish index.html with capabilities {db: {}, user:
{scopes: ["profile"]}} and the part files alongside it.
"""
import json, os, sys

out, meta_path = sys.argv[1], sys.argv[2]
parts = json.load(open(os.path.join(out, "parts.json")))
meta = json.load(open(meta_path))
off, chapters = 0.0, []
for c in meta["chapters"]:
    p = parts[c["id"]]
    chapters.append({"id": c["id"], "label": c["label"], "offset": round(off, 4), "duration": p["duration"],
                     "parts": [{"file": q["file"], "start": q["start"], "duration": q["duration"]} for q in p["parts"]],
                     "lines": c["lines"]})
    off += p["duration"]
data = {"title": meta["title"], "fps": meta.get("fps", [24000, 1001]), "chapters": chapters}

HTML = r"""<title>__NAME__</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
/* Layout: one column, thermal-receipt styling. Player on top, readout strip, timeline, notes. */
:root {
  --paper: #efe9df; --sheet: #fbf8f2; --ink: #1d1a17; --muted: #6f675d; --rule: #d6cdbf;
  --red: #c41f1a; --red-soft: #f3dcd8; --ok: #2f6b45; --ok-soft: #dcebdf; --stage: #0f0e0d;
  --display: "Fraunces", Georgia, "Times New Roman", serif;
  --body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #171513; --sheet: #211e1b; --ink: #f1ebe2; --muted: #a59b8e; --rule: #3a352f;
  --red: #ef5a4e; --red-soft: #3d1f1c; --ok: #7cc293; --ok-soft: #1d3325; --stage: #000; color-scheme: dark } }
:root[data-theme="dark"] {
  --paper: #171513; --sheet: #211e1b; --ink: #f1ebe2; --muted: #a59b8e; --rule: #3a352f;
  --red: #ef5a4e; --red-soft: #3d1f1c; --ok: #7cc293; --ok-soft: #1d3325; --stage: #000; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--paper); color: var(--ink); font: 15px/1.5 var(--body); }
.wrap { max-width: 980px; margin: 0 auto; padding-block: 20px 48px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: grid; gap: 16px; }
header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px }
h1 { font: 900 clamp(26px, 6vw, 38px)/1.05 var(--display); margin: 0; letter-spacing: -0.01em; text-wrap: balance }
.eyebrow { font: 500 12px/1.2 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted) }
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin }
.chip { flex: 0 0 auto; border: 1px solid var(--rule); background: var(--sheet); color: var(--ink); border-radius: 999px;
  padding: 7px 12px; font: 500 13px/1 var(--mono); cursor: pointer; display: inline-flex; gap: 8px; align-items: center }
.chip[aria-pressed="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink) }
.chip .n { font-size: 11px; padding: 2px 6px; border-radius: 999px; background: var(--red); color: #fff }
.chip .n[hidden] { display: none }
.stage { background: var(--stage); border-radius: 6px; overflow: hidden; aspect-ratio: 16 / 9; max-width: 100% }
video { display: block; width: 100%; height: 100%; background: var(--stage) }
.readout { background: var(--sheet); border: 1px dashed var(--rule); border-radius: 6px; padding: 12px 14px; display: grid; gap: 8px }
.tcrow { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px }
.tc { font: 600 clamp(24px, 7vw, 34px)/1 var(--mono); font-variant-numeric: tabular-nums; letter-spacing: .02em }
.meta { font: 500 12px/1.3 var(--mono); color: var(--muted); letter-spacing: .06em; text-transform: uppercase }
.line { margin: 0; color: var(--ink); min-height: 3em }
.controls { display: flex; flex-wrap: wrap; gap: 8px }
button.b { font: 500 14px/1 var(--mono); border: 1px solid var(--rule); background: var(--sheet); color: var(--ink);
  border-radius: 6px; padding: 10px 12px; cursor: pointer; min-height: 40px }
button.b.primary { background: var(--red); border-color: var(--red); color: #fff }
button.b:disabled { opacity: .5; cursor: default }
button:focus-visible, textarea:focus-visible, .timeline:focus-visible { outline: 2px solid var(--red); outline-offset: 2px }
.timeline { position: relative; height: 54px; background: var(--sheet); border: 1px solid var(--rule); border-radius: 6px; cursor: pointer; overflow: hidden; touch-action: none }
.scene { position: absolute; top: 0; bottom: 18px; border-right: 1px solid var(--rule); font: 500 10px/1 var(--mono);
  color: var(--muted); padding: 5px 3px; overflow: hidden; white-space: nowrap }
.scene.on { background: var(--red-soft); color: var(--ink) }
.pin { position: absolute; bottom: 3px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--red); border: 2px solid var(--sheet) }
.pin.fixed { background: var(--ok) }
.head { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--ink); margin-left: -1px; pointer-events: none }
.compose { display: grid; gap: 8px; background: var(--sheet); border: 1px solid var(--rule); border-radius: 6px; padding: 12px 14px }
.compose label { font: 500 12px/1.3 var(--mono); color: var(--muted); letter-spacing: .06em; text-transform: uppercase }
textarea { width: 100%; min-height: 72px; resize: vertical; font: 15px/1.45 var(--body); color: var(--ink);
  background: var(--paper); border: 1px solid var(--rule); border-radius: 6px; padding: 10px }
.status { font: 13px/1.4 var(--mono); color: var(--muted); min-height: 1.4em }
h2 { font: 700 20px/1.2 var(--display); margin: 8px 0 0 }
.notes { display: grid; gap: 10px; list-style: none; margin: 0; padding: 0 }
.note { background: var(--sheet); border: 1px solid var(--rule); border-left: 4px solid var(--red); border-radius: 6px; padding: 10px 12px; display: grid; gap: 6px; min-width: 0 }
.note.fixed { border-left-color: var(--ok) }
.note .top { display: flex; flex-wrap: wrap; gap: 8px; align-items: center }
.note .jump { font: 600 13px/1 var(--mono); background: none; border: 1px solid var(--rule); border-radius: 4px; padding: 5px 7px; color: var(--ink); cursor: pointer; font-variant-numeric: tabular-nums }
.pill { font: 600 11px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; padding: 4px 7px; border-radius: 999px; background: var(--red-soft); color: var(--red) }
.pill.fixed { background: var(--ok-soft); color: var(--ok) }
.note .who { font: 12px/1.3 var(--mono); color: var(--muted) }
.note p { margin: 0; overflow-wrap: anywhere }
.reply { font-size: 14px; color: var(--muted); border-top: 1px dashed var(--rule); padding-top: 6px }
.empty { color: var(--muted); font-size: 14px; margin: 0 }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto } }
</style>
<div class="wrap">
  <header>
    <h1 id="ttl"></h1>
    <span class="eyebrow">Review room · tap a moment, leave a note</span>
  </header>
  <nav class="chips" id="chips" aria-label="Chapters"></nav>
  <div class="stage"><video id="v" playsinline controls preload="metadata"></video></div>
  <section class="readout" aria-live="polite">
    <div class="tcrow"><span class="tc" id="tc">00:00:00:00</span><span class="meta" id="where"></span></div>
    <p class="line" id="line"></p>
    <div class="controls">
      <button class="b" id="back" type="button" aria-label="Back one frame">−1 frame</button>
      <button class="b" id="play" type="button">Play</button>
      <button class="b" id="fwd" type="button" aria-label="Forward one frame">+1 frame</button>
      <button class="b primary" id="mark" type="button">Note this frame</button>
    </div>
  </section>
  <div class="timeline" id="tl" tabindex="0" role="slider" aria-label="Chapter timeline" aria-valuemin="0"></div>
  <form class="compose" id="form">
    <label for="txt" id="txtLabel">Note at 00:00:00:00</label>
    <textarea id="txt" placeholder="What should change at this moment? e.g. “text too small on a phone”"></textarea>
    <div class="controls"><button class="b primary" id="save" type="submit">Save note</button></div>
    <div class="status" id="status"></div>
  </form>
  <h2 id="notesTitle">Notes</h2>
  <ul class="notes" id="notes"></ul>
</div>
<script>
const DATA = __DATA__;
const FPS_N = DATA.fps[0], FPS_D = DATA.fps[1], FRAME = FPS_D / FPS_N, NOM = Math.round(FPS_N / FPS_D);
const $ = (id) => document.getElementById(id);
const v = $("v");
let ci = 0, pi = 0, notes = [], db = null, user = null, canWrite = true, markT = 0, profs = {};
$("ttl").textContent = DATA.title;

function frameOf(t) { return Math.floor(t / FRAME + 1e-4); }
function tcOf(t) {
  const f = frameOf(t), ff = f % NOM, s = Math.floor(f / NOM);
  const p = (n) => String(n).padStart(2, "0");
  return p(Math.floor(s / 3600)) + ":" + p(Math.floor(s / 60) % 60) + ":" + p(s % 60) + ":" + p(ff);
}
const ch = () => DATA.chapters[ci];
function localT() { return ch().parts[pi].start + (v.currentTime || 0); }
function lineAt(t) { return ch().lines.find((l) => t >= l.t0 && t < l.t1) || null; }

function renderChips() {
  const box = $("chips"); box.textContent = "";
  DATA.chapters.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", String(i === ci));
    const s = document.createElement("span"); s.textContent = c.label; b.appendChild(s);
    const n = document.createElement("span"); n.className = "n";
    const open = notes.filter((x) => x.chapter === c.id && x.status !== "fixed").length;
    n.textContent = open; n.hidden = !open; b.appendChild(n);
    b.onclick = () => openChapter(i, 0);
    box.appendChild(b);
  });
}
function openChapter(i, t) {
  ci = i; renderChips(); renderTimeline(); renderNotes();
  seekLocal(t || 0, false);
}
function seekLocal(t, play) {
  const c = ch(); t = Math.max(0, Math.min(t, c.duration - FRAME));
  let k = c.parts.findIndex((p) => t >= p.start && t < p.start + p.duration); if (k < 0) k = c.parts.length - 1;
  const at = t - c.parts[k].start + FRAME / 2;   // aim at the middle of the frame
  if (k !== pi || !v.src.endsWith(c.parts[k].file)) {
    pi = k; v.src = c.parts[k].file;
    v.addEventListener("loadedmetadata", () => { v.currentTime = at; if (play) v.play(); update(); }, {once: true});
  } else { v.currentTime = at; if (play) v.play(); }
  update();
}
v.addEventListener("ended", () => { const c = ch(); if (pi + 1 < c.parts.length) seekLocal(c.parts[pi + 1].start, true); });

function update() {
  const c = ch(), t = localT(), l = lineAt(t);
  $("tc").textContent = tcOf(c.offset + t);
  $("where").textContent = c.label + (l ? " · scene " + l.scene : " · music");
  $("line").textContent = l ? l.text : "(music only)";
  $("play").textContent = v.paused ? "Play" : "Pause";
  const tl = $("tl"); tl.setAttribute("aria-valuemax", c.duration.toFixed(1)); tl.setAttribute("aria-valuenow", t.toFixed(1));
  const h = tl.querySelector(".head"); if (h) h.style.left = (t / c.duration * 100) + "%";
  tl.querySelectorAll(".scene").forEach((s) => s.classList.toggle("on", l && s.dataset.scene === l.scene));
  if (document.activeElement !== $("txt") && !$("txt").value) { markT = t; $("txtLabel").textContent = "Note at " + tcOf(c.offset + t); }
}
const tick = () => { update(); if ("requestVideoFrameCallback" in v) v.requestVideoFrameCallback(tick); };
if ("requestVideoFrameCallback" in v) v.requestVideoFrameCallback(tick); else setInterval(update, 1000 / 24);
["timeupdate", "seeked", "play", "pause"].forEach((e) => v.addEventListener(e, update));

$("play").onclick = () => (v.paused ? v.play() : v.pause());
$("back").onclick = () => { v.pause(); seekLocal(localT() - FRAME, false); };
$("fwd").onclick = () => { v.pause(); seekLocal(localT() + FRAME, false); };
$("mark").onclick = () => { v.pause(); markT = localT(); $("txtLabel").textContent = "Note at " + tcOf(ch().offset + markT); $("txt").focus(); };

function renderTimeline() {
  const c = ch(), tl = $("tl"); tl.textContent = "";
  c.lines.forEach((l) => {
    const d = document.createElement("div"); d.className = "scene"; d.dataset.scene = l.scene;
    d.style.left = (l.t0 / c.duration * 100) + "%"; d.style.width = ((l.t1 - l.t0) / c.duration * 100) + "%";
    d.textContent = l.scene; d.title = l.text; tl.appendChild(d);
  });
  notes.filter((n) => n.chapter === c.id).forEach((n) => {
    const p = document.createElement("div"); p.className = "pin" + (n.status === "fixed" ? " fixed" : "");
    p.style.left = (n.t / c.duration * 100) + "%"; tl.appendChild(p);
  });
  const h = document.createElement("div"); h.className = "head"; tl.appendChild(h);
  update();
}
function seekFromEvent(e) { const r = $("tl").getBoundingClientRect(); seekLocal((e.clientX - r.left) / r.width * ch().duration, false); }
$("tl").addEventListener("pointerdown", (e) => { v.pause(); seekFromEvent(e); $("tl").setPointerCapture(e.pointerId); });
$("tl").addEventListener("pointermove", (e) => { if (e.buttons) seekFromEvent(e); });
$("tl").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { e.preventDefault(); seekLocal(localT() + (e.shiftKey ? 1 : FRAME), false); }
  if (e.key === "ArrowLeft") { e.preventDefault(); seekLocal(localT() - (e.shiftKey ? 1 : FRAME), false); }
});

async function renderNotes() {
  const c = ch(), list = $("notes"), mine = notes.filter((n) => n.chapter === c.id).sort((a, b) => a.t - b.t);
  $("notesTitle").textContent = "Notes · " + c.label;
  const ids = [...new Set(mine.map((n) => n.by).filter(Boolean))];
  if (user && ids.length) profs = await user.profiles(ids);
  list.textContent = "";
  if (!mine.length) { const p = document.createElement("p"); p.className = "empty"; p.textContent = db ? "No notes on this chapter yet. Pause on a moment and tap “Note this frame”." : "Notes appear here once the page connects."; list.appendChild(p); return; }
  mine.forEach((n) => {
    const li = document.createElement("li"); li.className = "note" + (n.status === "fixed" ? " fixed" : "");
    const top = document.createElement("div"); top.className = "top";
    const j = document.createElement("button"); j.type = "button"; j.className = "jump"; j.textContent = tcOf(c.offset + n.t);
    j.onclick = () => { v.pause(); seekLocal(n.t, false); window.scrollTo({top: 0, behavior: "smooth"}); };
    const pill = document.createElement("span"); pill.className = "pill" + (n.status === "fixed" ? " fixed" : ""); pill.textContent = n.status === "fixed" ? "Fixed" : "Open";
    const who = document.createElement("span"); who.className = "who"; who.textContent = (profs[n.by] && profs[n.by].name) || "Reviewer";
    top.append(j, pill, who);
    const p = document.createElement("p"); p.textContent = n.text;
    li.append(top, p);
    if (n.reply) { const r = document.createElement("p"); r.className = "reply"; r.textContent = "Claude: " + n.reply; li.appendChild(r); }
    list.appendChild(li);
  });
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("txt").value.trim(), st = $("status");
  if (!text) { st.textContent = "Write the note first."; return; }
  if (!db) { st.textContent = "Notes can't be saved in this view. Open the page in the Claude app while signed in."; return; }
  const c = ch(), id = (user && await user.id()) || null;
  $("save").disabled = true; st.textContent = "Saving…";
  try {
    await db.collection("notes").add({chapter: c.id, t: Math.round(markT * 1000) / 1000, frame: frameOf(c.offset + markT),
      tc: tcOf(c.offset + markT), text, by: id, at: new Date().toISOString(), status: "open", reply: ""});
    $("txt").value = ""; st.textContent = "Saved. Claude will fix it and mark it Fixed.";
  } catch (err) {
    st.textContent = err && err.code === "invalid_argument" ? "You can view this page but not add notes. Ask the owner for Contributor access." : "Couldn't save the note. Try again in a moment.";
  } finally { $("save").disabled = false; update(); }
});

renderChips(); openChapter(0, 0);
(async () => {
  const c = window.claude;
  if (!c || !c.use) { renderNotes(); return; }
  user = await c.use("user");
  db = await c.use("db");
  if (!db) { $("status").textContent = "Notes are read-only here: this view can't reach the notes store."; renderNotes(); return; }
  if (user) { const w = await user.can("data.write"); if (w === false) { canWrite = false; $("save").disabled = true; $("status").textContent = "You can read notes but not add them."; } }
  db.collection("notes").onSnapshot((snap) => {
    notes = snap.docs.map((d) => Object.assign({id: d.id}, d.data()));
    renderChips(); renderTimeline(); renderNotes();
  }, () => { $("status").textContent = "Lost the connection to the notes. Reload the page."; });
})();
</script>
"""
name = meta.get("page_title") or (meta["title"] + " Review Room")
html = HTML.replace("__NAME__", name).replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
open(os.path.join(out, "index.html"), "w").write(html)
print("wrote", os.path.join(out, "index.html"), f"{len(html) / 1024:.0f} KB")
