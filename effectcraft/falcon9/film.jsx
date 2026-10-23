// Film toolkit for the Falcon 9 episode: word-synced timing, camera paths, labels, counters, dimension lines,
// propellant animation. Include after lib.jsx, rig.jsx and timing/<chapter>.jsx.
var INK = [0.086, 0.094, 0.11], MUTED = [0.333, 0.357, 0.388], WHITE = [1, 1, 1];
var ORANGE = [1, 0.353, 0.078], LOXC = [0.184, 0.525, 1], RP1C = [0.949, 0.706, 0], HEC = [0.604, 0.424, 1], N2C = [0.247, 0.816, 0.753];
var RED = [0.86, 0.16, 0.12];
var FR = 1 / FPS;

// ---------- timing ----------
// Start time (s) of the n-th (1-based) spoken word equal to `word` (case and punctuation ignored); end the
// word with "*" to match by prefix. A word that isn't in the voiceover stops the build, so a visual can never
// drift off its word.
var OFFSET = 0; // start of the shot being built: w() returns times inside that shot
function clean(s) { return s.toLowerCase().replace(/[^a-z0-9*]/g, ""); }
function findWord(word, n) {
  n = n || 1; var k = clean(word), pre = k.charAt(k.length - 1) === "*", c = 0;
  if (pre) k = k.slice(0, -1);
  for (var i = 0; i < TIMING.words.length; i++) {
    var x = clean(TIMING.words[i].w);
    if ((pre ? x.indexOf(k) === 0 : x === k) && ++c === n) return TIMING.words[i];
  }
  throw new Error("word not in voiceover: " + word + " #" + n);
}
function w(word, n) { return findWord(word, n).s - OFFSET; }
function wEnd(word, n) { return findWord(word, n).e - OFFSET; }
var MENTIONS = []; // every highlight/label, for the QC sync check: [time, id, kind]
function mention(t, id, kind) { MENTIONS.push([Math.round((t + OFFSET) * 1000) / 1000, id, kind]); }

// ---------- shots ----------
// A chapter is a main comp holding one sub-comp per shot (its own set, camera and lights), cut on a beat.
// build(scene, dur) runs with w() returning times inside the shot.
function chapterComp(name) { var m = app.project.items.addComp(name, W, H, 1, TIMING.duration, FPS); m.renderer = "ADBE Advanced 3d"; return m; }
function shot(main, name, t0, t1, S, build) {
  OFFSET = t0;
  var c = newComp(name, t1 - t0 + 2 * FR); // 2 spare frames: no frame may fall between two shots
  var sc = new Scene(c, S);
  build(sc, t1 - t0);
  OFFSET = 0;
  var l = main.layers.add(c);
  l.startTime = t0; l.inPoint = t0; l.outPoint = t1;
  return sc;
}

// ---------- easing and baking ----------
function ease(u) { u = Math.max(0, Math.min(1, u)); return u * u * u * (u * (u * 6 - 15) + 10); } // smootherstep
function lerp(a, b, u) { if (a.length === undefined) return a + (b - a) * u; var o = []; for (var i = 0; i < a.length; i++) o.push(a[i] + (b[i] - a[i]) * u); return o; }
// keys: [[t, value], ...] (values numbers or arrays), eased between each pair. Returns value at t.
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (var i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  return keys[keys.length - 1][1];
}
// Samples fn(t) on every frame from t0 to t1 into prop.
function bakeFn(prop, t0, t1, fn) {
  var ts = [], vs = [];
  for (var f = Math.round(t0 * FPS); f <= Math.round(t1 * FPS); f++) { var t = f * FR; ts.push(t); vs.push(fn(t)); }
  prop.setValuesAtTimes(ts, vs);
}
// Sparse eased keys: 8 samples per segment (enough for opacity/scale moves that last under ~2 s).
function animate(prop, keys) {
  var ts = [], vs = [];
  for (var i = 0; i < keys.length; i++) {
    if (i === 0) { ts.push(keys[0][0]); vs.push(keys[0][1]); continue; }
    var a = keys[i - 1], b = keys[i], n = Math.max(1, Math.min(8, Math.round((b[0] - a[0]) * FPS / 2)));
    for (var j = 1; j <= n; j++) { ts.push(a[0] + (b[0] - a[0]) * j / n); vs.push(lerp(a[1], b[1], ease(j / n))); }
  }
  prop.setValuesAtTimes(ts, vs);
}
function tr(l, n) { return l.property("Transform").property(n); }

// ---------- camera ----------
// keys: [[t, posMetres, targetMetres, fovDeg], ...]; every frame between first and last key is baked.
Scene.prototype.cameraPath = function (keys, tEnd) {
  var s = this, k0 = keys[0];
  var cam = this.camera(k0[1], k0[2], k0[3] || 34);
  var P = [], T = [], F = [];
  for (var i = 0; i < keys.length; i++) { P.push([keys[i][0], keys[i][1]]); T.push([keys[i][0], keys[i][2]]); F.push([keys[i][0], keys[i][3] || 34]); }
  var end = tEnd || keys[keys.length - 1][0];
  // A key with a 5th slot `true` reaches its position by a geometric dolly (see dollyPos).
  bakeFn(tr(cam, "Position"), 0, end, function (t) {
    for (var i = 1; i < keys.length; i++) if (keys[i][4] && t >= keys[i - 1][0] && t <= keys[i][0]) {
      var u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]), e = 0.5 - 0.5 * Math.cos(Math.PI * u);
      var q = dollyPos(keys[i - 1][1], keys[i - 1][2], keys[i][1], keys[i][2], e); return s.p(q[0], q[1], q[2]);
    }
    var p = keyed(P, t); return s.p(p[0], p[1], p[2]);
  });
  bakeFn(tr(cam, "Point of Interest"), 0, end, function (t) { var p = keyed(T, t); return s.p(p[0], p[1], p[2]); });
  var zoomed = false; for (var j = 1; j < F.length; j++) if (F[j][1] !== F[0][1]) zoomed = true;
  if (zoomed) bakeFn(cam.property("Camera Options").property("Zoom"), 0, end, function (t) { return 540 / Math.tan(keyed(F, t) * Math.PI / 360); });
  return cam;
};

// ---------- highlights ----------
// Fade a highlight in on its word and out after `hold` s (or at tOff). Records the mention for QC.
function hlOn(layer, id, tOn, tOff, peak) {
  pulse(layer, tOn, tOff, peak === undefined ? 85 : peak, 0.28);
  mention(tOn, id, "highlight");
}

// ---------- 2D text ----------
function textLayer(comp, str, font, size, rgb, just) {
  var t = comp.layers.addText(str);
  var d = t.property("Source Text").value;
  d.font = font; d.fontSize = size; d.fillColor = rgb;
  d.justification = just === "left" ? ParagraphJustification.LEFT_JUSTIFY : just === "right" ? ParagraphJustification.RIGHT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY;
  t.property("Source Text").setValue(d);
  return t;
}
// A word or number on screen from tOn to tOff, rising 24 px as it fades in.
function caption(comp, str, o) {
  var t = textLayer(comp, str, o.font || "Inter-ExtraBold", o.size || 64, o.color || INK, o.just || "center");
  var x = o.pos[0], y = o.pos[1];
  animate(tr(t, "Opacity"), [[o.tOn - 0.05, 0], [o.tOn + 0.35, 100], [o.tOff, 100], [o.tOff + 0.35, 0]]);
  animate(tr(t, "Position"), [[o.tOn - 0.05, [x, y + 24]], [o.tOn + 0.45, [x, y]]]);
  if (o.id) mention(o.tOn, o.id, "text");
  return t;
}
// A number that counts from keys [[t, v], ...]; fmt(v) -> string as an expression body using v.
function counter(comp, id, o) {
  var n = comp.layers.addNull(); n.name = "K_" + id;
  var sl = n.property("Effects").addProperty("Slider Control").property("Slider");
  animate(sl, o.keys);
  var t = textLayer(comp, "0", o.font || "Inter-ExtraBold", o.size || 72, o.color || INK, o.just || "center");
  t.name = "N_" + id;
  t.property("Source Text").expression = 'var v = thisComp.layer("K_' + id + '").effect("Slider Control")("Slider"); ' + o.fmt;
  tr(t, "Position").setValue(o.pos);
  animate(tr(t, "Opacity"), [[o.tOn - 0.05, 0], [o.tOn + 0.3, 100], [o.tOff, 100], [o.tOff + 0.35, 0]]);
  mention(o.tOn, id, "counter");
  return t;
}

// ---------- labels pinned to 3D parts ----------
// o: id, at (metres, in `root` space), root (null layer or null), title, sub, align (left|right|center),
//    to: [xExpr, yExpr] using A (the anchor on screen), color (dot), tOn, tOff.
Scene.prototype.label = function (o) {
  var comp = this.comp, id = o.id, hasSub = !!o.sub;
  var a = this.nul("A_" + id, [0, 0, 0]);
  if (o.root) a.parent = o.root;
  tr(a, "Position").setValue(o.root ? this.local(o.at[0], o.at[1], o.at[2]) : this.p(o.at[0], o.at[1], o.at[2]));
  var kn = comp.layers.addNull(); kn.name = "K_" + id;
  var k = kn.property("Effects").addProperty("Slider Control").property("Slider");
  animate(k, [[o.tOn - 0.02, 0], [o.tOn + 0.8, 1], [o.tOff, 1], [o.tOff + 0.7, 0]]);
  var align = o.align || "right";
  var head =
    'var A = thisComp.layer("A_' + id + '").toComp([0, 0, 0]);' +
    'var k = thisComp.layer("K_' + id + '").effect("Slider Control")("Slider");' +
    "var ln = 1 - Math.pow(1 - Math.min(1, k * 1.8), 4);" +
    "var tx = 1 - Math.pow(1 - Math.max(0, Math.min(1, k * 1.8 - 0.55)), 4);" +
    "var to = [" + o.to[0] + ", " + o.to[1] + "];" +
    // Keep every card inside the title-safe area (5% in from each edge), whatever the camera does.
    "to = [Math.max(" + (align === "left" ? 520 : 110) + ", Math.min(" + (align === "right" ? 1400 : 1810) + ", to[0])), Math.max(" + (align === "center" ? (hasSub ? 160 : 126) : 92) + ", Math.min(960, to[1]))];" +
    "var top = to[1] - " + (align === "center" ? (hasSub ? 104 : 70) : 36) + ";" +
    "var shift = (1 - tx) * " + (align === "right" ? -24 : align === "left" ? 24 : 0) + ";";
  var just = align === "center" ? "center" : align === "right" ? "left" : "right";
  var T1 = textLayer(comp, o.title, "Inter-ExtraBold", o.size || 44, INK, just); T1.name = "T_" + id;
  var S1 = hasSub ? textLayer(comp, o.sub, "Inter-Medium", 28, MUTED, just) : null;
  if (S1) S1.name = "S_" + id;
  var cardW = 'var tw = thisComp.layer("T_' + id + '").sourceRectAtTime(time, false).width;' +
    (hasSub ? 'var sw = thisComp.layer("S_' + id + '").sourceRectAtTime(time, false).width; tw = Math.max(tw, sw);' : "") +
    "var cw = tw + 54; var ch = " + (hasSub ? 108 : 70) + ";";
  var cardX = align === "right" ? "to[0] + 14 + shift" : align === "left" ? "to[0] - 14 - cw + shift" : "to[0] - cw / 2";
  var textX = align === "right" ? "to[0] + 14 + 34 + shift" : align === "left" ? "to[0] - 14 - 20 + shift" : "to[0]";
  tr(T1, "Position").expression = head + cardW + "[" + textX + ", top + 48];";
  tr(T1, "Opacity").expression = head + "tx * 100;";
  if (S1) { tr(S1, "Position").expression = head + cardW + "[" + textX + ", top + 88];"; tr(S1, "Opacity").expression = head + "tx * 100;"; }
  var sh = comp.layers.addShape(); sh.name = "Card_" + id;
  tr(sh, "Position").setValue([0, 0]); tr(sh, "Anchor Point").setValue([0, 0]);
  var root = sh.property("Contents");
  // Shape groups listed first draw on top: dot, colour bar, line, then the card.
  var gd = root.addProperty("ADBE Vector Group"); gd.name = "Dot";
  var el = gd.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
  el.property("Position").expression = head + "A.slice(0, 2);";
  el.property("Size").expression = head + "var r = 16 * (1 - Math.pow(1 - Math.min(1, k * 3), 4)); [r, r];";
  var dst = gd.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  dst.property("Color").setValue(WHITE); dst.property("Stroke Width").setValue(3);
  gd.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(o.color || ORANGE);
  // Colour bar on the card's edge, in the part's highlight colour.
  var gb = root.addProperty("ADBE Vector Group"); gb.name = "Bar";
  var rb = gb.property("Contents").addProperty("ADBE Vector Shape - Rect");
  rb.property("Size").expression = head + cardW + "[7, ch - 22];";
  rb.property("Position").expression = head + cardW + "[" + cardX + " + 11, top + ch / 2];";
  var fb = gb.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  fb.property("Color").setValue(o.color || ORANGE); fb.property("Opacity").expression = head + "tx * 100;";
  var gl = root.addProperty("ADBE Vector Group"); gl.name = "Line";
  gl.property("Contents").addProperty("ADBE Vector Shape - Group").property("Path").expression =
    head + "createPath([A.slice(0, 2), [A[0] + (to[0] - A[0]) * ln, A[1] + (to[1] - A[1]) * ln]], [], [], false);";
  var st = gl.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(INK); st.property("Stroke Width").setValue(2.6);
  st.property("Opacity").expression = head + "Math.min(1, k * 3) * 100;";
  var gc = root.addProperty("ADBE Vector Group"); gc.name = "Card";
  var rc = gc.property("Contents").addProperty("ADBE Vector Shape - Rect");
  rc.property("Size").expression = head + cardW + "[cw, ch];";
  rc.property("Position").expression = head + cardW + "[" + cardX + " + cw / 2, top + ch / 2];";
  rc.property("Roundness").setValue(14);
  var fc = gc.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  fc.property("Color").setValue(WHITE); fc.property("Opacity").expression = head + "tx * 94;";
  sh.moveAfter(T1);
  mention(o.tOn, id, "label");
  return a;
};

// ---------- dimension line between two 3D points ----------
// o: id, a, b (metres in root space), root, text, tOn, tOff, side offset in px ([dx, dy]), textPos expr offset.
Scene.prototype.dim = function (o) {
  var comp = this.comp, id = o.id;
  var A = this.nul("DA_" + id, [0, 0, 0]), B = this.nul("DB_" + id, [0, 0, 0]);
  if (o.root) { A.parent = o.root; B.parent = o.root; }
  tr(A, "Position").setValue(o.root ? this.local(o.a[0], o.a[1], o.a[2]) : this.p(o.a[0], o.a[1], o.a[2]));
  tr(B, "Position").setValue(o.root ? this.local(o.b[0], o.b[1], o.b[2]) : this.p(o.b[0], o.b[1], o.b[2]));
  var kn = comp.layers.addNull(); kn.name = "K_" + id;
  var k = kn.property("Effects").addProperty("Slider Control").property("Slider");
  animate(k, [[o.tOn - 0.02, 0], [o.tOn + 0.9, 1], [o.tOff, 1], [o.tOff + 0.4, 0]]);
  var off = o.offset || [60, 0];
  var head = 'var a = thisComp.layer("DA_' + id + '").toComp([0,0,0]); var b = thisComp.layer("DB_' + id + '").toComp([0,0,0]);' +
    'var k = thisComp.layer("K_' + id + '").effect("Slider Control")("Slider"); var o = [' + off[0] + ', ' + off[1] + '];' +
    "var p = [a[0] + o[0], a[1] + o[1]]; var q = [b[0] + o[0], b[1] + o[1]]; var m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];" +
    "var g = 1 - Math.pow(1 - Math.min(1, k * 1.4), 3);" +
    "var p2 = [m[0] + (p[0] - m[0]) * g, m[1] + (p[1] - m[1]) * g]; var q2 = [m[0] + (q[0] - m[0]) * g, m[1] + (q[1] - m[1]) * g];";
  var sh = comp.layers.addShape(); sh.name = "Dim_" + id;
  tr(sh, "Position").setValue([0, 0]); tr(sh, "Anchor Point").setValue([0, 0]);
  var g1 = sh.property("Contents").addProperty("ADBE Vector Group");
  g1.property("Contents").addProperty("ADBE Vector Shape - Group").property("Path").expression = head + "createPath([p2, q2], [], [], false);";
  // End ticks, perpendicular to the line.
  var ticks = sh.property("Contents").addProperty("ADBE Vector Group");
  ticks.property("Contents").addProperty("ADBE Vector Shape - Group").property("Path").expression = head +
    "var d = [q[0] - p[0], q[1] - p[1]]; var L = Math.max(1, Math.sqrt(d[0]*d[0] + d[1]*d[1])); var n = [-d[1] / L * 16, d[0] / L * 16];" +
    "createPath([[p2[0] - n[0], p2[1] - n[1]], [p2[0] + n[0], p2[1] + n[1]]], [], [], false);";
  var ticks2 = sh.property("Contents").addProperty("ADBE Vector Group");
  ticks2.property("Contents").addProperty("ADBE Vector Shape - Group").property("Path").expression = head +
    "var d = [q[0] - p[0], q[1] - p[1]]; var L = Math.max(1, Math.sqrt(d[0]*d[0] + d[1]*d[1])); var n = [-d[1] / L * 16, d[0] / L * 16];" +
    "createPath([[q2[0] - n[0], q2[1] - n[1]], [q2[0] + n[0], q2[1] + n[1]]], [], [], false);";
  var groups = [g1, ticks, ticks2];
  for (var i = 0; i < 3; i++) {
    var st = groups[i].property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    st.property("Color").setValue(o.color || INK); st.property("Stroke Width").setValue(3);
    st.property("Opacity").expression = head + "Math.min(1, k * 2) * 100;";
  }
  var t = textLayer(comp, o.text, "Inter-ExtraBold", o.size || 52, o.color || INK, "center");
  t.name = "DT_" + id;
  var to = o.textOffset || [70, 18];
  tr(t, "Position").expression = head + "[m[0] + " + to[0] + ", m[1] + " + to[1] + "];";
  tr(t, "Opacity").expression = head + "Math.max(0, Math.min(1, k * 2 - 0.6)) * 100;";
  mention(o.tOn, id, "dim");
};

// ---------- propellant ----------
// Levels over time: keys [[t, level 0..1], ...] for each tank. Drains the columns, fades the full-tank crowns,
// and (o.helium) fills the emptied space with violet helium.
Scene.prototype.fillKeys = function (loxKeys, rp1Keys, tEnd, o) {
  o = o || {}; var P = this.parts, s = this;
  var cut = o.cut ? "_cut" : "";
  function crown(v) { return 100 * Math.max(0, Math.min(1, (v - 0.985) / 0.015)); }
  bakeFn(tr(P.lox, "Scale"), 0, tEnd, function (t) { return [100, Math.max(0.1, 100 * keyed(loxKeys, t)), 100]; });
  bakeFn(tr(P.rp1, "Scale"), 0, tEnd, function (t) { return [100, Math.max(0.1, 100 * keyed(rp1Keys, t)), 100]; });
  bakeFn(tr(P.lox_crown, "Opacity"), 0, tEnd, function (t) { return crown(keyed(loxKeys, t)); });
  bakeFn(tr(P.rp1_crown, "Opacity"), 0, tEnd, function (t) { return crown(keyed(rp1Keys, t)); });
  // Fills that start empty also hide their fixed bowls until the level starts rising.
  bakeFn(tr(P.lox_base, "Opacity"), 0, tEnd, function (t) { return 100 * Math.min(1, keyed(loxKeys, t) * 40); });
  bakeFn(tr(P.rp1_base, "Opacity"), 0, tEnd, function (t) { return 100 * Math.min(1, keyed(rp1Keys, t) * 40); });
  if (o.helium) {
    var F = RIG.fill;
    var tanks = [["lox", loxKeys, RIG.lox[1], F.loxH], ["rp1", rp1Keys, RIG.rp1[1], F.rp1H]];
    for (var i = 0; i < 2; i++) (function (tk) {
      var u = s.model("ullage_" + tk[0] + cut, [0, 0, 0], "helium " + tk[0]); u.parent = P.root;
      s.cmd("material.set", { layers: [u.__id], castsShadows: "off", acceptsShadows: "off" });
      bakeFn(tr(u, "Position"), 0, tEnd, function (t) { var v = keyed(tk[1], t); return s.local(0, tk[2] + tk[3] * v + 0.02, 0); });
      bakeFn(tr(u, "Scale"), 0, tEnd, function (t) { return [100, Math.max(0.1, 100 * (1 - keyed(tk[1], t)) - 0.2), 100]; });
      bakeFn(tr(u, "Opacity"), 0, tEnd, function (t) { return keyed(o.helium, t); });
    })(tanks[i]);
  }
};
// The front half of the shell and tanks slides toward the camera and fades: the cutaway opening.
Scene.prototype.openCut = function (t0, dur) {
  var P = this.parts, s = this;
  var fronts = ["booster_shell_front", "booster_tanks_front"];
  for (var i = 0; i < fronts.length; i++) {
    var f = this.model(fronts[i]); attach(f, P.root);
    // Slides toward the camera and off to the side, at full opacity: a 3D model that fades from solid to
    // see-through switches render mode and pops, so models leave the frame instead of fading.
    animate(tr(f, "Position"), [[t0, [0, 0, 0]], [t0 + dur, s.local(-46, 6, 40)]]);
  }
};
// Prints the mentions list (one line, "MENTIONS [...]") for the QC sync check; build.sh saves it.
function saveMentions() { writeLn("MENTIONS " + JSON.stringify(MENTIONS)); }

// ---------- arrows ----------
// A 2D arrow drawn from a 3D anchor (metres, root space) in a screen direction dir [dx, dy] (px, length = |dir|).
// With o.toward the arrow points at the anchor instead of away from it.
Scene.prototype.arrow = function (o) {
  var comp = this.comp, id = o.id;
  var a = this.nul("AR_" + id, [0, 0, 0]);
  if (o.root) a.parent = o.root;
  tr(a, "Position").setValue(o.root ? this.local(o.at[0], o.at[1], o.at[2]) : this.p(o.at[0], o.at[1], o.at[2]));
  var kn = comp.layers.addNull(); kn.name = "K_" + id;
  animate(kn.property("Effects").addProperty("Slider Control").property("Slider"), [[o.tOn - 0.02, 0], [o.tOn + 0.5, 1], [o.tOff, 1], [o.tOff + 0.35, 0]]);
  var head = 'var A = thisComp.layer("AR_' + id + '").toComp([0,0,0]); var k = thisComp.layer("K_' + id + '").effect("Slider Control")("Slider");' +
    "var d = [" + o.dir[0] + ", " + o.dir[1] + "]; var L = Math.sqrt(d[0]*d[0] + d[1]*d[1]); var u = [d[0] / L, d[1] / L];" +
    "var g = 1 - Math.pow(1 - Math.min(1, k * 1.5), 3);" +
    (o.toward ? "var tip = [A[0] - u[0] * 10, A[1] - u[1] * 10]; var tail = [tip[0] - u[0] * L * g, tip[1] - u[1] * L * g];"
              : "var tail = [A[0] + u[0] * 10, A[1] + u[1] * 10]; var tip = [tail[0] + u[0] * L * g, tail[1] + u[1] * L * g];") +
    "var n = [-u[1], u[0]];";
  var sh = comp.layers.addShape(); sh.name = "Arrow_" + id;
  tr(sh, "Position").setValue([0, 0]); tr(sh, "Anchor Point").setValue([0, 0]);
  var g1 = sh.property("Contents").addProperty("ADBE Vector Group");
  g1.property("Contents").addProperty("ADBE Vector Shape - Group").property("Path").expression = head +
    "createPath([tail, [tip[0] - u[0] * 18, tip[1] - u[1] * 18]], [], [], false);";
  var st = g1.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue(o.color || RED); st.property("Stroke Width").setValue(o.width || 9);
  st.property("Opacity").expression = head + "Math.min(1, k * 2) * 100;";
  var g2 = sh.property("Contents").addProperty("ADBE Vector Group");
  g2.property("Contents").addProperty("ADBE Vector Shape - Group").property("Path").expression = head +
    "var s = " + (o.head || 26) + "; createPath([tip, [tip[0] - u[0] * s * 1.3 + n[0] * s * 0.75, tip[1] - u[1] * s * 1.3 + n[1] * s * 0.75], [tip[0] - u[0] * s * 1.3 - n[0] * s * 0.75, tip[1] - u[1] * s * 1.3 - n[1] * s * 0.75]], [], [], true);";
  var fl = g2.property("Contents").addProperty("ADBE Vector Graphic - Fill");
  fl.property("Color").setValue(o.color || RED);
  fl.property("Opacity").expression = head + "Math.min(1, k * 2) * 100;";
  mention(o.tOn, id, "arrow");
};

// ---------- flow ----------
// Glowing beads that stream along a straight line (metres, root space) between tOn and tOff.
Scene.prototype.flow = function (o) {
  var n = o.n || 8, s = this;
  for (var i = 0; i < n; i++) (function (i) {
    var l = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "sphere", name: "flow " + o.id + " " + i, radius: (o.r || 0.09) * s.S, segments: 16, rings: 10, baseColor: o.color, emissive: o.color, castsShadows: "off", acceptsShadows: "off" }));
    if (o.root) l.parent = o.root;
    var uAt = function (t) { var u = ((t - o.tOn) * (o.speed || 0.5) + i / n) % 1; return u < 0 ? u + 1 : u; };
    bakeFn(tr(l, "Position"), o.tOn - 0.1, o.tOff + 0.5, function (t) {
      var p = lerp(o.a, o.b, uAt(t));
      return o.root ? s.local(p[0], p[1], p[2]) : s.p(p[0], p[1], p[2]);
    });
    // Beads fade at both ends of the line, so the wrap from end to start never pops.
    bakeFn(tr(l, "Opacity"), o.tOn - 0.1, o.tOff + 0.5, function (t) {
      var u = uAt(t), win = Math.min(ease((t - o.tOn + 0.05) / 0.45), 1 - ease((t - o.tOff) / 0.4));
      return 100 * win * Math.min(1, u * 7, (1 - u) * 7);
    });
  })(i);
  mention(o.tOn, o.id, "flow");
};

// ---------- engine flame ----------
// A glowing cone under an engine (metres, root space): strength keys [[t, 0..1], ...] set length and opacity.
Scene.prototype.flame = function (o) {
  var s = this, len = o.len || 9, r = o.r || 0.42;
  var l = s.comp.layers.__new(s.cmd("layer.new3dPrimitive", { kind: "cone", name: "flame " + o.id, radius: r * s.S, height: len * s.S, segments: 32, baseColor: [1, 0.72, 0.38], emissive: [1, 0.62, 0.25], castsShadows: "off", acceptsShadows: "off", acceptsLights: false }));
  if (o.root) l.parent = o.root;
  // The cone's apex points up (+Y); flip it so it streams down from the nozzle.
  tr(l, "X Rotation").setValue(180);
  bakeFn(tr(l, "Scale"), 0, o.tEnd, function (t) { var k = keyed(o.keys, t); return [100 * (0.75 + 0.25 * k), 100 * Math.max(0.01, k), 100 * (0.75 + 0.25 * k)]; });
  bakeFn(tr(l, "Position"), 0, o.tEnd, function (t) { var k = keyed(o.keys, t); var p = o.at; return o.root ? s.local(p[0], p[1] - len * k / 2, p[2]) : s.p(p[0], p[1] - len * k / 2, p[2]); });
  bakeFn(tr(l, "Opacity"), 0, o.tEnd, function (t) { return 92 * Math.min(1, keyed(o.keys, t) * 3); });
  return l;
};

// Highlight copies of the fins or legs, moving exactly like them, faded in on a word.
Scene.prototype.hlFins = function (k, root, only, t0, t1, id, tOn, tOff) {
  var ls = this.fins(k, root, "", only, t0, t1, "hl_grid_fin");
  for (var i = 0; i < ls.length; i++) { tr(ls[i], "Opacity").setValue(0); this.cmd("material.set", { layers: [ls[i].__id], castsShadows: "off", acceptsShadows: "off" }); hlOn(ls[i], i ? id + " " + i : id, tOn, tOff); }
};
Scene.prototype.hlLegs = function (k, root, only, t0, t1, id, tOn, tOff) {
  var ls = this.legs(k, root, "", only, t0, t1, "hl_leg");
  for (var i = 0; i < ls.length; i++) { tr(ls[i], "Opacity").setValue(0); this.cmd("material.set", { layers: [ls[i].__id], castsShadows: "off", acceptsShadows: "off" }); hlOn(ls[i], i ? id + " " + i : id, tOn, tOff); }
};

// A dolly whose distance from the target changes geometrically (an even visual rate, no rush near the subject).
function dollyPos(p0, t0, p1, t1, u) {
  var d0 = [p0[0] - t0[0], p0[1] - t0[1], p0[2] - t0[2]], d1 = [p1[0] - t1[0], p1[1] - t1[1], p1[2] - t1[2]];
  var l0 = Math.sqrt(d0[0] * d0[0] + d0[1] * d0[1] + d0[2] * d0[2]), l1 = Math.sqrt(d1[0] * d1[0] + d1[1] * d1[1] + d1[2] * d1[2]);
  var L = l0 * Math.pow(l1 / l0, u), dir = lerp([d0[0] / l0, d0[1] / l0, d0[2] / l0], [d1[0] / l1, d1[1] / l1, d1[2] / l1], u);
  var n = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]), tg = lerp(t0, t1, u);
  return [tg[0] + dir[0] / n * L, tg[1] + dir[1] / n * L, tg[2] + dir[2] / n * L];
}
