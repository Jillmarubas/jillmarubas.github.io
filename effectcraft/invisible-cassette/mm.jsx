// MagnatesMedia-style kit for The Invisible Cassette (CLAUDE.md "Documentary videos in the MagnatesMedia style").
// One colour scheme from the subject: the trading terminal the crash happened on.
// Principles only (never imitate a reference): kinetic type on keywords and numbers, counters, documents,
// maps, cut-out photo parallax, grain + smoke + vignette, music-only chapter cards.
#include "lib.jsx"

var TERM = {
  black: hex("#06070A"), panel: hex("#0D1014"), amber: hex("#FFB000"), amberDim: hex("#7A5400"),
  green: hex("#19C46B"), red: hex("#FF3B30"), white: hex("#F2F0EA"), grey: hex("#7C828C"), paper: hex("#EDEAE3"), ink: hex("#15171B")
};
var TF = {head: "IBMPlexSansCond-Bold", headReg: "IBMPlexSansCond-Regular", mono: "JetBrainsMono-Bold", monoReg: "JetBrainsMono-Regular", serif: "PlayfairDisplay-Bold"};

// rolling number: eases from `a` to `b` between t0 and t1, with thousands separators
function counter(t, a, b, t0, t1, dec, pre, suf) {
  t.property("Source Text").expression =
    'var v = ease(time, ' + t0 + ', ' + t1 + ', ' + a + ', ' + b + '); var neg = v < 0; v = Math.abs(v);' +
    'var s = v.toFixed(' + (dec || 0) + '); var p = s.split("."); p[0] = p[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");' +
    '"' + (pre || "") + '" + (neg ? "−" : "") + p.join(".") + "' + (suf || "") + '";';
}
// kinetic slam-in for a keyword: the same 2-frame 115 % -> 100 % overshoot as a stamp (lib.jsx slam)
function slamIn(l, at) { slam(l, at); }
// break apart (for "evaporated"): turbulent displacement + blur + fade
function breakApart(l, at, dur) {
  var td = fx(l, "Turbulent Displace", {"Size": 60, "Complexity": 3});
  keys(td.property("Amount"), [[at, 0], [at + dur, 260]], 0);
  setEase(td.property("Amount"), 0.1, 60);
  var bl = fx(l, "Fast Box Blur", {});
  keys(bl.property("Blur Radius"), [[at, 0], [at + dur, 24]], 0);
}

// terminal backdrop at Z +350: faint grid + columns of symbols (no invented figures)
var SYMS = ["ACN", "PG", "MMM", "AAPL", "JNJ", "GE", "XOM", "KO", "IBM", "WMT", "HPQ", "CAT", "MCD", "DIS", "BA", "T"];
function termBackdrop(c, red) {
  var bg = solid(c, TERM.black, "terminal black");
  var g = solid(c, [0, 0, 0], "BG grid (Z+350)", 3000, 1900); g.threeDLayer = true;
  fx(g, "Grid", {"Border": 1.2, "Color": TERM.amberDim, "Opacity": 30});
  T(g).property("Position").setValue([W / 2, H / 2, 350]);
  var s = "";
  for (var r = 0; r < 26; r++) { for (var k = 0; k < 9; k++) s += SYMS[(r * 5 + k * 3) % SYMS.length] + (red ? " ▼  " : " ▲  ") + "    "; s += "\r"; }
  var col = txt(c, s, TF.monoReg, 30, red ? TERM.red : TERM.amberDim, [W / 2 - 1400, H / 2 - 820, 360], ParagraphJustification.LEFT_JUSTIFY, 40);
  T(col).property("Opacity").setValue(red ? 22 : 30);
  T(col).property("Position").expression = "value + [0, -time * 14, 0];";
  return bg;
}

// global finish: smoke drifting in light, organic grain (Overlay 12 %), dust motes, vignette 18 %
function finish(M) {
  var sm = solid(M, [0, 0, 0], "Smoke");
  fx(sm, "Fractal Noise", {"Contrast": 70, "Brightness": -18, "Transform/Scale": 700, "Complexity": 6});
  sm.property("Effects").property("Fractal Noise").property("Evolution").expression = "time * 22";
  sm.property("Effects").property("Fractal Noise").property("Transform").property("Offset Turbulence").expression = "[960 + time * 18, 540 - time * 6]";
  fx(sm, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.78, 0.45], "Amount to Tint": 100});
  sm.blendingMode = BlendingMode.SCREEN; T(sm).property("Opacity").setValue(16);
  var gr = solid(M, [0.5, 0.5, 0.5], "Film grain");
  fx(gr, "Fractal Noise", {"Contrast": 160, "Transform/Scale": 6, "Complexity": 2});
  gr.property("Effects").property("Fractal Noise").property("Evolution").expression = "time * 2400";
  gr.blendingMode = BlendingMode.OVERLAY; T(gr).property("Opacity").setValue(12);
  // floating dust motes in the light (the paste's atmosphere rule), additive, amber-warm
  var dm = dust(M, 0.6); dm.name = "Dust motes";
  var vg = solid(M, [0, 0, 0], "Vignette"); vg.adjustmentLayer = true;
  fx(vg, "CC Vignette", {"Amount": 18}); // lens vignette, edge falloff 15–20 %
}

// a document recreated as typeset paper (titles real; nothing invented), with the house shadow
function docComp(name, w, h, lines) {
  var c = comp(name, 60, w, h);
  solid(c, TERM.paper, "paper");
  var n = solid(c, [0.5, 0.5, 0.5], "paper grain"); fx(n, "Fractal Noise", {"Contrast": 120, "Transform/Scale": 3}); n.blendingMode = BlendingMode.MULTIPLY; T(n).property("Opacity").setValue(10);
  for (var i = 0; i < lines.length; i++) { var L = lines[i]; txt(c, L[0], L[1], L[2], L[3] || TERM.ink, [L[4], L[5]], ParagraphJustification.LEFT_JUSTIFY, L[6] || 0); }
  return c;
}

// A public-domain photo as three parallax layers (the paste's PhotoCraft rule; tools/photo_layers.py):
// Layer 0 background plate (filled) at Z +400, Layer 1 midground subject at Z 0 (sharp), Layer 2 foreground
// occlusion at Z -250 (soft, about 16 px of depth-of-field blur). Scales line the layers up through the
// 35 mm lens at the start, so only the camera's move separates them. All three are 2400 x 1350.
// opt: tint (0–100), redAt (comp time the highlights start turning red), pre (layer name prefix)
function photoParallax(c, dir, opt) {
  opt = opt || {};
  var Z = {bg: 400, mid: 0, near: -250}, sBg = 110, out = {};
  var names = ["bg", "mid", "near"];
  for (var i = 0; i < 3; i++) {
    var n = names[i], l = c.layers.add(img("layers/" + dir + "/" + n + ".png"));
    l.name = (opt.pre || dir) + " " + n + " (Z" + (Z[n] >= 0 ? "+" : "") + Z[n] + ")"; l.threeDLayer = true;
    var s = sBg * (ZOOM + Z[n]) / (ZOOM + Z.bg);
    T(l).property("Position").setValue([W / 2, H / 2, Z[n]]);
    T(l).property("Scale").setValue([s, s, 100]);
    var tn = fx(l, "Tint", {"Map Black To": [0, 0, 0], "Map White To": [1, 0.8, 0.5], "Amount to Tint": opt.tint === undefined ? 70 : opt.tint});
    if (opt.redAt !== undefined) keys(tn.property("Map White To"), [[0, [1, 0.8, 0.5]], [opt.redAt, [1, 0.8, 0.5]], [opt.redAt + 3, [1, 0.42, 0.34]]], 0);
    // photo shots run the camera at a small aperture (PHOTO_APERTURE) so the plate stays readable; the
    // foreground occlusion layer gets the rest of its 15–20 px depth-of-field blur here
    if (n === "near") fx(l, "Fast Box Blur", {"Blur Radius": 12});
    out[n] = l;
  }
  return out;
}
var PHOTO_APERTURE = 60;
