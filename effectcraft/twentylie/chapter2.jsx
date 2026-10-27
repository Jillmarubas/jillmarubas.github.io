// Chapter 2: THE HEAVY USERS.  effectcraft-cli script "$PWD/chapter2.jsx" --empty --save-as "$PWD/chapter2.ecproj"
#include "lib.jsx"
#include "chlib.jsx"
#include "timing_ch2.jsx"

// Darker paper for this chapter: tension builds, brightness drops.
function paper2(c) { var p = paper(c, 600); var d = solid(c, [0, 0, 0], "Dim"); d.property("Transform").property("Opacity").setValue(22); return p; }
function loopRing(c, cx, cy, r, w0, w1, t0, t1, rgb) {
  var l = pathLayer(c, "Loop", [ellipseShape(cx, cy, r, r)], null, rgb || CREAM, w0);
  l.property("Transform").property("Position").setValue([0, 0]);
  var st = l.property("Contents").property(1).property("Contents").property("ADBE Vector Graphic - Stroke");
  keys(st.property("Stroke Width"), [[t0, w0], [t1, w1]], 20);
  return l;
}
function orbit(c, cx, cy, r, t0, period, rgb) {
  var dot = pathLayer(c, "Orbit", [ellipseShape(0, 0, 16, 16)], rgb || RED);
  dot.property("Transform").property("Position").expression =
    'var a = -Math.PI / 2 + Math.max(0, time - ' + t0 + ') / ' + period + ' * 2 * Math.PI; [' + cx + ' + ' + r + ' * Math.cos(a), ' + cy + ' + ' + r + ' * Math.sin(a)]';
  return dot;
}

var shots = [
  // 0: "December 2024."
  {at: 0, fn: function (c, d, at) { paper2(c); stamp(c, "DEC 2024", W / 2, 560, 0.15); still(c, d, 60); }},
  // 0b: "OpenAI launches ChatGPT Pro. Two hundred dollars a month, ten times the price of Plus."
  {at: L(0, 0.22, 0), fn: function (c, d, at) {
    paper2(c);
    var k = label(c, "CHATGPT PRO", W / 2, 300, 36, INK); fade(k, 0.1, 0.4, 0, 100);
    var t = tag(c, "$200/mo", W / 2 + 40, 600, -40, 34, -6, 70); enter(t, L(0, 0.45, at), -1400, 0, 0.5);
    var x = head(c, "10× THE PRICE OF PLUS", W / 2, 960, 58, RED); pop(x, L(0, 0.8, at), 108);
    still(c, d, 90);
  }},
  // 1: "The selling point was a new kind of model, one that reasons. It thinks through a problem before it answers."
  S(1, function (c, d, at) {
    dark(c, [0.06, 0.06, 0.07]); smoke(c, 14);
    // Revision 1: the model's hidden reasoning runs as a code overlay across the whole frame.
    codeOverlay(c, L(1, 0.45, at), 42, [0.55, 0.85, 0.65], ["think(step=1): consider the user's goal", "think(step=2): list the possible approaches",
      "think(step=3): check step 2 against the data", "    -> mismatch at row 14; try another path", "think(step=4): compare both answers",
      "think(step=5): re-check the arithmetic", "tokens_hidden += 1_284", "tokens_shown  += 96", ""], 28, 160);
    var chip = card(c, "O10_ai_chip.png", W / 2, 760, -60, 24);
    var k = label(c, "A MODEL THAT REASONS", W / 2, 960, 30, CREAM); fade(k, L(1, 0.2, at), L(1, 0.3, at), 0, 100);
    still(c, d, 120);
  }),
  // 2: "But that thinking is made of tokens too. You never see most of it. Someone still pays for it."
  S(2, function (c, d, at) {
    dark(c, [0.06, 0.06, 0.07]);
    // Revision 1: real US banknotes stacking up (the meter's top no longer runs off the frame).
    var base = shadow(card(c, "O29_dollar_bills.png", W / 2, 520, 0, 34));
    for (var i = 0; i < 9; i++) {
      var y = 520 - (i + 1) * 24, t0 = L(2, 0.05 + i * 0.09, at), b = shadow(card(c, "O29_dollar_bills.png", W / 2 + ((i * 37) % 5 - 2) * 6, y, 0, 34, ((i * 53) % 7 - 3) * 0.8));
      keys(b.property("Transform").property("Position"), [[t0, [W / 2, -500, 0]], [t0 + 0.32, [W / 2 + ((i * 37) % 5 - 2) * 6, y, 0]]], 0);
      b.property("Transform").property("Position").setTemporalEaseAtKey(1, [new KeyframeEase(0, 70)], [new KeyframeEase(0, 70)]);
      keys(b.property("Transform").property("Opacity"), [[t0 - 0.01, 0], [t0, 100]], 0);
    }
    var k = label(c, "HIDDEN REASONING TOKENS", W / 2, 840, 28, CREAM); fade(k, L(2, 0.35, at), L(2, 0.45, at), 0, 100);
    counter(c, W / 2, 950, 90, RED, 0, 4.8, L(2, 0.05, at), L(2, 1.0, at), "$", "", 2);
    still(c, d, 80);
  }),
  // 3: "A few weeks later came the post. 'People use it much more than we expected.'"
  S(3, function (c, d, at) {
    // Revision 1: his photo with the quote beside him, black ink creeping in at the edges.
    paper2(c);
    altman(c, 540, 640, 46, 0.0);
    var nm = label(c, "SAM ALTMAN", 1390, 300, 30, INK); fade(nm, 0.1, 0.4, 0, 100);
    var q = txt(c, "“People use it\rmuch more than\rwe expected.”", "Fraunces-SemiBold", 78, INK, 1390, 420, null, true);
    fade(q, 0.15, 0.5, 0, 100);
    markerLine(c, 1125, 538, 1655, 532, L(3, 0.62, at), L(3, 0.85, at));
    source(c, "Sam Altman on X, Jan 2025", 0.3).property("Transform").property("Position").setValue([1390, 760, 0]);
    inkEdges(c, 30);
    still(c, d, 90);
  }),
  // 4: "Then the next shift arrived. Not a smarter chatbot, but an agent."
  S(4, function (c, d, at) {
    paper2(c);
    // Revision 1: one terminal. First a chatbot answers one question; then an agent takes the task.
    var g = L(4, 0.6, at);
    var term = terminal(c, W / 2, 560, 1180, 600, 0);
    var h1 = head(c, "CHATBOT", W / 2, 200, 56, INK); fade(h1, 0.1, 0.3, 0, 100); fade(h1, g - 0.2, g, 100, 0);
    var h2 = head(c, "AGENT", W / 2, 200, 56, RED); fade(h2, g, g + 0.2, 0, 100);
    var c1 = termText(c, term, "$ chat \"What's a token?\"\r\rA small piece of a word.", -540, -200, 0.2, 1.4);
    fade(c1, g - 0.25, g, 100, 0);
    var a2 = "$ agent run \"fix the failing tests\"\r> reading 14 files...\r> writing patch...\r> running tests... 3 failed\r> trying again...";
    termText(c, term, a2, -540, -200, g + 0.05, d - 0.2);
    still(c, d, 80);
  }),
  // 5: "A chatbot answers one question. An agent takes a whole task, opens files, writes code, tests it, fails, and tries again. On its own."
  S(5, function (c, d, at) {
    dark(c, [0.07, 0.065, 0.06]); smoke(c, 10);
    card(c, "P3.png", 640, 600, 60, 62);
    var cx = 1420, cy = 520, r = 230;
    loopRing(c, cx, cy, r, 4, 4, 0, 1, [0.5, 0.48, 0.45]);
    var words = [["READ", 0, -1, 0.3], ["WRITE", 1, 0, 0.42], ["TEST", 0, 1, 0.55], ["FIX", -1, 0, 0.7]];
    for (var i = 0; i < 4; i++) {
      var w = words[i], l = head(c, w[0], cx + w[1] * (r + 110), cy + w[2] * (r + 50) + 18, 48, CREAM);
      fade(l, L(5, w[3], at), L(5, w[3], at) + 0.2, 0, 100);
    }
    orbit(c, cx, cy, r, L(5, 0.3, at), 2.4);
    drift(c, d, 30, 100);
  }),
  // 6: "And at every step it re-reads everything it has done so far. Each lap of the loop costs more than the last."
  S(6, function (c, d, at) {
    dark(c, [0.07, 0.065, 0.06]);
    var cx = W / 2, cy = 470, r = 230;
    loopRing(c, cx, cy, r, 4, 46, 0.2, d, RED);
    orbit(c, cx, cy, r, 0, 1.6, CREAM);
    var k = label(c, "TOKENS USED ON ONE TASK", W / 2, 830, 28, CREAM);
    counter(c, W / 2, 950, 100, CREAM, 2000, 180000, 0.2, d, "", "", 0);
    still(c, d, 90);
  }),
  // 7: "In April 2025, Anthropic launched its own two-hundred-dollar plan, called Max."
  S(7, function (c, d, at) { paper2(c); stamp(c, "APR 2025", W / 2, 560, 0.2); still(c, d, 60); }),
  {at: L(7, 0.18, 0), fn: function (c, d, at) {
    paper2(c);
    var k = label(c, "CLAUDE MAX", W / 2, 300, 36, INK); fade(k, 0.05, 0.3, 0, 100);
    var t = tag(c, "$200/mo", W / 2 + 40, 600, -40, 34, 5, 70); enter(t, 0.3, 1400, 0, 0.5);
    source(c, "Source: Anthropic, Apr 2025", 0.6);
    still(c, d, 90);
  }},
  // 7c: "Programmers pointed its coding agent, Claude Code, at their projects."
  {at: L(7, 0.52, 0), fn: function (c, d, at) {
    var p = plate(c, "B3_home_office_night.png", 900); fx(p, "Exposure", {"Exposure": 0.6});
    card(c, "P3.png", W / 2 + 80, 640, 0, 72);
    drift(c, d, 50, 160);
  }},
  // 8: "Some of them never turned it off."
  S(8, function (c, d, at) {
    var p = plate(c, "B3_home_office_night.png", 900); fx(p, "Exposure", {"Exposure": 0.3});
    card(c, "P4.png", W / 2, 680, 0, 70);
    var clk = card(c, "O11_clock.png", 1500, 260, 300, 18);
    var hand = pathLayer(c, "Hand", [rect(-4, -95, 8, 95)], INK); hand.threeDLayer = true;
    hand.property("Transform").property("Position").setValue([1500 - 105 * 0, 260, 299]);
    hand.property("Transform").property("Position").setValue(clk.property("Transform").property("Position").value);
    keys(hand.property("Transform").property("Z Rotation"), [[0, 0], [d, 1440]], 0);
    still(c, d, 70);
  }),
  // 9: "In July 2025, Anthropic announced weekly limits. ... 'continuously in the background, 24/7.'"
  S(9, function (c, d, at) {
    paper2(c);
    var s = stamp(c, "JUL 2025", W / 2, 300, 0.15, 64);
    var k = label(c, "NEW WEEKLY LIMITS", W / 2, 400, 30, INK); fade(k, L(9, 0.25, at), L(9, 0.33, at), 0, 100);
    quote(c, "“continuously in the background, 24/7”", "Anthropic, 28 Jul 2025", L(9, 0.6, at), 72, false, 620);
    still(c, d, 90);
  }),
  // 10: "One user on a two-hundred-dollar plan had used, in Anthropic's words, 'tens of thousands' of dollars of model usage."
  S(10, function (c, d, at) {
    paper2(c);
    label(c, "PAID", 620, 330, 30, INK); head(c, "$200", 620, 470, 120, INK);
    label(c, "USED", 1300, 330, 30, INK);
    counter(c, 1300, 470, 120, RED, 200, 30000, L(10, 0.2, at), L(10, 0.85, at), "$", "", 0);
    var k = head(c, "“TENS OF THOUSANDS”", W / 2, 760, 64, RED); fade(k, L(10, 0.6, at), L(10, 0.7, at), 0, 100);
    still(c, d, 60);
  }),
  // 11: "Anthropic said the new limits would affect fewer than five percent of subscribers."
  S(11, function (c, d, at) {
    paper2(c);
    grid(c, 20, 5, 64, 470, [23, 46, 71, 88], L(11, 0.55, at));
    var k = head(c, "FEWER THAN 5%", W / 2, 820, 90, RED); pop(k, L(11, 0.6, at), 108);
    source(c, "Source: Anthropic, Jul 2025", 0.4);
    still(c, d, 60);
  }),
  // 12: "But from the other side of the counter... sold as twenty times more usage. Nobody had shown them where the ceiling was."
  S(12, function (c, d, at) {
    dark(c, [0.12, 0.11, 0.1]);
    var man = card(c, "P5.png", W / 2 + 60, 700, 0, 66);
    var glass = card(c, "O19_frosted_glass.png", W / 2, -60, -40, 70);
    var t = L(12, 0.82, at);
    slide(glass, t, t + 0.18, [W / 2, -700, -40], [W / 2, -60, -40], 0);
    var k = head(c, "SOLD AS “20× MORE USAGE”", W / 2, 960, 56, CREAM); fade(k, L(12, 0.45, at), L(12, 0.55, at), 0, 100);
    still(c, d, 70);
  }),
  // 13: "The companies had a problem. Their best customers were their most expensive ones."
  S(13, function (c, d, at) {
    paper2(c);
    var g = grid(c, 20, 5, 64, 470, [23, 46, 71, 88], 0);
    var k1 = head(c, "BEST CUSTOMERS", W / 2, 810, 70, INK); fade(k1, L(13, 0.45, at), L(13, 0.55, at), 0, 100);
    var k2 = head(c, "= MOST EXPENSIVE", W / 2, 910, 70, RED); fade(k2, L(13, 0.75, at), L(13, 0.85, at), 0, 100);
    still(c, d, 60);
  }),
  // 14: "One company tried to fix that quietly."
  S(14, function (c, d, at) {
    var p = plate(c, "B7_door_ajar.png", 900); fx(p, "Exposure", {"Exposure": 0.8});
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2, -900]]], 15);
  }),
  // 15: "It did not go quietly."  -> the light snaps off (the door slams), black.
  S(15, function (c, d, at) {
    var p = plate(c, "B7_door_ajar.png", 900); fx(p, "Exposure", {"Exposure": 0.8});
    var blk = solid(c, [0, 0, 0], "Slam"); blk.property("Transform").property("Opacity").setValue(0);
    keys(blk.property("Transform").property("Opacity"), [[L(15, 0.75, at), 0], [L(15, 0.75, at) + 0.05, 100]], 0);
    camera(c, [[0, [W / 2, H / 2, -900]], [d, [W / 2, H / 2, -860]]], 15);
  })
];

buildChapter("Chapter2", 2, "THE HEAVY USERS", shots, 1.4);
