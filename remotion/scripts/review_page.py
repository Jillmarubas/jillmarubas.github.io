#!/usr/bin/env python3
"""Build the review room page (index.html) for a folder made by review_parts.py.

Usage: python3 -I scripts/review_page.py <out_dir> <timeline.json>
timeline.json: {"title", "version", "shots": [{"name", "start", "end"}], "lines": [{"start", "end", "text"}]}
The page plays the parts back to back with a frame-accurate HH:MM:SS:FF timecode, shows the shot
and the narration line under the playhead, and keeps notes in the artifact's `db` (collection
"notes": {t, tc, text, status: open|fixed, reply, author, created, version}). Publish index.html
with capabilities {db: {}, user: {scopes: ["profile"]}} and the parts as files.
"""
import html, json, os, sys

out, tl_path = sys.argv[1], sys.argv[2]
man = json.load(open(os.path.join(out, "manifest.json")))
tl = json.load(open(tl_path))
data = {"fps": man["fps"], "parts": man["parts"], "shots": tl["shots"], "lines": tl["lines"], "version": tl.get("version", "v1")}
title = tl.get("title", "Review Room")

page = r"""<title>__TITLE__</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Courier+Prime:wght@400;700&family=IBM+Plex+Sans+Condensed:wght@400;600&display=swap">
<style>
/* Layout: one column, video on top, transport and timeline under it, notes below; built for a phone. */
:root{--bg:#0E1117;--panel:#161B24;--line:#2B3342;--fg:#ECE4D4;--muted:#9AA2B0;--gold:#E5A93C;--crimson:#E2584A;--ok:#6FB283;--manila:#E5D9C5;
--fd:"Playfair Display",Georgia,serif;--fm:"Courier Prime","Courier New",monospace;--fu:"IBM Plex Sans Condensed","Arial Narrow",system-ui,sans-serif;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font-family:var(--fu);font-size:16px;line-height:1.45;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:16px 48px}
.wrap{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
h1{font-family:var(--fd);font-weight:900;font-size:clamp(22px,5.5vw,32px);margin:0;letter-spacing:.05em;text-transform:uppercase;text-wrap:balance}
.sub{font-family:var(--fm);font-size:13px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.player{position:relative;background:#000;aspect-ratio:16/9;width:100%;max-width:100%;border:1px solid var(--line)}
video{width:100%;height:100%;display:block;background:#000}
.hud{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}
.tc{font-family:var(--fm);font-weight:700;font-size:26px;color:var(--gold);font-variant-numeric:tabular-nums;letter-spacing:.04em}
.shot{font-family:var(--fm);font-size:14px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.line{min-height:2.9em;font-size:15px;color:var(--fg);opacity:.9;border-left:2px solid var(--gold);padding-left:10px}
.btns{display:flex;gap:8px;flex-wrap:wrap}
button{font-family:var(--fu);font-weight:600;font-size:15px;color:var(--fg);background:var(--panel);border:1px solid var(--line);padding:9px 14px;border-radius:2px;cursor:pointer;min-height:42px}
button.primary{background:var(--gold);color:#16120A;border-color:var(--gold)}
button:focus-visible,textarea:focus-visible,.track:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
button[disabled]{opacity:.45;cursor:default}
.track{position:relative;height:46px;background:var(--panel);border:1px solid var(--line);cursor:pointer;touch-action:none}
.blk{position:absolute;top:0;bottom:0;border-right:1px solid var(--bg);overflow:hidden}
.blk span{position:absolute;left:4px;top:3px;font-family:var(--fm);font-size:10px;color:var(--muted);white-space:nowrap}
.ph{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--gold);pointer-events:none}
.pin{position:absolute;bottom:2px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:var(--crimson);border:2px solid var(--bg);pointer-events:none}
.pin.fixed{background:var(--ok)}
.compose{display:flex;flex-direction:column;gap:8px;background:var(--panel);border:1px solid var(--line);padding:12px}
textarea{width:100%;min-height:76px;font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);padding:10px;resize:vertical}
.notes{display:flex;flex-direction:column;gap:10px}
.note{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--crimson);padding:10px 12px;display:flex;flex-direction:column;gap:6px;min-width:0}
.note.fixed{border-left-color:var(--ok)}
.nh{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.chip{font-family:var(--fm);font-weight:700;font-size:14px;color:var(--gold);background:none;border:1px solid var(--line);padding:3px 8px;min-height:0}
.st{font-family:var(--fm);font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--crimson)}
.note.fixed .st{color:var(--ok)}
.who{font-size:13px;color:var(--muted);margin-left:auto}
.txt{overflow-wrap:anywhere;white-space:pre-wrap}
.reply{font-size:14px;color:var(--muted);border-left:2px solid var(--ok);padding-left:8px;white-space:pre-wrap}
.empty,.msg{color:var(--muted);font-size:14px}
h2{font-family:var(--fd);font-size:18px;margin:6px 0 0;text-transform:uppercase;letter-spacing:.06em}
</style>
<div class="wrap">
  <div><div class="sub">Small Print · review room · __VERSION__</div><h1>__TITLE__</h1></div>
  <div class="player"><video id="v" playsinline preload="metadata"></video></div>
  <div class="hud"><span class="tc" id="tc">00:00:00:00</span><span class="shot" id="shot"></span></div>
  <div class="line" id="line"></div>
  <div class="btns">
    <button id="play" class="primary">Play</button>
    <button id="back5" aria-label="Back 5 seconds">−5 s</button>
    <button id="prev" aria-label="Back one frame">−1 frame</button>
    <button id="next" aria-label="Forward one frame">+1 frame</button>
    <button id="add">Add note here</button>
  </div>
  <div class="track" id="track" tabindex="0" aria-label="Timeline: tap to jump"></div>
  <div class="compose" id="compose" hidden>
    <div class="nh"><span class="sub">Note at</span><span class="chip" id="ctc"></span></div>
    <label for="ntext" class="sub">What should change?</label>
    <textarea id="ntext" placeholder="e.g. Hold the stamp a beat longer"></textarea>
    <div class="btns"><button class="primary" id="save">Save note</button><button id="cancel">Cancel</button></div>
    <div class="msg" id="cmsg"></div>
  </div>
  <h2>Notes</h2>
  <div class="msg" id="dbmsg"></div>
  <div class="notes" id="notes"><div class="empty">No notes yet. Pause on a frame and tap "Add note here".</div></div>
</div>
<script>
const D = __DATA__;
const FPS = D.fps, parts = D.parts, total = parts.reduce((s, p) => Math.max(s, p.start + p.dur), 0);
const $ = (id) => document.getElementById(id);
const v = $('v');
let pi = 0, notes = [], pendingT = 0, db = null, user = null, me = null;
const tcOf = (t) => { const f = Math.floor(t * FPS + 1e-6), ff = f % FPS, s = Math.floor(f / FPS); const p = (n) => String(n).padStart(2, '0'); return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(ff)}`; };
const now = () => parts[pi].start + v.currentTime;
function load(i, at, play) {
  pi = i; const want = Math.max(0, at - parts[i].start);
  if (!v.src.endsWith(parts[i].file)) { v.src = parts[i].file; v.addEventListener('loadedmetadata', () => { v.currentTime = want; if (play) v.play().catch(() => {}); }, {once: true}); }
  else { v.currentTime = want; if (play) v.play().catch(() => {}); }
}
function seek(t) { t = Math.max(0, Math.min(total - 0.01, t)); const i = Math.max(0, parts.findIndex((p) => t >= p.start && t < p.start + p.dur)); load(i, t, !v.paused); paint(t); }
v.addEventListener('ended', () => { if (pi + 1 < parts.length) load(pi + 1, parts[pi + 1].start, true); else $('play').textContent = 'Play'; });
v.addEventListener('play', () => ($('play').textContent = 'Pause'));
v.addEventListener('pause', () => ($('play').textContent = 'Play'));
$('play').onclick = () => (v.paused ? v.play().catch(() => {}) : v.pause());
$('back5').onclick = () => seek(now() - 5);
$('prev').onclick = () => { v.pause(); seek(now() - 1 / FPS); };
$('next').onclick = () => { v.pause(); seek(now() + 1 / FPS); };
// timeline
const track = $('track');
const blk = D.shots.map((s, i) => `<div class="blk" style="left:${(s.start / total) * 100}%;width:${((s.end - s.start) / total) * 100}%;background:${i % 2 ? '#1B212C' : '#202734'}"><span>${s.name}</span></div>`).join('');
track.innerHTML = blk + '<div id="pins"></div><div class="ph" id="ph"></div>';
const fromX = (e) => { const r = track.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * total; };
let drag = false;
track.addEventListener('pointerdown', (e) => { drag = true; track.setPointerCapture(e.pointerId); seek(fromX(e)); });
track.addEventListener('pointermove', (e) => drag && seek(fromX(e)));
track.addEventListener('pointerup', () => (drag = false));
track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') seek(now() + 1 / FPS); if (e.key === 'ArrowLeft') seek(now() - 1 / FPS); });
function paint(t) {
  $('tc').textContent = tcOf(t);
  $('ph').style.left = `${(t / total) * 100}%`;
  const s = D.shots.find((x) => t >= x.start && t < x.end); $('shot').textContent = s ? s.name : '';
  const l = D.lines.find((x) => t >= x.start - 0.15 && t <= x.end + 0.4); $('line').textContent = l ? l.text : '';
}
const tick = () => { paint(now()); v.requestVideoFrameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame(tick); };
// notes
function renderNotes() {
  $('pins').innerHTML = notes.map((n) => `<div class="pin ${n.status === 'fixed' ? 'fixed' : ''}" style="left:${(n.t / total) * 100}%"></div>`).join('');
  const box = $('notes');
  if (!notes.length) { box.innerHTML = '<div class="empty">No notes yet. Pause on a frame and tap "Add note here".</div>'; return; }
  box.innerHTML = '';
  notes.forEach((n) => {
    const el = document.createElement('div'); el.className = 'note' + (n.status === 'fixed' ? ' fixed' : '');
    const h = document.createElement('div'); h.className = 'nh';
    const c = document.createElement('button'); c.className = 'chip'; c.textContent = n.tc; c.onclick = () => { v.pause(); seek(n.t); window.scrollTo({top: 0, behavior: 'smooth'}); };
    const st = document.createElement('span'); st.className = 'st'; st.textContent = n.status === 'fixed' ? 'Fixed' : 'Open';
    const w = document.createElement('span'); w.className = 'who'; w.textContent = n.authorName || '';
    h.append(c, st, w);
    const tx = document.createElement('div'); tx.className = 'txt'; tx.textContent = n.text;
    el.append(h, tx);
    if (n.reply) { const r = document.createElement('div'); r.className = 'reply'; r.textContent = n.reply; el.append(r); }
    if (me && n.author === me && n.status !== 'fixed') { const del = document.createElement('button'); del.textContent = 'Delete'; del.onclick = async () => { del.disabled = true; try { await db.doc('notes/' + n.id).delete(); } catch (e) { del.disabled = false; } }; el.append(del); }
    box.append(el);
  });
}
$('add').onclick = () => { v.pause(); pendingT = Math.floor(now() * FPS) / FPS; $('ctc').textContent = tcOf(pendingT); $('compose').hidden = false; $('cmsg').textContent = ''; $('ntext').focus(); };
$('cancel').onclick = () => ($('compose').hidden = true);
$('save').onclick = async () => {
  const text = $('ntext').value.trim(); if (!text) return;
  if (!db) { $('cmsg').textContent = 'Notes need you signed in to claude.ai on this page.'; return; }
  $('save').disabled = true;
  try { await db.collection('notes').add({t: pendingT, tc: tcOf(pendingT), text, status: 'open', reply: '', author: me || '', created: Date.now(), version: D.version}); $('ntext').value = ''; $('compose').hidden = true; }
  catch (e) { $('cmsg').textContent = e && e.code === 'quota_exceeded' ? 'The note store is full.' : 'Could not save the note. Check that you are signed in.'; }
  $('save').disabled = false;
};
(async () => {
  try { user = await window.claude?.use('user'); me = user ? await user.id() : null; } catch (e) {}
  try { db = await window.claude?.use('db'); } catch (e) { db = null; }
  if (!db) { $('dbmsg').textContent = 'Notes are off in this view. Open the page signed in to claude.ai to add notes.'; $('add').disabled = true; return; }
  db.collection('notes').orderBy('t').onSnapshot(async (snap) => {
    notes = snap.docs.map((d) => ({id: d.id, ...d.data()}));
    if (user) { const ids = [...new Set(notes.map((n) => n.author).filter(Boolean))]; try { const ps = ids.length ? await user.profiles(ids) : {}; notes.forEach((n) => (n.authorName = n.author === me ? 'You' : (ps[n.author] && ps[n.author].name) || 'Someone')); } catch (e) {} }
    renderNotes();
  }, () => { $('dbmsg').textContent = 'Notes stopped updating. Reload the page.'; });
})();
load(0, 0, false); paint(0); tick();
</script>"""
page = page.replace("__TITLE__", html.escape(title)).replace("__VERSION__", html.escape(data["version"])).replace("__DATA__", json.dumps(data))
open(os.path.join(out, "index.html"), "w").write(page)
print("wrote", os.path.join(out, "index.html"))
