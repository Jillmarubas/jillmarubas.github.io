// The $20 Lie: cold open (0:00-0:47). Times are in seconds; the voice-over starts at VO = 0.5 s.
// Line timings come from remotion/src/twentylie/timing_coldopen.json (take A, pauses tightened).
//   effectcraft-cli script "$PWD/coldopen.jsx" --empty --save-as "$PWD/coldopen.ecproj"
#include "lib.jsx"

var VO = 0.5;
function T(t) { return VO + t; } // voice-over time -> film time

// ---------- S1 (0 - 7.55): one phone glowing in the dark; the post types itself in ----------
function shot1() {
  var c = newComp("S1 Phone", 7.55);
  solid(c, NIGHT, "Night");
  // Phone screen in P1 is centred about (-28, -100) px from the image centre (2688 x 1520).
  var hands = card(c, "P1.png", W / 2 + 21, H / 2 + 75, 0, 75);
  var name = txt(c, "Sam Altman", "Fraunces-Black", 26, INK, W / 2 - 150, 300, ParagraphJustification.LEFT_JUSTIFY, true);
  var post = "Insane thing: we are\ncurrently losing money\non OpenAI Pro\nsubscriptions! People\nuse it much more than\nwe expected.";
  var body = txt(c, post, "IBMPlexMono-Medium", 22, INK, W / 2 - 150, 350, ParagraphJustification.LEFT_JUSTIFY, true);
  typeOn(body, post, T(2.4), T(5.6));
  var date = txt(c, "5 Jan 2025", "IBMPlexMono-Regular", 18, [0.45, 0.45, 0.45], W / 2 - 150, 640, ParagraphJustification.LEFT_JUSTIFY, true);
  fade(name, T(1.6), T(2.2), 0, 100); fade(date, T(5.4), T(5.9), 0, 100);
  // Slow dolly toward the screen (a camera move, not a zoom).
  camera(c, [[0, [W / 2, H / 2 + 40, -1200]], [7.55, [W / 2, H / 2 - 20, -760]]], 30);
  return c;
}

// ---------- S2 (7.55 - 14.2): the quote on paper; LOSING MONEY locks in red ----------
function shot2() {
  var c = newComp("S2 Quote", 6.65);
  paper(c, 600);
  var l1 = txt(c, "“Insane thing: we are currently", "Fraunces-SemiBold", 70, INK, W / 2, 450, null, true);
  var l2 = txt(c, "LOSING MONEY", "Fraunces-Black", 150, RED, W / 2, 620, null, true);
  var l3 = txt(c, "on OpenAI Pro subscriptions!”", "Fraunces-SemiBold", 70, INK, W / 2, 740, null, true);
  var src = txt(c, "Sam Altman on X, 5 Jan 2025", "IBMPlexMono-Regular", 24, [0.4, 0.37, 0.33], W / 2, 900, null, true);
  // Voice: "Insane thing," at 7.05; "losing money" lands about 11.2 (VO time).
  fade(l1, 0.0, 0.5, 0, 100);
  fade(l2, 11.0 + VO - 7.55, 11.2 + VO - 7.55, 0, 100);
  keys(l2.property("Transform").property("Scale"), [[11.0 + VO - 7.55, [112, 112, 100]], [11.45 + VO - 7.55, [100, 100, 100]]], 80);
  fade(l3, 12.0 + VO - 7.55, 12.5 + VO - 7.55, 0, 100);
  fade(src, 12.6 + VO - 7.55, 13.1 + VO - 7.55, 0, 100);
  camera(c, [[0, [W / 2 - 40, H / 2, -1200]], [6.65, [W / 2 + 40, H / 2, -1080]]], 30);
  return c;
}

// ---------- S3 (14.2 - 21.5): $200 price tag on a receipt; the cost counter runs into the red ----------
function shot3() {
  var c = newComp("S3 Price", 7.3);
  paper(c, 600);
  var r = card(c, "O01_receipt.png", 560, 500, 80, 56, -4);
  slide(r, 0.0, 0.6, [560, -500, 80], [560, 500, 80]);
  var tag = card(c, "O03_price_tag.png", 900, 400, -60, 42, 9);
  slide(tag, 0.5, 1.1, [2400, 400, -60], [900, 400, -60]);
  var price = txt(c, "$200/mo", "Fraunces-Black", 58, INK, 965, 432, null, true);
  price.property("Transform").property("Z Rotation").setValue(9);
  slide(price, 0.5, 1.1, [2465, 432, -61], [965, 432, -61]);
  // Counter: what one heavy user costs to serve. Crosses $200 at 19.4 s film time.
  var x = T(19.4) - 14.2;
  var label = txt(c, "COST TO SERVE ONE HEAVY USER", "IBMPlexMono-Medium", 28, [0.35, 0.33, 0.3], 1560, 560, null, true);
  label.property("Transform").property("Position").setValue([1420, 590, -150]);
  var n = txt(c, "$0", "Fraunces-Black", 130, INK, 1560, 720, null, true);
  n.property("Transform").property("Position").setValue([1420, 730, -150]);
  n.property("Source Text").expression = 'var v = time < ' + x + ' ? linear(time, 1.4, ' + x + ', 0, 200) : linear(time, ' + x + ', 7.0, 200, 1450); "$" + Math.round(v).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");';
  var nr = txt(c, "$0", "Fraunces-Black", 130, RED, 1560, 720, null, true);
  nr.property("Transform").property("Position").setValue([1420, 730, -151]);
  nr.property("Source Text").expression = n.property("Source Text").expression;
  nr.property("Transform").property("Opacity").expression = 'time < ' + x + ' ? 0 : 100';
  fade(label, 1.2, 1.6, 0, 100); fade(n, 1.2, 1.6, 0, 100);
  camera(c, [[0, [W / 2, H / 2 + 30, -1200]], [7.3, [W / 2, H / 2 - 10, -1120]]], 30);
  return c;
}

// ---------- S4 (21.5 - 24.4): "I personally chose the price." ----------
function shot4() {
  var c = newComp("S4 Chose", 2.9);
  paper(c, 600);
  var q = txt(c, "“I personally chose the price.”", "Fraunces-SemiBoldItalic", 92, INK, W / 2, 540, null, true);
  var who = txt(c, "Sam Altman, Jan 2025", "IBMPlexMono-Regular", 26, [0.4, 0.37, 0.33], W / 2, 640, null, true);
  fade(q, 0.0, 0.3, 0, 100); fade(who, 0.4, 0.8, 0, 100);
  camera(c, [[0, [W / 2, H / 2, -1200]], [2.9, [W / 2, H / 2, -1000]]], 20);
  return c;
}

// ---------- S5 (24.4 - 27.9): whip pan into a crowd of receipts ----------
function shot5() {
  var c = newComp("S5 Receipts", 3.5);
  paper(c, 900);
  var spots = [[380, 560, 300, -7, "L"], [760, 500, 120, 3, "R"], [1160, 540, 40, -2, "L"], [1540, 520, 220, 6, "R"], [960, 600, -150, -1, "L"]];
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i];
    var r = card(c, "O01_receipt.png", s[0], s[1], s[2], 58, s[3]);
    var from = [s[4] == "L" ? -900 : 2800, s[1], s[2]];
    slide(r, 0.25 + i * 0.12, 0.85 + i * 0.12, from, [s[0], s[1], s[2]]);
  }
  // Whip pan in: the camera rushes sideways and settles (motion blur sells it).
  camera(c, [[0, [W / 2 - 900, H / 2, -1200]], [0.35, [W / 2, H / 2, -1200]], [3.5, [W / 2 + 60, H / 2, -1260]]], 85);
  return c;
}

// ---------- S6 (27.9 - 34.9): the receipt says "A BET", circled in red ink ----------
function shot6() {
  var c = newComp("S6 Bet", 7.0);
  paper(c, 600);
  var strip = solid(c, [0.985, 0.98, 0.965], "Receipt paper");
  strip.threeDLayer = true;
  strip.property("Transform").property("Scale").setValue([30, 88, 100]);
  strip.property("Transform").property("Position").setValue([W / 2, 560, 0]);
  var lines = "SMALL PRINT  SUBSCRIPTIONS\n--------------------------\nMONTHLY PLAN ....... $20.00\nYOUR USAGE ............ ???\nOUR COST .............. ???\n--------------------------";
  var body = txt(c, lines, "IBMPlexMono-Medium", 26, INK, W / 2, 230, null, true);
  typeOn(body, lines, 0.2, 2.4);
  var bet = txt(c, "BET", "Fraunces-Black", 120, INK, W / 2, 700, null, true);
  var aBet = T(31.6) - 27.9; // "...there's a quiet bet."
  fade(bet, aBet - 0.2, aBet, 0, 100);
  markerLoop(c, W / 2 - 4, 668, 196, 110, aBet + 0.1, aBet + 0.75, 1.7);
  camera(c, [[0, [W / 2, H / 2 - 40, -1200]], [7.0, [W / 2, H / 2 + 40, -1050]]], 30);
  return c;
}

// ---------- S7 (34.9 - 39.9): the printer won't stop ----------
function shot7() {
  var c = newComp("S7 Printer", 5.0);
  solid(c, [0.12, 0.11, 0.1], "Dark desk");
  // The paper strip rises out of the printer slot, faster and faster, and runs off the top.
  var strip = pathLayer(c, "Strip", [rect(-150, 0, 300, 4200)], [0.97, 0.96, 0.94]);
  strip.threeDLayer = true;
  // tr(t) = how much paper has fed out. The strip's top edge starts at the slot (y 560) and rises;
  // the rest of the strip hangs behind the printer and the desk edge.
  var travel = 'var u = Math.max(0, time - 0.2); var tr = 60 * u + 95 * u * u;';
  strip.property("Transform").property("Position").expression = travel + ' [960, 560 - tr, 20];';
  var printed = txt(c, "", "IBMPlexMono-Medium", 22, INK, W / 2, 0, null, true);
  var rows = ""; for (var i = 0; i < 140; i++) rows += "STEP " + (100 + i * 7) + " ... $0." + (10 + (i * 37) % 89) + "\r";
  printed.property("Source Text").setValue(rows);
  printed.property("Transform").property("Position").expression = travel + ' [960, 560 - tr + 50, 19];';
  var printer = card(c, "O02_receipt_printer.png", W / 2, 760, -40, 70, 0);
  var desk = solid(c, [0.12, 0.11, 0.1], "Desk edge");
  desk.threeDLayer = true;
  desk.property("Transform").property("Position").setValue([W / 2, 1050 + 540, -30]);
  var ex = solid(c, [0, 0, 0], "Darken");
  ex.adjustmentLayer = true;
  var e = fx(ex, "Exposure", {});
  keys(e.property("Exposure"), [[0, 0], [5.0, -1.3]], 30);
  camera(c, [[0, [W / 2, H / 2, -1200]], [5.0, [W / 2, H / 2 + 20, -1060]]], 20);
  return c;
}

// ---------- S8 (39.9 - 42.8): hard stop; the magnifying glass finds the small print ----------
function shot8() {
  var c = newComp("S8 Small print", 2.9);
  paper(c, 600);
  var para = "Plans, prices and included usage are subject to change. Included usage may be adjusted\nto reflect model efficiency. Limits may apply. Continued use constitutes acceptance.\nUsage beyond your allowance may be billed separately at the then-current rate.";
  txt(c, para, "IBMPlexMono-Regular", 17, [0.35, 0.33, 0.3], W / 2, 520, null, true);
  var blank = pathLayer(c, "Lens blank", [ellipseShape(0, 0, 300, 290)], PAPER);
  blank.threeDLayer = true;
  blank.property("Transform").property("Position").setValue([925, 535, -1]);
  fade(blank, 0.5, 0.8, 0, 100);
  var big = txt(c, "INCLUDED USAGE\rMAY CHANGE", "Fraunces-Black", 41, INK, 925, 520, null, true);
  big.property("Transform").property("Position").setValue([925, 520, -2]);
  fade(big, 0.5, 0.8, 0, 100);
  var mag = card(c, "O04_magnifier.png", W / 2 + 330, 640, -120, 60, -10);
  slide(mag, 0.0, 0.7, [2700, 760, -120], [W / 2 + 330, 640, -120]);
  camera(c, [[0, [W / 2, H / 2, -1200]]]);
  return c;
}

// ---------- S9 (42.8 - 47.5): title ----------
function shot9() {
  var c = newComp("S9 Title", 4.7);
  solid(c, NIGHT, "Night");
  var smoke = solid(c, [0.5, 0.5, 0.5], "Smoke");
  fx(smoke, "Fractal Noise", {"Contrast": 60, "Brightness": -30});
  smoke.blendingMode = BlendingMode.SCREEN;
  smoke.property("Transform").property("Opacity").setValue(18);
  var t1 = txt(c, "THE", "Fraunces-Black", 190, PAPER, 495, 610, null, true);
  var t2 = txt(c, "$20", "Fraunces-Black", 190, RED, 960, 610, null, true);
  var t3 = txt(c, "LIE", "Fraunces-Black", 190, PAPER, 1385, 610, null, true);
  var ts = [t1, t2, t3];
  for (var i = 0; i < 3; i++) {
    fade(ts[i], 0.05 + i * 0.08, 0.35 + i * 0.08, 0, 100);
    keys(ts[i].property("Transform").property("Scale"), [[0.05 + i * 0.08, [108, 108, 100]], [0.6 + i * 0.08, [100, 100, 100]]], 80);
  }
  camera(c, [[0, [W / 2, H / 2, -1200]], [4.7, [W / 2, H / 2, -1120]]], 20);
  var out = solid(c, [0, 0, 0], "Out");
  fade(out, 4.2, 4.7, 0, 100);
  return c;
}

// ---------- Assemble ----------
var M = newComp("ColdOpen", 47.5);
M.motionBlur = true;
function place(item, start, end) {
  var l = M.layers.add(item);
  l.startTime = start; l.inPoint = start; l.outPoint = end;
  l.motionBlur = true;
  return l;
}
var shots = [[shot9, 42.8, 47.5], [shot8, 39.9, 42.8], [shot7, 34.9, 39.9], [shot6, 27.9, 34.9], [shot5, 24.4, 27.9], [shot4, 21.5, 24.4], [shot3, 14.2, 21.5], [shot2, 7.55, 14.2], [shot1, 0, 7.55]];
for (var i = 0; i < shots.length; i++) place(shots[i][0](), shots[i][1], shots[i][2]);
var fin = M.layers.addSolid([0, 0, 0], "Finish", W, H, 1);
fin.adjustmentLayer = true;
fx(fin, "Noise", {"Amount of Noise": 4});
fx(fin, "CC Vignette", {"Amount": 45});
writeLn("ColdOpen layers: " + M.numLayers);
