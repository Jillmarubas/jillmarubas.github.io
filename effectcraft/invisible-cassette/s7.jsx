// Scene 7, "Cross-sector velocity" (Act IV opens). Scene comp starts 1.0 s before the voice.
#include "kit2.jsx"
SC = 7;
var END = vo(92.04) + 1.8;

// small icons for the other sectors
function shipIcon(o, x, y, s, c) { var l = shapeAt(o.c, "port", [x, y, 0]); addPath(l, [[-s, 0], [s, 0], [s * 0.7, s * 0.45], [-s * 0.8, s * 0.45]], c, 5, true); addRect(l, [s * 0.5, s * 0.35], [-s * 0.3, -s * 0.2], c, 4, null); addRect(l, [s * 0.5, s * 0.35], [s * 0.3, -s * 0.2], c, 4, null); return l; }
function planeIcon(o, x, y, s, c) { var l = shapeAt(o.c, "plane", [x, y, 0]); addPath(l, [[-s, 0], [s, 0]], c, 8); addPath(l, [[-s * 0.1, 0], [-s * 0.5, -s * 0.7], [-s * 0.3, -s * 0.7], [s * 0.3, 0]], c, 5, true); addPath(l, [[-s * 0.1, 0], [-s * 0.5, s * 0.7], [-s * 0.3, s * 0.7], [s * 0.3, 0]], c, 5, true); addPath(l, [[-s, 0], [-s * 1.1, -s * 0.35]], c, 5); return l; }
function pipeIcon(o, x, y, s, c) { var l = shapeAt(o.c, "pipeline", [x, y, 0]); addRect(l, [s * 2.2, s * 0.5], [0, 0], c, 5, null); addRect(l, [s * 0.3, s * 0.8], [-s * 0.6, 0], c, 4, null); addRect(l, [s * 0.3, s * 0.8], [s * 0.6, 0], c, 4, null); return l; }

// A · not confined to the grid
(function () {
  var o = Shot("S7A Beyond the grid", 0, vo(6.7));
  word(o, "NOT CONFINED TO THE GRID", at("not confined"), {size: 100, y: 300, mode: "rise"});
  showAt(o, shipIcon(o, 520, 650, 110, TERM.amber), o.a + 0.6);
  showAt(o, planeIcon(o, 960, 640, 120, TERM.amber), o.a + 1.0);
  showAt(o, pipeIcon(o, 1400, 650, 110, TERM.amber), o.a + 1.4);
  label(o, "PORTS", o.a + 0.8, {x: 520, y: 790, size: 28}); label(o, "AVIATION", o.a + 1.2, {x: 960, y: 790, size: 28}); label(o, "PIPELINES", o.a + 1.6, {x: 1400, y: 790, size: 28});
  cam(o, {push: 1.05, d0: -0.3, d1: 0.3});
})();

// B · Rotterdam 1993: the first automated container terminal (illustration)
(function () {
  var o = Shot("S7B Rotterdam", vo(6.7), vo(24.0));
  word(o, "1993 · ROTTERDAM", at("1993"), {font: TF.mono, size: 90, y: 180, color: TERM.amber, glow: true});
  label(o, "THE WORLD’S FIRST AUTOMATED CONTAINER TERMINAL", at("world's first"), {y: 260, size: 32, color: TERM.white});
  // container stacks
  for (var i = 0; i < 6; i++) for (var j = 0; j < 3; j++) { var b = shapeAt(o.c, "container", [380 + i * 230, 470 + j * 70, 20]); addRect(b, [200, 58], [0, 0], j % 2 ? TERM.amberDim : TERM.amber, 3, TERM.panel); showAt(o, b, o.a + 0.2 + (i + j) * 0.05); }
  // driverless vehicles on two lanes
  for (var k = 0; k < 7; k++) {
    var v = shapeAt(o.c, "AGV", [0, 0, 0]); addRect(v, [120, 40], [0, 0], TERM.green, 3, [0.03, 0.12, 0.07]);
    var lane = k % 2, sp = lane ? -260 : 300;
    T(v).property("Position").expression = "var x = ((" + (k * 330) + " + time * " + sp + ") % 2200 + 2200) % 2200 - 140; [x, " + (lane ? 800 : 730) + ", 0];";
    showAt(o, v, at("driverless"));
  }
  label(o, "DRIVERLESS VEHICLES DIRECTED BY TERMINAL SOFTWARE", at("driverless") + 0.3, {y: 900, size: 30, color: TERM.green});
  word(o, "THOUSANDS OF TONS OF FREIGHT", at("thousands"), {size: 64, y: 990});
  flag(o, "Illustration");
  cam(o, {y0: -40, y1: 20, x0: -50, x1: 50, d0: -0.3, d1: 0.3});
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
  label(o, "LATITUDE · LONGITUDE · ALTITUDE · TIME", at("four"), {y: 260, size: 30, color: TERM.white});
  tag(o, "GROUND COMPUTERS", at("ground computers"), {x: 1500, y: 900, color: TERM.green, size: 40});
  label(o, "DATA LINK, NOT RADIO", at("data link"), {x: 1500, y: 980, size: 26, color: TERM.green});
  for (var k = 0; k < 4; k++) shuttle(o, [1100, 700 - k * 8], [1450, 860 - k * 8], TERM.green, at("data link"), "1.1", k / 2, 7);
  cam(o, {x0: -60, x1: 60, d0: -0.3, d1: 0.3});
})();
// C2 · controllers still approve, but the conversation is machine to machine
(function () {
  var o = Shot("S7C Machine to machine", tAppr, vo(49.5));
  word(o, "CONTROLLERS STILL APPROVE", tAppr, {size: 84, y: 420});
  word(o, "MACHINE TO MACHINE", at("machine to machine"), {size: 110, y: 580, color: TERM.amber, glow: true});
  cam(o, {push: 1.04});
})();

// D · pipelines: fibre-optic sensors listen; machine learning picks out a leak
(function () {
  var o = Shot("S7D Pipeline", vo(49.5), vo(61.3));
  word(o, "PIPELINES", at("pipelines"), {size: 90, y: 180});
  var ground = solid(o.c, [0.05, 0.04, 0.03], "ground", 1920, 420); ground.threeDLayer = true; T(ground).property("Position").setValue([W / 2, 760, 40]);
  var pipe = shapeAt(o.c, "pipe", [W / 2, 700, 0]); addRect(pipe, [1700, 90], [0, 0], TERM.amber, 4, TERM.panel); showAt(o, pipe, o.a + 0.2);
  var fib = pathShape(o.c, [[110, 770], [1810, 770]], TERM.green, 3, "fibre"); drawOn(o, fib, at("fiber"), 1.0);
  label(o, "FIBER-OPTIC SENSORS LISTEN ALONG THE PIPE", at("fiber"), {y: 300, size: 32, color: TERM.green});
  var wv = []; for (var x = 0; x <= 1700; x += 15) wv.push([110 + x, 880 + Math.sin(x / 30) * 18 * Math.sin(x / 400)]);
  var wave = pathShape(o.c, wv, TERM.green, 3, "acoustic signal"); showAt(o, wave.l, at("listen"));
  T(wave.l).property("Position").expression = "[ -((time * 140) % 188), 0, 0 ]";
  var tL = at("leak");
  var ring = shapeAt(o.c, "leak ring", [1240, 700, -10]); addEllipse(ring, 120, [0, 0], TERM.red, 6, null); showAt(o, ring, tL - 0.3);
  T(ring).property("Scale").expression = "var t = (time % 1); [100 + t * 80, 100 + t * 80, 100];";
  tag(o, "LEAK", tL - 0.3, {x: 1240, y: 560, color: TERM.red, size: 50});
  label(o, "MACHINE LEARNING PICKS OUT THE SOUND", at("machine learning"), {y: 380, size: 30, color: TERM.white});
  flag(o, "Illustration");
  cam(o, {x0: -60, x1: 60, d0: 0.2, d1: -0.3});
})();

// E · the same dilemma: no longer pilots
(function () {
  var o = Shot("S7E Dilemma", vo(61.3), vo(72.1));
  label(o, "IN MORE AND MORE CRITICAL DOMAINS", at("more and more"), {y: 330, size: 32, color: TERM.white});
  word(o, "THE SAME DILEMMA", at("same dilemma"), {size: 110, y: 460, glow: true});
  word(o, "ACTIVE PILOTS ON THE CONTROLS", at("active"), {size: 64, y: 640, color: TERM.amber, mode: "fade"});
  strike(o, W / 2, 620, 1080, at("controls") + 0.3);
  cam(o, {d0: -0.3, d1: 0.3});
})();

// F · relegated to monitors: a clean dashboard, green lights, fast downward dolly
(function () {
  var o = Shot("S7F Spectators", vo(72.1), END, {red: false});
  word(o, "MONITORS", at("monitors") - 0.3, {size: 140, y: 230, z: -60, until: at("supervisors") - 0.1, glow: true});
  var b = box(o, 1500, 520, W / 2, 640, 40, TERM.green); showAt(o, b, at("control rooms"));
  word(o, "HUMAN SUPERVISOR: MONITORING // REACTION WINDOW: < 1 SECOND", at("control rooms"), {font: TF.mono, size: 30, x: W / 2 - 700, y: 430, just: LEFTJ, track: 0, mode: "type", cps: 40, color: TERM.green});
  for (var i = 0; i < 60; i++) {
    var d = dot(o.c, 330 + (i % 15) * 90, 520 + Math.floor(i / 15) * 90, 14, TERM.green, "status " + i, 10);
    showAt(o, d, at("green status") + rnd(i, 1) * 0.8);
  }
  label(o, "ALL SYSTEMS NORMAL", at("green status") + 0.8, {y: 860, size: 30, color: TERM.green, until: at("spectators") - 0.1});
  word(o, "SUPERVISORS IN NAME", at("supervisors"), {size: 96, y: 230, z: -60});
  word(o, "SPECTATORS IN REALITY", at("spectators"), {size: 92, y: 930, z: -60, color: TERM.red, glow: true});
  cam(o, {y0: -260, y1: 20, push: 1.1, d0: 0.6, d1: -0.4});
})();

assemble("Scene7", END, [[0, 100], [0.8, 0], [vo(72.1), 0], [vo(72.4), 10], [END - 1.0, 10], [END, 100]]);
