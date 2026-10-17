"""Build the review room page for a film (video-production-psychology skill, step 6).
Usage: python3 scripts/review_page.py <outdir>   (reads <outdir>/parts.json, writes <outdir>/index.html)
Publish index.html with capabilities {db: {}, user: {scopes: ["profile"]}} and the parts under v/.
Notes live in the artifact's db collection `notes`: {frame, text, author, created, status, reply, cut}."""
import json, os, sys

outdir = sys.argv[1]
man = json.load(open(os.path.join(outdir, 'parts.json')))
spec = man['spec']
data = {
    'title': spec['title'],
    'cut': spec['cut'],
    'fpsNum': spec['fpsNum'],
    'fpsDen': spec['fpsDen'],
    'frames': spec['frames'],
    'chapters': spec['chapters'],
    'shots': spec['shots'],
    'parts': [{'src': 'v/' + p['file'], 'chapter': p['chapter'], 'a': p['startFrame'], 'b': p['endFrame']} for p in man['parts']],
}

HTML = r'''<title>__TITLE__ Review Room</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap">
<style>
/* Layout: a screening-room strip. Phone: picture, timecode, timeline, notes in one column. Wide: picture left, notes right. */
:root {
  --bg: #15171B; --panel: #1E2126; --line: #2E333A; --fg: #ECE7DE; --muted: #9AA0A8;
  --amber: #E9A23B; --amber-ink: #1A1408; --fixed: #7FB38A; --shotA: #2A2F36; --shotB: #343A42;
  --display: "Instrument Sans", system-ui, sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace;
  color-scheme: dark;
}
body { background: var(--bg); color: var(--fg); font: 15px/1.45 var(--display); }
.wrap { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px 40px; max-width: 1100px; margin: 0 auto; display: grid; gap: 18px; }
header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 16px; }
h1 { font-size: 22px; font-weight: 600; margin: 0; text-wrap: balance; }
.meta { color: var(--muted); font: 500 12px/1.3 var(--mono); letter-spacing: .04em; text-transform: uppercase; }
.grid { display: grid; gap: 18px; }
@media (min-width: 900px) { .grid { grid-template-columns: minmax(0, 430px) minmax(0, 1fr); align-items: start; } }
.col { display: grid; gap: 12px; min-width: 0; }
.chapters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
.chapters button { flex: none; border: 1px solid var(--line); background: var(--panel); color: var(--fg); border-radius: 999px; padding: 7px 13px; font: 500 14px var(--display); cursor: pointer; }
.chapters button[aria-pressed="true"] { background: var(--amber); color: var(--amber-ink); border-color: var(--amber); }
.screen { background: #000; border-radius: 10px; overflow: hidden; aspect-ratio: 9 / 16; max-height: 68vh; max-width: 100%; margin: 0 auto; width: 100%; }
.screen.wide { aspect-ratio: 16 / 9; }
video { width: 100%; height: 100%; display: block; background: #000; }
.readout { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: baseline; }
.tc { font: 600 26px/1 var(--mono); font-variant-numeric: tabular-nums; letter-spacing: .02em; color: var(--amber); }
.shot { font-weight: 500; min-width: 0; }
.shot small { display: block; color: var(--muted); font: 500 12px var(--mono); }
.transport { display: flex; gap: 8px; flex-wrap: wrap; }
.transport button, .btn { border: 1px solid var(--line); background: var(--panel); color: var(--fg); border-radius: 8px; padding: 9px 12px; font: 500 14px var(--display); cursor: pointer; }
.transport .play { background: var(--fg); color: var(--bg); border-color: var(--fg); min-width: 84px; }
button:focus-visible, textarea:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
.timeline { position: relative; height: 46px; border-radius: 6px; overflow: hidden; background: var(--panel); cursor: pointer; touch-action: none; }
.timeline .blk { position: absolute; top: 0; bottom: 14px; display: grid; place-items: center; font: 600 10px var(--mono); color: var(--muted); border-right: 1px solid var(--bg); }
.timeline .chap { position: absolute; bottom: 0; height: 14px; font: 500 9px var(--mono); color: var(--muted); padding-left: 4px; border-left: 2px solid var(--line); white-space: nowrap; overflow: hidden; }
.timeline .pin { position: absolute; top: 2px; width: 9px; height: 9px; margin-left: -4.5px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 0 2px var(--bg); }
.timeline .pin.fixed { background: var(--fixed); }
.timeline .head { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--fg); margin-left: -1px; pointer-events: none; }
.compose { display: grid; gap: 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
.compose label { font-weight: 600; }
textarea { width: 100%; box-sizing: border-box; min-height: 74px; resize: vertical; background: var(--bg); color: var(--fg); border: 1px solid var(--line); border-radius: 8px; padding: 10px; font: 15px/1.4 var(--display); }
.pinbtn { background: var(--amber); color: var(--amber-ink); border-color: var(--amber); font-weight: 600; }
.pinbtn:disabled { opacity: .5; cursor: default; }
.hint { color: var(--muted); font-size: 13px; }
.notes-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.notes-head h2 { font-size: 16px; margin: 0; }
.filter { display: flex; gap: 6px; }
.filter button { border: 1px solid var(--line); background: transparent; color: var(--muted); border-radius: 999px; padding: 5px 11px; font: 500 13px var(--display); cursor: pointer; }
.filter button[aria-pressed="true"] { color: var(--fg); border-color: var(--fg); }
ol.notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.note { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--amber); border-radius: 8px; padding: 10px 12px; display: grid; gap: 6px; min-width: 0; }
.note.fixed { border-left-color: var(--fixed); }
.note .top { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.note .tcb { font: 600 13px var(--mono); color: var(--amber); background: transparent; border: 1px solid var(--line); border-radius: 6px; padding: 3px 7px; cursor: pointer; font-variant-numeric: tabular-nums; }
.note .who { color: var(--muted); font-size: 13px; }
.pill { font: 600 11px var(--mono); text-transform: uppercase; letter-spacing: .05em; padding: 2px 7px; border-radius: 999px; background: var(--amber); color: var(--amber-ink); }
.pill.fixed { background: var(--fixed); color: #0F1A12; }
.pill.old { background: var(--line); color: var(--muted); }
.note .text { white-space: pre-wrap; overflow-wrap: anywhere; }
.note .reply { border-top: 1px dashed var(--line); padding-top: 6px; color: var(--muted); font-size: 14px; white-space: pre-wrap; overflow-wrap: anywhere; }
.note .reply b { color: var(--fg); font-weight: 600; }
.note .shotname { color: var(--muted); font-size: 13px; }
.empty { color: var(--muted); border: 1px dashed var(--line); border-radius: 8px; padding: 14px; }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
</style>

<div class="wrap">
  <header>
    <h1>__TITLE__</h1>
    <div class="meta" id="meta"></div>
  </header>
  <div class="grid">
    <div class="col">
      <div class="chapters" id="chapters" role="group" aria-label="Chapters"></div>
      <div class="screen" id="screen"><video id="v" playsinline preload="metadata" controls></video></div>
      <div class="readout"><div class="tc" id="tc" aria-live="off">00:00:00:00</div><div class="shot" id="shot"></div></div>
      <div class="transport">
        <button id="back" type="button">−1 frame</button>
        <button id="play" class="play" type="button">Play</button>
        <button id="fwd" type="button">+1 frame</button>
      </div>
      <div class="timeline" id="tl" role="slider" aria-label="Film timeline" tabindex="0"></div>
    </div>
    <div class="col">
      <form class="compose" id="compose">
        <label for="note">Note at <span id="tc2" class="tc" style="font-size:15px">00:00:00:00</span></label>
        <textarea id="note" placeholder="What should change at this frame? e.g. lightning too bright, hold the face longer"></textarea>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="btn pinbtn" id="pin" type="submit">Pin note to this frame</button>
          <span class="hint" id="status">Pauses the film and pins the note to the exact frame.</span>
        </div>
      </form>
      <div class="notes-head">
        <h2 id="count">Notes</h2>
        <div class="filter" role="group" aria-label="Show notes">
          <button type="button" data-f="chapter" aria-pressed="true">This chapter</button>
          <button type="button" data-f="all" aria-pressed="false">Whole film</button>
        </div>
      </div>
      <ol class="notes" id="notes"></ol>
      <p class="hint">When your notes are in, tell Claude in the chat. Claude answers under each note and marks it Fixed in the next cut.</p>
    </div>
  </div>
</div>

<script>
const D = __DATA__;
const FPS = D.fpsNum / D.fpsDen;
const TCB = Math.round(FPS); // 24-frame non-drop timecode for 23.976
const $ = (id) => document.getElementById(id);
const v = $('v');
let chapter = 0, part = null, frame = 0, notes = [], filter = 'chapter', db = null, user = null, myId = null, names = {};

const pad = (n) => String(n).padStart(2, '0');
const tc = (f) => { const ff = f % TCB, s = Math.floor(f / TCB); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`; };
const fr = (s) => Math.round(s * FPS);
const shotAt = (f) => { let k = 0; D.shots.forEach((s, i) => { if (fr(s.start) <= f) k = i; }); return k; };
const chapterAt = (f) => { let k = 0; D.chapters.forEach((c, i) => { if (fr(c.start) <= f) k = i; }); return k; };
const partFor = (f) => D.parts.find((p) => f >= p.a && f < p.b) || D.parts[D.parts.length - 1];

function load(p, atFrame, play) {
  if (part !== p) {
    part = p; chapter = p.chapter; v.src = p.src; v.load();
    v.addEventListener('loadedmetadata', () => { seekLocal(atFrame); if (play) v.play().catch(() => {}); }, {once: true});
    renderChapters(); renderNotes();
  } else { seekLocal(atFrame); if (play) v.play().catch(() => {}); }
  setFrame(atFrame);
}
// seek to the middle of the frame so the decoder lands on it, not the one before
function seekLocal(f) { v.currentTime = Math.max(0, (f - part.a + 0.5) / FPS); }
function setFrame(f) {
  frame = Math.max(0, Math.min(D.frames - 1, f));
  $('tc').textContent = tc(frame); $('tc2').textContent = tc(frame);
  const k = shotAt(frame);
  $('shot').innerHTML = '';
  const t = document.createElement('span'); t.textContent = D.shots[k].label;
  const sm = document.createElement('small'); sm.textContent = `Shot ${k + 1} of ${D.shots.length} · ${D.chapters[chapterAt(frame)].name}`;
  $('shot').append(t, sm);
  $('head').style.left = (frame / D.frames * 100) + '%';
}
function tick(now, meta) {
  if (part) setFrame(part.a + Math.floor(((meta ? meta.mediaTime : v.currentTime) * FPS) + 1e-3));
  if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick); else requestAnimationFrame(() => tick());
}
v.addEventListener('ended', () => {
  const i = D.parts.indexOf(part);
  if (i + 1 < D.parts.length) load(D.parts[i + 1], D.parts[i + 1].a, true);
});
v.addEventListener('play', () => { $('play').textContent = 'Pause'; });
v.addEventListener('pause', () => { $('play').textContent = 'Play'; });
v.addEventListener('seeked', () => { if (v.paused && part) setFrame(part.a + Math.floor(v.currentTime * FPS + 1e-3)); });
$('play').onclick = () => (v.paused ? v.play().catch(() => {}) : v.pause());
const step = (d) => { v.pause(); const f = Math.max(0, Math.min(D.frames - 1, frame + d)); const p = partFor(f); load(p, f, false); };
$('back').onclick = () => step(-1);
$('fwd').onclick = () => step(1);

function renderChapters() {
  const box = $('chapters'); box.textContent = '';
  D.chapters.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button';
    b.textContent = `${i + 1} ${c.name}`; b.setAttribute('aria-pressed', String(i === chapter));
    b.onclick = () => { const p = D.parts.find((q) => q.chapter === i); load(p, p.a, false); };
    box.append(b);
  });
}

function renderTimeline() {
  const tl = $('tl'); tl.textContent = '';
  D.shots.forEach((s, i) => {
    const a = fr(s.start), b = i + 1 < D.shots.length ? fr(D.shots[i + 1].start) : D.frames;
    const el = document.createElement('div'); el.className = 'blk';
    el.style.left = (a / D.frames * 100) + '%'; el.style.width = ((b - a) / D.frames * 100) + '%';
    el.style.background = i % 2 ? 'var(--shotB)' : 'var(--shotA)';
    el.textContent = (b - a) / D.frames > 0.03 ? String(i + 1) : '';
    el.title = `Shot ${i + 1}: ${s.label}`;
    tl.append(el);
  });
  D.chapters.forEach((c) => {
    const a = fr(c.start), b = Math.min(D.frames, fr(c.end));
    const el = document.createElement('div'); el.className = 'chap';
    el.style.left = (a / D.frames * 100) + '%'; el.style.width = ((b - a) / D.frames * 100) + '%';
    el.textContent = c.name; tl.append(el);
  });
  notes.forEach((n) => {
    const el = document.createElement('div'); el.className = 'pin' + (n.status === 'fixed' ? ' fixed' : '');
    el.style.left = (n.frame / D.frames * 100) + '%'; tl.append(el);
  });
  const h = document.createElement('div'); h.className = 'head'; h.id = 'head'; tl.append(h);
  h.style.left = (frame / D.frames * 100) + '%';
}
function seekFromEvent(e) {
  const r = $('tl').getBoundingClientRect();
  const x = Math.max(0, Math.min(1, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width));
  const f = Math.min(D.frames - 1, Math.round(x * D.frames));
  v.pause(); load(partFor(f), f, false);
}
$('tl').addEventListener('pointerdown', seekFromEvent);
$('tl').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });

document.querySelectorAll('.filter button').forEach((b) => {
  b.onclick = () => { filter = b.dataset.f; document.querySelectorAll('.filter button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderNotes(); };
});

async function renderNotes() {
  renderTimeline();
  const list = $('notes'); list.textContent = '';
  const shown = notes.filter((n) => filter === 'all' || chapterAt(n.frame) === chapter).sort((a, b) => a.frame - b.frame);
  const open = notes.filter((n) => n.status !== 'fixed').length;
  $('count').textContent = notes.length ? `Notes · ${open} open, ${notes.length - open} fixed` : 'Notes';
  if (!shown.length) {
    const li = document.createElement('li'); li.className = 'empty';
    li.textContent = db ? (filter === 'all' ? 'No notes yet. Pause on a frame and pin the first one.' : 'No notes in this chapter yet.') : 'Notes need you to be signed in to claude.ai. You can still watch the cut.';
    list.append(li); return;
  }
  if (user) { const ps = await user.profiles([...new Set(shown.map((n) => n.author).filter(Boolean))]); Object.entries(ps || {}).forEach(([id, p]) => { names[id] = p.name; }); }
  shown.forEach((n) => {
    const li = document.createElement('li'); li.className = 'note' + (n.status === 'fixed' ? ' fixed' : '');
    const top = document.createElement('div'); top.className = 'top';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tcb'; b.textContent = tc(n.frame);
    b.onclick = () => { v.pause(); load(partFor(n.frame), n.frame, false); };
    const pill = document.createElement('span'); pill.className = 'pill' + (n.status === 'fixed' ? ' fixed' : '');
    pill.textContent = n.status === 'fixed' ? 'Fixed' : 'Open';
    const who = document.createElement('span'); who.className = 'who';
    who.textContent = `${names[n.author] || 'Someone'}${n.cut && n.cut !== D.cut ? ` · cut ${n.cut}` : ''}`;
    top.append(b, pill, who);
    const sn = document.createElement('div'); sn.className = 'shotname'; sn.textContent = `Shot ${shotAt(n.frame) + 1}: ${D.shots[shotAt(n.frame)].label}`;
    const t = document.createElement('div'); t.className = 'text'; t.textContent = n.text;
    li.append(top, sn, t);
    if (n.reply) { const r = document.createElement('div'); r.className = 'reply'; const bb = document.createElement('b'); bb.textContent = 'Claude: '; r.append(bb, document.createTextNode(n.reply)); li.append(r); }
    list.append(li);
  });
}

$('compose').addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = $('note').value.trim();
  if (!text) { $('status').textContent = 'Write the note first.'; return; }
  if (!db) { $('status').textContent = 'Sign in to claude.ai to pin notes.'; return; }
  v.pause();
  $('pin').disabled = true;
  try {
    await db.collection('notes').add({frame, text, author: myId, created: new Date().toISOString(), status: 'open', reply: '', cut: D.cut});
    $('note').value = ''; $('status').textContent = `Pinned at ${tc(frame)}.`;
  } catch (err) {
    $('status').textContent = err && err.code === 'invalid_argument' ? 'You can watch, but this share does not let you add notes.' : 'Could not save the note. Try again in a moment.';
  } finally { $('pin').disabled = false; }
});
$('note').addEventListener('focus', () => v.pause());

$('meta').textContent = `Review cut ${D.cut} · 23.976 fps · ${Math.round(D.frames / FPS)} s · ${D.shots.length} shots`;
renderTimeline();
load(D.parts[0], 0, false);
renderChapters();
renderNotes();
tick();

(async () => {
  db = await claude.use('db');
  user = await claude.use('user');
  if (user) { const me = await user.me(); myId = me.id; }
  if (!db) { renderNotes(); return; }
  db.collection('notes').onSnapshot((snap) => {
    notes = snap.docs.map((d) => ({id: d.id, ...d.data()})).filter((n) => typeof n.frame === 'number');
    renderNotes();
  }, () => { $('status').textContent = 'Notes are offline right now. Reload the page to reconnect.'; });
})();
</script>
'''

html = HTML.replace('__TITLE__', spec['title']).replace('__DATA__', json.dumps(data))
open(os.path.join(outdir, 'index.html'), 'w').write(html)
print('wrote', os.path.join(outdir, 'index.html'), len(html), 'bytes')
