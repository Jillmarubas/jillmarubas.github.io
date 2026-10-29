// The Invisible Cassette: EffectCraft helpers (Small Print design system rig).
var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 24;
var ZOOM = 1866.67; // 35 mm lens on a 36 mm film back: 1920 * 35 / 36

// Small Print tokens (0..1 RGB)
function hex(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
var COL = {void: hex("#0E1117"), manila: hex("#E5D9C5"), gold: hex("#E5A93C"), crimson: hex("#C0392B"), hl: hex("#F1C40F"), mono: hex("#D1D5DB"), ink: hex("#1A1712"), inkSoft: hex("#5A4E3A"), amberInk: hex("#7A4A0E"), olive: hex("#5E6B2A"), tungsten: [1, 0.80, 0.56]};
var FONT = {display: "PlayfairDisplay-Black", mono: "CourierPrime-Bold", monoReg: "CourierPrime-Regular", type: "SpecialElite-Regular", ui: "IBMPlexSansCond-Regular", glyph: "JetBrainsMono-Bold"};

var _items = {};
function img(n) {
  if (!_items[n]) _items[n] = app.project.importFile(new ImportOptions(new File(ROOT + "/assets/" + n)));
  return _items[n];
}
function comp(name, dur, w, h) { return app.project.items.addComp(name, w || W, h || H, 1, dur, FPS); }
function solid(c, rgb, name, w, h) { return c.layers.addSolid(rgb, name, w || c.width, h || c.height, 1); }
function T(l) { return l.property("Transform"); }

// keyframes: ks = [[t, v], ...]; ease = influence % on every key (0 = linear)
// EffectCraft snaps keys to whole frames, so two keys inside one frame would merge (the later wins)
// and a cut like [t - 0.001, 0], [t, 100] became a slow fade from the previous key. Snap here and push
// a colliding key one frame later instead.
function snapTimes(ks) {
  var out = [], prev = -1e9;
  for (var i = 0; i < ks.length; i++) {
    var f = Math.round(ks[i][0] * FPS);
    if (f <= prev) f = prev + 1;
    prev = f; out.push([f / FPS, ks[i][1]]);
  }
  return out;
}
function keys(prop, ks, ease) {
  ks = snapTimes(ks);
  for (var i = 0; i < ks.length; i++) prop.setValueAtTime(ks[i][0], ks[i][1]);
  if (ease) setEase(prop, ease, ease);
}
function setEase(prop, inInf, outInf) {
  var dims = prop.value instanceof Array ? prop.value.length : 1;
  if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) dims = 1;
  for (var k = 1; k <= prop.numKeys; k++) {
    var a = [], b = [];
    for (var d = 0; d < dims; d++) { a.push(new KeyframeEase(0, inInf)); b.push(new KeyframeEase(0, outInf)); }
    prop.setTemporalEaseAtKey(k, a, b);
  }
}
// ease-out cubic (documents arrive with inertia): fast start, long settle into the last key
function keysOut(prop, ks) {
  ks = snapTimes(ks);
  for (var i = 0; i < ks.length; i++) prop.setValueAtTime(ks[i][0], ks[i][1]);
  setEase(prop, 80, 0.1);
}

function fx(layer, name, values) {
  var e = layer.property("Effects").addProperty(name);
  for (var k in values) {
    var path = k.split("/"), p = e;
    for (var i = 0; i < path.length; i++) p = p.property(path[i]);
    p.setValue(values[k]);
  }
  return e;
}

// soft overhead tungsten shadow: blur 25, distance 18, opacity 40 %
function shadow(l) { return fx(l, "Drop Shadow", {"Shadow Color": [0, 0, 0], "Opacity": 102, "Direction": 165, "Distance": 18, "Softness": 25}); }

// text layer; z puts it in 3D
function txt(c, s, font, size, rgb, pos, just, tracking) {
  var t = c.layers.addText(s);
  var p = t.property("Source Text"), d = p.value;
  d.font = font; d.fontSize = size; d.fillColor = rgb; d.applyFill = true; d.applyStroke = false;
  d.justification = just || ParagraphJustification.CENTER_JUSTIFY;
  if (tracking) d.tracking = tracking;
  p.setValue(d);
  if (pos.length === 3) t.threeDLayer = true;
  T(t).property("Position").setValue(pos);
  return t;
}
// typewriter: characters appear from `at` at `cps` per second. EffectCraft's expressions have no substr()
// (it silently shows the full text), and an empty result also falls back to the full text: use slice, return a space.
function typeOn(t, s, at, cps) {
  t.property("Source Text").expression = 'var s = "' + s.replace(/"/g, '\\"') + '"; var n = Math.floor((time - ' + at + ') * ' + cps + '); n > 0 ? s.slice(0, n) : " ";';
}
// letters rise into place left to right from `at` (opacity + position + blur animator)
function rise(t, at, dur) {
  var an = t.property("Text").property("Animators").addProperty("ADBE Text Animator");
  var pr = an.property("Properties");
  pr.addProperty("ADBE Text Opacity").setValue(0);
  pr.addProperty("ADBE Text Position 3D").setValue([0, 46, 0]);
  pr.addProperty("ADBE Text Blur").setValue([10, 10]);
  var sel = an.property("Selectors").addProperty("ADBE Text Selector");
  keys(sel.property("Start"), [[at, 0], [at + (dur || 0.7), 100]], 45);
}
// opacity window: fade in at a, out by b
function win(l, a, b, fi, fo) {
  fi = fi || 0.4; fo = fo || 0.4;
  keys(T(l).property("Opacity"), [[a - 0.001, 0], [a + fi, 100], [b - fo, 100], [b, 0]], 40);
}

// a piece of manila card stock (PhotoCraft texture) of w x h with the house shadow
function card(c, w, h, pos, name) {
  var l = c.layers.add(img("manila.png"));
  l.name = name || "Card";
  T(l).property("Scale").setValue([w / 2400 * 100, h / 1600 * 100, 100]);
  if (pos.length === 3) l.threeDLayer = true;
  T(l).property("Position").setValue(pos);
  shadow(l);
  return l;
}

// background plate: dark oiled oak (PhotoCraft) at Z = +350
function desk(c) {
  var d = c.layers.add(img("desk_oak.png"));
  d.name = "BG desk (Z+350)";
  d.threeDLayer = true;
  T(d).property("Position").setValue([W / 2, H / 2, 350]);
  T(d).property("Scale").setValue([80, 80, 100]);
  return d;
}

// one overhead warm tungsten key + low ambient
function lamp(c, intensity) {
  var amb = c.layers.addLight("Ambient", [W / 2, H / 2]);
  amb.lightType = LightType.AMBIENT;
  amb.property("Light Options").property("Intensity").setValue(28);
  var key = c.layers.addLight("Tungsten key", [W / 2, H / 2]);
  key.lightType = LightType.SPOT;
  T(key).property("Position").setValue([W / 2 + 80, H / 2 - 520, -900]);
  T(key).property("Point of Interest").setValue([W / 2, H / 2 - 40, 0]);
  key.property("Light Options").property("Intensity").setValue(intensity || 125);
  key.property("Light Options").property("Color").setValue(COL.tungsten);
  key.property("Light Options").property("Cone Angle").setValue(78);
  key.property("Light Options").property("Cone Feather").setValue(100);
  return key;
}

// dust motes floating in the lamp light (sees the comp camera)
function dust(c, amt) {
  var d = solid(c, [0, 0, 0], "Dust motes");
  fx(d, "CC Particle World", {
    "Birth Rate": 0.5 * (amt || 1), "Longevity (sec)": 6,
    "Producer/Radius X": 1.4, "Producer/Radius Y": 0.7, "Producer/Radius Z": 0.8,
    "Physics/Velocity": 0.015, "Physics/Gravity": -0.004,
    "Particle/Particle Type": 3, "Particle/Birth Size": 0.01, "Particle/Death Size": 0.006,
    "Particle/Max Opacity": 55, "Particle/Birth Color": [1, 0.9, 0.72], "Particle/Death Color": [0.95, 0.85, 0.7]
  });
  d.blendingMode = BlendingMode.ADD;
  return d;
}

// out-of-focus foreground occlusion at Z = -250 (a fountain pen resting at the frame edge)
function penFG(c, x, y, rot) {
  var l = c.layers.addShape();
  l.name = "FG pen (Z-250)";
  var g = l.property("Contents").addProperty("ADBE Vector Group");
  var r = g.property("Contents").addProperty("ADBE Vector Shape - Rect");
  r.property("Size").setValue([900, 54]);
  r.property("Roundness").setValue(27);
  var f = g.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  f.property("Color").setValue([0.10, 0.075, 0.05]);
  var r2 = l.property("Contents").addProperty("ADBE Vector Group");
  var rr = r2.property("Contents").addProperty("ADBE Vector Shape - Rect");
  rr.property("Size").setValue([170, 58]); rr.property("Position").setValue([300, 0]); rr.property("Roundness").setValue(20);
  r2.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue([0.55, 0.42, 0.2]);
  l.threeDLayer = true;
  T(l).property("Position").setValue([x, y, -250]);
  T(l).property("Z Rotation").setValue(rot || -18);
  return l;
}

// 35 mm camera with depth of field focused on Z = 0; continuous push-in (~0.6 % per second,
// i.e. 100 -> 106 % over 10 s) and a slow Dutch drift. opt: {x0,x1,y0,y1,d0,d1,push}
function rig(c, dur, opt) {
  opt = opt || {};
  // the paste: continuous push-in of 4–6 % over 8–10 s (0.4–0.75 % a second), Dutch drift of ±0.5° to 1.0°
  var push = Math.min(Math.max(opt.push || (1 + 0.006 * dur), 1 + 0.004 * dur), 1 + 0.0075 * dur);
  function dutch(v, sgn) { if (v === undefined || v === 0) v = 0.6 * sgn; var m = Math.min(1.0, Math.max(0.5, Math.abs(v))); return v < 0 ? -m : m; }
  opt.d0 = dutch(opt.d0, -1); opt.d1 = dutch(opt.d1, 1);
  if ((opt.d0 < 0) === (opt.d1 < 0)) opt.d1 = -opt.d1; // drift through level, not parked on one side
  var cam = c.layers.addCamera("Camera 35mm", [W / 2, H / 2]);
  cam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
  var co = cam.property("Camera Options");
  co.property("Zoom").setValue(ZOOM);
  co.property("Depth of Field").setValue(1);
  co.property("Aperture").setValue(opt.aperture || 200); // foreground at Z -250 blurs about 16 px (paste: 15–20 px)
  co.property("Blur Level").setValue(100);
  co.property("Focus Distance").expression = "-transform.position[2]"; // keep Z = 0 sharp while the camera dollies
  // opt.pull: the production file asks for a pull-back on some shots; same speed limits, reversed
  var zA = opt.pull ? -ZOOM / push : -ZOOM, zB = opt.pull ? -ZOOM : -ZOOM / push;
  keys(T(cam).property("Position"), [[0, [W / 2 + (opt.x0 || 0), H / 2 + (opt.y0 || 0), zA]], [dur, [W / 2 + (opt.x1 || 0), H / 2 + (opt.y1 || 0), zB]]], 55);
  keys(T(cam).property("Z Rotation"), [[0, opt.d0], [dur, opt.d1]], 50);
  return cam;
}

// a rubber stamp (precomp): crimson box + lines, ink bleed, multiply on paper
function stampComp(name, lines, size, w, h) {
  var c = comp(name, 30, w, h);
  var box = c.layers.addShape();
  var g = box.property("Contents").addProperty("ADBE Vector Group");
  var r = g.property("Contents").addProperty("ADBE Vector Shape - Rect");
  r.property("Size").setValue([w - 24, h - 24]);
  var st = g.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(COL.crimson); st.property("Stroke Width").setValue(Math.max(6, size / 9));
  T(box).property("Position").setValue([w / 2, h / 2]);
  var lh = size * 1.08, y0 = h / 2 - (lines.length - 1) * lh / 2 + size * 0.36;
  for (var i = 0; i < lines.length; i++) txt(c, lines[i], FONT.display, size, COL.crimson, [w / 2, y0 + i * lh], null, 60);
  var adj = solid(c, [1, 1, 1], "ink"); adj.adjustmentLayer = true;
  fx(adj, "Roughen Edges", {"Border": size > 80 ? 3 : 1.4, "Edge Sharpness": 1.6, "Scale": 60});
  return c;
}
// slam (the paste): stamps and red badges slam down with a 2-frame scale overshoot, 115 % -> 100 %
function slam(l, at, baseScale) {
  var s = baseScale || 100, f = 1 / FPS;
  keys(T(l).property("Scale"), [[at, [s * 1.15, s * 1.15, 100]], [at + 2 * f, [s, s, 100]]], 0);
  keys(T(l).property("Opacity"), [[0, 0], [at - f, 0], [at, 100]], 0);
}
