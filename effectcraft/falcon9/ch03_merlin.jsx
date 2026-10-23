// Chapter 3: ONE MERLIN ENGINE. The engine comes apart on "turbopump"; each part is named and lit on its word;
// propellant flows in its own colour (LOX blue, RP-1 yellow); the engine goes back together for thrust and throttle.
#include "lib.jsx"
#include "rig.jsx"
#include "timing/03_merlin.jsx"
#include "film.jsx"

var main = chapterComp("03 Merlin");
var END = main.duration;
// Exploded offsets (metres) for each part, from model.ts buildMerlin().
var PARTS = { nozzle_bell: [0, -0.6, 0], combustion_chamber: [0, 0.1, 0], injector: [0, 0.8, 0], turbopump: [1.1, 0.9, 0], gas_generator: [0.7, 0.3, 0.8], propellant_lines: [0.6, 0.55, 0.2], gimbal_actuators: [-0.9, 0.5, -0.4] };
var CT = 2.45; // chamber top

shot(main, "Merlin", 0, END, 260, function (s, dur) {
  var tApart = w("turbo"), tBack = w("Hold");
  // 0 = assembled, 1 = exploded.
  var ex = function (t) { return ease((t - tApart + 0.15) / 1.3) * (1 - ease((t - tBack) / 1.8)); };
  var L = {}, HL = {};
  for (var k in PARTS) (function (k) {
    var off = PARTS[k];
    var place = function (l) { bakeFn(tr(l, "Position"), 0, dur, function (t) { var e = ex(t); return s.p(off[0] * e, off[1] * e, off[2] * e); }); };
    L[k] = s.model("merlin_" + k); place(L[k]);
    HL[k] = s.hl("merlin_" + k, null); place(HL[k]);
  })(k);
  var lineOff = PARTS.propellant_lines;
  var hlLox = s.hl("merlin_lox_line", null), hlFuel = s.hl("merlin_fuel_line", null);
  var pl = function (l) { bakeFn(tr(l, "Position"), 0, dur, function (t) { var e = ex(t); return s.p(lineOff[0] * e, lineOff[1] * e, lineOff[2] * e); }); };
  pl(hlLox); pl(hlFuel);
  s.lights();
  s.floor(-0.95);
  // Where things are, given the explode amount e (metres, engine space).
  var at = function (base, part, e) { var o = PARTS[part]; return [base[0] + o[0] * e, base[1] + o[1] * e, base[2] + o[2] * e]; };

  // ---------- camera ----------
  var ASM = [[3.6, 1.9, 6.6], [0.25, 1.25, 0], 34], EXP = [[5.25, 2.9, 8.85], [0.6, 2.35, 0], 34];
  var tInj = w("meet") - 1.0, tNoz = w("hot"), tThr = w("throttle");
  s.cameraPath([
    [0, [4.2, 2.1, 7.4], [0.25, 1.25, 0], 34],
    [tApart - 0.2, ASM[0], ASM[1], 34],
    [tApart + 1.5, EXP[0], EXP[1], 34],
    [w("gas") - 0.3, EXP[0], EXP[1], 34],
    [w("gas") + 1.0, [4.4, 2.2, 6.4], [1.0, 1.9, 0.6], 36], // toward the gas generator
    [tInj - 0.4, [4.4, 2.2, 6.4], [1.0, 1.9, 0.6], 36],
    [tInj + 1.4, [1.9, 2.7, 3.4], [0.05, 3.05, 0], 38], // close on the injector and pintle
    [tBack - 0.1, [1.9, 2.7, 3.4], [0.05, 3.05, 0], 38],
    [tBack + 1.9, [4.6, 1.2, 8.2], [0.2, 0.6, 0], 36], // assembled, room below for the flame
    [dur, [4.8, 1.2, 8.6], [0.2, 0.6, 0], 36],
  ], dur);

  // ---------- this is a Merlin; nine of them ----------
  var all = []; for (var k2 in HL) all.push(HL[k2]);
  for (var i = 0; i < all.length; i++) pulse(all[i], w("Merlin"), w("Nine") - 0.3, 30, 0.28);
  mention(w("Merlin"), "Merlin", "highlight");
  s.label({ id: "merlin", at: [0.35, 1.2, 0.3], title: "Merlin 1D", sub: "sea-level engine", align: "right", to: ["A[0] + 250", "A[1] - 160"], tOn: w("Merlin"), tOff: w("And") - 0.2 });
  caption(s.comp, "× 9 on every booster", { id: "nine", pos: [1420, 820], size: 50, color: INK, tOn: w("Nine"), tOff: w("And") - 0.2 });
  caption(s.comp, "moving the propellant", { id: "moving it", pos: [960, 960], size: 46, color: INK, tOn: w("moving"), tOff: tApart - 0.2 });

  // ---------- turbopump: oxygen and kerosene in, rammed into the engine ----------
  var pump = at([0.42, CT - 0.25, 0], "turbopump", 1);
  hlOn(HL.turbopump, "turbopump", tApart, w("What") - 0.2);
  s.label({ id: "pump", at: [pump[0] + 0.15, pump[1] + 0.35, 0.1], title: "Turbopump", align: "right", to: ["A[0] + 170", "A[1] - 130"], tOn: tApart + 0.2, tOff: w("What") - 0.2 });
  s.flow({ id: "oxygen in", a: [pump[0] - 0.12, pump[1] + 1.4, 0.12], b: [pump[0] - 0.12, pump[1] + 0.25, 0.12], color: LOXC, n: 7, r: 0.04, speed: 0.6, tOn: w("oxygen"), tOff: w("What") - 0.2 });
  s.flow({ id: "kerosene in", a: [pump[0] + 0.12, pump[1] + 1.4, -0.12], b: [pump[0] + 0.12, pump[1] + 0.5, -0.12], color: RP1C, n: 7, r: 0.04, speed: 0.6, tOn: w("kerosene"), tOff: w("What") - 0.2 });
  hlOn(hlLox, "LOX line", w("oxygen"), w("What") - 0.2);
  hlOn(hlFuel, "fuel line", w("kerosene"), w("What") - 0.2);
  var inj = at([0, CT, 0], "injector", 1);
  s.flow({ id: "into the engine (LOX)", a: [pump[0] - 0.1, pump[1] + 0.2, 0.08], b: [inj[0] + 0.12, inj[1] + 0.08, 0.08], color: LOXC, n: 8, r: 0.035, speed: 1.1, tOn: w("rams"), tOff: w("What") - 0.2 });
  s.flow({ id: "into the engine (RP-1)", a: [pump[0] - 0.1, pump[1] + 0.45, -0.08], b: [inj[0] + 0.12, inj[1] + 0.12, -0.08], color: RP1C, n: 8, r: 0.035, speed: 1.1, tOn: w("rams") + 0.1, tOff: w("What") - 0.2 });
  caption(s.comp, "high pressure", { id: "pressure", pos: [1420, 900], size: 46, color: INK, tOn: w("pressure"), tOff: w("What") - 0.2 });

  // ---------- the gas generator spins it ----------
  var gg = at([0.32, CT - 0.1, 0.18], "gas_generator", 1);
  s.label({ id: "turbine", at: [pump[0], pump[1] + 0.8, 0.1], title: "Turbine", sub: "spins the pump", align: "right", to: ["A[0] + 170", "A[1] - 110"], tOn: w("spins"), tOff: w("small") - 0.15 });
  hlOn(HL.gas_generator, "gas generator", w("small"), tInj - 0.3);
  s.label({ id: "gg", at: [gg[0], gg[1] + 0.2, gg[2]], title: "Gas generator", sub: "a small burner of its own", align: "left", to: ["A[0] - 170", "A[1] - 140"], tOn: w("gas"), tOff: tInj - 0.3 });
  // A little fuel burns (a glow inside it), then the exhaust dumps out of the duct.
  var glow = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "sphere", name: "gg flame", radius: 0.09 * s.S, segments: 20, rings: 12, baseColor: [1, 0.6, 0.2], emissive: [1, 0.55, 0.15], castsShadows: "off", acceptsShadows: "off" }));
  tr(glow, "Position").setValue(s.p(gg[0], gg[1] + 0.16, gg[2] + 0.12));
  animate(tr(glow, "Opacity"), [[0, 0], [w("burns") - 0.05, 0], [w("burns") + 0.4, 95], [tInj - 0.3, 95], [tInj + 0.1, 0]]);
  mention(w("burns"), "burns a little fuel", "glow");
  var duct = [gg[0] + 0.42, gg[1] - 1.9, gg[2] + 0.1];
  s.flow({ id: "exhaust out the side", a: duct, b: [duct[0] + 0.4, duct[1] - 1.2, duct[2] + 0.1], color: [0.62, 0.64, 0.68], n: 7, r: 0.06, speed: 0.7, tOn: w("dumps"), tOff: tInj - 0.3 });

  // ---------- the injector and its pintle ----------
  hlOn(HL.injector, "injector", w("injector"), tBack - 0.2);
  s.label({ id: "inj", at: [inj[0] + 0.2, inj[1] + 0.14, 0], title: "Injector", align: "right", to: ["A[0] + 200", "A[1] - 150"], tOn: w("injector"), tOff: w("pintle") - 0.2 });
  s.label({ id: "pintle", at: [0, inj[1] - 0.12, 0.04], title: "Pintle", sub: "one central post sprays both", align: "right", to: ["A[0] + 200", "A[1] + 120"], tOn: w("pintle"), tOff: tBack - 0.2 });
  // The spray: oxygen and kerosene fanning out from the pintle tip.
  for (var j = 0; j < 6; j++) {
    var a = (j / 6) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    s.flow({ id: "spray " + j, a: [0, inj[1] - 0.15, 0], b: [0.26 * c, inj[1] - 0.42, 0.26 * sn], color: j % 2 ? RP1C : LOXC, n: 4, r: 0.022, speed: 1.4, tOn: w("sprays"), tOff: tBack - 0.2 });
  }
  caption(s.comp, "Apollo lunar module descent engine: a pintle too", { id: "Apollo", pos: [960, 1025], size: 40, color: MUTED, font: "Inter-SemiBold", tOn: w("cousin"), tOff: w("burns", 2) - 0.2 });
  caption(s.comp, "stable even when throttled down", { id: "stable", pos: [960, 1025], size: 44, color: INK, tOn: w("stable"), tOff: tBack - 0.2 });

  // ---------- back together: the nozzle and thrust ----------
  var flameK = [[0, 0], [tNoz - 0.05, 0], [tNoz + 0.5, 1], [tThr - 0.1, 1], [w("far") + 0.3, 0.564], [dur, 0.564]]; // 482 / 854 = 0.564
  s.flame({ id: "Merlin", at: [0, -0.02, 0], len: 3.2, r: 0.5, keys: flameK, tEnd: dur });
  mention(tNoz, "hot gas out the nozzle", "flame");
  hlOn(HL.nozzle_bell, "nozzle", w("nozzle"), w("One") - 0.2);
  s.label({ id: "nozzle", at: [0.42, 0.6, 0.1], title: "Nozzle", align: "right", to: ["A[0] + 220", "A[1] - 80"], tOn: w("nozzle"), tOff: w("One") - 0.2 });
  s.arrow({ id: "pushed", at: [-0.85, 1.4, 0], color: ORANGE, dir: [0, -170], width: 12, head: 34, tOn: w("pushed"), tOff: dur - 0.4 });

  // ---------- thrust numbers and the throttle floor ----------
  var nx = 1460;
  counter(s.comp, "kN", { keys: [[w("854") - 0.1, 0], [w("854") + 1.0, 854], [w("lowest") - 0.4, 854], [w("482") + 0.6, 482]], fmt: 'Math.round(v) + " kN"', pos: [nx, 460], size: 110, color: INK, tOn: w("854"), tOff: dur - 0.3 });
  caption(s.comp, "thrust, one engine", { pos: [nx, 520], size: 32, font: "Inter-Medium", color: MUTED, tOn: w("854"), tOff: dur - 0.3 });
  caption(s.comp, "≈ lifting 87 t", { id: "87 tonnes", pos: [nx, 610], size: 50, color: INK, tOn: w("87"), tOff: tThr - 0.2 });
  // Throttle gauge: 0 .. 854 kN, filled to the current thrust, with the minimum marked.
  var gx = nx - 260, gy = 640, gw = 520;
  var gauge = s.comp.layers.addShape(); gauge.name = "throttle gauge";
  tr(gauge, "Position").setValue([0, 0]); tr(gauge, "Anchor Point").setValue([0, 0]);
  var head = 'var v = thisComp.layer("K_kN").effect("Slider Control")("Slider");';
  // Listed first draws on top: the minimum marker, the orange fill, then the grey track.
  var g3 = gauge.property("Contents").addProperty("ADBE Vector Group");
  var r3 = g3.property("Contents").addProperty("ADBE Vector Shape - Rect"); r3.property("Size").setValue([6, 60]); r3.property("Position").setValue([gx + gw * 482 / 854, gy]);
  g3.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(INK);
  var g2 = gauge.property("Contents").addProperty("ADBE Vector Group");
  var r2 = g2.property("Contents").addProperty("ADBE Vector Shape - Rect"); r2.property("Roundness").setValue(13);
  r2.property("Size").expression = head + "[Math.max(26, " + gw + " * v / 854), 26];";
  r2.property("Position").expression = head + "[" + gx + " + Math.max(26, " + gw + " * v / 854) / 2, " + gy + "];";
  g2.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(ORANGE);
  var g1 = gauge.property("Contents").addProperty("ADBE Vector Group");
  var r1 = g1.property("Contents").addProperty("ADBE Vector Shape - Rect"); r1.property("Size").setValue([gw, 26]); r1.property("Position").setValue([gx + gw / 2, gy]); r1.property("Roundness").setValue(13);
  g1.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue([0.85, 0.86, 0.88]);
  animate(tr(gauge, "Opacity"), [[tThr - 0.1, 0], [tThr + 0.4, 100], [dur - 0.3, 100], [dur, 0]]);
  mention(tThr, "throttle gauge", "graphic");
  caption(s.comp, "MINIMUM", { id: "minimum", pos: [gx + gw * 482 / 854, gy + 72], size: 30, color: INK, tOn: w("lowest"), tOff: dur - 0.3 });
  caption(s.comp, "not zero", { id: "not zero", pos: [nx, 800], size: 64, color: RED, tOn: w("not"), tOff: dur - 0.3 });
  caption(s.comp, "the reason it can't hover", { id: "the reason", pos: [nx, 880], size: 40, color: INK, tOn: w("reason"), tOff: dur - 0.3 });
});

saveMentions();
writeLn("built 03 Merlin: " + END.toFixed(2) + " s");
