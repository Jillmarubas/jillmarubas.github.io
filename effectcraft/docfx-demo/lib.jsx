// Helpers for the EffectCraft build of the docfx demo (After Effects-style scripting).
var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 30;

function img(name) {
  return app.project.importFile(new ImportOptions(new File(ROOT + "/assets/" + name)));
}

function newComp(name, dur) {
  return app.project.items.addComp(name, W, H, 1, dur, FPS);
}

function solid(comp, rgb, name) {
  return comp.layers.addSolid(rgb, name, W, H, 1);
}

// Keyframes: keys = [[t, value], ...]; ease = influence % (0 = linear).
function keys(prop, ks, ease) {
  for (var i = 0; i < ks.length; i++) prop.setValueAtTime(ks[i][0], ks[i][1]);
  if (ease) {
    var dims = prop.value instanceof Array ? prop.value.length : 1;
    if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) dims = 1;
    var e = [];
    for (var d = 0; d < dims; d++) e.push(new KeyframeEase(0, ease));
    for (var k = 1; k <= prop.numKeys; k++) prop.setTemporalEaseAtKey(k, e, e);
  }
}

function fx(layer, name, values) {
  var e = layer.property("Effects").addProperty(name);
  for (var k in values) {
    var path = k.split("/");
    var p = e;
    for (var i = 0; i < path.length; i++) p = p.property(path[i]);
    p.setValue(values[k]);
  }
  return e;
}

// Soft-light colour wash (the Tint idea): a solid in Soft Light mode.
function tintLayer(comp, rgb, opacity) {
  var l = solid(comp, rgb, "Tint");
  l.blendingMode = BlendingMode.SOFT_LIGHT;
  l.property("Transform").property("Opacity").setValue(opacity);
  return l;
}

// Convert an SVG path (M, L, C, Z only, absolute) to an After Effects Shape.
function svgShape(d, ox, oy, k, flip) {
  var t = d.replace(/([MLCZ])/g, " $1 ").replace(/,/g, " ").split(/\s+/);
  var pts = [], ins = [], outs = [], i = 0, cmd = "", closed = false;
  function num() { return parseFloat(t[i++]); }
  function P(x, y) { return [ox + (flip ? -x : x) * k, oy + y * k]; }
  function D(dx, dy) { return [(flip ? -dx : dx) * k, dy * k]; }
  var last = null;
  while (i < t.length) {
    var tok = t[i];
    if (tok === "") { i++; continue; }
    if (/[MLCZ]/.test(tok)) { cmd = tok; i++; if (cmd === "Z") { closed = true; } continue; }
    if (cmd === "M" || cmd === "L") {
      var x = num(), y = num();
      pts.push(P(x, y)); ins.push([0, 0]); outs.push([0, 0]); last = [x, y];
    } else if (cmd === "C") {
      var x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
      outs[outs.length - 1] = D(x1 - last[0], y1 - last[1]);
      pts.push(P(x3, y3)); ins.push(D(x2 - x3, y2 - y3)); outs.push([0, 0]); last = [x3, y3];
    } else { i++; }
  }
  var s = new Shape();
  s.vertices = pts; s.inTangents = ins; s.outTangents = outs; s.closed = closed;
  return s;
}

// A shape layer with one filled path (and optional stroke).
function pathLayer(comp, name, shapes, fillRgb, strokeRgb, strokeW) {
  var l = comp.layers.addShape();
  l.name = name;
  var g = l.property("Contents").addProperty("ADBE Vector Group");
  var c = g.property("Contents");
  for (var i = 0; i < shapes.length; i++) {
    var p = c.addProperty("ADBE Vector Shape - Group");
    p.property("Path").setValue(shapes[i]);
  }
  if (strokeRgb) {
    var st = c.addProperty("ADBE Vector Graphic - Stroke");
    st.property("Color").setValue(strokeRgb);
    st.property("Stroke Width").setValue(strokeW || 4);
  }
  if (fillRgb) {
    var f = c.addProperty("ADBE Vector Graphic - Fill");
    f.property("Color").setValue(fillRgb);
  }
  return l;
}

function rect(x, y, w, h) {
  var s = new Shape();
  s.vertices = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  s.closed = true;
  return s;
}

function ellipseShape(cx, cy, rx, ry) {
  var k = 0.5523;
  var s = new Shape();
  s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  s.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
  s.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  s.closed = true;
  return s;
}
