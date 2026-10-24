// Outro: the landed booster; one engine, one line of maths, a computer; we only opened half the rocket; the
// second stage goes to orbit and never comes back (why not?); the end card. Plus a 2.5 s end-card hold.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/08_outro.jsx"
#include "film.jsx"

var HOLD = 2.5;
var main = chapterComp("08 Outro");
main.duration = TIMING.duration + HOLD;
var END = main.duration;
var SY = RIG.standY;
var SEA = [0.36, 0.5, 0.62];
var VC = [0.12, 0.13, 0.16], AC = ORANGE, DC = [0.22, 0.55, 0.42]; // v, a, d as in chapter 7

// ---------- A: it lands without hovering ----------
var tA2 = w("One") - 0.15, tB = w("But"), tC = w("Tell");
shot(main, "A landed", 0, tA2, 10, function (s, dur) {
  s.model("droneship", [0, 0, 0]);
  var sea = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "plane", name: "Sea", width: 6000 * s.S, height: 6000 * s.S, position: s.p(0, -2, 0), baseColor: SEA, roughness: 0.6, metallic: 0 }));
  tr(sea, "X Rotation").setValue(90);
  s.cmd("material.set", { layers: [sea.__id], castsShadows: "off", acceptsShadows: "on" });
  var b = s.booster({ at: [0, SY, 0] });
  s.legs(1, b); s.fins(1, b);
  s.lights();
  s.cameraPath([[0, [56, 12, 84], [0, 25, 0], 36], [dur, [51, 12, 77], [0, 25, 0], 36]], dur);
});

// ---------- A2: one engine, one line of maths, a computer ----------
shot(main, "A one engine", tA2, tB, 40, function (s, dur) {
  var b = s.booster({ ownEngines: true });
  s.fins(1, b); s.legs(1, b);
  var E = s.engines9(b, { hl: true });
  s.flame({ id: "centre", at: [0, -GIMBAL_UP + 0.33, 0], root: E[0].gimbal, len: 6, r: 0.36, keys: [[0, 0.7], [dur, 0.7]], tEnd: dur });
  s.lights();
  s.cameraPath([[0, [3.2, -11, 7.5], [0, 1.4, 0], 40], [dur, [3.0, -10.4, 7.0], [0, 1.4, 0], 40]], dur);
  pulse(E[0].hl, w("One") - 0.05, dur, 90, 0.28); pulse(E[0].disc, w("One") - 0.05, dur, 90, 0.28);
  mention(w("One") - 0.05, "one engine", "highlight");
  s.label({ id: "one", at: [0, 0.4, 0], root: b, title: "One engine", align: "left", to: ["A[0] - 240", "A[1] + 170"], tOn: w("One"), tOff: dur });
  var f = [["v²", VC, 1330], ["=", MUTED, 1450], ["2", INK, 1525], ["a", AC, 1600], ["d", DC, 1680]];
  for (var i = 0; i < f.length; i++) caption(s.comp, f[i][0], { id: i ? null : "one line of maths", pos: [f[i][2] - 40, 760], size: 110, color: f[i][1], tOn: w("line") + 0.06 * i, tOff: dur - 0.3 });
  caption(s.comp, "re-solved by the computer", { id: "computer", pos: [1465, 850], size: 34, font: "Inter-SemiBold", color: INK, tOn: w("computer"), tOff: dur - 0.3 });
  caption(s.comp, "all the way down", { pos: [1465, 896], size: 34, font: "Inter-Medium", color: MUTED, tOn: w("way") , tOff: dur - 0.3 });
});

// ---------- B: we opened half; the second stage goes to orbit and never comes back ----------
shot(main, "B the other half", tB, tC, 12, function (s, dur) {
  var b = s.booster({ cut: true, fill: 1 });
  s.fins(0, b, "", [2, 3]); s.legs(0, b, "", [0, 2, 3]);
  var up = s.model("upper_stack", [0, 0, 0]);
  s.floor(0.3);
  s.lights();
  s.cameraPath([[0, [34, 34, 128], [0, 35, 0], 34], [dur, [32, 34, 122], [0, 35, 0], 34]], dur);
  var hs = [s.hl("tank_skin", b), s.hl("interstage", b), s.hl("engine_section", b)] // whole shells: the cut ones sit behind the fuel;
  for (var i = 0; i < hs.length; i++) hlOn(hs[i], i ? "half the rocket " + i : "half the rocket", w("half"), w("second") - 0.25, 40);
  caption(s.comp, "opened: the booster", { id: "half", pos: [560, 760], size: 40, font: "Inter-SemiBold", color: INK, tOn: w("half"), tOff: w("second") - 0.25 });
  var hS2 = s.hl("second_stage", null); hS2.parent = up; tr(hS2, "Position").setValue([0, 0, 0]);
  hlOn(hS2, "second stage", w("second"), w("never") - 0.3, 60);
  // It lights its engine and climbs out of the top of the frame.
  var tGo = w("goes");
  animate(tr(up, "Position"), [[tGo, s.p(0, 0, 0)], [tGo + 0.5, s.p(0, 1.5, 0)], [w("orbit") + 1.2, s.p(0, 105, 0)]]);
  s.flame({ id: "second stage", at: [0, 42.3, 0], root: up, len: 10, r: 1.3, keys: [[0, 0], [tGo - 0.1, 0], [tGo + 0.3, 1], [dur, 1]], tEnd: dur });
  mention(tGo, "second stage climbs", "motion");
  caption(s.comp, "to orbit", { id: "orbit", pos: [1400, 300], size: 56, color: INK, tOn: w("orbit"), tOff: dur - 0.3 });
  caption(s.comp, "never comes back", { id: "never comes back", pos: [1400, 420], size: 56, color: RED, tOn: w("never"), tOff: dur - 0.3 });
  caption(s.comp, "WHY NOT?", { id: "why not", pos: [1400, 600], size: 120, color: ORANGE, tOn: w("Why"), tOff: dur - 0.3 });
});

// ---------- C: end card ----------
shot(main, "C end card", tC, END, 12, function (s, dur) {
  caption(s.comp, "What should we tear down next?", { id: "tear down next", pos: [960, 500], size: 80, color: INK, tOn: w("Tell"), tOff: dur - 0.5 });
  caption(s.comp, "Tell us in the comments", { id: "comments", pos: [960, 590], size: 40, font: "Inter-Medium", color: MUTED, tOn: w("comments"), tOff: dur - 0.5 });
  caption(s.comp, "TEARDOWN LAB", { pos: [960, 700], size: 34, font: "Inter-SemiBold", color: ORANGE, tOn: w("comments") + 0.4, tOff: dur - 0.5 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tA2, tB, tC]));
writeLn("built 08 Outro: " + END.toFixed(2) + " s");
