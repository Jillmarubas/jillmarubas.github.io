// Scene 10, "The final sign-off": no narration. Built to the production file's Scene 10 directives
// (DIRECTIVES.md), on its own timings from the end of the voice:
//   +0 s   voice has ended; only the 45 Hz rumble and room tone (A1) under a top-down view of the desk
//   +5 s   the "AUTONOMOUS SYSTEMS // RISK ASSESSMENT" dossier slides into a folder (F5)
//   +25 s  the desk lamp clicks off (K8)
//   +30 s  black; the quote fades in, gold serif (Playfair, amber)
//   +45 s  silent end credits (sources and licences), then end-screen space to +75 s
#include "kit2.jsx"
var END = 75, T_DOSSIER = 5, T_LAMP = 25, T_QUOTE = 30, T_CREDITS = 45, T_ENDSCREEN = 60;
var FOLDER = [0.80, 0.74, 0.62], FOLDER_FRONT = [0.85, 0.79, 0.67];

// A · the desk from above: folder, dossier, lamp pool
(function () {
  var o = Shot("S10A Desk", 0, T_QUOTE, {bg: false});
  solid(o.c, [0.045, 0.04, 0.035], "desk");
  var gr = solid(o.c, [0.5, 0.5, 0.5], "desk grain"); fx(gr, "Fractal Noise", {"Contrast": 130, "Transform/Scale": 5, "Transform/Scale Width": 900}); gr.blendingMode = BlendingMode.MULTIPLY; T(gr).property("Opacity").setValue(40);
  // folder back panel
  var back = shapeAt(o.c, "folder back", [W / 2, H / 2 + 20, 0]); addRect(back, [1000, 700], [0, 0], null, 0, FOLDER); addRect(back, [340, 60], [-300, -370], null, 0, FOLDER); shadow(back);
  // the dossier slides in from the right, under the front flap (F5)
  var dc = docComp("Risk assessment dossier", 900, 640, [["AUTONOMOUS SYSTEMS // RISK ASSESSMENT", TF.mono, 34, TERM.ink, 60, 110, 20], ["CONFIDENTIAL WORKING FILE", TF.monoReg, 22, TERM.grey, 60, 160, 80]]);
  var d = c3(o.c, dc, [W / 2 + 20, H / 2 - 40, -2]); shadow(d);
  slideIn(o, d, T_DOSSIER, [W / 2 + 20, H / 2 - 40, -2], [1300, 30], -1.5);
  // folder front flap covers the lower part
  var front = shapeAt(o.c, "folder front", [W / 2, H / 2 + 150, -4]); addRect(front, [1000, 440], [0, 0], [0.62, 0.56, 0.45], 2, FOLDER_FRONT); shadow(front);
  // the lamp's warm pool of light; it clicks off at T_LAMP (one dark change, not a flash)
  var lamp = shapeAt(o.c, "lamp light", [W / 2 - 260, H / 2 - 180, -6]); addEllipse(lamp, 1500, [0, 0], null, 0, [1, 0.78, 0.45]);
  fx(lamp, "Fast Box Blur", {"Blur Radius": 260}); lamp.blendingMode = BlendingMode.SCREEN;
  keys(T(lamp).property("Opacity"), [[0, 22], [T_LAMP, 22], [T_LAMP + 1 / FPS, 0]], 0);
  var dark = solid(o.c, [0, 0, 0], "lamp off"); keys(T(dark).property("Opacity"), [[0, 0], [T_LAMP, 0], [T_LAMP + 1 / FPS, 78], [T_QUOTE - 0.8, 78], [T_QUOTE, 100]], 0);
  EVENTS.push(["lamp", T_LAMP]);
  cam(o, {push: 1.05, d0: -0.5, d1: 0.5});
})();

// B · black, the quote in gold serif
(function () {
  var o = Shot("S10B Quote", T_QUOTE, T_CREDITS, {bg: false});
  solid(o.c, [0, 0, 0], "black");
  var q1 = word(o, "“We didn’t lose control to machines that woke up.", T_QUOTE + 1.0, {font: TF.serif, size: 54, y: 490, color: TERM.amber, mode: "fade", track: 0, until: T_CREDITS - 0.6});
  var q2 = word(o, "We handed it over because we were too slow.”", T_QUOTE + 2.4, {font: TF.serif, size: 54, y: 580, color: TERM.amber, mode: "fade", track: 0, until: T_CREDITS - 0.6});
  // slower fades than the house default for the last words of the film
  keys(T(q1).property("Opacity"), [[0, 0], [1.0, 0], [3.0, 100], [o.d - 1.6, 100], [o.d - 0.4, 0]], 30);
  keys(T(q2).property("Opacity"), [[0, 0], [2.4, 0], [4.4, 100], [o.d - 1.6, 100], [o.d - 0.4, 0]], 30);
  cam(o, {push: 1.03, d0: 0.5, d1: -0.5});
})();

// C · silent end credits: every source and licence, rolling slowly upward
var CREDITS = [
  ["THE INVISIBLE CASSETTE", TF.head, 54, TERM.amber], ["", 0, 0],
  ["NARRATION", TF.monoReg, 24, TERM.grey], ["ElevenLabs voice “Edmund”", TF.headReg, 32, TERM.white], ["", 0, 0],
  ["ARCHIVE PHOTOGRAPHS · LIBRARY OF CONGRESS (PUBLIC DOMAIN)", TF.monoReg, 24, TERM.grey],
  ["Carol M. Highsmith: NYSE trading floor · Hoover Dam switchyard · Manhattan at dusk", TF.headReg, 30, TERM.white],
  ["Alfred T. Palmer: TVA generator room, 1942", TF.headReg, 30, TERM.white],
  ["Historic American Engineering Record: Los Angeles Aqueduct control room ·", TF.headReg, 30, TERM.white],
  ["Montana main control switchboard · Morony–Rainbow transmission line", TF.headReg, 30, TERM.white], ["", 0, 0],
  ["MAPS", TF.monoReg, 24, TERM.grey], ["Natural Earth (public domain)", TF.headReg, 30, TERM.white], ["", 0, 0],
  ["SOURCES", TF.monoReg, 24, TERM.grey],
  ["CFTC–SEC staff report on the market events of May 6, 2010", TF.headReg, 30, TERM.white],
  ["U.S. Department of Justice (2016) · NBC News · The Motley Fool · Better Markets", TF.headReg, 30, TERM.white],
  ["AEMO final report, South Australia (2017) · T&D World", TF.headReg, 30, TERM.white],
  ["U.S.–Canada Power System Outage Task Force (2004) · National Grid ESO / Ofgem", TF.headReg, 30, TERM.white],
  ["RTE, Learning to Run a Power Network · Marot et al. (2020)", TF.headReg, 30, TERM.white],
  ["van der Sar, Zocca, Bhulai (2025) · Lautenbacher et al. (2025)", TF.headReg, 30, TERM.white],
  ["DeepMind, Specification gaming (2020) · ECT Rotterdam · FAA", TF.headReg, 30, TERM.white],
  ["Medical News Today · reaction-time study (PMC)", TF.headReg, 30, TERM.white], ["", 0, 0],
  ["Drawn diagrams and numbers marked “illustration” or “illustrative” are not data.", TF.headReg, 26, TERM.grey]];
(function () {
  var o = Shot("S10C Credits", T_CREDITS, T_ENDSCREEN, {bg: false});
  solid(o.c, [0, 0, 0], "black");
  var roll = comp("Credits roll", o.d, W, 1500);
  var y = 120;
  for (var i = 0; i < CREDITS.length; i++) { var c = CREDITS[i]; if (c[0]) txt(roll, c[0], c[1], c[2], c[3], [W / 2, y], CENTER, c[1] === TF.monoReg ? 120 : 10); y += c[2] ? c[2] * 1.7 : 30; }
  var l = o.c.layers.add(roll);
  keys(T(l).property("Position"), [[0, [W / 2, H / 2 + 700]], [o.d, [W / 2, H / 2 - 160]]], 0);
  keys(T(l).property("Opacity"), [[0, 0], [0.8, 100], [o.d - 0.8, 100], [o.d, 0]], 0);
})();

// D · end-screen space: dark, with two quiet frames where YouTube places its end-screen cards
(function () {
  var o = Shot("S10D End screen", T_ENDSCREEN, END);
  var a = box(o, 760, 428, 560, 520, 30, TERM.amberDim), b = box(o, 760, 428, 1360, 520, 30, TERM.amberDim);
  showAt(o, a, o.a + 0.4); showAt(o, b, o.a + 0.6);
  label(o, "THE INVISIBLE CASSETTE", o.a + 0.8, {y: 860, size: 28, color: TERM.amber});
  cam(o, {push: 1.04, d0: -0.5, d1: 0.5});
})();

assemble("Scene10", END, [[0, 100], [1.2, 0], [END - 1.0, 0], [END, 100]]);
logEvents(10);
