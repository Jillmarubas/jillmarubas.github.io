// Shots B, C, D, the rain precomps and the transition gradients.
var STONE = [0.71, 0.68, 0.62];
var PROFILE = 'M 120 600 L 120 470 C 120 430 100 420 95 380 C 70 330 60 250 90 180 C 120 100 200 70 260 90 C 300 105 318 150 320 190 L 345 250 L 330 262 C 335 280 332 290 325 300 C 333 312 330 322 322 332 C 318 350 315 365 300 375 C 280 385 260 385 250 395 L 255 470 C 300 490 360 520 400 560 L 400 600 Z';
var SHOULDERS = 'M 30 520 C 50 390 180 335 300 325 C 420 335 550 390 570 520 Z';
var BUST_BODY = 'M 10 420 C 20 300 90 255 150 250 C 210 255 280 300 290 420 Z';

// A blurred, brighter copy behind a silhouette = rim light.
function rimmed(comp, name, shapes, fill, rim, blur, offset) {
  var r = pathLayer(comp, name + " rim", shapes, rim);
  fx(r, "Gaussian Blur", {"Blurriness": blur});
  r.property("Transform").property("Position").setValue([offset[0], offset[1]]);
  var s = pathLayer(comp, name, shapes, fill);
  return [r, s];
}

// ------------------------------------------------------------------ Shot B: a place in a void
function buildShotB() {
  var c = newComp("B Void", 4.6);
  solid(c, [0.016, 0.02, 0.028], "Void");
  var stars = solid(c, [0, 0, 0], "Stars");
  fx(stars, "Fractal Noise", {"Contrast": 1200, "Brightness": -600, "Transform/Scale": 5, "Complexity": 1});
  stars.property("Transform").property("Opacity").setValue(18);

  // Glow pool under the building (blurred warm ellipse, Add).
  var pool = pathLayer(c, "Glow pool", [ellipseShape(W / 2, 700, 520, 90)], [1, 0.81, 0.54]);
  fx(pool, "Gaussian Blur", {"Blurriness": 70});
  pool.blendingMode = BlendingMode.ADD;
  pool.property("Transform").property("Opacity").setValue(45);
  pool.threeDLayer = true;
  pool.property("Transform").property("Position").setValue([0, 0, 20]);

  // Building: wings set back, main block, portico in front. All 3D, lit by the key light.
  var win = [];
  function windows(x0, y0, cols, rows, dx, dy) {
    for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) win.push(rect(x0 + q * dx, y0 + r * dy, 14, 40));
  }
  var wings = pathLayer(c, "Wings", [rect(560, 470, 260, 190), rect(1100, 470, 260, 190)], [0.6, 0.57, 0.52]);
  wings.threeDLayer = true;
  wings.property("Transform").property("Position").setValue([0, 0, 140]);
  win = []; windows(585, 500, 7, 2, 34, 80); windows(1125, 500, 7, 2, 34, 80);
  var ww = pathLayer(c, "Wing windows", win, [1, 0.8, 0.5]);
  ww.threeDLayer = true; ww.property("Transform").property("Position").setValue([0, 0, 139]);
  var main = pathLayer(c, "Main block", [rect(780, 440, 360, 230)], [0.55, 0.52, 0.48]);
  main.threeDLayer = true; main.property("Transform").property("Position").setValue([0, 0, 60]);
  win = []; windows(800, 470, 9, 2, 38, 95);
  var mw = pathLayer(c, "Main windows", win, [1, 0.8, 0.5]);
  mw.threeDLayer = true; mw.property("Transform").property("Position").setValue([0, 0, 59]);
  var port = [];
  for (var k = 0; k < 6; k++) port.push(rect(800 + k * 60, 470, 18, 200));
  port.push(rect(780, 450, 360, 22)); // entablature
  var ped = new Shape(); ped.vertices = [[770, 450], [1150, 450], [960, 385]]; ped.closed = true; port.push(ped);
  port.push(rect(740, 670, 440, 14)); port.push(rect(720, 684, 480, 14)); port.push(rect(700, 698, 520, 14)); // steps
  var por = pathLayer(c, "Portico", port, STONE);
  por.threeDLayer = true;
  por.property("Transform").property("Position").setValue([0, 0, 0]);

  var amb = c.layers.addLight("Ambient", [W / 2, H / 2]);
  amb.lightType = LightType.AMBIENT;
  amb.property("Light Options").property("Intensity").setValue(35);
  var key = c.layers.addLight("Key", [W / 2, H / 2]);
  key.lightType = LightType.SPOT;
  key.property("Transform").property("Position").setValue([1100, -500, -700]);
  key.property("Transform").property("Point of Interest").setValue([W / 2, 560, 0]);
  key.property("Light Options").property("Intensity").setValue(115);
  key.property("Light Options").property("Color").setValue([1, 0.9, 0.77]);
  key.property("Light Options").property("Cone Angle").setValue(70);
  key.property("Light Options").property("Cone Feather").setValue(90);

  var cam = c.layers.addCamera("Camera", [W / 2, H / 2]);
  cam.property("Transform").property("Point of Interest").setValue([W / 2, 560, 0]);
  keys(cam.property("Transform").property("Position"), [[0, [W / 2 - 220, 420, -1500]], [3.2, [W / 2 + 160, 380, -2600]]], 75);

  // Dust motes (CC Particle World sees the comp camera).
  var dust = solid(c, [0, 0, 0], "Dust");
  fx(dust, "CC Particle World", {
    "Birth Rate": 0.6, "Longevity (sec)": 5,
    "Producer/Radius X": 1.2, "Producer/Radius Y": 0.6, "Producer/Radius Z": 1.2,
    "Physics/Velocity": 0.02, "Physics/Gravity": -0.01,
    "Particle/Particle Type": 3, "Particle/Birth Size": 0.012, "Particle/Death Size": 0.008,
    "Particle/Max Opacity": 70, "Particle/Birth Color": [1, 0.93, 0.8], "Particle/Death Color": [0.9, 0.85, 0.75]
  });
  dust.blendingMode = BlendingMode.ADD;

  tintLayer(c, [0.18, 0.37, 0.56], 50);

  // Over-the-shoulder silhouette slides up at 2.0 s, soft focus.
  var k2 = 0.95 * H / 520;
  var sh = [ellipseShape(0, 0, 88 * k2, 108 * k2)];
  var shapesSh = [svgShape(SHOULDERS, -300 * k2, -170 * k2, k2), ellipseShape(0, 0, 88 * k2, 108 * k2), rect(-45 * k2, 80 * k2, 90 * k2, 90 * k2)];
  var pair = rimmed(c, "Shoulders", shapesSh, [0.09, 0.08, 0.075], [0.62, 0.71, 1], 10, [-5, -6]);
  for (var j = 0; j < 2; j++) {
    var L = pair[j];
    fx(L, "Gaussian Blur", {"Blurriness": 6});
    var x = W * 0.3 + (j === 0 ? -5 : 0), y0 = H + 0.6 * H, y1 = H * 0.55 + (j === 0 ? -6 : 0);
    keys(L.property("Transform").property("Position"), [[2.0, [x, y0]], [2.9, [x, y1]], [4.6, [x + 16, y1]]], 70);
    L.inPoint = 2.0;
  }
  return c;
}

// ------------------------------------------------------------------ Shot C: face-off
function buildShotC() {
  var c = newComp("C FaceOff", 4.2);
  var bg = c.layers.add(img("photo.png"));
  bg.property("Transform").property("Scale").setValue([82, 82]);
  fx(bg, "Gaussian Blur", {"Blurriness": 3});
  fx(bg, "Exposure", {"Master/Exposure": -0.9});
  tintLayer(c, [1, 0.23, 0.06], 70);
  var k = 1.15 * H / 600;
  var by = H + 0.08 * H - 600 * k; // top of the profile so its bottom sits below frame
  var left = rimmed(c, "Left", [svgShape(PROFILE, -0.18 * H, by, k, false)], [0.1, 0.09, 0.08], [1, 0.54, 0.24], 5, [6, -4]);
  var right = rimmed(c, "Right", [svgShape(PROFILE, W + 0.18 * H, by, k, true)], [0.1, 0.09, 0.08], [1, 0.7, 0.36], 5, [-6, -4]);
  for (var j = 0; j < 2; j++) {
    var o = j === 0 ? [6, -4] : [0, 0];
    keys(left[j].property("Transform").property("Position"), [[0, [o[0], o[1]]], [3.8, [70 + o[0], o[1]]]], 33);
    var o2 = j === 0 ? [-6, -4] : [0, 0];
    keys(right[j].property("Transform").property("Position"), [[0, [o2[0], o2[1]]], [3.8, [-70 + o2[0], o2[1]]]], 33);
  }
  var vig = solid(c, [0, 0, 0], "Edge darkening");
  vig.adjustmentLayer = true;
  fx(vig, "CC Vignette", {"Amount": 60});
  return c;
}

// ------------------------------------------------------------------ bills and coins (rain sprites)
function buildBill() {
  var c = app.project.items.addComp("Bill", 240, 108, 1, 16, FPS);
  var body = c.layers.addShape(); body.name = "Note";
  var g = body.property("Contents").addProperty("ADBE Vector Group").property("Contents");
  g.addProperty("ADBE Vector Shape - Group").property("Path").setValue(rect(-120, -54, 240, 108));
  var f = g.addProperty("ADBE Vector Graphic - Fill"); f.property("Color").setValue([0.73, 0.78, 0.64]);
  body.property("Transform").property("Position").setValue([120, 54]);
  var line = pathLayer(c, "Border", [rect(8, 8, 224, 92), rect(16, 16, 208, 76)], null, [0.37, 0.45, 0.31], 3);
  line.property("Transform").property("Position").setValue([0, 0]);
  var oval = pathLayer(c, "Oval", [ellipseShape(120, 54, 30, 36)], [0.56, 0.64, 0.49]);
  oval.property("Transform").property("Position").setValue([0, 0]);
  return c;
}
function buildCoin() {
  var c = app.project.items.addComp("Coin", 120, 120, 1, 16, FPS);
  var a = pathLayer(c, "Coin", [ellipseShape(60, 60, 58, 58)], [0.89, 0.69, 0.29]);
  a.property("Transform").property("Position").setValue([0, 0]);
  var b = pathLayer(c, "Ring", [ellipseShape(60, 60, 44, 44)], null, [0.43, 0.27, 0.06], 5);
  b.property("Transform").property("Position").setValue([0, 0]);
  var h = pathLayer(c, "Shine", [ellipseShape(46, 40, 16, 12)], [1, 0.95, 0.72]);
  h.property("Transform").property("Position").setValue([0, 0]);
  fx(h, "Gaussian Blur", {"Blurriness": 6});
  return c;
}

// Rain: `count` 3D copies of `item`, each driven by an expression of time (deterministic).
// mode 'toward': flying at the lens; 'fall': falling with depth. densityExpr gives 0..1.
function addRain(comp, item, count, mode, start, scalePct, densityExpr, seed) {
  for (var k = 0; k < count; k++) {
    var l = comp.layers.add(item);
    l.threeDLayer = true;
    l.motionBlur = true;
    l.name = mode + " " + k;
    var head = 'seedRandom(' + (seed * 1000 + k) + ', true); var r = []; for (var q = 0; q < 12; q++) r.push(random());' +
      'var t = time - ' + start + '; var life = (' + (mode === "toward" ? 2.0 : 2.6) + ') * (0.8 + 0.4 * r[1]);' +
      'var age = ((t + r[3] * life) % life + life) % life; var u = age / life;';
    var pos = mode === "toward"
      ? head + 'var z = (3.5 + 1.5 * r[2]) * (1 - u) + 0.15 * u; var x = (r[4] - 0.5) * 3.2 + 0.12 * Math.sin(age * (2 + 3 * r[5]) + r[6] * 6.28); var y = (r[7] - 0.5) * 1.6 + 0.6 * u;' +
        '[' + W / 2 + ' + x * 972, ' + H / 2 + ' + y * 972, z * 1200 - 1200];'
      : head + 'var z = 0.35 + 2.8 * r[2]; var x = (r[4] - 0.5) * 3.2 + 0.12 * Math.sin(age * (2 + 3 * r[5]) + r[6] * 6.28); var y = -1.1 + 2.4 * u;' +
        '[' + W / 2 + ' + x * 972 * z, ' + H / 2 + ' + y * 972 * z, z * 1200 - 1200];';
    l.property("Transform").property("Position").expression = pos;
    l.property("Transform").property("Scale").setValue([scalePct, scalePct, scalePct]);
    l.property("Transform").property("Z Rotation").expression = head + '(r[8] * 360 + age * (r[9] - 0.5) * 340);';
    l.property("Transform").property("X Rotation").expression = head + '(age * (60 + 240 * r[10]) + r[11] * 360);';
    l.property("Transform").property("Opacity").expression = 'var d = ' + densityExpr + '; (' + k + ' / ' + count + ' < d) ? 100 : 0;';
  }
}

// ------------------------------------------------------------------ Shot D: lineup
function buildShotD(coin) {
  var c = newComp("D Lineup", 4.1);
  var bg = c.layers.add(img("clean.png"));
  keys(bg.property("Transform").property("Scale"), [[0, [84, 84]], [4.1, [92, 92]]], 0);
  fx(bg, "Tint", {"Map Black To": [0.07, 0.05, 0.02], "Map White To": [0.95, 0.85, 0.65], "Amount to Tint": 70});
  fx(bg, "Exposure", {"Master/Exposure": -1.2});
  var kB = 520 / 420;
  var items = [
    {side: -1, x: 520, y: 1000, at: 0.5, h: 520, hat: true, dim: 0.75},
    {side: 1, x: 1400, y: 1000, at: 0.65, h: 520, hat: false, dim: 0.75},
    {side: -1, x: 760, y: 1080, at: 0.8, h: 640, hat: false, dim: 1},
    {side: 1, x: 1160, y: 1080, at: 0.95, h: 640, hat: true, dim: 1}
  ];
  for (var i = 0; i < items.length; i++) {
    var it = items[i], k = it.h / 420;
    var shapes = [svgShape(BUST_BODY, -150 * k, -420 * k, k), ellipseShape(0, -270 * k, 62 * k, 78 * k)];
    if (it.hat) { shapes.push(rect(-58 * k, -400 * k, 116 * k, 74 * k)); shapes.push(rect(-80 * k, -330 * k, 160 * k, 12 * k)); }
    var dark = [0.12 * it.dim, 0.1 * it.dim, 0.08 * it.dim];
    var pair = rimmed(c, "Bust " + i, shapes, dark, [1, 0.82, 0.48].concat([]), 6, [4, -5]);
    for (var j = 0; j < 2; j++) {
      var L = pair[j], off = j === 0 ? [4, -5] : [0, 0];
      var x0 = it.side < 0 ? -it.h * 0.6 : W + it.h * 0.6;
      keys(L.property("Transform").property("Position"), [[it.at, [x0 + off[0], it.y + off[1]]], [it.at + 0.7, [it.x + off[0], it.y + off[1]]]], 85);
      L.motionBlur = true;
      if (j === 0) L.property("Transform").property("Opacity").setValue(50);
    }
  }
  addRain(c, coin, 40, "fall", 0, 26, '(time < 1.6) ? 0 : linear(time, 1.6, 2.0, 0, 0.6)', 9);
  var camD = c.layers.addCamera("Camera", [W / 2, H / 2]);
  camD.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
  camD.property("Camera Options").property("Zoom").setValue(1200);
  camD.property("Transform").property("Position").setValue([W / 2, H / 2, -1200]);

  // Gold bars sweep past, near and out of focus.
  var bars = [];
  for (var b = 0; b < 5; b++) {
    var s = new Shape(), o = (b % 2) * 20, y = 430 - b * 100;
    s.vertices = [[30 + o, y], [390 - o, y], [360 - o, y - 80], [60 + o, y - 80]]; s.closed = true; bars.push(s);
  }
  var gb = pathLayer(c, "Gold bars", bars, [0.89, 0.68, 0.27]);
  gb.property("Transform").property("Anchor Point").setValue([210, 260]);
  gb.property("Transform").property("Scale").setValue([135, 135]);
  keys(gb.property("Transform").property("Position"), [[0.1, [420, 760]], [2.9, [-260, 760]]], 33);
  fx(gb, "Gaussian Blur", {"Blurriness": 14});
  tintLayer(c, [0.85, 0.64, 0.25], 45);
  return c;
}

// ------------------------------------------------------------------ transition gradients
function buildInkGrad() {
  var c = newComp("Ink gradient", 16);
  var l = solid(c, [0, 0, 0], "Ramp");
  fx(l, "Gradient Ramp", {"Start of Ramp": [0, H / 2], "Start Color": [0, 0, 0], "End of Ramp": [W, H / 2], "End Color": [1, 1, 1]});
  var n = solid(c, [0, 0, 0], "Noise");
  fx(n, "Fractal Noise", {"Transform/Scale": 260, "Complexity": 5, "Contrast": 140});
  n.property("Transform").property("Opacity").setValue(38);
  return c;
}
function buildMeltGrad() {
  var c = newComp("Melt gradient", 16);
  var n = solid(c, [0, 0, 0], "Fine noise");
  fx(n, "Fractal Noise", {"Transform/Scale": 12, "Complexity": 3, "Contrast": 120});
  return c;
}
