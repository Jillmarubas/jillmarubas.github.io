// Chapter 5: LETTING GO. Engine cutoff high in a darkening sky; helium pops three latches; pushers shove the
// stages apart; the second stage goes on; the booster coasts, nearly empty, fast, five minutes from home.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/05_letting_go.jsx"
#include "film.jsx"

var main = chapterComp("05 Letting go");
var END = main.duration;
var SPACE = [0.035, 0.05, 0.09];
// A full-frame sky behind the 3D scene: fades from the studio to near-black space between tA and tB.
function sky(comp, keys) {
  var l = comp.layers.addSolid(SPACE, "Space", W, H, 1);
  l.moveBefore(comp.layer(comp.numLayers)); // just above the studio background, behind everything else
  animate(tr(l, "Opacity"), keys);
  return l;
}

// ---------- A: two and a half minutes up, the engines shut down ----------
var tB = w("High");
shot(main, "A engine cutoff", 0, tB, 12, function (s, dur) {
  sky(s.comp, [[0, 0], [dur, 100]]);
  var b = s.booster({ ownEngines: false });
  var up = s.model("upper_stack", [0, 0, 0]); up.parent = b; tr(up, "Position").setValue([0, 0, 0]);
  s.fins(0, b); s.legs(0, b);
  animate(tr(b, "Position"), [[0, s.p(0, 0, 0)], [dur, s.p(0, 12, 0)]]);
  var tCut = w("shut");
  s.flame({ id: "nine", at: [0, 0.35, 0], root: b, len: 16, r: 1.7, keys: [[0, 1], [tCut, 1], [tCut + 0.35, 0], [dur, 0]], tEnd: dur });
  mention(tCut, "engines shut down", "flame");
  s.lights();
  s.cameraPath([[0, [30, 36, 120], [0, 36, 0], 34], [dur, [30, 46, 116], [0, 46, 0], 34]], dur);
  caption(s.comp, "≈ 2 min 30 s after liftoff", { id: "two and a half minutes", pos: [1390, 500], size: 46, color: WHITE, tOn: w("two"), tOff: dur - 0.2 });
  caption(s.comp, "engine cutoff", { id: "cutoff", pos: [1390, 580], size: 40, font: "Inter-SemiBold", color: [0.75, 0.78, 0.84], tOn: tCut, tOff: dur - 0.2 });
});

// ---------- B: helium pops three latches; pushers shove the stages apart ----------
var tC = w("The", 3);
shot(main, "B separation", tB, tC, 60, function (s, dur) {
  sky(s.comp, [[0, 100], [dur, 100]]);
  var b = s.booster({ cut: true, fill: 0.06 });
  var up = s.model("upper_stack_cut", [0, 0, 0]);
  s.fins(0, b, "", [2, 3]);
  s.lights();
  var tSep = w("shove");
  animate(tr(up, "Position"), [[tSep, s.p(0, 0, 0)], [tSep + 1.6, s.p(0, 3.4, 0)], [dur, s.p(0, 5.2, 0)]]);
  mention(tSep, "stages pushed apart", "motion");
  s.cameraPath([[0, [5.8, 47.2, 11.5], [0, 46.2, 0], 40], [tSep, [6.2, 47.6, 12.2], [0, 46.6, 0], 40], [dur, [8.5, 49, 16.5], [0, 47.8, 0], 40]], dur);
  // Helium (violet) runs to the latches, which glow and let go.
  var hLatch = s.hl("latches_cut", b);
  hlOn(hLatch, "three latches", w("latches"), tSep + 0.4);
  s.label({ id: "latches", at: [0, 47.4, -1.45], root: b, title: "3 latches", sub: "released by high-pressure helium", align: "left", to: ["A[0] - 120", "A[1] - 170"], color: HEC, tOn: w("latches"), tOff: w("pneumatic") + 0.2 });
  s.flow({ id: "helium to the latches", a: [-0.5, 44.6, -0.6], b: [0, 47.3, -1.45], color: HEC, n: 6, r: 0.06, speed: 0.9, tOn: w("helium"), tOff: w("pneumatic") });
  var hPush = s.hl("pushers_cut", b);
  hlOn(hPush, "pneumatic pushers", w("pneumatic"), dur);
  s.label({ id: "pushers", at: [0.15, RIG.fill.loxTop + 2.6, 0], root: b, title: "Pneumatic pushers", sub: "shove the stages apart", align: "right", to: ["A[0] + 260", "A[1] - 40"], tOn: w("pushers"), tOff: dur });
});

// ---------- C: the second stage carries on; the booster coasts, nearly empty ----------
shot(main, "C coasting", tC, END, 12, function (s, dur) {
  sky(s.comp, [[0, 100], [dur, 100]]);
  var b = s.booster({ cut: true, fill: 0.05, assembly: "stowed" });
  s.fillKeys([[0, 0.05], [dur, 0.05]], [[0, 0.04], [dur, 0.04]], dur, { cut: true, helium: [[0, 80], [dur, 80]] });
  var up = s.model("upper_stack", [0, 5.2, 0]);
  var t2 = w("second");
  // The second stage lights its engine and pulls away out of the top of the frame.
  animate(tr(up, "Position"), [[0, s.p(0, 5.2, 0)], [t2 + 0.3, s.p(0, 6.5, 0)], [w("orbit") + 1.6, s.p(0, 95, 0)]]);
  s.flame({ id: "second stage", at: [0, 42.3, 0], root: up, len: 10, r: 1.3, keys: [[0, 0], [t2, 0], [t2 + 0.4, 1], [dur, 1]], tEnd: dur }); // under the Merlin Vacuum
  var hS2 = s.hl("second_stage", null); hS2.parent = up; tr(hS2, "Position").setValue([0, 0, 0]);
  hlOn(hS2, "second stage", t2, w("orbit") + 0.8, 60);
  caption(s.comp, "to orbit", { id: "to orbit", pos: [960, 140], size: 48, color: WHITE, tOn: w("orbit"), tOff: w("orbit") + 1.6 });
  // The booster drifts, slowly tipping over.
  animate(tr(b, "Z Rotation"), [[w("booster") - 0.2, 0], [dur, -14]]);
  s.lights();
  s.cameraPath([[0, [22, 40, 78], [0, 40, 0], 34], [w("booster") - 0.3, [22, 40, 78], [0, 40, 0], 34], [w("booster") + 1.8, [-12, 24, 74], [-9, 23, 0], 34], [dur, [-12.5, 23.5, 72], [-9, 23, 0], 34]], dur);
  var hSkin = s.hl("tank_skin_cut", b);
  hlOn(hSkin, "empty can", w("empty"), w("coasting") - 0.2, 40);
  caption(s.comp, "14 storeys, nearly empty", { id: "nearly empty", pos: [560, 380], size: 48, color: WHITE, tOn: w("empty"), tOff: w("coasting") + 0.4 });
  counter(s.comp, "mach", { keys: [[0, 6], [dur, 6]], fmt: '"≈ Mach " + Math.round(v)', pos: [560, 520], size: 88, color: WHITE, tOn: w("6"), tOff: dur - 0.3 });
  caption(s.comp, "around 6× the speed of sound", { pos: [560, 580], size: 32, font: "Inter-Medium", color: [0.75, 0.78, 0.84], tOn: w("6"), tOff: dur - 0.3 });
  s.hlFill("lox", 0.05, true, "almost no fuel left", w("fuel"), dur, 85);
  s.hlFill("rp1", 0.04, true, "almost no fuel left (RP-1)", w("fuel"), dur, 85);
  s.label({ id: "left", at: [0.6, RIG.rp1[1] + 0.3, 0], root: b, title: "Almost no fuel left", align: "left", to: ["A[0] - 200", "A[1] + 120"], tOn: w("fuel"), tOff: dur });
  caption(s.comp, "≈ 5 minutes to get home", { id: "five minutes", pos: [560, 700], size: 52, color: ORANGE, tOn: w("five"), tOff: dur - 0.2 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tB, tC]));
writeLn("built 05 Letting go: " + END.toFixed(2) + " s");
