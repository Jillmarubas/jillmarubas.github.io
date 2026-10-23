// The compressor cutaway, built entirely in EffectCraft (no Remotion, no HyperFrames at render time).
//   effectcraft-cli script /abs/path/build.jsx --empty --save-as /abs/path/cutaway.ecproj
// Inputs (made by remotion/src/cutaway/effectcraft/): assets/*.glb (the parts, pre-cut at z = 0 with
// solid section faces) and anim.jsx (every frame's camera, part positions, crank angle, gas and labels,
// from the same maths as the Remotion and HyperFrames versions).
#include "lib.jsx"
#include "anim.jsx"

var comp = app.project.items.addComp("Compressor Cutaway", W, H, 1, 27, FPS);
comp.renderer = "ADBE Advanced 3d";
comp.motionBlur = true;
comp.shutterAngle = 180;
comp.motionBlurSamplesPerFrame = 8;
var CID = comp.layers.__comp;
function cmd(id, o) { o = o || {}; o.comp = CID; return __call(id, o); }

// ---------- background (bottom) ----------
var bg = comp.layers.addSolid([0.93, 0.94, 0.95], "Background", W, H, 1);
var ramp = bg.property("Effects").addProperty("Gradient Ramp");
ramp.property("Start of Ramp").setValue([960, 480]);
ramp.property("Start Color").setValue([0.984, 0.984, 0.988]);
ramp.property("End of Ramp").setValue([960 + 1150, 480 + 380]);
ramp.property("End Color").setValue([0.863, 0.875, 0.89]);
ramp.property("Ramp Shape").setValue(2);

var envImg = comp.layers.add(app.project.importFile(new ImportOptions(new File(ROOT + "/assets/studio_env.png"))));
envImg.name = "Studio environment";
cmd("layer.environment", { layers: [envImg.__id], on: true });

// ---------- 3D: parts ----------
var L = {};
var names = ["body", "shellFront", "stator", "crank", "pump", "piston", "rod", "plate", "reedSuc", "reedDis", "head", "muffler", "distube"];
var shadowIds = [];
for (var i = 0; i < names.length; i++) {
  var l = model(comp, names[i]);
  l.threeDLayer = true;
  l.motionBlur = true;
  L[names[i]] = l;
  shadowIds.push(l.__id);
}
cmd("material.set", { layers: shadowIds, castsShadows: "on", acceptsShadows: "on" });
tr(L.body, "Position").setValue([960, 540, 0]);
tr(L.distube, "Position").setValue([960, 540, 0]);
bake(tr(L.distube, "Opacity"), ANIM.distubeOpacity);
bake(tr(L.shellFront, "Position"), ANIM.shellFront);
bake(tr(L.shellFront, "Opacity"), ANIM.shellFrontOpacity);
bake(tr(L.stator, "Position"), ANIM.stator);
bake(tr(L.crank, "Position"), ANIM.rotor);
bake(tr(L.crank, "Y Rotation"), ANIM.crankAngle);
bake(tr(L.pump, "Position"), ANIM.pump);
bake(tr(L.piston, "Position"), ANIM.piston);
bake(tr(L.rod, "Position"), ANIM.rod);
bake(tr(L.rod, "Y Rotation"), ANIM.rodAngle);
bake(tr(L.plate, "Position"), ANIM.plate);
bake(tr(L.reedSuc, "Position"), ANIM.reedSuc);
bake(tr(L.reedDis, "Position"), ANIM.reedDis);
bake(tr(L.reedSuc, "Z Rotation"), ANIM.reedSucAngle);
bake(tr(L.reedDis, "Z Rotation"), ANIM.reedDisAngle);
bake(tr(L.head, "Position"), ANIM.head);
bake(tr(L.muffler, "Position"), ANIM.muffler);
bake(tr(L.muffler, "Opacity"), ANIM.mufflerOpacity);

// Shadow catcher on the floor: shows only the shadows that fall on it.
var floor = prim(comp, "plane", "Floor shadows", { width: 9000, height: 9000, position: [960, 540, 0] });
tr(floor, "X Rotation").setValue(90);
cmd("material.set", { layers: [floor.__id], acceptsShadows: "only", castsShadows: "off" });

// ---------- 3D: gas ----------
function gas(prefix, n, colorTrack, rgb) {
  for (var i = 0; i < n; i++) {
    var g = prim(comp, "sphere", prefix + i, { radius: 1.25 * META.S, segments: 12, rings: 8, baseColor: rgb, acceptsLights: false, castsShadows: false });
    g.motionBlur = true;
    bake(tr(g, "Position"), ANIM[prefix + i]);
    bake(tr(g, "Scale"), ANIM[prefix + "S" + i], function (v) { return [v, v, v]; });
    if (colorTrack) bake(g.property("Material Options").property("Base Color"), colorTrack);
  }
}
gas("gc", META.N_CYL, ANIM.gasColor, "#1f6fff");
gas("gs", META.N_SUC, null, "#2575ff");
gas("gd", META.N_DIS, null, "#ff4a1c");

// ---------- 3D: lights and camera ----------
var key = comp.layers.__new(cmd("layer.newLight", { name: "Key light", kind: "Parallel", intensity: 115, castsShadows: true, shadowDarkness: 55, shadowDiffusion: 40 }));
tr(key, "Position").setValue([960 - 1400, 540 - 2400, -1800]);
tr(key, "Point of Interest").setValue([960, 540, 0]);
var fill = comp.layers.__new(cmd("layer.newLight", { name: "Fill light", kind: "Parallel", intensity: 30, castsShadows: false }));
tr(fill, "Position").setValue([960 + 1600, 540 - 1000, -1200]);
tr(fill, "Point of Interest").setValue([960, 540, 0]);
comp.layers.__new(cmd("layer.newLight", { name: "Studio light (environment)", kind: "Environment", intensity: 75 }));
comp.layers.__new(cmd("layer.newLight", { name: "Ambient", kind: "Ambient", intensity: 12 }));
var cam = comp.layers.__new(cmd("layer.newCamera", { name: "Camera", zoom: META.zoom }));
bake(tr(cam, "Position"), ANIM.camPos);
bake(tr(cam, "Point of Interest"), ANIM.camPoi);

// ---------- 2D: labels pinned to the parts ----------
// Each label: a 3D null on the part (A_), a null holding how far in it is (K_ slider), a leader line
// with a dot, a white card and the words. Expressions project the null through the camera (toComp).
function track3D(name, track) {
  var n = comp.layers.addNull();
  n.name = name;
  n.threeDLayer = true;
  bake(tr(n, "Position"), track);
  return n;
}
function slider(name, track) {
  var n = comp.layers.addNull();
  n.name = name;
  var s = n.property("Effects").addProperty("Slider Control");
  bake(s.property("Slider"), track);
  return n;
}
function textLayer(str, font, size, rgb, just) {
  var t = comp.layers.addText(str);
  var d = t.property("Source Text").value;
  d.font = font;
  d.fontSize = size;
  d.fillColor = rgb;
  d.justification = just;
  t.property("Source Text").setValue(d);
  return t;
}
var INK = [0.086, 0.094, 0.11];
var MUTED = [0.333, 0.357, 0.388];
var ACC = [1, 0.416, 0.102];
var LABELS = [
  // id, anchor, title, sub, align, to-x expression, to-y expression, accent dot
  ["shell", "shell", "Sealed steel shell", "", "right", "A[0] + 150", "A[1] - 110", false],
  ["crank", "crank", "Crankshaft", "", "right", "1330", "A[1] - 40", false],
  ["motor", "motor", "Electric motor", "", "right", "1330", "A[1] + 10", false],
  ["springs", "springs", "Springs", "soak up vibration", "right", "1330", "A[1] - 50", false],
  ["piston", "piston", "Piston", "", "left", "590", "A[1] - 40", false],
  ["valves", "valves", "Valves", "", "left", "590", "A[1] + 70", false],
  ["suction", "cylinder", "1  Suction", "cool, low-pressure gas pulled in", "center", "A[0]", "A[1] - 230", true],
  ["compression", "cylinder", "2  Compression", "squeezed into less space, it heats up", "center", "A[0]", "A[1] - 230", true],
  ["discharge", "cylinder", "3  Discharge", "hot, high-pressure gas pushed out", "center", "A[0]", "A[1] - 230", true],
  ["speed", "cylinder", "Real speed: ~50 strokes a second", "fixed-speed motor on 50 Hz power", "center", "A[0]", "A[1] - 230", false],
  ["outlet", "outlet", "To the condenser", "hot, high-pressure gas", "left", "A[0] - 120", "A[1] - 150", true],
];
var made = {};
for (var i = 0; i < LABELS.length; i++) {
  var d = LABELS[i];
  var id = d[0], anc = d[1], title = d[2], sub = d[3], align = d[4], hasSub = sub !== "";
  if (!made[anc]) { track3D("A_" + anc, ANIM["A_" + anc]); made[anc] = true; }
  slider("K_" + id, ANIM["K_" + id]);
  var head =
    'var A = thisComp.layer("A_' + anc + '").toComp([0, 0, 0]);' +
    'var k = thisComp.layer("K_' + id + '").effect("Slider Control")("Slider");' +
    "var ln = 1 - Math.pow(1 - Math.min(1, k * 1.8), 4);" +
    "var tx = 1 - Math.pow(1 - Math.max(0, Math.min(1, k * 1.8 - 0.55)), 4);" +
    "var to = [" + d[5] + ", " + d[6] + "];" +
    "var top = to[1] - " + (align === "center" ? (hasSub ? 104 : 70) : 36) + ";" +
    "var shift = (1 - tx) * " + (align === "right" ? -24 : align === "left" ? 24 : 0) + ";";
  // Words first (the card reads their size).
  var just = align === "center" ? ParagraphJustification.CENTER_JUSTIFY : align === "right" ? ParagraphJustification.LEFT_JUSTIFY : ParagraphJustification.RIGHT_JUSTIFY;
  var T1 = textLayer(title, "Inter-ExtraBold", 40, INK, just);
  T1.name = "T_" + id;
  var S1 = hasSub ? textLayer(sub, "Inter-Medium", 25, MUTED, just) : null;
  if (S1) S1.name = "S_" + id;
  var cardW =
    'var tw = thisComp.layer("T_' + id + '").sourceRectAtTime(time, false).width;' +
    (hasSub ? 'var sw = thisComp.layer("S_' + id + '").sourceRectAtTime(time, false).width; tw = Math.max(tw, sw);' : "") +
    "var cw = tw + 36; var ch = " + (hasSub ? 100 : 66) + ";";
  // Left edge of the card for each alignment.
  var cardX = align === "right" ? "to[0] + 14 + shift" : align === "left" ? "to[0] - 14 - cw + shift" : "to[0] - cw / 2";
  var textX = align === "right" ? "to[0] + 14 + 18 + shift" : align === "left" ? "to[0] - 14 - 18 + shift" : "to[0]";
  tr(T1, "Position").expression = head + cardW + "[" + textX + ", top + 44];";
  tr(T1, "Opacity").expression = head + "tx * 100;";
  if (S1) {
    tr(S1, "Position").expression = head + cardW + "[" + textX + ", top + 80];";
    tr(S1, "Opacity").expression = head + "tx * 100;";
  }
  // Card, line and dot in one shape layer drawn in comp space.
  var sh = comp.layers.addShape();
  sh.name = "Card_" + id;
  tr(sh, "Position").setValue([0, 0]);
  tr(sh, "Anchor Point").setValue([0, 0]);
  var root = sh.property("Contents");
  // Leader line.
  var gl = root.addProperty("ADBE Vector Group");
  gl.name = "Line";
  var lp = gl.property("Contents").addProperty("ADBE Vector Shape - Group");
  lp.property("Path").expression = head + "createPath([A.slice(0, 2), [A[0] + (to[0] - A[0]) * ln, A[1] + (to[1] - A[1]) * ln]], [], [], false);";
  var st = gl.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(INK);
  st.property("Stroke Width").setValue(2.2);
  st.property("Opacity").expression = head + "Math.min(1, k * 3) * 100;";
  // Card.
  var gc = root.addProperty("ADBE Vector Group");
  gc.name = "Card";
  var rc = gc.property("Contents").addProperty("ADBE Vector Shape - Rect");
  rc.property("Size").expression = head + cardW + "[cw, ch];";
  rc.property("Position").expression = head + cardW + "[" + cardX + " + cw / 2, top + ch / 2];";
  rc.property("Roundness").setValue(14);
  var fc = gc.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  fc.property("Color").setValue([1, 1, 1]);
  fc.property("Opacity").expression = head + "tx * 92;";
  // Dot on the part.
  var gd = root.addProperty("ADBE Vector Group");
  gd.name = "Dot";
  var el = gd.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
  el.property("Position").expression = head + "A.slice(0, 2);";
  el.property("Size").expression = head + "var r = 14 * (1 - Math.pow(1 - Math.min(1, k * 3), 4)); [r, r];";
  var dst = gd.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  dst.property("Color").setValue([1, 1, 1]);
  dst.property("Stroke Width").setValue(2.5);
  var df = gd.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  df.property("Color").setValue(d[7] ? ACC : INK);
  // Card below its words (the title was added first, so it is the lower of the two).
  sh.moveAfter(T1);
}

// ---------- 2D: title and close-up furniture ----------
function key2(prop, ks) { for (var i = 0; i < ks.length; i++) prop.setValueAtTime(ks[i][0], ks[i][1]); }
var lead = textLayer("What’s inside a fridge", "Fraunces-Italic", 54, [0.231, 0.251, 0.282], ParagraphJustification.LEFT_JUSTIFY);
tr(lead, "Position").setValue([110, 448]);
var big = textLayer("COMPRESSOR", "Inter-ExtraBold", 104, INK, ParagraphJustification.LEFT_JUSTIFY);
tr(big, "Position").setValue([104, 548]);
var bar = comp.layers.addShape();
bar.name = "Title bar";
tr(bar, "Position").setValue([110, 590]);
tr(bar, "Anchor Point").setValue([0, 0]);
var bg1 = bar.property("Contents").addProperty("ADBE Vector Group");
var br = bg1.property("Contents").addProperty("ADBE Vector Shape - Rect");
br.property("Size").setValue([150, 8]);
br.property("Position").setValue([75, 4]);
br.property("Roundness").setValue(4);
bg1.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(ACC);
key2(tr(bar, "Scale"), [[0.8, [0, 100]], [1.4, [100, 100]]]);
var titleLayers = [lead, big, bar];
for (var i = 0; i < titleLayers.length; i++) {
  key2(tr(titleLayers[i], "Opacity"), [[0.3, 0], [1.0, 100], [3.0, 100], [3.5, 0]]);
}
key2(tr(lead, "Position"), [[0.3, [110, 478]], [1.0, [110, 448]]]);
key2(tr(big, "Position"), [[0.3, [104, 578]], [1.0, [104, 548]]]);

function pill(name, w, x, y) {
  var p = comp.layers.addShape();
  p.name = name;
  tr(p, "Position").setValue([0, 0]);
  tr(p, "Anchor Point").setValue([0, 0]);
  var g = p.property("Contents").addProperty("ADBE Vector Group");
  var r = g.property("Contents").addProperty("ADBE Vector Shape - Rect");
  r.property("Size").setValue([w, 52]);
  r.property("Position").setValue([x + w / 2, y + 26]);
  r.property("Roundness").setValue(26);
  var f = g.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  f.property("Color").setValue([1, 1, 1]);
  f.property("Opacity").setValue(90);
  return p;
}
var furniture = [];
furniture.push(pill("Slow motion pill", 250, 70, 64));
var sdot = comp.layers.addShape();
sdot.name = "Slow motion dot";
tr(sdot, "Position").setValue([0, 0]);
tr(sdot, "Anchor Point").setValue([0, 0]);
var sg = sdot.property("Contents").addProperty("ADBE Vector Group");
var se = sg.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
se.property("Size").setValue([12, 12]);
se.property("Position").setValue([98, 90]);
sg.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(ACC);
furniture.push(sdot);
var stx = textLayer("SLOW MOTION", "Inter-Bold", 24, MUTED, ParagraphJustification.LEFT_JUSTIFY);
tr(stx, "Position").setValue([116, 99]);
furniture.push(stx);
furniture.push(pill("Legend pill", 460, 730, 958));
var ltc = textLayer("COLD", "Inter-Bold", 24, MUTED, ParagraphJustification.LEFT_JUSTIFY);
tr(ltc, "Position").setValue([752, 993]);
var lth = textLayer("HOT", "Inter-Bold", 24, MUTED, ParagraphJustification.LEFT_JUSTIFY);
tr(lth, "Position").setValue([1118, 993]);
var lg = comp.layers.addSolid([1, 0, 0], "Legend gradient", 250, 10, 1);
tr(lg, "Position").setValue([960, 984]);
var lr = lg.property("Effects").addProperty("Gradient Ramp");
lr.property("Start of Ramp").setValue([0, 5]);
lr.property("Start Color").setValue([0.122, 0.435, 1]);
lr.property("End of Ramp").setValue([250, 5]);
lr.property("End Color").setValue([1, 0.231, 0.071]);
lr.property("Ramp Shape").setValue(1);
furniture.push(ltc, lth, lg);
for (var i = 0; i < furniture.length; i++) key2(tr(furniture[i], "Opacity"), [[14.1, 0], [14.5, 100], [22.9, 100], [23.3, 0]]);

// ---------- finish ----------
var fin = comp.layers.addSolid([0, 0, 0], "Grain + vignette", W, H, 1);
fin.adjustmentLayer = true;
fin.property("Effects").addProperty("Noise").property("Amount of Noise").setValue(2.5);
fin.property("Effects").addProperty("CC Vignette").property("Amount").setValue(22);
var endFade = comp.layers.addSolid([0.925, 0.933, 0.945], "End fade", W, H, 1);
key2(tr(endFade, "Opacity"), [[26.45, 0], [26.95, 100]]);
var snd = comp.layers.add(app.project.importFile(new ImportOptions(new File(ROOT + "/assets/compressor_sfx.wav"))));
snd.name = "Sound";
writeLn("layers: " + comp.numLayers);
