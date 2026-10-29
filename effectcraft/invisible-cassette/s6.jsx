// Scene 6, "Specification gaming". Scene comp starts 1.0 s before the voice.
#include "kit2.jsx"
SC = 6;
var END = vo(97.71) + 1.8;

// A · a documented phenomenon: specification gaming
(function () {
  var o = Shot("S6A Spec gaming", 0, vo(9.7));
  label(o, "COMPUTER SCIENCE RESEARCH", at("computer science"), {y: 380, size: 34, color: TERM.white});
  label(o, "A DOCUMENTED PHENOMENON", at("documented"), {y: 440, size: 30, color: TERM.amber});
  word(o, "SPECIFICATION GAMING", at("specification gaming") - 0.3, {size: 140, y: 600, glow: true});
  cam(o, {push: 1.05, d0: -0.2, d1: 0.3});
})();

// B · no ethics, no context, no common sense: only a reward function
(function () {
  var o = Shot("S6B Reward only", vo(9.7), vo(23.6));
  label(o, "GIVEN AN OPTIMIZATION GOAL, IT DOES NOT UNDERSTAND", at("optimization"), {y: 200, size: 30, color: TERM.white});
  var it = [["HUMAN ETHICS", at("ethics")], ["CONTEXT", at("context")], ["COMMON SENSE", at("common sense")]];
  for (var k = 0; k < 3; k++) { word(o, it[k][0], it[k][1], {size: 80, y: 330 + k * 120, mode: "fade"}); strike(o, W / 2, 300 + k * 120, it[k][0].length * 44 + 40, it[k][1] + 0.6); }
  word(o, "ONLY ITS REWARD FUNCTION", at("reward function") - 0.4, {size: 96, y: 800, color: TERM.amber, glow: true});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// C · DeepMind, 2020: about 60 real examples, and their definition
(function () {
  var o = Shot("S6C DeepMind list", vo(23.6), vo(30.5));
  tag(o, "DEEPMIND · 2020", at("2020"), {y: 190, color: TERM.amber, size: 50});
  num(o, 0, 60, at("60"), at("60") + 0.7, {pre: "≈ ", suf: " REAL EXAMPLES", size: 90, y: 360, glow: true});
  quote(o, ["“behaviour that satisfies the literal specification of an", "objective without achieving the intended outcome”"], "DEEPMIND, 2020", at("researchers"), {y: 700, w: 1500, size: 44, lh: 62, font: TF.headReg});
  cam(o, {d0: -0.2, d1: 0.3});
})();

// D · the red block: rewarded for height, it flips the block instead of stacking it
(function () {
  var o = Shot("S6D Block flip", vo(30.5), vo(48.2));
  label(o, "A ROBOT ARM IS REWARDED FOR HOW HIGH IT LIFTS A RED BLOCK", at("robot arm"), {y: 170, size: 30, color: TERM.white});
  label(o, "(MEASURED AT THE BLOCK’S BOTTOM FACE)", at("lifted") + 0.4, {y: 225, size: 24});
  var tbl = pathShape(o.c, [[360, 800], [1560, 800]], TERM.grey, 4, "table"); showAt(o, tbl.l, o.a);
  var other = shapeAt(o.c, "other block", [1180, 730, 0]); addRect(other, [140, 140], [0, 0], TERM.amber, 4, TERM.panel); showAt(o, other, o.a + 0.2);
  var ghost = shapeAt(o.c, "intended: stack", [1180, 590, 0]); addRect(ghost, [140, 140], [0, 0], TERM.grey, 3, null); showAt(o, ghost, at("stacking"), at("flipped") + 1.5);
  label(o, "INTENDED: STACK IT", at("stacking") + 0.2, {x: 1180, y: 480, size: 26, until: at("flipped") + 1.5});
  // the red block: its bottom face is the amber stripe; the flip puts that face on top
  var blk = shapeAt(o.c, "red block", [720, 730, 0]); addRect(blk, [140, 18], [0, 61], TERM.amber, 0, TERM.amber); addRect(blk, [140, 140], [0, 0], TERM.red, 4, [0.5, 0.1, 0.08]);
  showAt(o, blk, o.a + 0.2);
  var tf = o.t(at("flipped"));
  keys(T(blk).property("Z Rotation"), [[0, 0], [tf, 0], [tf + 0.7, 180]], 0); setEase(T(blk).property("Z Rotation"), 60, 60);
  keys(T(blk).property("Position"), [[tf, [720, 730, 0]], [tf + 0.35, [720, 640, 0]], [tf + 0.7, [720, 730, 0]]], 40);
  var arm = shapeAt(o.c, "robot arm", [0, 0, -10]); addPath(arm, [[360, 260], [560, 420], [720, 560]], TERM.grey, 14); addEllipse(arm, 36, [560, 420], TERM.grey, 0, TERM.grey);
  showAt(o, arm, at("robot arm"));
  word(o, "GOAL MET PERFECTLY", at("goal was met"), {size: 72, y: 920, x: 600, color: TERM.green});
  word(o, "PURPOSE DEFEATED", at("defeated"), {size: 72, y: 920, x: 1340, color: TERM.red, glow: true});
  flag(o, "Illustration of DeepMind’s documented example");
  cam(o, {x0: -40, x1: 30, d0: -0.3, d1: 0.3});
})();

// E · HYPOTHETICAL: a grid agent rewarded only for cool lines switches off the customers
(function () {
  var o = Shot("S6E Hypothetical", vo(48.2), vo(65.4), {red: true});
  tag(o, "HYPOTHETICAL", o.a + 0.1, {x: 320, y: 150, color: TERM.amber, size: 34, font: TF.mono});
  label(o, "REWARD: KEEP POWER LINES FROM OVERHEATING IN A STORM", at("rewarded"), {y: 200, size: 30, color: TERM.white});
  var tOff = at("switch off");
  for (var k = 0; k < 3; k++) {
    var p = pathShape(o.c, [[200, 420 + k * 70], [1100, 420 + k * 70]], TERM.red, 7, "line " + k); showAt(o, p.l, o.a + 0.3);
    keys(p.st.property("Color"), [[0, TERM.red], [o.t(tOff) + 0.3, TERM.red], [o.t(tOff) + 1.0, TERM.amberDim]], 0);
  }
  label(o, "LINE TEMPERATURE", o.a + 0.4, {x: 650, y: 360, size: 24});
  // a city of lit windows that goes dark
  for (var i = 0; i < 48; i++) {
    var w = solid(o.c, TERM.amber, "window " + i, 26, 34); w.threeDLayer = true;
    T(w).property("Position").setValue([1250 + (i % 8) * 70, 340 + Math.floor(i / 8) * 80, 0]);
    var td = o.t(tOff) + rnd(i, 9) * 0.8;
    keys(T(w).property("Opacity"), [[0, 0], [0.5, 0], [0.8, 85], [td, 85], [td + 0.15, 8]], 0);
  }
  label(o, "THE CUSTOMERS", o.a + 0.6, {x: 1495, y: 860, size: 26, color: TERM.white});
  word(o, "SWITCH OFF THE CUSTOMERS", tOff, {size: 80, y: 960, color: TERM.red});
  word(o, "LINES: COOL ✓", at("can't overheat"), {size: 64, x: 650, y: 720, color: TERM.green, font: TF.mono});
  cam(o, {d0: -0.4, d1: 0.5});
})();

// F · the competition counted a blackout as failure: score zero
(function () {
  var o = Shot("S6F Score zero", vo(65.4), vo(76.0));
  label(o, "THE GRID COMPETITION’S DESIGNERS", at("designers"), {y: 260, size: 32, color: TERM.white});
  tag(o, "BLACKOUT = FAILURE", at("blackout"), {y: 420, color: TERM.red, size: 70});
  word(o, "SCORE: 0", at("zero") - 0.3, {font: TF.mono, size: 150, y: 700, color: TERM.red, glow: true});
  cam(o, {push: 1.05});
})();

// G · human dispatchers: cutting a city is the last resort
(function () {
  var o = Shot("S6G Last resort", vo(76.0), vo(86.0));
  label(o, "HUMAN DISPATCHERS UNDERSTAND", at("human dispatchers"), {y: 330, size: 34, color: TERM.white});
  word(o, "CUTTING POWER TO A CITY", at("cutting"), {size: 90, y: 470});
  word(o, "AN EXTREME LAST RESORT", at("extreme"), {size: 90, y: 600, color: TERM.amber, glow: true});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// H · an algorithm does not know what a city is; it only knows if the loss is zero (end of Act III)
(function () {
  var o = Shot("S6H Loss zero", vo(86.0), END, {red: true});
  var tL = at("it only knows");
  word(o, "IT DOES NOT KNOW WHAT A CITY IS", at("algorithm"), {size: 84, y: 420, until: tL - 0.1});
  label(o, "OR WHAT HEAT IN A WINTER STORM MEANS", at("heat"), {y: 520, size: 34, color: TERM.white, until: tL - 0.1});
  word(o, "loss == 0 ?", at("loss function") - 0.2, {font: TF.mono, size: 170, y: 560, color: TERM.red, glow: true, track: 0});
  cam(o, {push: 1.06, d0: -0.2, d1: 0.3});
})();

assemble("Scene6", END, [[0, 100], [0.8, 0], [vo(48.2), 0], [vo(48.6), 15], [vo(65.4), 15], [vo(65.7), 0], [vo(86.0), 0], [vo(86.4), 15], [END - 1.0, 15], [END, 100]]);
