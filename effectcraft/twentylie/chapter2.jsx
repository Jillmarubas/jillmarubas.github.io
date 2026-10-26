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
    var rows = ""; for (var i = 0; i < 12; i++) rows += ["consider the user's goal...", "list the possible approaches", "check step 2 against the data", "that fails; try another path", "compare both answers", "re-check the arithmetic"][i % 6] + "\r";
    var th = txt(c, rows, "IBMPlexMono-Regular", 24, [0.75, 0.73, 0.7], W / 2, 0, null, true);
    th.property("Transform").property("Position").expression = '[960, 200 - (time - ' + L(1, 0.5, at) + ') * 22, 30]';
    th.property("Transform").property("Opacity").expression = 'time < ' + L(1, 0.5, at) + ' ? 0 : linear(time, ' + L(1, 0.5, at) + ', ' + L(1, 0.6, at) + ', 0, 45)';
    var chip = card(c, "O10_ai_chip.png", W / 2, 760, -60, 24);
    var k = label(c, "A MODEL THAT REASONS", W / 2, 960, 30, CREAM); fade(k, L(1, 0.2, at), L(1, 0.3, at), 0, 100);
    still(c, d, 120);
  }),
  // 2: "But that thinking is made of tokens too. You never see most of it. Someone still pays for it."
  S(2, function (c, d, at) {
    dark(c, [0.06, 0.06, 0.07]);
    var m = card(c, "O09_taxi_meter.png", W / 2, 600, 0, 28);
    for (var i = 0; i < 9; i++) {
      var coin = card(c, "O08_coins.png", 560 + (i % 5) * 200, 120, -20, 7);
      var t0 = L(2, 0.05 + i * 0.07, at);
      slide(coin, t0, t0 + 0.45, [560 + (i % 5) * 200, -100, -20], [W / 2, 520, -20], 30);
      keys(coin.property("Transform").property("Opacity"), [[t0 + 0.4, 100], [t0 + 0.5, 0]], 0);
    }
    var curtain = solid(c, [0.03, 0.03, 0.035], "Curtain"); curtain.threeDLayer = true;
    curtain.property("Transform").property("Scale").setValue([100, 40, 100]);
    curtain.property("Transform").property("Position").setValue([W / 2, 200, -30]);
    var k = label(c, "HIDDEN REASONING TOKENS", W / 2, 840, 28, CREAM); fade(k, L(2, 0.35, at), L(2, 0.45, at), 0, 100);
    counter(c, W / 2, 950, 90, RED, 0, 4.8, L(2, 0.05, at), L(2, 1.0, at), "$", "", 2);
    still(c, d, 80);
  }),
  // 3: "A few weeks later came the post. 'People use it much more than we expected.'"
  S(3, function (c, d, at) {
    paper2(c);
    var bg = solid(c, CREAM, "Post"); bg.threeDLayer = true;
    bg.property("Transform").property("Scale").setValue([56, 34, 100]);
    bg.property("Transform").property("Position").setValue([W / 2, 520, 10]);
    label(c, "Sam Altman", W / 2 - 440, 400, 28, INK).property("Source Text").setValue("Sam Altman");
    var t = txt(c, "Insane thing: we are currently losing money on\rOpenAI Pro subscriptions! People use it much\rmore than we expected.", "IBMPlexMono-Medium", 30, INK, W / 2 - 440, 470, ParagraphJustification.LEFT_JUSTIFY, true);
    markerLine(c, W / 2 - 160, 558, W / 2 + 420, 552, L(3, 0.55, at), L(3, 0.8, at));
    markerLine(c, W / 2 - 440, 600, W / 2 + 30, 596, L(3, 0.8, at), L(3, 0.95, at));
    source(c, "Sam Altman on X, Jan 2025", 0.3);
    still(c, d, 90);
  }),
  // 4: "Then the next shift arrived. Not a smarter chatbot, but an agent."
  S(4, function (c, d, at) {
    paper2(c);
    var chat = win(c, W / 2, 540, 760, 460, CREAM, [0.8, 0.77, 0.72], 0);
    var ct = label(c, "CHATBOT", W / 2, 360, 30, INK); ct.parent = chat; ct.property("Transform").property("Position").setValue([0, -170, -2]);
    var b1 = txt(c, "What's a token?", "IBMPlexMono-Medium", 30, INK, W / 2, 500, null, true); b1.parent = chat; b1.property("Transform").property("Position").setValue([0, -40, -2]);
    var b2 = txt(c, "A small piece of a word.", "IBMPlexMono-Medium", 30, GREY, W / 2, 560, null, true); b2.parent = chat; b2.property("Transform").property("Position").setValue([0, 40, -2]);
    var g = L(4, 0.6, at);
    exitTo(chat, g, -1500, 0, 0.5);
    var term = win(c, W / 2 + 1500, 540, 860, 500, [0.07, 0.07, 0.08], [0.22, 0.22, 0.24], -10);
    slide(term, g, g + 0.55, [W / 2 + 1500, 540, -10], [W / 2, 540, -10]);
    var tt = txt(c, "AGENT\r\r> task: fix the failing tests\r> reading 14 files...\r> writing patch...\r> running tests...", "IBMPlexMono-Medium", 30, CREAM, W / 2, 400, ParagraphJustification.LEFT_JUSTIFY, true);
    tt.parent = term; tt.property("Transform").property("Position").setValue([-380, -180, -2]);
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
