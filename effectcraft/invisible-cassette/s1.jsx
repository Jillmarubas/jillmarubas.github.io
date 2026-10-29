// Scene 1, "The crash no human could see" + title card, built in EffectCraft.
// Run: effectcraft-cli script /abs/path/s1.jsx --empty --save-as /abs/path/s1.ecproj
// Film times are voiceover times + 4.0 s (the cold open); they match ../../remotion/src/invisible-cassette/cues_s1.json.
#include "lib.jsx"

var END = 124.5;
var S = {desk: 4.0, cards: 27.08, floor: 41.18, wire: 56.14, back: 70.22, snap: 79.52, stamp: 92.08, loop: 95.0, dark: 108.3, title: 109.0};
var SYMS = "ACN  PG  MMM  AAPL  JNJ  GE  XOM  KO  IBM  WMT  HPQ  CAT  MCD  DIS  BA  T  ";

/* -------------------------------------------------------------- precomps */
// Ticker tape: manila strip with symbols and arrows (JetBrains Mono has the arrow glyphs)
function tapeComp(name, up) {
  var c = comp(name, 30, 3000, 96);
  var bg = c.layers.add(img("manila.png"));
  T(bg).property("Scale").setValue([3000 / 2400 * 100, 96 / 1600 * 100 * 1.0, 100]);
  T(bg).property("Position").setValue([1500, 48]);
  var s = "", arrow = up ? "▲" : "▼";
  var parts = SYMS.split("  ");
  for (var r = 0; r < 6; r++) for (var i = 0; i < parts.length; i++) if (parts[i]) s += parts[i] + " " + arrow + "   ";
  var t = txt(c, s, FONT.glyph, 44, up ? COL.olive : COL.ink, [0, 64], ParagraphJustification.LEFT_JUSTIFY, 40);
  return {comp: c, text: t};
}

// A price card: company name, "TRADED AT", price
function priceComp(name, company, price, rgb) {
  var c = comp(name, 30, 660, 420);
  var bg = c.layers.add(img("manila.png"));
  T(bg).property("Scale").setValue([660 / 2400 * 100, 420 / 1600 * 100, 100]); T(bg).property("Position").setValue([330, 210]);
  var rule = solid(c, [0.63, 0.24, 0.16], "rule", 660, 3); T(rule).property("Position").setValue([330, 30]); T(rule).property("Opacity").setValue(35);
  txt(c, company, FONT.display, 64, COL.ink, [44, 120], ParagraphJustification.LEFT_JUSTIFY, 60);
  txt(c, "TRADED AT", FONT.monoReg, 26, COL.inkSoft, [46, 190], ParagraphJustification.LEFT_JUSTIFY, 100);
  var p = txt(c, price, FONT.mono, 108, rgb, [40, 330], ParagraphJustification.LEFT_JUSTIFY);
  return {comp: c, price: p};
}

// Wall of market boards, drawn: bars and arrows only, no invented figures. Panels turn crimson.
function boardsComp() {
  var c = comp("Boards", 30, 2700, 1180);
  var bg = solid(c, [0.02, 0.025, 0.03], "bg");
  var cols = 10, rows = 6, pw = 240, ph = 160, gap = 24;
  for (var i = 0; i < cols * rows; i++) {
    var cx = 40 + (i % cols) * (pw + gap) + pw / 2, cy = 40 + Math.floor(i / cols) * (ph + gap) + ph / 2;
    var l = c.layers.addShape(); l.name = "panel " + i;
    for (var r = 0; r < 3; r++) {
      var b = l.property("Contents").addProperty("ADBE Vector Group");
      var w = 60 + ((i * 37 + r * 53) % 100);
      var rr = b.property("Contents").addProperty("ADBE Vector Shape - Rect"); rr.property("Size").setValue([w, 20]); rr.property("Position").setValue([-pw / 2 + 18 + w / 2, -44 + r * 44]);
      var f = b.property("Contents").addProperty("ADBE Vector Graphic - Fill");
      // amber, then crimson once this panel's turn comes (seeded per panel), flickering
      f.property("Color").expression = "seedRandom(" + i + ", true); var th = 1 + random(9); var hot = time > th; var k = 0.78 + 0.22 * Math.sin(time * (8 + random(9)) + " + r + "); hot ? [0.75 * k, 0.22 * k, 0.17 * k, 1] : [0.96 * k, 0.62 * k, 0.04 * k, 1];";
    }
    var g = l.property("Contents").addProperty("ADBE Vector Group");
    var fr = g.property("Contents").addProperty("ADBE Vector Shape - Rect"); fr.property("Size").setValue([pw, ph]);
    g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue([0.03, 0.035, 0.045]);
    var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); st.property("Color").setValue([0.12, 0.14, 0.17]); st.property("Stroke Width").setValue(2);
    T(l).property("Position").setValue([cx, cy]);
  }
  return c;
}

function folderComp() {
  var c = comp("Report folder", 30, 1000, 660);
  var bg = c.layers.add(img("manila.png"));
  T(bg).property("Scale").setValue([1000 / 2400 * 100, 660 / 1600 * 100, 100]); T(bg).property("Position").setValue([500, 330]);
  fx(bg, "Tint", {"Map White To": [0.92, 0.86, 0.74], "Amount to Tint": 30});
  txt(c, "REPORT OF THE STAFFS OF THE CFTC AND SEC  ·  30 SEPT 2010", FONT.monoReg, 24, COL.inkSoft, [60, 90], ParagraphJustification.LEFT_JUSTIFY, 80);
  txt(c, "Findings Regarding the Market\rEvents of May 6, 2010", "PlayfairDisplay-Bold", 58, COL.ink, [60, 190], ParagraphJustification.LEFT_JUSTIFY);
  var rule = solid(c, [0.35, 0.3, 0.23], "rule", 880, 3); T(rule).property("Position").setValue([500, 600]); T(rule).property("Opacity").setValue(40);
  return c;
}

function ticketComp() {
  var c = comp("Sell ticket", 30, 400, 160);
  var bg = c.layers.add(img("manila.png"));
  T(bg).property("Scale").setValue([400 / 2400 * 100, 160 / 1600 * 100, 100]); T(bg).property("Position").setValue([200, 80]);
  txt(c, "AUTOMATED ORDER", FONT.monoReg, 22, COL.inkSoft, [26, 42], ParagraphJustification.LEFT_JUSTIFY, 200);
  txt(c, "SELL", FONT.mono, 46, COL.crimson, [26, 94], ParagraphJustification.LEFT_JUSTIFY);
  txt(c, "E-MINI S&P 500 FUTURES", FONT.monoReg, 20, COL.ink, [26, 132], ParagraphJustification.LEFT_JUSTIFY, 60);
  return c;
}

/* -------------------------------------------------------------- shots */
var boards = boardsComp();
var folder = folderComp();

function shotDesk() { // film 4.0 – 27.08
  var d = S.cards - S.desk, c = comp("S1A Desk", d);
  desk(c); lamp(c, 130);
  var tp = tapeComp("Tape down", false);
  keys(T(tp.text).property("Position"), [[0, [0, 64]], [d, [-2600, 64]]], 0);
  setEase(T(tp.text).property("Position"), 85, 5); // accelerating: the market speeds up
  var tl = c.layers.add(tp.comp); tl.threeDLayer = true; shadow(tl);
  var hit = 19.48; // "evaporated": the tape slides off the desk edge into shadow
  keys(T(tl).property("Position"), [[0, [W / 2, H / 2 + 270, 0]], [hit, [W / 2, H / 2 + 270, 0]], [hit + 1.3, [W / 2 + 120, H / 2 + 1250, 120]]], 0);
  setEase(T(tl).property("Position"), 0.1, 70);
  keys(T(tl).property("Z Rotation"), [[hit, -7], [hit + 1.3, 14]], 60);
  keys(T(tl).property("Opacity"), [[hit + 0.6, 100], [hit + 1.3, 0]], 0);
  var t1 = txt(c, "MAY 6, 2010", FONT.mono, 92, COL.gold, [W / 2, H / 2 - 220, 0], null, 80); typeOn(t1, "MAY 6, 2010", 0.18, 16); win(t1, 0.15, 13.4, 0.1, 0.6);
  var t2 = txt(c, "14:42 EDT", FONT.monoReg, 48, COL.mono, [W / 2, H / 2 - 130, 0], null, 120); typeOn(t2, "14:42 EDT", 2.48, 14); win(t2, 2.45, 13.4, 0.1, 0.6);
  var t3 = txt(c, "36 MINUTES", FONT.display, 150, COL.manila, [W / 2, H / 2 - 120, 0], null, 60); rise(t3, 14.68); win(t3, 14.6, d - 0.1, 0.1, 0.5);
  var t4 = txt(c, "~$1 TRILLION", FONT.display, 120, COL.gold, [W / 2, H / 2 + 40, 0], null, 60); rise(t4, 16.84); win(t4, 16.8, d - 0.1, 0.1, 0.5);
  dust(c); penFG(c, W - 260, H - 60, -16);
  rig(c, d, {d0: -0.5, d1: 0.8});
  return c;
}

function shotCards() { // film 27.08 – 41.18
  var d = S.floor - S.cards, c = comp("S1B Price cards", d);
  desk(c); lamp(c, 120);
  var a = priceComp("Card Accenture", "ACCENTURE", "$0.01", COL.crimson);
  var b = priceComp("Card Sothebys", "SOTHEBY'S", "$100,000", COL.gold);
  keys(T(a.price).property("Opacity"), [[5.98 - 0.001, 0], [6.2, 100]], 0);
  keys(T(b.price).property("Opacity"), [[9.92 - 0.001, 0], [10.15, 100]], 0);
  var la = c.layers.add(a.comp); la.threeDLayer = true; shadow(la);
  keysOut(T(la).property("Position"), [[0.32, [-900, H / 2 - 20, 0]], [1.25, [W / 2 - 380, H / 2 - 20, 0]]]);
  keysOut(T(la).property("Z Rotation"), [[0.32, -14], [1.25, -5]]);
  var lb = c.layers.add(b.comp); lb.threeDLayer = true; shadow(lb);
  keysOut(T(lb).property("Position"), [[8.44, [W + 900, H / 2 - 10, 0]], [9.37, [W / 2 + 380, H / 2 - 10, 0]]]);
  keysOut(T(lb).property("Z Rotation"), [[8.44, 12], [9.37, 4]]);
  T(lb).property("Opacity").setValue(100);
  keys(T(lb).property("Opacity"), [[8.43, 0], [8.44, 100]], 0);
  var n = txt(c, "Both trades were later cancelled.", FONT.monoReg, 30, COL.mono, [W / 2, H / 2 + 300, 0], null, 40); typeOn(n, "Both trades were later cancelled.", 11.52, 28); win(n, 11.5, d - 0.1, 0.1, 0.4);
  dust(c); penFG(c, 220, H - 40, 12);
  rig(c, d, {x0: -40, x1: 40, d0: 0.4, d1: -0.4});
  return c;
}

function shotFloor() { // film 41.18 – 56.14 (illustration: the drawn boards stand in until an archive photo is licensed)
  var d = S.wire - S.floor, c = comp("S1C Trading floor (drawn)", d);
  solid(c, [0.02, 0.022, 0.03], "void");
  var bl = c.layers.add(boards); bl.threeDLayer = true;
  T(bl).property("Position").setValue([W / 2, H / 2, 350]);
  keys(T(bl).property("Opacity"), [[11.2, 100], [12.8, 0]], 40); // "inside computers": the boards give way
  // orders as light streaks, flying past at three depths
  for (var i = 0; i < 70; i++) {
    var s = solid(c, i % 5 === 0 ? COL.crimson : COL.gold, "streak " + i, 300, 3);
    s.threeDLayer = true;
    s.blendingMode = BlendingMode.ADD;
    T(s).property("Position").expression = "seedRandom(" + i + ", true); var sp = 2600 + random(2600); var z = -150 + random(500); var x = ((random(4200) + (time - 11.4) * sp) % 4200) - 1100; [x, random(-80, 1160), z];";
    keys(T(s).property("Opacity"), [[11.3, 0], [12.4, 85]], 40);
    fx(s, "Fast Box Blur", {"Blur Radius": 1});
  }
  var t = txt(c, "FRACTIONS OF A SECOND", FONT.mono, 44, COL.mono, [W / 2, H / 2 + 14, 0], null, 300); rise(t, 12.98, 0.9); win(t, 12.9, d - 0.1, 0.1, 0.4);
  // foreground occlusion: a dark railing across the bottom, out of focus at Z = -250
  var rail = solid(c, [0.06, 0.05, 0.045], "FG railing (Z-250)", 2600, 60); rail.threeDLayer = true; T(rail).property("Position").setValue([W / 2, H - 70, -250]);
  var fc = rig(c, d, {y0: 40, y1: 0, d0: -0.6, d1: 0.7});
  fc.property("Camera Options").property("Focus Distance").expression = "350 - transform.position[2]"; // the boards are the subject here
  var lab = txt(c, "Illustration", FONT.ui, 20, COL.mono, [W - 48, H - 36], ParagraphJustification.RIGHT_JUSTIFY, 40);
  keys(T(lab).property("Opacity"), [[0, 55], [11.2, 55], [12.8, 0]], 0);
  return c;
}

function stripComp(name, s, rgb) {
  var c = comp(name, 30, 1240, 128);
  var bg = c.layers.add(img("manila.png"));
  T(bg).property("Scale").setValue([1240 / 2400 * 100, 128 / 1600 * 100, 100]); T(bg).property("Position").setValue([620, 64]);
  var t = txt(c, s, FONT.type, 60, rgb || COL.ink, [40, 86], ParagraphJustification.LEFT_JUSTIFY, 50);
  return {comp: c, text: t, s: s};
}
function shotWire() { // film 56.14 – 70.22
  var d = S.back - S.wire, c = comp("S1D Newswire", d);
  desk(c); lamp(c, 110);
  var rows = [["NO WAR DECLARED", 0.28, -170, -2, null], ["NO BANK COLLAPSE", 2.56, 10, 1.5, null], ["GREECE: DEBT FEARS", 7.32, 190, -1, COL.amberInk]];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], sc = stripComp("Strip " + i, r[0], r[4]);
    typeOn(sc.text, r[0], r[1], 20);
    var l = c.layers.add(sc.comp); l.threeDLayer = true; shadow(l);
    keysOut(T(l).property("Position"), [[r[1] - 0.3, [-700, H / 2 + r[2], 0]], [r[1] + 0.3, [W / 2, H / 2 + r[2], 0]]]);
    T(l).property("Z Rotation").setValue(r[3]);
    keys(T(l).property("Opacity"), [[r[1] - 0.31, 0], [r[1] - 0.3, 100], [11.86, 100], [13.0, 45]], 0);
  }
  dust(c); penFG(c, W - 200, 120, 24);
  rig(c, d, {d0: -0.4, d1: 0.5});
  return c;
}

function shotBack() { // film 70.22 – 79.52: the recovery, a brighter beat
  var d = S.snap - S.back, c = comp("S1E Recovery", d);
  desk(c); lamp(c, 150);
  var tp = tapeComp("Tape up", true);
  keys(T(tp.text).property("Position"), [[0, [-2600, 64]], [d, [-200, 64]]], 0);
  setEase(T(tp.text).property("Position"), 5, 85); // slowing as it steadies
  var tl = c.layers.add(tp.comp); tl.threeDLayer = true; shadow(tl);
  keysOut(T(tl).property("Position"), [[0, [W / 2, H + 500, 0]], [1.4, [W / 2, H / 2 + 220, 0]]]);
  T(tl).property("Z Rotation").setValue(-5);
  var t = txt(c, "RECOVERED", FONT.display, 130, COL.manila, [W / 2, H / 2 - 60, 0], null, 80); rise(t, 3.9); win(t, 3.85, d - 0.1, 0.1, 0.4);
  dust(c); penFG(c, 240, H - 50, 10);
  rig(c, d, {d0: 0.3, d1: -0.3});
  return c;
}

function polaroidComp() {
  var c = comp("Polaroid", 30, 768, 900);
  solid(c, [0.95, 0.93, 0.9], "frame");
  var ph = c.layers.add(boards);
  ph.startTime = -5.5; // freeze on the boards mid-plunge
  ph.timeRemapEnabled = true;
  ph.property("Time Remap").setValueAtTime(0, 5.5);
  T(ph).property("Scale").setValue([44, 44, 100]); T(ph).property("Position").setValue([384, 300]);
  fx(ph, "Hue/Saturation", {"Master Saturation": -45});
  var mask = solid(c, [0.95, 0.93, 0.9], "border cover"); // keep the photo inside its 700 x 520 window
  var m = mask.property("Masks").addProperty("Mask"); var sh = new Shape();
  sh.vertices = [[34, 40], [734, 40], [734, 560], [34, 560]]; sh.closed = true; m.property("Mask Path").setValue(sh); m.inverted = true;
  var cap = txt(c, "MAY 6, 2010 // 14:42:00 EDT", FONT.mono, 36, [0.16, 0.15, 0.12], [40, 830], ParagraphJustification.LEFT_JUSTIFY, 40);
  typeOn(cap, "MAY 6, 2010 // 14:42:00 EDT", 0.6, 22);
  return c;
}
function shotSnap() { // film 79.52 – 92.08
  var d = S.stamp - S.snap, c = comp("S1F Polaroid and report", d);
  desk(c); lamp(c, 105);
  var pc = c.layers.add(polaroidComp()); pc.threeDLayer = true; shadow(pc);
  keysOut(T(pc).property("Position"), [[0.15, [W / 2 - 300, H / 2 - 160, -60]], [0.85, [W / 2 - 300, H / 2 - 20, 0]]]);
  keysOut(T(pc).property("Z Rotation"), [[0.15, -7], [0.85, -4]]);
  T(pc).property("Scale").setValue([88, 88, 100]);
  var fl = c.layers.add(folder); fl.threeDLayer = true; shadow(fl);
  keysOut(T(fl).property("Position"), [[4.86, [W + 700, H / 2 + 40, 0]], [5.86, [W / 2 + 330, H / 2 + 40, 0]]]);
  keysOut(T(fl).property("Z Rotation"), [[4.86, 6], [5.86, 2]]);
  keys(T(fl).property("Opacity"), [[4.85, 0], [4.86, 100]], 0);
  // shutter flash: one soft 3-frame pulse (flash-safe: a single flash)
  var fsh = solid(c, [1, 0.96, 0.9], "Shutter flash");
  keys(T(fsh).property("Opacity"), [[0, 0], [1 / FPS, 55], [3 / FPS, 0]], 0);
  dust(c, 0.7);
  var cam = rig(c, d, {x0: 0, x1: 300, d0: -0.5, d1: 0.4});
  return c;
}

function shotStamp() { // film 92.08 – 95.0: "Nobody had decided to crash the market."
  var d = S.loop - S.stamp, c = comp("S1G Stamp", d);
  desk(c); lamp(c, 90);
  var fl = c.layers.add(folder); fl.threeDLayer = true; shadow(fl);
  T(fl).property("Position").setValue([W / 2, H / 2, 0]); T(fl).property("Z Rotation").setValue(2);
  var st = c.layers.add(stampComp("Stamp erased", ["~$1 TRILLION ERASED", "36 MINUTES"], 54, 900, 270));
  st.threeDLayer = true; st.blendingMode = BlendingMode.MULTIPLY;
  T(st).property("Position").setValue([W / 2 - 40, H / 2 + 150, -1]); T(st).property("Z Rotation").setValue(-6);
  slam(st, 1.54);
  var cam = rig(c, d, {push: 1.04, d0: -0.5, d1: -0.2});
  // impact shake, 3 frames
  T(cam).property("Position").expression = "var h = 1.54; (time > h && time < h + 0.13) ? value + [0, Math.sin((time - h) * 180) * 6, 0] : value;";
  return c;
}

function shotLoop() { // film 95.0 – 109.0
  var d = S.title - S.loop, c = comp("S1H Feedback loop", d);
  c.motionBlur = true;
  var v = solid(c, COL.void, "void");
  var glow = solid(c, [0, 0, 0], "glow pool"); glow.threeDLayer = true; T(glow).property("Position").setValue([W / 2, H / 2, 350]); T(glow).property("Scale").setValue([140, 140, 100]);
  fx(glow, "Gradient Ramp", {"Start of Ramp": [W / 2, H / 2], "Start Color": [0.25, 0.17, 0.05], "End of Ramp": [W / 2 + 900, H / 2], "End Color": [0, 0, 0], "Ramp Shape": 2});
  glow.blendingMode = BlendingMode.ADD;
  var tk = ticketComp();
  var ANG = "var t = time - 3.88; var a = Math.max(0, t) * 18 + Math.pow(Math.max(0, time - 8.94), 2) * 26;";
  var RING = "var r = 400 * ease(time, 3.88, 5.48, 0, 1);";
  for (var i = 0; i < 12; i++) {
    var l = c.layers.add(tk); l.threeDLayer = true; l.motionBlur = true; shadow(l);
    T(l).property("Position").expression = ANG + RING + " var th = (" + i + " / 12 * 360 + a) * Math.PI / 180; [" + (W / 2) + " + Math.cos(th) * r, " + (H / 2) + " + Math.sin(th) * r * 0.62, 0];";
    T(l).property("Z Rotation").expression = ANG + " var th = (" + i + " / 12 * 360 + a) * Math.PI / 180; Math.cos(th) * 8;";
    if (i === 0) keys(T(l).property("Opacity"), [[1.18, 0], [1.7, 100]], 40);
    else keys(T(l).property("Opacity"), [[3.88, 0], [5.0, 100]], 40);
  }
  var ring = c.layers.addShape(); ring.name = "loop path";
  var g = ring.property("Contents").addProperty("ADBE Vector Group");
  var e = g.property("Contents").addProperty("ADBE Vector Shape - Ellipse"); e.property("Size").setValue([800, 496]);
  var s = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); s.property("Color").setValue(COL.gold); s.property("Stroke Width").setValue(2);
  T(ring).property("Position").setValue([W / 2, H / 2]); ring.threeDLayer = true;
  keys(T(ring).property("Opacity"), [[3.88, 0], [5.48, 60]], 40);
  rig(c, d, {d0: 0.4, d1: -0.9});
  return c;
}

function shotTitle() { // film 109.0 – 124.5
  var d = END - S.title, c = comp("S1I Title card", d);
  desk(c); lamp(c, 130);
  var sh = card(c, 1400, 820, [W / 2, H / 2, 0], "Case file");
  var k = txt(c, "SMALL PRINT  ·  CASE FILE 01", FONT.monoReg, 26, COL.inkSoft, [W / 2 - 620, H / 2 - 320, -1], ParagraphJustification.LEFT_JUSTIFY, 200);
  var st = c.layers.add(stampComp("Stamp title", ["THE GHOST", "IN THE SYSTEM"], 110, 1160, 330));
  st.threeDLayer = true; st.blendingMode = BlendingMode.MULTIPLY;
  T(st).property("Position").setValue([W / 2, H / 2 - 20, -1]); T(st).property("Z Rotation").setValue(-4);
  slam(st, 1.1);
  var sub = txt(c, "AN INVESTIGATION", FONT.mono, 34, [0.23, 0.2, 0.15], [W / 2, H / 2 + 300, -1], null, 400); typeOn(sub, "AN INVESTIGATION", 3.2, 12);
  dust(c); penFG(c, W - 230, H - 70, -14);
  rig(c, d, {d0: 0.3, d1: -0.5});
  return c;
}

/* -------------------------------------------------------------- main timeline */
var M = comp("Scene1", END);
M.motionBlur = true;
solid(M, [0, 0, 0], "black");
function place(item, start, end) { var l = M.layers.add(item); l.startTime = start; l.inPoint = start; l.outPoint = end; return l; }
place(shotDesk(), S.desk, S.cards);
place(shotCards(), S.cards, S.floor);
place(shotFloor(), S.floor, S.wire);
place(shotWire(), S.wire, S.back);
place(shotBack(), S.back, S.snap);
place(shotSnap(), S.snap, S.stamp);
place(shotStamp(), S.stamp, S.loop);
place(shotLoop(), S.loop, S.title);
place(shotTitle(), S.title, END);

// exposure curve: brightness follows tension (black open, darker into the plunge, lift on the recovery,
// colder and darker into the loop, snap to black, title up, fade out)
var ex = solid(M, [0, 0, 0], "Exposure (tension curve)");
keys(T(ex).property("Opacity"), [[0, 100], [4.0, 100], [4.6, 0], [17.4, 0], [70.2, 18], [70.4, 4], [79.5, 4], [79.6, 10], [108.3, 28], [108.6, 100], [109.0, 100], [109.8, 0], [123.7, 0], [124.5, 100]], 0);

// global texture: organic film grain (overlay, 12 %) and a 18 % lens vignette
var gr = solid(M, [0.5, 0.5, 0.5], "Film grain");
fx(gr, "Fractal Noise", {"Contrast": 160, "Transform/Scale": 6, "Complexity": 2});
gr.property("Effects").property("Fractal Noise").property("Evolution").expression = "time * 2400";
gr.blendingMode = BlendingMode.OVERLAY;
T(gr).property("Opacity").setValue(12);
var vg = solid(M, [0, 0, 0], "Vignette"); vg.adjustmentLayer = true;
fx(vg, "CC Vignette", {"Amount": 18});
writeLn("Scene1 layers: " + M.numLayers);
