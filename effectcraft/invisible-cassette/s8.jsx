// Scene 8, "The reality of the kill switch". Scene comp starts 1.0 s before the voice.
// Under it the mix runs a Shepard tone with a ticking clock that cuts dead on the first black card.
#include "kit2.jsx"
SC = 8;
var END = vo(77.42) + 1.8;

// a big override switch: the lever's origin is its pivot; flips at `flipAt` (scene time) when given
function overrideSwitch(o, x, y, when, flipAt) {
  var base = shapeAt(o.c, "switch plate", [x, y, 10]); addRect(base, [260, 360], [0, 0], TERM.red, 6, TERM.panel); addRect(base, [60, 200], [0, 0], TERM.grey, 3, [0.02, 0.02, 0.03]);
  showAt(o, base, when);
  var lev = shapeAt(o.c, "lever", [x, y + 40, 0]); addPath(lev, [[0, 0], [0, -150]], TERM.red, 26); addEllipse(lev, 70, [0, -150], TERM.red, 0, TERM.red);
  showAt(o, lev, when);
  if (flipAt !== undefined) { var a = o.t(flipAt); keys(T(lev).property("X Rotation"), [[0, 0], [a, 0], [a + 0.25, 150]], 0); }
  label(o, "ON", when, {x: x, y: y - 210, size: 26, color: TERM.white}); label(o, "OFF", when, {x: x, y: y + 230, size: 26, color: TERM.white});
  return lev;
}

// A · keep a human in the loop; an emergency manual override
(function () {
  var o = Shot("S8A Human in the loop", 0, vo(13.1));
  label(o, "SAFETY COMMISSIONS RECOMMEND", at("safety"), {x: 700, y: 330, size: 32, color: TERM.white});
  word(o, "KEEP A HUMAN IN THE LOOP", at("keep a human"), {size: 84, x: 700, y: 460});
  word(o, "EMERGENCY MANUAL OVERRIDE", at("emergency"), {size: 72, x: 700, y: 590, color: TERM.amber});
  overrideSwitch(o, 1500, 560, at("provide"));
  cam(o, {d0: -0.3, d1: 0.3});
})();

// B · comforting, but an engineering paradox
(function () {
  var o = Shot("S8B Paradox", vo(13.1), vo(18.6));
  word(o, "A COMFORTING STATEMENT", at("comforting"), {size: 80, y: 430, color: TERM.white});
  word(o, "AN ENGINEERING PARADOX", at("paradox") - 0.5, {size: 110, y: 580, color: TERM.red, glow: true});
  cam(o, {push: 1.04});
})();

// C · first: latency (one AC cycle against a human reaction, to true scale)
(function () {
  var o = Shot("S8C Latency", vo(18.6), vo(37.0), {red: true});
  tag(o, "1 · LATENCY", at("latency") - 0.3, {y: 160, color: TERM.amber, size: 54});
  var tB = at("flawed");
  label(o, "A FLAWED MICROSECOND OPTIMIZATION DURING A HIGH-SPEED FAULT", tB, {y: 270, size: 28, color: TERM.white});
  bars(o, [["ONE AC CYCLE (60 Hz)", 16.7, TERM.red, "16.7 MILLISECONDS", at("transient")], ["HUMAN REACTION", 250, TERM.grey, "~250 MILLISECONDS", at("human operator")]], tB, {y: 470, gap: 220, w: 1100, x: W / 2 - 150});
  word(o, "THE DAMAGE IS DONE BEFORE THE ALARM IS NOTICED", at("damage"), {size: 50, y: 940, color: TERM.red});
  cam(o, {x0: -30, x1: 30, d0: 0.3, d1: -0.3});
})();

// D · second: dependency (manual skill decays as automation grows; illustrative)
(function () {
  var o = Shot("S8D Dependency", vo(37.0), vo(50.4));
  tag(o, "2 · DEPENDENCY", at("second") , {y: 160, color: TERM.amber, size: 54});
  label(o, "AUTOMATION", at("automate"), {x: 420, y: 420, size: 30, color: TERM.white, just: LEFTJ});
  label(o, "MANUAL CAPABILITY", at("human capability"), {x: 420, y: 620, size: 30, color: TERM.white, just: LEFTJ});
  var t0 = o.t(at("automate")), t1 = o.t(at("degrades")) + 0.8;
  var a = solid(o.c, TERM.amber, "automation bar", 1000, 50); a.threeDLayer = true; T(a).property("Anchor Point").setValue([0, 25, 0]); T(a).property("Position").setValue([420, 470, 0]);
  keys(T(a).property("Scale"), [[0, [15, 100, 100]], [t0, [15, 100, 100]], [t1, [100, 100, 100]]], 30); showAt(o, a, at("automate"));
  var m = solid(o.c, TERM.green, "manual bar", 1000, 50); m.threeDLayer = true; T(m).property("Anchor Point").setValue([0, 25, 0]); T(m).property("Position").setValue([420, 670, 0]);
  keys(T(m).property("Scale"), [[0, [95, 100, 100]], [o.t(at("human capability")), [95, 100, 100]], [t1, [18, 100, 100]]], 30); showAt(o, m, at("human capability"));
  word(o, "DEGRADES", at("degrades"), {size: 90, y: 860, color: TERM.red});
  flag(o, "Illustrative");
  cam(o, {d0: -0.2, d1: 0.3});
})();

// E · airlines know it: less hand-flying practice; regulators urge manual skills
(function () {
  var o = Shot("S8E Airlines", vo(50.4), vo(63.6));
  word(o, "AIRLINES KNOW THIS PROBLEM", at("airlines"), {size: 80, y: 300});
  word(o, "MOSTLY ON AUTOPILOT → LESS PRACTICE FLYING BY HAND", at("mostly"), {size: 48, y: 440, color: TERM.white, mode: "rise"});
  word(o, "REGULATORS: KEEP MANUAL SKILLS SHARP", at("regulators"), {size: 70, y: 620, color: TERM.amber, glow: true});
  label(o, "E.G. FAA SAFETY ALERT FOR OPERATORS 13002, “MANUAL FLIGHT OPERATIONS” (2013)", at("regulators") + 0.6, {y: 700, size: 22});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// F · in some systems, switching off would itself be the emergency
(function () {
  var o = Shot("S8F Off is the emergency", vo(63.6), vo(70.1), {red: true});
  overrideSwitch(o, 520, 560, o.a + 0.1, at("off", vo(64)));
  word(o, "SWITCHING IT OFF", at("switching"), {size: 90, x: 1220, y: 470});
  word(o, "IS THE EMERGENCY", at("emergency"), {size: 90, x: 1220, y: 600, color: TERM.red, glow: true});
  cam(o, {d0: -0.4, d1: 0.5});
})();

// G · three black cards (end of Act IV)
var cards = [["WE CANNOT TURN THEM OFF", at("cannot turn") - 0.2, TERM.white], ["OUR CIVILIZATION CANNOT SURVIVE", at("civilization") - 0.2, TERM.white], ["WITHOUT THEIR SPEED", at("without"), TERM.red]];
for (var i = 0; i < 3; i++) (function (k) {
  var a = k === 0 ? vo(70.1) : cards[k][1], b = k < 2 ? cards[k + 1][1] : END;
  var o = Shot("S8G Card " + (k + 1), a, b, {bg: false});
  solid(o.c, [0, 0, 0], "black");
  word(o, cards[k][0], cards[k][1], {size: Math.min(110, Math.round(2700 / cards[k][0].length)), color: cards[k][2], glow: k === 2});
  cam(o, {push: 1.03});
})(i);

assemble("Scene8", END, [[0, 100], [0.8, 0], [vo(18.6), 0], [vo(18.9), 12], [vo(37.0), 12], [vo(37.3), 0], [vo(63.6), 0], [vo(63.9), 15], [vo(70.1), 0], [END - 1.0, 0], [END, 100]]);
