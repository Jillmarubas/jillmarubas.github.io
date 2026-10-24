#!/usr/bin/env python3
"""Writes the review room page (index.html) for a folder made by review_parts.py.

    python3 scripts/review_page.py <review_dir> [--title "Falcon 9 Review Room"] [--film "How SpaceX ..."] [--cut 1]

The page plays each part with a frame-accurate timecode (HH:MM:SS:FF, film time), shows the shot and the
narration line playing, a timeline with shot blocks and note pins, and lets viewers pin notes to the exact
frame. Notes live in the artifact's database (collection "notes": part, frame, text, author, created,
status "open" | "fixed", reply), so Claude can read them, reply and mark them Fixed.
Publish index.html with capabilities {db: {}, user: {scopes: ["profile"]}} and the parts/ files.
"""
import argparse, json, pathlib

ap = argparse.ArgumentParser()
ap.add_argument('dir')
ap.add_argument('--title', default='Review Room')
ap.add_argument('--film', default='')
ap.add_argument('--cut', default='1')
args = ap.parse_args()
d = pathlib.Path(args.dir)
manifest = json.load(open(d / 'manifest.json'))
manifest['film'] = args.film
manifest['cut'] = args.cut

PAGE = r'''<title>__TITLE__</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>
/* Layout: one column at phone width; player on top, timeline under it, notes below. The timecode is the hero. */
:root {
  --bg: #f3f4f6; --panel: #ffffff; --ink: #16181c; --muted: #5b616b; --line: #dde0e5;
  --accent: #ff5a14; --accent-ink: #ffffff; --shot-a: #e6e9ee; --shot-b: #d5dae2; --fixed: #1f8f55; --open: #c2410c;
  --sans: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #121418; --panel: #1b1e23; --ink: #eef0f3; --muted: #9aa1ab; --line: #2c3038;
  --accent: #ff7a3d; --accent-ink: #16181c; --shot-a: #262a31; --shot-b: #323843; --fixed: #4cc38a; --open: #ff9a62; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #121418; --panel: #1b1e23; --ink: #eef0f3; --muted: #9aa1ab; --line: #2c3038;
  --accent: #ff7a3d; --accent-ink: #16181c; --shot-a: #262a31; --shot-b: #323843; --fixed: #4cc38a; --open: #ff9a62; color-scheme: dark }
body { background: var(--bg); color: var(--ink); font: 15px/1.45 var(--sans); }
.wrap { max-width: 980px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 18px 40px; display: grid; gap: 14px; }
header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; text-wrap: balance; }
header p { margin: 2px 0 0; color: var(--muted); font-size: 14px; }
.parts { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
.parts button { flex: none; border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 999px; padding: 7px 13px; font: 500 14px var(--sans); cursor: pointer; display: inline-flex; gap: 7px; align-items: center; }
.parts button[aria-current="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.parts .count { font: 600 12px var(--mono); color: var(--open); }
.parts button[aria-current="true"] .count { color: var(--accent); }
.player { background: #000; border-radius: 10px; overflow: hidden; aspect-ratio: 16 / 9; max-width: 100%; }
video { width: 100%; height: 100%; display: block; background: #000; }
.bar { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; }
.ctl { display: flex; gap: 6px; }
.ctl button, .btn { border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 8px; height: 40px; min-width: 44px; padding: 0 12px; font: 600 14px var(--sans); cursor: pointer; }
.ctl button:focus-visible, .btn:focus-visible, .parts button:focus-visible, textarea:focus-visible, .pin:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.tc { font: 600 26px var(--mono); font-variant-numeric: tabular-nums; letter-spacing: 0.02em; justify-self: center; }
.where { font: 500 13px var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; justify-self: end; text-align: right; }
.line { min-height: 2.9em; color: var(--ink); font-size: 16px; }
.line .q { color: var(--muted); }
.timeline { position: relative; height: 46px; border-radius: 8px; overflow: hidden; background: var(--shot-a); cursor: pointer; touch-action: none; }
.shot { position: absolute; top: 0; bottom: 0; }
.shot:nth-child(even) { background: var(--shot-b); }
.shot span { position: absolute; left: 6px; top: 4px; font: 600 11px var(--mono); color: var(--muted); }
.head { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--accent); pointer-events: none; }
.pin { position: absolute; bottom: 4px; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; border: 2px solid var(--panel); background: var(--open); padding: 0; cursor: pointer; }
.pin.fixed { background: var(--fixed); }
.compose { display: grid; gap: 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
textarea { width: 100%; box-sizing: border-box; min-height: 70px; resize: vertical; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); color: var(--ink); font: 15px/1.4 var(--sans); padding: 9px 10px; }
.row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.btn.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.btn:disabled { opacity: 0.5; cursor: default; }
.msg { color: var(--muted); font-size: 13px; }
.notes { display: grid; gap: 10px; }
.notes h2 { margin: 6px 0 0; font-size: 16px; }
.note { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; display: grid; gap: 6px; min-width: 0; }
.note .top { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.note .at { font: 600 13px var(--mono); color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 3px 7px; cursor: pointer; }
.note .who { color: var(--muted); font-size: 13px; }
.status { font: 600 11px var(--mono); text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 999px; border: 1px solid currentColor; }
.status.open { color: var(--open); } .status.fixed { color: var(--fixed); }
.note .text { white-space: pre-wrap; overflow-wrap: anywhere; }
.note .reply { border-left: 3px solid var(--fixed); padding-left: 10px; color: var(--muted); white-space: pre-wrap; overflow-wrap: anywhere; }
.note .del { margin-left: auto; background: none; border: none; color: var(--muted); font: 500 13px var(--sans); cursor: pointer; text-decoration: underline; }
.empty { color: var(--muted); padding: 10px 0; }
@media (max-width: 560px) { .tc { font-size: 21px; } .bar { grid-template-columns: auto 1fr; } .where { grid-column: 1 / -1; justify-self: start; text-align: left; } }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
</style>
<div class="wrap">
  <header><h1>__TITLE__</h1><p id="sub"></p></header>
  <nav class="parts" id="parts" aria-label="Chapters"></nav>
  <div class="player"><video id="v" playsinline preload="metadata"></video></div>
  <div class="bar">
    <div class="ctl">
      <button id="back" aria-label="Back one frame" title="Back one frame">&#9664;&#9646;</button>
      <button id="play" aria-label="Play">Play</button>
      <button id="fwd" aria-label="Forward one frame" title="Forward one frame">&#9646;&#9654;</button>
    </div>
    <div class="tc" id="tc" aria-live="off">00:00:00:00</div>
    <div class="where" id="where"></div>
  </div>
  <div class="line" id="line"></div>
  <div class="timeline" id="tl" aria-label="Timeline: tap to seek"></div>
  <section class="compose">
    <label for="note" class="msg" id="noteLabel">Note at 00:00:00:00</label>
    <textarea id="note" placeholder="What should change at this frame?"></textarea>
    <div class="row"><button class="btn primary" id="add">Pin note to this frame</button><span class="msg" id="status"></span></div>
  </section>
  <section class="notes"><h2 id="notesTitle">Notes</h2><div id="list"></div></section>
</div>
<script>
const M = __MANIFEST__;
const FPS = M.fps;
const $ = (id) => document.getElementById(id);
const v = $("v");
let cur = 0, notes = [], db = null, user = null, me = null, names = {};
$("sub").textContent = (M.film ? M.film + " · " : "") + "review cut " + M.cut + " · " + M.parts.length + " parts";

function pad(n) { return String(n).padStart(2, "0"); }
function tc(frame) { const s = Math.floor(frame / FPS); return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60) + ":" + pad(frame % FPS); }
function part() { return M.parts[cur]; }
function localFrame() { return Math.min(Math.round(part().duration * FPS) - 1, Math.floor(v.currentTime * FPS + 0.001)); }
function filmFrame() { return Math.round(part().start * FPS) + localFrame(); }
function seekLocal(f) { v.currentTime = (f + 0.5) / FPS; }

function renderParts() {
  const nav = $("parts"); nav.textContent = "";
  M.parts.forEach((p, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-current", i === cur ? "true" : "false");
    const open = notes.filter((n) => n.part === p.n && n.status !== "fixed").length;
    b.append(document.createTextNode(p.n + " · " + p.title));
    if (open) { const c = document.createElement("span"); c.className = "count"; c.textContent = open; b.append(c); }
    b.onclick = () => load(i, 0);
    nav.append(b);
  });
}
function renderTimeline() {
  const el = $("tl"), p = part(); el.textContent = "";
  const cuts = [0].concat(p.cuts || []).concat([p.duration]);
  for (let i = 0; i < cuts.length - 1; i++) {
    const s = document.createElement("div"); s.className = "shot";
    s.style.left = (100 * cuts[i] / p.duration) + "%"; s.style.width = (100 * (cuts[i + 1] - cuts[i]) / p.duration) + "%";
    const t = document.createElement("span"); t.textContent = "S" + (i + 1); s.append(t); el.append(s);
  }
  for (const n of notes.filter((n) => n.part === p.n)) {
    const b = document.createElement("button"); b.className = "pin" + (n.status === "fixed" ? " fixed" : "");
    b.style.left = (100 * (n.frame / FPS - p.start) / p.duration) + "%";
    b.title = tc(n.frame) + " " + n.text; b.setAttribute("aria-label", "Note at " + tc(n.frame));
    b.onclick = (e) => { e.stopPropagation(); v.pause(); seekLocal(n.frame - Math.round(p.start * FPS)); };
    el.append(b);
  }
  const h = document.createElement("div"); h.className = "head"; h.id = "head"; el.append(h);
}
function shotAt(t) { const c = part().cuts || []; let k = 1; for (const x of c) if (t >= x) k++; return k; }
function lineAt(t) { for (const s of part().sentences) if (t >= s.s - 0.15 && t <= s.e + 0.6) return s.text; return ""; }
function tick() {
  const f = filmFrame(), t = v.currentTime;
  $("tc").textContent = tc(f);
  $("noteLabel").textContent = "Note at " + tc(f) + " · part " + part().n + ", shot " + shotAt(t);
  $("where").textContent = "Part " + part().n + " · Shot " + shotAt(t);
  const ln = lineAt(t); const L = $("line"); L.textContent = ln; if (!ln) { const q = document.createElement("span"); q.className = "q"; q.textContent = "(no narration here)"; L.append(q); }
  const h = $("head"); if (h) h.style.left = (100 * t / part().duration) + "%";
}
function loop() { tick(); if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(loop); else requestAnimationFrame(loop); }
function load(i, frame) {
  cur = i; v.src = part().file; v.load();
  v.addEventListener("loadedmetadata", () => { seekLocal(frame || 0); tick(); }, { once: true });
  renderParts(); renderTimeline(); renderNotes(); tick();
}
$("play").onclick = () => { if (v.paused) v.play().catch(() => {}); else v.pause(); };
v.addEventListener("play", () => { $("play").textContent = "Pause"; $("play").setAttribute("aria-label", "Pause"); });
v.addEventListener("pause", () => { $("play").textContent = "Play"; $("play").setAttribute("aria-label", "Play"); tick(); });
v.addEventListener("seeked", tick);
v.addEventListener("ended", () => { if (cur < M.parts.length - 1) { load(cur + 1, 0); v.addEventListener("loadeddata", () => v.play().catch(() => {}), { once: true }); } });
$("back").onclick = () => { v.pause(); seekLocal(Math.max(0, localFrame() - 1)); };
$("fwd").onclick = () => { v.pause(); seekLocal(localFrame() + 1); };
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "TEXTAREA") return;
  if (e.key === "ArrowLeft") { e.preventDefault(); $("back").click(); } else if (e.key === "ArrowRight") { e.preventDefault(); $("fwd").click(); } else if (e.key === " ") { e.preventDefault(); $("play").click(); }
});
$("tl").addEventListener("pointerdown", (e) => {
  const r = $("tl").getBoundingClientRect();
  const seek = (x) => { v.pause(); seekLocal(Math.floor(Math.max(0, Math.min(1, (x - r.left) / r.width)) * part().duration * FPS)); };
  seek(e.clientX);
  const mv = (ev) => seek(ev.clientX), up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
  addEventListener("pointermove", mv); addEventListener("pointerup", up);
});
$("note").addEventListener("focus", () => v.pause());

async function resolveNames() {
  if (!user) return;
  const ids = [...new Set(notes.map((n) => n.author).filter(Boolean))];
  if (!ids.length) return;
  try { const ps = await user.profiles(ids); for (const id of ids) names[id] = (ps[id] && ps[id].name) || "Someone"; renderNotes(); } catch (e) {}
}
function renderNotes() {
  const list = $("list"), p = part(); list.textContent = "";
  const mine = notes.filter((n) => n.part === p.n).sort((a, b) => a.frame - b.frame);
  const open = mine.filter((n) => n.status !== "fixed").length;
  $("notesTitle").textContent = "Notes on part " + p.n + (mine.length ? " · " + open + " open, " + (mine.length - open) + " fixed" : "");
  if (!mine.length) { const e = document.createElement("div"); e.className = "empty"; e.textContent = db ? "No notes on this part yet. Pause on a frame, write what should change, and pin it." : "Notes will appear here once the page connects to its notes store."; list.append(e); return; }
  for (const n of mine) {
    const c = document.createElement("article"); c.className = "note";
    const top = document.createElement("div"); top.className = "top";
    const at = document.createElement("button"); at.className = "at"; at.textContent = tc(n.frame);
    at.onclick = () => { v.pause(); seekLocal(n.frame - Math.round(p.start * FPS)); };
    const st = document.createElement("span"); st.className = "status " + (n.status === "fixed" ? "fixed" : "open"); st.textContent = n.status === "fixed" ? "Fixed" : "Open";
    const who = document.createElement("span"); who.className = "who"; who.textContent = names[n.author] || "Someone";
    top.append(at, st, who);
    if (me && n.author === me && n.status !== "fixed") {
      const del = document.createElement("button"); del.className = "del"; del.textContent = "Delete";
      del.onclick = async () => { try { await db.collection("notes").doc(n.id).delete(); } catch (e) { $("status").textContent = "Couldn't delete that note: " + (e.message || e.code || "try again."); } };
      top.append(del);
    }
    const tx = document.createElement("div"); tx.className = "text"; tx.textContent = n.text;
    c.append(top, tx);
    if (n.reply) { const r = document.createElement("div"); r.className = "reply"; r.textContent = n.reply; c.append(r); }
    list.append(c);
  }
}
$("add").onclick = async () => {
  const text = $("note").value.trim();
  if (!text) { $("status").textContent = "Write the note first."; return; }
  if (!db) { $("status").textContent = "Notes can't be saved here: open the page while signed in to claude.ai."; return; }
  $("add").disabled = true;
  try {
    await db.collection("notes").add({ part: part().n, frame: filmFrame(), text, author: me || "", created: new Date().toISOString(), status: "open", reply: "" });
    $("note").value = ""; $("status").textContent = "Pinned at " + tc(filmFrame()) + ".";
  } catch (e) { $("status").textContent = e && e.code === "permission_denied" ? "You can view this page but not add notes. Ask the owner for edit access." : "Couldn't save the note: " + ((e && e.message) || "try again."); }
  $("add").disabled = false;
};

load(0, 0); loop();
(async () => {
  if (!window.claude) return;
  try { user = await claude.use("user"); if (user) me = await user.id(); } catch (e) {}
  try { db = await claude.use("db"); } catch (e) { db = null; }
  if (!db) { renderNotes(); return; }
  db.collection("notes").onSnapshot((snap) => {
    notes = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
    renderParts(); renderTimeline(); renderNotes(); resolveNames();
  }, (e) => { $("status").textContent = "Notes stopped updating (" + (e.code || "error") + "). Reload the page."; });
})();
</script>
'''
html = PAGE.replace('__TITLE__', args.title).replace('__MANIFEST__', json.dumps(manifest))
(d / 'index.html').write_text(html)
print('wrote', d / 'index.html', f'({len(html) / 1024:.0f} KB)')
