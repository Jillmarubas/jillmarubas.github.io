// Scene 3, "The physics of the grid" (Act II opens). Scene comp starts 1.0 s before the voice.
#include "kit2.jsx"
SC = 3;
var END = vo(180.53) + 1.8;
var NODES = [[220, 760], [480, 640], [760, 720], [1040, 600], [1320, 690], [1640, 580], [600, 880], [1180, 860], [900, 480], [1480, 840], [340, 500], [1760, 760]];
var EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 2], [3, 7], [7, 4], [2, 8], [8, 3], [4, 9], [9, 7], [10, 1], [10, 8], [5, 11], [9, 11]];
function grid(o, when, color, until) {
  for (var k = 0; k < EDGES.length; k++) { var p = pathShape(o.c, [NODES[EDGES[k][0]], NODES[EDGES[k][1]]], color || TERM.amber, 3, "line"); showAt(o, p.l, when, until); }
  for (var n = 0; n < NODES.length; n++) showAt(o, dot(o.c, NODES[n][0], NODES[n][1], 11, color || TERM.amber, "bus"), when, until);
}

// A · the grid
(function () {
  var o = Shot("S3A Grid", 0, vo(8.36));
  backdropPhoto(o, "hoover_switchyard_highsmith.jpg", 0, {caption: "Hoover Dam switchyard · Carol M. Highsmith, Library of Congress"});
  grid(o, 0.2);
  word(o, "THE ELECTRICAL GRID", at("electrical grid"), {size: 120, y: 300, mode: "rise", glow: true});
  label(o, "UNFORGIVING PHYSICS", at("unforgiving"), {y: 390, color: TERM.white, size: 34});
  cam(o, {y0: 40, y1: 0, d0: -0.3, d1: 0.4});
})();

// B · spinning steel: mechanical inertia
(function () {
  var o = Shot("S3B Inertia", vo(8.36), vo(24.2));
  printPhoto(o, "tva_generators_1942.jpg", o.a + 0.1, {x: 540, y: H / 2 - 10, w: 780, caption: "TVA hydroelectric generator room, 1942 · Alfred T. Palmer, Library of Congress"});
  showAt(o, rotor(o, 860, H / 2 + 280, 90, TERM.amber, "time * 220"), at("spinning steel"));
  label(o, "THERMAL AND HYDRO TURBINES", at("thermal"), {x: 540, y: H / 2 + 380, size: 28});
  word(o, "SPINNING STEEL", at("spinning steel"), {size: 100, x: 1390, y: 430});
  word(o, "MECHANICAL INERTIA", at("mechanical"), {size: 80, x: 1390, y: 560, color: TERM.amber, glow: true});
  label(o, "IT RESISTS RAPID FREQUENCY DROPS", at("resisting"), {x: 1390, y: 650, size: 26, color: TERM.white});
  cam(o, {x0: -60, x1: 40, d0: -0.4, d1: 0.4});
})();

// C · time to respond: seconds for machines, minutes for people
(function () {
  var o = Shot("S3C Time budget", vo(24.2), vo(39.74));
  var tf = o.t(at("failed"));
  gauge(o, 1400, 860, 230, "LOW", "60 Hz", "HIGH", "-22 * ease(time, " + tf + ", " + (tf + 4) + ", 0, 1)");
  label(o, "SOMETHING FAILS: THE SPINNING MASS SLOWS THE FALL", at("failed"), {x: 1400, y: 520, size: 24, color: TERM.white});
  printPhoto(o, "control_room_haer.jpg", at("human operators"), {x: 560, y: 690, w: 760, caption: "Power plant control room, Los Angeles Aqueduct · HAER, Library of Congress"});
  word(o, "AUTOMATIC CONTROLS: SECONDS", at("automatic"), {size: 64, y: 200, color: TERM.amber});
  word(o, "HUMAN OPERATORS: MINUTES", at("human operators"), {size: 64, y: 300});
  label(o, "READ THE DIALS · PICK UP THE PHONE · CALL IN RESERVE POWER", at("read the dials"), {y: 380, size: 26, color: TERM.amber});
  cam(o, {d0: 0.3, d1: -0.3});
})();

// D · the turn: inertia is shrinking
(function () {
  var o = Shot("S3D Shrinking", vo(39.74), vo(43.3), {red: true});
  showAt(o, rotor(o, W / 2, H / 2 + 60, 200, TERM.amberDim, "var t = Math.min(time, 3.2); 220 * t - 34 * t * t"), o.a);
  word(o, "INERTIA IS SHRINKING", at("shrinking") - 0.6, {size: 120, color: TERM.red, y: H / 2 - 260, glow: true});
  cam(o, {push: 1.05, d0: 0, d1: 0.6});
})();

// E · inverter-based resources: power electronics, not rotating iron
(function () {
  var o = Shot("S3E Inverters", vo(43.3), vo(60.78));
  label(o, "INVERTER-BASED RESOURCES", at("inverter"), {y: 220, size: 40, color: TERM.white});
  showAt(o, solarIcon(o, 540, 500, 120, TERM.amber), at("solar"));
  showAt(o, batteryIcon(o, 960, 520, 140, TERM.amber), at("battery"));
  var w = windIcon(o, 1380, 440, 130, TERM.amber, "time * 60"); showAt(o, w.tower, at("wind farms")); showAt(o, w.blades, at("wind farms"));
  label(o, "SOLAR", at("solar"), {x: 540, y: 690, size: 26}); label(o, "BATTERIES", at("battery"), {x: 960, y: 690, size: 26}); label(o, "WIND", at("wind farms"), {x: 1380, y: 690, size: 26});
  word(o, "POWER ELECTRONICS", at("power electronics"), {size: 92, y: 820, color: TERM.amber, glow: true});
  word(o, "HEAVY ROTATING IRON", at("not heavy"), {size: 50, y: 920, color: TERM.grey, mode: "fade"});
  strike(o, W / 2, 905, 560, at("rotating iron") + 0.2);
  cam(o, {x0: -40, x1: 40, d0: -0.3, d1: 0.3});
})();

// F · less inertia, faster fall (two dials, same fault)
(function () {
  var o = Shot("S3F Faster fall", vo(60.78), vo(66.6));
  var t0 = o.t(at("fall faster")) - 0.3;
  label(o, "HIGH INERTIA", o.a + 0.2, {x: 560, y: 360, size: 32, color: TERM.white});
  label(o, "LOW INERTIA", o.a + 0.2, {x: 1360, y: 360, size: 32, color: TERM.white});
  gauge(o, 560, 760, 240, "", "", "", "-20 * ease(time, " + t0 + ", " + (t0 + 4) + ", 0, 1)");
  gauge(o, 1360, 760, 240, "", "", "", "-70 * ease(time, " + t0 + ", " + (t0 + 0.8) + ", 0, 1)", TERM.red);
  word(o, "LESS INERTIA = FASTER FALL", at("less inertia"), {size: 80, y: 220});
  cam(o, {d0: 0.2, d1: -0.3});
})();

// G1 · South Australia, 28 Sept 2016: storm, towers down, wind farms' protection settings cut output
var tState = at("the state was");
(function () {
  var o = Shot("S3G South Australia storm", vo(66.6), tState, {red: true});
  word(o, "SOUTH AUSTRALIA · 28 SEPTEMBER 2016", at("september"), {font: TF.mono, size: 46, color: TERM.amber, y: 170, mode: "type", cps: 26, track: 60});
  var tS = at("storm");
  var line = pathShape(o.c, [[160, 560], [1760, 560]], TERM.amber, 4, "transmission line");
  keys(line.st.property("Color"), [[0, TERM.amber], [o.t(tS) + 0.8, TERM.amber], [o.t(tS) + 1.2, TERM.red]], 0);
  for (var i = 0; i < 5; i++) { var tw = tower(o, 300 + i * 330, 720, 80, TERM.amber); showAt(o, tw, o.a + 0.2);
    keys(T(tw).property("Z Rotation"), [[0, 0], [o.t(tS) + 0.6 + i * 0.15, 0], [o.t(tS) + 1.3 + i * 0.15, i % 2 ? 70 : -70]], 0); }
  label(o, "A STORM TEARS DOWN TRANSMISSION LINES", tS, {y: 270, size: 30, color: TERM.white});
  var tW = at("wind farms");
  for (var k = 0; k < 3; k++) { var w = windIcon(o, 560 + k * 400, 860, 70, TERM.amber, "time < " + (o.t(at("cut their")) + 0.4) + " ? time * 120 : " + (o.t(at("cut their")) + 0.4) + " * 120"); showAt(o, w.tower, tW); showAt(o, w.blades, tW); }
  word(o, "WIND FARMS’ PROTECTION SETTINGS CUT OUTPUT", at("protection"), {size: 52, y: 380, color: TERM.red});
  cam(o, {d0: -0.5, d1: 0.6});
})();
// G2 · cut off from its neighbours; frequency collapses in under a second
var tBlack = at("went black");
(function () {
  var o = Shot("S3G Collapse", tState, tBlack, {red: true});
  tag(o, "SOUTH AUSTRALIA", o.a + 0.1, {x: 520, y: 320, color: TERM.amber, size: 46});
  tag(o, "VICTORIA", o.a + 0.1, {x: 1440, y: 320, color: TERM.grey, size: 46});
  var ic = pathShape(o.c, [[760, 320], [1290, 320]], TERM.amber, 5, "interconnector"); showAt(o, ic.l, o.a, at("cut off") + 0.2);
  word(o, "CUT OFF FROM ITS NEIGHBORS", at("cut off"), {x: 1020, y: 250, size: 40, color: TERM.red});
  var tc = o.t(at("collapsed"));
  gauge(o, W / 2, 900, 260, "", "50 Hz", "", "-80 * ease(time, " + (tc - 0.2) + ", " + (tc + 0.6) + ", 0, 1)", TERM.red);
  word(o, "FREQUENCY COLLAPSED IN UNDER A SECOND", at("collapsed"), {size: 64, y: 520, color: TERM.red, glow: true});
  cam(o, {push: 1.06, d0: 0.4, d1: -0.6});
})();
// H · the whole state went black
(function () {
  var o = Shot("S3H Black", tBlack, vo(95.7), {bg: false});
  solid(o.c, [0, 0, 0], "black");
  word(o, "SPINNING MACHINES CAN BE WRECKED", at("spinning machines"), {size: 72, y: H / 2 - 30, mode: "rise"});
  label(o, "BY THE ELECTRICITY THEY MAKE", at("electricity"), {y: H / 2 + 50, size: 34, color: TERM.amber});
  cam(o, {push: 1.03});
})();

// I · Mohave, 1970 and 1971: oscillations twist a generator shaft
(function () {
  var o = Shot("S3I Mohave shaft", vo(95.7), vo(113.64));
  word(o, "1970", at("1970"), {font: TF.mono, size: 120, x: 760, y: 250, color: TERM.amber});
  word(o, "1971", at("1971"), {font: TF.mono, size: 120, x: 1160, y: 250, color: TERM.amber});
  var tO = o.t(at("oscillations"));
  var sh = shapeAt(o.c, "shaft", [W / 2, 560, 0]);
  addRect(sh, [1200, 130], [0, 0], TERM.amber, 4, TERM.panel);
  for (var k = -11; k <= 11; k++) addPath(sh, [[k * 52 - 30, -60], [k * 52 + 30, 60]], TERM.amberDim, 4);
  T(sh).property("Position").expression = "var a = ease(time, " + tO + ", " + (tO + 2) + ", 0, 9); value + [0, Math.sin(time * 34) * a, 0];";
  T(sh).property("Z Rotation").expression = "var a = ease(time, " + tO + ", " + (tO + 2) + ", 0, 0.9); Math.sin(time * 21) * a;";
  showAt(o, sh, o.a + 0.2);
  var wv = []; for (var x = -600; x <= 600; x += 20) wv.push([W / 2 + x, 760 + Math.sin(x / 40) * 40]);
  var wave = pathShape(o.c, wv, TERM.red, 4, "oscillation"); showAt(o, wave.l, at("oscillations"));
  T(wave.l).property("Position").expression = "[ (time * 160) % 251 - 125, 0, 0 ]";
  word(o, "ELECTRICAL OSCILLATIONS TWISTED THE SHAFT", at("oscillations"), {size: 56, y: 400, color: TERM.red});
  label(o, "MOHAVE GENERATING STATION, NEVADA", at("mojave"), {y: 870, size: 32, color: TERM.white});
  word(o, "EACH REPAIR TOOK MONTHS", at("each repair"), {size: 72, y: 960, color: TERM.amber});
  cam(o, {x0: -50, x1: 50, d0: -0.3, d1: 0.3});
})();

// J · people are slow; protection has been automatic for decades
(function () {
  var o = Shot("S3J Human speed", vo(113.64), vo(126.32));
  var tW = at("that's why");
  word(o, "SECONDS TO NOTICE AN ALARM", at("seconds", vo(113)), {size: 80, y: 420, until: tW - 0.1});
  label(o, "FAR LONGER TO UNDERSTAND IT", at("far longer"), {y: 520, size: 34, color: TERM.white, until: tW - 0.1});
  word(o, "THE FASTEST PROTECTION", at("fastest"), {size: 80, y: 430, mode: "rise"});
  word(o, "AUTOMATIC FOR DECADES", at("automatic", tW), {size: 96, y: 560, color: TERM.amber, glow: true});
  cam(o, {d0: 0.2, d1: -0.3});
})();

// K · 2003: silenced alarms, a blackout across the northeast
(function () {
  var o = Shot("S3K 2003 blackout", vo(126.32), vo(146.0), {red: true});
  word(o, "14 AUGUST 2003", at("2003"), {font: TF.mono, size: 60, y: 160, color: TERM.amber, mode: "type", cps: 18, track: 80});
  word(o, "OHIO CONTROL ROOM: A SOFTWARE BUG SILENCES THE ALARMS", at("software bug"), {size: 46, y: 250});
  var t0 = at("lines failing"), t1 = at("50");
  for (var i = 0; i < 40; i++) {
    var x = 260 + rnd(i, 1) * 1400, y = 360 + rnd(i, 2) * 420;
    var d = dot(o.c, x, y, 9, TERM.amber, "city " + i);
    var td = o.t(t0 + (t1 - t0) * rnd(i, 3));
    keys(T(d).property("Opacity"), [[0, 100], [td, 100], [td + 0.3, 12]], 0);
  }
  num(o, 0, 50, at("50"), at("50") + 0.9, {pre: "≈ ", suf: " MILLION PEOPLE", size: 96, y: 900, glow: true});
  label(o, "U.S.–CANADA POWER SYSTEM OUTAGE TASK FORCE", at("50") + 0.6, {y: 980, size: 24});
  cam(o, {d0: -0.4, d1: 0.5});
})();

// L · Britain, 9 Aug 2019: two stations lost, automatic systems cut 1.1 million customers
(function () {
  var o = Shot("S3L Britain 2019", vo(146.0), vo(163.68));
  word(o, "GREAT BRITAIN · 9 AUGUST 2019", at("august"), {font: TF.mono, size: 50, y: 160, color: TERM.amber, mode: "type", cps: 24, track: 60});
  label(o, "AFTER A LIGHTNING STRIKE", at("lightning"), {y: 240, size: 30, color: TERM.white});
  var tN = at("no human");
  tag(o, "HORNSEA", at("two power"), {x: 700, y: 400, color: TERM.red, size: 50, until: tN - 0.1});
  tag(o, "LITTLE BARFORD", at("stations") + 0.4, {x: 1220, y: 400, color: TERM.red, size: 50, until: tN - 0.1});
  label(o, "TWO POWER STATIONS LOST WITHIN SECONDS", at("within seconds"), {y: 500, size: 30, until: tN - 0.1});
  word(o, "NO HUMAN DECIDED", tN, {size: 110, y: 430, glow: true});
  num(o, 0, 1.1, at("million", tN), at("million", tN) + 0.8, {dec: 1, pre: "≈ ", suf: " MILLION CUSTOMERS", size: 80, y: 620, color: TERM.amber});
  label(o, "CUT OFF AUTOMATICALLY TO SAVE THE REST OF THE GRID", at("save"), {y: 710, size: 28, color: TERM.white});
  cam(o, {d0: 0.4, d1: -0.4});
})();

// M · a few seconds: flicker or blackout
(function () {
  var o = Shot("S3M Flicker or blackout", vo(163.68), vo(171.86));
  label(o, "IN A LOW-INERTIA GRID, A FEW SECONDS", at("low inertia"), {y: 300, size: 34, color: TERM.white});
  word(o, "FLICKER", at("flicker"), {size: 130, x: 560, y: 560, color: TERM.amber});
  word(o, "BLACKOUT", at("blackout"), {size: 130, x: 1360, y: 560, color: TERM.red, glow: true});
  label(o, "OR", at("flicker") + 0.4, {y: 545, size: 40});
  cam(o, {push: 1.04});
})();

// N · biologically too slow (end of scene: hand-off to Scene 4)
(function () {
  var o = Shot("S3N Too slow", vo(171.86), END);
  word(o, "BIOLOGICALLY TOO SLOW", at("biologically"), {size: 130, y: H / 2 - 20, glow: true});
  label(o, "TO BALANCE THE PHYSICS OF THE MODERN GRID ALONE", at("balance"), {y: H / 2 + 90, size: 32, color: TERM.amber});
  cam(o, {push: 1.05, d0: -0.2, d1: 0.3});
})();

assemble("Scene3", END, [[0, 100], [0.8, 0], [vo(66.6), 0], [vo(67), 15], [tBlack - 0.05, 15], [tBlack, 0], [vo(95.7), 0], [vo(126.32), 0], [vo(126.6), 12], [vo(146), 12], [vo(146.3), 0], [END - 1.0, 0], [END, 100]]);
