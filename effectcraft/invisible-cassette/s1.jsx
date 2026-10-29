// Scene 1, "The crash no human could see" + title card. Built from the production file's visual
// directives (see DIRECTIVES.md) in the trading-terminal palette, with the paste's craft rules.
// Film times: the voice starts at 4.0 s (cold open), so LEAD = 4.0 here.
#include "kit2.jsx"
SC = 1; LEAD = 4.0;
var END = 124.5;
var S = {open: 4.0, stakes: 17.42, quotes: 27.08, floor: 41.18, wire: 56.14, but: at("but nothing"), back: 70.22, report: 79.52, turn: 92.08, loop: 95.0, title: 109.0};

// the tape as a 3D layer lying on the surface
function tape(o, up, speed, pos, rot) {
  var l = c3(o.c, tapeComp("Tape " + o.name, up, speed), pos); T(l).property("Z Rotation").setValue(rot || 0);
  shadow(l); return l;
}

// A · 00:05 directive: top-down camera pan over the surface; an archival ticker tape scrolls, faster and faster
(function () {
  var o = Shot("S1A Ticker tape", S.open, S.stakes);
  tape(o, false, "time * 260 + time * time * 22", [W / 2, H / 2 + 200, 0], -5);
  word(o, "MAY 6, 2010", at("may"), {font: TF.mono, size: 96, y: 330, color: TERM.amber, mode: "type", cps: 14, track: 60, glow: true});
  word(o, "14:42 EDT", at("42"), {font: TF.monoReg, size: 54, y: 430, mode: "type", cps: 12, track: 120});
  cam(o, {x0: -220, x1: 160, y0: -30, y1: 20, d0: -0.6, d1: 0.7});
})();

// B · 36 minutes, nearly $1 trillion; 00:20 directive: on "evaporated" the tape plunges off the edge into shadow
(function () {
  var o = Shot("S1B Plunge", S.stakes, S.quotes);
  var tE = at("evaporated");
  var tl = tape(o, false, "(time + 13.4) * 260 + (time + 13.4) * (time + 13.4) * 22", [W / 2, H / 2 + 200, 0], -5);
  keys(T(tl).property("Position"), [[0, [W / 2, H / 2 + 200, 0]], [o.t(tE), [W / 2, H / 2 + 200, 0]], [o.t(tE) + 1.2, [W / 2 + 160, H + 700, 160]]], 0);
  setEase(T(tl).property("Position"), 0.1, 70);
  keys(T(tl).property("Z Rotation"), [[o.t(tE), -5], [o.t(tE) + 1.2, 18]], 0);
  var shade = solid(o.c, [0, 0, 0], "edge shadow", 1920, 520); T(shade).property("Position").setValue([W / 2, H + 120]);
  T(shade).property("Opacity").setValue(85);
  word(o, "36 MINUTES", at("36"), {size: 190, y: 300});
  var tr = word(o, "≈ $1 TRILLION", at("$1"), {font: TF.mono, size: 120, y: 470, color: TERM.red, glow: true, until: tE + 1.2});
  label(o, "MARKET VALUE", at("market value"), {y: 550, size: 34, color: TERM.white, until: tE + 1.0});
  breakApart(tr, o.t(tE), 1.0);
  flag(o, "Source: Motley Fool · Better Markets");
  cam(o, {x0: 120, x1: -60, d0: 0.6, d1: -0.7});
})();

// C · the quotes: Accenture a cent, Sotheby's $100,000
function rowComp(name, sym, nm, price, prgb, pAt) {
  var c = comp(name, 60, 1500, 150);
  solid(c, TERM.panel, "row bg");
  var edge = solid(c, prgb, "row edge", 10, 150); T(edge).property("Position").setValue([5, 75]);
  txt(c, sym, TF.mono, 52, TERM.amber, [44, 94], LEFTJ, 40);
  txt(c, nm, TF.head, 66, TERM.white, [250, 98], LEFTJ, 20);
  var dash = txt(c, "- - -", TF.monoReg, 56, TERM.grey, [1460, 96], RIGHTJ);
  keys(T(dash).property("Opacity"), [[0, 100], [pAt - F, 100], [pAt, 0]], 0);
  var p = txt(c, price, TF.mono, 92, prgb, [1460, 108], RIGHTJ);
  slam(p, pAt);
  return c;
}
(function () {
  var o = Shot("S1C Quotes", S.quotes, S.floor);
  label(o, "SYMBOL      COMPANY                                        LAST", o.a + 0.2, {font: TF.monoReg, x: W / 2 - 750, y: H / 2 - 230, just: LEFTJ, size: 28, track: 60, mode: "fade"});
  var rows = [["ACN", "ACCENTURE", "$0.01", TERM.red, at("cent"), at("accenture") - 0.1, -110, [-1700, 0]], ["BID", "SOTHEBY'S", "$100,000", TERM.amber, at("$100"), at("sotheby's") - 0.1, 70, [1700, 0]]];
  for (var i = 0; i < 2; i++) {
    var r = rows[i], l = c3(o.c, rowComp("Row " + r[0], r[0], r[1], r[2], r[3], o.t(r[4])), [W / 2, H / 2 + r[6], 0]);
    slideIn(o, l, r[5], [W / 2, H / 2 + r[6], 0], r[7]);
  }
  flag(o, "Source: NBC News, 6 May 2010");
  cam(o, {x0: -50, x1: 50, d0: 0.6, d1: -0.6});
})();

// D · 00:40 directive: the NYSE floor in 2.5D parallax, the boards turning crimson; then inside the computers
(function () {
  var o = Shot("S1D Floor", S.floor, S.wire, {bg: false});
  solid(o.c, TERM.black, "void");
  var tC = at("inside computers");
  photoShot(o, "nyse", {redAt: at("most of"), until: tC + 1.6, caption: "Archive photo: NYSE trading floor · Carol M. Highsmith, Library of Congress"});
  bar(o, 890, at("new york") - 0.2, at("brokers") + 1.5);
  word(o, "NEW YORK STOCK EXCHANGE", at("new york"), {font: TF.mono, size: 50, y: 908, color: TERM.amber, mode: "type", cps: 22, track: 160, until: at("brokers") + 1.5, glow: true});
  for (var i = 0; i < 70; i++) {
    var s = solid(o.c, i % 4 === 0 ? TERM.red : TERM.amber, "order " + i, 300, 3);
    s.threeDLayer = true; s.blendingMode = BlendingMode.ADD;
    T(s).property("Position").expression = "seedRandom(" + i + ", true); var sp = 2600 + random(2600); var z = -150 + random(500); var x = ((random(4200) + (time - " + o.t(tC) + ") * sp) % 4200) - 1100; [x, random(-80, 1160), z];";
    vis(s, o.t(tC) + 0.2, o.d, 1.0, 0.3, o.d);
  }
  word(o, "< 1 SECOND", at("fractions"), {font: TF.mono, size: 110, y: H / 2, glow: true});
  cam(o, {x0: -70, x1: 90, y0: 30, y1: 0, d0: -0.5, d1: 0.6, aperture: PHOTO_APERTURE});
})();

// E1 · the newswire: no war, no bank collapse, only Greece
(function () {
  var o = Shot("S1E Newswire", S.wire, S.but);
  box(o, 1500, 520, W / 2, H / 2 - 20, 30);
  label(o, "NEWSWIRE · MAY 6, 2010", o.a + 0.2, {x: W / 2 - 700, y: H / 2 - 230, just: LEFTJ, size: 28});
  var rows = [["> WAR: NO", at("war"), -110, TERM.white], ["> BANK COLLAPSE: NO", at("bank"), 0, TERM.white], ["> GREECE: DEBT FEARS", at("greece"), 110, TERM.amber]];
  for (var i = 0; i < 3; i++) word(o, rows[i][0], rows[i][1], {font: TF.mono, size: 70, x: W / 2 - 700, y: H / 2 + rows[i][2], just: LEFTJ, track: 30, mode: "type", cps: 24, color: rows[i][3]});
  cam(o, {d0: -0.6, d1: 0.6});
})();
// E2 · cut on "but": no explanation
(function () {
  var o = Shot("S1E No explanation", S.but, S.back, {red: true});
  // the same wire, now empty: the cold frame lands on "but", the verdict on "explain"
  box(o, 1500, 520, W / 2, H / 2 - 20, 30);
  label(o, "NEWSWIRE · MAY 6, 2010", o.a, {x: W / 2 - 700, y: H / 2 - 230, just: LEFTJ, size: 28});
  word(o, "> _", o.a, {font: TF.mono, size: 70, x: W / 2 - 700, y: H / 2 - 110, just: LEFTJ, track: 30, mode: "on", color: TERM.grey});
  word(o, "NO EXPLANATION", at("explain"), {size: 130, y: H / 2 + 40, color: TERM.red, glow: true});
  cam(o, {push: 1.05, d0: 0.6, d1: -0.6});
})();

// F · thirty-six minutes later: recovered (the release beat, brighter, green)
(function () {
  var o = Shot("S1F Recovered", S.back, S.report);
  tape(o, true, "time * 120", [W / 2, H / 2 + 220, 0], 4);
  word(o, "+36 MINUTES", at("36", S.back), {font: TF.mono, size: 80, y: 300, color: TERM.white});
  word(o, "RECOVERED", at("recovered"), {size: 190, y: 480, color: TERM.green, glow: true});
  cam(o, {x0: 100, x1: -100, d0: 0.6, d1: -0.6});
})();

// G · 01:25 directive: freeze-frame into a distressed Polaroid, shutter snap, typed caption; then the regulators
(function () {
  var o = Shot("S1G Polaroid", S.report, S.turn);
  var pc = comp("Polaroid", 60, 900, 1040);
  solid(pc, TERM.paper, "frame");
  var ph = pc.layers.add(img("layers/nyse/photo.png")); T(ph).property("Scale").setValue([34.2, 34.2, 100]); T(ph).property("Position").setValue([450, 330]);
  fx(ph, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.42, 0.34], "Amount to Tint": 75});
  var n = solid(pc, [0.5, 0.5, 0.5], "distress"); fx(n, "Fractal Noise", {"Contrast": 160, "Transform/Scale": 40}); n.blendingMode = BlendingMode.MULTIPLY; T(n).property("Opacity").setValue(18);
  var cap = txt(pc, "MAY 6, 2010 // 14:42:00 EDT", TF.mono, 40, TERM.ink, [60, 860], LEFTJ, 40);
  typeOn(cap, "MAY 6, 2010 // 14:42:00 EDT", o.t(80.12), 26);
  var pl = c3(o.c, pc, [W / 2 - 330, H / 2, 0]); T(pl).property("Scale").setValue([80, 80, 100]); shadow(pl);
  slideIn(o, pl, S.report + 0.1, [W / 2 - 330, H / 2 + 10, 0], [0, -120], -4);
  var fl = solid(o.c, [1, 0.95, 0.85], "shutter flash"); keys(T(fl).property("Opacity"), [[0, 0], [F, 50], [3 * F, 0]], 0);
  tag(o, "SEC", at("sec"), {x: W / 2 + 470, y: H / 2 - 90, color: TERM.amber, size: 90, w: 320, h: 150});
  tag(o, "CFTC", at("cftc"), {x: W / 2 + 470, y: H / 2 + 100, color: TERM.amber, size: 90, w: 320, h: 150});
  cam(o, {x0: -60, x1: 60, d0: -0.6, d1: 0.6});
})();

// H · 01:50 directive: a red stamp slams onto the incident folder (fact-checked wording)
(function () {
  var o = Shot("S1H Stamp", S.turn, S.loop);
  var f = c3(o.c, folderComp("Incident folder", "INCIDENT FILE · MAY 6, 2010", 1300, 860), [W / 2, H / 2 + 20, 0]); shadow(f);
  T(f).property("Z Rotation").setValue(2);
  var st = c3(o.c, stampComp2("Stamp erased", ["~$1 TRILLION ERASED", "36 MINUTES"], 66, 1000, 300), [W / 2 - 20, H / 2 + 80, -2]);
  st.blendingMode = BlendingMode.MULTIPLY; T(st).property("Z Rotation").setValue(-6);
  var tC = at("crash"); slam(st, o.t(tC)); EVENTS.push(["stamp", tC]);
  var cam1 = cam(o, {push: 1.02, d0: -0.6, d1: 0.5});
  T(cam1).property("Position").expression = "var h = " + o.t(tC) + "; (time > h && time < h + 0.13) ? value + [0, Math.sin((time - h) * 180) * 6, 0] : value;";
})();

// I · one automated sell order, programs reacting to each other: the feedback loop
(function () {
  var o = Shot("S1I Feedback loop", S.loop, S.title, {red: true});
  var RX = 600, RY = 340;
  var ring = shapeAt(o.c, "loop path", [W / 2, H / 2, 20]);
  var g = ring.property("Contents").addProperty("ADBE Vector Group");
  g.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("Size").setValue([RX * 2, RY * 2]);
  var rs = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke"); rs.property("Stroke Width").setValue(3);
  keys(rs.property("Color"), [[0, TERM.amberDim], [o.t(at("feedback")), TERM.amberDim], [o.t(at("feedback")) + 0.6, TERM.red]], 0);
  showAt(o, ring, at("amplified"));
  tag(o, "SELL ORDER", at("sell order") - 0.4, {y: H / 2 - 20, color: TERM.red, size: 66});
  for (var i = 0; i < 8; i++) {
    var th = i / 8 * 2 * Math.PI - Math.PI / 2;
    tag(o, "PROGRAM", at("trading programs") + i * 0.07, {x: W / 2 + Math.cos(th) * RX, y: H / 2 + Math.sin(th) * RY, color: TERM.amber, size: 30, font: TF.mono, z: 0});
  }
  var tA = o.t(at("amplified")), tL = o.t(at("feedback"));
  for (var k = 0; k < 28; k++) {
    var d = dot(o.c, 0, 0, 8, k % 3 ? TERM.amber : TERM.red, "order " + k); d.motionBlur = true;
    T(d).property("Position").expression = "var t = Math.max(0, time - " + tA + "); var a = t * 0.7 + Math.pow(Math.max(0, time - " + tL + "), 2) * 0.9 + " + (k / 28 * 2 * Math.PI) + "; [" + (W / 2) + " + Math.cos(a) * " + RX + ", " + (H / 2) + " + Math.sin(a) * " + RY + ", 0];";
    vis(d, tA, o.d, 0.8, 0.3, o.d);
  }
  word(o, "FEEDBACK LOOP", at("feedback"), {size: 88, y: H / 2 + 150, z: -40});
  cam(o, {x0: -60, x1: 60, d0: 0.6, d1: -0.9});
})();

// J · 02:30 directive: title stamped across aged paper (T2 chime, M3)
(function () {
  var o = Shot("S1J Title", S.title, END);
  var pc = docComp("Title paper", 1500, 900, []);
  var age = solid(pc, [0.55, 0.42, 0.25], "age"); fx(age, "Fractal Noise", {"Contrast": 90, "Transform/Scale": 260}); age.blendingMode = BlendingMode.MULTIPLY; T(age).property("Opacity").setValue(35);
  var vg = solid(pc, [0, 0, 0], "edge burn"); vg.adjustmentLayer = true; fx(vg, "CC Vignette", {"Amount": 60});
  var card = c3(o.c, pc, [W / 2, H / 2, 0]); shadow(card); T(card).property("Z Rotation").setValue(-1.5);
  var st = c3(o.c, stampComp2("Stamp title", ["THE GHOST IN THE SYSTEM", "INVESTIGATION"], 92, 1300, 330), [W / 2, H / 2 - 10, -2]);
  st.blendingMode = BlendingMode.MULTIPLY; T(st).property("Z Rotation").setValue(-4);
  slam(st, 1.1); EVENTS.push(["stamp", S.title + 1.1]);
  cam(o, {d0: 0.6, d1: -0.6});
})();

assemble("Scene1", END, [[0, 100], [4.0, 100], [4.6, 0], [S.stakes, 0], [S.back, 0], [S.report - 0.1, 0], [S.report, 8], [108.3, 25], [108.6, 100], [109.0, 100], [109.8, 0], [123.7, 0], [124.5, 100]],
  [[S.but, "cold"], [S.back, "warm"], [S.turn, "cold"], [S.title, "warm"]]);
logEvents(1);
