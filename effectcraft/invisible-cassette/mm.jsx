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
// kinetic slam-in for a keyword: scale 130 -> 100 with a fast settle, opacity on
function slamIn(l, at) {
  keys(T(l).property("Scale"), [[at, [128, 128, 100]], [at + 0.22, [100, 100, 100]]], 0);
  setEase(T(l).property("Scale"), 70, 0.1);
  keys(T(l).property("Opacity"), [[0, 0], [at - 0.001, 0], [at, 100]], 0);
}
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

// global finish: smoke drifting in light, organic grain, vignette (MagnatesMedia overlays)
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
  var vg = solid(M, [0, 0, 0], "Vignette"); vg.adjustmentLayer = true;
  fx(vg, "CC Vignette", {"Amount": 35});
}

// a document recreated as typeset paper (titles real; nothing invented), with the house shadow
function docComp(name, w, h, lines) {
  var c = comp(name, 60, w, h);
  solid(c, TERM.paper, "paper");
  var n = solid(c, [0.5, 0.5, 0.5], "paper grain"); fx(n, "Fractal Noise", {"Contrast": 120, "Transform/Scale": 3}); n.blendingMode = BlendingMode.MULTIPLY; T(n).property("Opacity").setValue(10);
  for (var i = 0; i < lines.length; i++) { var L = lines[i]; txt(c, L[0], L[1], L[2], L[3] || TERM.ink, [L[4], L[5]], ParagraphJustification.LEFT_JUSTIFY, L[6] || 0); }
  return c;
}
