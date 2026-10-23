// Chapter cards (2.5 s each): number in the accent orange, the chapter's name, a short rule drawing on.
#include "lib.jsx"
#include "film.jsx"
var CARDS = [["01", "The giant, to scale"], ["02", "The tanks"], ["03", "One Merlin engine"], ["04", "Nine as one"], ["05", "Letting go"], ["06", "The way home"], ["07", "The maths of landing"]];
var D = 2.5;
for (var i = 0; i < CARDS.length; i++) {
  var c = newComp("card " + CARDS[i][0], D);
  caption(c, CARDS[i][0], { pos: [960, 470], size: 120, color: ORANGE, tOn: 0.15, tOff: D - 0.55 });
  caption(c, CARDS[i][1], { pos: [960, 600], size: 76, color: INK, tOn: 0.3, tOff: D - 0.5 });
  var bar = c.layers.addShape(); bar.name = "rule";
  tr(bar, "Position").setValue([960, 650]); tr(bar, "Anchor Point").setValue([0, 0]);
  var g = bar.property("Contents").addProperty("ADBE Vector Group");
  var r = g.property("Contents").addProperty("ADBE Vector Shape - Rect"); r.property("Size").setValue([160, 8]); r.property("Roundness").setValue(4);
  g.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(ORANGE);
  animate(tr(bar, "Scale"), [[0.45, [0, 100]], [1.1, [100, 100]]]);
  animate(tr(bar, "Opacity"), [[0.4, 0], [0.6, 100], [D - 0.5, 100], [D - 0.15, 0]]);
}
writeLn("cards " + CARDS.length);
