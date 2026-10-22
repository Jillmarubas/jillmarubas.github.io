// Builds the whole 16 s demo in EffectCraft (no Remotion). Run:
//   effectcraft-cli script /abs/path/build.jsx --empty --save-as /abs/path/demo.ecproj
#include "lib.jsx"
#include "shotA.jsx"
#include "shots.jsx"

var A = buildShotA();
var Bc = buildShotB();
var C = buildShotC();
var coin = buildCoin();
var bill = buildBill();
var D = buildShotD(coin);
var ink = buildInkGrad();
var melt = buildMeltGrad();

var M = newComp("Main", 16);
M.motionBlur = true;

function place(item, start, end) {
  var l = M.layers.add(item);
  l.startTime = start;
  l.inPoint = start;
  l.outPoint = end;
  return l;
}
// Layers are added on top, so add bottom first.
var lD = place(D, 11.9, 16);
var lC = place(C, 8.45, 12.2);
var lB = place(Bc, 3.85, 8.45);
var inkBlack = solid(M, [0.02, 0.02, 0.02], "Ink front");
inkBlack.inPoint = 3.85; inkBlack.outPoint = 4.25;
var lA = place(A, 0, 4.2);
var lInk = place(ink, 0, 16); lInk.enabled = false;
var lMelt = place(melt, 0, 16); lMelt.enabled = false;

// Ink wipe A -> B (3.85-4.2 s): A is wiped by the ink gradient; the black front lags behind it.
var gwA = fx(lA, "Gradient Wipe", {"Transition Softness": 3});
gwA.property("Gradient Layer").setValue(lInk.index);
keys(gwA.property("Transition Completion"), [[3.85, 0], [4.2, 100]], 70);
var gwI = fx(inkBlack, "Gradient Wipe", {"Transition Softness": 3});
gwI.property("Gradient Layer").setValue(lInk.index);
gwI.property("Transition Completion").expression = 'var c = thisComp.layer("A Archive").effect("Gradient Wipe")("Transition Completion"); clamp(c - 9, 0, 100);';

// Melt dissolve C -> D (11.9-12.2 s).
var gwC = fx(lC, "Gradient Wipe", {"Transition Softness": 25});
gwC.property("Gradient Layer").setValue(lMelt.index);
keys(gwC.property("Transition Completion"), [[11.9, 0], [12.2, 100]], 70);
// Face-off push-in.
keys(lC.property("Transform").property("Scale"), [[8.45, [100, 100]], [12.2, [105, 105]]], 33);

// Money rain B -> C (7.3-8.8 s) with a short dip to black at 8.45.
addRain(M, bill, 90, "toward", 7.3, 32,
  '(function(t){ if (t < 0) return 0; if (t < 0.4) return linear(t, 0, 0.4, 0, 0.25); if (t < 1.1) return linear(t, 0.4, 1.1, 0.25, 1); return linear(t, 1.1, 1.4, 1, 0); })(time - 7.3)', 4);
var cam = M.layers.addCamera("Camera", [W / 2, H / 2]);
cam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
cam.property("Camera Options").property("Zoom").setValue(1200);
cam.property("Transform").property("Position").setValue([W / 2, H / 2, -1200]);
var dip = solid(M, [0, 0, 0], "Dip");
keys(dip.property("Transform").property("Opacity"), [[8.33, 0], [8.45, 100], [8.57, 0]], 0);

// Finish: grain + vignette over everything, then the end fade.
var fin = M.layers.addSolid([0, 0, 0], "Finish", W, H, 1);
fin.adjustmentLayer = true;
fx(fin, "Noise", {"Amount of Noise": 5});
fx(fin, "CC Vignette", {"Amount": 55});
var endFade = solid(M, [0, 0, 0], "End fade");
keys(endFade.property("Transform").property("Opacity"), [[15.5, 0], [16, 100]], 0);

// Sound on the transitions (CC0 whoosh).
var wh = img("whoosh7.mp3");
var cues = [[3.7, -2], [8.1, -3], [11.8, -8]];
for (var i = 0; i < cues.length; i++) {
  var a = M.layers.add(wh);
  a.startTime = cues[i][0];
  a.property("Audio").property("Audio Levels").setValue([cues[i][1], cues[i][1]]);
}
writeLn("Main layers: " + M.numLayers);
