// Helpers for the Falcon 9 episode in EffectCraft. World units are metres (+Y up, +Z toward the camera,
// as modelled in remotion/src/falcon9/model.ts); EffectCraft comp space is pixels (+Y down, +Z away).
var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 30;

function Scene(comp, S) {
  this.comp = comp;
  this.S = S; // px per metre
  this.CID = comp.layers.__comp;
}
Scene.prototype.cmd = function (id, o) { o = o || {}; o.comp = this.CID; return __call(id, o); };
// World metres -> comp px.
Scene.prototype.p = function (x, y, z) { return [960 + this.S * x, 540 - this.S * y, -this.S * z]; };
Scene.prototype.model = function (name, pos, layerName) {
  var l = this.comp.layers.__new(this.cmd("layer.newModel", { path: ROOT + "/assets/" + name + ".glb", name: layerName || name }));
  l.property("Geometry Options").property("Model Scale").setValue(this.S);
  l.threeDLayer = true;
  var p = pos || [0, 0, 0];
  l.property("Transform").property("Position").setValue(this.p(p[0], p[1], p[2]));
  return l;
};
Scene.prototype.nul = function (name, pos) {
  var n = this.comp.layers.addNull();
  n.name = name;
  n.threeDLayer = true;
  // Nulls default to a [50, 50] anchor; children are placed relative to it, so zero it.
  n.property("Transform").property("Anchor Point").setValue([0, 0, 0]);
  var p = pos || [0, 0, 0];
  n.property("Transform").property("Position").setValue(this.p(p[0], p[1], p[2]));
  return n;
};
// A child layer at the parent's origin.
function attach(child, parent) {
  child.parent = parent;
  child.property("Transform").property("Position").setValue([0, 0, 0]);
}
// three.js rotation (radians) -> EffectCraft degrees: Y and Z flip sign under the axis mapping.
function degY(rad) { return (-rad * 180) / Math.PI; }
function degZ(rad) { return (-rad * 180) / Math.PI; }

// EffectCraft 0.14: a parent null's Y Rotation did not reach its children (its Z Rotation does), and a layer's own
// rotations apply Y before Z. So each fin and leg carries its yaw in Orientation (applied last) and its fold in Z Rotation.
// Grid fins: k = 0 stowed, 1 deployed. Legs: k = 0 stowed, 1 deployed (RIG.leg and RIG.pusher come from model.ts).
// Local offset (px) of a point given in booster metres, for layers parented to the booster root.
Scene.prototype.local = function (x, y, z) { return [this.S * x, -this.S * y, -this.S * z]; };
Scene.prototype.hinge = function (name, pos, root) {
  var h = this.nul(name, [0, 0, 0]);
  if (root) h.parent = root;
  h.property("Transform").property("Position").setValue(root ? this.local(pos[0], pos[1], pos[2]) : this.p(pos[0], pos[1], pos[2]));
  return h;
};
// `only` (optional): indices to build, e.g. the back two in a cutaway so nothing blocks the cut.
// modelName (optional) swaps the model, e.g. "hl_grid_fin" for highlight copies that move with the fins.
Scene.prototype.fins = function (k, root, prefix, only, t0, t1, modelName) {
  var out = [];
  for (var i = 0; i < RIG.fins.length; i++) {
    if (only && only.indexOf(i) < 0) continue;
    var f = RIG.fins[i];
    var h = this.hinge((prefix || "") + "fin hinge " + (i + 1), f.pos, root);
    var fin = this.model(modelName || "grid_fin", [0, 0, 0], (prefix || "") + (modelName ? "HL " : "") + "grid fin " + (i + 1));
    attach(fin, h);
    fin.property("Transform").property("Orientation").setValue([0, degY(f.yaw), 0]);
    if (typeof k === "function") bakeFn(fin.property("Transform").property("Z Rotation"), t0 || 0, t1, function (t) { return degZ((Math.PI / 2) * (1 - k(t))); });
    else fin.property("Transform").property("Z Rotation").setValue(degZ((Math.PI / 2) * (1 - k)));
    out.push(fin);
  }
  return out;
};
// Same maths as pusherPose() in model.ts: tube j of the telescoping pusher, in the leg's plane.
function pusherPose(deg) {
  var P = RIG.pusher, th = (deg * Math.PI) / 180;
  var px = P.legS * Math.sin(th), py = P.legS * Math.cos(th);
  var dx = px - P.bodyX, dy = py - P.bodyY, dist = Math.sqrt(dx * dx + dy * dy);
  var phi = Math.atan2(dx, dy), step = Math.max(0, (dist - P.stageLen) / (P.stages - 1)), out = [];
  for (var j = 0; j < P.stages; j++) out.push({ x: P.bodyX + (dx / dist) * step * j, y: P.bodyY + (dy / dist) * step * j, phi: phi });
  return out;
}
// k: 0 stowed .. 1 deployed, or a function of time (seconds) to animate; t0..t1 is the baked range.
Scene.prototype.legs = function (k, root, prefix, only, t0, t1, modelName) {
  var out = [], L = RIG.leg, anim = typeof k === "function";
  var degAt = function (t) { return L.stowedDeg + (L.deployedDeg - L.stowedDeg) * (anim ? k(t) : k); };
  var bakeLeg = function (prop, fn) { bakeFn(prop, t0 || 0, t1, fn); };
  var deg = degAt(0);
  var pose = pusherPose(deg);
  for (var i = 0; i < RIG.legs.length; i++) {
    if (only && only.indexOf(i) < 0) continue;
    var g = RIG.legs[i], c = Math.cos(g.yaw), sn = Math.sin(g.yaw);
    var h = this.hinge((prefix || "") + "leg hinge " + (i + 1), g.pos, root);
    var leg = this.model(modelName || "leg", [0, 0, 0], (prefix || "") + (modelName ? "HL " : "") + "leg " + (i + 1));
    attach(leg, h);
    leg.property("Transform").property("Orientation").setValue([0, degY(g.yaw), 0]);
    if (anim) bakeLeg(leg.property("Transform").property("Z Rotation"), function (t) { return degZ((-degAt(t) * Math.PI) / 180); });
    else leg.property("Transform").property("Z Rotation").setValue(degZ((-deg * Math.PI) / 180));
    for (var j = 0; j < (modelName ? 0 : pose.length); j++) (function (j, sc) {
      var t = sc.model("leg_pusher_" + (j + 1), [0, 0, 0], (prefix || "") + "leg " + (i + 1) + " pusher " + (j + 1));
      t.parent = h;
      t.property("Transform").property("Orientation").setValue([0, degY(g.yaw), 0]);
      // Leg-plane point (x radial, y up) turned by the leg's yaw (three.js rotation.y), then to px.
      var posAt = function (q) { return sc.local(q.x * c, q.y, -q.x * sn); };
      if (anim) {
        bakeLeg(t.property("Transform").property("Position"), function (tt) { return posAt(pusherPose(degAt(tt))[j]); });
        bakeLeg(t.property("Transform").property("Z Rotation"), function (tt) { return degZ(-pusherPose(degAt(tt))[j].phi); });
      } else {
        t.property("Transform").property("Position").setValue(posAt(pose[j]));
        t.property("Transform").property("Z Rotation").setValue(degZ(-pose[j].phi));
      }
    })(j, this);
    out.push(leg);
  }
  return out;
};
// The booster: shell, tanks, engines, thrusters, plus propellant when o.fill is given (0..1, both tanks).
// Layers are kept in this.parts (lox, rp1 = draining columns; loxCrown, rp1Crown = full-tank tops).
Scene.prototype.booster = function (o) {
  o = o || {};
  var cut = o.cut ? "_cut" : "";
  var root = this.nul("booster root", o.at || [0, 0, 0]);
  var P = this.parts = { root: root };
  var names = ["booster_shell", "booster_tanks", "engines", "thrusters"];
  for (var i = 0; i < names.length; i++) { P[names[i]] = this.model(names[i] + (names[i] == "engines" || names[i] == "thrusters" ? "" : cut)); attach(P[names[i]], root); }
  if (o.fill !== undefined) {
    P.lox = this.model("lox" + cut); P.lox.parent = root; P.lox.property("Transform").property("Position").setValue(this.local(RIG.lox[0], RIG.lox[1], RIG.lox[2]));
    P.rp1 = this.model("rp1" + cut); P.rp1.parent = root; P.rp1.property("Transform").property("Position").setValue(this.local(RIG.rp1[0], RIG.rp1[1], RIG.rp1[2]));
    var extra = ["lox_base", "lox_crown", "rp1_base", "rp1_crown"];
    for (var j = 0; j < extra.length; j++) { P[extra[j]] = this.model(extra[j] + cut); attach(P[extra[j]], root); }
    this.setFill(o.fill, o.fill);
  }
  return root;
};
// Static propellant levels (use fillKeys for animation).
Scene.prototype.setFill = function (lox, rp1) {
  var P = this.parts;
  P.lox.property("Transform").property("Scale").setValue([100, Math.max(0.1, 100 * lox), 100]);
  P.rp1.property("Transform").property("Scale").setValue([100, Math.max(0.1, 100 * rp1), 100]);
  P.lox_crown.property("Transform").property("Opacity").setValue(lox >= 0.999 ? 100 : 0);
  P.rp1_crown.property("Transform").property("Opacity").setValue(rp1 >= 0.999 ? 100 : 0);
};
Scene.prototype.lights = function () {
  var key = this.comp.layers.__new(this.cmd("layer.newLight", { name: "Key light", kind: "Parallel", intensity: 115, castsShadows: true, shadowDarkness: 55, shadowDiffusion: 40 }));
  key.property("Transform").property("Position").setValue(this.p(-60, 120, 80));
  key.property("Transform").property("Point of Interest").setValue(this.p(0, 0, 0));
  var fill = this.comp.layers.__new(this.cmd("layer.newLight", { name: "Fill light", kind: "Parallel", intensity: 30, castsShadows: false }));
  fill.property("Transform").property("Position").setValue(this.p(80, 40, 50));
  fill.property("Transform").property("Point of Interest").setValue(this.p(0, 0, 0));
  this.comp.layers.__new(this.cmd("layer.newLight", { name: "Studio light", kind: "Environment", intensity: 75 }));
  this.comp.layers.__new(this.cmd("layer.newLight", { name: "Ambient", kind: "Ambient", intensity: 12 }));
};
// Two-node camera at `pos` looking at `target` (metres), vertical field of view `fov` degrees.
Scene.prototype.camera = function (pos, target, fov) {
  var zoom = 540 / Math.tan(((fov || 30) * Math.PI) / 360);
  var cam = this.comp.layers.__new(this.cmd("layer.newCamera", { name: "Camera", zoom: zoom }));
  cam.property("Transform").property("Position").setValue(this.p(pos[0], pos[1], pos[2]));
  cam.property("Transform").property("Point of Interest").setValue(this.p(target[0], target[1], target[2]));
  return cam;
};
Scene.prototype.floor = function (y) {
  var f = this.comp.layers.__new(this.cmd("layer.new3dPrimitive", { kind: "plane", name: "Floor shadows", width: 40000, height: 40000, position: this.p(0, y || 0, 0) }));
  f.property("Transform").property("X Rotation").setValue(90);
  this.cmd("material.set", { layers: [f.__id], acceptsShadows: "only", castsShadows: "off" });
};
// Studio background + environment image (bottom of the stack).
function studio(comp) {
  var bg = comp.layers.addSolid([0.93, 0.94, 0.95], "Background", W, H, 1);
  var ramp = bg.property("Effects").addProperty("Gradient Ramp");
  ramp.property("Start of Ramp").setValue([960, 480]);
  ramp.property("Start Color").setValue([0.984, 0.984, 0.988]);
  ramp.property("End of Ramp").setValue([960 + 1150, 480 + 380]);
  ramp.property("End Color").setValue([0.863, 0.875, 0.89]);
  ramp.property("Ramp Shape").setValue(2);
  var env = comp.layers.add(app.project.importFile(new ImportOptions(new File(ROOT + "/assets/studio_env.png"))));
  env.name = "Studio environment";
  __call("layer.environment", { comp: comp.layers.__comp, layers: [env.__id], on: true });
}
function newComp(name, dur) {
  var c = app.project.items.addComp(name, W, H, 1, dur || 1, FPS);
  c.renderer = "ADBE Advanced 3d";
  studio(c);
  return c;
}

// ---------- highlights ----------
// A highlight is a glowing copy of a part (assets/hl_*.glb), parented like the part and faded in on the spoken word.
Scene.prototype.hl = function (name, root, layerName) {
  var l = this.model("hl_" + name, [0, 0, 0], layerName || "HL " + name);
  if (root) attach(l, root);
  l.property("Transform").property("Opacity").setValue(0);
  this.cmd("material.set", { layers: [l.__id], castsShadows: "off", acceptsShadows: "off" });
  return l;
};
// Copies a layer's transform onto another (for highlights of fins and legs, whose parents can't pass rotation).
function copyPose(src, dst) {
  var T = ["Position", "Orientation", "X Rotation", "Y Rotation", "Z Rotation", "Scale"];
  dst.parent = src.parent;
  for (var i = 0; i < T.length; i++) dst.property("Transform").property(T[i]).setValue(src.property("Transform").property(T[i]).value);
}
// Smooth opacity pulse: fades in over `fade` s from tOn, holds to tOff, fades out. Several pulses can be added.
function smoothKeys(t0, t1, v0, v1, n) {
  var ts = [], vs = [];
  for (var i = 0; i <= n; i++) {
    var u = i / n, e = u * u * (3 - 2 * u);
    ts.push(t0 + (t1 - t0) * u); vs.push(v0 + (v1 - v0) * e);
  }
  return [ts, vs];
}
function pulse(layer, tOn, tOff, peak, fade) {
  peak = peak === undefined ? 100 : peak; fade = fade || 0.3;
  var op = layer.property("Transform").property("Opacity");
  var a = smoothKeys(Math.max(0, tOn - 0.04), tOn + fade, 0, peak, 6), b = smoothKeys(tOff, tOff + fade * 1.5, peak, 0, 6);
  op.setValuesAtTimes(a[0].concat(b[0]), a[1].concat(b[1]));
}
