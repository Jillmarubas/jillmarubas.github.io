// Cold open: a person on top of the booster, the scale, the landing, "it can't hover", one shot at zero, the title.
// Shots are cut on the script's beats; every visual sits on its spoken word (w()). Plus a 3 s title hold.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/00_cold_open.jsx"
#include "film.jsx"

var HOLD = 3.0; // title hold after the last word (no voice)
var main = chapterComp("00 Cold open");
main.duration = TIMING.duration + HOLD;
var END = main.duration;
var SY = RIG.standY; // booster origin height when standing on its legs
var TOP = SY + 47.7; // interstage rim
var SEA = [0.36, 0.5, 0.62];

function standingBooster(s, o) {
  var b = s.booster(o || {});
  s.legs(1, b);
  s.fins(1, b);
  return b;
}
function seaAndShip(s) {
  s.model("droneship", [0, 0, 0]);
  var sea = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "plane", name: "Sea", width: 6000 * s.S, height: 6000 * s.S, position: s.p(0, -2, 0), baseColor: SEA, roughness: 0.6, metallic: 0 }));
  tr(sea, "X Rotation").setValue(90);
  s.cmd("material.set", { layers: [sea.__id], castsShadows: "off", acceptsShadows: "on" });
}

// ---------- A: the person, then the scale ----------
var tA1 = w("It"); // "It falls out of the sky"
shot(main, "A person on top", 0, tA1, 12, function (s, dur) {
  var b = standingBooster(s, { at: [0, SY, 0] });
  s.model("technician", [0, TOP, 1.75]);
  var bld = s.model("building", [-17, 0, -6]);
  s.floor(0);
  s.lights();
  s.cameraPath([
    [0, [1.3, TOP + 1.3, 5.4], [0, TOP + 1.05, 1.75], 34],
    [w("person") + 0.45, [1.3, TOP + 1.3, 5.4], [0, TOP + 1.05, 1.75], 34], // the pull-back starts right after "person"
    [w("14") + 0.8, [24, 27, 92], [-4, 24, 0], 34, true], // geometric dolly out
    [dur, [25, 26.5, 95], [-4, 24, 0], 34],
  ], dur);
  s.label({ id: "person", at: [0, TOP + 1.6, 1.75], title: "A person", sub: "1.75 m tall", align: "right", to: ["A[0] + 260", "A[1] - 120"], tOn: w("person") - 0.3, tOff: w("And") + 0.3 });
  // "the part of a rocket that came back": the whole booster glows.
  var hs = [s.hl("tank_skin", b), s.hl("interstage", b), s.hl("engine_section", b)];
  for (var i = 0; i < hs.length; i++) hlOn(hs[i], i ? "booster " + i : "the booster", w("rocket"), w("14") - 0.2, 32);
  // "Fourteen storeys tall": the building fades in beside it; the booster's height is marked.
  // The building slides in from the left at full opacity (fading a model in makes it pop at the end).
  animate(tr(bld, "Position"), [[0, s.p(-95, 0, -6)], [w("14") - 0.15, s.p(-95, 0, -6)], [w("14") + 0.75, s.p(-17, 0, -6)]]);
  mention(w("14"), "14-storey building", "model");
  s.dim({ id: "h41", a: [3.6, 0.35, 0], b: [3.6, 41.2, 0], root: b, text: "41 m", offset: [40, 0], textOffset: [80, 0], tOn: w("14"), tOff: dur });
  caption(s.comp, "14 storeys", { id: "14 storeys", pos: [520, 290], size: 46, color: INK, tOn: w("stories"), tOff: dur });
});

// ---------- B: it falls out of the sky and lands on a ship ----------
var tB1 = w("It", 3); // "It gets one shot"
shot(main, "B landing at sea", tA1, tB1, 10, function (s, dur) {
  seaAndShip(s);
  var tl = wEnd("ocean") - 0.15; // touchdown on "ocean"
  var H = 68;
  var b = s.booster({ at: [0, SY + H, 0] });
  bakeFn(tr(b, "Position"), 0, dur, function (t) { var u = Math.min(1, t / tl); return s.p(0, SY + H * (1 - u) * (1 - u), 0); });
  s.fins(1, b);
  s.legs(function (t) { return ease((t - (tl - 2.6)) / 1.8); }, b, "", null, 0, dur);
  s.flame({ id: "landing", at: [0, 0.35, 0], root: b, len: 8, keys: [[0, 0.8], [tl - 0.3, 0.55], [tl + 0.25, 0], [dur, 0]], tEnd: dur });
  s.lights();
  s.cameraPath([[0, [44, 9, 58], [0, 22, 0], 36], [tl, [40, 8, 54], [0, 16, 0], 36], [dur, [38, 8, 52], [0, 17, 0], 36]], dur);
  s.label({ id: "target", at: [-6, 0.2, 9], title: "Landing target", sub: "a ship in the middle of the ocean", align: "left", to: ["A[0] - 60", "A[1] + 150"], tOn: w("target"), tOff: w("Here's") });
  caption(s.comp, "CAN'T HOVER", { id: "can't hover", pos: [960, 560], size: 170, color: ORANGE, tOn: w("can't") , tOff: dur - 0.45 });
});

// ---------- C: one shot at zero speed, zero height; too early; too late ----------
// Constant braking from height H: h = H(1 - u)^2, speed = 2H(1 - u)/T (u = t/T). Illustrative numbers.
function dropSet(s, dur) {
  seaAndShip(s);
  s.lights();
  s.cameraPath([[0, [20, 49, 165], [17, 49, 0], 34], [dur, [20, 48, 158], [17, 48, 0], 34]], dur);
}
function counterFn(comp, id, o) {
  var n = comp.layers.addNull(); n.name = "K_" + id;
  bakeFn(n.property("Effects").addProperty("Slider Control").property("Slider"), 0, o.tEnd, o.fn);
  var t = textLayer(comp, "0", "Inter-ExtraBold", 92, o.color || INK, "left");
  t.name = "N_" + id;
  t.property("Source Text").expression = 'var v = thisComp.layer("K_' + id + '").effect("Slider Control")("Slider"); ' + o.fmt;
  tr(t, "Position").setValue(o.pos);
  animate(tr(t, "Opacity"), [[o.tOn - 0.05, 0], [o.tOn + 0.3, 100], [o.tEnd, 100]]);
  var cap = textLayer(comp, o.caption, "Inter-Medium", 34, MUTED, "left");
  tr(cap, "Position").setValue([o.pos[0], o.pos[1] - 92]);
  animate(tr(cap, "Opacity"), [[o.tOn - 0.05, 0], [o.tOn + 0.3, 100], [o.tEnd, 100]]);
  mention(o.tOn, id, "counter");
}
var tC2 = w("Too") - 0.25, tC3 = w("Too", 2) - 0.25, tD = w("So") - 0.2;
shot(main, "C one shot", tB1, tC2, 10, function (s, dur) {
  dropSet(s, dur);
  var H = 110, T = wEnd("height") + 0.1;
  var hAt = function (t) { var u = Math.min(1, t / T); return H * (1 - u) * (1 - u); };
  var vAt = function (t) { var u = Math.min(1, t / T); return 2 * H * (1 - u) / T; };
  var b = s.booster({ at: [0, SY + H, 0] });
  bakeFn(tr(b, "Position"), 0, dur, function (t) { return s.p(0, SY + hAt(t), 0); });
  s.legs(1, b); s.fins(1, b);
  s.flame({ id: "one shot", at: [0, 0.35, 0], root: b, len: 8, keys: [[0, 0.75], [T - 0.2, 0.6], [T + 0.25, 0], [dur, 0]], tEnd: dur });
  counterFn(s.comp, "speed", { fn: vAt, fmt: 'Math.round(v) + " m/s"', caption: "SPEED", pos: [1180, 470], color: INK, tOn: w("speed"), tEnd: dur });
  counterFn(s.comp, "height", { fn: hAt, fmt: 'Math.round(v) + " m"', caption: "HEIGHT", pos: [1180, 720], color: INK, tOn: w("height"), tEnd: dur });
});
shot(main, "C too early", tC2, tC3, 10, function (s, dur) {
  dropSet(s, dur);
  // Brakes too soon: stops ~45 m up, and the thrust that is left pushes it back up.
  var H = 70, v0 = 40, tStop = w("flies") + 0.05, a = v0 / tStop;
  var hAt = function (t) { return H - v0 * t + 0.5 * a * t * t; };
  var b = s.booster({ at: [0, SY + H, 0] });
  bakeFn(tr(b, "Position"), 0, dur, function (t) { return s.p(0, SY + hAt(t), 0); });
  s.legs(1, b); s.fins(1, b);
  s.flame({ id: "too early", at: [0, 0.35, 0], root: b, len: 8, keys: [[0, 0.9], [dur, 0.9]], tEnd: dur });
  caption(s.comp, "TOO EARLY", { id: "too early", pos: [1380, 520], size: 96, color: ORANGE, tOn: w("early"), tOff: dur - 0.3 });
  s.arrow({ id: "back up", at: [5, 30, 0], root: b, color: ORANGE, dir: [0, -150], tOn: w("flies"), tOff: dur - 0.3 });
});
shot(main, "C too late", tC3, tD, 10, function (s, dur) {
  dropSet(s, dur);
  // Brakes too late: hits the deck still falling at ~60 m/s, then topples.
  var H = 80, v0 = 70, tb = w("late") + 0.05, a = 8;
  var tHit = tb + (v0 - Math.sqrt(v0 * v0 - 4 * a / 2 * (H - v0 * tb))) / a;
  var hAt = function (t) { if (t < tb) return H - v0 * t; var x = t - tb; return Math.max(0, H - v0 * tb - v0 * x + 0.5 * a * x * x); };
  var b = s.booster({ at: [0, SY + H, 0], assembly: "landed" });
  bakeFn(tr(b, "Position"), 0, dur, function (t) { return s.p(0, SY + hAt(t), 0); });
  bakeFn(tr(b, "Z Rotation"), 0, dur, function (t) { return -24 * ease((t - tHit) / 1.1) * ease((t - tHit) / 0.6); });
  s.flame({ id: "too late", at: [0, 0.35, 0], root: b, len: 8, keys: [[0, 0.2], [tb, 0.2], [tb + 0.25, 1], [tHit, 1], [tHit + 0.15, 0], [dur, 0]], tEnd: dur });
  caption(s.comp, "TOO LATE", { id: "too late", pos: [1380, 520], size: 96, color: RED, tOn: w("late"), tOff: dur - 0.3 });
  mention(tHit, "crash", "motion");
});

// ---------- D: how does it do the maths? Take it apart. Title. ----------
shot(main, "D take it apart", tD, END, 12, function (s, dur) {
  var b = s.booster({ at: [0, SY, 0], cut: true, fill: 1 });
  s.legs(1, b, "", [0, 2, 3]);
  s.fins(1, b, "", [2, 3]);
  s.floor(0);
  s.lights();
  var tApart = w("apart");
  s.cameraPath([
    [0, [12, 27, 84], [0, 25, 0], 34],
    [tApart, [9, 26, 70], [0, 25, 0], 34],
    [tApart + 2.2, [-10, 26, 66], [-13, 25, 0], 34],
    [dur, [-10.5, 26, 64], [-13, 25, 0], 34],
  ], dur);
  caption(s.comp, "v² = 2ad", { id: "the maths", pos: [500, 560], size: 150, color: INK, tOn: w("maths"), tOff: w("take") - 0.4 });
  var seams = s.hl("weld_seams", b);
  hlOn(seams, "seams", w("take"), tApart + 0.05, 90);
  s.openCut(tApart, 1.8);
  mention(tApart, "skin opens", "motion");
  var tT = tApart + 0.6;
  caption(s.comp, "How SpaceX Lands a Rocket", { id: "title", pos: [600, 470], size: 78, color: INK, just: "center", tOn: tT, tOff: dur - 0.6 });
  caption(s.comp, "That Can't Hover", { pos: [600, 575], size: 92, color: ORANGE, just: "center", tOn: tT + 0.25, tOff: dur - 0.6 });
  caption(s.comp, "TEARDOWN LAB", { pos: [600, 680], size: 30, font: "Inter-SemiBold", color: MUTED, just: "center", tOn: tT + 0.5, tOff: dur - 0.6 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tA1, tB1, tC2, tC3, tD]));
writeLn("built 00 Cold open: " + END.toFixed(2) + " s");
