// Helpers for the EffectCraft build of the docfx demo (After Effects-style scripting).
var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 23.976;

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

// ---- The $20 Lie helpers ----
var PAPER = [0.925, 0.894, 0.835], INK = [0.09, 0.08, 0.07], RED = [0.78, 0.12, 0.10], NIGHT = [0.03, 0.03, 0.035];
var _items = {};
function asset(name) { if (!_items[name]) _items[name] = img(name); return _items[name]; }

// 3D card from an image: z > 0 is farther; scale is the size it reads at on the z = 0 plane.
function card(comp, name, x, y, z, s, rot) {
  var l = comp.layers.add(asset(name));
  l.threeDLayer = true;
  var k = s * (1200 + z) / 1200;
  l.property("Transform").property("Position").setValue([x, y, z]);
  l.property("Transform").property("Scale").setValue([k, k, k]);
  if (rot) l.property("Transform").property("Z Rotation").setValue(rot);
  return l;
}
function camera(comp, posKeys, ease) {
  var cam = comp.layers.addCamera("Camera", [W / 2, H / 2]);
  cam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
  cam.property("Camera Options").property("Zoom").setValue(1200);
  var p = cam.property("Transform").property("Position");
  if (posKeys.length == 1) p.setValue(posKeys[0][1]); else keys(p, posKeys, ease || 40);
  return cam;
}
function txt(comp, s, font, size, rgb, x, y, just, threeD) {
  var t = comp.layers.addText(s);
  var d = t.property("Source Text").value;
  d.font = font; d.fontSize = size; d.fillColor = rgb; d.applyFill = true;
  d.justification = just || ParagraphJustification.CENTER_JUSTIFY;
  t.property("Source Text").setValue(d);
  if (threeD) t.threeDLayer = true;
  t.property("Transform").property("Position").setValue(threeD ? [x, y, 0] : [x, y]);
  return t;
}
// Typewriter: reveal characters linearly between a and b (seconds, comp time).
function typeOn(t, s, a, b) {
  t.property("Source Text").expression = 'var s = ' + JSON.stringify(s) + '; s.substr(0, Math.round(linear(time, ' + a + ', ' + b + ', 0, s.length)));';
}
// Paper backdrop far behind, so the camera's moves give parallax against it.
function paper(comp, z) {
  var l = solid(comp, PAPER, "Paper");
  l.threeDLayer = true;
  var k = 140 * (1200 + z) / 1200;
  l.property("Transform").property("Position").setValue([W / 2, H / 2, z]);
  l.property("Transform").property("Scale").setValue([k, k, 100]);
  fx(l, "Noise", {"Amount of Noise": 3});
  return l;
}
function fade(layer, t0, t1, from, to) { keys(layer.property("Transform").property("Opacity"), [[t0, from], [t1, to]], 50); }
function slide(layer, t0, t1, from, to, ease) { keys(layer.property("Transform").property("Position"), [[t0, from], [t1, to]], ease || 70); }
function circleStroke(comp, cx, cy, rx, ry, rgb, w, t0, t1) {
  var l = comp.layers.addShape();
  l.name = "Ink circle";
  var g = l.property("Contents").addProperty("ADBE Vector Group").property("Contents");
  g.addProperty("ADBE Vector Shape - Group").property("Path").setValue(ellipseShape(cx, cy, rx, ry));
  var st = g.addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(rgb); st.property("Stroke Width").setValue(w);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("End"), [[t0, 0], [t1, 100]], 60);
  l.property("Transform").property("Position").setValue([0, 0]);
  return l;
}
