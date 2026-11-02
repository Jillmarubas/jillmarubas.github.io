// Scene 9, "The modern paradox" (Act V). Built to the production file's Scene 9 directives (DIRECTIVES.md):
// a 2.5D pan over the Manhattan skyline at dusk (three layers), the camera panning down into a drawn
// underground cutaway (conduits, fibre, automated substations; A9), M12 on the bargain. Keywords only. Scene comp starts 1.0 s before the voice; a longer tail
// lets the last music note carry into the sign-off (s10.jsx).
#include "kit2.jsx"
SC = 9;
var END = vo(88.10) + 3.0;

// A · directive 26:30: a 2.5D pan across a metropolis at twilight (Highsmith, Manhattan at dusk, three layers)
(function () {
  var o = Shot("S9A Skyline", 0, vo(16.7), {bg: false});
  photoShot(o, "skyline", {tint: 45, caption: "Manhattan skyline at dusk · Carol M. Highsmith, Library of Congress"});
  label(o, "SCIENCE FICTION", at("science fiction"), {y: 150, size: 30, color: TERM.white});
  bar(o, 880, at("wrong") - 0.2);
  var it = [["WRONG DISASTER", at("wrong"), TERM.white], ["SELF-AWARE MACHINES", at("self"), TERM.red], ["MALICE", at("malice"), TERM.red], ["REBELLION", at("rebelling"), TERM.red], ["SEIZED CONTROL", at("seizing"), TERM.red]];
  for (var k = 0; k < it.length; k++) word(o, it[k][0], it[k][1], {size: 68, y: 895, color: it[k][2], until: k < it.length - 1 ? it[k + 1][1] - 0.05 : undefined});
  cam(o, {x0: -120, x1: 120, y0: 10, y1: -10, d0: -0.6, d1: 0.6, aperture: PHOTO_APERTURE});
})();

// B · the reality we built: quieter, more precarious; no malice, no consciousness, no awareness
(function () {
  var o = Shot("S9B Quieter", vo(16.7), vo(32.6));
  var tB = at("we built mathematical");
  word(o, "QUIETER", at("quieter"), {size: 110, y: 420, until: tB - 0.1});
  word(o, "PRECARIOUS", at("precarious"), {size: 110, y: 560, color: TERM.amber, until: tB - 0.1, glow: true});
  word(o, "OPTIMIZATION ENGINES", tB + 0.3, {size: 84, y: 300, mode: "rise"});
  var it = [["NO MALICE", at("no malice")], ["NO CONSCIOUSNESS", at("no consciousness")], ["NO AWARENESS", at("no awareness")]];
  for (var k = 0; k < 3; k++) word(o, it[k][0], it[k][1], {font: TF.mono, size: 52, y: 470 + k * 100, color: TERM.white, mode: "type", cps: 26});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// C · exactly what we ask, at a velocity where understanding is the bottleneck
(function () {
  var o = Shot("S9C Bottleneck", vo(32.6), vo(41.9));
  word(o, "EXACTLY AS ASKED", at("exactly"), {size: 100, y: 420});
  word(o, "HUMAN UNDERSTANDING", at("human understanding"), {size: 70, y: 580, color: TERM.white, mode: "rise"});
  word(o, "BOTTLENECK", at("impossible"), {size: 90, y: 690, color: TERM.red, glow: true});
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
  var it = [["LIGHT", at("light"), 560, 200], ["EV", at("electric"), 1360, 200], ["FLIGHT", at("flight"), 560, 280], ["GLOBAL GOODS", at("goods"), 1360, 280]];
  for (var k = 0; k < it.length; k++) word(o, it[k][0], it[k][1], {size: 40, x: it[k][2], y: it[k][3], color: TERM.white, mode: "fade", font: TF.mono, track: 40});
  word(o, "INVISIBLE FABRIC", at("invisible"), {size: 90, y: 585, color: TERM.amber, glow: true});
  word(o, "MILLIONS / SECOND", at("millions"), {size: 50, y: 900, font: TF.mono, track: 40});
  cam(o, {push: 1.1, x0: -40, x1: 40, d0: -0.2, d1: 0.3});
})();

// E · directive 27:30: the camera pans down from the street into a drawn underground cutaway: conduits,
// fibre, automated substations, with pulses running (A9)
(function () {
  var o = Shot("S9E Underground", vo(59.2), vo(70.4), {bg: false});
  solid(o.c, TERM.black, "night");
  var gr = solid(o.c, [0.055, 0.045, 0.035], "ground", 2600, 1500); gr.threeDLayer = true; T(gr).property("Position").setValue([W / 2, 330 + 750, 40]);
  var gn = solid(o.c, [0.5, 0.5, 0.5], "soil grain", 2600, 1500); gn.threeDLayer = true; T(gn).property("Position").setValue([W / 2, 330 + 750, 39]);
  fx(gn, "Fractal Noise", {"Contrast": 150, "Transform/Scale": 8}); gn.blendingMode = BlendingMode.MULTIPLY; T(gn).property("Opacity").setValue(30);
  // the street and a drawn city silhouette above it
  var sky = []; var x = -300; sky.push([x, 330]); for (var b = 0; b < 26; b++) { var h = 80 + rnd(b, 3) * 260, w = 70 + rnd(b, 4) * 70; sky.push([x, 330 - h]); sky.push([x + w, 330 - h]); x += w; sky.push([x, 330]); }
  var city = pathShape(o.c, sky, TERM.amberDim, 3, "city"); showAt(o, city.l, o.a);
  var street = pathShape(o.c, [[-300, 330], [2300, 330]], TERM.amber, 4, "street"); showAt(o, street.l, o.a);
  // conduits (amber tubes), fibre (green), substations (boxes)
  for (var c = 0; c < 3; c++) {
    var y = 560 + c * 190, tube = shapeAt(o.c, "conduit", [W / 2, y, 0]); addRect(tube, [2400, 46], [0, 0], TERM.amber, 3, TERM.panel); showAt(o, tube, o.a + 0.2);
    for (var k = 0; k < 5; k++) shuttle(o, [-200, y], [2200, y], TERM.amber, o.a + 0.3, "0.12", k / 2.5, 7);
  }
  for (var f = 0; f < 2; f++) {
    var yf = 660 + f * 190, fib = pathShape(o.c, [[-300, yf], [2300, yf]], TERM.green, 2, "fibre"); drawOn(o, fib, o.a + 0.4 + f * 0.3, 1.2);
    for (var k2 = 0; k2 < 8; k2++) shuttle(o, [-200, yf], [2200, yf], TERM.green, o.a + 1.0, "0.35", k2 / 4, 5);
  }
  for (var s2 = 0; s2 < 3; s2++) {
    var sx = 400 + s2 * 560, sb = shapeAt(o.c, "substation", [sx, 1180, 0]); addRect(sb, [300, 180], [0, 0], TERM.amber, 4, TERM.panel); addRect(sb, [60, 20], [-80, -40], null, 0, TERM.green); showAt(o, sb, o.a + 0.6 + s2 * 0.3);
    label(o, "AUTOMATED SUBSTATION", o.a + 0.9 + s2 * 0.3, {x: sx, y: 1300, size: 20, color: TERM.grey, track: 80});
  }
  word(o, "RELIABLE", at("reliably"), {size: 110, y: 470, z: -80, glow: true, until: at("optimize") - 0.1});
  label(o, "EFFICIENCY · EMISSIONS · FAILURES PREVENTED", at("optimize"), {y: 1010, size: 34, color: TERM.white});
  flag(o, "Illustration");
  cam(o, {y0: -200, y1: 320, push: 1.06, d0: -0.5, d1: 0.6});
})();

// F · until an edge case solves the objective in a way nobody intended
(function () {
  var o = Shot("S9F Edge case", vo(70.4), vo(81.9), {red: true});
  word(o, "UNTIL", at("until"), {size: 90, y: 250, color: TERM.white});
  var tE = at("edge");
  for (var i = 0; i < 40; i++) { var t = word(o, i === 27 ? "✕" : "✓", o.a + 0.1, {font: TF.mono, size: 40, x: 260 + (i % 10) * 155, y: 380 + Math.floor(i / 10) * 70, color: i === 27 ? TERM.red : TERM.green, mode: "on", track: 0}); if (i !== 27) T(t).property("Opacity").expression = "value * 0.35"; else vis(t, o.t(tE), o.d, 0, 0.3, o.d); }
  word(o, "EDGE CASE", tE, {size: 110, y: 780, color: TERM.red, glow: true});
  label(o, "UNINTENDED SOLUTION", at("never intended") - 0.5, {y: 880, size: 32, color: TERM.white});
  cam(o, {push: 1.06, d0: 0.3, d1: -0.4});
})();

// G · the bargain we made
(function () {
  var o = Shot("S9G Bargain", vo(81.9), END);
  label(o, "< 1 SECOND", at("fraction"), {y: 420, size: 34, color: TERM.white});
  word(o, "THE BARGAIN", at("bargain") - 0.3, {size: 130, y: 560, color: TERM.amber, glow: true});
  cam(o, {push: 1.05, d0: -0.2, d1: 0.3});
})();

assemble("Scene9", END, [[0, 100], [0.8, 0], [vo(16.7), 0], [vo(41.9), 0], [vo(42.4), 0], [vo(70.4), 0], [vo(70.7), 15], [vo(81.9), 15], [vo(82.2), 0], [END - 1.5, 0], [END, 100]]);
logEvents(9);
