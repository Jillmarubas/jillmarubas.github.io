// Scene 9, "The modern paradox" (Act V). Scene comp starts 1.0 s before the voice; a longer tail
// lets the last music note carry into the sign-off (s10.jsx).
#include "kit2.jsx"
SC = 9;
var END = vo(88.10) + 3.0;

// A · science fiction taught us to fear the wrong disaster
(function () {
  var o = Shot("S9A Wrong disaster", 0, vo(16.7), {red: true});
  label(o, "FOR DECADES, SCIENCE FICTION TAUGHT US TO FEAR", at("science fiction"), {y: 200, size: 30, color: TERM.white});
  word(o, "THE WRONG DISASTER", at("wrong"), {size: 96, y: 300});
  var it = [["SELF-AWARE MACHINES", at("self")], ["CONSCIOUS MALICE", at("conscious")], ["REBELLION", at("rebelling")], ["CONTROL SEIZED BY FORCE", at("seizing")]];
  for (var k = 0; k < it.length; k++) word(o, it[k][0], it[k][1], {size: 70, y: 470 + k * 120, color: TERM.red, mode: "slam"});
  cam(o, {push: 1.06, d0: -0.4, d1: 0.5});
})();

// B · the reality we built: quieter, more precarious; no malice, no consciousness, no awareness
(function () {
  var o = Shot("S9B Quieter", vo(16.7), vo(32.6));
  var tB = at("we built mathematical");
  word(o, "FAR QUIETER", at("quieter"), {size: 110, y: 420, until: tB - 0.1});
  word(o, "FAR MORE PRECARIOUS", at("precarious"), {size: 110, y: 560, color: TERM.amber, until: tB - 0.1, glow: true});
  word(o, "MATHEMATICAL OPTIMIZATION ENGINES", tB + 0.3, {size: 74, y: 300, mode: "rise"});
  var it = [["NO MALICE", at("no malice")], ["NO CONSCIOUSNESS", at("no consciousness")], ["NO AWARENESS OF HUMAN EXISTENCE", at("no awareness")]];
  for (var k = 0; k < 3; k++) word(o, it[k][0], it[k][1], {font: TF.mono, size: 52, y: 470 + k * 100, color: TERM.white, mode: "type", cps: 26});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// C · exactly what we ask, at a velocity where understanding is the bottleneck
(function () {
  var o = Shot("S9C Bottleneck", vo(32.6), vo(41.9));
  word(o, "EXACTLY WHAT WE ASK", at("exactly"), {size: 100, y: 420});
  word(o, "HUMAN UNDERSTANDING", at("human understanding"), {size: 70, y: 580, color: TERM.white, mode: "rise"});
  word(o, "THE IMPOSSIBLE BOTTLENECK", at("impossible"), {size: 90, y: 690, color: TERM.red, glow: true});
  cam(o, {push: 1.05});
})();

// D · every light, every EV, every flight, every shipment: an invisible fabric of machine decisions
(function () {
  var o = Shot("S9D Invisible fabric", vo(41.9), vo(59.2));
  // the fabric: a mesh of decision nodes; pulses run along it faster and faster
  var P = []; for (var i = 0; i < 44; i++) P.push([160 + rnd(i, 11) * 1600, 330 + rnd(i, 12) * 520]);
  var tF = at("invisible");
  for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
    var dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1];
    if (dx * dx + dy * dy < 230 * 230) { var e = pathShape(o.c, [P[i], P[j]], TERM.amberDim, 2, "thread"); showAt(o, e.l, o.a + 0.3 + rnd(i * 50 + j, 13) * 2); }
  }
  for (var i = 0; i < P.length; i++) showAt(o, dot(o.c, P[i][0], P[i][1], 6, TERM.amber, "decision"), o.a + 0.2 + rnd(i, 14) * 2);
  for (var k = 0; k < 16; k++) { var p0 = P[(k * 7) % P.length], p1 = P[(k * 7 + 5) % P.length]; shuttle(o, p0, p1, TERM.amber, tF, "0.8 + Math.max(0, time - " + o.t(at("millions")) + ") * 0.6", k / 5, 5); }
  var it = [["A LIGHT", at("light"), 560, 200], ["AN ELECTRIC VEHICLE", at("electric"), 1360, 200], ["A FLIGHT", at("flight"), 560, 280], ["GOODS FROM ACROSS THE GLOBE", at("goods"), 1360, 280]];
  for (var k = 0; k < it.length; k++) word(o, it[k][0], it[k][1], {size: 40, x: it[k][2], y: it[k][3], color: TERM.white, mode: "fade", font: TF.mono, track: 40});
  word(o, "AN INVISIBLE FABRIC OF MACHINE DECISIONS", at("invisible"), {size: 70, y: 585, color: TERM.amber, glow: true});
  word(o, "MILLIONS OF CALCULATIONS A SECOND", at("millions"), {size: 50, y: 900, font: TF.mono, track: 40});
  cam(o, {push: 1.1, x0: -40, x1: 40, d0: -0.2, d1: 0.3});
})();

// E · reliable for millions of cycles
(function () {
  var o = Shot("S9E Reliable", vo(59.2), vo(70.4));
  for (var i = 0; i < 40; i++) { var t = word(o, "✓", o.a + 0.1 + rnd(i, 2) * 1.2, {font: TF.mono, size: 40, x: 260 + (i % 10) * 155, y: 330 + Math.floor(i / 10) * 70, color: TERM.green, mode: "fade", track: 0}); T(t).property("Opacity").expression = "value * 0.6"; }
  word(o, "RELIABLE FOR MILLIONS OF CYCLES", at("reliably"), {size: 80, y: 700});
  label(o, "MORE EFFICIENT · LOWER EMISSIONS · FAILURES PREVENTED", at("optimize"), {y: 800, size: 32, color: TERM.green});
  cam(o, {d0: -0.2, d1: 0.2});
})();

// F · until an edge case solves the objective in a way nobody intended
(function () {
  var o = Shot("S9F Edge case", vo(70.4), vo(81.9), {red: true});
  word(o, "UNTIL", at("until"), {size: 90, y: 250, color: TERM.white});
  var tE = at("edge");
  for (var i = 0; i < 40; i++) { var t = word(o, i === 27 ? "✕" : "✓", o.a + 0.1, {font: TF.mono, size: 40, x: 260 + (i % 10) * 155, y: 380 + Math.floor(i / 10) * 70, color: i === 27 ? TERM.red : TERM.green, mode: "on", track: 0}); if (i !== 27) T(t).property("Opacity").expression = "value * 0.35"; else vis(t, o.t(tE), o.d, 0, 0.3, o.d); }
  word(o, "AN EDGE CASE", tE, {size: 110, y: 780, color: TERM.red, glow: true});
  label(o, "SOLVING THE OBJECTIVE IN A WAY NO ONE INTENDED", at("never intended") - 0.5, {y: 880, size: 32, color: TERM.white});
  cam(o, {push: 1.06, d0: 0.3, d1: -0.4});
})();

// G · the bargain we made
(function () {
  var o = Shot("S9G Bargain", vo(81.9), END);
  label(o, "IN THAT FRACTION OF A SECOND", at("fraction"), {y: 420, size: 34, color: TERM.white});
  word(o, "THE BARGAIN WE MADE", at("bargain") - 0.3, {size: 130, y: 560, color: TERM.amber, glow: true});
  cam(o, {push: 1.05, d0: -0.2, d1: 0.3});
})();

assemble("Scene9", END, [[0, 100], [0.8, 0], [vo(16.7), 0], [vo(41.9), 0], [vo(42.4), 0], [vo(70.4), 0], [vo(70.7), 15], [vo(81.9), 15], [vo(82.2), 0], [END - 1.5, 0], [END, 100]]);
