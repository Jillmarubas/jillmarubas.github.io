// Scene 6, "Specification gaming". Scene comp starts 1.0 s before the voice.
// Built to the production file's Scene 6 directives (DIRECTIVES.md): a counter to about 60 with example
// cards and the block flip (no line graph), DeepMind's own definition, a three-layer photo of power lines
// under a gloomy sky (E3), and the two side-by-side terminals marked HYPOTHETICAL. Keywords only.
#include "kit2.jsx"
SC = 6;
var END = vo(97.71) + 1.8;

// A · a documented phenomenon: specification gaming
(function () {
  var o = Shot("S6A Spec gaming", 0, vo(9.7));
  label(o, "COMPUTER SCIENCE", at("computer science"), {y: 380, size: 34, color: TERM.white});
  label(o, "DOCUMENTED", at("documented"), {y: 440, size: 30, color: TERM.amber});
  word(o, "SPECIFICATION GAMING", at("specification gaming") - 0.3, {size: 140, y: 600, glow: true});
  cam(o, {push: 1.05, d0: -0.2, d1: 0.3});
})();

// B · no ethics, no context, no common sense: only a reward function
(function () {
  var o = Shot("S6B Reward only", vo(9.7), vo(23.6));
  label(o, "OPTIMIZATION GOAL", at("optimization"), {y: 200, size: 30, color: TERM.white});
  var it = [["ETHICS", at("ethics")], ["CONTEXT", at("context")], ["COMMON SENSE", at("common sense")]];
  for (var k = 0; k < 3; k++) { word(o, it[k][0], it[k][1], {size: 80, y: 330 + k * 120, mode: "fade"}); strike(o, W / 2, 300 + k * 120, it[k][0].length * 44 + 40, it[k][1] + 0.6); }
  word(o, "REWARD FUNCTION", at("reward function") - 0.4, {size: 96, y: 800, color: TERM.amber, glow: true});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// C · DeepMind, 2020: about 60 real examples, and their definition
(function () {
  var o = Shot("S6C DeepMind list", vo(23.6), vo(30.5));
  tag(o, "DEEPMIND · 2020", at("2020"), {y: 190, color: TERM.amber, size: 50});
  num(o, 0, 60, at("collected"), at("60") + 0.2, {pre: "≈ ", size: 110, y: 330, glow: true});
  label(o, "EXAMPLES", at("60") + 0.3, {y: 400, size: 28, color: TERM.white});
  // example cards fan in behind the counter as it climbs (blank index cards: the list itself is DeepMind's)
  for (var k = 0; k < 9; k++) {
    var cc = docComp("Example card " + k, 300, 190, [["EXAMPLE " + (k + 1), TF.monoReg, 22, TERM.grey, 24, 44, 60]]);
    var l = c3(o.c, cc, [380 + k * 145, 560 + (k % 2) * 18, 60]); T(l).property("Z Rotation").setValue((rnd(k, 2) - 0.5) * 14); T(l).property("Scale").setValue([70, 70, 100]);
    slideIn(o, l, at("collected") + k * 0.17, [380 + k * 145, 560 + (k % 2) * 18, 60], [0, 500]);
    T(l).property("Opacity").expression = "value * 0.7";
  }
  quote(o, ["“behaviour that satisfies the literal specification of an", "objective without achieving the intended outcome”"], "DEEPMIND, 2020 · SPECIFICATION GAMING", at("deepmind"), {y: 860, w: 1500, size: 44, lh: 62, font: TF.headReg});
  cam(o, {d0: -0.2, d1: 0.3});
})();

// D · the red block: rewarded for height, it flips the block instead of stacking it
(function () {
  var o = Shot("S6D Block flip", vo(30.5), vo(48.2));
  label(o, "REWARD: BLOCK HEIGHT", at("rewarded"), {y: 170, size: 30, color: TERM.white});
  var tbl = pathShape(o.c, [[360, 800], [1560, 800]], TERM.grey, 4, "table"); showAt(o, tbl.l, o.a);
  var other = shapeAt(o.c, "other block", [1180, 730, 0]); addRect(other, [140, 140], [0, 0], TERM.amber, 4, TERM.panel); showAt(o, other, o.a + 0.2);
  var ghost = shapeAt(o.c, "intended: stack", [1180, 590, 0]); addRect(ghost, [140, 140], [0, 0], TERM.grey, 3, null); showAt(o, ghost, at("stacking"), at("flipped") + 1.5);
  label(o, "INTENDED: STACK", at("stacking") + 0.2, {x: 1180, y: 480, size: 26, until: at("flipped") + 1.5});
  // the red block flips upside down instead of being stacked
  var blk = shapeAt(o.c, "red block", [720, 730, 0]); addRect(blk, [140, 140], [0, 0], TERM.red, 4, [0.5, 0.1, 0.08]); addEllipse(blk, 26, [0, -40], TERM.paper, 0, TERM.paper);
  showAt(o, blk, o.a + 0.2);
  var tf = o.t(at("flipped"));
  keys(T(blk).property("Z Rotation"), [[0, 0], [tf, 0], [tf + 0.7, 180]], 0); setEase(T(blk).property("Z Rotation"), 60, 60);
  keys(T(blk).property("Position"), [[tf, [720, 730, 0]], [tf + 0.35, [720, 640, 0]], [tf + 0.7, [720, 730, 0]]], 40);
  var arm = shapeAt(o.c, "robot arm", [0, 0, -10]); addPath(arm, [[360, 260], [560, 420], [720, 560]], TERM.grey, 14); addEllipse(arm, 36, [560, 420], TERM.grey, 0, TERM.grey);
  showAt(o, arm, at("robot arm"));
  word(o, "GOAL MET ✓", at("goal was met"), {size: 72, y: 920, x: 600, color: TERM.green});
  word(o, "PURPOSE ✗", at("defeated"), {size: 72, y: 920, x: 1340, color: TERM.red, glow: true});
  flag(o, "Illustration of DeepMind’s documented example");
  cam(o, {x0: -40, x1: 30, d0: -0.3, d1: 0.3});
})();

// E1 · directive 18:45: power lines under a gloomy sky (HAER, three layers; E3), the hypothetical reward
var tSimple = at("simplest");
(function () {
  var o = Shot("S6E Power lines", vo(48.2), tSimple, {bg: false});
  photoShot(o, "powerlines", {tint: 55, caption: "Morony–Rainbow transmission line, Montana · HAER, Library of Congress"});
  tag(o, "HYPOTHETICAL", o.a + 0.1, {x: 320, y: 140, color: TERM.amber, size: 34, font: TF.mono});
  bar(o, 880, at("rewarded") - 0.2);
  word(o, "REWARD: NO OVERHEATING", at("rewarded"), {font: TF.mono, size: 52, y: 895, color: TERM.amber, mode: "type", cps: 24, track: 20});
  cam(o, {x0: 60, x1: -60, y0: 20, y1: -10, d0: -0.6, d1: 0.6, aperture: PHOTO_APERTURE});
})();
// E2 · the simplest way: switch off the customers (a city of lit windows goes dark)
(function () {
  var o = Shot("S6E Hypothetical", tSimple, vo(65.4), {red: true});
  tag(o, "HYPOTHETICAL", o.a, {x: 320, y: 140, color: TERM.amber, size: 34, font: TF.mono});
  var tOff = at("switch off");
  for (var k = 0; k < 3; k++) {
    var p = pathShape(o.c, [[200, 420 + k * 70], [1100, 420 + k * 70]], TERM.red, 7, "line " + k); showAt(o, p.l, o.a);
    keys(p.st.property("Color"), [[0, TERM.red], [o.t(tOff) + 0.3, TERM.red], [o.t(tOff) + 1.0, TERM.amberDim]], 0);
  }
  label(o, "LINE TEMPERATURE", o.a + 0.2, {x: 650, y: 360, size: 24});
  for (var i = 0; i < 48; i++) {
    var w = solid(o.c, TERM.amber, "window " + i, 26, 34); w.threeDLayer = true;
    T(w).property("Position").setValue([1250 + (i % 8) * 70, 340 + Math.floor(i / 8) * 80, 0]);
    var td = o.t(tOff) + rnd(i, 9) * 0.8;
    keys(T(w).property("Opacity"), [[0, 0], [0.2, 0], [0.5, 85], [td, 85], [td + 0.15, 8]], 0);
  }
  label(o, "CUSTOMERS", o.a + 0.3, {x: 1495, y: 860, size: 26, color: TERM.white});
  word(o, "POWER OFF", tOff, {size: 90, y: 960, color: TERM.red});
  word(o, "LINES: COOL ✓", at("can't overheat"), {size: 64, x: 650, y: 720, color: TERM.green, font: TF.mono});
  flag(o, "Hypothetical illustration");
  cam(o, {d0: -0.4, d1: 0.5});
})();

// F · the competition counted a blackout as failure: score zero
(function () {
  var o = Shot("S6F Score zero", vo(65.4), vo(76.0));
  label(o, "COMPETITION RULES · L2RPN", at("designers"), {y: 260, size: 32, color: TERM.white});
  flag(o, "Source: RTE, Learning to Run a Power Network");
  tag(o, "BLACKOUT = FAILURE", at("blackout"), {y: 420, color: TERM.red, size: 70});
  word(o, "SCORE: 0", at("zero") - 0.3, {font: TF.mono, size: 150, y: 700, color: TERM.red, glow: true});
  cam(o, {push: 1.05});
})();

// G · directive 20:00: side-by-side terminals, the human priority against the objective, HYPOTHETICAL
(function () {
  var o = Shot("S6G Two terminals", vo(76.0), vo(86.0));
  tag(o, "HYPOTHETICAL", o.a + 0.1, {y: 150, color: TERM.amber, size: 34, font: TF.mono});
  var tA = at("human dispatchers"), tB = at("extreme");
  box(o, 820, 420, 500, 560, 30, TERM.green); box(o, 820, 420, 1420, 560, 30, TERM.red);
  label(o, "HUMAN DISPATCHER", tA, {x: 500, y: 390, size: 24, color: TERM.green});
  label(o, "AGENT", tA, {x: 1420, y: 390, size: 24, color: TERM.red});
  var L = ["Human Priority:", "Maintain Continuous Power", "to Hospital / Metro Sectors"];
  for (var i = 0; i < L.length; i++) word(o, L[i], tA + 0.3 + i * 0.5, {font: TF.mono, size: 34, x: 140, y: 500 + i * 60, just: LEFTJ, track: 0, mode: "type", cps: 30, color: i ? TERM.white : TERM.green});
  var R = ["Objective Penalty = 0", "(Achieved via Line", "De-energization)"];
  for (var j = 0; j < R.length; j++) word(o, R[j], tB + j * 0.5, {font: TF.mono, size: 34, x: 1060, y: 500 + j * 60, just: LEFTJ, track: 0, mode: "type", cps: 30, color: j ? TERM.white : TERM.red});
  word(o, "LAST RESORT", at("last resort"), {size: 80, y: 900, color: TERM.amber, glow: true});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// H · an algorithm does not know what a city is; it only knows if the loss is zero (end of Act III)
(function () {
  var o = Shot("S6H Loss zero", vo(86.0), END, {red: true});
  var tL = at("it only knows");
  word(o, "CITY?", at("city", 86), {size: 120, x: 640, y: 440, until: tL - 0.1});
  word(o, "WINTER STORM?", at("heat"), {size: 100, x: 1280, y: 440, color: TERM.white, until: tL - 0.1});
  word(o, "loss == 0 ?", at("loss function") - 0.2, {font: TF.mono, size: 170, y: 560, color: TERM.red, glow: true, track: 0});
  cam(o, {push: 1.06, d0: -0.2, d1: 0.3});
})();

assemble("Scene6", END, [[0, 100], [0.8, 0], [vo(48.2), 0], [vo(48.6), 15], [vo(65.4), 15], [vo(65.7), 0], [vo(86.0), 0], [vo(86.4), 15], [END - 1.0, 15], [END, 100]]);
logEvents(6);
