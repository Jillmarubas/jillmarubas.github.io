// Scene 5, "Inside the vector space" (Act III opens). Scene comp starts 1.0 s before the voice.
#include "kit2.jsx"
SC = 5;
var END = vo(113.03) + 1.8;

// A · failure is physically forensic
(function () {
  var o = Shot("S5A Forensic", 0, vo(5.2));
  label(o, "TRADITIONAL ENGINEERING", at("traditional"), {y: 400, size: 34, color: TERM.white});
  word(o, "FAILURE IS FORENSIC", at("failure"), {size: 120, y: 530, mode: "rise", glow: true});
  cam(o, {push: 1.04});
})();

// B · trace the fracture line: fatigue, a calculation error, a faulty valve
(function () {
  var o = Shot("S5B Fracture", vo(5.2), vo(20.9));
  label(o, "A BRIDGE COLLAPSES · A TURBINE BLOWS", at("steel bridge"), {y: 170, size: 32, color: TERM.white});
  var plate = box(o, 900, 640, 640, 590, 40, TERM.grey); showAt(o, plate, o.a + 0.1);
  var crack = [[250, 360]]; for (var i = 1; i <= 14; i++) crack.push([250 + i * 55, 360 + i * 30 + (i % 2 ? -26 : 22)]);
  var p = pathShape(o.c, crack, TERM.red, 5, "fracture line"); drawOn(o, p, at("fracture"), 1.6);
  var lens = shapeAt(o.c, "magnifier", [420, 470, -20]); addEllipse(lens, 200, [0, 0], TERM.amber, 6, null); addPath(lens, [[70, 70], [150, 150]], TERM.amber, 12);
  showAt(o, lens, at("investigators"));
  keys(T(lens).property("Position"), [[o.t(at("fracture")), [420, 470, -20]], [o.t(at("microscope")) + 1.5, [820, 640, -20]]], 50);
  var t = [["METAL FATIGUE", at("metal fatigue")], ["CALCULATION ERROR", at("calculation")], ["FAULTY VALVE", at("faulty")]];
  for (var k = 0; k < 3; k++) word(o, t[k][0], t[k][1], {size: 64, x: 1500, y: 420 + k * 130, color: k === 0 ? TERM.amber : TERM.white});
  cam(o, {x0: -40, x1: 40, d0: -0.3, d1: 0.3});
})();

// C · deterministic software: read the logs line by line (illustration)
(function () {
  var o = Shot("S5C Logs", vo(20.9), vo(32.9));
  label(o, "DETERMINISTIC SOFTWARE: REVIEW THE LOGS LINE BY LINE", at("deterministic"), {y: 160, size: 30, color: TERM.white});
  var b = box(o, 1400, 700, W / 2, 590, 40); showAt(o, b, o.a + 0.1);
  var L = ["call  read_sensor(bus_12)", "ok    voltage within limits", "call  update_schedule()", "ok    schedule committed", "call  route(packet_4471)", "ok    route found", "call  free(buffer_9)", "ok    buffer released", "call  read(buffer_9)"];
  for (var i = 0; i < L.length; i++) word(o, L[i], at("execution") + i * 0.35, {font: TF.monoReg, size: 34, x: W / 2 - 640, y: 300 + i * 56, just: LEFTJ, track: 0, mode: "type", cps: 40, color: TERM.grey});
  word(o, "ERROR  corrupted pointer", at("corrupted"), {font: TF.mono, size: 40, x: W / 2 - 640, y: 820, just: LEFTJ, track: 0, color: TERM.red, glow: true});
  word(o, "WARN   infinite loop", at("infinite"), {font: TF.mono, size: 40, x: W / 2 - 640, y: 880, just: LEFTJ, track: 0, color: TERM.amber});
  flag(o, "Illustration");
  cam(o, {y0: 30, y1: -30, d0: 0.2, d1: -0.2});
})();

// D · a neural network: no sentences, just weights (illustrative)
(function () {
  var o = Shot("S5D Weights", vo(32.9), vo(51.8));
  word(o, "DEEP REINFORCEMENT LEARNING", at("deep reinforcement"), {size: 70, y: 150, until: at("they don't") - 0.1});
  word(o, "NO SENTENCES · NO CLEAR PROCEDURES", at("sentences"), {size: 56, y: 150, color: TERM.white, mode: "rise"});
  var layers = [5, 8, 8, 8, 3], X = [380, 670, 960, 1250, 1540], net = shapeAt(o.c, "connections", [0, 0, 20]), P = [];
  for (var a = 0; a < layers.length; a++) { P.push([]); for (var n = 0; n < layers[a]; n++) P[a].push([X[a], 580 + (n - (layers[a] - 1) / 2) * 78]); }
  for (var a = 0; a < layers.length - 1; a++) for (var i = 0; i < P[a].length; i++) for (var j = 0; j < P[a + 1].length; j++) addPath(net, [P[a][i], P[a + 1][j]], TERM.amberDim, 1.5);
  showAt(o, net, at("models"));
  for (var a = 0; a < P.length; a++) for (var i = 0; i < P[a].length; i++) showAt(o, dot(o.c, P[a][i][0], P[a][i][1], 13, TERM.amber, "neuron"), at("models") + a * 0.15);
  // weights drifting in front (Z -200): numbers generated here, labelled illustrative
  for (var k = 0; k < 26; k++) {
    var v = (rnd(k, 4) * 4 - 2).toFixed(3);
    var t = word(o, (v > 0 ? "+" : "") + v, at("thousands") + rnd(k, 5) * 3, {font: TF.monoReg, size: 30, x: 200 + rnd(k, 6) * 1520, y: 300 + rnd(k, 7) * 600, z: -200 + rnd(k, 8) * 300, color: TERM.amber, mode: "fade", track: 0});
    T(t).property("Opacity").expression = "value * 0.55";
  }
  word(o, "MILLIONS OF WEIGHTS", at("weights") - 0.6, {size: 100, y: 960, color: TERM.amber, glow: true});
  flag(o, "Illustrative");
  cam(o, {push: 1.1, d0: -0.4, d1: 0.4});
})();

// E · high-dimensional matrix math, in milliseconds
(function () {
  var o = Shot("S5E Matrix", vo(51.8), vo(63.1), {red: true});
  label(o, "A GRID INSTABILITY · AN UNEXPECTED SURGE", at("grid instability"), {y: 170, size: 32, color: TERM.white});
  for (var r = 0; r < 6; r++) for (var q = 0; q < 7; q++) {
    var t = word(o, "0.000", o.a + 0.2 + (r + q) * 0.04, {font: TF.monoReg, size: 34, x: 480 + q * 160, y: 330 + r * 62, color: TERM.amber, mode: "fade", track: 0});
    t.property("Source Text").expression = "seedRandom(" + (r * 7 + q) + " + Math.floor(time * 6), true); (random(-1, 1)).toFixed(3);";
    T(t).property("Opacity").expression = "value * 0.6";
  }
  word(o, "HIGH-DIMENSIONAL MATRIX MATH", at("matrix") - 0.5, {size: 90, y: 790, glow: true});
  word(o, "IN MILLISECONDS", at("milliseconds"), {size: 64, y: 900, color: TERM.amber});
  flag(o, "Illustrative");
  cam(o, {push: 1.06, d0: 0.3, d1: -0.3});
})();

// F · it does not think in sentences; it minimises a loss
(function () {
  var o = Shot("S5F Loss", vo(63.1), vo(75.5));
  var tS = at("it simply");
  word(o, "“I SHOULD SHED LOAD TO PRESERVE THIS SUBSTATION”", at("i should"), {size: 54, y: 300, mode: "type", cps: 26, font: TF.headReg});
  strike(o, W / 2, 285, 1460, at("substation") + 0.4);
  label(o, "IT DOES NOT THINK THIS", at("substation") + 0.6, {y: 380, size: 30, color: TERM.red});
  var b = box(o, 1500, 260, W / 2, 680, 30); showAt(o, b, tS);
  word(o, "minimize:", tS + 0.1, {font: TF.mono, size: 52, x: W / 2 - 680, y: 640, just: LEFTJ, track: 0, color: TERM.amber, mode: "type", cps: 24});
  word(o, "TRANSMISSION_LOSS + VOLTAGE_PENALTY + DAMAGE_RISK", at("loss value"), {font: TF.mono, size: 42, x: W / 2 - 680, y: 720, just: LEFTJ, track: 0, mode: "type", cps: 30});
  label(o, "THE LOWEST VALUE OF ITS OBJECTIVE FUNCTION", at("objective"), {y: 880, size: 30, color: TERM.white});
  flag(o, "Illustrative");
  cam(o, {d0: -0.3, d1: 0.3});
})();

// G · inputs visible, command visible; the pathway between is not (camera pushes into the box)
(function () {
  var o = Shot("S5G Black box", vo(75.5), vo(103.5));
  tag(o, "INPUTS", at("inputs"), {x: 430, y: 520, color: TERM.green, size: 52});
  label(o, "VISIBLE", at("inputs") + 0.4, {x: 430, y: 610, color: TERM.green, size: 26});
  tag(o, "CONTROL COMMAND", at("control command"), {x: 1480, y: 520, color: TERM.green, size: 46});
  label(o, "VISIBLE", at("control command") + 0.4, {x: 1480, y: 610, color: TERM.green, size: 26});
  var bx = shapeAt(o.c, "black box", [W / 2, 520, 0]); addRect(bx, [460, 340], [0, 0], TERM.red, 4, [0.01, 0.01, 0.015]); showAt(o, bx, o.a + 0.3);
  var q = word(o, "?", at("cannot"), {size: 220, y: 600, color: TERM.red, glow: true});
  for (var k = 0; k < 6; k++) { shuttle(o, [580, 500 + k * 10], [730, 500 + k * 10], TERM.green, at("entered"), "0.9", k / 3); }
  word(o, "REASONING PATHWAY: NOT HUMAN-READABLE", at("reasoning"), {size: 58, y: 820, color: TERM.red});
  label(o, "TOOLS TO LOOK INSIDE ARE STILL FAR FROM A FULL ANSWER", at("researchers"), {y: 900, size: 28, color: TERM.white});
  cam(o, {push: 1.12, d0: -0.2, d1: 0.4});
})();

// H · you can verify; you cannot ask why
(function () {
  var o = Shot("S5H Why", vo(103.5), END, {red: true});
  word(o, "VERIFY THE CALCULATION ✓", at("verify"), {size: 70, y: 380, color: TERM.green, font: TF.mono});
  word(o, "ASK IT WHY", at("why") - 0.4, {size: 170, y: 600, color: TERM.red, glow: true});
  strike(o, W / 2, 570, 900, at("others"));
  cam(o, {push: 1.06});
})();

assemble("Scene5", END, [[0, 100], [0.8, 0], [vo(51.8), 0], [vo(52.2), 12], [vo(63.1), 12], [vo(63.4), 0], [vo(86.2), 0], [vo(87), 15], [END - 1.0, 15], [END, 100]]);
