// Chapter 6: THE WAY HOME. Nitrogen thrusters flip it; three engines burn it back; grid fins unfold and steer;
// the entry burn; the 2018 fin failure (cold, grey); ours glides in toward a small target.
// Colour arc: space black -> deep blue -> thicker blue air with heat -> grey for the failure -> clean light.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/06_way_home.jsx"
#include "film.jsx"

var main = chapterComp("06 Way home");
var END = main.duration;
var SPACE = [0.035, 0.05, 0.09], HIGH = [0.08, 0.13, 0.26], AIR = [0.3, 0.45, 0.66], GREY = [0.5, 0.52, 0.54], DAY = [0.8, 0.87, 0.94];
var LIGHT_TXT = [0.86, 0.89, 0.94];
function pivoted(s, opts) {
  var pv = s.nul("pivot", [0, 24, 0]);
  var b = s.booster(opts || {});
  b.parent = pv; tr(b, "Position").setValue(s.local(0, -24, 0));
  return { pv: pv, b: b };
}

// ---------- A: nitrogen thrusters flip it ----------
var tB = w("Then"), tC = w("Then", 2), tD = w("Now"), tE = w("But"), tF = w("Ours");
shot(main, "A flip", 0, tB, 20, function (s, dur) {
  backdrop(s.comp, SPACE, [[0, 100], [dur, 100]], "Space");
  var R = pivoted(s, { assembly: "stowed" }), b = R.b;
  s.lights();
  var tN = w("nitrogen"), tFlip = w("flip");
  s.cameraPath([[0, [7, 46.5, 15], [0, 44.2, 0], 38], [tFlip - 0.4, [7.4, 46.2, 15.6], [0, 44.2, 0], 38], [tFlip + 0.6, [30, 30, 92], [0, 24, 0], 34, true], [dur, [30, 30, 92], [0, 24, 0], 34]], dur);
  var hT = s.hl("thrusters", b);
  hlOn(hT, "nitrogen thrusters", tN, tFlip + 0.6);
  s.label({ id: "n2", at: [1.95, 44.2, 0.3], root: b, title: "Nitrogen thrusters", sub: "near the top", align: "right", to: ["A[0] + 220", "A[1] - 160"], color: N2C, tOn: tN, tOff: tFlip - 0.2 });
  // Puffs of nitrogen from both pods.
  for (var side = -1; side <= 1; side += 2) s.flow({ id: "puff " + side, a: [side * 2.1, 44.4, 0.25], b: [side * 3.8, 44.6, 0.5], color: N2C, n: 6, r: 0.09, speed: 1.2, tOn: w("puff"), tOff: tFlip + 0.1 });
  // End over end: it pitches over until it lies engines-forward for the boostback.
  animate(tr(R.pv, "Z Rotation"), [[tFlip - 0.1, 0], [dur - 0.2, -100]]); // engines swing round to point forward (right)
  mention(tFlip, "flip end over end", "motion");
});

// ---------- B: boostback ----------
shot(main, "B boostback", tB, tC, 12, function (s, dur) {
  backdrop(s.comp, SPACE, [[0, 100], [dur, 100]], "Space");
  // One-piece engine block here: separately mounted engines don't follow a pivot this many parents deep.
  var R = pivoted(s, { assembly: "stowed" }), b = R.b;
  tr(R.pv, "Z Rotation").setValue(-100);
  var three = [0, 1, 5]; // centre and two opposite outer engines
  var tE3 = w("three"), tLit = w("relight");
  var h3 = s.hl("engines_three", b);
  hlOn(h3, "three engines", tE3, w("forward") + 0.4);
  for (var j = 0; j < 3; j++) { var ep = RIG.engines[three[j]].pos; s.flameFree({ id: "boostback " + j, at: [ep[0], ep[1] - 0.02, ep[2]], pivot: [0, 24, 0], ang: -100, len: 9, r: 0.4, keys: [[0, 0], [tLit - 0.05, 0], [tLit + 0.4, 1], [dur, 1]], tEnd: dur }); }
  mention(tLit, "relight", "flame");
  s.lights();
  s.cameraPath([[0, [6, 30, 96], [-2, 24, 0], 34], [dur, [6, 30, 92], [-2, 24, 0], 34]], dur);
  // Forward speed (to the right) shrinks; then the way back to the landing site (left).
  s.arrow({ id: "forward speed", at: [10, 30, 0], color: LIGHT_TXT, dir: [220, 0], width: 10, tOn: w("forward"), tOff: w("send") });
  caption(s.comp, "forward speed", { pos: [1420, 360], size: 38, color: LIGHT_TXT, tOn: w("forward"), tOff: w("send") });
  s.arrow({ id: "back to the landing site", at: [-12, 30, 0], color: ORANGE, dir: [-220, 0], width: 10, tOn: w("back"), tOff: dur - 0.2 });
  caption(s.comp, "back to the landing site", { pos: [520, 360], size: 38, color: ORANGE, tOn: w("back"), tOff: dur - 0.2 });
  caption(s.comp, "BOOSTBACK BURN", { id: "boostback", pos: [960, 940], size: 64, color: WHITE, tOn: w("boostback"), tOff: dur - 0.2 });
});

// ---------- C: grid fins unfold, titanium waffles, tilt and steer ----------
shot(main, "C grid fins", tC, tD, 30, function (s, dur) {
  backdrop(s.comp, HIGH, [[0, 100], [dur, 100]], "High atmosphere");
  var b = s.booster({});
  var tU = w("unfold");
  var finK = function (t) { return ease((t - tU + 0.3) / 1.1); };
  var fins = s.fins(finK, b, "", null, 0, dur);
  var hf = s.hlFins(finK, b, null, 0, dur, "grid fins", w("grid"), w("As") - 0.2);
  s.legs(0, b);
  s.lights();
  // Tilt and steer: each fin rolls a few degrees about its own arm.
  var tT = w("tilt");
  var tilt = function (t) { return 12 * Math.sin((t - tT) * 3.2) * ease((t - tT) / 0.4); };
  for (var i = 0; i < fins.length; i++) { bakeFn(tr(fins[i], "X Rotation"), 0, dur, tilt); bakeFn(tr(hf[i], "X Rotation"), 0, dur, tilt); }
  mention(tT, "tilt and steer", "motion");
  s.cameraPath([
    [0, [8, 46, 18], [0, 42.2, 0], 38],
    [w("shaped") - 0.3, [8, 46, 18], [0, 42.2, 0], 38],
    [w("shaped") + 1.0, [3.4, 43.4, 6.4], [1.6, 41.6, 1.6], 40], // close on one fin's lattice
    [w("they") - 0.3, [3.4, 43.4, 6.4], [1.6, 41.6, 1.6], 40],
    [w("they") + 1.0, [8, 46, 18], [0, 42.2, 0], 38],
    [dur, [8.2, 45.8, 18.6], [0, 42.2, 0], 38],
  ], dur);
  s.label({ id: "fins", at: [2.3, 41.6, 2.3], root: b, title: "Grid fins", sub: "single-piece titanium", align: "right", to: ["A[0] + 220", "A[1] - 170"], tOn: w("grid"), tOff: w("shaped") - 0.3 });
  caption(s.comp, "a waffle-shaped lattice", { id: "waffle", pos: [960, 980], size: 46, color: LIGHT_TXT, tOn: w("waffle"), tOff: w("As") });
  // Air rushing up through the fins as it falls engines-first.
  for (var k = 0; k < 4; k++) { var a = Math.PI / 4 + k * Math.PI / 2, rr = 2.6; s.flow({ id: "air " + k, a: [Math.cos(a) * rr, 38.5, Math.sin(a) * rr], b: [Math.cos(a) * rr, 45.5, Math.sin(a) * rr], color: [0.9, 0.95, 1], n: 7, r: 0.05, speed: 1.1, tOn: w("air"), tOff: dur - 0.3 }); }
  caption(s.comp, "steers like a skydiver's hands", { id: "skydiver", pos: [960, 980], size: 46, color: LIGHT_TXT, tOn: w("skydiver's"), tOff: dur - 0.2 });
});

// ---------- D: falling engines-first into thicker air; the entry burn ----------
shot(main, "D entry burn", tD, tE, 12, function (s, dur) {
  backdrop(s.comp, AIR, [[0, 0], [1.5, 100], [dur, 100]], "Thicker air");
  backdrop(s.comp, HIGH, [[0, 100], [dur, 100]], "High atmosphere");
  var b = s.booster({ ownEngines: true });
  s.fins(1, b); s.legs(0, b);
  var E = s.engines9(b, { hl: true });
  var three = [0, 1, 5], tF3 = w("three", 2), tFire = w("fires");
  for (var i = 0; i < 3; i++) pulse(E[three[i]].hl, tF3, w("entry") + 0.6, 85, 0.28);
  mention(tF3, "three engines again", "highlight");
  // The flames widen into a shield of exhaust on "shield".
  for (var j = 0; j < 3; j++) s.flame({ id: "entry " + j, at: [0, -GIMBAL_UP + 0.33, 0], root: E[three[j]].gimbal, len: 11, r: 0.5, keys: [[0, 0], [tFire - 0.05, 0], [tFire + 0.4, 0.8], [w("shield"), 0.8], [w("shield") + 0.5, 1], [dur, 1]], tEnd: dur });
  mention(tFire, "entry burn fires", "flame");
  // Speed streaks past the booster (it is falling fast).
  for (var k = 0; k < 5; k++) s.flow({ id: "streak " + k, a: [-9 + k * 4.5, -6, -6 - k], b: [-9 + k * 4.5, 52, -6 - k], color: [0.92, 0.95, 1], n: 6, r: 0.12, speed: 1.6, tOn: w("falling") - 0.2, tOff: dur });
  mention(w("falling"), "falling fast", "flow");
  // Heat glow at the engine end.
  var glow = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "sphere", name: "heat", radius: 2.4 * s.S, segments: 24, rings: 14, baseColor: [1, 0.45, 0.15], emissive: [1, 0.4, 0.1], castsShadows: "off", acceptsShadows: "off" }));
  glow.parent = b; tr(glow, "Position").setValue(s.local(0, 0.4, 0));
  animate(tr(glow, "Opacity"), [[0, 0], [w("Engines", 2) - 0.1, 0], [w("Engines", 2) + 0.6, 45], [tFire, 45], [tFire + 0.6, 20], [dur, 20]]);
  mention(w("Engines", 2), "engines first, hot", "glow");
  s.lights();
  s.cameraPath([[0, [24, 18, 84], [0, 20, 0], 34], [dur, [22, 16, 80], [0, 18, 0], 34]], dur);
  caption(s.comp, "ENTRY BURN", { id: "entry burn", pos: [1420, 470], size: 72, color: WHITE, tOn: w("entry"), tOff: dur - 0.2 });
  caption(s.comp, "≈ 70 km → 40 km up", { pos: [1420, 545], size: 36, font: "Inter-Medium", color: LIGHT_TXT, tOn: w("entry") + 0.2, tOff: dur - 0.2 });
  s.label({ id: "shield", at: [0, -4, 0], root: b, title: "A shield of exhaust", align: "left", to: ["A[0] - 220", "A[1] + 140"], tOn: w("shield"), tOff: dur - 0.2 });
  caption(s.comp, "sharp slowdown", { id: "slowdown", pos: [1420, 640], size: 44, color: ORANGE, tOn: w("sharp"), tOff: dur - 0.2 });
});

// ---------- E: the 2018 failure (cold, grey) ----------
shot(main, "E 2018", tE, tF, 12, function (s, dur) {
  backdrop(s.comp, GREY, [[0, 100], [dur, 100]], "Grey");
  var pv = s.nul("pivot", [0, 52, 0]);
  var b = s.booster({ assembly: "finsout" });
  b.parent = pv; tr(b, "Position").setValue(s.local(0, -24, 0));
  var sea = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "plane", name: "Sea", width: 6000 * s.S, height: 6000 * s.S, position: s.p(0, 0, 0), baseColor: [0.36, 0.42, 0.47], roughness: 0.7 }));
  tr(sea, "X Rotation").setValue(90);
  s.lights();
  var tPump = w("hydraulic"), tFroze = w("froze"), tSpun = w("spun");
  // Fins freeze; it starts to spin (in the frame's plane) and falls into the sea, short of the coast.
  animate(tr(pv, "Z Rotation"), [[tSpun - 0.6, 0], [dur, 210]]);
  animate(tr(pv, "Position"), [[0, s.p(0, 52, 0)], [tSpun - 0.6, s.p(0, 46, 0)], [dur - 0.4, s.p(-18, 4, 0)]]);
  mention(tSpun, "spun into the ocean", "motion");
  s.cameraPath([[0, [30, 40, 120], [0, 40, 0], 34], [dur, [32, 30, 130], [-4, 28, 0], 34]], dur);
  caption(s.comp, "2018", { id: "2018", pos: [300, 200], size: 96, color: WHITE, tOn: w("2018"), tOff: dur - 0.3 });
  // The fin highlight rides on the booster root (fin 1 sits at yaw -45 deg; root turns in Z only).
  var hf = s.hl("fins_out", b); // all four fins as one rigid highlight, so it turns with the booster
  hlOn(hf, "hydraulic pump (grid fins)", tPump, tFroze + 1.0, 90);
  s.label({ id: "pump", at: [1.9, 41.6, 1.3], root: b, title: "Grid-fin hydraulic pump", sub: "stalled", align: "right", to: ["A[0] + 200", "A[1] - 160"], color: RED, tOn: tPump, tOff: tFroze + 1.0 });
  caption(s.comp, "fins frozen", { id: "froze", pos: [1500, 820], size: 56, color: RED, tOn: tFroze, tOff: dur - 0.3 });
});

// ---------- F: ours is fine; gliding toward a small target; now it has to stop ----------
shot(main, "F ours", tF, END, 10, function (s, dur) {
  backdrop(s.comp, DAY, [[0, 100], [dur, 100]], "Day");
  s.model("droneship", [0, 0, 0]);
  var sea = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "plane", name: "Sea", width: 8000 * s.S, height: 8000 * s.S, position: s.p(0, -2, 0), baseColor: [0.36, 0.5, 0.62], roughness: 0.6 }));
  tr(sea, "X Rotation").setValue(90);
  var b = s.booster({ at: [0, 420, 0] });
  var fins = s.fins(1, b); s.legs(0, b);
  bakeFn(tr(b, "Position"), 0, dur, function (t) { return s.p(0, 420 - 180 * t / dur, 0); });
  var hf = s.hlFins(1, b, null, 0, dur, "steering with its fins", w("steering"), w("falling", 2) + 0.3);
  var trim = function (t) { return 4 * Math.sin(t * 1.7) + 2 * Math.sin(t * 3.1); };
  for (var i = 0; i < fins.length; i++) { bakeFn(tr(fins[i], "X Rotation"), 0, dur, trim); bakeFn(tr(hf[i], "X Rotation"), 0, dur, trim); }
  s.lights();
  // Looking down past the booster at the ship far below; the target ring is tiny.
  // The camera rides alongside, a little above, looking down past the booster to the ship far below.
  var yb = function (t) { return 420 - 180 * t / dur; };
  var cam = s.camera([30, 438, 70], [0, 190, 0], 40);
  bakeFn(tr(cam, "Position"), 0, dur, function (t) { return s.p(30, yb(t) + 18, 70); });
  bakeFn(tr(cam, "Point of Interest"), 0, dur, function (t) { var u = ease((t - w("toward", 2) + 0.3) / 1.6); return s.p(0, yb(t) * (0.55 - 0.45 * u), 0); });
  caption(s.comp, "hundreds of m/s", { id: "hundreds", pos: [1420, 470], size: 54, color: INK, tOn: w("hundreds"), tOff: w("toward", 2) + 0.3 });
  s.label({ id: "target", at: [0, 0.2, 0], title: "Landing target", sub: "a few dozen metres wide", align: "right", to: ["A[0] + 230", "A[1] - 160"], tOn: w("target"), tOff: w("stop") - 0.6 });
  caption(s.comp, "now it has to stop", { id: "stop", pos: [960, 960], size: 50, color: INK, tOn: w("stop"), tOff: dur - 0.2 });
  caption(s.comp, "lowest setting ≈ 482 kN: too strong to hover", { id: "can't hover (482 kN)", pos: [960, 1030], size: 36, color: RED, font: "Inter-SemiBold", tOn: w("can't"), tOff: dur - 0.2 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tB, tC, tD, tE, tF]));
writeLn("built 06 Way home: " + END.toFixed(2) + " s");
