// Scene 4, "Handing over the switch". Scene comp starts 1.0 s before the voice.
#include "kit2.jsx"
SC = 4;
var END = vo(112.18) + 1.8;

// A · a hard choice
(function () {
  var o = Shot("S4A Hard choice", 0, vo(9.6));
  label(o, "GRID OPERATORS FACE A HARD CHOICE", 0.4, {y: 300, size: 36, color: TERM.white});
  tag(o, "AUTOMATE MORE", at("automate"), {x: 560, y: 540, color: TERM.amber, size: 64});
  label(o, "OR", at("or accept"), {y: 530, size: 44, color: TERM.white});
  tag(o, "MORE RISK OF BLACKOUTS", at("risk"), {x: 1340, y: 540, color: TERM.red, size: 56});
  cam(o, {d0: -0.3, d1: 0.3});
})();

// B · rigid, deterministic rules (our own illustration of the logic)
(function () {
  var o = Shot("S4B If-then", vo(9.6), vo(20.1));
  word(o, "RIGID, DETERMINISTIC LOGIC", at("rigid"), {size: 80, y: 250, mode: "rise"});
  var b = box(o, 1100, 300, W / 2, 600, 30); showAt(o, b, at("if voltage") - 0.3);
  word(o, "IF voltage < LIMIT:", at("if voltage"), {font: TF.mono, size: 60, x: W / 2 - 480, y: 570, just: LEFTJ, track: 0, mode: "type", cps: 26, color: TERM.amber});
  word(o, "    OPEN breaker", at("open a"), {font: TF.mono, size: 60, x: W / 2 - 480, y: 660, just: LEFTJ, track: 0, mode: "type", cps: 26});
  flag(o, "Illustration");
  cam(o, {d0: 0.3, d1: -0.3});
})();

// C · millions of devices: too dynamic for static rules
(function () {
  var o = Shot("S4C Too dynamic", vo(20.1), vo(38.0), {red: true});
  var t0 = at("millions"), t1 = at("too dynamic");
  for (var i = 0; i < 140; i++) {
    var x = 120 + rnd(i, 1) * 1680, y = 300 + rnd(i, 2) * 640, col = i % 5 === 0 ? TERM.green : (i % 3 ? TERM.amber : TERM.white);
    var d = dot(o.c, x, y, 6 + (i % 3) * 2, col, "device " + i, (i % 4) * 60 - 90);
    showAt(o, d, t0 + (t1 - t0) * rnd(i, 3));
  }
  label(o, "ROOFTOP SOLAR", at("rooftop"), {x: 420, y: 230, size: 30, color: TERM.amber});
  label(o, "EV CHARGERS", at("electric vehicle"), {x: 960, y: 230, size: 30, color: TERM.green});
  label(o, "WIND TURBINES", at("wind turbines"), {x: 1500, y: 230, size: 30, color: TERM.white});
  word(o, "TOO DYNAMIC FOR IF-THEN RULES", t1, {size: 96, y: H / 2 + 40, color: TERM.red, z: -80, glow: true});
  cam(o, {push: 1.08, d0: -0.4, d1: 0.5});
})();

// D · deep reinforcement learning; RTE's public competition
(function () {
  var o = Shot("S4D Deep RL", vo(38.0), vo(59.0));
  var tF = at("france's");
  word(o, "DEEP REINFORCEMENT LEARNING", at("deep reinforcement"), {size: 100, y: H / 2 - 20, until: tF - 0.1, glow: true});
  label(o, "A NEW KIND OF CONTROL, UNDER TEST", at("testing"), {y: H / 2 + 80, size: 32, color: TERM.white, until: tF - 0.1});
  tag(o, "RTE · FRANCE", tF, {y: 280, color: TERM.amber, size: 52});
  word(o, "LEARNING TO RUN A POWER NETWORK", at("learning to run"), {font: TF.mono, size: 56, y: 470, mode: "type", cps: 30, track: 40});
  label(o, "A PUBLIC COMPETITION FOR AI AGENTS", at("public competition"), {y: 560, size: 32, color: TERM.white});
  word(o, "KEEP A SIMULATED GRID RUNNING", at("simulated"), {size: 72, y: 720, color: TERM.amber});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// E1 · not step-by-step instructions
var tLearn = at("they learn by");
(function () {
  var o = Shot("S4E Not instructions", vo(59.0), tLearn);
  word(o, "STEP-BY-STEP INSTRUCTIONS", at("step"), {size: 90, y: H / 2 - 20, mode: "fade"});
  strike(o, W / 2, H / 2 - 50, 1200, at("programmer"));
  label(o, "WRITTEN BY A PROGRAMMER", at("written"), {y: H / 2 + 70, size: 32});
  cam(o, {push: 1.04});
})();
// E2 · trial and error, in simulation only (source card)
(function () {
  var o = Shot("S4E Trial and error", tLearn, vo(81.7));
  tag(o, "AGENT", tLearn + 0.1, {x: 560, y: 300, color: TERM.amber, size: 50});
  tag(o, "SIMULATED GRID", tLearn + 0.3, {x: 1360, y: 300, color: TERM.green, size: 50});
  var a1 = pathShape(o.c, [[700, 270], [1150, 270]], TERM.amber, 4, "action"); drawOn(o, a1, tLearn + 0.6, 0.5);
  var a2 = pathShape(o.c, [[1150, 340], [700, 340]], TERM.green, 4, "reward"); drawOn(o, a2, tLearn + 1.0, 0.5);
  label(o, "ACTION", tLearn + 0.7, {x: 925, y: 250, size: 24, color: TERM.amber}); label(o, "RESULT", tLearn + 1.1, {x: 925, y: 380, size: 24, color: TERM.green});
  word(o, "TRIAL · ERROR · TRIAL · ERROR", at("trial"), {font: TF.mono, size: 44, y: 470, mode: "type", cps: 22, color: TERM.white, track: 40});
  quote(o, ["RL agents learn by trial and error, so they train", "on simulated grids, never the real one."], "SOURCE: RTE, LEARNING TO RUN A POWER NETWORK", at("dangerous") - 0.4, {y: 740, w: 1300, size: 42, lh: 60});
  label(o, "PATTERNS ACROSS THOUSANDS OF SENSOR READINGS", at("thousands"), {y: 960, size: 28, color: TERM.amber});
  cam(o, {x0: -40, x1: 40, d0: -0.3, d1: 0.3});
})();

// F · in simulation: switch the layout, reroute power, adjust batteries
(function () {
  var o = Shot("S4F Reroute", vo(81.7), vo(92.2));
  label(o, "IN SIMULATION", o.a + 0.1, {y: 170, size: 30, color: TERM.white});
  var N = [[360, 460], [760, 380], [1160, 460], [1560, 380], [560, 740], [960, 700], [1360, 760]];
  var E = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 3], [1, 5], [5, 2]];
  var tS = at("switch"), tR = at("reroute");
  for (var k = 0; k < E.length; k++) {
    var p = pathShape(o.c, [N[E[k][0]], N[E[k][1]]], TERM.amber, 5, "line " + k); showAt(o, p.l, o.a);
    if (k === 1) { keys(p.st.property("Color"), [[0, TERM.red], [o.t(tS), TERM.red], [o.t(tS) + 0.1, TERM.amberDim]], 0); }
    if (k === 7 || k === 8) { keys(p.st.property("Color"), [[0, TERM.amber], [o.t(tR), TERM.amber], [o.t(tR) + 0.3, TERM.green]], 0); }
  }
  for (var n = 0; n < N.length; n++) showAt(o, dot(o.c, N[n][0], N[n][1], 14, TERM.amber, "bus"), o.a);
  label(o, "OVERLOADED LINE", o.a + 0.3, {x: 960, y: 370, size: 24, color: TERM.red, until: tS});
  showAt(o, batteryIcon(o, 1560, 640, 90, TERM.green), at("adjust batteries"));
  word(o, "FASTER THAN ANY CONTROL ROOM", at("faster"), {size: 80, y: 930, color: TERM.amber, glow: true});
  flag(o, "Illustration");
  cam(o, {d0: 0.4, d1: -0.4});
})();

// G · impressive in testing: the overload is headed off before a human sees the alarm
(function () {
  var o = Shot("S4G Impressive", vo(92.2), vo(101.9));
  word(o, "IN TESTING: IMPRESSIVE", at("impressive"), {size: 90, y: 360});
  word(o, "OVERLOAD HEADED OFF", at("head off"), {size: 80, y: 520, color: TERM.green, glow: true});
  label(o, "BEFORE A HUMAN WOULD EVEN SEE THE ALARM", at("before a"), {y: 620, size: 34, color: TERM.white});
  cam(o, {d0: -0.2, d1: 0.3});
})();

// H · the turn: the explainability problem (end of Act II)
(function () {
  var o = Shot("S4H Explainability", vo(101.9), END, {red: true});
  label(o, "BENEATH THE SUPERHUMAN SPEED", at("superhuman"), {y: H / 2 - 120, size: 36, color: TERM.white});
  word(o, "THE EXPLAINABILITY PROBLEM", at("explainability"), {size: 120, y: H / 2 + 10, color: TERM.red, glow: true});
  cam(o, {push: 1.06, d0: 0.3, d1: -0.4});
})();

assemble("Scene4", END, [[0, 100], [0.8, 0], [vo(20.1), 0], [vo(20.3), 12], [vo(38.0), 12], [vo(38.3), 0], [vo(101.9), 0], [vo(102.3), 18], [END - 1.0, 18], [END, 100]]);
