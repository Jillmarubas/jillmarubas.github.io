// Scene 4, "Handing over the switch". Scene comp starts 1.0 s before the voice.
// Built to the production file's Scene 4 directives (DIRECTIVES.md): a camera push through three real,
// public title pages (verified), the HAER control room from analog dials to monitors, the folder
// "AUTONOMOUS TOPOLOGY SWITCHING" dropping, and a source card for RTE's competition. Keywords only.
#include "kit2.jsx"
SC = 4;
var END = vo(112.18) + 1.8;
var ty = function (s, f, z, c, x, y, tr) { return [s, f, z, c || TERM.ink, x, y, tr || 0]; };
// title pages recreated as type from the published papers (metadata checked: EPSR 189, 2020;
// arXiv:2504.08210, 2025; arXiv:2502.00040, 2025). Nothing is labelled "declassified".
var PAGES = [
  [ty("ELECTRIC POWER SYSTEMS RESEARCH 189 (2020) 106635", TF.monoReg, 22, TERM.grey, 80, 120, 40),
   ty("Learning to run a power network", TF.serif, 64, null, 80, 330), ty("challenge for training", TF.serif, 64, null, 80, 410), ty("topology controllers", TF.serif, 64, null, 80, 490),
   ty("Marot · Donnot · Romero · Donon · Lerousseau", TF.headReg, 30, null, 80, 620), ty("Veyrin-Forrer · Guyon", TF.headReg, 30, null, 80, 665)],
  [ty("arXiv:2504.08210 · 2025", TF.monoReg, 22, TERM.grey, 80, 120, 40),
   ty("Optimizing Power Grid Topologies", TF.serif, 60, null, 80, 330), ty("with Reinforcement Learning:", TF.serif, 60, null, 80, 405), ty("A Survey of Methods and Challenges", TF.serif, 60, null, 80, 480),
   ty("van der Sar · Zocca · Bhulai", TF.headReg, 30, null, 80, 610)],
  [ty("arXiv:2502.00040 · 2025", TF.monoReg, 22, TERM.grey, 80, 120, 40),
   ty("Multi-Objective Reinforcement", TF.serif, 62, null, 80, 330), ty("Learning for Power Grid", TF.serif, 62, null, 80, 408), ty("Topology Control", TF.serif, 62, null, 80, 486),
   ty("Lautenbacher · Rajaei · Barbieri · Viebahn · Cremer", TF.headReg, 30, null, 80, 616)]];

// A1 · directive 09:45: the camera glides through three real title pages (T5 glide)
var tAuto = at("automate");
(function () {
  var o = Shot("S4A Title pages", 0, tAuto);
  // each page glides in from depth, eases to a near-stop in the focus plane (readable), then slips past the lens
  var TP = [1.0, 2.3, 3.6], X = [-220, 260, -100], R = [-6, 5, -3];
  for (var i = 0; i < PAGES.length; i++) {
    var dc = docComp("Title page " + (i + 1), 1300, 900, PAGES[i]);
    var l = c3(o.c, dc, [W / 2 + X[i], H / 2, 3000]); T(l).property("Scale").setValue([100, 100, 100]);
    T(l).property("Y Rotation").setValue(R[i]); shadow(l);
    keys(T(l).property("Position"), [[Math.max(0, TP[i] - 1.1), [W / 2 + X[i], H / 2, 2600]], [TP[i], [W / 2 + X[i], H / 2, 0]], [TP[i] + 0.75, [W / 2 + X[i] * 0.6, H / 2, -2300]]], 0);
    setEase(T(l).property("Position"), 70, 70);
    EVENTS.push(["slide", TP[i] - 0.3]);
  }
  flag(o, "Title pages: EPSR 2020 · arXiv 2025 · arXiv 2025");
  cam(o, {d0: -0.5, d1: 0.6});
})();
// A2 · the hard choice
(function () {
  var o = Shot("S4A Hard choice", tAuto, vo(9.6));
  tag(o, "AUTOMATE MORE", tAuto, {x: 560, y: 540, color: TERM.amber, size: 64});
  label(o, "OR", at("or accept"), {y: 530, size: 44, color: TERM.white});
  tag(o, "BLACKOUT RISK", at("risk"), {x: 1360, y: 540, color: TERM.red, size: 64});
  cam(o, {d0: 0.3, d1: -0.5});
})();

// B · directive 10:45: the HAER control room, the camera tracking from the analog panels to the
// monitors (three layers); the old rule typed in as an illustration
(function () {
  var o = Shot("S4B Dials to monitors", vo(9.6), vo(20.1), {bg: false});
  photoShot(o, "control", {caption: "Power plant control room, Los Angeles Aqueduct · HAER, Library of Congress"});
  bar(o, 880, at("rigid") - 0.2);
  word(o, "DETERMINISTIC", at("rigid"), {size: 66, y: 895, until: at("if voltage") - 0.1});
  word(o, "IF voltage < LIMIT → OPEN breaker", at("if voltage"), {font: TF.mono, size: 46, y: 895, track: 0, mode: "type", cps: 22, color: TERM.amber});
  flag(o, "Rule: illustration", {at: at("if voltage")});
  cam(o, {x0: -110, x1: 110, y0: -10, y1: 10, d0: -0.6, d1: 0.6, aperture: PHOTO_APERTURE});
})();

// C · the "But" turn: hard cut on the word; millions of devices, too dynamic for static rules
(function () {
  var o = Shot("S4C Too dynamic", vo(20.1), vo(38.0), {red: true});
  var t0 = at("millions"), t1 = at("too dynamic");
  for (var i = 0; i < 140; i++) {
    var x = 120 + rnd(i, 1) * 1680, y = 300 + rnd(i, 2) * 640, col = i % 5 === 0 ? TERM.green : (i % 3 ? TERM.amber : TERM.white);
    var d = dot(o.c, x, y, 6 + (i % 3) * 2, col, "device " + i, (i % 4) * 60 - 90);
    showAt(o, d, o.a + 0.1 + (t1 - o.a - 0.1) * rnd(i, 3));
  }
  // review note (8:33): an image per word, the device dots stay (rooftop solar and EV chargers AI-generated with
  // Higgsfield; wind turbines NREL, public domain); the cards clear before "too dynamic"
  photoCard(o, "hf/rooftop_solar.jpg", 420, 470, at("rooftop") - 0.2, "ROOFTOP SOLAR", {z: -60, until: t1 - 0.1});
  photoCard(o, "hf/ev_chargers.jpg", 960, 470, at("electric vehicle") - 0.2, "EV CHARGERS", {z: -60, until: t1 - 0.1});
  photoCard(o, "stock/wind_nrel.jpg", 1500, 470, at("wind turbines") - 0.2, "WIND TURBINES", {z: -60, until: t1 - 0.1});
  flag(o, "Rooftop solar, EV chargers: AI-generated (Higgsfield) · Wind: NREL, public domain", {until: t1 - 0.1});
  word(o, "MILLIONS", t0, {font: TF.mono, size: 120, y: H / 2 + 40, color: TERM.white, z: -80, until: at("rooftop") - 0.3});
  word(o, "TOO DYNAMIC", t1, {size: 130, y: H / 2 + 40, color: TERM.red, z: -80, glow: true});
  flag(o, "Illustration", {at: t1});
  cam(o, {push: 1.08, d0: -0.4, d1: 0.5});
})();

// D · deep reinforcement learning; RTE's public competition
(function () {
  var o = Shot("S4D Deep RL", vo(38.0), vo(59.0));
  var tF = at("france's");
  word(o, "DEEP REINFORCEMENT LEARNING", at("deep reinforcement"), {size: 100, y: H / 2 - 20, until: tF - 0.1, glow: true});
  label(o, "UNDER TEST", at("testing"), {y: H / 2 + 80, size: 32, color: TERM.white, until: tF - 0.1});
  tag(o, "RTE · FRANCE", tF, {y: 280, color: TERM.amber, size: 52});
  word(o, "LEARNING TO RUN A POWER NETWORK", at("learning to run"), {font: TF.mono, size: 56, y: 470, mode: "type", cps: 30, track: 40});
  label(o, "PUBLIC COMPETITION · AI AGENTS", at("public competition"), {y: 560, size: 32, color: TERM.white});
  word(o, "SIMULATED GRID", at("simulated"), {size: 80, y: 720, color: TERM.amber});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// E1 · not step-by-step instructions
var tLearn = at("they learn by");
(function () {
  var o = Shot("S4E Not instructions", vo(59.0), tLearn);
  word(o, "STEP-BY-STEP", at("step"), {size: 110, y: H / 2 - 20, mode: "fade"});
  strike(o, W / 2, H / 2 - 50, 820, at("programmer"));
  label(o, "PROGRAMMER", at("written"), {y: H / 2 + 70, size: 32});
  cam(o, {push: 1.04, d0: -0.5, d1: 0.5});
})();
// E2 · trial and error, in simulation only; directive 12:30: the source card slides in (F3), no quote marks
(function () {
  var o = Shot("S4E Trial and error", tLearn, vo(81.7));
  tag(o, "AGENT", tLearn + 0.1, {x: 560, y: 260, color: TERM.amber, size: 50});
  tag(o, "SIMULATED GRID", tLearn + 0.3, {x: 1360, y: 260, color: TERM.green, size: 50});
  var a1 = pathShape(o.c, [[700, 230], [1150, 230]], TERM.amber, 4, "action"); drawOn(o, a1, tLearn + 0.6, 0.5);
  var a2 = pathShape(o.c, [[1150, 300], [700, 300]], TERM.green, 4, "reward"); drawOn(o, a2, tLearn + 1.0, 0.5);
  label(o, "ACTION", tLearn + 0.7, {x: 925, y: 210, size: 24, color: TERM.amber}); label(o, "RESULT", tLearn + 1.1, {x: 925, y: 340, size: 24, color: TERM.green});
  word(o, "TRIAL · ERROR · TRIAL · ERROR", at("trial"), {font: TF.mono, size: 44, y: 430, mode: "type", cps: 22, color: TERM.white, track: 40});
  var card = [ty("SOURCE", TF.monoReg, 26, TERM.grey, 70, 90, 120),
    ty("RTE · Learning to Run a Power Network (L2RPN)", TF.head, 44, null, 70, 170),
    ty("Agents train on simulated grids, not on the live network.", TF.headReg, 34, null, 70, 240)];
  doc(o, card, at("dangerous") - 0.3, {w: 1300, h: 320, scale: 92, ry: -3, y: 700});
  label(o, "THOUSANDS OF SENSORS", at("thousands"), {y: 960, size: 28, color: TERM.amber});
  cam(o, {x0: -40, x1: 40, d0: -0.3, d1: 0.3});
})();

// F1 · directive 11:45: the folder AUTONOMOUS TOPOLOGY SWITCHING drops onto the desk (F2)
var tR = at("reroute");
(function () {
  var o = Shot("S4F Folder", vo(81.7), tR);
  label(o, "IN SIMULATION", o.a + 0.1, {y: 150, size: 30, color: TERM.white});
  var f = c3(o.c, folderComp("Topology folder", "AUTONOMOUS TOPOLOGY SWITCHING", 1300, 760), [W / 2, H / 2 + 40, 0]); shadow(f);
  dropIn(o, f, at("switch") - 0.32, [W / 2, H / 2 + 40, 0], -2);
  cam(o, {push: 1.03, d0: 0.5, d1: -0.6});
})();
// F2 · reroute power, adjust batteries (illustration)
(function () {
  var o = Shot("S4F Reroute", tR, vo(92.2));
  var N = [[360, 460], [760, 380], [1160, 460], [1560, 380], [560, 740], [960, 700], [1360, 760]];
  var E = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 3], [1, 5], [5, 2]];
  for (var k = 0; k < E.length; k++) {
    var p = pathShape(o.c, [N[E[k][0]], N[E[k][1]]], TERM.amber, 5, "line " + k); showAt(o, p.l, o.a);
    if (k === 1) { keys(p.st.property("Color"), [[0, TERM.red], [o.t(tR) + 0.2, TERM.red], [o.t(tR) + 0.3, TERM.amberDim]], 0); }
    if (k === 7 || k === 8) { keys(p.st.property("Color"), [[0, TERM.amber], [o.t(tR) + 0.3, TERM.amber], [o.t(tR) + 0.6, TERM.green]], 0); }
  }
  for (var n = 0; n < N.length; n++) showAt(o, dot(o.c, N[n][0], N[n][1], 14, TERM.amber, "bus"), o.a);
  label(o, "OVERLOAD", o.a, {x: 960, y: 370, size: 24, color: TERM.red, until: tR + 0.3});
  label(o, "REROUTED", tR + 0.5, {x: 960, y: 640, size: 24, color: TERM.green});
  showAt(o, batteryIcon(o, 1560, 640, 90, TERM.green), at("adjust batteries"));
  word(o, "FASTER THAN A CONTROL ROOM", at("faster"), {size: 76, y: 930, color: TERM.amber, glow: true});
  flag(o, "Illustration");
  cam(o, {d0: 0.4, d1: -0.4});
})();

// G · impressive in testing: the overload is headed off before a human sees the alarm
(function () {
  var o = Shot("S4G Impressive", vo(92.2), vo(101.9));
  label(o, "IN TESTING", at("testing", 92), {y: 300, size: 34, color: TERM.white});
  word(o, "IMPRESSIVE", at("impressive"), {size: 110, y: 400});
  word(o, "OVERLOAD AVOIDED", at("head off"), {size: 80, y: 560, color: TERM.green, glow: true});
  label(o, "BEFORE THE ALARM", at("before a"), {y: 650, size: 34, color: TERM.white});
  cam(o, {d0: -0.2, d1: 0.3});
})();

// H · the "But" turn: the explainability problem (end of Act II)
(function () {
  var o = Shot("S4H Explainability", vo(101.9), END, {red: true});
  label(o, "SUPERHUMAN SPEED", at("superhuman"), {y: H / 2 - 120, size: 36, color: TERM.white});
  word(o, "EXPLAINABILITY PROBLEM", at("explainability"), {size: 120, y: H / 2 + 10, color: TERM.red, glow: true});
  cam(o, {push: 1.06, d0: 0.3, d1: -0.4});
})();

assemble("Scene4", END, [[0, 100], [0.8, 0], [vo(20.1), 0], [vo(20.1) + F, 12], [vo(38.0), 12], [vo(38.3), 0], [vo(101.9), 0], [vo(101.9) + F, 18], [END - 1.0, 18], [END, 100]],
  [[vo(20.1), "cold"], [vo(38.0), "warm"], [vo(101.9), "cold"]]);
logEvents(4);
