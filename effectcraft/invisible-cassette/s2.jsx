// Scene 2, "The autopsy of a phantom". Scene comp starts 1.0 s before the voice (LEAD).
// Run: effectcraft-cli script /abs/path/s2.jsx --empty --save-as /abs/path/s2.ecproj
#include "kit2.jsx"
SC = 2;
var END = vo(153.69) + 1.8;
var REPORT = [
  ["FINDINGS REGARDING THE", TF.serif, 62, TERM.ink, 80, 300], ["MARKET EVENTS OF", TF.serif, 62, TERM.ink, 80, 380], ["MAY 6, 2010", TF.serif, 62, TERM.ink, 80, 460],
  ["REPORT OF THE STAFFS OF THE CFTC AND SEC", TF.headReg, 30, TERM.ink, 80, 600, 40], ["TO THE JOINT ADVISORY COMMITTEE", TF.headReg, 30, TERM.ink, 80, 645, 40],
  ["ON EMERGING REGULATORY ISSUES", TF.headReg, 30, TERM.ink, 80, 690, 40], ["SEPTEMBER 30, 2010", TF.headReg, 30, TERM.ink, 80, 1180, 100]];

// A · the report: 104 pages, no simple bug
(function () {
  var o = Shot("S2A Report", 0, vo(8.68));
  doc(o, REPORT, 0.3, {x: W / 2 + 360});
  num(o, 0, 104, at("104"), at("104") + 0.8, {size: 220, color: TERM.amber, x: W / 2 - 420, y: H / 2 - 10, glow: true});
  label(o, "PAGES", at("104") + 0.4, {x: W / 2 - 420, y: H / 2 + 60});
  word(o, "SOFTWARE BUG", at("simple"), {size: 64, x: W / 2 - 420, y: H / 2 + 190, mode: "fade"});
  strike(o, W / 2 - 420, H / 2 + 170, 460, at("bug") + 0.25);
  cam(o, {d0: -0.3, d1: 0.4});
})();

// B · one fund, 75,000 contracts, about $4.1 billion
(function () {
  var o = Shot("S2B Sell order", vo(8.68), vo(26.9));
  word(o, "MUTUAL FUND", at("one mutual"), {size: 100, y: 250, mode: "rise"});
  word(o, "14:32 EDT", at("2", vo(8.68)), {font: TF.mono, size: 44, color: TERM.amber, y: 330, mode: "type", cps: 14, track: 100});
  num(o, 0, 75000, at("75"), at("75") + 1.0, {size: 200, y: 590, glow: true});
  label(o, "FUTURES CONTRACTS · SELL", at("75") + 0.4, {y: 670, size: 28});
  word(o, "≈ $4.1 BILLION", at("$4"), {size: 96, color: TERM.amber, y: 820, glow: true});
  label(o, "HEDGE", at("protect"), {y: 900, size: 26});
  flag(o, "Source: CFTC–SEC report, 30 Sept 2010");
  fgTicker(o.c, H - 30, true);
  cam(o, {d0: 0.4, d1: -0.4});
})();

// C1 · the instruction: keep pace with volume, ignore price and time (our own illustration)
var tMonths = at("months earlier");
(function () {
  var o = Shot("S2C Program", vo(26.9), tMonths);
  var b = box(o, 1100, 520, W / 2, H / 2, 30); vis(b, 0.1, o.d, 0.3, 0.3, o.d);
  var x = W / 2 - 480, rows = [["SELL_PROGRAM {", vo(26.9) + 0.3, TERM.amber], ["  pace:  TRADING VOLUME", at("volume"), TERM.white], ["  price: IGNORED", at("price"), TERM.red], ["  time:  IGNORED", at("time", at("price")), TERM.red], ["}", at("time", at("price")) + 0.5, TERM.amber]];
  for (var i = 0; i < rows.length; i++) word(o, rows[i][0], rows[i][1], {font: TF.mono, size: 52, color: rows[i][2], x: x, y: H / 2 - 160 + i * 84, just: LEFTJ, track: 0, mode: "type", cps: 30});
  flag(o, "Illustration");
  cam(o, {d0: -0.3, d1: 0.3});
})();
// C2 · five hours then, twenty minutes now (true-scale bars)
(function () {
  var o = Shot("S2C Duration bars", tMonths, vo(41.28));
  bars(o, [["EARLIER SALE", 300, TERM.grey, "> 5 HOURS", at("five hours")], ["MAY 6, 2010", 20, TERM.red, "20 MINUTES", at("20 minutes")]], tMonths, {y: H / 2 - 110, gap: 230, w: 1000, x: W / 2 - 150});
  flag(o, "Source: CFTC–SEC report, 30 Sept 2010");
  cam(o, {d0: 0.3, d1: -0.3});
})();

// D · HFTs buy, sell on; the program reads it as demand and sells faster
(function () {
  var o = Shot("S2D HFT", vo(41.28), vo(57.8));
  tag(o, "SELL PROGRAM", o.a + 0.2, {x: 420, y: 520, color: TERM.red, size: 50});
  tag(o, "HFT FIRMS", at("high frequency"), {x: 1400, y: 520, color: TERM.amber, size: 50});
  label(o, "MILLISECONDS", at("milliseconds"), {x: 1400, y: 620});
  var tF = at("faster");
  for (var i = 0; i < 8; i++) shuttle(o, [640, 500 + i * 6], [1150, 500 + i * 6], i % 3 ? TERM.amber : TERM.red, at("bought"), "0.5 + 1.2 * Math.min(3, Math.max(0, time - " + o.t(tF) + "))", i / 4);
  word(o, "VOLUME = DEMAND?", at("demand"), {size: 56, color: TERM.amber, x: 420, y: 640});
  word(o, "SELLS FASTER", tF, {size: 96, color: TERM.red, y: 300, glow: true});
  cam(o, {x0: -40, x1: 40, d0: 0.3, d1: -0.4});
})();

// E · hot potato: machines trading the same contracts between themselves
(function () {
  var o = Shot("S2E Hot potato", vo(57.8), vo(68.44), {red: true});
  var P = [], RX = 640, RY = 330;
  for (var i = 0; i < 6; i++) { var th = i / 6 * 2 * Math.PI - Math.PI / 2; P.push([W / 2 + Math.cos(th) * RX, H / 2 + Math.sin(th) * RY]); }
  for (var i = 0; i < 6; i++) tag(o, "HFT", o.a + 0.3 + i * 0.12, {x: P[i][0], y: P[i][1], color: TERM.amber, size: 34, font: TF.mono, z: 0});
  var pairs = [[0, 3], [1, 4], [2, 5], [0, 2], [1, 5], [3, 5], [0, 4], [2, 4], [1, 3]];
  for (var k = 0; k < pairs.length; k++) shuttle(o, P[pairs[k][0]], P[pairs[k][1]], k % 3 ? TERM.amber : TERM.red, o.a + 0.8, "1.6 + 0.25 * " + k, k * 0.37);
  label(o, "MACHINE ↔ MACHINE", o.a + 0.6, {y: H / 2 - 40, color: TERM.white, size: 34, z: -60, until: at("hot potato") - 0.1});
  word(o, "“HOT POTATO”", at("hot potato"), {size: 150, y: H / 2 + 70, z: -60, glow: true});
  label(o, "THE REGULATORS’ TERM", at("hot potato") + 0.5, {y: H / 2 + 150, z: -60});
  cam(o, {d0: -0.6, d1: 0.8});
})();

// F · directive 03:45: a yellow highlighter over the report's own words, synced to the narration
(function () {
  var o = Shot("S2F Report excerpt", vo(68.44), vo(84.9));
  var L = ["Between 2:45:13 and 2:45:27, HFTs traded", "over 27,000 contracts, which accounted for", "about 49 percent of the total trading", "volume, while buying only about 200", "additional contracts net."];
  var lines = [["FINDINGS REGARDING THE MARKET EVENTS OF MAY 6, 2010", TF.headReg, 26, TERM.grey, 90, 120, 60]];
  for (var i = 0; i < L.length; i++) lines.push([L[i], TF.monoReg, 40, TERM.ink, 90, 260 + i * 84, 0]);
  var d = doc(o, lines, o.a + 0.1, {w: 1400, h: 760, scale: 100, ry: -4, y: H / 2 - 20});
  // highlights in doc pixels: JetBrains Mono advances 0.6 em (24 px at 40 px), baselines at 260 + 84 i
  var cw = 24, hl = function (row, c0, c1, when) { highlight(o, d.comp, 90 + c0 * cw - 6, 260 + row * 84 - 13, (c1 - c0) * cw + 12, 54, when); };
  hl(0, 8, 27, at("14")); hl(1, 0, 21, at("27")); hl(2, 0, 16, at("half")); hl(3, 21, 35, at("200")); hl(4, 0, 24, at("200") + 0.45);
  flag(o, "Source: CFTC–SEC report, 30 Sept 2010");
  cam(o, {x0: -30, x1: 30, d0: 0.3, d1: -0.4});
})();

// G · market makers pull out; the buy side empties (illustration)
(function () {
  var o = Shot("S2G Buyers vanish", vo(84.9), vo(95.0), {red: true});
  label(o, "BUY ORDERS", o.a + 0.2, {y: 170, color: TERM.white, size: 30});
  var ws = [520, 760, 430, 900, 610, 820, 380, 700, 560, 940, 470, 650];
  var t0 = at("widened"), t1 = at("disappeared");
  for (var i = 0; i < ws.length; i++) {
    var b = solid(o.c, TERM.green, "bid " + i, ws[i], 30); b.threeDLayer = true;
    T(b).property("Anchor Point").setValue([ws[i], 15, 0]); T(b).property("Position").setValue([W / 2 + 480, 240 + i * 50, 0]);
    var ta = o.t(t0 + (t1 - t0) * ((i * 7) % 12) / 12);
    keys(T(b).property("Scale"), [[0, [100, 100, 100]], [ta, [100, 100, 100]], [ta + 0.5, [0.5, 100, 100]]], 0);
    setEase(T(b).property("Scale"), 70, 0.1);
    vis(b, 0, ta + 0.5, 0, 0.1, o.d);
  }
  label(o, "MARKET MAKERS: OUT", at("pulled out"), {y: 880, color: TERM.amber, size: 34});
  word(o, "NO BUYERS", t1, {size: 120, color: TERM.red, y: H / 2 + 20, z: -60, glow: true});
  flag(o, "Illustration");
  cam(o, {d0: 0.4, d1: -0.5});
})();

// H · not a broken machine; emergent behaviour
(function () {
  var o = Shot("S2H Not broken", vo(95.0), vo(107.6));
  var tY = at("yet the emergent");
  word(o, "NO MALFUNCTION", at("did not blame"), {size: 110, y: 440, until: tY - 0.1});
  word(o, "AS INSTRUCTED", at("exactly"), {size: 64, color: TERM.amber, y: 560, until: tY - 0.1, mode: "rise"});
  word(o, "EMERGENT BEHAVIOR", at("emergent"), {size: 100, y: 460, mode: "rise"});
  word(o, "COLLAPSE", at("catastrophic"), {size: 150, color: TERM.red, y: 620, glow: true});
  cam(o, {d0: -0.3, d1: 0.3});
})();

// I · the "But" turn: hard cut on the word to a cold map of Great Britain; London pinned on "London"
(function () {
  var o = Shot("S2I London", vo(107.6), vo(129.16), {red: true});
  mapDraw(o, "gb", {when: o.a, color: TERM.amberDim, width: 2});
  pin(o, mapPoint(o, "gb", "London"), "LONDON", at("london"), {lx: 0, ly: -48});
  word(o, "2015", at("five years"), {font: TF.mono, size: 170, color: TERM.amber, x: 330, y: 420, glow: true});
  label(o, "U.S. CHARGES", at("charged"), {x: 330, y: 500, color: TERM.white, size: 32});
  word(o, "SPOOFING", at("fake"), {size: 88, color: TERM.red, x: 1530, y: 420, mode: "rise"});
  tag(o, "PLEADED GUILTY", at("pleaded"), {x: 1530, y: 580, color: TERM.red, size: 54, rot: -3});
  flag(o, "Map: Natural Earth · Source: U.S. Department of Justice, 2016");
  cam(o, {d0: 0.5, d1: -0.6});
})();

// J · directive 04:30: split screen, a drawn eye blink (no footage, no AI) against a data waterfall
(function () {
  var o = Shot("S2J Blink vs waterfall", vo(129.16), vo(134.32));
  var div = solid(o.c, TERM.amberDim, "split", 3, 760); div.threeDLayer = true; T(div).property("Position").setValue([W / 2, H / 2, 0]);
  // left: the eye. One real blink (about 0.3 s) on "speed"
  var eye = shapeAt(o.c, "eye", [W / 4, H / 2 - 40, 0]);
  // shape groups stack top-first: pupil, iris, then the almond (two arcs meeting at the corners)
  addEllipse(eye, 64, [0, 0], null, 0, TERM.black); addEllipse(eye, 170, [0, 0], TERM.amber, 5, TERM.amberDim);
  var up = arcPts(360, -50, 50, 16), lo = arcPts(360, 130, 230, 16), al = [], off = 360 * Math.cos(50 * Math.PI / 180);
  for (var k = 0; k < up.length; k++) al.push([up[k][0], up[k][1] + off]);
  for (var k = 0; k < lo.length; k++) al.push([lo[k][0], lo[k][1] - off]);
  addPath(eye, al, TERM.amber, 6, true, TERM.panel);
  var tb = o.t(at("speed"));
  keys(T(eye).property("Scale"), [[0, [100, 100, 100]], [tb, [100, 100, 100]], [tb + 0.12, [100, 3, 100]], [tb + 0.3, [100, 100, 100]]], 0);
  setEase(T(eye).property("Scale"), 60, 60);
  label(o, "A BLINK: 100–400 MILLISECONDS", o.a + 0.4, {x: W / 4, y: H / 2 + 260, color: TERM.white, size: 30, track: 60});
  // right: the waterfall. Columns of order prices falling fast, rewritten every frame
  for (var c = 0; c < 6; c++) {
    var t = txt(o.c, "0", TF.monoReg, 30, c % 3 ? TERM.green : TERM.amber, [W / 2 + 120 + c * 140, 160, 0], LEFTJ, 0);
    t.property("Source Text").expression = "var f = Math.floor(time * 24), s = ''; seedRandom(f * 7 + " + c + ", true); for (var i = 0; i < 18; i++) s += (random(1000, 9999) | 0) + (i < 17 ? '\\r' : ''); s;";
    T(t).property("Opacity").setValue(55 + (c % 2) * 25);
  }
  var cv = solid(o.c, TERM.black, "waterfall fade", 960, 220); T(cv).property("Position").setValue([W * 0.75, H - 110]); T(cv).property("Opacity").setValue(85);
  label(o, "27,000 CONTRACTS IN 14 SECONDS", o.a + 0.4, {x: W * 0.75, y: H / 2 + 260, color: TERM.white, size: 30, track: 60});
  flag(o, "Sources: Medical News Today · CFTC–SEC report");
  cam(o, {d0: -0.5, d1: 0.5});
})();

// K1 · a warning shot; finance was the proving ground
var tRun = at("running"), tPhys = at("physical");
(function () {
  var o = Shot("S2K Warning shot", vo(134.32), tRun);
  var tT = at("today");
  word(o, "2010", at("2010", vo(134.32)), {font: TF.mono, size: 150, color: TERM.amber, y: 400, until: tT - 0.1});
  word(o, "WARNING SHOT", at("warning"), {size: 120, y: 540, until: tT - 0.1});
  label(o, "PROVING GROUND", at("proving"), {y: 650, color: TERM.white, size: 34, until: tT - 0.1});
  word(o, "TODAY", tT, {font: TF.mono, size: 90, color: TERM.amber, y: 420, mode: "type", cps: 14});
  word(o, "AUTONOMOUS LOGIC", at("autonomous"), {size: 110, y: 560, mode: "rise"});
  cam(o, {d0: -0.4, d1: 0.5});
})();
// K2 · directive 05:15: slow push into an empty server room, cold blue LEDs. Review note (4:37, "very low"):
// the drawn room was too dark, so a bright, clean aisle (AI-generated with Higgsfield: the free photos of real
// server rooms all carry brand logos), three layers, with a light TV overlay
(function () {
  var o = Shot("S2K Server room", tRun, tPhys, {bg: false});
  solid(o.c, TERM.black, "void");
  photoShot(o, "servers", {tint: 0});
  var sl = o.c.layers.add(img("overlays/scanlines.png")); sl.blendingMode = BlendingMode.MULTIPLY; T(sl).property("Opacity").setValue(30);
  label(o, "LATENCY", at("beyond"), {y: H / 2 - 20, color: [0.85, 0.92, 1.0], size: 40, track: 160});
  flag(o, "AI-generated illustration (Higgsfield)");
  cam(o, {push: 1.05, d0: 0.5, d1: -0.6, aperture: PHOTO_APERTURE});
})();
// K3 · the same logic moves into the physical world: a transmission network draws itself
(function () {
  var o = Shot("S2K Physical world", tPhys, END);
  var N = [[160, 820], [520, 700], [860, 760], [1180, 640], [1500, 720], [1780, 600], [700, 900], [1320, 880], [1040, 520]];
  var E = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 2], [3, 7], [7, 4], [2, 8], [8, 3]];
  for (var k = 0; k < E.length; k++) { var p = pathShape(o.c, [N[E[k][0]], N[E[k][1]]], TERM.amber, 3, "power line"); drawOn(o, p, o.a + k * 0.12, 0.6); }
  for (var n = 0; n < N.length; n++) { var d = dot(o.c, N[n][0], N[n][1], 12, TERM.amber, "substation"); vis(d, o.t(o.a + n * 0.1), o.d, 0.3, 0.3, o.d); }
  word(o, "PHYSICAL WORLD", at("physical") + 0.1, {size: 120, y: 330, glow: true});
  cam(o, {y0: 30, y1: -10, d0: -0.4, d1: 0.5});
})();

assemble("Scene2", END, [[0, 100], [0.6, 0], [vo(57.8), 0], [vo(58.2), 12], [vo(95.0), 12], [vo(95.4), 0], [vo(107.6), 0], [vo(107.6) + F, 18], [vo(129.16), 18], [vo(129.5), 0], [END - 1.0, 0], [END, 100]],
  [[vo(107.6), "cold"], [vo(129.16), "warm"]]);
logEvents(2);
