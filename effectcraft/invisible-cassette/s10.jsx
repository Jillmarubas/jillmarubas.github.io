// Scene 10, "The final sign-off": no narration. The film's own closing line types onto the terminal,
// holds, then the screen powers off (a dim amber collapse, flash-safe) on the last note.
#include "kit2.jsx"
var END = 22;
(function () {
  var o = Shot("S10 Sign-off", 0, END);
  word(o, "We didn’t lose control to machines that woke up.", 1.4, {font: TF.mono, size: 46, y: 470, color: TERM.white, mode: "type", cps: 18, track: 0, until: 18.4});
  word(o, "We handed it over because we were too slow.", 6.4, {font: TF.mono, size: 46, y: 560, color: TERM.amber, mode: "type", cps: 18, track: 0, until: 18.4, glow: true});
  var cur = solid(o.c, TERM.amber, "cursor", 24, 46); cur.threeDLayer = true; T(cur).property("Position").setValue([W / 2 + 610, 545, 0]);
  T(cur).property("Opacity").expression = "time < 9 || time > 18.3 ? 0 : (Math.floor(time * 2) % 2 ? 0 : 100)";
  cam(o, {push: 1.03, d0: 0, d1: 0});
  // power-off: the picture squeezes to a thin amber line, then a dot, then black
  var M = comp("Scene10", END); M.motionBlur = true;
  solid(M, [0, 0, 0], "black");
  var l = M.layers.add(o.c);
  keys(T(l).property("Scale"), [[18.4, [100, 100]], [18.75, [100, 0.8]], [19.05, [0.6, 0.8]]], 0);
  keys(T(l).property("Opacity"), [[0, 0], [0.6, 100], [19.0, 100], [19.25, 0]], 0);
  var ex = solid(M, [0, 0, 0], "fade in"); keys(T(ex).property("Opacity"), [[0, 100], [0.8, 0]], 0);
  finish(M);
})();
writeLn("Scene10 built");
