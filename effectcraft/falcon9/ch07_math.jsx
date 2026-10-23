// Chapter 7: THE MATHS OF LANDING. Thrust vs weight; why it can't hover; v² = 2·a·d built symbol by symbol;
// the worked example (labelled EXAMPLE); the twist (lighter -> brakes harder); both numbers reach zero; touchdown.
// Then 1.8 s of silence on the landed booster.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/07a_math.jsx"
#include "film.jsx"

var HOLD = 1.8;
var main = chapterComp("07 Math");
main.duration = TIMING.duration + HOLD;
var END = main.duration;
var SY = RIG.standY;
var VC = [0.12, 0.13, 0.16], AC = ORANGE, DC = [0.22, 0.55, 0.42]; // v, a, d: one colour each, used everywhere

// ---------- A: thrust vs weight ----------
var tB = w("So"), tC = w("maths") - 0.2, tD = w("Say"), tE = w("twist") - 0.5, tF = w("last") - 0.3;
shot(main, "A thrust vs weight", 0, tB, 12, function (s, dur) {
  var b = s.booster({ at: [0, 8, 0], assembly: "finsout" });
  var hc = s.hl("engine_centre", b);
  hlOn(hc, "one engine", w("one"), dur, 85);
  s.flame({ id: "minimum", at: [0, 0.35, 0], root: b, len: 7, r: 0.5, keys: [[0, 0.56], [dur, 0.56]], tEnd: dur });
  s.lights();
  s.cameraPath([[0, [26, 30, 112], [16, 26, 0], 34], [dur, [26, 30, 108], [16, 26, 0], 34]], dur); // booster left, numbers right
  // Arrows to scale: 482 kN up, 250 kN down (1 kN = 0.6 px).
  s.arrow({ id: "thrust 482 kN", at: [5, 14, 0], root: b, color: AC, dir: [0, -482 * 0.6], width: 16, head: 40, tOn: w("482"), tOff: dur - 0.2 });
  caption(s.comp, "THRUST  482 kN", { pos: [1420, 300], size: 52, color: AC, tOn: w("482"), tOff: dur - 0.2 });
  caption(s.comp, "one engine, lowest setting", { pos: [1420, 352], size: 30, font: "Inter-Medium", color: MUTED, tOn: w("482"), tOff: dur - 0.2 });
  s.arrow({ id: "weight 250 kN", at: [-5, 32, 0], root: b, color: VC, dir: [0, 250 * 0.6], width: 16, head: 40, tOn: w("250"), tOff: dur - 0.2 });
  caption(s.comp, "WEIGHT  ≈ 250 kN", { pos: [1420, 760], size: 52, color: VC, tOn: w("250"), tOff: dur - 0.2 });
  caption(s.comp, "almost-empty booster", { pos: [1420, 812], size: 30, font: "Inter-Medium", color: MUTED, tOn: w("250"), tOff: dur - 0.2 });
  caption(s.comp, "≈ 2×", { id: "twice", pos: [1420, 560], size: 120, color: INK, tOn: w("twice"), tOff: dur - 0.2 });
});

// ---------- B: it would go back up; zero speed at zero height; hoverslam ----------
shot(main, "B can't hold still", tB, tC, 10, function (s, dur) {
  s.model("droneship", [0, 0, 0]);
  var b = s.booster({ at: [0, SY + 60, 0], assembly: "landed" });
  // Slows to a stop at 60 m... and climbs back up (thrust > weight).
  var tStop = w("stop") + 0.2, tUp = w("up") + 0.6;
  bakeFn(tr(b, "Position"), 0, dur, function (t) {
    var h = t < tStop ? 60 + 30 * Math.pow(1 - t / tStop, 2) : 60 + 26 * ease((t - tStop) / (tUp + 1.2 - tStop));
    return s.p(0, SY + h, 0);
  });
  s.flame({ id: "too strong", at: [0, 0.35, 0], root: b, len: 7, r: 0.5, keys: [[0, 0.7], [dur, 0.7]], tEnd: dur });
  mention(tStop, "stops in mid-air, goes back up", "motion");
  s.lights();
  s.cameraPath([[0, [34, 80, 200], [8, 78, 0], 34], [dur, [34, 78, 196], [8, 74, 0], 34]], dur);
  s.arrow({ id: "back up", at: [5, 40, 0], root: b, color: RED, dir: [0, -150], tOn: w("back"), tOff: w("can't") + 0.6 });
  caption(s.comp, "can't hold still", { id: "can't hold still", pos: [1420, 520], size: 60, color: RED, tOn: w("can't"), tOff: w("has") - 0.1 });
  caption(s.comp, "zero speed", { id: "zero speed", pos: [1420, 470], size: 60, color: INK, tOn: w("zero"), tOff: dur - 0.3 });
  caption(s.comp, "at zero height", { id: "zero height", pos: [1420, 560], size: 60, color: INK, tOn: w("zero", 2), tOff: dur - 0.3 });
  caption(s.comp, "HOVERSLAM", { id: "hoverslam", pos: [960, 930], size: 110, color: ORANGE, tOn: w("hover"), tOff: dur - 0.3 });
});

// ---------- C: one line of school physics, symbol by symbol ----------
shot(main, "C the formula", tC, tD, 10, function (s, dur) {
  var b = s.booster({ at: [-26, 40, 0], assembly: "landed" });
  s.flame({ id: "braking", at: [0, 0.35, 0], root: b, len: 7, r: 0.5, keys: [[0, 0.8], [dur, 0.8]], tEnd: dur });
  s.lights();
  s.cameraPath([[0, [-8, 44, 172], [-6, 42, 0], 34], [dur, [-8, 44, 168], [-6, 42, 0], 34]], dur);
  var y = 520, sz = 150;
  caption(s.comp, "v²", { id: "speed squared", pos: [1010, y], size: sz, color: VC, tOn: w("Speed", 2), tOff: dur - 0.2 });
  caption(s.comp, "= 2", { id: "equals two", pos: [1220, y], size: sz, color: INK, tOn: w("2"), tOff: dur - 0.2 });
  caption(s.comp, "·a", { id: "times the braking", pos: [1410, y], size: sz, color: AC, tOn: w("braking"), tOff: dur - 0.2 });
  caption(s.comp, "·d", { id: "times the distance", pos: [1570, y], size: sz, color: DC, tOn: w("distance"), tOff: dur - 0.2 });
  caption(s.comp, "speed", { pos: [1010, y + 80], size: 30, font: "Inter-SemiBold", color: VC, tOn: w("Speed", 2), tOff: dur - 0.2 });
  caption(s.comp, "braking", { pos: [1410, y + 80], size: 30, font: "Inter-SemiBold", color: AC, tOn: w("braking"), tOff: dur - 0.2 });
  caption(s.comp, "distance", { pos: [1570, y + 80], size: 30, font: "Inter-SemiBold", color: DC, tOn: w("distance"), tOff: dur - 0.2 });
  // Each symbol is tied to the booster: v = the fall (down), a = the braking (up), d = height to the deck.
  s.arrow({ id: "v arrow", at: [2.6, 30, 0], root: b, color: VC, dir: [0, 160], width: 12, tOn: w("Speed", 2), tOff: dur - 0.2 });
  s.arrow({ id: "a arrow", at: [-2.6, 12, 0], root: b, color: AC, dir: [0, -160], width: 12, tOn: w("braking"), tOff: dur - 0.2 });
  s.dim({ id: "d height", a: [-31, 0, 0], b: [-31, 40, 0], text: "d", color: DC, offset: [0, 0], textOffset: [-40, 0], tOn: w("distance"), tOff: dur - 0.2 });
  caption(s.comp, "EXAMPLE NEXT", { pos: [1290, 900], size: 30, font: "Inter-SemiBold", color: MUTED, tOn: w("example"), tOff: dur - 0.2 });
});

// ---------- D: the example; light it at exactly that height ----------
// Counters for the rest of the chapter follow one braking profile from ignition (1,600 m, 250 m/s) to
// touchdown: v = 250(1-u), h = 1600(1-u)^2. Slowed down to fit the explanation (labelled).
var tIgn = w("lights"), tLand = w("hit", 2) + 0.3;
function prof(t) { var u = Math.max(0, Math.min(1, (t - tIgn) / (tLand - tIgn))); return { v: 250 * (1 - u), h: 1600 * (1 - u) * (1 - u) }; }
shot(main, "D example", tD, tE, 10, function (s, dur) {
  var b = s.booster({ at: [-24, 22, 0], assembly: "landed" });
  var ti = tIgn - OFFSET;
  s.flame({ id: "lights", at: [0, 0.35, 0], root: b, len: 8, r: 0.5, keys: [[0, 0], [ti - 0.05, 0], [ti + 0.4, 1], [dur, 1]], tEnd: dur });
  mention(ti, "lights the engine", "flame");
  s.lights();
  s.cameraPath([[0, [-8, 42, 168], [-6, 40, 0], 34], [dur, [-8, 42, 164], [-6, 40, 0], 34]], dur);
  caption(s.comp, "EXAMPLE", { pos: [1300, 250], size: 34, font: "Inter-SemiBold", color: MUTED, tOn: w("Say"), tOff: dur - 0.2 });
  caption(s.comp, "v = 250 m/s", { id: "250 m/s", pos: [1300, 380], size: 80, color: VC, tOn: w("250", 2), tOff: dur - 0.2 });
  caption(s.comp, "a = 2g ≈ 19.6 m/s²", { id: "2g", pos: [1300, 500], size: 66, color: AC, tOn: w("twice", 2), tOff: dur - 0.2 });
  caption(s.comp, "d = 250² ÷ (2 × 19.6) ≈ 1,600 m", { id: "1.6 km", pos: [1300, 620], size: 50, color: DC, tOn: w("1"), tOff: dur - 0.2 });
  caption(s.comp, "light the engine here", { id: "that height", pos: [1300, 760], size: 46, color: INK, tOn: w("height", 2), tOff: dur - 0.2 });
  caption(s.comp, "1 s late = 250 m less to stop in", { id: "a second", pos: [1300, 860], size: 40, color: RED, tOn: w("late"), tOff: dur - 0.2 });
});

// ---------- E: the twist: lighter, so it brakes harder; the computer re-solves it ----------
shot(main, "E the twist", tE, tF, 10, function (s, dur) {
  var b = s.booster({ at: [-24, 22, 0], assembly: "landed" });
  s.flame({ id: "burning", at: [0, 0.35, 0], root: b, len: 8, r: 0.5, keys: [[0, 1], [dur, 1]], tEnd: dur });
  s.lights();
  s.cameraPath([[0, [-8, 42, 168], [-6, 40, 0], 34], [dur, [-8, 42, 164], [-6, 40, 0], 34]], dur);
  var T = function (t) { return t + OFFSET; };
  caption(s.comp, "a = T ÷ m − g", { id: "twist formula", pos: [1300, 300], size: 84, color: AC, tOn: w("twist"), tOff: dur - 0.2 });
  // Mass falls as it burns (illustrative 30 t -> 25 t), so braking rises at the same thrust.
  hbar(s.comp, "mass", { x: 1040, y: 430, w: 520, h: 24, color: VC, fn: function (t) { return 1 - 0.17 * ease((t - (w("burns") - 0.1)) / 6); }, tOn: w("burns"), tOff: dur - 0.2, tEnd: dur });
  caption(s.comp, "mass  m  (lighter every second)", { pos: [1300, 480], size: 30, font: "Inter-SemiBold", color: VC, tOn: w("burns"), tOff: dur - 0.2 });
  hbar(s.comp, "braking", { x: 1040, y: 560, w: 520, h: 24, color: AC, fn: function (t) { return 0.62 + 0.25 * ease((t - (w("burns") - 0.1)) / 6); }, tOn: w("harder"), tOff: dur - 0.2, tEnd: dur });
  caption(s.comp, "braking  a  (harder every second)", { pos: [1300, 610], size: 30, font: "Inter-SemiBold", color: AC, tOn: w("harder"), tOff: dur - 0.2 });
  // Throttle nudged between its limits (482-854 kN) as the computer re-solves the landing.
  hbar(s.comp, "throttle", { x: 1040, y: 720, w: 520, h: 24, color: ORANGE, fn: function (t) { return 0.62 + 0.06 * Math.sin(T(t) * 2.1) + 0.03 * Math.sin(T(t) * 5.3); }, tOn: w("nudging"), tOff: dur - 0.2, tEnd: dur });
  caption(s.comp, "throttle, nudged many times a second", { id: "re-runs the maths", pos: [1300, 770], size: 30, font: "Inter-SemiBold", color: INK, tOn: w("reruns"), tOff: dur - 0.2 });
  // Both numbers on their way to zero together.
  counter(s.comp, "speedE", { keys: (function () { var k = []; for (var t = 0; t <= dur; t += 0.25) k.push([t, prof(t + OFFSET).v]); return k; })(), fmt: 'Math.round(v) + " m/s"', pos: [1150, 930], size: 56, color: VC, tOn: w("both"), tOff: dur });
  counter(s.comp, "heightE", { keys: (function () { var k = []; for (var t = 0; t <= dur; t += 0.25) k.push([t, prof(t + OFFSET).h]); return k; })(), fmt: 'Math.round(v) + " m"', pos: [1450, 930], size: 56, color: DC, tOn: w("both"), tOff: dur });
  caption(s.comp, "slowed down", { pos: [1300, 990], size: 24, font: "Inter-Medium", color: MUTED, tOn: w("both"), tOff: dur });
});

// ---------- F: legs swing down and lock; both hit zero; touchdown; silence ----------
shot(main, "F touchdown", tF, END, 10, function (s, dur) {
  s.model("droneship", [0, 0, 0]);
  var tl = tLand - OFFSET;
  var b = s.booster({ at: [0, SY + 40, 0] });
  bakeFn(tr(b, "Position"), 0, dur, function (t) { var h = prof(t + OFFSET).h; return s.p(0, SY + h * 40 / Math.max(1, prof(OFFSET).h), 0); });
  var legK = function (t) { return ease((t - (w("legs") - 0.1)) / 1.3); };
  s.fins(1, b); s.legs(legK, b, "", null, 0, dur);
  s.hlLegs(legK, b, null, 0, dur, "legs swing down and lock", w("legs"), w("both", 2) - 0.1);
  s.flame({ id: "landing", at: [0, 0.35, 0], root: b, len: 7, r: 0.5, keys: [[0, 0.8], [tl - 0.2, 0.6], [tl + 0.15, 0], [dur, 0]], tEnd: dur });
  mention(tl, "touchdown", "motion");
  s.lights();
  s.cameraPath([[0, [26, 26, 92], [0, 22, 0], 34], [tl, [26, 22, 90], [0, 20, 0], 34], [dur, [27, 22, 92], [0, 20, 0], 34]], dur);
  counter(s.comp, "speedF", { keys: (function () { var k = []; for (var t = 0; t <= dur; t += 0.2) k.push([t, prof(t + OFFSET).v]); return k; })(), fmt: 'Math.round(v) + " m/s"', pos: [1400, 420], size: 80, color: VC, tOn: 0.05, tOff: dur - 0.2 });
  counter(s.comp, "heightF", { keys: (function () { var k = []; for (var t = 0; t <= dur; t += 0.2) k.push([t, prof(t + OFFSET).h]); return k; })(), fmt: 'Math.round(v) + " m"', pos: [1400, 560], size: 80, color: DC, tOn: 0.05, tOff: dur - 0.2 });
  caption(s.comp, "together", { id: "together", pos: [1400, 680], size: 54, color: ORANGE, tOn: w("Together", 2), tOff: dur - 0.2 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tB, tC, tD, tE, tF]));
writeLn("built 07 Math: " + END.toFixed(2) + " s");
