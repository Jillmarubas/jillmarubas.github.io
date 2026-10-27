// The $20 Lie: cold open (0:00-0:47). Times are in seconds; the voice-over starts at VO = 0.5 s.
// Line timings come from remotion/src/twentylie/timing_coldopen.json (take A, pauses tightened).
//   effectcraft-cli script "$PWD/coldopen.jsx" --empty --save-as "$PWD/coldopen.ecproj"
#include "lib.jsx"
#include "chlib.jsx"

var VO = 0.5;
function T(t) { return VO + t; } // voice-over time -> film time

// ---------- S1 (0 - 7.55): a laptop glowing in the dark, the post on screen (revision 1: laptop, real layout) ----------
function shot1() {
  var c = newComp("S1 Laptop", 7.55);
  solid(c, NIGHT, "Night");
  // O26: laptop with the post mapped onto its screen (tools/make_paper_assets.py). Screen centre is
  // (-471, -143) px from the image centre, so at 70 % the screen sits at the frame centre.
  var lap = card(c, "O26_laptop_post.png", W / 2 + 330, H / 2 + 100, 0, 70);
  fade(lap, 0.2, 1.0, 0, 100);
  var glow = solid(c, [0.55, 0.62, 0.85], "Screen glow");
  glow.blendingMode = BlendingMode.SCREEN;
  fx(glow, "Fractal Noise", {"Contrast": 20, "Brightness": -55});
  glow.property("Transform").property("Opacity").setValue(18);
  // Slow dolly toward the screen (a camera move, not a zoom).
  camera(c, [[0, [W / 2, H / 2 + 30, -1200]], [7.55, [W / 2 - 10, H / 2, -760]]], 30);
  return c;
}

// ---------- S2 (7.55 - 14.2): the story in the paper; LOSING MONEY underlined in red ----------
function shot2() {
  var c = newComp("S2 Newspaper", 6.65);
  var n = card(c, "N1_news_altman.png", W / 2, 631, 0, 72);
  var lm = 11.0 + VO - 7.55; // "losing money"
  markerLine(c, 850, 532, 1595, 526, lm, lm + 0.45);
  camera(c, [[0, [W / 2, H / 2 + 30, -1200]], [6.65, [W / 2 + 70, H / 2 - 50, -1040]]], 30);
  return c;
}

// ---------- S3 (14.2 - 21.5): the $200 bill and its tag on the desk; the cost counter runs into the red ----------
function shot3() {
  var c = newComp("S3 Price", 7.3);
  paper(c, 600);
  var r = prop(c, "O23_bill_pro.png", 600, 560, 42, -4);
  slide(r, 0.0, 0.6, [600, -900, 0], [600, 560, 0]);
  var t = tag(c, "$200/mo", 960, 400, 0, 34, 6);
  slide(t, 0.5, 1.1, [2500, 400, 0], [960, 400, 0]);
  // Counter: what one heavy user costs to serve. Crosses $200 at 19.4 s film time.
  var x = T(19.4) - 14.2;
  var label = txt(c, "COST TO SERVE ONE HEAVY USER", "IBMPlexMono-Medium", 28, [0.35, 0.33, 0.3], 1520, 620, null, true);
  var n = txt(c, "$0", "Fraunces-Black", 130, INK, 1520, 760, null, true);
  n.property("Source Text").expression = 'var v = time < ' + x + ' ? linear(time, 1.4, ' + x + ', 0, 200) : linear(time, ' + x + ', 7.0, 200, 1450); "$" + Math.round(v).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");';
  var nr = txt(c, "$0", "Fraunces-Black", 130, RED, 1520, 760, null, true);
  nr.property("Transform").property("Position").setValue([1520, 760, -1]);
  nr.property("Source Text").expression = n.property("Source Text").expression;
  nr.property("Transform").property("Opacity").expression = 'time < ' + x + ' ? 0 : 100';
  fade(label, 1.2, 1.6, 0, 100); fade(n, 1.2, 1.6, 0, 100);
  camera(c, [[0, [W / 2, H / 2, -1200]], [7.3, [W / 2, H / 2, -1110]]], 30);
  return c;
}

// ---------- S4 (21.5 - 24.4): Sam Altman, "I personally chose the price." ----------
function shot4() {
  var c = newComp("S4 Chose", 2.9);
  paper(c, 600);
  altman(c, 540, 640, 46, 0.0);
  var q = txt(c, "“I personally\rchose the price.”", "Fraunces-SemiBoldItalic", 88, INK, 1390, 470, null, true);
  var who = txt(c, "Sam Altman, Jan 2025", "IBMPlexMono-Regular", 26, [0.4, 0.37, 0.33], 1390, 700, null, true);
  fade(q, 0.1, 0.4, 0, 100); fade(who, 0.5, 0.9, 0, 100);
  camera(c, [[0, [W / 2, H / 2, -1200]], [2.9, [W / 2, H / 2, -1060]]], 20);
  return c;
}

// ---------- S5 (24.4 - 27.9): whip pan onto a desk covered in bills ----------
function shot5() {
  var c = newComp("S5 Bills", 3.5);
  paper(c, 600);
  var spots = [[380, 560, -7, "L", "O22_bill_plus.png"], [760, 520, 3, "R", "O23_bill_pro.png"], [1160, 560, -2, "L", "O22_bill_plus.png"], [1540, 530, 6, "R", "O23_bill_pro.png"], [960, 600, -1, "L", "O23_bill_pro.png"]];
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i];
    var r = prop(c, s[4], s[0], s[1], 30, s[2]);
    var from = [s[3] == "L" ? -900 : 2800, s[1], 0];
    slide(r, 0.25 + i * 0.12, 0.85 + i * 0.12, from, [s[0], s[1], 0]);
  }
  // Whip pan in: the camera rushes sideways and settles (motion blur sells it).
  camera(c, [[0, [W / 2 - 900, H / 2, -1200]], [0.35, [W / 2, H / 2, -1200]], [3.5, [W / 2 + 40, H / 2, -1240]]], 85);
  return c;
}

// ---------- S6 (27.9 - 34.9): the bill fills the frame; "A BET" is stamped on it in red ----------
function shot6() {
  var c = newComp("S6 Bet", 7.0);
  paper(c, 600);
  // Framed on the top of the page (header to the usage table), so there is no empty paper below.
  prop(c, "O22_bill_plus.png", W / 2, 833, 70, 0);
  var aBet = T(31.6) - 27.9; // "...there's a quiet bet."
  stamp(c, "BET", 900, 700, aBet, 150);
  camera(c, [[0, [W / 2, H / 2 - 20, -1200]], [7.0, [W / 2 + 40, H / 2 + 30, -1080]]], 30);
  return c;
}

// ---------- S7 (34.9 - 39.9): the fair-use page; "too much" gets the yellow highlighter ----------
function shot7() {
  var c = newComp("S7 Too much", 5.0);
  paper(c, 600);
  // O24 at 62 %, centred at (960, 900): "too much" (image px 881-1118 x 632-671) lands near (966-1113, 568-592).
  prop(c, "O24_terms.png", W / 2, 900, 62, 0);
  var hl = pathLayer(c, "Highlighter", [rect(0, -26, 168, 50)], [1.0, 0.86, 0.15]);
  hl.threeDLayer = true;
  hl.property("Transform").property("Anchor Point").setValue([0, 0, 0]);
  hl.property("Transform").property("Position").setValue([962, 582, -1]);
  hl.property("Transform").property("Z Rotation").setValue(-1);
  hl.blendingMode = BlendingMode.MULTIPLY;
  hl.property("Transform").property("Opacity").setValue(85);
  keys(hl.property("Transform").property("Scale"), [[1.05, [0, 100, 100]], [1.45, [100, 100, 100]]], 40);
  // Push in on the highlighted words; the room darkens as the tension builds.
  camera(c, [[0, [W / 2, H / 2, -1200]], [5.0, [1035, 580, -760]]], 30);
  var ex = solid(c, [0, 0, 0], "Darken");
  ex.adjustmentLayer = true;
  var e = fx(ex, "Exposure", {});
  keys(e.property("Exposure"), [[0, 0], [5.0, -0.9]], 30);
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
