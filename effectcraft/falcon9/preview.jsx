// Parts preview: six stills that check every 3D component before the episode is built.
#include "lib.jsx"
#include "rig.jsx"

// A. Scale lineup: the whole rocket, the 14-storey building, a bus and the technician.
(function () {
  var s = new Scene(newComp("A Scale"), 12);
  // Root at 3.5 m puts the deployed feet on the ground.
  var b = s.booster({ at: [0, 3.5, 0] });
  s.model("upper_stack", [0, 3.5, 0]);
  s.legs(1, b);
  s.fins(0, b);
  s.model("building", [-22, 0, -4]);
  s.model("bus", [16, 0, 4]);
  s.model("technician", [7, 0, 8]);
  s.floor(0);
  s.lights();
  s.camera([40, 30, 165], [-3, 36, 0], 30);
})();

// B. Cutaway: tanks, fills, transfer tube and helium bottles.
(function () {
  var s = new Scene(newComp("B Cutaway"), 20);
  // Laid on its side so the 41 m stage fills a 16:9 frame; the cut faces the camera. Full tanks (a level would read wrong sideways).
  var b = s.booster({ cut: true, fill: 1, at: [-20.6, 0, 0] });
  b.property("Transform").property("Z Rotation").setValue(90);
  s.lights();
  s.camera([0, 10, 60], [0, 0.5, 0], 30);
})();

// C. Engine bay from below with the legs deployed.
(function () {
  var s = new Scene(newComp("C Engines"), 60);
  var b = s.booster({});
  s.legs(1, b);
  s.lights();
  s.camera([12, -4.5, 12], [0, 1.2, 0], 40);
})();

// D. One Merlin, exploded.
(function () {
  var s = new Scene(newComp("D Merlin"), 260);
  var parts = [["nozzle_bell", [0, -0.6, 0]], ["combustion_chamber", [0, 0.1, 0]], ["injector", [0, 0.8, 0]], ["turbopump", [1.1, 0.9, 0]], ["gas_generator", [0.7, 0.3, 0.8]], ["propellant_lines", [0.6, 0.55, 0.2]]];
  for (var i = 0; i < parts.length; i++) s.model("merlin_" + parts[i][0], parts[i][1]);
  s.lights();
  s.camera([4.6, 2.2, 8.2], [0.45, 1.1, 0], 34);
})();

// E. The top: technician on the interstage rim, grid fins deployed.
(function () {
  var s = new Scene(newComp("E Top"), 160);
  var b = s.booster({ at: [0, 4.1, 0] });
  s.fins(1, b);
  s.model("technician", [0, 4.1 + 47.7, 1.75]);
  s.lights();
  s.camera([4.5, 4.1 + 49.6, 6.5], [0, 4.1 + 48.3, 0.8], 36);
})();

// F. Landed on the droneship.
(function () {
  var s = new Scene(newComp("F Droneship"), 10);
  s.model("droneship", [0, 0, 0]);
  var b = s.booster({ at: [0, 3.5, 0] });
  s.legs(1, b);
  s.fins(1, b);
  s.floor(0);
  s.lights();
  s.camera([42, 16, 52], [0, 15, 0], 34);
})();
writeLn("items " + app.project.numItems);
