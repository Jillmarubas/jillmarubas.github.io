// Chapter framework and reusable shot pieces for The $20 Lie (on top of lib.jsx).
// A chapter comp = 12 s music-only chapter card, then the voice-over from VO0 = 12.3 s.
// Each shot is its own comp that starts on a voice-over line (an event boundary) and ends where
// the next shot starts. Shot functions get (comp, duration, at), where `at` is the shot's start
// in voice-over time, and use L(i, f) to land a visual on a spoken moment inside line i.

var CARD = 12.0, VO0 = 12.3, GREY = [0.4, 0.37, 0.33], CREAM = [0.985, 0.98, 0.965];
var TL = []; // set by the chapter file: [[start, end], ...] per script line (voice-over seconds)
function L(i, f, at) { return TL[i][0] + (f || 0) * (TL[i][1] - TL[i][0]) - at; }

function buildChapter(name, num, title, shots, tail) {
  var voDur = TL[TL.length - 1][1];
  var dur = VO0 + voDur + (tail || 1.0);
  var M = newComp(name, dur);
  M.motionBlur = true;
  for (var i = shots.length - 1; i >= 0; i--) {
    var a = VO0 + shots[i].at, b = i + 1 < shots.length ? VO0 + shots[i + 1].at : dur;
    var c = newComp(name + " " + (i + 1), b - a);
    shots[i].fn(c, b - a, shots[i].at);
    var l = M.layers.add(c);
    l.startTime = a; l.inPoint = a; l.outPoint = b; l.motionBlur = true;
  }
  var cc = newComp(name + " card", VO0 + shots[0].at);
  chapterCard(cc, num, title, VO0 + shots[0].at);
  var lc = M.layers.add(cc);
  lc.startTime = 0; lc.inPoint = 0; lc.outPoint = VO0 + shots[0].at;
  var fin = M.layers.addSolid([0, 0, 0], "Finish", W, H, 1);
  fin.adjustmentLayer = true;
  fx(fin, "Noise", {"Amount of Noise": 4});
  fx(fin, "CC Vignette", {"Amount": 45});
  writeLn(name + ": " + M.numLayers + " layers, " + dur.toFixed(2) + " s");
  return M;
}
// Shot list entry: start on line i (a hair before the word, so the cut lands on the event).
function S(i, fn, lead) { return {at: Math.max(0, TL[i][0] - (lead === undefined ? 0.1 : lead)), fn: fn}; }

// ---------- pieces ----------
function smoke(c, op) {
  var s = solid(c, [0.5, 0.5, 0.5], "Smoke");
  fx(s, "Fractal Noise", {"Contrast": 60, "Brightness": -30});
  s.blendingMode = BlendingMode.SCREEN;
  s.property("Transform").property("Opacity").setValue(op || 15);
  return s;
}
function dark(c, rgb) { return solid(c, rgb || NIGHT, "Dark"); }
function still(c, d, z) { return camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2, -1200 + (z || 90)]]], 25); }
function drift(c, d, dx, dz) { return camera(c, [[0, [W / 2 - dx, H / 2, -1200]], [d, [W / 2 + dx, H / 2, -1200 + dz]]], 25); }

function label(c, s, x, y, size, rgb, z) {
  var t = txt(c, s, "IBMPlexMono-Medium", size || 28, rgb || GREY, x, y, null, true);
  if (z) t.property("Transform").property("Position").setValue([x, y, z]);
  return t;
}
function head(c, s, x, y, size, rgb, z) {
  var t = txt(c, s, "Fraunces-Black", size || 110, rgb || INK, x, y, null, true);
  if (z) t.property("Transform").property("Position").setValue([x, y, z]);
  return t;
}
function source(c, s, t) { var l = label(c, s, W / 2, 1010, 22, GREY); if (t !== undefined) fade(l, t, t + 0.4, 0, 100); return l; }
// Fade in with a small scale settle, relative to the layer's own scale (k = start size in %).
function pop(l, t, k) {
  fade(l, t, t + 0.2, 0, 100);
  var sp = l.property("Transform").property("Scale"), s0 = sp.valueAtTime(t, false), f = (k || 115) / 100;
  keys(sp, [[t, [s0[0] * f, s0[1] * f, s0.length > 2 ? s0[2] : 100]], [t + 0.45, s0]], 80);
  return l;
}
function enter(l, t, dx, dy, d) {
  var p = l.property("Transform").property("Position").value;
  slide(l, t, t + (d || 0.55), [p[0] + (dx || 0), p[1] + (dy || 0), p[2]], p);
  return l;
}
function exitTo(l, t, dx, dy, d) {
  var p = l.property("Transform").property("Position").valueAtTime(t, false);
  slide(l, t, t + (d || 0.45), p, [p[0] + (dx || 0), p[1] + (dy || 0), p[2]]);
  return l;
}

// Date stamp: red rubber-stamp text that thumps onto the paper.
// onDark: normal blend (multiply would vanish on a dark background).
function stamp(c, s, x, y, t, size, onDark) {
  size = size || 96;
  var mode = onDark ? BlendingMode.NORMAL : BlendingMode.MULTIPLY;
  var l = txt(c, s, "Fraunces-Black", size, RED, x, y, null, true);
  l.property("Transform").property("Z Rotation").setValue(-4);
  l.blendingMode = mode;
  l.property("Transform").property("Opacity").setValue(0);
  keys(l.property("Transform").property("Opacity"), [[t, 0], [t + 0.04, 90]], 0);
  keys(l.property("Transform").property("Scale"), [[t, [135, 135, 100]], [t + 0.12, [100, 100, 100]]], 60);
  fx(l, "Turbulent Displace", {"Amount": 5, "Size": 4});
  var w = s.length * size * 0.62 + 70, h = size * 1.25;
  var box = pathLayer(c, "Stamp frame", [rect(-w / 2, -h * 0.78, w, h)], null, RED, 7);
  box.threeDLayer = true;
  box.property("Transform").property("Position").setValue([x, y, -1]);
  box.property("Transform").property("Z Rotation").setValue(-4);
  box.blendingMode = mode;
  keys(box.property("Transform").property("Opacity"), [[t, 0], [t + 0.04, 85]], 0);
  keys(box.property("Transform").property("Scale"), [[t, [135, 135, 100]], [t + 0.12, [100, 100, 100]]], 60);
  fx(box, "Turbulent Displace", {"Amount": 5, "Size": 4});
  return l;
}

// Animated number. fmt: prefix, suffix, decimals; eased from a to b between t0 and t1.
function counter(c, x, y, size, rgb, a, b, t0, t1, pre, suf, dec, font) {
  var l = txt(c, (pre || "") + a + (suf || ""), font || "Fraunces-Black", size, rgb, x, y, null, true);
  l.property("Source Text").expression =
    'var v = ease(time, ' + t0 + ', ' + t1 + ', ' + a + ', ' + b + '); var d = ' + (dec || 0) + ';' +
    'var s = v.toFixed(d); var p = s.split("."); p[0] = p[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");' +
    JSON.stringify(pre || "") + ' + p.join(".") + ' + JSON.stringify(suf || "") + ';';
  return l;
}

// Price tag: one image with the price printed on it (tools/bake_tags.py), lying on the paper.
// (Revision 1: the price used to be a separate text layer that drifted off the tag.)
function tag(c, price, x, y, z, s, rot, size) {
  var key = price.replace("$", "").replace("/", "");
  var t = card(c, "O03_tag_" + key + ".png", x, y, 0, s || 46, rot || 8);
  return shadow(t);
}

// Quote card on paper: big serif quote, source line under it.
function quote(c, q, src, t, size, italic, y) {
  y = y || 520;
  var l = txt(c, q, italic ? "Fraunces-SemiBoldItalic" : "Fraunces-SemiBold", size || 76, INK, W / 2, y, null, true);
  fade(l, t, t + 0.35, 0, 100);
  if (src) { var s = label(c, src, W / 2, y + (size || 76) * 1.3, 24, GREY); fade(s, t + 0.4, t + 0.8, 0, 100); }
  return l;
}

// Dot grid of people: cols x rows grey dots, `lit` indices turn red at time t.
function grid(c, cols, rows, gap, cy, lit, t, litRgb) {
  var x0 = W / 2 - (cols - 1) * gap / 2, y0 = cy - (rows - 1) * gap / 2;
  var shapes = [], litShapes = [];
  for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) {
    var k = r * cols + q, e = ellipseShape(x0 + q * gap, y0 + r * gap, gap * 0.28, gap * 0.28);
    (lit && lit.indexOf(k) >= 0 ? litShapes : shapes).push(e);
  }
  var g = pathLayer(c, "Grid", shapes.concat(litShapes), [0.62, 0.59, 0.55]);
  g.property("Transform").property("Position").setValue([0, 0]); to3D(g);
  if (litShapes.length) {
    var h = pathLayer(c, "Lit", litShapes, litRgb || RED);
    h.property("Transform").property("Position").setValue([0, 0]); to3D(h, -1);
    fade(h, t, t + 0.3, 0, 100);
    return h;
  }
  return g;
}

// Polyline drawn on with Trim Paths.
function line(c, pts, rgb, w, t0, t1) {
  var s = new Shape(); s.vertices = pts; s.closed = false;
  var l = pathLayer(c, "Line", [s], null, rgb, w || 8);
  var g = l.property("Contents").property(1).property("Contents");
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("End"), [[t0, 0], [t1, 100]], 40);
  l.property("Transform").property("Position").setValue([0, 0]);
  return to3D(l);
}

// Red marker strike-through (same felt-tip look as the BET loop).
function markerLine(c, x0, y0, x1, y1, t0, t1) {
  var s = new Shape();
  s.vertices = [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 - 6], [x1, y1]];
  s.inTangents = [[0, 0], [-(x1 - x0) / 6, 0], [0, 0]];
  s.outTangents = [[0, 0], [(x1 - x0) / 6, 0], [0, 0]];
  s.closed = false;
  var l = c.layers.addShape();
  var g = l.property("Contents").addProperty("ADBE Vector Group").property("Contents");
  g.addProperty("ADBE Vector Shape - Group").property("Path").setValue(s);
  var st = g.addProperty("ADBE Vector Graphic - Stroke");
  st.property("Color").setValue([0.86, 0.09, 0.11]); st.property("Stroke Width").setValue(18);
  st.property("Line Cap").setValue(2);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("End"), [[t0, 0], [t1, 100]], 35);
  l.property("Transform").property("Position").setValue([0, 0]);
  keys(l.property("Transform").property("Opacity"), [[t0, 0], [t0 + 0.03, 92]], 0);
  l.blendingMode = BlendingMode.MULTIPLY;
  fx(l, "Turbulent Displace", {"Amount": 6, "Size": 7});
  return to3D(l);
}

// Rounded window (chat or terminal).
function win(c, x, y, w, h, fill, titleRgb, z) {
  var l = pathLayer(c, "Window", [rect(-w / 2, -h / 2, w, h)], fill);
  l.threeDLayer = true;
  l.property("Transform").property("Position").setValue([x, y, z || 0]);
  var bar = pathLayer(c, "Bar", [rect(-w / 2, -h / 2, w, 44)], titleRgb);
  bar.threeDLayer = true;
  bar.property("Transform").property("Position").setValue([x, y, (z || 0) - 1]);
  bar.parent = l;
  bar.property("Transform").property("Opacity").expression = 'thisLayer.parent.transform.opacity';
  return l;
}

// Background plate filling the frame from depth z (for parallax against cut-outs in front).
function plate(c, name, z, extra) { return card(c, name, W / 2, H / 2, z, 94 * (extra || 1.12) * 1.0, 0); }

// ---------- 12 s chapter card (music only) ----------
function chapterCard(c, num, title, d) {
  paper(c, 700);
  smoke(c, 10);
  // Revision 1: the title is sized to fit inside the strip, and the strip, title and underline sit on
  // one plane (z 0), so the camera push moves them as one card.
  var sz = Math.min(128, Math.floor(1380 / (title.length * 0.8)));
  var tw = title.length * sz * 0.8;
  var strip = solid(c, CREAM, "Card strip");
  strip.threeDLayer = true;
  strip.property("Transform").property("Scale").setValue([Math.min(96, (tw + 300) / W * 100), 66, 100]);
  strip.property("Transform").property("Position").setValue([W / 2, 520, 1]);
  slide(strip, 0.0, 0.9, [W / 2, -520, 1], [W / 2, 520, 1], 75);
  var k = label(c, "CHAPTER " + num, W / 2, 380, 34, GREY);
  fade(k, 0.9, 1.3, 0, 100);
  var t = head(c, title, W / 2, 560, sz, INK);
  pop(t, 1.3, 108);
  var w = Math.min(1300, tw * 0.92);
  markerLine(c, W / 2 - w / 2, 610, W / 2 + w / 2, 604, 2.0, 2.7);
  camera(c, [[0, [W / 2, H / 2 + 20, -1200]], [d, [W / 2, H / 2 - 10, -980]]], 20);
  var out = solid(c, [0, 0, 0], "Out");
  out.property("Transform").property("Opacity").setValue(0);
  keys(out.property("Transform").property("Opacity"), [[d - 0.35, 0], [d, 100]], 0);
}

// ---------- revision 1 pieces ----------
// Ink dissolve: black ink blooms over the frame ("out") or clears from it ("in") between t0 and t1.
function inkWipe(c, t0, t1, mode) {
  var l = solid(c, [0.5, 0.5, 0.5], "Ink wipe");
  var e = fx(l, "Fractal Noise", {"Contrast": 420, "Complexity": 5});
  var a = mode == "in" ? -260 : 260, b = mode == "in" ? 260 : -260;
  keys(e.property("Brightness"), [[t0, a], [t1, b]], 30);
  e.property("Evolution").expression = 'time * 90';
  fx(l, "Turbulent Displace", {"Amount": 40, "Size": 60});
  l.blendingMode = BlendingMode.MULTIPLY;
  return l;
}
// Black ink creeping in from the frame edges (a living, blotchy vignette).
function inkEdges(c, amount) {
  var l = solid(c, [0.5, 0.5, 0.5], "Ink edges");
  var e = fx(l, "Fractal Noise", {"Contrast": 700, "Brightness": amount || -10, "Complexity": 6});
  e.property("Evolution").expression = 'time * 40';
  fx(l, "Turbulent Displace", {"Amount": 70, "Size": 26});
  var m = l.property("Masks").addProperty("Mask");
  m.property("Mask Path").setValue(rect(120, 90, W - 240, H - 180));
  m.property("Mask Feather").setValue([120, 120]);
  try { m.inverted = true; } catch (err) { m.property("Inverted").setValue(true); }
  l.blendingMode = BlendingMode.MULTIPLY;
  return l;
}
// Code running: a column of monospaced lines scrolling up, screened over the shot.
var CODE = ["tokens = tokenizer.encode(prompt)", "kv = cache.load(session_id)", "for step in range(max_new_tokens):",
  "    logits = model.forward(tokens, kv)", "    next_id = sample(logits, temperature=0.7)", "    tokens.append(next_id)",
  "    gpu_ms += kernel_time(len(tokens))", "    if next_id == EOS: break", "reply = tokenizer.decode(tokens[n:])",
  "cost_usd = gpu_ms / 3.6e6 * GPU_PRICE_PER_HOUR", "log.write(user_id, len(tokens), cost_usd)", "stream(reply)", ""];
function codeOverlay(c, t0, op, rgb, lines, size, x) {
  lines = lines || CODE;
  var s = ""; for (var i = 0; i < 60; i++) s += lines[i % lines.length] + "\r";
  var l = txt(c, s, "IBMPlexMono-Regular", size || 26, rgb || [0.55, 0.85, 0.65], x || 140, 0, ParagraphJustification.LEFT_JUSTIFY, false);
  l.property("Transform").property("Position").expression = '[' + (x || 140) + ', 120 - Math.max(0, time - ' + t0 + ') * 70]';
  l.property("Transform").property("Opacity").expression = 'time < ' + t0 + ' ? 0 : linear(time, ' + t0 + ', ' + (t0 + 0.3) + ', 0, ' + (op || 40) + ')';
  l.blendingMode = BlendingMode.SCREEN;
  return l;
}
// Terminal window with a title bar, three lights and typed lines.
function terminal(c, x, y, w, h, z) {
  var t = win(c, x, y, w, h, [0.07, 0.07, 0.08], [0.2, 0.2, 0.22], z || 0);
  var cols = [[0.93, 0.36, 0.33], [0.96, 0.75, 0.3], [0.38, 0.78, 0.4]];
  for (var i = 0; i < 3; i++) {
    var d = pathLayer(c, "Light", [ellipseShape(0, 0, 9, 9)], cols[i]); d.threeDLayer = true; d.parent = t;
    d.property("Transform").property("Position").setValue([-w / 2 + 30 + i * 30, -h / 2 + 22, -2]);
    d.property("Transform").property("Opacity").expression = 'thisLayer.parent.transform.opacity';
  }
  var tl = label(c, "terminal", 0, 0, 22, [0.6, 0.6, 0.62]); tl.parent = t;
  tl.property("Transform").property("Position").setValue([0, -h / 2 + 30, -2]);
  tl.property("Transform").property("Opacity").expression = 'thisLayer.parent.transform.opacity';
  return t;
}
function termText(c, t, s, x, y, a, b, rgb) {
  var l = txt(c, s, "IBMPlexMono-Medium", 30, rgb || [0.86, 0.9, 0.86], 0, 0, ParagraphJustification.LEFT_JUSTIFY, true);
  l.parent = t; l.property("Transform").property("Position").setValue([x, y, -2]);
  if (a !== undefined) typeOn(l, s, a, b);
  return l;
}
// The licensed photo of Sam Altman (TechCrunch, CC BY 2.0, via Wikimedia Commons), cut out, with credit.
function altman(c, x, y, s, t, tOut) {
  var p = card(c, "O27_altman.png", x, y, 0, s || 46);
  shadow(p, 10, 50, 35);
  if (t !== undefined) fade(p, t, t + 0.3, 0, 100);
  var cr = label(c, "Photo: TechCrunch, CC BY 2.0", 1730, 1052, 17, GREY);
  if (tOut !== undefined) fade(cr, tOut, tOut + 0.3, 100, 0);
  return p;
}
// Real dollar coins raining down, tumbling, between t0 and t1 (comp seconds).
function coinRain(c, t0, t1, n, s, x0, x1, yEnd, seed) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var r = Math.sin((i + 1) * 12.9898 + (seed || 0)) * 43758.5453; r -= Math.floor(r);
    var r2 = Math.sin((i + 1) * 78.233 + (seed || 0)) * 12345.678; r2 -= Math.floor(r2);
    var x = x0 + (x1 - x0) * r, z = -150 + 300 * r2, a = t0 + (t1 - t0) * (i / n), d = 0.9 + 0.5 * r2;
    var k = card(c, "O21_dollar_coin.png", x, -200, z, s * (0.8 + 0.4 * r));
    keys(k.property("Transform").property("Position"), [[a, [x, -200, z]], [a + d, [x + (r - 0.5) * 200, yEnd || 1300, z]]], 0);
    k.property("Transform").property("Position").setTemporalEaseAtKey(1, [new KeyframeEase(0, 60)], [new KeyframeEase(0, 60)]);
    keys(k.property("Transform").property("Y Rotation"), [[a, 0], [a + d, 360 + 540 * r]], 0);
    keys(k.property("Transform").property("X Rotation"), [[a, 30 * r], [a + d, -40 + 80 * r2]], 0);
    out.push(k);
  }
  return out;
}
