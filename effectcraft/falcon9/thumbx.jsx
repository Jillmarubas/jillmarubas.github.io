// Exploded-view thumbnail: every component laid horizontal on black (comp "x main"), and a marker pass
// (comp "x marks": frame i shows only the marker of label i) so the compositor knows where each label points.
#include "lib.jsx"
#include "xrig.jsx"
var TIMING = { chapter: "thumbx", duration: 1, beats: [0], words: [] };
#include "film.jsx"
var CAM = [[41.5, 12, 112], [41.5, -0.5, 0], 34];
function scene(name, dur, build) {
  var c = app.project.items.addComp(name, W, H, 1, dur, FPS); c.renderer = "ADBE Advanced 3d";
  shot(c, name + " shot", 0, dur, 10, function (s, d) { build(s, d); s.cameraPath([[0, CAM[0], CAM[1], CAM[2]], [d, CAM[0], CAM[1], CAM[2]]], d); });
}
scene("x main", 1, function (s, d) {
  backdrop(s.comp, [0, 0, 0], [[0, 100], [d, 100]], "Black");
  for (var i = 0; i < XRIG.length; i++) s.model("x/x_" + XRIG[i].id, [0, 0, 0]);
  s.lights();
});
var N = XRIG.length;
scene("x marks", N / FPS, function (s, d) {
  backdrop(s.comp, [0, 0, 0], [[0, 100], [d, 100]], "Black");
  for (var i = 0; i < N; i++) {
    var a = XRIG[i].at;
    var m = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "sphere", name: "M " + XRIG[i].id, radius: 0.35 * s.S, segments: 12, rings: 8, baseColor: [1, 1, 1], emissive: [1, 1, 1], castsShadows: "off", acceptsShadows: "off", acceptsLights: false }));
    // Shown only on frame i: parked far off-screen on every other frame (hold keys, so no in-between moves).
    var far = s.p(a[0], a[1] + 500, a[2]), here = s.p(a[0], a[1], a[2]), pos = tr(m, "Position");
    for (var f = 0; f < N; f++) pos.setValueAtTime(f / FPS, f === i ? here : far);
    for (var f2 = 1; f2 <= pos.numKeys; f2++) pos.setInterpolationTypeAtKey(f2, KeyframeInterpolationType.HOLD);
  }
  s.lights();
});
writeLn("built thumbx");
