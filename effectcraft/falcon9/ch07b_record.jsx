// Chapter 7b: THE RECORD. It doesn't always work: in 2024 a leg failed on touchdown and the booster toppled into
// the sea (grey, dim). But one booster, B1067, has now flown 37 times (bright studio).
#include "lib.jsx"
#include "rig.jsx"
#include "timing/07b_record.jsx"
#include "film.jsx"

var main = chapterComp("07b Record");
var END = main.duration;
var SY = RIG.standY;
var SEA = [0.3, 0.36, 0.42], SKY = [0.48, 0.52, 0.56];

// ---------- A: 2024, a leg fails and the booster topples into the sea ----------
var tB = w("But");
shot(main, "A toppled", 0, tB, 10, function (s, dur) {
  backdrop(s.comp, SKY, [[0, 100], [dur, 100]], "Grey sky");
  s.model("droneship", [0, 0, 0]);
  var sea = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "plane", name: "Sea", width: 6000 * s.S, height: 6000 * s.S, position: s.p(0, -2, 0), baseColor: SEA, roughness: 0.6, metallic: 0 }));
  tr(sea, "X Rotation").setValue(90);
  s.cmd("material.set", { layers: [sea.__id], castsShadows: "off", acceptsShadows: "on" });
  // The booster tips over the foot of leg 1 (+X): a small sag when the leg fails, then it falls, accelerating,
  // and slides off the deck. a(t) is the three.js angle (negative = toward +X).
  var b = s.booster({ at: [0, SY, 0], assembly: "landed" });
  var leg = s.hl("leg1_landed_red", b, "HL failed leg");
  var PX = 9.4, tSag = w("collapsed"), tTop = w("toppled"), tSea = w("sea");
  var ang = function (t) {
    var sag = 7 * ease((t - tSag) / 0.7);
    var u = Math.max(0, Math.min(1, (t - tTop) / (tSea + 0.4 - tTop)));
    return -(sag + (88 - 7) * u * u); // falls like a tipping pole: slow, then fast
  };
  // Then it slides off the deck edge (+X) and drops into the water, half sunk.
  var off = function (t) { var u = ease((t - tSea + 0.2) / 1.0); return [26 * u, -14 * u]; };
  bakeFn(tr(b, "Z Rotation"), 0, dur, function (t) { return -ang(t); });
  bakeFn(tr(b, "Position"), 0, dur, function (t) {
    var a = ang(t) * Math.PI / 180, x = -PX, y = SY;
    var o = off(t);
    return s.p(PX + x * Math.cos(a) - y * Math.sin(a) + o[0], x * Math.sin(a) + y * Math.cos(a) + o[1], 0);
  });
  mention(tTop, "booster topples", "motion");
  hlOn(leg, "a leg", w("leg"), dur, 92);
  s.lights();
  s.cameraPath([[0, [24, 20, 128], [22, 18, 0], 34], [tSea - 0.2, [24, 19, 124], [22, 16, 0], 34], [dur, [36, 15, 128], [36, 9, 0], 34]], dur); // follows it off the deck
  caption(s.comp, "2024", { id: "2024", pos: [360, 230], size: 120, color: INK, tOn: w("2024"), tOff: dur - 0.3 });
  caption(s.comp, "leg failed on touchdown", { id: "leg collapsed", pos: [360, 310], size: 36, font: "Inter-SemiBold", color: RED, tOn: tSag, tOff: dur - 0.3 });
  caption(s.comp, "toppled into the sea", { id: "into the sea", pos: [360, 362], size: 36, font: "Inter-SemiBold", color: INK, tOn: tTop + 0.3, tOff: dur - 0.3 });
});

// ---------- B: B1067, 37 flights ----------
shot(main, "B the record", tB, END, 12, function (s, dur) {
  var b = s.booster({ at: [0, SY, 0] });
  s.legs(1, b); s.fins(1, b);
  s.floor(0);
  s.lights();
  s.cameraPath([[0, [28, 27, 112], [15, 24, 0], 34], [dur, [27, 26, 104], [15, 24, 0], 34]], dur); // booster left, numbers right
  var hs = [s.hl("tank_skin", b), s.hl("interstage", b), s.hl("engine_section", b)];
  for (var i = 0; i < hs.length; i++) hlOn(hs[i], i ? "one booster " + i : "one booster", w("one"), w("done") - 0.2, 40);
  caption(s.comp, "B1067", { id: "B1067", pos: [1400, 400], size: 120, color: INK, tOn: w("B1067"), tOff: dur - 0.3 });
  counter(s.comp, "37 flights", { keys: [[w("done"), 0], [w("37") + 0.35, 37]], fmt: 'Math.round(v) + " flights"', pos: [1400, 560], size: 96, color: ORANGE, tOn: w("done"), tOff: dur - 0.3 });
  caption(s.comp, "the same booster, reused", { pos: [1400, 630], size: 32, font: "Inter-Medium", color: MUTED, tOn: w("done") + 0.2, tOff: dur - 0.3 });
});

saveMentions();
writeLn("CUTS " + JSON.stringify([tB]));
writeLn("built 07b Record: " + END.toFixed(2) + " s");
