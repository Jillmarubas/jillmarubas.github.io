// One-off: move each label's card under its title in an already built project (same as build.jsx now does).
var comp = null;
for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name === "Compressor Cutaway") comp = app.project.item(i);
var n = 0;
for (var i = 1; i <= comp.numLayers; i++) {
  var l = comp.layer(i);
  if (l.name.indexOf("Card_") === 0) {
    var t = comp.layers.byName("T_" + l.name.substring(5));
    l.moveAfter(t);
    n++;
  }
}
app.project.save();
writeLn("moved " + n);
