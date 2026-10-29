// Scene 7, "Cross-sector velocity" (Act IV opens). Scene comp starts 1.0 s before the voice.
// Built to the production file's Scene 7 directives (DIRECTIVES.md): a dark globe turning (Natural Earth on
// CC Sphere), a fast downward dolly onto the hubs (the Netherlands map and Rotterdam pin, a drawn AGV yard in
// fog, drawn 4D routes), and the monospace callout sliding into the margin. Keywords only.
#include "kit2.jsx"
SC = 7;
var END = vo(92.04) + 1.8;

// small icons for the other sectors
function shipIcon(o, x, y, s, c) { var l = shapeAt(o.c, "port", [x, y, 0]); addPath(l, [[-s, 0], [s, 0], [s * 0.7, s * 0.45], [-s * 0.8, s * 0.45]], c, 5, true); addRect(l, [s * 0.5, s * 0.35], [-s * 0.3, -s * 0.2], c, 4, null); addRect(l, [s * 0.5, s * 0.35], [s * 0.3, -s * 0.2], c, 4, null); return l; }
function planeIcon(o, x, y, s, c) { var l = shapeAt(o.c, "plane", [x, y, 0]); addPath(l, [[-s, 0], [s, 0]], c, 8); addPath(l, [[-s * 0.1, 0], [-s * 0.5, -s * 0.7], [-s * 0.3, -s * 0.7], [s * 0.3, 0]], c, 5, true); addPath(l, [[-s * 0.1, 0], [-s * 0.5, s * 0.7], [-s * 0.3, s * 0.7], [s * 0.3, 0]], c, 5, true); addPath(l, [[-s, 0], [-s * 1.1, -s * 0.35]], c, 5); return l; }
function pipeIcon(o, x, y, s, c) { var l = shapeAt(o.c, "pipeline", [x, y, 0]); addRect(l, [s * 2.2, s * 0.5], [0, 0], c, 5, null); addRect(l, [s * 0.3, s * 0.8], [-s * 0.6, 0], c, 4, null); addRect(l, [s * 0.3, s * 0.8], [s * 0.6, 0], c, 4, null); return l; }

// A · directive 21:00: a dark topographic globe revolving (Natural Earth countries, tools/make_world.py)
(function () {
  var o = Shot("S7A Globe", 0, vo(6.7));
  // CC Sphere renders off-centre on a 3D layer under the camera, so the globe is 2D with its own slow push
  var g = o.c.layers.add(img("world.png"));
  T(g).property("Position").setValue([W / 2, H / 2 + 60]); keys(T(g).property("Scale"), [[0, [48, 48]], [o.d, [51, 51]]], 0);
  var e = fx(g, "CC Sphere", {"Radius": 1000, "Offset": [2048, 1024], "Rotation X": -18, "Ambient": 35, "Light Intensity": 110, "Light Height": 40, "Light Direction": -40, "Specular": 10});
  e.property("Rotation Y").expression = "-60 + time * 12";
  vis(g, 0, o.d, 0.8, 0.3, o.d);
  word(o, "BEYOND THE GRID", at("not confined"), {size: 110, y: 150, mode: "rise", glow: true});
  label(o, "PORTS · AVIATION · PIPELINES", at("grid") + 0.2, {y: 1000, size: 28, color: TERM.white});
  flag(o, "Map data: Natural Earth");
  cam(o, {push: 1.04, d0: -0.4, d1: 0.5});
})();

// B1 · directive 21:30: a fast downward dolly onto the hub: the Netherlands, Rotterdam pinned, 1993
var tToday = at("today");
(function () {
  var o = Shot("S7B Rotterdam map", vo(6.7), tToday);
  mapDraw(o, "nl", {when: o.a, width: 3});
  pin(o, mapPoint(o, "nl", "Rotterdam"), "ROTTERDAM", at("rotterdam"), {ly: -48});
  word(o, "1993", at("1993"), {font: TF.mono, size: 120, x: 1560, y: 420, color: TERM.amber, glow: true});
  label(o, "FIRST AUTOMATED TERMINAL", at("world's first"), {x: 1560, y: 500, size: 28, color: TERM.white});
  flag(o, "Map: Natural Earth · Source: ECT, Rotterdam");
  cam(o, {y0: -200, y1: 0, push: 1.05, d0: 0.5, d1: -0.6});
})();
// B2 · the yard: driverless vehicles through fog, directed by terminal software (drawn)
(function () {
  var o = Shot("S7B AGV yard", tToday, vo(24.0));
  for (var i = 0; i < 6; i++) for (var j = 0; j < 3; j++) { var b = shapeAt(o.c, "container", [380 + i * 230, 420 + j * 70, 20]); addRect(b, [200, 58], [0, 0], j % 2 ? TERM.amberDim : TERM.amber, 3, TERM.panel); showAt(o, b, o.a + (i + j) * 0.05); }
  for (var k = 0; k < 7; k++) {
    var v = shapeAt(o.c, "AGV", [0, 0, 0]); addRect(v, [120, 40], [0, 0], TERM.green, 3, [0.03, 0.12, 0.07]);
    var lane = k % 2, sp = lane ? -260 : 300;
    T(v).property("Position").expression = "var x = ((" + (k * 330) + " + time * " + sp + ") % 2200 + 2200) % 2200 - 140; [x, " + (lane ? 760 : 690) + ", 0];";
    showAt(o, v, at("driverless"));
  }
  // fog drifting through the yard (near and far banks)
  for (var f = 0; f < 2; f++) {
    var fg = solid(o.c, [0.5, 0.5, 0.5], "fog " + f); fg.threeDLayer = true; T(fg).property("Position").setValue([W / 2, H / 2 + 80, f ? -120 : 160]);
    fx(fg, "Fractal Noise", {"Contrast": 140, "Brightness": -30, "Transform/Scale": 900, "Transform/Scale Width": 1600});
    fg.blendingMode = BlendingMode.SCREEN; T(fg).property("Opacity").setValue(f ? 10 : 14);
    fg.property("Effects").property(1).property("Evolution").expression = "time * " + (f ? 14 : 9);
  }
  label(o, "DRIVERLESS", at("driverless"), {y: 880, size: 32, color: TERM.green});
  label(o, "TERMINAL SOFTWARE", at("terminal software"), {y: 930, size: 26, color: TERM.white});
  word(o, "PORTS · EUROPE · ASIA", at("ports"), {size: 70, y: 200, mode: "rise"});
  flag(o, "Illustration");
  cam(o, {y0: -200, y1: 20, x0: -50, x1: 50, push: 1.06, d0: -0.4, d1: 0.5});
})();

// C1 · aviation: four-dimensional trajectories over data link
var tAppr = at("controllers still");
(function () {
  var o = Shot("S7C Trajectory", vo(24.0), tAppr);
  word(o, "TRAJECTORY-BASED OPERATIONS", at("trajectory"), {font: TF.mono, size: 64, y: 170, mode: "type", cps: 26, color: TERM.amber, track: 30});
  var pts = []; for (var k = 0; k <= 40; k++) { var u = k / 40; pts.push([260 + u * 1400, 720 - Math.sin(u * Math.PI) * 300 + u * 60]); }
  var path = pathShape(o.c, pts, TERM.amber, 4, "4D path"); drawOn(o, path, at("precise"), 1.4);
  var pl = planeIcon(o, 260, 720, 40, TERM.white); showAt(o, pl, at("precise"));
  var t0 = o.t(at("precise")), t1 = o.t(tAppr);
  T(pl).property("Position").expression = "var u = ease(time, " + t0 + ", " + t1 + ", 0, 1); [260 + u * 1400, 720 - Math.sin(u * Math.PI) * 300 + u * 60, 0];";
  // more 4D routes, each with its own aircraft (drawn)
  for (var r = 0; r < 3; r++) {
    var pr = []; for (var k2 = 0; k2 <= 30; k2++) { var u2 = k2 / 30; pr.push([300 + u2 * 1300, 860 - r * 90 - Math.sin(u2 * Math.PI) * (120 + r * 60)]); }
    var pp = pathShape(o.c, pr, TERM.amberDim, 3, "route " + r); drawOn(o, pp, at("precise") + 0.3 + r * 0.25, 1.2);
  }
  label(o, "LAT · LON · ALT · TIME", at("four"), {y: 260, size: 30, color: TERM.white});
  tag(o, "GROUND SYSTEMS", at("ground computers"), {x: 1500, y: 900, color: TERM.green, size: 40});
  label(o, "DATA LINK", at("data link"), {x: 1500, y: 980, size: 26, color: TERM.green});
  for (var k = 0; k < 4; k++) shuttle(o, [1100, 700 - k * 8], [1450, 860 - k * 8], TERM.green, at("data link"), "1.1", k / 2, 7);
  flag(o, "Illustration · Source: FAA, trajectory-based operations");
  cam(o, {x0: -60, x1: 60, d0: -0.3, d1: 0.3});
})();
// C2 · controllers still approve the plans …
var tBut1 = at("but more");
(function () {
  var o = Shot("S7C Approve", tAppr, tBut1);
  tag(o, "APPROVED", at("approve"), {y: H / 2, color: TERM.green, size: 80});
  label(o, "CONTROLLERS", tAppr, {y: H / 2 - 120, size: 30, color: TERM.white});
  cam(o, {push: 1.03, d0: -0.5, d1: 0.6});
})();
// C3 · … the "but" turn, cut on the word: machine to machine
(function () {
  var o = Shot("S7C Machine to machine", tBut1, vo(49.5), {red: true});
  tag(o, "MACHINE", o.a + 0.05, {x: 560, y: H / 2, color: TERM.amber, size: 70});
  tag(o, "MACHINE", o.a + 0.05, {x: 1360, y: H / 2, color: TERM.amber, size: 70});
  for (var k = 0; k < 5; k++) shuttle(o, [760, H / 2 - 20 + k * 10], [1160, H / 2 - 20 + k * 10], TERM.amber, o.a + 0.2, "1.4", k / 2.5, 7);
  cam(o, {push: 1.04, d0: 0.5, d1: -0.6});
})();

// D · pipelines: fibre-optic sensors listen; machine learning picks out a leak
(function () {
  var o = Shot("S7D Pipeline", vo(49.5), vo(61.3));
  word(o, "PIPELINES", at("pipelines"), {size: 90, y: 180});
  var ground = solid(o.c, [0.05, 0.04, 0.03], "ground", 1920, 420); ground.threeDLayer = true; T(ground).property("Position").setValue([W / 2, 760, 40]);
  var pipe = shapeAt(o.c, "pipe", [W / 2, 700, 0]); addRect(pipe, [1700, 90], [0, 0], TERM.amber, 4, TERM.panel); showAt(o, pipe, o.a + 0.2);
  var fib = pathShape(o.c, [[110, 770], [1810, 770]], TERM.green, 3, "fibre"); drawOn(o, fib, at("fiber"), 1.0);
  label(o, "FIBER-OPTIC SENSORS", at("fiber"), {y: 300, size: 32, color: TERM.green});
  var wv = []; for (var x = 0; x <= 1700; x += 15) wv.push([110 + x, 880 + Math.sin(x / 30) * 18 * Math.sin(x / 400)]);
  var wave = pathShape(o.c, wv, TERM.green, 3, "acoustic signal"); showAt(o, wave.l, at("listen"));
  T(wave.l).property("Position").expression = "[ -((time * 140) % 188), 0, 0 ]";
  var tL = at("leak");
  var ring = shapeAt(o.c, "leak ring", [1240, 700, -10]); addEllipse(ring, 120, [0, 0], TERM.red, 6, null); showAt(o, ring, tL - 0.3);
  T(ring).property("Scale").expression = "var t = (time % 1); [100 + t * 80, 100 + t * 80, 100];";
  tag(o, "LEAK", tL - 0.3, {x: 1240, y: 560, color: TERM.red, size: 50});
  label(o, "MACHINE LEARNING", at("machine learning"), {y: 380, size: 30, color: TERM.white});
  flag(o, "Illustration");
  cam(o, {x0: -60, x1: 60, d0: 0.2, d1: -0.3});
})();

// E · the same dilemma: no longer pilots
(function () {
  var o = Shot("S7E Dilemma", vo(61.3), vo(72.1));
  label(o, "CRITICAL DOMAINS", at("more and more"), {y: 330, size: 32, color: TERM.white});
  word(o, "SAME DILEMMA", at("same dilemma"), {size: 110, y: 460, glow: true});
  word(o, "ACTIVE PILOTS", at("active"), {size: 72, y: 640, color: TERM.amber, mode: "fade"});
  strike(o, W / 2, 618, 560, at("controls") + 0.3);
  cam(o, {d0: -0.3, d1: 0.3});
})();

// F1 · relegated to monitors; directive 23:00: the monospace callouts slide into the margin (type_key)
var tBut2 = at("but spectators");
(function () {
  var o = Shot("S7F Monitors", vo(72.1), tBut2);
  var tR = at("relegated");
  var c1 = word(o, "HUMAN SUPERVISOR: MONITORING", tR, {font: TF.mono, size: 30, x: 230, y: 190, just: LEFTJ, track: 20, mode: "type", cps: 36, color: TERM.green});
  var c2 = word(o, "REACTION WINDOW: < 1 SECOND", tR + 0.9, {font: TF.mono, size: 30, x: 230, y: 240, just: LEFTJ, track: 20, mode: "type", cps: 36, color: TERM.red});
  slideIn(o, c1, tR, [230, 190, -40], [-600, 0]); slideIn(o, c2, tR + 0.9, [230, 240, -40], [-600, 0]);
  var b = box(o, 1500, 520, W / 2 + 80, 640, 40, TERM.green); showAt(o, b, at("control rooms"));
  for (var i = 0; i < 60; i++) {
    var d = dot(o.c, 410 + (i % 15) * 90, 520 + Math.floor(i / 15) * 90, 14, TERM.green, "status " + i, 10);
    showAt(o, d, at("green status") + rnd(i, 1) * 0.8);
  }
  label(o, "ALL SYSTEMS NORMAL", at("green status") + 0.8, {x: W / 2 + 80, y: 860, size: 30, color: TERM.green});
  word(o, "SUPERVISORS", at("supervisors"), {size: 110, y: 230, x: W / 2 + 80, z: -60});
  flag(o, "Illustration");
  cam(o, {y0: -260, y1: 20, push: 1.1, d0: 0.6, d1: -0.4});
})();
// F2 · the "but" turn, cut on the word: spectators
(function () {
  var o = Shot("S7F Spectators", tBut2, END, {red: true});
  word(o, "SPECTATORS", at("spectators"), {size: 160, y: H / 2, color: TERM.red, glow: true});
  cam(o, {push: 1.04, d0: -0.5, d1: 0.6});
})();

assemble("Scene7", END, [[0, 100], [0.8, 0], [tBut1, 0], [tBut1 + F, 12], [vo(49.5), 12], [vo(49.8), 0], [vo(72.1), 0], [vo(72.4), 10], [tBut2, 10], [tBut2 + F, 22], [END - 1.0, 22], [END, 100]],
  [[tBut1, "cold"], [vo(49.5), "warm"], [tBut2, "cold"]]);
logEvents(7);
