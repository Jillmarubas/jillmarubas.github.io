// Chapter 4: NINE AS ONE. Eight in a circle and one in the middle; together at liftoff; they swivel to steer;
// one can fail; coming down it uses only one.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/04_nine.jsx"
#include "film.jsx"

var main = chapterComp("04 Nine");
var END = main.duration;
var UNDER = [[3.2, -11, 7.5], [0, 1.4, 0], 40]; // looking up into the engine bay

function engineBooster(s, opts) {
  var b = s.booster({ ownEngines: true });
  s.fins(0, b); s.legs(0, b);
  var E = s.engines9(b, opts);
  return { b: b, E: E };
}
// One flame per engine, hanging from its gimbal so it swivels with it. keysFor(i) -> strength keys.
function flames9(s, E, keysFor, dur, len) {
  for (var i = 0; i < E.length; i++) s.flame({ id: E[i].name, at: [0, -GIMBAL_UP + 0.33, 0], root: E[i].gimbal, len: len || 6, r: 0.36, keys: keysFor(i), tEnd: dur });
}
function pulseAll(list, id, tOn, tOff, peak) { for (var i = 0; i < list.length; i++) { pulse(list[i], tOn, tOff, peak || 85, 0.28); } mention(tOn, id, "highlight"); }

// ---------- A: the layout, then all nine at liftoff ----------
var tB = w("There");
shot(main, "A eight and one", 0, tB, 40, function (s, dur) {
  var R = engineBooster(s, { hl: true }), E = R.E;
  s.lights();
  s.cameraPath([[0, UNDER[0], UNDER[1], 40], [w("Together") - 0.1, [3.0, -10.4, 7.0], UNDER[1], 40], [w("Together") + 2.6, [16, -2, 26], [0, 3, 0], 38, true], [dur, [17, -1.5, 27.5], [0, 3, 0], 38]], dur);
  var all = [], outer = [];
  for (var i = 0; i < E.length; i++) { all.push(E[i].hl, E[i].disc); if (i > 0) outer.push(E[i].hl, E[i].disc); }
  pulseAll(all, "9 engines", w("9"), w("8") - 0.25, 70);
  pulseAll(outer, "8 in a circle", w("8"), w("1") - 0.2);
  s.label({ id: "ring", at: [1.27, 0.4, 0], root: R.b, title: "8 in a circle", align: "right", to: ["A[0] + 240", "A[1] - 160"], tOn: w("8"), tOff: w("Together") - 0.2 });
  pulseAll([E[0].hl, E[0].disc], "1 in the middle", w("1"), w("Together") - 0.2);
  s.label({ id: "centre", at: [0, 0.4, 0], root: R.b, title: "1 in the middle", align: "left", to: ["A[0] - 240", "A[1] + 170"], tOn: w("1"), tOff: w("Together") - 0.2 });
  flames9(s, E, function (i) { return [[0, 0], [w("Together") - 0.05, 0], [w("Together") + 0.5, 1], [dur, 1]]; }, dur, 7);
  mention(w("Together"), "all nine firing", "flame");
  counter(s.comp, "liftoff", { keys: [[w("7") - 0.1, 0], [w("kN") + 0.3, 7686]], fmt: fmtThousands("v") + ' + " kN"', pos: [1420, 470], size: 96, color: INK, tOn: w("7"), tOff: dur - 0.2 });
  caption(s.comp, "all nine at liftoff", { pos: [1420, 530], size: 34, font: "Inter-Medium", color: MUTED, tOn: w("7"), tOff: dur - 0.2 });
});

// ---------- B: no fins to steer on the way up; the engines swivel ----------
var tB2 = w("Instead"), tB3 = w("pushing"), tC = w("And");
shot(main, "B no fins", tB, tB2, 12, function (s, dur) {
  var R = engineBooster(s, {}), b = R.b;
  animate(tr(b, "Position"), [[0, s.p(0, 0, 0)], [dur, s.p(0, 10, 0)]]); // climbing
  flames9(s, R.E, function () { return [[0, 1], [dur, 1]]; }, dur, 9);
  s.lights();
  s.cameraPath([[0, [26, 30, 92], [0, 26, 0], 34], [dur, [26, 36, 92], [0, 32, 0], 34]], dur);
  s.hlFins(0, b, null, 0, dur, "no fins to steer", w("fins"), dur);
  caption(s.comp, "fins stay folded on the way up", { id: "folded", pos: [1380, 520], size: 44, color: INK, tOn: w("fins"), tOff: dur - 0.2 });
});
shot(main, "B gimbal", tB2, tB3, 40, function (s, dur) {
  var R = engineBooster(s, { hl: true }), E = R.E;
  flames9(s, E, function () { return [[0, 1], [dur, 1]]; }, dur, 6);
  // Every engine swivels together: +6 deg, -6 deg, back (illustrative "a few degrees").
  var tS = w("swivel");
  for (var i = 0; i < E.length; i++) animate(tr(E[i].gimbal, "Z Rotation"), [[tS - 0.1, 0], [tS + 0.7, 6], [tS + 1.6, -6], [dur, 0]]);
  mention(tS, "engines swivel", "motion");
  s.lights();
  s.cameraPath([[0, [1.2, 0.9, 16.5], [0, 0.3, 0], 40], [dur, [1.4, 0.8, 15.5], [0, 0.3, 0], 40]], dur);
  var hs = []; for (var j = 0; j < E.length; j++) hs.push(E[j].hl);
  pulseAll(hs, "the engines themselves", w("engines", 2), dur, 55);
  s.label({ id: "gimbal", at: [-1.27, 1.6, 0], root: R.b, title: "Gimbal", sub: "each engine swivels a few degrees", align: "left", to: ["A[0] - 160", "A[1] - 170"], tOn: tS, tOff: dur });
});
shot(main, "B tail sideways", tB3, tC, 12, function (s, dur) {
  // Swivelled engines push the tail sideways and the nose turns (pivot at mid-height, one-piece engine block:
  // separately mounted engines don't follow a pivot this many parents deep).
  var pv = s.nul("pivot", [0, 24, 0]);
  var b = s.booster({ assembly: "stowed" });
  b.parent = pv; tr(b, "Position").setValue(s.local(0, -24, 0));
  var ang = function (t) { return 9 * ease((t - 0.3) / (dur - 0.3)); };
  bakeFn(tr(pv, "Z Rotation"), 0, dur, ang);
  // Flames angled a further 6 degrees (the gimbal), placed directly.
  s.flameFree({ id: "tail", at: [0, 0.33, 0], pivot: [0, 24, 0], ang: function (t) { return ang(t) + 6 * ease(t / 0.5); }, len: 12, r: 1.5, keys: [[0, 1], [dur, 1]], tEnd: dur });
  s.lights();
  s.cameraPath([[0, [26, 25, 104], [0, 24, 0], 34], [dur, [26, 25, 102], [0, 24, 0], 34]], dur);
  s.arrow({ id: "tail", at: [-2.2, 1.5, 0], root: b, color: ORANGE, dir: [-130, 0], tOn: w("tail"), tOff: dur - 0.2 });
  s.arrow({ id: "nose", at: [2.0, 46, 0], root: b, color: INK, dir: [130, 0], tOn: w("point"), tOff: dur - 0.2 });
});

// ---------- C: lose one and still make it; coming down, only one ----------
shot(main, "C engine out", tC, END, 40, function (s, dur) {
  var R = engineBooster(s, { hl: true, hlRed: true }), E = R.E;
  s.lights();
  s.cameraPath([[0, UNDER[0], UNDER[1], 40], [dur, [3.1, -10.6, 7.2], UNDER[1], 40]], dur);
  var tLose = w("lose"), tDown = w("Coming"), tOne = w("one", 2);
  var OUT = 3; // the engine that fails (outer ring)
  flames9(s, E, function (i) {
    if (i === OUT) return [[0, 1], [tLose, 1], [tLose + 0.3, 0], [dur, 0]];
    if (i === 0) return [[0, 1], [dur, 1]];
    return [[0, 1], [tDown, 1], [tDown + 0.7, 0], [dur, 0]];
  }, dur, 6);
  pulse(E[OUT].hlRed, tLose, tDown - 0.3, 90, 0.28); pulse(E[OUT].discRed, tLose, tDown - 0.3, 90, 0.28); mention(tLose, "engine out", "highlight");
  s.label({ id: "out", at: [E[OUT].x, 0.4, E[OUT].z], root: R.b, title: "Engine out", sub: "the other eight carry on", align: "right", to: ["A[0] + 230", "A[1] - 150"], color: RED, tOn: tLose + 0.1, tOff: tDown - 0.3 });
  caption(s.comp, "can still reach orbit", { id: "orbit", pos: [960, 1000], size: 44, color: INK, tOn: w("orbit"), tOff: tDown - 0.3 });
  pulse(E[0].hl, tOne - 0.1, dur, 90, 0.28); pulse(E[0].disc, tOne - 0.1, dur, 90, 0.28); mention(tOne - 0.1, "only one of them", "highlight");
  s.label({ id: "only", at: [0, 0.4, 0], root: R.b, title: "Only this one", sub: "for the landing burn", align: "left", to: ["A[0] - 240", "A[1] + 170"], tOn: tOne, tOff: dur });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tB, tB2, tB3, tC]));
writeLn("built 04 Nine: " + END.toFixed(2) + " s");
