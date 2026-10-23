// Thumbnail stills (no text: the words are added in compositing). Comp "thumb A": the booster coming down on
// one engine over a tiny ship. Comp "thumb B": the cutaway booster, fuels in their colours, one engine lit.
#include "lib.jsx"
#include "rig.jsx"
var TIMING = { chapter: "thumb", duration: 1, beats: [0], words: [] };
#include "film.jsx"
var SY = RIG.standY;

var a = chapterComp("thumb A");
shot(a, "A", 0, 1, 10, function (s, dur) {
  backdrop(s.comp, [0.04, 0.06, 0.11], [[0, 100], [dur, 100]], "Dusk");
  s.model("droneship", [0, 0, 0]);
  var sea = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "plane", name: "Sea", width: 6000 * s.S, height: 6000 * s.S, position: s.p(0, -2, 0), baseColor: [0.08, 0.12, 0.18], roughness: 0.6, metallic: 0 }));
  tr(sea, "X Rotation").setValue(90);
  var b = s.booster({ at: [0, SY + 24, 0] });
  s.fins(1, b); s.legs(0.75, b);
  s.flame({ id: "landing", at: [0, 0.35, 0], root: b, len: 16, r: 0.9, keys: [[0, 1], [dur, 1]], tEnd: dur });
  var hc = s.hl("engine_centre", b); tr(hc, "Opacity").setValue(90);
  s.lights();
  s.cameraPath([[0, [-34, 22, 92], [-17, 26, 0], 40], [dur, [-34, 22, 92], [-17, 26, 0], 40]], dur);
});

var bq = chapterComp("thumb B");
shot(bq, "B", 0, 1, 14, function (s, dur) {
  var b = s.booster({ at: [0, 0, 0], cut: true, fill: 0.9 });
  s.fins(1, b, "", [2, 3]); s.legs(0, b, "", [0, 2, 3]);
  s.flame({ id: "one", at: [0, 0.35, 0], root: b, len: 9, r: 0.55, keys: [[0, 1], [dur, 1]], tEnd: dur });
  var hc = s.hl("engine_centre_cut", b); tr(hc, "Opacity").setValue(90);
  s.floor(-9);
  s.lights();
  s.cameraPath([[0, [-16, 12, 66], [-8, 18, 0], 40], [dur, [-16, 12, 66], [-8, 18, 0], 40]], dur);
});
writeLn("built thumbs");
