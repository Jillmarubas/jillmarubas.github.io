// Scene 5, "Inside the vector space" (Act III opens). Scene comp starts 1.0 s before the voice.
// Built to the production file's Scene 5 directives (DIRECTIVES.md): the evidence board with a pull-back
// (a hidden-layer diagram pinned beside transformer schematics, F7 pins), the diagram dissolving into a
// particle cloud of weights (T4), a camera glide through floating weights, labelled illustrative (T5), and
// the "minimize" terminal (K7). Keywords and numbers only.
#include "kit2.jsx"
SC = 5;
var END = vo(113.03) + 1.8;
var INK = TERM.ink, RED_STRING = [0.62, 0.12, 0.1];
var BOARD = {x: W / 2, y: H / 2 + 10};

// a paper card comp with optional drawing callback (draws in card pixels)
var _cards = 0;
function card(w, h, lines, draw) {
  var c = docComp("Card " + (++_cards), w, h, lines || []);
  if (draw) draw(c, w, h);
  return c;
}
// pin a card on the board: pressed on with a 2-frame settle, a red pin head, F7 pin sound
function pinCard(o, cc, x, y, when, rz, sc) {
  var l = c3(o.c, cc, [x, y, 0]); T(l).property("Z Rotation").setValue(rz || 0); shadow(l);
  var s = sc || 100, a = o.t(when);
  keys(T(l).property("Scale"), [[a, [s * 1.04, s * 1.04, 100]], [a + 2 * F, [s, s, 100]]], 0);
  vis(l, a, o.d, 0, 0.3, o.d);
  var p = dot(o.c, x, y - cc.height * s / 100 / 2 + 22, 9, TERM.red, "pin", -4); vis(p, a, o.d, 0, 0.3, o.d);
  EVENTS.push(["pin", when]);
  return l;
}
function transformerDrawing(c, w, h) {
  var l = shapeAt(c, "transformer", [w / 2, h / 2 + 30, 0]);
  for (var side = -1; side <= 1; side += 2) {
    var pts = []; for (var k = 0; k <= 64; k++) { var u = k / 64, a = u * 4 * 2 * Math.PI; pts.push([side * (70 + 26 * Math.sin(a) * side), -110 + u * 220]); }
    addPath(l, pts, INK, 3);
    addPath(l, [[side * 70, -110], [side * 170, -110]], INK, 3); addPath(l, [[side * 70, 110], [side * 170, 110]], INK, 3);
  }
  addPath(l, [[-12, -130], [-12, 130]], INK, 4); addPath(l, [[12, -130], [12, 130]], INK, 4);
}
function nnDrawing(c, w, h) {
  var l = shapeAt(c, "hidden layers", [0, 0, 0]), cols = [4, 6, 6, 3], P = [];
  for (var a = 0; a < cols.length; a++) { P.push([]); for (var n = 0; n < cols[a]; n++) P[a].push([90 + a * (w - 180) / 3, h / 2 + 30 + (n - (cols[a] - 1) / 2) * 52]); }
  for (var a = 0; a < cols.length - 1; a++) for (var i = 0; i < P[a].length; i++) for (var j = 0; j < P[a + 1].length; j++) addPath(l, [P[a][i], P[a + 1][j]], [0.45, 0.45, 0.45], 1);
  for (var a = 0; a < P.length; a++) for (var i = 0; i < P[a].length; i++) addEllipse(l, 22, P[a][i], INK, 3, TERM.paper);
}
function boardBackdrop(c) {
  solid(c, [0.07, 0.05, 0.035], "board");
  var n = solid(c, [0.5, 0.5, 0.5], "cork grain"); fx(n, "Fractal Noise", {"Contrast": 160, "Transform/Scale": 6}); n.blendingMode = BlendingMode.MULTIPLY; T(n).property("Opacity").setValue(35);
}
function stringLine(o, a, b, when) { var p = pathShape(o.c, [a, b], RED_STRING, 3, "string"); drawOn(o, p, when, 0.5); T(p.l).property("Position").setValue([0, 0, -6]); return p; }

// A · directive 13:30: the evidence board. The camera starts close on the hidden-layer diagram pinned
// beside the transformer schematic and pulls back as the forensic evidence is pinned around them
var NN_POS = [1380, 420], NN_W = 520, NN_H = 380;
(function () {
  var o = Shot("S5A Evidence board", 0, vo(20.9), {bg: false});
  boardBackdrop(o.c);
  pinCard(o, card(460, 380, [["TRANSFORMER · SCHEMATIC", TF.monoReg, 20, TERM.grey, 30, 46, 60]], transformerDrawing), 860, 420, 0.15, -3);
  pinCard(o, card(NN_W, NN_H, [["HIDDEN LAYERS", TF.monoReg, 20, TERM.grey, 30, 46, 60]], nnDrawing), NN_POS[0], NN_POS[1], 0.45, 2);
  // the forensic chain: the fracture under a magnifier, then the three causes
  var fr = card(520, 340, [["FRACTURE", TF.monoReg, 20, TERM.grey, 30, 46, 60]], function (c, w, h) {
    var pl = shapeAt(c, "plate", [w / 2, h / 2 + 20, 0]); addRect(pl, [w - 80, h - 120], [0, 0], INK, 3, [0.8, 0.79, 0.76]);
    var cr = [[-180, -70]]; for (var i = 1; i <= 12; i++) cr.push([-180 + i * 30, -70 + i * 12 + (i % 2 ? -14 : 12)]);
    addPath(pl, cr, [0.6, 0.08, 0.06], 4);
  });
  var tB = at("steel bridge");
  pinCard(o, fr, 400, 330, tB, -4);
  var lens = shapeAt(o.c, "magnifier", [330, 330, -40]); addEllipse(lens, 150, [0, 0], TERM.amber, 6, null); addPath(lens, [[54, 54], [120, 120]], TERM.amber, 10);
  showAt(o, lens, at("investigators"));
  keys(T(lens).property("Position"), [[o.t(at("fracture")), [320, 320, -40]], [o.t(at("microscope")) + 1.2, [490, 370, -40]]], 50);
  var C = [["METAL FATIGUE", at("metal fatigue"), 480, 800, 3], ["CALCULATION ERROR", at("calculation"), 960, 850, -2], ["FAULTY VALVE", at("faulty"), 1440, 800, 4]];
  for (var k = 0; k < 3; k++) {
    pinCard(o, card(470, 150, [[C[k][0], TF.head, 38, INK, 30, 94, 20]]), C[k][2], C[k][3], C[k][1], C[k][4]);
    stringLine(o, [400, 450], [C[k][2], C[k][3] - 60], C[k][1] + 0.1);
  }
  word(o, "FORENSIC", at("forensic"), {size: 110, y: 820, mode: "rise", glow: true, until: at("steel bridge") + 2.5});
  flag(o, "Illustration");
  cam(o, {pull: true, x0: 160, x1: 0, y0: -110, y1: 0, d0: -0.4, d1: 0.5});
})();

// B · deterministic software: execution logs (illustration)
(function () {
  var o = Shot("S5B Logs", vo(20.9), vo(32.9));
  label(o, "DETERMINISTIC SOFTWARE · EXECUTION LOGS", at("deterministic"), {y: 160, size: 30, color: TERM.white});
  var b = box(o, 1400, 700, W / 2, 590, 40); showAt(o, b, o.a + 0.1);
  var L = ["call  read_sensor(bus_12)", "ok    voltage within limits", "call  update_schedule()", "ok    schedule committed", "call  route(packet_4471)", "ok    route found", "call  free(buffer_9)", "ok    buffer released", "call  read(buffer_9)"];
  for (var i = 0; i < L.length; i++) word(o, L[i], at("execution") + i * 0.35, {font: TF.monoReg, size: 34, x: W / 2 - 640, y: 300 + i * 56, just: LEFTJ, track: 0, mode: "type", cps: 40, color: TERM.grey});
  word(o, "ERROR  corrupted pointer", at("corrupted"), {font: TF.mono, size: 40, x: W / 2 - 640, y: 820, just: LEFTJ, track: 0, color: TERM.red, glow: true});
  word(o, "WARN   infinite loop", at("infinite"), {font: TF.mono, size: 40, x: W / 2 - 640, y: 880, just: LEFTJ, track: 0, color: TERM.amber});
  flag(o, "Illustration");
  cam(o, {y0: 30, y1: -30, d0: 0.2, d1: -0.2});
})();

// C · directive 14:15: back on the board, the hidden-layer diagram dissolves into a 3D cloud of weights (T4)
var tDont = at("they don't");
(function () {
  var o = Shot("S5C Dissolve", vo(32.9), tDont, {bg: false});
  boardBackdrop(o.c);
  var t0 = o.t(at("operate")) - 0.2;
  var nn = c3(o.c, card(NN_W, NN_H, [["HIDDEN LAYERS", TF.monoReg, 20, TERM.grey, 30, 46, 60]], nnDrawing), [W / 2, H / 2, 0]);
  T(nn).property("Scale").setValue([150, 150, 100]); shadow(nn);
  keys(T(nn).property("Opacity"), [[0, 100], [t0, 100], [t0 + 1.0, 0]], 0);
  for (var i = 0; i < 160; i++) {
    var x0 = W / 2 + (rnd(i, 1) - 0.5) * NN_W * 1.5, y0 = H / 2 + (rnd(i, 2) - 0.5) * NN_H * 1.5, td = t0 + rnd(i, 3) * 0.9;
    var vx = (rnd(i, 4) - 0.5) * 520, vy = (rnd(i, 5) - 0.5) * 360 - 60, vz = -200 - rnd(i, 6) * 900;
    var d = dot(o.c, x0, y0, 3 + (i % 3), i % 4 ? TERM.amber : TERM.paper, "weight particle", 0);
    T(d).property("Position").expression = "var t = Math.max(0, time - " + td.toFixed(2) + "); [" + x0.toFixed(1) + " + " + vx.toFixed(1) + " * t, " + y0.toFixed(1) + " + " + vy.toFixed(1) + " * t, " + vz.toFixed(1) + " * t];";
    keys(T(d).property("Opacity"), [[0, 0], [td, 0], [td + 0.15, 100]], 0);
  }
  label(o, "DEEP REINFORCEMENT LEARNING", at("deep reinforcement"), {y: 170, size: 34, color: TERM.white});
  flag(o, "Illustrative");
  cam(o, {push: 1.03, d0: 0.5, d1: -0.6});
})();

// D · directive 15:00: the camera glides through floating weights (W_12: −0.8419 …), labelled illustrative (T5)
(function () {
  var o = Shot("S5D Weights", tDont, vo(51.8));
  for (var k = 0; k < 70; k++) {
    var i1 = 1 + Math.floor(rnd(k, 1) * 64), i2 = 1 + Math.floor(rnd(k, 2) * 64), v = (rnd(k, 3) * 2 - 1);
    var s = "W_" + i1 + "," + i2 + ": " + (v < 0 ? "−" : "+") + Math.abs(v).toFixed(4);
    var x = 160 + rnd(k, 4) * 1600, y = 160 + rnd(k, 5) * 760, z0 = -800 + rnd(k, 6) * 3600;
    var t = txt(o.c, s, TF.monoReg, 34, k % 5 ? TERM.amber : TERM.white, [x, y, z0], CENTER, 0);
    // drift toward the lens and wrap around before reaching it, so the glide never ends
    T(t).property("Position").expression = "var z = " + z0.toFixed(0) + " - time * 520; z = ((z + 900) % 3600 + 3600) % 3600 - 900; [" + x.toFixed(0) + ", " + y.toFixed(0) + ", z];";
    T(t).property("Opacity").expression = "var z = transform.position[2]; 85 * Math.min(1, (z + 900) / 400) * Math.min(1, (2700 - z) / 900);";
  }
  word(o, "NO SENTENCES", at("sentences"), {size: 90, y: H / 2, z: -100, until: at("thousands") - 0.1});
  word(o, "MILLIONS", at("millions"), {font: TF.mono, size: 130, y: H / 2 - 30, z: -100, color: TERM.white, until: at("weights") - 0.1});
  word(o, "WEIGHTS", at("weights"), {size: 150, y: H / 2, z: -100, color: TERM.amber, glow: true});
  flag(o, "Illustrative values");
  cam(o, {push: 1.08, d0: -0.5, d1: 0.6});
})();

// E · high-dimensional matrix math, in milliseconds
(function () {
  var o = Shot("S5E Matrix", vo(51.8), vo(63.1), {red: true});
  label(o, "GRID INSTABILITY · SURGE", at("grid instability"), {y: 170, size: 32, color: TERM.white});
  for (var r = 0; r < 6; r++) for (var q = 0; q < 7; q++) {
    var t = word(o, "0.000", o.a + 0.2 + (r + q) * 0.04, {font: TF.monoReg, size: 34, x: 480 + q * 160, y: 330 + r * 62, color: TERM.amber, mode: "fade", track: 0});
    t.property("Source Text").expression = "seedRandom(" + (r * 7 + q) + " + Math.floor(time * 6), true); (random(-1, 1)).toFixed(3);";
    T(t).property("Opacity").expression = "value * 0.6";
  }
  word(o, "MATRIX MATH", at("matrix") - 0.3, {size: 100, y: 790, glow: true});
  word(o, "MILLISECONDS", at("milliseconds"), {size: 64, y: 900, color: TERM.amber});
  flag(o, "Illustrative");
  cam(o, {push: 1.06, d0: 0.3, d1: -0.3});
})();

// F · no human sentence inside; directive 16:15: the "minimize" terminal (K7)
(function () {
  var o = Shot("S5F Loss", vo(63.1), vo(75.5));
  var tS = at("it simply");
  word(o, "SHED LOAD → SAVE SUBSTATION", at("i should"), {size: 60, y: 300, mode: "type", cps: 26, font: TF.headReg});
  strike(o, W / 2, 285, 980, at("substation") + 0.4);
  var b = box(o, 1500, 260, W / 2, 680, 30); showAt(o, b, tS);
  word(o, "minimize:", tS + 0.1, {font: TF.mono, size: 52, x: W / 2 - 680, y: 640, just: LEFTJ, track: 0, color: TERM.amber, mode: "type", cps: 24});
  word(o, "TRANSMISSION_LOSS + VOLTAGE_PENALTY + DAMAGE_RISK", at("loss value"), {font: TF.mono, size: 42, x: W / 2 - 680, y: 720, just: LEFTJ, track: 0, mode: "type", cps: 30});
  label(o, "OBJECTIVE FUNCTION", at("objective"), {y: 880, size: 30, color: TERM.white});
  flag(o, "Illustrative");
  cam(o, {d0: -0.3, d1: 0.3});
})();

// G · inputs visible, command visible; the pathway between is not (camera pushes into the box)
var tBut = at("but they");
(function () {
  var o = Shot("S5G Black box", vo(75.5), tBut);
  tag(o, "INPUTS", at("inputs"), {x: 430, y: 520, color: TERM.green, size: 52});
  label(o, "VISIBLE", at("inputs") + 0.4, {x: 430, y: 610, color: TERM.green, size: 26});
  tag(o, "CONTROL COMMAND", at("control command"), {x: 1480, y: 520, color: TERM.green, size: 46});
  label(o, "VISIBLE", at("control command") + 0.4, {x: 1480, y: 610, color: TERM.green, size: 26});
  var bx = shapeAt(o.c, "black box", [W / 2, 520, 0]); addRect(bx, [460, 340], [0, 0], TERM.red, 4, [0.01, 0.01, 0.015]); showAt(o, bx, o.a + 0.3);
  word(o, "?", at("cannot"), {size: 220, y: 600, color: TERM.red, glow: true});
  for (var k = 0; k < 6; k++) { shuttle(o, [580, 500 + k * 10], [730, 500 + k * 10], TERM.green, at("entered"), "0.9", k / 3); }
  word(o, "REASONING: NOT READABLE", at("reasoning"), {size: 64, y: 820, color: TERM.red});
  label(o, "INTERPRETABILITY TOOLS", at("researchers"), {y: 900, size: 28, color: TERM.white});
  cam(o, {push: 1.12, d0: -0.2, d1: 0.4});
})();

// H · the "but" turn (cut on the word): still no full answer; you can verify, you cannot ask why
(function () {
  var o = Shot("S5H Why", tBut, END, {red: true});
  var tV = at("verify");
  word(o, "NO FULL ANSWER", tBut, {size: 110, y: H / 2, color: TERM.white, until: tV - 0.1});
  word(o, "VERIFY ✓", tV, {size: 80, y: 380, color: TERM.green, font: TF.mono});
  word(o, "WHY?", at("why") - 0.4, {size: 200, y: 600, color: TERM.red, glow: true});
  strike(o, W / 2, 570, 560, at("others"));
  cam(o, {push: 1.06, d0: 0.5, d1: -0.6});
})();

assemble("Scene5", END, [[0, 100], [0.8, 0], [vo(51.8), 0], [vo(52.2), 12], [vo(63.1), 12], [vo(63.4), 0], [vo(86.2), 0], [vo(87), 15], [tBut, 15], [tBut + F, 22], [END - 1.0, 22], [END, 100]],
  [[tBut, "cold"]]);
logEvents(5);
