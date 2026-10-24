// Chapter 2: THE TANKS. Every visual is placed on its spoken word (w("word") = start time in the paced VO).
// Build: effectcraft-cli script $PWD/ch02_tanks.jsx --empty --save-as $PWD/ch02_tanks.ecproj
#include "lib.jsx"
#include "rig.jsx"
#include "timing/02_tanks.jsx"
#include "film.jsx"

var DUR = TIMING.duration;
var comp = newComp("02 Tanks", DUR);
var s = new Scene(comp, 20);
var b = s.booster({ cut: true, fill: 0 });
var P = s.parts;
// Back fins and legs only: the front ones would block the cut.
s.fins(0, b, "", [2, 3]);
s.legs(0, b, "", [0, 2, 3]);
s.floor(0.3);
s.lights();

// ---------- camera ----------
var WIDE = [[6, 23, 64], [0, 22, 0], 34];
var tLox = w("On"), tRp = w("Below"), tDome = w("They"), tTot = w("Together"), tPuz = w("But"), tThru = w("Straight");
var tEmpty = w("And", 2), tHe = w("That's"), tWall = w("walls", 2) - 0.2, tRem = w("Remember");
function K(t, v) { return [t, v[0], v[1], v[2]]; }
s.cameraPath([
  K(0, WIDE),
  K(tLox - 0.3, WIDE),
  K(tLox + 1.6, [[5, 30, 46], [0, 29, 0], 34]),
  K(tRp - 0.2, [[5, 30, 46], [0, 29, 0], 34]),
  K(tRp + 1.5, [[5, 11, 44], [0, 11, 0], 34]),
  K(tDome - 0.2, [[5, 11, 44], [0, 11, 0], 34]),
  K(tDome + 1.8, [[4.2, 18.2, 15], [0, 16.6, 0], 36]),
  K(tTot - 0.4, [[4.2, 18.2, 15], [0, 16.6, 0], 36]),
  K(tTot + 1.4, [[15, 23, 66], [11, 23, 0], 34]), // booster to the left, numbers on the right
  K(tPuz + 0.6, [[15, 23, 66], [11, 23, 0], 34]),
  // Oxygen on top -> engines at the bottom -> the kerosene in between: the camera goes to each as it's named.
  K(w("oxygen", 2) + 0.4, [[5, 32, 36], [0, 31, 0], 34]),
  K(w("engines") - 0.35, [[5, 32, 36], [0, 31, 0], 34]),
  K(w("engines") + 0.75, [[8, 4.5, 24], [0, 3.2, 0], 36]),
  K(w("kerosene", 2) - 0.35, [[8, 4.5, 24], [0, 3.2, 0], 36]),
  K(w("kerosene", 2) + 0.8, [[5, 11, 40], [0, 11, 0], 34]),
  K(tThru - 0.3, [[5, 11, 40], [0, 11, 0], 34]),
  K(tThru + 1.0, [[3.4, 12.2, 13.5], [0, 11.2, 0], 38]),
  K(tEmpty - 0.6, [[3.4, 12.2, 13.5], [0, 11.2, 0], 38]),
  K(tEmpty + 1.2, WIDE),
  K(tHe - 0.3, WIDE),
  K(tHe + 1.4, [[3.6, 39.2, 13], [0, 37.6, 0], 38]),
  K(w("pushing") + 0.4, [[3.6, 39.2, 13], [0, 37.6, 0], 38]),
  K(w("pushing") + 2.0, [[6, 30, 34], [0, 29, 0], 34]),
  K(tWall - 0.2, [[6, 30, 34], [0, 29, 0], 34]),
  K(tWall + 1.3, [[4.8, 24.4, 8.5], [1.4, 23.4, 0], 40]),
  K(tRem - 0.3, [[4.8, 24.4, 8.5], [1.4, 23.4, 0], 40]),
  K(tRem + 1.5, WIDE),
  K(DUR, WIDE),
], DUR);

// ---------- the cut opens, the tanks fill ----------
s.openCut(0.15, 1.5); // fully open before "fuel tank" (2.3 s), so its highlight shows
var hSkin = s.hl("tank_skin", b); // the whole shell: the cut one hides behind the inner tank wall
hlOn(hSkin, "fuel tank", w("fuel"), w("two") + 0.6, 85);
// Levels: LOX fills on "liquid oxygen", RP-1 on "RP-1"; both drain as the tanks empty; refill on "Remember";
// almost all gone on "gone".
var fillUp = function (t) { return [[t, 0], [t + 2.4, 1]]; };
var loxKeys = [[0, 0]].concat(fillUp(w("liquid"))).concat([[tEmpty + 0.4, 1], [w("helium") + 1.8, 0.42], [tRem + 0.1, 0.42], [tRem + 1.3, 1], [w("almost", 2), 1], [w("gone") + 1.0, 0.04], [DUR, 0.04]]);
var rp1Keys = [[0, 0]].concat(fillUp(w("RP"))).concat([[tEmpty + 0.4, 1], [w("helium") + 1.8, 0.42], [tRem + 0.1, 0.42], [tRem + 1.3, 1], [w("almost", 2), 1], [w("gone") + 1.0, 0.04], [DUR, 0.04]]);
s.fillKeys(loxKeys, rp1Keys, DUR, { cut: true, helium: [[0, 0], [tEmpty + 0.5, 0], [tEmpty + 1.2, 80], [tRem + 0.2, 80], [tRem + 1.2, 0], [w("almost", 2), 0], [w("almost", 2) + 0.6, 80], [DUR, 80]] });
mention(w("liquid"), "LOX fill", "fluid");
mention(w("RP"), "RP-1 fill", "fluid");

// ---------- labels ----------
s.label({ id: "lox", at: [0.9, 31, 0], root: b, title: "Liquid oxygen", sub: "LOX · the oxidiser", align: "right", to: ["1240", "A[1] - 60"], color: LOXC, tOn: w("liquid"), tOff: tRp - 0.3 });
s.label({ id: "rp1", at: [0.9, 11, 0], root: b, title: "RP-1 kerosene", sub: "the fuel", align: "right", to: ["1240", "A[1] - 60"], color: RP1C, tOn: w("RP"), tOff: tDome - 0.3 });
var hDome = s.hl("common_dome_cut", b);
hlOn(hDome, "common dome", w("single"), tTot - 0.5);
s.label({ id: "dome", at: [-1.0, 16.4, 0], root: b, title: "Common dome", sub: "one wall shared by both tanks", align: "left", to: ["A[0] - 210", "A[1] - 170"], tOn: w("common"), tOff: tTot - 0.5 });

// ---------- how much: tonnes ----------
var nx = 1330;
counter(comp, "loxT", { keys: [[tTot + 0.3, 0], [tTot + 2.0, 287]], fmt: 'Math.round(v) + " t"', pos: [nx, 400], size: 96, color: LOXC, tOn: tTot + 0.2, tOff: tPuz - 0.3 });
caption(comp, "liquid oxygen", { pos: [nx, 448], size: 34, font: "Inter-Medium", color: MUTED, tOn: tTot + 0.2, tOff: tPuz - 0.3 });
counter(comp, "rp1T", { keys: [[tTot + 0.5, 0], [tTot + 2.2, 124]], fmt: 'Math.round(v) + " t"', pos: [nx, 590], size: 96, color: RP1C, tOn: tTot + 0.4, tOff: tPuz - 0.3 });
caption(comp, "RP-1 kerosene", { pos: [nx, 638], size: 34, font: "Inter-Medium", color: MUTED, tOn: tTot + 0.4, tOff: tPuz - 0.3 });
caption(comp, "≈ 95% of its liftoff mass is propellant", { id: "95 percent", pos: [nx, 790], size: 40, color: INK, tOn: w("9"), tOff: tPuz - 0.3 });
// Both fills glow while the tonnes count up.
var hLox = s.hl("lox_cut", b), hRp = s.hl("rp1_cut", b);
hlOn(hLox, "LOX mass", tTot + 0.2, w("9") - 0.2, 45);
hlOn(hRp, "RP-1 mass", tTot + 0.4, w("9") - 0.2, 45);

// ---------- the puzzle: oxygen on top, engines at the bottom ----------
var hLox2 = s.hl("lox_cut", b, "HL lox 2"), hEng = s.hl("engines", b), hRp2 = s.hl("rp1_cut", b, "HL rp1 2");
hlOn(hLox2, "oxygen on top", w("oxygen", 2), w("engines") + 0.6, 55);
hlOn(hEng, "engines", w("engines"), w("kerosene", 2) + 0.4);
hlOn(hRp2, "kerosene in the way", w("kerosene", 2), tThru - 0.2, 55);
s.arrow({ id: "top", at: [2.4, 29, 0], root: b, color: LOXC, tOn: w("oxygen", 2), tOff: w("engines") + 0.6, toward: true, dir: [-110, 0] });
s.arrow({ id: "bottom", at: [2.4, 1.6, 0], root: b, color: ORANGE, tOn: w("engines"), tOff: w("kerosene", 2) + 0.4, toward: true, dir: [-110, 0] });

// ---------- straight through it: the transfer tube ----------
var hTube = s.hl("transfer_tube_cut", b);
hlOn(hTube, "transfer tube", w("Straight"), tEmpty - 0.3);
s.label({ id: "tube", at: [0.2, 11.4, 0], root: b, title: "LOX transfer tube", sub: "double-walled", align: "right", to: ["A[0] + 230", "A[1] - 210"], color: LOXC, tOn: w("double"), tOff: tEmpty - 0.3 });
s.flow({ id: "LOX down the tube", a: [0, 16.6, 0.12], b: [0, 3.3, 0.12], root: b, color: [0.78, 0.9, 1], n: 9, r: 0.12, speed: 0.32, tOn: w("Straight"), tOff: tEmpty - 0.3 });

// ---------- as the tanks empty: helium ----------
s.arrow({ id: "buckle L", at: [-1.9, 27, 0], root: b, color: RED, dir: [130, 0], toward: true, tOn: w("buckle"), tOff: tHe - 0.2 });
s.arrow({ id: "buckle R", at: [1.9, 27, 0], root: b, color: RED, dir: [-130, 0], toward: true, tOn: w("buckle"), tOff: tHe - 0.2 });
caption(comp, "would buckle", { id: "buckle", pos: [1360, 520], size: 48, color: RED, tOn: w("buckle"), tOff: tHe - 0.2 });
var hCopv = s.hl("copvs_cut", b);
hlOn(hCopv, "helium bottles", w("helium"), w("pushing") + 1.8);
s.label({ id: "copv", at: [-0.35, 37.6, -1.0], root: b, title: "Helium bottles", sub: "heated helium pressurises the tanks", align: "left", to: ["A[0] - 120", "A[1] - 190"], color: HEC, tOn: w("helium"), tOff: w("pushing") + 1.8 });
// Helium pushes down on both liquid surfaces (levels at 0.42 by then).
var loxSurf = RIG.lox[1] + RIG.fill.loxH * 0.42, rpSurf = RIG.rp1[1] + RIG.fill.rp1H * 0.42;
s.arrow({ id: "push lox", at: [0, loxSurf + 0.2, 0], root: b, color: HEC, dir: [0, 120], toward: true, tOn: w("pushing"), tOff: tWall - 0.4 });
s.arrow({ id: "push rp1", at: [0.9, rpSurf + 0.2, 0], root: b, color: HEC, dir: [0, 120], toward: true, tOn: w("pushing") + 0.15, tOff: tWall - 0.4 });

// ---------- the walls ----------
var hSkin2 = s.hl("tank_skin_cut", b, "HL skin 2"), hSeams = s.hl("weld_seams_cut", b);
hlOn(hSkin2, "tank walls", w("walls", 2), w("friction") - 0.1, 38);
s.label({ id: "alli", at: [1.75, 24.2, -0.4], root: b, title: "Aluminium-lithium", sub: "the tank walls", align: "left", to: ["A[0] - 260", "A[1] - 150"], tOn: w("Aluminium"), tOff: w("friction") - 0.2 });
hlOn(hSeams, "friction-stir welds", w("friction"), tRem - 0.3);
s.label({ id: "weld", at: [1.84, RIG.fill.rp1Top - 0.0, 0], root: b, title: "Friction-stir welds", align: "left", to: ["A[0] - 260", "A[1] - 150"], tOn: w("friction") + 0.2, tOff: tRem - 0.3 });

// ---------- remember: then almost all of it gone ----------
var hLox3 = s.hl("lox_cut", b, "HL lox 3"), hRp3 = s.hl("rp1_cut", b, "HL rp1 3");
hlOn(hLox3, "all this fuel (LOX)", w("fuel", 3), w("almost", 2) - 0.3, 40);
hlOn(hRp3, "all this fuel (RP-1)", w("fuel", 3), w("almost", 2) - 0.3, 40);

saveMentions();
writeLn("built 02 Tanks: " + comp.numLayers + " layers, " + DUR + " s");
