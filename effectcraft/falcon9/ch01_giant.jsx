// Chapter 1: THE GIANT, TO SCALE. The whole Falcon 9 next to a bus and a person, the upper stage lifts away,
// then the three parts that matter for landing: grid fins, landing legs, nine engines.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/01_giant.jsx"
#include "film.jsx"

var main = chapterComp("01 Giant");
var END = main.duration;

// ---------- A: the whole rocket, to scale ----------
var tB = w("Today");
shot(main, "A whole Falcon 9", 0, tB, 12, function (s, dur) {
  var b = s.booster({});
  var up = s.model("upper_stack", [0, 0, 0]);
  s.fins(0, b); s.legs(0, b);
  s.model("bus", [-13, 0, 6]);
  s.model("technician", [-5.5, 0, 9]);
  s.floor(0.3);
  s.lights();
  var tWide = w("just"), tBack = w("long");
  s.cameraPath([
    [0, [34, 34, 128], [0, 35, 0], 34],
    [tWide - 0.25 - FR, [32, 34, 124], [0, 35, 0], 34],
    [tWide - 0.25, [5.8, 6.4, 15.6], [0, 5.4, 0], 36], // cut to the base for the width
    [tBack - 0.2 - FR, [5.2, 6.2, 14.4], [0, 5.4, 0], 36],
    [tBack - 0.2, [32, 34, 124], [0, 35, 0], 34], // cut back to the whole rocket
    [dur, [30, 34, 119], [0, 35, 0], 34],
  ], dur);
  var hs = [s.hl("upper_stack", null), s.hl("tank_skin", b), s.hl("interstage", b), s.hl("engine_section", b)];
  for (var i = 0; i < hs.length; i++) hlOn(hs[i], i ? "Falcon 9 " + i : "whole Falcon 9", w("whole"), w("70") - 0.1, 30);
  s.dim({ id: "h70", a: [3.4, 0.35, 0], b: [3.4, 70, 0], text: "70 m", offset: [40, 0], textOffset: [80, 0], tOn: w("70"), tOff: tWide - 0.1 });
  s.dim({ id: "w366", a: [-1.83, 6.2, 1.95], b: [1.83, 6.2, 1.95], text: "3.66 m", offset: [0, 0], textOffset: [0, -40], tOn: w("3"), tOff: tBack + 0.3 });
  caption(s.comp, "19× taller than it is wide", { id: "pencil", pos: [1350, 540], size: 52, color: INK, tOn: w("pencil"), tOff: dur - 0.3 });
  s.label({ id: "bus", at: [-13, 3.4, 6], title: "Bus", sub: "12 m", align: "left", to: ["A[0] - 40", "A[1] - 170"], tOn: w("70") + 0.4, tOff: tWide - 0.1 });
});

// ---------- B: open the bottom part; it lifts off and comes home ----------
var tC = w("Grid");
shot(main, "B the booster", tB, tC, 12, function (s, dur) {
  // A pivot at mid-height so the booster can turn around in the air.
  var pv = s.nul("pivot", [0, 24, 0]);
  var b = s.booster({ assembly: "stowed" });
  b.parent = pv; tr(b, "Position").setValue(s.local(0, -24, 0));
  var up = s.model("upper_stack", [0, 0, 0]);
  s.lights();
  var tLift = w("opening") + 0.1;
  animate(tr(up, "Position"), [[tLift, s.p(0, 0, 0)], [tLift + 2.4, s.p(0, 62, -4)]]);
  mention(tLift, "upper stage lifts away", "motion");
  var hs = [s.hl("tank_skin", b), s.hl("interstage", b), s.hl("engine_section", b)];
  for (var i = 0; i < hs.length; i++) hlOn(hs[i], i ? "first stage " + i : "first stage", w("first"), w("It") - 0.2, 30);
  s.label({ id: "stage1", at: [1.9, 30, 0], root: b, title: "First stage", sub: "the booster", align: "right", to: ["A[0] + 240", "A[1] - 40"], tOn: w("first"), tOff: w("It") - 0.2 });
  // Heavy lifting: engines on, it climbs; then it turns around and comes home.
  var tUp = w("heavy"), tOffE = w("then") - 0.2, tTurn = w("turns"), tHome = w("home") + 0.4;
  s.flame({ id: "ascent", at: [0, 0.35, 0], root: b, len: 14, r: 1.6, keys: [[0, 0], [tUp - 0.1, 0], [tUp + 0.4, 1], [tOffE, 1], [tOffE + 0.4, 0], [dur, 0]], tEnd: dur });
  animate(tr(pv, "Position"), [[tUp, s.p(0, 24, 0)], [tOffE + 0.4, s.p(0, 54, 0)], [tHome, s.p(0, 54, 0)], [dur - 0.1, s.p(0, 24, 0)]]);
  animate(tr(pv, "Z Rotation"), [[tTurn - 0.1, 0], [tHome + 0.2, -180]]); // flips to fly engines-first, home
  mention(tTurn, "turns around", "motion");
  s.cameraPath([
    [0, [30, 34, 112], [0, 35, 0], 34],
    [tLift + 2.0, [22, 26, 88], [0, 24, 0], 34],
    [tUp, [22, 26, 88], [0, 24, 0], 34],
    [tOffE + 0.4, [30, 44, 120], [0, 46, 0], 34],
    [tHome, [30, 44, 120], [0, 46, 0], 34],
    [dur, [22, 26, 88], [0, 24, 0], 34],
  ], dur);
});

// ---------- C: grid fins, landing legs, nine engines (a cut on each part's name); every one matters ----------
var tLegC = w("landing"), tEngC = w("9", 2);
shot(main, "C1 grid fins", tC, tLegC, 12, function (s, dur) {
  var b = s.booster({});
  var finK = function (t) { return ease((t - 0.05) / 1.1); };
  s.fins(finK, b, "", null, 0, dur);
  s.legs(0, b);
  s.lights();
  s.cameraPath([[0, [6.8, 45.8, 17.6], [0, 42.4, 0], 38], [dur, [6.2, 45.4, 16.2], [0, 42.4, 0], 38]], dur);
  s.hlFins(finK, b, null, 0, dur, "grid fins", 0, dur);
  s.label({ id: "fins", at: [1.9, 42.4, 1.3], root: b, title: "Grid fins", sub: "near the top", align: "right", to: ["A[0] + 230", "A[1] - 150"], tOn: 0.05, tOff: dur });
});
shot(main, "C2 landing legs", tLegC, tEngC, 12, function (s, dur) {
  var b = s.booster({});
  var legK = function (t) { return ease((t - 0.05) / 1.3); };
  s.fins(1, b);
  s.legs(legK, b, "", null, 0, dur);
  s.lights();
  s.cameraPath([[0, [11.5, 3.2, 23], [0, 1.5, 0], 38], [dur, [10.8, 3.0, 21.5], [0, 1.5, 0], 38]], dur);
  s.hlLegs(legK, b, null, 0, dur, "landing legs", 0.05, dur);
  s.label({ id: "legs", at: [5.0, -1.4, 0], root: b, title: "Landing legs", sub: "at the bottom", align: "right", to: ["A[0] + 160", "A[1] - 160"], tOn: 0.25, tOff: dur });
});
shot(main, "C3 engines, every one", tEngC, END, 12, function (s, dur) {
  var b = s.booster({});
  s.fins(1, b); s.legs(1, b);
  s.lights();
  var tEvery = w("Every"), tWhat = w("what");
  s.cameraPath([
    [0, [8.5, -6, 10], [0, 1.6, 0], 42],
    [tEvery - 0.1, [8.0, -5.6, 9.4], [0, 1.6, 0], 42],
    [tEvery + 2.4, [26, 24, 86], [0, 22, 0], 34, true],
    [dur, [25, 24, 83], [0, 22, 0], 34],
  ], dur);
  var hEng = s.hl("engines", b);
  hlOn(hEng, "9 engines", 0.02, tEvery - 0.2);
  s.label({ id: "engines", at: [0.5, 0.4, 0.8], root: b, title: "9 Merlin engines", sub: "underneath", align: "left", to: ["A[0] - 200", "A[1] - 120"], tOn: 0.05, tOff: tEvery - 0.2 });
  // Every one of these matters: all three glow together.
  var again = s.hl("engines", b, "HL engines again");
  hlOn(again, "engines matter", tEvery, tWhat - 0.3);
  s.hlFins(1, b, null, 0, dur, "fins matter", tEvery, tWhat - 0.3);
  s.hlLegs(1, b, null, 0, dur, "legs matter", tEvery, tWhat - 0.3);
  // But first, what fills the other forty metres?
  var hSkin = s.hl("tank_skin", b);
  hlOn(hSkin, "the other forty metres", w("fills"), dur - 0.2, 26);
  s.dim({ id: "rest", a: [3.2, 4.0, 0], b: [3.2, 40.6, 0], root: b, text: "?", size: 90, offset: [50, 0], textOffset: [70, 0], tOn: w("fills"), tOff: dur - 0.2 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([w("just") - 0.25, w("long") - 0.2, tB, tC, tLegC, tEngC]));
writeLn("built 01 Giant: " + END.toFixed(2) + " s");
