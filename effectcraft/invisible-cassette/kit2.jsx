// Scene kit for Scenes 2–10 of The Invisible Cassette (MagnatesMedia look, trading-terminal palette).
// Times passed to these helpers are SCENE times (seconds from the scene comp's start). The voice starts at
// LEAD, so at("phrase") = that word's voiceover time + LEAD. Each shot converts to its own local time.
#include "mm.jsx"
#include "words.jsx"
#include "maps.jsx"

var LEAD = 1.0, F = 1 / FPS, SC = 0, SHOTS = [];
var CENTER = ParagraphJustification.CENTER_JUSTIFY, LEFTJ = ParagraphJustification.LEFT_JUSTIFY, RIGHTJ = ParagraphJustification.RIGHT_JUSTIFY;
function at(phrase, after) { return WT(SC, phrase, after === undefined ? 0 : Math.max(0, after - LEAD)) + LEAD; }
function vo(t) { return t + LEAD; }
function tryFx2(l, name, v) { try { return fx(l, name, v); } catch (e) { writeLn("skipped " + name + ": " + e); return null; } }
function glow(l) { return tryFx2(l, "Glow", {"Glow Threshold": 40, "Glow Radius": 22, "Glow Intensity": 0.6}); }

// one shot = one precomp from scene time a to b, with the terminal backdrop unless opt.bg === false
function Shot(name, a, b, opt) {
  opt = opt || {};
  var c = comp(name, b - a); c.motionBlur = true;
  var o = {c: c, a: a, b: b, d: b - a, name: name};
  o.t = function (x) { return Math.max(0, x - a); };
  if (opt.bg !== false) termBackdrop(c, !!opt.red);
  SHOTS.push(o);
  return o;
}
// camera last: a slow push (MagnatesMedia never sits still); opt as rig()
function cam(o, opt) { return rig(o.c, o.d, opt || {}); }

// visibility window in LOCAL time: cut or fade in at a, fade out by b
function vis(l, a, b, fi, fo, d) {
  var k = [[0, a <= 0 ? 100 : 0]];
  if (a > 0) { k.push([a, 0]); k.push([a + Math.max(fi || 0, F), 100]); }
  if (b < d - 0.01) { k.push([b - Math.max(fo || 0, F), 100]); k.push([b, 0]); }
  keys(T(l).property("Opacity"), k, 0);
}
function pop(l, a) { // the paste's slam: 115 % -> 100 % over 2 frames
  keys(T(l).property("Scale"), [[a, [115, 115, 100]], [a + 2 * F, [100, 100, 100]]], 0);
}

// a keyword / number / label. opt: x, y, z, size, color, font, mode ('slam'|'rise'|'type'|'fade'|'on'),
// until (scene time), cps, track, just, glow
function word(o, s, when, opt) {
  opt = opt || {};
  var t = txt(o.c, s, opt.font || TF.head, opt.size || 110, opt.color || TERM.white,
    [opt.x === undefined ? W / 2 : opt.x, opt.y === undefined ? H / 2 : opt.y, opt.z || 0], opt.just || CENTER, opt.track === undefined ? 30 : opt.track);
  var a = o.t(when), b = opt.until === undefined ? o.d : o.t(opt.until), m = opt.mode || "slam";
  if (m === "slam") { pop(t, a); vis(t, a, b, 0, 0.3, o.d); }
  else if (m === "rise") { rise(t, a, 0.6); vis(t, a, b, 0, 0.3, o.d); }
  else if (m === "type") { typeOn(t, s, a, opt.cps || 22); vis(t, a, b, 0, 0.3, o.d); }
  else if (m === "on") { vis(t, a, b, 0, 0.3, o.d); }
  else vis(t, a, b, 0.4, 0.3, o.d);
  if (opt.glow) glow(t);
  return t;
}
function label(o, s, when, opt) { opt = opt || {}; opt.font = opt.font || TF.monoReg; opt.size = opt.size || 30; opt.color = opt.color || TERM.grey; opt.track = opt.track === undefined ? 120 : opt.track; opt.mode = opt.mode || "fade"; return word(o, s, when, opt); }
function fmtNum(v, dec) { var s = Math.abs(v).toFixed(dec || 0), p = s.split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return (v < 0 ? "−" : "") + p.join("."); }
// rolling counter from a to b between t0 and t1 (scene times); opt as word() plus dec, pre, suf
function num(o, a, b, t0, t1, opt) {
  opt = opt || {}; opt.font = opt.font || TF.mono; opt.mode = opt.mode || "on";
  var t = word(o, (opt.pre || "") + fmtNum(b, opt.dec) + (opt.suf || ""), t0, opt);
  counter(t, a, b, o.t(t0), o.t(t1), opt.dec || 0, opt.pre || "", opt.suf || "");
  return t;
}
// red strike-through drawn across (x, y) width w at time `when`
function strike(o, x, y, w, when, color) {
  var s = solid(o.c, color || TERM.red, "strike", Math.round(w), 9); s.threeDLayer = true;
  T(s).property("Anchor Point").setValue([0, 4.5, 0]); T(s).property("Position").setValue([x - w / 2, y, -3]);
  var a = o.t(when);
  // never scale a 3D layer to exactly 0 under a camera: EffectCraft's renderer crashes (huge allocation)
  keys(T(s).property("Scale"), [[0, [0.5, 100, 100]], [a, [0.5, 100, 100]], [a + 0.25, [100, 100, 100]]], 0);
  vis(s, a, 1e9, 0, 0, 1e9);
  return s;
}
// boxed tag (precomp) slammed in: SEC, PLEADED GUILTY, HYPOTHETICAL…
var _tags = 0;
function tag(o, s, when, opt) {
  opt = opt || {};
  var size = opt.size || 56, w = opt.w || Math.round(s.length * size * 0.62 + 90), h = opt.h || Math.round(size * 1.9);
  var tc = tagComp("Tag " + (++_tags) + " " + s, s, opt.color || TERM.red, size, w, h, opt.font);
  var l = c3(o.c, tc, [opt.x === undefined ? W / 2 : opt.x, opt.y === undefined ? H / 2 : opt.y, opt.z === undefined ? -20 : opt.z]);
  if (opt.rot) T(l).property("Z Rotation").setValue(opt.rot);
  var a = o.t(when);
  pop(l, a); vis(l, a, opt.until === undefined ? o.d : o.t(opt.until), 0, 0.3, o.d);
  EVENTS.push([opt.color === TERM.red ? "stamp" : "tag", when]);
  return l;
}
function tagComp(name, s, rgb, size, w, h, font) {
  var c = comp(name, 30, w, h);
  var bx = c.layers.addShape();
  var g = bx.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([w - 16, h - 16]);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(rgb); st.property("Stroke Width").setValue(Math.max(4, size / 12));
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(TERM.black);
  T(bx).property("Position").setValue([w / 2, h / 2]);
  txt(c, s, font || TF.head, size, rgb, [w / 2, h / 2 + size * 0.36], null, 40);
  return c;
}
function c3(c, item, pos) { var l = c.layers.add(item); l.threeDLayer = true; T(l).property("Position").setValue(pos); return l; }
// small corner flag for drawn or hypothetical material (CLAUDE.md: say so on screen)
function flag(o, s, opt) { opt = opt || {}; return label(o, s, opt.at === undefined ? o.a : opt.at, {x: W - 48, y: H - 36, just: RIGHTJ, size: 22, font: TF.headReg, track: 40, color: opt.color || TERM.grey, mode: "on", until: opt.until}); }

// a terminal panel (outline + fill)
function box(o, w, h, x, y, z, stroke) {
  var l = o.c.layers.addShape(); l.name = "panel";
  var g = l.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([w, h]);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); st.property("Color").setValue(stroke || TERM.amberDim); st.property("Stroke Width").setValue(2);
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(TERM.panel);
  l.threeDLayer = true; T(l).property("Position").setValue([x, y, z === undefined ? 30 : z]);
  return l;
}

// comparison bars drawn to true scale. items: [[label, value, color, valueText], ...]
function bars(o, items, when, opt) {
  opt = opt || {};
  var wMax = opt.w || 1300, x0 = (opt.x === undefined ? W / 2 : opt.x) - wMax / 2, y0 = opt.y === undefined ? H / 2 - 90 : opt.y, gap = opt.gap || 190, stag = opt.stagger === undefined ? 0.5 : opt.stagger;
  var max = 0; for (var i = 0; i < items.length; i++) max = Math.max(max, items[i][1]);
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i], y = y0 + i * gap, t0 = (it[4] === undefined ? when + i * stag : it[4]);
    label(o, it[0], t0, {x: x0, y: y - 30, just: LEFTJ, size: 30, color: TERM.white, until: opt.until});
    var bw = Math.max(6, Math.round(wMax * it[1] / max));
    var b = solid(o.c, it[2] || TERM.amber, "bar " + it[0], bw, 54); b.threeDLayer = true;
    T(b).property("Anchor Point").setValue([0, 27, 0]); T(b).property("Position").setValue([x0, y + 20, 0]);
    var a = o.t(t0);
    keys(T(b).property("Scale"), [[0, [0.5, 100, 100]], [a, [0.5, 100, 100]], [a + 0.7, [100, 100, 100]]], 0);
    setEase(T(b).property("Scale"), 0.1, 70);
    vis(b, a, opt.until === undefined ? o.d : o.t(opt.until), 0, 0.3, o.d);
    word(o, it[3], t0 + 0.6, {font: TF.mono, size: 44, color: it[2] || TERM.amber, x: x0 + bw + 24, y: y + 36, just: LEFTJ, track: 0, mode: "fade", until: opt.until});
    out.push(b);
  }
  return out;
}

// lines and nodes drawn in comp coordinates (shape contents live in layer space, so the layer sits at 0,0)
function pathShape(c, pts, color, width, name, closed) {
  var l = c.layers.addShape(); l.name = name || "line";
  var g = l.property("Contents").addProperty("ADBE Vector Group");
  var p = g.property("Contents").addProperty("ADBE Vector Shape - Group");
  var sh = new Shape(); sh.vertices = pts; sh.closed = !!closed; p.property("Path").setValue(sh);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); st.property("Color").setValue(color); st.property("Stroke Width").setValue(width || 3);
  l.threeDLayer = true; T(l).property("Position").setValue([0, 0, 0]);
  return {l: l, st: st, g: g};
}
// draw a path on (Trim Paths end 0 -> 100) from `when` over `dur`
function drawOn(o, p, when, dur) {
  try {
    var tr = p.g.property("Contents").addProperty("ADBE Vector Filter - Trim");
    var a = o.t(when);
    keys(tr.property("End"), [[0, 0], [a, 0], [a + (dur || 0.8), 100]], 0);
    setEase(tr.property("End"), 0.1, 60);
  } catch (e) { writeLn("trim skipped: " + e); vis(p.l, o.t(when), o.d, 0.4, 0.3, o.d); }
}
function dot(c, x, y, r, color, name, z) {
  var l = c.layers.addShape(); l.name = name || "node";
  var g = l.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("Size").setValue([r * 2, r * 2]);
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(color);
  l.threeDLayer = true; T(l).property("Position").setValue([x, y, z || 0]);
  return l;
}
// a dot travelling back and forth between two points; speed in trips per second (expression of time)
function shuttle(o, p0, p1, color, start, speedExpr, phase, r) {
  var d = dot(o.c, p0[0], p0[1], r || 9, color || TERM.amber, "order");
  d.motionBlur = true;
  T(d).property("Position").expression = "var t = Math.max(0, time - " + o.t(start) + "); var s = " + speedExpr + "; var u = (t * s + " + (phase || 0) + ") % 2; u = u > 1 ? 2 - u : u; [" + p0[0] + " + (" + (p1[0] - p0[0]) + ") * u, " + p0[1] + " + (" + (p1[1] - p0[1]) + ") * u, 0];";
  vis(d, o.t(start), o.d, 0.3, 0.3, o.d);
  return d;
}

// a document recreated as type (real titles only), sliding in at `when`. lines: as docComp
var _docs = 0;
function doc(o, lines, when, opt) {
  opt = opt || {};
  var dc = docComp("Doc " + (++_docs), opt.w || 1000, opt.h || 1300, lines);
  var x = opt.x === undefined ? W / 2 : opt.x, y = opt.y === undefined ? H / 2 : opt.y;
  var l = c3(o.c, dc, [x, y, opt.z || 0]); T(l).property("Scale").setValue([opt.scale || 62, opt.scale || 62, 100]);
  var a = o.t(when);
  keysOut(T(l).property("Position"), [[a, [x + 1400, y + 40, opt.z || 0]], [a + 0.8, [x, y, opt.z || 0]]]);
  keysOut(T(l).property("Y Rotation"), [[a, -28], [a + 0.8, opt.ry === undefined ? -8 : opt.ry]]);
  vis(l, a, opt.until === undefined ? o.d : o.t(opt.until), 0, 0.3, o.d);
  EVENTS.push(["slide", when]);
  return {l: l, comp: dc};
}
// highlighter wipe inside a doc comp (doc-local pixels); `when` is SCENE time, the doc comp shares the shot's clock
function highlight(o, dc, x, y, w, h, when) {
  var hl = solid(dc, TERM.amber, "highlight", w, h); hl.blendingMode = BlendingMode.MULTIPLY;
  T(hl).property("Anchor Point").setValue([0, h / 2]); T(hl).property("Position").setValue([x, y]);
  var a = o.t(when);
  keys(T(hl).property("Scale"), [[0, [0.5, 100, 100]], [a, [0.5, 100, 100]], [a + 0.5, [100, 100, 100]]], 0);
  vis(hl, a, 1e9, 0, 0, 1e9);
}
// a source/quote card: the words as typeset text (with or without quotation marks) and its source
function quote(o, lines, source, when, opt) {
  opt = opt || {};
  var x = opt.x === undefined ? W / 2 : opt.x, y = opt.y === undefined ? H / 2 : opt.y, w = opt.w || 1400, lh = opt.lh || 64;
  var h = lines.length * lh + 170;
  var p = box(o, w, h, x, y, 30); vis(p, o.t(when), opt.until === undefined ? o.d : o.t(opt.until), 0.3, 0.3, o.d);
  var y0 = y - h / 2 + 90;
  for (var i = 0; i < lines.length; i++) word(o, lines[i], when + 0.15 + i * (opt.stagger === undefined ? 0.25 : opt.stagger), {x: x - w / 2 + 70, y: y0 + i * lh, just: LEFTJ, size: opt.size || 46, font: opt.font || TF.headReg, color: opt.color || TERM.white, track: 0, mode: "fade", until: opt.until});
  label(o, source, when + 0.5, {x: x - w / 2 + 70, y: y + h / 2 - 50, just: LEFTJ, size: 26, color: TERM.amber, until: opt.until});
  return p;
}

// a public-domain photo plate (and optional cut-out foreground), graded into the palette
function photo(o, file, opt) {
  opt = opt || {};
  var l = o.c.layers.add(img(file)); l.name = "photo " + file; l.threeDLayer = true;
  var z = opt.z === undefined ? 250 : opt.z;
  T(l).property("Position").setValue([W / 2 + (opt.dx || 0), H / 2 + (opt.dy || 0), z]);
  T(l).property("Scale").setValue([opt.scale || 128, opt.scale || 128, 100]);
  var tn = fx(l, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.8, 0.5], "Amount to Tint": opt.tint === undefined ? 70 : opt.tint});
  if (opt.redAt !== undefined) keys(tn.property("Map White To"), [[0, [1, 0.8, 0.5]], [o.t(opt.redAt), [1, 0.8, 0.5]], [o.t(opt.redAt) + 3, [1, 0.42, 0.34]]], 0);
  vis(l, opt.from === undefined ? 0 : o.t(opt.from), opt.until === undefined ? o.d : o.t(opt.until), 0.6, 0.8, o.d);
  if (opt.caption) label(o, opt.caption, o.a, {x: W - 48, y: H - 36, just: RIGHTJ, size: 22, font: TF.headReg, track: 30, mode: "on", until: opt.until});
  return l;
}

// a dark lower-third bar behind text that sits over a photo
function bar(o, y, when, until) { var b = solid(o.c, [0, 0, 0], "bar", 1920, 120); T(b).property("Position").setValue([W / 2, y]); vis(b, o.t(when), until === undefined ? o.d : o.t(until), 0.3, 0.3, o.d); T(b).property("Opacity").expression = "value * 0.72"; return b; }

// music-only act card (12–20 s): act number types on, title rises, an amber rule wipes, slow push
function actCard(name, act, title, dur) {
  var c = comp(name, dur); c.motionBlur = true;
  termBackdrop(c, false);
  var o = {c: c, a: 0, b: dur, d: dur, t: function (x) { return x; }};
  word(o, act, 1.2, {font: TF.mono, size: 44, color: TERM.amber, y: H / 2 - 120, track: 400, mode: "type", cps: 12, until: dur - 1.2, glow: true});
  var r = solid(c, TERM.amber, "rule", 900, 3); r.threeDLayer = true; T(r).property("Position").setValue([W / 2, H / 2 - 70, 0]);
  keys(T(r).property("Scale"), [[0, [0.5, 100, 100]], [2.6, [0.5, 100, 100]], [3.6, [100, 100, 100]]], 0); setEase(T(r).property("Scale"), 0.1, 70);
  vis(r, 2.6, dur - 1.2, 0, 0.6, dur);
  word(o, title, 3.4, {size: Math.min(120, Math.round(2500 / title.length)), y: H / 2 + 70, mode: "rise", until: dur - 1.2, track: 20});
  fgTicker(c, H - 40, false);
  rig(c, dur, {d0: -0.3, d1: 0.4});
  return c;
}

// foreground parallax ticker (as in Scene 1)
function fgTicker(c, y, red) {
  var s = "";
  for (var k = 0; k < 16; k++) s += SYMS[(k * 7) % SYMS.length] + (red ? " ▼" : " ▲") + "      ";
  var t = txt(c, s, TF.mono, 120, red ? TERM.red : TERM.amber, [-300, y, -300], LEFTJ, 20);
  T(t).property("Opacity").setValue(24);
  T(t).property("Position").expression = "value + [-time * 70, 0, 0];";
  return t;
}

// assemble a scene: shots in order, exposure (tension) curve, global finish
// story-turn colour-temperature flip: on each turn the grade jumps cold ("cold") or back to the warm
// amber ("warm") on the exact frame of the word, held until the next turn (Tint on an adjustment layer)
function turnTint(M, turns) {
  if (!turns || !turns.length) return;
  var adj = solid(M, [1, 1, 1], "Turn tint (colour temperature)"); adj.adjustmentLayer = true;
  var tn = fx(adj, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [0.78, 0.86, 1.0], "Amount to Tint": 0});
  var ts = [], vs = [];
  for (var i = 0; i < turns.length; i++) { ts.push(Math.round(turns[i][0] * FPS) / FPS); vs.push(turns[i][1] === "cold" ? 22 : 0); }
  tn.property("Amount to Tint").expression = "var T=[" + ts.join(",") + "],V=[" + vs.join(",") + "],a=0;for(var i=0;i<T.length;i++){if(time>=T[i])a=V[i];}a;";
  for (var j = 0; j < turns.length; j++) EVENTS.push(["turn", +ts[j].toFixed(3), turns[j][1]]);
}
function assemble(name, dur, expo, turns) {
  var M = comp(name, dur); M.motionBlur = true;
  solid(M, [0, 0, 0], "black");
  for (var i = 0; i < SHOTS.length; i++) { var s = SHOTS[i], l = M.layers.add(s.c); l.startTime = s.a; l.inPoint = s.a; l.outPoint = s.b; }
  var ex = solid(M, [0, 0, 0], "Exposure (tension curve)");
  keys(T(ex).property("Opacity"), expo || [[0, 100], [0.6, 0], [dur - 0.8, 0], [dur, 100]], 0);
  turnTint(M, turns);
  finish(M);
  writeLn(name + ": " + SHOTS.length + " shots, " + dur + " s");
  return M;
}

// ---- drawn diagrams: shapes built around the layer origin, the layer sits at pos ----
function shapeAt(c, name, pos) { var l = c.layers.addShape(); l.name = name; l.threeDLayer = true; T(l).property("Position").setValue([pos[0], pos[1], pos[2] || 0]); return l; }
function _grp(l) { return l.property("Contents").addProperty("ADBE Vector Group"); }
function _paint(g, color, width, fill) {
  if (width) { var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); st.property("Color").setValue(color); st.property("Stroke Width").setValue(width); }
  if (fill) g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(fill);
  return g;
}
function addPath(l, pts, color, width, closed, fill) {
  var g = _grp(l), p = g.property("Contents").addProperty("ADBE Vector Shape - Group");
  var sh = new Shape(); sh.vertices = pts; sh.closed = !!closed; p.property("Path").setValue(sh);
  return _paint(g, color, width, fill);
}
function addEllipse(l, d, center, color, width, fill) {
  var g = _grp(l), e = g.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
  e.property("Size").setValue([d, d]); e.property("Position").setValue(center || [0, 0]);
  return _paint(g, color, width, fill);
}
function addRect(l, size, center, color, width, fill) {
  var g = _grp(l), r = g.property("Contents").addProperty("ADBE Vector Shape - Rect");
  r.property("Size").setValue(size); r.property("Position").setValue(center || [0, 0]);
  return _paint(g, color, width, fill);
}
function arcPts(r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([Math.sin(a) * r, -Math.cos(a) * r]); } return p; }
// a spinning rotor: rim + 6 spokes; spinExpr is the Z rotation expression (degrees)
function rotor(o, x, y, r, color, spinExpr) {
  var l = shapeAt(o.c, "rotor", [x, y, 0]);
  for (var k = 0; k < 6; k++) { var a = k * 60 * Math.PI / 180; addPath(l, [[0, 0], [Math.sin(a) * r, -Math.cos(a) * r]], color, 6); }
  addEllipse(l, r * 2, [0, 0], color, 8, null); addEllipse(l, r * 0.3, [0, 0], color, 0, color);
  T(l).property("Z Rotation").expression = spinExpr;
  l.motionBlur = true;
  return l;
}
// a dial from -90° to +90°; needle angle by expression (degrees, 0 = straight up)
function gauge(o, x, y, r, lo, mid, hi, needleExpr, color) {
  var a = shapeAt(o.c, "gauge arc", [x, y, 0]);
  addPath(a, arcPts(r, -90, 90, 36), TERM.amberDim, 6);
  for (var k = -90; k <= 90; k += 30) addPath(a, [arcPts(r - 18, k, k, 1)[0], arcPts(r + 4, k, k, 1)[0]], TERM.amberDim, 4);
  label(o, lo, o.a, {x: x - r, y: y + 44, size: 24, mode: "on"}); label(o, mid, o.a, {x: x, y: y - r - 26, size: 30, color: TERM.white, mode: "on"}); label(o, hi, o.a, {x: x + r, y: y + 44, size: 24, mode: "on"});
  var n = shapeAt(o.c, "gauge needle", [x, y, -2]);
  addPath(n, [[0, 12], [0, -(r - 26)]], color || TERM.amber, 8); addEllipse(n, 30, [0, 0], color || TERM.amber, 0, color || TERM.amber);
  T(n).property("Z Rotation").expression = needleExpr;
  return {arc: a, needle: n};
}
function solarIcon(o, x, y, s, color) { var l = shapeAt(o.c, "solar", [x, y, 0]); addPath(l, [[-s, -s * 0.45], [s, -s * 0.45], [s * 1.25, s * 0.45], [-s * 0.75, s * 0.45]], color, 5, true); addPath(l, [[-s * 0.1, -s * 0.45], [s * 0.25, s * 0.45]], color, 3); addPath(l, [[-s * 0.85, 0], [s * 1.1, 0]], color, 3); addPath(l, [[s * 0.1, s * 0.45], [s * 0.1, s * 0.95]], color, 5); return l; }
function batteryIcon(o, x, y, s, color) { var l = shapeAt(o.c, "battery", [x, y, 0]); addRect(l, [s * 1.6, s], [0, 0], color, 5, null); addRect(l, [s * 0.16, s * 0.4], [s * 0.88, 0], color, 0, color); addRect(l, [s * 0.9, s * 0.6], [-s * 0.25, 0], color, 0, color); return l; }
function windIcon(o, x, y, s, color, spinExpr) {
  var t = shapeAt(o.c, "wind tower", [x, y, 0]); addPath(t, [[0, 0], [0, s * 1.4]], color, 6);
  var b = shapeAt(o.c, "wind blades", [x, y, -1]);
  for (var k = 0; k < 3; k++) { var a = k * 120 * Math.PI / 180; addPath(b, [[0, 0], [Math.sin(a) * s, -Math.cos(a) * s]], color, 7); }
  addEllipse(b, 18, [0, 0], color, 0, color);
  T(b).property("Z Rotation").expression = spinExpr || "time * 90";
  return {tower: t, blades: b};
}
// a pylon whose origin is its base (so it topples from the ground); (x, y) is the base
function tower(o, x, y, s, color) { var l = shapeAt(o.c, "pylon", [x, y, 0]); addPath(l, [[-s * 0.35, 0], [0, -2 * s], [s * 0.35, 0]], color, 4); addPath(l, [[-s * 0.5, -s * 1.55], [s * 0.5, -s * 1.55]], color, 4); addPath(l, [[-s * 0.4, -s * 1.1], [s * 0.4, -s * 1.1]], color, 4); return l; }
function showAt(o, l, when, until) { vis(l, o.t(when), until === undefined ? o.d : o.t(until), 0.3, 0.3, o.d); return l; }
// deterministic pseudo-random in [0, 1) for layout (no visible patterns, unlike i * k % n)
function rnd(i, k) { var x = Math.sin(i * 12.9898 + (k || 0) * 78.233) * 43758.5453; return x - Math.floor(x); }
// an archive photo shown as a floating print (for sources below full-frame resolution): graded into the
// palette, soft shadow, slight turn; slides in at `when`. opt: w, x, y, z, ry, tint, caption, until
function printPhoto(o, file, when, opt) {
  opt = opt || {};
  var item = img(file), w = opt.w || 900, s = w / item.width * 100;
  var l = o.c.layers.add(item); l.name = "print " + file; l.threeDLayer = true;
  var x = opt.x === undefined ? W / 2 : opt.x, y = opt.y === undefined ? H / 2 : opt.y, z = opt.z === undefined ? -20 : opt.z;
  T(l).property("Scale").setValue([s, s, 100]);
  fx(l, "Tint", {"Map Black To": [0.02, 0.02, 0.03], "Map White To": [1, 0.86, 0.62], "Amount to Tint": opt.tint === undefined ? 55 : opt.tint});
  shadow(l);
  var a = o.t(when);
  keysOut(T(l).property("Position"), [[a, [x + 140, y + 30, z + 120]], [a + 0.7, [x, y, z]]]);
  keysOut(T(l).property("Y Rotation"), [[a, -14], [a + 0.7, opt.ry === undefined ? -5 : opt.ry]]);
  vis(l, a, opt.until === undefined ? o.d : o.t(opt.until), 0.25, 0.3, o.d);
  if (opt.caption) label(o, opt.caption, when + 0.3, {x: W - 48, y: H - 36, just: RIGHTJ, size: 22, font: TF.headReg, track: 30, mode: "on", until: opt.until});
  return l;
}
// a full-frame backdrop photo (soft, dim): graded, at Z +300
function backdropPhoto(o, file, when, opt) {
  opt = opt || {};
  var item = img(file), s = (opt.cover || 1.35) * W / item.width * 100;
  var l = o.c.layers.add(item); l.name = "backdrop " + file; l.threeDLayer = true;
  T(l).property("Position").setValue([W / 2, H / 2, opt.z === undefined ? 300 : opt.z]);
  T(l).property("Scale").setValue([s, s, 100]);
  fx(l, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.8, 0.5], "Amount to Tint": 85});
  vis(l, o.t(when), opt.until === undefined ? o.d : o.t(opt.until), 0.8, 0.6, o.d);
  T(l).property("Opacity").expression = "value * " + (opt.opacity || 0.45);
  if (opt.caption) label(o, opt.caption, when + 0.3, {x: W - 48, y: H - 36, just: RIGHTJ, size: 22, font: TF.headReg, track: 30, mode: "on", until: opt.until});
  return l;
}
// a 3-layer photo shot inside a Shot: layers visible from `from` to `until` (scene times), credit bottom right
function photoShot(o, dir, opt) {
  opt = opt || {};
  var L = photoParallax(o.c, dir, {tint: opt.tint, redAt: opt.redAt === undefined ? undefined : o.t(opt.redAt)});
  var a = opt.from === undefined ? 0 : o.t(opt.from), b = opt.until === undefined ? o.d : o.t(opt.until);
  vis(L.bg, a, b, 0.5, 0.6, o.d); vis(L.mid, a, b, 0.5, 0.6, o.d); vis(L.near, a, b, 0.5, 0.6, o.d);
  if (opt.caption) label(o, opt.caption, opt.from === undefined ? o.a : opt.from, {x: W - 48, y: H - 36, just: RIGHTJ, size: 22, font: TF.headReg, track: 30, mode: "on", until: opt.until});
  return L;
}

// a real map (Natural Earth outlines, maps.jsx). opt: color, fill, width, only (region names), dim (names
// drawn dim), when (scene time it draws on), scale/offset to reposition. Returns {name: {l, fill, stroke}}.
function mapDraw(o, key, opt) {
  opt = opt || {};
  var m = MAPS[key], out = {}, sc = opt.scale || 1, dx = opt.dx || 0, dy = opt.dy || 0;
  for (var name in m.regions) {
    if (opt.only && opt.only.indexOf(name) < 0) continue;
    var dim = opt.dim && opt.dim.indexOf(name) >= 0;
    var l = o.c.layers.addShape(); l.name = "map " + name;
    var g = l.property("Contents").addProperty("ADBE Vector Group");
    var polys = m.regions[name];
    for (var i = 0; i < polys.length; i++) {
      var pts = []; for (var k = 0; k < polys[i].length; k++) pts.push([polys[i][k][0] * sc + dx, polys[i][k][1] * sc + dy]);
      var p = g.property("Contents").addProperty("ADBE Vector Shape - Group"); var sh = new Shape(); sh.vertices = pts; sh.closed = true; p.property("Path").setValue(sh);
    }
    var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); st.property("Color").setValue(dim ? TERM.amberDim : (opt.color || TERM.amber)); st.property("Stroke Width").setValue(opt.width || 3);
    var fl = g.property("Contents").addProperty("ADBE Vector Graphic - Fill"); fl.property("Color").setValue(opt.fill || TERM.panel);
    l.threeDLayer = true; T(l).property("Position").setValue([0, 0, opt.z || 20]);
    vis(l, o.t(opt.when === undefined ? o.a : opt.when), opt.until === undefined ? o.d : o.t(opt.until), 0.5, 0.4, o.d);
    out[name] = {l: l, fill: fl, stroke: st};
  }
  return out;
}
function mapPoint(o, key, name, opt) { var m = MAPS[key], sc = (opt && opt.scale) || 1; return [m.points[name][0] * sc + ((opt && opt.dx) || 0), m.points[name][1] * sc + ((opt && opt.dy) || 0)]; }
// a pin + label on a map point
function pin(o, xy, text, when, opt) {
  opt = opt || {};
  var d = dot(o.c, xy[0], xy[1], 12, opt.color || TERM.red, "pin " + text, -5); showAt(o, d, when, opt.until);
  var r = shapeAt(o.c, "pin ring", [xy[0], xy[1], -5]); addEllipse(r, 46, [0, 0], opt.color || TERM.red, 3, null); showAt(o, r, when, opt.until);
  T(r).property("Scale").expression = "var t = (time % 1.2) / 1.2; [100 + t * 90, 100 + t * 90, 100];";
  T(r).property("Opacity").expression = "value * (1 - (time % 1.2) / 1.2)";
  label(o, text, when + 0.15, {x: xy[0] + (opt.lx || 0), y: xy[1] + (opt.ly === undefined ? -40 : opt.ly), size: opt.size || 30, color: opt.color || TERM.red, until: opt.until});
  return d;
}

// ---- paper props (documents are the one place paper stock appears in the terminal palette) ----
// archival ticker tape: a paper strip with symbols and arrows (no invented prices); scrolls inside its comp
function tapeComp(name, up, speedExpr) {
  var c = comp(name, 300, 3600, 120);
  solid(c, TERM.paper, "tape paper");
  var n = solid(c, [0.5, 0.5, 0.5], "tape grain"); fx(n, "Fractal Noise", {"Contrast": 120, "Transform/Scale": 3}); n.blendingMode = BlendingMode.MULTIPLY; T(n).property("Opacity").setValue(14);
  var s = ""; for (var r = 0; r < 12; r++) for (var i = 0; i < SYMS.length; i++) s += SYMS[i] + (up ? " ▲" : " ▼") + "     ";
  var t = txt(c, s, TF.mono, 58, up ? [0.05, 0.45, 0.25] : [0.62, 0.08, 0.06], [40, 80], LEFTJ, 20);
  T(t).property("Position").expression = "[40 - (" + (speedExpr || "time * 300") + ") % 1800, 80];";
  return c;
}
// a rubber stamp on paper: red outline and letters, roughened ink, multiply
function stampComp2(name, lines, size, w, h) {
  var c = comp(name, 60, w, h);
  var bx = c.layers.addShape(); var g = bx.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([w - 24, h - 24]);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); st.property("Color").setValue([0.72, 0.1, 0.08]); st.property("Stroke Width").setValue(Math.max(6, size / 9));
  T(bx).property("Position").setValue([w / 2, h / 2]);
  var lh = size * 1.1, y0 = h / 2 - (lines.length - 1) * lh / 2 + size * 0.36;
  for (var i = 0; i < lines.length; i++) txt(c, lines[i], TF.head, size, [0.72, 0.1, 0.08], [w / 2, y0 + i * lh], CENTER, 50);
  var adj = solid(c, [1, 1, 1], "ink"); adj.adjustmentLayer = true;
  fx(adj, "Roughen Edges", {"Border": size > 80 ? 3 : 1.6, "Edge Sharpness": 1.6, "Scale": 60});
  return c;
}
// a folder: paper back, tab and label (our own prop: no real letterhead)
function folderComp(name, labelText, w, h) {
  var c = comp(name, 60, w, h);
  var f = c.layers.addShape(); var g = f.property("Contents").addProperty("ADBE Vector Group");
  var tabW = Math.min(w * 0.62, 120 + (labelText ? labelText.length * 19 : 0));
  g.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([tabW, 70]);
  g.property("Contents").property(1).property("Position").setValue([-w / 2 + 40 + tabW / 2, -h / 2 + 35]);
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue([0.80, 0.76, 0.66]);
  var g2 = f.property("Contents").addProperty("ADBE Vector Group");
  g2.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([w, h - 60]);
  g2.property("Contents").property(1).property("Position").setValue([0, 30]);
  g2.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue([0.86, 0.82, 0.72]);
  T(f).property("Position").setValue([w / 2, h / 2]);
  var n = solid(c, [0.5, 0.5, 0.5], "paper grain"); fx(n, "Fractal Noise", {"Contrast": 110, "Transform/Scale": 3}); n.blendingMode = BlendingMode.MULTIPLY; T(n).property("Opacity").setValue(12);
  if (labelText) txt(c, labelText, TF.mono, 26, TERM.ink, [100, 46], LEFTJ, 40);
  return c;
}
// slide a 3D layer in with inertia (ease-out cubic) from a direction; paper props get the house drop shadow
function slideIn(o, l, when, pos, from, ry) {
  var a = o.t(when);
  keysOut(T(l).property("Position"), [[a, [pos[0] + from[0], pos[1] + from[1], pos[2] || 0]], [a + 0.8, pos]]);
  if (ry !== undefined) keysOut(T(l).property("Z Rotation"), [[a, ry * 2], [a + 0.8, ry]]);
  vis(l, a, o.d, 0, 0.3, o.d);
  EVENTS.push(["slide", when]);
  return l;
}
// a folder or binder dropped onto the surface: falls with gravity (ease-in), lands with a 2-frame settle
function dropIn(o, l, when, pos, rz) {
  var a = o.t(when), z = pos[2] || 0;
  keys(T(l).property("Position"), [[a, [pos[0], pos[1] - 40, z - 700]], [a + 0.32, [pos[0], pos[1], z]]], 0);
  setEase(T(l).property("Position"), 0.1, 85);
  keys(T(l).property("Scale"), [[a + 0.32, [101.5, 101.5, 100]], [a + 0.32 + 2 * F, [100, 100, 100]]], 0);
  if (rz !== undefined) T(l).property("Z Rotation").setValue(rz);
  vis(l, a, o.d, 0, 0.3, o.d);
  EVENTS.push(["drop", when + 0.32]);
  return l;
}
// events the mix reads (paper slides get friction, stamps a thump): printed at build time
var EVENTS = [];
function logEvents(scene) { var s = []; for (var i = 0; i < EVENTS.length; i++) s.push('["' + EVENTS[i][0] + '",' + Math.round(EVENTS[i][1] * 100) / 100 + (EVENTS[i][2] ? ',"' + EVENTS[i][2] + '"' : '') + ']'); writeLn("EVENTS " + scene + " [" + s.join(",") + "]"); }
