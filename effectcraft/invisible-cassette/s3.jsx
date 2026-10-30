// Scene 3, "The physics of the grid" (Act II opens). Scene comp starts 1.0 s before the voice.
// Built to the production file's Scene 3 directives (DIRECTIVES.md): blueprint drafting table, gold traces
// to the generators, the TVA generator hall, protection settings tripping on a South Australia map, the
// Mohave shaft, the 2003 states going dark. On-screen text: keywords and numbers only.
#include "kit2.jsx"
SC = 3;
var END = vo(180.53) + 1.8;
var NODES = [[220, 760], [480, 640], [760, 720], [1040, 600], [1320, 690], [1640, 580], [600, 880], [1180, 860], [900, 480], [1480, 840], [340, 500], [1760, 760]];
var EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 2], [3, 7], [7, 4], [2, 8], [8, 3], [4, 9], [9, 7], [10, 1], [10, 8], [5, 11], [9, 11]];
var GEN = [[10, "THERMAL"], [5, "HYDRO"], [6, "THERMAL"]]; // generator nodes on the drawing
var GOLD = [1, 0.78, 0.3], BLUE_PAPER = [0.05, 0.17, 0.33], CHALK = [0.86, 0.92, 1.0];

// a dot that runs one way from p0 to p1 and repeats (gold current on the drawing)
function pulse(c, p0, p1, color, startLocal, period, phase) {
  var d = dot(c, p0[0], p0[1], 8, color, "current");
  T(d).property("Position").expression = "var t = time - " + startLocal + "; if (t < 0) t = 0; var u = ((t / " + period + ") + " + phase + ") % 1; [" +
    p0[0] + " + (" + (p1[0] - p0[0]) + ") * u, " + p0[1] + " + (" + (p1[1] - p0[1]) + ") * u, 0];";
  T(d).property("Opacity").expression = "time < " + startLocal + " ? 0 : 100";
  glow(d);
  return d;
}

// A · directive 06:00 + 06:45: a blueprint of the network on a drafting table; the network draws itself
// (F8 pencil), then gold current flows along the copper lines to the turbine generators
(function () {
  var o = Shot("S3A Blueprint", 0, vo(16.5));
  // review note (4:58): an electric grid photo behind the drafting table (HAER transmission line, public domain),
  // behind the table, lightly blurred: the insulators and wires fill the top third above the sheet
  var gp = o.c.layers.add(img("layers/powerlines/photo.png")); gp.threeDLayer = true;
  T(gp).property("Position").setValue([W / 2, H / 2 + 90, 400]); T(gp).property("Scale").setValue([118, 118, 100]);
  fx(gp, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [0.42, 0.52, 0.68], "Amount to Tint": 100});
  T(gp).property("Opacity").setValue(90);
  label(o, "Background: Morony–Rainbow transmission line · HAER, Library of Congress", o.a, {x: 48, y: H - 36, just: LEFTJ, size: 20, font: TF.headReg, track: 30, mode: "on"});
  var bp = comp("Blueprint sheet", o.d, 1920, 1080);
  var po = {c: bp, a: o.a, b: o.b, d: o.d, t: o.t};
  solid(bp, BLUE_PAPER, "blueprint paper");
  for (var gx = 0; gx <= 1920; gx += 80) { var l = solid(bp, CHALK, "grid v", 1, 1080); T(l).property("Position").setValue([gx, 540]); T(l).property("Opacity").setValue(10); }
  for (var gy = 0; gy <= 1080; gy += 80) { var l2 = solid(bp, CHALK, "grid h", 1920, 1); T(l2).property("Position").setValue([960, gy]); T(l2).property("Opacity").setValue(10); }
  var n = solid(bp, [0.5, 0.5, 0.5], "paper grain"); fx(n, "Fractal Noise", {"Contrast": 120, "Transform/Scale": 4}); n.blendingMode = BlendingMode.OVERLAY; T(n).property("Opacity").setValue(18);
  for (var k = 0; k < EDGES.length; k++) { var p = pathShape(bp, [NODES[EDGES[k][0]], NODES[EDGES[k][1]]], CHALK, 3, "line"); drawOn(po, p, 0.6 + k * 0.22, 0.6); }
  for (var m = 0; m < NODES.length; m++) { var d = dot(bp, NODES[m][0], NODES[m][1], 10, CHALK, "bus"); vis(d, 0.6 + m * 0.2, o.d, 0.3, 0.3, o.d); }
  var tTh = o.t(at("thermal"));
  for (var g = 0; g < GEN.length; g++) {
    var P = NODES[GEN[g][0]], s = shapeAt(bp, "generator", [P[0], P[1] - 90, 0]);
    addEllipse(s, 80, [0, 0], GOLD, 4, BLUE_PAPER);
    vis(s, tTh + g * 0.3, o.d, 0.3, 0.3, o.d);
    var gt = txt(bp, "G", TF.head, 44, GOLD, [P[0], P[1] - 75], CENTER, 0); vis(gt, tTh + g * 0.3, o.d, 0.3, 0.3, o.d);
    var gl = txt(bp, GEN[g][1], TF.monoReg, 22, GOLD, [P[0], P[1] - 150], CENTER, 120); vis(gl, tTh + g * 0.3 + 0.2, o.d, 0.4, 0.3, o.d);
    var lead = pathShape(bp, [[P[0], P[1] - 50], [P[0], P[1]]], GOLD, 3, "lead"); vis(lead.l, tTh + g * 0.3, o.d, 0.3, 0.3, o.d);
  }
  // gold current along every line, from the generators outward (a few dots per line, staggered)
  for (var e = 0; e < EDGES.length; e++) for (var q = 0; q < 2; q++)
    pulse(bp, NODES[EDGES[e][0]], NODES[EDGES[e][1]], GOLD, tTh + 0.4 + e * 0.08, 1.6 + rnd(e, q) * 0.8, q * 0.5 + rnd(e, 9) * 0.3);
  // the sheet lies on a drafting table, tilted away from the camera
  var sheet = c3(o.c, bp, [W / 2, H / 2 + 190, 60]); T(sheet).property("X Rotation").setValue(-32); T(sheet).property("Scale").setValue([80, 80, 100]);
  shadow(sheet);
  word(o, "THE GRID", at("electrical grid"), {size: 120, y: 190, mode: "rise", glow: true, until: at("for a century")});
  label(o, "PHYSICS", at("unforgiving"), {y: 280, color: TERM.white, size: 34, until: at("for a century")});
  flag(o, "Illustration");
  cam(o, {y0: 60, y1: -10, d0: -0.4, d1: 0.5});
})();

// B · spinning steel: mechanical inertia (TVA generator hall, 1942, three layers)
(function () {
  var o = Shot("S3B Inertia", vo(16.5), vo(24.2), {bg: false});
  photoShot(o, "tva", {caption: "TVA hydroelectric generator room, 1942 · Alfred T. Palmer, Library of Congress"});
  bar(o, 880, at("spinning steel") - 0.2);
  word(o, "SPINNING STEEL", at("spinning steel"), {size: 72, y: 895, until: at("mechanical") - 0.1});
  word(o, "MECHANICAL INERTIA", at("mechanical"), {size: 72, y: 895, color: TERM.amber, glow: true});
  cam(o, {x0: -80, x1: 60, y0: 20, y1: -10, d0: -0.6, d1: 0.6, aperture: PHOTO_APERTURE});
})();

// C1 · something fails: the spinning mass slows the fall (dial)
var tAuto = at("automatic");
(function () {
  var o = Shot("S3C Fall slowed", vo(24.2), tAuto);
  var tf = o.t(at("failed"));
  gauge(o, W / 2, 820, 300, "LOW", "60 Hz", "HIGH", "-22 * ease(time, " + tf + ", " + (tf + 4) + ", 0, 1)");
  word(o, "FREQUENCY", at("failed") - 0.2, {size: 90, y: 300, mode: "rise"});
  label(o, "INERTIA: A SLOW FALL", at("slowed"), {y: 390, color: TERM.amber, size: 32});
  flag(o, "Illustration");
  cam(o, {d0: 0.6, d1: -0.6});
})();
// C2 · seconds for machines, minutes for people (control room, three layers; K6 phone ring on "phone")
(function () {
  var o = Shot("S3C Control room", tAuto, vo(39.74), {bg: false});
  photoShot(o, "control", {caption: "Power plant control room, Los Angeles Aqueduct · HAER, Library of Congress"});
  bar(o, 880, tAuto);
  word(o, "AUTOMATIC: SECONDS", tAuto, {size: 66, y: 895, color: TERM.amber, until: at("human operators") - 0.1});
  word(o, "OPERATORS: MINUTES", at("human operators"), {size: 66, y: 895});
  cam(o, {x0: 70, x1: -70, y0: -10, y1: 10, d0: 0.6, d1: -0.6, aperture: PHOTO_APERTURE});
})();

// D · today: inertia shrinking (the rotor spins down)
(function () {
  var o = Shot("S3D Shrinking", vo(39.74), vo(43.3), {red: true});
  showAt(o, rotor(o, W / 2, H / 2 + 60, 200, TERM.amberDim, "var t = Math.min(time, 3.2); 220 * t - 34 * t * t"), o.a);
  word(o, "INERTIA ▼", at("shrinking") - 0.6, {size: 130, color: TERM.red, y: H / 2 - 260, glow: true});
  cam(o, {push: 1.03, d0: -0.5, d1: 0.6});
})();

// E · inverter-based resources: power electronics, not rotating iron. Review note (5:51): real photographs
// (public domain: NREL and the Bureau of Land Management) as HUD cards with scanlines and corner brackets
(function () {
  var o = Shot("S3E Inverters", vo(43.3), vo(60.78));
  label(o, "INVERTER-BASED", at("inverter"), {y: 180, size: 40, color: TERM.white});
  photoCard(o, "stock/solar_nrel.jpg", 400, 480, at("solar") - 0.2, "SOLAR");
  photoCard(o, "stock/battery_blm.jpg", 960, 480, at("battery") - 0.2, "BATTERIES");
  photoCard(o, "stock/wind_nrel.jpg", 1520, 480, at("wind farms") - 0.2, "WIND");
  word(o, "POWER ELECTRONICS", at("power electronics"), {size: 92, y: 860, color: TERM.amber, glow: true});
  word(o, "ROTATING IRON", at("not heavy"), {size: 50, y: 960, color: TERM.grey, mode: "fade"});
  strike(o, W / 2, 945, 420, at("rotating iron") + 0.2);
  flag(o, "Photos: Dennis Schroeder / NREL (public domain) · BLM California (public domain)");
  cam(o, {x0: -40, x1: 40, d0: -0.3, d1: 0.3});
})();

// F · less inertia, faster fall (two dials, same fault)
(function () {
  var o = Shot("S3F Faster fall", vo(60.78), vo(66.6));
  var t0 = o.t(at("fall faster")) - 0.3;
  label(o, "HIGH INERTIA", o.a + 0.2, {x: 560, y: 360, size: 32, color: TERM.white});
  label(o, "LOW INERTIA", o.a + 0.2, {x: 1360, y: 360, size: 32, color: TERM.white});
  gauge(o, 560, 760, 240, "", "", "", "-20 * ease(time, " + t0 + ", " + (t0 + 4) + ", 0, 1)");
  gauge(o, 1360, 760, 240, "", "", "", "-70 * ease(time, " + t0 + ", " + (t0 + 0.8) + ", 0, 1)", TERM.red);
  word(o, "LESS INERTIA → FASTER FALL", at("less inertia"), {size: 80, y: 220});
  flag(o, "Illustration");
  cam(o, {d0: 0.2, d1: -0.3});
})();

// G1 · directive 07:30: South Australia, September 2016, on a real map. The storm brings lines down
// north of Adelaide; then the wind farms' protection settings trip (icons stop and turn red), not
// "unstable renewables"
var tState = at("the state was");
var SA = function (n) { return mapPoint(null, "sa", n); };
(function () {
  var o = Shot("S3G South Australia storm", vo(66.6), tState, {red: true});
  var mp = mapDraw(o, "sa", {when: o.a, dim: ["Victoria"], width: 3});
  label(o, "SOUTH AUSTRALIA", o.a + 0.4, {x: 740, y: 520, size: 28, color: TERM.amber});
  label(o, "VICTORIA", o.a + 0.4, {x: 1250, y: 800, size: 26, color: TERM.grey});
  word(o, "SEPTEMBER 2016", at("september"), {font: TF.mono, size: 52, color: TERM.amber, x: 1560, y: 230, mode: "type", cps: 18, track: 60});
  var tS = at("storm"), tW = at("wind farms"), tCut = at("cut their");
  // lines north of Adelaide: drawn amber, then broken red where the storm hits
  var ln = pathShape(o.c, [SA("Davenport"), SA("Mid North"), SA("Adelaide")], TERM.amber, 5, "transmission lines");
  showAt(o, ln.l, o.a + 0.6, tS + 1.1);
  var br = pathShape(o.c, [SA("Davenport"), SA("Mid North")], TERM.red, 5, "lines down");
  showAt(o, br.l, tS + 1.0);
  for (var i = 0; i < 3; i++) {
    var a = SA("Davenport"), b = SA("Mid North"), u = 0.25 + i * 0.25;
    var tw = tower(o, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 4, 10, TERM.amber); showAt(o, tw, o.a + 0.6);
    keys(T(tw).property("Z Rotation"), [[0, 0], [o.t(tS) + 0.5 + i * 0.15, 0], [o.t(tS) + 1.1 + i * 0.15, i % 2 ? 80 : -80]], 0);
  }
  word(o, "STORM", tS, {size: 90, color: TERM.white, x: 1560, y: 360, mode: "rise"});
  for (var k = 1; k <= 4; k++) {
    var P = SA("Wind " + k);
    var w = windIcon(o, P[0] + (k === 4 ? 0 : (k - 2) * 95), P[1] - 60, 40, TERM.amber, "time < " + (o.t(tCut) + 0.2) + " ? time * 160 : " + (o.t(tCut) + 0.2) + " * 160");
    showAt(o, w.tower, tW, tCut + 0.25); showAt(o, w.blades, tW, tCut + 0.25);
    var wr = windIcon(o, P[0] + (k === 4 ? 0 : (k - 2) * 95), P[1] - 60, 40, TERM.red, String(((o.t(tCut) + 0.2) * 160).toFixed(1)));
    showAt(o, wr.tower, tCut + 0.2); showAt(o, wr.blades, tCut + 0.2);
  }
  word(o, "PROTECTION TRIPS", at("protection"), {size: 60, color: TERM.red, x: 1520, y: 520, mode: "rise"});
  label(o, "WIND OUTPUT CUT", tCut, {x: 1520, y: 600, size: 28, color: TERM.white});
  // review note (6:11): no free photo of the toppled towers exists (news-agency pictures only), so a labelled illustration
  photoCard(o, "hf/sa_towers.jpg", 1610, 820, tS + 1.2, null, {scale: 60});
  flag(o, "Map: Natural Earth · Source: AEMO final report · positions schematic · Photo: AI-generated illustration (Higgsfield)");
  cam(o, {d0: -0.5, d1: 0.6});
})();
// G2 · cut off from Victoria (the interconnector opens); frequency collapses in under a second
var tBlack = at("went black");
(function () {
  var o = Shot("S3G Collapse", tState, tBlack, {red: true});
  var mp = mapDraw(o, "sa", {when: o.a, dim: ["Victoria"], width: 3});
  var ic = pathShape(o.c, [SA("South East"), SA("Heywood")], TERM.amber, 7, "interconnector"); showAt(o, ic.l, o.a, at("cut off") + 0.15);
  var ix = pathShape(o.c, [SA("South East"), SA("Heywood")], TERM.red, 3, "interconnector open"); showAt(o, ix.l, at("cut off") + 0.15);
  T(ix.l).property("Opacity").expression = "value * 0.5";
  word(o, "ISOLATED", at("cut off"), {size: 90, color: TERM.red, x: 1560, y: 300});
  var tc = o.t(at("collapsed"));
  gauge(o, 1680, 960, 140, "", "50 Hz", "", "-80 * ease(time, " + (tc - 0.2) + ", " + (tc + 0.6) + ", 0, 1)", TERM.red);
  word(o, "< 1 SECOND", at("under a second"), {font: TF.mono, size: 72, x: 1560, y: 520, color: TERM.red, glow: true});
  flag(o, "Map: Natural Earth · Source: AEMO final report");
  cam(o, {push: 1.04, d0: 0.4, d1: -0.6});
})();
// H · the whole state went black (the map goes out, then the line about wrecked machines)
(function () {
  var o = Shot("S3H Black", tBlack, vo(95.7), {bg: false});
  solid(o.c, [0, 0, 0], "black");
  var mp = mapDraw(o, "sa", {when: o.a, only: ["South Australia"], color: TERM.red, width: 2});
  T(mp["South Australia"].l).property("Opacity").expression = "value * Math.max(0, 1 - time / 0.9)";
  word(o, "BLACKOUT", o.a + 0.05, {size: 120, y: H / 2 - 20, color: TERM.red, until: at("spinning machines") - 0.1});
  word(o, "WRECKED", at("wrecked"), {size: 110, y: H / 2 - 30, mode: "rise"});
  label(o, "BY THEIR OWN ELECTRICITY", at("electricity"), {y: H / 2 + 50, size: 34, color: TERM.amber});
  cam(o, {push: 1.03});
})();

// I · ~08:00: Mohave, 1970 and 1971. Review note (6:41): real images. The years and the oscillation first;
// then the twisted shaft (AI-generated with Higgsfield: no photo of the damage is public), then the real plant
// (U.S. National Archives, May 1972, public domain)
var tShaft = at("twisted") - 0.3, tPlant = at("mojave") - 0.2;
(function () {
  var o = Shot("S3I Mohave years", vo(95.7), tShaft);
  word(o, "1970", at("1970"), {font: TF.mono, size: 120, x: 760, y: 360, color: TERM.amber});
  word(o, "1971", at("1971"), {font: TF.mono, size: 120, x: 1160, y: 360, color: TERM.amber});
  var wv = []; for (var x = -600; x <= 600; x += 20) wv.push([W / 2 + x, 640 + Math.sin(x / 40) * 40]);
  var wave = pathShape(o.c, wv, TERM.red, 6, "oscillation"); showAt(o, wave.l, at("oscillations"));
  T(wave.l).property("Position").expression = "[ (time * 160) % 251 - 125, 0, 0 ]";
  word(o, "OSCILLATIONS", at("oscillations"), {size: 80, y: 520, color: TERM.red});
  cam(o, {x0: -50, x1: 50, d0: -0.3, d1: 0.3});
})();
(function () {
  var o = Shot("S3I Twisted shaft", tShaft, tPlant, {bg: false});
  solid(o.c, TERM.black, "void");
  photoShot(o, "mohave_shaft", {tint: 35});
  bar(o, 880, o.a + 0.2);
  word(o, "TWISTED SHAFT", o.a + 0.3, {size: 70, y: 895, color: TERM.red});
  flag(o, "AI-generated illustration (Higgsfield)");
  cam(o, {x0: -60, x1: 60, d0: 0.5, d1: -0.6, aperture: PHOTO_APERTURE});
})();
(function () {
  var o = Shot("S3I Mohave plant", tPlant, vo(113.64), {bg: false});
  solid(o.c, TERM.black, "void");
  // framed on the smokestack, its smoke and the plant (left edge at the frame edge, plant at the bottom); the text sits in the hazy sky
  var ph = o.c.layers.add(img("stock/mohave_nara_1972.jpg")); ph.threeDLayer = true;
  var dw = 2200, sc = dw / ph.source.width * 100, dh = dw * ph.source.height / ph.source.width;
  T(ph).property("Position").setValue([dw / 2 + 10, H + 40 - 0.485 * dh, 0]); T(ph).property("Scale").setValue([sc, sc, 100]);
  fx(ph, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.86, 0.66], "Amount to Tint": 45});
  vis(ph, 0, o.d, 0.4, 0.4, o.d);
  bar(o, 170, o.a + 0.2);
  label(o, "MOHAVE GENERATING STATION, NEVADA · 1972", o.a + 0.2, {y: 160, size: 30, color: TERM.white});
  word(o, "REPAIRS: MONTHS", at("each repair"), {size: 72, y: 225, color: TERM.amber});
  flag(o, "Photo: Charles O’Rear, U.S. National Archives (NARA 548968), May 1972, public domain · Source: T&D World");
  cam(o, {steady: true});
})();

// J · people are slow; protection has been automatic for decades
(function () {
  var o = Shot("S3J Human speed", vo(113.64), vo(126.32));
  var tW = at("that's why");
  word(o, "ALARM → SECONDS", at("seconds", vo(113)), {size: 80, y: 420, until: tW - 0.1});
  label(o, "UNDERSTANDING → LONGER", at("far longer"), {y: 520, size: 34, color: TERM.white, until: tW - 0.1});
  word(o, "AUTOMATIC PROTECTION", at("fastest"), {size: 90, y: 430, mode: "rise"});
  word(o, "DECADES", at("decades"), {size: 110, y: 570, color: TERM.amber, glow: true});
  cam(o, {d0: 0.2, d1: -0.3});
})();

// K · directive 08:30: 2003. A label card (no fake highlight) and the affected states going dark on a
// real map; about 50 million people (U.S.–Canada task force)
(function () {
  var o = Shot("S3K 2003 blackout", vo(126.32), vo(146.0), {red: true});
  var mp = mapDraw(o, "ne2003", {when: o.a, width: 2});
  var out = MAPS.ne2003.out, t0 = at("lines failing"), t1 = at("ontario") + 0.4;
  for (var i = 0; i < out.length; i++) {
    var td = o.t(t0 + (t1 - t0) * i / (out.length - 1)), r = mp[out[i]];
    keys(r.fill.property("Color"), [[0, TERM.panel], [td, TERM.panel], [td + 0.5, [0.01, 0.01, 0.012]]], 0);
    keys(r.stroke.property("Color"), [[0, TERM.amber], [td, TERM.amber], [td + 0.5, TERM.red]], 0);
  }
  pin(o, mapPoint(o, "ne2003", "Ohio control room"), "OHIO", at("ohio"), {ly: -44});
  // the label card: year, cause
  box(o, 520, 230, 300, 190, 10);
  word(o, "2003", at("2003"), {font: TF.mono, size: 90, x: 300, y: 200, color: TERM.amber, mode: "type", cps: 10});
  label(o, "SOFTWARE BUG · ALARMS SILENT", at("software bug"), {x: 300, y: 270, size: 22, color: TERM.white, track: 60});
  num(o, 0, 50, at("50"), at("50") + 0.9, {pre: "≈ ", suf: " MILLION", size: 96, x: 1500, y: 960, glow: true});
  label(o, "PEOPLE", at("50") + 0.5, {x: 1500, y: 1020, size: 26});
  flag(o, "Map: Natural Earth · Source: U.S.–Canada Power System Outage Task Force");
  cam(o, {d0: -0.4, d1: 0.5});
})();

// L · Britain, August 2019: two stations lost; automatic systems cut about 1.1 million customers
(function () {
  var o = Shot("S3L Britain 2019", vo(146.0), vo(163.68));
  mapDraw(o, "gb", {when: o.a, color: TERM.amberDim, width: 2});
  word(o, "AUGUST 2019", at("august"), {font: TF.mono, size: 56, x: 360, y: 300, color: TERM.amber, mode: "type", cps: 16, track: 60});
  label(o, "LIGHTNING", at("lightning"), {x: 360, y: 370, size: 30, color: TERM.white});
  var tN = at("no human");
  word(o, "2 STATIONS LOST", at("two power"), {size: 64, x: 360, y: 520, color: TERM.red, mode: "rise"});
  word(o, "AUTOMATIC", tN, {size: 96, x: 1520, y: 420, glow: true});
  num(o, 0, 1.1, at("million", tN), at("million", tN) + 0.8, {dec: 1, pre: "≈ ", suf: " MILLION", size: 80, x: 1520, y: 580, color: TERM.amber});
  label(o, "CUSTOMERS CUT OFF", at("customers"), {x: 1520, y: 650, size: 28, color: TERM.white});
  // review note (7:31): a station in the dark during the cut (labelled illustration; no free photo of the day)
  photoCard(o, "hf/gb_station.jpg", 380, 780, tN + 0.3, null, {scale: 66});
  flag(o, "Map: Natural Earth · Source: National Grid ESO report via Ofgem · Photo: AI-generated illustration (Higgsfield)");
  cam(o, {d0: 0.4, d1: -0.4});
})();

// M · a few seconds: flicker or blackout
(function () {
  var o = Shot("S3M Flicker or blackout", vo(163.68), vo(171.86));
  label(o, "LOW INERTIA · SECONDS", at("low inertia"), {y: 300, size: 34, color: TERM.white});
  word(o, "FLICKER", at("flicker"), {size: 130, x: 560, y: 560, color: TERM.amber});
  word(o, "BLACKOUT", at("blackout"), {size: 130, x: 1360, y: 560, color: TERM.red, glow: true});
  label(o, "OR", at("flicker") + 0.4, {y: 545, size: 40});
  cam(o, {push: 1.04});
})();

// N · too slow (end of scene: hand-off to Scene 4)
(function () {
  var o = Shot("S3N Too slow", vo(171.86), END);
  label(o, "HUMAN OPERATORS", o.a + 0.1, {y: H / 2 - 175, size: 34, color: TERM.white});
  word(o, "TOO SLOW", at("biologically"), {size: 150, y: H / 2 - 20, glow: true});
  cam(o, {push: 1.04, d0: -0.2, d1: 0.3});
})();

assemble("Scene3", END, [[0, 100], [0.8, 0], [vo(66.6), 0], [vo(67), 15], [tBlack - 0.05, 15], [tBlack, 0], [vo(95.7), 0], [vo(126.32), 0], [vo(126.6), 12], [vo(146), 12], [vo(146.3), 0], [END - 1.0, 0], [END, 100]]);
logEvents(3);
