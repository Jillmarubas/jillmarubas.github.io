// Chapter 4: THE OTHER SIDE OF THE RECEIPT.  effectcraft-cli script "$PWD/chapter4.jsx" --empty --save-as "$PWD/chapter4.ecproj"
#include "lib.jsx"
#include "chlib.jsx"
#include "timing_ch4.jsx"

function paper4(c, k) { var p = paper(c, 600); if (k) { var d = solid(c, [0, 0, 0], "Dim"); d.property("Transform").property("Opacity").setValue(k); } return p; }
function bar(c, x, base, w, h, rgb, t0, t1) {
  var b = pathLayer(c, "Bar", [rect(x - w / 2, base - h, w, h)], rgb);
  b.property("Transform").property("Anchor Point").setValue([x, base]);
  b.property("Transform").property("Position").setValue([x, base]);
  keys(b.property("Transform").property("Scale"), [[t0, [100, 0]], [t1, [100, 100]]], 60);
  return b;
}

var shots = [
  // 0: "In 2025, OpenAI brought in about thirteen billion dollars... burned through about eight billion in cash."
  S(0, function (c, d, at) {
    paper4(c);
    var notes = card(c, "O17_banknotes.png", W / 2, 360, 60, 26);
    label(c, "OPENAI, 2025", W / 2, 140, 30, INK);
    var a = label(c, "BROUGHT IN", 600, 640, 28, INK); fade(a, L(0, 0.15, at), L(0, 0.22, at), 0, 100);
    counter(c, 600, 780, 130, INK, 0, 13.1, L(0, 0.2, at), L(0, 0.45, at), "$", "B", 1);
    var b = label(c, "BURNED, IN CASH", 1320, 640, 28, INK); fade(b, L(0, 0.7, at), L(0, 0.76, at), 0, 100);
    var n = counter(c, 1320, 780, 130, RED, 0, 8, L(0, 0.72, at), L(0, 0.95, at), "$", "B", 0); fade(n, L(0, 0.7, at), L(0, 0.74, at), 0, 100);
    source(c, "Source: CNBC, citing investor documents, Feb 2026", 0.6);
    still(c, d, 60);
  }, 0.0),
  // 1: "And the spending ahead is far bigger."  (the frame widens)
  S(1, function (c, d, at) {
    paper4(c);
    head(c, "$13.1B", 600, 780, 130, INK); head(c, "$8B", 1320, 780, 130, RED);
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2 - 120, -2600]]], 50);
  }),
  // 2: "In late 2025, Sam Altman said OpenAI had committed to about one-point-four trillion dollars of data centres and computing over eight years."
  S(2, function (c, d, at) {
    paper4(c, 10);
    var spots = [[300, 760, 300], [620, 820, 120], [980, 780, 420], [1320, 840, 200], [1640, 770, 380], [460, 900, -60], [1140, 930, -90], [1520, 960, 40], [800, 980, -150], [180, 960, 150]];
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i], m = card(c, "O18_datacentre_model.png", s[0], s[1], s[2], 16, 0);
      pop(m, L(2, 0.3 + i * 0.05, at), 60);
    }
    var n = counter(c, W / 2, 360, 170, INK, 0, 1.4, L(2, 0.35, at), L(2, 0.62, at), "$", " TRILLION", 1);
    var k = label(c, "COMMITTED TO DATA CENTRES AND COMPUTING, OVER ~8 YEARS", W / 2, 460, 26, INK); fade(k, L(2, 0.65, at), L(2, 0.72, at), 0, 100);
    source(c, "Source: Sam Altman, Nov 2025", 0.6);
    camera(c, [[0, [W / 2, H / 2 - 40, -1350]], [d, [W / 2, H / 2 + 20, -1150]]], 25);
  }),
  // 3: "By February 2026, it had told investors a smaller target. Around six hundred billion by 2030. Still one of the largest spending plans in history."
  S(3, function (c, d, at) {
    paper4(c, 10);
    var n = counter(c, W / 2, 300, 150, INK, 1400, 600, L(3, 0.2, at), L(3, 0.45, at), "$", "B", 0);
    var k = label(c, "COMPUTE SPENDING TARGET, BY 2030", W / 2, 390, 28, INK); fade(k, L(3, 0.4, at), L(3, 0.48, at), 0, 100);
    bar(c, 760, 920, 160, 6, INK, L(3, 0.6, at), L(3, 0.7, at));
    bar(c, 1160, 920, 160, 440, RED, L(3, 0.6, at), L(3, 0.85, at));
    var a = label(c, "2025 REVENUE\r$13.1B", 760, 975, 24, INK); fade(a, L(3, 0.62, at), L(3, 0.7, at), 0, 100);
    var b = label(c, "TARGET\r~$600B", 1160, 975, 24, INK); fade(b, L(3, 0.7, at), L(3, 0.78, at), 0, 100);
    source(c, "Source: CNBC, Feb 2026", 0.5).property("Transform").property("Position").setValue([W / 2, 1050, 0]);
    still(c, d, 50);
  }),
  // 4-6: "So here is the paradox." / "Every token keeps getting cheaper." / "But every task uses more of them..."
  S(4, function (c, d, at) {
    paper4(c);
    var div = pathLayer(c, "Divider", [rect(958, 180, 4, 760)], [0.6, 0.57, 0.53]);
    var k = head(c, "THE PARADOX", W / 2, 140, 60, INK); fade(k, 0.1, 0.35, 0, 100);
    var a = label(c, "PRICE PER TOKEN", 480, 260, 28, INK); fade(a, L(5, 0.0, at), L(5, 0.15, at), 0, 100);
    line(c, [[180, 340], [380, 470], [580, 600], [780, 760]], INK, 10, L(5, 0.1, at), L(5, 0.95, at));
    var b = label(c, "TOKENS PER TASK", 1440, 260, 28, INK); fade(b, L(6, 0.0, at), L(6, 0.1, at), 0, 100);
    line(c, [[1140, 780], [1340, 720], [1540, 560], [1740, 300]], RED, 10, L(6, 0.1, at), L(6, 0.9, at));
    var c1 = label(c, "REASONING THINKS LONGER", 1440, 870, 24, INK); fade(c1, L(6, 0.35, at), L(6, 0.45, at), 0, 100);
    var c2 = label(c, "AGENTS LOOP, RE-READ, RETRY", 1440, 910, 24, INK); fade(c2, L(6, 0.6, at), L(6, 0.7, at), 0, 100);
    still(c, d, 50);
  }),
  // 7: "The research firm Gartner has called this the inference paradox: cheaper words, bigger bills."
  S(7, function (c, d, at) {
    paper4(c);
    line(c, [[360, 300], [760, 480], [1160, 650], [1560, 780]], INK, 10, 0.0, 0.6);
    line(c, [[360, 800], [760, 700], [1160, 520], [1560, 260]], RED, 10, 0.2, 0.8);
    var k = head(c, "THE INFERENCE PARADOX", W / 2, 140, 74, INK); pop(k, L(7, 0.35, at), 108);
    var a = label(c, "CHEAPER WORDS", 1700, 790, 26, INK); fade(a, L(7, 0.7, at), L(7, 0.78, at), 0, 100);
    var b = label(c, "BIGGER BILLS", 1700, 260, 26, RED); fade(b, L(7, 0.82, at), L(7, 0.9, at), 0, 100);
    source(c, "Source: Gartner", 0.5);
    still(c, d, 60);
  }),
  // 8: "Which leaves every AI company with three choices. Raise the price. Cut what's inside. Or charge for every use."
  S(8, function (c, d, at) {
    paper4(c);
    var opts = [["RAISE\rTHE PRICE", 480, -1, 0.42], ["CUT WHAT'S\rINSIDE", 960, -1, 0.62], ["CHARGE FOR\rEVERY USE", 1440, 1, 0.82]];
    for (var i = 0; i < 3; i++) {
      var o = opts[i];
      var cd = solid(c, CREAM, "Option"); cd.threeDLayer = true;
      cd.property("Transform").property("Scale").setValue([22, 40, 100]);
      cd.property("Transform").property("Position").setValue([o[1], 540, 0]);
      var t = head(c, o[0], o[1], 520, 52, INK, -1);
      var n = label(c, String(i + 1), o[1], 360, 30, RED, -1);
      var t0 = L(8, o[3], at);
      enter(cd, t0, i == 1 ? 0 : o[2] * 1400, i == 1 ? -1100 : 0, 0.45);
      fade(t, t0 + 0.2, t0 + 0.4, 0, 100); fade(n, t0 + 0.2, t0 + 0.4, 0, 100);
    }
    still(c, d, 60);
  }),
  // 9: "Raising prices is loud. People notice a number going up."
  S(9, function (c, d, at) {
    paper4(c);
    var t = tag(c, "$20/mo", W / 2 + 40, 560, -40, 32, 4, 70);
    var up = head(c, "↑", W / 2 + 330, 470, 160, RED); pop(up, L(9, 0.55, at), 140);
    keys(t.property("Transform").property("Position"), [[L(9, 0.5, at), [W / 2 + 40, 560, -40]], [L(9, 0.58, at), [W / 2 + 40, 520, -40]], [L(9, 0.7, at), [W / 2 + 40, 560, -40]]], 60);
    var k = head(c, "LOUD", W / 2, 920, 90, RED); pop(k, L(9, 0.2, at), 110);
    still(c, d, 60);
  }),
  // 10: "Charging per use is scary. Nobody likes a meter running."
  S(10, function (c, d, at) {
    paper4(c);
    card(c, "O09_taxi_meter.png", W / 2, 520, 0, 34);
    counter(c, W / 2, 880, 110, RED, 0, 47.3, 0.2, d, "$", "", 2);
    var k = head(c, "SCARY", W / 2, 180, 80, INK); pop(k, L(10, 0.1, at), 110);
    still(c, d, 60);
  }),
  // 11: "So most chose the quietest option. Keep the price. Shrink the box."
  S(11, function (c, d, at) {
    paper4(c);
    var bar0 = card(c, "O16_chocolate.png", W / 2 - 60, 560, 0, 42, 0);
    keys(bar0.property("Transform").property("Scale"), [[L(11, 0.72, at), bar0.property("Transform").property("Scale").value], [L(11, 0.95, at), [bar0.property("Transform").property("Scale").value[0] * 0.62, bar0.property("Transform").property("Scale").value[1], 100]]], 60);
    var t = tag(c, "$20", 1540, 760, -40, 20, 8, 80);
    var k = head(c, "THE QUIETEST OPTION", W / 2, 150, 64, INK); fade(k, L(11, 0.05, at), L(11, 0.15, at), 0, 100);
    var s = label(c, "SAME PRICE. LESS INSIDE.", W / 2, 940, 30, RED); fade(s, L(11, 0.8, at), L(11, 0.9, at), 0, 100);
    still(c, d, 60);
  }),
  // 12: "However, for most people, almost nothing changes. If you ask a few questions a day, you'll probably never hit a limit."
  S(12, function (c, d, at) {
    var p = plate(c, "B4_living_room_day.png", 900); fx(p, "Exposure", {"Exposure": 0.35});
    card(c, "P7.png", W / 2 + 60, 620, 0, 74);
    drift(c, d, 50, 140);
  }),
  // 13: "The squeeze falls on the heaviest users. The ones who let agents work through the night."
  S(13, function (c, d, at) {
    var p = plate(c, "B3_home_office_night.png", 900); fx(p, "Exposure", {"Exposure": -0.2});
    card(c, "P8.png", W / 2 + 60, 640, 0, 74);
    var k = label(c, "3:12 AM", 300, 160, 34, CREAM); fade(k, 0.3, 0.6, 0, 100);
    drift(c, d, 40, 140);
  }),
  // 14: "And that group is growing every month."
  S(14, function (c, d, at) {
    plate(c, "B5_city_night.png", 900, 1.15);
    for (var i = 0; i < 70; i++) {
      var x = 120 + ((i * 397) % 1680), y = 260 + ((i * 211) % 560);
      var wdw = pathLayer(c, "Window", [rect(x, y, 14, 18)], [1.0, 0.82, 0.45]);
      var t0 = 0.2 + (i / 70) * (d - 0.6);
      wdw.property("Transform").property("Position").setValue([0, 0]);
      keys(wdw.property("Transform").property("Opacity"), [[t0, 0], [t0 + 0.15, 90]], 0);
    }
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2, -1120]]], 20);
  }),
  // 15-18: "So, was twenty dollars a lie?" / "Not exactly. The price on the page was always true." / "The lie was a word nobody printed, but we all heard anyway." / "Unlimited."
  S(15, function (c, d, at) {
    paper4(c);
    var r = tag(c, "$20/mo", W / 2 + 40, 430, 60, 34, 4, 70);
    var u = head(c, "UNLIMITED", W / 2, 800, 120, INK, 40);
    fade(u, L(18, 0.0, at), L(18, 0.25, at), 0, 100);
    markerLine(c, W / 2 - 360, 768, W / 2 + 360, 756, L(18, 0.45, at), L(18, 0.85, at));
    // One long push toward the receipt (the slow take before the release).
    camera(c, [[0, [W / 2, H / 2, -1260]], [d, [W / 2, H / 2 + 30, -1040]]], 15);
  }),
  // 19: "Today, an agent working for you can cost more than you pay for it. Soon, agents may hire other agents, all night, on your account."
  S(19, function (c, d, at) {
    dark(c, [0.05, 0.05, 0.06]); smoke(c, 12);
    var pts = [[960, 540], [560, 330], [1360, 330], [560, 750], [1360, 750], [260, 540], [1660, 540], [960, 200], [960, 880]];
    var starts = [0.0, 0.62, 0.66, 0.7, 0.74, 0.8, 0.83, 0.86, 0.9];
    for (var i = 1; i < pts.length; i++) {
      var t0 = L(19, starts[i], at);
      line(c, [pts[0], pts[i]], [0.55, 0.53, 0.5], 3, t0 - 0.05, t0 + 0.2);
    }
    for (var j = 0; j < pts.length; j++) {
      var w = j == 0 ? 380 : 240, h = j == 0 ? 220 : 140;
      var wn = win(c, pts[j][0], pts[j][1], w, h, [0.09, 0.09, 0.1], [0.24, 0.24, 0.26], -5);
      var lt = txt(c, j == 0 ? "> agent: your task" : "> sub-agent " + j, "IBMPlexMono-Medium", j == 0 ? 26 : 18, CREAM, pts[j][0], pts[j][1] + 10, null, true);
      lt.property("Transform").property("Position").setValue([pts[j][0], pts[j][1] + 10, -7]);
      pop(wn, L(19, starts[j], at) + (j == 0 ? 0.1 : 0), 70); pop(lt, L(19, starts[j], at) + (j == 0 ? 0.1 : 0), 70);
    }
    var cost = counter(c, W / 2, 1010, 44, RED, 0.4, 212.8, L(19, 0.1, at), d, "$", " tonight", 2, "IBMPlexMono-Medium");
    still(c, d, 80);
  }),
  // 20: "When that bill arrives, who's going to read the small print?"  -> hold, fade to black.
  S(20, function (c, d, at) {
    paper4(c, 12);
    var para = "Usage may be billed per step. Agents may start other agents. Charges continue while tasks run.\rIncluded usage may change. Rates may change. You are responsible for all usage on your account.";
    txt(c, para, "IBMPlexMono-Regular", 17, [0.35, 0.33, 0.3], W / 2, 520, null, true);
    var mag = card(c, "O04_magnifier.png", W / 2 + 330, 640, -120, 60, -10);
    slide(mag, 0.2, 1.1, [2700, 760, -120], [W / 2 + 330, 640, -120]);
    var out = solid(c, [0, 0, 0], "Out"); out.property("Transform").property("Opacity").setValue(0);
    keys(out.property("Transform").property("Opacity"), [[d - 2.2, 0], [d - 0.9, 100]], 0);
    camera(c, [[0, [W / 2, H / 2, -1200]], [d, [W / 2, H / 2, -1100]]], 10);
  })
];

buildChapter("Chapter4", 4, "THE OTHER SIDE OF THE RECEIPT", shots, 2.6);
