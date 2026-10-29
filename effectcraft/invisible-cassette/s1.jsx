// Scene 1, "The crash no human could see" + title card. MagnatesMedia-style documentary look,
// trading-terminal palette (black, amber phosphor, ticker green up, red down). Built in EffectCraft.
// Run: effectcraft-cli script /abs/path/s1.jsx --empty --save-as /abs/path/s1.ecproj
// Film times = voiceover times + 4.0 s; they match ../../remotion/src/invisible-cassette/cues_s1.json.
// Keyword times inside each shot come from words.json (shot-relative seconds).
#include "mm.jsx"

var END = 124.5;
var S = {open: 4.0, stakes: 17.42, quotes: 27.08, floor: 41.18, wire: 56.14, back: 70.22, report: 79.52, turn: 92.08, loop: 95.0, title: 109.0};
var LEFT = ParagraphJustification.LEFT_JUSTIFY, RIGHT = ParagraphJustification.RIGHT_JUSTIFY;

// effects whose parameter names may differ between EffectCraft builds: never fail the whole build on one
function tryFx(l, name, v) { try { return fx(l, name, v); } catch (e) { writeLn("skipped " + name + ": " + e); return null; } }
function phosphor(l) { return tryFx(l, "Glow", {"Glow Threshold": 40, "Glow Radius": 22, "Glow Intensity": 0.6}); }
function shot(name, a, b) { var c = comp(name, b - a); c.motionBlur = true; return {c: c, d: b - a}; }

// a terminal panel: thin amber outline over a dark fill (stroke added first so it draws on top)
function panel(c, w, h, pos, stroke) {
  var l = c.layers.addShape(); l.name = "panel";
  var g = l.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([w, h]);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(stroke || TERM.amberDim); st.property("Stroke Width").setValue(2);
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(TERM.panel);
  l.threeDLayer = true; T(l).property("Position").setValue(pos);
  return l;
}
// foreground parallax: big out-of-focus ticker symbols at Z -300 drifting left (no figures)
function fgTicker(c, y, red) {
  var s = "";
  for (var k = 0; k < 16; k++) s += SYMS[(k * 7) % SYMS.length] + (red ? " ▼" : " ▲") + "      ";
  var t = txt(c, s, TF.mono, 120, red ? TERM.red : TERM.amber, [-300, y, -300], LEFT, 20);
  T(t).property("Opacity").setValue(28);
  T(t).property("Position").expression = "value + [-time * 70, 0, 0];";
  return t;
}
// boxed terminal tag (precomp) for slams: SEC, CFTC, TRADES CANCELLED, SELL ORDER, PROGRAM
function tagComp(name, s, rgb, size, w, h, font) {
  var c = comp(name, 30, w, h);
  var box = c.layers.addShape();
  var g = box.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Rect").property("Size").setValue([w - 16, h - 16]);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(rgb); st.property("Stroke Width").setValue(Math.max(4, size / 12));
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(TERM.black);
  T(box).property("Position").setValue([w / 2, h / 2]);
  txt(c, s, font || TF.head, size, rgb, [w / 2, h / 2 + size * 0.36], null, 40);
  return c;
}
function addAt(c, item, pos) { var l = c.layers.add(item); l.threeDLayer = true; T(l).property("Position").setValue(pos); return l; }
// text that turns from one colour to another (Fill effect keyed)
function recolor(l, a, b, t0, t1) { var f = fx(l, "Fill", {"Color": a}); keys(f.property("Color"), [[t0, a], [t1, b]], 0); return f; }
function fadeOut(l, a, b) { keys(T(l).property("Opacity"), [[a, 100], [b, 0]], 0); }

/* ------------------------------------------------------------------ shots */

function shotOpen() { // film 4.0 – 17.42: the date, the time, the Dow falling
  var o = shot("S1A Cold open · Dow", S.open, S.stakes), c = o.c, d = o.d;
  termBackdrop(c, false);
  panel(c, 1500, 640, [W / 2, H / 2 + 10, 40]);
  var t1 = txt(c, "MAY 6, 2010", TF.mono, 84, TERM.amber, [W / 2, H / 2 - 190, 0], null, 60);
  typeOn(t1, "MAY 6, 2010", 0.18, 14); phosphor(t1);
  var clock = txt(c, "14:42:00 EDT", TF.monoReg, 46, TERM.white, [W / 2, H / 2 - 110, 0], null, 120);
  clock.property("Source Text").expression = 'var s = Math.floor(Math.max(0, time - 2.48)); "14:42:" + (s < 10 ? "0" : "") + s + " EDT";';
  keys(T(clock).property("Opacity"), [[0, 0], [2.47, 0], [2.48, 100]], 0);
  var lab = txt(c, "DOW JONES INDUSTRIAL AVERAGE", TF.headReg, 34, TERM.grey, [W / 2, H / 2 - 10, 0], null, 160);
  keys(T(lab).property("Opacity"), [[0, 0], [5.2, 0], [5.6, 100]], 0);
  var dow = txt(c, "10,868.12", TF.mono, 190, TERM.amber, [W / 2, H / 2 + 170, 0], null, 0);
  counter(dow, 10868.12, 9869.62, 6.0, 12.4, 2);
  keys(T(dow).property("Opacity"), [[0, 0], [5.4, 0], [5.8, 100]], 0);
  recolor(dow, TERM.amber, TERM.red, 6.6, 7.6); phosphor(dow);
  var delta = txt(c, "▼ 998.50 POINTS", TF.mono, 56, TERM.red, [W / 2, H / 2 + 262, 0], null, 60);
  slamIn(delta, 12.4);
  fgTicker(c, H - 40, true);
  rig(c, d, {d0: -0.4, d1: 0.6});
  return c;
}

function shotStakes() { // film 17.42 – 27.08: 36 minutes, nearly $1 trillion, evaporated
  var o = shot("S1B Stakes · $1 trillion", S.stakes, S.quotes), c = o.c, d = o.d;
  termBackdrop(c, true);
  var m = txt(c, "36 MINUTES", TF.head, 210, TERM.white, [W / 2, H / 2 - 120, 0], null, 30); slamIn(m, 1.26);
  var tr = txt(c, "≈ $1,000,000,000,000", TF.mono, 116, TERM.red, [W / 2, H / 2 + 70, 0], null, 0);
  counter(tr, 0, 1e12, 3.42, 4.9, 0, "≈ $");
  keys(T(tr).property("Opacity"), [[0, 0], [3.41, 0], [3.42, 100], [6.5, 100], [7.3, 0]], 0);
  phosphor(tr);
  var mv = txt(c, "IN MARKET VALUE", TF.headReg, 44, TERM.grey, [W / 2, H / 2 + 160, 0], null, 200);
  keys(T(mv).property("Opacity"), [[0, 0], [5.4, 0], [5.7, 100], [6.8, 100], [7.6, 0]], 0);
  breakApart(tr, 6.06, 1.0); breakApart(mv, 6.4, 1.0); // "evaporated"
  fgTicker(c, H - 50, true);
  rig(c, d, {d0: 0.5, d1: -0.6});
  return c;
}

// one quote row (precomp): symbol, company, then the price lands on its spoken word
function rowComp(name, sym, nm, price, prgb, pAt) {
  var c = comp(name, 30, 1500, 150);
  solid(c, TERM.panel, "row bg");
  var edge = solid(c, prgb, "row edge", 10, 150); T(edge).property("Position").setValue([5, 75]);
  txt(c, sym, TF.mono, 52, TERM.amber, [44, 94], LEFT, 40);
  txt(c, nm, TF.head, 66, TERM.white, [250, 98], LEFT, 20);
  var dash = txt(c, "- - -", TF.monoReg, 56, TERM.grey, [1460, 96], RIGHT);
  keys(T(dash).property("Opacity"), [[0, 100], [pAt - 0.001, 100], [pAt, 0]], 0);
  var p = txt(c, price, TF.mono, 92, prgb, [1460, 108], RIGHT);
  keys(T(p).property("Opacity"), [[0, 0], [pAt - 0.001, 0], [pAt, 100]], 0);
  keys(T(p).property("Scale"), [[pAt, [125, 125, 100]], [pAt + 0.2, [100, 100, 100]]], 0);
  return c;
}
function shotQuotes() { // film 27.08 – 41.18: Accenture a cent, Sotheby's $100,000
  var o = shot("S1C Quotes · ACN, BID", S.quotes, S.floor), c = o.c, d = o.d;
  termBackdrop(c, false);
  var hd = txt(c, "SYMBOL      COMPANY                                        LAST", TF.monoReg, 28, TERM.grey, [W / 2 - 750, H / 2 - 230, 0], LEFT, 60);
  keys(T(hd).property("Opacity"), [[0, 0], [0.2, 0], [0.5, 100]], 0);
  var rows = [["ACN", "ACCENTURE", "$0.01", TERM.red, 5.98, 0.32, -110], ["BID", "SOTHEBY'S", "$100,000", TERM.amber, 11.44, 8.32, 70]];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], x = W / 2, y = H / 2 + r[6];
    var l = addAt(c, rowComp("Row " + r[0], r[0], r[1], r[2], r[3], r[4]), [x, y, 0]);
    keysOut(T(l).property("Position"), [[r[5], [x - 1700, y, 0]], [r[5] + 0.7, [x, y, 0]]]);
    keys(T(l).property("Opacity"), [[0, 0], [r[5] - 0.001, 0], [r[5], 100]], 0);
  }
  var st = addAt(c, tagComp("Tag cancelled", "TRADES LATER CANCELLED", TERM.red, 54, 860, 110), [W / 2, H / 2 + 270, -20]);
  T(st).property("Z Rotation").setValue(-3);
  slam(st, 12.6);
  fgTicker(c, 70, false);
  rig(c, d, {x0: -50, x1: 50, d0: 0.4, d1: -0.4});
  return c;
}

// The NYSE floor: Carol M. Highsmith's public-domain photo (Library of Congress), cut in PhotoCraft into a
// background plate (booth removed with Content-Aware Fill) and the foreground booth + pillar.
// Graded into the terminal palette; the amber turns red as the crash runs, then the floor gives way to the machines.
function photoLayer(c, file, z, scale, name) {
  var l = c.layers.add(img(file)); l.name = name; l.threeDLayer = true;
  T(l).property("Position").setValue([W / 2, H / 2, z]);
  T(l).property("Scale").setValue([scale, scale, 100]);
  var tn = fx(l, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.8, 0.5], "Amount to Tint": 70});
  keys(tn.property("Map White To"), [[0, [1, 0.8, 0.5]], [6.4, [1, 0.8, 0.5]], [10.4, [1, 0.42, 0.34]]], 0);
  keys(T(l).property("Opacity"), [[0, 100], [10.6, 100], [12.2, 0]], 40); // "inside computers"
  return l;
}
function shotFloor() { // film 41.18 – 56.14: the NYSE floor (archive photo, parallax), then inside the machines
  var o = shot("S1D Floor → machines", S.floor, S.wire), c = o.c, d = o.d;
  solid(c, TERM.black, "void");
  // BG at Z +250, FG at Z -200; FG scale chosen so both line up through the lens at the start:
  // s_fg = s_bg * (ZOOM - 200) / (ZOOM + 250)
  var sBg = 128, sFg = sBg * (ZOOM - 200) / (ZOOM + 250);
  photoLayer(c, "nyse_bg.png", 250, sBg, "BG floor plate (Z+250)");
  photoLayer(c, "nyse_fg.png", -200, sFg, "FG booth + pillar (Z-200)");
  var bar = solid(c, [0, 0, 0], "lower-third bar", 1920, 120); T(bar).property("Position").setValue([W / 2, H - 190]);
  keys(T(bar).property("Opacity"), [[0, 0], [1.5, 0], [1.8, 70], [6.2, 70], [6.8, 0]], 0);
  var ny = txt(c, "NEW YORK STOCK EXCHANGE", TF.mono, 50, TERM.amber, [W / 2, H - 172], null, 200);
  typeOn(ny, "NEW YORK STOCK EXCHANGE", 1.78, 18); phosphor(ny);
  keys(T(ny).property("Opacity"), [[0, 100], [6.2, 100], [6.8, 0]], 0);
  // orders as light streaks at three depths (the screen goes inside the computers)
  for (var i = 0; i < 70; i++) {
    var s = solid(c, i % 4 === 0 ? TERM.red : TERM.amber, "order " + i, 300, 3);
    s.threeDLayer = true; s.blendingMode = BlendingMode.ADD;
    T(s).property("Position").expression = "seedRandom(" + i + ", true); var sp = 2600 + random(2600); var z = -150 + random(500); var x = ((random(4200) + (time - 10.8) * sp) % 4200) - 1100; [x, random(-80, 1160), z];";
    keys(T(s).property("Opacity"), [[0, 0], [10.9, 0], [12.0, 85]], 40);
  }
  var t = txt(c, "FRACTIONS OF A SECOND", TF.mono, 64, TERM.white, [W / 2, H / 2 + 22, 0], null, 240);
  rise(t, 12.98, 0.8); keys(T(t).property("Opacity"), [[0, 0], [12.95, 0], [12.98, 100]], 0);
  // camera trucks right and pushes in: the booth slides past the floor (parallax); floor sharp, booth soft
  var cam = rig(c, d, {x0: -70, x1: 90, y0: 30, y1: 0, d0: -0.5, d1: 0.6});
  cam.property("Camera Options").property("Focus Distance").expression = "time < 11 ? 250 - transform.position[2] : -transform.position[2]";
  var lab = txt(c, "Archive photo: NYSE trading floor · Carol M. Highsmith, Library of Congress", TF.headReg, 22, TERM.grey, [W - 48, H - 36], RIGHT, 30);
  keys(T(lab).property("Opacity"), [[0, 80], [10.6, 80], [12.2, 0]], 0);
  return c;
}

function shotWire() { // film 56.14 – 70.22: no war, no bank, only Greece; no explanation
  var o = shot("S1E Newswire", S.wire, S.back), c = o.c, d = o.d;
  termBackdrop(c, false);
  panel(c, 1500, 560, [W / 2, H / 2 - 20, 30]);
  var hd = txt(c, "NEWSWIRE  ·  MAY 6, 2010", TF.monoReg, 28, TERM.grey, [W / 2 - 700, H / 2 - 250, 0], LEFT, 120);
  keys(T(hd).property("Opacity"), [[0, 0], [0.1, 0], [0.3, 100]], 0);
  var rows = [["> NO WAR DECLARED", 0.0, -130, TERM.white], ["> NO BANK COLLAPSE", 2.26, 0, TERM.white], ["> GREECE: DEBT FEARS", 7.32, 130, TERM.amber]];
  var dimAt = 11.16;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var t = txt(c, r[0], TF.mono, 72, r[3], [W / 2 - 700, H / 2 + r[2], 0], LEFT, 30);
    typeOn(t, r[0], r[1], 22);
    if (i === 2) phosphor(t);
    keys(T(t).property("Opacity"), [[0, 100], [dimAt, 100], [dimAt + 0.4, 12]], 0);
  }
  var ne = txt(c, "NO EXPLANATION", TF.head, 190, TERM.red, [W / 2, H / 2 + 70, -60], null, 30);
  slamIn(ne, dimAt); phosphor(ne);
  fgTicker(c, H - 40, true);
  rig(c, d, {d0: -0.4, d1: 0.5});
  return c;
}

function shotBack() { // film 70.22 – 79.52: the recovery, the brighter beat
  var o = shot("S1F Recovery", S.back, S.report), c = o.c, d = o.d;
  termBackdrop(c, false);
  panel(c, 1500, 560, [W / 2, H / 2 + 10, 40], TERM.green);
  var lab = txt(c, "DOW JONES INDUSTRIAL AVERAGE", TF.headReg, 34, TERM.grey, [W / 2, H / 2 - 150, 0], null, 160);
  var dow = txt(c, "9,869.62", TF.mono, 190, TERM.green, [W / 2, H / 2 + 40, 0], null, 0);
  counter(dow, 9869.62, 10520.32, 0.6, 5.0, 2); phosphor(dow);
  var rec = txt(c, "RECOVERED MOST OF IT", TF.head, 80, TERM.white, [W / 2, H / 2 + 150, 0], null, 60);
  rise(rec, 3.9, 0.6); keys(T(rec).property("Opacity"), [[0, 0], [3.85, 0], [3.9, 100]], 0);
  var cl = txt(c, "CLOSE, MAY 6  ·  ▼ 347.80 ON THE DAY", TF.monoReg, 30, TERM.grey, [W / 2, H / 2 + 225, 0], null, 60);
  keys(T(cl).property("Opacity"), [[0, 0], [5.0, 0], [5.4, 100]], 0);
  fgTicker(c, 70, false);
  rig(c, d, {d0: 0.3, d1: -0.3});
  return c;
}

function shotReport() { // film 79.52 – 92.08: the investigators and their report
  var o = shot("S1G Investigators · report", S.report, S.turn), c = o.c, d = o.d;
  termBackdrop(c, false);
  var inv = txt(c, "INVESTIGATORS", TF.mono, 96, TERM.amber, [W / 2, H / 2, 0], null, 200);
  typeOn(inv, "INVESTIGATORS", 0.26, 10); phosphor(inv); fadeOut(inv, 4.3, 4.8);
  // the report cover, typeset from the real document (title, authors, date; nothing invented)
  var doc = docComp("Report cover", 1000, 1300, [
    ["FINDINGS REGARDING THE", TF.serif, 62, TERM.ink, 80, 300],
    ["MARKET EVENTS OF", TF.serif, 62, TERM.ink, 80, 380],
    ["MAY 6, 2010", TF.serif, 62, TERM.ink, 80, 460],
    ["REPORT OF THE STAFFS OF THE CFTC AND SEC", TF.headReg, 30, TERM.ink, 80, 600, 40],
    ["TO THE JOINT ADVISORY COMMITTEE", TF.headReg, 30, TERM.ink, 80, 645, 40],
    ["ON EMERGING REGULATORY ISSUES", TF.headReg, 30, TERM.ink, 80, 690, 40],
    ["SEPTEMBER 30, 2010", TF.headReg, 30, TERM.ink, 80, 1180, 100]
  ]);
  var hl = solid(doc, TERM.amber, "highlight", 900, 260); hl.blendingMode = BlendingMode.MULTIPLY;
  T(hl).property("Anchor Point").setValue([0, 130]); T(hl).property("Position").setValue([66, 392]);
  keys(T(hl).property("Scale"), [[0, [0, 100, 100]], [9.0, [0, 100, 100]], [9.5, [100, 100, 100]]], 0); // "trading records"
  var dl = addAt(c, doc, [W / 2 + 300, H / 2, 0]);
  T(dl).property("Scale").setValue([64, 64, 100]);
  keysOut(T(dl).property("Position"), [[4.86, [W + 800, H / 2 + 40, 0]], [5.7, [W / 2 + 300, H / 2, 0]]]);
  keysOut(T(dl).property("Y Rotation"), [[4.86, -30], [5.7, -10]]);
  keys(T(dl).property("Opacity"), [[0, 0], [4.85, 0], [4.86, 100]], 0);
  var sec = addAt(c, tagComp("Tag SEC", "SEC", TERM.amber, 90, 300, 140), [W / 2 - 480, H / 2 - 100, -40]); slamIn(sec, 4.9);
  var cftc = addAt(c, tagComp("Tag CFTC", "CFTC", TERM.amber, 90, 300, 140), [W / 2 - 480, H / 2 + 80, -40]); slamIn(cftc, 6.46);
  var flash = solid(c, [1, 0.95, 0.85], "freeze flash"); // one 3-frame pulse (flash-safe: single)
  keys(T(flash).property("Opacity"), [[0, 0], [1 / FPS, 50], [3 / FPS, 0]], 0);
  rig(c, d, {x0: 0, x1: 120, d0: -0.4, d1: 0.4});
  return c;
}

function shotTurn() { // film 92.08 – 95.0: "Nobody had decided to crash the market."
  var o = shot("S1H Nobody", S.turn, S.loop), c = o.c, d = o.d;
  solid(c, TERM.black, "black");
  var a = txt(c, "NOBODY", TF.head, 240, TERM.white, [W / 2, H / 2 - 30, 0], null, 40); slamIn(a, 0.02);
  var b = txt(c, "DECIDED TO CRASH IT", TF.head, 96, TERM.red, [W / 2, H / 2 + 100, 0], null, 60); slamIn(b, 1.54); phosphor(b);
  var cam = rig(c, d, {push: 1.04, d0: -0.3, d1: 0});
  T(cam).property("Position").expression = "var h = 1.54; (time > h && time < h + 0.13) ? value + [0, Math.sin((time - h) * 180) * 7, 0] : value;";
  return c;
}

function shotLoop() { // film 95.0 – 109.0: one sell order, programs reacting to each other, the loop
  var o = shot("S1I Feedback loop", S.loop, S.title), c = o.c, d = o.d;
  termBackdrop(c, true);
  var RX = 600, RY = 340;
  var ring = c.layers.addShape(); ring.name = "loop path";
  var g = ring.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("Size").setValue([RX * 2, RY * 2]);
  var rs = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); rs.property("Stroke Width").setValue(3);
  keys(rs.property("Color"), [[8.9, TERM.amberDim], [9.6, TERM.red]], 0);
  ring.threeDLayer = true; T(ring).property("Position").setValue([W / 2, H / 2, 20]);
  keys(T(ring).property("Opacity"), [[0, 0], [3.9, 0], [5.0, 80]], 40);
  var core = addAt(c, tagComp("Sell order", "SELL ORDER", TERM.red, 66, 480, 130), [W / 2, H / 2 - 30, 0]); slamIn(core, 1.18);
  var sub = txt(c, "AUTOMATED  ·  E-MINI S&P 500 FUTURES", TF.monoReg, 26, TERM.grey, [W / 2, H / 2 + 70, 0], null, 60);
  keys(T(sub).property("Opacity"), [[0, 0], [1.86, 0], [2.2, 100]], 0);
  var node = tagComp("Program", "PROGRAM", TERM.amber, 32, 220, 70, TF.mono);
  for (var i = 0; i < 8; i++) {
    var th = i / 8 * 2 * Math.PI - Math.PI / 2;
    var n = addAt(c, node, [W / 2 + Math.cos(th) * RX, H / 2 + Math.sin(th) * RY, 0]);
    keys(T(n).property("Opacity"), [[0, 0], [4.5 + i * 0.07, 0], [4.7 + i * 0.07, 100]], 0);
  }
  // orders racing round the loop, accelerating once the loop is named
  for (var k = 0; k < 28; k++) {
    var dot = solid(c, k % 3 ? TERM.amber : TERM.red, "order " + k, 16, 16); dot.threeDLayer = true; dot.motionBlur = true;
    T(dot).property("Position").expression = "var t = Math.max(0, time - 3.9); var a = t * 0.7 + Math.pow(Math.max(0, time - 8.94), 2) * 0.9 + " + (k / 28 * 2 * Math.PI) + "; [" + (W / 2) + " + Math.cos(a) * " + RX + ", " + (H / 2) + " + Math.sin(a) * " + RY + ", 0];";
    keys(T(dot).property("Opacity"), [[0, 0], [4.0, 0], [5.0, 100]], 0);
  }
  var fl = txt(c, "FEEDBACK LOOP", TF.head, 88, TERM.white, [W / 2, H / 2 + 165, -40], null, 60); slamIn(fl, 8.94);
  rig(c, d, {x0: -60, x1: 60, d0: 0.4, d1: -0.9});
  return c;
}

function shotTitle() { // film 109.0 – 124.5: title card, music only
  var o = shot("S1J Title card", S.title, END), c = o.c, d = o.d;
  termBackdrop(c, false);
  var a = txt(c, "THE GHOST", TF.head, 240, TERM.amber, [W / 2, H / 2 - 40, 0], null, 40); slamIn(a, 1.1); phosphor(a);
  var b = txt(c, "IN THE SYSTEM", TF.head, 110, TERM.white, [W / 2, H / 2 + 100, 0], null, 260); slamIn(b, 1.5);
  var s = txt(c, "AN INVESTIGATION", TF.mono, 36, TERM.grey, [W / 2, H / 2 + 200, 0], null, 400); typeOn(s, "AN INVESTIGATION", 3.2, 12);
  var cur = solid(c, TERM.amber, "cursor", 22, 40); cur.threeDLayer = true; // steady 1 Hz blink, small: flash-safe
  T(cur).property("Position").setValue([W / 2 + 250, H / 2 + 186, 0]);
  T(cur).property("Opacity").expression = "time < 4.6 ? 0 : (Math.floor(time * 2) % 2 ? 0 : 100)";
  fgTicker(c, H - 40, false);
  rig(c, d, {d0: 0.3, d1: -0.5});
  return c;
}

/* ------------------------------------------------------------------ main timeline */
var M = comp("Scene1", END);
M.motionBlur = true;
solid(M, [0, 0, 0], "black");
function place(item, start, end) { var l = M.layers.add(item); l.startTime = start; l.inPoint = start; l.outPoint = end; return l; }
place(shotOpen(), S.open, S.stakes);
place(shotStakes(), S.stakes, S.quotes);
place(shotQuotes(), S.quotes, S.floor);
place(shotFloor(), S.floor, S.wire);
place(shotWire(), S.wire, S.back);
place(shotBack(), S.back, S.report);
place(shotReport(), S.report, S.turn);
place(shotTurn(), S.turn, S.loop);
place(shotLoop(), S.loop, S.title);
place(shotTitle(), S.title, END);

// exposure curve: brightness follows tension (dark through the plunge, lift on the recovery,
// darker into the loop, snap to black, title up, fade out)
var ex = solid(M, [0, 0, 0], "Exposure (tension curve)");
keys(T(ex).property("Opacity"), [[0, 100], [4.0, 100], [4.6, 0], [17.4, 0], [70.2, 15], [70.4, 0], [79.5, 0], [79.6, 8], [108.3, 25], [108.6, 100], [109.0, 100], [109.8, 0], [123.7, 0], [124.5, 100]], 0);
finish(M); // smoke, grain, vignette
writeLn("Scene1 layers: " + M.numLayers);
