// Chapter 3: THE BILL COMES DUE.  effectcraft-cli script "$PWD/chapter3.jsx" --empty --save-as "$PWD/chapter3.ecproj"
#include "lib.jsx"
#include "chlib.jsx"
#include "timing_ch3.jsx"

// The darkest chapter: dim paper, red accents.
function paper3(c, k) { var p = paper(c, 600); var d = solid(c, [0, 0, 0], "Dim"); d.property("Transform").property("Opacity").setValue(k || 34); return p; }
function blocks(c, cols, rows, size, gap, cy, rgb) {
  var sh = [], x0 = W / 2 - (cols * (size + gap) - gap) / 2, y0 = cy - (rows * (size + gap) - gap) / 2;
  for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) sh.push(rect(x0 + q * (size + gap), y0 + r * (size + gap), size, size));
  var l = pathLayer(c, "Blocks", sh, rgb || INK);
  l.property("Transform").property("Position").setValue([W / 2, cy]);
  l.property("Transform").property("Anchor Point").setValue([W / 2, cy]);
  return l;
}
function note(c, s, x, y, rot, t) {
  var b = solid(c, CREAM, "Comment"); b.threeDLayer = true;
  b.property("Transform").property("Scale").setValue([35, 12, 100]);
  b.property("Transform").property("Position").setValue([x, y, -t * 10]);
  b.property("Transform").property("Z Rotation").setValue(rot);
  var tt = txt(c, s, "IBMPlexMono-Medium", 28, INK, x, y + 10, null, true);
  tt.property("Transform").property("Position").setValue([x, y + 10, -t * 10 - 1]);
  tt.property("Transform").property("Z Rotation").setValue(rot);
  pop(b, t, 125); pop(tt, t, 125);
  return b;
}

var shots = [
  // 0: "June 2025."
  {at: 0, fn: function (c, d, at) { paper3(c); stamp(c, "JUN 2025", W / 2, 560, 0.15); still(c, d, 60); }},
  // 0b: "Cursor, one of the most popular AI coding apps, changes its twenty-dollar plan."
  {at: L(0, 0.3, 0), fn: function (c, d, at) {
    paper3(c);
    var k = label(c, "CURSOR PRO", W / 2, 300, 36, INK); fade(k, 0.05, 0.3, 0, 100);
    var t = tag(c, "$20/mo", W / 2 + 40, 600, -40, 34, -5, 70); enter(t, 0.25, -1400, 0, 0.5);
    still(c, d, 80);
  }},
  // 1: "Before, you got a set number of requests. Now you get twenty dollars of credit..."
  S(1, function (c, d, at) {
    paper3(c);
    var b = blocks(c, 25, 20, 16, 6, 540, INK);
    var k1 = label(c, "BEFORE: 500 REQUESTS A MONTH", W / 2, 230, 30, INK); fade(k1, 0.2, 0.5, 0, 100);
    var g = L(1, 0.42, at);
    keys(b.property("Transform").property("Scale"), [[g, [100, 100]], [g + 0.45, [0, 0]]], 70);
    fade(k1, g, g + 0.3, 100, 0);
    var gauge = card(c, "O12_fuel_gauge.png", W / 2, 520, 0, 34); pop(gauge, g + 0.35, 80);
    var k2 = label(c, "NOW: $20 OF CREDIT, PRICED PER MODEL", W / 2, 230, 30, INK); fade(k2, g + 0.4, g + 0.7, 0, 100);
    still(c, d, 80);
  }),
  // 2: "Heavy users pick the best models. Some burn through the credit in days..."
  S(2, function (c, d, at) {
    paper3(c, 40);
    var gauge = card(c, "O12_fuel_gauge.png", W / 2, 470, 0, 30);
    var k = label(c, "CREDIT LEFT", W / 2, 800, 28, INK);
    counter(c, W / 2, 920, 120, RED, 20, 0, L(2, 0.1, at), L(2, 0.65, at), "$", "", 2);
    var day = label(c, "DAY 1", W / 2, 200, 34, INK);
    day.property("Source Text").expression = '"DAY " + Math.min(3, 1 + Math.floor(Math.max(0, time - ' + L(2, 0.1, at) + ') / ' + ((L(2, 0.65, at) - L(2, 0.1, at)) / 2.6) + '))';
    still(c, d, 70);
  }),
  // 2b: "...then get charged extra."
  {at: L(2, 0.7, 0), fn: function (c, d, at) {
    dark(c, [0.1, 0.09, 0.08]);
    card(c, "P6b_cut.png", W / 2 + 120, 600, 0, 70); // revision 1: an A4 bill, not a receipt
    stamp(c, "+ OVERAGE", 470, 260, 0.35, 72, true);
    still(c, d, 80);
  }},
  // 3: "Developers are furious."
  S(3, function (c, d, at) {
    dark(c, [0.1, 0.09, 0.08]);
    var ns = [["Burned through my credit in 3 days.", 760, 330, -3], ["Surprise bill??", 1180, 450, 4], ["What happened to my plan?", 800, 590, -2], ["Nobody told us this changed.", 1150, 720, 3], ["Cancelling.", 900, 850, -4]];
    for (var i = 0; i < ns.length; i++) note(c, ns[i][0], ns[i][1], ns[i][2], ns[i][3], 0.15 + i * 0.25);
    label(c, "Recreated for illustration", W / 2, 1020, 20, GREY);
    still(c, d, 100);
  }),
  // 4: "Within weeks the CEO apologises... 'not communicated clearly. That's our mistake, and we're sorry.' Cursor offers refunds."
  S(4, function (c, d, at) {
    paper3(c, 20);
    quote(c, "“not communicated clearly.\rThat’s our mistake, and we’re sorry.”", null, L(4, 0.3, at), 74, false, 470);
    var r = head(c, "REFUNDS: 16 JUN – 4 JUL 2025", W / 2, 760, 56, RED); pop(r, L(4, 0.85, at), 108);
    source(c, "Source: Cursor forum, Jul 2025", L(4, 0.35, at));
    still(c, d, 90);
  }),
  // 5: "However, the lesson the industry took away wasn't to stop charging for heavy use. It was to explain it better. And to move slowly."
  S(5, function (c, d, at) {
    paper3(c, 20);
    var q = txt(c, "“not communicated clearly.\rThat’s our mistake, and we’re sorry.”", "Fraunces-SemiBold", 74, INK, W / 2, 470, null, true);
    exitTo(q, 0.25, -2200, 0, 0.5);
    var t = tag(c, "$20/mo", W / 2 + 40, 520, -40, 30, -4, 70); fade(t, 0.3, 0.6, 0, 100);
    var a = head(c, "EXPLAIN IT BETTER.", W / 2, 860, 64, INK); fade(a, L(5, 0.6, at), L(5, 0.66, at), 0, 100);
    var b = head(c, "MOVE SLOWLY.", W / 2, 950, 64, RED); fade(b, L(5, 0.86, at), L(5, 0.92, at), 0, 100);
    still(c, d, 80);
  }),
  // 6: "April 4th, 2026. Anthropic stops letting subscriptions cover outside agent tools... pay-as-you-go usage."
  S(6, function (c, d, at) {
    paper3(c);
    stamp(c, "4 APR 2026", W / 2, 230, 0.15, 64);
    // Revision 1: the words sit clear of the plug and socket.
    var plug = card(c, "O13_plug.png", W / 2 - 60, 600, 0, 32);
    var a = label(c, "SUBSCRIPTION", 330, 600, 34, INK); fade(a, L(6, 0.2, at), L(6, 0.3, at), 0, 100);
    var b = head(c, "PAY AS YOU GO", 1640, 600, 56, RED); fade(b, L(6, 0.75, at), L(6, 0.82, at), 0, 100);
    keys(plug.property("Transform").property("Position"), [[L(6, 0.45, at), [W / 2 - 60, 600, 0]], [L(6, 0.6, at), [W / 2 + 40, 600, 0]]], 60);
    var k = label(c, "FOR OUTSIDE AGENT TOOLS, SUCH AS OPENCLAW", W / 2, 930, 26, INK); fade(k, L(6, 0.5, at), L(6, 0.6, at), 0, 100);
    source(c, "Reported 4 Apr 2026", 0.5);
    still(c, d, 70);
  }),
  // 7: "Late April. GitHub announces that Copilot is moving to usage-based billing, starting June 1st."
  S(7, function (c, d, at) {
    paper3(c);
    var h = head(c, "GITHUB COPILOT", W / 2, 420, 100, INK); fade(h, 0.1, 0.4, 0, 100);
    var u = head(c, "USAGE-BASED BILLING", W / 2, 560, 76, RED); fade(u, L(7, 0.55, at), L(7, 0.62, at), 0, 100);
    stamp(c, "1 JUN 2026", W / 2, 790, L(7, 0.85, at), 72);
    still(c, d, 80);
  }),
  // 8: "The monthly prices stay the same. But heavy use beyond the allowance is now billed in credits, worth one cent each."
  S(8, function (c, d, at) {
    paper3(c);
    var p = head(c, "$10  /  $39", 560, 470, 96, INK); fade(p, 0.1, 0.4, 0, 100);
    var s = label(c, "MONTHLY PRICE: UNCHANGED", 560, 560, 26, INK); fade(s, 0.3, 0.5, 0, 100);
    var k = label(c, "EXTRA USE, IN 1-CENT CREDITS", 1360, 300, 26, INK); fade(k, L(8, 0.5, at), L(8, 0.6, at), 0, 100);
    for (var i = 0; i < 10; i++) {
      var coin = card(c, "O21_dollar_coin.png", 1360 + ((i * 37) % 5 - 2) * 60, -150, -20, 6); // revision 1: real dollar coins
      var t0 = L(8, 0.55 + i * 0.04, at);
      slide(coin, t0, t0 + 0.5, [1360 + ((i * 37) % 5 - 2) * 60, -150, -20], [1360 + ((i * 37) % 5 - 2) * 30, 640 - i * 12, -20], 30);
    }
    var n = counter(c, 1360, 830, 90, RED, 0, 3.87, L(8, 0.6, at), d, "+$", "", 2);
    source(c, "Source: GitHub, Apr 2026", 0.4);
    still(c, d, 70);
  }),
  // 9: "Then, in September, the company that started it all."
  S(9, function (c, d, at) {
    dark(c, [0.05, 0.05, 0.055]); smoke(c, 16);
    var s = stamp(c, "29 SEP 2026", W / 2, 560, L(9, 0.35, at), 110, true);
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2, -950]]], 10);
  }),
  // 10: "OpenAI reopens its two-hundred-dollar Pro plan, and adds a new one at five hundred."
  S(10, function (c, d, at) {
    paper3(c);
    var a = tag(c, "$200/mo", 700, 560, -40, 30, -6, 70); enter(a, 0.1, -1200, 0, 0.45);
    var b = tag(c, "$500/mo", 1260, 560, -40, 30, 6, 70); enter(b, L(10, 0.75, at), 1200, 0, 0.45);
    label(c, "CHATGPT PRO", W / 2, 260, 34, INK);
    source(c, "Source: OpenAI, DevDay, 29 Sep 2026", 0.4);
    still(c, d, 80);
  }),
  // 11: "For people already on Pro, the old allowance runs until October 29th. After that, the price stays two hundred dollars. What you get for it goes down."
  S(11, function (c, d, at) {
    paper3(c);
    // Revision 1: a real October 2026 calendar fills the frame; the 29th gets the red marker.
    // O25 (2480 x 1700) at 56 %, centred (760, 560): the 29th's cell centre lands at (755, 896).
    prop(c, "O25_calendar.png", 760, 560, 56, -1);
    markerLoop(c, 760, 893, 110, 78, L(11, 0.3, at), L(11, 0.42, at), 2.3);
    var t = tag(c, "$200/mo", 1650, 330, 0, 22, 8); fade(t, L(11, 0.55, at), L(11, 0.62, at), 0, 100);
    var stack = blocks(c, 6, 5, 34, 6, 760, PASTEL3);
    stack.property("Transform").property("Position").setValue([1650, 860]);
    stack.property("Transform").property("Anchor Point").setValue([W / 2, 860]);
    keys(stack.property("Transform").property("Scale"), [[L(11, 0.8, at), [100, 100]], [L(11, 0.98, at), [100, 50]]], 60);
    to3D(stack);
    var k = label(c, "WHAT YOU GET", 1650, 920, 24, INK); fade(k, L(11, 0.8, at), L(11, 0.86, at), 0, 100);
    source(c, "Source: OpenAI Help Center", 0.4);
    still(c, d, 70);
  }),
  // 12: "And the reason OpenAI gives is printed right there on its help page."
  S(12, function (c, d, at) {
    paper3(c, 18);
    var page = solid(c, CREAM, "Help page"); page.threeDLayer = true;
    page.property("Transform").property("Scale").setValue([60, 74, 100]);
    page.property("Transform").property("Position").setValue([W / 2, 540, 10]);
    txt(c, "About ChatGPT Pro tiers", "Fraunces-SemiBold", 46, INK, W / 2, 230, null, true);
    var lines = "";
    for (var i = 0; i < 12; i++) lines += ["Pro 200 subscribers keep their previous included", "allowance through October 29, 2026. After that,", "your subscription will move to the lower included", "usage allowance. Your price stays the same.", "New subscriptions include a lower usage allowance", "to reflect our increasingly efficient models."][i % 6] + "\r";
    txt(c, lines, "IBMPlexMono-Regular", 22, GREY, W / 2, 310, null, true);
    var mag = card(c, "O04_magnifier.png", W / 2 + 330, 720, -150, 46, -8);
    slide(mag, 0.2, 1.0, [2600, 900, -150], [W / 2 + 330, 520, -150]);
    still(c, d, 90);
  }),
  // 13-14: "The lower allowance is 'to reflect our increasingly efficient models.'"  "Read that again."
  S(13, function (c, d, at) {
    paper3(c, 18);
    var a = txt(c, "“to reflect our", "Fraunces-SemiBold", 92, INK, W / 2, 400, null, true); fade(a, 0.1, 0.45, 0, 100);
    var b = txt(c, "increasingly efficient", "Fraunces-Black", 110, INK, W / 2, 540, null, true); fade(b, 0.4, 0.75, 0, 100);
    var br = txt(c, "increasingly efficient", "Fraunces-Black", 110, RED, W / 2, 540, null, true);
    br.property("Transform").property("Position").setValue([W / 2, 540, -1]);
    fade(br, L(14, 0.0, at), L(14, 0.4, at), 0, 100);
    var cc = txt(c, "models.”", "Fraunces-SemiBold", 92, INK, W / 2, 670, null, true); fade(cc, 0.7, 1.0, 0, 100);
    source(c, "OpenAI Help Center, Sep 2026", 1.0);
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2, -1050]]], 10);
  }),
  // 15: "The models get more efficient, and you get less."
  S(15, function (c, d, at) {
    paper3(c, 18);
    var a = head(c, "MODELS: MORE EFFICIENT  ↑", W / 2, 470, 76, INK); fade(a, 0.05, 0.3, 0, 100);
    var b = head(c, "WHAT YOU GET: LESS  ↓", W / 2, 620, 76, RED); fade(b, L(15, 0.55, at), L(15, 0.62, at), 0, 100);
    still(c, d, 60);
  }),
  // 16: "To understand how both can be true, you have to look at the receipt from the other side."
  S(16, function (c, d, at) {
    paper3(c, 30);
    var r = prop(c, "O22_bill_plus.png", W / 2, 560, 40, -3); // revision 1: the A4 bill, not a receipt
    keys(r.property("Transform").property("Y Rotation"), [[L(16, 0.7, at), 0], [L(16, 0.98, at), 180]], 60);
    var blk = solid(c, [0, 0, 0], "Cut"); blk.property("Transform").property("Opacity").setValue(0);
    keys(blk.property("Transform").property("Opacity"), [[d - 0.6, 0], [d - 0.58, 100]], 0);
    still(c, d, 140);
  })
];
var PASTEL3 = [0.86, 0.81, 0.95];

buildChapter("Chapter3", 3, "THE BILL COMES DUE", shots, 1.4);
