// Chapter 1: THE $20 BET.  effectcraft-cli script "$PWD/chapter1.jsx" --empty --save-as "$PWD/chapter1.ecproj"
#include "lib.jsx"
#include "chlib.jsx"
#include "timing_ch1.jsx"

var PASTEL = [[0.98, 0.83, 0.56], [0.72, 0.85, 0.95], [0.80, 0.91, 0.72], [0.95, 0.76, 0.78], [0.86, 0.81, 0.95]];

// Token chunks: words on coloured blocks, laid out centred on y.
function chunks(c, words, y, size, t0, step) {
  var cw = 0.56 * size, total = 0, ws = [];
  for (var i = 0; i < words.length; i++) { ws.push(words[i].length * cw + 46); total += ws[i] + 14; }
  var x = W / 2 - total / 2, out = [];
  for (var j = 0; j < words.length; j++) {
    var cx = x + ws[j] / 2;
    var b = pathLayer(c, "Chunk", [rect(-ws[j] / 2, -size * 0.75, ws[j], size * 1.15)], PASTEL[j % PASTEL.length]);
    b.threeDLayer = true;
    b.property("Transform").property("Position").setValue([cx, y, 1]);
    var t = txt(c, words[j], "Fraunces-SemiBold", size, INK, cx, y, null, true);
    t.parent = b; t.property("Transform").property("Position").setValue([0, 0, -1]);
    t.property("Transform").property("Opacity").expression = 'thisLayer.parent.transform.opacity';
    fade(b, t0 + j * step, t0 + j * step + 0.2, 0, 100);
    keys(b.property("Transform").property("Scale"), [[t0 + j * step, [80, 80, 100]], [t0 + j * step + 0.3, [100, 100, 100]]], 70);
    out.push(b);
    x += ws[j] + 14;
  }
  return out;
}

var shots = [
  // 0: "February 1st, 2023."
  {at: 0, fn: function (c, d, at) {
    paper(c, 600); stamp(c, "1 FEB 2023", W / 2, 560, 0.15); still(c, d, 70);
  }},
  // 0b: "ChatGPT is barely two months old, and millions of people are already using it."
  {at: L(0, 0.27, 0), fn: function (c, d, at) {
    plate(c, "B4_living_room_day.png", 900);
    var p = card(c, "P2.png", W / 2 + 120, H / 2 + 60, 0, 78);
    var m = head(c, "MILLIONS", 520, 520, 120, CREAM, -150);
    pop(m, L(0, 0.72, at), 112);
    var s = label(c, "OF PEOPLE, IN TWO MONTHS", 520, 600, 30, CREAM, -150); fade(s, L(0, 0.8, at), L(0, 0.9, at), 0, 100);
    drift(c, d, 40, 160);
  }},
  // 1: "OpenAI announces a paid version. ChatGPT Plus. Twenty dollars a month."
  S(1, function (c, d, at) {
    paper(c, 600);
    var k = label(c, "CHATGPT PLUS", W / 2, 330, 36, GREY); fade(k, L(1, 0.4, at), L(1, 0.5, at), 0, 100);
    var t = tag(c, "$20/mo", W / 2 + 40, 600, -40, 34, 6, 70);
    enter(t, L(1, 0.62, at), 1300, 0, 0.5);
    source(c, "Source: OpenAI, 1 Feb 2023", L(1, 0.8, at));
    still(c, d, 120);
  }),
  // 2-3: "A familiar price... music or a streaming service." / "But AI isn't like streaming."
  S(2, function (c, d, at) {
    paper(c, 600);
    var t = tag(c, "$20/mo", 620, 540, -40, 30, 6, 70);
    var a = txt(c, "♪", "DejaVuSans", 220, INK, 1160, 600, null, true);
    var b = txt(c, "▶", "DejaVuSans", 200, INK, 1480, 600, null, true);
    var la = label(c, "MUSIC", 1160, 700, 28), lb = label(c, "STREAMING", 1480, 700, 28);
    enter(a, L(2, 0.45, at), 900, 0); enter(la, L(2, 0.45, at), 900, 0);
    enter(b, L(2, 0.72, at), 900, 0); enter(lb, L(2, 0.72, at), 900, 0);
    var g = L(3, 0.05, at);
    exitTo(a, g, 0, 900, 0.5); exitTo(la, g, 0, 900, 0.5); exitTo(b, g + 0.08, 0, 900, 0.5); exitTo(lb, g + 0.08, 0, 900, 0.5);
    keys(t.property("Transform").property("Position"), [[g, [620, 540, -40]], [g + 0.6, [W / 2 + 30, 540, -40]]], 70);
    still(c, d, 60);
  }),
  // 4: "When one more person watches a film, the film doesn't get more expensive. It's already made."
  S(4, function (c, d, at) {
    paper(c, 600);
    var r = card(c, "O07_film_reel.png", W / 2, 420, 0, 30);
    keys(r.property("Transform").property("Z Rotation"), [[0, 0], [d, 140]], 0);
    var k = label(c, "COST OF ONE MORE VIEWER", W / 2, 860, 28);
    var n = head(c, "$0", W / 2, 985, 110, INK);
    fade(k, L(4, 0.35, at), L(4, 0.45, at), 0, 100); pop(n, L(4, 0.55, at));
    drift(c, d, 30, 80);
  }),
  // 5: "AI is different. Every answer is made fresh, on chips in a data centre, the moment you ask."
  S(5, function (c, d, at) {
    var pl = plate(c, "B1_server_aisle.png", 900, 1.3);
    fx(pl, "Exposure", {"Exposure": 1.3});
    var chip = card(c, "O10_ai_chip.png", W / 2 + 40, H / 2 + 20, -200, 22);
    fade(chip, L(5, 0.55, at), L(5, 0.65, at), 0, 100);
    keys(chip.property("Transform").property("Y Rotation"), [[L(5, 0.55, at), -60], [d, 15]], 50);
    // A real dolly down the aisle: the near rack slides past faster than the far plate.
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2 + 60, H / 2, -760]]], 30);
  }),
  // 6: "The industry measures that work in tokens. Small pieces of words."
  S(6, function (c, d, at) {
    paper(c, 600);
    var b = chunks(c, ["Every", "answer", "is", "made", "fresh"], 520, 84, L(6, 0.45, at), 0.12);
    var k = head(c, "TOKENS", W / 2, 300, 70, RED); pop(k, L(6, 0.3, at), 110);
    still(c, d, 80);
  }),
  // 7: "More tokens, more computing. More computing, more cost."
  S(7, function (c, d, at) {
    paper(c, 600);
    var b = chunks(c, ["Every", "answer", "is", "made", "fresh"], 300, 60, -1, 0);
    var m = card(c, "O09_taxi_meter.png", W / 2, 600, 0, 28);
    for (var i = 0; i < 5; i++) {
      var coin = card(c, "O08_coins.png", 700 + i * 130, 330, -20, 8);
      var t0 = L(7, 0.1 + i * 0.12, at);
      slide(coin, t0, t0 + 0.4, [700 + i * 130, 330, -20], [W / 2, 520, -20], 30);
      keys(coin.property("Transform").property("Opacity"), [[t0 + 0.35, 100], [t0 + 0.45, 0]], 0);
    }
    var k = label(c, "COST", W / 2, 820, 26);
    var n = counter(c, W / 2, 930, 96, INK, 0, 0.12, L(7, 0.1, at), L(7, 0.95, at), "$", "", 2);
    still(c, d, 80);
  }),
  // 8: "So a flat price is a gamble, a bit like a gym membership. Most people come in a few times..."
  S(8, function (c, d, at) {
    var p = plate(c, "B6_gym_turnstile.png", 900);
    fx(p, "Gaussian Blur", {"Blurriness": 14});
    var dim = solid(c, [0, 0, 0], "Dim"); dim.property("Transform").property("Opacity").setValue(55);
    var g = grid(c, 12, 3, 90, 470, [17], L(8, 0.62, at));
    var k1 = label(c, "MOST MEMBERS: A FEW VISITS A MONTH", W / 2, 300, 30, CREAM); fade(k1, L(8, 0.4, at), L(8, 0.5, at), 0, 100);
    var k2 = head(c, "THE FEW WHO COME EVERY DAY", W / 2, 740, 60, RED); fade(k2, L(8, 0.75, at), L(8, 0.82, at), 0, 100);
    drift(c, d, 50, 120);
  }),
  // 9: "However, the AI companies had a second reason to feel safe."
  S(9, function (c, d, at) {
    paper(c, 600);
    var cardL = solid(c, CREAM, "Card"); cardL.threeDLayer = true;
    cardL.property("Transform").property("Scale").setValue([46, 40, 100]);
    keys(cardL.property("Transform").property("Y Rotation"), [[L(9, 0.15, at), 180], [L(9, 0.45, at), 0]], 70);
    var t = head(c, "REASON #2", W / 2, 560, 110, INK); fade(t, L(9, 0.4, at), L(9, 0.48, at), 0, 100);
    still(c, d, 80);
  }),
  // 10: "Tokens were getting cheaper. Fast."
  S(10, function (c, d, at) {
    paper(c, 600);
    label(c, "PRICE PER TOKEN", W / 2, 260, 30);
    line(c, [[420, 330], [700, 420], [980, 560], [1240, 700], [1500, 800]], RED, 10, 0.05, d * 0.9);
    still(c, d, 60);
  }),
  // 11: Andreessen Horowitz: about ten times cheaper every year.
  S(11, function (c, d, at) {
    paper(c, 600);
    label(c, "PRICE FOR THE SAME ABILITY (LOG SCALE)", W / 2, 250, 28);
    line(c, [[460, 320], [660, 320], [660, 420], [860, 420], [860, 520], [1060, 520], [1060, 620], [1260, 620], [1260, 720], [1460, 720]], INK, 9, L(11, 0.15, at), L(11, 0.75, at));
    label(c, "2021", 460, 800, 26); label(c, "2024", 1460, 800, 26);
    var k = head(c, "~10× CHEAPER EVERY YEAR", W / 2, 920, 66, RED); pop(k, L(11, 0.62, at), 108);
    source(c, "Source: a16z, “Welcome to LLMflation”, Nov 2024", L(11, 0.3, at));
    still(c, d, 70);
  }),
  // 12: GPT-3-level: $60 per million tokens in 2021, about 6 cents three years later.
  S(12, function (c, d, at) {
    paper(c, 600);
    var k = label(c, "GPT-3-LEVEL ABILITY, PER MILLION TOKENS", W / 2, 330, 28);
    var n = counter(c, W / 2, 560, 200, INK, 60, 0.06, L(12, 0.5, at), L(12, 0.8, at), "$", "", 2);
    var y = label(c, "2021", W / 2, 640, 30, GREY);
    y.property("Source Text").expression = 'time < ' + L(12, 0.7, at) + ' ? "2021" : "2024"';
    var b = head(c, "1,000× IN 3 YEARS", W / 2, 840, 80, RED); pop(b, L(12, 0.88, at), 110);
    source(c, "Source: a16z, Nov 2024", 0.2);
    still(c, d, 90);
  }),
  // 13: "So the plan made sense. Even the heaviest users would get cheaper to serve..."
  S(13, function (c, d, at) {
    paper(c, 600);
    var g = grid(c, 12, 3, 90, 500, [], 0);
    var hv = pathLayer(c, "Heavy", [ellipseShape(0, 0, 32, 32)], RED);
    hv.property("Transform").property("Position").setValue([W / 2 - 5.5 * 90 + 5 * 90, 500]);
    keys(hv.property("Transform").property("Scale"), [[L(13, 0.35, at), [100, 100]], [L(13, 0.8, at), [55, 55]]], 50);
    var gr = pathLayer(c, "Grey", [ellipseShape(0, 0, 32, 32)], [0.62, 0.59, 0.55]);
    gr.property("Transform").property("Position").setValue([W / 2 - 5.5 * 90 + 5 * 90, 500]);
    keys(gr.property("Transform").property("Scale"), [[L(13, 0.35, at), [100, 100]], [L(13, 0.8, at), [55, 55]]], 50);
    fade(gr, L(13, 0.35, at), L(13, 0.8, at), 0, 100);
    var k = label(c, "COST OF A HEAVY USER, EVERY YEAR", W / 2, 300, 28); fade(k, 0.2, 0.5, 0, 100);
    still(c, d, 70);
  }),
  // 14: "They were right about the price of a word."
  S(14, function (c, d, at) {
    paper(c, 600);
    var b = chunks(c, ["word"], 540, 110, -1, 0)[0];
    keys(b.property("Transform").property("Scale"), [[L(14, 0.3, at), [100, 100, 100]], [L(14, 0.95, at), [12, 12, 100]]], 60);
    still(c, d, 60);
  }),
  // 15: "They were wrong about how many words we'd want."  -> the dot floods the screen, cut to black.
  S(15, function (c, d, at) {
    paper(c, 600);
    var dots = [];
    for (var q = 0; q < 5; q++) {
      var dots = [];
      for (var i = 0; i < 26; i++) for (var j = 0; j < 16; j++) if ((i * 7 + j * 3) % 5 == q) dots.push(rect(20 + i * 74 - 30, 20 + j * 68 - 20, 60, 40));
      var f = pathLayer(c, "Flood", dots, PASTEL[q]);
      f.property("Transform").property("Position").setValue([0, 0]);
      f.property("Transform").property("Opacity").expression = 'linear(time, ' + (L(15, 0.3, at) + q * 0.12) + ', ' + (L(15, 0.6, at) + q * 0.12) + ', 0, 100)';
    }
    var one = pathLayer(c, "One", [rect(-22, -14, 44, 28)], PASTEL[0]);
    one.property("Transform").property("Position").setValue([W / 2, H / 2]);
    var cut = solid(c, [0, 0, 0], "Cut"); cut.property("Transform").property("Opacity").setValue(0);
    keys(cut.property("Transform").property("Opacity"), [[d - 0.9, 0], [d - 0.88, 100]], 0);
    still(c, d, 140);
  })
];

buildChapter("Chapter1", 1, "THE $20 BET", shots, 1.4);
