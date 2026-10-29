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

// A · directive 24:00: a macro track across the main control switchboard (HAER, three layers; K9)
(function () {
  var o = Shot("S8A Switchboard", 0, vo(13.1), {bg: false});
  photoShot(o, "switchboard", {caption: "Main control switchboard, Montana · HAER, Library of Congress"});
  bar(o, 880, at("keep a human") - 0.2);
  label(o, "SAFETY COMMISSIONS", at("safety"), {y: 150, size: 30, color: TERM.white, until: at("keep a human")});
  word(o, "HUMAN-IN-THE-LOOP", at("keep a human"), {size: 70, y: 895, until: at("emergency") - 0.1});
  word(o, "MANUAL OVERRIDE", at("emergency"), {size: 70, y: 895, color: TERM.amber, glow: true});
  cam(o, {x0: -130, x1: 130, push: 1.06, d0: -0.6, d1: 0.6, aperture: PHOTO_APERTURE});
})();

// B1 · comforting …
var tBut = at("but an");
(function () {
  var o = Shot("S8B Comforting", vo(13.1), tBut);
  word(o, "COMFORTING", at("comforting"), {size: 120, y: H / 2, color: TERM.white, mode: "rise"});
  cam(o, {push: 1.03, d0: -0.5, d1: 0.6});
})();
// B2 · … the "but" turn, cut on the word: a paradox
(function () {
  var o = Shot("S8B Paradox", tBut, vo(18.6), {red: true});
  word(o, "PARADOX", at("paradox") - 0.3, {size: 160, y: H / 2, color: TERM.red, glow: true});
  label(o, "ENGINEERING", tBut + 0.05, {y: H / 2 - 120, size: 32, color: TERM.white});
  cam(o, {push: 1.04, d0: 0.5, d1: -0.6});
})();

// C · directive 25:30: typography cards over black (T3 impacts): the illusion, one AC cycle, human reaction
var CARDS = [["THE ILLUSION OF MANUAL OVERRIDE", vo(18.6), TERM.white, "1 · LATENCY", ""],
  ["ONE AC CYCLE: 16.7 MILLISECONDS", at("transient"), TERM.amber, "", "1/60 s on a 60 Hz grid"],
  ["HUMAN REACTION: ~250 MILLISECONDS", at("human operator"), TERM.red, "", "Source: reaction-time study, PMC"]];
for (var c = 0; c < 3; c++) (function (k) {
  var o = Shot("S8C Card " + (k + 1), CARDS[k][1], k < 2 ? CARDS[k + 1][1] : vo(37.0), {bg: false});
  solid(o.c, [0, 0, 0], "black");
  if (CARDS[k][3]) label(o, CARDS[k][3], o.a + 0.4, {y: H / 2 - 110, size: 30, color: TERM.amber});
  word(o, CARDS[k][0], o.a, {size: Math.min(96, Math.round(2900 / CARDS[k][0].length)), color: CARDS[k][2], glow: k === 2});
  EVENTS.push(["impact", o.a]);
  if (CARDS[k][4]) flag(o, CARDS[k][4]);
  cam(o, {push: 1.04, d0: k % 2 ? 0.5 : -0.5, d1: k % 2 ? -0.6 : 0.6});
})(c);

// D · directive 24:45: the camera pulls back into the vast, empty switchyard (Highsmith, three layers; A7)
(function () {
  var o = Shot("S8D Switchyard", vo(37.0), vo(50.4), {bg: false});
  photoShot(o, "switchyard", {caption: "Hoover Dam switchyard · Carol M. Highsmith, Library of Congress"});
  tag(o, "2 · DEPENDENCY", at("second"), {y: 160, color: TERM.amber, size: 50});
  bar(o, 880, at("automate") - 0.2);
  word(o, "AUTOMATION ▲", at("automate"), {size: 70, y: 895, color: TERM.amber, until: at("human capability") - 0.1});
  word(o, "MANUAL SKILL ▼", at("human capability"), {size: 70, y: 895, color: TERM.red, glow: true});
  cam(o, {pull: true, y0: 30, y1: 0, d0: 0.6, d1: -0.6, aperture: PHOTO_APERTURE});
})();

// E · airlines know it: less hand-flying practice; regulators urge manual skills
(function () {
  var o = Shot("S8E Airlines", vo(50.4), vo(63.6));
  word(o, "AIRLINES", at("airlines"), {size: 110, y: 300});
  word(o, "AUTOPILOT → LESS HAND-FLYING", at("mostly"), {size: 60, y: 450, color: TERM.white, mode: "rise"});
  word(o, "REGULATORS: MANUAL SKILLS", at("regulators"), {size: 70, y: 620, color: TERM.amber, glow: true});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// F · in some systems, switching off would itself be the emergency
(function () {
  var o = Shot("S8F Off is the emergency", vo(63.6), vo(70.1), {red: true});
  overrideSwitch(o, 520, 560, o.a + 0.1, at("off", vo(64)));
  word(o, "OFF", at("off", vo(64)), {size: 130, x: 1220, y: 470});
  word(o, "= EMERGENCY", at("emergency", vo(64)), {size: 100, x: 1220, y: 610, color: TERM.red, glow: true});
  cam(o, {d0: -0.4, d1: 0.5});
})();

// G · three black cards (end of Act IV): keywords, not the narration
var cards = [["NO OFF SWITCH", at("cannot turn") - 0.2, TERM.white], ["CIVILIZATION", at("civilization") - 0.2, TERM.white], ["DEPENDS ON SPEED", at("without"), TERM.red]];
for (var i = 0; i < 3; i++) (function (k) {
  var a = k === 0 ? vo(70.1) : cards[k][1], b = k < 2 ? cards[k + 1][1] : END;
  var o = Shot("S8G Card " + (k + 1), a, b, {bg: false});
  solid(o.c, [0, 0, 0], "black");
  word(o, cards[k][0], cards[k][1], {size: Math.min(110, Math.round(2700 / cards[k][0].length)), color: cards[k][2], glow: k === 2});
  cam(o, {push: 1.03});
})(i);

assemble("Scene8", END, [[0, 100], [0.8, 0], [tBut, 0], [tBut + F, 15], [vo(18.6), 15], [vo(18.9), 0], [vo(63.6), 0], [vo(63.9), 15], [vo(70.1), 0], [END - 1.0, 0], [END, 100]],
  [[tBut, "cold"], [vo(18.6), "warm"]]);
logEvents(8);
