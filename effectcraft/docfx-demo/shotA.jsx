// Shot A (4.2 s): archive photo pull-back through 3D layers (cut-outs from prep_depth.py),
// warm tint, decode title with glow.
function buildShotA() {
  var c = newComp("A Archive", 4.2);
  var D = 1200; // camera zoom; a layer at distance d from the camera is scaled d / D
  function card(name, dist) {
    var l = c.layers.add(img(name));
    l.threeDLayer = true;
    l.property("Transform").property("Position").setValue([W / 2, H / 2, dist - D]);
    l.property("Transform").property("Scale").setValue([dist / D * 100, dist / D * 100, 100]);
    return l;
  }
  // Depths from layers.json (background 0.057, mid 0.299, near 0.507) through the same
  // inverse-depth mapping as prep_depth.py / depthscene.js.
  function dist(disp) { return 1 / (1 / 4200 + disp * (1 / 720 - 1 / 4200)); }
  card("clean.png", dist(0.0573));
  card("obj_mid.png", dist(0.2985));
  card("obj_near.png", dist(0.5069));

  var cam = c.layers.addCamera("Camera", [W / 2, H / 2]);
  cam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
  cam.property("Camera Options").property("Zoom").setValue(D);
  keys(cam.property("Transform").property("Position"), [[0, [W / 2 - 30, H / 2 - 10, -D + 60]], [4.0, [W / 2 + 30, H / 2 + 6, -D - 120]]], 60);

  tintLayer(c, [1, 0.29, 0.07], 55);

  // Decode title: Source Text expression scrambles letters and resolves them in order.
  var t = c.layers.addText("THE DUST BOWL");
  var doc = t.property("Source Text").value;
  doc.font = "Fraunces-Black";
  doc.fontSize = 120;
  doc.fillColor = [0.965, 0.773, 0.604];
  doc.justification = ParagraphJustification.CENTER_JUSTIFY;
  t.property("Source Text").setValue(doc);
  t.property("Transform").property("Position").setValue([W / 2, H - 200]);
  t.property("Source Text").expression = [
    'var F = "THE DUST BOWL", at = 1.0, dur = 1.1, n = F.length - 1;',
    'var U = "ABCDEFGHJKLMNOPQRSTUVWXYZ", b = Math.floor(time * 15), s = "";',
    'for (var i = 0; i < F.length; i++) {',
    '  var ch = F.charAt(i);',
    '  if (ch == " ") { s += " "; continue; }',
    '  var st = at + (i / n) * dur * 0.35, rs = at + (0.25 + 0.75 * (i / n)) * dur;',
    '  if (time < st) { s += " "; continue; }',
    '  if (time >= rs) { s += ch; continue; }',
    '  seedRandom(i * 1000 + b, true);',
    '  s += U.charAt(Math.floor(random(U.length)));',
    '}',
    's;'
  ].join("\n");
  // Exit left to right: an opacity + blur animator whose range grows from the left.
  var an = t.property("Text").property("Animators").addProperty("ADBE Text Animator");
  an.property("Properties").addProperty("ADBE Text Opacity").setValue(0);
  an.property("Properties").addProperty("ADBE Text Blur").setValue([10, 10]);
  var sel = an.property("Selectors").addProperty("ADBE Text Selector");
  keys(sel.property("End"), [[3.3, 0], [3.8, 100]], 50);
  fx(t, "Glow", {"Glow Threshold": 40, "Glow Radius": 30, "Glow Intensity": 1.8, "Glow Colors": 2, "Color A": [1, 0.42, 0.1], "Color B": [1, 0.65, 0.3]});
  return c;
}
